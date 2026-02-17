# Sistema de Gestión Financiera por Quincenas

Arquitectura Multiusuario – Firebase Firestore

## 1. Descripción General

Sistema de gestión financiera estructurado por quincenas con soporte multiusuario mediante Workspaces compartidos.

Permite:

- Registro diario por páginas
- Control contable de Parcial y Corte
- Conversión de monedas por quincena
- Cálculo de pago final con aranceles
- Separación entre estadísticas y pago real
- Eliminación lógica (no física)
- Inmutabilidad histórica controlada
- Auditoría de eventos críticos

Base de datos: Firebase Firestore

## 2. Arquitectura General

### Estructura Jerárquica

```
workspaces/{workspaceId}
  ├── pages/{pageId}
  ├── auditLogs/{logId}
  ├── quincenas/{quincenaId}
  │     └── dias/{dayId}
  │           └── pages/{pageWorkId}
```

## 3. Principios de Diseño

- Denormalización controlada
- Totales almacenados (no recalculados en lectura)
- Transacciones obligatorias en operaciones críticas
- Eliminación lógica mediante status
- Separación estadística vs pago
- Inmutabilidad de quincena cerrada
- Auditoría obligatoria en eventos críticos
- Optimización de lecturas y bajo costo operativo

## 4. Modelo de Datos

### 4.1 Workspace

```json
Workspace {
  name: string
  ownerId: string
  members: string[]

  aranceles: {
    usd: number
    euro: number
    gbp: number
    porcentaje: number
  }

  schemaVersion: number
  createdAt: Timestamp
}
```

**Responsabilidad:**

- Gestionar miembros
- Almacenar aranceles globales
- Versionar modelo si evoluciona

### 4.2 AuditLog

Colección:

`workspaces/{workspaceId}/auditLogs/{logId}`

```json
AuditLog {
  type: "QUINCENA_CIERRE" | "QUINCENA_REAPERTURA" | "PARCIAL_REEMPLAZADO" | "CORTE_CREADO"
  entityId: string
  createdBy: string
  createdAt: Timestamp
  metadata: object
}
```

Se registra cuando:

- Se cierra quincena
- Se reabre quincena
- Se reemplaza parcial
- Se crea corte

### 4.3 Page (Configuración)

Colección:

`workspaces/{workspaceId}/pages/{pageId}`

```json
Page {
  name: string
  coins: boolean
  valorCoins: number
  moneda: "USD" | "EUR" | "GBP" | "COP"
  mensual: boolean
  tope: number
  descuento: number
  status: "active" | "inactive"
  createdAt: Timestamp
}
```

### 4.4 Quincena

Colección:

`workspaces/{workspaceId}/quincenas/{quincenaId}`

```json
Quincena {
  startDate: Timestamp
  endDate: Timestamp

  cerrado: boolean
  fechaCierre: Timestamp | null
  fechaReapertura: Timestamp | null
  reabiertaPor: string | null

  totalCoins: number
  totalUsd: number
  totalEuro: number
  totalGbp: number
  totalCop: number

  totalAdelantos: number
  totalCreditos: number
  diasTrabajados: number

  ultimoParcialDayId: string | null
  ultimoCorteDayId: string | null

  moneda: {
    estadisticas: {
      usd: number
      euro: number
      gbp: number
    },
    pago: {
      usd: number
      euro: number
      gbp: number
    }
  }

  createdAt: Timestamp
}
```

**Regla Fundamental:**

Si `cerrado == true`:

- No se pueden crear Days
- No se pueden crear PageWork
- No se pueden crear Parciales
- No se pueden crear Cortes
- No se pueden modificar totales
- Solo puede reabrirse por el owner
- La reapertura genera AuditLog

### 4.5 Day

Colección:

`quincenas/{quincenaId}/dias/{dayId}`

```json
Day {
  date: Timestamp

  type: "normal" | "parcial" | "corte" | "eliminado"

  totalCoins: number
  totalUsd: number
  totalEuro: number
  totalGbp: number
  totalCop: number

  totalAdelantos: number
  totalCreditos: number

  worked: boolean
}
```

### 4.6 PageWork

Colección:

`dias/{dayId}/pages/{pageWorkId}`

```json
PageWork {
  pageId: string
  pageType: "normal" | "control"
  status: "active" | "inactive"

  coins: number
  usd: number
  euro: number
  gbp: number
  cop: number

  adelantos: number

  createdBy: string
  createdAt: Timestamp
}
```

## 5. Inmutabilidad Histórica

Regla oficial:

- Si quincena está abierta → editable.
- Si quincena está cerrada → completamente inmutable.
- Reapertura debe registrar auditoría.

## 6. Operaciones Críticas (Transacción Obligatoria)

- `createPageWork`
- `updatePageWork`
- `deactivatePageWork`
- `createParcial`
- `createCorte`
- `cerrarQuincena`
- `reabrirQuincena`

## 7. Estrategia Arquitectónica (Escala Pequeña)

Dado que el sistema tendrá 1–2 workspaces inicialmente:

- CRUD simples pueden ejecutarse desde cliente.
- Parcial, Corte y Cierre deben ejecutarse vía Cloud Functions.
- Esto mantiene seguridad sin elevar costos.

## Sugerencias

1. (Sección 4.2 - AuditLog) Considerar incluir `changes` en `metadata` para registrar valores antes/después en operaciones críticas, facilitando auditorías detalladas y rollback manual si procede.
2. (Sección 4.4 - Quincena) Añadir `versionHistoria: number` para versionar cambios en estructura si el modelo evoluciona, facilitando migraciones futuras.
3. (Sección 5 - Inmutabilidad) Implementar reglas de Firestore que rechacen explícitamente writes a quincenas cerradas con error descriptivo (p. ej. `CLOSED_QUINCENA`).
4. (Sección 7 - Escala) Planificar transición a backend seguro a medida que escale (pasar todos los CRUDs a Cloud Functions cuando haya múltiples workspaces concurrentes).
5. (General) Añadir campo `deletedAt: Timestamp | null` a PageWork para marcar lógicamente eliminados, complementando `status = "inactive"` y mejorando consultas de historial.

## 13. Principios Fundamentales

- Estado centralizado
- Lógica crítica en backend
- Eliminación lógica
- Totales almacenados
- Transacciones obligatorias
- Separación estadística vs pago
- Escalable y auditable
