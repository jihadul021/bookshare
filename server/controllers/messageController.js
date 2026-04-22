const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const CryptoJS = require('crypto-js');

//   Encryption helpers
const ENCRYPTION_SECRET = process.env.CHAT_ENCRYPTION_SECRET || 'bookshare-secret-key';

const encryptText = (text) => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_SECRET).toString();
};

const decryptText = (encryptedText) => {
  if (!encryptedText) return encryptedText;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || encryptedText; // fallback for old unencrypted messages
  } catch {
    return encryptedText;
  }
};

const decryptMessage = (msg) => {
  const msgObj = msg.toObject ? msg.toObject() : msg;
  return {
    ...msgObj,
    text: decryptText(msgObj.text)
  };
};

const userIsParticipant = (conversation, userId) =>
  conversation.participants.some((participantId) => participantId.equals(userId));

const userDeletedConversation = (conversation, userId) =>
  conversation.deletedBy?.some((participantId) => participantId.equals(userId));

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true,
      deletedBy: { $ne: userId }
    })
      .populate('participants', 'name email profilePicture')
      .populate('lastMessage')
      .populate('lastMessageSender', 'name')
      .sort({ lastMessageAt: -1 });

    //   Decrypt lastMessageText before sending to frontend
    const decryptedConversations = conversations.map((conv) => {
      const convObj = conv.toObject();
      if (convObj.lastMessageText && convObj.lastMessageText !== '[Image]') {
        convObj.lastMessageText = decryptText(convObj.lastMessageText);
      }
      return convObj;
    });

    res.status(200).json({
      success: true,
      conversations: decryptedConversations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get conversation with specific user
exports.getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { participantId, bookId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
      isActive: true
    })
      .populate('participants', 'name email profilePicture')
      .populate('lastMessage')
      .populate('lastMessageSender', 'name');

    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, participantId],
        book: bookId || null
      });
      await conversation.save();
      await conversation.populate('participants', 'name email profilePicture');
    } else if (userDeletedConversation(conversation, userId)) {
      conversation.deletedBy = conversation.deletedBy.filter(
        (participantId) => !participantId.equals(userId)
      );
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!userIsParticipant(conversation, userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name profilePicture')
      .populate('receiver', 'name profilePicture')
      .sort({ createdAt: 1 });

    //   Decrypt messages and handle deleted ones
    const filteredMessages = messages.map(msg => {
      if (msg.deletedBy.some((deletedUserId) => deletedUserId.equals(userId))) {
        return {
          ...msg.toObject(),
          text: '[Message deleted]',
          isDeleted: true
        };
      }
      return decryptMessage(msg);
    });

    res.status(200).json({
      success: true,
      messages: filteredMessages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, text, image } = req.body;
    const senderId = req.user._id;

    let processedImage = null;
    if (req.file) {
      processedImage = `/uploads/${req.file.filename}`;
    } else if (image) {
      processedImage = image;
    }

    if ((!text || !text.trim()) && !processedImage) {
      return res.status(400).json({ message: 'Message text or image is required' });
    }

    if (!conversationId || !receiverId) {
      return res.status(400).json({ message: 'Conversation ID and receiver ID are required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!userIsParticipant(conversation, senderId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (conversation.deletedBy?.length) {
      conversation.deletedBy = [];
    }

    const trimmedText = text ? text.trim() : '';

    // Encrypt message text before saving to database
    const encryptedText = trimmedText ? encryptText(trimmedText) : '';

    const message = new Message({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      text: encryptedText, //   saved as encrypted in DB
      image: processedImage,
      isRead: false
    });

    await message.save();
    await message.populate('sender', 'name profilePicture');
    await message.populate('receiver', 'name profilePicture');

    // Encrypt lastMessageText preview before saving to DB
    conversation.lastMessage = message._id;
    conversation.lastMessageText = trimmedText ? encryptText(trimmedText) : '[Image]';
    conversation.lastMessageAt = new Date();
    conversation.lastMessageSender = senderId;

    if (!conversation.unreadCount.has(receiverId.toString())) {
      conversation.unreadCount.set(receiverId.toString(), 0);
    }
    conversation.unreadCount.set(
      receiverId.toString(),
      conversation.unreadCount.get(receiverId.toString()) + 1
    );

    await conversation.save();

    //   Decrypt before sending back to frontend so UI shows plain text
    const responseMessage = decryptMessage(message);

    res.status(201).json({
      success: true,
      message: responseMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true, readAt: new Date() },
      { new: true }
    ).populate('sender', 'name profilePicture');

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all messages in conversation as read
exports.markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!userIsParticipant(conversation, userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Message.updateMany(
      { conversation: conversationId, receiver: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    conversation.unreadCount.set(userId.toString(), 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.sender.equals(userId) && !message.receiver.equals(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!message.deletedBy.some((deletedUserId) => deletedUserId.equals(userId))) {
      message.deletedBy.push(userId);
      await message.save();
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!userIsParticipant(conversation, userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!userDeletedConversation(conversation, userId)) {
      conversation.deletedBy.push(userId);
      conversation.unreadCount.set(userId.toString(), 0);
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      message: 'Conversation deleted'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread count for user
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadMessages = await Message.countDocuments({
      receiver: userId,
      isRead: false,
      deletedBy: { $ne: userId }
    });

    res.status(200).json({
      success: true,
      unreadCount: unreadMessages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search conversations
exports.searchConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('_id name email profilePicture');

    const conversations = await Conversation.find({
      participants: userId,
      deletedBy: { $ne: userId },
      $or: users.map(u => ({ participants: u._id }))
    })
      .populate('participants', 'name email profilePicture')
      .populate('lastMessage')
      .populate('lastMessageSender', 'name')
      .sort({ lastMessageAt: -1 });

    //   Decrypt lastMessageText before sending to frontend
    const decryptedConversations = conversations.map((conv) => {
      const convObj = conv.toObject();
      if (convObj.lastMessageText && convObj.lastMessageText !== '[Image]') {
        convObj.lastMessageText = decryptText(convObj.lastMessageText);
      }
      return convObj;
    });

    res.status(200).json({
      success: true,
      conversations: decryptedConversations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chat summary for navbar
exports.getChatSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalUnread = await Message.countDocuments({
      receiver: userId,
      isRead: false,
      deletedBy: { $ne: userId }
    });

    const conversationsWithUnread = await Conversation.find({
      participants: userId,
      isActive: true,
      deletedBy: { $ne: userId }
    })
      .populate('participants', 'name profilePicture')
      .populate('lastMessageSender', 'name')
      .sort({ lastMessageAt: -1 });

    const summary = await Promise.all(
      conversationsWithUnread.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          receiver: userId,
          isRead: false,
          deletedBy: { $ne: userId }
        });

        const otherParticipant = conv.participants.find(p => !p._id.equals(userId));

        //   Decrypt lastMessageText preview before sending to frontend
        let lastMessagePreview = conv.lastMessageText;
        if (lastMessagePreview && lastMessagePreview !== '[Image]') {
          lastMessagePreview = decryptText(lastMessagePreview);
        }

        return {
          _id: conv._id,
          participant: otherParticipant,
          unreadCount,
          lastMessage: lastMessagePreview,
          lastMessageAt: conv.lastMessageAt
        };
      })
    );

    res.status(200).json({
      success: true,
      totalUnread,
      summary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};