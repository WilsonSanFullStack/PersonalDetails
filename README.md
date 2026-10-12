# 📱 AppAgenda Mobile

**Sistema de gestión financiera por quincenas para dispositivos móviles.**

AppAgenda Mobile es la nueva versión de AppAgenda, rediseñada desde cero para
funcionar en dispositivos móviles y utilizar una arquitectura basada en
servicios cloud.

El proyecto toma como referencia funcional la versión anterior desarrollada con
**Electron + SQLite**, pero **no busca replicar su arquitectura ni su estructura
de datos**.

La nueva versión prioriza:

* 🧮 Cálculos contables consistentes
* ☁️ Persistencia en la nube
* 👥 Soporte multiusuario
* 📱 Adaptación a dispositivos móviles
* ⚡ Reducción de lecturas y procesamiento innecesario
* 🔄 Resultados calculados reutilizables
* 📋 Continuidad entre quincenas
* 🔒 Protección de información histórica
* 💰 Coste operativo cero

> **Estado actual:** 🟡 En diseño
> La implementación todavía no ha comenzado.

---

## 🎯 Objetivo

AppAgenda Mobile busca facilitar la gestión financiera organizada por
**quincenas**, permitiendo registrar la información diaria y obtener resultados
contables sin tener que reconstruir todo el historial cada vez que se consulta
la aplicación.

El sistema debe permitir trabajar con:

* 📅 Registros diarios
* 📄 Diferentes tipos de páginas
* 🧮 Cálculos diarios y quincenales
* 💱 Diferentes monedas
* 💰 Aranceles (solo para pago)
* 📊 Porcentajes empresariales
* 🔢 Topes y acumulaciones
* ✂️ Parciales y cortes
* 📈 Estadísticas
* 💵 Cálculo de pago
* 👥 Espacios de trabajo multiusuario
* 📋 Historial de quincenas
* 🔄 Continuidad entre quincenas

---

# 🧠 Filosofía del proyecto

> **Los modelos de datos deben ser consecuencia de las reglas de negocio, no el
> punto de partida.**

Antes de decidir dónde guardar un dato, se debe determinar:

1. Qué representa.
2. Si es un dato original o calculado.
3. Qué cálculos dependen de él.
4. Qué información necesita una operación.
5. Qué información suele consultarse conjuntamente.
6. Cuándo debe actualizarse.
7. Qué ocurre si cambia.
8. Si debe conservarse históricamente.

---

# 🏗️ Stack tecnológico

| Área                | Tecnología                                      |
| ------------------- | ----------------------------------------------- |
| 📱 Aplicación móvil | Expo + React Native                             |
| 🔷 Lenguaje         | TypeScript                                      |
| ☁️ Base de datos    | Firebase Firestore                              |
| 🔐 Autenticación    | Firebase Authentication                         |
| 🔒 Seguridad        | Firestore Security Rules                        |
| 🧮 Motor de cálculo | TypeScript puro, independiente de React Native  |

### Sin Cloud Functions

**Cloud Functions no forma parte de la arquitectura.**

Toda la lógica de negocio, validación y cálculo se ejecuta en la aplicación.
El motor de cálculo se diseña de forma independiente para que pueda trasladarse
a otro entorno si en el futuro fuese necesario, pero no se asume su existencia.

Consecuencias de esta decisión:

* Las operaciones críticas se validan en el cliente y se protegen con Firestore
  Rules e IDs deterministas.
* La idempotencia se basa en IDs deterministas y en la verificación de
  `revision` / `updatedAt`, no en funciones del servidor.
* Las operaciones que no caben en una transacción se ejecutan por fases con
  estados (`pendiente`, `en_proceso`, `completado`, `error`) y recuperación
  manual.
* Los bloqueos de formulario son cooperativos y viven en el frontend.

---

# 🧩 Arquitectura conceptual

```text
Configuración
     │
     ├── Páginas
     ├── Aranceles
     └── Constantes
           │
           ▼
   Datos originales
           │
           ▼
   RegistroPágina / Préstamo
           │
           ▼
     Cálculo del día
           │
           ▼
     ResultadoDía
           │
           ▼
   ResultadoQuincena (QF)
        │       │
        │       ├──────────► Historial (copia inmutable)
        │       │
        ▼       └──────────► Resumen (continuidad)
     QAR de la siguiente
```

---

# 📝 Datos originales vs. datos calculados

Los datos originales son la fuente de verdad. QF es una representación
materializada que se calcula al registrar y se recalcula solo cuando algo
afecta los cálculos.

---

# 📅 Resultado del día

El día es la unidad de procesamiento. Un día existe solo cuando tiene al menos
un registro de crédito. Un día con solo préstamos no cuenta como día trabajado
ni como día existente para efectos de QF.

---

# 🔄 Recalculo e invalidación

Solo se recalcula el tramo afectado:

```text
Editar día 9
   ↓
recalcular día 9
   ↓
recalcular días 10..último existente
   ↓
recalcular totales de quincena
```

No se recalcula toda la quincena si no es necesario.

---

# 📈 Continuidad entre quincenas

El `Resumen` guarda lo necesario para que la siguiente quincena continúe:

* Acumulado mensual real por página.
* Ganancias/rojo.
* Promedios.

Al cerrar una quincena, su `Resumen` se copia al `QAR` de la siguiente.

---

# 💱 Monedas

* **Estadísticas:** tasa principal, definida por el usuario.
* **Pago:** tasa real del estudio, solo al cerrar la quincena.

Los aranceles se aplican **solo** a la moneda de pago.

Una quincena no se puede cerrar sin moneda de pago.

---

# 📋 Historial

Copia inmutable de QF con moneda de pago y quincena cerrada. Versionado. No se
recalcula al consultar.

---

# 🔐 Seguridad

* Autenticación con Firebase Authentication.
* Roles por tablero: `admin` (creador), `editor`, `observador`.
* Firestore Rules protegen escrituras directas no autorizadas.
* El cliente valida; las Rules son la última línea de defensa.
* No se puede modificar QF, QAR, Resumen, revisiones, cierre ni historial
  directamente desde el cliente.

---

# 👥 Multiusuario

Cada tablero tiene un `adminId`. Los miembros viven en subcolección con rol.
Un usuario puede pertenecer a varios tableros con roles distintos.

---

# 💵 Costos

Coste objetivo: **$0**. Se optimiza evitando:

* recalcular quincenas innecesariamente;
* leer documentos que no se necesitan;
* reconstruir historial para obtener un dato;
* recalcular días no afectados;
* calcular conversiones no necesarias.

---

# 📌 Principios fundamentales

1. Los datos originales se conservan.
2. Los resultados se reutilizan.
3. Se recalcula solo lo necesario.
4. El Resumen mantiene la continuidad.
5. El Historial es inmutable.
6. La moneda depende del contexto (estadísticas / pago).
7. Firestore no se diseña como SQL.
8. La lógica de negocio es independiente.
9. La seguridad forma parte del diseño.
10. Primero las reglas, después los modelos.

---

# 📄 Licencia

Proyecto de uso privado / personal.
