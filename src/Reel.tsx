import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  staticFile,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { Subtitles, type Word } from "./components/Subtitles";
import { Outro } from "./components/Outro";
import { SponsorsMarquee } from "./components/Sponsors";
import { UpperGraphics, type UpperGraphic } from "./components/UpperGraphics";
import { ensureFontsLoaded } from "./lib/fonts";

const wordSchema = z.object({
  text: z.string(),
  startMs: z.number(),
  endMs: z.number(),
});

const clipSchema = z.object({
  fromMs: z.number(),
  toMs: z.number(),
});

const upperGraphicSchema = z.object({
  fromMs: z.number(),
  toMs: z.number(),
  badge: z.string().optional(),
  text: z.string().optional(),
});

export const reelSchema = z.object({
  videoSrc: z.string(),
  wavSrc: z.string(),
  bgmSrc: z.string(),
  captionsSrc: z.string(),
  outroMessage: z.string(),
  outroBackground: z.enum(["navy", "gradient"]),
  sponsorsVariant: z.enum(["color", "white"]),
  sponsorsMode: z.enum(["outro-only", "marquee"]),
  outroDurationInFrames: z.number(),
  mainDurationInFrames: z.number(),
  clips: z.array(clipSchema).default([]),
  voiceVolume: z.number().default(1.0),
  bgmVoiceLevel: z.number().default(0.1),
  bgmOutroLevel: z.number().default(0.45),
  words: z.array(wordSchema),
  captionsOffsetMs: z.number().default(0),
  upperGraphics: z.array(upperGraphicSchema).default([]),
});

export type ReelProps = z.infer<typeof reelSchema>;

const CROSSFADE_FRAMES = 9;

const remapWord = (
  w: Word,
  clips: { fromMs: number; toMs: number }[],
): Word | null => {
  let elapsedMs = 0;
  for (const c of clips) {
    if (w.endMs <= c.fromMs) return null;
    if (w.startMs >= c.toMs) {
      elapsedMs += c.toMs - c.fromMs;
      continue;
    }
    const startInClip = Math.max(w.startMs, c.fromMs);
    const endInClip = Math.min(w.endMs, c.toMs);
    const isFullyInside = w.startMs >= c.fromMs && w.endMs <= c.toMs;
    // Only filter words that get heavily clipped at a boundary.
    if (!isFullyInside && endInClip - startInClip < 80) {
      elapsedMs += c.toMs - c.fromMs;
      continue;
    }
    return {
      text: w.text,
      startMs: elapsedMs + (startInClip - c.fromMs),
      endMs: elapsedMs + (endInClip - c.fromMs),
    };
  }
  return null;
};

const FadeWrap: React.FC<{
  fadeFn: (frame: number) => number;
  children: React.ReactNode;
}> = ({ fadeFn, children }) => {
  const frame = useCurrentFrame();
  const opacity = fadeFn(frame);
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>{children}</div>
  );
};

const ClipLayer: React.FC<{
  videoSrc: string;
  wavSrc: string;
  startFromSec: number;
  endAtSec: number;
  voiceVolume: number;
  fadeFn: (frame: number) => number;
  fps: number;
}> = ({ videoSrc, wavSrc, startFromSec, endAtSec, voiceVolume, fadeFn, fps }) => {
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#000" }} />
      <FadeWrap fadeFn={fadeFn}>
        <OffthreadVideo
          src={videoSrc}
          muted
          startFrom={Math.round(startFromSec * fps)}
          endAt={Math.round(endAtSec * fps)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </FadeWrap>
      <Audio
        src={wavSrc}
        startFrom={Math.round(startFromSec * fps)}
        endAt={Math.round(endAtSec * fps)}
        volume={(f) => fadeFn(f) * voiceVolume}
      />
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = ({
  videoSrc,
  wavSrc,
  bgmSrc,
  outroMessage,
  outroBackground,
  sponsorsVariant,
  sponsorsMode,
  outroDurationInFrames,
  mainDurationInFrames,
  clips,
  voiceVolume,
  bgmVoiceLevel,
  bgmOutroLevel,
  words,
  captionsOffsetMs,
  upperGraphics,
}) => {
  ensureFontsLoaded();
  const { fps, height } = useVideoConfig();
  const total = mainDurationInFrames + outroDurationInFrames;
  const fadeInF = Math.round(0.3 * fps);
  const fadeOutF = Math.round(1.0 * fps);
  const rampF = Math.round(0.6 * fps);

  const bgmVolume = (f: number) => {
    if (f < fadeInF) return interpolate(f, [0, fadeInF], [0, bgmVoiceLevel]);
    if (f < mainDurationInFrames - rampF) return bgmVoiceLevel;
    if (f < mainDurationInFrames)
      return interpolate(
        f,
        [mainDurationInFrames - rampF, mainDurationInFrames],
        [bgmVoiceLevel, bgmOutroLevel],
      );
    if (f < total - fadeOutF) return bgmOutroLevel;
    return interpolate(f, [total - fadeOutF, total], [bgmOutroLevel, 0]);
  };

  const src = staticFile(videoSrc);
  const wavPath = staticFile(wavSrc);

  const effectiveClips =
    clips.length > 0
      ? clips
      : [
          {
            fromMs: 0,
            toMs: Math.round((mainDurationInFrames / fps) * 1000),
          },
        ];

  const remappedWords = words
    .map((w) => remapWord(w, effectiveClips))
    .filter((w): w is Word => w !== null);

  // Marquee positioned below the subtitle band (subs at ~68% -> marquee at ~82%)
  const stripHeight = 120;
  const marqueeTop = Math.round(height * 0.82);

  let cursorFrames = 0;
  const segments = effectiveClips.map((c, idx) => {
    const segFrames = Math.max(1, Math.round(((c.toMs - c.fromMs) / 1000) * fps));
    const startFrame = cursorFrames;
    cursorFrames += segFrames;
    return { ...c, segFrames, startFrame, idx };
  });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={mainDurationInFrames} layout="none">
        {segments.map((s) => {
          const fadeFn = (f: number) => {
            const inP =
              s.idx === 0
                ? 1
                : interpolate(f, [0, CROSSFADE_FRAMES], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
            const outP =
              s.idx === segments.length - 1
                ? 1
                : interpolate(
                    f,
                    [s.segFrames - CROSSFADE_FRAMES, s.segFrames],
                    [1, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  );
            return Math.min(inP, outP);
          };
          return (
            <Sequence
              key={s.idx}
              from={s.startFrame}
              durationInFrames={s.segFrames}
              layout="none"
            >
              <ClipLayer
                videoSrc={src}
                wavSrc={wavPath}
                startFromSec={s.fromMs / 1000}
                endAtSec={s.toMs / 1000}
                voiceVolume={voiceVolume}
                fadeFn={fadeFn}
                fps={fps}
              />
            </Sequence>
          );
        })}

        <Subtitles words={remappedWords} offsetMs={captionsOffsetMs} />

        {upperGraphics.length > 0 && (
          <UpperGraphics events={upperGraphics as UpperGraphic[]} />
        )}

        {sponsorsMode === "marquee" && (
          <SponsorsMarquee
            variant={sponsorsVariant}
            top={marqueeTop}
            height={stripHeight}
          />
        )}
      </Sequence>

      <Sequence
        from={mainDurationInFrames}
        durationInFrames={outroDurationInFrames}
        layout="none"
      >
        <Outro
          message={outroMessage}
          background={outroBackground}
          sponsorsVariant={sponsorsVariant}
        />
      </Sequence>

      <Audio src={staticFile(bgmSrc)} volume={bgmVolume} />
    </AbsoluteFill>
  );
};
