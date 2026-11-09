const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/database');
const { notifyUser } = require('../services/notificationService');

const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.uid;
    const reviews = await prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reseñas', error: error.message });
  }
};

const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { service: { providerId: userId } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reseñas', error: error.message });
  }
};

const getReviewsByService = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { serviceId: req.params.serviceId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reseñas', error: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { serviceId, userName, userAvatar, rating, comment } = req.body;

    if (!serviceId || rating == null || !comment?.trim() || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { providerId: true },
    });
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    const review = await prisma.review.create({
      data: {
        id: uuidv4(),
        serviceId,
        userId,
        userName: userName || req.user.name || req.user.email,
        userAvatar: userAvatar || '',
        rating,
        comment,
      },
    });

    const aggregate = await prisma.review.aggregate({
      where: { serviceId },
      _avg: { rating: true },
      _count: { id: true },
    });
    await prisma.service.update({
      where: { id: serviceId },
      data: { rating: aggregate._avg.rating ?? 0, reviewsCount: aggregate._count.id },
    });

    if (service.providerId !== userId) {
      await notifyUser({
        userId: service.providerId,
        title: 'Nueva reseña',
        body: `${userName || req.user.name || 'Un usuario'} dejó una reseña en tu servicio`,
        data: { type: 'review', serviceId },
      });
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear reseña', error: error.message, code: error.code });
  }
};

module.exports = {
  getMyReviews,
  getReviewsByUser,
  getReviewsByService,
  createReview,
};
