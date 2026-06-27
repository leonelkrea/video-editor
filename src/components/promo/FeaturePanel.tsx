import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { LucideIcon } from "lucide-react";
import { C, FONT } from "./theme";

export type Bullet = { Icon: LucideIcon; text: string; at: number };

/**
 * Columna izquierda para las escenas de móvil: título + bullets con icono que
 * entran escalonados. Texto marrón sobre beige.
 */
export const FeaturePanel: React.FC<{
  kicker?: string;
  title: string;
  bullets: Bullet[];
}> = ({ kicker, title, bullets }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 18, mass: 0.7 } });
  const titleX = interpolate(titleSpring, [0, 1], [-44, 0]);
  const titleOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 0,
        bottom: 0,
        width: 720,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 30,
      }}
    >
      {kicker && (
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: C.amberDeep,
            opacity: titleOp,
            transform: `translateX(${titleX}px)`,
          }}
        >
          {kicker}
        </div>
      )}
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 74,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          color: C.brown,
          opacity: titleOp,
          transform: `translateX(${titleX}px)`,
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 8 }}>
        {bullets.map((b, i) => {
          const local = frame - b.at;
          const op = interpolate(local, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = interpolate(local, [0, 12], [-28, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: op,
                transform: `translateX(${x}px)`,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: C.brown,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <b.Icon size={32} color={C.cream} strokeWidth={2.2} />
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: 34,
                  color: C.brownSoft,
                  lineHeight: 1.2,
                }}
              >
                {b.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
