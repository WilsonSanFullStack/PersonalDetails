## Arquitectura Frontend – AppAgenda Mobile

### 1️⃣ Stack Tecnológico

- **Expo**
- **React Native**
- **Expo Router**
- **Firebase Auth**
- **Firestore**
- **Cloud Functions** (operaciones críticas)
- **TypeScript**

---

### 2️⃣ Tipo de Navegación

**Arquitectura Híbrida**

- **Drawer** → navegación principal
- **Stack** → navegación interna
- Rutas dinámicas por workspace y quincena

---

### 3️⃣ Estructura de Carpetas (Oficial)

```
app/
  _layout.tsx
  (auth)/
    _layout.tsx
    login.tsx
    register.tsx

  (app)/
    _layout.tsx
    workspace/
      [workspaceId]/
        _layout.tsx
        index.tsx              // Dashboard
        pages.tsx
        members.tsx

        quincenas/
          index.tsx            // Lista quincenas
          [quincenaId]/
            _layout.tsx
            index.tsx          // Resumen quincena
            days/
              [dayId].tsx      // Detalle día

context/
  AuthContext.tsx
  WorkspaceContext.tsx
  QuincenaContext.tsx

hooks/
  useAuth.ts
  useWorkspace.ts
  useQuincena.ts
  [otros hooks]

services/
  auth.service.ts
  workspace.service.ts
  quincena.service.ts
  pageWork.service.ts
  parcial.service.ts

types/
  auth.types.ts
  workspace.types.ts
  quincena.types.ts
  error.types.ts

components/
  screens/
    [componentes de pantalla]
  ui/
    [componentes reutilizables]
```

---

### 4️⃣ Flujo de Navegación

#### 4.1 Auth Flow

```
Login → Selección Workspace → Dashboard
```

- Si no autenticado → redirige a `/login`.

#### 4.2 Drawer Principal

Dentro de un workspace:

- Dashboard
- Quincenas
- Pages
- Miembros
- Cerrar sesión

El Drawer vive en: `(app)/workspace/[workspaceId]/_layout.tsx`

---

### 5️⃣ Layouts y Responsabilidades

#### 5.1 Root Layout (`app/_layout.tsx`)

**Responsable de:**

- Inicializar Firebase
- AuthProvider
- ThemeProvider
- Splash control
- No contiene lógica de negocio.

#### 5.2 Auth Layout

- Protege rutas públicas.
- Si usuario autenticado → redirect a workspace.

#### 5.3 Workspace Layout

Carga:

- Workspace actual
- Validación de membresía
- WorkspaceContext
- Si no es miembro → redirige.

#### 5.4 Quincena Layout

Carga:

- Quincena actual
- Validación de estado cerrado
- Provee QuincenaContext

---

### 6️⃣ Manejo de Estado

#### 6.1 Estado Global

Usar **Context API** inicialmente.

```
/context
  AuthContext.tsx
  WorkspaceContext.tsx
  QuincenaContext.tsx
```

No usar Redux aún (sobrearquitectura para tu escala).

#### 6.2 Principio

- **Context** → estado estructural
- **Servicios** → acceso a DB
- **Componentes** → UI pura

---

### 7️⃣ Integración con Servicios

**Nunca hacer:**
```typescript
addDoc(...)
```

**Siempre:**
```typescript
createPageWork(...)
createParcial(...)
closeQuincena(...)
```

**Flujo:**
```
Pantalla → Hook → Servicio → Backend
```

---

### 8️⃣ Control de Quincena Cerrada

Si `quincena.cerrado === true`:

- UI en modo solo lectura
- Botones deshabilitados
- Banner informativo visible
- Validación adicional en servicio

**Doble protección:**
- UI
- Backend

---

### 9️⃣ Manejo de Errores

**Estandarizar códigos:**

- `QUINCENA_CERRADA`
- `NO_PERMISSION`
- `PARCIAL_NO_PERMITIDO`
- `CORTE_INVALIDO`
- `INVALID_INPUT`

**En frontend:**

- Mostrar Alert
- Nunca exponer error técnico crudo

---

### 🔟 Convenciones de Código

#### Nombres

- **Pantallas:** PascalCaseScreen
- **Hooks:** useSomething
- **Servicios:** something.service.ts
- **Tipos:** /types

#### Separación UI / Lógica

- `/components` → UI pura
- `/screens` → composición
- `/hooks` → lógica
- `/services` → DB

---

### 1️⃣1️⃣ Escalabilidad Futura

Preparado para:

- Soporte web
- Más workspaces
- Dashboard estadístico
- Notificaciones push
- Offline caching

---

### 1️⃣2️⃣ Principios del Frontend

- Navegación clara
- Contextos mínimos
- Servicios encapsulados
- Sin lógica contable en componentes
- Modo solo lectura para histórico
- Errores estandarizados
- Código predecible

---

### 🧠 Por Qué Drawer + Stack Es Correcto

Porque:

- Tu app es administrativa
- Tiene secciones claras
- No es social ni feed-based
- Necesita navegación jerárquica
- Puede crecer en módulos

---

## 💡 Sugerencias de Implementación

### 1. Estructura de Tipos Centralizada

Crear un archivo `types/index.ts` que exporte todos los tipos para facilitar imports:

```typescript
// types/index.ts
export type * from './auth.types';
export type * from './workspace.types';
export type * from './quincena.types';
export type * from './error.types';
```

### 2. Error Boundary Global

Implementar un Error Boundary en el root layout para capturar errores no manejados:

```typescript
// components/ErrorBoundary.tsx
export const ErrorBoundary = ({ children }) => {
  // Capturar errores y mostrar fallback UI
};
```

### 3. Hook de Validación de Membresía

Crear un hook reutilizable para validar acceso a workspaces:

```typescript
// hooks/useWorkspaceAccess.ts
export const useWorkspaceAccess = (workspaceId: string) => {
  // Validar membresía y retornar estado
};
```

### 4. Servicio de Caché Local

Implementar persistencia local con AsyncStorage para:
- Última quincena vista
- Workspace actual
- Datos de usuario

```typescript
// services/cache.service.ts
export const cacheService = {
  setLastWorkspace,
  getLastWorkspace,
  setLastQuincena,
  getLastQuincena,
};
```

### 5. Interceptor de Errores Firestore

Centralizar el manejo de errores de Firestore:

```typescript
// services/firebase-error-handler.ts
export const handleFirestoreError = (error: Error): AppError => {
  // Mapear errores de Firestore a códigos estándar
};
```

### 6. Logging Estructurado

Implementar un sistema de logging para debugging en producción:

```typescript
// services/logger.service.ts
export const logger = {
  debug,
  info,
  warn,
  error,
};
```

### 7. Validación de Datos en Componentes

Usar validación con `zod` o `yup` antes de enviar datos:

```typescript
// validation/schemas.ts
export const pageWorkSchema = z.object({
  // Definir estructura esperada
});
```

### 8. Loading States Globales

Crear un context para manejar estados de carga globales:

```typescript
// context/LoadingContext.tsx
export const useLoading = () => {
  // Retornar estado de carga
};
```

### 9. Rutas Protegidas

Implementar un componente ProtectedRoute que valide autenticación:

```typescript
// navigation/ProtectedRoute.tsx
export const ProtectedRoute = ({ children }) => {
  // Validar autenticación y membership
};
```

### 10. Testing Structure

Preparar estructura para tests:

```
__tests__/
  services/
    pageWork.service.test.ts
  hooks/
    useWorkspace.test.ts
  components/
    Dashboard.test.tsx
```

### 11. Performance Optimizations

- Usar `React.memo()` en componentes de lista
- Lazy load con `expo-splash-screen`
- Implementar virtualization en listas largas con `FlashList`

### 12. Documentación de Componentes

Documentar componentes principales con JSDoc:

```typescript
/**
 * Dashboard del workspace
 * @param {string} workspaceId - ID del workspace
 * @returns {React.ReactNode}
 */
export const DashboardScreen = ({ workspaceId }) => {
  // ...
};
```

---

## 📋 Checklist de Implementación

- [ ] Estructura de carpetas base creada
- [ ] Contexts iniciales configurados
- [ ] Servicios de base de datos listos
- [ ] Root layout con providers
- [ ] Auth flow implementado
- [ ] Workspace layout con drawer
- [ ] Validación de membresía
- [ ] Manejo de errores estandarizado
- [ ] Caché local implementado
- [ ] Tests básicos
- [ ] Documentación actualizada
