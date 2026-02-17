# Seguridad Firestore – Sistema Financiero

## 1. Principios Base

- Autenticación obligatoria.
- Autorización por workspace.
- Quincena cerrada = inmutable.
- Totales nunca modificables desde cliente.
- Eliminación lógica obligatoria.

## 2. Reglas Fundamentales

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() {
      return request.auth != null;
    }

    function isMember(workspaceId) {
      return request.auth.uid in
        get(/databases/$(database)/documents/workspaces/$(workspaceId)).data.members;
    }

    match /workspaces/{workspaceId} {

      allow read: if isAuth() && isMember(workspaceId);

      allow update: if isAuth() &&
                    request.auth.uid == resource.data.ownerId;

      match /quincenas/{quincenaId} {
        allow read: if isAuth() && isMember(workspaceId);
        allow write: if false; // solo backend
      }

      match /quincenas/{quincenaId}/dias/{dayId} {
        allow read: if isAuth() && isMember(workspaceId);
        allow write: if false;
      }

      match /quincenas/{quincenaId}/dias/{dayId}/pages/{pageWorkId} {
        allow read: if isAuth() && isMember(workspaceId);
        allow write: if false;
      }
    }
  }
}
```

## 3. Protección Contra Manipulación

- Nunca confiar en el frontend.
- Whitelisting de campos (no escribir objetos completos desde cliente).
- Validación estricta de enums.
- No permitir números negativos.
- Validar rangos de porcentaje.

## 4. Concurrencia

Todas las operaciones Parcial / Corte deben:

- Ejecutarse en transacción server-side.
- Validar estado previo.
- Actualizar referencias atómicamente.

## 5. Auditoría

Registrar eventos en:

`workspaces/{workspaceId}/auditLogs`

Eventos recomendados:

- Cierre quincena
- Reapertura
- Reemplazo parcial
- Creación corte

## 6. Nivel de Seguridad Objetivo

- Prevención de manipulación contable.
- Multiusuario concurrente seguro.
- Protección de integridad histórica.
- Arquitectura auditable.

## Sugerencias

1. (Sección 2) Añadir reglas de ejemplo que bloqueen escrituras directas y muestren respuestas claras para errores de permiso.
2. (Sección 3) Implementar validaciones en Cloud Functions además de reglas (defensa en profundidad).
3. (Sección 4) Usar tokens de idempotencia y tests de estrés/concurrency para parciales y cortes.
4. (Sección 5) Definir retención y tamaño/particionado de `auditLogs` para control de costos y consulta eficiente.

Si el sistema evoluciona:

No almacenar datos bancarios en Firestore sin cifrado.

No almacenar tokens de pago en cliente.

Usar Firebase Auth con email verificado.

### 7. Seguridad en Frontend

Sanitizar inputs numéricos.

Limitar decimales.

Evitar usar innerHTML.

No interpolar valores en HTML sin escapar.

### 8. Seguridad en Cloud Functions (si se usan)

Verificar auth.uid

Verificar membership

Validar datos antes de escribir

Nunca confiar en request.body

### 9. Auditoría Recomendada

Agregar opcionalmente:

`createdBy: userId`
`updatedBy: userId`

En:

Quincena

Day

PageWork

Permite trazabilidad multiusuario.

### 10. Resumen de Seguridad

El sistema debe cumplir:

✔ Autenticación obligatoria
✔ Autorización por workspace
✔ Totales protegidos
✔ Eliminación lógica
✔ Transacciones en operaciones críticas
✔ Validación estricta de tipos
✔ Control de privilegios
✔ No confiar en frontend

## 🔐 Nivel de Seguridad Objetivo

Arquitectura diseñada para:

Multiusuario concurrente

Prevención de manipulación contable

Protección contra corrupción de datos

Escalable y auditable

## Sugerencias

- 1.1: Añadir regla explícita que bloquee escrituras a `quincenas/*`, `quincenas/*/dias/*`, y `dias/*/pages/*` desde clientes (ya indicado, pero reforzar con ejemplos concretos).
- 2: Implementar validación de totales en Cloud Functions además de reglas, y añadir tests unitarios para estas funciones.
- 4: Para evitar condiciones de carrera en parciales, usar transacciones server-side y tokens de idempotencia.
- 9: Añadir `auditLogs` y poblar `createdBy/updatedBy` en write operations críticas.
