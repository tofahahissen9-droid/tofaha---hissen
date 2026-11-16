import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  RotateCcw,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ActivityConfig } from '../../types/game';
import { ActivityThumbnail } from '../illustrations/SceneIllustrations';
import { WuduStepIllustration } from '../illustrations/WuduStepIllustration';
import { SpeakerButton } from '../SpeakerButton';
import { WuduSimulatorActivity } from './WuduSimulatorActivity';
import { PrayerBuilderActivity } from './PrayerBuilderActivity';
import { audioEngine } from '../../utils/audioEngine';
import { buildActivitySegments } from '../../utils/narrationBuilders';

interface ActivityArenaProps {
  activity: ActivityConfig;
  onSuccess: () => void;
}

export const ActivityArena: React.FC<ActivityArenaProps> = ({
  activity,
  onSuccess,
}) => {
  const [completed, setCompleted] = useState(false);
  const [dynamicVisibleText, setDynamicVisibleText] = useState('');

  useEffect(() => {
    setCompleted(false);
    setDynamicVisibleText('');
  }, [activity.id]);

  const fullActivitySegments = useMemo(
    () => buildActivitySegments(activity, dynamicVisibleText, completed),
    [activity, completed, dynamicVisibleText]
  );

  useEffect(() => {
    audioEngine.prefetch(fullActivitySegments);
  }, [fullActivitySegments]);

  const triggerComplete = () => {
    if (completed) return;
    setCompleted(true);
    audioEngine.playCorrect();
    onSuccess();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">
            {activity.title}
          </h3>
          <p className="text-sm md:text-base font-semibold text-slate-600">
            {activity.instruction}
          </p>
        </div>

        <SpeakerButton
          segments={fullActivitySegments}
          playId={`activity_${activity.id}_full`}
          label="اسمع النشاط كاملًا"
          variant="sky"
        />
      </div>

      {activity.type === 'image_select' && (
        <ImageSelectGame
          activity={activity}
          onPass={triggerComplete}
          onVisibleTextChange={setDynamicVisibleText}
        />
      )}

      {activity.type === 'matching' && (
        <MatchingPairsGame
          activity={activity}
          onPass={triggerComplete}
          onVisibleTextChange={setDynamicVisibleText}
        />
      )}

      {activity.type === 'ordering' && (
        <OrderingGame
          activity={activity}
          onPass={triggerComplete}
          onVisibleTextChange={setDynamicVisibleText}
        />
      )}

      {activity.type === 'hotspot_discovery' && (
        <HotspotDiscoveryGame
          activity={activity}
          onPass={triggerComplete}
          onVisibleTextChange={setDynamicVisibleText}
        />
      )}

      {activity.type === 'true_false_multi' && (
        <TrueFalseMultiGame
          activity={activity}
          onPass={triggerComplete}
          onVisibleTextChange={setDynamicVisibleText}
        />
      )}

      {activity.type === 'wudu_simulator' && (
        <WuduSimulatorActivity
          onComplete={triggerComplete}
          onVisibleTextChange={setDynamicVisibleText}
        />
      )}

      {activity.type === 'spot_error' && (
        <SpotErrorGame
          activity={activity}
          onPass={triggerComplete}
          onVisibleTextChange={setDynamicVisibleText}
        />
      )}

      {activity.type === 'memory_cards' && (
        <MemoryCardsGame
          activity={activity}
          onPass={triggerComplete}
          onVisibleTextChange={setDynamicVisibleText}
        />
      )}

      {activity.type === 'prayer_builder' && (
        <PrayerBuilderActivity
          prayerId={activity.prayerId}
          prayerName={activity.prayerName}
          targetRakaat={activity.targetRakaat}
          targetSajdahs={activity.targetSajdahs}
          isLoudFirstTwo={activity.isLoudFirstTwo}
          onComplete={triggerComplete}
          onVisibleTextChange={setDynamicVisibleText}
        />
      )}

      {activity.type === 'treasure_lock' && (
        <TreasureLockGame
          activity={activity}
          onPass={triggerComplete}
          onVisibleTextChange={setDynamicVisibleText}
        />
      )}

      {completed && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-emerald-900 font-extrabold">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{activity.successMessage}</span>
        </div>
      )}
    </div>
  );
};

// 1. IMAGE SELECT
const ImageSelectGame: React.FC<{
  activity: Extract<ActivityConfig, { type: 'image_select' }>;
  onPass: () => void;
  onVisibleTextChange: (text: string) => void;
}> = ({ activity, onPass, onVisibleTextChange }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const opts = activity.options.map((o) => o.label).join(' ... ');
    onVisibleTextChange(`${opts}.${hint ? ` ${hint}` : ''}`);
  }, [activity.options, hint, onVisibleTextChange]);

  const handleSelect = (opt: (typeof activity.options)[number]) => {
    setSelectedId(opt.id);
    if (opt.isCorrect) {
      setHint(null);
      onPass();
    } else {
      audioEngine.playTryAgain();
      setHint(`هيا نحاول مرة أخرى! ${activity.hint}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {activity.options.map((opt) => {
          const isPicked = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`rounded-2xl border-2 p-3 text-center transition-all cursor-pointer flex flex-col gap-2 ${
                isPicked && opt.isCorrect
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300'
                  : isPicked
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-slate-200 bg-white hover:border-emerald-400'
              }`}
            >
              <ActivityThumbnail visualKey={opt.visual} className="w-full h-24" />
              <span className="font-bold text-slate-800 text-sm md:text-base">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
      {hint && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-sm">
          {hint}
        </div>
      )}
    </div>
  );
};

// 2. MATCHING PAIRS
const MatchingPairsGame: React.FC<{
  activity: Extract<ActivityConfig, { type: 'matching' }>;
  onPass: () => void;
  onVisibleTextChange: (text: string) => void;
}> = ({ activity, onPass, onVisibleTextChange }) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const shuffledRight = useMemo(() => {
    return [...activity.pairs].sort((a, b) =>
      a.rightLabel.localeCompare(b.rightLabel, 'ar')
    );
  }, [activity.pairs]);

  useEffect(() => {
    const lefts = activity.pairs.map((p) => p.leftLabel).join('، ');
    const rights = shuffledRight.map((p) => p.rightLabel).join('، ');
    onVisibleTextChange(
      `${lefts}. ${rights}.${errorMsg ? ` ${errorMsg}` : ''}`
    );
  }, [activity.pairs, errorMsg, onVisibleTextChange, shuffledRight]);

  const handleRightClick = (pairId: string) => {
    if (!selectedLeft || matchedIds.includes(pairId)) return;
    if (selectedLeft === pairId) {
      audioEngine.playCorrect();
      const next = [...matchedIds, pairId];
      setMatchedIds(next);
      setSelectedLeft(null);
      setErrorMsg(null);
      if (next.length === activity.pairs.length) {
        onPass();
      }
    } else {
      audioEngine.playTryAgain();
      setErrorMsg(`هيا نحاول مرة أخرى! ${activity.hint}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2.5">
          {activity.pairs.map((p) => {
            const isMatched = matchedIds.includes(p.id);
            const isActive = selectedLeft === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={isMatched}
                onClick={() => {
                  audioEngine.playClick();
                  setSelectedLeft(p.id);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-right transition-all cursor-pointer ${
                  isMatched
                    ? 'border-emerald-400 bg-emerald-50 opacity-75'
                    : isActive
                    ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200'
                    : 'border-slate-200 bg-white hover:border-sky-400'
                }`}
              >
                {p.leftVisual && (
                  <ActivityThumbnail
                    visualKey={p.leftVisual}
                    className="w-20 h-14 shrink-0"
                  />
                )}
                <span className="font-bold text-slate-800">{p.leftLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-2.5">
          {shuffledRight.map((p) => {
            const isMatched = matchedIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                disabled={isMatched || !selectedLeft}
                onClick={() => handleRightClick(p.id)}
                className={`w-full p-4 rounded-xl border-2 text-right font-extrabold transition-all cursor-pointer ${
                  isMatched
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    : selectedLeft
                    ? 'border-amber-300 bg-amber-50/40 hover:border-amber-500 text-slate-900'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                {isMatched ? `✓ ${p.rightLabel}` : p.rightLabel}
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-sm">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

// 3. ORDERING (Drag-and-drop + Touch-friendly Up/Down arrows)
const OrderingGame: React.FC<{
  activity: Extract<ActivityConfig, { type: 'ordering' }>;
  onPass: () => void;
  onVisibleTextChange: (text: string) => void;
}> = ({ activity, onPass, onVisibleTextChange }) => {
  const initialOrder = useMemo(() => {
    const arr = [...activity.items];
    return arr.reverse();
  }, [activity.items]);

  const [items, setItems] = useState(initialOrder);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const rows = items
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.label}${item.sublabel ? `، ${item.sublabel}` : ''}`
      )
      .join(' ... ');
    onVisibleTextChange(
      `${rows}.${feedback ? ` ${feedback}` : ''} تأكيد الترتيب.`
    );
  }, [feedback, items, onVisibleTextChange]);

  const moveItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= items.length) return;
    audioEngine.playClick();
    const copy = [...items];
    const [removed] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, removed);
    setItems(copy);
    setFeedback(null);
  };

  const handleCheck = () => {
    const allCorrect = items.every((item, idx) => item.correctIndex === idx);
    if (allCorrect) {
      setFeedback(null);
      onPass();
    } else {
      audioEngine.playTryAgain();
      setFeedback(`هيا نحاول مرة أخرى! ${activity.hint}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDragIndex(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== idx) {
                moveItem(dragIndex, idx);
              }
              setDragIndex(null);
            }}
            className="flex items-center justify-between gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 shadow-xs cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0 tabular-nums">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-slate-900">{item.label}</p>
                {item.sublabel && (
                  <p className="text-xs text-slate-500 font-semibold">
                    {item.sublabel}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                aria-label="تحريك لأعلى"
                disabled={idx === 0}
                onClick={() => moveItem(idx, idx - 1)}
                className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 disabled:opacity-35 flex items-center justify-center cursor-pointer"
              >
                <ArrowUp className="w-4 h-4 text-slate-700" />
              </button>
              <button
                type="button"
                aria-label="تحريك لأسفل"
                disabled={idx === items.length - 1}
                onClick={() => moveItem(idx, idx + 1)}
                className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 disabled:opacity-35 flex items-center justify-center cursor-pointer"
              >
                <ArrowDown className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-sm">
          {feedback}
        </div>
      )}

      <button
        type="button"
        onClick={handleCheck}
        className="btn-3d px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-[0_4px_0_#047857] cursor-pointer"
      >
        تأكيد الترتيب
      </button>
    </div>
  );
};

// 4. HOTSPOT DISCOVERY
const HotspotDiscoveryGame: React.FC<{
  activity: Extract<ActivityConfig, { type: 'hotspot_discovery' }>;
  onPass: () => void;
  onVisibleTextChange: (text: string) => void;
}> = ({ activity, onPass, onVisibleTextChange }) => {
  const [visited, setVisited] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeSpot = activity.hotspots.find((h) => h.id === activeId);

  useEffect(() => {
    const progressText = `النقاط المكتشفة: ${visited.length} من ${activity.hotspots.length}.`;
    const bodyText = activeSpot
      ? `${activeSpot.title}${activeSpot.rulingTag ? ` (${activeSpot.rulingTag})` : ''}. ${activeSpot.description}`
      : 'اضغط على الدوائر المرقّمة على الصورة لاكتشاف كل معلومة!';
    onVisibleTextChange(`${progressText} ${bodyText}`);
  }, [activeSpot, activity.hotspots.length, onVisibleTextChange, visited.length]);

  const handleOpenSpot = (spotId: string) => {
    audioEngine.playClick();
    setActiveId(spotId);
    if (!visited.includes(spotId)) {
      const next = [...visited, spotId];
      setVisited(next);
      if (next.length === activity.hotspots.length) {
        onPass();
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
      <div className="md:col-span-6 relative rounded-2xl border border-sky-200 bg-gradient-to-b from-sky-50 to-emerald-50 h-72 overflow-hidden">
        {activity.scene === 'wudu_body' ? (
          <WuduStepIllustration stepId="niyyah" className="w-full h-full border-0" />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 text-center">
            <svg viewBox="0 0 240 170" className="w-full h-full" aria-hidden="true">
              <rect x="60" y="30" width="120" height="120" rx="14" fill="#059669" opacity="0.18" />
              <rect x="75" y="45" width="90" height="90" rx="8" fill="#059669" />
              <circle cx="45" cy="70" r="22" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
              <polygon points="45,54 51,70 45,86 39,70" fill="#D97706" />
              <circle cx="195" cy="72" r="22" fill="#ECFDF5" stroke="#059669" strokeWidth="2.5" />
              <path d="M195 57 C188 67 188 78 195 78 C202 78 202 67 195 57 Z" fill="#0EA5E9" />
            </svg>
          </div>
        )}

        {activity.hotspots.map((spot, idx) => {
          const isDone = visited.includes(spot.id);
          return (
            <button
              key={spot.id}
              type="button"
              onClick={() => handleOpenSpot(spot.id)}
              style={{
                left: `${spot.xPercent}%`,
                top: `${spot.yPercent}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full font-extrabold text-sm shadow-lg border-2 border-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                isDone
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white animate-pulse-soft'
              }`}
              aria-label={spot.title}
            >
              {isDone ? '✓' : idx + 1}
            </button>
          );
        })}
      </div>

      <div className="md:col-span-6 space-y-3">
        <p className="text-sm font-bold text-slate-600 tabular-nums">
          النقاط المكتشفة: {visited.length} / {activity.hotspots.length}
        </p>

        {activeSpot ? (
          <div className="rounded-2xl bg-white border-2 border-emerald-300 p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-lg font-extrabold text-emerald-950">
                {activeSpot.title}
              </h4>
              {activeSpot.rulingTag && (
                <span className="text-xs font-extrabold text-amber-800">
                  {activeSpot.rulingTag}
                </span>
              )}
            </div>
            <p className="text-slate-700 font-semibold leading-relaxed">
              {activeSpot.description}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 text-amber-900 font-bold">
            اضغط على الدوائر المرقّمة على الصورة لاكتشاف كل معلومة!
          </div>
        )}
      </div>
    </div>
  );
};

// 5. TRUE / FALSE MULTI
const TrueFalseMultiGame: React.FC<{
  activity: Extract<ActivityConfig, { type: 'true_false_multi' }>;
  onPass: () => void;
  onVisibleTextChange: (text: string) => void;
}> = ({ activity, onPass, onVisibleTextChange }) => {
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const stmt = activity.statements[idx];

  useEffect(() => {
    onVisibleTextChange(
      `العبارة ${idx + 1} من ${activity.statements.length}. ${stmt.text}. صح. خطأ.${
        feedback ? ` ${feedback.text}` : ''
      }`
    );
  }, [activity.statements.length, feedback, idx, onVisibleTextChange, stmt.text]);

  const handleAnswer = (val: boolean) => {
    if (val === stmt.isTrue) {
      audioEngine.playCorrect();
      setFeedback({ ok: true, text: stmt.explanation });
      setTimeout(() => {
        if (idx + 1 < activity.statements.length) {
          setIdx((p) => p + 1);
          setFeedback(null);
        } else {
          onPass();
        }
      }, 1200);
    } else {
      audioEngine.playTryAgain();
      setFeedback({ ok: false, text: `هيا نحاول مرة أخرى! ${stmt.explanation}` });
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4">
      <p className="text-xs font-bold text-slate-500 tabular-nums">
        العبارة {idx + 1} من {activity.statements.length}
      </p>
      <p className="text-lg md:text-xl font-extrabold text-slate-900">
        {stmt.text}
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleAnswer(true)}
          className="btn-3d flex-1 min-w-[130px] py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg shadow-[0_4px_0_#047857] cursor-pointer"
        >
          صح ✓
        </button>
        <button
          type="button"
          onClick={() => handleAnswer(false)}
          className="btn-3d flex-1 min-w-[130px] py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-lg shadow-[0_4px_0_#BE123C] cursor-pointer"
        >
          خطأ ✕
        </button>
      </div>
      {feedback && (
        <div
          className={`p-3.5 rounded-xl font-bold text-sm ${
            feedback.ok
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border border-amber-200 text-amber-900'
          }`}
        >
          {feedback.text}
        </div>
      )}
    </div>
  );
};

// 6. SPOT THE ERROR
const SpotErrorGame: React.FC<{
  activity: Extract<ActivityConfig, { type: 'spot_error' }>;
  onPass: () => void;
  onVisibleTextChange: (text: string) => void;
}> = ({ activity, onPass, onVisibleTextChange }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const stepsText = activity.steps.map((s) => s.label).join(' ... ');
    onVisibleTextChange(
      `${activity.scenarioTitle}. ${stepsText}.${msg ? ` ${msg}` : ''}`
    );
  }, [activity.scenarioTitle, activity.steps, msg, onVisibleTextChange]);

  const handlePick = (step: (typeof activity.steps)[number]) => {
    setSelectedId(step.id);
    if (step.isError) {
      setMsg(step.correction);
      onPass();
    } else {
      audioEngine.playTryAgain();
      setMsg(`هذه الخطوة صحيحة! ${activity.hint}`);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-slate-600">{activity.scenarioTitle}</p>
      <div className="space-y-2.5">
        {activity.steps.map((step) => {
          const isPicked = selectedId === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => handlePick(step)}
              className={`w-full text-right p-4 rounded-xl border-2 font-bold transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isPicked && step.isError
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                  : isPicked
                  ? 'border-amber-400 bg-amber-50 text-amber-950'
                  : 'border-slate-200 bg-white hover:border-rose-400 text-slate-800'
              }`}
            >
              <span>{step.label}</span>
              <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
            </button>
          );
        })}
      </div>
      {msg && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-sm">
          {msg}
        </div>
      )}
    </div>
  );
};

// 7. MEMORY CARDS
const MemoryCardsGame: React.FC<{
  activity: Extract<ActivityConfig, { type: 'memory_cards' }>;
  onPass: () => void;
  onVisibleTextChange: (text: string) => void;
}> = ({ activity, onPass, onVisibleTextChange }) => {
  const deck = useMemo(() => {
    return activity.cards
      .map((c, idx) => ({ ...c, uid: `${c.pairId}_${c.role}_${idx}` }))
      .sort((a, b) => ((a.uid.charCodeAt(0) * 13) % 17) - ((b.uid.charCodeAt(0) * 13) % 17));
  }, [activity.cards]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  useEffect(() => {
    const revealedTexts = deck
      .filter((c) => flipped.includes(c.uid) || matchedPairs.includes(c.pairId))
      .map((c) => c.text)
      .join('، ');
    onVisibleTextChange(
      `الأزواج المكتشفة: ${matchedPairs.length} من ${activity.cards.length / 2}. إعادة خلط.${
        revealedTexts ? ` الكروت المكشوفة: ${revealedTexts}.` : ''
      }`
    );
  }, [activity.cards.length, deck, flipped, matchedPairs, onVisibleTextChange]);

  const handleFlip = (card: (typeof deck)[number]) => {
    if (
      flipped.includes(card.uid) ||
      matchedPairs.includes(card.pairId) ||
      flipped.length >= 2
    ) {
      return;
    }
    audioEngine.playClick();
    const nextFlipped = [...flipped, card.uid];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const first = deck.find((d) => d.uid === nextFlipped[0]);
      const second = deck.find((d) => d.uid === nextFlipped[1]);
      if (first && second && first.pairId === second.pairId) {
        audioEngine.playCorrect();
        const nextMatched = [...matchedPairs, first.pairId];
        setMatchedPairs(nextMatched);
        setFlipped([]);
        if (nextMatched.length === activity.cards.length / 2) {
          onPass();
        }
      } else {
        setTimeout(() => setFlipped([]), 850);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm font-bold text-slate-600">
        <span className="tabular-nums">
          الأزواج المكتشفة: {matchedPairs.length} / {activity.cards.length / 2}
        </span>
        <button
          type="button"
          onClick={() => {
            setFlipped([]);
            setMatchedPairs([]);
          }}
          className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>إعادة خلط</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {deck.map((card) => {
          const isRevealed =
            flipped.includes(card.uid) || matchedPairs.includes(card.pairId);
          const isMatched = matchedPairs.includes(card.pairId);
          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => handleFlip(card)}
              className={`min-h-[96px] p-3 rounded-2xl border-2 font-extrabold text-sm md:text-base transition-all cursor-pointer flex items-center justify-center text-center ${
                isMatched
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                  : isRevealed
                  ? 'border-sky-500 bg-white text-slate-900'
                  : 'border-violet-300 bg-gradient-to-br from-violet-600 to-indigo-700 text-white hover:opacity-95'
              }`}
            >
              {isRevealed ? card.text : <Sparkles className="w-6 h-6 opacity-80" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 8. TREASURE LOCK PUZZLE
const TreasureLockGame: React.FC<{
  activity: Extract<ActivityConfig, { type: 'treasure_lock' }>;
  onPass: () => void;
  onVisibleTextChange: (text: string) => void;
}> = ({ activity, onPass, onVisibleTextChange }) => {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    activity.dials.forEach((d) => {
      init[d.id] = d.options[0];
    });
    return init;
  });
  const [unlocked, setUnlocked] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const dialsText = activity.dials
      .map((d) => `${d.label}: ${d.options.join('، ')}`)
      .join('. ');
    onVisibleTextChange(
      `أقفال الكنز الذهبية. اختر الإجابة الصحيحة لكل قفل ثم اضغط فتح. ${dialsText}.${
        hint ? ` ${hint}` : ''
      } افتح القفل الذهبي.`
    );
  }, [activity.dials, hint, onVisibleTextChange]);

  const handleUnlock = () => {
    const allCorrect = activity.dials.every(
      (d) => values[d.id] === d.correctOption
    );
    if (allCorrect) {
      setUnlocked(true);
      setHint(null);
      onPass();
    } else {
      audioEngine.playTryAgain();
      setHint(`هيا نحاول مرة أخرى! ${activity.hint}`);
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50/70 border-2 border-amber-300 p-5 space-y-5">
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            unlocked ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
          }`}
        >
          {unlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
        </div>
        <div>
          <h4 className="font-extrabold text-slate-900">أقفال الكنز الذهبية</h4>
          <p className="text-xs font-semibold text-slate-600">
            اختر الإجابة الصحيحة لكل قفل ثم اضغط فتح
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activity.dials.map((dial) => (
          <div
            key={dial.id}
            className="rounded-xl bg-white border border-amber-200 p-3.5 space-y-2"
          >
            <p className="text-sm font-extrabold text-slate-800">{dial.label}</p>
            <div className="space-y-1.5">
              {dial.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    audioEngine.playClick();
                    setValues((prev) => ({ ...prev, [dial.id]: opt }));
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-bold border transition-colors cursor-pointer ${
                    values[dial.id] === opt
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {hint && (
        <div className="p-3 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-sm">
          {hint}
        </div>
      )}

      <button
        type="button"
        onClick={handleUnlock}
        className="btn-3d px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-[0_4px_0_#B45309] cursor-pointer"
      >
        افتح القفل الذهبي
      </button>
    </div>
  );
};
