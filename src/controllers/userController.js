const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/database');

const syncUser = async (req, res) => {
  try {
    const { uid: requestedUid, name, avatarUrl } = req.body;
    const uid = req.user.uid;
    const email = req.user.email;

    if (requestedUid && requestedUid !== uid) {
      return res.status(403).json({ message: 'El UID no coincide con el usuario autenticado' });
    }

    if (!uid || !email) {
      return res.status(400).json({ message: 'El token de Firebase debe incluir uid y email' });
    }

    const user = await prisma.user.upsert({
      where: { id: uid },
      update: {
        email,
        name: name || req.user.name || undefined,
        avatarUrl: avatarUrl || undefined,
      },
      create: {
        id: uid,
        email,
        name: name || req.user.name || email.split('@')[0],
        avatarUrl: avatarUrl || '',
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al sincronizar usuario', error: error.message });
  }
};

module.exports = { syncUser };
