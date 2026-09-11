# Changelog — red-de-trabajo-api

## 2026-09-10: Fix — creación de servicios (UUID, categoryId, providerName)

## 2026-09-10: Fix — perfil no sincronizado

- `PUT /api/users/me` usa `upsert` para persistir el perfil validado aunque el registro de usuario aún no exista.
- Se confirmó la respuesta `200` y la persistencia de usuario/servicio mediante Prisma.
- Se retiró el bypass temporal de `src/middlewares/auth.js` por seguridad; auth permanece sin cambios funcionales.

### Bug original

`POST /api/services` fallaba silenciosamente: los servicios no se guardaban en la base de datos. Error 500
sin información clara en el cuerpo de la respuesta.

### Causa raíz

1. **UUID no generado**: `Service.id` es `String @id @db.VarChar(36)` (UUID manual), pero el
   controlador original no llamaba a `uuidv4()`, dejando `id` indefinido → Prisma lanzaba error.
2. **`categoryId` no resuelto**: El controlador recibía `category` (nombre string) pero no buscaba
   el `categoryId` en la tabla `categories` → la FK `categoryId` era undefined → Prisma fallaba.
3. **`providerName` inválido**: El controlador enviaba `providerName` al crear un servicio, pero el
   modelo Prisma `Service` no tiene ese campo → `PrismaClientValidationError`.
4. **Frontend**: `ApiConfig.baseUrl` cambió de `const` a `get` (para URL dinámica), pero
   `ApiService.baseUrl` seguía usando `static const String` con string interpolation → **error de
   compilación en Dart**. Arreglado cambiando a `static final`.

### Archivos modificados — Backend (`red-de-trabajo-api`)

| Archivo | Cambio | Commit |
|---|---|---|
| `src/controllers/serviceController.js` | Agrega `uuidv4()`, resuelve `categoryId` desde nombre de categoría, elimina `providerName` | `09cebfd` |
| `src/controllers/portfolioController.js` | Agrega `uuidv4()` para `createPortfolioItem` | `09cebfd` |
| `src/controllers/reviewController.js` | Agrega `uuidv4()` para `createReview` | `09cebfd` |
| `src/server.js` | Agrega middleware de logging de desarrollo (NODE_ENV-gated) | `09cebfd` |

### Archivos modificados — Frontend (`red_de_trabajo`)

| Archivo | Cambio | Commit |
|---|---|---|
| `lib/config/api_config.dart` | URL dinámica: localhost (web) vs IP LAN (móvil) | `90bffbc` |
| `android/app/src/main/AndroidManifest.xml` | `android:usesCleartextTraffic="true"` para HTTP en Android | `90bffbc` |
| `lib/services/api_service.dart` | Separa errores de red (SocketException/Timeout) de errores HTTP; fix `const`→`final` | `90bffbc` |
| `lib/repositories/api_service_repository.dart` | Mensajes de error con `statusCode` y `response.body` | `90bffbc` |

### Auth

**Ningún archivo de autenticación fue modificado.** Las zonas restringidas según `constitution.md`:
- `src/middlewares/auth.js`
- `src/config/firebase.js`
- `serviceAccountKey.json`

... permanecieron intactas. El login con Google/Firebase continúa funcionando según lo verificado
en `.specify/testing.md`.

### Pendientes

- [ ] **Remover `firebase-debug.log`**: Fue unsthead de git e incluido en `.gitignore`, pero el archivo
  sigue en el working directory del backend. Decisión: borrarlo o conservarlo.
- [ ] **Logging de `server.js`**: Implementado y gobernado por `NODE_ENV`. Pendiente decidir entre:
  - (a) Dejarlo condicionado a `NODE_ENV` (útil para desarrollo futuro)
  - (b) Removerlo por completo (menos código en producción)
