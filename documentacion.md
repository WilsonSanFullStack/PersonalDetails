# App-Agenda — Especificaciones

> Documento de diseño progresivo.
> La versión anterior en Electron se usa solo como referencia funcional.
> La nueva aplicación se diseña desde cero.

---

# 1. Objetivo del proyecto

Generar estadísticas quincenales a partir de los registros diarios de trabajo.

El sistema transforma los datos registrados durante cada día en:

* resultados diarios;
* resultados quincenales;
* totales por página;
* totales por moneda;
* total de Coins;
* total de créditos;
* ganancias o deuda con el estudio;
* préstamos;
* días trabajados;
* promedios;
* información de continuidad entre quincenas;
* históricos inmutables.

---

# 2. Arquitectura general

## 2.1 DB

Firestore. Diseño orientado a patrones de acceso, no a un modelo relacional.

## 2.2 Server

No existe backend dedicado. La lógica vive en la app. Firestore Rules protegen
el acceso. No se usan Cloud Functions.

## 2.3 Frontend

Responsable de:

* mostrar formularios según la configuración de la página;
* evitar que el usuario registre propiedades que no corresponden;
* registrar datos;
* mostrar resultados;
* permitir generar Resúmenes;
* permitir generar Historiales;
* mostrar advertencias y confirmaciones;
* gestionar bloqueos de formulario con estado local.

---

# 3. Conceptos del negocio

## 3.1 Porcentaje

Porcentaje de las ganancias que corresponde al estudio. Forma parte de
`Constantes` del tablero.

## 3.2 Páginas

Plataformas donde el usuario trabaja. Pertenecen a un tablero. Su configuración
determina qué formulario mostrar y qué reglas aplicar.

Propiedades:

* `name`
* `mensual` (boolean)
* `coins` (boolean)
* `tope` (boolean)
* `descuentos` (boolean)
* `cortes` (boolean)
* `moneda` (string: USD, EUR, GBP, COP)
* `valorCoins` (float)
* `valorDescuentos` (float)
* `valorTope` (float)

Las propiedades booleanas activan reglas independientes. No existen tipos fijos
de página: una página puede tener todas las reglas activas, algunas o ninguna.

## 3.3 Coins

Algunas páginas muestran ganancias en Coins. La página define cuánto vale cada
Coin y en qué moneda convertirlo.

Los Coins se convierten **inmediatamente al registrar** a la moneda de la
página. `totalCoins` se conserva como valor informativo (lo que el usuario ve
en la plataforma), pero el valor monetario ya está sumado en
`totalUsd` / `totalEuros` / `totalGbp`.

Ejemplo:

```text
Página: Sender
Mensual: true
Coins: true
Moneda: EUR
ValorCoins: 0.11

Usuario registra: 100 Coins
→ 100 × 0.11 = 11 EUR
→ se suma a totalEuros
→ totalCoins conserva 100
```

## 3.4 Descuento

Algunas páginas pagan solo un porcentaje del valor mostrado. El sistema conserva
el valor bruto y el neto.

La posición exacta del descuento en el pipeline está pendiente de formalizar.

## 3.5 Tope

Algunas páginas pagan solo al alcanzar una cantidad mínima.

* Página mensual con tope: el acumulado continúa entre quincenas del mismo mes.
* Página quincenal con tope: el acumulado se reinicia por quincena.
* Al superar el tope: se paga, se reinicia el acumulado.

La fórmula exacta del valor pagable antes/después de romper el tope está
pendiente.

## 3.6 Corte

Existe cuando la página libera créditos verificados. Representa dinero
verificado y listo para pagar.

## 3.7 Parcial

Ganancias aún no verificadas.

Reglas:

1. Solo existe si no existe un corte más reciente.
2. Siempre se toma el parcial más reciente.
3. Puede existir corte y parcial simultáneamente si el parcial es posterior.
4. El parcial solo participa en estadísticas.
5. El parcial no participa en el cálculo de pago.

## 3.8 Interés

Porcentaje aplicado a la deuda con el estudio. Forma parte de `Constantes`.

Fórmula exacta pendiente.

## 3.9 Monedas

* USD, EUR, GBP, COP.
* Las monedas internacionales se registran respecto al COP.

Dos valores conceptuales:

### Estadísticas

Tasa principal de uso. Puede establecerse por debajo del valor real de mercado
para margen de seguridad. No se le aplican aranceles.

### Pago

Tasa real del estudio. Solo se usa al finalizar la quincena. Se le aplican
aranceles.

Cada quincena conserva ambas tasas.

---

# 4. Flujo general de datos

## 4.1 Registro de aranceles

Propiedades: `usd`, `euro`, `gbp`. Un registro por tablero.

## 4.2 Registro de páginas

Propiedades ya listadas en 3.2. La configuración determina el formulario.

---

# 5. Registro de monedas

Propiedades: `usd`, `euro`, `gbp`, `pago` (boolean).

* `pago = false` → estadísticas.
* `pago = true` → pago.

Exactamente dos registros por quincena.

---

# 6. Quincena

Propiedades:

* `name` (string, formato `year-mes-1/2` → `2026-10-1`)
* `inicio` (string `YYYY-MM-DD`)
* `fin` (string `YYYY-MM-DD`)
* `year` (string)
* `cerrado` (boolean)
* `QAR` (estructura `Resumen` de la quincena anterior)
* `QF` (estructura `QF`)
* `Resumen` (estructura `Resumen`)

`cerrado` determina si la quincena está abierta o cerrada.

---

# 7. Día

Un día existe conceptualmente solo cuando tiene al menos un registro de crédito.
No se crea un día vacío.

Un día con solo préstamos no cuenta como día trabajado ni genera documento de
día en QF.

---

# 8. Registro de página (créditos)

Propiedades:

* `name` (string, nombre de la página)
* `dia` (string `YYYY-MM-DD`)
* `usd` (float)
* `euro` (float)
* `gbp` (float)
* `valorCoins` (float)
* `valorDescuentos` (float)
* `valorTope` (float)

Solo un registro por `name` + `dia` dentro de una quincena. Si existe, se
actualiza.

La configuración de la página se consulta al calcular, no se copia en el
registro.

---

# 9. Páginas mensuales

Registran siempre el valor acumulado que muestra el sitio.

El sistema diferencia:

* valor mensual (RAW);
* valor quincenal (RAW actual − acumulado anterior);
* valor diario (diferencia entre acumulados consecutivos).

---

# 10. Estrategia de procesamiento

**Procesamiento al momento del registro.**

Al registrar:

1. Se obtiene la configuración de la página.
2. Se obtiene QF vigente de la quincena.
3. Se procesa el nuevo dato.
4. Se actualiza QF.
5. Se conserva lo necesario para continuidad.

Si se edita un día que no es el último, se recalcula ese día y los posteriores
existentes hasta el último.

---

# 11. Resumen

Información operacional de continuidad. Estructura:

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

Se copia al `QAR` de la siguiente quincena al cerrar.

---

# 12. Proyección

Los promedios se guardan como propiedad separada de quincena para una pantalla
dedicada en una versión posterior.

---

# 13. Historial

Copia inmutable de QF con moneda de pago y quincena cerrada.

---

# 14. Versiones del Historial

Cada generación crea una nueva versión. La anterior no se sobrescribe.

Si ya existe historial, se requiere un motivo.

---

# 15. Diferencia entre Resumen e Historial

* **Resumen:** continuidad. Lo que la siguiente quincena necesita.
* **Historial:** fotografía inmutable. No participa en cálculos normales.

---

# 16. Datos originales y resultados calculados

* **Datos originales:** lo que el usuario registra.
* **Resultados calculados:** lo que el motor produce.

La fuente de verdad son los datos originales. Los resultados son derivados.

---

# 17. Decisiones pendientes

* Fórmula exacta de rojo.
* Fórmula exacta de interés.
* Fórmula exacta de tope (valor pagable).
* Origen y transformación de corte y parcial.
* Posición exacta del descuento en el pipeline.
* Unidad y fórmula exacta de aranceles.
* Fórmula del pago final (porcentaje del estudio).
* Precisión y redondeo de importes.

---

# 18. Reglas actualmente definidas

* Las páginas pertenecen a un tablero.
* El formulario depende de la configuración de la página.
* No se solicitan datos que no correspondan a la página.
* Un día existe solo con créditos.
* Páginas mensuales registran acumulados.
* Topes mensuales continúan entre quincenas; quincenales se reinician.
* Un corte existe cuando la página libera créditos.
* El parcial solo participa en estadísticas.
* Se toma el parcial más reciente.
* Corte y parcial pueden coexistir si el parcial es posterior.
* El interés pertenece a las constantes.
* Hay dos tasas por quincena: estadísticas y pago.
* Estadísticas es la principal. Pago solo al cerrar.
* Aranceles solo se aplican a pago.
* Una quincena no se cierra sin moneda de pago.
* El Resumen mantiene continuidad.
* El Historial es copia inmutable de QF cerrado con pago.
* Cada historial nuevo crea una versión.
* Las versiones históricas no se modifican.
* El Historial no participa en cálculos normales.

---

# 19. Orden de diseño

```text
1. Reglas del negocio
2. Flujo de datos
3. Modelos / DB
4. Relaciones y estructura
5. Procesamiento y cálculos
6. Frontend
```

---

# 20. Estado actual

Documento en construcción. No es la estructura definitiva.
