# Diseño Firestore — AppAgenda Mobile

**Estado:** propuesta técnica
**Versión:** 2.0
**Fecha:** 12 de octubre de 2026

---

## 1. Objetivo

Definir la estructura de Firestore para separar datos originales de resultados
calculados, reducir lecturas, soportar multiusuario, recalcular solo lo
afectado, cerrar quincenas de forma consistente y conservar historial inmutable.

**Sin Cloud Functions.** Toda la lógica vive en la app.

---

## 2. Decisiones principales

1. Cada tablero contiene páginas, quincenas, registros, tasas, aranceles y
   constantes.
2. Los créditos originales se guardan separados de QF.
3. QF es resultado materializado.
4. QAR copia el Resumen de la quincena anterior.
5. Historial conserva copia de QF cerrado con pago.
6. Las operaciones se validan en el cliente y se protegen con Firestore Rules.
7. IDs deterministas y estables.
8. Cambiar configuración no reescribe quincenas cerradas ni historial.
9. No se borran datos financieros relacionados automáticamente.
10. Bloqueos de formulario en frontend, no en DB.

---

## 3. Árbol de colecciones

```text
usuarios/{uid}
tableros/{tableroId}
  miembros/{uid}
  paginas/{paginaId}
  aranceles/config
  constantes/config
  quincenas/{quincenaId}
    creditos/{creditoId}
    prestamos/{prestamoId}
    monedas/{monedaId}
    historial/{historialId}
```

| Ruta | Responsabilidad |
|---|---|
| `usuarios/{uid}` | Perfil |
| `tableros/{tableroId}` | Datos generales y `adminId` |
| `miembros/{uid}` | Rol |
| `paginas/{paginaId}` | Configuración |
| `aranceles/config` | Aranceles |
| `constantes/config` | Interés y porcentaje |
| `quincenas/{quincenaId}` | Metadatos, QF, QAR, Resumen |
| `creditos` | RAW por página y día |
| `prestamos` | Total diario en COP |
| `monedas` | Estadísticas y pago |
| `historial` | Versiones inmutables |

**Almacenamiento de QF:** embebido en el documento de quincena. Firestore
limita a 1 MiB. Si crece demasiado, dividir en `quincenas/{quincenaId}/diasQF/{diaId}`.
El servicio de datos oculta esa decisión a la interfaz.

---

## 4. Esquemas

### 4.1 Usuario

`usuarios/{uid}`

```ts
type UsuarioDocument = {
  name: string;
  datosGoogle?: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

---

### 4.2 Tablero

`tableros/{tableroId}`

```ts
type TableroDocument = {
  name: string;
  descripcion: string;
  adminId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

---

### 4.3 Miembro

`tableros/{tableroId}/miembros/{uid}`

```ts
type MiembroDocument = {
  userId: string;
  rol: "editor" | "observador";
  addedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

El admin no vive en `miembros`; se identifica por `tablero.adminId`.

---

### 4.4 Página

`tableros/{tableroId}/paginas/{paginaId}`

```ts
type PaginaDocument = {
  name: string;
  mensual: boolean;
  coins: boolean;
  tope: boolean;
  descuentos: boolean;
  cortes: boolean;
  moneda: "USD" | "EUR" | "GBP" | "COP";
  valorCoins: number;
  valorDescuentos: number;
  valorTope: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

Sin `activa`. Se puede borrar si no hay historial que dependa de ella.

**Pendiente:** unicidad de nombre dentro del tablero.

---

### 4.5 Aranceles y constantes

`tableros/{tableroId}/aranceles/config`

```ts
type ArancelesDocument = {
  usd: number;
  euro: number;
  gbp: number;
  updatedAt: Timestamp;
  updatedBy: string;
};
```

`tableros/{tableroId}/constantes/config`

```ts
type ConstantesDocument = {
  interes: number;
  porcentaje: number;
  updatedAt: Timestamp;
  updatedBy: string;
};
```

**Sin versionado.** Si se cambian en una quincena abierta, esa quincena se
recalcula. Las quincenas cerradas e historial no se alteran.

---

### 4.6 Quincena

`tableros/{tableroId}/quincenas/{quincenaId}`

ID determinista: `year-mes-1/2` → `2026-10-1`.

```ts
type QuincenaDocument = {
  name: string;
  inicio: string;   // YYYY-MM-DD
  fin: string;      // YYYY-MM-DD
  year: string;
  cerrado: boolean;
  QAR: Resumen | null;
  QF: QF | null;
  Resumen: Resumen | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  closedAt?: Timestamp;
  closedBy?: string;
  reopenedAt?: Timestamp;
  reopenedBy?: string;
};
```

`Promedios` vive como propiedad separada de quincena para pantalla futura.

---

### 4.7 Crédito

`tableros/{tableroId}/quincenas/{quincenaId}/creditos/{creditoId}`

ID determinista: `${quincenaId}-creditos-${dia}-${paginaId}`.

```ts
type CreditoDocument = {
  name: string;     // nombre de la página
  dia: string;      // YYYY-MM-DD
  usd: number;
  euro: number;
  gbp: number;
  valorCoins: number;
  valorDescuentos: number;
  valorTope: number;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
};
```

Un registro por `name` + `dia` + quincena.

---

### 4.8 Préstamo

`tableros/{tableroId}/quincenas/{quincenaId}/prestamos/{prestamoId}`

ID determinista: `${quincenaId}-prestamos-${dia}`.

```ts
type PrestamoDocument = {
  dia: string;      // YYYY-MM-DD
  valor: number;    // COP
  descripcion?: string;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
};
```

Un registro por día.

---

### 4.9 Moneda

`tableros/{tableroId}/quincenas/{quincenaId}/monedas/{monedaId}`

IDs deterministas: `estadisticas` (`pago=false`) y `pago` (`pago=true`).

```ts
type MonedaDocument = {
  tipo: "estadisticas" | "pago";
  pago: boolean;
  usd: number;
  euro: number;
  gbp: number;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
};
```

Exactamente dos por quincena.

---

### 4.10 Historial

`tableros/{tableroId}/quincenas/{quincenaId}/historial/{historialId}`

ID determinista: `v1`, `v2`, etc.

```ts
type HistorialDocument = {
  quincenaId: string;
  name: string;
  version: number;
  QF: QF;   // copia con moneda de pago y cerrado
  motivo: "cierre" | "recierre" | "correccion";
  createdAt: Timestamp;
  createdBy: string;
};
```

Solo se crea desde quincena cerrada. Inmutable.

Si supera 1 MiB, dividir días en `historial/{historialId}/dias/{diaId}`.

---

## 5. Tipos lógicos

### QF

```ts
type QF = {
  name: string;
  dias: DiaQF[];
  totalCreditos: number;
  totalPesos: number;
  diasTrabajados: number;
  totalUsd: number;
  totalEuros: number;
  totalCoins: number;
  totalGbp: number;
  totalPrestamos: number;
};

type DiaQF = {
  name: string;
  creditos: CreditoQF[];
  totalCreditosDia: number;
  totalCreditos: number;
  totalEuros: number;
  diaEuros: number;
  totalUsd: number;
  diaUsd: number;
  totalGbp: number;
  diaGbp: number;
  totalCoins: number;
  diaCoins: number;
  totalPrestamos: number;
};

type CreditoQF = {
  name: string;
  mes?: number;
  quincena: number;
  dia: number;
  prestamos: number;
  totalCreditosDia: number;
  totalCreditos: number;
  totalEuros: number;
  diaEuros: number;
  totalUsd: number;
  diaUsd: number;
  totalGbp: number;
  diaGbp: number;
  totalCoins: number;
  diaCoins: number;
  totalPrestamos: number;
};
```

### Resumen

```ts
type Resumen = {
  paginasMensuales: Array<{
    name: string;
    totalQuincenal: number;
  }>;
  gananciasRojo: number;
  promedios: {
    promedioUsd: number;
    promedioEuros: number;
    promedioGbp: number;
    promedioCoins: number;
    promedioGanancias: number;
    promedioPrestamos: number;
    promedioCreditos: number;
  };
};
```

`totalQuincenal` en `paginasMensuales` es el acumulado mensual real que la
siguiente quincena necesita.

---

## 6. Flujo de escritura

### Registrar crédito

1. Cliente valida y calcula preview.
2. Usuario confirma.
3. Cliente persiste crédito.
4. Cliente actualiza QF.
5. Si el día no es el último, recalcula días posteriores existentes.
6. Actualiza totales de quincena.

Sin backend. Todo en transacción si cabe. Si no, por fases.

### Cierre de quincena

1. Requiere moneda de pago.
2. Marca `cerrado = true`.
3. Copia `Resumen` → `QAR` de la siguiente quincena.

### Generar historial

1. Requiere quincena cerrada.
2. Copia QF con moneda de pago.
3. Crea documento en `historial/{vN}`.

---

## 7. Lecturas recomendadas

| Pantalla | Lectura |
|---|---|
| Abrir tablero | Tablero + rol |
| Listar miembros | `miembros` |
| Listar páginas | `paginas` |
| Abrir quincena | Documento de quincena (QF, QAR, Resumen) |
| Ver créditos | `creditos` |
| Ver préstamos | `prestamos` |
| Ver tasas | `monedas/estadisticas`, `monedas/pago` |
| Ver historial | `historial` ordenado por versión |

---

## 8. Índices

- `miembros`: filtrar por rol.
- `paginas`: ordenar por name.
- `quincenas`: filtrar por year, ordenar por inicio.
- `creditos`: filtrar por dia, ordenar por name.
- `prestamos`: ordenar por dia.
- `historial`: ordenar por version.

---

## 9. Seguridad

El cliente no puede:

- asignarse rol admin;
- modificar QF, QAR, Resumen, cierre, historial;
- acceder a tableros donde no es miembro;
- editar quincena cerrada.

Firestore Rules deniegan por defecto.

Validaciones en cliente:

- membresía, rol, estado de quincena;
- datos numéricos finitos;
- fecha dentro de quincena;
- referencias válidas;
- revisión esperada;
- invariantes financieras.

---

## 10. Borrado, archivado y concurrencia

- Página con historial: se puede borrar; los datos ya están congelados en
  historial. Si se vuelve a usar, se crea de nuevo.
- Tablero con datos: no se borra normalmente.
- Quincena con historial: no se borra.
- Retirar miembro no elimina sus operaciones.
- Bloqueos de formulario en frontend.
- Reintentos usan IDs deterministas para no duplicar.

---

## 11. Riesgos

1. QF puede superar 1 MiB: medir y dividir por día.
2. Operaciones largas sin backend: diseñar por fases idempotentes.
3. Cambios de configuración en quincena abierta: recalculan esa quincena.
4. Zona horaria: el usuario elige día manualmente, se mitiga.
5. Validar fórmulas con casos de la app anterior antes de migrar.

---

## 12. Decisiones pendientes

- [ ] Medir tamaño real de QF e Historial.
- [ ] Decidir si QF se divide por día desde el inicio.
- [ ] Confirmar unicidad de nombre de página.
- [ ] Fórmulas de rojo, interés, tope, corte, parcial, descuento, aranceles,
      pago.
- [ ] Precisión y redondeo de importes.

---

## 13. Orden de implementación

1. Tipos TypeScript compartidos.
2. Firestore Rules.
3. Tablero y admin.
4. Miembros y roles.
5. Páginas, aranceles, constantes.
6. Quincenas con IDs deterministas.
7. Monedas.
8. Créditos y préstamos.
9. Motor de cálculo puro y testeable.
10. QF, QAR, Resumen.
11. Cierre, historial, reapertura.
12. Bloqueos frontend y recuperación.
13. Validar con casos de la app anterior.
14. Revisar lecturas, escrituras, tamaño y coste.

---

## 14. Relación con otros documentos

- `documentacion.md`: reglas de negocio.
- `reglas_calculo.md`: fórmulas.
- `flujo_operaciones.md`: operaciones.
- `modelo_datos.md`: entidades conceptuales.
- `diseño_firestore.md`: estructura física.
