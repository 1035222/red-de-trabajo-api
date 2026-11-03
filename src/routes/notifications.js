const express = require('express');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.post('/tokens', notificationController.registerToken);
router.patch('/tokens', notificationController.deleteToken);
router.patch('/:notificationId', notificationController.markAsRead);

module.exports = router;
