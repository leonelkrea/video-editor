import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../../lib/brand";

export type CursorKey = {
  at: number; // segundos desde el inicio de la escena
  x: number; // px en el lienzo (canvas)
  y: number; // px en el lienzo (canvas)
  click?: boolean;
};

const easeInOut = (t: number) =>
  interpolate(t, [0, 1], [0, 1], {
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Posición interpolada con suavizado por tramo entre keyframes.
const posAt = (keys: CursorKey[], fps: number, frame: number) => {
  if (keys.length === 0) return { x: 0, y: 0 };
  const f = keys.map((k) => k.at * fps);
  if (frame <= f[0]) return { x: keys[0].x, y: keys[0].y };
  const last = keys.length - 1;
  if (frame >= f[last]) return { x: keys[last].x, y: keys[last].y };
  let i = 0;
  while (i < last && frame > f[i + 1]) i++;
  const t = easeInOut((frame - f[i]) / Math.max(1, f[i + 1] - f[i]));
  return {
    x: keys[i].x + (keys[i + 1].x - keys[i].x) * t,
    y: keys[i].y + (keys[i + 1].y - keys[i].y) * t,
  };
};

const ClickRipples: React.FC<{ keys: CursorKey[]; mode: "arrow" | "tap" }> = ({
  keys,
  mode,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxR = mode === "tap" ? 70 : 46;
  return (
    <>
      {keys
        .filter((k) => k.click)
        .map((k, idx) => {
          const local = frame - k.at * fps;
          if (local < 0 || local > 0.55 * fps) return null;
          const p = local / (0.55 * fps);
          const radius = interpolate(p, [0, 1], [6, maxR], { easing: Easing.out(Easing.cubic) });
          const opacity = interpolate(p, [0, 1], [0.55, 0]);
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: k.x - radius,
                top: k.y - radius,
                width: radius * 2,
                height: radius * 2,
                borderRadius: 999,
                border: `${mode === "tap" ? 6 : 4}px solid ${BRAND.GREEN}`,
                opacity,
              }}
            />
          );
        })}
    </>
  );
};

export const Cursor: React.FC<{ keys: CursorKey[]; mode: "arrow" | "tap" }> = ({
  keys,
  mode,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { x, y } = posAt(keys, fps, frame);

  // Pulso de "presión" cerca de cada click.
  const press = keys
    .filter((k) => k.click)
    .reduce((acc, k) => {
      const d = Math.abs(frame - k.at * fps);
      return Math.min(acc, d < 5 ? interpolate(d, [0, 5], [0.82, 1]) : 1);
    }, 1);

  const appear = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: appear }}>
      <ClickRipples keys={keys} mode={mode} />
      {mode === "tap" ? (
        <div
          style={{
            position: "absolute",
            left: x - 30,
            top: y - 30,
            width: 60,
            height: 60,
            borderRadius: 999,
            background: "rgba(245,158,11,0.28)",
            border: `3px solid ${BRAND.GREEN}`,
            transform: `scale(${press})`,
            boxShadow: "0 6px 16px rgba(28,19,13,0.3)",
          }}
        />
      ) : (
        <svg
          width={52}
          height={52}
          viewBox="0 0 24 24"
          style={{
            position: "absolute",
            left: x,
            top: y,
            transform: `scale(${press})`,
            transformOrigin: "top left",
            filter: "drop-shadow(0 3px 5px rgba(28,19,13,0.45))",
          }}
        >
          <path
            d="M5 2 L5 19 L9.5 14.8 L12.4 21.6 L15 20.4 L12.1 13.7 L18 13.4 Z"
            fill={BRAND.WHITE}
            stroke="#1c130d"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
};
