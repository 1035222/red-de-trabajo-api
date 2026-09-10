TASKS.md — red-de-trabajo-api (Backend)

Tareas atómicas derivadas de plan.md. Ninguna tarea toca auth/Firebase. Marcar con [x] al completar y anotar el commit.

Filtros de búsqueda
 T1: Verificar si GET /api/services soporta filtros por precio y ubicación. Criterio de aceptación: documentar el hallazgo en este archivo.
 T2 (si falta): Agregar query params minPrice, maxPrice, location al controlador y su where en Prisma. Criterio: request con esos params filtra correctamente, validado con datos de prueba reales.
Chat en tiempo real
 T3: Definir en plan.md si Socket.io corre integrado o separado (bloqueante para el resto de tareas de chat).
 T4: Agregar modelos Conversation y Message a schema.prisma + migración.
 T5: Implementar servidor Socket.io integrado (http.createServer + socket.io) sin romper las rutas Express existentes. Criterio: GET /api/services sigue respondiendo 200 después del cambio.
 T6: Implementar eventos join_conversation, send_message, message_received con persistencia en MySQL antes de emitir. Criterio: mensaje enviado aparece en Prisma Studio y llega en tiempo real a un segundo cliente conectado.
Notificaciones push
 T7: Agregar campo fcmToken (nullable) al modelo User + migración.
 T8: Actualizar POST /api/users/sync para aceptar y guardar fcmToken.
 T9: Implementar envío de notificación FCM al crear un mensaje de chat nuevo.
 T10: Implementar envío de notificación FCM al recibir una reseña nueva.
Documentación
 T11: Actualizar .specify/testing.md con los criterios de prueba de cada tarea anterior conforme se van completando (no reemplazar las 8 validaciones ya documentadas, agregar debajo).
 T12: Agregar entrada nueva en .specify/changelog.md al cerrar cada bloque (filtros, chat, notificaciones) por separado.