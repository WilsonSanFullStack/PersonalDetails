# FLUJO DE OPERACIONES --- AppAgenda Mobile

## 1. Objetivo

Este documento define el flujo funcional y de negocio de las principales
operaciones de AppAgenda Mobile.

Su objetivo es describir qué sucede desde que un usuario inicia una
operación hasta que los datos quedan registrados, calculados y
disponibles para operaciones posteriores.

Este documento se construye a partir de las reglas actualmente
definidas. No representa todavía el diseño definitivo de Firestore ni la
implementación de código.

------------------------------------------------------------------------

# 2. Principio general

AppAgenda no debe tratar el registro de información como simples
operaciones CRUD.

Algunas acciones desencadenan múltiples procesos.

Especialmente:

> **Registrar un día es una operación de negocio que genera datos RAW,
> ejecuta el motor de cálculo, genera resultados formateados y actualiza
> información dependiente.**

Por lo tanto:

``` text
Operación
    ↓
Validación
    ↓
Obtención de contexto
    ↓
Procesamiento
    ↓
Vista previa
    ↓
Confirmación
    ↓
Persistencia
    ↓
Actualización de datos dependientes
```

------------------------------------------------------------------------

# 3. Estructura general del sistema

La estructura conceptual actual es:

``` text
Usuario
   ↓
Tablero
   ├── Miembros
   ├── Permisos
   ├── Configuración general
   ├── Páginas
   ├── Quincenas
   ├── Monedas
   ├── Días
   ├── Resúmenes
   └── Historial
```

## 3.1 Usuario

Un usuario se registra independientemente de los tableros.

Ejemplo:

``` text
Wilson
   ↓
cuenta de usuario
```

El registro de un usuario no implica necesariamente la creación de un
tablero.

Un usuario puede:

-   crear un tablero;
-   recibir acceso a un tablero creado por otro usuario;
-   pertenecer a varios tableros.

------------------------------------------------------------------------

# 4. Tablero

El tablero es una entidad independiente del usuario.

El concepto es similar al funcionamiento de un tablero compartido como
Trello.

Ejemplo:

``` text
Usuario Wilson
    │
    ├── Tablero A
    ├── Tablero B
    └── Tablero C
```

Un tablero puede tener varios usuarios:

``` text
Tablero A
│
├── User1 → Editor
├── Wilson → Editor
└── User3 → Observador
```

El tablero es el contexto donde viven los datos de AppAgenda:

-   configuración;
-   usuarios y permisos;
-   páginas;
-   quincenas;
-   monedas;
-   días;
-   resultados;
-   resúmenes;
-   historial.

------------------------------------------------------------------------

# 5. Usuarios y permisos

El tablero debe permitir administrar los usuarios que tienen acceso.

Se contempla:

-   editor;
-   observador;
-   reglas específicas de edición.

La configuración de permisos todavía debe definirse con mayor detalle.

## 5.1 Bloqueo de operaciones simultáneas

Además de los permisos, ciertas operaciones pueden tener un bloqueo
temporal.

El bloqueo no necesariamente impide al usuario trabajar en todo el
tablero.

Ejemplo:

``` text
User1
  ↓
abre "Registrar monedas"
  ↓
MONEDAS = BLOQUEADO
```

Mientras tanto:

``` text
User2 → Registrar monedas
        ❌ No permitido

User2 → Registrar día
        ✅ Permitido
```

El bloqueo permanece mientras User1 tenga abierta la operación.

El bloqueo termina cuando:

``` text
CONFIRMAR
   ↓
guardar operación
   ↓
liberar bloqueo
```

o:

``` text
CANCELAR
   ↓
liberar bloqueo
```

## 5.2 Estado del bloqueo

Conceptualmente:

``` text
Operación
├── libre
└── ocupada
     ├── usuario
     └── operación activa
```

La estructura definitiva del mecanismo de bloqueo queda pendiente del
diseño de base de datos y concurrencia.

------------------------------------------------------------------------

# 6. Configuración general

Después de crear o configurar el tablero se registran las constantes que
afectan los cálculos.

Entre ellas:

-   porcentaje del estudio;
-   interés;
-   aranceles.

Estas variables pertenecen al contexto del tablero.

## 6.1 Interés

El interés debe poder ser modificado por el estudio.

Actualmente se ha definido que el interés forma parte de las
constantes/aranceles.

Su valor se utiliza posteriormente para calcular el interés asociado a
una deuda o rojo.

Regla conceptual:

``` text
interésDeuda = rojo × interés
```

La aplicación exacta del interés en cada situación debe detallarse en
`REGLAS_CALCULO.md`.

------------------------------------------------------------------------

# 7. Registro de páginas

Una página representa una plataforma donde se transmite/trabaja y se
obtiene una remuneración.

La configuración de una página contiene las variables necesarias para
que el sistema sepa cómo interpretar los valores registrados.

Entre las variables definidas se encuentran:

-   nombre;
-   moneda;
-   coins;
-   valor de coins;
-   tope;
-   descuento;
-   corte;
-   parcial;
-   mensual.

No todas las páginas utilizan todas las variables.

Ejemplo conceptual:

``` text
Página X
├── moneda = USD
├── coins = true
├── valorCoins = 0.2
├── tope = true
├── valorTope = 50
├── descuento = true
├── valorDescuento = 15%
├── mensual = true
└── corte/parcial = según corresponda
```

La combinación de estas variables determina el comportamiento de la
página durante el procesamiento.

------------------------------------------------------------------------

# 8. Registro de una quincena

Una quincena contiene:

-   nombre;
-   fecha de inicio;
-   fecha final;
-   año;
-   referencia a quincena anterior;
-   referencia a quincena posterior.

La quincena representa el período donde se registran los días y se
realizan los cálculos correspondientes.

------------------------------------------------------------------------

# 9. Registro de monedas

Cada quincena debe tener los valores de conversión correspondientes a:

-   USD;
-   EUR;
-   GBP;
-   COP.

Se contemplan dos tipos de valor:

``` text
Estadísticas
Pago
```

Conceptualmente:

``` text
Quincena
│
└── Monedas
    ├── Estadísticas
    │   ├── USD
    │   ├── EUR
    │   └── GBP
    │
    └── Pago
        ├── USD
        ├── EUR
        └── GBP
```

Los valores internacionales representan su equivalencia en pesos.

La estructura definitiva de almacenamiento queda pendiente del diseño de
base de datos.

------------------------------------------------------------------------

# 10. Registro de un día

## 10.1 El día como operación

Registrar un día no debe considerarse únicamente como:

``` text
createDay()
```

o como un simple `add()` en la base de datos.

Debe considerarse una operación:

``` text
registrarDia()
```

porque desencadena:

-   validaciones;
-   obtención de páginas;
-   obtención de registros anteriores;
-   cálculos;
-   conversiones;
-   descuentos;
-   validación de topes;
-   procesamiento de cortes/parciales;
-   generación de resultados;
-   actualización de información dependiente.

------------------------------------------------------------------------

# 11. Flujo completo de `registrarDia()`

``` text
Usuario
  ↓
Selecciona quincena
  ↓
Selecciona día
  ↓
Selecciona/ingresa páginas
  ↓
Sistema obtiene configuración de las páginas
  ↓
Sistema obtiene información anterior necesaria
  ↓
Usuario registra valores RAW
  ↓
Sistema valida los valores
  ↓
Sistema procesa cada página
  ↓
Sistema genera resultado formateado
  ↓
Sistema genera PREVIEW
  ↓
Usuario revisa
  ├── Cancelar → descartar operación
  └── Confirmar
          ↓
      guardar RAW
          ↓
      guardar resultado
          ↓
      actualizar información dependiente
```

------------------------------------------------------------------------

# 12. Datos RAW

Los datos RAW representan exactamente la información
introducida/observada por el usuario.

Ejemplo:

``` text
Página X
Quincena 2
Día 2

Valor registrado = 213
```

El valor `213` es RAW.

No debe interpretarse automáticamente como:

``` text
ganancia del día = 213
```

porque puede ser un acumulado mensual.

El RAW representa el dato original necesario para poder reproducir
posteriormente el cálculo.

------------------------------------------------------------------------

# 13. Datos formateados

El resultado formateado es generado por el motor de cálculo a partir de
los datos RAW y del contexto necesario.

Ejemplo:

``` text
Página X
Quincena 2
Día 2

RAW:
213

Resultado:
Mes       = 213
Quincena  = 128
Día       = 78
```

Por lo tanto:

``` text
RAW
 ↓
Motor de cálculo
 ↓
Resultado formateado
```

------------------------------------------------------------------------

# 14. Regla de valores mensuales acumulados

Para páginas mensuales, el valor introducido por el usuario representa
un acumulado.

El nuevo valor debe cumplir:

``` text
valorNuevo > valorAnterior
```

Además:

``` text
valorNuevo > 0
```

Por lo tanto, no se permite:

``` text
0
```

ni:

``` text
valorNuevo <= valorAnterior
```

si el registro representa un nuevo acumulado de la misma secuencia.

Estas validaciones deben producir un error comprensible para el usuario.

------------------------------------------------------------------------

# 15. Cálculo mensual → quincena → día

## 15.1 Primera quincena

Ejemplo:

``` text
Página X
Q1 D1
RAW = 50
```

Resultado:

``` text
Mes       = 50
Quincena  = 50
Día       = 50
```

Segundo registro:

``` text
Página X
Q1 D2
RAW = 85
```

Resultado:

``` text
Mes       = 85
Quincena  = 85
Día       = 35
```

Porque:

``` text
85 - 50 = 35
```

------------------------------------------------------------------------

# 16. Segunda quincena

Al comenzar una segunda quincena se utiliza la información de
continuidad de la quincena anterior.

Ejemplo:

``` text
Q1
Página X
Mes acumulado final = 85
```

En Q2:

``` text
Q2 D1
RAW = 135
```

Resultado:

``` text
Mes       = 135
Quincena  = 50
Día       = 50
```

Porque:

``` text
135 - 85 = 50
```

Segundo registro:

``` text
Q2 D2
RAW = 213
```

Resultado:

``` text
Mes       = 213
Quincena  = 128
Día       = 78
```

Porque:

``` text
213 - 85 = 128
128 - 50 = 78
```

------------------------------------------------------------------------

# 17. Ejemplo completo

``` text
                 MES       QUINCENA       DÍA

Q1 D1             50          50           50
Q1 D2             85          85           35

Q2 D1            135          50           50
Q2 D2            213         128           78
```

La información anterior de Q1 permite determinar el inicio de Q2.

------------------------------------------------------------------------

# 18. Procesamiento de cada página

Al registrar una página dentro de un día, el sistema debe obtener la
información necesaria para procesarla.

Conceptualmente:

``` text
Registro página
      ↓
Obtener configuración
      ↓
Determinar tipo de página
      ↓
Obtener estado anterior
      ↓
Calcular acumulados
      ↓
Aplicar reglas específicas
      ↓
Resultado de página
```

Entre las reglas que pueden intervenir:

-   página mensual;
-   coins;
-   conversión de coins;
-   descuento;
-   tope;
-   corte;
-   parcial;
-   moneda;
-   continuidad con quincena anterior;
-   continuidad con días anteriores.

------------------------------------------------------------------------

# 19. Coins

Si una página trabaja con coins, el sistema debe convertirlos según la
configuración de la página.

Ejemplo conceptual:

``` text
coins registrados
      ↓
valorCoins de la página
      ↓
valor monetario
```

La forma exacta de combinar coins con otras monedas debe definirse en
`REGLAS_CALCULO.md`.

------------------------------------------------------------------------

# 20. Descuento

Si una página tiene descuento, el sistema debe aplicarlo durante el
procesamiento.

La configuración de la página determina:

``` text
descuento = activo
valorDescuento = X%
```

El resultado debe permitir conocer el valor correspondiente antes y
después de la aplicación del descuento cuando esto sea necesario para
trazabilidad.

La fórmula exacta debe quedar definida en `REGLAS_CALCULO.md`.

------------------------------------------------------------------------

# 21. Tope

Si una página tiene tope, el sistema debe determinar:

-   cuánto se ha acumulado;
-   cuánto falta;
-   si ya se alcanzó;
-   si corresponde considerar el valor como pagado;
-   cómo continúa el acumulado.

La lógica exacta de continuidad de topes se documentará en
`REGLAS_CALCULO.md`.

------------------------------------------------------------------------

# 22. Corte y parcial

Cuando una página utiliza corte y parcial, el sistema debe aplicar las
reglas específicas definidas para ese tipo de página.

Estas reglas no se deben improvisar dentro del registro del día.

El flujo debe enlazar conceptualmente con la especificación
correspondiente:

``` text
Registro de página
      ↓
¿Tiene corte/parcial?
      ↓
Aplicar reglas de corte/parcial
```

La lógica detallada queda pendiente de documentar formalmente.

------------------------------------------------------------------------

# 23. Vista previa

Antes de confirmar un registro, el sistema debe mostrar al usuario una
vista previa del resultado.

Esto permite detectar errores de digitación.

Ejemplo:

``` text
Página X

Valor registrado:
213 coins

Resultado calculado:

Mes:
213 coins

Quincena:
128 coins

Día:
78 coins
```

El usuario puede:

``` text
CONFIRMAR
```

o:

``` text
CANCELAR
```

La vista previa debe generarse antes de persistir definitivamente la
operación.

------------------------------------------------------------------------

# 24. Confirmación del registro

Al confirmar:

``` text
PREVIEW
   ↓
CONFIRMAR
   ↓
persistir RAW
   ↓
persistir resultado calculado
   ↓
actualizar estado dependiente
   ↓
liberar bloqueo
```

Si el usuario cancela:

``` text
PREVIEW
   ↓
CANCELAR
   ↓
no guardar la operación
   ↓
liberar bloqueo
```

------------------------------------------------------------------------

# 25. Recalculo

Los resultados formateados son datos derivados.

El RAW es la fuente necesaria para poder reconstruirlos.

Por ello:

``` text
RAW
 ↓
motor de cálculo
 ↓
resultado
```

permite recalcular una operación cuando sea necesario.

------------------------------------------------------------------------

# 26. Edición de un día

Una edición puede afectar no solamente al día editado, sino también a
los registros posteriores.

Ejemplo inicial:

``` text
Q2 D1
RAW = 135

Mes       = 135
Quincena  = 50
Día       = 50

Q2 D2
RAW = 213

Mes       = 213
Quincena  = 128
Día       = 78
```

Se modifica:

``` text
Q2 D1
RAW = 140
```

El sistema debe recalcular desde el registro modificado hacia adelante.

Nuevo resultado:

``` text
Q2 D1
RAW = 140

Mes       = 140
Quincena  = 55
Día       = 55
```

El Q2 D2 debe recalcularse:

``` text
Q2 D2
RAW = 213

Mes       = 213
Quincena  = 128
Día       = 73
```

Porque:

``` text
128 - 55 = 73
```

------------------------------------------------------------------------

# 27. Regla de propagación del recálculo

Regla fundamental:

> Todo resultado calculado de una página debe considerarse derivado de
> sus datos RAW y del estado de continuidad anterior. Si se modifica un
> RAW, deben recalcularse ese registro y todos los registros posteriores
> afectados dentro de la misma secuencia de cálculo.

Conceptualmente:

``` text
Editar D1
   ↓
recalcular D1
   ↓
recalcular D2
   ↓
recalcular D3
   ↓
recalcular D4
   ↓
...
   ↓
recalcular resultado de quincena
```

No se debe actualizar únicamente el registro editado dejando resultados
dependientes antiguos.

------------------------------------------------------------------------

# 28. Resumen de continuidad

El Resumen no es solamente un informe.

Es información necesaria para continuar los cálculos de futuras
quincenas.

Por ejemplo, Q2 puede necesitar información de Q1:

``` text
Q1
│
└── Resumen
     ├── Página X
     │    └── acumulado mensual = 85
     │
     ├── rojo = 0
     ├── interés
     ├── créditos
     └── otros estados necesarios
```

Al iniciar Q2:

``` text
Q2
 ↓
leer Resumen Q1
 ↓
obtener estado anterior
 ↓
calcular nuevos registros
```

------------------------------------------------------------------------

# 29. Datos que puede contener el Resumen

Actualmente se han identificado como posibles elementos:

-   acumulado mensual por página;
-   acumulado de topes;
-   total de deuda/rojo;
-   interés de deuda;
-   total de créditos;
-   total por moneda;
-   total de coins;
-   total COP;
-   préstamos;
-   días trabajados;
-   promedio diario;
-   promedio de quincena;
-   otros estados necesarios para continuar cálculos.

La estructura definitiva todavía no está cerrada.

------------------------------------------------------------------------

# 30. Ejemplo de continuidad mediante Resumen

Q1:

``` text
Página X

Día 1:
RAW = 50
Mes = 50
Quincena = 50
Día = 50

Día 2:
RAW = 85
Mes = 85
Quincena = 85
Día = 35
```

Al finalizar Q1:

``` text
Resumen Q1

Página X
mes = 85

rojo = 0
interésDeuda = rojo × interés
```

Q2:

``` text
Día 1:
RAW = 135

Mes = 135
Quincena = 135 - 85 = 50
Día = 50
```

Día 2:

``` text
RAW = 213

Mes = 213
Quincena = 213 - 85 = 128
Día = 128 - 50 = 78
```

------------------------------------------------------------------------

# 31. Ganancia final

La ganancia final debe considerar los valores obtenidos durante el
procesamiento y las variables de continuidad correspondientes.

Conceptualmente:

``` text
gananciaFinal =
    ganancia
    - rojo
    - interésDeuda
```

La fórmula completa, incluyendo aranceles, porcentaje, pago, moneda y
demás variables, debe definirse en `REGLAS_CALCULO.md`.

------------------------------------------------------------------------

# 32. Historial / fotografía

El Historial es diferente del Resumen.

El Historial representa una fotografía completa e inmutable de la
información calculada de una quincena.

Su objetivo es permitir consultar una quincena anterior sin volver a
ejecutar el motor de cálculo utilizando la configuración actual.

------------------------------------------------------------------------

# 33. Inmutabilidad del Historial

Supongamos que una página inicialmente funciona así:

``` text
Página X

moneda = USD
coins = true
valorCoins = 0.2
tope = 50
descuento = 15%
```

El usuario trabaja con esa configuración durante un año.

Posteriormente la página cambia:

``` text
moneda = EUR
coins = false
tope = false
descuento = false
```

Los registros nuevos deben utilizar las nuevas reglas.

Pero las quincenas históricas no deben cambiar.

Al consultar una quincena anterior:

``` text
Año
 ↓
Mes
 ↓
Quincena
 ↓
Historial
 ↓
mostrar fotografía
```

No se debe hacer:

``` text
RAW histórico
 ↓
configuración actual de Página X
 ↓
recalcular
```

porque eso podría producir resultados diferentes a los originales.

------------------------------------------------------------------------

# 34. Diferencia entre Historial y Resumen

## Historial

Representa:

> "¿Cómo estaba exactamente esta quincena cuando fue guardada?"

Es una fotografía.

Características:

-   completo;
-   calculado;
-   consultable;
-   inmutable;
-   no se recalcula al consultar;
-   conserva el estado de las reglas aplicadas en ese momento.

## Resumen

Representa:

> "¿Qué información necesito conservar para poder continuar calculando
> la siguiente quincena?"

Características:

-   resumido;
-   orientado a continuidad;
-   utilizado por futuras operaciones;
-   contiene acumulados y estados necesarios;
-   no reemplaza al Historial.

------------------------------------------------------------------------

# 35. Flujo de una quincena completa

``` text
Crear quincena
      ↓
Registrar monedas
      ↓
Registrar días
      ↓
Registrar páginas dentro de los días
      ↓
Procesar RAW
      ↓
Generar resultados
      ↓
Actualizar resumen/estado
      ↓
Recalcular cuando sea necesario
      ↓
Cerrar quincena
      ↓
Generar Historial
```

El cierre y la generación de Historial son operaciones diferentes.

------------------------------------------------------------------------

# 36. Modificación antes de generar Historial

Una quincena que todavía no tiene una fotografía histórica puede seguir
modificándose.

Ejemplo:

``` text
Q2
│
├── D1
├── D2
├── D3
└── D4
```

Se modifica D1:

``` text
D1 RAW antiguo
     ↓
D1 RAW nuevo
     ↓
recalcular D1
     ↓
recalcular D2
     ↓
recalcular D3
     ↓
recalcular D4
     ↓
actualizar resultados
```

Mientras no se haya generado la fotografía histórica, los resultados
actuales pueden ser recalculados.

------------------------------------------------------------------------

# 37. Principio de dependencia

Los cálculos deben respetar las dependencias temporales.

Ejemplo:

``` text
D1
 ↓
D2
 ↓
D3
 ↓
D4
```

Si D1 cambia:

``` text
D1 cambia
 ↓
D2 puede cambiar
 ↓
D3 puede cambiar
 ↓
D4 puede cambiar
```

Por lo tanto, el motor debe ser capaz de determinar desde dónde iniciar
el recálculo y hasta dónde debe propagarse.

------------------------------------------------------------------------

# 38. Operaciones principales identificadas

Hasta este punto se identifican las siguientes operaciones de negocio:

``` text
registrarUsuario()
crearTablero()
agregarUsuarioAlTablero()
configurarPermisos()

registrarConstantes()
registrarPagina()

crearQuincena()
registrarMonedas()

registrarDia()
editarDia()
eliminarRegistro()

recalcularDia()
recalcularDesdeRegistro()

cerrarQuincena()
generarResumen()
generarHistorial()
```

Estas funciones son conceptuales. Los nombres definitivos pueden cambiar
durante el diseño técnico.

------------------------------------------------------------------------

# 39. Operaciones pendientes de especificación detallada

Todavía deben documentarse formalmente:

-   creación del tablero;
-   invitación/agregado de usuarios;
-   permisos detallados;
-   bloqueo de operaciones;
-   configuración de constantes;
-   creación/edición de páginas;
-   registro de monedas;
-   reglas completas de coins;
-   reglas completas de descuentos;
-   reglas completas de topes;
-   reglas completas de cortes;
-   reglas completas de parciales;
-   reglas de aranceles;
-   reglas completas de interés;
-   cálculo completo de ganancias;
-   eliminación de registros;
-   cierre de quincena;
-   generación de Resumen;
-   generación de Historial;
-   versiones de Historial;
-   comparación entre versiones;
-   auditoría de cambios.

------------------------------------------------------------------------

# 40. Siguiente fase

Después de este documento, la siguiente fase recomendada es:

## `REGLAS_CALCULO.md`

Antes de diseñar definitivamente Firestore, se debe especificar el
comportamiento de cada tipo de página y sus combinaciones.

Primero:

``` text
Página normal
Página mensual
Página con coins
Página con descuento
Página con tope
Página con corte
Página con parcial
```

Después las combinaciones:

``` text
Mensual + Coins
Mensual + Tope
Mensual + Descuento
Mensual + Coins + Tope
Mensual + Coins + Descuento
Mensual + Tope + Descuento
Mensual + Coins + Tope + Descuento
Corte + Parcial
Mensual + Corte
Mensual + Tope + Corte
...
```

Para cada combinación se debe definir:

1.  Qué registra el usuario.
2.  Qué representa el RAW.
3.  Qué información anterior necesita.
4.  Cómo se calcula el mes.
5.  Cómo se calcula la quincena.
6.  Cómo se calcula el día.
7.  Cómo se aplica la moneda.
8.  Cómo se aplican coins.
9.  Cómo se aplica descuento.
10. Cómo funciona el tope.
11. Cómo funciona corte/parcial.
12. Qué pasa al editar.
13. Qué registros posteriores deben recalcularse.
14. Qué información debe quedar en el Resumen.
15. Qué información termina en el Historial.

------------------------------------------------------------------------

# 41. Estado del documento

**Estado:** diseño funcional inicial.

Este documento representa las reglas y flujo definidos hasta el momento.

No debe considerarse todavía el esquema definitivo de base de datos.

La base de datos se diseñará después de completar las reglas de cálculo
y las operaciones de negocio.

------------------------------------------------------------------------

# 42. Regla fundamental del proyecto

> **Primero se define qué debe hacer el sistema; después se define cómo
> almacenar esa información; finalmente se implementa.**

El flujo funcional y las reglas de negocio son la fuente de verdad para
el diseño posterior de:

``` text
Base de datos
    ↓
Servicios
    ↓
Motor de cálculo
    ↓
API / operaciones críticas
    ↓
Frontend
```
