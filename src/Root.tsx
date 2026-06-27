import "./index.css";
import { Composition, staticFile } from "remotion";
import { Reel, reelSchema, type ReelProps } from "./Reel";
import { PromoVideo, promoSchema, type PromoProps } from "./PromoVideo";

const FPS = 30;
// FORMATO — ELECCIÓN DEL USUARIO. Cambia SOLO esta línea:
//   "vertical"   -> 1080×1920  (Reels / Shorts / TikTok / móvil)
//   "horizontal" -> 1920×1080  (YouTube / landing / demo de escritorio)
// Los encuadres de las pantallas (src/components/promo/Scene.tsx) se recolocan
// automáticamente según estas dimensiones — no hay que tocar nada más.
const ORIENTATION: "vertical" | "horizontal" = "vertical";
const [WIDTH, HEIGHT] = ORIENTATION === "vertical" ? [1080, 1920] : [1920, 1080];

// "Tutorial" = composición principal: capturas de tu app (Assets/captures/*.png)
// enmarcadas como smartphone, con cursor animado + narración (ElevenLabs).
const PROMO_BODY = Math.round(30 * FPS); // cuerpo del tutorial (ajústalo al largo de tu narración)
const PROMO_OUTRO = Math.round(8 * FPS); // cierre de marca

const PROMO_DEFAULTS: PromoProps = {
  words: [],
  hotspots: {},
  bodyDurationInFrames: PROMO_BODY,
  outroDurationInFrames: PROMO_OUTRO,
};

// "Reel" = composición alternativa para editar un screencast .mp4/.mov pregrabado
// con subtítulos Whisper (no usa capturas). Útil si grabas la pantalla en vídeo.
const DEFAULT_PROPS: ReelProps = {
  videoSrc: "Assets/Video/tutorial.mp4",
  wavSrc: "Assets/Audio/tutorial.wav",
  bgmSrc: "Assets/Audio/Background-Music/bgm.mp3",
  captionsSrc: "captions/tutorial.json",
  outroMessage: "TU MENSAJE DE CIERRE\nEN UNA O DOS LÍNEAS.",
  outroBackground: "navy",
  sponsorsVariant: "white",
  sponsorsMode: "outro-only",
  outroDurationInFrames: Math.round(8 * FPS),
  mainDurationInFrames: Math.round(25 * FPS),
  clips: [],
  voiceVolume: 1.0,
  bgmVoiceLevel: 0.1,
  bgmOutroLevel: 0.45,
  words: [],
  captionsOffsetMs: 0,
  upperGraphics: [],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Tutorial"
        component={PromoVideo}
        schema={promoSchema}
        defaultProps={PROMO_DEFAULTS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={PROMO_BODY + PROMO_OUTRO}
        calculateMetadata={async ({ props }) => {
          let words = props.words;
          if (!words || words.length === 0) {
            try {
              const res = await fetch(staticFile("captions/tutorial.json"));
              if (res.ok) words = ((await res.json()) as { words?: PromoProps["words"] }).words ?? [];
            } catch {
              words = [];
            }
          }
          let hotspots = props.hotspots;
          if (!hotspots || Object.keys(hotspots).length === 0) {
            try {
              const res = await fetch(staticFile("Assets/captures/hotspots.json"));
              if (res.ok) hotspots = (await res.json()) as PromoProps["hotspots"];
            } catch {
              hotspots = {};
            }
          }
          return {
            props: { ...props, words, hotspots },
            durationInFrames: props.bodyDurationInFrames + props.outroDurationInFrames,
          };
        }}
      />
      <Composition
        id="Reel"
        component={Reel}
        schema={reelSchema}
        defaultProps={DEFAULT_PROPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={
          DEFAULT_PROPS.mainDurationInFrames + DEFAULT_PROPS.outroDurationInFrames
        }
        calculateMetadata={async ({ props }) => {
          let words = props.words;
          if (!words || words.length === 0) {
            try {
              const res = await fetch(staticFile(props.captionsSrc));
              if (res.ok) {
                const json = (await res.json()) as { words?: ReelProps["words"] };
                words = json.words ?? [];
              }
            } catch {
              words = [];
            }
          }
          return {
            props: { ...props, words },
            durationInFrames:
              props.mainDurationInFrames + props.outroDurationInFrames,
          };
        }}
      />
    </>
  );
};
