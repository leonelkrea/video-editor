# Cómo hacer un videotutorial de TU software

Esta plantilla genera un **videotutorial vertical (1080×1920, tamaño smartphone)**
del software donde la coloques. El flujo es:

```
Capturas de tu app (Playwright)  +  Narración (ElevenLabs .wav)  →  Remotion  →  out/tutorial.mp4
        ↓                                      ↓
  Assets/captures/*.png                 subtítulos opcionales (Whisper)
  Assets/captures/hotspots.json
```

La composición principal es **`Tutorial`** (`src/PromoVideo.tsx`): coloca cada captura
dentro de un marco de teléfono, mueve un cursor animado a los *hotspots* y reproduce
tu narración. No edita un vídeo grabado: **arma el tutorial desde capturas estáticas**,
así que cada pantalla se ve nítida y la puedes regenerar cuando tu UI cambie.

> ¿Prefieres editar un screencast grabado en vídeo? Usa la composición alternativa
> **`Reel`** (ver `MANUAL.md`).

---

## 0. Prerrequisitos (una vez)

```bash
node --version                 # >= 18 (recomendado 20 LTS)
brew install ffmpeg            # macOS · Linux: apt install ffmpeg · Windows: gyan.dev
cd Plantilla-Videotutorial
npm install                    # dependencias (Remotion, Playwright, etc.)
npx playwright install chromium    # navegador para capturar (o: npm run playwright:install)
```

Whisper (subtítulos, **opcional** para `Tutorial`): `node scripts/install-whisper-cpp.mjs small`
o copia una carpeta `whisper-cpp/` ya compilada de otro proyecto.

---

## 1. Capturar las pantallas de tu app

1. **Arranca tu software** en local (en otra terminal), p.ej. `npm run dev` → `http://localhost:3000`.
2. **Edita `scripts/capture.config.mjs`** y describe qué grabar:
   - `baseUrl` → dónde corre tu app.
   - `auth` → login si hace falta (o `null`).
   - `steps[]` → una entrada por pantalla: `name` (= nombre del PNG), `path`, `device`
     (`"mobile"` por defecto), `actions[]` (clics previos para llegar al estado) y
     `hotspots[]` (elementos donde el cursor hará "tap", con un selector por `text`/`role`/`css`/`testId`).
3. **Captura**:
   ```bash
   npm run capture
   ```
   Genera `Assets/captures/<name>.png` por cada step y `Assets/captures/hotspots.json`
   con la posición (fracción 0..1) de cada hotspot.

> Las capturas viven en `Assets/captures/` y están **gitignored** (son regenerables).

---

## 2. Narración con ElevenLabs

1. Escribe el guion del tutorial (lo que dirá la voz).
2. Genera la voz en **ElevenLabs** (u otro TTS) y **expórtala como WAV**.
3. Guárdala en **`Assets/Audio/tutorial.wav`**.
4. Música de fondo opcional: `Assets/Audio/Background-Music/bgm.mp3`.

La voz se reproduce en la composición `Tutorial`; ajusta tiempos en el siguiente paso.

### Subtítulos (opcional)
Si quieres subtítulos quemados, transcribe la narración con Whisper:
```bash
npm run transcribe -- tutorial.wav     # -> public/captions/tutorial.json
```
**Revisa siempre** el JSON (Whisper es borrador): nombres propios, ortografía, timing.

---

## 3. Montar el guion del vídeo

Edita **`src/PromoVideo.tsx`** → `buildSections()`:
- Cada sección apunta a una captura (`frames[].src = "Assets/captures/<name>.png"`).
- `cursor[]` usa los hotspots por nombre (los rellena `hotspots.json` automáticamente).
- Sincroniza `from`/`to` (segundos) con tu narración.
- Ajusta `KEYWORDS` (texto puntual) y el cierre (`PromoOutro.tsx`).

Ajusta también la **marca**: `src/lib/brand.ts` (colores + `SITE_URL`),
`src/components/promo/theme.ts` (paleta del cuerpo) y los logos en `Assets/Imagery/`.

Previsualiza en vivo:
```bash
npm run dev      # Remotion Studio → abre la composición "Tutorial"
```

---

## 4. Renderizar

```bash
npx remotion render Tutorial out/tutorial.mp4
```

Verifica frames:
```bash
ffmpeg -i out/tutorial.mp4 -vf fps=1/3 out/preview_%02d.png
```

---

## Checklist

- [ ] `npm install` + `npx playwright install chromium` sin errores.
- [ ] Tu app corre en `baseUrl`; `npm run capture` genera PNGs + `hotspots.json`.
- [ ] `Assets/Audio/tutorial.wav` (narración ElevenLabs) colocada.
- [ ] (Opcional) `npm run transcribe -- tutorial.wav` y subtítulos revisados.
- [ ] `src/PromoVideo.tsx` con tus secciones y tiempos.
- [ ] Marca adaptada (`brand.ts`, `theme.ts`, logos).
- [ ] `npx remotion render Tutorial out/tutorial.mp4` produce el MP4.
