# Constitution — red-de-trabajo-api

Fase 0 de Spec-Driven Development. Estas son las reglas no negociables del proyecto.
Ningún agente de IA puede generar código, spec, plan o tarea que las viole.

## Principios de arquitectura

1. El backend es la única fuente de verdad de los datos; Prisma + MySQL son el
   almacenamiento canónico.
2. Cualquier endpoint que reciba archivos (fotos de servicios/proyectos) debe usar
   multipart/form-data de forma consistente entre frontend y backend.
3. Los errores nunca se silencian: todo catch debe loguear el error real antes de
   responder al cliente.

## Seguridad y zonas intocables

4. **Autenticación (Firebase Auth / Google Sign-In) es zona restringida.** Ningún
   agente debe modificar middleware de auth, verificación de tokens, ni configuración
   de Firebase Admin como efecto colateral de otra tarea.
5. No se exponen credenciales, tokens ni datos sensibles en logs, ni siquiera en
   logging temporal de depuración.

## Estándares de calidad

6. Toda funcionalidad de guardado (crear/editar/eliminar) debe validarse end-to-end
   antes de marcarse como completa: prueba real desde el cliente + confirmación en
   Prisma Studio de que el dato persiste.
7. El logging temporal de depuración debe controlarse por NODE_ENV y removerse o
   desactivarse al cerrar la tarea.

## Convenciones técnicas

8. Stack fijo: Node.js + Express + Prisma + MySQL en backend; no se introducen
   frameworks o ORMs alternativos sin actualizar esta constitución primero.
9. Toda funcionalidad nueva o corregida debe quedar reflejada en `.specify/spec.md`
   y `.specify/plan.md` — el código no es la especificación.

## Proceso de cambio

10. Si un requisito cambia: se actualiza spec.md primero, luego plan.md, luego
    tasks.md, y solo entonces se toca el código. Nunca al revés.
