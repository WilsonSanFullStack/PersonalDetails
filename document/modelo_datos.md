# Modelo de Datos — AppAgenda Mobile

**Estado:** especificación conceptual
**Plataforma:** React Native + Expo + TypeScript + Firebase/Firestore

---

## 1. Objetivo

Definir entidades, propiedades, relaciones y restricciones antes del diseño
físico de Firestore.

---

## 2. Principios

1. Los datos crudos son la fuente de verdad.
2. Cada página pertenece a un tablero.
3. El registro de crédito guarda el valor crudo y el nombre de la página.
4. QF es una representación materializada.
5. Resumen es continuidad.
6. QAR es el Resumen de la quincena anterior.
7. Historial es copia inmutable de QF cerrado con pago.
8. Los permisos dependen del tablero.
9. El motor procesa reglas modulares activadas por booleanos.
10. No se inventan fórmulas.

---

## 3. Jerarquía

```text
Usuario
└── Tableros
    ├── Miembros
    ├── Páginas
    ├── Aranceles
    ├── Constantes
    ├── Quincenas
    │   ├── Monedas
    │   ├── Créditos
    │   ├── Préstamos
    │   ├── QAR
    │   ├── QF
    │   ├── Resumen
    │   └── Historial
```

---

## 4. Entidades

### 4.1 Usuario

| Propiedad | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre |
| `datosGoogle` | objeto | Datos del proveedor |

---

### 4.2 Tablero

| Propiedad | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre |
| `descripcion` | string | Descripción |
| `miembros` | subcolección | `{ userId, rol }` |

El creador es el `adminId` (único admin).

---

### 4.3 Página

| Propiedad | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre |
| `mensual` | boolean | Regla mensual |
| `coins` | boolean | Regla de coins |
| `tope` | boolean | Regla de tope |
| `descuentos` | boolean | Regla de descuento |
| `cortes` | boolean | Regla de cortes/parciales |
| `moneda` | string | USD/EUR/GBP/COP |
| `valorCoins` | float | Valor de un coin |
| `valorDescuentos` | float | Porcentaje de descuento |
| `valorTope` | float | Valor del tope |

Sin `activa`. Se puede borrar si no hay historial; si hay historial, los datos
ya están congelados en él.

---

### 4.4 Aranceles (por tablero)

| Propiedad | Tipo |
|---|---|
| `usd` | float |
| `euro` | float |
| `gbp` | float |

---

### 4.5 Constantes (por tablero)

| Propiedad | Tipo | Descripción |
|---|---|---|
| `interes` | float | Interés sobre rojo |
| `porcentaje` | float | Porcentaje del estudio |

---

### 4.6 Quincena

| Propiedad | Tipo | Descripción |
|---|---|---|
| `name` | string | `year-mes-1/2` → `2026-10-1` |
| `inicio` | string | `YYYY-MM-DD` |
| `fin` | string | `YYYY-MM-DD` |
| `year` | string | Año |
| `cerrado` | boolean | Estado |
| `QAR` | Resumen | Copia del Resumen anterior |
| `QF` | QF | Resultado materializado |
| `Resumen` | Resumen | Continuidad propia |

#### QF

```text
Name string
Dias [{
  Name string
  Creditos [{
    // información de créditos
    Mes float           // solo páginas mensuales
    Quincena float
    Dia float
    Prestamos float     // COP
    TotalCreditosDia float  // suma usd+euros+gbp del día
    TotalCreditos float     // suma usd+euros+gbp de la quincena hasta ese día
    TotalEuros float        // euros acumulados en la quincena hasta ese día
    DiaEuros float          // euros del día
    TotalUsd float          // usd acumulados en la quincena hasta ese día
    DiaUsd float            // usd del día
    TotalGbp float          // gbp acumulados en la quincena hasta ese día
    DiaGbp float            // gbp del día
    TotalCoins float        // coins acumulados en la quincena hasta ese día
    DiaCoins float          // coins del día
    TotalPrestamos float    // prestamos acumulados en la quincena hasta ese día
  }]
}]
TotalCreditos float    // suma usd+euros+gbp de la quincena
TotalPesos float       // suma de conversiones a COP
DiasTrabajados number  // días con créditos
TotalUsd float
TotalEuros float
TotalCoins float       // informativo
TotalGbp float
TotalPrestamos float
```

#### Resumen

```text
PaginasMensuales [{
  Name string
  Totalquincenal float
}]
Ganancias/Rojo float
Promedios {
  promedioUsd float
  promedioEuros float
  promedioGbp float
  promedioCoins float
  promedioGanancias float
  promedioPrestamos float
  promedioCreditos float
}
```

`Totalquincenal` en `PaginasMensuales` es el acumulado mensual real que la
siguiente quincena necesita para continuar.

---

### 4.7 QAR

Misma estructura que `Resumen`. Se copia al cerrar la quincena anterior.

---

### 4.8 Moneda

| Propiedad | Tipo | Descripción |
|---|---|---|
| `usd` | float | valor USD en COP |
| `euro` | float | valor EUR en COP |
| `gbp` | float | valor GBP en COP |
| `pago` | boolean | `true` pago, `false` estadísticas |

Exactamente dos por quincena.

---

### 4.9 Crédito (registro de página)

| Propiedad | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre de la página |
| `dia` | string | `DD` |
| `usd` | float | |
| `euro` | float | |
| `gbp` | float | |
| `valorCoins` | float | |
| `valorDescuentos` | float | |
| `valorTope` | float | |

Único por `name` + `dia` + quincena.

`name` se incluye para evitar lecturas adicionales al calcular.

---

### 4.10 Préstamo

| Propiedad | Tipo | Descripción |
|---|---|---|
| `valor` | float | Total del día en COP |
| `descripcion` | string | |
| `dia` | string | `DD` |

Único por día en la quincena.

---

### 4.11 Historial

| Propiedad | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre de la quincena |
| `QF` | QF | Copia con moneda de pago y cerrado |

Versionado en subcolección.

---

## 5. Relaciones

| Relación | Cardinalidad |
|---|---|
| Usuario → Tablero | 1 a N |
| Usuario ↔ Tablero | N a M con rol |
| Tablero → Página | 1 a N |
| Tablero → Aranceles | 1 a 1 |
| Tablero → Constantes | 1 a 1 |
| Tablero → Quincena | 1 a N |
| Quincena → Moneda | 1 a 2 |
| Quincena → Crédito | 1 a N |
| Quincena → Préstamo | 1 a N |
| Quincena → QF | 1 a 1 |
| Quincena → Resumen | 1 a 1 |
| Quincena → QAR | 1 a 1 |
| Quincena → Historial | 1 a N |

---

## 6. Roles

| Operación | Observador | Editor | Admin |
|---|---:|---:|---:|
| Consultar | Sí | Sí | Sí |
| Registrar/editar/eliminar | No | Sí | Sí |
| Gestionar miembros | No | No | Sí |
| Editar tablero | No | No | Sí |
| Generar nueva versión de historial | No | No | Sí |

---

## 7. Operaciones principales

Ya listadas en `flujo_operaciones.md`.

---

## 8. Restricciones

1. Un crédito por `name` + `dia` + quincena.
2. Un préstamo por `dia` + quincena.
3. Dos monedas por quincena.
4. Un arancel por tablero.
5. Una constante por tablero.
6. Quincena cerrada no se modifica sin reabrir.
7. Quincena solo cierra con moneda de pago.
8. Historial solo desde quincena cerrada.
9. Día trabajado solo con créditos.
10. Recalcular en orden al modificar acumulados.

---

## 9. Consultas necesarias

* Tableros de un usuario.
* Tablero y miembros.
* Páginas de un tablero.
* Configuración de una página.
* Quincenas por año.
* Dos monedas de una quincena.
* Aranceles y constantes.
* Créditos de una quincena/día.
* Préstamos de una quincena/día.
* QF de una quincena.
* Resumen y QAR.
* Historial.

---

## 10. Datos crudos, calculados y congelados

| Tipo | Contenido | ¿Se recalcula? |
|---|---|---|
| Página | Configuración | Se consulta al recalcular |
| Crédito | RAW | No |
| Moneda | Tasas | Editable según estado |
| Préstamo | Total diario | Provoca recálculo |
| QF | Resultado | Se actualiza ante cambios |
| Resumen | Continuidad | Se regenera al cerrar |
| QAR | Copia del anterior | Se actualiza al cerrar anterior |
| Historial.QF | Copia cerrada | No |

---

## 11. Pendientes

1. Fórmula de rojo.
2. Fórmula de interés.
3. Fórmula de tope.
4. Origen de corte/parcial.
5. Posición del descuento.
6. Unidad y fórmula de aranceles.
7. Fórmula de pago final.
8. Precisión y redondeo.
9. Tratamiento de promedios si `diasTrabajados = 0`.

---

## 12. Siguiente paso

Diseño físico de Firestore (`diseño_firestore.md`).
