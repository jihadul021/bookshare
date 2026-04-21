const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

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

    res.status(200).json({
      success: true,
      conversations
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

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
      isActive: true
    })
      .populate('participants', 'name email profilePicture')
      .populate('lastMessage')
      .populate('lastMessageSender', 'name');

    if (!conversation) {
      // Create new conversation
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

    // Check if user is participant
    if (!userIsParticipant(conversation, userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name profilePicture')
      .populate('receiver', 'name profilePicture')
      .sort({ createdAt: 1 });

    // Filter deleted messages (hide for users who deleted them)
    const filteredMessages = messages.map(msg => {
      if (msg.deletedBy.some((deletedUserId) => deletedUserId.equals(userId))) {
        return {
          ...msg.toObject(),
          text: '[Message deleted]',
          isDeleted: true
        };
      }
      return msg;
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

    // If file is uploaded via multer
    let processedImage = null;
    if (req.file) {
      processedImage = `/uploads/${req.file.filename}`;
    } else if (image) {
      // Support base64 images for backward compatibility
      processedImage = image;
    }

    // Either text or image is required
    if ((!text || !text.trim()) && !processedImage) {
      return res.status(400).json({ message: 'Message text or image is required' });
    }

    if (!conversationId || !receiverId) {
      return res.status(400).json({ message: 'Conversation ID and receiver ID are required' });
    }

    // Verify conversation exists and user is participant
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

    // Create message
    const message = new Message({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      text: text ? text.trim() : '',
      image: processedImage,
      isRead: false
    });

    await message.save();
    await message.populate('sender', 'name profilePicture');
    await message.populate('receiver', 'name profilePicture');

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageText = text ? text.trim() : '[Image]';
    conversation.lastMessageAt = new Date();
    conversation.lastMessageSender = senderId;

    // Initialize unreadCount if not exists
    if (!conversation.unreadCount.has(receiverId.toString())) {
      conversation.unreadCount.set(receiverId.toString(), 0);
    }
    // Increment unread count for receiver
    conversation.unreadCount.set(receiverId.toString(), conversation.unreadCount.get(receiverId.toString()) + 1);

    await conversation.save();

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        isRead: true,
        readAt: new Date()
      },
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

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Reset unread count for this user
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

    // Check if user is sender or receiver
    if (!message.sender.equals(userId) && !message.receiver.equals(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Add user to deletedBy array
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

    // Find users matching the search
    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('_id name email profilePicture');

    // Find conversations with these users
    const conversations = await Conversation.find({
      participants: userId,
      deletedBy: { $ne: userId },
      $or: users.map(u => ({ participants: u._id }))
    })
      .populate('participants', 'name email profilePicture')
      .populate('lastMessage')
      .populate('lastMessageSender', 'name')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chat summary for navbar (unread messages count by user)
exports.getChatSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total unread count
    const totalUnread = await Message.countDocuments({
      receiver: userId,
      isRead: false,
      deletedBy: { $ne: userId }
    });

    // Get conversations with unread messages
    const conversationsWithUnread = await Conversation.find({
      participants: userId,
      isActive: true,
      deletedBy: { $ne: userId }
    })
      .populate('participants', 'name profilePicture')
      .populate('lastMessageSender', 'name')
      .sort({ lastMessageAt: -1 });

    // Calculate unread per conversation
    const summary = await Promise.all(
      conversationsWithUnread.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          receiver: userId,
          isRead: false,
          deletedBy: { $ne: userId }
        });

        const otherParticipant = conv.participants.find(p => !p._id.equals(userId));

        return {
          _id: conv._id,
          participant: otherParticipant,
          unreadCount,
          lastMessage: conv.lastMessageText,
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
