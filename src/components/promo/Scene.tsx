import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BrowserFrame } from "./BrowserFrame";
import { PhoneFrame, type Rect } from "./PhoneFrame";
import { Cursor, type CursorKey } from "./Cursor";
import { FeaturePanel, type Bullet } from "./FeaturePanel";
import { useSceneMotion } from "./DynamicBackground";

export type FrameState = { src: string; at: number };
export type CursorFrac = { at: number; fx: number; fy: number; click?: boolean };
export type Panel = { kicker?: string; title: string; bullets: Bullet[] };

export type Shot = {
  device: "browser" | "phone";
  layout: "full" | "split";
  url?: string;
  frames: FrameState[];
  cursor?: CursorFrac[];
  panel?: Panel;
  zoom?: [number, number];
  punchTo?: { fx: number; fy: number };
};

// Rects RESPONSIVOS: se derivan de las dimensiones reales de la composición, así el
// MISMO código sirve para vertical (1080×1920) y horizontal (1920×1080). El formato es
// elección del usuario; basta cambiar WIDTH/HEIGHT en Root.tsx y todo se recoloca solo.
const PHONE_ASPECT = 390 / 844;   // ancho/alto del contenido del teléfono
const BROWSER_ASPECT = 1920 / 1080;
const computeRects = (W: number, H: number): { PHONE_FULL: Rect; BROWSER_FULL: Rect } => {
  const portrait = H >= W;
  // Teléfono: alto ~80% del lienzo, centrado.
  const phoneH = Math.round(H * (portrait ? 0.78 : 0.82));
  const phoneW = Math.round(phoneH * PHONE_ASPECT);
  const PHONE_FULL: Rect = { x: Math.round((W - phoneW) / 2), y: Math.round((H - phoneH) / 2), w: phoneW, h: phoneH };
  // Navegador (capturas desktop): ancho ~78–92% del lienzo, centrado.
  const browserW = Math.round(W * (portrait ? 0.92 : 0.78));
  const browserH = Math.round(browserW / BROWSER_ASPECT);
  const BROWSER_FULL: Rect = { x: Math.round((W - browserW) / 2), y: Math.round((H - browserH) / 2), w: browserW, h: browserH };
  return { PHONE_FULL, BROWSER_FULL };
};

const FrameFade: React.FC<{ at: number; first: boolean; children: React.ReactNode }> = ({
  at,
  first,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = first
    ? 1
    : interpolate(frame, [at * 30 - 7, at * 30], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  return <div style={{ position: "absolute", inset: 0, opacity }}>{children}</div>;
};

export const Scene: React.FC<{ shot: Shot; durationInFrames: number }> = ({
  shot,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isPhone = shot.device === "phone";
  const { PHONE_FULL, BROWSER_FULL } = computeRects(width, height);
  const rect = isPhone ? PHONE_FULL : BROWSER_FULL;

  const { opacity, ty, scale: mScale } = useSceneMotion(durationInFrames);

  const [z0, z1] = shot.zoom ?? (isPhone ? [1.0, 1.03] : [1.02, 1.12]);
  const zoom = interpolate(frame, [0, durationInFrames], [z0, z1], { extrapolateRight: "clamp" });
  const focus = shot.punchTo
    ? { x: rect.x + shot.punchTo.fx * rect.w, y: rect.y + shot.punchTo.fy * rect.h }
    : { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };

  const keys: CursorKey[] = (shot.cursor ?? []).map((k) => ({
    at: k.at,
    x: rect.x + k.fx * rect.w,
    y: rect.y + k.fy * rect.h,
    click: k.click,
  }));

  return (
    <AbsoluteFill style={{ opacity }}>
      {isPhone && shot.panel && <FeaturePanel {...shot.panel} />}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${ty}px) scale(${mScale})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${zoom})`,
            transformOrigin: `${focus.x}px ${focus.y}px`,
          }}
        >
          {shot.frames.map((f, i) => (
            <FrameFade key={f.src} at={f.at} first={i === 0}>
              {isPhone ? (
                <PhoneFrame src={f.src} rect={rect} />
              ) : (
                <BrowserFrame src={f.src} rect={rect} url={shot.url} />
              )}
            </FrameFade>
          ))}
          <Cursor keys={keys} mode={isPhone ? "tap" : "arrow"} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
