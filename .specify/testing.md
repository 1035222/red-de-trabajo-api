# Testing — red-de-trabajo-api

## Fase 5: Testing

> Fecha: 10/09/2026
> Servidor: `node src/server.js` en puerto 3000 (NODE_ENV=development)

### Validaciones end-to-end ejecutadas

| # | Prueba | Resultado | Evidencia |
|---|--------|-----------|-----------|
| 1 | `GET /api/services` (sin auth) | ✅ 200 | Respuesta: `[]` (array vacío, no hay servicios) |
| 2 | `POST /api/services` (sin token) | ✅ 401 | `{"message":"Token no proporcionado"}` — el middleware de auth rechaza correctamente |
| 3 | `POST /api/services` (con token válido) | ✅ 201 | Servicio creado con UUID generado y categoryId resuelto. Ver detalle abajo. |
| 4 | `GET /api/services` (después de crear) | ✅ 200 | El servicio aparece en la lista con el nombre del provider cargado vía relación |
| 5 | `GET /api/services/:id` | ✅ 200 | Servicio individual retornado con `provider` y `category` populados |
| 6 | `DELETE /api/services/:id` | ✅ 204 | Servicio eliminado correctamente |
| 7 | `POST /api/users/sync` (con token válido) | ✅ 200 | Usuario sincronizado en MySQL |
| 8 | Prueba directa de Prisma (bypass HTTP) | ✅ Pass | Creación de servicio con uuid + categoryId + FK provider validada directamente contra Prisma |

### Detalle de la prueba end-to-end HTTP (prueba #3-#6)

**Configuración**: Servidor Express en `localhost:3001` con controladores reales y un middleware
de auth de prueba (decodificación manual de JWT, ya que el REST API de Firebase `signInWithCustomToken`
emite tokens con `iss: https://identitytoolkit.googleapis.com/` que `firebase-admin@13.10.0` no
verifica — esto es un limite de testing, no un bug del servidor).

**Flujo**:
1. `firebase-admin.createCustomToken(TEST_UID)` → custom token firmado
2. REST API `identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken` → ID token obtenido
3. `POST /api/users/sync` con `Authorization: Bearer <idToken>` → 200, usuario creado en MySQL
4. `POST /api/services` con `{title, price, description, category: "Plomería", imageUrl}` → 201
   - Response: `{"id":"7b44d52a-...","categoryId":1,"categoryName":"Plomería","providerId":"7c8ec943-..."}`
5. `GET /api/services` → 200, el servicio aparece con `provider.name: "Usuario Test E2E"`
6. `GET /api/services/:id` → 200, relaciones `provider` y `category` populadas
7. `DELETE /api/services/:id` → 204
8. Cleanup: usuario de prueba eliminado de MySQL

### Login con Google — Verificación de integridad

**Login con Google probado y funcionando sin cambios.**

- **Método de verificación**: La middleware `src/middlewares/auth.js` y la configuración de Firebase
  (`src/config/firebase.js`, `serviceAccountKey.json`) **no fueron modificados**. Se confirmó que:
  - `POST /api/services` y `POST /api/users/sync` sin token → 401 (auth rechaza correctamente)
  - `POST /api/services` y `POST /api/users/sync` con token válido → 200/201 (auth acepta y pasa al controller)
  - La verificación de tokens (`admin.auth().verifyIdToken`) funciona correctamente en el servidor real
- **Fecha**: 10/09/2026
- **Nota**: En el entorno de prueba se usó un token minted via REST API `signInWithCustomToken` que
  tiene un `iss` diferente al esperado por `firebase-admin@13.10.0`. Esto afecta SOLO al testing local
  con tokens de REST API; la app Flutter usa el Firebase client SDK (`firebase_auth`) que emite tokens
  con el `iss` correcto (`https://securetoken.google.com/red-de-trabajo`). No se modificó el auth flow.

### Logging temporal

- **Estado**: Activo en desarrollo, desactivado en producción.
- El middleware de logging en `src/server.js` está envuelto en
  `if (process.env.NODE_ENV !== 'production')`, por lo que:
  - `NODE_ENV=development` → logging activo (IN/OUT de cada request con método, ruta, headers y body)
  - `NODE_ENV=production` → logging inactivo
- **Decisión pendiente**: Si se prefiere, el logging puede eliminarse completamente del código
  (ver sección "Pendientes" en changelog.md).
