# Cashi — App Mobile de Finanzas Personales

Aplicación móvil desarrollada con React Native + Expo para gestionar ingresos, egresos y balance personal.

## Integrantes

- Carlos González
- Mayarí Achondo

## Tecnologías utilizadas

- React Native + Expo
- TypeScript
- Expo Router (navegación)
- AsyncStorage (persistencia)
- Zod (validación)
- Expo Crypto (generación segura de UUIDs)
- Expo Image Picker (cámara y galería)
- Expo Location (GPS)

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

## Estructura del proyecto

app/
index.tsx → Pantalla de login
(tabs)/
\_layout.tsx → Navegación centralizada con tabs (Balance, Categorías, Transacciones, Perfil)

schemas/
category.schema.ts → Esquemas de validación Zod para categorías
transaction.schema.ts → Esquemas de validación Zod para transacciones

hooks/
useTransactions.ts → Lógica y persistencia de transacciones
useCategories.ts → Lógica y persistencia de categorías
useTransactionForm.ts → Validación del formulario de transacción
useCategoryForm.ts → Validación del formulario de categoría
useImagePicker.ts → Acceso a cámara/galería y manejo de permisos
useLocation.ts → GPS y manejo de permisos

types/
category.ts → Interfaces TypeScript (Category)
transaction.ts → Interfaces TypeScript (Transaction)

## Problemas y soluciones encontrados (Evaluación 2)

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



### Guía lógica seguida (Evaluación 2)

El proceso de trabajo con IA se organizó en estas etapas:

**1. Planificación antes de codear**
Antes de escribir una línea, se le pidió a Claude que ordenara los commits necesarios en una secuencia lógica. Esto permitió tener un mapa de ruta claro: primero tipos, luego hooks, luego pantallas.

**2. Un commit a la vez**
Se trabajó commit por commit. Claude explicaba cada línea de código y cada decisión antes de avanzar al siguiente.

**3. Correcciones en el momento**
Cuando aparecía un error, se pegaba el mensaje exacto del error y Claude lo corregía explicando qué había fallado y por qué.

**4. Código austero y novato**
Se le pidió explícitamente a Claude que el código fuera simple y fácil de entender, evitando abstracciones innecesarias. Esto fue importante para poder explicar el código en el video de entrega.

**5. Comprensión del código**
Cada bloque de código fue acompañado de una explicación en español de qué hace cada parte, para poder defenderlo en el video sin depender de memorizar.

**6. Tabs extras aparecían en la barra de navegación**
Las rutas dinámicas `category/[id]` y `transaction/[id]` aparecían como tabs en la barra inferior.
Solución: registrarlas en `_layout.tsx` con `href: null` para ocultarlas.

**7. Categorías no aparecían en el formulario de transacción**
Al abrir el formulario de transacción, la lista de categorías aparecía vacía aunque existían categorías creadas.
Solución: agregar `useFocusEffect` en el formulario para recargar las categorías cada vez que la pantalla recibe el foco.

**8. Formulario de transacción se quedaba pegado**
Al agregar `loadCategories` como dependencia del `useCallback`, se generaba un loop infinito que congelaba la pantalla.
Solución: usar array vacío `[]` en las dependencias del `useCallback` para que solo se ejecute al recibir el foco.

**10. Al refrescar en el navegador vuelve al login**
Esto ocurre porque la app no guarda la sesión en memoria entre recargas.
Solución: no es un bug real, en un celular real no ocurre porque la app no se refresca.

**11. SafeAreaView y KeyboardAvoidingView faltaban en todas las pantallas**
El contenido quedaba tapado por el notch o la barra de estado en celulares, y el teclado tapaba los inputs al escribir.
Solución: agregar SafeAreaView en todas las pantallas y KeyboardAvoidingView en las pantallas con formularios (login, categoría, transacción).

**12. Estilos declarados dentro de la función**
Al agregar SafeAreaView, los estilos quedaron dentro del bloque return en vez de fuera de la función, causando errores de "variable usada antes de ser declarada".
Solución: asegurarse de que StyleSheet.create() siempre esté fuera de la función del componente.

## Cambios respecto a la Evaluación 2

### Modelo de datos
Se agregaron dos campos opcionales a `Transaction`:
- `photoUri?: string` — URI local de la foto del comprobante
- `location?: { latitude: number; longitude: number }` — coordenadas GPS

Las transacciones sin foto ni ubicación siguen funcionando igual.

### Nuevas dependencias
Instaladas con `npx expo install`:
- `expo-image-picker` — acceso a cámara y galería
- `expo-location` — GPS

### Nuevos hooks
- `useImagePicker(initialUri?)` — encapsula cámara, galería y permisos de imagen
- `useLocation` — encapsula GPS y permiso de ubicación

### Nuevas funcionalidades
- Adjuntar foto del comprobante al crear o editar una transacción
- Registrar coordenadas GPS al crear una transacción
- Ambos datos se persisten en AsyncStorage junto con la transacción
- Los permisos denegados muestran un mensaje en pantalla, sin Alert


### Problemas en la planificación de Opencode (Evaluación 3)

1. Permisos en iOS: para que el código pueda acceder a la cámara, debe haber una declaración en app.json que defina para qué se usará el hardware. De caso contrario, el permiso no es denegado, sino que iOS no llega a mostrar el diálogo de permisos al usuario, simplemente lanza un error fatal. La solución es agregar las tres líneas respectivas en infoPlist que habilitan el juego de permisos.

2. Inconsistencia de initialUri: en la creación del hook useImagePicker no tiene initialUri en la interfaz, pero se menciona al modificar el edit. Es decir, se le atribuye una capacidad que no está declarada en su gramática. La solución más simple es que el hook acepte un parámetro opcional al inicializarse. 

3. Cast as, forzar una gramática: addTransaction fue definido para recibir cierto tipo de dato (sin photoUri ni location) y, en vez de cambiar esa definición, el plan propone disfrazarlo con "as" que, en el contexto de TypeScript, es como decirle "confía en mí, esto es lo que parece aunque las reglas digan otra cosa". Em vez de forzar esa interpretación, corresponde cambiar la firma de addTransaction en su hook directamente, para que el tipo incluya los nuevos datos sin necesidad de forzar la gramática y el componente los pase sin un disfraz.

4. Variable coords, un nombre sin referente: en la modificación de create.tsx se utiliza coords pero, en el hook useLocation, el estado se expone como location. 

## Uso de IA

- **OpenCode (plan - explicativo):** Se utilizó OpenCode en modo plan para analizar el código existente, generar el plan de trabajo detallado y explicar la lógica de cada cambio antes de implementarlo.
- **Claude (Anthropic):** El plan y el código generado fueron revisados con Claude para verificar coherencia, buenas prácticas y correcto manejo de permisos y hooks. También se le pidió ayuda para la explicación lógica de las implementaciones técnicas.
