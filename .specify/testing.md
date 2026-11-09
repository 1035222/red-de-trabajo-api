# Pruebas — red-de-trabajo-api

El índice de rutas/controladores/modelos está en el [README](../README.md). Diferenciar las comprobaciones sintácticas de la API, la persistencia verificada y la entrega real de notificaciones.

## Verificado en la actualización de notificaciones (2026-11-08)

- `node --check src/services/notificationService.js`: pasó.
- `node --check src/controllers/interactionController.js`: pasó.
- La validación no envió un push real. Para verificar entrega y sonido hace falta token FCM vigente, credenciales Firebase y dispositivo configurado.
- La migración `20261109005200_add_fcm_tokens` está versionada. Su aplicación y la consulta `prisma.fcmToken.count()` se confirmaron previamente en la base de desarrollo; ejecutar `npx prisma migrate status` en cada entorno antes de publicar.

## Matriz de validación pendiente

| Área | Validación necesaria |
|---|---|
| Servicios/filtros | HTTP con datos representativos para `featured`, texto, categoría, rango de precio y ubicación; confirmar resultados con Prisma |
| Perfil/reseñas | Token Firebase válido; demostrar que las reseñas recibidas filtran por proveedor del servicio |
| Chat | Dos participantes: persistencia REST, entrega Socket.IO, autorización, archivos y borrado propagado |
| Favoritos | Agregar notifica al proveedor; quitar y auto-favorito no notifican; metadata incluye `service_favorite` y `serviceId` |
| FCM | Enviar mensaje/solicitud/reseña/favorito a token válido y probar sonido/tap en móvil |
| Migraciones | `npx prisma migrate status` y `npx prisma migrate deploy` en cada entorno antes de publicar |

## Evidencia histórica de API y Prisma (2026-09-11)

- Perfil `PUT /api/users/me`, publicación `POST /api/services` y consulta por categoría devolvieron respuestas esperadas y se verificaron con Prisma.
- Esas pruebas utilizaron el mecanismo de identidad temporal de desarrollo de aquel momento; el bypass fue retirado. No equivalen a pruebas autenticadas actuales.

## Restricciones de prueba

- Nunca deshabilitar ni reemplazar `src/middlewares/auth.js` para simular una cuenta.
- No usar `prisma db push` para sustituir migraciones versionadas.
- Los `node --check` solo confirman sintaxis y no comprueban reglas de negocio, base de datos o entrega FCM.
