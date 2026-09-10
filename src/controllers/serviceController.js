const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/database');

const getServices = async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = {};

    if (category && category !== 'Todos') {
      where.categoryName = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { categoryName: { contains: search } },
      ];
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener servicios', error: error.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            rating: true,
            bio: true,
            location: true,
          },
        },
      },
    });

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener servicio', error: error.message });
  }
};

const createService = async (req, res) => {
  try {
    const { title, price, description, category, imageUrl, providerId } = req.body;
    const userId = req.user.uid;

    if (!title || !price || !description || !category) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    // Resolver categoryId a partir del nombre de categoría
    const categoryRecord = await prisma.category.findUnique({
      where: { name: category },
    });
    if (!categoryRecord) {
      return res.status(404).json({ message: `Categoría "${category}" no encontrada` });
    }

    const service = await prisma.service.create({
      data: {
        id: uuidv4(),
        title,
        price,
        description,
        categoryName: category,
        categoryId: categoryRecord.id,
        imageUrl: imageUrl || '',
        providerId: userId,
      },
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear servicio', error: error.message, code: error.code });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    if (existing.providerId !== userId) {
      return res.status(403).json({ message: 'No tienes permiso para editar este servicio' });
    }

    const { title, price, description, category, imageUrl, featured } = req.body;
    const updated = await prisma.service.update({
      where: { id },
      data: {
        title: title || existing.title,
        price: price || existing.price,
        description: description || existing.description,
        categoryName: category || existing.categoryName,
        imageUrl: imageUrl || existing.imageUrl,
        featured: featured ?? existing.featured,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar servicio', error: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    if (existing.providerId !== userId) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este servicio' });
    }

    await prisma.service.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar servicio', error: error.message });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
