import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "./theme";

// Blob ondulante marrón anclado abajo, como footer vivo.
const BottomWave: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 1920;
  const H = 1080;
  const wave = (baseY: number, amp: number, speed: number, phase: number, color: string, op: number) => {
    const step = 80;
    let d = `M 0 ${H} L 0 ${baseY}`;
    for (let x = 0; x <= W; x += step) {
      const y = baseY + Math.sin(frame * speed + x * 0.0055 + phase) * amp;
      d += ` L ${x} ${y.toFixed(1)}`;
    }
    d += ` L ${W} ${H} Z`;
    return <path d={d} fill={color} opacity={op} />;
  };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
      {wave(1006, 20, 0.05, 0, C.brownSoft, 0.16)}
      {wave(1040, 24, 0.038, 1.6, C.brown, 0.92)}
    </svg>
  );
};

/**
 * Fondo beige continuo y vivo: blobs cálidos que derivan lentamente. Persiste
 * durante todo el cuerpo para dar continuidad (menos sensación de "diapositivas").
 */
export const DynamicBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const blob = (cx: number, cy: number, r: number, color: string, speed: number, phase: number) => {
    const t = frame * speed + phase;
    const x = cx + Math.cos(t) * 90;
    const y = cy + Math.sin(t * 0.8) * 70;
    return (
      <div
        style={{
          position: "absolute",
          left: x - r,
          top: y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          background: color,
          filter: "blur(90px)",
          opacity: 0.55,
        }}
      />
    );
  };
  return (
    <AbsoluteFill style={{ background: C.beige, overflow: "hidden" }}>
      {blob(520, 380, 360, C.beigeHi, 0.012, 0)}
      {blob(1450, 720, 420, C.beigeLo, 0.01, 2)}
      {blob(1500, 200, 300, "#f3e9d8", 0.014, 4)}
      {blob(360, 900, 320, "#ece0cd", 0.011, 1)}
      {/* viñeta suave */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(1300px 820px at 50% 42%, rgba(255,253,249,0.5) 0%, rgba(239,230,216,0) 60%)",
        }}
      />
      <BottomWave />
    </AbsoluteFill>
  );
};

// Entrada/salida fluida de una escena sobre el fondo continuo.
export const useSceneMotion = (durationInFrames: number) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(enter, exit);
  const ty = interpolate(enter, [0, 1], [40, 0]) - interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 28], { extrapolateLeft: "clamp" });
  const scale = interpolate(enter, [0, 1], [0.965, 1]);
  return { opacity, ty, scale };
};
