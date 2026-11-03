require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const prisma = require('./config/database');
const getFirebaseAdmin = require('./config/firebase');
const { notifyUser } = require('./services/notificationService');

const usersRouter = require('./routes/users');
const servicesRouter = require('./routes/services');
const chatRouter = require('./routes/chat');
const notificationsRouter = require('./routes/notifications');
const portfolioRouter = require('./routes/portfolio');
const reviewsRouter = require('./routes/reviews');
const categoriesRouter = require('./routes/categories');
const uploadsRouter = require('./routes/uploads');
const interactionsRouter = require('./routes/interactions');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath).toLowerCase() === '.webm') {
      res.setHeader('Content-Type', 'audio/webm');
    }
  },
}));

// --- LOGGING TEMPORAL (desarrollo) ---
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    const ts = new Date().toISOString();
    console.log(`[${ts}] IN  ${req.method} ${req.originalUrl}`);
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      console.log(`[${ts}]   body: ${JSON.stringify(req.body)}`);
    }
    next();
  });

  app.use((req, res, next) => {
    const ts = new Date().toISOString();
    const originalSend = res.send;
    res.send = function (body) {
      console.log(`[${ts}] OUT ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
      return originalSend.call(this, body);
    };
    next();
  });
}

app.use('/api/users', usersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api', interactionsRouter);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
app.set('io', io);

// --- Socket.io Auth Middleware ---
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  const explicitUserId = socket.handshake.query?.userId || socket.handshake.auth?.userId;

  if (token) {
    try {
      const admin = getFirebaseAdmin();
      const decoded = await admin.auth().verifyIdToken(token);
      socket.userId = decoded.uid;
      console.log(`[Socket.io] Authenticated user: ${decoded.uid}`);
      return next();
    } catch (error) {
      console.error('[Socket.io] Token verification failed:', error.message);
      if (process.env.NODE_ENV !== 'production') {
        socket.userId = explicitUserId || null;
        return next();
      }
      return next(new Error('Authentication error'));
    }
  }

  // Development fallback: allow connection with explicit userId
  if (process.env.NODE_ENV !== 'production') {
    socket.userId = explicitUserId || null;
    console.log(`[Socket.io] Dev connection (no token) userId=${socket.userId}`);
    return next();
  }

  return next(new Error('Authentication error'));
});

// --- Socket.io Event Handlers ---
io.on('connection', (socket) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [Socket.io] User connected: ${socket.id} (userId=${socket.userId})`);

  socket.on('join', async (data) => {
    const { conversationId } = data;
    if (!conversationId) return;
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { userOneId: true, userTwoId: true },
      });
      if (
        !conversation ||
        (conversation.userOneId !== socket.userId &&
          conversation.userTwoId !== socket.userId)
      ) {
        socket.emit('error', { message: 'No tienes permiso para ver esta conversación' });
        return;
      }
      socket.join(conversationId);
      console.log(`[${ts}] [Socket.io] Socket ${socket.id} joined room ${conversationId}`);
    } catch (error) {
      console.error('[Socket.io] Could not join conversation:', error);
      socket.emit('error', { message: 'No se pudo abrir la conversación' });
    }
  });

  socket.on('leave', (data) => {
    const { conversationId } = data;
    if (conversationId) {
      socket.leave(conversationId);
    }
  });

  socket.on('typing', (data) => {
    const { conversationId } = data;
    if (conversationId) {
      socket.to(conversationId).emit('typing', { conversationId, socketId: socket.id });
    }
  });

  socket.on('message', async (data) => {
    const { conversationId, text, type = 'text', latitude, longitude, address, audioDurationSeconds, audioUrl } = data;
    const userId = socket.userId;

    if (!conversationId || !text) return;

    try {
      const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conv || (conv.userOneId !== userId && conv.userTwoId !== userId)) {
        socket.emit('error', { message: 'No tienes permiso para enviar mensajes' });
        return;
      }

      const message = await prisma.chatMessage.create({
        data: {
          id: uuidv4(),
          conversationId,
          senderId: userId,
          text: text.trim(),
          type: type || 'text',
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          address: address ?? null,
          audioDurationSeconds: audioDurationSeconds ?? null,
          audioUrl: audioUrl ?? null,
        },
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      io.to(conversationId).emit('message', {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        text: message.text,
        type: message.type,
        latitude: message.latitude,
        longitude: message.longitude,
        address: message.address,
        audioDurationSeconds: message.audioDurationSeconds,
        audioUrl: message.audioUrl,
        createdAt: message.createdAt,
      });

      const recipientId = conv.userOneId === userId ? conv.userTwoId : conv.userOneId;
      const sender = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      const notificationBody = {
        audio: 'Te envió una nota de voz',
        location: 'Te compartió su ubicación',
        image: 'Te envió una foto',
      }[type] || text.trim();
      await notifyUser({
        userId: recipientId,
        title: `Mensaje de ${sender?.name || 'un usuario'}`,
        body: notificationBody,
        data: { type: 'chat_message', conversationId },
      });

      console.log(`[${ts}] [Socket.io] Message in ${conversationId} from ${userId}`);
    } catch (error) {
      console.error('Socket.io message error:', error);
      socket.emit('error', { message: 'Error al enviar mensaje' });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`[${ts}] [Socket.io] User disconnected: ${socket.id} (${reason})`);
  });
});

const listener = server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = { app, server, io, prisma };
