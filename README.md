# Cashi — App Mobile de Finanzas Personales

Aplicación móvil desarrollada con React Native + Expo para gestionar ingresos, egresos y balance personal.

## Integrantes

- Carlos González
- Mayarí Achondo

## Tecnologías utilizadas

- React Native + Expo SDK 54
- TypeScript
- Expo Router (navegación basada en archivos)
- expo-secure-store (almacenamiento seguro de tokens JWT)
- Zod v4 (validación de formularios)
- Expo Image Picker (cámara y galería)
- Expo Location (GPS)
- API REST con JWT (Hono + Prisma + PostgreSQL en Render)

## Requisitos previos

- Node.js instalado
- Expo Go instalado en tu celular, o un emulador Android/iOS

## Instalación y uso

1. Clona el repositorio:
   git clone https://github.com/MayariAchondo/react-native-clean-initial.git

2. Entra a la carpeta:
   cd react-native-clean-initial

3. Instala las dependencias:
   yarn install

4. Corre la app:
   npx expo start

5. Escanea el QR con Expo Go o presiona `w` para abrir en el navegador.

## Credenciales de acceso

- Email: admin@cashi.com
- Contraseña: 123456
- API: https://cashi-app.onrender.com

## Estructura del proyecto

```
app/
  index.tsx              → Pantalla de login
  register.tsx           → Pantalla de registro
  (tabs)/
    _layout.tsx          → Tabs: Balance, Categorías, Transacciones, Perfil
    index.tsx            → Redirect a transacciones
    balance.tsx          → Pantalla de balance
    categories/
      index.tsx          → Lista de categorías
      create.tsx         → Crear categoría
      [id]/index.tsx     → Detalle/editar categoría
    transactions/
      index.tsx          → Lista de transacciones
      create.tsx         → Crear transacción
      [id]/index.tsx     → Detalle de transacción
      [id]/edit.tsx      → Editar transacción
    profile.tsx          → Perfil y logout

contexts/
  AuthContext.tsx         → AuthProvider, useAuth (login/register/logout)

hooks/
  useLogin.ts            → Lógica de login (usa useAuth)
  useTransactions.ts     → CRUD transacciones + upload + balance
  useCategories.ts       → CRUD categorías
  useTransactionForm.ts  → Validación Zod de formulario
  useCategoryForm.ts     → Validación Zod de formulario
  useImagePicker.ts      → Cámara/galería + permisos
  useLocation.ts         → GPS + permisos

lib/
  auth.ts                → SecureStore/localStorage (platform-aware)
  api.ts                 → apiRequest/apiUpload (fetch centralizado, auto-refresh 401)

schemas/
  category.schema.ts     → Zod schemas para categorías
  transaction.schema.ts  → Zod schemas para transacciones

types/
  category.ts            → Interfaces TypeScript
  transaction.ts         → Interfaces TypeScript
```

## Problemas y soluciones encontrados

**1. `npx` vs `npm`**
Al intentar correr la app con `npm expo start` el comando no fue reconocido.
Solución: usar `npx expo start`.

**2. AsyncStorage no aparecía en package.json**
Al instalar con `npm install`, la librería no quedaba registrada porque el proyecto usa yarn.
Solución: instalar con `yarn add @react-native-async-storage/async-storage`.

**3. Zod v4 — importación distinta**
El proyecto instaló Zod versión 4, que tiene una sintaxis diferente a la versión 3.
Solución: importar desde `zod/v4` en vez de `zod`, y usar `result.error.issues` en vez de `result.error.errors`.

**4. `unstable_settings` en `_layout.tsx`**
El archivo inicial del profesor tenía una configuración que saltaba el login e iba directo a las tabs.
Solución: eliminar `unstable_settings` y registrar `index` como pantalla inicial en el Stack.

**5. Carpeta `transaction` creada como archivo**
Al usar `touch` antes de `mkdir`, se creó un archivo llamado `transaction` en vez de una carpeta.
Solución: eliminar el archivo con `rm` y crear la carpeta con `mkdir`.

**6. Errores de rutas TypeScript con Expo Router**
Expo Router es estricto con los tipos de rutas y marcaba error al navegar con strings dinámicos.
Solución: usar `as any` en las rutas dinámicas para evitar el error sin complicar el código.

## Cambios respecto a la Evaluación 3

### API consumida

- **URL del backend:** `https://cashi-app.onrender.com`
- **Stack del backend:** Hono + Prisma + PostgreSQL (desarrollado por el equipo de Web II)

### Endpoints implementados

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /auth/register | ❌ | Registro de usuario |
| POST | /auth/login | ❌ | Login, devuelve accessToken + refreshToken |
| POST | /auth/refresh | ❌ | Renovación de token (rotación) |
| POST | /auth/logout | ✅ | Cierre de sesión |
| GET | /transactions | ✅ | Lista transacciones del usuario |
| GET | /transactions/:id | ✅ | Detalle de transacción |
| POST | /transactions | ✅ | Crear transacción |
| PATCH | /transactions/:id | ✅ | Editar transacción |
| DELETE | /transactions/:id | ✅ | Eliminar transacción |
| GET | /transactions/balance | ✅ | Balance del usuario (servidor) |
| POST | /transactions/upload | ✅ | Subir foto, devuelve receiptUrl |
| GET | /categories | ✅ | Listar categorías |

### Flujo de autenticación

```
1. Login/Register → Backend devuelve accessToken (15min) + refreshToken (30d)
2. Ambos tokens se guardan en expo-secure-store (native) o localStorage (web)
3. Cada request incluye header Authorization: Bearer <accessToken>
4. Si el backend responde 401 → se llama POST /auth/refresh con el refreshToken
5. El backend valida el refreshToken, emite un nuevo par de tokens, y elimina el anterior (rotación)
6. La request original se reintenta con el nuevo accessToken
7. Si el refresh falla → se limpian los tokens y el usuario vuelve al login
```

### Plataforma-aware: SecureStore vs localStorage

`lib/auth.ts` usa `Platform.OS` para decidir dónde guardar tokens:

- **Native (iOS/Android):** `expo-secure-store` — almacena en el Keychain/Keystore del SO
- **Web:** `localStorage` — AsyncStorage no funciona en web, y expo-secure-store tiene soporte limitado

Esto permite que la app funcione tanto en Expo Go (web) como en builds nativos.

### Flujo de subida de foto (dos pasos)

```
1. Usuario selecciona foto → se obtiene URI local
2. Se crea FormData con la foto (campo "receipt")
3. Se llama POST /transactions/upload → devuelve { receiptUrl: string }
4. La receiptUrl se envía en el body al crear/editar la transacción
5. Si no hay foto, el campo se omite (opcional en la API)
```

En web, se convierte el URI a Blob antes de agregarlo al FormData (requisito del navegador).

### Manejo de errores

| Tipo de error | Mensaje mostrado |
|---------------|------------------|
| Sin conexión a internet | "Error de conexión" |
| Error HTTP del servidor | Mensaje del body.error del backend |
| Credenciales incorrectas | "Credenciales incorrectas" |
| Email ya registrado | "El email ya está registrado" |

### Arquitectura de capas

```
Pantalla → Hook → apiRequest → lib/api.ts → fetch + SecureStore
                          ↓
                   contexts/AuthContext.tsx
                          ↓
                   lib/auth.ts (SecureStore/localStorage)
```

- **Ninguna pantalla o componente** importa `fetch`, `SecureStore` ni `apiService`
- El token fluye desde `AuthContext` → `apiRequest` → headers HTTP sin pasar por componentes
- Los hooks (`useTransactions`, `useCategories`) obtienen el token internamente

### Balance desde el servidor

El balance se obtiene de `GET /transactions/balance` (endpoint del backend). El hook `useTransactions` también calcula un balance local como fallback si el endpoint falla.

### Cambios en hooks

- `useTransactions`: CRUD contra API, upload de fotos, balance desde servidor
- `useCategories`: CRUD contra API
- `useLogin`: Manejo de formulario + llamada a `useAuth().login()`
- `useTransactionForm`: Validación Zod + submit
- `useCategoryForm`: Validación Zod + submit
- Todas las funciones CRUD envueltas en `useCallback([])` para estabilidad de referencias

### Dependencias nuevas (respecto a Eval 3)

- `expo-secure-store` — almacenamiento seguro de tokens
- Se eliminó `@react-native-async-storage/async-storage` del manejo de tokens

## Cambios respecto a la Evaluación 2

Se agregaron dos campos opcionales a `Transaction`:
- `photoUri?: string` — URI local de la foto del comprobante
- `location?: { latitude: number; longitude: number }` — coordenadas GPS donde se realizó la transacción

Se instalaron las dependencias `expo-image-picker` y `expo-location`.

## Uso de IA

- **OpenCode (asistente de desarrollo):** Se utilizó OpenCode para analizar el código existente, generar planes de trabajo, implementar la integración con el backend, diagnosticar bugs (loops infinitos, archivos no encontrados) y refactorizar hooks.
- **Claude (Anthropic):** Se utilizó para revisar decisiones de arquitectura, verificar coherencia del código y generar documentación.

### Herramientas usadas

- OpenCode — asistente de código, debugging, refactoring
- Claude (claude.ai) — revisión de arquitectura, explicaciones
