/**
 * Config de render. No aplica cuando se usan las APIs de Node directamente.
 * Todas las opciones: https://remotion.dev/docs/config
 */
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(enableTailwind);
// Descomenta solo si usas WebGL (three / light-leaks):
// Config.setChromiumOpenGlRenderer("angle");
