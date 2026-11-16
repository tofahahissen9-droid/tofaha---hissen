import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  HelpCircle,
  Volume2,
  VolumeX,
  Lock,
  Sparkles,
  X,
  Award,
  Star,
} from 'lucide-react';
import { GAME_IMAGES } from '../data/assets';
import { CharacterAvatar } from './CharacterAvatar';
import { SpeakerButton } from './SpeakerButton';
import { audioEngine, SpeechSegment } from '../utils/audioEngine';

interface StartScreenProps {
  soundEnabled: boolean;
  hasSavedProgress: boolean;
  onToggleSound: () => void;
  onStartJourney: () => void;
  onContinueMap: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  soundEnabled,
  hasSavedProgress,
  onToggleSound,
  onStartJourney,
  onContinueMap,
}) => {
  const [showInstructions, setShowInstructions] = useState(false);

  const fullScreenSegments: SpeechSegment[] = useMemo(
    () => [
      {
        speaker: 'noor',
        text: `رحلة أبطال الصلاة. مغامرة تعليمية تفاعلية للأطفال. رحلة أبطال الصلاة والكنز المفقود. انطلق مع آدم ونور عبر سبع محطات مشوقة لاكتشاف أسرار الوضوء والصلاة خطوة بخطوة حتى نفتح صندوق الكنز الذهبي! آدم، رفيق المغامرة. نور، مرشدة الرحلة. ابدأ الرحلة.${
          hasSavedProgress ? ' متابعة المغامرة.' : ''
        } التعليمات. ${
          soundEnabled ? 'الصوت يعمل.' : 'الصوت متوقف.'
        } صندوق الكنز المفقود مغلق. اجتز المحطات السبع واجمع الشارات السبع لفتحه!`,
      },
    ],
    [hasSavedProgress, soundEnabled]
  );

  const instructionsSegments: SpeechSegment[] = useMemo(
    () => [
      {
        speaker: 'noor',
        text: 'كيف نلعب رحلة أبطال الصلاة؟ تتكون الرحلة من ٧ محطات تعليمية مرتبة، تبدأ ببوابة عالم الصلاة ثم واحة الوضوء ثم الصلوات الخمس. في كل محطة ستتعلم مع آدم ونور، وتلعب أنشطة تفاعلية متنوعة، وتحل اختبارًا من ٥ أسئلة. عند اجتياز الاختبار تحصل على شارة المحطة وتُفتح لك المحطة التالية تلقائيًا! ملاحظة: يتم حفظ نقاطك وتقدمك محليًا على هذا الجهاز والمتصفح فقط. فهمت! هيا بنا.',
      },
    ],
    []
  );

  useEffect(() => {
    audioEngine.prefetch(fullScreenSegments);
  }, [fullScreenSegments]);

  useEffect(() => {
    if (showInstructions) {
      audioEngine.prefetch(instructionsSegments);
    }
  }, [showInstructions, instructionsSegments]);

  useEffect(() => {
    return () => {
      audioEngine.stopSpeech();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F2] bg-islamic-pattern flex flex-col">
      {/* Top utility bar */}
      <header className="w-full max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-base md:text-lg whitespace-nowrap">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>رحلة أبطال الصلاة</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {!showInstructions && (
            <SpeakerButton
              segments={fullScreenSegments}
              playId="start_screen_full"
              label="اسمع الشاشة"
              variant="emerald"
            />
          )}

          <button
            type="button"
            onClick={() => {
              audioEngine.stopSpeech();
              audioEngine.playClick();
              setShowInstructions(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs whitespace-nowrap cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span>التعليمات</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleSound();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs whitespace-nowrap cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>الصوت يعمل</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>الصوت متوقف</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Hero Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-4 md:py-8 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text & Primary Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm md:text-base font-extrabold text-emerald-700">
                  مغامرة تعليمية تفاعلية للأطفال
                </p>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight [text-wrap:balance]">
                رحلة أبطال الصلاة والكنز المفقود
              </h1>
              <p className="text-base md:text-lg text-slate-600 font-semibold leading-relaxed max-w-xl">
                انطلق مع آدم ونور عبر سبع محطات مشوقة لاكتشاف أسرار الوضوء والصلاة خطوة بخطوة حتى نفتح صندوق الكنز الذهبي!
              </p>
            </div>

            {/* Adam & Noor companion strip */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 bg-white rounded-2xl border border-emerald-200 px-3.5 py-2 shadow-xs">
                <CharacterAvatar character="adam" size="sm" />
                <div>
                  <p className="font-extrabold text-emerald-900 text-sm">آدم</p>
                  <p className="text-xs text-slate-500 font-semibold">رفيق المغامرة</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-white rounded-2xl border border-sky-200 px-3.5 py-2 shadow-xs">
                <CharacterAvatar character="noor" size="sm" />
                <div>
                  <p className="font-extrabold text-sky-900 text-sm">نور</p>
                  <p className="text-xs text-slate-500 font-semibold">مرشدة الرحلة</p>
                </div>
              </div>
            </div>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick();
                  onStartJourney();
                }}
                className="btn-3d inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xl shadow-[0_5px_0_#047857] cursor-pointer"
              >
                <Play className="w-6 h-6 fill-white" />
                <span>ابدأ الرحلة</span>
              </button>

              {hasSavedProgress && (
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playClick();
                    onContinueMap();
                  }}
                  className="btn-3d inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg shadow-[0_5px_0_#B45309] cursor-pointer"
                >
                  <span>متابعة المغامرة</span>
                </button>
              )}
            </div>
          </div>

          {/* 3D Mosque & Closed Treasure Chest Scene */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border-4 border-amber-300 shadow-2xl bg-slate-900">
              <img
                src={GAME_IMAGES.heroMosqueStart}
                alt="مسجد جميل وصندوق الكنز الذهبي المغلق مع آدم ونور"
                referrerPolicy="no-referrer"
                className="w-full h-[320px] sm:h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

              {/* Closed Treasure Status Strip */}
              <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between gap-3 bg-white/95 backdrop-blur rounded-2xl p-3.5 border border-amber-200 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm md:text-base">
                      صندوق الكنز المفقود مغلق
                    </p>
                    <p className="text-xs text-slate-600 font-semibold">
                      اجتز المحطات السبع واجمع الشارات السبع لفتحه!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Instructions Modal */}
      {showInstructions && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="instructions-title"
        >
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 md:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between gap-2">
              <h2
                id="instructions-title"
                className="text-xl md:text-2xl font-extrabold text-slate-900"
              >
                كيف نلعب رحلة أبطال الصلاة؟
              </h2>
              <div className="flex items-center gap-2">
                <SpeakerButton
                  segments={instructionsSegments}
                  playId="start_instructions_modal"
                  label="اسمع التعليمات"
                  variant="sky"
                />
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.stopSpeech();
                    setShowInstructions(false);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5 text-slate-700" />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-slate-700 font-semibold text-sm md:text-base leading-relaxed">
              <p className="flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  تتكون الرحلة من <strong>٧ محطات تعليمية</strong> مرتبة، تبدأ ببوابة عالم الصلاة ثم واحة الوضوء ثم الصلوات الخمس.
                </span>
              </p>
              <p className="flex items-start gap-2.5">
                <Star className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  في كل محطة ستتعلم مع آدم ونور، وتلعب أنشطة تفاعلية متنوعة، وتحل اختبارًا من ٥ أسئلة.
                </span>
              </p>
              <p className="flex items-start gap-2.5">
                <Award className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  عند اجتياز الاختبار تحصل على شارة المحطة وتُفتح لك المحطة التالية تلقائيًا!
                </span>
              </p>
              <p className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
                ملاحظة: يتم حفظ نقاطك وتقدمك محليًا على هذا الجهاز والمتصفح فقط.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                audioEngine.stopSpeech();
                setShowInstructions(false);
              }}
              className="btn-3d w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold cursor-pointer"
            >
              فهمت! هيا بنا
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
