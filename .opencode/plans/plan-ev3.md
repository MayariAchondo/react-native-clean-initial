# Plan: Evaluación 3 — Cámara y GPS en Cashi

Basado en los requisitos de `docs/ev3.md`, analizando el código actual del proyecto.

---

## 1. Extender el modelo de datos — `types/transaction.ts`

**Qué hacer:** Agregar dos campos opcionales a `Transaction`:

```ts
export interface Transaction {
  id:          string
  amount:      number
  type:        'income' | 'expense'
  description: string
  date:        string
  categoryId:  string
  photoUri?:   string   // URI local de la foto del comprobante
  location?: {
    latitude:  number
    longitude: number
  }
}
```

**Lógica:** En TypeScript, el `?` hace que el campo sea opcional. Una transacción sin foto ni ubicación se guarda igual — el campo simplemente no existe en el objeto. No tocamos los campos existentes para no romper datos previamente guardados en AsyncStorage. Los tipos `CreateTransactionInput` y `UpdateTransactionInput` derivan de `Transaction` via `Pick`/`Partial`, así que se beneficiarán automáticamente de los nuevos campos (aunque no los usemos en Zod).

---

## 2. Instalar dependencias y configurar permisos en iOS

```sh
npx expo install expo-image-picker expo-location
```

**Lógica:** `expo-image-picker` provee acceso a cámara y galería. `expo-location` provee GPS. La EV3 exige explícitamente usar `npx expo install` (no `yarn add`) porque este comando verifica compatibilidad con la versión de Expo instalada en el proyecto.

**⚠️ Obligatorio para iOS:** Agregar las claves de permisos en `app.json` dentro del bloque `"ios"`. Sin esto, la app explota en iOS al solicitar cualquier permiso — iOS no llega ni a preguntar al usuario, simplemente lanza un error fatal.

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Para adjuntar foto del comprobante",
        "NSPhotoLibraryUsageDescription": "Para seleccionar foto del comprobante",
        "NSLocationWhenInUseUsageDescription": "Para registrar dónde realizaste la transacción"
      }
    }
  }
}
```

Estos strings son el texto que iOS muestra al usuario en el diálogo de permisos. Si `app.json` ya tiene un bloque `"ios"`, agregar `"infoPlist"` dentro sin tocar lo demás.

---

## 3. Crear hook `hooks/useImagePicker.ts`

**Qué hace:** Encapsula TODO el acceso a cámara/galería y manejo de permisos. El componente nunca llama a `ImagePicker` ni a APIs de permisos directamente.

**Firma del hook:** El hook acepta un parámetro opcional `initialUri` para que la pantalla de edición pueda mostrar la foto ya guardada al cargar.

```ts
export function useImagePicker(initialUri?: string) { ... }
```

**Estado y funciones que expone:**
```ts
{
  imageUri: string | null       // URI de la foto seleccionada (o null)
  permissionError: string | null // Mensaje de error si permiso fue denegado
  pickFromCamera: () => Promise<void>
  pickFromGallery: () => Promise<void>
  clearImage: () => void
}
```

**Lógica de diseño:**
- El estado interno `imageUri` se inicializa con `initialUri ?? null`. Así, si se edita una transacción que ya tiene foto, el hook arranca mostrándola sin que el componente tenga que hacer nada especial.
- `pickFromCamera()` solicita permiso con `ImagePicker.requestCameraPermissionsAsync()`. Si concedido, abre la cámara con `ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })` y extrae la URI del asset resultante.
- `pickFromGallery()` igual pero con `ImagePicker.requestMediaLibraryPermissionsAsync()` y `ImagePicker.launchImageLibraryAsync()`.
- Si el permiso es denegado, se asigna un mensaje de error a `permissionError` (un string como "Permiso de cámara denegado"). El componente muestra este texto donde quiera — **sin `Alert`**, tal como exige la rúbrica (15 pts por manejo de permisos sin Alert).
- `clearImage()` resetea `imageUri` a `null`, permitiendo al usuario descartar la foto seleccionada.
- **Por qué va en un hook:** La rúbrica asigna 30 pts a que la lógica de hardware NO esté en los componentes. El componente solo llama funciones del hook y muestra el estado que recibe.

**Flujo típico:**
1. Usuario toca "Tomar foto"
2. Componente llama `pickFromCamera()`
3. Hook solicita permiso → si denegado, asigna `permissionError` y termina
4. Si concedido, `ImagePicker.launchCameraAsync()` abre la cámara del sistema
5. Usuario toma o cancela la foto
6. Hook recibe el resultado y actualiza `imageUri` con la URI local

---

## 4. Crear hook `hooks/useLocation.ts`

**Qué hace:** Encapsula GPS y permiso de ubicación. El componente nunca llama a `Location` directamente.

**Interfaz del hook:**
```ts
{
  location: { latitude: number; longitude: number } | null
  loading: boolean
  permissionError: string | null
  getCurrentLocation: () => Promise<void>
  clearLocation: () => void
}
```

**Lógica de diseño:**
- `getCurrentLocation()` → primero solicita permiso con `Location.requestForegroundPermissionsAsync()`. Si concedido, llama `Location.getCurrentPositionAsync({})` que retorna un objeto con `coords.latitude` y `coords.longitude`.
- Mientras el GPS responde, `loading = true`. El componente muestra un spinner o "Obteniendo ubicación...". **Loading es necesario porque el GPS puede tardar segundos** — sin él, el usuario toca el botón y no ve feedback, piensa que no funcionó. La FAQ de la EV3 lo menciona explícitamente.
- Si permiso denegado → `permissionError`, sin Alert.
- `clearLocation()` resetea `location` a `null`.

---

## 5. Modificar `app/(tabs)/transactions/create.tsx`

Integrar los dos hooks nuevos en el formulario de crear transacción.

**Lógica de cada sección:**

**Sección foto:**
- Botón "Adjuntar foto" → al presionarlo, muestra las opciones "Tomar foto" (llama `pickFromCamera`) y "Desde galería" (llama `pickFromGallery`). Se pueden implementar como dos botones visibles o como un pequeño ActionSheet.
- Si `imageUri` tiene valor, se muestra un `<Image source={{ uri: imageUri }} style={{ width: '100%', height: 200 }} />` — el preview antes de guardar.
- Botón "Quitar foto" llama `clearImage()`.
- Si `permissionError` no es null, se muestra `<Text style={{ color: 'red' }}>{permissionError}</Text>`.

**Sección ubicación:**
- Botón "Registrar ubicación" → llama `getCurrentLocation()`.
- Mientras `loading` es true, muestra "Obteniendo ubicación..." o un `ActivityIndicator`.
- Cuando se resuelve, muestra "Lat: -33.456, Lon: -70.654".
- Botón "Limpiar ubicación" llama `clearLocation()`.
- Si `permissionError`, texto en rojo.

**Al guardar:**
Actualmente el `onSubmit` pasa solo los datos del schema Zod. Hay que modificar el llamado a `addTransaction` para que también incluya `photoUri` y `location`. Como en el paso 8 se cambia la firma de `addTransaction` para que ya acepte esos campos, no se necesita ningún cast ni disfraz de tipos:

```ts
await addTransaction({
  ...data,                        // amount, type, description, categoryId (validados por Zod)
  photoUri: imageUri ?? undefined,
  location: location ?? undefined, // "location" es el nombre que expone useLocation
})
```

No se ponen en Zod porque no son datos que el usuario tipee — son generados por el hardware. No necesitan validación.

---

## 6. Modificar `app/(tabs)/transactions/[id]/edit.tsx`

Mismo patrón que create.tsx, pero inicializando los hooks con los valores ya guardados.

- Pasar `transaction.photoUri` como argumento al hook: `useImagePicker(transaction.photoUri)`. El hook arrancará con ese valor en `imageUri` y mostrará el preview de la foto existente sin que el componente haga nada extra.
- Si `transaction.location` existe, mostrarlo como texto inicial. Como `useLocation` no tiene un `initialLocation`, simplemente renderizar las coordenadas existentes condicionalmente antes de que el usuario interactúe con el botón.
- Al guardar, enviar `photoUri` y `location` junto con `updateTransaction`, igual que en create.

---

## 7. Modificar `app/(tabs)/transactions/[id]/index.tsx` (detalle)

Mostrar la foto y coordenadas si existen.

**Lógica:**
```tsx
{transaction.photoUri && (
  <Image source={{ uri: transaction.photoUri }} style={{ width: '100%', height: 200, borderRadius: 8 }} />
)}

{transaction.location && (
  <View>
    <Text style={styles.label}>Ubicación</Text>
    <Text style={styles.value}>
      {transaction.location.latitude}, {transaction.location.longitude}
    </Text>
  </View>
)}
```

Si no existen, no se renderiza nada — no se rompe nada gracias a que son opcionales. El `&&` en React solo renderiza el elemento si la condición es truthy.

---

## 8. Modificar `hooks/useTransactions.ts`

El hook actualmente define:

```ts
const addTransaction = async (input: CreateTransactionInput): Promise<void>
```

`CreateTransactionInput` solo tiene `amount`, `type`, `description`, `categoryId`. Hay que modificar el tipo del parámetro para aceptar también los campos nuevos.

**Solución:** Cambiar la firma para que acepte `CreateTransactionInput & { photoUri?: string; location?: Transaction['location'] }`:

```ts
const addTransaction = async (
  input: CreateTransactionInput & { photoUri?: string; location?: Transaction['location'] }
): Promise<void> => {
  const newTransaction: Transaction = {
    id: Crypto.randomUUID(),
    date: new Date().toISOString(),
    ...input,
  };
  await saveTransactions([...transactions, newTransaction]);
};
```

**Por qué funciona:** El `...input` esparce todos los campos, incluidos `photoUri` y `location`, dentro del objeto `Transaction`. `JSON.stringify` serializa cualquier campo presente, así que se persisten en AsyncStorage sin cambios adicionales.

Lo mismo para `updateTransaction`.

---

## 9. `schemas/transaction.schema.ts` — Sin cambios

**Lógica:** Zod valida entrada del usuario (monto, tipo, descripción, categoría). `photoUri` y `location` son generados por hardware, no escritos por el usuario. No necesitan estar en el schema de validación. Se agregan directamente al objeto `Transaction` antes de persistir.

---

## 10. Actualizar `README.md`

Agregar sección de Uso de IA y cambios respecto a la Evaluación 2.

**Lógica:** La rúbrica asigna 10 pts a entregables y calidad, que incluye README actualizado con cambios documentados y declaración de uso de IA.

```md
## Uso de IA

- **OpenCode (plan - explicativo):** Se utilizó OpenCode en modo plan para analizar el código existente, generar el plan de trabajo detallado y explicar la lógica de cada cambio antes de implementarlo.
- **Claude (Anthropic):** El plan y el código generado fueron revisados con Claude para verificar coherencia, buenas prácticas y correcto manejo de permisos y hooks.

### Cambios respecto a la Evaluación 2

Se agregaron dos campos opcionales a `Transaction`:
- `photoUri?: string` — URI local de la foto del comprobante
- `location?: { latitude: number; longitude: number }` — coordenadas GPS donde se realizó la transacción

Se instalaron las dependencias `expo-image-picker` y `expo-location`.
```

---

## Resumen de archivos a modificar/crear

| Archivo | Acción | ¿Qué cambia? |
|---|---|---|
| `app.json` | Modificar | +`infoPlist` con permisos de cámara, galería y ubicación para iOS |
| `types/transaction.ts` | Modificar | +`photoUri?`, +`location?` |
| `hooks/useImagePicker.ts` | **Crear** | Hook completo de cámara/galería (acepta `initialUri?`) |
| `hooks/useLocation.ts` | **Crear** | Hook completo de GPS |
| `hooks/useTransactions.ts` | Modificar | `addTransaction` / `updateTransaction` aceptan `photoUri` y `location` |
| `app/(tabs)/transactions/create.tsx` | Modificar | Secciones de foto + ubicación en formulario |
| `app/(tabs)/transactions/[id]/edit.tsx` | Modificar | Secciones de foto + ubicación; hooks inicializados con valores existentes |
| `app/(tabs)/transactions/[id]/index.tsx` | Modificar | Mostrar foto y coordenadas en detalle |
| `README.md` | Modificar | Documentar cambios y uso de IA |

## Verificación

```sh
yarn lint
```

No hay typecheck script configurado, pero TypeScript strict en el IDE reportará errores de tipos si faltan campos.

---

## Notas de la rúbrica relevantes

| Criterio | Pts | Cómo se cumple |
|---|---|---|
| Arquitectura de hooks | 30 | `useImagePicker` y `useLocation` encapsulan TODO; componentes solo llaman funciones y muestran estado |
| Funcionalidad de imagen | 25 | Cámara + galería, preview antes de guardar, foto visible en detalle, persiste en AsyncStorage |
| Funcionalidad de ubicación | 20 | Coordenadas mostradas como texto, persisten, GPS loading, no explota si denegado |
| Manejo de permisos | 15 | Tres casos cubiertos (concedido, denegado, primera vez), mensaje en pantalla sin `Alert` |
| Entregables y calidad | 10 | README actualizado, IA declarada |