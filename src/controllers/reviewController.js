const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/database');

const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { userId },
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

    if (!serviceId || !rating || !comment) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
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

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear reseña', error: error.message, code: error.code });
  }
};

module.exports = {
  getReviewsByUser,
  createReview,
};
