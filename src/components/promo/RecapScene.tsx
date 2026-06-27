import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "./theme";

// ADAPTA estas promesas a tu producto.
const WORDS = ["Rápido.", "Simple.", "Claro.", "Tuyo."];

/** Recap (≈11s): las cuatro promesas entran en cadencia, cierre "en un solo lugar". */
export const RecapScene: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const finalStart = durationInFrames - sec(3.4);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18 }}>
      {frame < finalStart ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
          {WORDS.map((w, i) => {
            const at = sec(0.3 + i * 0.85);
            const sp = spring({ frame: frame - at, fps, config: { damping: 16, mass: 0.6 } });
            const op = interpolate(frame - at, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div
                key={w}
                style={{
                  fontFamily: FONT,
                  fontWeight: 800,
                  fontSize: 92,
                  lineHeight: 1.02,
                  letterSpacing: "-0.03em",
                  color: i % 2 === 0 ? C.brown : C.amberDeep,
                  opacity: op,
                  transform: `translateX(${interpolate(sp, [0, 1], [-50, 0])}px)`,
                }}
              >
                {w}
              </div>
            );
          })}
        </div>
      ) : (
        <FinalLine />
      )}
    </AbsoluteFill>
  );
};

const FinalLine: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const start = durationInFrames - sec(3.4);
  const sp = spring({ frame: frame - start, fps, config: { damping: 13, mass: 0.6 } });
  const op = interpolate(frame - start, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ textAlign: "center", opacity: op, transform: `scale(${interpolate(sp, [0, 1], [0.85, 1])})` }}>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 52, color: C.brownSoft }}>Todo en</div>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 104, color: C.brown, letterSpacing: "-0.03em" }}>
        un solo lugar
      </div>
    </div>
  );
};

function sec(s: number) {
  return Math.round(s * 30);
}
