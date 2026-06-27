import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Sparkles, Zap, MousePointerClick, Smartphone, type LucideIcon } from "lucide-react";
import { C, FONT } from "./theme";

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

// Intro genérica para lienzo VERTICAL 1080×1920: unos iconos dispersos convergen
// al logo + un titular. ADAPTA los iconos/labels y el titular a tu producto.
const ICONS: { Icon: LucideIcon; label: string; x: number; y: number }[] = [
  { Icon: Smartphone, label: "Móvil", x: 300, y: 560 },
  { Icon: Zap, label: "Rápido", x: 780, y: 600 },
  { Icon: MousePointerClick, label: "Simple", x: 320, y: 1080 },
  { Icon: Sparkles, label: "Claro", x: 760, y: 1120 },
];

export const IntroScene: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const center = { x: 540, y: 840 };
  const logoStart = durationInFrames - sec(2.0);

  const tasksOp =
    interpolate(frame, [6, sec(0.8)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(frame, [logoStart - sec(1.2), logoStart - sec(0.3)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const logoSpring = spring({ frame: frame - logoStart, fps, config: { damping: 14, mass: 0.8 } });
  const logoOp = interpolate(frame, [logoStart, logoStart + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineOp = interpolate(frame, [logoStart + 12, logoStart + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {ICONS.map((t, i) => {
        const jit = Math.sin(frame * 0.12 + i) * 10;
        const jix = Math.cos(frame * 0.1 + i * 1.7) * 12;
        const pull = interpolate(frame, [logoStart - sec(1.2), logoStart - sec(0.3)], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const x = t.x + jix + (center.x - t.x) * pull;
        const y = t.y + jit + (center.y - t.y) * pull;
        const appear = interpolate(frame, [i * 4, i * 4 + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={t.label}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: "translate(-50%,-50%)",
              opacity: tasksOp * appear,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: C.cream,
                border: `2px solid ${C.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 20px 46px rgba(0,0,0,0.14)",
              }}
            >
              <t.Icon size={66} color={C.brown} strokeWidth={1.9} />
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 26, color: C.brownSoft }}>{t.label}</div>
          </div>
        );
      })}

      {/* Logo + titular final */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 28 }}>
        <Img
          src={staticFile("Assets/Imagery/Logo-OnLight.svg")}
          style={{
            width: 560,
            height: "auto",
            opacity: logoOp,
            transform: `translateY(${interpolate(logoSpring, [0, 1], [24, 0])}px) scale(${interpolate(logoSpring, [0, 1], [0.9, 1])})`,
          }}
        />
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 44,
            color: C.brownSoft,
            opacity: lineOp,
            letterSpacing: "-0.01em",
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          Tu producto, en acción.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
