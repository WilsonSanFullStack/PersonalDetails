# App-Agenda - Especificaciones

> Documento de diseño progresivo.

> Este documento contiene las especificaciones, reglas de negocio,
> modelos propuestos, interrogantes y decisiones pendientes del nuevo
> App-Agenda.
>
> La aplicación será diseñada desde cero tomando la aplicación Electron
> anterior únicamente como referencia funcional.
>
> No se busca trasladar directamente la estructura de la aplicación
> anterior. Los modelos, relaciones y procesos serán rediseñados según
> las necesidades de la nueva aplicación.
>
> Las decisiones marcadas como interrogantes permanecerán abiertas hasta
> analizar completamente la lógica que las utiliza.

## 1. Objetivo del proyecto

Generar estadísticas quincenales a partir de los registros de trabajo
realizados durante una quincena.

## Anotaciones generales

### Principios de diseño

1. Los datos originales deben conservarse separados de los resultados
   calculados siempre que sea necesario.

2. Las estadísticas actuales pueden recalcularse utilizando los datos
   actuales de la aplicación.

3. El Resumen conserva los acumulados necesarios para continuar los
   cálculos entre quincenas.

4. El Historial conserva snapshots completos e inmutables de una
   quincena calculada.

5. Generar nuevamente un historial no modifica una versión existente:
   crea una nueva versión.

6. Una nueva versión del historial requiere una justificación escrita
   por el usuario.

7. Cuando sea posible, el sistema debe detectar automáticamente qué
   información cambió entre versiones.

8. Las versiones históricas no participan en el recálculo normal.

9. Los cambios posteriores en páginas, aranceles, monedas o registros
   no deben modificar una versión histórica existente.

10. Las decisiones sobre estructura de DB deben tomarse después de
    analizar las reglas de negocio que utilizan cada dato.

## 2. Arquitectura General

### 2.1 DB

Pendiente de diseño definitivo.

La base de datos debe almacenar los datos necesarios para reconstruir
los cálculos y mantener la continuidad entre quincenas.

### 2.2 Server

Pendiente de diseño.

Será responsable de las operaciones que requieran acceso/control sobre
los datos y de la lógica que posteriormente se determine que debe
ejecutarse fuera del cliente.

### 2.3 Frontend

Pendiente de diseño.

Será responsable de la interacción con el usuario, registro de datos,
visualización de resultados y ejecución de las operaciones permitidas.


## 3 Modelos/DB

  ### 3.1 Aranceles/DB

  - id string
  - userId string
  - USD string
  - EURO string
  - GBP string
  - Porcentaje string
  
    ### 3.1.1 anotaciones

      este modelo contiene las propiedades necesarias para hacer el calculo de las divisas y el porcentaje que se debe descontar del estudio.

  ### 3.2 Moneda/DB

  - id string
  - dolar string
  - euro string
  - gbp string
  - pago boolean

### 3.2.1 anotaciones

este modelo tiene los valores de las divisas respecto al peso y marca con true o false si es para pago o es para estadisticas.

seria mas eficiente tener un modelo para modenas de estadisticas y otro para monedas de pago o manejar dos registros de monedas?

### 3.3 Paginas/DB

- id  string
- name string
- coins boolean
- valorCoins string
- moneda ["USD", "EURO", "GBP", "COP"]
- mensual boolean
- tope boolean
- valorTope string
- descuento boolean
- valorDescuento string


### 3.3.1 anotaciones

este modelo guarda las propiedades necesarias para crear paginas debe ser global cualquier usuario puede ver las paginas registradas y puede usar esta informacion

### 3.4 Quincena/DB

- id string
- name string
- inicio string
- year string
- fin string
- cerrado boolean
- historicoDetalle boolean
- resumen boolean

### 3.4.1 anotaciones
este modelo tiene las propiedades para crear una quincena y manejar un historial limpio continuo

### 3.5 day/DB

- id string
- name string
- page string
- 

### 3.5.1 anotaciones
### 3.5.2 interrogantes

- aqui no se si crear un modelo con la informacion de la pagina y luego hacer referencia con relaciones a esa pagina y sacar el registo por el dia y la quincena no se si consume mas a la db o es mejor montar las propiedades completas de una pagina como esta funcionando actualmente en electrom 

## Anotaciones generales
Las consultas normales de una quincena abierta recalculan los resultados a partir de los datos actuales.

El Resumen conserva los acumulados necesarios para continuar el cálculo entre quincenas.

El Historial conserva snapshots completos e inmutables de una quincena calculada.

Generar nuevamente el historial no modifica una versión existente: crea una nueva versión.

Una nueva versión requiere una justificación escrita por el usuario y registra automáticamente los cambios detectados cuando sea posible.

Las versiones históricas no participan en el recálculo normal y no se modifican por cambios posteriores en páginas, aranceles, monedas o registros.