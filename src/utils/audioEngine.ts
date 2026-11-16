import { SpeakerId } from '../types/game';
import { getLocalAudioPath } from '../data/audioManifest';

export interface SpeechSegment {
  text: string;
  speaker: SpeakerId;
}

class AudioEngine {
  private soundEnabled = true;
  private audioCtx: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private sequenceToken = 0;
  private activePlayId: string | null = null;

  // Ready-to-play Blob URLs + in-flight promises for zero-delay playback
  private readyBlobUrls = new Map<string, string>();
  private inFlightFetches = new Map<string, Promise<string | null>>();
  private prefetchQueue: { key: string; text: string; speaker: SpeakerId }[] =
    [];
  private activePrefetchWorkers = 0;
  private readonly MAX_PREFETCH_WORKERS = 3;
  private prefetchPausedUntil = 0;
  private lastFetchErrorCode: string | null = null;
  private localAudioCache = new Map<string, boolean>();

  private speakingListeners = new Set<
    (state: { speaker: SpeakerId | null; playId: string | null }) => void
  >();
  private errorListeners = new Set<
    (err: { playId: string | null; code: string; message: string } | null) => void
  >();

  // Peaceful ambient background music nodes
  private musicMasterGain: GainNode | null = null;
  private musicIntervalId: number | null = null;
  private musicRunning = false;
  private musicStep = 0;

  private readonly MUSIC_NORMAL_GAIN = 0.03;
  private readonly MUSIC_DUCKED_GAIN = 0.006;

  private makeKey(text: string, speaker: SpeakerId): string {
    return `v5::${speaker}::${text.trim()}`;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopSpeech();
      this.stopBackgroundMusic();
    } else {
      this.ensureBackgroundMusic();
    }
  }

  public subscribeSpeaking(
    cb: (speaker: SpeakerId | null, playId?: string | null) => void
  ): () => void {
    const wrapped = (state: {
      speaker: SpeakerId | null;
      playId: string | null;
    }) => cb(state.speaker, state.playId);
    this.speakingListeners.add(wrapped);
    return () => {
      this.speakingListeners.delete(wrapped);
    };
  }

  public subscribeError(
    cb: (err: { playId: string | null; code: string; message: string } | null) => void
  ): () => void {
    this.errorListeners.add(cb);
    return () => {
      this.errorListeners.delete(cb);
    };
  }

  private notifyError(
    err: { playId: string | null; code: string; message: string } | null
  ): void {
    this.errorListeners.forEach((cb) => cb(err));
  }

  private notifySpeaking(
    speaker: SpeakerId | null,
    playId: string | null = null
  ): void {
    this.activePlayId = playId;
    this.speakingListeners.forEach((cb) => cb({ speaker, playId }));
    this.setMusicDucked(speaker !== null);
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (Ctx) {
        this.audioCtx = new Ctx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private setMusicDucked(ducked: boolean): void {
    if (!this.audioCtx || !this.musicMasterGain) return;
    const now = this.audioCtx.currentTime;
    const target = !this.soundEnabled
      ? 0.0001
      : ducked
      ? this.MUSIC_DUCKED_GAIN
      : this.MUSIC_NORMAL_GAIN;
    this.musicMasterGain.gain.cancelScheduledValues(now);
    this.musicMasterGain.gain.setTargetAtTime(target, now, ducked ? 0.12 : 0.45);
  }

  public ensureBackgroundMusic(): void {
    if (!this.soundEnabled || this.musicRunning) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.musicRunning = true;
    const master = ctx.createGain();
    master.gain.setValueAtTime(this.MUSIC_NORMAL_GAIN, ctx.currentTime);

    const warmFilter = ctx.createBiquadFilter();
    warmFilter.type = 'lowpass';
    warmFilter.frequency.setValueAtTime(660, ctx.currentTime);
    warmFilter.Q.setValueAtTime(0.7, ctx.currentTime);

    master.connect(warmFilter);
    warmFilter.connect(ctx.destination);
    this.musicMasterGain = master;

    const melodyHz = [
      293.66, 349.23, 392.0, 440.0, 392.0, 349.23,
      293.66, 329.63, 349.23, 440.0, 523.25, 440.0,
    ];
    const bassHz = [146.83, 146.83, 174.61, 174.61, 196.0, 146.83];

    const scheduleBeat = () => {
      if (!this.soundEnabled || !this.audioCtx || !this.musicMasterGain) return;
      const now = this.audioCtx.currentTime;

      const noteFreq = melodyHz[this.musicStep % melodyHz.length];
      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, now);

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(0.45, now + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(noteGain);
      noteGain.connect(this.musicMasterGain);
      osc.start(now);
      osc.stop(now + 2.3);

      if (this.musicStep % 2 === 0) {
        const bFreq = bassHz[Math.floor(this.musicStep / 2) % bassHz.length];
        const padOsc = this.audioCtx.createOscillator();
        const padGain = this.audioCtx.createGain();
        padOsc.type = 'triangle';
        padOsc.frequency.setValueAtTime(bFreq, now);

        padGain.gain.setValueAtTime(0.0001, now);
        padGain.gain.linearRampToValueAtTime(0.28, now + 0.6);
        padGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);

        padOsc.connect(padGain);
        padGain.connect(this.musicMasterGain);
        padOsc.start(now);
        padOsc.stop(now + 3.7);
      }

      this.musicStep += 1;
    };

    scheduleBeat();
    this.musicIntervalId = window.setInterval(scheduleBeat, 1450);
  }

  public stopBackgroundMusic(): void {
    if (this.musicIntervalId !== null) {
      window.clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    if (this.musicMasterGain && this.audioCtx) {
      try {
        this.musicMasterGain.gain.setTargetAtTime(
          0.0001,
          this.audioCtx.currentTime,
          0.08
        );
      } catch {
        // Ignore cleanup errors
      }
    }
    this.musicMasterGain = null;
    this.musicRunning = false;
  }

  private playGentleTone(
    freq: number,
    durationSec: number,
    delaySec = 0,
    gainPeak = 0.08,
    cutoffHz = 1400
  ): void {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoffHz, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec + 0.03);
  }

  public playClick(): void {
    this.ensureBackgroundMusic();
    this.playGentleTone(480, 0.08, 0, 0.045, 950);
  }

  public playCorrect(): void {
    this.ensureBackgroundMusic();
    this.playGentleTone(523.25, 0.24, 0, 0.075, 1600);
    this.playGentleTone(659.25, 0.26, 0.09, 0.075, 1700);
    this.playGentleTone(783.99, 0.34, 0.18, 0.08, 1800);
  }

  public playTryAgain(): void {
    this.ensureBackgroundMusic();
    this.playGentleTone(349.23, 0.18, 0, 0.05, 800);
    this.playGentleTone(329.63, 0.24, 0.12, 0.045, 750);
  }

  public playWaterDrop(): void {
    this.ensureBackgroundMusic();
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.11);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.065, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playBadgeFanfare(): void {
    this.ensureBackgroundMusic();
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
    notes.forEach((n, idx) => {
      this.playGentleTone(n, 0.48, idx * 0.11, 0.07, 1800);
    });
  }

  private base64ToBlobUrl(base64: string): string {
    const byteChars = atob(base64);
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      bytes[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  /**
   * Local recordings live in public/audio and are served by our own server.
   * A missing file must never break playback, so the result is cached and the
   * caller falls back to the online voice when the file is absent.
   */
  private async localAudioExists(path: string): Promise<boolean> {
    const known = this.localAudioCache.get(path);
    if (known !== undefined) return known;
    try {
      const res = await fetch(path, { method: 'HEAD' });
      const ok = res.ok;
      this.localAudioCache.set(path, ok);
      return ok;
    } catch {
      this.localAudioCache.set(path, false);
      return false;
    }
  }

  private fetchAudioUrl(
    text: string,
    speaker: SpeakerId
  ): Promise<string | null> {
    const clean = text.trim();
    if (!clean) return Promise.resolve(null);

    const key = this.makeKey(clean, speaker);
    const ready = this.readyBlobUrls.get(key);
    if (ready) {
      this.lastFetchErrorCode = null;
      return Promise.resolve(ready);
    }

    const existing = this.inFlightFetches.get(key);
    if (existing) return existing;

    const promise = (async () => {
      try {
        // Prefer the bundled recording: it plays without Gemini and without a key.
        const localPath = getLocalAudioPath(clean);
        if (localPath && (await this.localAudioExists(localPath))) {
          this.lastFetchErrorCode = null;
          this.readyBlobUrls.set(key, localPath);
          return localPath;
        }

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: clean, speaker }),
        });
        if (!response.ok) {
          if (response.status === 429) {
            this.lastFetchErrorCode = 'quota_exceeded';
            this.prefetchQueue = [];
            this.prefetchPausedUntil = Date.now() + 60_000;
          } else if (response.status === 503) {
            this.lastFetchErrorCode = 'missing_key';
            this.prefetchQueue = [];
            this.prefetchPausedUntil = Date.now() + 60_000;
          } else {
            this.lastFetchErrorCode = 'tts_failed';
          }
          return null;
        }
        const data = (await response.json()) as { audioBase64?: string };
        if (!data.audioBase64) {
          this.lastFetchErrorCode = 'empty_audio';
          return null;
        }
        this.lastFetchErrorCode = null;
        this.prefetchPausedUntil = 0;
        const url = this.base64ToBlobUrl(data.audioBase64);
        this.readyBlobUrls.set(key, url);
        return url;
      } catch {
        this.lastFetchErrorCode = 'network_error';
        return null;
      } finally {
        this.inFlightFetches.delete(key);
      }
    })();

    this.inFlightFetches.set(key, promise);
    return promise;
  }

  /**
   * Proactively pre-generates & caches audio segments for the current screen
   * so speaker buttons respond immediately upon click.
   */
  public prefetch(items: SpeechSegment[]): void {
    if (typeof window === 'undefined') return;
    if (Date.now() < this.prefetchPausedUntil) return;
    for (const item of items) {
      const clean = item.text.trim();
      if (!clean) continue;
      const key = this.makeKey(clean, item.speaker);
      if (this.readyBlobUrls.has(key) || this.inFlightFetches.has(key)) {
        continue;
      }
      if (!this.prefetchQueue.some((q) => q.key === key)) {
        this.prefetchQueue.push({ key, text: clean, speaker: item.speaker });
      }
    }
    this.drainPrefetchQueue();
  }

  private drainPrefetchQueue(): void {
    if (Date.now() < this.prefetchPausedUntil) return;
    while (
      this.activePrefetchWorkers < this.MAX_PREFETCH_WORKERS &&
      this.prefetchQueue.length > 0
    ) {
      const next = this.prefetchQueue.shift();
      if (!next) break;
      if (this.readyBlobUrls.has(next.key)) continue;

      this.activePrefetchWorkers += 1;
      this.fetchAudioUrl(next.text, next.speaker).finally(() => {
        this.activePrefetchWorkers = Math.max(
          0,
          this.activePrefetchWorkers - 1
        );
        this.drainPrefetchQueue();
      });
    }
  }

  public stopSpeech(): void {
    this.sequenceToken += 1;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.notifySpeaking(null, null);
  }

  public getActivePlayId(): string | null {
    return this.activePlayId;
  }

  public async speak(
    text: string,
    speaker: SpeakerId = 'noor',
    playId?: string
  ): Promise<void> {
    if (!this.soundEnabled || !text.trim()) return;
    await this.speakSequence([{ text, speaker }], playId);
  }

  public async speakSequence(
    segments: SpeechSegment[],
    playId?: string
  ): Promise<void> {
    const resolvedId = playId || null;
    if (!this.soundEnabled) {
      this.notifyError({
        playId: resolvedId,
        code: 'sound_muted',
        message: 'الصوت متوقف حاليًا، شغّل زر الصوت للاستماع.',
      });
      return;
    }
    const valid = segments.filter((s) => s.text.trim().length > 0);
    if (valid.length === 0) return;

    this.ensureBackgroundMusic();
    this.stopSpeech();
    this.notifyError(null);

    const myToken = ++this.sequenceToken;

    // Immediately kick off prefetching for subsequent segments in the sequence
    if (valid.length > 1) {
      this.prefetch(valid.slice(1));
    }

    for (let i = 0; i < valid.length; i++) {
      if (myToken !== this.sequenceToken || !this.soundEnabled) return;

      const seg = valid[i];
      this.notifySpeaking(seg.speaker, resolvedId);

      const url = await this.fetchAudioUrl(seg.text, seg.speaker);
      if (myToken !== this.sequenceToken || !this.soundEnabled) return;

      if (!url) {
        const code = this.lastFetchErrorCode || 'tts_failed';
        const message =
          code === 'quota_exceeded'
            ? 'تم بلوغ الحد اليومي المجاني لخدمة الصوت؛ استخدم مفتاح API مدفوع لزيادة الحصة.'
            : code === 'missing_key'
            ? 'مفتاح خدمة الصوت غير مفعّل حاليًا.'
            : 'تعذر تشغيل الصوت حاليًا، حاول مرة أخرى.';
        this.notifyError({ playId: resolvedId, code, message });
        continue;
      }

      await this.playBlobUrl(url, myToken);
    }

    if (myToken === this.sequenceToken) {
      this.notifySpeaking(null, null);
    }
  }

  private playBlobUrl(url: string, token: number): Promise<void> {
    return new Promise((resolve) => {
      if (token !== this.sequenceToken || !this.soundEnabled) {
        resolve();
        return;
      }

      const audio = new Audio(url);
      audio.volume = 0.96;
      this.currentAudio = audio;

      const cleanup = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        resolve();
      };

      audio.onended = cleanup;
      audio.onerror = cleanup;
      audio.play().catch(cleanup);
    });
  }
}

export const audioEngine = new AudioEngine();
