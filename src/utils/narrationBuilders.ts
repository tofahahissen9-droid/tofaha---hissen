import {
  ActivityConfig,
  LessonCard,
  LevelDefinition,
  QuizQuestion,
} from '../types/game';
import { SpeechSegment } from './audioEngine';

export function buildLessonSegments(lesson: LessonCard): SpeechSegment[] {
  const speakerLabel = lesson.speaker === 'adam' ? 'آدم:' : 'نور:';
  const parts: string[] = [
    `${speakerLabel} ${lesson.dialogue}`,
    `${lesson.title}${lesson.badgeTag ? `. ${lesson.badgeTag}` : ''}.`,
  ];

  if (lesson.visualType === 'wudu_fard_sunnah') {
    parts.push(
      'فروض الوضوء (٦ أركان أساسية): النية، غسل الوجه، غسل اليدين للمرفقين، مسح الرأس، غسل الرجلين للكعبين، الترتيب. سنن الوضوء (تزيد الأجر والمحبة): التسمية، غسل الكفين، المضمضة، الاستنشاق والاستنثار، الغسل ٣ مرات، مسح الأذنين، البدء باليمين.'
    );
  } else if (lesson.visualType === 'five_prayers') {
    parts.push(
      'الفجر: ٢ ركعة، ٤ سجدات، جهرية. الظهر: ٤ ركعات، ٨ سجدات، سرية. العصر: ٤ ركعات، ٨ سجدات، سرية. المغرب: ٣ ركعات، ٦ سجدات، جهرية بأول ٢. العشاء: ٤ ركعات، ٨ سجدات، جهرية بأول ٢.'
    );
  } else if (lesson.visualType === 'prayer_times') {
    parts.push('الفجر، الظهر، العصر، المغرب، العشاء.');
  } else if (lesson.visualType === 'rakaat_summary' && lesson.visualData) {
    parts.push(
      `الركعات: ${lesson.visualData.rakaatCount}. إجمالي السجدات: ${lesson.visualData.sajdahCount}. القراءة: ${lesson.visualData.recitationMode}.`
    );
  } else if (
    lesson.visualType === 'prayer_meaning' ||
    lesson.visualType === 'prayer_prep'
  ) {
    parts.push('الصلاة نور وقرب من الله.');
  }

  if (lesson.keyPoints.length > 0) {
    parts.push(lesson.keyPoints.join(' ... '));
  }

  if (lesson.quranOrDhikr) {
    parts.push(
      `${lesson.quranOrDhikr.label}: ${lesson.quranOrDhikr.arabicText}.`
    );
  }

  return [
    {
      speaker: 'noor',
      text: parts.join(' '),
    },
  ];
}

export function buildLevelIntroSegments(level: LevelDefinition): SpeechSegment[] {
  const parts: string[] = [
    `المحطة ${level.id}: ${level.title}. المحطة ${level.id} من ٧. ${level.title}. ${level.subtitle}.`,
  ];

  for (const line of level.introDialogue) {
    const label = line.speaker === 'adam' ? 'آدم:' : 'نور:';
    parts.push(`${label} ${line.text}`);
  }

  parts.push('هيا نبدأ الدرس الأول!');

  return [
    {
      speaker: 'noor',
      text: parts.join(' '),
    },
  ];
}

export function buildActivitySegments(
  activity: ActivityConfig,
  dynamicVisibleText?: string,
  completed?: boolean
): SpeechSegment[] {
  const parts: string[] = [`${activity.title}. ${activity.instruction}.`];

  if (dynamicVisibleText && dynamicVisibleText.trim()) {
    parts.push(dynamicVisibleText.trim());
  } else {
    switch (activity.type) {
      case 'image_select':
        parts.push(activity.options.map((o) => o.label).join(' ... '));
        break;
      case 'matching':
        parts.push(
          `${activity.pairs.map((p) => p.leftLabel).join('، ')}. ${activity.pairs.map((p) => p.rightLabel).join('، ')}.`
        );
        break;
      case 'ordering':
        parts.push(
          `${activity.items.map((i) => (i.sublabel ? `${i.label} (${i.sublabel})` : i.label)).join(' ... ')}. تأكيد الترتيب.`
        );
        break;
      case 'hotspot_discovery':
        parts.push(
          'اضغط على الدوائر المرقّمة على الصورة لاكتشاف كل معلومة!'
        );
        break;
      case 'true_false_multi':
        if (activity.statements[0]) {
          parts.push(
            `العبارة ١ من ${activity.statements.length}: ${activity.statements[0].text}. صح. خطأ.`
          );
        }
        break;
      case 'wudu_simulator':
        parts.push('محاكاة واحة الوضوء. الخطوة ١ من ١١.');
        break;
      case 'spot_error':
        parts.push(
          `${activity.scenarioTitle}. ${activity.steps.map((s) => s.label).join(' ... ')}.`
        );
        break;
      case 'memory_cards':
        parts.push(
          `الأزواج المكتشفة: ٠ / ${activity.cards.length / 2}. إعادة خلط.`
        );
        break;
      case 'prayer_builder':
        parts.push(
          `الركعة ١ / ${activity.targetRakaat}. إجمالي السجدات ٠ / ${activity.targetSajdahs}. ${activity.prayerName}. ابدأ ${activity.prayerName} بتكبيرة الإحرام. نستقبل القبلة، نرفع اليدين حذو المنكبين ونقول: اللَّهُ أَكْبَرُ. كبّر للدخول في الصلاة.`
        );
        break;
      case 'treasure_lock':
        parts.push(
          `أقفال الكنز الذهبية. اختر الإجابة الصحيحة لكل قفل ثم اضغط فتح. ${activity.dials.map((d) => `${d.label}: ${d.options.join('، ')}`).join('. ')}. افتح القفل الذهبي.`
        );
        break;
    }
  }

  if (completed) {
    parts.push(activity.successMessage);
  }

  return [
    {
      speaker: 'noor',
      text: parts.join(' '),
    },
  ];
}

export function buildQuizQuestionSegments(
  q: QuizQuestion,
  qIndex: number,
  total: number,
  score?: number,
  answered?: boolean,
  wasCorrect?: boolean
): SpeechSegment[] {
  const parts: string[] = [`السؤال ${qIndex + 1} من ${total}.`];

  if (score !== undefined) {
    parts.push(`النقاط الصحيحة: ${score}.`);
  }

  parts.push(q.prompt);

  if (q.kind === 'mcq') {
    parts.push(q.options.join(' ... '));
  } else if (q.kind === 'true_false') {
    parts.push('صح. خطأ.');
  } else if (q.kind === 'image_choice') {
    parts.push(q.options.map((o) => o.label).join(' ... '));
  } else if (q.kind === 'order_mini') {
    parts.push(
      `${q.items.map((i) => i.label).join(' ... ')}. تأكيد الإجابة.`
    );
  } else if (q.kind === 'match_mini') {
    const rightOptions = [...q.pairs]
      .map((p) => p.right)
      .sort((a, b) => a.localeCompare(b, 'ar'));
    parts.push(
      `${q.pairs.map((p) => p.left).join(' ... ')}. الاختيارات المطابقة: ${rightOptions.join('، ')}. تأكيد التوصيل.`
    );
  }

  if (answered) {
    parts.push(
      `${wasCorrect ? 'إجابة صحيحة! أحسنت يا بطل!' : 'توضيح مهم:'} ${q.explanation}. ${
        qIndex + 1 < total ? 'السؤال التالي.' : 'عرض النتيجة والشارة.'
      }`
    );
  }

  return [
    {
      speaker: 'noor',
      text: parts.join(' '),
    },
  ];
}
