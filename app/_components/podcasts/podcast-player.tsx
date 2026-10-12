"use client";

import { Headphones, Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "../language-provider";
import { formatTimestamp, type MindGuidePodcast } from "./podcast-data";

const SPEEDS = [1, 1.25, 1.5] as const;

// Plays the real audio file of a MindGuide podcast. Chapters jump to their time.
export function PodcastPlayer({ podcast }: { podcast: MindGuidePodcast }) {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const sliderId = useId();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(podcast.durationSeconds);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);

  const hasAudio = Boolean(podcast.audioUrl);
  const activeChapter = [...podcast.chapters]
    .reverse()
    .find((chapter) => currentTime >= chapter.seconds);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  function seekTo(seconds: number, play = false) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(0, seconds), duration);
    setCurrentTime(audio.currentTime);
    if (play) void audio.play();
  }

  return (
    <section
      aria-label={t("កម្មវិធីចាក់ផតខាស", "Podcast player")}
      className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-7"
    >
      {hasAudio && (
        <audio
          ref={audioRef}
          src={podcast.audioUrl}
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => {
            if (Number.isFinite(event.currentTarget.duration)) {
              setDuration(event.currentTarget.duration);
            }
          }}
        />
      )}

      {!hasAudio && (
        <p className="mb-5 flex items-start gap-2 rounded-2xl bg-arom-wash p-3 text-sm text-ink-muted">
          <Headphones size={18} className="mt-0.5 shrink-0 text-arom" aria-hidden="true" />
          {t(
            "សំឡេងសម្រាប់ភាគនេះនឹងមកដល់ឆាប់ៗ។ អ្នកអាចអានការពិពណ៌នា និងចំណុចសំខាន់ខាងក្រោមបាន។",
            "The audio for this episode is coming soon. You can read the description and key points below.",
          )}
        </p>
      )}

      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <button
          type="button"
          onClick={() => seekTo(currentTime - 15)}
          disabled={!hasAudio}
          aria-label={t("ថយក្រោយ ១៥ វិនាទី", "Back 15 seconds")}
          className="flex size-12 items-center justify-center rounded-full border border-arom-border text-arom transition-colors hover:bg-arom-wash disabled:opacity-40"
        >
          <RotateCcw size={20} />
        </button>
        <button
          type="button"
          onClick={togglePlay}
          disabled={!hasAudio}
          aria-label={isPlaying ? t("ផ្អាក", "Pause") : t("ចាក់", "Play")}
          className="flex size-16 items-center justify-center rounded-full bg-arom text-white shadow-[0_10px_26px_rgba(31,111,91,0.25)] transition-colors hover:bg-arom-deep disabled:opacity-40"
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        <button
          type="button"
          onClick={() => seekTo(currentTime + 15)}
          disabled={!hasAudio}
          aria-label={t("ទៅមុខ ១៥ វិនាទី", "Forward 15 seconds")}
          className="flex size-12 items-center justify-center rounded-full border border-arom-border text-arom transition-colors hover:bg-arom-wash disabled:opacity-40"
        >
          <RotateCw size={20} />
        </button>
      </div>

      <div className="mt-6">
        <label htmlFor={sliderId} className="sr-only">
          {t("ទីតាំងចាក់", "Playback position")}
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={Math.round(duration)}
          step={1}
          value={Math.round(currentTime)}
          disabled={!hasAudio}
          onChange={(event) => seekTo(Number(event.target.value))}
          className="w-full accent-arom disabled:opacity-40"
        />
        <div className="mt-1 flex justify-between text-xs font-medium tabular-nums text-ink-muted">
          <span>{formatTimestamp(currentTime)}</span>
          <span>{formatTimestamp(duration)}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm text-ink-muted">
          {activeChapter && hasAudio
            ? `${t("ឥឡូវ:", "Now:")} ${km ? activeChapter.kmTitle : activeChapter.title}`
            : ""}
        </p>
        <div role="group" aria-label={t("ល្បឿន", "Speed")} className="flex gap-1 rounded-full border border-arom-border p-1">
          {SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={speed === value}
              disabled={!hasAudio}
              onClick={() => setSpeed(value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-40 ${
                speed === value ? "bg-arom text-white" : "text-ink-muted hover:bg-arom-wash"
              }`}
            >
              {value}x
            </button>
          ))}
        </div>
      </div>

      <h2 className="mt-7 text-base font-bold text-ink">
        {t("ផ្នែកនៃភាគនេះ", "In this episode")}
      </h2>
      <ol className="mt-3 divide-y divide-arom-border/70">
        {podcast.chapters.map((chapter) => {
          const isActive = hasAudio && activeChapter?.id === chapter.id;

          return (
            <li key={chapter.id}>
              <button
                type="button"
                onClick={() => seekTo(chapter.seconds, true)}
                disabled={!hasAudio}
                aria-current={isActive ? "true" : undefined}
                className={`flex w-full items-center gap-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${
                  isActive ? "font-semibold text-arom" : "text-ink enabled:hover:text-arom"
                }`}
              >
                <span className="w-12 shrink-0 tabular-nums text-xs text-ink-muted">
                  {formatTimestamp(chapter.seconds)}
                </span>
                <span>{km ? chapter.kmTitle : chapter.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
