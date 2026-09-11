TASKS.md — red-de-trabajo-api (Backend)

Tareas atómicas derivadas de plan.md. Ninguna tarea toca auth/Firebase. Marcar con [x] al completar y anotar el commit.

Estado verificado al 2026-09-10

Filtros de búsqueda
 [x] T1: Se verificó que `GET /api/services` ya respondía con datos reales, pero no respetaba los filtros `featured`, `minPrice`, `maxPrice` ni `location`.
 [x] T2: La lógica del controlador fue corregida para aplicar esos filtros al payload real de Prisma/MySQL.
Chat en tiempo real
 [x] T3: Socket.io corre integrado en el mismo servidor Express.
 [x] T4: Los modelos de conversación y mensajes ya existen en `schema.prisma` y se usaron para la integración real.
 [x] T5: El servidor sigue respondiendo `200` a `GET /api/services` con Socket.io activo.
 [x] T6: El flujo de mensajes se persiste y emite en tiempo real a través del mismo servidor.
Notificaciones push
 [ ] T7: `fcmToken` no está agregado al modelo `User` ni migrado todavía.
 [ ] T8: `POST /api/users/sync` no acepta `fcmToken` ni lo guarda.
 [ ] T9: No hay disparo de FCM para nuevos mensajes.
 [ ] T10: No hay disparo de FCM para reseñas nuevas.
Documentación
 [x] T11: `.specify/testing.md` documenta la evidencia real de API/Prisma de perfil, publicación y búsqueda; la UI queda explícitamente pendiente por falta de automatización de navegador en esta sesión.
 [x] T12: `.specify/changelog.md` refleja los cambios principales del proyecto.

Perfil y publicación
 [x] T13: `PUT /api/users/me` crea o actualiza el usuario validado y persiste el perfil cuando la sincronización previa aún no dejó registro.
 [x] T14: `POST /api/services` y `GET /api/services?category=Limpieza` fueron comprobados contra Prisma con el mismo servicio real de prueba.

Validación de runtime
 [x] T15: Backend iniciado en desarrollo y frontend Flutter servido en localhost; `GET /api/services` y búsqueda por categoría responden correctamente.
 [x] T16: Se retiró el bypass no seguro de `src/middlewares/auth.js`; los endpoints protegidos vuelven a responder `401` sin token Firebase.
 [ ] T17: Login Firebase real desde UI pendiente de una sesión/credencial Firebase disponible para automatización; no se modifica auth para simularla.

Nota: la autenticación de Google/Firebase sigue intacta y no fue modificada en ninguno de estos cambios.