# App Agenda — Diseño y arquitectura

> Documento técnico de la nueva versión.
> **Estado:** En diseño
> **Implementación:** No iniciada
> **Principio:** No es una migración del código anterior.

---

# 1. Objetivo

Nueva versión de App Agenda para móviles con:

* React Native
* Expo
* TypeScript
* Firebase
* Firebase Authentication
* Cloud Firestore

Coste operativo objetivo: **$0**. Sin Cloud Functions.

Distribución privada mediante APK.

---

# 2. Principio de rediseño

No copiar la arquitectura Electron/SQLite/Sequelize/IPC. El código anterior es
referencia funcional.

---

# 3. Principio de diseño de datos

No reproducir un modelo relacional. Preguntar:

> ¿Qué información necesita una operación y qué se consulta junta?

La duplicación controlada se acepta cuando reduce lecturas, es necesaria, no
genera inconsistencias y tiene estrategia de actualización.

---

# 4. Separación de datos

* **Crudos:** lo registrado por el usuario.
* **Calculados:** lo que produce el motor.

No se guardan resultados derivados dentro del registro crudo.

---

# 5. Registro de datos crudos

Registrar primero. Calcular al registrar, no al consultar.

---

# 6. Unidad de procesamiento: el día

```text
RegistroPágina
      ↓
Registros del día
      ↓
Calcular día
      ↓
ResultadoDía
```

---

# 7. ResultadoDía

Información organizada, limpia, lista para la interfaz.

---

# 8. Cálculo de pesos

Los valores base (USD, EUR, GBP, Coins) se guardan en QF. La conversión a COP
se aplica según el modo (estadísticas / pago). Estadísticas es el modo
principal. Pago solo al cerrar.

---

# 9. Moneda

Dos contextos: estadísticas y pago. Aranceles solo a pago.

---

# 10. Cálculo de una quincena

QF se calcula al registrar créditos. No se recalcula al abrir la quincena.

Al editar un día que no es el último, se recalcula ese día y los posteriores
existentes hasta el último.

---

# 11. Estado de cálculo del día

```text
No calculado
Calculado
Necesita recalcularse
```

---

# 12. Propagación del recálculo

Solo el tramo afectado. Ejemplo: editar día 4 de 12 → recalcular 4..12.

---

# 13. Eliminación de registros

Eliminar un crédito recalcula el tramo afectado. No se limita a borrar.

---

# 14. Páginas mensuales

Acumulados. Diferencia entre quincenas.

---

# 15. Resumen

Continuidad. Se copia al QAR de la siguiente al cerrar.

---

# 16. Páginas con tope

Lógica acumulativa entre quincenas hasta el pago.

---

# 17. Páginas parciales

Estado entre días y quincenas. Reglas pendientes de formalizar.

---

# 18. Propiedad `mostrar`

No se usa. Se sustituye por conceptos separados: `topeAlcanzado`, `sePago`,
visibilidad.

---

# 19. Resultado de la quincena

QF con totales, promedios, días trabajados, etc.

---

# 20. Historial

Copia inmutable de QF cerrado con pago. Versionado.

---

# 21. Generación de historial

Acción independiente del cierre. Requiere quincena cerrada.

---

# 22. Auditoría de cambios

Cambio manual (texto del usuario) + cambio detectado por el sistema cuando sea
viable. Pendiente de diseño.

---

# 23. Cierre de quincena

Cerrar ≠ generar historial. El cierre requiere moneda de pago.

---

# 24. Arquitectura conceptual

```text
                    DATOS CRUDOS
                         │
                         ▼
                  RegistroPágina
                         │
                         ▼
                  CALCULAR DÍA
                         │
                         ▼
                   ResultadoDía
                         │
                         ▼
                 ResultadoQuincena (QF)
                         │
                ┌────────┴────────┐
                ▼                 ▼
             Resumen           Historial
          continuidad          inmutable
```

---

# 25. Objetivo de rendimiento

No ejecutar cálculos innecesarios.

---

# 26. Firebase y coste cero

Solo Authentication y Firestore. Sin Cloud Functions.

---

# 27. Motor de cálculo

Independiente de React Native y Firebase. TypeScript puro.

Funciones conceptuales:

```text
calcularPágina()
calcularDía()
calcularMensual()
calcularTope()
calcularParcial()
calcularTotales()
calcularQuincena()
```

---

# 28. Decisiones no cerradas

* Fórmulas exactas de rojo, interés, tope, corte, parcial, descuento, aranceles,
  pago.
* Precisión y redondeo.

---

# 29. Regla fundamental

> ¿Cuál es la información mínima y correcta que necesito guardar para producir
> el resultado que necesita la aplicación?

---

# 30. Próximo paso

Documentar fórmulas pendientes. Después, implementar.
