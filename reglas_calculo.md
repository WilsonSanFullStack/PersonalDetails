# Reglas de Cálculo

## 1. Propósito

Definir cómo se transforma RAW en resultados calculados.

---

## 2. Principios

### 2.1 RAW como fuente de verdad

El RAW es lo que el usuario registra. No se reemplaza por el resultado.

### 2.2 Resultado calculado

Derivado de RAW + configuración + continuidad.

### 2.3 QF

Representación materializada. Se calcula al registrar créditos. No se
recalcula al consultar.

### 2.4 Resumen

Continuidad entre quincenas.

### 2.5 Historial

Copia inmutable de QF cerrado con pago.

---

## 3. Arquitectura de reglas

Una página se procesa mediante reglas independientes activadas por booleanos.

El motor pregunta: "¿Qué reglas están activas?" No pregunta: "¿Qué tipo de
página es?"

---

## 4. Motor de procesamiento

```text
processPage
├── if mensual → processMensual()
├── if coins → processCoins()
├── processMoneda()
├── if tope → processTope()
├── if descuento → applyDescuento()
├── if corte → processCorte()
├── processParcial()
├── processRojo()
├── processInteres()
├── processAranceles()  // solo pago
├── processPagoEstadisticas()
├── processDiasTrabajados()
└── processTotales()
```

---

## 5. Orden general

1. Mensual
2. Coins
3. Moneda
4. Tope
5. Descuento
6. Corte
7. Parcial
8. Rojo
9. Interés
10. Aranceles (solo pago)
11. Pago / Estadísticas
12. Días trabajados
13. Totales
14. Resumen
15. Historial

Orden de referencia hasta que una regla posterior exija otra dependencia.

---

## 6. Regla Mensual

`mensual = true` → acumula durante el mes.

```text
valorQuincena = acumuladoActual - acumuladoAnterior
valorDia = acumuladoActual - acumuladoDiaAnterior
```

Acumulado se reinicia al cambiar de mes.

---

## 7. Regla Coins

`coins = true` → RAW en coins.

`valorCoins` convierte a la moneda de la página.

Los coins se convierten **inmediatamente al registrar** y se suman a la moneda
correspondiente. `totalCoins` se conserva como valor informativo.

Si `mensual = true` y `coins = true`, los coins se acumulan durante el mes.

---

## 8. Regla Moneda

Moneda de la página: USD, EUR, GBP, COP.

```text
coins → valorCoins → moneda de la página → COP
```

### 8.1 Tasas

* `pago = false`: estadísticas (principal).
* `pago = true`: pago (solo al cerrar).

Aranceles solo a pago.

### 8.2 Histórico

La tasa usada en una quincena histórica se conserva en el historial.

---

## 9. Regla Tope

`tope = true` → `valorTope` como límite.

Se mide en la moneda de la página.

### 9.1 Estado

Mientras `acumulado < valorTope`, se muestra acumulado y restante.

Cuando `acumulado >= valorTope`, tope alcanzado.

### 9.2 Reinicio

* Mensual: al fin del mes.
* Quincenal: al fin de la quincena.

### 9.3 Exceso

El excedente puede ser pagable. Fórmula pendiente.

---

## 10. Regla Descuento

`descuento = true` → `valorDescuento` como porcentaje.

Posición exacta en el pipeline pendiente.

---

## 11. Regla Corte

`corte = true` → dinero verificado y listo para pagar. Puede haber varios.

---

## 12. Regla Parcial

Dinero generado, no verificado.

Restricciones:

1. No existe si hay un corte más reciente.
2. No más de un parcial activo.
3. Corte y parcial pueden coexistir si el parcial es posterior.
4. Puede haber varios cortes.

Pendiente: origen, transformación, efecto en total/tope/continuidad.

---

## 13. Regla Rojo

Deuda con el estudio. Fórmula pendiente.

Puede continuar a la siguiente quincena vía Resumen.

---

## 14. Regla Interés

Porcentaje sobre rojo. Configurable en Constantes.

Pendiente: base exacta, si es compuesto, cuándo se genera, cómo se paga.

---

## 15. Regla Aranceles

Deducciones asociadas a monedas. Solo se aplican a pago.

```text
tasaPago - arancel = tasaNetaPago
```

Unidad y fórmula pendientes.

---

## 16. Pago y Estadísticas

* Estadísticas: tasas estimadas. Principal.
* Pago: tasas reales + aranceles. Solo al cerrar.

---

## 17. Días trabajados

Un día cuenta si tiene al menos un crédito. Un préstamo solo no cuenta.

Si un día ya fue contado, no se vuelve a contar al añadir más créditos.

---

## 18. Totales

Se calculan después de procesar los registros.

---

## 19. Resumen

Se genera al cerrar. Contiene lo necesario para la siguiente.

---

## 20. Historial

Copia inmutable de QF cerrado con pago.

---

## 21. Operación Registrar Día

Flujo ya documentado en `flujo_operaciones.md`.

---

## 22. Validación de Registro

1. Quincena existe.
2. Día pertenece a la quincena.
3. Página existe.
4. Usuario tiene permisos.
5. Si existe registro para esa página/día, se compara RAW.

```text
nuevo RAW < RAW anterior → inválido
nuevo RAW > RAW anterior → UPDATE
```

---

## 23. Vista previa

Antes de persistir. El usuario confirma o cancela.

---

## 24. Confirmación

Persiste RAW, actualiza QF, recalcula tramo afectado.

---

## 25. Edición y propagación

Solo tramo afectado.

---

## 26. Eliminación

Operación de negocio. Recalcula.

---

## 27. Quincena cerrada

Solo lectura. Para modificar, reabrir.

---

## 28. Dependencia entre quincenas

Q1 → Resumen Q1 → Q2 → Resumen Q2 → Q3.

Un cambio en Q1 puede propagarse si afecta continuidad.

---

## 29. QF como modelo de lectura

La interfaz lee QF directamente. El motor se ejecuta al registrar, editar,
eliminar, recalcular, cerrar, reabrir.

---

## 30. Separación de responsabilidades

```text
Página = configuración
Crédito = RAW
Motor = reglas
QF = resultado materializado
Resumen = continuidad
Historial = fotografía inmutable
```

---

## 31. Inmutabilidad histórica

Cambios futuros no alteran resultados pasados.

---

## 32. No recalcular el pasado innecesariamente

La configuración actual afecta cálculos nuevos. El historial conserva el
contexto anterior.

---

## 33. Estados de una operación

```text
INICIADA → VALIDANDO → CALCULANDO → PREVIEW → CONFIRMACIÓN
→ PERSISTIENDO → COMPLETADA
```

Puede terminar en `CANCELADA` o `RECHAZADA`.

---

## 34. Concurrencia y bloqueos

Bloqueos de formulario en frontend con estado. No se persisten. Expiran al
confirmar, cancelar o cerrar la pantalla.

---

## 35. Fórmulas pendientes

* Rojo
* Interés
* Corte
* Parcial
* Descuento
* Aranceles
* Tope
* Pago / Estadísticas

---

## 36. Regla principal

```text
RAW → Mensual → Coins → Moneda → Tope → Descuento → Corte → Parcial
→ Rojo → Interés → Aranceles → Pago/Estadísticas → Días trabajados
→ Totales → Resumen → Historial
```

Secuencia de referencia hasta cerrar fórmulas pendientes.
