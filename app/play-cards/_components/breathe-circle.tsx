"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Play } from "lucide-react";
import { MoodSprout } from "../../_components/mood/mood-sprout";

// Three slow breaths: in for 4 seconds, out for 6.
const IN = 4;
const OUT = 6;
const BREATHS = 3;

/** A circle that grows as everyone breathes in and shrinks as they breathe out. */
export function BreatheCircle({ km, light }: { km: boolean; light: boolean }) {
  const reduce = useReducedMotion();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [second, setSecond] = useState(0);

  useEffect(() => {
    if (startedAt === null) return;
    const timer = window.setInterval(() => setSecond(Math.floor((Date.now() - startedAt) / 1000)), 250);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  const total = (IN + OUT) * BREATHS;
  const done = startedAt !== null && second >= total;
  const inCycle = second % (IN + OUT);
  const breathingIn = inCycle < IN;
  const breath = Math.min(BREATHS, Math.floor(second / (IN + OUT)) + 1);

  const ring = light ? "bg-white/25 ring-white/40" : "bg-white/55 ring-white/70";
  const text = light ? "text-white" : "text-current";

  if (startedAt === null || done) {
    return (
      <button
        type="button"
        onClick={() => {
          setSecond(0);
          setStartedAt(Date.now());
        }}
        className={`mx-auto mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold shadow-sm ring-1 ${ring} ${text}`}
      >
        <Play size={15} aria-hidden="true" />
        {done ? (km ? "ធ្វើម្តងទៀត" : "Breathe again") : km ? "ចាប់ផ្តើមដកដង្ហើម" : "Start breathing"}
      </button>
    );
  }

  return (
    <div className="mt-4 flex flex-col items-center">
      <motion.div
        className={`flex size-28 items-center justify-center rounded-full ring-1 ${ring}`}
        initial={{ scale: 0.7 }}
        animate={reduce ? { scale: 0.85 } : { scale: [0.7, 1, 1, 0.7] }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: IN + OUT, times: [0, IN / (IN + OUT), IN / (IN + OUT) + 0.02, 1], ease: "easeInOut", repeat: BREATHS - 1 }
        }
      >
        <MoodSprout mood="okay" className="h-14 w-auto" />
      </motion.div>
      <p role="status" aria-live="polite" className={`mt-3 text-sm font-semibold ${text}`}>
        {breathingIn ? (km ? "ដកដង្ហើមចូល..." : "Breathe in...") : km ? "ដកដង្ហើមចេញ..." : "Breathe out..."}
        <span className="ml-2 font-normal opacity-70">
          {breath}/{BREATHS}
        </span>
      </p>
    </div>
  );
}
