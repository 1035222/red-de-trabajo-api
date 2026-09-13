const express = require('express');
const authMiddleware = require('../middlewares/auth');
const controller = require('../controllers/interactionController');

const router = express.Router();
router.use(authMiddleware);
router.get('/favorites', controller.getFavorites);
router.get('/favorites/:serviceId', controller.getFavoriteStatus);
router.post('/favorites/:serviceId/toggle', controller.toggleFavorite);
router.post('/services/:serviceId/requests', controller.createRequest);
router.get('/requests', controller.getServiceRequests);

module.exports = router;
