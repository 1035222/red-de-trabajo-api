require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./config/database');

const usersRouter = require('./routes/users');
const servicesRouter = require('./routes/services');
const chatRouter = require('./routes/chat');
const notificationsRouter = require('./routes/notifications');
const portfolioRouter = require('./routes/portfolio');
const reviewsRouter = require('./routes/reviews');

const app = express();

app.use(cors());
app.use(express.json());

// --- LOGGING TEMPORAL (desarrollo) ---
// Imprime método, ruta, headers y body de cada request entrante.
// Se desactiva automáticamente en producción (NODE_ENV=production).
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    const ts = new Date().toISOString();
    console.log(`[${ts}] IN  ${req.method} ${req.originalUrl}`);
    console.log(`[${ts}]   headers: ${JSON.stringify(req.headers)}`);
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      console.log(`[${ts}]   body: ${JSON.stringify(req.body)}`);
    }
    next();
  });

  // Loguea también la respuesta (status)
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = { app, prisma };
