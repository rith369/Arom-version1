"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Headphones,
  Pause,
  Play,
  Quote,
  Radio,
  RotateCcw,
  RotateCw,
  Lightbulb,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { PodcastChapter, Therapist } from "@/lib/therapists";
import { useLanguage } from "./language-provider";

function formatSeconds(totalSecs: number): string {
  const mins = Math.floor(totalSecs / 60);
  const secs = Math.floor(totalSecs % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

type PlayerPodcast = NonNullable<Therapist["podcast"]> & { audioUrl?: string };

export function TherapistPodcastPlayer({ therapist }: { therapist: Therapist & { podcast?: PlayerPodcast } }) {
  if (!therapist.podcast) return null;
  return <PodcastConsole therapist={therapist} podcast={therapist.podcast} />;
}

// Split from the wrapper so every hook runs on every render.
function PodcastConsole({ therapist, podcast }: { therapist: Therapist; podcast: PlayerPodcast }) {
  // Uploaded episodes play their real audio file; sample episodes keep the demo tone.
  const audioUrl = podcast.audioUrl ?? "";
  const realAudioRef = useRef<HTMLAudioElement>(null);
  const { language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const sliderId = useId();

  const totalDuration = podcast.durationSeconds;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5 | 2>(1);
  const [isMuted, setIsMuted] = useState(false);

  // Audio Context Ref for synthesized calming ambient tone
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);

  // Simulated ambient calm frequencies (432Hz harmonic calm meditation chord)
  const stopSynthAudio = () => {
    try {
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.15);
      }
      setTimeout(() => {
        try {
          osc1Ref.current?.stop();
          osc2Ref.current?.stop();
          osc1Ref.current?.disconnect();
          osc2Ref.current?.disconnect();
          osc1Ref.current = null;
          osc2Ref.current = null;
        } catch {
          // ignore already stopped
        }
      }, 160);
    } catch {
      // ignore
    }
  };

  const startSynthAudio = () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Master gain node for gentle, whisper-quiet calming presence
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(0.04, now + 0.4);
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;

      // Filter for ultra warm sound
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(650, now);
      filter.connect(gainNode);

      // Osc 1: Soft warm fundamental sine (216Hz, warm soothing tonic)
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(216, now);
      osc1.connect(filter);
      osc1.start();
      osc1Ref.current = osc1;

      // Osc 2: Gentle 5th overtone (324Hz)
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(324, now);
      osc2.connect(filter);
      osc2.start();
      osc2Ref.current = osc2;
    } catch {
      // AudioContext policy fallback gracefully
    }
  };

  // Real audio: the element drives the time; the demo ticker below is skipped.
  useEffect(() => {
    const audio = realAudioRef.current;
    if (!audioUrl || !audio) return;
    audio.playbackRate = playbackSpeed;
    audio.muted = isMuted;
    if (isPlaying) void audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [audioUrl, isPlaying, playbackSpeed, isMuted]);

  // Playback timer ticker
  useEffect(() => {
    if (audioUrl) return;
    if (!isPlaying) {
      stopSynthAudio();
      return;
    }

    startSynthAudio();

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 1 * playbackSpeed;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      stopSynthAudio();
    };
  }, [audioUrl, isPlaying, playbackSpeed, totalDuration, isMuted]);

  // The chapter playing now: the last one that started before currentTime.
  const activeChapterIndex = podcast.chapters.reduce((found, chapter, index) => (currentTime >= chapter.seconds ? index : found), 0);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const seekRelative = (deltaSeconds: number) => {
    const next = Math.max(0, Math.min(totalDuration, currentTime + deltaSeconds));
    if (audioUrl && realAudioRef.current) realAudioRef.current.currentTime = next;
    setCurrentTime(next);
  };

  const seekTo = (seconds: number) => {
    const next = Math.max(0, Math.min(totalDuration, seconds));
    if (audioUrl && realAudioRef.current) realAudioRef.current.currentTime = next;
    setCurrentTime(next);
  };

  const cycleSpeed = () => {
    const speeds: Array<1 | 1.25 | 1.5 | 2> = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

  const toggleMute = () => {
    if (audioUrl) {
      setIsMuted(!isMuted);
      return;
    }
    if (isMuted) {
      setIsMuted(false);
      if (isPlaying) {
        startSynthAudio();
      }
    } else {
      setIsMuted(true);
      stopSynthAudio();
    }
  };

  // Waveform visualization bars
  const waveformBars = useMemo(() => {
    // 36 pseudo-waveform heights representing realistic conversational audio dynamics
    const heights = [
      32, 45, 60, 40, 75, 90, 65, 80, 50, 70, 85, 95, 78, 62, 88, 100, 72, 54, 82, 92, 68, 76, 58,
      84, 96, 70, 64, 82, 90, 55, 42, 68, 78, 50, 38, 48,
    ];
    return heights;
  }, []);

  const progressFraction = Math.min(1, Math.max(0, currentTime / totalDuration));
  const activeBarIndex = Math.floor(progressFraction * waveformBars.length);

  const title = language === "km" ? podcast.kmTitle : podcast.title;
  const episodeNumber = language === "km" ? podcast.kmEpisodeNumber : podcast.episodeNumber;
  const subtitle = language === "km" ? podcast.kmSubtitle : podcast.subtitle;
  const description = language === "km" ? podcast.kmDescription : podcast.description;
  const topic = language === "km" ? podcast.kmTopic : podcast.topic;
  const publishedDate = language === "km" ? podcast.kmPublishedDate : podcast.publishedDate;
  const quote = language === "km" ? podcast.kmQuote : podcast.quote;
  const takeaways = language === "km" ? podcast.kmTakeaways : podcast.takeaways;

  return (
    <section
      id="podcast"
      aria-labelledby="podcast-heading"
      className="mt-12 rounded-3xl border border-arom-border bg-gradient-to-b from-white via-arom-wash/50 to-arom-soft/30 p-5 shadow-card sm:p-7 lg:mt-16 lg:p-9"
    >
      {audioUrl && (
        <audio
          ref={realAudioRef}
          src={audioUrl}
          preload="metadata"
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
      )}
      {/* Header Tag & Section Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-arom-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-arom-deep">
            <Radio aria-hidden="true" size={14} className="text-arom animate-pulse" />
            {language === "km" ? "ផតខាសអ្នកជំនាញ" : "Therapist Voice Podcast"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink-muted shadow-sm">
            <Clock aria-hidden="true" size={13} className="text-arom" />
            {podcast.duration}
          </span>
        </div>
        <span className="text-xs font-semibold text-ink-muted">
          {language === "km" ? `ចេញផ្សាយ៖ ${publishedDate}` : `Released: ${publishedDate}`}
        </span>
      </div>

      <div className="mt-4">
        <h2
          id="podcast-heading"
          className="text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-[2rem]"
        >
          {title}
        </h2>
        <p className="mt-1.5 text-sm font-semibold text-arom sm:text-base">
          {episodeNumber} &bull; {topic} &bull; {language === "km" ? "ជាមួយ" : "With"} {therapist.name}
        </p>
        <p className="mt-2.5 max-w-3xl text-sm leading-6 text-ink-muted sm:text-[0.95rem] sm:leading-7">
          {description}
        </p>
      </div>

      {/* Main Interactive Audio Player Console */}
      <div className="mt-6 rounded-2xl border border-arom-border/80 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
        <div className="grid gap-6 lg:grid-cols-[140px_minmax(0,1fr)] lg:items-center">
          {/* Therapist Episode Art Thumbnail with Live Status Ring */}
          <div className="relative mx-auto size-28 overflow-hidden rounded-2xl bg-arom-soft shadow-md sm:size-32 lg:size-36">
            <Image
              src={therapist.image}
              alt={`Podcast host and guest ${therapist.name}`}
              fill
              sizes="(max-width: 639px) 112px, (max-width: 1023px) 128px, 144px"
              className="object-cover"
              style={{ objectPosition: therapist.imagePosition }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[0.7rem] font-bold text-white">
              <span className="flex items-center gap-1">
                <Headphones size={12} />
                AROM
              </span>
              {isPlaying && (
                <span className="flex items-center gap-1 rounded bg-arom px-1.5 py-0.5 text-[0.65rem]">
                  <span className="size-1.5 rounded-full bg-white animate-ping" />
                  LIVE
                </span>
              )}
            </div>
          </div>

          {/* Interactive Player Controls & Waveform */}
          <div className="min-w-0">
            {/* Waveform Visualization (Interactive scrub) */}
            <div className="relative">
              <div
                className="flex h-14 w-full cursor-pointer items-end justify-between gap-1 rounded-xl bg-arom-wash/80 px-2 py-2.5 transition-colors hover:bg-arom-wash"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  seekTo(ratio * totalDuration);
                }}
                role="presentation"
                title={language === "km" ? "ចុចដើម្បីស្តាប់ត្រង់ចំណុចនេះ" : "Click anywhere on waveform to seek"}
              >
                {waveformBars.map((height, idx) => {
                  const isPassed = idx <= activeBarIndex;
                  const isCurrent = idx === activeBarIndex;
                  return (
                    <motion.div
                      key={idx}
                      className={`min-w-[2px] flex-1 rounded-full transition-colors duration-150 ${
                        isPassed
                          ? "bg-arom"
                          : "bg-arom-border hover:bg-arom/40"
                      }`}
                      style={{
                        height: `${Math.max(15, height)}%`,
                        transformOrigin: "bottom",
                      }}
                      animate={
                        isPlaying && (isCurrent || Math.abs(idx - activeBarIndex) <= 2)
                          ? { scaleY: shouldReduceMotion ? 1 : [0.8, 1.25, 0.9, 1.1] }
                          : { scaleY: 1 }
                      }
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        delay: (idx % 4) * 0.1,
                      }}
                    />
                  );
                })}
              </div>

              {/* Accessible Range Input slider overlay */}
              <input
                id={sliderId}
                type="range"
                min={0}
                max={totalDuration}
                value={currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
                aria-label={language === "km" ? "របារសំឡេងផតខាស" : "Podcast timeline scrubber"}
                className="sr-only"
              />
            </div>

            {/* Time labels & chapter title */}
            <div className="mt-2 flex items-center justify-between text-xs font-semibold text-ink-muted">
              <span className="font-mono text-ink">{formatSeconds(currentTime)}</span>
              <span className="max-w-[65%] truncate text-center text-arom">
                {language === "km"
                  ? podcast.chapters[activeChapterIndex]?.kmTitle
                  : podcast.chapters[activeChapterIndex]?.title}
              </span>
              <span className="font-mono text-ink-muted">{formatSeconds(totalDuration)}</span>
            </div>

            {/* Transport Control Buttons */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-arom-border/60 pt-4">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Skip back 15s */}
                <button
                  type="button"
                  onClick={() => seekRelative(-15)}
                  aria-label={language === "km" ? "ថយក្រោយ ១៥ វិនាទី" : "Skip backward 15 seconds"}
                  className="flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-arom-wash hover:text-arom focus-visible:outline-2 focus-visible:outline-arom"
                >
                  <RotateCcw size={18} />
                </button>

                {/* Primary Play/Pause Button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? (language === "km" ? "ផ្អាក" : "Pause") : (language === "km" ? "ស្តាប់" : "Play")}
                  className="flex size-12 items-center justify-center rounded-full bg-arom text-white shadow-md transition-all duration-150 hover:scale-105 hover:bg-arom-deep active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
                >
                  {isPlaying ? (
                    <Pause size={22} className="fill-current" />
                  ) : (
                    <Play size={22} className="ml-0.5 fill-current" />
                  )}
                </button>

                {/* Skip forward 15s */}
                <button
                  type="button"
                  onClick={() => seekRelative(15)}
                  aria-label={language === "km" ? "ទៅមុខ ១៥ វិនាទី" : "Skip forward 15 seconds"}
                  className="flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-arom-wash hover:text-arom focus-visible:outline-2 focus-visible:outline-arom"
                >
                  <RotateCw size={18} />
                </button>
              </div>

              {/* Secondary Controls: Speed & Mute */}
              <div className="flex items-center gap-2">
                {/* Speed selector */}
                <button
                  type="button"
                  onClick={cycleSpeed}
                  aria-label={language === "km" ? `ល្បឿន ${playbackSpeed}x` : `Playback speed ${playbackSpeed}x`}
                  className="rounded-lg border border-arom-border bg-arom-wash/60 px-2.5 py-1 text-xs font-bold text-ink transition-colors hover:bg-arom-soft hover:text-arom-deep focus-visible:outline-2 focus-visible:outline-arom"
                >
                  {playbackSpeed}x
                </button>

                {/* Sound / Mute */}
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? (language === "km" ? "បើកសំឡេង" : "Unmute audio") : (language === "km" ? "បិទសំឡេង" : "Mute audio")}
                  className={`flex size-9 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-arom ${
                    isMuted
                      ? "text-arom-danger hover:bg-arom-danger-soft"
                      : "text-ink-muted hover:bg-arom-wash hover:text-arom"
                  }`}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters & Timestamps Section */}
      <div className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-arom-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink">
              {language === "km" ? "មាតិកាសំខាន់ៗក្នុងភាគនេះ" : "Episode Chapters & Timestamps"}
            </h3>
            <span className="text-xs font-semibold text-arom-accent">
              {podcast.chapters.length} {language === "km" ? "ផ្នែក" : "segments"}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {podcast.chapters.map((chapter: PodcastChapter, idx: number) => {
              const isActive = activeChapterIndex === idx;
              const chapterTitle = language === "km" ? chapter.kmTitle : chapter.title;
              return (
                <button
                  key={chapter.timestamp}
                  type="button"
                  onClick={() => {
                    seekTo(chapter.seconds);
                    if (!isPlaying) setIsPlaying(true);
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all ${
                    isActive
                      ? "bg-arom-soft/80 text-arom-deep font-semibold shadow-xs"
                      : "text-ink-muted hover:bg-arom-wash hover:text-ink"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded-md ${
                        isActive
                          ? "bg-arom text-white font-bold"
                          : "bg-arom-wash text-ink-muted group-hover:text-arom"
                      }`}
                    >
                      {chapter.timestamp}
                    </span>
                    <span className="truncate text-xs sm:text-sm font-medium">{chapterTitle}</span>
                  </div>
                  <Play
                    size={14}
                    className={`shrink-0 transition-opacity ${
                      isActive ? "text-arom opacity-100" : "opacity-0 group-hover:opacity-70"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Key Takeaways & Doctor Quote */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-arom-border bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-bold text-ink">
              <Lightbulb size={16} className="text-arom-accent" />
              {language === "km" ? "ចំណុចគន្លឹះដែលអ្នកនឹងរៀន (Key Takeaways)" : "Key Clinical Takeaways"}
            </h3>
            <ul className="mt-3.5 space-y-2.5 text-xs sm:text-sm text-ink-muted">
              {takeaways.map((takeaway, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-arom"
                    aria-hidden="true"
                  />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Practitioner Direct Quote */}
          <div className="rounded-2xl border border-arom/20 bg-arom-soft/40 p-4.5 text-ink">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-arom text-white">
                <Quote size={15} />
              </span>
              <div>
                <p className="italic text-xs sm:text-sm leading-relaxed text-ink font-medium">
                  &ldquo;{quote}&rdquo;
                </p>
                <p className="mt-2 text-xs font-bold text-arom-deep">
                  &mdash; {therapist.name}, {therapist.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Bridge CTA */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl bg-arom p-5 text-white sm:flex-row sm:p-6">
        <div>
          <h3 className="text-base font-bold sm:text-lg">
            {language === "km"
              ? `មានអារម្មណ៍ត្រូវចិត្តជាមួយ ${therapist.name}?`
              : `Connect with ${therapist.name}'s approach?`}
          </h3>
          <p className="mt-0.5 text-xs sm:text-sm text-white/80">
            {language === "km"
              ? "កក់ការណាត់ជួបដំបូងរបស់អ្នកដោយផ្ទាល់ ឬតាមអនឡាញដើម្បីចាប់ផ្តើមដំណើរផ្លូវចិត្ត។"
              : "Book your initial confidential consultation online or in-person today."}
          </p>
        </div>
        <Link
          href={`/professional/${therapist.slug}/book`}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs sm:text-sm font-bold text-arom transition-transform hover:scale-[1.02] hover:bg-arom-soft focus-visible:outline-2 focus-visible:outline-white"
        >
          <CalendarCheck2 size={17} />
          {language === "km" ? "កក់ការណាត់ជួប" : "Book an Appointment"}
        </Link>
      </div>
    </section>
  );
}
