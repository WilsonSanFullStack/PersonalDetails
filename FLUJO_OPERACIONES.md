# Flujo de Operaciones — AppAgenda Mobile

## 1. Objetivo

Definir el flujo funcional de las operaciones principales.

---

## 2. Principio general

Registrar no es un CRUD simple. Desencadena cálculos y actualizaciones.

```text
Operación → Validación → Contexto → Procesamiento → Vista previa
→ Confirmación → Persistencia → Actualización dependiente
```

---

## 3. Estructura general

```text
Usuario
   ↓
Tablero
   ├── Miembros
   ├── Páginas
   ├── Aranceles
   ├── Constantes
   ├── Quincenas
   ├── Monedas
   ├── Registros de créditos
   ├── Préstamos
   ├── Resumen
   └── Historial
```

### 3.1 Usuario

Se registra independientemente de los tableros.

---

## 4. Tablero

Entidad independiente. Puede tener varios miembros.

```text
Tablero A
├── User1 → admin
├── Wilson → editor
└── User3 → observador
```

El admin es el creador. Único con control de miembros, borrado y nuevas
versiones de historial.

---

## 5. Usuarios y permisos

* **admin:** creador. Control total.
* **editor:** registra, edita, elimina información.
* **observador:** solo lectura.

### 5.1 Bloqueo de operaciones simultáneas

Los bloqueos son de formulario y viven en el frontend con estado local. No se
persisten en Firestore.

Ejemplo:

```text
User1 abre "Registrar monedas"
→ formulario bloqueado en su sesión

User2 intenta "Registrar monedas"
→ ve alerta: "User1 está usando este formulario"
→ puede usar otro formulario

Al confirmar o cancelar User1, se libera.
```

---

## 6. Configuración general

Constantes del tablero: `interes`, `porcentaje`.

`porcentaje` es el porcentaje al que el estudio paga al usuario.

---

## 7. Registro de páginas

Propiedades ya definidas. Cada página pertenece a un tablero.

---

## 8. Registro de una quincena

Propiedades ya definidas. Formato `year-mes-1/2`.

---

## 9. Registro de monedas

Dos registros por quincena: estadísticas (`pago=false`) y pago (`pago=true`).

---

## 10. Registro de un día

Operación de negocio, no CRUD.

---

## 11. Flujo completo de registrarDia()

```text
Usuario
  ↓
Selecciona tablero, quincena, día
  ↓
Selecciona páginas
  ↓
Sistema obtiene configuración de páginas
  ↓
Sistema obtiene QF vigente
  ↓
Usuario registra valores RAW
  ↓
Sistema valida
  ↓
Sistema procesa cada página
  ↓
Sistema genera preview
  ↓
Usuario revisa
  ├── Cancelar → descartar
  └── Confirmar
          ↓
      persistir RAW
          ↓
      actualizar QF
          ↓
      recalcular tramo afectado si aplica
```

---

## 12. Datos RAW

Exactamente lo introducido por el usuario.

---

## 13. Datos formateados

Generados por el motor a partir de RAW + contexto.

---

## 14. Regla de valores mensuales acumulados

```text
valorNuevo > valorAnterior
valorNuevo > 0
```

---

## 15. Cálculo mensual → quincena → día

Ejemplo ya documentado en `reglas_calculo.md`.

---

## 16. Segunda quincena

Usa QAR (Resumen de la anterior).

---

## 17. Ejemplo completo

```text
                 MES       QUINCENA       DÍA
Q1 D1             50          50           50
Q1 D2             85          85           35
Q2 D1            135          50           50
Q2 D2            213         128           78
```

---

## 18. Procesamiento de cada página

Se consulta la configuración y se aplican las reglas activas. No hay
combinaciones fijas: el algoritmo verifica cada booleano.

---

## 19. Coins

Se convierten inmediatamente al registrar. Se suman a la moneda de la página.
`totalCoins` es informativo.

---

## 20. Descuento

Se aplica durante el procesamiento. Posición exacta pendiente.

---

## 21. Tope

Lógica acumulativa. Fórmula exacta pendiente.

---

## 22. Corte y parcial

Reglas pendientes de formalizar.

---

## 23. Vista previa

Antes de confirmar. Permite detectar errores.

---

## 24. Confirmación

Persiste RAW, actualiza QF, recalcula tramo afectado.

---

## 25. Recalculo

Solo tramo afectado.

---

## 26. Edición de un día

Recalcula ese día y posteriores existentes hasta el último.

---

## 27. Regla de propagación

> Todo resultado calculado es derivado de RAW + continuidad anterior. Si cambia
> un RAW, se recalculan ese registro y los posteriores afectados dentro de la
> misma secuencia.

---

## 28. Resumen de continuidad

Información necesaria para la siguiente quincena.

---

## 29. Datos del Resumen

Estructura exacta ya definida en `modelo_datos.md`.

---

## 30. Ejemplo de continuidad

Ya documentado.

---

## 31. Ganancia final

```text
gananciaFinal = ganancia - rojo - interésDeuda
```

Fórmula completa pendiente.

---

## 32. Historial

Copia inmutable de QF cerrado con pago.

---

## 33. Inmutabilidad del Historial

No se recalcula al consultar. No depende de configuración actual.

---

## 34. Diferencia Historial / Resumen

* Historial: fotografía completa.
* Resumen: continuidad reducida.

---

## 35. Flujo de una quincena completa

```text
Crear quincena
  ↓
Registrar monedas (estadísticas; pago al cerrar)
  ↓
Registrar días
  ↓
Registrar créditos
  ↓
Procesar RAW
  ↓
Generar QF
  ↓
Cerrar (requiere moneda de pago)
  ↓
Copiar Resumen → QAR siguiente
  ↓
Generar Historial
```

---

## 36. Modificación antes de historial

Se recalcula el tramo afectado.

---

## 37. Principio de dependencia

D1 → D2 → D3 → D4. Si D1 cambia, se propaga.

---

## 38. Operaciones principales

```text
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

---

## 39. Operaciones pendientes de especificación

Fórmulas de rojo, interés, tope, corte, parcial, descuento, aranceles, pago.

---

## 40. Siguiente fase

`reglas_calculo.md` completar fórmulas pendientes.

---

## 41. Estado

Diseño funcional inicial.

---

## 42. Regla fundamental

> Primero qué debe hacer el sistema; después cómo almacenar; finalmente
> implementar.
