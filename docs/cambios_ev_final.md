# Cambios realizados — Evaluación Final

Documento detallado de todos los cambios hechos desde la Evaluación 3 hasta la Evaluación Final.

---

## 1. Migración de AsyncStorage a expo-secure-store

**Antes (Eval 3):** Los tokens se guardaban en `AsyncStorage` junto con los datos de la app.

**Ahora (Eval Final):** Los tokens se guardan en `expo-secure-store` (Keychain en iOS, Keykeeper en Android). En web, se usa `localStorage` como fallback porque `expo-secure-store` no funciona en navegador.

**Archivo:** `lib/auth.ts`

```tsx
// Platform-aware: decide dónde guardar según el dispositivo
if (Platform.OS === 'web') {
  localStorage.setItem(key, value);
} else {
  SecureStore.setItemAsync(key, value);
}
```

**Funciones migradas:**
- `saveTokens()` — guarda accessToken + refreshToken + userId
- `getAccessToken()` — lee el accessToken
- `getRefreshToken()` — lee el refreshToken
- `clearTokens()` — elimina todos los tokens
- `getUserEmail()` — lee el email del token decodificado
- `decodeJWT()` — decodifica el payload del JWT

---

## 2. Creación de AuthContext

**Antes (Eval 3):** No existía contexto de autenticación. Cada pantalla manejaba el token por su cuenta.

**Ahora (Eval Final):** `contexts/AuthContext.tsx` provee un `AuthProvider` con:

- `user` — objeto con `userId` y `email` (o `null`)
- `isAuthenticated` — boolean derivado de `user`
- `isLoading` — true mientras se verifica el token al abrir la app
- `login()` — llama a `POST /auth/login`, guarda tokens, actualiza estado
- `register()` — llama a `POST /auth/register`, guarda tokens, actualiza estado
- `logout()` — llama a `POST /auth/logout`, limpia tokens, resetea estado
- `error` — mensaje de error del servidor (en español)
- `clearError()` — limpia el error

**Flujo al abrir la app:**
1. `AuthProvider` monta
2. `useEffect` llama a `checkAuth()` que lee el token de SecureStore
3. Si hay token válido → decodifica el JWT y setea `user`
4. Si no hay token → `user = null`
5. `isLoading` pasa a `false`

---

## 3. Creación de apiService (lib/api.ts)

**Antes (Eval 3):** No existía un cliente HTTP centralizado. Cada hook usaba `fetch` directamente con AsyncStorage.

**Ahora (Eval Final):** `lib/api.ts` centraliza todas las llamadas HTTP:

- `apiRequest<T>(endpoint, options)` — fetch JSON con token automático
- `apiUpload<T>(endpoint, formData)` — fetch multipart para subir archivos
- Auto-refresh en 401: si el token expira, usa el refreshToken para obtener uno nuevo (rotación)
- Errores de red → lanza "Error de conexión"
- Errores HTTP → lanza el mensaje del `body.error` del servidor

**Flujo de refresh automático:**
```
Request → 401 → POST /auth/refresh con refreshToken
  → Si funciona: guarda nuevos tokens, reintenta la request original
  → Si falla: limpia tokens, lanza "UNAUTHORIZED"
```

---

## 4. Modificación de hooks existentes

### useTransactions

**Antes (Eval 3):** CRUD completo con AsyncStorage, sin balance del servidor.

**Ahora (Eval Final):**
- CRUD contra `GET/POST/PATCH/DELETE /transactions`
- Balance desde `GET /transactions/balance` (servidor)
- Upload de fotos: `POST /transactions/upload` → devuelve `receiptUrl`
- `getTransactionById(id)` — obtener una transacción por ID
- Todas las funciones envueltas en `useCallback([])` para estabilidad

### useCategories

**Antes (Eval 3):** CRUD con AsyncStorage.

**Ahora (Eval Final):**
- CRUD contra `GET/POST/PATCH/DELETE /categories`
- Se carga automáticamente al montar el hook
- Eliminado código muerto (`CACHE_KEY`)

### useLogin

**Nuevo:** Hook dedicado para el formulario de login. Maneja estado del form, llama a `useAuth().login()`, traduce errores a español.

---

## 5. Modificación de pantallas

### Login (app/index.tsx)

**Antes (Eval 3):** No existía pantalla de login.

**Ahora (Eval Final):** Formulario con email + contraseña. Errores mostrados en pantalla.

### Registro (app/register.tsx)

**Antes (Eval 3):** No existía pantalla de registro.

**Ahora (Eval Final):** Formulario con email + contraseña + confirmar contraseña. Validación client-side (mínimo 6 caracteres, contraseñas coinciden).

### Perfil (app/(tabs)/profile.tsx)

**Antes (Eval 3):** No existía pantalla de perfil.

**Ahora (Eval Final):** Muestra email del usuario + botón "Cerrar sesión". Usa `useAuth()` para logout.

### Detalle de transacción (app/(tabs)/transactions/[id]/index.tsx)

**Antes (Eval 3):** Usaba `apiRequest` directamente (violación de arquitectura).

**Ahora (Eval Final):** Usa `getTransactionById()` del hook `useTransactions`. Ya no importa `apiRequest` directamente.

### Crear/transacción (app/(tabs)/transactions/create.tsx)

**Antes (Eval 3):** Guardaba en AsyncStorage.

**Ahora (Eval Final):** 
- Sube foto primero a `POST /transactions/upload`
- Obtiene `receiptUrl` del servidor
- Envía `receiptUrl` + coordenadas en el body al crear
- Coordenadas opcionales

---

## 6. Cambios en el modelo de datos

**Antes (Eval 3):** `id` era `string` (Date.now), `categoryId` era `string`.

**Ahora (Eval Final):** 
- `id` es `number` (Prisma Int del backend)
- `categoryId` es `number`
- Se eliminó `photoUri` — ahora se usa `receiptUrl` (URL pública del servidor)
- Se agregaron `latitude?: number` y `longitude?: number` como campos planos (no como objeto anidado)

```tsx
// Transaction actual
{
  id: number;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  categoryId: number;
  receiptUrl?: string;    // URL pública del servidor
  latitude?: number;      // coordenadas planas
  longitude?: number;
  category?: Category;    // objeto anidado del join
}
```

---

## 7. Cambios en la navegación

**Antes (Eval 3):** Tabs: Balance, Categorías, Transacciones.

**Ahora (Eval Final):** 
- Tabs: Balance, Categorías, Transacciones, Perfil
- `index` del tab (redirect) oculto con `href: null`
- `initialRouteName="transactions"` — la app abre en Transacciones
- `_layout.tsx` simplificado: sin auth guard, solo renderiza Stack

---

## 8. Eliminación de dependencia AsyncStorage

**Antes:** `@react-native-async-storage/async-storage` se usaba para tokens y datos.

**Ahora:** Solo queda en `package.json` como dependencia no utilizada. Se podría eliminar con:
```bash
yarn remove @react-native-async-storage/async-storage
```

---

## 9. Arquitectura final de capas

```
Pantalla (app/)
  └── Hook (hooks/)
        └── apiRequest (lib/api.ts)
              └── fetch + getAccessToken (lib/auth.ts)
                    └── SecureStore / localStorage
```

**Regla clave:** Ninguna pantalla o componente importa `fetch`, `SecureStore` ni `apiService` directamente.

---

## 10. Endpoints consumidos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /auth/register | ❌ | Registro |
| POST | /auth/login | ❌ | Login |
| POST | /auth/refresh | ❌ | Renovar token |
| POST | /auth/logout | ✅ | Cerrar sesión |
| GET | /transactions | ✅ | Listar transacciones |
| GET | /transactions/:id | ✅ | Detalle |
| POST | /transactions | ✅ | Crear |
| PATCH | /transactions/:id | ✅ | Editar |
| DELETE | /transactions/:id | ✅ | Eliminar |
| GET | /transactions/balance | ✅ | Balance |
| POST | /transactions/upload | ✅ | Subir foto |
| GET | /categories | ✅ | Listar categorías |

---

## 11. Bugs corregidos durante la integración

1. **Loop infinito al logout** — El auth guard usaba `useSegments` que no funciona en web. Se resolvió simplificando el `_layout.tsx`.

2. **Profile spinner infinito** — `profile.tsx` mostraba `ActivityIndicator` cuando `user` era `null`. Se agregó `isLoading` del contexto y se retorna `null` cuando no hay usuario.

3. **Upload 400 en web** — FormData con `{uri, type, name}` no funciona en web. Se resolvió convirtiendo el URI a Blob con `fetch(uri)` antes de agregarlo al FormData.

4. **getTransactionById sin useCallback** — Causaba loop infinito en `useFocusEffect` porque creaba nueva referencia en cada render. Se envolvió en `useCallback([])`.

5. **Transacciones no cargaban al volver a la pantalla** — `reload` se pasaba como dependencia sin ser estable. Se resolvió con `useCallback([], [])`.

---

## 12. Resumen de archivos creados/modificados

### Creados
- `contexts/AuthContext.tsx`
- `lib/api.ts`
- `lib/auth.ts` (migrado desde AsyncStorage)
- `hooks/useLogin.ts`
- `app/register.tsx`
- `app/(tabs)/profile.tsx`

### Modificados
- `hooks/useTransactions.ts` — CRUD contra API
- `hooks/useCategories.ts` — CRUD contra API
- `hooks/useTransactionForm.ts` — schema Zod actualizado
- `hooks/useCategoryForm.ts` — schema Zod actualizado
- `app/_layout.tsx` — Stack con register
- `app/(tabs)/_layout.tsx` — tabs + perfil
- `app/(tabs)/transactions/create.tsx` — upload + coordenadas
- `app/(tabs)/transactions/[id]/index.tsx` — usa hook en vez de apiRequest
- `types/transaction.ts` — id number, receiptUrl, latitude/longitude
- `types/category.ts` — id number
- `schemas/transaction.schema.ts` — categoryId number
- `schemas/category.schema.ts` — sin cambios significativos
- `package.json` — expo-secure-store, zod v4
