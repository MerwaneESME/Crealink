const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateUser } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateUser);

// Routes pour les conversations
router.post('/conversations', messageController.createConversation);
router.get('/conversations', messageController.getConversations);
router.get('/conversations/:id', messageController.getConversationById);
router.patch('/conversations/:id/read', messageController.markConversationAsRead);
router.patch('/conversations/:id/archive', messageController.archiveConversation);

// Routes pour les messages
router.post('/conversations/:id/messages', messageController.sendMessage);
router.get('/conversations/:id/messages', messageController.getMessages);
router.get('/unread', messageController.getUnreadMessages);

module.exports = router; 