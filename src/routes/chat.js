const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/conversations', authMiddleware, chatController.getConversations);
router.get('/conversations/:conversationId/messages', authMiddleware, chatController.getMessages);
router.post('/conversations', authMiddleware, chatController.createOrFindConversation);
router.post('/conversations/:conversationId/messages', authMiddleware, chatController.sendMessage);

module.exports = router;
