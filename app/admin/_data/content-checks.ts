import type { ContentBody } from './content';

// Field ids follow one pattern so a problem can scroll to its field:
// cf-meta-<key>, cf-section-<id>-<part>, cf-step-<id>-<part>,
// cf-instruction-<id>-<part>, cf-reference-<id>, plus list level ids.
export type ContentProblem = {
  fieldId: string;
  message: string;
  // Errors block Publish. Warnings are shown but do not block it.
  level: 'error' | 'warning';
};

const has = (value: string | undefined) => Boolean(value?.trim());

function isWebUrl(value: string) {
  try {
    const { protocol } = new URL(value.trim());
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

function isWholeNumberBetween(value: number, min: number, max: number) {
  return Number.isInteger(value) && value >= min && value <= max;
}

// Saving a draft only needs ids to be unique, so half finished work can be saved.
export function checkDraft(body: ContentBody): ContentProblem[] {
  const ids =
    body.type === 'lesson'
      ? body.details.sections.map((item) => String(item.id))
      : body.type === 'tip'
        ? body.details.steps.map((item) => item.id)
        : body.details.instructions.map((item) => item.id);

  return new Set(ids).size === ids.length
    ? []
    : [{ fieldId: 'cf-items', message: 'Two items share the same id.', level: 'error' }];
}

// The full check that must pass before anything reaches users.
export function checkForPublish(body: ContentBody, km: boolean): ContentProblem[] {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const problems: ContentProblem[] = [...checkDraft(body)];
  const error = (fieldId: string, message: string) =>
    problems.push({ fieldId, message, level: 'error' });
  const warning = (fieldId: string, message: string) =>
    problems.push({ fieldId, message, level: 'warning' });

  const { meta } = body;

  if (!has(meta.title)) error('cf-meta-title', t('ត្រូវការចំណងជើង (English)', 'Add a title in English'));
  if (!has(meta.kmTitle)) warning('cf-meta-kmTitle', t('មិនទាន់មានចំណងជើងជាភាសាខ្មែរ', 'Khmer title is missing'));
  if (!has(meta.description)) error('cf-meta-description', t('ត្រូវការការពិពណ៌នា (English)', 'Add a description in English'));
  if (!has(meta.kmDescription)) warning('cf-meta-kmDescription', t('មិនទាន់មានការពិពណ៌នាជាភាសាខ្មែរ', 'Khmer description is missing'));
  if (!has(meta.category)) error('cf-meta-category', t('ត្រូវការប្រភេទ', 'Add a category'));
  if (!has(meta.duration)) error('cf-meta-duration', t('ត្រូវការរយៈពេល', 'Add a duration, for example 5 min'));

  if (body.type === 'lesson') {
    const { sections, references } = body.details;

    if (!sections.length) error('cf-items', t('សូមបន្ថែមយ៉ាងហោចណាស់មួយផ្នែក', 'Add at least one section'));

    sections.forEach((section, index) => {
      const where = `${t('ផ្នែក', 'Section')} ${index + 1}`;
      const id = `cf-section-${section.id}`;

      if (!has(section.title)) error(`${id}-title`, `${where}: ${t('ត្រូវការចំណងជើង', 'needs a title')}`);
      if (!has(section.kmTitle)) warning(`${id}-kmTitle`, `${where}: ${t('មិនទាន់មានចំណងជើងខ្មែរ', 'Khmer title is missing')}`);

      if (section.type !== 'quiz' && !section.paragraphs.some(has)) {
        error(`${id}-paragraphs`, `${where}: ${t('ត្រូវការអត្ថបទយ៉ាងហោចណាស់មួយកថាខណ្ឌ', 'needs at least one paragraph')}`);
      }

      if (section.type === 'quiz') {
        const quiz = section.quiz;

        if (!quiz || !has(quiz.question)) {
          error(`${id}-quiz-question`, `${where}: ${t('ត្រូវការសំណួរ', 'needs a question')}`);
        }
        if (!quiz || quiz.options.length < 2 || quiz.options.some((option) => !has(option.text))) {
          error(`${id}-quiz-options`, `${where}: ${t('ត្រូវការចម្លើយយ៉ាងហោចណាស់ពីរ ហើយមិនទទេ', 'needs at least two answers, none empty')}`);
        }
        if (quiz && quiz.options.filter((option) => option.isCorrect).length !== 1) {
          error(`${id}-quiz-options`, `${where}: ${t('ត្រូវមានចម្លើយត្រឹមត្រូវតែមួយ', 'needs exactly one correct answer')}`);
        }
        if (!quiz || !has(quiz.explanation)) {
          error(`${id}-quiz-explanation`, `${where}: ${t('ត្រូវការការពន្យល់', 'needs an explanation')}`);
        }
      }
    });

    references.forEach((reference, index) => {
      const where = `${t('ឯកសារយោង', 'Reference')} ${index + 1}`;
      const id = `cf-reference-${reference.id}`;

      if (!has(reference.citation) || !has(reference.source) || !has(reference.title)) {
        error(id, `${where}: ${t('ត្រូវការស្លាក ប្រភព និងចំណងជើង', 'needs a label, source and title')}`);
      }
      if (has(reference.url) && !isWebUrl(reference.url!)) {
        error(id, `${where}: ${t('តំណត្រូវចាប់ផ្តើមដោយ https://', 'link must start with https://')}`);
      }
    });
  }

  if (body.type === 'tip') {
    const { steps, supportCallout } = body.details;

    if (!steps.length) error('cf-items', t('សូមបន្ថែមយ៉ាងហោចណាស់មួយជំហាន', 'Add at least one step'));

    steps.forEach((step, index) => {
      const where = `${t('ជំហាន', 'Step')} ${index + 1}`;
      const id = `cf-step-${step.id}`;

      if (!has(step.title)) error(`${id}-title`, `${where}: ${t('ត្រូវការចំណងជើង', 'needs a title')}`);
      if (!has(step.body)) error(`${id}-body`, `${where}: ${t('ត្រូវការការណែនាំ', 'needs instructions')}`);
      if (!has(step.tryNow)) error(`${id}-tryNow`, `${where}: ${t('ត្រូវការ "អនុវត្តឥឡូវ"', 'needs a "Try now" activity')}`);
      if (!has(step.kmTitle) || !has(step.kmBody)) {
        warning(`${id}-kmTitle`, `${where}: ${t('មិនទាន់មានអត្ថបទខ្មែរគ្រប់គ្រាន់', 'Khmer text is missing')}`);
      }
    });

    const callout = supportCallout;
    const used = Object.values(callout).some(has);

    if (used && (!has(callout.title) || !has(callout.body) || !has(callout.actionLabel))) {
      error('cf-callout', t('ប្រអប់ជំនួយ: បំពេញចំណងជើង សារ និងប៊ូតុង ឬទុកទទេទាំងអស់', 'Support box: fill in title, message and button, or leave it all empty'));
    }
  }

  if (body.type === 'practice') {
    const { instructions, breathing } = body.details;

    if (!instructions.length) error('cf-items', t('សូមបន្ថែមយ៉ាងហោចណាស់មួយជំហាន', 'Add at least one instruction'));

    instructions.forEach((item, index) => {
      const where = `${t('ជំហាន', 'Instruction')} ${index + 1}`;
      const id = `cf-instruction-${item.id}`;

      if (!has(item.title)) error(`${id}-title`, `${where}: ${t('ត្រូវការចំណងជើង', 'needs a title')}`);
      if (!has(item.body)) error(`${id}-body`, `${where}: ${t('ត្រូវការការណែនាំ', 'needs instructions')}`);
      if (!has(item.kmTitle) || !has(item.kmBody)) {
        warning(`${id}-kmTitle`, `${where}: ${t('មិនទាន់មានអត្ថបទខ្មែរគ្រប់គ្រាន់', 'Khmer text is missing')}`);
      }
    });

    if (
      breathing.enabled &&
      !(
        isWholeNumberBetween(breathing.inhaleSeconds, 1, 30) &&
        isWholeNumberBetween(breathing.holdSeconds, 0, 30) &&
        isWholeNumberBetween(breathing.exhaleSeconds, 1, 30) &&
        isWholeNumberBetween(breathing.cycles, 1, 100)
      )
    ) {
      error('cf-breathing', t('ការដកដង្ហើម: បញ្ចូលលេខគត់ក្នុងដែនកំណត់', 'Breathing: use whole numbers within the limits'));
    }
  }

  return problems;
}
