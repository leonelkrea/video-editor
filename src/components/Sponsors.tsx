import { Img, staticFile, useCurrentFrame, interpolate } from "remotion";

type Variant = "color" | "white";

/**
 * ADAPTA: rutas a tus logos de patrocinador/aliado en public/Assets/Imagery/.
 * Regla: la version "color" va sobre fondo blanco; la version "white" (logos en
 * blanco) va sobre fondo oscuro. Nunca mezcles versiones.
 * Si no tienes patrocinadores, deja los arrays vacios ([]) y no se renderiza nada.
 */
// Por defecto sin patrocinadores: arrays vacíos -> la sección no se renderiza.
// Si tienes aliados, añade aquí las rutas a public/Assets/Imagery/.
const SPONSORS: Record<Variant, string[]> = {
  color: [],
  white: [],
};

// Hay patrocinadores que mostrar (controla si el cierre pinta la sección).
export const HAS_SPONSORS = SPONSORS.color.length > 0 || SPONSORS.white.length > 0;

type RowProps = {
  variant: Variant;
  height?: number;
  gap?: number;
  startFrame?: number;
};

/** Fila de logos que entran juntos con fade. */
export const SponsorsRow: React.FC<RowProps> = ({
  variant,
  height = 86,
  gap = 64,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - startFrame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ty = interpolate(frame - startFrame, [0, 12], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const items = SPONSORS[variant];
  if (items.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap,
        opacity,
        transform: `translateY(${ty}px)`,
      }}
    >
      {items.map((src) => (
        <Img key={src} src={staticFile(src)} style={{ height, width: "auto" }} />
      ))}
    </div>
  );
};

/**
 * Banda marquee de logos (modo "marquee") que vive en el cuerpo del reel,
 * debajo de los subtitulos. Logos en bucle horizontal.
 */
export const SponsorsMarquee: React.FC<{
  variant: Variant;
  top: number;
  height?: number;
  loopFrames?: number;
}> = ({ variant, top, height = 140, loopFrames = 660 }) => {
  const frame = useCurrentFrame();
  const items = SPONSORS[variant];
  const logoHeight = 78;
  const innerGap = 130;
  const cellPadding = 130;

  const stripBg = variant === "white" ? "rgba(12, 22, 87, 0.92)" : "#FFFFFF";

  const t = (frame % loopFrames) / loopFrames;
  const x = -50 * t;

  const Cell = ({ k }: { k: number }) => (
    <div
      key={k}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: innerGap,
        padding: `0 ${cellPadding}px`,
        flexShrink: 0,
      }}
    >
      {items.map((src) => (
        <Img
          key={src}
          src={staticFile(src)}
          style={{ height: logoHeight, width: "auto", display: "block" }}
        />
      ))}
    </div>
  );

  const allCells = [0, 1, 2, 3];

  if (items.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        height,
        background: stripBg,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          whiteSpace: "nowrap",
          transform: `translateX(${x}%)`,
        }}
      >
        {allCells.map((i) => (
          <Cell key={i} k={i} />
        ))}
      </div>
    </div>
  );
};
