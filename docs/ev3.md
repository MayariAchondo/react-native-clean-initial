# Evaluación 3 — Cashi: Cámara y GPS

**Ramo:** Desarrollo de Aplicaciones Móviles

**Modalidad:** Grupal — mismo grupo de la Evaluación 2

**Fecha límite:** Domingo 31 de mayo de 2026, 23:59

---

## Contexto

En la Evaluación 2 construiste la app Cashi con CRUD completo de transacciones y categorías, persistencia en AsyncStorage y pantalla de balance. La arquitectura quedó lista para crecer: lógica en hooks, componentes que solo renderizan.

En esta evaluación vas a extender esa misma app agregando dos capacidades que solo existen en un teléfono: **adjuntar una foto del comprobante** a cada transacción y **registrar las coordenadas GPS** de dónde fue realizada.

No se conecta a ningún backend todavía — los datos siguen en AsyncStorage. Lo que se evalúa es que sabes acceder al hardware del dispositivo, manejar permisos, y extender un modelo de datos sin romper lo que ya funcionaba.

---

## Cambios en el modelo de datos

`Transaction` se extiende con dos campos opcionales. No elimines ni renombres los campos existentes — la app debe seguir funcionando igual para transacciones sin foto ni ubicación.

```tsx
export interface Transaction {
  id:          string
  amount:      number
  type:        'income' | 'expense'
  description: string
  date:        string
  categoryId:  string
  // ── Nuevo en Evaluación 3 ──────────────────────────────
  photoUri?:   string   // URI local de la foto del comprobante
  location?: {
    latitude:  number
    longitude: number
  }
}
```

---

## Requerimientos funcionales

### Adjuntar foto del comprobante a una transacción

- En la pantalla de crear/editar transacción, el usuario puede adjuntar una foto del comprobante
- Debe ofrecer dos opciones: **tomar una foto con la cámara** o **seleccionar desde la galería**
- La imagen se muestra como preview antes de guardar
- La imagen se muestra en la pantalla de detalle de la transacción
- Si el usuario no adjunta foto, la transacción se guarda igual (campo opcional)

### Registrar ubicación al crear una transacción

- En la pantalla de crear transacción, el usuario puede registrar su ubicación actual
- Se muestran las coordenadas (`latitude` y `longitude`) una vez obtenidas
- Si el usuario no registra ubicación, la transacción se guarda igual (campo opcional)

### Manejo de permisos

- Si el usuario deniega el permiso de cámara o galería: mostrar un mensaje de error claro en pantalla, sin `Alert`
- Si el usuario deniega el permiso de ubicación: mostrar un mensaje de error claro en pantalla, sin `Alert`
- La app no debe explotar si los permisos son denegados

---

## Requerimientos técnicos

- La lógica de permisos y acceso al hardware vive en **custom hooks**, no en los componentes
    - `useImagePicker` — maneja cámara, galería y permisos
    - `useLocation` — maneja GPS y permisos
- Los componentes solo llaman funciones del hook y muestran el estado que reciben
- `photoUri` y `location` se persisten en AsyncStorage junto con la transacción
- Los datos deben sobrevivir al cierre y reapertura de la app
- Instalación de dependencias con `npx expo install`, no con `yarn add`

---

## Entregables

**1. Repositorio en GitHub**

El mismo repositorio de la Evaluación 2, en una nueva rama o con commits encima del trabajo anterior. Incluir un `README.md` actualizado con:

- Instrucciones para instalar y correr la app
- Qué cambió respecto a la Evaluación 2 (qué campos se agregaron a `Transaction`)
- Si usaron IA: qué herramientas, para qué y qué aprendieron

**2. Video demostrativo**

Duración máxima: **5 minutos**. Deben aparecer explicando con sus palabras:

- Demostración del flujo: adjuntar foto → guardar transacción → verla en detalle
- Demostración del flujo: registrar ubicación → guardar transacción → ver coordenadas
- Cómo organizaron `useImagePicker` y `useLocation`
- Qué pasa si el permiso es denegado

Subir a **Loom o YouTube** (puede ser no listado).

**3. Archivo `.txt` en EVA**

```
Integrantes: Nombre1, Nombre2, Nombre3
Repositorio: https://github.com/...
Video: https://loom.com/share/...
Fecha: 31/05/2026
```

---

## Rúbrica de evaluación

**Total: 100 puntos**

| Criterio | Puntaje | Descripción |
| --- | --- | --- |
| **Arquitectura de hooks** | 30 pts | `useImagePicker` y `useLocation` encapsulan toda la lógica de permisos y hardware. Los componentes no llaman a `ImagePicker` ni `Location` directamente. |
| **Funcionalidad de imagen** | 25 pts | Se puede adjuntar foto del comprobante desde cámara y galería. Preview visible antes de guardar. Foto visible en el detalle de la transacción. Persiste al cerrar y reabrir la app. |
| **Funcionalidad de ubicación** | 20 pts | Se obtienen las coordenadas y se muestran en pantalla. Persisten junto con la transacción. La app no falla si se deniega el permiso. |
| **Manejo de permisos** | 15 pts | Los tres casos están cubiertos: permiso concedido, denegado y primera vez. El mensaje de error es visible en pantalla sin `Alert`. |
| **Entregables y calidad** | 10 pts | README actualizado. Historial de commits descriptivo. Video muestra los flujos y explica la arquitectura. |

---

## Criterios de descuento

- **−20 pts** si la lógica de permisos o llamadas a `ImagePicker`/`Location` están directamente en los componentes
- **−15 pts** si `photoUri` o `location` no persisten en AsyncStorage junto con la transacción
- **−10 pts** si la app explota cuando se deniega un permiso en vez de mostrar un mensaje
- **−5 pts** si el README no existe o no permite correr la app
- **−5 pts** si el repositorio tiene un solo commit con todo el código

---

## Uso de IA

Pueden usar IA (ChatGPT, Claude, Copilot, etc.) para ayudarse a desarrollar. Si la usaron, deben declararlo en el `README.md` indicando qué herramientas usaron y para qué.

En el video deben ser capaces de explicar el código que entregan: por qué los permisos se manejan en el hook, qué pasa si el usuario rechaza el permiso, cómo se guarda la URI de la foto junto con el objeto `Transaction`. Si el video no refleja comprensión del código, se evaluará como si no fuera de su autoría.

---

## Preguntas frecuentes

**¿Puedo usar el mismo repositorio de la Evaluación 2?**

Sí, es lo recomendado. Trabaja en una rama nueva o simplemente agrega commits encima. Lo importante es que el historial muestre el trabajo incremental.

**¿La foto debe guardarse en algún servidor?**

No. La `photoUri` es la URI local que devuelve `expo-image-picker` — se guarda como string en AsyncStorage junto con la transacción. No hace falta subir nada a ningún servidor.

**¿Tengo que mostrar un mapa con la ubicación?**

No. Es suficiente mostrar las coordenadas como texto (`latitude`, `longitude`). Un mapa es un plus pero no se evalúa.

**¿Qué pasa si el GPS demora en responder?**

Muestra un estado de loading mientras se obtiene la ubicación. El hook `useLocation` tiene un `loading: boolean` para ese propósito.

**¿Puedo instalar librerías adicionales?**

Sí, siempre que sean compatibles con Expo SDK 52 y se instalen con `npx expo install`. Documenta cualquier dependencia extra en el README.

**¿Los integrantes del grupo deben entregar algo individual?**

No. Se entrega un solo `.txt` por grupo con los nombres de todos los integrantes.