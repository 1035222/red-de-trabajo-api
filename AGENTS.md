# AGENTS.md — red-de-trabajo-api

README para agentes de IA (Kilo Code y similares) que trabajen en este repositorio.
Este archivo es la fuente de verdad de contexto operativo. Las decisiones de producto y
arquitectura viven en `.specify/` (ver SDD más abajo) — este archivo cubre cómo trabajar
en el día a día del código.

## Overview del proyecto

Backend de **Red de Trabajo**, un marketplace de servicios que conecta oferentes y
clientes. Consumido por una app Flutter (frontend separado). Módulos principales:
autenticación (Firebase), perfiles, portafolios, servicios/proyectos (con carga de
fotos), reseñas y chat (pendiente, fase Socket.io).

## Stack

- Node.js + Express
- Prisma ORM + MySQL
- Firebase Admin SDK (autenticación — ver "Zonas restringidas" abajo)
- Carga de imágenes: no hay librería de upload en el backend; las fotos se suben desde
  el frontend (probablemente a Firebase Storage) y el API recibe solo la URL (campo
  `imageUrl` / `avatarUrl` como string en el body JSON). [Ajuste respecto al template:
  el repo no incluye multer, cloudinary, sharp ni SDK de S3.]

## Comandos

npm install
npm run dev          # levanta el servidor en modo desarrollo (puerto 3000, nodemon)
npm start            # levanta el servidor en producción (puerto 3000)
npx prisma studio    # inspeccionar/editar datos directamente
npx prisma migrate status   # ver estado de migraciones
npx prisma db push          # sincronizar schema con la base de datos

(Verifica estos comandos contra el package.json real antes de asumir.)

## Estilo de código

- Sigue el estilo ya presente en el repo.
- Controladores, rutas y middlewares separados por responsabilidad.
- Usa async/await con try/catch explícito; no tragues errores silenciosamente.

## Testing

- Antes de dar por resuelta cualquier tarea de conectividad, valida end-to-end:
  reproducir la acción desde el frontend (o curl/Postman) y confirmar en
  `npx prisma studio` que el dato quedó persistido.
- Logging temporal de depuración: controlar por NODE_ENV y quitarlo al cerrar la tarea.

## 🚫 Zonas restringidas (NO TOCAR sin autorización explícita)

- Todo lo relacionado con **autenticación de Google / Firebase Auth**: login,
  verificación de tokens, middleware de auth, configuración de Firebase Admin.
  Este flujo ya funciona en producción y se ha dañado repetidamente al hacer
  cambios no relacionados. Si detectas algo que "parece" un bug ahí, repórtalo
  en el resumen de la tarea — no lo edites.

## Reglas de commits / PR

- Un commit por tarea atómica (ver `.specify/tasks.md`), mensaje en español,
  formato: `tipo: descripción breve` (ej. `fix: corrige multipart en POST /servicios`).
- No mezclar cambios de auth con cambios de otras funcionalidades en el mismo commit.

## Dónde está la fuente de verdad de producto/arquitectura

Este proyecto sigue **Spec-Driven Development (SDD)**. Antes de implementar cualquier
funcionalidad nueva o cambio de comportamiento, consulta y actualiza:

- `.specify/memory/constitution.md` — principios no negociables
- `.specify/spec.md` — qué se construye y por qué
- `.specify/plan.md` — cómo se construye técnicamente
- `.specify/tasks.md` — desglose de tareas ejecutables

No implementes nada que contradiga estos documentos sin actualizarlos primero.
