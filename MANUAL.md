# Manual — Plantilla de pipeline audiovisual (copia + adapta)

> 🎬 ¿Quieres el **videotutorial de tu software** (capturas de pantalla + narración)?
> Empieza por **[`TUTORIAL.md`](./TUTORIAL.md)** (composición `Tutorial` + Playwright).
> Este MANUAL describe el motor completo y la variante de **screencast** (composición `Reel`).

Esta carpeta **ya es un proyecto funcional**. El motor (composición, subtítulos, mezcla de
audio, cortes, cierre) está escrito y probado. Tu trabajo es **instalar dependencias y adaptar
la marca + los materiales** para producir tu vídeo.

> Filosofía: **no reconstruir nada desde cero.** Lo que funciona se copia tal cual; solo se
> tocan los archivos marcados como **ADAPTA**.

---

## 0. Qué hace este software (capacidades)

Genera **videos verticales/horizontales subtitulados** de forma programática:

- Renderiza video desde código React (**Remotion**) → MP4 H.264, 30 fps.
- **Subtítulos automáticos** palabra por palabra con **Whisper** (whisper.cpp), animados y con estilo de marca.
- **Cortes por clip** con crossfade, y **remapeo automático** de subtítulos a la nueva línea de tiempo.
- **Reemplazo del audio** original por una voz limpia (`.wav`) + **música de fondo** con curvas (fade in/out, niveles distintos bajo voz y en el cierre).
- **Gráficos superiores** (ícono + texto) sincronizados a momentos clave.
- **Cierre (outro)** con fondo, logo, mensaje único, patrocinadores (opcional), URL y CTA.
- Configuración **editorial por video** en un solo archivo (`scripts/render-config.mjs`).

---

## 1. Prerrequisitos del sistema (una vez)

```bash
node --version        # >= v18 (recomendado 20 LTS)
brew install ffmpeg   # ffmpeg + ffprobe (macOS). Linux: apt install ffmpeg
ffprobe -version
```

Windows: Node desde nodejs.org, ffmpeg desde gyan.dev (añadir al PATH).

---

## 2. Instalar el proyecto

```bash
cd PLANTILLA-VIDEO     # o como hayas renombrado la carpeta
npm install
```

---

## 3. Whisper (subtítulos)

Whisper **no es una app del sistema**: vive como carpeta `whisper-cpp/` **dentro del proyecto**
(binario `main` + modelos `ggml-*.bin`).

- **Si ya tienes un `whisper-cpp/` de otro proyecto en esta MISMA PC** → cópialo (el binario ya
  compilado funciona igual y te ahorras ~640 MB):
  ```bash
  cp -R "/ruta/al/otro-proyecto/whisper-cpp" "./whisper-cpp"
  ```
- **Si no existe** (primera vez u otra máquina) → instálalo:
  ```bash
  node scripts/install-whisper-cpp.mjs small
  ```

---

## 4. Mapa de archivos: MOTOR vs MARCA

### 🟢 MOTOR — no necesitas tocar (cópialo tal cual)
| Archivo | Qué hace |
|---|---|
| `src/Reel.tsx` | Composición/timeline: clips, crossfades, mezcla, remapeo de subtítulos. |
| `src/components/Subtitles.tsx` | Subtítulos animados (agrupa palabras en chunks). |
| `src/components/UpperGraphics.tsx` | Gráficos superiores con SVG animados. |
| `src/index.ts`, `src/index.css` | Entrada de Remotion + Tailwind. |
| `scripts/install-whisper-cpp.mjs` | Instalador de Whisper. |
| `scripts/transcribe.mjs` | Genera subtítulos (solo adaptas el PROMPT, ver abajo). |
| `scripts/render-one.mjs`, `render-all.mjs` | Renderizado. |
| `remotion.config.ts`, `tsconfig.json` | Configuración técnica. |

### 🟡 MARCA — ADAPTA estos a tu web
| Archivo | Qué cambiar |
|---|---|
| `src/lib/brand.ts` | HEX de tu paleta + `SITE_URL` (tu dominio). |
| `src/lib/fonts.ts` | Tus tipografías en `Assets/Fonts/`. |
| `src/Root.tsx` | **Formato** (vertical 1080×1920 / horizontal 1920×1080) y default props. |
| `src/components/Outro.tsx` | Logo, fondos y secciones del cierre. |
| `src/components/OutroCTA.tsx` | Texto del botón CTA. |
| `src/components/Sponsors.tsx` | Rutas de logos de patrocinador (o déjalo vacío). |
| `scripts/transcribe.mjs` → `PROMPT_ES` | Vocabulario de tu producto/sector. |
| `scripts/render-config.mjs` | Config de cada video (mensaje, música, cortes, gráficos). |

---

## 5. Dónde van los materiales (IMPORTANTE: el symlink)

Remotion sirve los archivos estáticos desde `public/`. En este proyecto, los materiales viven
en la carpeta `Assets/` (raíz) y un **symlink `public/Assets → ../Assets`** los hace visibles
para `staticFile("Assets/...")`. **Ese symlink ya está creado** en la plantilla; no lo borres.

> Si clonas el proyecto y el symlink se pierde, recréalo:
> ```bash
> ln -s ../Assets public/Assets
> ```
> (En Windows, o si prefieres no usar symlinks, mueve la carpeta `Assets/` dentro de `public/`.)

Coloca tus materiales así:

```
Assets/
├── Video/<base>.mp4            # 1 archivo = 1 video
├── Audio/
│   ├── <base>.wav              # voz limpia (fuente de Whisper)
│   └── Background-Music/*.mp3   # música de fondo
├── Fonts/                      # tus .ttf / .otf
├── Imagery/                    # Logo.svg, Background-Navy.svg, Background-Gradient.svg, logos…
└── animations/<badge>.svg      # SVG animados para los gráficos superiores (opcional)

public/captions/<base>.json     # lo genera `npm run transcribe`
```

Los nombres de archivo que esperan los componentes de marca (adáptalos o renombra tus assets):
- `Assets/Imagery/Logo.svg`
- `Assets/Imagery/Background-Navy.svg` y `Background-Gradient.svg`
- `Assets/Imagery/Patrocinador N - Color.png` / `- White.png` (si usas patrocinadores)

---

## 6. Flujo por video

1. Coloca `Assets/Video/<base>.mp4`, `Assets/Audio/<base>.wav` y la música.
2. Transcribe: `npm run transcribe -- <base>.wav`.
3. **Revisa y corrige** `public/captions/<base>.json` (nombres propios, ortografía, timing).
4. Añade/edita la entrada `<base>` en `scripts/render-config.mjs`.
5. Previsualiza en vivo: `npm run dev` (Remotion Studio).
6. Renderiza: `node scripts/render-one.mjs <base>` → `out/<base>.mp4`.
7. Verifica frames:
   ```bash
   ffmpeg -i out/<base>.mp4 -vf fps=1/3 out/preview_%02d.png
   ```

> Whisper es **borrador, no final**: revisa siempre los subtítulos antes de renderizar.

---

## 7. Adaptar el formato (vertical vs horizontal)

En `src/Root.tsx`:
- **Reels / Shorts (vertical):** `WIDTH = 1080`, `HEIGHT = 1920` (valor por defecto).
- **Web / YouTube (horizontal):** `WIDTH = 1920`, `HEIGHT = 1080`.

Los componentes usan proporciones (`width * 0.05`…), así que se reacomodan solos, pero revisa
visualmente la posición de subtítulos y cierre tras el cambio.

---

## 8. Comandos rápidos

```bash
npm install                                  # dependencias
node scripts/install-whisper-cpp.mjs small   # whisper (o copia whisper-cpp/ de otra PC)
npm run dev                                  # preview en vivo
npm run transcribe -- <base>.wav             # subtítulos
node scripts/render-one.mjs <base>           # render -> out/<base>.mp4
npm run lint                                 # eslint + typecheck
```

---

## 9. Checklist de adaptación

- [ ] `npm install` corre sin errores.
- [ ] `whisper-cpp/` presente (copiado o instalado).
- [ ] `src/lib/brand.ts`: paleta + `SITE_URL`.
- [ ] `src/lib/fonts.ts` + fuentes en `Assets/Fonts/`.
- [ ] `Assets/Imagery/`: `Logo.svg`, fondos y (opcional) patrocinadores.
- [ ] `PROMPT_ES` en `transcribe.mjs` con tu vocabulario.
- [ ] Formato correcto en `Root.tsx`.
- [ ] Una entrada por video en `render-config.mjs`.
- [ ] `public/Assets` apunta a `../Assets` (symlink intacto).
