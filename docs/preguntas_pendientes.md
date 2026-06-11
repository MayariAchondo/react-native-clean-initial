# Preguntas Pendientes — Evaluación Final

Basado en la auditoría de `docs/ev_final.md`, estas son las preguntas que el equipo debe resolver antes de la entrega:

---

## 1. ~~¿Por qué se usa AsyncStorage en vez de `expo-secure-store`?~~ ✅ RESUELTO

**Estado:** Resuelto. Se migró `lib/auth.ts` de AsyncStorage a `expo-secure-store`.

**Estado actual:** `lib/auth.ts` usa `AsyncStorage` para guardar tokens. El doc pide explícitamente `expo-secure-store` (línea 75).

**Preguntas para el equipo:**
- ¿Es un descuido o se omitió adrede?
- ¿Qué implicancias de seguridad tiene usar AsyncStorage para tokens JWT vs SecureStore?
- Si lo instalan ahora, ¿qué archivos hay que modificar?

---

## 2. ~~¿Dónde está el `AuthContext` y el hook `useAuth`?~~ ✅ RESUELTO

**Estado:** Resuelto. Se creó `contexts/AuthContext.tsx` con `AuthProvider` y `useAuth()`. `_layout.tsx` lo usa para el auth guard.

**Estado actual:** No existe directorio `contexts/`. No hay hook `useAuth`. El token se accede directamente desde `lib/auth.ts`.

**Preguntas para el equipo:**
- ¿Cómo se transfiere el estado de autenticación entre pantallas sin contexto?
- ¿Qué pasaría si múltiples pantallas necesitan saber si el usuario está autenticado simultáneamente?
- ¿Qué ventaja tiene tener un `AuthContext` centralizado vs importar `getAccessToken` directamente?

---

## 3. ~~¿Por qué `register.tsx` y `profile.tsx` importan directamente `lib/api` y `lib/auth`?~~ ✅ RESUELTO

**Estado:** Resuelto. `register.tsx` ahora usa `useAuth().register()` y `profile.tsx` usa `useAuth().user` + `useAuth().logout()`. Ninguna pantalla importa `lib/api` ni `lib/auth` directamente.

**Estado actual:** Según la rúbrica, "ningún componente ni pantalla importa `fetch`, `SecureStore` ni `apiService` directamente" (−20 pts).

**Preguntas para el equipo:**
- `register.tsx` importa `apiRequest` y `saveTokens` — ¿por qué no se creó un hook `useRegister` análogo a `useLogin`?
- `profile.tsx` importa `getUserEmail`, `clearTokens` y `apiRequest` — ¿por qué no se encapsula en un hook `useProfile` o `useLogout`?
- ¿Cómo refactorizarían estos archivos para cumplir con el requisito?

---

## 4. ~~¿La pantalla de detalle de transacción consume `GET /transactions/:id`?~~ ✅ RESUELTO

**Estado:** Resuelto. Se agregó `getTransactionById()` en `useTransactions` que llama a `GET /transactions/:id`. La pantalla de detalle ahora usa este endpoint en lugar de buscar en el estado local.

**Estado actual:** `app/(tabs)/transactions/[id]/index.tsx` busca la transacción en el estado local del hook, no llama al endpoint.

**Preguntas para el equipo:**
- ¿Qué problema puede causar si el usuario accede a una transacción compartida vía link?
- ¿Es esto un error o una decisión de diseño válida?
- Si lo implementan, ¿cómo manejarían el loading y el error?

---

## 5. ~~¿Cómo se manejan los errores de red?~~ ✅ RESUELTO

**Estado:** Resuelto. `lib/api.ts` ahora envuelve `fetch()` en try/catch y lanza `Error('Error de conexión')` cuando el servidor no responde.

**Estado actual:** `lib/api.ts` no envuelve `fetch()` en try/catch. Si el servidor no responde, se muestra el mensaje nativo del browser/SO, no "Error de conexión".

**Preguntas para el equipo:**
- ¿Por qué no se agregó un try/catch en `apiRequest`?
- ¿Qué experimenta el usuario cuando no hay conexión a internet?
- ¿Cómo se modificaría `lib/api.ts` para cumplir con "Los errores de red se muestran como `'Error de conexión'`"?

---

## 6. ~~¿Por qué login y registro navegan a `/(tabs)/categories` en vez de `/(tabs)/transactions`?~~ ✅ RESUELTO

**Estado:** Resuelto. Se agregó `initialRouteName="transactions"` en `app/(tabs)/_layout.tsx` para que la app inicie en la pantalla de transacciones después del login.

**Estado actual:** `useLogin` (línea 45) y `register.tsx` (línea 44) navegan a `/(tabs)/categories`. El doc dice (línea 46): "Al abrir la app: si hay token guardado, ir directo a las transacciones".

**Preguntas para el equipo:**
- ¿Es esto intencional o un error?
- ¿Qué pantallas debería mostrar la app después del login?

---

## 7. ~~¿Por qué `register.tsx` llama `saveTokens` dos veces?~~ ✅ RESUELTO

**Estado:** Resuelto. `register.tsx` ahora usa `useAuth().register()` que llama a saveTokens una sola vez con el userId real decodificado del JWT.

**Estado actual:** Líneas 30-34 llama `saveTokens` con `userId: 0`, luego líneas 37-43 importa dinámicamente para guardar con el userId real.

**Preguntas para el equipo:**
- ¿Qué problema puede causar este patrón?
- ¿No sería más limpio hacer un solo llamado después de tener el userId correcto?

---

## 8. ~~El campo se llama `receiptUrl`, no `imageUrl`~~ ✅ RESUELTO (no afecta evaluación)

**Estado:** El frontend usa correctamente `receiptUrl` que es lo que retorna el backend real. Es una discrepancia del doc, no del código.

**Estado actual:** El doc dice que el servidor devuelve `imageUrl`, pero el backend real devuelve `receiptUrl`. El frontend usa correctamente `receiptUrl`.

**Preguntas para el equipo:**
- ¿Es esto una discrepancia del doc o del backend?
- ¿Deberían actualizar el doc para reflejar el campo real?
- ¿Afecta esto a la evaluación?

---

## Resumen de Acciones Necesarias

| # | Acción | Prioridad | Dificultad |
|---|--------|-----------|------------|
| 1 | Instalar `expo-secure-store` y reescribir `lib/auth.ts` | **ALTA** | Media |
| 2 | Crear `contexts/AuthContext.tsx` y hook `useAuth` | **ALTA** | Alta |
| 3 | Crear hook `useRegister` para `register.tsx` | **ALTA** | Baja |
| 4 | Crear hook `useProfile`/`useLogout` para `profile.tsx` | **ALTA** | Baja |
| 5 | Agregar try/catch en `apiRequest` para errores de red | **MEDIA** | Baja |
| 6 | Consumir `GET /transactions/:id` en pantalla de detalle | **MEDIA** | Baja |
| 7 | Corregir navegación post-login a `/transactions` | **BAJA** | Baja |
| 8 | Corregir doble llamado a `saveTokens` en registro | **BAJA** | Baja |

---

*Archivo generado automáticamente por auditoría de código.*
