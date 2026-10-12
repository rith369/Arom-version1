import type { ContentBody, ContentMeta } from './content';

// Plain language list of what will change for users, shown before Publish.
export function summarizeChanges(
  from: ContentBody | null,
  to: ContentBody,
  km: boolean,
): string[] {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  if (!from) return [t('ការផ្សព្វផ្សាយលើកដំបូង', 'First time this goes live')];

  const changes: string[] = [];
  const metaLabels: Record<keyof ContentMeta, string> = {
    title: t('ចំណងជើង (English)', 'Title (English)'),
    kmTitle: t('ចំណងជើង (ខ្មែរ)', 'Title (Khmer)'),
    description: t('ការពិពណ៌នា (English)', 'Description (English)'),
    kmDescription: t('ការពិពណ៌នា (ខ្មែរ)', 'Description (Khmer)'),
    category: t('ប្រភេទ', 'Category'),
    duration: t('រយៈពេល', 'Duration'),
    difficulty: t('កម្រិត', 'Difficulty'),
    image: t('រូបភាព', 'Image'),
  };

  for (const key of Object.keys(metaLabels) as (keyof ContentMeta)[]) {
    if (from.meta[key] !== to.meta[key]) changes.push(metaLabels[key]);
  }

  const compareList = <Item extends { id: string | number }>(
    before: Item[],
    after: Item[],
    label: string,
  ) => {
    const beforeById = new Map(before.map((item) => [item.id, item]));
    const afterIds = new Set(after.map((item) => item.id));
    const added = after.filter((item) => !beforeById.has(item.id)).length;
    const removed = before.filter((item) => !afterIds.has(item.id)).length;
    const edited = after.filter(
      (item) =>
        beforeById.has(item.id) &&
        JSON.stringify(beforeById.get(item.id)) !== JSON.stringify(item),
    ).length;
    const reordered =
      !added &&
      !removed &&
      before.map((item) => item.id).join() !== after.map((item) => item.id).join();

    if (added) changes.push(`${label}: ${added} ${t('បានបន្ថែម', 'added')}`);
    if (removed) changes.push(`${label}: ${removed} ${t('បានលុប', 'removed')}`);
    if (edited) changes.push(`${label}: ${edited} ${t('បានកែ', 'edited')}`);
    if (reordered) changes.push(`${label}: ${t('ប្តូរលំដាប់', 'new order')}`);
  };

  if (from.type === 'lesson' && to.type === 'lesson') {
    compareList(
      // Positions are compared separately as "new order", so ignore the number here.
      from.details.sections.map((section) => ({ ...section, sectionNumber: 0 })),
      to.details.sections.map((section) => ({ ...section, sectionNumber: 0 })),
      t('ផ្នែក', 'Sections'),
    );
    compareList(from.details.references, to.details.references, t('ឯកសារយោង', 'References'));
  }

  if (from.type === 'tip' && to.type === 'tip') {
    compareList(
      from.details.steps.map((step) => ({ ...step, number: 0 })),
      to.details.steps.map((step) => ({ ...step, number: 0 })),
      t('ជំហាន', 'Steps'),
    );
    if (
      from.details.sourceCitation !== to.details.sourceCitation ||
      from.details.kmSourceCitation !== to.details.kmSourceCitation
    ) {
      changes.push(t('ប្រភពយោង', 'Source citation'));
    }
    if (JSON.stringify(from.details.supportCallout) !== JSON.stringify(to.details.supportCallout)) {
      changes.push(t('ប្រអប់ជំនួយ', 'Support box'));
    }
  }

  if (from.type === 'practice' && to.type === 'practice') {
    compareList(from.details.instructions, to.details.instructions, t('ជំហាន', 'Instructions'));
    if (JSON.stringify(from.details.breathing) !== JSON.stringify(to.details.breathing)) {
      changes.push(t('ការកំណត់ដកដង្ហើម', 'Breathing settings'));
    }
  }

  return changes.length ? changes : [t('គ្មានការផ្លាស់ប្តូរ', 'No changes from the live version')];
}
