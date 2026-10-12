"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, Clock, Headphones, Lightbulb } from "lucide-react";
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
  type MindGuidePodcast,
} from "./podcast-data";
import { PodcastPlayer } from "./podcast-player";

const easeOut = [0.23, 1, 0.32, 1] as const;

function useFormatDate() {
  const { language } = useLanguage();
  const formatter = new Intl.DateTimeFormat(language === "km" ? "km-KH" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Phnom_Penh",
  });
  return (value: string) => formatter.format(new Date(`${value}T00:00:00+07:00`));
}

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

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-11 items-center gap-2 rounded-full pr-4 text-sm font-semibold text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-150 group-hover:-translate-x-0.5">
        <ArrowLeft aria-hidden="true" size={20} />
      </span>
      {label}
    </Link>
  );
}

function GuestLine({ podcast }: { podcast: MindGuidePodcast }) {
  const { language } = useLanguage();
  const km = language === "km";
  const guest = podcast.guestProfessionalId ? getTherapist(podcast.guestProfessionalId) : undefined;

  return (
    <span>
      {km ? "ក្រុម AROM" : "AROM team"}
      {guest && (km ? ` ជាមួយ ${getTherapistName(guest, km)}` : ` with ${guest.name}`)}
    </span>
  );
}

export function PodcastsHomeView() {
  const { language } = useLanguage();
  const km = language === "km";
  const formatDate = useFormatDate();
  const shouldReduceMotion = useReducedMotion();

  const episodes = [...MINDGUIDE_PODCASTS].sort((a, b) =>
    b.publishedDate.localeCompare(a.publishedDate),
  );

  return (
    <Shell>
      <BackLink href="/mindguide" label={km ? "មគ្គុទ្ទេសក៍ចិត្ត (MindGuide)" : "MindGuide"} />

      <header className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-arom-accent">
          {km ? "ស្តាប់ និងស្វែងយល់ (Listen and learn)" : "Listen and learn"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-arom lg:text-4xl">
          {km ? "ផតខាស (Podcasts)" : "Podcasts"}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink-muted sm:text-base">
          {km
            ? "ការសន្ទនាខ្លីៗពីក្រុម AROM អំពីការថែរក្សាចិត្តរបស់អ្នក ក្នុងភាសាខ្មែរ និងអង់គ្លេស។"
            : "Short conversations from the AROM team about caring for your mind, in Khmer and English."}
        </p>
      </header>

      <ul className="mt-7 space-y-4">
        {episodes.map((podcast, index) => (
          <motion.li
            key={podcast.id}
            initial={shouldReduceMotion ? false : { opacity: 0, transform: "translateY(8px)" }}
            animate={{ opacity: 1, transform: "translateY(0)" }}
            transition={{ duration: 0.24, delay: shouldReduceMotion ? 0 : index * 0.05, ease: easeOut }}
          >
            <Link
              href={`/podcasts/${podcast.id}`}
              className="group flex gap-4 rounded-3xl border border-arom-border bg-white p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-arom/40 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom sm:p-5"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-arom-accent/20 text-arom sm:size-16">
                <Headphones size={26} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 text-xs font-semibold text-arom-deep">
                  <span className="rounded-full bg-arom-soft px-2.5 py-0.5">
                    {km ? podcast.kmTopic : podcast.topic}
                  </span>
                  <span className="flex items-center gap-1 text-ink-muted">
                    <Clock size={12} aria-hidden="true" />
                    {formatDuration(podcast.durationSeconds, km)}
                  </span>
                </span>
                <span className="mt-2 block text-base font-bold text-ink group-hover:text-arom sm:text-lg">
                  {km ? podcast.kmTitle : podcast.title}
                </span>
                <span className="mt-1 line-clamp-2 block text-sm leading-6 text-ink-muted">
                  {km ? podcast.kmDescription : podcast.description}
                </span>
                <span className="mt-2 block text-xs text-ink-muted">
                  <GuestLine podcast={podcast} /> · {formatDate(podcast.publishedDate)}
                </span>
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </Shell>
  );
}

export function PodcastEpisodeView({ podcast }: { podcast: MindGuidePodcast }) {
  const { language } = useLanguage();
  const km = language === "km";
  const formatDate = useFormatDate();
  const guest = podcast.guestProfessionalId ? getTherapist(podcast.guestProfessionalId) : undefined;

  return (
    <Shell>
      <BackLink href="/podcasts" label={km ? "ផតខាសទាំងអស់" : "All podcasts"} />

      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-arom-deep">
          <span className="rounded-full bg-arom-soft px-2.5 py-0.5">
            {km ? podcast.kmTopic : podcast.topic}
          </span>
          <span className="text-ink-muted">
            {formatDuration(podcast.durationSeconds, km)} · {formatDate(podcast.publishedDate)}
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold leading-tight text-arom sm:text-3xl">
          {km ? podcast.kmTitle : podcast.title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-ink sm:text-base">
          {km ? podcast.kmDescription : podcast.description}
        </p>
      </header>

      <div className="mt-6">
        <PodcastPlayer podcast={podcast} />
      </div>

      {podcast.takeaways.length > 0 && (
        <section className="mt-6 rounded-3xl border border-arom/20 bg-arom-wash p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-arom">
            <Lightbulb size={16} aria-hidden="true" />
            {km ? "ចំណុចសំខាន់ៗ (Key points)" : "Key points"}
          </h2>
          <ul className="mt-3 space-y-2.5 text-sm leading-6 text-ink">
            {podcast.takeaways.map((takeaway) => (
              <li key={takeaway.en} className="flex items-start gap-2.5">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-arom" />
                <span>{km ? takeaway.km : takeaway.en}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {guest && (
        <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-arom-border bg-white p-5 shadow-sm">
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
              <p className="text-xs font-semibold text-ink-muted">{km ? "ភ្ញៀវ" : "Guest"}</p>
              <p className="text-base font-bold text-ink">{getTherapistName(guest, km)}</p>
              <p className="text-xs text-ink-muted">{getTherapistRole(guest, km)}</p>
            </div>
          </div>
          <Link
            href={`/professional/${guest.slug}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-arom px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-arom"
          >
            <CalendarCheck size={16} aria-hidden="true" />
            {km ? "មើលប្រវត្តិរូប" : "View profile"}
          </Link>
        </section>
      )}

      <EducationalNote className="mt-6" />
    </Shell>
  );
}
