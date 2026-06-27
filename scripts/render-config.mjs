/**
 * Configuracion editorial POR video (composición "Reel" — screencast pregrabado).
 *
 * NOTA: el videotutorial principal es la composición "Tutorial" (capturas + cursor),
 * que se configura en src/PromoVideo.tsx, NO aquí. Este archivo solo aplica si
 * editas un screencast .mp4/.mov con `render-one.mjs`.
 *
 * Cada clave = basename de un archivo en Assets/Video/ (sin extension). Necesitas:
 *   - Assets/Video/<clave>.mp4   (o .mov)
 *   - Assets/Audio/<clave>.wav   (la voz; fuente de Whisper)
 *   - public/captions/<clave>.json  (lo genera `npm run transcribe`)
 */
export const VIDEOS = {
  // Ejemplo. Renombra la clave al basename de tus archivos y coloca:
  //   Assets/Video/tutorial.mp4
  //   Assets/Audio/tutorial.wav
  //   Assets/Audio/Background-Music/bgm.mp3
  "tutorial": {
    bgm: "bgm.mp3",                       // archivo en Assets/Audio/Background-Music/
    outroMessage: "TU MENSAJE DE CIERRE\nEN UNA O DOS LÍNEAS.",
    outroBackground: "navy",             // "navy" | "gradient"
    sponsorsVariant: "white",            // "color" | "white"
    sponsorsMode: "outro-only",          // "outro-only" | "marquee"
    voiceVolume: 1.0,                    // sube a 1.3-1.5 si la voz esta baja
    bgmVoiceLevel: 0.1,                  // musica bajo la voz
    bgmOutroLevel: 0.45,                 // musica en el cierre
    captionsOffsetMs: 0,                 // desfase global si la voz arranca tarde
    clips: [],                           // [] = video completo; o [{fromMs,toMs}, ...]
    upperGraphics: [
      // { fromMs: 8000, toMs: 12000, badge: "feature", text: "Tu titular aquí" },
    ],
  },
};

export const OUTRO_SECONDS = 8.0;
export const FPS = 30;
