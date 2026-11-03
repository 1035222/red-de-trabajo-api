SPEC.md — red-de-trabajo-api (Backend)

Fuente de verdad de PRODUCTO: red_de_trabajo (frontend) .specify/spec.md. Este documento cubre solo lo que el backend debe exponer para soportarlo.

Qué debe proveer este backend
API REST que sirva de fuente de datos única para: usuarios/perfiles, servicios, portafolio, categorías, reseñas/calificaciones, chat en tiempo real y notificaciones push.
Verificación de identidad mediante Firebase Admin (tokens emitidos por el login del frontend) — el backend NO gestiona contraseñas ni JWT propios.
Funcionalidades ya soportadas (verificado end-to-end)
POST /api/users/sync — sincroniza usuario autenticado con Firebase.
CRUD de servicios (/api/services) con uuid generado, categoryId resuelto desde el nombre de categoría (providerName no es un campo del schema; se obtiene vía relación provider en los GET). Foto se recibe como URL (no upload de archivo en backend).
CRUD de perfil, portafolio, reseñas.
Funcionalidades pendientes de construir
Chat en tiempo real (Socket.io): persistencia de conversaciones y mensajes, entrega en tiempo real, historial. Decisión confirmada: se implementa con Socket.io.
Notificaciones push (FCM): tokens por dispositivo, bandeja persistida y entregas al recibir mensajes, solicitudes de servicio y reseñas.
Filtros de búsqueda por ubicación y precio: verificar si GET /api/services ya soporta query params de rango de precio y ubicación; si no, implementarlos.
Criterios de éxito
Cada endpoint nuevo se valida end-to-end (petición real + confirmación en Prisma Studio) antes de cerrarse, siguiendo el mismo estándar que las funcionalidades ya construidas.
Ningún cambio afecta src/middlewares/auth.js, src/config/firebase.js ni serviceAccountKey.json (zona restringida, ver AGENTS.md).
Restricciones no funcionales
Stack fijo: Node.js + Express + Prisma + MySQL (no se cambia sin actualizar constitution.md).
HTTPS y CORS configurado correctamente en cualquier endpoint nuevo.
Errores nunca silenciados: todo catch loguea el error real.
Fuera de alcance
Subida de archivos de imagen directamente en el backend (S3/Cloudinary) — se mantiene el enfoque actual de recibir solo la URL, salvo que se decida lo contrario explícitamente.
Pagos, reservas automáticas, verificación de identidad con documentos.
[NEEDS CLARIFICATION]
La activación de notificaciones web requiere la clave pública VAPID del proyecto Firebase.