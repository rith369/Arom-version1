"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowLeftRight,
  Bookmark,
  BookmarkCheck,
  CalendarCheck2,
  Headphones,
  Monitor,
  Play,
  Radio,
  Star,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import {
  getAvailabilityLabel,
  getLanguageLabel,
  getSessionOptionLabel,
  getSpecialtyLabel,
  getTherapistAbout,
  getTherapistExperience,
  getTherapistName,
  getTherapistRole,
  type SessionOption,
  type Therapist,
} from "@/lib/therapists";
import { DesktopNavigation, MobileNavigation } from "./app-navigation";
import { useLanguage } from "./language-provider";

const sessionIcons: Record<SessionOption, LucideIcon> = {
  Online: Monitor,
  "In-person": UserRound,
  Both: ArrowLeftRight,
};

export function TherapistDetail({ therapist }: { therapist: Therapist }) {
  const { language } = useLanguage();
  const km = language === "km";
  const name = getTherapistName(therapist, km);
  const role = getTherapistRole(therapist, km);
  const experience = getTherapistExperience(therapist, km);
  const about = getTherapistAbout(therapist, km);
  const availability = getAvailabilityLabel(therapist.availability, km);
  const bookingHref = `/professional/${therapist.slug}/book`;
  const podcastHref = `/professional/${therapist.slug}/podcast`;
  const [isSaved, setIsSaved] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Professional" />

      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8 xl:px-14">
        <div className="mx-auto w-full max-w-[68rem]">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/professional"
              className="group inline-flex min-h-11 items-center gap-2 rounded-full pr-4 text-sm font-semibold text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-150 group-hover:-translate-x-0.5">
                <ArrowLeft aria-hidden="true" size={20} />
              </span>
              <span className="hidden sm:inline">
                {km ? "ត្រឡប់ទៅបញ្ជីអ្នកជំនាញ" : "Back to professionals"}
              </span>
            </Link>
            <p className="hidden text-xs font-semibold uppercase tracking-[0.15em] text-arom-accent lg:block">
              {km ? "ប្រវត្តិរូបអ្នកជំនាញ" : "Professional profile"}
            </p>
          </div>

          <motion.article
            initial={shouldReduceMotion ? false : { opacity: 0, transform: "translateY(8px)" }}
            animate={{ opacity: 1, transform: "translateY(0)" }}
            transition={{ duration: shouldReduceMotion ? 0.16 : 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="mt-5 grid gap-6 lg:mt-8 lg:grid-cols-[minmax(22rem,0.92fr)_minmax(0,1.08fr)] lg:gap-10"
          >
            <div>
              <div className="relative aspect-[1.77/1] overflow-hidden rounded-2xl bg-arom-soft shadow-card sm:aspect-[1.7/1] lg:aspect-[1.08/1] lg:rounded-[1.75rem]">
                <Image
                  src={therapist.image}
                  alt={km ? `រូបថតរបស់ ${name}` : `Portrait of ${therapist.name}`}
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 42vw"
                  className="object-cover"
                  style={{ objectPosition: therapist.imagePosition }}
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-arom shadow-sm backdrop-blur-sm">
                  <span aria-hidden="true" className="size-2.5 rounded-full bg-arom-accent" />
                  {availability}
                </div>
              </div>

              <div className="mt-6 hidden rounded-3xl bg-arom p-6 text-white lg:block">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-white/12">
                    <CalendarCheck2 aria-hidden="true" size={22} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {km ? "ត្រៀមខ្លួនជជែកពិគ្រោះហើយឬនៅ?" : "Ready to talk?"}
                    </p>
                    <p className="mt-0.5 text-xs text-white/68">
                      {km
                        ? "ជ្រើសរើសជួបផ្ទាល់ ឬតាមអនឡាញ រួចជ្រើសរើសពេលវេលា។"
                        : "Choose online or in person, then pick a time."}
                    </p>
                  </div>
                </div>
                <Link
                  href={bookingHref}
                  className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-white px-5 text-sm font-bold text-arom transition-colors duration-150 hover:bg-arom-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {km ? "កក់ការណាត់ជួប (Book Appointment)" : "Book Appointment"}
                </Link>
              </div>
            </div>

            <div className="min-w-0 lg:py-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-[1.75rem] font-bold leading-tight tracking-[-0.04em] text-ink sm:text-3xl lg:text-[2.65rem]">
                    {name}
                  </h1>
                  <p className="mt-1 text-base text-ink-muted lg:text-lg">{role}</p>
                  <p className="mt-1 text-sm text-ink-muted">{experience}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-ink">
                    <Star aria-hidden="true" size={18} className="fill-[#f6c445] text-[#f6c445]" />
                    <span className="font-bold">{therapist.rating.toFixed(1)}</span>
                    <span className="text-ink-muted">
                      ({therapist.reviews} {km ? "ការវាយតម្លៃ" : "reviews"})
                    </span>
                  </p>
                  {therapist.podcast && (
                    <Link
                      href={podcastHref}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-arom/30 bg-arom-soft/60 px-3.5 py-1.5 text-xs font-semibold text-arom-deep transition-colors hover:bg-arom-soft focus-visible:outline-2 focus-visible:outline-arom"
                    >
                      <Headphones size={14} className="text-arom" />
                      <span>
                        {km
                          ? `ស្តាប់ផតខាស • ${therapist.podcast.kmEpisodeNumber} (${therapist.podcast.duration})`
                          : `Listen to Podcast • ${therapist.podcast.episodeNumber} (${therapist.podcast.duration})`}
                      </span>
                    </Link>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsSaved((current) => !current)}
                  aria-label={
                    isSaved
                      ? km
                        ? "លុបចេញពីការរក្សាទុក"
                        : "Remove saved therapist"
                      : km
                        ? "រក្សាទុកអ្នកជំនាញ"
                        : "Save therapist"
                  }
                  aria-pressed={isSaved}
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom ${
                    isSaved ? "bg-arom text-white" : "bg-white text-ink hover:bg-arom-wash hover:text-arom"
                  }`}
                >
                  {isSaved ? <BookmarkCheck aria-hidden="true" size={20} /> : <Bookmark aria-hidden="true" size={20} />}
                </button>
              </div>

              <section aria-labelledby="about-heading" className="mt-7 border-t border-arom-border pt-6">
                <h2 id="about-heading" className="text-xl font-bold tracking-[-0.02em] text-ink">
                  {km ? "អំពីអ្នកជំនាញ (About)" : "About"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted lg:text-[0.95rem] lg:leading-7">
                  {about}
                </p>
              </section>

              <section aria-labelledby="support-heading" className="mt-6">
                <h2 id="support-heading" className="text-xl font-bold tracking-[-0.02em] text-ink">
                  {km ? "ជំនាញឯកទេសគាំទ្រ (Specialties)" : "Area Support"}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {therapist.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full bg-arom-soft px-4 py-2 text-sm font-semibold text-arom"
                    >
                      {getSpecialtyLabel(specialty, km)}
                    </span>
                  ))}
                </div>
              </section>

              <div className="mt-6 grid gap-6 border-t border-arom-border pt-6 sm:grid-cols-[0.7fr_1.3fr]">
                <section aria-labelledby="languages-heading">
                  <h2 id="languages-heading" className="text-base font-bold text-ink">
                    {km ? "ភាសាប្រឹក្សា (Languages)" : "Languages"}
                  </h2>
                  <p className="mt-1.5 text-sm text-ink-muted">
                    {therapist.languages.map((l) => getLanguageLabel(l, km)).join(", ")}
                  </p>
                </section>

                <section aria-labelledby="sessions-heading">
                  <h2 id="sessions-heading" className="text-base font-bold text-ink">
                    {km ? "ជម្រើសនៃការប្រឹក្សា (Session Options)" : "Session Options"}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {therapist.sessionOptions.map((option) => {
                      const Icon = sessionIcons[option];
                      return (
                        <span
                          key={option}
                          className="flex h-10 items-center gap-2 rounded-full border border-arom-border bg-white px-4 text-sm font-semibold text-ink-muted"
                        >
                          <Icon aria-hidden="true" size={17} className="text-arom" />
                          {getSessionOptionLabel(option, km)}
                        </span>
                      );
                    })}
                  </div>
                </section>
              </div>

              {therapist.podcast && (
                <section aria-labelledby="podcast-card-heading" className="mt-8 border-t border-arom-border pt-6">
                  <div className="flex items-center justify-between">
                    <h2 id="podcast-card-heading" className="text-base font-bold text-ink">
                      {km ? "ផតខាស និងសំឡេង" : "Therapist Voice & Podcast"}
                    </h2>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-arom">
                      <Radio size={13} className="animate-pulse" />
                      {km ? therapist.podcast.kmEpisodeNumber : therapist.podcast.episodeNumber}
                    </span>
                  </div>

                  <Link
                    href={podcastHref}
                    className="group mt-3 block rounded-2xl border border-arom-border bg-gradient-to-br from-white via-arom-wash/40 to-arom-soft/30 p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-arom/40 hover:shadow-card focus-visible:outline-2 focus-visible:outline-arom"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1 rounded-full bg-arom-soft px-2.5 py-0.5 text-[0.68rem] font-bold text-arom-deep">
                          {km ? therapist.podcast.kmTopic : therapist.podcast.topic}
                        </span>
                        <h3 className="mt-2 text-sm font-bold text-ink transition-colors group-hover:text-arom sm:text-base">
                          {km ? therapist.podcast.kmTitle : therapist.podcast.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                          {km ? therapist.podcast.kmSubtitle : therapist.podcast.subtitle}
                        </p>
                      </div>
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-arom text-white shadow-md transition-transform duration-200 group-hover:scale-105 group-hover:bg-arom-deep">
                        <Play size={18} className="ml-0.5 fill-current" />
                      </div>
                    </div>

                    <div className="mt-3.5 flex items-center justify-between border-t border-arom-border/60 pt-3 text-xs">
                      <span className="text-ink-muted font-medium">
                        {km ? `រយៈពេល៖ ${therapist.podcast.duration}` : `Duration: ${therapist.podcast.duration}`}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-arom group-hover:underline">
                        <Headphones size={13} />
                        {km ? "បើកស្តាប់ភាគពេញលេញ" : "Open Full Episode"} &rarr;
                      </span>
                    </div>
                  </Link>
                </section>
              )}

              <Link
                href={bookingHref}
                className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-arom px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(31,111,91,0.2)] transition-[background-color,box-shadow] duration-150 hover:bg-arom-deep hover:shadow-[0_14px_32px_rgba(31,111,91,0.26)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom lg:hidden"
              >
                {km ? "កក់ការណាត់ជួប (Book Appointment)" : "Book Appointment"}
              </Link>
            </div>
          </motion.article>
        </div>
      </main>

      <MobileNavigation active="Professional" />
    </div>
  );
}
