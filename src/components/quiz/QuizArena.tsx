import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Star,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { BadgeInfo, QuizQuestion } from '../../types/game';
import { ActivityThumbnail } from '../illustrations/SceneIllustrations';
import { DialogueBanner } from '../CharacterAvatar';
import { SpeakerButton } from '../SpeakerButton';
import { audioEngine, SpeechSegment } from '../../utils/audioEngine';
import { buildQuizQuestionSegments } from '../../utils/narrationBuilders';

interface QuizArenaProps {
  questions: QuizQuestion[];
  badge: BadgeInfo;
  onPassLevel: (score: number) => void;
  onBackToMap: () => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({
  questions,
  badge,
  onPassLevel,
  onBackToMap,
}) => {
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [finished, setFinished] = useState(false);

  const currentQ = questions[qIdx];

  const questionSegments = useMemo(
    () =>
      currentQ
        ? buildQuizQuestionSegments(
            currentQ,
            qIdx,
            questions.length,
            score,
            answered,
            wasCorrect
          )
        : [],
    [answered, currentQ, qIdx, questions.length, score, wasCorrect]
  );

  useEffect(() => {
    if (!finished && questionSegments.length > 0) {
      audioEngine.prefetch(questionSegments);
    }
  }, [finished, questionSegments]);

  const handleRecordAnswer = (correct: boolean) => {
    if (answered) return;
    setAnswered(true);
    setWasCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      audioEngine.playCorrect();
    } else {
      audioEngine.playTryAgain();
    }
  };

  const handleNext = () => {
    audioEngine.stopSpeech();
    audioEngine.playClick();
    if (qIdx + 1 < questions.length) {
      setQIdx((p) => p + 1);
      setAnswered(false);
      setWasCorrect(false);
    } else {
      const finalScore = score;
      setFinished(true);
      if (finalScore >= 3) {
        audioEngine.playBadgeFanfare();
        onPassLevel(finalScore);
      }
    }
  };

  const handleRestartQuiz = () => {
    audioEngine.stopSpeech();
    audioEngine.playClick();
    setQIdx(0);
    setScore(0);
    setAnswered(false);
    setWasCorrect(false);
    setFinished(false);
  };

  if (finished) {
    const passed = score >= 3;
    const passSegments: SpeechSegment[] = [
      {
        speaker: 'noor',
        text: `مبارك! حصلت على شارة ${badge.title}. ${badge.subtitle}، نتيجتك: ${score} من ${questions.length}. نور: ممتاز يا بطل! لقد فتحت المحطة التالية في خريطة المغامرة! العودة إلى خريطة المغامرة.`,
      },
    ];
    const retrySegments: SpeechSegment[] = [
      {
        speaker: 'noor',
        text: `محاولة جميلة! نتيجتك ${score} من ${questions.length}. نحتاج على الأقل ٣ إجابات صحيحة لفتح المحطة التالية والحصول على الشارة! آدم: لا بأس يا بطل! هيا نحاول مرة أخرى وسوف تنجح هذه المرة بإذن الله! إعادة الاختبار.`,
      },
    ];

    return (
      <div className="rounded-3xl bg-white border-2 border-amber-300 p-6 md:p-8 text-center space-y-5 shadow-lg">
        {passed ? (
          <>
            <div className="flex justify-end">
              <SpeakerButton
                segments={passSegments}
                playId={`quiz_pass_${badge.id}`}
                label="اسمع النتيجة"
                variant="emerald"
              />
            </div>
            <div
              className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${badge.colorClass} text-white flex items-center justify-center shadow-lg animate-float-slow`}
            >
              <Award className="w-12 h-12" />
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              مبارك! حصلت على شارة «{badge.title}»
            </h3>
            <p className="text-slate-600 font-semibold text-base md:text-lg">
              {badge.subtitle} — نتيجتك: <strong className="text-emerald-700 tabular-nums">{score} من {questions.length}</strong>
            </p>
            <div className="flex items-center justify-center gap-2 text-amber-500">
              {Array.from({ length: score }).map((_, idx) => (
                <Star key={idx} className="w-8 h-8 fill-amber-400" />
              ))}
            </div>
            <DialogueBanner
              speaker="noor"
              text="ممتاز يا بطل! لقد فتحت المحطة التالية في خريطة المغامرة!"
            />
            <div className="pt-2">
              <button
                type="button"
                onClick={onBackToMap}
                className="btn-3d px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg shadow-[0_4px_0_#047857] cursor-pointer"
              >
                العودة إلى خريطة المغامرة
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-end">
              <SpeakerButton
                segments={retrySegments}
                playId={`quiz_retry_${badge.id}`}
                label="اسمع النتيجة"
                variant="amber"
              />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              محاولة جميلة! نتيجتك {score} من {questions.length}
            </h3>
            <p className="text-slate-600 font-semibold">
              نحتاج على الأقل ٣ إجابات صحيحة لفتح المحطة التالية والحصول على الشارة!
            </p>
            <DialogueBanner
              speaker="adam"
              text="لا بأس يا بطل! هيا نحاول مرة أخرى وسوف تنجح هذه المرة بإذن الله!"
            />
            <button
              type="button"
              onClick={handleRestartQuiz}
              className="btn-3d inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg shadow-[0_4px_0_#B45309] cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>إعادة الاختبار</span>
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-5 md:p-7 space-y-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-extrabold text-emerald-800 tabular-nums">
          السؤال {qIdx + 1} من {questions.length}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold text-amber-600 tabular-nums flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>النقاط الصحيحة: {score}</span>
          </span>
          <SpeakerButton
            segments={questionSegments}
            playId={`quiz_q_${currentQ.id}_${answered ? 'ans' : 'ask'}`}
            label="اسمع السؤال والاختيارات"
            variant="sky"
          />
        </div>
      </div>

      <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-snug">
        {currentQ.prompt}
      </h3>

      {currentQ.kind === 'mcq' && (
        <QuizMcqView
          key={currentQ.id}
          question={currentQ}
          answered={answered}
          onAnswer={handleRecordAnswer}
        />
      )}

      {currentQ.kind === 'true_false' && (
        <QuizTrueFalseView
          key={currentQ.id}
          question={currentQ}
          answered={answered}
          onAnswer={handleRecordAnswer}
        />
      )}

      {currentQ.kind === 'image_choice' && (
        <QuizImageChoiceView
          key={currentQ.id}
          question={currentQ}
          answered={answered}
          onAnswer={handleRecordAnswer}
        />
      )}

      {currentQ.kind === 'order_mini' && (
        <QuizOrderMiniView
          key={currentQ.id}
          question={currentQ}
          answered={answered}
          onAnswer={handleRecordAnswer}
        />
      )}

      {currentQ.kind === 'match_mini' && (
        <QuizMatchMiniView
          key={currentQ.id}
          question={currentQ}
          answered={answered}
          onAnswer={handleRecordAnswer}
        />
      )}

      {answered && (
        <div
          className={`rounded-2xl p-4 space-y-2 border ${
            wasCorrect
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2 font-extrabold">
            <CheckCircle2
              className={`w-5 h-5 ${
                wasCorrect ? 'text-emerald-600' : 'text-amber-600'
              }`}
            />
            <span>{wasCorrect ? 'إجابة صحيحة! أحسنت يا بطل!' : 'توضيح مهم:'}</span>
          </div>
          <p className="font-semibold text-sm md:text-base">{currentQ.explanation}</p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleNext}
              className="btn-3d inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-[0_3px_0_#047857] cursor-pointer"
            >
              <span>
                {qIdx + 1 < questions.length ? 'السؤال التالي' : 'عرض النتيجة والشارة'}
              </span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const QuizMcqView: React.FC<{
  question: Extract<QuizQuestion, { kind: 'mcq' }>;
  answered: boolean;
  onAnswer: (correct: boolean) => void;
}> = ({ question, answered, onAnswer }) => {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {question.options.map((opt, idx) => {
        const isCorrect = idx === question.correctIndex;
        const isPicked = picked === idx;
        return (
          <button
            key={opt}
            type="button"
            disabled={answered}
            onClick={() => {
              setPicked(idx);
              onAnswer(isCorrect);
            }}
            className={`p-4 rounded-2xl border-2 text-right font-bold transition-all cursor-pointer ${
              answered && isCorrect
                ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                : answered && isPicked && !isCorrect
                ? 'border-rose-400 bg-rose-50 text-rose-950'
                : 'border-slate-200 bg-slate-50/70 hover:border-sky-500 hover:bg-sky-50 text-slate-900'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
};

const QuizTrueFalseView: React.FC<{
  question: Extract<QuizQuestion, { kind: 'true_false' }>;
  answered: boolean;
  onAnswer: (correct: boolean) => void;
}> = ({ question, answered, onAnswer }) => {
  const [picked, setPicked] = useState<boolean | null>(null);
  return (
    <div className="flex flex-wrap gap-3">
      {[
        { val: true, label: 'صح ✓' },
        { val: false, label: 'خطأ ✕' },
      ].map((btn) => {
        const isCorrect = btn.val === question.correctAnswer;
        const isPicked = picked === btn.val;
        return (
          <button
            key={String(btn.val)}
            type="button"
            disabled={answered}
            onClick={() => {
              setPicked(btn.val);
              onAnswer(isCorrect);
            }}
            className={`flex-1 min-w-[140px] py-4 px-6 rounded-2xl border-2 font-extrabold text-lg cursor-pointer ${
              answered && isCorrect
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                : answered && isPicked
                ? 'border-rose-400 bg-rose-50 text-rose-900'
                : 'border-slate-200 bg-slate-50 hover:border-sky-500 text-slate-900'
            }`}
          >
            {btn.label}
          </button>
        );
      })}
    </div>
  );
};

const QuizImageChoiceView: React.FC<{
  question: Extract<QuizQuestion, { kind: 'image_choice' }>;
  answered: boolean;
  onAnswer: (correct: boolean) => void;
}> = ({ question, answered, onAnswer }) => {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {question.options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={answered}
          onClick={() => {
            setPicked(opt.id);
            onAnswer(opt.isCorrect);
          }}
          className={`p-3 rounded-2xl border-2 text-center space-y-2 cursor-pointer ${
            answered && opt.isCorrect
              ? 'border-emerald-500 bg-emerald-50'
              : answered && picked === opt.id
              ? 'border-rose-400 bg-rose-50'
              : 'border-slate-200 bg-white hover:border-sky-400'
          }`}
        >
          <ActivityThumbnail visualKey={opt.visual} className="w-full h-24" />
          <span className="block font-bold text-slate-800 text-sm">{opt.label}</span>
        </button>
      ))}
    </div>
  );
};

const QuizOrderMiniView: React.FC<{
  question: Extract<QuizQuestion, { kind: 'order_mini' }>;
  answered: boolean;
  onAnswer: (correct: boolean) => void;
}> = ({ question, answered, onAnswer }) => {
  const [items, setItems] = useState(() => [...question.items].reverse());

  const move = (from: number, to: number) => {
    if (answered || to < 0 || to >= items.length) return;
    audioEngine.playClick();
    const copy = [...items];
    const [r] = copy.splice(from, 1);
    copy.splice(to, 0, r);
    setItems(copy);
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center tabular-nums">
              {idx + 1}
            </span>
            <span className="font-bold text-slate-900">{item.label}</span>
          </div>
          {!answered && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(idx, idx - 1)}
                disabled={idx === 0}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center disabled:opacity-35 cursor-pointer"
                aria-label="أعلى"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => move(idx, idx + 1)}
                disabled={idx === items.length - 1}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center disabled:opacity-35 cursor-pointer"
                aria-label="أسفل"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ))}
      {!answered && (
        <button
          type="button"
          onClick={() =>
            onAnswer(items.every((it, idx) => it.correctIndex === idx))
          }
          className="btn-3d px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold cursor-pointer"
        >
          تأكيد الإجابة
        </button>
      )}
    </div>
  );
};

const QuizMatchMiniView: React.FC<{
  question: Extract<QuizQuestion, { kind: 'match_mini' }>;
  answered: boolean;
  onAnswer: (correct: boolean) => void;
}> = ({ question, answered, onAnswer }) => {
  const rightOptions = useMemo(
    () =>
      [...question.pairs]
        .map((p) => p.right)
        .sort((a, b) => a.localeCompare(b, 'ar')),
    [question.pairs]
  );

  const [selections, setSelections] = useState<Record<string, string>>({});

  const allSelected = question.pairs.every((p) => Boolean(selections[p.id]));

  return (
    <div className="space-y-3">
      {question.pairs.map((pair) => (
        <div
          key={pair.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5"
        >
          <span className="font-bold text-slate-900">{pair.left}</span>
          <select
            disabled={answered}
            value={selections[pair.id] || ''}
            onChange={(e) => {
              audioEngine.playClick();
              setSelections((prev) => ({
                ...prev,
                [pair.id]: e.target.value,
              }));
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-800 text-sm cursor-pointer"
          >
            <option value="">اختر المطابق...</option>
            {rightOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      ))}

      {!answered && (
        <button
          type="button"
          disabled={!allSelected}
          onClick={() =>
            onAnswer(question.pairs.every((p) => selections[p.id] === p.right))
          }
          className="btn-3d px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-45 text-white font-extrabold cursor-pointer"
        >
          تأكيد التوصيل
        </button>
      )}
    </div>
  );
};
