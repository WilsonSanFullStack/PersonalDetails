# App Agenda — Diseño y arquitectura

> Documento de diseño de la nueva versión de App Agenda.
>
> **Estado:** En diseño
> **Implementación:** Aún no iniciada
> **Fuente funcional:** Versión anterior de App Agenda / Electron
> **Principio:** La nueva aplicación no será una migración directa del código anterior. La lógica y los modelos serán rediseñados cuando sea necesario.

---

# 1. Objetivo

Crear una nueva versión de App Agenda orientada a dispositivos móviles utilizando:

* React Native
* Expo
* TypeScript
* Firebase
* Firebase Authentication
* Cloud Firestore

La primera versión debe intentar funcionar con **coste $0**, evitando inicialmente servicios que requieran activar facturación cuando no sean necesarios, especialmente Cloud Functions.

La aplicación inicialmente será distribuida de forma privada mediante APK y no dependerá de estar publicada en Google Play Store.

---

# 2. Principio principal del rediseño

La versión anterior fue construida alrededor de una arquitectura de escritorio con SQLite, Sequelize e IPC.

La nueva versión **no debe copiar esa arquitectura**.

El código anterior se utilizará principalmente como:

* referencia funcional;
* referencia de reglas de negocio;
* referencia de cálculos existentes;
* referencia de errores conocidos;
* referencia de casos especiales.

Los modelos, relaciones y flujo de procesamiento podrán cambiar completamente si eso permite:

* reducir consultas;
* reducir procesamiento innecesario;
* simplificar la lógica;
* mejorar la consistencia;
* facilitar el funcionamiento en dispositivos móviles;
* aprovechar mejor la estructura de Firestore.

---

# 3. Principio de diseño de datos

No se debe diseñar la base de datos intentando reproducir una estructura relacional de SQL.

La pregunta principal será:

> **¿Qué información necesita una operación para funcionar y qué información normalmente se consulta junta?**

Cuando sea conveniente, se permitirá almacenar información relacionada dentro del mismo documento o resultado para evitar consultas adicionales.

Sin embargo, no se debe duplicar información indiscriminadamente.

La duplicación únicamente será aceptada cuando:

1. reduzca consultas;
2. la información sea necesaria para una operación;
3. no genere problemas importantes de consistencia;
4. exista una estrategia clara para actualizarla.

---

# 4. Separación entre datos originales y datos calculados

Una de las decisiones principales del nuevo diseño es separar:

## Datos crudos

Representan exactamente lo registrado por el usuario.

Ejemplo conceptual:

```text
RegistroPágina
```

Contendrá los valores originales del trabajo realizado.

No debería almacenar resultados derivados como:

```text
usdDia
usdQuincena
totalDia
creditos
promedios
rojo
```

---

# 5. Registro de datos crudos

Cuando el usuario registra una página:

```text
Usuario
   ↓
RegistroPágina
   ↓
Datos originales
```

El registro no debe ejecutar innecesariamente el procesamiento completo de la quincena.

La prioridad es:

> **Registrar primero. Calcular cuando corresponda.**

Esto evita ejecutar cálculos costosos cada vez que se crea o consulta información.

---

# 6. Unidad principal de procesamiento: el día

El día será una unidad importante del nuevo sistema.

El flujo conceptual será:

```text
RegistroPágina
      ↓
Registros del día
      ↓
Calcular día
      ↓
ResultadoDía
```

El sistema reunirá los registros correspondientes a un día y los procesará para obtener una representación limpia y organizada.

El resultado podrá contener la información necesaria para posteriormente construir la quincena.

---

# 7. ResultadoDía

`ResultadoDía` será un modelo/estructura de información procesada.

Su objetivo será almacenar información:

* organizada;
* limpia;
* formateada;
* lista para ser utilizada por la interfaz;
* reutilizable para cálculos posteriores.

No debe convertirse automáticamente en una copia completa de todos los datos originales.

La información deberá guardar únicamente lo necesario para representar el resultado calculado.

---

# 8. Cálculo de pesos

Una decisión importante es separar:

### Valores base

Los resultados limpios pueden almacenar valores monetarios base:

```text
USD
EUR
GBP
COP
coins
```

pero el cálculo final de pesos no necesariamente debe almacenarse duplicado para cada modalidad.

Al consultar los resultados se podrá utilizar:

```text
Estadísticas
```

o:

```text
Pago
```

para determinar las tasas correspondientes.

Conceptualmente:

```text
Resultado
    ↓
GET
    ↓
modo = estadísticas / pago
    ↓
aplicar tasas
    ↓
resultado monetario
```

Esto evita almacenar simultáneamente múltiples versiones del mismo cálculo.

---

# 9. Moneda

Las tasas tendrán dos contextos principales:

```text
Estadísticas
Pago
```

El cálculo estadístico utilizará las tasas correspondientes a estadísticas.

El cálculo de pago utilizará las tasas correspondientes al pago.

La estructura definitiva todavía está pendiente de diseño.

Se debe evitar separar innecesariamente información que normalmente se consulta junta.

---

# 10. Cálculo de una quincena

La quincena no debería recalcularse completamente cada vez que el usuario entra a verla.

El objetivo es:

```text
Registrar
   ↓
Calcular cuando corresponda
   ↓
Guardar resultado
   ↓
Consultar resultado
```

En lugar de:

```text
Consultar quincena
   ↓
Traer todos los datos
   ↓
Procesar todos los días
   ↓
Procesar páginas
   ↓
Procesar acumulados
   ↓
Procesar monedas
   ↓
Procesar topes
   ↓
Procesar parciales
   ↓
Calcular totales
   ↓
Mostrar
```

El procesamiento debe realizarse cuando realmente sea necesario.

---

# 11. Estado de cálculo del día

Un día deberá poder distinguir entre:

```text
No calculado
Calculado
Necesita recalcularse
```

Si un día ya fue calculado y el usuario solicita calcularlo nuevamente, deberá mostrarse una advertencia.

Conceptualmente:

```text
Día ya calculado
      ↓
Solicitar recalcular
      ↓
Advertencia
      ↓
Confirmar
      ↓
Recalcular día y días afectados
```

---

# 12. Propagación del recálculo

El cálculo de algunos valores depende de días anteriores.

Por ejemplo, las páginas mensuales pueden utilizar valores acumulados:

```text
Día 1 → acumulado
Día 2 → acumulado
Día 3 → acumulado
...
```

Por lo tanto, si se modifica o elimina un registro en un día anterior, los resultados posteriores pueden quedar afectados.

Ejemplo:

```text
Día 1  ✓
Día 2  ✓
Día 3  ✓
Día 4  ← cambia
Día 5  ← puede quedar afectado
Día 6  ← puede quedar afectado
...
```

El sistema deberá recalcular desde el punto afectado hacia adelante cuando la regla de negocio lo requiera.

No se debe recalcular automáticamente toda la quincena si no es necesario.

---

# 13. Eliminación de registros

Eliminar un `RegistroPágina` no debe limitarse a eliminar el dato.

Si el registro afecta un cálculo previamente realizado:

```text
Eliminar RegistroPágina
       ↓
Identificar día afectado
       ↓
Marcar resultado como afectado
       ↓
Recalcular día
       ↓
Recalcular días posteriores afectados
```

Los resultados anteriores deberán ser reemplazados por los nuevos resultados calculados.

---

# 14. Páginas mensuales

Las páginas mensuales utilizan valores acumulados.

Un ejemplo:

```text
Primera quincena:
acumulado final = 500
```

Durante la segunda quincena:

```text
Día actual = 550
```

Entonces:

```text
550 - 500 = 50
```

La interfaz puede necesitar mostrar simultáneamente:

```text
Total mensual:      550
Total quincena:      50
Total del día:       diferencia correspondiente
```

Por esta razón, el sistema necesita conservar información de continuidad entre quincenas.

---

# 15. Resumen

`Resumen` no es solamente un informe.

Su función principal será proporcionar información necesaria para continuar los cálculos de futuras quincenas.

Ejemplo:

```text
Resumen Q1
   Página mensual A → 500
   Página mensual B → 1200
   Página mensual C → 850
```

Entonces Q2 puede utilizar directamente esos valores sin reconstruir toda Q1.

Conceptualmente:

```text
Quincena 1
    ↓
Resumen
    ↓
Quincena 2
```

El modelo definitivo de `Resumen` todavía debe determinarse según los datos exactos que necesite la siguiente quincena.

---

# 16. Páginas con tope

Las páginas con tope necesitan una lógica acumulativa que atraviesa diferentes quincenas.

Ejemplo:

```text
Q1 → acumulado = 300 → sePago = false
Q2 → acumulado = 650 → sePago = false
Q3 → acumulado = 900 → sePago = false
Q4 → acumulado supera el tope
             ↓
         sePago = true
         acumulado = 0
```

La lógica deseada es:

```text
Mientras no se supere el tope:

sePago = false
acumulado = cantidad acumulada
```

Cuando se supera:

```text
sePago = true
acumulado = 0
```

El sistema debe tener en cuenta las quincenas anteriores hasta el último pago realizado.

Esto evita reiniciar incorrectamente el acumulado en cada quincena.

La implementación exacta todavía está pendiente.

---

# 17. Páginas parciales

Las páginas que utilizan parciales también necesitan conservar contexto entre días y posiblemente entre quincenas.

Concepto planteado:

```text
parcial más reciente = true
```

Cuando aparece un nuevo parcial:

```text
Parcial anterior
    ↓
masReciente = false

Nuevo parcial
    ↓
masReciente = true
```

Los cortes también deben modificar este estado cuando corresponda.

La lógica exacta de:

* parcial;
* corte;
* parcial más reciente;
* corte anterior;
* corte posterior;

todavía debe diseñarse y documentarse antes de implementar los modelos definitivos.

---

# 18. Propiedad `mostrar`

La propiedad `mostrar` existe actualmente en el resultado de las páginas y está relacionada con reglas como los topes.

En la nueva versión no debe utilizarse automáticamente como un simple:

```text
"¿Se muestra visualmente en pantalla?"
```

Debe definirse claramente si representa:

* participación en el resultado;
* estado de pago;
* cumplimiento del tope;
* visibilidad;
* o una combinación que deberá separarse.

Posiblemente sea necesario separar conceptos como:

```text
mostrar
topeAlcanzado
sePago
```

para evitar sobrecargar una sola propiedad.

---

# 19. Resultado de la quincena

Además del resultado diario, la aplicación podrá mantener un resultado procesado de la quincena.

Conceptualmente:

```text
ResultadoDía
    ↓
ResultadoQuincena
```

Este resultado puede contener:

* totales;
* promedios;
* días trabajados;
* mejores páginas;
* mejor día;
* créditos;
* rojo;
* intereses;
* estadísticas necesarias;
* información necesaria para la interfaz.

La estructura definitiva todavía debe diseñarse a partir de las reglas de negocio.

---

# 20. Historial

`Historial` representa una **fotografía inmutable** de una quincena.

No debe recalcularse automáticamente.

Cada vez que se genere un historial:

```text
Historial v1
Historial v2
Historial v3
...
```

se crea una nueva versión.

No se debe sobrescribir silenciosamente el historial anterior.

---

# 21. Generación de historial

Generar historial será una acción independiente del cierre de la quincena.

Conceptualmente:

```text
Calcular quincena
      ↓
Generar historial
      ↓
Usar moneda de PAGO
      ↓
Guardar fotografía
```

Si ya existe un historial:

```text
Generar nuevamente
      ↓
Advertencia
      ↓
Explicar cambios realizados
      ↓
Crear nueva versión
```

La nueva versión debe conservar el resultado completo correspondiente al momento en que fue generada.

---

# 22. Auditoría de cambios

Cuando se genere una nueva versión del historial se desea conservar:

### Cambio manual

Una explicación escrita por el usuario:

```text
"Cambié el valor del dólar"
```

### Cambio detectado por el sistema

Idealmente:

```text
USD:
3400 → 3500

Porcentaje:
0.8 → 0.75
```

El sistema deberá intentar detectar diferencias entre versiones cuando sea viable.

Esta funcionalidad todavía está pendiente de diseño.

---

# 23. Cierre de quincena

El cierre y la generación del historial son acciones diferentes.

### Cerrar

Define el estado de la quincena.

### Generar historial

Crea una fotografía de los resultados.

No deben tratarse como la misma operación.

---

# 24. Arquitectura conceptual

La arquitectura actual propuesta es:

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
                 ResultadoQuincena
                         │
                ┌────────┴────────┐
                ▼                 ▼
             Resumen           Historial
          continuidad          inmutable
```

Y las tasas monetarias se aplican al consultar:

```text
Resultado
    │
    ▼
   GET
    │
 ┌──┴───────────┐
 ▼              ▼
Estadísticas    Pago
```

---

# 25. Objetivo de rendimiento

La aplicación debe evitar procesamiento innecesario en el dispositivo.

El objetivo no es hacer que un algoritmo extremadamente complejo sea infinitamente rápido.

El objetivo es:

> **No ejecutar un cálculo que no sea necesario ejecutar.**

Especialmente:

* no recalcular una quincena al abrirla;
* no consultar modelos separados innecesariamente;
* no reconstruir información histórica para obtener un solo valor;
* no recalcular días que no fueron afectados;
* no calcular pesos cuando únicamente se necesitan valores base;
* no procesar nuevamente datos ya calculados sin motivo.

---

# 26. Firebase y coste inicial

La aplicación se diseñará inicialmente intentando mantenerse dentro de los servicios y cuotas gratuitas de Firebase.

Inicialmente se prioriza:

```text
Firebase Authentication
Cloud Firestore
```

Cloud Functions no será un requisito inicial de la arquitectura.

La lógica de cálculo debe diseñarse de manera independiente para que, si en el futuro se necesita procesamiento en servidor, el motor pueda trasladarse o reutilizarse.

---

# 27. Motor de cálculo

El motor de cálculo debe diseñarse independientemente de React Native y de Firebase.

Conceptualmente:

```text
Motor de cálculo
├── calcularPágina()
├── calcularDía()
├── calcularMensual()
├── calcularTope()
├── calcularParcial()
├── calcularTotales()
├── calcularQuincena()
└── ...
```

Estos nombres son provisionales.

La implementación definitiva debe surgir después de documentar las reglas de negocio.

---

# 28. Información que NO debe decidirse todavía

Todavía no deben cerrarse definitivamente:

* estructura final de `Dia`;
* estructura final de `RegistroPágina`;
* estructura final de `ResultadoDía`;
* estructura final de `ResultadoQuincena`;
* estructura final de `Resumen`;
* estructura final de `Historial`;
* estructura definitiva de `Moneda`;
* estructura definitiva de `Aranceles`;
* ubicación exacta de días y registros en Firestore;
* qué información debe duplicarse;
* reglas completas de topes;
* reglas completas de parciales;
* reglas completas de cortes;
* relación entre `mostrar`, `sePago` y `topeAlcanzado`;
* estrategia definitiva de invalidación;
* estrategia definitiva de recálculo.

Estas decisiones deberán tomarse después de terminar de documentar el comportamiento del sistema.

---

# 29. Regla fundamental para el nuevo diseño

La nueva aplicación no debe preguntarse:

> "¿Cómo adapto el código viejo?"

Debe preguntarse:

> **"¿Cuál es la información mínima y correcta que necesito guardar para poder producir el resultado que necesita la aplicación?"**

El código antiguo ya demostró que es posible obtener los resultados, pero también muestra que muchas responsabilidades terminaron mezcladas.

Por ejemplo, el resultado actual contiene simultáneamente datos de páginas, acumulados, `mostrar`, información de préstamos, valores diarios y totales dentro de cada día.

La nueva versión buscará separar responsabilidades y, al mismo tiempo, **agrupar físicamente la información que normalmente se necesita consultar junta**.

---

# 30. Próximo paso

Antes de crear los modelos definitivos:

1. Documentar todos los tipos de página.
2. Documentar qué significa exactamente cada campo de una página.
3. Documentar el registro crudo.
4. Definir qué ocurre al calcular un día.
5. Definir qué información produce `ResultadoDía`.
6. Definir las dependencias entre días.
7. Definir topes.
8. Definir parciales.
9. Definir cortes.
10. Definir páginas mensuales.
11. Definir continuidad mediante `Resumen`.
12. Definir cálculo de pesos.
13. Definir cierre.
14. Definir historial.
15. Finalmente diseñar Firestore.

**Los modelos serán el resultado de estas reglas, no el punto de partida.**
