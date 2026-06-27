import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT } from "./theme";
import { SITE_URL } from "../../lib/brand";
import { DynamicBackground } from "./DynamicBackground";

/**
 * Cierre del promo, coherente con el estilo (beige + marrón, footer ondulante).
 * Logo contenido, frase animada por líneas y un CTA de TEXTO (no botón).
 */
export const PromoOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSp = spring({ frame, fps, config: { damping: 16, mass: 0.7 } });
  const logoOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  const line = (delay: number) => {
    const op = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const y = interpolate(frame, [delay, delay + 14], [22, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { opacity: op, transform: `translateY(${y}px)` };
  };

  const ruleW = interpolate(frame, [44, 64], [0, 240], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaOp = interpolate(frame, [58, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const arrowX = interpolate(frame, [62, 78], [-14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <DynamicBackground />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 30,
          paddingBottom: 60,
        }}
      >
        <Img
          src={staticFile("Assets/Imagery/Logo-OnLight.svg")}
          style={{
            width: 300,
            height: "auto",
            opacity: logoOp,
            transform: `translateY(${interpolate(logoSp, [0, 1], [16, 0])}px) scale(${interpolate(logoSp, [0, 1], [0.92, 1])})`,
          }}
        />

        <div style={{ textAlign: "center", lineHeight: 1.12 }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, color: C.brown, letterSpacing: "-0.02em", ...line(14) }}>
            Tu mensaje de cierre,
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, color: C.brown, letterSpacing: "-0.02em", ...line(26) }}>
            en una o dos líneas.
          </div>
        </div>

        <div style={{ width: ruleW, height: 3, background: C.amber, borderRadius: 999 }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: ctaOp,
            fontFamily: FONT,
            fontSize: 40,
          }}
        >
          <span style={{ color: C.brownSoft, fontWeight: 600 }}>Pruébalo en</span>
          <span style={{ color: C.amberDeep, fontWeight: 800 }}>{SITE_URL}</span>
          <span style={{ color: C.amberDeep, fontWeight: 800, transform: `translateX(${arrowX}px)` }}>→</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
