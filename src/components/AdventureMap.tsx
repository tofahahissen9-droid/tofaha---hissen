import React, { useEffect, useMemo } from 'react';
import {
  Lock,
  CheckCircle2,
  Star,
  Award,
  Volume2,
  VolumeX,
  Home,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { LEVELS } from '../data/gameContent';
import { GAME_IMAGES, STATION_IMAGES } from '../data/assets';
import { PlayerProgress } from '../types/game';
import { CharacterAvatar } from './CharacterAvatar';
import { SpeakerButton } from './SpeakerButton';
import { audioEngine, SpeechSegment } from '../utils/audioEngine';

interface AdventureMapProps {
  progress: PlayerProgress;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSelectLevel: (levelId: number) => void;
  onOpenVictory: () => void;
  onBackHome: () => void;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({
  progress,
  soundEnabled,
  onToggleSound,
  onSelectLevel,
  onOpenVictory,
  onBackHome,
}) => {
  const allCompleted = progress.completedLevels.length === LEVELS.length;

  const mapFullSegments: SpeechSegment[] = useMemo(() => {
    const currentTitle = LEVELS[progress.unlockedLevel - 1]?.title || '';
    const guidance = allCompleted
      ? 'ما شاء الله! لقد أتممتم المحطات السبع كلها! صندوق الكنز بانتظاركم!'
      : `المحطة الحالية: ${currentTitle}.`;

    const stationList = LEVELS.map((lvl) => {
      const done = progress.completedLevels.includes(lvl.id);
      const open = lvl.id <= progress.unlockedLevel;
      const state = done ? 'مكتملة' : open ? 'مفتوحة' : 'مغلقة';
      const cta = open ? (done ? 'مراجعة' : 'ادخل') : '';
      return `${lvl.id}. ${state}. ${lvl.title}. ${lvl.subtitle}. شارة: ${lvl.badge.title}${cta ? `. ${cta}` : ''}`;
    }).join('. ');

    const chestText = allCompleted
      ? 'صندوق الكنز المفقود. اضغط هنا لفتح الكنز واستلام شهادة أبطال الصلاة! افتح الكنز الآن!'
      : 'مغلق. صندوق الكنز المفقود. يُفتح بعد اجتياز المحطات السبع كاملة. بانتظار إكمال الرحلة.';

    const badgesText = `الشارات السبع: ${LEVELS.map((l) => l.badge.title).join('، ')}.`;

    return [
      {
        speaker: 'noor',
        text: `خريطة المغامرة. ${progress.stars} نجمة. ${progress.points} نقطة. ${progress.earnedBadges.length} من 7 شارات. ${guidance} التقدم الكلي: ${progress.completedLevels.length} من ٧ محطات مكتملة. ${stationList}. ${chestText} ${badgesText}`,
      },
    ];
  }, [allCompleted, progress]);

  useEffect(() => {
    audioEngine.prefetch(mapFullSegments);
  }, [mapFullSegments]);

  useEffect(() => {
    return () => {
      audioEngine.stopSpeech();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-[#FAF8F2] to-emerald-50 flex flex-col">
      {/* Top HUD */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 md:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                audioEngine.playClick();
                onBackHome();
              }}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
              aria-label="الشاشة الرئيسية"
            >
              <Home className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 whitespace-nowrap">
              خريطة المغامرة
            </h1>
          </div>

          <div className="flex items-center gap-2.5 md:gap-4">
            <div className="flex items-center gap-3 text-sm font-extrabold tabular-nums">
              <span className="flex items-center gap-1 text-amber-600">
                <Star className="w-4 h-4 fill-amber-400" />
                {progress.stars}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700">{progress.points} نقطة</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="hidden sm:inline text-violet-700">
                {progress.earnedBadges.length} / 7 شارات
              </span>
            </div>

            <SpeakerButton
              segments={mapFullSegments}
              playId="adventure_map_full"
              label="اسمع الخريطة"
              variant="emerald"
            />

            <button
              type="button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'إيقاف الصوت' : 'تشغيل الصوت'}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Progress & Companion Guidance Bar */}
        <div className="rounded-3xl bg-white border border-slate-200 p-4 md:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex -space-x-3 space-x-reverse">
              <CharacterAvatar character="adam" size="sm" />
              <CharacterAvatar character="noor" size="sm" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm md:text-base">
                {allCompleted
                  ? 'ما شاء الله! لقد أتممتم المحطات السبع كلها! صندوق الكنز بانتظاركم!'
                  : `المحطة الحالية: ${LEVELS[progress.unlockedLevel - 1]?.title}`}
              </p>
              <p className="text-xs text-slate-600 font-semibold">
                التقدم الكلي: {progress.completedLevels.length} من ٧ محطات مكتملة
              </p>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-1.5">
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-l from-emerald-500 to-amber-400 transition-all duration-500"
                style={{
                  width: `${(progress.completedLevels.length / LEVELS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Illustrated 7-Station Adventure Map */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LEVELS.map((lvl) => {
            const isCompleted = progress.completedLevels.includes(lvl.id);
            const isUnlocked = lvl.id <= progress.unlockedLevel;
            const isCurrent = lvl.id === progress.unlockedLevel && !isCompleted;
            const stationImage = STATION_IMAGES[lvl.id];

            return (
              <div
                key={lvl.id}
                role="button"
                tabIndex={isUnlocked ? 0 : -1}
                aria-disabled={!isUnlocked}
                onClick={() => {
                  if (!isUnlocked) return;
                  audioEngine.playClick();
                  onSelectLevel(lvl.id);
                }}
                onKeyDown={(e) => {
                  if (!isUnlocked) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    audioEngine.playClick();
                    onSelectLevel(lvl.id);
                  }
                }}
                className={`group relative text-right rounded-3xl border-2 overflow-hidden transition-all flex flex-col bg-white ${
                  isCompleted
                    ? 'border-emerald-500 shadow-md hover:-translate-y-1 cursor-pointer'
                    : isCurrent
                    ? 'border-amber-500 shadow-lg ring-4 ring-amber-200/80 hover:-translate-y-1 cursor-pointer'
                    : isUnlocked
                    ? 'border-sky-400 shadow-sm hover:-translate-y-1 cursor-pointer'
                    : 'border-slate-200 opacity-85 cursor-not-allowed'
                }`}
              >
                {/* Illustrated 3D Scene Banner */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-200">
                  <img
                    src={stationImage}
                    alt={lvl.title}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      isUnlocked ? 'group-hover:scale-105' : 'grayscale-[55%] brightness-75'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent" />

                  {/* Station Number Badge */}
                  <span
                    className={`absolute top-3 right-3 w-10 h-10 rounded-2xl font-extrabold text-lg flex items-center justify-center shadow-md tabular-nums ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isUnlocked
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-700/90 text-slate-200'
                    }`}
                  >
                    {lvl.id}
                  </span>

                  {/* Status Corner Indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-600/95 text-white px-2.5 py-1 text-xs font-extrabold shadow">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>مكتملة</span>
                      </span>
                    ) : !isUnlocked ? (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-slate-900/85 text-slate-100 px-2.5 py-1 text-xs font-bold shadow">
                        <Lock className="w-3.5 h-3.5" />
                        <span>مغلقة</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-amber-500/95 text-white px-2.5 py-1 text-xs font-extrabold shadow">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>مفتوحة</span>
                      </span>
                    )}
                  </div>

                  {/* Title Overlaid cleanly on Scrim */}
                  <div className="absolute bottom-3 right-3 left-3 text-white">
                    <h2 className="text-lg font-extrabold leading-snug drop-shadow">
                      {lvl.title}
                    </h2>
                  </div>
                </div>

                {/* Station Info Footer */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    {lvl.subtitle}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold">
                    <span className="inline-flex items-center gap-1 text-slate-700">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>شارة: {lvl.badge.title}</span>
                    </span>
                    {isUnlocked && (
                      <span className="text-emerald-700">
                        {isCompleted ? 'مراجعة' : 'ادخل ←'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* 8th Card: Illustrated Lost Treasure Chest Finale */}
          <div
            role="button"
            tabIndex={allCompleted ? 0 : -1}
            aria-disabled={!allCompleted}
            onClick={() => {
              if (!allCompleted) return;
              audioEngine.playBadgeFanfare();
              onOpenVictory();
            }}
            onKeyDown={(e) => {
              if (!allCompleted) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                audioEngine.playBadgeFanfare();
                onOpenVictory();
              }
            }}
            className={`group relative text-right rounded-3xl border-2 overflow-hidden transition-all flex flex-col ${
              allCompleted
                ? 'border-amber-500 bg-gradient-to-b from-amber-50 to-amber-100 shadow-xl hover:-translate-y-1 cursor-pointer'
                : 'border-dashed border-slate-300 bg-slate-100 opacity-85 cursor-not-allowed'
            }`}
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-900">
              <img
                src={
                  allCompleted
                    ? GAME_IMAGES.treasureOpen
                    : GAME_IMAGES.heroMosqueStart
                }
                alt="صندوق الكنز المفقود"
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  allCompleted ? 'group-hover:scale-105' : 'grayscale-[45%] brightness-75'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

              <span
                className={`absolute top-3 right-3 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                  allCompleted
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800/90 text-slate-200'
                }`}
              >
                <Trophy className="w-5 h-5" />
              </span>

              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                {!allCompleted && (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-slate-900/85 text-slate-100 px-2.5 py-1 text-xs font-bold shadow">
                    <Lock className="w-3.5 h-3.5" />
                    <span>مغلق</span>
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 right-3 left-3 text-white">
                <h2 className="text-lg font-extrabold leading-snug drop-shadow">
                  صندوق الكنز المفقود
                </h2>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                {allCompleted
                  ? 'اضغط هنا لفتح الكنز واستلام شهادة أبطال الصلاة!'
                  : 'يُفتح بعد اجتياز المحطات السبع كاملة.'}
              </p>

              <div className="pt-2 border-t border-amber-200/70 text-xs font-extrabold text-amber-800">
                {allCompleted ? 'افتح الكنز الآن! ✨' : 'بانتظار إكمال الرحلة'}
              </div>
            </div>
          </div>
        </div>

        {/* Collected Badges Gallery */}
        <section className="rounded-3xl bg-white border border-slate-200 p-5 md:p-6 space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900">
            الشارات السبع
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {LEVELS.map((lvl) => {
              const earned = progress.earnedBadges.includes(lvl.badge.id);
              return (
                <div
                  key={lvl.badge.id}
                  className={`rounded-2xl border p-3 text-center space-y-2 transition-all ${
                    earned
                      ? 'border-amber-300 bg-amber-50/70'
                      : 'border-slate-200 bg-slate-50 opacity-50'
                  }`}
                >
                  <div
                    className={`w-11 h-11 mx-auto rounded-xl flex items-center justify-center text-white ${
                      earned
                        ? `bg-gradient-to-br ${lvl.badge.colorClass}`
                        : 'bg-slate-300'
                    }`}
                  >
                    <Award className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-900">
                    {lvl.badge.title}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
