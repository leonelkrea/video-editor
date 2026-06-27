#!/usr/bin/env node
/**
 * Renderiza un video por basename.
 *
 *   node scripts/render-one.mjs demo
 *
 * Lee:
 *   - Assets/Video/<base>.mp4  (o .mov / .MOV)
 *   - Assets/Audio/<base>.wav
 *   - public/captions/<base>.json
 *   - scripts/render-config.mjs -> VIDEOS[<base>]
 *
 * Genera:
 *   - out/<base>.mp4
 */
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VIDEOS, OUTRO_SECONDS, FPS } from "./render-config.mjs";

const exec = promisify(execFile);

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const VIDEO_DIR = path.join(ROOT, "Assets", "Video");
const AUDIO_DIR = path.join(ROOT, "Assets", "Audio");
const CAPTIONS_DIR = path.join(ROOT, "public", "captions");
const OUT_DIR = path.join(ROOT, "out");

const arg = process.argv[2];
if (!arg) {
  console.error("Uso: node scripts/render-one.mjs <basename>");
  console.error("Ejemplo: node scripts/render-one.mjs demo");
  process.exit(1);
}
const base = arg.replace(/\.(mov|mp4)$/i, "");

const cfg = VIDEOS[base];
if (!cfg) {
  console.error(`No hay config para ${base} en scripts/render-config.mjs`);
  console.error(`Claves conocidas: ${Object.keys(VIDEOS).join(", ")}`);
  process.exit(1);
}

async function findVideo() {
  for (const ext of ["mp4", "mov", "MOV", "MP4"]) {
    const p = path.join(VIDEO_DIR, `${base}.${ext}`);
    try {
      await fs.access(p);
      return p;
    } catch {}
  }
  throw new Error(`No se encontro Assets/Video/${base}.(mp4|mov)`);
}

async function probeDurationSeconds(file) {
  const { stdout } = await exec("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    file,
  ]);
  return Number(stdout.trim());
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const movPath = await findVideo();
  const wavName = `${base}.wav`;
  const wavPath = path.join(AUDIO_DIR, wavName);
  const capName = `${base}.json`;
  const capPath = path.join(CAPTIONS_DIR, capName);

  for (const p of [wavPath, capPath]) {
    await fs.access(p).catch(() => {
      throw new Error(`Falta archivo: ${path.relative(ROOT, p)}`);
    });
  }

  const sourceDuration = await probeDurationSeconds(movPath);
  const sourceMs = Math.round(sourceDuration * 1000);

  const effectiveClips =
    cfg.clips && cfg.clips.length > 0
      ? cfg.clips
      : [{ fromMs: 0, toMs: sourceMs }];

  const mainMs = effectiveClips.reduce((acc, c) => acc + (c.toMs - c.fromMs), 0);
  const mainDurationInFrames = Math.round((mainMs / 1000) * FPS);
  const outroDurationInFrames = Math.round(OUTRO_SECONDS * FPS);

  const captions = JSON.parse(await fs.readFile(capPath, "utf8"));
  const words = captions.words ?? [];

  const props = {
    videoSrc: `Assets/Video/${path.basename(movPath)}`,
    wavSrc: `Assets/Audio/${wavName}`,
    bgmSrc: `Assets/Audio/Background-Music/${cfg.bgm}`,
    captionsSrc: `captions/${capName}`,
    outroMessage: cfg.outroMessage,
    outroBackground: cfg.outroBackground,
    sponsorsVariant: cfg.sponsorsVariant,
    sponsorsMode: cfg.sponsorsMode,
    outroDurationInFrames,
    mainDurationInFrames,
    clips: cfg.clips ?? [],
    voiceVolume: cfg.voiceVolume ?? 1.0,
    bgmVoiceLevel: cfg.bgmVoiceLevel ?? 0.1,
    bgmOutroLevel: cfg.bgmOutroLevel ?? 0.45,
    captionsOffsetMs: cfg.captionsOffsetMs ?? 0,
    upperGraphics: cfg.upperGraphics ?? [],
    words,
  };

  const outFile = path.join(OUT_DIR, `${base}.mp4`);
  const propsJson = JSON.stringify(props);

  console.log(`Render ${base}`);
  console.log(`  Duracion fuente: ${sourceDuration.toFixed(2)}s`);
  console.log(`  Clips: ${effectiveClips.length} (${(mainMs / 1000).toFixed(2)}s)`);
  console.log(`  Outro: ${OUTRO_SECONDS}s`);
  console.log(`  Total: ${((mainMs / 1000) + OUTRO_SECONDS).toFixed(2)}s`);
  console.log(`  BGM: ${cfg.bgm}`);
  console.log(`  Salida: ${path.relative(ROOT, outFile)}`);

  await new Promise((resolve, reject) => {
    const child = spawn(
      "npx",
      [
        "remotion",
        "render",
        "Reel",
        outFile,
        `--props=${propsJson}`,
        "--codec=h264",
        "--concurrency=1",
        "--log=info",
      ],
      { cwd: ROOT, stdio: "inherit" },
    );
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`remotion render salio con codigo ${code}`));
    });
  });

  console.log(`OK ${path.relative(ROOT, outFile)}`);
}

main().catch((err) => {
  console.error("\nRender fallido:", err.message ?? err);
  process.exit(1);
});
