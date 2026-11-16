import React, { useEffect, useMemo } from 'react';
import { Award, Star, RotateCcw, Map, Sparkles } from 'lucide-react';
import { GAME_IMAGES } from '../data/assets';
import { LEVELS } from '../data/gameContent';
import { PlayerProgress } from '../types/game';
import { CharacterAvatar } from './CharacterAvatar';
import { SpeakerButton } from './SpeakerButton';
import { audioEngine, SpeechSegment } from '../utils/audioEngine';

interface VictoryScreenProps {
  progress: PlayerProgress;
  onRestartJourney: () => void;
  onBackToMap: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  progress,
  onRestartJourney,
  onBackToMap,
}) => {
  const fullVictorySegments: SpeechSegment[] = useMemo(
    () => [
      {
        speaker: 'noor',
        text: `الكنز المفقود هو نور الصلاة! مبروك يا بطل! اتعلمت الوضوء والصلاة، وأصبحت صديق الصلاة. شهادة إتمام رحلة أبطال الصلاة. بطل الصلاة والوضوء. مبروك يا بطل! اتعلمت الوضوء والصلاة، وأصبحت صديق الصلاة. مجموع النقاط: ${progress.points}. النجوم المكتسبة: ${progress.stars}. الشارات: ${progress.earnedBadges.length} من 7. شاراتك السبع الذهبية: ${LEVELS.map((l) => l.badge.title).join('، ')}. مراجعة المستويات على الخريطة. إعادة الرحلة.`,
      },
    ],
    [progress]
  );

  useEffect(() => {
    audioEngine.playBadgeFanfare();
    audioEngine.prefetch(fullVictorySegments);
    audioEngine.speakSequence(fullVictorySegments, 'victory_full');
    return () => {
      audioEngine.stopSpeech();
    };
  }, [fullVictorySegments]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-emerald-950 text-white py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-7">
        {/* Open Golden Treasure Chest Scene + Adam & Noor */}
        <div className="relative rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl">
          <img
            src={GAME_IMAGES.treasureOpen}
            alt="صندوق الكنز المفتوح"
            referrerPolicy="no-referrer"
            className="w-full h-[300px] sm:h-[380px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />

          {/* Adam & Noor celebrating beside the open chest */}
          <div className="absolute bottom-4 right-4 left-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CharacterAvatar character="adam" size="lg" />
              <CharacterAvatar character="noor" size="lg" />
            </div>

            <div className="bg-white/95 text-slate-900 rounded-2xl px-5 py-3 shadow-lg text-center sm:text-right flex items-center gap-3">
              <div>
                <p className="text-xs font-extrabold text-amber-600 flex items-center justify-center sm:justify-start gap-1">
                  <Sparkles className="w-4 h-4" />
                  <span>الكنز المفقود هو نور الصلاة!</span>
                </p>
                <p className="font-extrabold text-base md:text-lg">
                  «مبروك يا بطل! اتعلمت الوضوء والصلاة، وأصبحت صديق الصلاة»
                </p>
              </div>
              <SpeakerButton
                segments={fullVictorySegments}
                playId="victory_full"
                label="اسمع الشهادة"
                variant="amber"
              />
            </div>
          </div>
        </div>

        {/* Certificate of Completion */}
        <div className="rounded-3xl bg-[#FAF8F2] text-slate-900 border-4 border-amber-400 p-6 md:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2 border-b border-amber-200 pb-5">
            <p className="text-sm font-extrabold text-emerald-700">
              شهادة إتمام رحلة أبطال الصلاة
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
              بطل الصلاة والوضوء
            </h1>
            <p className="text-base md:text-lg font-bold text-slate-700">
              مبروك يا بطل! اتعلمت الوضوء والصلاة، وأصبحت صديق الصلاة
            </p>
          </div>

          {/* Score & Stars */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500">مجموع النقاط</p>
              <p className="text-2xl md:text-3xl font-extrabold text-emerald-700 tabular-nums">
                {progress.points}
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500">النجوم المكتسبة</p>
              <p className="text-2xl md:text-3xl font-extrabold text-amber-600 tabular-nums flex items-center justify-center gap-1">
                <Star className="w-6 h-6 fill-amber-400" />
                <span>{progress.stars}</span>
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500">الشارات</p>
              <p className="text-2xl md:text-3xl font-extrabold text-violet-700 tabular-nums">
                {progress.earnedBadges.length} / 7
              </p>
            </div>
          </div>

          {/* All 7 Badges */}
          <div className="space-y-3">
            <h2 className="text-lg font-extrabold text-slate-900 text-center">
              شاراتك السبع الذهبية
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {LEVELS.map((lvl) => (
                <div
                  key={lvl.badge.id}
                  className="rounded-2xl bg-white border border-amber-300 p-3 text-center space-y-2 shadow-xs"
                >
                  <div
                    className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${lvl.badge.colorClass} text-white flex items-center justify-center`}
                  >
                    <Award className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-900">
                    {lvl.badge.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                audioEngine.playClick();
                onBackToMap();
              }}
              className="btn-3d inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-[0_4px_0_#047857] cursor-pointer"
            >
              <Map className="w-5 h-5" />
              <span>مراجعة المستويات على الخريطة</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioEngine.playClick();
                onRestartJourney();
              }}
              className="btn-3d inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base shadow-[0_4px_0_#B45309] cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>إعادة الرحلة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
