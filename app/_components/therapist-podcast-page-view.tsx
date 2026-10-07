"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, Headphones, UserRound } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Therapist } from "@/lib/therapists";
import {
  getSpecialtyLabel,
  getTherapistName,
  getTherapistRole,
} from "@/lib/therapists";
import { DesktopNavigation, MobileNavigation } from "./app-navigation";
import { useLanguage } from "./language-provider";
import { TherapistPodcastPlayer } from "./therapist-podcast-player";

export function TherapistPodcastPageView({ therapist }: { therapist: Therapist }) {
  const { language } = useLanguage();
  const km = language === "km";
  const name = getTherapistName(therapist, km);
  const role = getTherapistRole(therapist, km);
  const shouldReduceMotion = useReducedMotion();
  const podcast = therapist.podcast;

  if (!podcast) return null;

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Professional" />

      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8 xl:px-14">
        <div className="mx-auto w-full max-w-[68rem]">
          {/* Top Header / Back Link to Profile */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/professional/${therapist.slug}`}
              className="group inline-flex min-h-11 items-center gap-2 rounded-full pr-4 text-sm font-semibold text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-150 group-hover:-translate-x-0.5">
                <ArrowLeft aria-hidden="true" size={20} />
              </span>
              <span>
                {km ? `ត្រឡប់ទៅ ${name}` : `Back to ${therapist.name}'s profile`}
              </span>
            </Link>

            <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
              <span className="hidden sm:inline">
                {km ? "អ្នកជំនាញ" : "Professionals"} &rsaquo; {name} &rsaquo;
              </span>
              <span className="flex items-center gap-1 rounded-full bg-arom-soft px-3 py-1 font-bold text-arom-deep">
                <Headphones size={13} />
                {km ? podcast.kmEpisodeNumber : podcast.episodeNumber}
              </span>
            </div>
          </div>

          {/* Practitioner Quick Bio Bar */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, transform: "translateY(8px)" }}
            animate={{ opacity: 1, transform: "translateY(0)" }}
            transition={{ duration: shouldReduceMotion ? 0.16 : 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-arom-border bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-full ring-2 ring-arom-soft sm:size-16">
                <Image
                  src={therapist.image}
                  alt={km ? name : therapist.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                  style={{ objectPosition: therapist.imagePosition }}
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-ink sm:text-lg">{name}</h1>
                <p className="text-xs font-medium text-ink-muted sm:text-sm">{role}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {therapist.specialties.slice(0, 3).map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full bg-arom-soft/80 px-2 py-0.5 text-[0.68rem] font-semibold text-arom-deep"
                    >
                      {getSpecialtyLabel(specialty, km)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/professional/${therapist.slug}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-arom-border px-3.5 py-2 text-xs font-bold text-arom transition-colors hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom"
              >
                <UserRound size={14} />
                {language === "km" ? "មើលប្រវត្តិរូប" : "View Profile"}
              </Link>
              <Link
                href={`/professional/${therapist.slug}/book`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-arom px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-arom"
              >
                <CalendarCheck size={14} />
                <span>{language === "km" ? "កក់ការណាត់ជួប (Book Session)" : "Book Session"}</span>
              </Link>
            </div>
          </motion.div>

          {/* Full Interactive Podcast Player Console & Content */}
          <TherapistPodcastPlayer therapist={therapist} />
        </div>
      </main>

      <MobileNavigation active="Professional" />
    </div>
  );
}
