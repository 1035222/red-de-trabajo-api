const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/database');

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.uid },
      orderBy: { time: 'desc' },
      take: 100,
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.uid, read: false },
    });
    res.json({ count });
  } catch (error) {
    console.error('Error al contar notificaciones no leídas:', error);
    res.status(500).json({ message: 'Error al contar notificaciones no leídas' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        id: req.params.notificationId,
        userId: req.user.uid,
      },
      data: { read: true },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    res.json({ read: true });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({ message: 'Error al actualizar notificación' });
  }
};

const registerToken = async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (typeof token !== 'string' || token.trim().length === 0 || token.length > 512) {
      return res.status(400).json({ message: 'Token de notificación inválido' });
    }
    if (!['android', 'ios', 'macos', 'web'].includes(platform)) {
      return res.status(400).json({ message: 'Plataforma no válida' });
    }

    const registration = await prisma.fcmToken.upsert({
      where: { token: token.trim() },
      update: { userId: req.user.uid, platform },
      create: {
        id: uuidv4(),
        userId: req.user.uid,
        token: token.trim(),
        platform,
      },
    });
    res.status(200).json({ registered: true, id: registration.id });
  } catch (error) {
    console.error('Error al registrar token FCM:', error);
    res.status(500).json({ message: 'Error al activar notificaciones' });
  }
};

const deleteToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({ message: 'Token de notificación inválido' });
    }

    await prisma.fcmToken.deleteMany({
      where: { userId: req.user.uid, token: token.trim() },
    });
    res.json({ registered: false });
  } catch (error) {
    console.error('Error al desactivar token FCM:', error);
    res.status(500).json({ message: 'Error al desactivar notificaciones' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  registerToken,
  deleteToken,
};
