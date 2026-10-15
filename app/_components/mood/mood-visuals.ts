import type { MoodLevel } from '@/lib/mood';

// How each mood looks, shared by the Home check in and the Progress pages.
// Icons are files in public/figma/icons (drawn with FigmaIcon).

export const MOOD_ICONS: Record<MoodLevel, string> = {
  very_low: 'boxicons_tired',
  low: 'akar-icons_face-sad',
  okay: 'teenyicons_mood-flat-outline',
  good: 'ic_outline-mood',
  great: 'boxicons_happy-beaming',
};

// Calm tones for the charts, from soft rose (very low) to AROM green (great).
export const MOOD_COLORS: Record<MoodLevel, string> = {
  very_low: '#e4898c',
  low: '#efb47e',
  okay: '#b7cbc4',
  good: '#6cc3a0',
  great: '#1f6f5b',
};
