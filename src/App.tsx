import { useState, useEffect } from 'react';
import { PlayerProgress, ScreenView } from './types/game';
import { LEVELS } from './data/gameContent';
import { StartScreen } from './components/StartScreen';
import { IntroDialogueScreen } from './components/IntroDialogueScreen';
import { AdventureMap } from './components/AdventureMap';
import { LevelWorkspace } from './components/LevelWorkspace';
import { VictoryScreen } from './components/VictoryScreen';
import { audioEngine } from './utils/audioEngine';

const STORAGE_KEY = 'prayer_heroes_progress_v1';

const DEFAULT_PROGRESS: PlayerProgress = {
  unlockedLevel: 1,
  completedLevels: [],
  points: 0,
  stars: 0,
  earnedBadges: [],
  levelScores: {},
};

function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    return {
      unlockedLevel:
        typeof parsed.unlockedLevel === 'number'
          ? Math.min(7, Math.max(1, parsed.unlockedLevel))
          : 1,
      completedLevels: Array.isArray(parsed.completedLevels)
        ? parsed.completedLevels
        : [],
      points: typeof parsed.points === 'number' ? parsed.points : 0,
      stars: typeof parsed.stars === 'number' ? parsed.stars : 0,
      earnedBadges: Array.isArray(parsed.earnedBadges)
        ? parsed.earnedBadges
        : [],
      levelScores: parsed.levelScores || {},
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export default function App() {
  const [screen, setScreen] = useState<ScreenView>('START');
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [progress, setProgress] = useState<PlayerProgress>(loadProgress);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota issues
    }
  }, [progress]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioEngine.setSoundEnabled(next);
    if (next) {
      audioEngine.playClick();
    }
  };

  const handleAwardActivity = () => {
    setProgress((prev) => ({
      ...prev,
      points: prev.points + 20,
      stars: prev.stars + 1,
    }));
  };

  const handlePassLevel = (levelId: number, quizScore: number) => {
    const levelDef = LEVELS.find((l) => l.id === levelId);
    if (!levelDef) return;

    setProgress((prev) => {
      const alreadyCompleted = prev.completedLevels.includes(levelId);
      const completedLevels = alreadyCompleted
        ? prev.completedLevels
        : [...prev.completedLevels, levelId];

      const earnedBadges = prev.earnedBadges.includes(levelDef.badge.id)
        ? prev.earnedBadges
        : [...prev.earnedBadges, levelDef.badge.id];

      const unlockedLevel = Math.min(
        7,
        Math.max(prev.unlockedLevel, levelId + 1)
      );

      return {
        ...prev,
        unlockedLevel,
        completedLevels,
        earnedBadges,
        points: prev.points + (alreadyCompleted ? 25 : quizScore * 20 + 50),
        stars: prev.stars + (alreadyCompleted ? 1 : quizScore),
        levelScores: {
          ...prev.levelScores,
          [levelId]: Math.max(prev.levelScores[levelId] || 0, quizScore),
        },
      };
    });
  };

  const handleRestartJourney = () => {
    setProgress(DEFAULT_PROGRESS);
    setActiveLevelId(1);
    setScreen('START');
  };

  const activeLevel = LEVELS.find((l) => l.id === activeLevelId) || LEVELS[0];

  if (screen === 'START') {
    return (
      <StartScreen
        soundEnabled={soundEnabled}
        hasSavedProgress={progress.completedLevels.length > 0}
        onToggleSound={handleToggleSound}
        onStartJourney={() => setScreen('INTRO_DIALOGUE')}
        onContinueMap={() => setScreen('MAP')}
      />
    );
  }

  if (screen === 'INTRO_DIALOGUE') {
    return <IntroDialogueScreen onContinueToMap={() => setScreen('MAP')} />;
  }

  if (screen === 'MAP') {
    return (
      <AdventureMap
        progress={progress}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onSelectLevel={(id) => {
          setActiveLevelId(id);
          setScreen('LEVEL');
        }}
        onOpenVictory={() => setScreen('VICTORY')}
        onBackHome={() => setScreen('START')}
      />
    );
  }

  if (screen === 'VICTORY') {
    return (
      <VictoryScreen
        progress={progress}
        onRestartJourney={handleRestartJourney}
        onBackToMap={() => setScreen('MAP')}
      />
    );
  }

  return (
    <LevelWorkspace
      level={activeLevel}
      soundEnabled={soundEnabled}
      points={progress.points}
      stars={progress.stars}
      onToggleSound={handleToggleSound}
      onBackToMap={() => {
        if (
          activeLevelId === 7 &&
          progress.completedLevels.includes(7) &&
          progress.completedLevels.length === 7
        ) {
          setScreen('VICTORY');
        } else {
          setScreen('MAP');
        }
      }}
      onAwardActivity={handleAwardActivity}
      onPassLevel={(score) => handlePassLevel(activeLevel.id, score)}
    />
  );
}
