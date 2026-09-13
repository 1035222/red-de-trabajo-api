const express = require('express');
const portfolioController = require('../controllers/portfolioController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/', authMiddleware, portfolioController.getMyPortfolio);
router.get('/:userId', portfolioController.getPortfolioByUser);
router.post('/', authMiddleware, portfolioController.createPortfolioItem);

module.exports = router;
