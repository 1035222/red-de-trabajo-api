# Red de Trabajo API - Fase 1

Backend API para la aplicación Red de Trabajo. Fase 1: autenticación con Firebase y sync de usuario.

## Stack

- Node.js + Express
- MySQL
- Prisma ORM
- Firebase Admin SDK

## Requisitos previos

1. Tener Node.js instalado (>= 18)
2. Tener MySQL instalado y corriendo (localmente con XAMPP/WAMP/MySQL Workbench, o servicio cloud como Neon/Supabase)
3. Crear una base de datos llamada `red_de_trabajo` en MySQL
4. Crear un proyecto en Firebase Console
5. Descargar el archivo de credenciales de Service Account desde Firebase Console (Project Settings > Service Accounts > Generate new private key) y guardarlo como `serviceAccountKey.json` en la raíz del proyecto

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Copiar el archivo de ejemplo de variables de entorno:
```bash
copy .env.example .env
```

3. Editar el archivo `.env` con tus datos:
   - `DATABASE_URL`: conexión a tu base de datos MySQL
   - `FIREBASE_PROJECT_ID`: ID de tu proyecto Firebase
   - `FIREBASE_SERVICE_ACCOUNT_PATH`: ruta al archivo JSON de credenciales

## Base de datos

Ejecutar migraciones:
```bash
npm run prisma:migrate -- --name init
```

Ejecutar seed de categorías iniciales:
```bash
npm run prisma:seed
```

## Levantar servidor

```bash
npm run dev
```

El servidor quedará corriendo en `http://localhost:3000`.

## Endpoint de prueba

Primero obtené un idToken desde el frontend (Firebase Auth). Luego probá el sync:

```bash
curl -X POST http://localhost:3000/api/users/sync \
  -H "Authorization: Bearer <ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"uid\":\"<UID_FIREBASE>\",\"email\":\"correo@gmail.com\",\"name\":\"Nombre\",\"avatarUrl\":\"\"}"
```

Deberías recibir el perfil del usuario creado/actualizado desde la base de datos.

## Próximas fases

- Fase 2: CRUD de servicios, reseñas y portafolio
- Fase 3: Chat y notificaciones
- Fase 4: Subida de archivos y pagos
