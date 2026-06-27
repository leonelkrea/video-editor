import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "./theme";

/**
 * Keyword centrada (puntual) que reemplaza a los subtítulos permanentes.
 * Punch-in con escala + leve overshoot; marrón sobre beige o crema sobre marrón.
 */
export const Keyword: React.FC<{
  text: string;
  variant?: "onLight" | "onDark";
  durationInFrames: number;
}> = ({ text, variant = "onLight", durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const inSpring = spring({ frame, fps, config: { damping: 12, mass: 0.6, stiffness: 140 } });
  const scale = interpolate(inSpring, [0, 1], [0.7, 1]);
  const opIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const opOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(opIn, opOut);

  const onDark = variant === "onDark";
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity }}>
      <div
        style={{
          transform: `scale(${scale})`,
          background: onDark ? C.brown : "transparent",
          color: onDark ? C.cream : C.brown,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 120,
          lineHeight: 1.02,
          letterSpacing: "-0.03em",
          textAlign: "center",
          padding: onDark ? "34px 64px" : 0,
          borderRadius: 24,
          maxWidth: 1500,
          textTransform: "uppercase",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
