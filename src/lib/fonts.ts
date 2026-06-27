import { staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";

let loaded = false;

// Tipografía del proyecto (Inter por defecto). Cae a la sans del sistema.
// ADAPTA: pon tus .woff2/.ttf en Assets/Fonts/ y registra abajo.
export const FONT_INTER =
  "Inter, system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif";
// Alias retro-compatible para componentes existentes.
export const FONT_MONTSERRAT = FONT_INTER;

export const ensureFontsLoaded = () => {
  if (loaded) return;
  if (typeof document === "undefined") return;
  if (
    typeof window === "undefined" ||
    typeof (window as unknown as { remotion_delayRenderHandles?: unknown })
      .remotion_delayRenderHandles === "undefined"
  ) {
    return;
  }
  loaded = true;

  const reg = (file: string, weight: string) => {
    const url = staticFile(`Assets/Fonts/${file}`);
    if (typeof url !== "string") return;
    loadFont({ family: "Inter", url, format: "woff2", weight }).catch(() => {});
  };

  reg("Inter-400.woff2", "400");
  reg("Inter-500.woff2", "500");
  reg("Inter-600.woff2", "600");
  reg("Inter-700.woff2", "700");
  reg("Inter-800.woff2", "800");
};
