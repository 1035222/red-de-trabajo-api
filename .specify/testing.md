Adiciones a .specify/testing.md — red-de-trabajo-api

IMPORTANTE: esto se AGREGA al testing.md existente (que ya documenta 8 validaciones end-to-end de servicios/auth/Prisma). No se borra ni reemplaza lo ya escrito.

Plan de pruebas — Filtros de búsqueda (pendiente de ejecutar cuando se implemente T1/T2)
 GET /api/services?minPrice=X&maxPrice=Y devuelve solo servicios en ese rango.
 GET /api/services?location=Z devuelve solo servicios de esa ubicación.
 Combinación de ambos filtros funciona correctamente.
Plan de pruebas — Chat en tiempo real (pendiente de ejecutar cuando se implemente T3-T6)
 Conexión Socket.io se establece sin romper las rutas REST existentes (repetir las 8 validaciones ya documentadas y confirmar que siguen en verde).
 Mensaje enviado desde un cliente se persiste en MySQL (verificado en Prisma Studio).
 Mensaje enviado llega en tiempo real a un segundo cliente conectado a la misma conversación.
 Historial de conversación se recupera correctamente al reconectar.
Plan de pruebas — Notificaciones push (pendiente de ejecutar cuando se implemente T7-T10)
 fcmToken se guarda correctamente en POST /api/users/sync.
 Notificación FCM se dispara al crear un mensaje de chat nuevo.
 Notificación FCM se dispara al recibir una reseña nueva.
 Confirmación de que ningún cambio de esta fase tocó src/middlewares/auth.js, src/config/firebase.js ni serviceAccountKey.json.