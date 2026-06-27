# Instalación

Esta plantilla genera un **videotutorial animado del software donde la instalas**. Para que pueda
analizar tu código y escribir el guion, va **dentro del repo de tu proyecto** (en el root), como una
subcarpeta. Luego le pides a **Claude** que cree el tutorial con la skill incluida.

## 1. Clonar dentro de tu proyecto (en el root)

Desde la raíz del repo de tu software:

```bash
cd /ruta/a/tu-proyecto            # el software que quieres documentar
git clone git@github.com:leonelkrea/video-editor.git
```

Queda así (el motor de vídeo es una subcarpeta de tu proyecto):

```
tu-proyecto/
├── src/ ...                      # tu app
├── package.json                  # tu app
└── video-editor/                 # ← esta plantilla (el motor del vídeo)
    ├── src/ scripts/ Assets/ ...
    └── .claude/skills/crear-videotutorial/
```

## 2. Instalar dependencias del motor

```bash
cd video-editor
npm install
npx playwright install chromium                 # navegador para capturar pantallas
node scripts/install-whisper-cpp.mjs small      # Whisper (o copia un whisper-cpp/ existente)
```

Requisitos del sistema: **Node 18+** y **ffmpeg** en el PATH (`brew install ffmpeg` en macOS).

## 3. Activar la skill para Claude

La skill `crear-videotutorial` viaja en `video-editor/.claude/skills/`. Para que Claude la vea
**desde la raíz de tu proyecto**, tienes dos opciones:

- **A) Symlink (recomendado):**
  ```bash
  cd /ruta/a/tu-proyecto
  mkdir -p .claude/skills
  ln -s ../../video-editor/.claude/skills/crear-videotutorial .claude/skills/crear-videotutorial
  ```
- **B) Instalación global de usuario:**
  ```bash
  cp -R video-editor/.claude/skills/crear-videotutorial ~/.claude/skills/
  ```

(Si prefieres, puedes trabajar directamente **dentro de `video-editor/`** con Claude; desde ahí la
skill ya está disponible y Claude puede leer tu código en `../`.)

## 4. Crear el tutorial con Claude

Abre Claude Code en tu proyecto y pídelo en lenguaje natural, por ejemplo:

> "Quiero un videotutorial vertical de mi app que muestre cómo se registra y crea su primer proyecto."

o invoca la skill directamente:

> `/crear-videotutorial`

Claude te guiará por las 7 fases: **formato → guion (analizando tu código y el user journey) →
narración en ElevenLabs → transcripción con Whisper → captura de pantallas con Playwright →
animación con cursor sincronizado → render**. El MP4 final queda en `video-editor/out/tutorial.mp4`.

## Qué hace cada paso (resumen)
| Paso | Herramienta | Tu parte |
|---|---|---|
| Guion | Claude analiza tu repo | confirmar el texto |
| Voz | **ElevenLabs** | pegar el guion, descargar el audio → `Assets/Audio/tutorial.wav` |
| Tiempos | **Whisper** | revisar los subtítulos |
| Pantallas | **Playwright** | tener tu app corriendo en local |
| Animación + render | **Remotion** | revisar el preview |

> Detalle del flujo: `TUTORIAL.md`. Detalle del motor: `MANUAL.md`.
