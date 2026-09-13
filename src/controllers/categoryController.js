const prisma = require('../config/database');

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    const category = await prisma.category.create({
      data: { name, icon, color },
    });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'La categoría ya existe' });
    }
    res.status(500).json({ message: 'Error al crear categoría', error: error.message });
  }
};

module.exports = { getCategories, createCategory };