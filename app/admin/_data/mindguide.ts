// Tabs of the admin MindGuide page. Kept outside the client component so the
// server page can read them to open the tab named in `?tab=`.
export const MINDGUIDE_TABS = ['lesson', 'tip', 'practice', 'podcast'] as const;
export type MindGuideTab = (typeof MINDGUIDE_TABS)[number];

export function parseMindGuideTab(value: string | string[] | undefined): MindGuideTab {
  const tab = Array.isArray(value) ? value[0] : value;
  return MINDGUIDE_TABS.find((item) => item === tab) ?? 'lesson';
}
