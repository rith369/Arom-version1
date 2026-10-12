import { ALL_LESSONS } from '../../_components/learn/learn-data';
import { ALL_TIPS } from '../../_components/tips/tips-data';
import { ALL_PRACTICES } from '../../_components/practice/practice-data';

import {
  initialLessonDetails,
  type AdminLessonDetails,
} from './lesson-details';
import { initialTipDetails, type AdminTipDetails } from './tip-details';
import {
  initialPracticeDetails,
  type AdminPracticeDetails,
} from './practice-details';

export type ContentType = 'lesson' | 'tip' | 'practice';

// Basic information shown on cards and lists. The layout comes from fixed
// user screens, so admins only ever edit text and numbers here.
export type ContentMeta = {
  title: string;
  kmTitle: string;
  description: string;
  kmDescription: string;
  category: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate';
  image: string;
};

export type ContentBody =
  | { type: 'lesson'; meta: ContentMeta; details: AdminLessonDetails }
  | { type: 'tip'; meta: ContentMeta; details: AdminTipDetails }
  | { type: 'practice'; meta: ContentMeta; details: AdminPracticeDetails };

// A published version is never changed. Old versions are kept for history.
export type ContentVersion = {
  version: number;
  body: ContentBody;
  publishedAt: string;
  publishedBy: string;
};

// At most one draft per item. updatedAt is the "no overwrite" token.
export type ContentDraft = {
  body: ContentBody;
  baseVersion: number | null;
  updatedAt: string;
  updatedBy: string;
};

export type ContentRecord = {
  id: string;
  sourceId: string;
  type: ContentType;
  // null means users cannot see it (never published, or hidden).
  liveVersion: number | null;
  versions: ContentVersion[];
  draft: ContentDraft | null;
};

export type PublishState = 'live' | 'liveDraft' | 'notPublished' | 'hidden';

export function getLiveBody(record: ContentRecord) {
  const latest = record.versions.at(-1);
  const live = record.versions.find((item) => item.version === record.liveVersion);

  return (live ?? latest)?.body ?? null;
}

// What the editor starts from: the draft if there is one, otherwise the last version.
export function getWorkingBody(record: ContentRecord): ContentBody {
  return record.draft?.body ?? getLiveBody(record) ?? emptyBody(record.type, record.sourceId);
}

export function getPublishState(record: ContentRecord): PublishState {
  if (record.liveVersion === null) {
    return record.versions.length ? 'hidden' : 'notPublished';
  }

  return record.draft ? 'liveDraft' : 'live';
}

export function emptyMeta(): ContentMeta {
  return {
    title: '',
    kmTitle: '',
    description: '',
    kmDescription: '',
    category: '',
    duration: '',
    difficulty: 'Beginner',
    image: '',
  };
}

export function emptyBody(type: ContentType, sourceId: string): ContentBody {
  const meta = emptyMeta();

  if (type === 'lesson') {
    return { type, meta, details: { sourceId, sections: [], references: [] } };
  }

  if (type === 'tip') {
    return {
      type,
      meta,
      details: {
        sourceId,
        sourceCitation: '',
        kmSourceCitation: '',
        steps: [],
        supportCallout: {
          title: '',
          kmTitle: '',
          body: '',
          kmBody: '',
          actionLabel: '',
          kmActionLabel: '',
        },
      },
    };
  }

  return {
    type,
    meta,
    details: {
      sourceId,
      instructions: [],
      breathing: {
        enabled: false,
        inhaleSeconds: 4,
        holdSeconds: 0,
        exhaleSeconds: 4,
        cycles: 5,
      },
    },
  };
}

// Seed content was written for the app by the team with Claude. Items that
// were already available to users start as version 1; the rest start as drafts.
const SEED_AUTHOR = 'AROM team';
const SEED_DATE = '2026-10-01T02:00:00Z';

function seedRecord(
  type: ContentType,
  sourceId: string,
  isAvailable: boolean,
  body: ContentBody,
): ContentRecord {
  return {
    id: `${type}:${sourceId}`,
    sourceId,
    type,
    liveVersion: isAvailable ? 1 : null,
    versions: isAvailable
      ? [{ version: 1, body, publishedAt: SEED_DATE, publishedBy: SEED_AUTHOR }]
      : [],
    draft: isAvailable
      ? null
      : { body, baseVersion: null, updatedAt: SEED_DATE, updatedBy: SEED_AUTHOR },
  };
}

const lessons = ALL_LESSONS.map((lesson) =>
  seedRecord('lesson', lesson.id, lesson.isAvailable, {
    type: 'lesson',
    meta: {
      title: lesson.title,
      kmTitle: lesson.kmTitle ?? '',
      description: lesson.description,
      kmDescription: lesson.kmDescription ?? '',
      category: lesson.category,
      duration: lesson.duration,
      difficulty: lesson.difficulty,
      image: lesson.image,
    },
    details:
      initialLessonDetails.find((item) => item.sourceId === lesson.id) ??
      { sourceId: lesson.id, sections: [], references: [] },
  }),
);

const tips = ALL_TIPS.map((tip) =>
  seedRecord('tip', tip.id, tip.isAvailable, {
    type: 'tip',
    meta: {
      title: tip.title,
      kmTitle: tip.kmTitle,
      description: tip.introduction,
      kmDescription: tip.kmIntroduction,
      category: tip.category,
      duration: tip.duration,
      difficulty: tip.difficulty,
      image: tip.image,
    },
    details: initialTipDetails.find((item) => item.sourceId === tip.id)!,
  }),
);

const practices = ALL_PRACTICES.map((practice) =>
  seedRecord('practice', practice.id, practice.isAvailable, {
    type: 'practice',
    meta: {
      title: practice.title,
      kmTitle: practice.kmTitle ?? '',
      description: practice.description,
      kmDescription: practice.kmDescription ?? '',
      category: practice.category,
      duration: practice.duration,
      difficulty: practice.difficulty,
      image: practice.image,
    },
    details: initialPracticeDetails.find((item) => item.sourceId === practice.id)!,
  }),
);

export const initialContentRecords: ContentRecord[] = [
  ...lessons,
  ...tips,
  ...practices,
];
