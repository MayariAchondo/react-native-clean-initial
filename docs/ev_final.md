# Evaluación Final — Cashi: Integración con Backend

**Ramo:** Desarrollo de Aplicaciones Móviles

**Modalidad:** Grupal — mismo grupo de las evaluaciones anteriores

**Fecha límite:** Viernes 12 de junio de 2026, 23:59

---

## Contexto

A lo largo del semestre construiste Cashi en tres etapas:

- **Evaluación 2:** CRUD completo con AsyncStorage, pantalla de balance, arquitectura de hooks
- **Evaluación 3:** Cámara, GPS y permisos — datos enriquecidos, sin backend
- **Evaluación Final:** La app se conecta al mundo real

El backend de Cashi ya existe — lo construyeron en el ramo de Desarrollo de Aplicaciones Web II. Tiene autenticación con JWT, CRUD de transacciones y categorías, y endpoint de balance. En esta evaluación vas a reemplazar AsyncStorage por ese backend real, sin tocar los componentes ni las pantallas.

Lo que se evalúa es que entiendas el impacto de las decisiones de arquitectura que tomaste antes: la separación en hooks, el modelo de datos, el manejo del token. Y que seas capaz de defenderlas con tus palabras.

---

## Lo que cambia respecto a la Evaluación 3

|                         | Evaluación 3              | Evaluación Final                |
| ----------------------- | ------------------------- | ------------------------------- |
| Fuente de datos         | AsyncStorage              | API REST con JWT                |
| Autenticación           | No había                  | Login/registro con token        |
| Token                   | No aplica                 | `expo-secure-store`             |
| `id` de transacción     | `string` (Date.now)       | `number` (Prisma Int)           |
| Foto del comprobante    | URI local en AsyncStorage | URI local → subida a la API     |
| Coordenadas             | Guardadas en AsyncStorage | Enviadas al servidor en el body |
| Firma de los hooks      | igual                     | **igual**                       |
| Componentes y pantallas | igual                     | **igual**                       |

---

## Requerimientos funcionales

### Autenticación

- Pantalla de login con email y contraseña
- Pantalla de registro con email y contraseña
- Al abrir la app: si hay token guardado, ir directo a las transacciones sin pasar por el login
- Logout disponible desde la pantalla de perfil — borra el token y vuelve al login
- Los errores del servidor se muestran en pantalla en español (la API los devuelve así)

### Transacciones

- Listar las transacciones del usuario autenticado (`GET /transactions`)
- Crear una transacción (`POST /transactions`) — con foto y coordenadas opcionales
- Editar una transacción (`PATCH /transactions/:id`)
- Eliminar una transacción (`DELETE /transactions/:id`)
- Ver el balance desde el endpoint del servidor (`GET /transactions/balance`)

### Categorías

- Listar categorías disponibles (`GET /categories`)
- Al crear o editar una transacción, el `categoryId` viene de la lista de categorías del servidor

### Foto del comprobante

- Si el usuario adjuntó una foto, se sube primero a `POST /transactions/upload`
- El servidor devuelve una `imageUrl` pública
- Esa URL se envía en el body al crear o editar la transacción
- Si no hay foto, el campo va omitido (es opcional en la API)

---

## Requerimientos técnicos

- `useAuth` consume el token desde `AuthContext` — no se pasa como parámetro entre pantallas
- El token se guarda en `expo-secure-store`, no en AsyncStorage
- `apiService` centraliza todas las llamadas HTTP: URL base, headers, manejo de errores
- Los hooks (`useTransactions`, `useCategories`) obtienen el token desde `useAuth()` internamente
- Ningún componente ni pantalla importa `fetch`, `SecureStore` ni `apiService` directamente
- Los errores de red se muestran como `'Error de conexión'`
- Los errores HTTP muestran el mensaje que devuelve el servidor (`body?.error`)

### Endpoints de la API a consumir

| Método | Ruta                  | Auth | Descripción                         |
| ------ | --------------------- | ---- | ----------------------------------- |
| POST   | /auth/register        | ❌   | Registro                            |
| POST   | /auth/login           | ❌   | Login, devuelve `{ token }`         |
| GET    | /transactions         | ✅   | Transacciones del usuario           |
| GET    | /transactions/:id     | ✅   | Detalle                             |
| POST   | /transactions         | ✅   | Crear transacción                   |
| PATCH  | /transactions/:id     | ✅   | Editar transacción                  |
| DELETE | /transactions/:id     | ✅   | Eliminar transacción                |
| GET    | /transactions/balance | ✅   | Balance del usuario                 |
| POST   | /transactions/upload  | ✅   | Subir foto, devuelve `{ imageUrl }` |
| GET    | /categories           | ✅   | Listar categorías                   |

---

## Entregables

**1. Repositorio en GitHub**

El mismo repositorio de las evaluaciones anteriores, con commits encima del trabajo anterior. El `README.md` debe incluir:

- Instrucciones para instalar y correr la app
- URL de la API que están consumiendo (del equipo de Web II)
- Qué cambió respecto a la Evaluación 3
- Si usaron IA: qué herramientas, para qué y qué aprendieron

**2. Video de defensa**

Duración máxima: **5 minutos**. No es una demo de funcionalidades — es una defensa técnica. Deben aparecer explicando con sus palabras:

- **Elección de tecnologías:** por qué `expo-secure-store` para el token, por qué `fetch` nativo en vez de axios, por qué `expo-image-picker` con `npx expo install`
- **Estructura de carpetas:** qué vive en `hooks/`, qué en `services/`, qué en `contexts/`, por qué esa separación
- **Decisiones de arquitectura:** cómo fluye el token desde `AuthContext` hasta `apiService` sin pasar por los componentes, por qué `useTransactions` no sabe nada de auth, qué ventaja tiene eso

No hace falta mostrar cada pantalla funcionando. Lo que importa es que puedan defender las decisiones de diseño.

**3. Archivo `.txt` en EVA**

Cada integrante sube el mismo archivo por EVA. El contenido es idéntico para todos:

```
Integrantes: Nombre1, Nombre2, Nombre3
Repositorio: https://github.com/...
Video: https://loom.com/share/...
API (Web II): https://...
Fecha: DD/MM/AAAA
```

---

## Rúbrica de evaluación

**Total: 100 puntos**

| Criterio                             | Puntaje | Descripción                                                                                                                                                                                |
| ------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Integración con la API**           | 35 pts  | Login, CRUD de transacciones y balance funcionan contra el backend real. El token se adjunta en cada request. Los errores HTTP y de red se muestran en pantalla.                           |
| **Arquitectura de hooks y contexto** | 30 pts  | `AuthContext` provee el token. `useTransactions` y `useCategories` lo consumen internamente. `apiService` centraliza el fetch. Ningún componente accede directamente a la red ni al token. |
| **Video de defensa**                 | 25 pts  | El equipo explica con claridad las decisiones de tecnología, estructura y arquitectura. Las respuestas reflejan comprensión real del código, no memorización.                              |
| **Entregables y calidad**            | 10 pts  | README actualizado con URL de la API. Historial de commits descriptivo. El proyecto instala y corre siguiendo el README.                                                                   |

---

## Criterios de descuento

- **−20 pts** si los componentes o pantallas importan `fetch`, `SecureStore` o `apiService` directamente
- **−15 pts** si el token se pasa como parámetro entre pantallas en vez de venir del contexto
- **−15 pts** si el video no demuestra comprensión de las decisiones de arquitectura
- **−10 pts** si los errores del servidor no se muestran en pantalla (solo `console.log` o silenciosos)
- **−5 pts** si el README no incluye la URL de la API de Web II

---

## Uso de IA

Pueden usar IA para desarrollar. Si la usaron, declárenlo en el README.

En el video deben poder explicar cada decisión de diseño con sus propias palabras: por qué el token no se pasa como prop, qué pasa si `SecureStore` no tiene token al abrir la app, cómo funciona el flujo de subida de imagen en dos pasos. Si el video no refleja comprensión del código, se evaluará como si no fuera de su autoría.

---

## Preguntas frecuentes

**¿Tengo que usar la API del equipo de Web II o puedo usar cualquier backend?**

La idea es usar la API que construyó tu equipo en Web II — es el cierre del semestre. Si tu equipo de Web II no terminó la API o tiene problemas, coordina con el profesor antes de la entrega.

**¿Hay que mantener la cámara y el GPS de la Evaluación 3?**

Sí. La foto se sube a la API y las coordenadas se envían en el body al crear la transacción. Los hooks `useImagePicker` y `useLocation` siguen existiendo.

**¿El balance lo calculo en el cliente o lo pido al servidor?**

Lo pides al servidor con `GET /transactions/balance`. El cálculo ya vive en el backend — no lo repliques en el cliente.

**¿Puedo usar axios en vez de fetch?**

Sí, pero en el video debes poder explicar por qué elegiste axios sobre fetch nativo y qué ventajas te dio en este proyecto específico.

**¿Los integrantes deben entregar algo individual?**

Cada integrante sube el mismo `.txt` por EVA. El archivo es idéntico para todos — incluye los nombres de todos los integrantes del grupo.
