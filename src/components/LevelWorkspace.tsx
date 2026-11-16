import React, { useState, useEffect, useMemo } from 'react';
import {
  Map,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Star,
  BookOpen,
  Gamepad2,
  ClipboardCheck,
} from 'lucide-react';
import { LevelDefinition, SpeakerId } from '../types/game';
import { STATION_IMAGES } from '../data/assets';
import { DialogueBanner } from './CharacterAvatar';
import { SpeakerButton } from './SpeakerButton';
import { LessonStage } from './LessonStage';
import { ActivityArena } from './activities/ActivityArena';
import { QuizArena } from './quiz/QuizArena';
import { audioEngine } from '../utils/audioEngine';
import { buildLevelIntroSegments } from '../utils/narrationBuilders';

interface LevelWorkspaceProps {
  level: LevelDefinition;
  soundEnabled: boolean;
  points: number;
  stars: number;
  onToggleSound: () => void;
  onBackToMap: () => void;
  onAwardActivity: () => void;
  onPassLevel: (quizScore: number) => void;
}

type StagePhase = 'INTRO' | 'LESSONS' | 'ACTIVITIES' | 'QUIZ';

export const LevelWorkspace: React.FC<LevelWorkspaceProps> = ({
  level,
  soundEnabled,
  points,
  stars,
  onToggleSound,
  onBackToMap,
  onAwardActivity,
  onPassLevel,
}) => {
  const [phase, setPhase] = useState<StagePhase>('INTRO');
  const [lessonIdx, setLessonIdx] = useState(0);
  const [activityIdx, setActivityIdx] = useState(0);
  const [activityResetKey, setActivityResetKey] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [speakingWho, setSpeakingWho] = useState<SpeakerId | null>(null);

  useEffect(() => {
    const unsub = audioEngine.subscribeSpeaking(setSpeakingWho);
    return () => {
      unsub();
      audioEngine.stopSpeech();
    };
  }, []);

  useEffect(() => {
    // Reset local level stage when switching levels
    setPhase('INTRO');
    setLessonIdx(0);
    setActivityIdx(0);
    setCompletedActivities([]);
    setActivityResetKey(0);
  }, [level.id]);

  useEffect(() => {
    audioEngine.stopSpeech();
  }, [phase, lessonIdx, activityIdx, activityResetKey]);

  const currentLesson = level.lessons[lessonIdx];
  const currentActivity = level.activities[activityIdx];

  const introSegments = useMemo(() => buildLevelIntroSegments(level), [level]);

  // Proactively prefetch the active intro slide narration when on INTRO phase
  useEffect(() => {
    if (phase === 'INTRO') {
      audioEngine.prefetch(introSegments);
    }
  }, [introSegments, phase]);

  const handleActivitySuccess = (actId: string) => {
    if (!completedActivities.includes(actId)) {
      setCompletedActivities((prev) => [...prev, actId]);
      onAwardActivity();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] bg-islamic-pattern flex flex-col">
      {/* Clean 3-zone level navigation bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 md:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                audioEngine.stopSpeech();
                audioEngine.playClick();
                onBackToMap();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Map className="w-4 h-4 text-emerald-700" />
              <span>خريطة المغامرة</span>
            </button>
            <h2 className="text-base md:text-lg font-extrabold text-slate-900 truncate">
              المحطة {level.id}: {level.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-3 text-sm font-extrabold text-slate-700 tabular-nums">
              <span className="flex items-center gap-1 text-amber-600">
                <Star className="w-4 h-4 fill-amber-400" />
                {stars}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700">{points} نقطة</span>
            </div>

            <button
              type="button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'إيقاف الصوت' : 'تشغيل الصوت'}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 cursor-pointer"
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

      {/* Phase Navigation Tabs */}
      <div className="max-w-5xl w-full mx-auto px-4 pt-5">
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => {
              audioEngine.playClick();
              setPhase('LESSONS');
            }}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              phase === 'LESSONS' || phase === 'INTRO'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>الشرح ({lessonIdx + 1}/{level.lessons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioEngine.playClick();
              setPhase('ACTIVITIES');
            }}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              phase === 'ACTIVITIES'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>الأنشطة ({activityIdx + 1}/{level.activities.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioEngine.playClick();
              setPhase('QUIZ');
            }}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              phase === 'QUIZ'
                ? 'bg-amber-500 text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>الاختبار (٥ أسئلة)</span>
          </button>
        </div>
      </div>

      {/* Main Content Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        {phase === 'INTRO' && (
          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="relative h-52 sm:h-64 w-full bg-slate-900">
              <img
                src={STATION_IMAGES[level.id]}
                alt={level.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent flex items-end justify-between gap-3 p-6">
                <div className="text-white space-y-1">
                  <p className="text-sm font-extrabold text-amber-300">
                    المحطة {level.id} من ٧
                  </p>
                  <h1 className="text-2xl md:text-3xl font-extrabold">
                    {level.title}
                  </h1>
                  <p className="text-slate-200 font-semibold text-sm md:text-base">
                    {level.subtitle}
                  </p>
                </div>
                <SpeakerButton
                  segments={introSegments}
                  playId={`level_${level.id}_intro_full`}
                  label="اسمع المحطة كاملة"
                  variant="amber"
                />
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-5">

            <div className="space-y-3">
              {level.introDialogue.map((line, i) => (
                <DialogueBanner
                  key={i}
                  speaker={line.speaker}
                  text={line.text}
                  isSpeaking={speakingWho === line.speaker}
                />
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick();
                  setPhase('LESSONS');
                }}
                className="btn-3d inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg shadow-[0_4px_0_#047857] cursor-pointer"
              >
                <span>هيا نبدأ الدرس الأول!</span>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            </div>
          </div>
        )}

        {phase === 'LESSONS' && currentLesson && (
          <div className="space-y-5">
            <LessonStage lesson={currentLesson} speakingWho={speakingWho} />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={lessonIdx === 0}
                onClick={() => {
                  audioEngine.playClick();
                  setLessonIdx((p) => Math.max(0, p - 1));
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 font-bold text-slate-700 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>الدرس السابق</span>
              </button>

              {lessonIdx + 1 < level.lessons.length ? (
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playClick();
                    setLessonIdx((p) => p + 1);
                  }}
                  className="btn-3d inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-[0_4px_0_#047857] cursor-pointer"
                >
                  <span>الدرس التالي</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playClick();
                    setPhase('ACTIVITIES');
                  }}
                  className="btn-3d inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold shadow-[0_4px_0_#0369A1] cursor-pointer"
                >
                  <span>انتقل للأنشطة التفاعلية</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'ACTIVITIES' && currentActivity && (
          <div className="space-y-5">
            <div className="rounded-3xl bg-white border border-slate-200 p-5 md:p-7 shadow-sm space-y-5">
              <ActivityArena
                key={`${currentActivity.id}_${activityResetKey}`}
                activity={currentActivity}
                onSuccess={() => handleActivitySuccess(currentActivity.id)}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activityIdx === 0}
                  onClick={() => {
                    audioEngine.playClick();
                    setActivityIdx((p) => Math.max(0, p - 1));
                  }}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 font-bold text-slate-700 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>النشاط السابق</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playClick();
                    setActivityResetKey((k) => k + 1);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة النشاط</span>
                </button>
              </div>

              {activityIdx + 1 < level.activities.length ? (
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playClick();
                    setActivityIdx((p) => p + 1);
                  }}
                  className="btn-3d inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold shadow-[0_4px_0_#0369A1] cursor-pointer"
                >
                  <span>النشاط التالي</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playClick();
                    setPhase('QUIZ');
                  }}
                  className="btn-3d inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-[0_4px_0_#B45309] cursor-pointer"
                >
                  <span>ابدأ اختبار المحطة (٥ أسئلة)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'QUIZ' && (
          <QuizArena
            questions={level.quiz}
            badge={level.badge}
            onPassLevel={onPassLevel}
            onBackToMap={onBackToMap}
          />
        )}
      </main>
    </div>
  );
};
