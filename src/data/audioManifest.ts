import { SpeakerId } from '../types/game';

/**
 * Local narration recordings.
 *
 * Each entry maps the EXACT narration text used by the game to an audio file
 * committed inside public/audio/. When a match is found the game plays that
 * file directly from our own server, so no request is made to Gemini and no
 * API key is needed for that line.
 *
 * The recordings are produced once with the same model, the same "Zephyr"
 * prebuilt voice and the same Egyptian-Arabic style prompt the game already
 * uses (see scripts/generate-audio.ts), so the voice stays identical.
 *
 * Adding a line:
 *   npx tsx scripts/generate-audio.ts "<exact narration text>" public/audio/<name>.wav
 * then add the matching entry below.
 */

interface LocalAudioRecord {
  /** Must match the narration text in src/data/gameContent.ts exactly. */
  text: string;
  /** Path inside public/, e.g. audio/station1-adam-line1.wav */
  file: string;
  speaker: SpeakerId;
}

const LOCAL_AUDIO_RECORDS: LocalAudioRecord[] = [
  {
    speaker: 'adam',
    file: 'audio/station1-adam-line1.wav',
    // المحطة ١ — أول جملة لآدم في تبويب الشرح (مطابقة حرفيًا لـ gameContent.ts)
    text: 'أهلًا بكم عند بوابة عالم الصلاة! لكي ندخل البوابة يجب أن نعرف أولًا ما هي الصلاة ولماذا نصلي.',
  },
];

const normalize = (text: string): string => text.replace(/\s+/g, ' ').trim();

const TEXT_TO_FILE = new Map<string, string>(
  LOCAL_AUDIO_RECORDS.map((record) => [normalize(record.text), `/${record.file}`])
);

/** Returns a same-origin URL for a bundled recording, or null when none exists. */
export function getLocalAudioPath(text: string): string | null {
  if (!text) return null;
  return TEXT_TO_FILE.get(normalize(text)) ?? null;
}

/** Number of narration lines served locally, without any API call. */
export const LOCAL_AUDIO_COUNT = TEXT_TO_FILE.size;
