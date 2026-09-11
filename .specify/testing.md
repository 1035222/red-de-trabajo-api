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

## Evidencia ejecutada — perfil, publicación y búsqueda (2026-09-11)

- `PUT /api/users/me` con el usuario de desarrollo `probe_upsert_404` respondió `200` con `name=Probe Persistido`, `bio=Perfil guardado desde PUT` y `location=Santiago`.
- Consulta directa con Prisma para `probe_upsert_404` confirmó esos mismos valores persistidos en `User`.
- `POST /api/services` con categoría `Limpieza` respondió `201` y creó el servicio `95750bde-3bbb-4814-8ecb-0e7adc2053c9` con precio `$275`, descripción, `categoryId=3`, `categoryName=Limpieza`, `providerId=probe_upsert_404` e `imageUrl`.
- Consulta directa con Prisma confirmó el registro del servicio.
- `GET /api/services?category=Limpieza` respondió `200`, devolvió 2 resultados e incluyó el servicio creado, con el proveedor y ubicación `Santiago`.
- Estas pruebas fueron ejecutadas contra la API local y Prisma con el bypass de desarrollo `x-test-user-id`; no constituyen una interacción UI autenticada real.

## Estado posterior a la restauración de auth (2026-09-10)

- El bypass temporal `x-test-user-id` fue retirado de `src/middlewares/auth.js` por no ser un cambio seguro.
- Sin un token Firebase válido, `PUT /api/users/me` y `POST /api/services` responden `401`, confirmando que la protección de auth está activa.
- El registro de perfil y servicio creado durante la prueba anterior continúa presente en MySQL y fue leído directamente mediante Prisma.