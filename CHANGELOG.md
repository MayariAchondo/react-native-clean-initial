# Registro de Cambios (Rama dev)

Este documento detalla las modificaciones, nuevas características y refactorizaciones implementadas en la rama `dev`, reflejando la evolución desde la estructura base del template.

## 1. Reestructuración de Navegación y Vistas (Expo Router)

- **Limpieza de Rutas Dinámicas:** Se eliminaron las vistas basadas en carpetas (`category/[id].tsx`, `transaction/[id].tsx`, `categories.tsx` y el `index.tsx` de tabs) a favor de un enfoque centralizado.
- **Nueva Barra de Navegación (Tabs):** Se rediseñó por completo el `_layout.tsx` de los tabs. Se integraron iconos (`IconSymbol`), feedback háptico en los botones (`HapticTab`), se configuraron los colores del tema y se definieron las pestañas: "Balance", "Categorías", "Transacciones" y "Perfil".

## 2. Refactorización de Formularios (Hooks y Validación)

- **Nuevos Hooks de Formularios (`useTransactionForm` y `useCategoryForm`):** Se reescribieron para manejar la lógica de forma desacoplada. Ahora reciben la propiedad `mode` (`'create'` o `'edit'`), valores por defecto (`defaultValues`) y una función de envío (`onSubmit`).
- **Gestión de Errores con Zod:** Los hooks ahora validan la información, extraen los errores específicos por campo (usando `.flatten().fieldErrors`) y manejan internamente un estado de carga al guardar (`submitting`).

## 3. Lógica de Datos y Persistencia

- **Optimización de Carga:** Se mejoró la recarga en `useCategories` y `useTransactions`. Se añadieron estados formales de `loading` y `error`, y se ajustó el `useCallback` de la carga (exportada ahora como `reload`) para evitar renderizados infinitos.
- **Generación de IDs Segura:** Se reemplazó el uso de `Date.now()` por `crypto.randomUUID()` al momento de generar nuevos registros.

## 4. UI y Experiencia de Usuario (UX)

- **Manejo del Teclado en Login:** Se mejoró `app/index.tsx` (Pantalla de Login) añadiendo un `ScrollView` interno al `KeyboardAvoidingView` asegurando que la vista se adapte dinámicamente y el teclado nunca tape los campos en ninguna plataforma.
- **Safe Area Nativo:** Se implementó `SafeAreaView` de `react-native-safe-area-context` en la pantalla de balance para respetar los márgenes de sistema (notches y barras de estado).

## 5. Dependencias y Tipado

- **Nuevas Librerías:** Se instaló `@react-native-picker/picker` para los componentes de selección desplegables y se ajustó la versión de `@react-native-async-storage/async-storage`.
- **Limpieza de Tipos:** Se eliminó el archivo general `types/index.ts` migrando todas las interfaces hacia sus archivos correspondientes cerca de los validadores de Zod.
