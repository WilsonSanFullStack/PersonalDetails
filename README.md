# 📱 AppAgenda Mobile

**Sistema de gestión financiera por quincenas para dispositivos móviles.**

AppAgenda Mobile es la nueva versión de AppAgenda, rediseñada desde cero para funcionar en dispositivos móviles y utilizar una arquitectura basada en servicios cloud.

El proyecto toma como referencia funcional la versión anterior desarrollada con **Electron + SQLite**, pero **no busca replicar su arquitectura ni su estructura de datos**.

La nueva versión prioriza:

* 🧮 Cálculos contables consistentes
* ☁️ Persistencia en la nube
* 👥 Soporte multiusuario
* 📱 Adaptación a dispositivos móviles
* ⚡ Reducción de lecturas y procesamiento innecesario
* 🔄 Resultados calculados reutilizables
* 📋 Continuidad entre quincenas
* 🔒 Protección de información histórica
* 💰 Bajo costo operativo

> **Estado actual:** 🟡 En diseño
> La implementación todavía no ha comenzado. Actualmente se están definiendo las reglas de negocio, los datos necesarios y la arquitectura definitiva.

---

## 🎯 Objetivo

AppAgenda Mobile busca facilitar la gestión financiera organizada por **quincenas**, permitiendo registrar la información diaria y obtener resultados contables sin tener que reconstruir todo el historial cada vez que se consulta la aplicación.

El sistema debe permitir trabajar con:

* 📅 Registros diarios
* 📄 Diferentes tipos de páginas
* 🧮 Cálculos diarios y quincenales
* 💱 Diferentes monedas
* 💰 Aranceles
* 📊 Porcentajes empresariales
* 🔢 Topes y acumulaciones
* ✂️ Parciales y cortes
* 📈 Estadísticas
* 💵 Cálculo de pago
* 👥 Espacios de trabajo multiusuario
* 📋 Historial de quincenas
* 🔄 Continuidad entre quincenas

La prioridad no es únicamente almacenar información, sino **conservar la información necesaria para producir resultados correctos de forma eficiente y trazable**.

---

# 🧠 Filosofía del proyecto

La arquitectura de AppAgenda Mobile se está diseñando alrededor de una idea fundamental:

> **Los modelos de datos deben ser consecuencia de las reglas de negocio, no el punto de partida.**

Antes de decidir dónde guardar un dato, se debe determinar:

1. Qué representa.
2. Si es un dato original o calculado.
3. Qué cálculos dependen de él.
4. Qué información necesita una operación.
5. Qué información suele consultarse conjuntamente.
6. Cuándo debe actualizarse.
7. Qué ocurre si cambia.
8. Si debe conservarse históricamente.

Por esta razón, la estructura de Firestore **todavía no se considera definitiva**.

---

# 🏗️ Stack tecnológico

| Área                | Tecnología                                      |
| ------------------- | ----------------------------------------------- |
| 📱 Aplicación móvil | Expo + React Native                             |
| 🔷 Lenguaje         | TypeScript                                      |
| ☁️ Base de datos    | Firebase Firestore                              |
| 🔐 Autenticación    | Firebase Authentication                         |
| 🔒 Seguridad        | Firestore Security Rules + validaciones         |
| 🧮 Motor de cálculo | Lógica independiente de React Native y Firebase |

La primera versión está orientada a utilizar principalmente **Firebase Authentication y Firestore**, buscando mantener el proyecto dentro de un costo operativo muy bajo.

### Cloud Functions

Cloud Functions **no se considera actualmente un requisito obligatorio para la primera versión**.

Las operaciones que eventualmente necesiten ejecución confiable del lado servidor se evaluarán cuando las reglas de negocio, concurrencia y necesidades de seguridad estén completamente definidas.

El motor de cálculos se diseña de forma independiente para que posteriormente pueda ejecutarse en otro entorno si fuese necesario.

---

# 🧩 Arquitectura conceptual

La aplicación se está diseñando alrededor de una separación entre:

```text
Configuración
     │
     ├── Páginas
     ├── Aranceles
     └── Monedas
           │
           ▼
   Datos originales
           │
           ▼
   RegistroPágina
           │
           ▼
     Cálculo del día
           │
           ▼
     ResultadoDía
           │
           ▼
   ResultadoQuincena
        │       │
        │       ├──────────► Historial
        │       │
        ▼       └──────────► Resumen
     Continuidad
```

Esta estructura es **conceptual**, no una representación definitiva de Firestore.

La ubicación física de cada dato se decidirá posteriormente según los patrones reales de lectura, escritura, actualización y consistencia.

---

# 📝 Datos originales vs. datos calculados

Uno de los principios principales del proyecto es distinguir entre la información introducida originalmente y los resultados derivados.

## Datos originales

Un registro debe conservar los valores que realmente fueron introducidos o registrados por el usuario.

Por ejemplo:

```text
RegistroPágina
├── información original
├── valores registrados
└── contexto necesario
```

No se pretende almacenar dentro del registro original todos los resultados derivados como:

* USD del día
* USD de la quincena
* total del día
* créditos
* promedios
* valores de estadísticas
* resultado final de la quincena

Estos valores pertenecen al proceso de cálculo y a sus resultados correspondientes.

---

# 📅 Resultado del día

El **día** constituye una unidad importante de procesamiento.

El flujo conceptual es:

```text
RegistroPágina
      ↓
Registros del día
      ↓
Cálculo
      ↓
ResultadoDía
```

`ResultadoDía` contiene información procesada que puede ser utilizada posteriormente por la interfaz y por cálculos de mayor nivel.

La intención es evitar que cada consulta tenga que reconstruir constantemente la información original.

---

# 📊 Resultado de la quincena

La quincena es una unidad contable superior que utiliza los resultados de los días.

Conceptualmente:

```text
ResultadoDía
     │
     ├── Día 1
     ├── Día 2
     ├── Día 3
     └── ...
          ↓
ResultadoQuincena
```

El sistema busca evitar recalcular una quincena completa cada vez que el usuario simplemente la consulta.

La estrategia prevista es:

```text
Registrar
   ↓
Calcular cuando corresponda
   ↓
Guardar resultado
   ↓
Consultar resultado posteriormente
```

Si un dato cambia y afecta cálculos posteriores, el sistema deberá identificar qué resultados necesitan ser invalidados o recalculados.

---

# 🔄 Recalculo e invalidación

Los resultados calculados no deben considerarse automáticamente permanentes.

Un cambio en los datos originales puede provocar que:

```text
RegistroPágina
      ↓
ResultadoDía
      ↓
Días posteriores
      ↓
ResultadoQuincena
```

necesiten ser recalculados.

Por ello, el diseño contempla estados conceptuales como:

```text
No calculado
Calculado
Necesita recalcular
```

El objetivo es recalcular **únicamente la información afectada**, evitando procesamientos innecesarios.

---

# 📈 Continuidad entre quincenas

La información de una quincena puede ser necesaria para calcular correctamente una quincena posterior.

Por ejemplo:

```text
Quincena 1
Página A
Acumulado: 500
       │
       ▼
Quincena 2
Página A
Valor actual: 550
       │
       ▼
Resultado: 50
```

Para resolver este tipo de dependencia existe el concepto de **Resumen**.

## Resumen

El `Resumen` no es únicamente un reporte visual.

Su función principal es conservar los datos acumulados que se necesitan para mantener la continuidad entre quincenas.

Esto permite que una quincena posterior pueda utilizar directamente información relevante de la anterior sin tener que reconstruir todo el historial.

---

# 💰 Topes, parciales y cortes

El sistema contiene reglas contables que requieren mantener estado entre diferentes días y quincenas.

Entre ellas se encuentran:

### Topes

Los valores pueden acumularse entre quincenas hasta alcanzar un determinado límite.

Conceptualmente:

```text
Acumulación
     ↓
¿Alcanzó el tope?
   ↙       ↘
 No         Sí
 ↓           ↓
Continúa   Se paga
              ↓
        Nueva acumulación
```

La estructura exacta todavía forma parte del diseño.

### Parciales

Los parciales requieren mantener información sobre cuál es el parcial vigente y cómo afecta los cálculos posteriores.

La existencia de un nuevo parcial puede cambiar cuál es considerado el más reciente.

### Cortes

Los cortes representan otro tipo de evento que puede modificar el estado relacionado con los parciales y mantener información histórica.

Las reglas completas de topes, parciales y cortes todavía están siendo definidas antes de establecer los modelos definitivos.

---

# 💱 Monedas y cálculo de pago

El sistema distingue entre el contexto utilizado para **estadísticas** y el contexto utilizado para **pago**.

La idea es evitar duplicar innecesariamente los valores base.

Conceptualmente:

```text
Resultado base
     │
     ├──────────────► Estadísticas
     │                    │
     │                 Moneda
     │                 estadísticas
     │
     └──────────────► Pago
                          │
                       Moneda
                        pago
                          │
                          ▼
                     Aranceles
                          │
                          ▼
                   % empresarial
                          │
                          ▼
                     Pago final
```

Los valores internos de las estadísticas no deben alterarse simplemente porque se esté calculando un pago.

---

# 📋 Historial

El historial tiene una responsabilidad diferente al resultado normal de una quincena.

Mientras los resultados actuales pueden recalcularse, el historial representa una **fotografía inmutable de una quincena en un momento determinado**.

Conceptualmente:

```text
ResultadoQuincena
       │
       ▼
    Historial
       │
       └── Versión 1
```

Si posteriormente es necesario regenerar el historial:

```text
Historial
├── v1
└── v2
```

La versión anterior no se sobrescribe silenciosamente.

Cada nueva versión debe conservar:

* El estado calculado correspondiente.
* La información necesaria para interpretar ese estado.
* La versión.
* La explicación proporcionada por el usuario.
* La información necesaria para identificar cambios cuando sea posible.

Las versiones históricas **no participan en el cálculo normal de nuevas quincenas**.

---

# 🔒 Integridad histórica

Una vez generado un historial, los cambios posteriores en:

* páginas,
* aranceles,
* monedas,
* registros,
* resultados actuales,

no deben modificar retroactivamente la versión histórica almacenada.

La finalidad es garantizar que:

> **El historial represente exactamente el resultado que se decidió conservar en ese momento.**

---

# 🔐 Seguridad

La seguridad se diseñará alrededor de varios niveles:

* 🔑 Autenticación mediante Firebase Authentication.
* 👥 Autorización según pertenencia al Workspace.
* 🔒 Validación de permisos.
* 🛡️ Protección de información calculada.
* 📋 Auditoría de eventos importantes.
* 🔄 Control de estados que puedan producir inconsistencias.
* 🚫 Protección de quincenas cerradas.
* 🧾 Conservación de información histórica.

Sin embargo, las reglas definitivas de Firestore y la distribución exacta entre cliente y servidor **todavía no están cerradas**.

La seguridad final dependerá de las reglas de negocio y del modelo de datos definitivo.

---

# 👥 Multiusuario y Workspace

AppAgenda Mobile está pensado para trabajar con **Workspaces**.

Un Workspace permite agrupar la información y controlar qué usuarios pueden acceder a ella.

Conceptualmente:

```text
Workspace
│
├── Usuarios / miembros
│
├── Configuración
│
├── Páginas
│
├── Quincenas
│
└── Información relacionada
```

La estructura definitiva todavía está siendo evaluada para determinar qué información debe pertenecer al Workspace, al usuario o a otra entidad.

---

# ☁️ Firebase y diseño de datos

El proyecto utiliza Firestore, pero **no pretende trasladar directamente el modelo relacional de la versión Electron**.

Firestore requiere diseñar teniendo en cuenta:

* Qué información se consulta normalmente junta.
* Qué operaciones necesitan pocos accesos.
* Qué datos cambian frecuentemente.
* Qué datos son históricos.
* Qué información puede duplicarse de forma controlada.
* Qué datos necesitan consistencia fuerte.
* Qué resultados conviene persistir.
* Qué operaciones requieren recalculación.

### Duplicación controlada

La duplicación de información no se considera automáticamente incorrecta.

Puede utilizarse cuando:

* reduce lecturas,
* evita procesamiento repetitivo,
* mejora una consulta frecuente,
* no genera problemas importantes de consistencia,
* y existe una estrategia clara para actualizarla.

La decisión se tomará caso por caso.

---

# 🧮 Motor de cálculo

La lógica de cálculo debe permanecer independiente de React Native y Firebase.

De forma conceptual, se contemplan funciones como:

```text
calcularPágina()
calcularDía()
calcularMensual()
calcularTope()
calcularParcial()
calcularTotales()
calcularQuincena()
```

Estas funciones todavía son parte del diseño y pueden cambiar a medida que se definan las reglas exactas.

La finalidad de esta separación es que las reglas contables no dependan directamente de:

* componentes React Native,
* pantallas,
* hooks,
* Firestore,
* navegación.

---

# 📁 Organización del proyecto

La estructura definitiva de carpetas todavía puede cambiar.

La intención general es mantener separadas las responsabilidades:

```text
/src
├── components/     # Componentes reutilizables
├── screens/        # Pantallas
├── navigation/     # Navegación
├── services/       # Acceso a servicios externos
├── hooks/          # Hooks personalizados
├── context/        # Estado/contextos globales
├── utils/          # Utilidades
├── types/          # Tipos TypeScript
└── ...
```

Esta estructura es una referencia inicial y no debe considerarse definitiva mientras la arquitectura continúe en diseño.

### Principio de encapsulación

Las pantallas y componentes no deberían contener directamente la lógica de acceso a Firestore.

La intención es mantener una separación similar a:

```text
Pantalla
   ↓
Hook / lógica de presentación
   ↓
Servicio
   ↓
Firebase
```

Esto facilita posteriormente:

* pruebas,
* mantenimiento,
* cambios de implementación,
* reutilización,
* control de errores.

---

# 💵 Costos

Uno de los objetivos iniciales es mantener el proyecto con un **costo operativo muy bajo**, idealmente utilizando los servicios gratuitos disponibles de Firebase mientras el volumen de uso lo permita.

El proyecto inicialmente está pensado para un volumen reducido de usuarios y Workspaces.

No se consideran definitivas estimaciones concretas de lecturas o escrituras mientras el modelo de datos continúe en diseño.

La optimización se realizará principalmente evitando:

* recalcular quincenas innecesariamente,
* leer documentos que no sean necesarios,
* reconstruir información histórica para obtener un solo dato,
* recalcular días que no fueron afectados,
* calcular conversiones que no sean necesarias,
* procesar información que no cambió.

---

# 🛠️ Estado del proyecto

Actualmente el proyecto se encuentra en:

### 🟡 Fase: Diseño

La implementación todavía no es la prioridad.

El orden previsto es definir primero las reglas de negocio y después convertirlas en modelos de datos.

### Próximas etapas

```text
1. Tipos de página
        ↓
2. Propiedades de cada página
        ↓
3. RegistroPágina
        ↓
4. Cálculo de una página
        ↓
5. Cálculo del día
        ↓
6. ResultadoDía
        ↓
7. Dependencias entre días
        ↓
8. Páginas mensuales
        ↓
9. Topes
        ↓
10. Parciales
        ↓
11. Cortes
        ↓
12. ResultadoQuincena
        ↓
13. Resumen
        ↓
14. Monedas y aranceles
        ↓
15. Cálculo de pago
        ↓
16. Cierre
        ↓
17. Historial
        ↓
18. Versionado
        ↓
19. Auditoría
        ↓
20. Seguridad
        ↓
21. Servicios
        ↓
22. Firestore
        ↓
23. Implementación React Native
```

> **Los modelos son el resultado de las reglas, no el punto de partida.**

---

# 📚 Documentación

La documentación principal del proyecto se divide actualmente en dos documentos.

### 📖 `documentacion.md`

Contiene la **especificación funcional y de negocio**.

Incluye conceptos como:

* Aranceles
* Monedas
* Páginas
* Quincenas
* Días
* Registros
* Resultados
* Resumen
* Historial
* Topes
* Parciales
* Cortes
* Cálculo de pago
* Reglas pendientes de definición

### 🏗️ `estructura.md`

Contiene la **arquitectura y principios técnicos del nuevo sistema**.

Incluye:

* separación entre datos originales y calculados,
* estrategia de procesamiento,
* invalidación y recalculación,
* diseño orientado a Firestore,
* rendimiento,
* continuidad entre quincenas,
* historial,
* motor de cálculo,
* criterios para decidir la estructura de datos.

> Estos dos documentos son actualmente la referencia principal del diseño.

Los documentos antiguos de seguridad, servicios y estructura de base de datos se consideran material de referencia y **no representan necesariamente la arquitectura definitiva**.

---

# 🗃️ Relación con AppAgenda Desktop

La versión anterior de AppAgenda fue desarrollada utilizando:

```text
Electron
+
React
+
SQLite
+
Sequelize
```

La versión Mobile no pretende ser una migración directa.

La aplicación anterior se utiliza principalmente como referencia para:

* comportamiento existente,
* reglas de negocio,
* cálculos,
* casos especiales,
* errores conocidos,
* funcionalidades que deben conservarse.

La arquitectura, los modelos y las relaciones pueden cambiar cuando exista una solución mejor adaptada a:

* dispositivos móviles,
* Firestore,
* multiusuario,
* sincronización,
* costos,
* consistencia,
* rendimiento.

---

# 🔮 Posibles mejoras futuras

Entre las funcionalidades que podrían incorporarse posteriormente:

* 📊 Reportes exportables
* 📈 Dashboard estadístico
* 📜 Auditoría más detallada
* 🔔 Notificaciones
* 📦 Importación y exportación de datos
* 🔄 Mejoras de sincronización
* 📱 Funcionamiento offline-first
* 🧩 Nuevas herramientas de análisis
* 🔐 Mejoras avanzadas de control de acceso

Estas funcionalidades no forman parte necesariamente de la primera versión.

---

# 📌 Principios fundamentales

AppAgenda Mobile se desarrolla siguiendo estos principios:

### 1. Los datos originales deben conservarse

La información introducida por el usuario debe poder distinguirse de los resultados derivados.

### 2. Los resultados deben reutilizarse

No se debe recalcular información costosa cada vez que se muestra una pantalla.

### 3. El sistema debe recalcular únicamente lo necesario

Un cambio no debería obligar automáticamente a reconstruir toda una quincena.

### 4. El resumen mantiene la continuidad

`Resumen` no es solamente una vista; conserva información necesaria para cálculos posteriores.

### 5. El historial es inmutable

Una versión histórica no debe cambiar silenciosamente.

### 6. La moneda depende del contexto

Estadísticas y pago pueden utilizar diferentes valores de conversión sin modificar los valores base.

### 7. Firestore no debe diseñarse como SQL

La estructura debe responder a los patrones reales de acceso de la aplicación.

### 8. La lógica de negocio debe ser independiente

Los cálculos no deben depender de React Native ni directamente de Firebase.

### 9. La seguridad forma parte del diseño

No se debe asumir que las validaciones realizadas en la interfaz son suficientes.

### 10. Primero las reglas, después los modelos

No se debe crear un modelo simplemente porque existía uno equivalente en la aplicación anterior.

---

# 📄 Licencia

Proyecto de uso privado / personal.

---

## 👨‍💻 Estado

**Proyecto:** AppAgenda Mobile
**Versión:** 1.0.0 *(en planificación)*
**Estado:** 🟡 En diseño
**Tecnología principal:** Expo + React Native + TypeScript + Firebase

---

> **AppAgenda Mobile no es simplemente una versión móvil de AppAgenda.**
>
> Es un rediseño del sistema orientado a una arquitectura cloud, multiusuario y basada en resultados calculados, manteniendo como prioridad la **integridad de la información, la continuidad contable y la eficiencia de procesamiento**.
