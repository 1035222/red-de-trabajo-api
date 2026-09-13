const express = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/', categoryController.getCategories);
router.post('/', authMiddleware, categoryController.createCategory);

module.exports = router;