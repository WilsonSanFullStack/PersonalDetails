# 📱 AppAgenda Mobile

Versión móvil y en línea del sistema AppAgenda, diseñada para **gestión financiera por quincenas** con arquitectura multiusuario sobre **Firebase**.

Esta versión reemplaza la edición local (Electron + SQLite) por una arquitectura cloud basada en tecnologías modernas para dispositivos móviles.

---

## 🎯 Descripción

AppAgenda Mobile es un sistema de gestión financiera estructurado por quincenas que permite:

- ✅ Registro diario por páginas
- ✅ Control contable de parciales y cortes
- ✅ Conversión de monedas por quincena
- ✅ Aplicación de aranceles y porcentaje empresarial
- ✅ Cálculo de pago final
- ✅ Trabajo multiusuario por Workspace
- ✅ Sincronización en tiempo real
- ✅ Auditoría de eventos críticos

**Diseñado para bajo costo operativo y alta integridad contable.**

---

## 🏗️ Arquitectura General

### Stack Tecnológico

| Componente         | Tecnología                               |
| ------------------ | ---------------------------------------- |
| **Frontend**       | Expo + React Native                      |
| **Base de datos**  | Firebase Firestore                       |
| **Autenticación**  | Firebase Auth                            |
| **Backend lógico** | Cloud Functions (operaciones críticas)   |
| **Seguridad**      | Firestore Rules + validación server-side |

---

## 📊 Estructura de Base de Datos

```
workspaces/{workspaceId}
  ├── pages/{pageId}
  ├── auditLogs/{logId}
  ├── quincenas/{quincenaId}
  │     └── dias/{dayId}
  │           └── pages/{pageWorkId}
```

### Conceptos Clave

#### 🏢 Workspace

Contenedor multiusuario que define miembros y aranceles globales.

#### 📄 Page

Configuración financiera. No almacena datos diarios.

#### 📅 Quincena

Unidad contable principal que acumula totales. Puede cerrarse (estado inmutable).

#### 🗓️ Day

Registro diario con totales ya calculados.

#### 📝 PageWork

Registro granular por página dentro de un día.

#### 📋 AuditLog

Registro de eventos críticos (cierre, reapertura, corte, parcial).

---

## 🔐 Seguridad

El sistema implementa múltiples capas de protección:

### Principios Fundamentales

- 🔒 Autenticación obligatoria
- 👥 Autorización por membresía en workspace
- 🚫 Escrituras críticas bloqueadas desde cliente
- 💰 Totales protegidos
- 🔄 Transacciones obligatorias
- 🗑️ Eliminación lógica (no física)
- 🔐 Inmutabilidad de quincena cerrada

### Operaciones Críticas (Backend)

Las siguientes operaciones se ejecutan exclusivamente mediante backend seguro o Cloud Functions:

- Crear Parcial
- Crear Corte
- Cerrar Quincena
- Reabrir Quincena

---

## 💳 Flujo Contable

### Parcial

- Solo uno activo por quincena
- Reemplaza el anterior automáticamente
- Ajusta totales mediante transacción

### Corte

- Puede haber múltiples históricos
- Invalida parcial activo
- Actualiza referencias en quincena

### Cierre de Quincena

Cuando `cerrado = true`:

- ❌ No se puede editar nada
- ❌ No se pueden crear registros
- ✅ Solo puede reabrir el owner
- 📝 Genera auditoría automáticamente

---

## 💰 Cálculo de Pago

### Proceso Paso a Paso

```
1. Leer totales de Quincena
   ↓
2. Convertir usando moneda.pago
   ↓
3. Aplicar arancel por moneda
   ↓
4. Aplicar porcentaje empresa
   ↓
5. Obtener valor final
```

**Nota:** Las estadísticas internas no se alteran durante el cálculo de pago.

---

## 📦 Estructura del Proyecto

```
/src
  /components       # Componentes UI reutilizables
  /screens          # Pantallas principales
  /navigation       # Configuración de navegación
  /services         # Lógica de acceso a Firestore
  /hooks            # Custom React hooks
  /context          # Context API providers
  /utils            # Funciones utilitarias
  /types            # Definiciones TypeScript
```

### Principio de Encapsulación

✨ **Los servicios encapsulan toda la lógica de acceso a Firestore.**
✨ **Nunca se realizan escrituras directas desde componentes.**

---

## 🚀 Instalación

### 1. Clonar repositorio

```bash
git clone <repo-url>
cd Agenda
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

Crear archivo `.env.local` con:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=<tu-api-key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<tu-auth-domain>
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<tu-project-id>
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<tu-storage-bucket>
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<tu-messaging-sender-id>
EXPO_PUBLIC_FIREBASE_APP_ID=<tu-app-id>
```

### 4. Ejecutar aplicación

```bash
npx expo start
```

Luego presiona `i` para iOS o `a` para Android.

---

## 📈 Costos y Escalabilidad

### Optimizado para:

- ✅ 1–2 workspaces activos inicialmente
- ✅ Bajo volumen de escritura
- ✅ Plan gratuito inicial de Firebase
- ✅ Escalable si aumenta el número de usuarios

### Estimación de Costos

| Operación          | Lecturas | Escrituras |
| ------------------ | -------: | ---------: |
| Crear PageWork     |      2-3 |        2-3 |
| Crear Parcial      |      3-4 |        3-4 |
| Crear Corte        |      3-4 |        3-4 |
| Desactivar Parcial |      2-3 |        2-3 |
| Ver Quincena       |      ~16 |          0 |

---

## 🛡️ Integridad de Datos

El sistema está diseñado para **prevenir**:

- ❌ Manipulación de totales
- ❌ Recalculo completo del histórico
- ❌ Escritura directa de estados críticos
- ❌ Eliminación física de registros
- ❌ Condiciones de carrera sin transacción

---

## 🧠 Principios del Proyecto

1. **Separación UI / Lógica / Base de datos**
2. **Totales almacenados**, no recalculados en lectura
3. **Inmutabilidad histórica** controlada
4. **Auditoría obligatoria** en eventos críticos
5. **Bajo costo operativo**
6. **Escalable** y flexible
7. **Multiusuario seguro**

---

## 📝 Documentación Técnica

Para información detallada sobre arquitectura, servicios y seguridad, consulta:

- 📖 [`sistema-gestion-quincenas-arquitectura-multiusuario.md`](sistema-gestion-quincenas-arquitectura-multiusuario.md) — Arquitectura completa del modelo de datos
- 🔐 [`DB_SEGURIDAD.md`](DB_SEGURIDAD.md) — Reglas de Firestore y seguridad
- 🛠️ [`DB_SERVICES.md`](DB_SERVICES.md) — Definición de servicios Firestore
- 🗂️ [`DB_ESTRUCTURA.md`](DB_ESTRUCTURA.md) — Estructura detallada de base de datos

---

## 🔮 Futuras Mejoras

- 📊 Reportes exportables
- 📜 Historial detallado de auditoría
- 📈 Dashboard estadístico
- 🔔 Notificaciones push
- 🔄 Versionado automático del modelo
- 🌐 Sincronización offline-first

---

## 📊 Comparativa: AppAgenda Desktop vs Mobile

| Aspecto            | Desktop            | Mobile                        |
| ------------------ | ------------------ | ----------------------------- |
| **Base de datos**  | SQLite local       | Firestore cloud               |
| **Usuarios**       | Single-user        | Multiusuario                  |
| **Sincronización** | Sin sincronización | Tiempo real                   |
| **Backend**        | Sin backend        | Backend seguro                |
| **Acceso**         | Local              | Cloud + cualquier dispositivo |

**AppAgenda Mobile representa la evolución del sistema hacia una arquitectura distribuida y segura.**

---

## 📄 Licencia

👤 Uso privado / proyecto personal.

---

## 🙋 Soporte

Para issues, preguntas o sugerencias, contacta al desarrollador o abre un issue en el repositorio.

---

**Versión:** 1.0.0  
**Última actualización:** Febrero 2026  
**Estado:** En desarrollo activo 🚀
