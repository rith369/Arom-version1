"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { MoodSprout } from "../../_components/mood/mood-sprout";
import { PLAYER_COLORS, initialOf } from "./theme";

// One slow spin: fast at first, then gently easing to a stop.
export const SPIN_SECONDS = 3.4;
const SPIN_EASE = [0.12, 0.8, 0.2, 1] as const;

/** Where the leaf should stop to point at player `index`, after a few full turns. */
export function spinTarget(current: number, index: number, count: number, reduce: boolean) {
  const slice = 360 / count;
  // Somewhere inside the middle of that player's slice, not always the exact center.
  const aim = index * slice + (Math.random() - 0.5) * slice * 0.5;
  const delta = (((aim - current) % 360) + 360) % 360;
  return current + delta + (reduce ? 0 : 360 * 5);
}

/** Everyone once before anyone twice, and never the same person twice in a row. */
export function fairPick(queue: number[], last: number | null, count: number) {
  const round = queue.length ? queue : Array.from({ length: count }, (_, index) => index);
  const pool = round.filter((index) => index !== last);
  const choices = pool.length ? pool : round;
  const pick = choices[Math.floor(Math.random() * choices.length)];
  return { pick, queue: round.filter((index) => index !== pick) };
}

/** A big friendly leaf that points at the chosen player. */
function LeafPointer() {
  const gradient = useId();
  return (
    <svg viewBox="0 0 60 120" className="h-full w-auto overflow-visible drop-shadow-[3px_3px_0_#14221f]" aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9BE36D" />
          <stop offset="100%" stopColor="#2FA584" />
        </linearGradient>
      </defs>
      <path d="M30 3 C 53 30, 55 72, 30 117 C 5 72, 7 30, 30 3 Z" fill={`url(#${gradient})`} stroke="#14221f" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M30 14 L30 110" stroke="#14221f" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M30 40 C 38 36, 42 33, 44 30 M30 60 C 39 56, 44 52, 46 48 M30 40 C 22 36, 18 33, 16 30 M30 60 C 21 56, 16 52, 14 48" stroke="#14221f" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      <ellipse cx="22" cy="34" rx="4" ry="9" fill="#ffffff" opacity="0.45" transform="rotate(-18 22 34)" />
    </svg>
  );
}

export function SpinWheel({
  names,
  rotation,
  picked,
  landed,
  onLanded,
}: {
  names: string[];
  rotation: number;
  // The player the leaf is heading to (null before the first spin).
  picked: number | null;
  // True once the leaf has stopped on `picked`.
  landed: boolean;
  onLanded: () => void;
}) {
  const reduce = useReducedMotion();
  const count = names.length;
  const slice = 360 / count;
  // A soft tint of each player's color, one slice each, the first centered at the top.
  const stops = names
    .map((_, index) => `${PLAYER_COLORS[index % PLAYER_COLORS.length]}40 ${index * slice}deg ${(index + 1) * slice}deg`)
    .join(", ");

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[21rem]">
      <div
        className="absolute inset-0 rounded-full border-[3px] border-[#14221f] bg-[#FFF6E5] shadow-[6px_6px_0_0_#14221f]"
        style={{ backgroundImage: `conic-gradient(from ${-slice / 2}deg, ${stops})` }}
      />
      <div aria-hidden="true" className="absolute inset-[14%] rounded-full border-2 border-dashed border-[#14221f]/20" />

      {/* Upright name chips around the edge */}
      {names.map((name, index) => {
        const angle = (index * slice * Math.PI) / 180;
        const isPicked = landed && picked === index;
        return (
          <motion.span
            key={`${name}-${index}`}
            className={`absolute z-10 inline-flex max-w-[7rem] -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border-2 border-[#14221f] py-0.5 pl-0.5 pr-2 text-xs font-black text-[#14221f] ${
              isPicked ? "bg-[#FFD23F] shadow-[3px_3px_0_0_#14221f]" : "bg-white"
            }`}
            style={{ left: `${50 + Math.sin(angle) * 37}%`, top: `${50 - Math.cos(angle) * 37}%` }}
            animate={isPicked && !reduce ? { scale: [1, 1.25, 1.12] } : { scale: 1 }}
            transition={{ duration: 0.45 }}
          >
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-[#14221f] text-[10px] text-white"
              style={{ backgroundColor: PLAYER_COLORS[index % PLAYER_COLORS.length] }}
            >
              {initialOf(name)}
            </span>
            <span className="truncate">{name}</span>
          </motion.span>
        );
      })}

      {/* The leaf turns; the sprout in the middle stays upright */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ rotate: rotation }}
        transition={reduce ? { duration: 0 } : { duration: SPIN_SECONDS, ease: SPIN_EASE }}
        onAnimationComplete={() => {
          if (picked !== null && !landed) onLanded();
        }}
      >
        <span className="absolute bottom-1/2 left-1/2 h-[40%] -translate-x-1/2">
          <LeafPointer />
        </span>
      </motion.div>
      <span className="absolute left-1/2 top-1/2 z-20 flex size-[30%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-[#14221f] bg-white shadow-[3px_3px_0_0_#14221f]">
        <MoodSprout mood="great" className="h-[72%] w-auto" />
      </span>
    </div>
  );
}
