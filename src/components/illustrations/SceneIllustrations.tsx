import React from 'react';
import { TimeVisualId } from '../../types/game';

export const TimeOfDayVisual: React.FC<{
  timeId: TimeVisualId;
  className?: string;
}> = ({ timeId, className = 'w-full h-32' }) => {
  const configs: Record<
    TimeVisualId,
    { sky: string; sunOrMoon: React.ReactNode; label: string }
  > = {
    fajr: {
      sky: 'from-indigo-900 via-sky-700 to-amber-300',
      label: 'بداية الفجر',
      sunOrMoon: (
        <>
          <circle cx="70" cy="86" r="18" fill="#FDE68A" opacity="0.9" />
          <path d="M25 22 A10 10 0 1 0 36 33 A8 8 0 1 1 25 22 Z" fill="#FEF3C7" />
        </>
      ),
    },
    dhuhr: {
      sky: 'from-sky-400 via-sky-300 to-cyan-100',
      label: 'الظهيرة',
      sunOrMoon: (
        <g>
          <circle cx="70" cy="26" r="18" fill="#FACC15" />
          <circle cx="70" cy="26" r="24" fill="#FDE047" opacity="0.35" />
        </g>
      ),
    },
    asr: {
      sky: 'from-amber-400 via-orange-300 to-sky-300',
      label: 'العصر',
      sunOrMoon: (
        <g>
          <circle cx="105" cy="44" r="16" fill="#F59E0B" />
          <circle cx="105" cy="44" r="22" fill="#FBBF24" opacity="0.3" />
        </g>
      ),
    },
    maghrib: {
      sky: 'from-violet-900 via-rose-500 to-amber-400',
      label: 'وقت الغروب',
      sunOrMoon: (
        <g>
          <path d="M52 88 A18 18 0 0 1 88 88 Z" fill="#FB923C" />
        </g>
      ),
    },
    isha: {
      sky: 'from-slate-950 via-indigo-950 to-violet-900',
      label: 'الليل',
      sunOrMoon: (
        <g>
          <path d="M98 20 A14 14 0 1 0 112 36 A11 11 0 1 1 98 20 Z" fill="#FDE68A" />
          <circle cx="34" cy="26" r="2" fill="#FFFFFF" />
          <circle cx="58" cy="18" r="2.5" fill="#FEF08A" />
          <circle cx="118" cy="46" r="1.8" fill="#FFFFFF" />
        </g>
      ),
    },
  };

  const cfg = configs[timeId];

  return (
    <div
      className={`relative rounded-xl bg-gradient-to-b ${cfg.sky} overflow-hidden border border-white/30 shadow-inner ${className}`}
    >
      <svg viewBox="0 0 140 100" className="w-full h-full" aria-hidden="true">
        {cfg.sunOrMoon}
        {/* Mosque silhouette at horizon */}
        <path
          d="M0 90 L30 90 L30 72 Q42 60 54 72 L54 90 L85 90 L85 68 Q100 50 115 68 L115 90 L140 90 L140 100 L0 100 Z"
          fill="#0F172A"
          fillOpacity="0.45"
        />
        <rect x="19" y="54" width="6" height="36" fill="#0F172A" fillOpacity="0.45" />
      </svg>
    </div>
  );
};

export const ActivityThumbnail: React.FC<{
  visualKey: string;
  className?: string;
}> = ({ visualKey, className = 'w-full h-28' }) => {
  if (
    visualKey === 'fajr' ||
    visualKey === 'dhuhr' ||
    visualKey === 'asr' ||
    visualKey === 'maghrib' ||
    visualKey === 'isha'
  ) {
    return <TimeOfDayVisual timeId={visualKey} className={className} />;
  }

  const icons: Record<string, { bg: string; svg: React.ReactNode }> = {
    prayer_rug: {
      bg: 'from-emerald-100 to-teal-50 border-emerald-200',
      svg: (
        <svg viewBox="0 0 120 90" className="w-24 h-20">
          <rect x="25" y="10" width="70" height="70" rx="8" fill="#059669" />
          <rect x="33" y="18" width="54" height="54" rx="4" fill="none" stroke="#FDE68A" strokeWidth="2" />
          <path d="M44 58 L44 36 Q60 22 76 36 L76 58 Z" fill="#10B981" stroke="#FDE68A" strokeWidth="1.5" />
        </svg>
      ),
    },
    soccer: {
      bg: 'from-sky-100 to-amber-50 border-sky-200',
      svg: (
        <svg viewBox="0 0 120 90" className="w-24 h-20">
          <circle cx="60" cy="45" r="26" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
          <polygon points="60,32 71,40 67,53 53,53 49,40" fill="#1E293B" />
        </svg>
      ),
    },
    meal: {
      bg: 'from-amber-100 to-orange-50 border-amber-200',
      svg: (
        <svg viewBox="0 0 120 90" className="w-24 h-20">
          <circle cx="60" cy="46" r="25" fill="#FFFFFF" stroke="#D97706" strokeWidth="3" />
          <circle cx="60" cy="46" r="14" fill="#FDE68A" />
        </svg>
      ),
    },
    sleep: {
      bg: 'from-indigo-100 to-violet-50 border-indigo-200',
      svg: (
        <svg viewBox="0 0 120 90" className="w-24 h-20">
          <rect x="20" y="42" width="80" height="22" rx="6" fill="#6366F1" />
          <rect x="24" y="34" width="22" height="12" rx="5" fill="#FFFFFF" />
          <path d="M84 18 A10 10 0 1 0 94 28 A8 8 0 1 1 84 18 Z" fill="#F59E0B" />
        </svg>
      ),
    },
  };

  const entry = icons[visualKey] || icons.prayer_rug;

  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br border ${entry.bg} ${className}`}
    >
      {entry.svg}
    </div>
  );
};
