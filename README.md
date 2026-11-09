# Red de Trabajo — API

Backend REST y Socket.IO del marketplace Red de Trabajo. Stack: Node.js, Express, Prisma, MySQL y Firebase Admin. El cliente principal Flutter se encuentra en el repositorio hermano `red_de_trabajo`.

## Arquitectura

```text
src/
  config/        conexión Prisma y Firebase Admin
  controllers/   lógica de endpoints
  middlewares/   autenticación Firebase
  routes/        rutas REST por módulo
  services/      envío y persistencia de notificaciones
  server.js      Express, montaje de rutas y Socket.IO
prisma/
  schema.prisma  modelos y relaciones MySQL
  migrations/    cambios versionados del esquema
uploads/         archivos servidos por /uploads
```

## Mapa de funcionalidades

| Funcionalidad | Rutas | Implementación | Datos |
|---|---|---|---|
| Firebase y sincronización de usuario | `POST /api/users/sync` | `src/routes/users.js`, `src/controllers/userController.js`, `src/middlewares/auth.js` | `User` en `prisma/schema.prisma` |
| Perfiles | `GET /api/users/:id`, `PUT /api/users/me` | `src/controllers/profileController.js` | `User` |
| Servicios, catálogo y filtros | `GET/POST /api/services`, `GET/PUT/DELETE /api/services/:id` | `src/controllers/serviceController.js` | `Service`, `Category`, `User` |
| Categorías | `GET/POST /api/categories` | `src/controllers/categoryController.js` | `Category` |
| Carga de fotos y audios | `POST /api/uploads`; archivos en `/uploads/:filename` | `src/routes/uploads.js`; estáticos configurados en `src/server.js` | archivos en disco; la URL se guarda en el registro correspondiente |
| Portafolio | `GET /api/portfolio`, `GET /api/portfolio/:userId`, `POST /api/portfolio` | `src/controllers/portfolioController.js` | `PortfolioItem` |
| Reseñas y métricas | `GET /api/reviews`, `GET /api/reviews/service/:serviceId`, `GET /api/reviews/:userId`, `POST /api/reviews` | `src/controllers/reviewController.js` | `Review`; las recibidas se filtran por proveedor del servicio reseñado |
| Favoritos y solicitudes | `/api/favorites`, `/api/favorites/:serviceId`, `/api/favorites/:serviceId/toggle`, `/api/services/:serviceId/requests`, `/api/requests` | `src/controllers/interactionController.js` | `Favorite`, `ServiceRequest` |
| Chat | `/api/chat/conversations` y sus mensajes; `DELETE .../messages/:messageId` | `src/controllers/chatController.js`; eventos Socket.IO en `src/server.js` | `Conversation`, `ChatMessage` |
| Notificaciones y tokens FCM | `/api/notifications`, `/unread-count`, `/tokens`, `/:notificationId` | `src/controllers/notificationController.js`, `src/services/notificationService.js` | `Notification`, `FcmToken` |

Todas las rutas REST se montan en `src/server.js`. Las rutas protegidas usan `src/middlewares/auth.js`; las rutas de subida de archivo también requieren autenticación. Socket.IO se ejecuta en el mismo servidor HTTP y valida participantes de cada conversación.

## Configuración y ejecución

Requiere Node.js 18+, MySQL, un proyecto Firebase y variables de entorno definidas en `.env` (ver `.env.example`). No pongas credenciales de Firebase ni secretos en el repositorio.

```powershell
npm install
npx prisma migrate status
npm run prisma:seed
npm run dev
```

Servidor predeterminado: `http://localhost:3000`. Flutter Web consume `localhost`; para móvil, la API debe escuchar en una dirección accesible desde la red del dispositivo y la URL debe coincidir con `lib/config/api_config.dart` del frontend.

### Base de datos

Las migraciones versionadas están en `prisma/migrations/`; ejecutar `npx prisma migrate deploy` para aplicar las ya creadas en un entorno y `npx prisma migrate dev` para crear una migración durante desarrollo. `npx prisma studio` permite inspeccionar datos. La migración de `fcm_tokens` crea la tabla que usa el registro de tokens push.

## Documentación de producto y trabajo

- `.specify/spec.md`: alcance API.
- `.specify/plan.md`: arquitectura y contratos técnicos.
- `.specify/tasks.md`: tareas y estado.
- `.specify/testing.md`: evidencias y verificaciones pendientes.
- `.specify/changelog.md`: historial de cambios.
- `AGENTS.md`: instrucciones de desarrollo y restricciones.

El envío real de push y la reproducción de sonido dependen de credenciales/configuración Firebase y de probar con un dispositivo/token FCM válido; la sintaxis de Node por sí sola no confirma entrega al dispositivo.
