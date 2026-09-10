const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/database');

const getPortfolioByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await prisma.portfolioItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener portafolio', error: error.message });
  }
};

const createPortfolioItem = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { imageUrl, title, serviceId } = req.body;

    if (!imageUrl || !title) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const item = await prisma.portfolioItem.create({
      data: {
        id: uuidv4(),
        userId,
        imageUrl,
        title,
        ...(serviceId != null ? { serviceId } : {}),
      },
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear item de portafolio', error: error.message, code: error.code });
  }
};

module.exports = {
  getPortfolioByUser,
  createPortfolioItem,
};
