# SPEC — red-de-trabajo-api

Fuente de producto: spec del frontend. Este backend Node.js/Express con Prisma y MySQL soporta la aplicación Flutter. El mapa de endpoints, rutas, controladores y modelos está en el [README](../README.md).

## Responsabilidades implementadas

- Verificar ID tokens Firebase en middleware para endpoints protegidos y sincronizar el UID con `User`.
- Servir perfiles, catálogo, categorías y CRUD de servicios con filtros de texto/categoría/precio/ubicación.
- Persistir y servir imágenes/audio cargados mediante endpoint autenticado.
- Gestionar portafolios, reseñas, favoritos y solicitudes.
- Persistir conversaciones y mensajes, exponer historial REST y emitir eventos Socket.IO.
- Gestionar borrado autorizado de mensajes propios y difundir el evento a participantes conectados.
- Persistir notificaciones y tokens FCM por dispositivo; enviar push para mensajes, solicitudes, reseñas y nuevos favoritos; listar, contar y marcar avisos como leídos.
- Incluir metadatos de destino para dirigir al cliente a la pantalla relacionada.

## Reglas de negocio

- Solo Firebase verifica identidad; el API no gestiona contraseñas de usuarios ni usa un JWT propio para autenticación de la app.
- Las reseñas recibidas por una persona se obtienen mediante los servicios donde es proveedor, no por autoría.
- Al agregar favorito, notificar al proveedor salvo que la persona marque su propio servicio. Quitar favorito no envía notificación.
- Autorizar acceso a conversación y propiedad del mensaje antes de leer/eliminar.
- FCM solicita sonido predeterminado para Android y APNs; el cliente aplica su preferencia de notificaciones.

## Restricciones y validación

- MySQL y Prisma son la persistencia del proyecto.
- No modificar middleware/configuración de Firebase o credenciales de servicio como parte de cambios no relacionados con autenticación.
- Migraciones bajo `prisma/migrations/`; aplicar las migraciones versionadas en cada entorno.
- Para considerar push/sonido validado falta una entrega real con credenciales, token de dispositivo y prueba en móvil.
- Pagos, reservas automatizadas y verificación documental están fuera de alcance.
