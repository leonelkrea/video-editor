#!/usr/bin/env node
/**
 * Transcribe cada .wav en Assets/Audio/ (excepto Background-Music/) con whisper.cpp.
 * Produce JSON palabra-por-palabra en public/captions/<base>.json con forma:
 *   { source, language, words: [{ text, startMs, endMs }] }
 *
 * Uso:
 *   node scripts/transcribe.mjs            # los que falten
 *   node scripts/transcribe.mjs --force    # re-transcribe todos
 *   node scripts/transcribe.mjs <file.wav> # uno solo
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const WHISPER_BIN = path.join(ROOT, "whisper-cpp", "main");
// Prefiere el modelo `small` (mejor precision); cae a `base` si falta.
const MODEL_PREF = ["ggml-small.bin", "ggml-base.bin"];
const MODEL = await (async () => {
  for (const m of MODEL_PREF) {
    const p = path.join(ROOT, "whisper-cpp", m);
    try { await fs.access(p); return p; } catch {}
  }
  return path.join(ROOT, "whisper-cpp", MODEL_PREF[MODEL_PREF.length - 1]);
})();
const AUDIO_DIR = path.join(ROOT, "Assets", "Audio");
const OUT_DIR = path.join(ROOT, "public", "captions");

const args = process.argv.slice(2);
const force = args.includes("--force");
const explicit = args.find((a) => !a.startsWith("--") && a.endsWith(".wav"));

async function ensure(cmd, label) {
  try {
    await exec("which", [cmd]);
  } catch {
    throw new Error(`Falta dependencia: ${label} (\`${cmd}\` no esta en PATH).`);
  }
}

async function listWavs() {
  if (explicit) return [path.resolve(explicit)];
  const entries = await fs.readdir(AUDIO_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".wav"))
    .map((e) => path.join(AUDIO_DIR, e.name));
}

async function convertTo16kMono(srcWav) {
  const tmp = path.join(
    os.tmpdir(),
    `whisper-${path.basename(srcWav, ".wav")}-${Date.now()}.wav`,
  );
  await exec("ffmpeg", [
    "-y", "-i", srcWav,
    "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le",
    tmp,
  ]);
  return tmp;
}

// ADAPTA ESTE PROMPT con el vocabulario de TU proyecto: nombre del producto,
// jerga del sector, nombres propios. Mejora muchisimo el reconocimiento.
const PROMPT_ES = [
  "<TU_APP>, la herramienta para <QUÉ HACE TU SOFTWARE>.",
  "Pruébala en <tu-dominio.com>.",
  "nombre del producto, jerga del sector, nombres propios, términos de la UI que aparecen en la narración.",
].join(" ");

async function runWhisper(wav16k, basename) {
  const ofPrefix = path.join(OUT_DIR, `${basename}.raw`);
  await exec(
    WHISPER_BIN,
    [
      "-m", MODEL,
      "-f", wav16k,
      "-l", "es",
      "-ml", "1",
      "-sow",
      "-bs", "5",
      "-bo", "5",
      "--prompt", PROMPT_ES,
      "-oj",
      "-of", ofPrefix,
      "-np",
    ],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  const rawPath = `${ofPrefix}.json`;
  const raw = JSON.parse(await fs.readFile(rawPath, "utf8"));
  await fs.unlink(rawPath).catch(() => {});
  return raw;
}

function toWords(raw) {
  const segs = raw.transcription ?? [];
  return segs
    .map((s) => ({
      text: (s.text ?? "").trim(),
      startMs: Number(s.offsets?.from ?? 0),
      endMs: Number(s.offsets?.to ?? 0),
    }))
    .filter(
      (w) =>
        w.text.length > 0 &&
        w.endMs > w.startMs &&
        // Descarta marcadores no-habla tipo [MUSICA], (music), etc.
        !/^[\[\(].*[\]\)]$/.test(w.text),
    );
}

async function main() {
  await ensure("ffmpeg", "ffmpeg");
  try {
    await fs.access(WHISPER_BIN);
    await fs.access(MODEL);
  } catch {
    throw new Error(
      "Falta el binario o el modelo de whisper.cpp. Corre: node scripts/install-whisper-cpp.mjs small",
    );
  }
  await fs.mkdir(OUT_DIR, { recursive: true });

  const wavs = await listWavs();
  if (wavs.length === 0) {
    console.log("No hay archivos .wav.");
    return;
  }

  for (const wav of wavs) {
    const base = path.basename(wav, ".wav");
    const outFile = path.join(OUT_DIR, `${base}.json`);
    if (!force) {
      try {
        await fs.access(outFile);
        console.log(`OK ${base}.json ya existe, omitido`);
        continue;
      } catch {}
    }
    console.log(`-> Transcribiendo ${base} (es)...`);
    const tmp = await convertTo16kMono(wav);
    try {
      const raw = await runWhisper(tmp, base);
      const words = toWords(raw);
      await fs.writeFile(
        outFile,
        JSON.stringify({ source: path.basename(wav), language: "es", words }, null, 2),
      );
      console.log(`   ${words.length} palabras -> ${path.relative(ROOT, outFile)}`);
    } finally {
      await fs.unlink(tmp).catch(() => {});
    }
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
