const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  markConversationAsRead,
  deleteMessage,
  deleteConversation,
  getUnreadCount,
  searchConversations,
  getChatSummary
} = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadSingleImage } = require('../middleware/uploadMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/summary', getChatSummary);
router.get('/search', searchConversations);

// Message routes
router.get('/unread-count', getUnreadCount);
router.get('/:conversationId', getMessages);
router.post('/send', uploadSingleImage, sendMessage);
router.put('/:messageId/read', markAsRead);
router.put('/conversations/:conversationId/read', markConversationAsRead);
router.delete('/conversations/:conversationId', deleteConversation);
router.delete('/:messageId', deleteMessage);

module.exports = router;
