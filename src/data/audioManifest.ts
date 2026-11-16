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
 * prebuilt voice and the same Egyptian-Arabic style prompt that the game
 * already uses (see scripts/generate-audio.ts), so the voice is unchanged.
 *
 * Adding a new line: run
 *   npx tsx scripts/generate-audio.ts "<exact narration text>" public/audio/<name>.wav
 * then add the matching entry below.
 */

const normalize = (text: string): string => text.replace(/\s+/g, ' ').trim();

interface LocalAudioRecord {
  file: string;
  speaker: SpeakerId;
}

const LOCAL_AUDIO_RECORDS: LocalAudioRecord[] = [
  {
    // المحطة ١ — أول جملة لآدم في تبويب الشرح
    speaker: 'adam',
    file: 'audio/station1-adam-line1.wav',
    // النص مطابق حرفيًا لما في src/data/gameContent.ts (المحطة ١، الحوار الأول)
    ...{
      text: 'أهلًا بكم عند بوابة عالم الصلاة! لكي ندخل البوابة يجب أن نعرف أولًا ما هي الصلاة ولماذا نصلي.',
    },
  } as unknown as LocalAudioRecord & { text: string },
];

const TEXT_TO_FILE = new Map<string, string>(
  (LOCAL_AUDIO_RECORDS as Array<LocalAudioRecord & { text: string }>).map(
    (record) => [normalize(record.text), `/${record.file}`]
  )
);

/** Returns a same-origin URL for a local recording, or null when none exists. */
export function getLocalAudioPath(text: string): string | null {
  if (!text) return null;
  return TEXT_TO_FILE.get(normalize(text)) ?? null;
}

/** Number of narration lines that are served locally (no API call). */
export const LOCAL_AUDIO_COUNT = TEXT_TO_FILE.size;
