# REGLAS DE CÁLCULO

## 1. Propósito

Este documento define las reglas funcionales y el flujo mediante el cual AppAgenda Mobile transforma los datos RAW registrados por el usuario en resultados calculados.

El objetivo es separar claramente:

- lo que el usuario registra;
- las reglas que determinan cómo se procesa;
- los resultados calculados;
- la continuidad necesaria para cálculos futuros;
- la representación optimizada de una quincena;
- y el historial inmutable.

Este documento define la lógica de cálculo antes de establecer definitivamente el modelo de base de datos.

---

# 2. Principios fundamentales

## 2.1 RAW como fuente de verdad

El valor RAW representa exactamente el dato que el usuario registra u observa.

Ejemplo:

```text
Página X
Quincena 2
Día 2
RAW = 213
```

El RAW no representa directamente la ganancia del día. Es el valor de entrada a partir del cual se obtienen los valores calculados.

Los resultados calculados no reemplazan al RAW.

---

## 2.2 Resultado calculado

A partir del RAW se obtienen valores como:

- acumulado mensual;
- acumulado de quincena;
- valor correspondiente al día;
- monedas;
- descuentos;
- topes;
- cortes;
- parciales;
- créditos;
- rojo;
- interés;
- totales;
- estadísticas;
- pago.

La aplicación debe conservar suficiente información para poder reconstruir los resultados cuando sea necesario.

---

## 2.3 Resultado formateado

La aplicación utilizará una representación calculada de la quincena denominada:

`QuincenaFormateada`

Su finalidad es evitar ejecutar todo el motor de cálculo cada vez que se consulta una quincena.

Por lo tanto:

```text
RAW
 ↓
Motor de cálculo
 ↓
Resultado calculado
 ↓
QuincenaFormateada
```

La `QuincenaFormateada` funciona como una representación materializada/read model de la quincena.

---

## 2.4 Resumen

`Resumen` representa la continuidad necesaria entre quincenas.

No es una fotografía histórica completa.

Su función es transportar hacia la siguiente quincena los valores necesarios para continuar los cálculos.

Entre ellos pueden encontrarse:

- acumulado mensual de cada página;
- acumulación de monedas;
- estado del tope;
- rojo;
- interés asociado;
- créditos;
- otros valores necesarios para la continuidad.

El contenido definitivo de `Resumen` se cerrará después de definir todas las fórmulas.

---

## 2.5 Historial

`Historial` es una fotografía inmutable de una quincena calculada.

Debe conservar los valores y configuración que existían cuando se generó.

Una modificación posterior de:

- una página;
- moneda;
- valor de moneda;
- descuento;
- tope;
- reglas;
- u otra configuración;

no debe modificar un historial existente.

Por lo tanto:

```text
Configuración actual
       ↓
   puede cambiar
       ↓
Historial anterior
       ↓
   NO cambia
```

---

# 3. Arquitectura general de las reglas

Las páginas no se clasifican en tipos fijos.

Una página se procesa mediante un conjunto de reglas independientes.

Cada regla se activa mediante una propiedad booleana y puede tener sus propios parámetros.

Ejemplo:

```text
Página X
├── mensual = true
├── coins = true
├── descuento = true
├── tope = false
└── corte = false
```

El motor no debe preguntar:

```text
"¿Qué tipo de página es?"
```

Debe preguntar:

```text
"¿Qué reglas están activas para esta página?"
```

---

# 4. Motor de procesamiento de una página

Conceptualmente:

```text
processPage
│
├── if mensual
│      └── processMensual()
│
├── if coins
│      └── processCoins()
│
├── processMoneda()
│
├── if tope
│      └── processTope()
│
├── if descuento
│      └── applyDescuento()
│
├── if corte
│      └── processCorte()
│
├── processParcial()
│
├── processRojo()
│
├── processInteres()
│
├── processAranceles()
│
├── processPagoEstadisticas()
│
├── processDiasTrabajados()
│
└── processTotales()
```

El orden anterior representa actualmente el orden de evaluación/organización definido para el sistema.

Las fórmulas exactas de algunas etapas todavía están pendientes.

---

# 5. Orden general de evaluación

El orden definido actualmente es:

1. Mensual
2. Coins
3. Moneda
4. Tope
5. Descuento
6. Corte
7. Parcial
8. Rojo
9. Interés
10. Aranceles
11. Pago / Estadísticas
12. Días trabajados
13. Totales
14. Resumen
15. Historial

Este orden debe mantenerse como referencia hasta que alguna regla posterior demuestre que una etapa necesita otra dependencia.

---

# 6. Regla Mensual

Una página con:

```text
mensual = true
```

acumula sus valores durante el mes.

La quincena actual necesita conocer el valor acumulado proveniente de la quincena anterior.

## 6.1 Primera quincena

Si no existe un valor anterior para la página:

```text
valorAnterior = 0
```

Por lo tanto, el RAW actual funciona como primer acumulado.

---

## 6.2 Segunda quincena

Para una página mensual:

```text
acumuladoActual = RAW actual
acumuladoAnterior = último acumulado válido de la quincena anterior

valorQuincena = acumuladoActual - acumuladoAnterior
```

El valor diario también se obtiene mediante diferencia entre acumulados.

---

## 6.3 Ejemplo

### Quincena 1

Día 1:

```text
RAW = 50
Mensual = 50
Quincena = 50
Día = 50
```

Día 2:

```text
RAW = 85
Mensual = 85
Quincena = 85
Día = 35
```

### Quincena 2

La quincena anterior terminó en:

```text
85
```

Día 1:

```text
RAW = 135
Mensual = 135
Quincena = 50
Día = 50
```

Día 2:

```text
RAW = 213
Mensual = 213
Quincena = 128
Día = 78
```

La diferencia diaria de la segunda quincena es:

```text
213 - 135 = 78
```

---

## 6.4 Cambio de mes

El acumulado mensual se reinicia al comenzar un nuevo mes.

Por lo tanto, la continuidad mensual no debe cruzar el límite del mes.

---

## 6.5 Edición de valores mensuales

Si un RAW anterior cambia, los resultados posteriores que dependan de ese valor deben recalcularse.

Ejemplo:

Antes:

```text
Q2 D1 = 135
Q2 D2 = 213
```

Si D1 cambia:

```text
135 → 140
```

Entonces:

```text
D1:
Mensual = 140
Quincena = 55
Día = 55

D2:
Mensual = 213
Quincena = 128
Día = 73
```

El segundo día cambia porque depende del acumulado anterior.

---

# 7. Regla Coins

Una página con:

```text
coins = true
```

utiliza monedas como unidad RAW.

El parámetro:

```text
valorCoins
```

determina el valor de una moneda en la moneda de pago de la página.

## 7.1 Cambio del valor de la moneda

`valorCoins` puede cambiar con el tiempo.

Los resultados históricos no deben cambiar por una modificación posterior del valor.

Por esta razón, el valor utilizado en un cálculo histórico debe quedar congelado dentro del resultado histórico correspondiente.

---

## 7.2 Coins + mensual

Si una página utiliza monedas y además es mensual:

```text
mensual = true
coins = true
```

las monedas se acumulan durante el mes.

Al finalizar el mes:

```text
acumulación mensual → reinicio
```

---

# 8. Regla Moneda

Cada página tiene una moneda de pago.

Las monedas actualmente contempladas son:

- USD
- EUR
- GBP

Cuando la página trabaja con coins:

```text
coins
 ↓
valorCoins
 ↓
moneda de la página
 ↓
COP
```

---

## 8.1 Tasas

Las tasas de conversión pueden cambiar durante una quincena.

La aplicación distingue entre:

### Pago

```text
pago = true
```

Representa las tasas utilizadas para el pago real.

### Estadísticas

```text
pago = false
```

Representa una tasa estimada utilizada para estadísticas.

El usuario puede establecer una tasa estadística diferente de la tasa real de pago.

---

## 8.2 Histórico

Una tasa utilizada para calcular una quincena histórica debe conservarse.

Una modificación posterior de la tasa no debe alterar la quincena histórica.

---

# 9. Regla Tope

Una página con:

```text
tope = true
```

utiliza:

```text
valorTope
```

como límite de acumulación.

El tope se mide en la moneda correspondiente a la página, no directamente en COP.

---

## 9.1 Estado del tope

Mientras el acumulado no alcance el tope:

```text
acumulado < valorTope
```

la aplicación debe poder mostrar:

```text
valor acumulado
valor restante para alcanzar el tope
```

Cuando:

```text
acumulado >= valorTope
```

el tope queda alcanzado para el período correspondiente.

---

## 9.2 Reinicio

El comportamiento depende del período de la página.

Página mensual:

```text
fin del mes → reinicio
```

Página quincenal:

```text
fin de la quincena → reinicio
```

---

## 9.3 Exceso del tope

Cuando se supera el tope, el excedente del período puede pasar a ser pagable según las reglas de pago.

La fórmula definitiva para determinar el valor pagable después de romper el tope queda pendiente de formalización.

---

# 10. Regla Descuento

Una página con:

```text
descuento = true
```

utiliza:

```text
valorDescuento
```

como porcentaje.

El descuento representa una deducción/porcentaje asociado a la plataforma.

Debe conservarse el valor utilizado para el cálculo histórico.

---

## 10.1 Orden del descuento

Todavía queda pendiente establecer formalmente si el descuento se aplica:

```text
antes de conversión
```

o:

```text
después de conversión
```

Aunque matemáticamente pueda producir el mismo resultado en determinadas operaciones, el sistema debe establecer una única posición oficial para evitar diferencias en casos futuros.

---

# 11. Regla Corte

Una página con:

```text
corte = true
```

puede manejar dinero que ya fue verificado.

Un `corte` representa dinero:

```text
ya verificado
+
listo para ser pagado
```

Puede existir más de un corte durante la vida de una página.

---

# 12. Regla Parcial

Un `parcial` representa dinero:

```text
ya generado
+
todavía no verificado
```

Actualmente se establecen estas restricciones:

1. No puede existir un parcial si existe un corte más reciente que dicho parcial.
2. No puede existir más de un parcial activo.
3. Un día puede contener un corte y un parcial únicamente si el parcial es más reciente que el corte.
4. Puede existir cualquier cantidad de cortes, siempre que correspondan a operaciones válidas.

---

## 12.1 Pendientes

Todavía debe definirse formalmente:

- si corte/parcial son valores introducidos manualmente o derivados;
- cómo se transforman;
- cómo pasan de parcial a corte;
- cómo afectan el total;
- cómo afectan el tope;
- cómo se trasladan entre quincenas.

---

# 13. Regla Rojo

`Rojo` representa una deuda o saldo pendiente con el estudio al finalizar una quincena.

Ejemplo conceptual:

```text
ganancia
-
obligaciones
=
resultado

si resultado < 0
    → rojo
```

La fórmula definitiva todavía debe establecerse.

El rojo puede continuar hacia la siguiente quincena mediante `Resumen`.

---

# 14. Regla Interés

El interés representa el porcentaje aplicado al rojo/deuda.

El sistema debe conservar:

- porcentaje aplicado;
- valor base;
- momento en que se calcula;
- resultado generado.

El comportamiento histórico del proyecto utilizó un interés del 5%, pero la nueva especificación debe convertir este valor en una configuración formal y no depender de un número escrito directamente en el código.

Pendiente definir:

- base exacta del interés;
- si se calcula sobre rojo anterior;
- si existe interés compuesto;
- cuándo se genera;
- cómo se paga;
- cómo afecta al siguiente resumen.

---

# 15. Regla Aranceles

Los aranceles representan deducciones asociadas a las monedas.

Actualmente se contemplan:

```text
USD
EUR
GBP
```

Los aranceles se aplican al cálculo de `Pago`.

No deben modificar las estadísticas estimadas.

Conceptualmente:

```text
tasaPago
-
arancel
=
tasaNetaPago
```

La unidad exacta del arancel y su fórmula definitiva deben formalizarse antes de implementar el cálculo final.

---

# 16. Pago y Estadísticas

La aplicación debe poder representar dos escenarios monetarios:

## Estadísticas

Utiliza las tasas definidas para estimación.

Su finalidad es mostrar una aproximación del resultado.

## Pago

Utiliza las tasas reales proporcionadas por el estudio.

En este escenario se aplican los aranceles correspondientes.

Conceptualmente:

```text
Estadísticas
→ tasas estimadas

Pago
→ tasas reales
→ aranceles
→ resultado neto
```

---

# 17. Días trabajados

Una quincena tiene 15 días calendario.

Sin embargo, el número de días trabajados no corresponde necesariamente a 15.

Un día se considera trabajado cuando existe al menos un registro de trabajo de una página.

Un registro únicamente relacionado con crédito/adelanto no debe contar por sí mismo como día trabajado.

Regla conceptual:

```text
si existe RegistroPagina válido
    → día trabajado
```

La definición exacta de qué registros califican debe formalizarse junto con el modelo `RegistroPagina`.

---

# 18. Totales

Los totales se calculan después de procesar los registros individuales.

Pueden incluir:

- total de coins;
- total USD;
- total EUR;
- total GBP;
- total COP;
- créditos;
- descuentos;
- valores pagables;
- otros conceptos derivados.

Los totales deben utilizar los resultados procesados, no recalcular independientemente las reglas.

---

# 19. Resumen

Al cerrar una quincena se genera el `Resumen` necesario para continuar la siguiente.

El resumen puede contener, dependiendo de las reglas activas:

```text
Página
├── acumulado mensual
├── coins acumulados
├── estado del tope
├── valor relacionado con rojo
├── interés
├── créditos
└── otros valores de continuidad
```

El resumen debe ser suficiente para evitar recalcular quincenas anteriores completas únicamente para conocer el estado inicial de la siguiente.

---

# 20. Historial

El historial representa una copia inmutable del resultado final.

Debe incluir suficiente información para comprender cómo fue calculada la quincena en ese momento.

Por ejemplo:

```text
Configuración de página
+
RAW relevantes
+
valores de monedas
+
descuentos
+
topes
+
resultados
+
totales
+
pago/estadísticas
+
rojo
+
interés
```

No debe depender de la configuración actual para interpretar el pasado.

---

# 21. Operación Registrar Día

Registrar un día no es un simple CRUD.

Es una operación de negocio completa.

## 21.1 Flujo

```text
Usuario
 ↓
Home
 ↓
Selecciona Tablero
 ↓
Registrar
 ↓
Selecciona Día
 ↓
Selecciona Quincena
 ↓
Selecciona fecha/día
 ↓
Selecciona Página
 ↓
Obtiene configuración de Página
 ↓
Obtiene QuincenaFormateada
 ↓
Usuario introduce RAW
 ↓
Validación
 ↓
Procesamiento provisional
 ↓
Recalculo
 ↓
Vista previa
 ↓
Confirmar / Cancelar
```

---

# 22. Validación de Registro

Antes de persistir:

1. Se comprueba que la quincena exista.
2. Se comprueba que el día pertenezca a la quincena.
3. Se comprueba que la página exista.
4. Se comprueba que el usuario tenga permisos.
5. Se comprueba si el día ya tiene un registro para esa página.
6. Se compara el nuevo RAW con el existente.

---

## 22.1 Registro inexistente

Si no existe:

```text
nuevo RAW
→ preparar CREATE
```

---

## 22.2 Registro existente

Si existe:

```text
nuevo RAW < RAW anterior
→ operación inválida

nuevo RAW > RAW anterior
→ preparar UPDATE
```

La regla de que el nuevo acumulado debe ser estrictamente mayor que el anterior aplica a los registros donde el valor representa un acumulado.

La validación concreta de cada tipo de página debe definirse posteriormente.

---

# 23. Vista previa

Los cambios no se deben persistir inmediatamente.

El servidor debe construir una versión provisional:

```text
RAW nuevo
 ↓
procesamiento
 ↓
recalculo de registros afectados
 ↓
resultado provisional
 ↓
preview
```

El usuario puede:

```text
CONFIRMAR
CANCELAR
```

La vista previa permite conocer cómo quedaría la quincena antes de modificar los datos persistentes.

---

# 24. Confirmación

Solo después de confirmar se persisten los cambios.

La confirmación debe volver a validar las condiciones críticas en el servidor.

Esto evita depender únicamente de la validación realizada por el cliente.

Al confirmar pueden actualizarse:

```text
RegistroPagina
QuincenaFormateada
Resumen
otros resultados dependientes
```

según corresponda.

---

# 25. Edición y propagación

Cuando se modifica un RAW anterior, no siempre es necesario recalcular toda la aplicación.

Debe recalcularse el conjunto afectado.

Ejemplo:

```text
Q2 D1
RAW: 135 → 140
```

Entonces:

```text
D1 cambia
↓
D2 depende de D1
↓
D2 se recalcula
↓
siguientes días afectados
↓
resultado de quincena
↓
Resumen
↓
continuidad siguiente
```

El objetivo es realizar una propagación mínima pero correcta.

---

# 26. Eliminación

Eliminar un registro no significa simplemente borrar una fila/documento.

La eliminación puede modificar:

- resultados posteriores;
- totales;
- días trabajados;
- acumulados;
- resumen;
- continuidad de la siguiente quincena;
- historial si todavía no fue cerrado.

Por eso debe tratarse como una operación de negocio.

Una quincena cerrada no debe permitir modificaciones normales.

---

# 27. Quincena cerrada

Una quincena cerrada pasa a estado de solo lectura.

Para modificarla:

```text
Quincena cerrada
 ↓
REABRIR
 ↓
editar/eliminar
 ↓
recalcular
 ↓
volver a cerrar
```

Al volver a cerrar:

1. se recalculan los resultados afectados;
2. se genera nuevamente el resumen;
3. se actualiza la continuidad necesaria;
4. se actualiza la representación formateada correspondiente.

---

# 28. Dependencia entre quincenas

Las quincenas no son completamente independientes.

Una quincena puede depender del resultado de la anterior para:

- acumulados mensuales;
- monedas;
- topes;
- rojo;
- interés;
- créditos;
- otros valores de continuidad.

Conceptualmente:

```text
Q1
 ↓
Resumen Q1
 ↓
Q2
 ↓
Resumen Q2
 ↓
Q3
```

Una modificación en Q1 puede requerir propagación hacia Q2 y siguientes si modifica valores de continuidad.

---

# 29. QuincenaFormateada como modelo de lectura

`QuincenaFormateada` existe para optimizar las consultas normales.

Una consulta de la interfaz no debería tener que ejecutar siempre:

```text
RegistroPagina
+
Página
+
Monedas
+
Aranceles
+
Resumen anterior
+
todas las reglas
+
todos los días
```

para mostrar una quincena.

En su lugar:

```text
GET QuincenaFormateada
        ↓
respuesta lista para mostrar
```

El motor de cálculo se utiliza cuando:

- se registra;
- se modifica;
- se elimina;
- se recalcula;
- se cierra;
- se reabre;
- se modifica una dependencia que afecte los resultados.

---

# 30. Separación de responsabilidades

La arquitectura conceptual debe mantener:

```text
Página
    = configuración

RegistroPagina
    = RAW

Motor de cálculo
    = reglas

QuincenaFormateada
    = resultado materializado

Resumen
    = continuidad

Historial
    = fotografía inmutable
```

No deben mezclarse estas responsabilidades.

---

# 31. Inmutabilidad histórica

Los cambios futuros en la configuración no deben alterar resultados pasados.

Ejemplo:

Año 2026:

```text
Página X
USD
coins = true
tope = true
descuento = true
```

Años después:

```text
Página X
EUR
coins = false
tope = false
descuento = false
```

La quincena histórica de 2026 debe continuar representando:

```text
USD
coins = true
tope = true
descuento = true
```

según las condiciones existentes cuando fue calculada.

---

# 32. Principio de no recalcular el pasado innecesariamente

El sistema debe evitar utilizar la configuración actual para reinterpretar registros antiguos.

Cuando una configuración cambia, el sistema debe diferenciar:

```text
cálculo nuevo
```

de:

```text
resultado histórico
```

La configuración actual afecta cálculos nuevos.

El historial conserva el contexto anterior.

---

# 33. Estados de una operación de cálculo

Una operación puede pasar conceptualmente por:

```text
INICIADA
   ↓
VALIDANDO
   ↓
CALCULANDO
   ↓
PREVIEW
   ↓
CONFIRMACIÓN
   ↓
PERSISTIENDO
   ↓
COMPLETADA
```

También puede terminar en:

```text
CANCELADA
```

o:

```text
RECHAZADA
```

si alguna validación falla.

---

# 34. Concurrencia y bloqueos

Los bloqueos son específicos de una operación/formulario.

No bloquean al usuario completo.

Ejemplo:

```text
Usuario 1
→ abre formulario de monedas estadísticas
→ operación bloqueada
```

Mientras tanto:

```text
Usuario 2
→ no puede modificar ese mismo formulario
→ sí puede registrar un día
```

El bloqueo termina cuando:

```text
CONFIRMAR
o
CANCELAR
```

También debe contemplarse la expiración de bloqueos abandonados.

La implementación exacta del mecanismo de lock queda pendiente.

---

# 35. Fórmulas todavía pendientes

Antes de implementar el motor definitivo deben formalizarse:

## Rojo

- fórmula exacta;
- qué valores lo generan;
- cuándo se determina;
- cuándo se paga;
- cómo se transporta.

## Interés

- base;
- porcentaje;
- momento;
- acumulación;
- pago.

## Corte

- origen del valor;
- relación con RAW;
- relación con resultado;
- efecto en el período.

## Parcial

- origen;
- límite;
- transformación a corte;
- continuidad.

## Descuento

- posición exacta dentro del pipeline.

## Aranceles

- unidad;
- fórmula;
- aplicación exacta.

## Tope

- fórmula definitiva del valor pagable antes/después de romperlo.

## Pago / Estadísticas

- definición matemática exacta de cada resultado.

---

# 36. Regla principal del sistema

El sistema debe poder expresar el cálculo de una página de forma modular:

```text
RAW
 ↓
Mensual
 ↓
Coins
 ↓
Moneda
 ↓
Tope
 ↓
Descuento
 ↓
Corte
 ↓
Parcial
 ↓
Rojo
 ↓
Interés
 ↓
Aranceles
 ↓
Pago / Estadísticas
 ↓
Días trabajados
 ↓
Totales
 ↓
Resumen
 ↓
Historial
```

Sin embargo, esta secuencia representa la arquitectura actual y no debe considerarse matemáticamente definitiva hasta cerrar las fórmulas pendientes.

---

