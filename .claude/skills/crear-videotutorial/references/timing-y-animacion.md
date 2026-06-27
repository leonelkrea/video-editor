# Tiempos y animación: de Whisper a una animación precisa

Aquí está la mecánica que hace que el **cursor y los cambios de pantalla caigan exactamente cuando
la voz lo dice**. Es el corazón de la precisión del tutorial.

## 1. Los datos que tienes

- `public/captions/tutorial.json` → `{ words: [{ text, startMs, endMs }] }` (de Whisper).
- `Assets/captures/<name>.png` → una captura por pantalla.
- `Assets/captures/hotspots.json` → `{ "<clave>": { fx, fy } }`, el centro de cada elemento como
  fracción 0..1 del viewport (lo rellena la captura). `src/PromoVideo.tsx` lo recibe como `hotspots`.

## 2. Localizar el instante de cada frase

Para cada escena de tu tabla del guion, encuentra en `tutorial.json` la **primera palabra** de su
frase y la **última**. Sus `startMs`/`endMs` son el `from`/`to` de la escena (en segundos = ms/1000).

Ejemplo: la frase de la escena 2 ("Crea uno nuevo con un toque") empieza en la palabra "Crea"
(`startMs: 8200`) y la acción "toque" cae en la palabra "toque" (`startMs: 10100`). Entonces:
- la sección 2 va de `from: 8.2` a (inicio de la escena 3),
- el `cursor` hace `click: true` alrededor de `at: 10.1` (relativo medido desde `from`, ver §4).

> Consejo: añade ~0.15–0.3 s de adelanto al movimiento del cursor para que LLEGUE al botón justo
> cuando la voz dice la acción; el "click" cae sincronizado, el movimiento lo precede.

## 3. Forma de una sección en `buildSections()`

```js
{
  from: 8.2,                 // seg — inicio de la frase (de Whisper)
  to: 13.0,                  // seg — inicio de la siguiente escena
  shot: {
    device: "phone",         // "phone" (vertical/móvil) | "browser" (capturas desktop)
    layout: "full",
    frames: [{ src: "Assets/captures/mobile-dashboard.png", at: 0 }],
    zoom: [1.0, 1.05],       // leve push-in durante la escena
    cursor: [
      { at: 0.4, fx: 0.5, fy: 0.6 },                 // entra en escena
      { at: 1.9, ...hp(H, "boton-nuevo", 0.5, 0.85) }, // viaja al botón (hotspot)
      { at: 2.3, ...hp(H, "boton-nuevo", 0.5, 0.85), click: true }, // TAP sincronizado
    ],
  },
},
```

Notas:
- `frames[].at` y `cursor[].at` son **relativos al inicio de la sección** (segundos desde `from`).
  Si la palabra "toque" está en `startMs: 10100` y la sección empieza en `from: 8.2`, entonces
  `at ≈ 10.1 - 8.2 = 1.9`.
- `hp(H, "clave", fxFallback, fyFallback)` usa el hotspot capturado si existe; si no, el fallback.
  Las claves deben coincidir con las de `capture.config.mjs` / `hotspots.json`.
- Para varias capturas en una misma escena, añade más `frames` con su `at` (hacen cross-fade).
- `device: "phone"` dibuja marco de teléfono; `device: "browser"` dibuja ventana de navegador.

## 4. Receta paso a paso

1. Ordena las escenas y, para cada una, fija `from` = `startMs` de su primera palabra (÷1000).
2. `to` de cada escena = `from` de la siguiente (la última escena termina donde acaba la narración
   o un poco después). Reserva los últimos segundos para el outro (lo añade `Root.tsx` aparte).
3. Dentro de cada escena, por cada acción narrada calcula `at = (startMs_palabra_accion/1000) - from`.
4. Pon el movimiento del cursor ~0.2 s antes de ese `at` y el `click: true` en ese `at`.
5. Ajusta `bodyDurationInFrames` en `src/Root.tsx` para que cubra toda la narración:
   `Math.round(duracionNarracionSeg * FPS)`. La duración total de la voz = `endMs` de la última
   palabra de `tutorial.json`.

## 5. Layout por orientación

La composición es vertical por defecto. Los rects viven en `src/components/promo/Scene.tsx`.

- **Vertical 1080×1920** (por defecto):
  ```js
  const PHONE_FULL  = { x: 198, y: 230, w: Math.round(1480 * (390/844)), h: 1480 };
  const BROWSER_FULL = { x: 40, y: 470, w: 1000, h: Math.round(1000 / (1920/1080)) };
  ```
- **Horizontal 1920×1080** (si el usuario lo elige, cambia `WIDTH/HEIGHT` en `Root.tsx` Y estos
  rects). Un buen punto de partida:
  ```js
  // teléfono centrado-derecha, con panel/keywords a la izquierda
  const PHONE_FULL  = { x: 1180, y: 110, w: Math.round(860 * (390/844)), h: 860 };
  // navegador grande centrado
  const BROWSER_FULL = { x: 220, y: 150, w: 1480, h: Math.round(1480 / (1920/1080)) };
  ```
  Revisa visualmente en `npm run dev` y ajusta para que nada se solape.

## 6. Selectores para `capture.config.mjs` (hotspots fiables)

El cursor solo cae exacto si el hotspot se capturó bien. Elige selectores robustos, en este orden:
1. `{ testId: "..." }` si la app usa `data-testid` (lo más estable).
2. `{ role: "button", name: "Guardar" }` — accesible y legible.
3. `{ text: "Guardar" }` — rápido pero frágil si el texto se repite.
4. `{ css: "..." }` — último recurso.

Si un hotspot sale "NO ENCONTRADO" al capturar, prueba otro selector o añade un `action` previo
(`{ clickText: "..." }`, `{ wait: 800 }`) para llegar al estado donde el elemento existe.

## 7. Errores comunes
- **Cursor desfasado:** mide los `at` siempre **relativos a `from`**, no absolutos.
- **Pantalla equivocada en pantalla:** la captura `src` no coincide con la ruta narrada; revisa la tabla.
- **Solapamientos en horizontal:** olvidaste mover los rects de `Scene.tsx` al cambiar de formato.
- **Vídeo más corto que la voz:** `bodyDurationInFrames` no cubre toda la narración (§4.5).
