"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Brain,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Headphones,
  HeartPulse,
  Moon,
  Play,
  Search,
  Sun,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  getTherapist,
  getTherapistName,
  getTherapistRole,
} from "@/lib/therapists";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { EducationalNote } from "../educational-note";
import { useLanguage } from "../language-provider";
import {
  MINDGUIDE_PODCASTS,
  formatDuration,
  formatTimestamp,
  type MindGuidePodcast,
} from "./podcast-data";

const easeOut = [0.23, 1, 0.32, 1] as const;

// Chips follow this order. Any other topic is added after these.
const TOPIC_ORDER = ["Mental Health", "Anxiety", "Sleep", "Stress", "Relationships"];

const TOPIC_ICONS: Record<string, LucideIcon> = {
  Stress: Brain,
  Anxiety: Sun,
  Sleep: Moon,
  "Mental Health": HeartPulse,
  Relationships: Users,
};

// The cards in the design have a hard offset shadow and a thin dark border.
const cardEdge = "rounded-[9px] border border-black/25 shadow-[4px_4px_4px_rgba(0,0,0,0.25)]";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="MindGuide" />
      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8 xl:px-14">
        <div className="mx-auto w-full max-w-[52rem]">{children}</div>
      </main>
      <MobileNavigation active="MindGuide" />
    </div>
  );
}

function BackChevron({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="-ml-2 flex size-11 items-center justify-center rounded-full text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
    >
      <ChevronLeft size={26} aria-hidden="true" />
    </Link>
  );
}

function TopicTile({ topic, className = "" }: { topic: string; className?: string }) {
  const Icon = TOPIC_ICONS[topic] ?? Headphones;
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg bg-arom-accent/20 text-arom ${className}`}
    >
      <Icon size={26} aria-hidden="true" className={topic === "Sleep" ? "fill-current" : ""} />
    </span>
  );
}

function EpisodeRow({ podcast, index }: { podcast: MindGuidePodcast; index: number }) {
  const { language } = useLanguage();
  const km = language === "km";
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.li
      initial={shouldReduceMotion ? false : { opacity: 0, transform: "translateY(8px)" }}
      animate={{ opacity: 1, transform: "translateY(0)" }}
      transition={{ duration: 0.24, delay: shouldReduceMotion ? 0 : index * 0.05, ease: easeOut }}
    >
      <Link
        href={`/podcasts/${podcast.id}`}
        className={`group flex items-center gap-4 bg-white px-4 py-3.5 transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom ${cardEdge}`}
      >
        <TopicTile topic={podcast.topic} className="size-12" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium text-arom">
            {km ? podcast.kmTitle : podcast.title}
          </span>
          <span className="mt-0.5 block truncate text-[13px] font-light text-ink">
            {formatDuration(podcast.durationSeconds, km)} · {km ? podcast.kmTopic : podcast.topic}
          </span>
        </span>
        <ChevronRight
          size={22}
          aria-hidden="true"
          className="shrink-0 text-arom transition-transform duration-150 group-hover:translate-x-0.5"
        />
      </Link>
    </motion.li>
  );
}

function EpisodeSection({
  heading,
  episodes,
}: {
  heading: string;
  episodes: MindGuidePodcast[];
}) {
  return (
    <section className="mt-7">
      <h2 className="text-xl font-semibold text-arom">{heading}</h2>
      <ul className="mt-4 space-y-4 pr-1">
        {episodes.map((podcast, index) => (
          <EpisodeRow key={podcast.id} podcast={podcast} index={index} />
        ))}
      </ul>
    </section>
  );
}

export function PodcastsHomeView() {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All");

  const episodes = [...MINDGUIDE_PODCASTS].sort((a, b) =>
    b.publishedDate.localeCompare(a.publishedDate),
  );

  const topics = [...new Set(episodes.map((podcast) => podcast.topic))].sort((a, b) => {
    const rank = (value: string) => {
      const found = TOPIC_ORDER.indexOf(value);
      return found === -1 ? TOPIC_ORDER.length : found;
    };
    return rank(a) - rank(b);
  });
  const topicLabel = (value: string) =>
    km ? episodes.find((podcast) => podcast.topic === value)?.kmTopic ?? value : value;

  const needle = query.trim().toLowerCase();
  const isFiltering = needle !== "" || topic !== "All";
  const results = episodes.filter((podcast) => {
    if (topic !== "All" && podcast.topic !== topic) return false;
    if (!needle) return true;
    return [podcast.title, podcast.kmTitle, podcast.description, podcast.kmDescription, podcast.topic, podcast.kmTopic]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  const chipClass = (selected: boolean) =>
    `shrink-0 rounded-full border px-3.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom ${
      selected
        ? "border-arom bg-arom text-white"
        : "border-[#757575]/30 text-[#757575] hover:border-arom/50 hover:text-arom"
    }`;

  return (
    <Shell>
      <header className="relative">
        <BackChevron href="/mindguide" label={t("ត្រឡប់ទៅមគ្គុទ្ទេសក៍ចិត្ត", "Back to MindGuide")} />
        <Image
          src="/podcasts/header.png"
          alt=""
          width={1536}
          height={1024}
          priority
          sizes="(min-width: 640px) 288px, 216px"
          className="pointer-events-none absolute -top-6 right-0 w-[13.5rem] sm:w-72"
        />
        <h1 className="relative mt-1 text-[28px] font-semibold leading-tight text-arom sm:text-4xl">
          {t("ផតខាស (Podcast)", "Podcast")}
        </h1>
        <p className="relative mt-2 max-w-[15rem] text-[15px] font-light leading-snug text-ink sm:max-w-sm">
          {t(
            "ស្តាប់ រៀន និងមានអារម្មណ៍ថាមានគេគាំទ្រគ្រប់ពេល គ្រប់ទីកន្លែង។",
            "listen, learn, and feel supported anytime, anywhere.",
          )}
        </p>
      </header>

      <div className="relative mt-5 pr-1">
        <Search
          size={22}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <label htmlFor="podcast-search" className="sr-only">
          {t("ស្វែងរកផតខាស", "Search podcasts")}
        </label>
        <input
          id="podcast-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("ស្វែងរកផតខាស ...", "Search podcast ...")}
          className={`h-11 w-full bg-white pl-12 pr-4 text-sm font-light text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom ${cardEdge}`}
        />
      </div>

      <div
        role="group"
        aria-label={t("ត្រងតាមប្រធានបទ", "Filter by topic")}
        className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      >
        <button
          type="button"
          aria-pressed={topic === "All"}
          onClick={() => setTopic("All")}
          className={chipClass(topic === "All")}
        >
          {t("ទាំងអស់", "All")}
        </button>
        {topics.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={topic === value}
            onClick={() => setTopic(value)}
            className={chipClass(topic === value)}
          >
            {topicLabel(value)}
          </button>
        ))}
      </div>

      {isFiltering ? (
        results.length > 0 ? (
          <EpisodeSection heading={t("លទ្ធផល", "Results")} episodes={results} />
        ) : (
          <p role="status" className="mt-10 text-center text-sm leading-6 text-ink-muted">
            {t(
              "រកមិនឃើញភាគណាត្រូវគ្នាទេ។ សូមសាកល្បងពាក្យ ឬប្រធានបទផ្សេង។",
              "No episodes match. Try another word or topic.",
            )}
          </p>
        )
      ) : (
        <>
          <EpisodeSection
            heading={t("ណែនាំសម្រាប់អ្នក", "Recommended for You")}
            episodes={episodes.slice(0, 3)}
          />
          <EpisodeSection
            heading={t("ភាគផ្សេងទៀត", "More episodes")}
            episodes={episodes.slice(3)}
          />
        </>
      )}
    </Shell>
  );
}

export function PodcastEpisodeView({ podcast }: { podcast: MindGuidePodcast }) {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [tab, setTab] = useState<"about" | "chapters">("about");
  const guest = podcast.guestProfessionalId ? getTherapist(podcast.guestProfessionalId) : undefined;
  const playHref = `/podcasts/${podcast.id}/play`;

  const tabClass = (selected: boolean) =>
    `h-9 flex-1 rounded text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom ${
      selected
        ? "bg-arom-accent/25 font-semibold text-arom"
        : "bg-[#d9d9d9]/40 font-medium text-[#444] hover:bg-[#d9d9d9]/70"
    }`;

  return (
    <Shell>
      <BackChevron href="/podcasts" label={t("ត្រឡប់ទៅផតខាសទាំងអស់", "Back to all podcasts")} />

      <div className="relative mt-3 h-[145px] sm:h-52">
        <div className="absolute inset-x-0 bottom-0 h-[138px] rounded-[7px] bg-arom-accent/20 sm:h-[12.5rem]" />
        <div className="absolute inset-0 overflow-hidden rounded-[7px]">
          <Image
            src="/podcasts/episode-art.png"
            alt=""
            fill
            priority
            sizes="(min-width: 832px) 832px, 100vw"
            className="object-cover object-[50%_24%]"
          />
        </div>
        <Link
          href={playHref}
          aria-label={t("ចាក់ភាគនេះ", "Play this episode")}
          className="absolute left-1/2 top-1/2 flex size-[63px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-arom text-white shadow-[0_10px_26px_rgba(31,111,91,0.3)] transition-colors hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Play size={26} fill="currentColor" className="ml-1" aria-hidden="true" />
        </Link>
      </div>

      <h1 className="mt-5 text-xl font-semibold leading-snug text-arom">
        {km ? podcast.kmTitle : podcast.title}
      </h1>
      <p className="mt-1 text-[15px] font-light text-ink">
        {formatDuration(podcast.durationSeconds, km)} · {km ? podcast.kmTopic : podcast.topic}
      </p>

      <div role="tablist" aria-label={t("ព័ត៌មានភាគ", "Episode details")} className="mt-4 flex gap-1">
        <button
          type="button"
          role="tab"
          id="podcast-tab-about"
          aria-selected={tab === "about"}
          aria-controls="podcast-panel"
          onClick={() => setTab("about")}
          className={tabClass(tab === "about")}
        >
          {t("អំពី", "About")}
        </button>
        <button
          type="button"
          role="tab"
          id="podcast-tab-chapters"
          aria-selected={tab === "chapters"}
          aria-controls="podcast-panel"
          onClick={() => setTab("chapters")}
          className={tabClass(tab === "chapters")}
        >
          {t("ផ្នែក", "Chapters")}
        </button>
      </div>

      <div
        role="tabpanel"
        id="podcast-panel"
        aria-labelledby={tab === "about" ? "podcast-tab-about" : "podcast-tab-chapters"}
        className="mt-5"
      >
        {tab === "about" ? (
          <>
            <p className="text-base font-light leading-6 text-ink">
              {km ? podcast.kmDescription : podcast.description}
            </p>

            {podcast.takeaways.length > 0 && (
              <section className="mt-6">
                <h2 className="text-lg font-semibold text-arom">
                  {t("អ្វីដែលអ្នកនឹងរៀន", "What you’ll learn")}
                </h2>
                <ul className="mt-3 space-y-4">
                  {podcast.takeaways.map((takeaway) => (
                    <li key={takeaway.en} className="flex items-start gap-3 text-[15px] font-light leading-6 text-ink">
                      <CircleCheck
                        size={24}
                        aria-hidden="true"
                        className="shrink-0 fill-arom text-white"
                      />
                      <span>{km ? takeaway.km : takeaway.en}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <ol className="divide-y divide-arom-border/70">
            {podcast.chapters.map((chapter) => (
              <li key={chapter.id} className="flex items-center gap-4 py-3 text-[15px] text-ink">
                <span className="w-12 shrink-0 text-sm tabular-nums text-ink-muted">
                  {formatTimestamp(chapter.seconds)}
                </span>
                <span>{km ? chapter.kmTitle : chapter.title}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <Link
        href={playHref}
        className="mx-auto mt-8 flex h-11 w-full max-w-[19.5rem] items-center justify-center rounded-[9px] bg-arom text-sm font-medium text-white shadow-[3.6px_3.6px_3.6px_rgba(0,0,0,0.25)] transition-colors hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
      >
        {t("ចាក់ភាគនេះ", "Play Episode")}
      </Link>

      {guest && (
        <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-arom-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-full ring-2 ring-arom-soft">
              <Image
                src={guest.image}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
                style={{ objectPosition: guest.imagePosition }}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-muted">{t("ភ្ញៀវ", "Guest")}</p>
              <p className="text-base font-bold text-ink">{getTherapistName(guest, km)}</p>
              <p className="text-xs text-ink-muted">{getTherapistRole(guest, km)}</p>
            </div>
          </div>
          <Link
            href={`/professional/${guest.slug}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-arom px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-arom"
          >
            <CalendarCheck size={16} aria-hidden="true" />
            {t("មើលប្រវត្តិរូប", "View profile")}
          </Link>
        </section>
      )}

      <EducationalNote className="mt-6" />
    </Shell>
  );
}
