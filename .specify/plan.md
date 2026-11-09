# PLAN — red-de-trabajo-api

Decisiones técnicas vigentes. Consultar el [README](../README.md) para el mapa completo de endpoints, controladores y modelos.

## Arquitectura

- `src/server.js`: crea Express y HTTP, monta routers `/api/*`, publica archivos bajo `/uploads` y acopla Socket.IO al mismo servidor.
- `src/routes/`: mapea las rutas y aplica `authMiddleware` a endpoints protegidos.
- `src/controllers/`: reglas de negocio HTTP y acceso Prisma.
- `src/services/notificationService.js`: persiste notificación, envía FCM y elimina tokens inválidos.
- `src/config/`: Prisma y Firebase Admin.
- `src/middlewares/auth.js`: valida Firebase ID token en HTTP; Socket.IO aplica validación propia en `server.js`.
- `prisma/schema.prisma`: modelos de usuarios, servicios, categorías, reseñas, favoritos, solicitudes, conversaciones, mensajes, notificaciones y tokens FCM.

## Persistencia y archivos

MySQL es la base de datos. Los cambios de esquema se versionan como migraciones Prisma y se aplican con `npx prisma migrate deploy`. `/api/uploads` usa Multer y guarda archivos en el directorio `uploads/`; Express sirve los archivos guardados en `/uploads`. En despliegues, ese directorio debe ser persistente o reemplazarse por almacenamiento duradero; las URLs guardadas deben seguir siendo accesibles.

## Contratos de funcionalidad

- Servicios: endpoints REST; `GET /api/services` acepta búsqueda, categoría, precio, ubicación y destacados.
- Chat: REST guarda un mensaje una vez y recupera historial; Socket.IO difunde eventos de mensajes, borrados y escritura a participantes autorizados.
- Notificaciones: `Notification.data` se persiste en la columna SQL `metadata`; `FcmToken` se almacena en `fcm_tokens`. Los payloads llevan `type` y los IDs de destino (`conversationId`, `serviceId`, `requestId` cuando aplique).
- Favoritos: una transición a favorito nuevo avisa al proveedor con `type: service_favorite` y `serviceId`; quitarlo no notifica.
- Reseñas: listado por usuario identifica al proveedor mediante `Review.service.providerId`.
- Sonido: FCM establece `android.notification.channelId` = `red_de_trabajo_notifications`, sonido default Android y APNs; el canal se declara también en Android del frontend.

## Comandos

```powershell
npm install
npm run dev
npx prisma migrate status
npx prisma migrate deploy
npx prisma studio
```

No usar `prisma db push` en lugar de migraciones versionadas para desplegar un esquema ya definido, salvo decisión explícita de mantenimiento del proyecto.

## Validación

Para cada endpoint, validar el status/cuerpo y verificar persistencia con Prisma. Ejecutar `node --check` sobre los controladores y servicios tocados. Push y sonido requieren un token FCM real y prueba en dispositivo; el chequeo sintáctico no valida entrega remota.
