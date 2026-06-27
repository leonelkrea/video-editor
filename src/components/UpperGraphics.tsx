import { useEffect, useState } from "react";
import {
  continueRender,
  delayRender,
  Easing,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * Nombre de un badge SVG animado disponible en public/Assets/animations/<name>.svg
 * Coloca tus propios SVG ahi (uno por concepto que quieras resaltar) y referencia
 * su nombre en render-config.mjs -> upperGraphics[].badge.
 * El tipo es `string` para que uses los nombres que quieras.
 */
export type BadgeName = string;

export type UpperGraphic = {
  fromMs: number;
  toMs: number;
  badge?: BadgeName;
  text?: string;
};

const TRANSITION_MS = 280;

type Props = {
  events: UpperGraphic[];
};

/**
 * Inyecta un SVG desde public/Assets/animations/<name>.svg para que sus
 * @keyframes CSS se ejecuten. Centra el badge de forma robusta:
 *   - wrapper flex con justifyContent:center
 *   - se reescriben width/height del <svg> a `size` exacto.
 */
const InlineSvgBadge: React.FC<{ name: BadgeName; size: number }> = ({
  name,
  size,
}) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [handle] = useState(() => delayRender(`Loading badge ${name}`));

  useEffect(() => {
    let cancelled = false;
    fetch(staticFile(`Assets/animations/${name}.svg`))
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        // Los SVG suelen traer width/height propios. HTML respeta el primer
        // atributo duplicado, asi que hay que ELIMINAR los originales antes de
        // inyectar el nuevo size, o el badge se descentra.
        const stripped = text.replace(/<svg([^>]*)>/, (_m, attrs) => {
          const cleaned = attrs
            .replace(/\swidth="[^"]*"/g, "")
            .replace(/\sheight="[^"]*"/g, "")
            .replace(/\spreserveAspectRatio="[^"]*"/g, "")
            .replace(/\sstyle="[^"]*"/g, "");
          return `<svg${cleaned} width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet" style="display:block">`;
        });
        setSvg(stripped);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
    return () => {
      cancelled = true;
    };
  }, [name, size, handle]);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        lineHeight: 0,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          display: "block",
          filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.5))",
        }}
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      />
    </div>
  );
};

export const UpperGraphics: React.FC<Props> = ({ events }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const anchorY = Math.round(height * 0.09);
  const badgeSize = 232;

  return (
    <div
      style={{
        position: "absolute",
        top: anchorY,
        left: 0,
        right: 0,
        pointerEvents: "none",
      }}
    >
      {events.map((e, i) => {
        const t = currentMs - e.fromMs;
        const duration = e.toMs - e.fromMs;
        if (t < -TRANSITION_MS || t > duration + TRANSITION_MS) return null;

        const inP = Math.min(1, Math.max(0, t / TRANSITION_MS));
        const outP = Math.min(1, Math.max(0, (duration - t) / TRANSITION_MS));
        const p = Math.min(inP, outP);
        const eased = Easing.out(Easing.cubic)(p);
        const opacity = eased;
        const ty = (1 - eased) * -22;
        const scale = 0.92 + eased * 0.08;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              opacity,
              transform: `translateY(${ty}px) scale(${scale})`,
              transformOrigin: "center top",
            }}
          >
            {e.badge ? <InlineSvgBadge name={e.badge} size={badgeSize} /> : null}
            {e.text ? (
              <div
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  background: "rgba(12, 22, 87, 0.9)",
                  border: "1px solid #00BF90",
                  color: "#FFFFFF",
                  fontFamily: "Montserrat",
                  fontWeight: 700,
                  fontSize: 30,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
                }}
              >
                {e.text}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
