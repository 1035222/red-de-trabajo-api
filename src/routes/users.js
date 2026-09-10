const express = require('express');
const profileController = require('../controllers/profileController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.post('/sync', authMiddleware, userController.syncUser);
router.get('/:id', profileController.getProfile);
router.put('/me', authMiddleware, profileController.updateProfile);

module.exports = router;
