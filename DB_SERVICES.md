# DB SERVICES

Servicios Oficiales Firestore (Expo + React Native)

## 1. Principio General

- No modificar totales manualmente.
- No escribir en `quincenas`/`dias`/`pagework` directamente desde frontend.
- Operaciones sensibles (Parcial, Corte, Cierre) deben ejecutarse exclusivamente en backend o Cloud Functions.

## 2. Nuevos Servicios Obligatorios

### 2.1 `closeQuincena(workspaceId, quincenaId)`

Proceso:

1. Verificar que la quincena esté abierta.
2. Marcar `cerrado = true` y `fechaCierre`.
3. Crear `AuditLog` con `action: 'closeQuincena'` y metadatos.
4. Ejecutar en transacción.

### 2.2 `reopenQuincena(workspaceId, quincenaId)` (solo owner)

Proceso:

1. Verificar que el `requestingUser` sea el `owner`.
2. Marcar `cerrado = false` y registrar `fechaReapertura`.
3. Crear `AuditLog` con `action: 'reopenQuincena'`.
4. Ejecutar en transacción.

## 3. Validación Global

Antes de cualquier operación crítica se debe comprobar:

```js
if (quincena.cerrado) throw new Error("QUINCENA_CERRADA");
```

## 4. Parcial y Corte

Las reglas y flujos existentes se mantienen, con las siguientes adiciones:

- Validar siempre que la `quincena` esté abierta antes de crear/modificar parciales o cortes.
- Si un parcial es reemplazado, crear `AuditLog` describiendo el cambio.

## 5. Estructura Recomendada

/services

- `workspace.service.ts`
- `pages.service.ts`
- `quincena.service.ts`
- `day.service.ts`
- `pagework.service.ts`
- `parcial.service.ts`
- `corte.service.ts`
- `pago.service.ts`
- `audit.service.ts`

Cada servicio encapsula sus operaciones y valida permisos y condiciones previas.

## 6. Código de Error Estándar

Definir constantes de error que usen las funciones de servicio:

- `QUINCENA_CERRADA`
- `NO_PERMISSION`
- `PARCIAL_NO_PERMITIDO`
- `CORTE_INVALIDO`
- `INVALID_INPUT`

## Resultado Final

Con estas adiciones la arquitectura obtiene:

- Inmutabilidad controlada (cierres)
- Auditoría por operaciones críticas
- Control de cierre/reapertura
- Reglas que bloquean escrituras directas desde clientes
- Optimización para bajo costo y escalabilidad

## Eliminación de la información anterior

Se ha reemplazado la especificación anterior por esta versión. La anterior ya no está activa en este archivo.

## Sugerencias

1. (Sección 2 - Cierre/Reapertura) Añadir tests de integración que simulen cierre y reapertura concurrente, verificando idempotencia y consistencia.
2. (Sección 2) Registrar `performedBy` y `performedAt` en `AuditLog` y considerar incluir `prevState` para facilitar rollback/manual review.
3. (Sección 3/4) Forzar validaciones de `quincena.cerrado` tanto en Cloud Functions como en reglas (defensive security).
4. (Servicios) Implementar tokens de idempotencia en `createPageWork` y `createParcial` para evitar duplicados en reintentos de red.
5. (Observabilidad) Añadir métricas por servicio (latencia, errores, lecturas/escrituras) y alertas de coste.
