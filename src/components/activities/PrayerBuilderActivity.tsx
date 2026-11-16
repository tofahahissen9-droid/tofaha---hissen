import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { PrayerPoseId, TimeVisualId } from '../../types/game';
import { PrayerPostureIllustration } from '../illustrations/PrayerPostureIllustration';
import { audioEngine } from '../../utils/audioEngine';

interface PrayerStepNode {
  pose: PrayerPoseId;
  title: string;
  dhikr: string;
  note: string;
}

const RAKAAT_MOVES: PrayerStepNode[] = [
  {
    pose: 'ruku',
    title: 'الركوع',
    dhikr: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
    note: 'ننحني مع استواء الظهر ونضع اليدين على الركبتين.',
  },
  {
    pose: 'itidal',
    title: 'الاعتدال من الركوع',
    dhikr: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ، رَبَّنَا وَلَكَ الْحَمْدُ',
    note: 'نرفع ظهرنا ونعتدل واقفين مطمئنين.',
  },
  {
    pose: 'sujood',
    title: 'السجدة الأولى',
    dhikr: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
    note: 'نسجد على الجبهة والأنف والكفين والركبتين وأطراف القدمين.',
  },
  {
    pose: 'juloos',
    title: 'الجلوس بين السجدتين',
    dhikr: 'رَبِّ اغْفِرْ لِي',
    note: 'نجلس مطمئنين بين السجدتين.',
  },
  {
    pose: 'sujood',
    title: 'السجدة الثانية',
    dhikr: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
    note: 'نسجد السجدة الثانية بإذن الله.',
  },
];

interface PrayerBuilderActivityProps {
  prayerId: TimeVisualId;
  prayerName: string;
  targetRakaat: number;
  targetSajdahs: number;
  isLoudFirstTwo: boolean;
  onComplete: () => void;
  onVisibleTextChange?: (text: string) => void;
}

export const PrayerBuilderActivity: React.FC<PrayerBuilderActivityProps> = ({
  prayerName,
  targetRakaat,
  targetSajdahs,
  isLoudFirstTwo,
  onComplete,
  onVisibleTextChange,
}) => {
  const [currentRakaah, setCurrentRakaah] = useState(1);
  const [sajdahDone, setSajdahDone] = useState(0);
  const [stage, setStage] = useState<
    'takbeer' | 'recite_choice' | 'moves' | 'tashahhud_choice' | 'done'
  >('takbeer');
  const [moveIdx, setMoveIdx] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isFirstTwo = currentRakaah <= 2;

  useEffect(() => {
    if (!onVisibleTextChange) return;
    const hud = `الركعة: ${currentRakaah} من ${targetRakaat}. إجمالي السجدات: ${sajdahDone} من ${targetSajdahs}. ${prayerName}.`;

    if (stage === 'done') {
      onVisibleTextChange(
        `${hud} تقبل الله! أتممت ${prayerName} (${targetRakaat} ركعات و${targetSajdahs} سجدات). السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ (يمينًا ثم يسارًا).`
      );
    } else if (stage === 'takbeer') {
      onVisibleTextChange(
        `${hud} ابدأ ${prayerName} بتكبيرة الإحرام. نستقبل القبلة، نرفع اليدين حذو المنكبين ونقول: اللَّهُ أَكْبَرُ. كبّر للدخول في الصلاة.`
      );
    } else if (stage === 'recite_choice') {
      onVisibleTextChange(
        `${hud} الركعة ${currentRakaah}: ماذا نقرأ الآن وكيف؟ سورة الفاتحة + سورة قصيرة (جهرًا بصوت مسموع). سورة الفاتحة + سورة قصيرة (سرًا بصوت خفي). سورة الفاتحة فقط (سرًا بصوت خفي).${
          feedback ? ` ${feedback}` : ''
        }`
      );
    } else if (stage === 'moves') {
      const m = RAKAAT_MOVES[moveIdx];
      onVisibleTextChange(
        `${hud} ${m.title}. ${m.dhikr}. ${m.note} الحركة التالية.`
      );
    } else if (stage === 'tashahhud_choice') {
      onVisibleTextChange(
        `${hud} أنهينا الركعة ${currentRakaah}! ماذا نفعل في الجلوس الآن؟ التشهد الأول فقط (التحيات)، ثم نقوم للركعة التالية. التشهد الأخير + الصلاة الإبراهيمية + التسليم يمينًا ويسارًا.${
          feedback ? ` ${feedback}` : ''
        }`
      );
    }
  }, [
    currentRakaah,
    feedback,
    moveIdx,
    onVisibleTextChange,
    prayerName,
    sajdahDone,
    stage,
    targetRakaat,
    targetSajdahs,
  ]);

  const activePose: PrayerPoseId =
    stage === 'takbeer'
      ? 'takbeer'
      : stage === 'recite_choice'
      ? 'qiyam'
      : stage === 'moves'
      ? RAKAAT_MOVES[moveIdx].pose
      : stage === 'tashahhud_choice'
      ? 'tashahhud'
      : 'tasleem';

  const handleTakbeer = () => {
    audioEngine.playCorrect();
    setStage('recite_choice');
    setFeedback(null);
  };

  const handleReciteChoice = (withShortSurah: boolean, loudChoice: boolean) => {
    const expectedShortSurah = isFirstTwo;
    const expectedLoud = isFirstTwo ? isLoudFirstTwo : false;

    if (withShortSurah === expectedShortSurah && loudChoice === expectedLoud) {
      audioEngine.playCorrect();
      setFeedback(null);
      setMoveIdx(0);
      setStage('moves');
    } else {
      audioEngine.playTryAgain();
      if (withShortSurah !== expectedShortSurah) {
        setFeedback(
          expectedShortSurah
            ? 'في الركعتين الأولى والثانية نقرأ سورة الفاتحة ومعها سورة قصيرة أو ما تيسر من القرآن!'
            : 'تذكّر! في الركعة الثالثة والرابعة من الفرض نقرأ سورة الفاتحة فقط!'
        );
      } else {
        setFeedback(
          expectedLoud
            ? `في ${prayerName} الركعتان الأولى والثانية جهرية بصوت مسموع!`
            : 'هنا تكون القراءة سرية بصوت خفي!'
        );
      }
    }
  };

  const handleNextMove = () => {
    const currentMove = RAKAAT_MOVES[moveIdx];
    audioEngine.playClick();
    if (currentMove.pose === 'sujood') {
      setSajdahDone((prev) => prev + 1);
    }

    if (moveIdx + 1 < RAKAAT_MOVES.length) {
      setMoveIdx((prev) => prev + 1);
    } else {
      if (currentRakaah === targetRakaat) {
        setStage('tashahhud_choice');
      } else if (currentRakaah === 2 && targetRakaat > 2) {
        setStage('tashahhud_choice');
      } else {
        setCurrentRakaah((prev) => prev + 1);
        setStage('recite_choice');
      }
    }
  };

  const handleTashahhudChoice = (isFinalWithTasleem: boolean) => {
    const shouldBeFinal = currentRakaah === targetRakaat;
    if (isFinalWithTasleem === shouldBeFinal) {
      audioEngine.playCorrect();
      setFeedback(null);
      if (shouldBeFinal) {
        setStage('done');
        onComplete();
      } else {
        setCurrentRakaah((prev) => prev + 1);
        setStage('recite_choice');
      }
    } else {
      audioEngine.playTryAgain();
      setFeedback(
        shouldBeFinal
          ? 'هذه آخر ركعة! نقرأ التشهد الأخير والصلاة الإبراهيمية ثم نسلم يمينًا ويسارًا!'
          : 'نحن الآن بعد الركعة الثانية، نجلس للتشهد الأول فقط ثم نقوم للركعة الثالثة!'
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Live Rakaah & Sajdah HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-900 text-white px-4 py-3">
        <div className="flex items-center gap-4 text-sm font-bold">
          <span>
            الركعة: <strong className="text-amber-300 tabular-nums">{currentRakaah} / {targetRakaat}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            إجمالي السجدات: <strong className="text-emerald-300 tabular-nums">{sajdahDone} / {targetSajdahs}</strong>
          </span>
        </div>
        <span className="text-xs text-slate-300 font-semibold">
          {prayerName}
        </span>
      </div>

      {stage === 'done' ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-4">
          <PrayerPostureIllustration poseId="tasleem" className="w-full h-48 max-w-sm mx-auto" />
          <div className="flex items-center justify-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-7 h-7" />
            <h4 className="text-xl font-extrabold">
              تقبل الله! أتممت {prayerName} ({targetRakaat} ركعات و{targetSajdahs} سجدات)
            </h4>
          </div>
          <p className="font-quran text-lg text-slate-800">
            «السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ» (يمينًا ثم يسارًا)
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-5">
            <PrayerPostureIllustration poseId={activePose} className="w-full h-60" />
          </div>

          <div className="md:col-span-7 space-y-4">
            {stage === 'takbeer' && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 space-y-3">
                <h4 className="text-lg font-extrabold text-amber-950">
                  ابدأ {prayerName} بتكبيرة الإحرام
                </h4>
                <p className="text-slate-700 font-semibold">
                  نستقبل القبلة، نرفع اليدين حذو المنكبين ونقول:
                </p>
                <p className="font-quran text-2xl font-bold text-emerald-900">
                  «اللَّهُ أَكْبَرُ»
                </p>
                <button
                  type="button"
                  onClick={handleTakbeer}
                  className="btn-3d px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-[0_4px_0_#047857] cursor-pointer"
                >
                  كبّر للدخول في الصلاة
                </button>
              </div>
            )}

            {stage === 'recite_choice' && (
              <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
                <h4 className="text-lg font-extrabold text-slate-900">
                  الركعة {currentRakaah}: ماذا نقرأ الآن وكيف؟
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleReciteChoice(true, true)}
                    className="text-right px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 font-bold text-slate-800 cursor-pointer"
                  >
                    سورة الفاتحة + سورة قصيرة (جهرًا بصوت مسموع)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReciteChoice(true, false)}
                    className="text-right px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 font-bold text-slate-800 cursor-pointer"
                  >
                    سورة الفاتحة + سورة قصيرة (سرًا بصوت خفي)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReciteChoice(false, false)}
                    className="text-right px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 font-bold text-slate-800 cursor-pointer"
                  >
                    سورة الفاتحة فقط (سرًا بصوت خفي)
                  </button>
                </div>
                {feedback && (
                  <p className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-bold">
                    {feedback}
                  </p>
                )}
              </div>
            )}

            {stage === 'moves' && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 space-y-3">
                <h4 className="text-lg font-extrabold text-emerald-950">
                  {RAKAAT_MOVES[moveIdx].title}
                </h4>
                <p className="font-quran text-2xl font-bold text-emerald-900 bg-white/80 rounded-xl p-3 border border-emerald-100">
                  «{RAKAAT_MOVES[moveIdx].dhikr}»
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  {RAKAAT_MOVES[moveIdx].note}
                </p>
                <button
                  type="button"
                  onClick={handleNextMove}
                  className="btn-3d inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-[0_4px_0_#047857] cursor-pointer"
                >
                  <span>الحركة التالية</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {stage === 'tashahhud_choice' && (
              <div className="rounded-2xl bg-violet-50 border border-violet-200 p-5 space-y-3">
                <h4 className="text-lg font-extrabold text-violet-950">
                  أنهينا الركعة {currentRakaah}! ماذا نفعل في الجلوس الآن؟
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleTashahhudChoice(false)}
                    className="text-right px-4 py-3.5 rounded-xl border-2 border-violet-200 bg-white hover:border-violet-500 font-bold text-slate-800 cursor-pointer"
                  >
                    التشهد الأول فقط (التحيات)، ثم نقوم للركعة التالية
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTashahhudChoice(true)}
                    className="text-right px-4 py-3.5 rounded-xl border-2 border-violet-200 bg-white hover:border-violet-500 font-bold text-slate-800 cursor-pointer"
                  >
                    التشهد الأخير + الصلاة الإبراهيمية + التسليم يمينًا ويسارًا
                  </button>
                </div>
                {feedback && (
                  <p className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-bold">
                    {feedback}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
