import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_MONTSERRAT } from "../lib/fonts";
import { BRAND } from "../lib/brand";

type Props = {
  /** Frame (local a la Sequence padre) en el que aparece el CTA. */
  startFrame?: number;
  /** Texto del boton. ADAPTA a tu llamada a la accion. */
  label?: string;
};

/**
 * Pildora de CTA con entrada (escala + fade) y pulso continuo para invitar al click.
 * Se usa solo en el cierre (outro), no en el cuerpo del reel.
 */
export const OutroCTA: React.FC<Props> = ({
  startFrame = 0,
  label = "Empieza gratis",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;

  if (local < 0) return null;

  const entrance = interpolate(local, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
  });
  const entranceEased = interpolate(entrance, [0, 1], [0, 1], {
    easing: (n) => 1 - Math.pow(1 - n, 3),
  });

  // Pulso: scale 1 -> 1.045 -> 1, periodo ~1.7 s.
  const pulsePeriod = Math.round(1.7 * fps);
  const phase = (local / pulsePeriod) * Math.PI * 2;
  const pulse = 1 + 0.045 * Math.sin(phase);

  const opacity = entranceEased;
  const scale = entranceEased * pulse;
  const ty = (1 - entranceEased) * 18;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 36,
        opacity,
        transform: `translateY(${ty}px) scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          background: BRAND.GREEN,
          color: BRAND.NAVY,
          fontFamily: FONT_MONTSERRAT,
          fontWeight: 800,
          fontSize: 64,
          letterSpacing: "0.06em",
          padding: "28px 60px",
          borderRadius: 999,
          textTransform: "uppercase",
          boxShadow: "0 18px 42px rgba(0,191,144,0.55)",
          display: "inline-flex",
          alignItems: "center",
          gap: 22,
        }}
      >
        {label}
        <span
          style={{
            width: 50,
            height: 50,
            borderRadius: 999,
            background: BRAND.NAVY,
            color: BRAND.GREEN,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          →
        </span>
      </div>
    </div>
  );
};
