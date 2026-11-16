import "dotenv/config";
import crypto from "crypto";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      apiVersion: "v1beta",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

const CACHE_DIR = path.resolve(__dirname, ".tts-cache");
try {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
} catch {
  // Ignore if read-only filesystem
}

const ttsCache = new Map<string, string>();
const inFlightTts = new Map<string, Promise<string | null>>();
const MAX_CACHE_ITEMS = 350;

interface TtsBody {
  text?: string;
  speaker?: "adam" | "noor" | "adhkar";
}

function getCacheHash(speaker: string, text: string): string {
  return crypto
    .createHash("sha256")
    .update(`v5_verbatim_egy::${speaker}::${text}`)
    .digest("hex");
}

function readDiskCache(hash: string): string | null {
  try {
    const filePath = path.join(CACHE_DIR, `${hash}.wav.b64`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }
  } catch {
    // Ignore disk cache errors
  }
  return null;
}

function writeDiskCache(hash: string, base64Audio: string): void {
  try {
    const filePath = path.join(CACHE_DIR, `${hash}.wav.b64`);
    fs.writeFileSync(filePath, base64Audio, "utf8");
  } catch {
    // Ignore disk cache write errors
  }
}

function prepareSpokenText(rawText: string): string {
  // Preserve every single written word verbatim without skipping, summarizing,
  // or changing any word, while adding gentle natural pause breathing between phrases.
  return rawText
    .replace(/\s+/g, " ")
    .replace(/([.!؟])\s+/g, "$1 ... ")
    .replace(/([،؛])\s+/g, "$1 ")
    .trim();
}

async function synthesizeSpeech(
  rawText: string,
  _speaker: "adam" | "noor" | "adhkar"
): Promise<string | null> {
  if (!ai) return null;

  // One consistent, calm, beautiful, natural Egyptian Arabic voice style
  // maintained uniformly across every screen and all 7 levels of the game.
  const voiceName = "Zephyr";
  const stylePrompt =
    "Voice persona: A calm, soft, sweet, warm, natural Egyptian Arabic young female teacher speaking slowly and clearly to primary school children. Natural human speech with gentle, clear Egyptian Arabic pronunciation, relaxed unhurried pace, and smooth natural pauses at punctuation. Read every written word accurately without skipping or altering anything, and pronounce Quranic verses, Islamic terms, and prayer supplications clearly and respectfully. Never robotic, never rushed, never loud, and maintain the exact same calm voice style consistently.";

  const speechText = prepareSpokenText(rawText);

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash-lite-tts",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: speechText,
            speechMetadata: {
              style: stylePrompt,
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  return base64Audio || null;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.post("/api/tts", async (req, res) => {
    const body = req.body as TtsBody;
    const rawText = (body.text || "").trim();
    const speaker = body.speaker || "noor";

    if (!rawText) {
      res.status(400).json({ error: "Missing text for speech synthesis" });
      return;
    }

    if (rawText.length > 4000) {
      res.status(400).json({ error: "Text exceeds maximum length" });
      return;
    }

    const hash = getCacheHash(speaker, rawText);

    const memCached = ttsCache.get(hash);
    if (memCached) {
      res.json({ audioBase64: memCached, mimeType: "audio/wav", cached: true });
      return;
    }

    const diskCached = readDiskCache(hash);
    if (diskCached) {
      ttsCache.set(hash, diskCached);
      res.json({ audioBase64: diskCached, mimeType: "audio/wav", cached: true });
      return;
    }

    if (!ai) {
      res.status(503).json({
        error: "Gemini API key is not configured on the server",
      });
      return;
    }

    try {
      let pending = inFlightTts.get(hash);
      if (!pending) {
        pending = synthesizeSpeech(rawText, speaker);
        inFlightTts.set(hash, pending);
      }

      const base64Audio = await pending;
      inFlightTts.delete(hash);

      if (!base64Audio) {
        res.status(502).json({ error: "No audio returned from speech model" });
        return;
      }

      if (ttsCache.size >= MAX_CACHE_ITEMS) {
        const oldestKey = ttsCache.keys().next().value;
        if (oldestKey) {
          ttsCache.delete(oldestKey);
        }
      }
      ttsCache.set(hash, base64Audio);
      writeDiskCache(hash, base64Audio);

      res.json({ audioBase64: base64Audio, mimeType: "audio/wav" });
    } catch (err) {
      inFlightTts.delete(hash);
      const message = err instanceof Error ? err.message : String(err);
      const isQuota =
        message.includes("429") || message.includes("RESOURCE_EXHAUSTED");
      console.error("TTS generation error:", message);
      res.status(isQuota ? 429 : 500).json({
        error: isQuota ? "quota_exceeded" : "Failed to synthesize speech",
        detail: message,
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
