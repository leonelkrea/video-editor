#!/usr/bin/env node
/**
 * Renderiza todos los videos declarados en scripts/render-config.mjs llamando
 * a render-one.mjs de forma secuencial. Solo despues de revisar los subtitulos
 * de cada video. Para el dia a dia prefiere: node scripts/render-one.mjs <base>
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VIDEOS } from "./render-config.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

async function renderOne(base) {
  await new Promise((resolve, reject) => {
    const child = spawn("node", ["scripts/render-one.mjs", base], {
      cwd: ROOT,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`render-one ${base} exited with code ${code}`));
    });
  });
}

const bases = Object.keys(VIDEOS);
console.log(`Rendering ${bases.length} reel(s) sequentially.`);

for (const base of bases) {
  console.log(`\n=== ${base} ===`);
  try {
    await renderOne(base);
  } catch (err) {
    console.error(`Failed ${base}:`, err.message);
    process.exit(1);
  }
}

console.log("\nAll renders complete.");
