import "dotenv/config";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

/**
 * One-off narration generator.
 *
 * It uses EXACTLY the same TTS model, prebuilt voice and Egyptian-Arabic style
 * prompt that the running game uses in server.ts, so the produced recording is
 * the same voice the game already speaks with.
 *
 * Usage:
 *   tsx scripts/generate-audio.ts "<exact narration text>" public/audio/<name>.wav
 *
 * Requires GEMINI_API_KEY (the free Google AI Studio tier is enough; no billing).
 * The generated file is committed into the project and played locally by
 * src/data/audioManifest.ts, so the game never calls Gemini again for that line.
 */

const MODEL = "gemini-3.8-flash-lite-tts";
const VOICE_NAME = "Zephyr";

// Kept byte-for-byte identical to the style prompt in server.ts
const STYLE_PROMPT =
  "Voice persona: A calm, soft, sweet, warm, natural Egyptian Arabic young female teacher speaking slowly and clearly to primary school children. Natural human speech with gentle, clear Egyptian Arabic pronunciation, relaxed unhurried pace, and smooth natural pauses at punctuation. Read every written word accurately without skipping or altering anything, and pronounce Quranic verses, Islamic terms, and prayer supplications clearly and respectfully. Never robotic, never rushed, never loud, and maintain the exact same calm voice style consistently.";

// Same text preparation as server.ts so the recording matches the live voice.
function prepareSpokenText(rawText: string): string {
  return rawText
    .replace(/\s+/g, " ")
    .replace(/([.!؟])\s+/g, "$1 ... ")
    .replace(/([،؛])\s+/g, "$1 ")
    .trim();
}

async function main() {
  const [rawText, outRel] = process.argv.slice(2);

  if (!rawText || !outRel) {
    console.error(
      'Usage: tsx scripts/generate-audio.ts "<exact narration text>" public/audio/<name>.wav'
    );
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      "GEMINI_API_KEY is not set. Add a free Google AI Studio key in Settings -> Environment variables."
    );
    process.exit(2);
  }

  const ai = new GoogleGenAI({
    apiKey,
    apiVersion: "v1beta",
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prepareSpokenText(rawText),
            speechMetadata: { style: STYLE_PROMPT },
          },
        ],
      },
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } },
      },
    },
  });

  const inline = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  const base64 = inline?.data;
  if (!base64) {
    console.error("No audio returned by the speech model.");
    process.exit(3);
  }

  const mime = inline?.mimeType || "";
  const outPath = path.resolve(outRel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const buffer = Buffer.from(base64, "base64");

  if (/wav/i.test(mime)) {
    fs.writeFileSync(outPath, buffer);
  } else if (/l16|pcm|raw/i.test(mime) || mime === "") {
    // Raw PCM -> wrap in a real WAV container so browsers can play it directly.
    const rate = Number((mime.match(/rate=(\d+)/i) || [])[1] || 24000);
    const tmpPcm = `${outPath}.pcm`;
    fs.writeFileSync(tmpPcm, buffer);
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-f",
        "s16le",
        "-ar",
        String(rate),
        "-ac",
        "1",
        "-i",
        tmpPcm,
        outPath,
      ],
      { stdio: "ignore" }
    );
    fs.unlinkSync(tmpPcm);
  } else {
    fs.writeFileSync(outPath, buffer);
  }

  const size = fs.statSync(outPath).size;
  console.log(`WROTE ${outRel} (${size} bytes, mime=${mime || "unknown"})`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
