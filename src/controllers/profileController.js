const prisma = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        location: true,
        rating: true,
        servicesCount: true,
        verified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, bio, location, avatarUrl } = req.body;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG updateProfile] userId=${userId} body=${JSON.stringify({ name, bio, location, avatarUrl })}`);
    }

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        name: name || undefined,
        bio: bio || undefined,
        location: location || undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
      },
      create: {
        id: userId,
        email: req.user.email || `${userId}@unknown.local`,
        name: name || req.user.name || 'Usuario',
        bio: bio || null,
        location: location || null,
        avatarUrl: avatarUrl || req.user.picture || '',
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        location: true,
        rating: true,
        servicesCount: true,
        verified: true,
        createdAt: true,
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG updateProfile] success userId=${user.id} name=${user.name}`);
    }

    res.json(user);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG updateProfile] error code=${error.code} message=${error.message}`);
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuario no encontrado en la base de datos' });
    }
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message, code: error.code });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
