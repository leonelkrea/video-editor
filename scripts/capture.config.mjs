/**
 * CONFIG DE CAPTURA — ADAPTA esto a TU software.
 *
 * `capture-screens.mjs` lee este archivo y, con Playwright, abre tu app en
 * `baseUrl`, navega cada `step` y guarda un PNG en Assets/captures/<name>.png.
 * También calcula `hotspots.json`: el centro (en fracción 0..1 del viewport) de
 * los elementos que marques, para sincronizar el cursor animado del vídeo.
 *
 * Requisitos antes de capturar:
 *   1. `npx playwright install chromium`  (una vez)
 *   2. Tu app corriendo en `baseUrl` (p.ej. `npm run dev` en tu proyecto).
 *
 * Selectores soportados en `hotspots[]` y `actions[]`:
 *   { text: "Texto visible" }                      -> getByText(text)
 *   { role: "button", name: "Guardar" }            -> getByRole(role, { name })
 *   { css: "input[type=email]" }                   -> locator(css)
 *   { testId: "add-to-cart" }                      -> getByTestId(testId)
 */
export const CAPTURE = {
  baseUrl: process.env.BASE_URL || "http://localhost:3000",

  // Viewport "smartphone" por defecto (iPhone 12/13/14 lógico). El vídeo es vertical,
  // así que captura SIEMPRE en móvil salvo que un step pida otra cosa.
  mobile: { width: 390, height: 844, deviceScaleFactor: 3 },
  desktop: { width: 1920, height: 1080, deviceScaleFactor: 2 },

  // Login opcional. Pon `null` si tu app no requiere autenticación para grabar.
  auth: null,
  // Ejemplo de login (descomenta y adapta):
  // auth: {
  //   path: "/login",
  //   email: { css: 'input[type="email"]' },
  //   password: { css: 'input[type="password"]' },
  //   submit: { css: 'button[type="submit"]' },
  //   credentials: { email: "demo@tuapp.com", password: "demo1234" },
  //   waitForUrl: /\/(dashboard|app|home)/, // regex; opcional
  // },

  // Cada step = una pantalla del tutorial. `name` es el basename del PNG y la clave
  // que referenciarás en src/PromoVideo.tsx (Assets/captures/<name>.png).
  steps: [
    {
      name: "mobile-home",
      path: "/",
      device: "mobile",
      waitMs: 1500,
      actions: [],
      hotspots: [
        // { key: "cta-principal", role: "button", name: "Empezar" },
      ],
    },
    {
      name: "mobile-detalle",
      path: "/",
      device: "mobile",
      waitMs: 1200,
      // Navega a un estado antes de capturar (clics previos):
      actions: [
        // { clickText: "Ver más" },
        // { wait: 800 },
      ],
      hotspots: [
        // { key: "boton-anadir", role: "button", name: "Añadir" },
      ],
    },
  ],
};
