# App-Agenda - Especificaciones

> Documento de diseño progresivo.
>
> Este documento describe el funcionamiento del sistema, los conceptos
> del negocio, los modelos propuestos, el flujo de datos y las decisiones
> tomadas durante el diseño.
>
> El diseño definitivo de la base de datos, servidor y frontend se
> realizará posteriormente utilizando este documento como referencia.
>
> La aplicación anterior en Electron se utilizará únicamente como
> referencia funcional. La nueva aplicación será diseñada desde cero.
>
> Las decisiones que todavía no tengan una estructura suficientemente
> definida permanecerán abiertas hasta analizar completamente el flujo
> de datos y las reglas de cálculo.

---

# 1. Objetivo del proyecto

Generar estadísticas quincenales a partir de los registros diarios de
trabajo realizados por el usuario.

El sistema debe permitir transformar los datos registrados durante cada
día en:

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
* información necesaria para continuar los cálculos en futuras
  quincenas;
* históricos inmutables.

---

# 2. Arquitectura General

## 2.1 DB

Pendiente del diseño definitivo.

La base de datos debe conservar la información necesaria para:

* registrar los datos originales;
* identificar la relación entre quincenas, días y páginas;
* realizar los cálculos;
* mantener la continuidad entre quincenas;
* generar resúmenes;
* generar históricos inmutables.

La estructura definitiva dependerá de la estrategia de procesamiento que
se determine para los registros.

---

## 2.2 Server

Pendiente de diseño.

Debe encargarse de las operaciones que posteriormente se determine que
deben ejecutarse fuera del frontend.

También deberá garantizar las reglas de negocio que no deban depender
únicamente del cliente.

---

## 2.3 Frontend

Pendiente de diseño.

Será responsable de:

* mostrar los formularios correspondientes a cada página;
* evitar que el usuario registre propiedades que no corresponden a la
  página seleccionada;
* registrar los datos;
* mostrar resultados;
* permitir generar Resúmenes;
* permitir generar Historiales;
* mostrar advertencias y confirmaciones.

---

# 3. Conceptos del negocio

## 3.1 Porcentaje

Es el porcentaje de las ganancias que corresponde al estudio o empresa
para la que trabaja el usuario.

Ejemplo:

```text
Porcentaje = 80%
```

Este valor participa en los cálculos económicos de la quincena.

---

## 3.2 Páginas

Las páginas son los sitios web donde el usuario realiza transmisiones y
genera ganancias.

Cada página tiene características particulares que determinan cómo debe
interpretarse la información registrada.

Las páginas son globales y pueden ser utilizadas por diferentes
usuarios.

Entre las propiedades que pueden definir una página se encuentran:

* Coins;
* USD;
* EUR;
* GBP;
* COP;
* descuento;
* tope;
* mensual;
* corte;
* parcial.

La configuración de la página también determina qué información debe
solicitar el formulario al usuario.

---

## 3.3 Coins

Algunas páginas muestran las ganancias mediante una cantidad de Coins en
lugar de una cantidad monetaria directa.

La página define cuánto vale cada Coin y en qué moneda debe convertirse.

Ejemplo:

```text
Página: Sender

Mensual: true
Coins: true
Moneda: EUR
ValorCoins: 0.11
```

Si el usuario registra:

```text
Coins = 100
```

el sistema puede obtener:

```text
100 × 0.11 EUR = 11 EUR
```

---

## 3.4 Descuento

Algunas páginas muestran el 100% del valor generado, pero realmente
pagan solamente un porcentaje del mismo.

El sistema debe conservar el valor bruto y el valor neto cuando una
página utilice descuento.

Ejemplo:

```text
Valor mostrado por la página: 39.56
Valor después del descuento: 22.58
```

Esto permite identificar fácilmente:

* cuánto mostraba originalmente el sitio;
* cuánto corresponde después del descuento;
* cuánto se está utilizando en las cuentas de la quincena.

La regla exacta de cálculo del porcentaje de descuento queda definida a
partir de esta lógica.

---

## 3.5 Tope

Algunas páginas muestran las ganancias generadas, pero solamente pagan
cuando se alcanza una cantidad mínima.

El comportamiento depende de si la página es mensual o quincenal.

### 3.5.1 Página mensual con tope

El acumulado debe continuar entre quincenas durante el período mensual.

Ejemplo:

```text
PáginaG
Tope = 250 USD
```

Primera quincena:

```text
QA
Valor mensual = 20
Valor quincenal = 20
Tope acumulado = 20
No se paga
```

Segunda quincena:

```text
QB
Valor mensual = 50

50 - 20 = 30 USD correspondientes a la quincena

Tope acumulado = 50
No se paga
```

Tercera quincena:

```text
QC
Valor mensual = 251

251 - 50 = 201 USD correspondientes a la quincena

Tope acumulado = 251
Tope superado
Se paga
```

Después del pago:

```text
Acumulado del tope = 0
```

La siguiente quincena comienza nuevamente desde cero.

---

### 3.5.2 Otro escenario de página mensual

También puede ocurrir:

```text
QA
Valor mensual = 20
Tope acumulado = 20

QB
Valor mensual = 50
Tope acumulado = 50

QC
Valor mensual = 151
Tope acumulado = 151

QD
Valor mensual = 201

201 - 151 = 50 USD

Tope acumulado = 251
Tope superado
Se paga
```

La diferencia entre el valor mensual y el valor quincenal es necesaria
para determinar correctamente cuánto corresponde a cada período.

---

### 3.5.3 Página quincenal con tope

En una página que no es mensual, el tope se reinicia por quincena.

Cuando el tope se cumple:

* se considera pagado;
* se restablece el acumulado;
* la siguiente quincena comienza nuevamente desde cero.

---

# 3.6 Corte

Un corte solamente existe cuando la página ha liberado los créditos que
estaban pendientes de verificación.

El corte representa una cantidad que ya fue verificada y liberada por la
página.

---

# 3.7 Parcial

Un parcial representa ganancias que todavía no se han convertido en
corte porque la página aún no las ha verificado.

Reglas:

1. Solamente existe si no existe un corte más reciente.
2. Siempre se toma el parcial más reciente.
3. Puede existir un corte y un parcial simultáneamente cuando el corte es
   menos reciente que el parcial.
4. El parcial solamente existe para estadísticas.
5. El parcial no participa en el cálculo de pago.

---

## 3.7.1 Determinar el parcial más reciente

El sistema debe revisar la quincena cronológicamente.

Primero se identifica el último corte realizado.

A partir de ese corte se busca el parcial más reciente.

Los registros deben considerar fecha y hora.

Puede existir un corte y posteriormente un parcial en el mismo día.

Ejemplo:

```text
10:00 — Corte
10:30 — Parcial
```

En este caso el parcial de las 10:30 es el más reciente y debe ser
considerado.

---

# 3.8 Interés

Cuando el resultado de una quincena genera una deuda con el estudio, se
aplica un interés.

Ejemplo:

```text
Interés = 5%
```

El interés debe pertenecer a la configuración de aranceles porque se
considera una constante utilizada durante los cálculos.

Si el estudio modifica este valor, debe poder actualizarse fácilmente.

La forma exacta de aplicar el interés queda pendiente de definir dentro
del proceso completo de cálculo de deuda.

---

# 3.9 Monedas

Las monedas utilizadas actualmente son:

* USD;
* EUR;
* GBP;
* COP.

Las monedas internacionales se registran respecto al peso colombiano
(COP).

Existen dos valores conceptualmente diferentes:

### Estadísticas

Es el valor utilizado para realizar las estadísticas de la quincena.

Puede establecerse deliberadamente por debajo del valor real de mercado
para mantener un margen de seguridad ante posibles variaciones de la
moneda.

Ejemplo:

```text
Valor real:        4.000 COP
Valor estadístico: 3.500 COP
```

No se aplican aranceles a este valor.

### Pago

Es el valor utilizado por el estudio para calcular el pago al finalizar
la quincena.

A este valor se le aplican los aranceles correspondientes.

Cada quincena debe conservar los valores utilizados para estadísticas y
pago.

---

# 4. Flujo general de datos

## 4.1 Registro de aranceles

Se registra la información necesaria para realizar los cálculos.

Propiedades propuestas:

* id;
* USD;
* EUR;
* GBP;
* Porcentaje;
* Interés.

El interés se considera parte de esta configuración porque representa
una constante utilizada para calcular las deudas.

---

## 4.2 Registro de páginas

Se registra la configuración necesaria para interpretar cada página.

Propiedades propuestas:

* id;
* nombre;
* coins;
* valorCoins;
* moneda;
* descuento;
* valorDescuento;
* tope;
* valorTope;
* mensual;
* corte;
* parcial.

La configuración también determina el formulario que se presenta al
usuario.

Por ejemplo, una página que utiliza Coins debe mostrar el campo
correspondiente para registrar Coins.

Una página que no utiliza Coins no debe solicitar ese dato.

Esto reduce la posibilidad de errores humanos durante el registro.

---

# 5. Registro de monedas

Propiedades propuestas:

* id;
* USD;
* EUR;
* GBP;
* COP;
* pago.

El campo `pago` identifica el tipo de registro:

```text
pago = false
→ estadísticas

pago = true
→ pago
```

La información se incorporará a la quincena formateada.

Cuando cambien las monedas registradas, la quincena deberá poder
recalcular las conversiones correspondientes tanto para estadísticas
como para pago.

La modificación de las tasas afecta principalmente las conversiones a
COP.

---

# 6. Quincena

La quincena representa el período sobre el cual se realizan las
estadísticas.

Propiedades propuestas:

* id;
* nombre;
* inicio;
* fin;
* año;
* cerrado.

`inicio` representa la fecha inicial de la quincena.

`fin` representa la fecha final.

`año` permite ordenar y consultar las quincenas por año.

El estado `cerrado` determina si la quincena está abierta o cerrada.

Las propiedades relacionadas directamente con Resumen e Historial no se
consideran todavía definitivas porque su estructura de relación será
definida posteriormente.

---

# 7. Día

Un día pertenece conceptualmente a una quincena solamente cuando existen
registros de páginas correspondientes a ese día.

No se debe crear un día vacío únicamente para representar una fecha de la
quincena.

Por lo tanto:

```text
Quincena
    │
    ├── Día
    │    ├── Registro Página
    │    ├── Registro Página
    │    └── Registro Página
    │
    ├── Día
    │    └── Registro Página
    │
    └── Día
         └── Registro Página
```

Si no existe ningún registro de página, no existe el registro de día
correspondiente.

---

# 8. Registro de página

El registro de página contiene los datos que el usuario obtiene de la
página web y registra en el sistema.

La configuración de la página no necesariamente se copia dentro del
registro.

La página se utiliza principalmente para determinar qué formulario debe
mostrar el frontend y qué reglas deben aplicarse posteriormente.

Ejemplo:

```text
Página: Sender

Mensual: true
Coins: true
Moneda: EUR
ValorCoins: 0.11
Tope: false
Corte: false
Parcial: false
Descuento: false
```

El registro realizado por el usuario puede ser:

```text
Página: Sender
Coins: 100
```

A partir de esta información el sistema puede obtener:

```text
Euros = 100 × 0.11
```

---

# 9. Páginas mensuales

Una página mensual registra siempre el valor acumulado que muestra el
sitio web en ese momento.

El valor registrado no representa necesariamente la ganancia producida
durante ese día.

Ejemplo:

```text
Primera quincena

Acumulado mensual = 500
```

Segunda quincena:

```text
Acumulado mensual = 1.500
```

Entonces:

```text
1.500 - 500 = 1.000
```

Por lo tanto, el sistema debe diferenciar:

* valor mensual;
* valor quincenal;
* valor diario.

La interfaz puede mostrar:

```text
Mensual:   1.500
Quincenal: 1.000
Diario:       X
```

El funcionamiento mensual depende de que el sitio web realmente utilice
una metodología de pago mensual o de que el estudio indique que la
página pertenece a esta metodología.

---

# 10. Estrategias posibles para procesar los registros

Todavía no se ha definido la estrategia definitiva de procesamiento.

Existen dos alternativas principales.

## 10.1 Procesamiento al momento del registro

Cuando el usuario registra un dato:

1. se obtienen las reglas de la página;
2. se obtiene la información correspondiente a la quincena;
3. se procesa la información existente;
4. se agrega el nuevo dato crudo;
5. se actualiza la información procesada de la quincena;
6. se conservan los resultados necesarios para posteriores cálculos.

Ventaja:

```text
La quincena puede mantenerse procesada y lista para realizar cálculos
internos como porcentaje, promedios y conversiones a COP.
```

---

## 10.2 Procesamiento posterior

Cuando el usuario consulta una quincena:

1. se obtienen los datos crudos;
2. se obtiene la configuración de las páginas;
3. se identifican los registros pertenecientes a la quincena;
4. se procesan los registros;
5. se genera la información formateada;
6. se realizan los cálculos internos.

Ventaja:

```text
Los datos originales permanecen separados de los resultados calculados.
```

La estrategia definitiva todavía no está decidida.

Esta decisión afectará directamente:

* estructura del registro diario;
* estructura de la quincena;
* frecuencia de actualización;
* cantidad de lecturas;
* cantidad de procesamiento;
* estrategia de recálculo.

---

# 11. Resumen

El Resumen es generado por el sistema mediante una acción explícita del
usuario.

Su objetivo principal es conservar la información necesaria para
continuar los cálculos en futuras quincenas.

El Resumen no es simplemente un reporte.

Es información operacional de continuidad.

Debe conservar información como:

* acumulados de páginas;
* información de páginas con topes no cumplidos;
* información necesaria para páginas mensuales;
* deuda con el estudio;
* otros valores necesarios para continuar cálculos.

---

## 11.1 Información económica

Debe contener, según corresponda:

* ganancias en COP;
* rojo/deuda con el estudio;
* préstamos;
* días trabajados;
* promedio diario;
* promedio quincenal según los días trabajados.

---

## 11.2 Totales por moneda

Debe conservar:

* total USD;
* total EUR;
* total GBP;
* total COP.

---

## 11.3 Otros totales

Debe conservar:

* total Coins;
* total créditos.

---

## 11.4 Totales por página

Debe conservar los valores totalizados de cada página cuando sean
necesarios para continuar los cálculos.

Especialmente:

* páginas con topes todavía no cumplidos;
* páginas mensuales;
* páginas cuyos acumulados sean necesarios para la siguiente
  quincena;
* información que pueda utilizarse posteriormente para proyecciones.

---

# 12. Proyección

La información almacenada en el Resumen puede utilizarse posteriormente
para realizar proyecciones.

Por ejemplo, una página mensual puede conservar:

```text
Acumulado anterior: 500
Acumulado actual:   1.500
```

Esta información puede utilizarse para analizar la evolución de la
página y realizar proyecciones futuras.

Las reglas exactas de proyección todavía no están definidas.

---

# 13. Historial

El Historial es una copia exacta de una quincena ya calculada.

Debe contener todos los cálculos y resultados tal como fueron mostrados
al usuario en el momento en que se generó.

El Historial debe ser:

* inmutable;
* independiente de cambios posteriores;
* una copia completa del resultado de la quincena.

Si posteriormente cambian:

* páginas;
* aranceles;
* monedas;
* registros;
* configuraciones;

el Historial existente no debe modificarse.

---

# 14. Versiones del Historial

Generar nuevamente el Historial no modifica la versión anterior.

Cada generación crea una nueva versión.

Ejemplo:

```text
Quincena 1

Historial v1
Historial v2
Historial v3
```

Si ya existe un Historial y el usuario desea generar uno nuevo, debe
indicar obligatoriamente el motivo.

Ejemplo:

```text
Motivo:

"Corregí el valor registrado de Sender del día 8."
```

Cuando sea posible, el sistema debe detectar automáticamente los cambios
entre versiones.

Ejemplo:

```text
Sender

Antes:    100 Coins
Después:  120 Coins

Cambio: +20 Coins
```

La explicación escrita por el usuario y los cambios detectados
automáticamente forman parte de la auditoría de la nueva versión.

---

# 15. Diferencia entre Resumen e Historial

## Resumen

Es información operacional.

Su finalidad es permitir que la siguiente quincena continúe los cálculos
sin necesidad de volver a procesar toda la información anterior.

Ejemplos:

```text
Tope pendiente
Acumulado de página mensual
Deuda pendiente
Otros acumulados necesarios
```

## Historial

Es información histórica.

Su finalidad es conservar exactamente cómo quedó una quincena en un
momento determinado.

Ejemplo:

```text
Quincena 1
    ├── Historial v1
    ├── Historial v2
    └── Historial v3
```

El Historial no participa en los cálculos normales de nuevas quincenas.

---

# 16. Datos originales y resultados calculados

Esta separación todavía no tiene una estructura definitiva.

Actualmente se reconoce conceptualmente que existen dos tipos de
información:

## Datos originales

Información registrada directamente a partir de lo observado en las
páginas web.

Ejemplos:

```text
Coins
USD
EUR
GBP
COP
Corte
Parcial
Fecha
Hora
Página
```

## Resultados calculados

Información producida por el sistema a partir de los datos originales y
las reglas de negocio.

Ejemplos:

```text
Valor diario
Valor quincenal
Valor mensual
Conversión a COP
Valor después del descuento
Totales
Promedios
Créditos
Rojo
Interés
```

La estructura definitiva que determinará dónde almacenar cada tipo de
información queda pendiente de la definición completa del proceso de
formateo.

---

# 17. Decisiones pendientes

Las siguientes decisiones todavía requieren análisis antes de crear la
estructura definitiva de la DB.

## 17.1 Estrategia de procesamiento

Determinar si se utilizará:

1. procesamiento y actualización de resultados al registrar cada dato;
2. procesamiento de los datos crudos al consultar la quincena;
3. una combinación de ambos métodos.

---

## 17.2 Estructura definitiva del registro de página

Debe determinarse qué información corresponde exclusivamente al dato
original registrado y qué información debe ser calculada posteriormente.

---

## 17.3 Estructura definitiva de la quincena procesada

Debe determinarse si la quincena tendrá una representación procesada que
se actualice conforme se registran nuevos datos o si los resultados se
generarán bajo demanda.

---

## 17.4 Estructura definitiva del Resumen

Ya está definido que el Resumen debe contener la información necesaria
para continuar los cálculos entre quincenas.

Todavía falta determinar exactamente:

* campos;
* estructura de los totales por página;
* estructura de acumulados;
* estructura de deuda;
* estructura de páginas mensuales;
* estructura de topes;
* información necesaria para proyecciones.

---

## 17.5 Estructura definitiva del Historial

Ya está definido que el Historial debe ser una copia exacta e inmutable
de la quincena calculada.

Todavía falta determinar cómo se almacenará internamente esa copia y cómo
se manejarán sus diferentes versiones.

---

## 17.6 Relación entre Quincena, Resumen e Historial

Conceptualmente:

```text
Quincena
   │
   ├── Resultado actual
   │
   ├── Resumen
   │
   └── Historial
          ├── v1
          ├── v2
          └── v3
```

La estructura técnica definitiva todavía está pendiente.

---

## 17.7 Estrategia de recálculo

Todavía no está definida completamente.

Debe determinarse qué ocurre cuando se modifica:

* un registro;
* una página;
* una tasa de moneda;
* un arancel;
* una configuración;
* un dato de una quincena anterior.

---

# 18. Reglas actualmente definidas

Hasta este punto se consideran definidas las siguientes reglas:

* Las páginas son globales.
* El formulario depende de la configuración de la página.
* No se deben solicitar datos que no correspondan a la página.
* Un día solamente existe cuando tiene registros de páginas.
* Las páginas mensuales registran acumulados.
* Las páginas mensuales requieren comparar acumulados para obtener el
  resultado quincenal.
* Los topes mensuales continúan acumulándose entre quincenas hasta que
  se realiza el pago.
* Después de cumplirse un tope mensual, el acumulado se reinicia.
* Los topes de páginas quincenales se reinician por quincena.
* Un corte solamente existe cuando la página libera los créditos.
* El parcial solamente participa en estadísticas.
* Se toma el parcial más reciente según fecha y hora.
* Un corte y un parcial pueden coexistir si el parcial es posterior al
  corte.
* El interés pertenece conceptualmente a los aranceles.
* Las monedas tienen una tasa para estadísticas y otra para pago.
* La distinción entre ambas puede manejarse mediante `pago = true/false`.
* El Resumen sirve para mantener continuidad entre quincenas.
* El Historial es una copia exacta e inmutable.
* Generar un nuevo Historial crea una nueva versión.
* Una nueva versión requiere una justificación.
* Las versiones históricas no se modifican por cambios posteriores.
* El Historial no participa en el cálculo normal de nuevas quincenas.

---

# 19. Orden de diseño

El diseño de la aplicación seguirá este orden:

```text
1. Reglas del negocio
        ↓
2. Flujo de datos
        ↓
3. Modelos / DB
        ↓
4. Relaciones y estructura de datos
        ↓
5. Server
        ↓
6. Procesamiento y cálculos
        ↓
7. Frontend
```

No se debe comenzar por los modelos definitivos sin haber definido
previamente las reglas de negocio que utilizan esos datos.

---

# 20. Estado actual del documento

Este documento todavía no representa la estructura definitiva de la
aplicación.

Su objetivo actual es recopilar y organizar:

* conceptos;
* reglas de negocio;
* flujo de información;
* modelos candidatos;
* ejemplos;
* decisiones tomadas;
* decisiones pendientes.

Una vez finalizado el análisis de las reglas de negocio, este documento
servirá como base para crear el diseño técnico definitivo de la base de
datos.
