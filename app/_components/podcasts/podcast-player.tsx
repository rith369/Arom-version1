"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Download,
  FastForward,
  FileText,
  Headphones,
  Heart,
  MoonStar,
  Pause,
  Play,
  Rewind,
  X,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useLanguage } from "../language-provider";
import { formatTimestamp, type MindGuidePodcast } from "./podcast-data";

const SPEEDS = [1, 1.25, 1.5, 2] as const;
const SLEEP_MINUTES = [5, 10, 15, 30, 45] as const;
const SKIP_SECONDS = 15;
const TICK_MS = 250;

type SleepChoice = "off" | (typeof SLEEP_MINUTES)[number];

function Sheet({
  title,
  closeLabel,
  onClose,
  children,
}: {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        tabIndex={-1}
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[75dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-card"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-arom">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex size-10 items-center justify-center rounded-full text-arom hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

// Full screen player for a MindGuide podcast. When the episode has an audio
// file it plays it. Until then it runs a silent demo clock so the screen can be
// tried end to end.
export function PodcastPlayer({ podcast }: { podcast: MindGuidePodcast }) {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const sliderId = useId();

  const audioRef = useRef<HTMLAudioElement>(null);
  const demoTimeRef = useRef(0);
  const hasAudio = Boolean(podcast.audioUrl);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(podcast.durationSeconds);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [saved, setSaved] = useState(false);
  const [sleepChoice, setSleepChoice] = useState<SleepChoice>("off");
  const [sheet, setSheet] = useState<"sleep" | "chapters" | null>(null);
  const [downloadNote, setDownloadNote] = useState(false);

  const activeChapter = [...podcast.chapters]
    .reverse()
    .find((chapter) => currentTime >= chapter.seconds);
  const percent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const title = km ? podcast.kmTitle : podcast.title;
  const closeSheet = () => setSheet(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  // Demo clock for episodes that have no audio file yet.
  useEffect(() => {
    if (hasAudio || !isPlaying) return;
    const timer = window.setInterval(() => {
      demoTimeRef.current = Math.min(duration, demoTimeRef.current + (TICK_MS / 1000) * speed);
      setCurrentTime(demoTimeRef.current);
      if (demoTimeRef.current >= duration) setIsPlaying(false);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [hasAudio, isPlaying, speed, duration]);

  useEffect(() => {
    if (sleepChoice === "off") return;
    const timer = window.setTimeout(() => {
      setIsPlaying(false);
      setSleepChoice("off");
    }, sleepChoice * 60_000);
    return () => window.clearTimeout(timer);
  }, [sleepChoice]);

  function seekTo(seconds: number) {
    const next = Math.min(Math.max(0, seconds), duration);
    demoTimeRef.current = next;
    if (audioRef.current) audioRef.current.currentTime = next;
    setCurrentTime(next);
  }

  function cycleSpeed() {
    setSpeed((value) => SPEEDS[(SPEEDS.indexOf(value) + 1) % SPEEDS.length]);
  }

  function togglePlay() {
    if (!isPlaying && currentTime >= duration) seekTo(0);
    setIsPlaying((value) => !value);
  }

  const actionClass =
    "flex h-14 flex-col items-center justify-center gap-0.5 rounded-[7px] bg-arom-accent/15 text-xs font-medium text-arom transition-colors hover:bg-arom-accent/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom";
  const roundButtonClass =
    "flex size-11 items-center justify-center rounded-full text-arom transition-colors hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom";

  return (
    <div className="min-h-dvh bg-canvas">
      <section
        aria-label={t("កម្មវិធីចាក់ផតខាស", "Podcast player")}
        className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-white px-5 pb-8 pt-5 sm:border-x sm:border-arom-border"
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

        <div className="flex items-center justify-between">
          <Link
            href={`/podcasts/${podcast.id}`}
            aria-label={t("បិទកម្មវិធីចាក់", "Close player")}
            className={roundButtonClass}
          >
            <X size={26} aria-hidden="true" />
          </Link>
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? t("ដកចេញពីបញ្ជីចូលចិត្ត", "Remove from favourites") : t("ចូលចិត្តភាគនេះ", "Favourite this episode")}
            onClick={() => setSaved((value) => !value)}
            className={roundButtonClass}
          >
            <Heart size={26} aria-hidden="true" className={saved ? "fill-arom" : ""} />
          </button>
        </div>

        <div className="relative mt-6 aspect-[360/229] w-full overflow-hidden rounded-[7px] bg-arom-accent/15">
          <Image
            src="/podcasts/episode-art.png"
            alt=""
            fill
            priority
            sizes="(min-width: 448px) 408px, 100vw"
            className="object-cover"
          />
        </div>

        <h1 className="mt-5 text-center text-xl font-semibold leading-snug text-arom">{title}</h1>
        <p className="mt-1 text-center text-[15px] font-medium text-ink">
          {t("ផតខាស AROM", "AROM Podcast")}
        </p>

        <div className="mt-8">
          <div className="relative h-5 rounded-full has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-arom/40">
            <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-arom-accent/20" />
            <div
              className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-arom"
              style={{ width: `${percent}%` }}
            />
            <div
              className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-arom"
              style={{ left: `${percent}%` }}
            />
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
              onChange={(event) => seekTo(Number(event.target.value))}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </div>
          <div className="mt-1 flex justify-between text-sm font-light tabular-nums text-ink">
            <span>{formatTimestamp(currentTime)}</span>
            <span>{formatTimestamp(duration)}</span>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between">
          <button
            type="button"
            onClick={cycleSpeed}
            aria-label={t(`ល្បឿន ${speed} ដង`, `Speed ${speed}x`)}
            className="flex h-11 min-w-11 items-center justify-center rounded-full px-1 text-xl font-bold text-arom hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
          >
            {speed}x
          </button>
          <button
            type="button"
            onClick={() => seekTo(currentTime - SKIP_SECONDS)}
            aria-label={t("ថយក្រោយ ១៥ វិនាទី", "Back 15 seconds")}
            className={roundButtonClass}
          >
            <Rewind size={32} fill="currentColor" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? t("ផ្អាក", "Pause") : t("ចាក់", "Play")}
            className="flex size-16 items-center justify-center rounded-full bg-arom text-white shadow-[0_10px_26px_rgba(31,111,91,0.25)] transition-colors hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" aria-hidden="true" />
            ) : (
              <Play size={28} fill="currentColor" className="ml-1" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => seekTo(currentTime + SKIP_SECONDS)}
            aria-label={t("ទៅមុខ ១៥ វិនាទី", "Forward 15 seconds")}
            className={roundButtonClass}
          >
            <FastForward size={32} fill="currentColor" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setSheet("sleep")}
            aria-label={t("កម្មវិធីបិទពេលគេង", "Sleep timer")}
            className={roundButtonClass}
          >
            <Clock size={28} aria-hidden="true" />
          </button>
        </div>

        {activeChapter && currentTime > 0 && (
          <p className="mt-4 truncate text-center text-sm text-ink-muted">
            {t("ឥឡូវ:", "Now:")} {km ? activeChapter.kmTitle : activeChapter.title}
          </p>
        )}

        <div className="mt-auto pt-10">
          <div className="grid grid-cols-3 gap-3">
            <button type="button" onClick={() => setSheet("sleep")} className={actionClass}>
              <MoonStar size={22} aria-hidden="true" />
              {sleepChoice === "off"
                ? t("កម្មវិធីបិទពេលគេង", "Sleep timer")
                : t(`${sleepChoice} នាទី`, `${sleepChoice} min`)}
            </button>
            <button type="button" onClick={() => setSheet("chapters")} className={actionClass}>
              <FileText size={22} aria-hidden="true" />
              {t("ផ្នែក", "Chapter")}
            </button>
            {hasAudio ? (
              <a href={podcast.audioUrl} download className={actionClass}>
                <Download size={22} aria-hidden="true" />
                {t("ទាញយក", "Download")}
              </a>
            ) : (
              <button type="button" onClick={() => setDownloadNote(true)} className={actionClass}>
                <Download size={22} aria-hidden="true" />
                {t("ទាញយក", "Download")}
              </button>
            )}
          </div>

          {downloadNote && (
            <p role="status" className="mt-3 text-center text-xs text-ink-muted">
              {t(
                "ការទាញយកនឹងមាននៅពេលសំឡេងរបស់ភាគនេះត្រូវបានបន្ថែម។",
                "Downloads will be ready when the audio for this episode is added.",
              )}
            </p>
          )}

          {!hasAudio && (
            <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-ink-muted">
              <Headphones size={14} className="mt-0.5 shrink-0 text-arom" aria-hidden="true" />
              {t(
                "នេះជាការសាកល្បង។ សំឡេងពិតរបស់ភាគនេះនឹងមកដល់ឆាប់ៗ។",
                "This is a preview. The real audio for this episode is coming soon.",
              )}
            </p>
          )}
        </div>
      </section>

      {sheet === "sleep" && (
        <Sheet
          title={t("កម្មវិធីបិទពេលគេង", "Sleep timer")}
          closeLabel={t("បិទ", "Close")}
          onClose={closeSheet}
        >
          <p className="text-sm text-ink-muted">
            {t("ផ្អាកការចាក់ដោយស្វ័យប្រវត្តិ ដើម្បីឱ្យអ្នកដេកលក់។", "Pause playback by itself so you can drift off.")}
          </p>
          <ul className="mt-3 divide-y divide-arom-border/70">
            {(["off", ...SLEEP_MINUTES] as const).map((choice) => {
              const selected = sleepChoice === choice;
              return (
                <li key={choice}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setSleepChoice(choice);
                      closeSheet();
                    }}
                    className={`flex min-h-12 w-full items-center justify-between py-3 text-left text-base ${
                      selected ? "font-semibold text-arom" : "text-ink hover:text-arom"
                    }`}
                  >
                    {choice === "off" ? t("បិទ", "Off") : t(`${choice} នាទី`, `${choice} minutes`)}
                    {selected && <span className="size-2.5 rounded-full bg-arom" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </Sheet>
      )}

      {sheet === "chapters" && (
        <Sheet
          title={t("ផ្នែកនៃភាគនេះ", "In this episode")}
          closeLabel={t("បិទ", "Close")}
          onClose={closeSheet}
        >
          <ol className="divide-y divide-arom-border/70">
            {podcast.chapters.map((chapter) => {
              const isActive = activeChapter?.id === chapter.id;
              return (
                <li key={chapter.id}>
                  <button
                    type="button"
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => {
                      seekTo(chapter.seconds);
                      setIsPlaying(true);
                      closeSheet();
                    }}
                    className={`flex min-h-12 w-full items-center gap-4 py-3 text-left text-base ${
                      isActive ? "font-semibold text-arom" : "text-ink hover:text-arom"
                    }`}
                  >
                    <span className="w-12 shrink-0 text-sm tabular-nums text-ink-muted">
                      {formatTimestamp(chapter.seconds)}
                    </span>
                    <span>{km ? chapter.kmTitle : chapter.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </Sheet>
      )}
    </div>
  );
}
