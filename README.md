# Plantilla Videotutorial (Remotion + Playwright + Whisper)

> 🇻🇪 **Liberado públicamente y gratuito en solidaridad con Venezuela** tras el doble terremoto
> del 24 de junio de 2026 (M7.2 y M7.5, norte del país). Úsalo libremente. Detalle: [`HUMANITARIO.md`](./HUMANITARIO.md).

Plantilla **lista para usar** que genera un **videotutorial vertical (1080×1920, tamaño
smartphone)** del software donde la coloques. Captura las pantallas de tu app con
**Playwright**, las enmarca como un teléfono con cursor animado, y les pone tu
**narración de ElevenLabs** (WAV) + subtítulos automáticos opcionales.

> 🚀 Instalación (en el root de tu proyecto) + crear con Claude: **[`INSTALL.md`](./INSTALL.md)**
> 📖 Guía paso a paso: **[`TUTORIAL.md`](./TUTORIAL.md)**
> 🔧 Detalle del motor y la variante de screencast: **[`MANUAL.md`](./MANUAL.md)**
> 🤖 Skill que guía todo el flujo con Claude: `.claude/skills/crear-videotutorial/`

## Arranque rápido

```bash
npm install
npx playwright install chromium      # navegador para capturar pantallas
npm run dev                          # preview en vivo (Remotion Studio) → composición "Tutorial"
```

## Producir el videotutorial (resumen)

1. **Captura** las pantallas de tu app (con tu app corriendo en local):
   - Edita `scripts/capture.config.mjs` (URL, login, pasos, hotspots).
   - `npm run capture` → `Assets/captures/*.png` + `hotspots.json`.
2. **Narración**: genera la voz en ElevenLabs, expórtala WAV → `Assets/Audio/tutorial.wav`.
3. **(Opcional) Subtítulos**: `npm run transcribe -- tutorial.wav` y revísalos.
4. **Guion**: ajusta secciones y tiempos en `src/PromoVideo.tsx`; marca en `src/lib/brand.ts`.
5. **Render**: `npx remotion render Tutorial out/tutorial.mp4`.

## Estructura

| Carpeta / archivo | Contenido |
|---|---|
| `src/PromoVideo.tsx` | **Composición principal `Tutorial`**: capturas + cursor + narración. |
| `src/Reel.tsx` | Composición alternativa: editar un screencast `.mp4/.mov` con subtítulos. |
| `src/components/` | Motor (frames de teléfono/navegador, cursor, subtítulos, outro). |
| `src/lib/` | Marca (`brand.ts`) y fuentes (`fonts.ts`) — **adapta**. |
| `scripts/capture.config.mjs` | **Qué pantallas capturar** (tu app) — adapta. |
| `scripts/capture-screens.mjs` | Captura con Playwright (genérico). |
| `scripts/transcribe.mjs` | Subtítulos con Whisper. |
| `Assets/` | Tus materiales (capturas, audio, fuentes, imágenes). Symlink `public/Assets`. |
| `out/` | Vídeos renderizados. |

## Notas

- **Formato**: vertical `1080×1920` por defecto (`src/Root.tsx`).
- **Whisper es borrador**: revisa los subtítulos antes de renderizar.
- El symlink `public/Assets → ../Assets` debe existir; si se pierde: `ln -s ../Assets public/Assets`.
- En otra PC, reinstala Whisper (`node scripts/install-whisper-cpp.mjs small`) y los navegadores de Playwright.

Requiere **Node 18+**, **ffmpeg** en el PATH y **Chromium de Playwright**.
