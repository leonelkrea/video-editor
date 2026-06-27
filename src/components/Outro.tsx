import {
  AbsoluteFill,
  Img,
  staticFile,
  spring,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_MONTSERRAT } from "../lib/fonts";
import { BRAND, SITE_URL, GRADIENT_H } from "../lib/brand";
import { SponsorsRow, HAS_SPONSORS } from "./Sponsors";
import { OutroCTA } from "./OutroCTA";

type Props = {
  message: string;
  background: "navy" | "gradient";
  sponsorsVariant: "color" | "white";
};

/**
 * Cierre de marca: fondo + logo + mensaje unico + (patrocinadores) + URL + CTA.
 * ADAPTA:
 *   - Assets/Imagery/Background-Navy.svg / Background-Gradient.svg (tus fondos)
 *   - Assets/Imagery/Logo.svg (tu logo)
 *   - El bloque "Patrocinado por" es opcional: si no usas patrocinadores, deja
 *     los arrays vacios en Sponsors.tsx y esta seccion no se mostrara.
 */
export const Outro: React.FC<Props> = ({
  message,
  background,
  sponsorsVariant,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Fondo pintado por CSS (evita decodificar SVG como imagen en el render).
  const bgStyle =
    background === "navy"
      ? "radial-gradient(1400px 900px at 50% 42%, #3d2419 0%, #2c1810 60%, #1a0f08 100%)"
      : GRADIENT_H;

  const logoWidth = Math.round(width * 0.5);
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.9 },
    durationInFrames: 30,
  });
  const logoOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const logoY = interpolate(logoSpring, [0, 1], [22, 0]);

  const msgOpacity = interpolate(frame, [14, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const msgY = interpolate(frame, [14, 26], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sponsorStart = 30;
  const sponsorsLabelOpacity = interpolate(
    frame,
    [sponsorStart - 4, sponsorStart + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const urlOpacity = interpolate(frame, [50, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaStart = 70;

  const isWhite = sponsorsVariant === "white";
  const sponsorBoxBg = isWhite ? "transparent" : BRAND.WHITE;
  const sponsorLogoH = Math.round(width * 0.064);

  const labelStyle: React.CSSProperties = {
    fontFamily: FONT_MONTSERRAT,
    fontWeight: 600,
    fontSize: Math.round(width * 0.024),
    color: isWhite ? "rgba(255,255,255,0.78)" : BRAND.WHITE,
    letterSpacing: "0.32em",
    textTransform: "uppercase",
  };

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: bgStyle }} />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "70px",
          gap: 44,
        }}
      >
        <Img
          src={staticFile("Assets/Imagery/Logo.svg")}
          width={logoWidth}
          style={{
            width: logoWidth,
            height: "auto",
            opacity: logoOpacity,
            transform: `translateY(${logoY}px)`,
            marginBottom: 8,
          }}
        />

        <div
          style={{
            fontFamily: FONT_MONTSERRAT,
            fontWeight: 700,
            fontSize: Math.round(width * 0.046),
            color: BRAND.WHITE,
            textAlign: "center",
            letterSpacing: "0.01em",
            lineHeight: 1.16,
            textTransform: "uppercase",
            maxWidth: width - 140,
            opacity: msgOpacity,
            transform: `translateY(${msgY}px)`,
            whiteSpace: "pre-line",
          }}
        >
          {message}
        </div>

        {/* Patrocinadores (opcional): solo si hay logos configurados */}
        {HAS_SPONSORS && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22,
              opacity: sponsorsLabelOpacity,
            }}
          >
            <div style={labelStyle}>Patrocinado por</div>
            <div
              style={{
                background: sponsorBoxBg,
                padding: isWhite ? 0 : "18px 32px",
                borderRadius: 16,
              }}
            >
              <SponsorsRow
                variant={sponsorsVariant}
                height={sponsorLogoH}
                gap={Math.round(width * 0.048)}
                startFrame={sponsorStart}
              />
            </div>
          </div>
        )}

        <div
          style={{
            fontFamily: FONT_MONTSERRAT,
            fontWeight: 600,
            fontSize: Math.round(width * 0.028),
            color: BRAND.WHITE,
            letterSpacing: "0.1em",
            opacity: urlOpacity,
            marginTop: 14,
          }}
        >
          {SITE_URL}
        </div>

        <OutroCTA startFrame={ctaStart} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
