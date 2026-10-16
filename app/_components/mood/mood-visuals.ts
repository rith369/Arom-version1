import type { MoodLevel } from '@/lib/mood';

// How each mood looks, shared by the Home check in, the journal and the
// Progress pages. Drawn with <MoodSprout> (mood-sprout.tsx).

// The AROM sprout for each mood (Figma Homescreen): WebP files in
// public/home, 168px wide, with their real heights.
export const MOOD_SPROUTS: Record<MoodLevel, { src: string; height: number }> = {
  very_low: { src: '/home/mood-very-low.webp', height: 189 },
  low: { src: '/home/mood-low.webp', height: 154 },
  okay: { src: '/home/mood-okay.webp', height: 153 },
  good: { src: '/home/mood-good.webp', height: 153 },
  great: { src: '/home/mood-great.webp', height: 150 },
};

// Calm tones for the charts, from soft rose (very low) to AROM green (great).
export const MOOD_COLORS: Record<MoodLevel, string> = {
  very_low: '#e4898c',
  low: '#efb47e',
  okay: '#b7cbc4',
  good: '#6cc3a0',
  great: '#1f6f5b',
};
