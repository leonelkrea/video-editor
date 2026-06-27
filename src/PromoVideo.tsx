import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { z } from "zod";
import { ensureFontsLoaded } from "./lib/fonts";
import { PromoOutro } from "./components/promo/PromoOutro";
import { DynamicBackground } from "./components/promo/DynamicBackground";
import { Scene, type Shot } from "./components/promo/Scene";
import { IntroScene } from "./components/promo/IntroScene";
import { RecapScene } from "./components/promo/RecapScene";
import { Keyword } from "./components/promo/Keyword";

const FPS = 30;
// Narración generada en ElevenLabs (o similar), exportada como WAV.
// Colócala en Assets/Audio/tutorial.wav. Es la pista de voz del tutorial.
const VOICE = "Assets/Audio/tutorial.wav";
// Música de fondo opcional. Colócala en Assets/Audio/Background-Music/bgm.mp3.
const BGM = "Assets/Audio/Background-Music/bgm.mp3";
const sec = (s: number) => Math.round(s * FPS);

const hotspotSchema = z.object({ fx: z.number(), fy: z.number() });
export const promoSchema = z.object({
  words: z.array(z.object({ text: z.string(), startMs: z.number(), endMs: z.number() })).default([]),
  hotspots: z.record(z.string(), hotspotSchema).default({}),
  bodyDurationInFrames: z.number().default(Math.round(30 * FPS)),
  outroDurationInFrames: z.number().default(Math.round(8 * FPS)),
});
export type PromoProps = z.infer<typeof promoSchema>;

type HotMap = Record<string, { fx: number; fy: number }>;
const hp = (H: HotMap, key: string, fx: number, fy: number) => H[key] ?? { fx, fy };

// ---------- GUIÓN DEL TUTORIAL (ejemplo) ----------
// ADAPTA estas secciones a tu app: cada `frames[].src` es una captura generada por
// `npm run capture` (Assets/captures/<name>.png), y cada `cursor[]` usa los hotspots
// del mismo nombre (Assets/captures/hotspots.json). Sincroniza los tiempos `from/to`
// con tu narración. El lienzo es vertical: usa device "phone" para pantallas móviles.
const buildSections = (
  H: HotMap,
): { from: number; to: number; shot?: Shot; graphic?: "intro" | "recap" }[] => [
  // 1 · Intro de marca
  { from: 0, to: 4, graphic: "intro" },

  // 2 · Pantalla principal (móvil)
  {
    from: 4,
    to: 14,
    shot: {
      device: "phone",
      layout: "full",
      frames: [{ src: "Assets/captures/mobile-home.png", at: 0 }],
      zoom: [1.0, 1.04],
      cursor: [
        { at: 1.0, fx: 0.5, fy: 0.6 },
        { at: 4.0, ...hp(H, "cta-principal", 0.5, 0.85) },
        { at: 4.4, ...hp(H, "cta-principal", 0.5, 0.85), click: true },
      ],
    },
  },

  // 3 · Una acción clave (móvil)
  {
    from: 14,
    to: 24,
    shot: {
      device: "phone",
      layout: "full",
      frames: [{ src: "Assets/captures/mobile-detalle.png", at: 0 }],
      zoom: [1.0, 1.05],
      cursor: [
        { at: 1.0, fx: 0.5, fy: 0.5 },
        { at: 4.5, ...hp(H, "boton-anadir", 0.5, 0.9) },
        { at: 4.9, ...hp(H, "boton-anadir", 0.5, 0.9), click: true },
      ],
    },
  },

  // 4 · Recap / cierre del cuerpo
  { from: 24, to: 30, graphic: "recap" },
];

// Palabras clave puntuales (centro de pantalla) sobre el cuerpo. ADAPTA.
const KEYWORDS: { text: string; at: number; dur: number }[] = [
  { text: "Así de fácil", at: 9.0, dur: 2.0 },
];

export const PromoVideo: React.FC<PromoProps> = ({ hotspots, bodyDurationInFrames, outroDurationInFrames }) => {
  ensureFontsLoaded();
  const total = bodyDurationInFrames + outroDurationInFrames;
  const sections = buildSections(hotspots ?? {});

  const fadeInF = sec(0.3);
  const fadeOutF = sec(1);
  const rampF = sec(0.6);
  const duck = 0.11;
  const outroLvl = 0.42;
  const bgmVolume = (f: number) => {
    if (f < fadeInF) return interpolate(f, [0, fadeInF], [0, duck]);
    if (f < bodyDurationInFrames - rampF) return duck;
    if (f < bodyDurationInFrames)
      return interpolate(f, [bodyDurationInFrames - rampF, bodyDurationInFrames], [duck, outroLvl]);
    if (f < total - fadeOutF) return outroLvl;
    return interpolate(f, [total - fadeOutF, total], [outroLvl, 0]);
  };

  return (
    <AbsoluteFill>
      {/* Cuerpo (el outro tiene su propio fondo) */}
      <Sequence durationInFrames={bodyDurationInFrames} layout="none">
        <DynamicBackground />

        {sections.map((s, i) => {
          const from = sec(s.from);
          const dur = sec(s.to) - sec(s.from);
          return (
            <Sequence key={i} from={from} durationInFrames={dur} layout="none">
              {s.graphic === "intro" ? (
                <IntroScene durationInFrames={dur} />
              ) : s.graphic === "recap" ? (
                <RecapScene durationInFrames={dur} />
              ) : s.shot ? (
                <Scene shot={s.shot} durationInFrames={dur} />
              ) : null}
            </Sequence>
          );
        })}

        {KEYWORDS.map((k, i) => (
          <Sequence key={`kw${i}`} from={sec(k.at)} durationInFrames={sec(k.dur)} layout="none">
            <Keyword text={k.text} variant="onDark" durationInFrames={sec(k.dur)} />
          </Sequence>
        ))}

        <Audio src={staticFile(VOICE)} />
      </Sequence>

      <Sequence from={bodyDurationInFrames} durationInFrames={outroDurationInFrames} layout="none">
        <PromoOutro />
      </Sequence>

      <Audio src={staticFile(BGM)} volume={bgmVolume} />
    </AbsoluteFill>
  );
};
