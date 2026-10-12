import { ALL_LESSONS } from '../../_components/learn/learn-data';
import { ALL_TIPS } from '../../_components/tips/tips-data';
import { ALL_PRACTICES } from '../../_components/practice/practice-data';

export type ContentType = 'lesson' | 'tip' | 'practice';

export type ContentStatus = 'draft' | 'published' | 'archived';

export type AdminContent = {
  id: string;
  sourceId: string;
  type: ContentType;
  title: string;
  kmTitle: string;
  description: string;
  kmDescription: string;
  category: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate';
  image: string;
  status: ContentStatus;
};

const lessons: AdminContent[] = ALL_LESSONS.map((lesson) => ({
  id: `lesson:${lesson.id}`,
  sourceId: lesson.id,
  type: 'lesson',
  title: lesson.title,
  kmTitle: lesson.kmTitle ?? '',
  description: lesson.description,
  kmDescription: lesson.kmDescription ?? '',
  category: lesson.category,
  duration: lesson.duration,
  difficulty: lesson.difficulty,
  image: lesson.image,
  status: lesson.isAvailable ? 'published' : 'draft',
}));

const tips: AdminContent[] = ALL_TIPS.map((tip) => ({
  id: `tip:${tip.id}`,
  sourceId: tip.id,
  type: 'tip',
  title: tip.title,
  kmTitle: tip.kmTitle,
  description: tip.introduction,
  kmDescription: tip.kmIntroduction,
  category: tip.category,
  duration: tip.duration,
  difficulty: tip.difficulty,
  image: tip.image,
  status: tip.isAvailable ? 'published' : 'draft',
}));

const practices: AdminContent[] = ALL_PRACTICES.map((practice) => ({
  id: `practice:${practice.id}`,
  sourceId: practice.id,
  type: 'practice',
  title: practice.title,
  kmTitle: practice.kmTitle ?? '',
  description: practice.description,
  kmDescription: practice.kmDescription ?? '',
  category: practice.category,
  duration: practice.duration,
  difficulty: practice.difficulty,
  image: practice.image,
  status: practice.isAvailable ? 'published' : 'draft',
}));

export const initialContent: AdminContent[] = [
  ...lessons,
  ...tips,
  ...practices,
];
