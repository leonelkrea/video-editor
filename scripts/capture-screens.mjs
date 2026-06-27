#!/usr/bin/env node
/**
 * Captura las pantallas de TU software para el videotutorial, usando Playwright.
 * Es GENÉRICO: toda la parte específica de tu app vive en `capture.config.mjs`.
 *
 * Genera:
 *   - Assets/captures/<step.name>.png       (una captura por step)
 *   - Assets/captures/hotspots.json         (centros normalizados de los elementos
 *                                            marcados, para el cursor animado)
 *
 * Requisitos:
 *   - `npx playwright install chromium`  (una vez; o `npm run playwright:install`)
 *   - Tu app corriendo en CAPTURE.baseUrl (p.ej. en otra terminal: `npm run dev`).
 *
 * Uso:   node scripts/capture-screens.mjs      (o `npm run capture`)
 */
import { chromium } from "@playwright/test";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { CAPTURE } from "./capture.config.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const OUT = path.join(ROOT, "Assets", "captures");
const hotspots = {};

// Resuelve un selector declarativo del config a un locator de Playwright.
const locate = (page, sel) => {
  if (!sel || typeof sel !== "object") throw new Error(`selector inválido: ${JSON.stringify(sel)}`);
  if (sel.css) return page.locator(sel.css);
  if (sel.testId) return page.getByTestId(sel.testId);
  if (sel.role) return page.getByRole(sel.role, { name: sel.name, exact: sel.exact ?? false }).first();
  if (sel.text) return page.getByText(sel.text, { exact: sel.exact ?? false }).first();
  throw new Error(`selector sin css/testId/role/text: ${JSON.stringify(sel)}`);
};

// Oculta overlays de desarrollo comunes (Next.js dev tools, etc.) — inofensivo si no existen.
const hideOverlays = (page) =>
  page
    .addStyleTag({
      content: `nextjs-portal,[data-nextjs-toolbar],[data-nextjs-dev-tools-button],
        #__next-build-watcher,[data-nextjs-dialog-overlay]{display:none!important;visibility:hidden!important;}`,
    })
    .catch(() => {});

const shot = async (page, name) => {
  await hideOverlays(page);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  console.log("  ✓", name);
};

// Centro de un elemento como fracción del viewport (= de la captura).
const hotspot = async (page, key, sel) => {
  try {
    const box = await locate(page, sel).boundingBox({ timeout: 3000 });
    const vp = page.viewportSize();
    if (!box || !vp) throw new Error("sin box");
    hotspots[key] = {
      fx: +((box.x + box.width / 2) / vp.width).toFixed(4),
      fy: +((box.y + box.height / 2) / vp.height).toFixed(4),
    };
    console.log("    • hotspot", key, hotspots[key]);
  } catch {
    console.log("    • hotspot", key, "NO ENCONTRADO (revisa el selector en capture.config.mjs)");
  }
};

// Ejecuta una acción declarativa antes de capturar.
const runAction = async (page, a) => {
  if (a.wait != null) return page.waitForTimeout(a.wait);
  if (a.goto) return page.goto(`${CAPTURE.baseUrl}${a.goto}`, { waitUntil: "networkidle" }).catch(() => {});
  if (a.clickText) return locate(page, { text: a.clickText }).click({ timeout: a.timeout ?? 4000 }).catch(() => {});
  // Forma general: { click: <selector> }
  if (a.click) return locate(page, a.click).click({ timeout: a.timeout ?? 4000 }).catch(() => {});
  console.log("    ! acción desconocida:", JSON.stringify(a));
};

async function doLogin(page) {
  const auth = CAPTURE.auth;
  if (!auth) return;
  console.log("Login…");
  await page.goto(`${CAPTURE.baseUrl}${auth.path}`, { waitUntil: "networkidle" });
  await locate(page, auth.email).fill(auth.credentials.email);
  await locate(page, auth.password).fill(auth.credentials.password);
  await locate(page, auth.submit).click();
  if (auth.waitForUrl) await page.waitForURL(auth.waitForUrl, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const step of CAPTURE.steps) {
      const device = step.device ?? "mobile";
      const vp = CAPTURE[device] ?? CAPTURE.mobile;
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.deviceScaleFactor ?? 2,
        isMobile: device === "mobile",
        hasTouch: device === "mobile",
      });
      const page = await ctx.newPage();
      console.log(`\n[${step.name}] ${device} → ${step.path}`);
      await doLogin(page);
      await page.goto(`${CAPTURE.baseUrl}${step.path}`, { waitUntil: "networkidle" }).catch(() => {});
      await page.waitForTimeout(step.waitMs ?? 1500);
      for (const a of step.actions ?? []) await runAction(page, a);
      await shot(page, step.name);
      for (const h of step.hotspots ?? []) await hotspot(page, h.key, h);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
  await fs.writeFile(path.join(OUT, "hotspots.json"), JSON.stringify(hotspots, null, 2));
  console.log("\nHotspots →", hotspots);
  console.log("Listo →", path.relative(ROOT, OUT));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
