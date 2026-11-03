const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/database');
const { notifyUser } = require('../services/notificationService');

async function toggleFavorite(req, res) {
  const userId = req.user.uid;
  const { serviceId } = req.params;
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });

  const existing = await prisma.favorite.findUnique({
    where: { userId_serviceId: { userId, serviceId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return res.json({ favorite: false });
  }

  await prisma.favorite.create({ data: { id: uuidv4(), userId, serviceId } });
  return res.json({ favorite: true });
}

async function getFavoriteStatus(req, res) {
  const favorite = await prisma.favorite.findUnique({
    where: { userId_serviceId: { userId: req.user.uid, serviceId: req.params.serviceId } },
  });
  res.json({ favorite: Boolean(favorite) });
}

async function getFavorites(req, res) {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.uid },
    include: { service: { include: { provider: { select: { id: true, name: true, avatarUrl: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(favorites);
}

async function createRequest(req, res) {
  const requesterId = req.user.uid;
  const { serviceId } = req.params;
  const { message } = req.body;
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });
  if (service.providerId === requesterId) return res.status(400).json({ message: 'No puedes solicitar tu propio servicio' });

  const existing = await prisma.serviceRequest.findFirst({
    where: { serviceId, requesterId, status: 'pending' },
  });
  if (existing) return res.json(existing);

  const request = await prisma.serviceRequest.create({
    data: {
      id: uuidv4(),
      serviceId,
      requesterId,
      providerId: service.providerId,
      message: message || null,
    },
  });
  await notifyUser({
    userId: service.providerId,
    title: 'Nueva solicitud de servicio',
    body: `Tienes una nueva solicitud para ${service.title}`,
    data: { type: 'service_request', serviceId, requestId: request.id },
  });
  res.status(201).json(request);
}

async function getServiceRequests(req, res) {
  const userId = req.user.uid;
  const requests = await prisma.serviceRequest.findMany({
    where: { OR: [{ requesterId: userId }, { providerId: userId }] },
    include: { service: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(requests);
}

module.exports = { toggleFavorite, getFavoriteStatus, getFavorites, createRequest, getServiceRequests };
