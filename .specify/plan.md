PLAN.md — red-de-trabajo-api (Backend)

Traduce spec.md a decisiones técnicas. Actualizar antes de implementar cada funcionalidad pendiente listada en spec.md.

Arquitectura actual (ya construida)
Node.js + Express, estructura por capas: routes → controllers → (Prisma) → MySQL.
Firebase Admin SDK como middleware de autenticación (src/middlewares/auth.js).
Prisma como ORM único; MySQL como base de datos.
Logging temporal condicionado por NODE_ENV.
Plan para Chat en tiempo real (Socket.io) — PENDIENTE DE DISEÑO
Decisión a tomar: ¿Socket.io corre integrado en el mismo servidor Express (mismo puerto 3000) usando http.createServer + socket.io, o como servicio separado? Recomendación por simplicidad de MVP: integrado en el mismo servidor.
Modelo de datos necesario: Conversation (participantes) y Message (conversationId, senderId, contenido, timestamp, leído/no leído) — agregar a schema.prisma.
Eventos mínimos: join_conversation, send_message, message_received, typing (opcional para MVP).
Persistir cada mensaje en MySQL vía Prisma antes de emitir el evento en tiempo real, para no perder mensajes si el receptor está offline.
Plan para Notificaciones push (FCM) — PENDIENTE DE DISEÑO
El backend usa Firebase Admin (ya integrado para auth) para también enviar mensajes a FCM cuando: llega un mensaje de chat nuevo, se recibe una reseña nueva.
Se necesita almacenar el fcmToken del dispositivo por usuario (agregar campo a modelo User en Prisma) — el frontend debe enviarlo en POST /api/users/sync.
Plan para filtros de ubicación y precio
Verificar primero el controlador actual de GET /api/services. Si no soporta ?minPrice=&maxPrice=&location=, agregar los query params y el where correspondiente en la consulta Prisma.
Riesgos identificados
Introducir Socket.io en el mismo proceso que Express puede requerir ajustar cómo se levanta el servidor (http.createServer(app) en vez de app.listen directo) — cambio de bajo riesgo pero debe probarse que no rompe rutas existentes.
Agregar fcmToken a User requiere una migración de Prisma — revisar que no rompa datos existentes (campo opcional/nullable).
