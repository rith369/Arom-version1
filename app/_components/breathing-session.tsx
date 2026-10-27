"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Pause, Play, RotateCcw, Square, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./language-provider";

const easeOut = [0.23, 1, 0.32, 1] as const;
const easeInOut = [0.77, 0, 0.175, 1] as const;
const secondsPerStep = 4;

const breathingSteps = [
  { phase: "inhale", en: "Inhale", km: "ដកដង្ហើមចូល", promptEn: "Breathe in slowly...", promptKm: "ដកដង្ហើមចូលយឺតៗ..." },
  { phase: "hold-full", en: "Hold", km: "ទប់ដង្ហើម", promptEn: "Hold gently...", promptKm: "ទប់ដង្ហើមថ្នមៗ..." },
  { phase: "exhale", en: "Exhale", km: "ដកដង្ហើមចេញ", promptEn: "Breathe out completely...", promptKm: "ដកដង្ហើមចេញឲ្យអស់..." },
  { phase: "hold-empty", en: "Rest", km: "សម្រាក", promptEn: "Pause and rest...", promptKm: "សម្រាកទប់..." },
  { phase: "inhale", en: "Inhale", km: "ដកដង្ហើមចូល", promptEn: "Breathe in slowly...", promptKm: "ដកដង្ហើមចូលយឺតៗ..." },
  { phase: "hold-full", en: "Hold", km: "ទប់ដង្ហើម", promptEn: "Hold gently...", promptKm: "ទប់ដង្ហើមថ្នមៗ..." },
  { phase: "exhale", en: "Exhale", km: "ដកដង្ហើមចេញ", promptEn: "Breathe out completely...", promptKm: "ដកដង្ហើមចេញឲ្យអស់..." },
  { phase: "hold-empty", en: "Rest", km: "សម្រាក", promptEn: "Pause and rest...", promptKm: "សម្រាកទប់..." },
] as const;

function playBreathChime(phase: string, soundOn: boolean) {
  if (!soundOn || typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const freq = phase === "inhale" ? 432 : phase === "exhale" ? 360 : 528;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // AudioContext might be restricted until user interaction
  }
}

function BreathingGuide({
  onExit,
  onComplete,
}: {
  onExit: () => void;
  onComplete: (cycles: number) => void;
}) {
  const { language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(secondsPerStep);
  const [cycleCount, setCycleCount] = useState(1);
  const [soundOn, setSoundOn] = useState(true);
  const km = language === "km";

  const safeStepIndex = Math.min(stepIndex, breathingSteps.length - 1);
  const step = breathingSteps[safeStepIndex];
  const lastPhaseRef = useRef<string>(step.phase);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) {
          return current - 1;
        }

        // Current step ended, progress to next step or loop back for continuous practice
        setStepIndex((currIndex) => {
          if (currIndex >= breathingSteps.length - 1) {
            // Completed 8 steps: loop continuously to step 0 and increment cycle count
            setCycleCount((c) => c + 1);
            return 0;
          }
          return currIndex + 1;
        });

        return secondsPerStep;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && step.phase !== lastPhaseRef.current) {
      lastPhaseRef.current = step.phase;
      playBreathChime(step.phase, soundOn);
    }
  }, [isPlaying, step.phase, soundOn]);

  const handleRestart = () => {
    setStepIndex(0);
    setSecondsLeft(secondsPerStep);
    setIsPlaying(true);
  };

  const handleTogglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleStop = () => {
    setIsPlaying(false);
    onComplete(cycleCount);
  };

  const isExpanded = step.phase === "inhale" || step.phase === "hold-full";
  const isMoving = isPlaying && (step.phase === "inhale" || step.phase === "exhale");
  const orbScale = shouldReduceMotion ? 1 : isExpanded ? 1.08 : 0.82;
  const progress = (safeStepIndex + (secondsPerStep - secondsLeft) / secondsPerStep) / breathingSteps.length;

  return (
    <main className="relative flex min-h-dvh overflow-hidden bg-[#0e4037] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(35,170,137,0.28),transparent_38%),linear-gradient(180deg,#0b322c_0%,#123f38_56%,#102f36_100%)]" />
      <Image
        src="/mindguide/managing-stress-hero.svg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-bottom opacity-[0.11] mix-blend-luminosity"
        unoptimized
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            aria-label={km ? "ចាកចេញពីការហាត់" : "Close breathing session"}
            className="flex size-11 items-center justify-center rounded-full text-white/85 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X aria-hidden="true" size={23} />
          </button>

          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#a3edd9]">
            {km ? `ជុំទី ${cycleCount}` : `Cycle ${cycleCount}`}
          </span>

          <button
            type="button"
            aria-pressed={soundOn}
            onClick={() => setSoundOn((current) => !current)}
            aria-label={soundOn ? (km ? "បិទសំឡេង" : "Mute cues") : km ? "បើកសំឡេង" : "Turn on cues"}
            className="flex size-11 items-center justify-center rounded-full text-white/85 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {soundOn ? <Volume2 aria-hidden="true" size={22} /> : <VolumeX aria-hidden="true" size={22} />}
          </button>
        </div>

        {/* Title & Guidance prompt */}
        <div className="mt-2 text-center">
          <h1 className="text-lg font-semibold tracking-[-0.02em]">{km ? "ដង្ហើមស្ងប់ស្ងាត់" : "Calm Breathing"}</h1>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={isPlaying ? `${stepIndex}-prompt` : "paused-prompt"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: easeOut }}
              aria-live="polite"
              className="mt-2 text-base font-medium text-[#7fe6cf]"
            >
              {isPlaying
                ? km
                  ? step.promptKm
                  : step.promptEn
                : km
                ? "បានផ្អាក • ចុចបន្តដើម្បីហាត់ទៀត"
                : "Paused • Tap Resume to continue"}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Lotus Orb breathing animation */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div className="relative flex size-[17rem] items-center justify-center sm:size-[19rem]">
            <motion.div
              aria-hidden="true"
              initial={{ transform: shouldReduceMotion ? "scale(1)" : "scale(0.82)" }}
              animate={{ opacity: isExpanded ? 0.2 : 0.1, transform: `scale(${orbScale})` }}
              transition={{
                duration: isMoving && !shouldReduceMotion ? secondsPerStep : 0.25,
                ease: isMoving ? easeInOut : easeOut,
              }}
              className="absolute size-[15.75rem] rounded-full border border-[#7de1c9]/30 bg-[#23aa89]/20 sm:size-[17.5rem]"
            />
            <motion.div
              aria-hidden="true"
              initial={{ transform: shouldReduceMotion ? "scale(1)" : "scale(0.82)" }}
              animate={{ opacity: isExpanded ? 0.32 : 0.18, transform: `scale(${orbScale})` }}
              transition={{
                duration: isMoving && !shouldReduceMotion ? secondsPerStep : 0.25,
                ease: isMoving ? easeInOut : easeOut,
              }}
              className="absolute size-[13.5rem] rounded-full bg-[#38c4a3]/35 shadow-[0_0_70px_rgba(55,210,174,0.28)] sm:size-[15rem]"
            />
            <motion.div
              initial={{ transform: shouldReduceMotion ? "scale(1)" : "scale(0.82)" }}
              animate={{ transform: `scale(${orbScale})` }}
              transition={{
                duration: isMoving && !shouldReduceMotion ? secondsPerStep : 0.25,
                ease: isMoving ? easeInOut : easeOut,
              }}
              className="relative flex size-40 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-[#91e5d3] to-[#32b895] shadow-[0_0_45px_rgba(86,224,193,0.38),inset_0_1px_20px_rgba(255,255,255,0.24)] sm:size-44"
            >
              <Image
                src="/mindguide/icon-11.svg"
                alt=""
                width={76}
                height={76}
                className="size-[4.75rem] brightness-0 invert opacity-75"
                unoptimized
              />
            </motion.div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${stepIndex}-label`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: easeOut }}
              className="mt-3 text-center"
            >
              <p className="text-2xl font-semibold tracking-[-0.01em]">{km ? step.km : step.en}</p>
              <p className="mt-1 text-sm font-medium text-white/72">
                {km ? `${secondsLeft} វិនាទី` : `${secondsLeft} ${secondsLeft === 1 ? "second" : "seconds"}`}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress within cycle */}
        <div className="pb-3">
          <div className="flex items-center justify-between text-xs font-medium text-white/70">
            <span>{km ? `ជំហាន ${safeStepIndex + 1} នៃ ${breathingSteps.length}` : `Step ${safeStepIndex + 1} of ${breathingSteps.length}`}</span>
            <span>{km ? `ជុំ ${cycleCount}` : `Cycle ${cycleCount}`}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
            <motion.div
              aria-hidden="true"
              animate={{ transform: `scaleX(${progress})` }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 1, ease: "linear" }}
              className="h-full origin-left rounded-full bg-[#83dfca]"
            />
          </div>
        </div>

        {/* Manual Controls: Restart, Start/Pause, Stop/Finish */}
        <div className="mt-2 flex items-center justify-center gap-7 pb-2 pt-1">
          {/* Restart */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleRestart}
              aria-label={km ? "ចាប់ផ្ដើមឡើងវិញ" : "Restart cycle"}
              className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white/90 backdrop-blur-sm transition-all duration-150 hover:bg-white/20 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
            >
              <RotateCcw aria-hidden="true" size={20} />
            </button>
            <span className="mt-1.5 text-[11px] font-medium text-white/70">
              {km ? "ចាប់ផ្ដើមឡើងវិញ" : "Restart"}
            </span>
          </div>

          {/* Start / Pause */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleTogglePlayPause}
              aria-label={isPlaying ? (km ? "ផ្អាក" : "Pause") : km ? "បន្ត" : "Start"}
              className="flex size-16 items-center justify-center rounded-full bg-[#38c4a3] text-[#062620] shadow-[0_0_24px_rgba(56,196,163,0.4)] transition-all duration-150 hover:bg-[#4de1bd] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {isPlaying ? (
                <Pause aria-hidden="true" size={26} className="fill-current" />
              ) : (
                <Play aria-hidden="true" size={26} className="ml-1 fill-current" />
              )}
            </button>
            <span className="mt-1.5 text-xs font-semibold text-white">
              {isPlaying ? (km ? "ផ្អាក" : "Pause") : km ? "បន្ត" : "Start"}
            </span>
          </div>

          {/* Stop / Finish */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleStop}
              aria-label={km ? "បញ្ចប់ការហាត់" : "Finish session"}
              className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white/90 backdrop-blur-sm transition-all duration-150 hover:bg-white/20 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
            >
              <Square aria-hidden="true" size={18} className="fill-current" />
            </button>
            <span className="mt-1.5 text-[11px] font-medium text-white/70">
              {km ? "បញ្ចប់" : "Finish"}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

function SessionComplete({
  cycles,
  onBack,
  onRestart,
}: {
  cycles: number;
  onBack: () => void;
  onRestart: () => void;
}) {
  const { language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const km = language === "km";

  return (
    <main className="min-h-dvh bg-[#f7faf9] px-5 pb-12 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-8">
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={onBack}
          aria-label={km ? "ត្រឡប់ក្រោយ" : "Back"}
          className="flex size-11 items-center justify-center rounded-full text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
        >
          <ArrowLeft aria-hidden="true" size={24} />
        </button>

        <div className="mt-2 rounded-3xl border border-arom-border/60 bg-white p-6 pt-8 text-center shadow-sm sm:p-8">
          <motion.div
            initial={{ opacity: 0, transform: shouldReduceMotion ? "scale(1)" : "scale(0.95)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            transition={{ duration: 0.24, ease: easeOut }}
          >
            <Image
              src="/booking/booking-complete.png"
              alt=""
              width={160}
              height={160}
              className="mx-auto size-36 object-contain"
              priority
            />
          </motion.div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-arom">
            {km ? "ធ្វើបានល្អណាស់!" : "Well Done!"}
          </h1>
          <p className="mx-auto mt-2 max-w-[19rem] text-sm leading-relaxed text-ink-muted">
            {km
              ? `អ្នកបានបញ្ចប់ការហាត់ដង្ហើមស្ងប់ស្ងាត់ចំនួន ${cycles} ជុំដោយជោគជ័យ។`
              : `You completed ${cycles} ${cycles === 1 ? "cycle" : "cycles"} of calming breathwork.`}
          </p>

          <div className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full bg-arom-soft px-4 py-1.5 text-sm font-semibold text-arom">
            <span>+{Math.max(20, cycles * 10)} XP</span>
            <span className="text-arom/70">•</span>
            <span>{km ? "បានកត់ត្រាទុក" : "Recorded"}</span>
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={onRestart}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-arom text-base font-semibold text-white transition-all active:scale-[0.98] hover:bg-arom-deep"
            >
              {km ? "ហាត់ម្តងទៀត (Breathe More)" : "Breathe More"}
            </button>
            <Link
              href="/mindguide/practice"
              className="flex h-12 w-full items-center justify-center rounded-xl border border-arom-border bg-white text-base font-semibold text-arom transition-all active:scale-[0.98] hover:bg-arom-wash"
            >
              {km ? "ស្វែងរកការអនុវត្តផ្សេងទៀត (More Practices)" : "Explore More Practices"}
            </Link>
            <Link
              href="/mindguide"
              className="flex h-11 w-full items-center justify-center text-sm font-medium text-ink-muted transition-colors hover:text-arom"
            >
              {km ? "ត្រឡប់ទៅ MindGuide" : "Back to MindGuide"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export function BreathingExperience({ onExit }: { onExit: () => void }) {
  const [complete, setComplete] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(1);

  const handleComplete = (cycles: number) => {
    setCyclesCompleted(cycles);
    setComplete(true);
  };

  useEffect(() => {
    document.body.dataset.immersive = "true";
    return () => {
      delete document.body.dataset.immersive;
    };
  }, []);

  return complete ? (
    <SessionComplete
      cycles={cyclesCompleted}
      onBack={onExit}
      onRestart={() => setComplete(false)}
    />
  ) : (
    <BreathingGuide onExit={onExit} onComplete={handleComplete} />
  );
}
