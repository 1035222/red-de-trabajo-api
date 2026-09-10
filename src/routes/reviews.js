const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/:userId', reviewController.getReviewsByUser);
router.post('/', authMiddleware, reviewController.createReview);

module.exports = router;
