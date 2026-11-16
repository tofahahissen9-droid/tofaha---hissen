import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CharacterAvatar } from './CharacterAvatar';
import { SpeakerButton } from './SpeakerButton';
import { SpeakerId } from '../types/game';
import { audioEngine, SpeechSegment } from '../utils/audioEngine';

interface IntroDialogueScreenProps {
  onContinueToMap: () => void;
}

const INTRO_LINES: { speaker: 'adam' | 'noor'; text: string }[] = [
  {
    speaker: 'adam',
    text: 'أهلًا يا أبطال! لدينا مغامرة جديدة ومشوقة، ونحن ننتظر مساعدتكم!',
  },
  {
    speaker: 'noor',
    text: 'سنكتشف معًا أسرار الصلاة ونتعلم كيف نصلي بطريقة صحيحة، هيا نبدأ رحلتنا لنصل إلى الكنز!',
  },
];

export const IntroDialogueScreen: React.FC<IntroDialogueScreenProps> = ({
  onContinueToMap,
}) => {
  const [step, setStep] = useState(0);
  const [speakingWho, setSpeakingWho] = useState<SpeakerId | null>(null);

  useEffect(() => {
    const unsub = audioEngine.subscribeSpeaking((sp) => setSpeakingWho(sp));
    return () => {
      unsub();
      audioEngine.stopSpeech();
    };
  }, []);

  const currentLine = INTRO_LINES[step];

  const slideSegments: SpeechSegment[] = useMemo(() => {
    const speakerLabel =
      currentLine.speaker === 'adam' ? 'آدم يقول:' : 'نور تقول:';
    const buttonLabel =
      step < INTRO_LINES.length - 1 ? 'التالي.' : 'افتح خريطة المغامرة.';
    return [
      {
        speaker: 'noor',
        text: `آدم. نور. ${speakerLabel} ${currentLine.text} ${buttonLabel}`,
      },
    ];
  }, [currentLine, step]);

  useEffect(() => {
    // Prefetch all intro lines upfront so Step 1 & Step 2 are instantaneous
    audioEngine.prefetch([
      {
        speaker: 'noor',
        text: `آدم. نور. آدم يقول: ${INTRO_LINES[0].text} التالي.`,
      },
      {
        speaker: 'noor',
        text: `آدم. نور. نور تقول: ${INTRO_LINES[1].text} افتح خريطة المغامرة.`,
      },
    ]);
  }, []);

  useEffect(() => {
    audioEngine.speakSequence(slideSegments, `intro_step_${step}`);
  }, [slideSegments, step]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-[#FAF8F2] to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full rounded-3xl bg-white border-2 border-emerald-200 p-6 md:p-10 shadow-xl space-y-7">
        {/* Two Characters Side-by-Side */}
        <div className="flex items-center justify-center gap-6 sm:gap-12">
          <div className="text-center space-y-2">
            <CharacterAvatar
              character="adam"
              size="xl"
              isSpeaking={speakingWho === 'adam'}
              className={
                currentLine.speaker === 'adam'
                  ? 'scale-105'
                  : 'opacity-80 scale-95'
              }
            />
            <p className="font-extrabold text-emerald-900 text-lg">آدم</p>
          </div>

          <div className="text-center space-y-2">
            <CharacterAvatar
              character="noor"
              size="xl"
              isSpeaking={speakingWho === 'noor'}
              className={
                currentLine.speaker === 'noor'
                  ? 'scale-105'
                  : 'opacity-80 scale-95'
              }
            />
            <p className="font-extrabold text-sky-900 text-lg">نور</p>
          </div>
        </div>

        {/* Speech Bubble */}
        <div
          className={`rounded-2xl border-2 p-5 md:p-6 space-y-3 transition-colors ${
            currentLine.speaker === 'adam'
              ? 'bg-emerald-50 border-emerald-300'
              : 'bg-sky-50 border-sky-300'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span
              className={`font-extrabold text-base ${
                currentLine.speaker === 'adam'
                  ? 'text-emerald-800'
                  : 'text-sky-800'
              }`}
            >
              {currentLine.speaker === 'adam' ? 'آدم يقول:' : 'نور تقول:'}
            </span>
            <SpeakerButton
              segments={slideSegments}
              playId={`intro_step_${step}`}
              label="اسمع الكلام"
              variant={currentLine.speaker === 'adam' ? 'emerald' : 'sky'}
            />
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-slate-900 leading-relaxed">
            «{currentLine.text}»
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {INTRO_LINES.map((_, idx) => (
              <span
                key={idx}
                className={`h-2.5 rounded-full transition-all ${
                  idx === step ? 'w-8 bg-emerald-600' : 'w-2.5 bg-slate-300'
                }`}
              />
            ))}
          </div>

          {step < INTRO_LINES.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                audioEngine.playClick();
                setStep(step + 1);
              }}
              className="btn-3d inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg shadow-[0_4px_0_#047857] cursor-pointer"
            >
              <span>التالي</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                audioEngine.stopSpeech();
                audioEngine.playClick();
                onContinueToMap();
              }}
              className="btn-3d inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg shadow-[0_4px_0_#B45309] cursor-pointer"
            >
              <span>افتح خريطة المغامرة</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
