import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_MONTSERRAT } from "../lib/fonts";
import { BRAND } from "../lib/brand";

export type Word = { text: string; startMs: number; endMs: number };
export type Chunk = { text: string; startMs: number; endMs: number };

export const groupWordsIntoChunks = (words: Word[]): Chunk[] => {
  const chunks: Chunk[] = [];
  let buf: Word[] = [];
  const flush = () => {
    if (buf.length === 0) return;
    chunks.push({
      text: buf.map((w) => w.text).join(" "),
      startMs: buf[0].startMs,
      endMs: buf[buf.length - 1].endMs,
    });
    buf = [];
  };
  for (const w of words) {
    const tentative = [...buf, w];
    const text = tentative.map((x) => x.text).join(" ");
    const spanMs = w.endMs - (tentative[0]?.startMs ?? w.startMs);
    const tooLong = text.length > 28 || tentative.length > 4 || spanMs > 1600;
    if (tooLong && buf.length > 0) {
      flush();
      buf.push(w);
    } else {
      buf.push(w);
    }
    if (/[.!?…]$/.test(w.text)) flush();
  }
  flush();
  return chunks;
};

type Props = {
  words: Word[];
  offsetMs?: number;
};

export const Subtitles: React.FC<Props> = ({ words, offsetMs = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const currentMs = (frame / fps) * 1000 - offsetMs;

  const chunks = groupWordsIntoChunks(words);
  const active = chunks.find(
    (c) => currentMs >= c.startMs && currentMs < c.endMs,
  );
  if (!active) return null;

  const localFrame =
    frame - Math.floor(((active.startMs + offsetMs) / 1000) * fps);
  const fadeIn = interpolate(localFrame, [0, 4], [0, 1], {
    extrapolateRight: "clamp",
  });
  const popScale = interpolate(localFrame, [0, 6], [0.94, 1], {
    extrapolateRight: "clamp",
  });

  const anchorY = Math.round(height * 0.68);
  const fontSize = Math.round(width * 0.056);
  const padX = Math.round(fontSize * 0.46);
  const padY = Math.round(fontSize * 0.3);

  return (
    <div
      style={{
        position: "absolute",
        top: anchorY,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: width - 160,
          background: BRAND.NAVY,
          color: BRAND.WHITE,
          fontFamily: FONT_MONTSERRAT,
          fontWeight: 600,
          fontSize,
          lineHeight: 1.15,
          padding: `${padY}px ${padX}px`,
          borderRadius: 14,
          textAlign: "center",
          letterSpacing: "-0.005em",
          textTransform: "uppercase",
          opacity: fadeIn,
          transform: `scale(${popScale})`,
          boxShadow: "0 14px 36px rgba(12, 22, 87, 0.45)",
        }}
      >
        {active.text}
      </div>
    </div>
  );
};
