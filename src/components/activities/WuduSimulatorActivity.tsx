import React, { useEffect, useMemo, useState } from 'react';
import { Droplets, CheckCircle2, Sparkles } from 'lucide-react';
import { WuduStepId } from '../../types/game';
import { WuduStepIllustration } from '../illustrations/WuduStepIllustration';
import { GAME_IMAGES } from '../../data/assets';
import { audioEngine } from '../../utils/audioEngine';

interface WuduSimStep {
  id: WuduStepId;
  title: string;
  ruling: 'فرض' | 'سنة';
  requiredTaps: number;
  note: string;
}

const WUDU_SIM_STEPS: WuduSimStep[] = [
  {
    id: 'niyyah',
    title: 'النية في القلب والتسمية',
    ruling: 'فرض',
    requiredTaps: 1,
    note: 'النية فرض في القلب، والتسمية «بِسْمِ اللَّهِ» سنة.',
  },
  {
    id: 'hands',
    title: 'غسل الكفين',
    ruling: 'سنة',
    requiredTaps: 3,
    note: 'نغسل الكفين ثلاث مرات مع تخليل الأصابع.',
  },
  {
    id: 'mouth',
    title: 'المضمضة',
    ruling: 'سنة',
    requiredTaps: 3,
    note: 'نتمضمض بالماء ثلاث مرات.',
  },
  {
    id: 'nose',
    title: 'الاستنشاق والاستنثار',
    ruling: 'سنة',
    requiredTaps: 3,
    note: 'ندخل الماء في الأنف برفق ونخرجه ثلاث مرات.',
  },
  {
    id: 'face',
    title: 'غسل الوجه كاملًا',
    ruling: 'فرض',
    requiredTaps: 3,
    note: 'غسل الوجه فرض (الأولى فرض، والثانية والثالثة سنة).',
  },
  {
    id: 'right_arm',
    title: 'غسل اليد اليمنى إلى المرفق',
    ruling: 'فرض',
    requiredTaps: 3,
    note: 'نبدأ باليمنى سنةً، وغسل اليدين للمرفقين فرض.',
  },
  {
    id: 'left_arm',
    title: 'غسل اليد اليسرى إلى المرفق',
    ruling: 'فرض',
    requiredTaps: 3,
    note: 'نغسل اليد اليسرى كاملة شاملةً المرفق.',
  },
  {
    id: 'head',
    title: 'مسح الرأس',
    ruling: 'فرض',
    requiredTaps: 1,
    note: 'نمسح الرأس بالماء مرة واحدة فقط.',
  },
  {
    id: 'ears',
    title: 'مسح الأذنين',
    ruling: 'سنة',
    requiredTaps: 1,
    note: 'نمسح الأذنين مرة واحدة من الداخل والخارج.',
  },
  {
    id: 'right_foot',
    title: 'غسل الرجل اليمنى إلى الكعبين',
    ruling: 'فرض',
    requiredTaps: 3,
    note: 'نبدأ بالرجل اليمنى مع غسل الكعبين.',
  },
  {
    id: 'left_foot',
    title: 'غسل الرجل اليسرى إلى الكعبين',
    ruling: 'فرض',
    requiredTaps: 3,
    note: 'نختم بالرجل اليسرى إلى الكعبين.',
  },
];

interface WuduSimulatorActivityProps {
  onComplete: () => void;
  onVisibleTextChange?: (text: string) => void;
}

export const WuduSimulatorActivity: React.FC<WuduSimulatorActivityProps> = ({
  onComplete,
  onVisibleTextChange,
}) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [phase, setPhase] = useState<'pick_next' | 'wash_action' | 'done'>('pick_next');
  const [washCount, setWashCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isErrorFeedback, setIsErrorFeedback] = useState(false);

  const currentStep = WUDU_SIM_STEPS[stepIdx];

  const choices = useMemo(() => {
    if (!currentStep) return [];
    const others = WUDU_SIM_STEPS.filter((s) => s.id !== currentStep.id);
    const distractors = [
      others[(stepIdx + 2) % others.length],
      others[(stepIdx + 5) % others.length],
    ];
    const combined = [currentStep, ...distractors];
    // Deterministic shuffle per stepIdx
    return combined.sort((a, b) =>
      ((a.id.charCodeAt(0) + stepIdx * 7) % 11) -
      ((b.id.charCodeAt(0) + stepIdx * 7) % 11)
    );
  }, [currentStep, stepIdx]);

  useEffect(() => {
    if (!onVisibleTextChange) return;
    const header = `محاكاة واحة الوضوء. الخطوة ${stepIdx + 1} من ${WUDU_SIM_STEPS.length}.`;
    if (phase === 'done') {
      onVisibleTextChange(
        `${header} أحسنت! أتممت الوضوء مع آدم بنجاح! أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ.`
      );
    } else if (phase === 'pick_next') {
      const choiceText = choices
        .map((c) => `${c.title} (${c.ruling})`)
        .join(' ... ');
      onVisibleTextChange(
        `${header} ماذا يفعل آدم الآن؟ اختر الخطوة التالية: ${choiceText}.${
          feedback ? ` ${feedback}` : ''
        }`
      );
    } else if (currentStep) {
      const btnText =
        currentStep.id === 'niyyah'
          ? `انْوِ في قلبك وقل «بِسْمِ اللَّهِ» (${washCount} من ${currentStep.requiredTaps})`
          : `${
              currentStep.requiredTaps === 1
                ? 'امسح مرة واحدة'
                : 'اغسل بالماء'
            } (${washCount} من ${currentStep.requiredTaps})`;
      onVisibleTextChange(
        `${header} ${currentStep.title}. ${currentStep.ruling}. ${currentStep.note} ${btnText}.`
      );
    }
  }, [choices, currentStep, feedback, onVisibleTextChange, phase, stepIdx, washCount]);

  const handlePickChoice = (chosen: WuduSimStep) => {
    if (chosen.id === currentStep.id) {
      audioEngine.playCorrect();
      setFeedback(null);
      setIsErrorFeedback(false);
      setWashCount(0);
      setPhase('wash_action');
    } else {
      audioEngine.playTryAgain();
      setIsErrorFeedback(true);
      setFeedback('هيا نحاول مرة أخرى! فكّر: ما العضو التالي بالترتيب الصحيح؟');
    }
  };

  const handleWashTap = () => {
    audioEngine.playWaterDrop();
    const next = washCount + 1;
    setWashCount(next);

    if (next >= currentStep.requiredTaps) {
      audioEngine.playCorrect();
      if (stepIdx + 1 >= WUDU_SIM_STEPS.length) {
        setPhase('done');
        onComplete();
      } else {
        setTimeout(() => {
          setStepIdx((prev) => prev + 1);
          setPhase('pick_next');
          setWashCount(0);
          setFeedback(null);
        }, 550);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative h-28 rounded-2xl overflow-hidden border border-sky-200">
        <img
          src={GAME_IMAGES.wuduOasis}
          alt="واحة الوضوء"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent flex items-end justify-between p-4 text-white">
          <div>
            <p className="text-xs text-sky-200 font-semibold">محاكاة واحة الوضوء</p>
            <p className="text-base md:text-lg font-extrabold">
              الخطوة {stepIdx + 1} من {WUDU_SIM_STEPS.length}
            </p>
          </div>
          <div className="w-36 h-2.5 bg-white/25 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-400 transition-all duration-300"
              style={{
                width: `${((phase === 'done' ? WUDU_SIM_STEPS.length : stepIdx) / WUDU_SIM_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {phase === 'done' ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
          <h4 className="text-xl font-extrabold text-emerald-900">
            أحسنت! أتممت الوضوء مع آدم بنجاح!
          </h4>
          <p className="text-slate-700 font-semibold">
            «أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ»
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-5">
            <WuduStepIllustration
              stepId={phase === 'wash_action' ? currentStep.id : stepIdx > 0 ? WUDU_SIM_STEPS[stepIdx - 1].id : 'niyyah'}
              className="w-full h-60"
            />
          </div>

          <div className="md:col-span-7 space-y-4">
            {phase === 'pick_next' ? (
              <div className="space-y-3">
                <h4 className="text-lg font-extrabold text-slate-800">
                  ماذا يفعل آدم الآن؟ اختر الخطوة التالية:
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {choices.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handlePickChoice(c)}
                      className="w-full text-right px-4 py-3.5 rounded-xl border-2 border-sky-200 bg-white hover:border-sky-500 hover:bg-sky-50 font-bold text-slate-800 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <span>{c.title}</span>
                      <span className="text-xs font-bold text-sky-700">
                        {c.ruling}
                      </span>
                    </button>
                  ))}
                </div>
                {feedback && (
                  <div
                    className={`p-3 rounded-xl text-sm font-bold ${
                      isErrorFeedback
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-900'
                    }`}
                  >
                    {feedback}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-sky-50 border border-sky-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-extrabold text-sky-950">
                    {currentStep.title}
                  </h4>
                  <span className="text-sm font-extrabold text-sky-800">
                    {currentStep.ruling}
                  </span>
                </div>
                <p className="text-sm md:text-base text-slate-700 font-semibold">
                  {currentStep.note}
                </p>

                <div className="flex items-center gap-2">
                  {Array.from({ length: currentStep.requiredTaps }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-3 flex-1 rounded-full transition-colors ${
                        i < washCount ? 'bg-sky-600' : 'bg-sky-200'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleWashTap}
                  className="btn-3d w-full py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base shadow-[0_4px_0_#0369A1] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {currentStep.id === 'niyyah' ? (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>انْوِ في قلبك وقل «بِسْمِ اللَّهِ» ({washCount}/{currentStep.requiredTaps})</span>
                    </>
                  ) : (
                    <>
                      <Droplets className="w-5 h-5" />
                      <span>
                        {currentStep.requiredTaps === 1 ? 'امسح مرة واحدة' : 'اغسل بالماء'} ({washCount}/{currentStep.requiredTaps})
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
