export type SpeakerId = 'adam' | 'noor' | 'adhkar';

export type ScreenView =
  | 'START'
  | 'INTRO_DIALOGUE'
  | 'MAP'
  | 'LEVEL'
  | 'VICTORY';

export type PrayerPoseId =
  | 'takbeer'
  | 'qiyam'
  | 'ruku'
  | 'itidal'
  | 'sujood'
  | 'juloos'
  | 'tashahhud'
  | 'tasleem';

export type WuduStepId =
  | 'niyyah'
  | 'hands'
  | 'mouth'
  | 'nose'
  | 'face'
  | 'right_arm'
  | 'left_arm'
  | 'head'
  | 'ears'
  | 'right_foot'
  | 'left_foot';

export type TimeVisualId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface DialogueLine {
  speaker: 'adam' | 'noor';
  text: string;
  emotion?: 'happy' | 'excited' | 'encouraging' | 'thinking';
}

export interface LessonCard {
  id: string;
  title: string;
  speaker: 'adam' | 'noor';
  dialogue: string;
  keyPoints: string[];
  badgeTag?: 'فرض' | 'سنة' | 'تذكير مهم';
  quranOrDhikr?: {
    label: string;
    arabicText: string;
  };
  visualType:
    | 'prayer_meaning'
    | 'five_prayers'
    | 'prayer_times'
    | 'prayer_prep'
    | 'wudu_intro'
    | 'wudu_fard_sunnah'
    | 'wudu_step'
    | 'prayer_pose'
    | 'rakaat_summary';
  visualData?: {
    wuduStepId?: WuduStepId;
    poseId?: PrayerPoseId;
    timeId?: TimeVisualId;
    rakaatCount?: number;
    sajdahCount?: number;
    recitationMode?: 'جهرية' | 'سرية' | 'جهرية في أول ركعتين';
    prayerName?: string;
  };
}

// 10 varied interactive activity types
export type ActivityConfig =
  | {
      id: string;
      type: 'image_select';
      title: string;
      instruction: string;
      speaker: 'adam' | 'noor';
      options: {
        id: string;
        label: string;
        visual: string;
        isCorrect: boolean;
      }[];
      hint: string;
      successMessage: string;
    }
  | {
      id: string;
      type: 'matching';
      title: string;
      instruction: string;
      speaker: 'adam' | 'noor';
      pairs: {
        id: string;
        leftLabel: string;
        leftVisual?: string;
        rightLabel: string;
      }[];
      hint: string;
      successMessage: string;
    }
  | {
      id: string;
      type: 'ordering';
      title: string;
      instruction: string;
      speaker: 'adam' | 'noor';
      items: {
        id: string;
        label: string;
        sublabel?: string;
        correctIndex: number;
      }[];
      hint: string;
      successMessage: string;
    }
  | {
      id: string;
      type: 'hotspot_discovery';
      title: string;
      instruction: string;
      speaker: 'adam' | 'noor';
      scene: 'prayer_prep' | 'wudu_body';
      hotspots: {
        id: string;
        title: string;
        description: string;
        rulingTag?: 'فرض' | 'سنة' | 'شرط';
        xPercent: number;
        yPercent: number;
      }[];
      successMessage: string;
    }
  | {
      id: string;
      type: 'true_false_multi';
      title: string;
      instruction: string;
      speaker: 'adam' | 'noor';
      statements: {
        id: string;
        text: string;
        isTrue: boolean;
        explanation: string;
      }[];
      successMessage: string;
    }
  | {
      id: string;
      type: 'wudu_simulator';
      title: string;
      instruction: string;
      speaker: 'adam' | 'noor';
      successMessage: string;
    }
  | {
      id: string;
      type: 'spot_error';
      title: string;
      instruction: string;
      speaker: 'adam' | 'noor';
      scenarioTitle: string;
      steps: {
        id: string;
        label: string;
        sublabel?: string;
        isError: boolean;
        correction: string;
      }[];
      hint: string;
      successMessage: string;
    }
  | {
      id: string;
      type: 'memory_cards';
      title: string;
      instruction: string;
      speaker: 'adam' | 'noor';
      cards: {
        pairId: string;
        text: string;
        role: 'a' | 'b';
      }[];
      successMessage: string;
    }
  | {
      id: string;
      type: 'prayer_builder';
      title: string;
      instruction: string;
      speaker: 'adam' | 'noor';
      prayerId: TimeVisualId;
      prayerName: string;
      targetRakaat: number;
      targetSajdahs: number;
      isLoudFirstTwo: boolean;
      successMessage: string;
    }
  | {
      id: string;
      type: 'treasure_lock';
      title: string;
      instruction: string;
      speaker: 'adam' | 'noor';
      dials: {
        id: string;
        label: string;
        options: string[];
        correctOption: string;
      }[];
      hint: string;
      successMessage: string;
    };

export type QuizQuestion =
  | {
      id: string;
      kind: 'mcq';
      prompt: string;
      options: string[];
      correctIndex: number;
      hint: string;
      explanation: string;
    }
  | {
      id: string;
      kind: 'true_false';
      prompt: string;
      correctAnswer: boolean;
      hint: string;
      explanation: string;
    }
  | {
      id: string;
      kind: 'image_choice';
      prompt: string;
      options: { id: string; label: string; visual: string; isCorrect: boolean }[];
      hint: string;
      explanation: string;
    }
  | {
      id: string;
      kind: 'order_mini';
      prompt: string;
      items: { id: string; label: string; correctIndex: number }[];
      hint: string;
      explanation: string;
    }
  | {
      id: string;
      kind: 'match_mini';
      prompt: string;
      pairs: { id: string; left: string; right: string }[];
      hint: string;
      explanation: string;
    };

export interface BadgeInfo {
  id: string;
  levelId: number;
  title: string;
  subtitle: string;
  colorClass: string;
  accentHex: string;
}

export interface LevelDefinition {
  id: number;
  title: string;
  subtitle: string;
  themeColor: 'emerald' | 'sky' | 'amber' | 'violet';
  badge: BadgeInfo;
  introDialogue: DialogueLine[];
  lessons: LessonCard[];
  activities: ActivityConfig[];
  quiz: QuizQuestion[];
}

export interface PlayerProgress {
  unlockedLevel: number; // 1..7
  completedLevels: number[];
  points: number;
  stars: number;
  earnedBadges: string[];
  levelScores: Record<number, number>;
}
