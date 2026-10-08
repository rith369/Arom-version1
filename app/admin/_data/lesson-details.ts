import {
  ALL_LESSONS,
  type LessonSection,
  type ReferenceItem,
} from '../../_components/learn/learn-data';

export type AdminLessonDetails = {
  sourceId: string;
  sections: LessonSection[];
  references: ReferenceItem[];
};

export const initialLessonDetails: AdminLessonDetails[] = ALL_LESSONS.map(
  (lesson) => ({
    sourceId: lesson.id,
    sections: structuredClone(lesson.sections),
    references: structuredClone(lesson.references),
  }),
);
