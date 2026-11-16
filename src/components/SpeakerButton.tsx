import React, { useEffect, useState } from 'react';
import { Volume2, Square, RotateCcw } from 'lucide-react';
import { audioEngine, SpeechSegment } from '../utils/audioEngine';

interface SpeakerButtonProps {
  segments: SpeechSegment[];
  playId: string;
  label?: string;
  compact?: boolean;
  variant?: 'emerald' | 'sky' | 'amber' | 'slate';
  className?: string;
}

const VARIANT_CLASSES: Record<
  NonNullable<SpeakerButtonProps['variant']>,
  string
> = {
  emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  sky: 'bg-sky-600 hover:bg-sky-700 text-white',
  amber: 'bg-amber-500 hover:bg-amber-600 text-white',
  slate: 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300',
};

export const SpeakerButton: React.FC<SpeakerButtonProps> = ({
  segments,
  playId,
  label,
  compact = false,
  variant = 'emerald',
  className = '',
}) => {
  const [isActive, setIsActive] = useState(
    () => audioEngine.getActivePlayId() === playId
  );
  const [hasPlayed, setHasPlayed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsActive(audioEngine.getActivePlayId() === playId);
    setErrorMsg(null);
    const unsubSpeaking = audioEngine.subscribeSpeaking((_speaker, activeId) => {
      const active = activeId === playId;
      setIsActive(active);
      if (active) {
        setHasPlayed(true);
        setErrorMsg(null);
      }
    });
    const unsubError = audioEngine.subscribeError((err) => {
      if (!err) {
        setErrorMsg(null);
      } else if (err.playId === playId) {
        setErrorMsg(err.message);
      }
    });
    return () => {
      unsubSpeaking();
      unsubError();
    };
  }, [playId]);

  const handlePrimaryClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    audioEngine.playClick();
    if (isActive) {
      audioEngine.stopSpeech();
    } else {
      setErrorMsg(null);
      setHasPlayed(true);
      audioEngine.speakSequence(segments, playId);
    }
  };

  const handleReplayClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    audioEngine.playClick();
    setErrorMsg(null);
    setHasPlayed(true);
    audioEngine.speakSequence(segments, playId);
  };

  const idleLabel = hasPlayed ? 'إعادة الاستماع' : label || 'اسمع الشاشة';

  return (
    <div className={`inline-flex flex-col items-end gap-1 shrink-0 ${className}`}>
      <div className="inline-flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handlePrimaryClick}
          aria-label={isActive ? 'إيقاف الصوت' : idleLabel}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition-transform active:scale-95 cursor-pointer ${
            compact
              ? 'w-10 h-10 p-0'
              : 'min-h-[42px] px-4 py-2 text-xs md:text-sm'
          } ${
            isActive
              ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-300 ring-offset-1'
              : VARIANT_CLASSES[variant]
          }`}
        >
          {isActive ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              {!compact && <span>إيقاف</span>}
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              {!compact && <span>{idleLabel}</span>}
            </>
          )}
        </button>

        {isActive && (
          <button
            type="button"
            onClick={handleReplayClick}
            aria-label="إعادة التشغيل من البداية"
            className="inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs md:text-sm whitespace-nowrap shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-emerald-700" />
            {!compact && <span>إعادة</span>}
          </button>
        )}
      </div>

      {errorMsg && (
        <span
          role="status"
          className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2 py-0.5 max-w-[260px] text-right leading-snug"
        >
          {errorMsg}
        </span>
      )}
    </div>
  );
};

