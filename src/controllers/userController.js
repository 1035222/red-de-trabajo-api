const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/database');

const syncUser = async (req, res) => {
  try {
    const { uid, email, name, avatarUrl } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ message: 'uid y email son requeridos' });
    }

    const user = await prisma.user.upsert({
      where: { id: uid },
      update: {
        email,
        name: name || undefined,
        avatarUrl: avatarUrl || undefined,
      },
      create: {
        id: uid,
        email,
        name: name || email.split('@')[0],
        avatarUrl: avatarUrl || '',
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al sincronizar usuario', error: error.message });
  }
};

module.exports = { syncUser };
