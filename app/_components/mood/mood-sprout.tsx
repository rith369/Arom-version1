import Image from 'next/image';
import type { MoodLevel } from '@/lib/mood';
import { MOOD_SPROUTS } from './mood-visuals';

/**
 * The AROM sprout for a mood. Decorative: the mood's name is always shown or
 * read next to it. Set the height with `className` (for example "h-7 w-auto").
 */
export function MoodSprout({ mood, className = '' }: { mood: MoodLevel; className?: string }) {
  const sprout = MOOD_SPROUTS[mood];
  return (
    <Image
      src={sprout.src}
      alt=""
      width={168}
      height={sprout.height}
      sizes="72px"
      draggable={false}
      className={`select-none object-contain ${className}`}
    />
  );
}
