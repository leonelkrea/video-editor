/**
 * TOKENS DE MARCA — ADAPTA a TU software.
 * Los nombres (NAVY, GREEN, TEAL, WHITE) son "ranuras" del motor; mantenlos,
 * solo cambia los HEX por los de tu producto.
 *   - NAVY  -> color principal / fondo oscuro / caja de subtitulos
 *   - GREEN -> CTA / acento / éxito
 *   - TEAL  -> acento secundario
 *   - WHITE -> texto sobre fondos oscuros
 *
 * Placeholder neutro (azul). Cámbialo por tu paleta.
 */
export const BRAND = {
  NAVY: "#16181D",
  GREEN: "#3B82F6",
  TEAL: "#2563EB",
  WHITE: "#FFFFFF",
} as const;

export const GRADIENT_V = `linear-gradient(to bottom, ${BRAND.NAVY} 0%, ${BRAND.GREEN} 100%)`;
export const GRADIENT_H = `linear-gradient(to right, ${BRAND.NAVY} 0%, ${BRAND.GREEN} 100%)`;

/** URL que aparece en el cierre. ADAPTA a tu dominio. */
export const SITE_URL = "tu-dominio.com";
