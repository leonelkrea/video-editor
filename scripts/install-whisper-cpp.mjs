import { installWhisperCpp, downloadWhisperModel } from "@remotion/install-whisper-cpp";
import path from "node:path";

const WHISPER_VERSION = "1.5.5";
const WHISPER_DIR = path.resolve(process.cwd(), "whisper-cpp");
const MODEL = process.argv[2] ?? "small";

console.log(`Installing whisper.cpp v${WHISPER_VERSION} -> ${WHISPER_DIR}`);

const install = await installWhisperCpp({
  to: WHISPER_DIR,
  version: WHISPER_VERSION,
  printOutput: true,
});

console.log(
  install.alreadyExisted
    ? "whisper.cpp already present"
    : "whisper.cpp installed",
);

console.log(`\nDownloading model: ${MODEL}`);

const dl = await downloadWhisperModel({
  model: MODEL,
  folder: WHISPER_DIR,
  printOutput: true,
});

console.log(
  dl.alreadyExisted
    ? `Model ${MODEL} already present`
    : `Model ${MODEL} downloaded`,
);

console.log("\nDone.");
