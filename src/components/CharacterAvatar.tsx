import React from 'react';
import { GAME_IMAGES } from '../data/assets';

interface CharacterAvatarProps {
  character: 'adam' | 'noor';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSpeaking?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32 md:w-36 md:h-36',
};

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  size = 'md',
  isSpeaking = false,
  className = '',
}) => {
  const isAdam = character === 'adam';
  const src = isAdam ? GAME_IMAGES.adamPortrait : GAME_IMAGES.noorPortrait;
  const label = isAdam ? 'آدم' : 'نور';
  const borderClass = isAdam ? 'border-emerald-500' : 'border-sky-500';
  const fallbackBg = isAdam
    ? 'bg-gradient-to-br from-emerald-100 to-amber-50 text-emerald-800'
    : 'bg-gradient-to-br from-sky-100 to-violet-50 text-sky-900';

  return (
    <div
      className={`relative shrink-0 rounded-full border-4 ${borderClass} ${SIZE_CLASSES[size]} ${fallbackBg} overflow-hidden shadow-md transition-transform duration-200 ${
        isSpeaking ? 'scale-105 ring-4 ring-amber-400/70' : ''
      } ${className}`}
    >
      <img
        src={src}
        alt={label}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

interface DialogueBannerProps {
  speaker: 'adam' | 'noor';
  text: string;
  isSpeaking?: boolean;
  compact?: boolean;
}

export const DialogueBanner: React.FC<DialogueBannerProps> = ({
  speaker,
  text,
  isSpeaking = false,
  compact = false,
}) => {
  const isAdam = speaker === 'adam';
  const name = isAdam ? 'آدم' : 'نور';

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border ${
        isAdam
          ? 'bg-emerald-50/90 border-emerald-200'
          : 'bg-sky-50/90 border-sky-200'
      } ${compact ? 'p-3' : 'p-4 md:p-5'} shadow-sm`}
    >
      <CharacterAvatar
        character={speaker}
        size={compact ? 'sm' : 'md'}
        isSpeaking={isSpeaking}
      />
      <div className="flex-1 min-w-0">
        <span
          className={`block text-sm font-extrabold mb-1 ${
            isAdam ? 'text-emerald-800' : 'text-sky-800'
          }`}
        >
          {name}
        </span>
        <p className="text-base md:text-lg font-semibold text-slate-800 leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
};
