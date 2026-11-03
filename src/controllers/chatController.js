const prisma = require('../config/database');

const getConversations = async (req, res) => {
  try {
    const userId = req.user.uid;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { userOneId: userId },
          { userTwoId: userId },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const result = conversations.map((conv) => {
      const otherUserId = conv.userOneId === userId ? conv.userTwoId : conv.userOneId;
      const lastMsg = conv.messages[0];
      return {
        id: conv.id,
        participantId: otherUserId,
        lastMessage: lastMsg
          ? lastMsg.type === 'image'
            ? '📷 Foto'
            : lastMsg.type === 'audio'
              ? '🎵 Nota de voz'
              : lastMsg.text
          : '',
        lastMessageTime: lastMsg ? lastMsg.createdAt : conv.updatedAt,
        unreadCount: 0,
      };
    });

    // Fetch participant details
    const participantIds = result.map((c) => c.participantId);
    const participants = await prisma.user.findMany({
      where: { id: { in: participantIds } },
      select: { id: true, name: true, avatarUrl: true },
    });

    const participantMap = participants.reduce((map, p) => {
      map[p.id] = p;
      return map;
    }, {});

    const enriched = result.map((c) => ({
      id: c.id,
      name: participantMap[c.participantId]?.name ?? 'Usuario',
      avatarUrl: participantMap[c.participantId]?.avatarUrl ?? '',
      lastMessage: c.lastMessage,
      time: _formatTimeAgo(new Date(c.lastMessageTime)),
      unread: c.unreadCount > 0,
    }));

    res.json(enriched);
  } catch (error) {
    console.error('Error en getConversations:', error);
    res.status(500).json({ message: 'Error al obtener conversaciones', error: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { conversationId } = req.params;

    // Verify user is part of the conversation
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv || (conv.userOneId !== userId && conv.userTwoId !== userId)) {
      return res.status(403).json({ message: 'No tienes permiso para ver esta conversación' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error en getMessages:', error);
    res.status(500).json({ message: 'Error al obtener mensajes', error: error.message });
  }
};

const createOrFindConversation = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'participantId es requerido' });
    }

    if (participantId === userId) {
      return res.status(400).json({ message: 'No puedes crear una conversación contigo mismo' });
    }

    // Check if the other user exists
    const otherUser = await prisma.user.findUnique({ where: { id: participantId } });
    if (!otherUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Find existing conversation
    const existing = await prisma.conversation.findFirst({
      where: {
        OR: [
          { userOneId: userId, userTwoId: participantId },
          { userOneId: participantId, userTwoId: userId },
        ],
      },
    });

    if (existing) {
      return res.json(existing);
    }

    // Create new conversation
    const { v4: uuidv4 } = require('uuid');
    const conv = await prisma.conversation.create({
      data: {
        id: uuidv4(),
        userOneId: userId,
        userTwoId: participantId,
      },
    });

    res.status(201).json(conv);
  } catch (error) {
    console.error('Error en createOrFindConversation:', error);
    res.status(500).json({ message: 'Error al crear conversación', error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { conversationId } = req.params;
    const { text, type = 'text', latitude, longitude, address, audioDurationSeconds, audioUrl } = req.body;

    if (!text || text.trim().isEmpty) {
      return res.status(400).json({ message: 'El mensaje no puede estar vacío' });
    }

    // Verify user is part of the conversation
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv || (conv.userOneId !== userId && conv.userTwoId !== userId)) {
      return res.status(403).json({ message: 'No tienes permiso para enviar mensajes a esta conversación' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        id: require('uuid').v4(),
        conversationId,
        senderId: userId,
        text: text.trim(),
        type,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        address: address ?? null,
        audioDurationSeconds: audioDurationSeconds ?? null,
        audioUrl: audioUrl ?? null,
      },
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error en sendMessage:', error);
    res.status(500).json({ message: 'Error al enviar mensaje', error: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { conversationId, messageId } = req.params;
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        userOneId: true,
        userTwoId: true,
        lastMessageId: true,
        createdAt: true,
      },
    });

    if (
      !conversation ||
      (conversation.userOneId !== userId && conversation.userTwoId !== userId)
    ) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar mensajes de esta conversación' });
    }

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { id: true, conversationId: true, senderId: true },
    });
    if (!message || message.conversationId !== conversationId) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }
    if (message.senderId !== userId) {
      return res.status(403).json({ message: 'Solo puedes eliminar tus propios mensajes' });
    }

    await prisma.$transaction(async (transaction) => {
      const latestMessage = await transaction.chatMessage.findFirst({
        where: {
          conversationId,
          id: { not: messageId },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: { id: true, createdAt: true },
      });

      await transaction.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageId: latestMessage?.id ?? null,
          updatedAt: latestMessage?.createdAt ?? conversation.createdAt,
        },
      });
      await transaction.chatMessage.delete({ where: { id: messageId } });
    });

    req.app.get('io').to(conversationId).emit('message_deleted', {
      conversationId,
      messageId,
    });
    res.json({ deleted: true });
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    res.status(500).json({ message: 'Error al eliminar mensaje', error: error.message });
  }
};

function _formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} h`;
  if (diffDays < 7) return `Hace ${diffDays} d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

module.exports = {
  getConversations,
  getMessages,
  createOrFindConversation,
  sendMessage,
  deleteMessage,
};
