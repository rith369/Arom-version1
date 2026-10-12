import {
  ALL_LESSONS,
  type Lesson,
  type TopicCategory,
} from '../../_components/learn/learn-data';
import {
  ALL_PRACTICES,
  type PracticeCategory,
  type PracticeItem,
} from '../../_components/practice/practice-data';
import {
  ALL_TIPS,
  type TipCategory,
  type TipItem,
} from '../../_components/tips/tips-data';

import type { ContentBody } from './content';

// Used when a new item has no image yet, so the real screens still render.
const FALLBACK_IMAGE = '/mindguide/stress.png';

// Turns an editor body into the exact objects the user screens take, so the
// preview is drawn by the same components users see. Fields the editor does
// not cover yet (subtitle, outcomes, hero image) come from the seed item.
export function toPreviewLesson(body: Extract<ContentBody, { type: 'lesson' }>): Lesson {
  const base = ALL_LESSONS.find((item) => item.id === body.details.sourceId);
  const { meta, details } = body;

  return {
    subtitle: '',
    format: 'Lesson',
    isAvailable: true,
    outcomes: [],
    ...base,
    id: details.sourceId,
    title: meta.title,
    kmTitle: meta.kmTitle,
    description: meta.description,
    kmDescription: meta.kmDescription,
    category: meta.category as TopicCategory,
    duration: meta.duration,
    difficulty: meta.difficulty,
    image: meta.image || base?.image || FALLBACK_IMAGE,
    sections: details.sections,
    references: details.references,
    totalSections: details.sections.length,
  };
}

export function toPreviewTip(body: Extract<ContentBody, { type: 'tip' }>): TipItem {
  const base = ALL_TIPS.find((item) => item.id === body.details.sourceId);
  const { meta, details } = body;

  return {
    subtitle: '',
    kmSubtitle: '',
    kmDuration: meta.duration,
    kmDifficulty: meta.difficulty,
    format: 'Tips',
    kmFormat: 'គន្លឹះ',
    isAvailable: true,
    ...base,
    id: details.sourceId,
    title: meta.title,
    kmTitle: meta.kmTitle,
    introduction: meta.description,
    kmIntroduction: meta.kmDescription,
    category: meta.category as TipCategory,
    duration: meta.duration,
    difficulty: meta.difficulty,
    image: meta.image || base?.image || FALLBACK_IMAGE,
    sourceCitation: details.sourceCitation,
    kmSourceCitation: details.kmSourceCitation,
    steps: details.steps.map((step) => ({
      number: step.number,
      title: step.title,
      kmTitle: step.kmTitle,
      body: step.body,
      kmBody: step.kmBody,
      tryNow: step.tryNow,
      kmTryNow: step.kmTryNow,
      hasBreathingAction: step.hasBreathingAction,
    })),
    supportCallout: details.supportCallout,
  };
}

export function toPreviewPractice(
  body: Extract<ContentBody, { type: 'practice' }>,
): PracticeItem {
  const base = ALL_PRACTICES.find((item) => item.id === body.details.sourceId);
  const { meta, details } = body;

  return {
    subtitle: '',
    format: 'Practice',
    isAvailable: true,
    outcomes: [],
    ...base,
    id: details.sourceId,
    title: meta.title,
    kmTitle: meta.kmTitle,
    description: meta.description,
    kmDescription: meta.kmDescription,
    category: meta.category as PracticeCategory,
    duration: meta.duration,
    difficulty: meta.difficulty,
    image: meta.image || base?.image || FALLBACK_IMAGE,
  };
}
