import React, { useEffect, useMemo } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { LessonCard, TimeVisualId } from '../types/game';
import { DialogueBanner } from './CharacterAvatar';
import { SpeakerButton } from './SpeakerButton';
import { WuduStepIllustration } from './illustrations/WuduStepIllustration';
import { PrayerPostureIllustration } from './illustrations/PrayerPostureIllustration';
import { TimeOfDayVisual } from './illustrations/SceneIllustrations';
import { GAME_IMAGES } from '../data/assets';
import { audioEngine } from '../utils/audioEngine';
import { buildLessonSegments } from '../utils/narrationBuilders';

interface LessonStageProps {
  lesson: LessonCard;
  speakingWho: string | null;
}

const FIVE_PRAYERS_SUMMARY: {
  id: TimeVisualId;
  name: string;
  rakaat: string;
  sajdahs: string;
  mode: string;
}[] = [
  { id: 'fajr', name: 'الفجر', rakaat: '٢ ركعة', sajdahs: '٤ سجدات', mode: 'جهرية' },
  { id: 'dhuhr', name: 'الظهر', rakaat: '٤ ركعات', sajdahs: '٨ سجدات', mode: 'سرية' },
  { id: 'asr', name: 'العصر', rakaat: '٤ ركعات', sajdahs: '٨ سجدات', mode: 'سرية' },
  { id: 'maghrib', name: 'المغرب', rakaat: '٣ ركعات', sajdahs: '٦ سجدات', mode: 'جهرية بأول ٢' },
  { id: 'isha', name: 'العشاء', rakaat: '٤ ركعات', sajdahs: '٨ سجدات', mode: 'جهرية بأول ٢' },
];

export const LessonStage: React.FC<LessonStageProps> = ({
  lesson,
  speakingWho,
}) => {
  const fullLessonSegments = useMemo(
    () => buildLessonSegments(lesson),
    [lesson]
  );

  useEffect(() => {
    audioEngine.prefetch(fullLessonSegments);
  }, [fullLessonSegments]);

  return (
    <div className="space-y-5">
      <DialogueBanner
        speaker={lesson.speaker}
        text={lesson.dialogue}
        isSpeaking={speakingWho === lesson.speaker}
      />

      <div className="rounded-3xl bg-white border border-slate-200 p-5 md:p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">
              {lesson.title}
            </h3>
            {lesson.badgeTag && (
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-lg ${
                  lesson.badgeTag === 'فرض'
                    ? 'bg-emerald-100 text-emerald-900'
                    : lesson.badgeTag === 'سنة'
                    ? 'bg-sky-100 text-sky-900'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {lesson.badgeTag}
              </span>
            )}
          </div>

          <SpeakerButton
            segments={fullLessonSegments}
            playId={`lesson_${lesson.id}_full`}
            label="اسمع الدرس كاملًا"
            variant="emerald"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Visual showcase column */}
          <div className="lg:col-span-5">
            <LessonVisual lesson={lesson} />
          </div>

          {/* Bite-sized key points + Quran/Dhikr column */}
          <div className="lg:col-span-7 space-y-4">
            <ul className="space-y-2.5">
              {lesson.keyPoints.map((pt, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-slate-800 font-semibold text-base leading-relaxed"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            {lesson.quranOrDhikr && (
              <div className="rounded-2xl bg-emerald-50/90 border border-emerald-200 p-4 space-y-2">
                <span className="block text-xs font-extrabold text-emerald-800">
                  {lesson.quranOrDhikr.label}
                </span>
                <p className="font-quran text-xl md:text-2xl text-emerald-950 font-bold">
                  {lesson.quranOrDhikr.arabicText}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LessonVisual: React.FC<{ lesson: LessonCard }> = ({ lesson }) => {
  switch (lesson.visualType) {
    case 'wudu_step':
      return (
        <WuduStepIllustration
          stepId={lesson.visualData?.wuduStepId || 'hands'}
          className="w-full h-60"
        />
      );

    case 'prayer_pose':
      return (
        <PrayerPostureIllustration
          poseId={lesson.visualData?.poseId || 'qiyam'}
          className="w-full h-60"
        />
      );

    case 'wudu_intro':
      return (
        <div className="rounded-2xl overflow-hidden border border-sky-200 h-60 relative">
          <img
            src={GAME_IMAGES.wuduOasis}
            alt="واحة الوضوء"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      );

    case 'wudu_fard_sunnah':
      return (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200 p-4 space-y-3">
          <div className="rounded-xl bg-white p-3 border border-emerald-200">
            <p className="font-extrabold text-emerald-800 text-sm mb-1">
              فروض الوضوء (٦ أركان أساسية)
            </p>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed">
              النية · غسل الوجه · غسل اليدين للمرفقين · مسح الرأس · غسل الرجلين للكعبين · الترتيب
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 border border-sky-200">
            <p className="font-extrabold text-sky-800 text-sm mb-1">
              سنن الوضوء (تزيد الأجر والمحبة)
            </p>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed">
              التسمية · غسل الكفين · المضمضة · الاستنشاق والاستنثار · الغسل ٣ مرات · مسح الأذنين · البدء باليمين
            </p>
          </div>
        </div>
      );

    case 'prayer_times':
      return (
        <div className="grid grid-cols-2 gap-2.5">
          {FIVE_PRAYERS_SUMMARY.map((p) => (
            <div key={p.id} className="space-y-1">
              <TimeOfDayVisual timeId={p.id} className="w-full h-16" />
              <p className="text-xs font-extrabold text-center text-slate-700">
                {p.name}
              </p>
            </div>
          ))}
        </div>
      );

    case 'five_prayers':
      return (
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 border border-amber-200 p-3 space-y-2">
          {FIVE_PRAYERS_SUMMARY.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-white/90 rounded-xl px-3 py-2 text-xs md:text-sm font-bold border border-amber-100"
            >
              <span className="text-emerald-900 font-extrabold">{p.name}</span>
              <span className="text-slate-700 tabular-nums">{p.rakaat}</span>
              <span className="text-slate-600 tabular-nums">{p.sajdahs}</span>
              <span className="text-violet-700">{p.mode}</span>
            </div>
          ))}
        </div>
      );

    case 'rakaat_summary': {
      const timeId = lesson.visualData?.timeId || 'fajr';
      return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
          <TimeOfDayVisual timeId={timeId} className="w-full h-32 rounded-none" />
          <div className="p-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-slate-500 font-semibold">الركعات</p>
              <p className="text-lg font-extrabold text-emerald-700 tabular-nums">
                {lesson.visualData?.rakaatCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">إجمالي السجدات</p>
              <p className="text-lg font-extrabold text-sky-700 tabular-nums">
                {lesson.visualData?.sajdahCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">القراءة</p>
              <p className="text-sm font-extrabold text-amber-700">
                {lesson.visualData?.recitationMode}
              </p>
            </div>
          </div>
        </div>
      );
    }

    case 'prayer_prep':
    case 'prayer_meaning':
    default:
      return (
        <div className="rounded-2xl overflow-hidden border border-emerald-200 h-60 relative">
          <img
            src={GAME_IMAGES.heroMosqueStart}
            alt="عالم الصلاة"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 right-3 bg-white/95 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-emerald-900 text-xs font-extrabold shadow">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>الصلاة نور وقرب من الله</span>
          </div>
        </div>
      );
  }
};
