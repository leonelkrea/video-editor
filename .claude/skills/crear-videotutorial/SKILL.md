---
name: crear-videotutorial
description: >-
  Guía paso a paso para crear un videotutorial animado del software del repositorio donde
  está instalada esta plantilla (motor Remotion + Playwright + Whisper + narración ElevenLabs).
  Úsala SIEMPRE que el usuario quiera crear un video tutorial, demo, walkthrough, video
  promocional, explicativo, onboarding o "cómo funciona" de su app / software / web / SaaS —
  aunque no diga la palabra "tutorial". Dispara también cuando mencione: narrar con ElevenLabs,
  convertir su código o el flujo de usuario en un video, capturar pantallas con un cursor que
  señale dónde tocar, o sincronizar una animación con una voz en off. Orquesta todo el flujo:
  elegir formato (horizontal/vertical), analizar el código y el user journey para escribir el
  guion, llevar la narración a ElevenLabs, transcribir con Whisper para obtener los tiempos,
  capturar pantallas con Playwright, montar la animación con cursor sincronizado y renderizar el MP4.
---

# Crear un videotutorial del software

Esta skill convierte el código de un proyecto en un **videotutorial animado**: capturas reales
de la app enmarcadas como pantalla, con un **cursor que señala dónde tocar cada cosa**, todo
sincronizado a una **narración** (voz en off generada en ElevenLabs). El motor ya está hecho
(Remotion + Playwright + Whisper); tu trabajo es **guiar al usuario** por el flujo y **escribir
los datos** (guion, config de captura, secciones de la animación) analizando su proyecto.

> Esta plantilla está pensada para vivir **dentro del repo del software** (instalada en el root,
> ver `INSTALL.md`). Eso te da acceso al código del proyecto para escribir el guion y mapear las
> pantallas. El proyecto a documentar es el **directorio padre**; el motor de vídeo es esta carpeta.

## Principios que hacen bueno el resultado

1. **El guion nace del user journey, no de un tour de features.** No describas pantallas sueltas:
   reconstruye el recorrido real de una persona usando el producto (entra → hace X → consigue Y) y
   narra ESE viaje. Analiza rutas, componentes y estados para inferirlo. Detalle en
   `references/guion-userjourney.md`.
2. **Los tiempos mandan la animación.** Whisper te da el `startMs/endMs` de cada palabra de la
   narración. Cada cambio de pantalla y cada "tap" del cursor debe caer **exactamente** cuando la
   voz lo menciona. Esa sincronía es lo que separa un tutorial preciso de uno que "va por su lado".
   Mecánica en `references/timing-y-animacion.md`.
3. **Una cosa a la vez, verificando.** No corras todo de un tirón. Cada fase tiene una salida
   revisable (guion, captions, capturas, frames de preview). Enseña, confirma, sigue.

## Flujo (7 fases)

Trabaja secuencialmente. Anuncia en qué fase estás y qué vas a producir.

### Fase 0 · Comprobar el terreno
- Confirma que estás en el repo del motor (existe `src/PromoVideo.tsx`, `scripts/capture-screens.mjs`).
- Identifica el **proyecto a documentar** (normalmente el directorio padre) y cómo se arranca en
  local (lee su `package.json`: ¿`npm run dev`? ¿qué puerto?). Si no es obvio, pregunta.
- Verifica dependencias: `npm install` hecho, `npx playwright install chromium` hecho, y whisper
  (`whisper-cpp/` presente o `node scripts/install-whisper-cpp.mjs small`). Si falta algo, dilo y
  resuélvelo antes de seguir.

### Fase 1 · Formato (horizontal o vertical — los dos son de primera clase)
**El formato lo decide el usuario; pregúntaselo, no asumas vertical.** El formato determina, de
punta a punta, en qué **viewport se captura el proyecto** y cómo se enmarca:

| Formato | Lienzo | Se captura el proyecto en… | `device` de captura/escena |
|---|---|---|---|
| **Vertical** | 1080×1920 | **móvil** (la web/app en su versión responsive móvil) | `mobile` / `phone` (marco de teléfono) |
| **Horizontal** | 1920×1080 | **escritorio** (la versión desktop) | `desktop` / `browser` (ventana de navegador) |

Es decir: **vertical ⇒ todo el proyecto en formato móvil; horizontal ⇒ en escritorio.** No mezcles
(no captures desktop para un vídeo vertical ni móvil para uno horizontal) salvo que el usuario lo
pida expresamente.

Aplicar el formato es **una sola línea** en `src/Root.tsx`: la constante
`ORIENTATION: "vertical" | "horizontal"`. Los encuadres (`src/components/promo/Scene.tsx`) son
**responsivos**: se recolocan solos según las dimensiones, así que no hay que tocar nada más en el
lienzo. Lo que sí debes alinear con el formato es el **viewport de captura** (Fase 5) y el `device`
de cada sección (Fase 6), según la tabla de arriba.

### Fase 2 · Guion desde el user journey (analiza el código)
1. Explora el proyecto padre: rutas/páginas, navegación, componentes clave, el "happy path".
2. Reconstruye **el viaje del usuario** (quién es, qué quiere lograr, en qué orden lo hace).
3. Escribe el **guion de narración** (lo que dirá la voz), segmentado en **escenas**; cada escena
   = una pantalla/estado + la acción a resaltar. Aplica el tono de marca si el proyecto lo define
   (busca `CLAUDE.md`/`MARCA.md`/`brand`); si no, tono claro y cercano, en "tú".
4. Entrega al usuario: (a) el **texto corrido** listo para ElevenLabs y (b) una **tabla escena →
   ruta → elemento a señalar**, que usarás en las fases 5–6.

Cómo analizar y cómo estructurar/medir el guion según el formato: `references/guion-userjourney.md`.
**Confirma el guion con el usuario antes de seguir** — es lo más barato de cambiar ahora.

### Fase 3 · Narración en ElevenLabs (handoff al usuario)
Dale instrucciones explícitas:
1. Copia el texto del guion (solo la narración, sin acotaciones) en **ElevenLabs**.
2. Genera la voz y **descarga el audio**. Si puedes, exporta WAV; si solo hay MP3, vale (el pipeline
   lo convierte).
3. Coloca el archivo en **`Assets/Audio/tutorial.wav`** (o `tutorial.mp3`) dentro de esta carpeta.
4. (Opcional) Música de fondo en `Assets/Audio/Background-Music/bgm.mp3`.
Pídele que te avise cuando el archivo esté en su sitio. No inventes la voz tú: este paso es del usuario.

### Fase 4 · Transcribir con Whisper (obtener los tiempos)
- Ejecuta `npm run transcribe -- tutorial.wav`. Genera `public/captions/tutorial.json` con cada
  palabra y su `startMs/endMs`.
- **Revisa y corrige** el JSON contra el guion: nombres propios, ortografía, marcadores. Whisper es
  borrador. Estos tiempos son la columna vertebral de la sincronía.

### Fase 5 · Capturar las pantallas (Playwright)
1. Pide al usuario que **arranque su app** en local (otra terminal).
2. A partir de la tabla escena → ruta → elemento, escribe **`scripts/capture.config.mjs`**:
   `baseUrl`, `auth` (si hay login), y un `steps[]` por pantalla con sus `hotspots[]` (los elementos
   que el cursor señalará, por `text`/`role`/`css`/`testId`).
   - **El `device` de cada step debe seguir el formato (Fase 1):** vertical ⇒ `device: "mobile"`
     (captura la versión móvil del proyecto); horizontal ⇒ `device: "desktop"`. Mantén un solo
     viewport en todo el vídeo salvo que el usuario pida mezclar.
3. Ejecuta `npm run capture` → `Assets/captures/*.png` + `Assets/captures/hotspots.json`.
4. Si algún hotspot sale "NO ENCONTRADO", ajusta el selector y repite. Cómo elegir buenos selectores:
   `references/timing-y-animacion.md`.

### Fase 6 · Montar la animación (cursor sincronizado a la voz)
Edita `src/PromoVideo.tsx` → `buildSections()`:
- Una sección por escena del guion, con su captura (`frames[].src`) y sus eventos de cursor.
- **`device` de cada sección acorde al formato (Fase 1):** `"phone"` en vertical, `"browser"` en
  horizontal. El encuadre se ajusta solo a las dimensiones; tú solo eliges el marco correcto.
- Ajusta cada `from`/`to` (segundos) a los `startMs/endMs` de Whisper de la frase que narra esa
  escena. Coloca cada `cursor[{ at, click }]` en el instante en que la voz nombra la acción.
- Usa los hotspots por nombre para que el "tap" caiga exacto sobre el botón real.
La receta concreta (de timings de Whisper a números en `buildSections`) está en
`references/timing-y-animacion.md`. **Síguela; es el corazón de la precisión.**

### Fase 7 · Previsualizar, renderizar, iterar
- `npm run dev` → abre la composición **`Tutorial`** en Remotion Studio y revisa la sincronía.
- Render: `npx remotion render Tutorial out/tutorial.mp4`.
- Saca frames: `ffmpeg -i out/tutorial.mp4 -vf fps=1/3 out/preview_%02d.png` y revísalos.
- Si algo va desfasado o se solapa → corrige `buildSections`/`capture.config` y re-renderiza.
- Avisa al usuario solo cuando el vídeo esté listo y verificado.

## Comandos de referencia
```bash
npm install && npx playwright install chromium     # una vez
node scripts/install-whisper-cpp.mjs small          # una vez (o copia whisper-cpp/)
npm run capture                                     # capturar pantallas (app corriendo)
npm run transcribe -- tutorial.wav                  # tiempos de la narración
npm run dev                                         # preview en Remotion Studio
npx remotion render Tutorial out/tutorial.mp4       # render final
```

## Recordatorios
- **No saltes el handoff de ElevenLabs** (fase 3): la voz la genera y coloca el usuario.
- **No renderices sin revisar** captions (fase 4) ni la sincronía en Studio (fase 7).
- **Formato = elección del usuario.** Vertical ⇒ proyecto en **móvil** (`device: mobile`/`phone`);
  horizontal ⇒ proyecto en **escritorio** (`device: desktop`/`browser`). Cambiarlo es una línea
  (`ORIENTATION` en `Root.tsx`); los encuadres se adaptan solos.
- Mantén el guion en el **tono de marca** del proyecto si existe.
