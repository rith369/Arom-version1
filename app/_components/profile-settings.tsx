"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Globe2,
  Activity,
  Heart,
  Languages,
  LogOut,
  Moon,
  Shield,
  UserRound,
  Volume2,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { AromBrand, DesktopNavigation, MobileNavigation } from "./app-navigation";
import { LanguageSwitcher, useLanguage, type Language } from "./language-provider";
import { ProfileSummary } from "./profile-summary";

const easeOut = [0.23, 1, 0.32, 1] as const;

export function ProfileSettings() {
  const { language, setLanguage } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const km = language === "km";

  // Mock preference toggles
  const [morningReminder, setMorningReminder] = useState(true);
  const [eveningReflection, setEveningReflection] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.05 },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      transform: shouldReduceMotion ? "translateY(0)" : "translateY(10px)",
    },
    visible: {
      opacity: 1,
      transform: "translateY(0)",
      transition: { duration: shouldReduceMotion ? 0.16 : 0.26, ease: easeOut },
    },
  };

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Profile" />

      <div className="min-w-0">
        <motion.main
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mx-auto min-h-screen w-full max-w-[58rem] px-4 pb-28 pt-5 sm:px-8 sm:pt-7 lg:px-10 lg:pb-12 lg:pt-8"
        >
          {/* Header */}
          <motion.header variants={itemVariants} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                aria-label="Back to home"
                className="group flex size-11 items-center justify-center rounded-full border border-arom-border bg-white text-arom shadow-sm transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom"
              >
                <ArrowLeft
                  aria-hidden="true"
                  size={20}
                  className="transition-transform duration-150 group-hover:-translate-x-0.5"
                />
              </Link>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                  {km ? "ប្រវត្តិរូប និងការកំណត់ (Profile & Settings)" : "Profile & Settings"}
                </h1>
                <p className="text-xs text-ink-muted sm:text-sm">
                  {km
                    ? "គ្រប់គ្រងភាសា និងចំណូលចិត្តសុខុមាលភាពរបស់អ្នក"
                    : "Manage your language and wellness preferences"}
                </p>
              </div>
            </div>

            <div className="lg:hidden">
              <AromBrand compact />
            </div>
          </motion.header>

          {/* User Profile Card */}
          <motion.section
            variants={itemVariants}
            aria-label="User profile summary"
            className="mt-6 overflow-hidden rounded-3xl border border-arom-border bg-gradient-to-br from-white via-white to-arom-wash p-5 shadow-card sm:p-6"
          >
            <ProfileSummary km={km} />

            {/* Wellness Stats Row */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-arom-border/60 pt-5">
              <div className="rounded-2xl bg-arom-wash/70 p-3 text-center sm:p-3.5">
                <div className="mx-auto flex size-7 items-center justify-center rounded-full bg-arom-accent/20 text-arom sm:size-8">
                  <Flame size={16} />
                </div>
                <p className="mt-1.5 text-sm font-bold text-ink sm:text-base">14</p>
                <p className="text-[0.66rem] font-medium text-ink-muted sm:text-xs">
                  {km ? "ថ្ងៃជាប់គ្នា (Day streak)" : "Day streak"}
                </p>
              </div>

              <div className="rounded-2xl bg-arom-wash/70 p-3 text-center sm:p-3.5">
                <div className="mx-auto flex size-7 items-center justify-center rounded-full bg-arom-accent/20 text-arom sm:size-8">
                  <Activity size={16} />
                </div>
                <p className="mt-1.5 text-sm font-bold text-ink sm:text-base">18</p>
                <p className="text-[0.66rem] font-medium text-ink-muted sm:text-xs">
                  {km ? "វគ្គហាត់ចិត្ត (Sessions)" : "Sessions"}
                </p>
              </div>

              <div className="rounded-2xl bg-arom-wash/70 p-3 text-center sm:p-3.5">
                <div className="mx-auto flex size-7 items-center justify-center rounded-full bg-arom-accent/20 text-arom sm:size-8">
                  <Clock size={16} />
                </div>
                <p className="mt-1.5 text-sm font-bold text-ink sm:text-base">126</p>
                <p className="text-[0.66rem] font-medium text-ink-muted sm:text-xs">
                  {km ? "នាទីសមាធិ (Mindful mins)" : "Mindful mins"}
                </p>
              </div>
            </div>
          </motion.section>

          {/* LANGUAGE SETTINGS (PRIMARY FOCUS) */}
          <motion.section
            variants={itemVariants}
            aria-labelledby="language-settings-title"
            className="mt-6 rounded-3xl border border-arom/30 bg-white p-5 shadow-card sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-arom text-white shadow-sm">
                  <Languages size={22} />
                </div>
                <div>
                  <h2 id="language-settings-title" className="text-base font-bold text-ink sm:text-lg">
                    {km ? "ការកំណត់ភាសា (Language Preference)" : "Language Preference"}
                  </h2>
                  <p className="text-xs text-ink-muted sm:text-sm">
                    {km
                      ? "ជ្រើសរើសភាសាសម្រាប់កម្មវិធី និងមេរៀនទាំងអស់"
                      : "Choose the language used across the app and lessons"}
                  </p>
                </div>
              </div>

              {/* Exact toggle pill from screenshot */}
              <div className="self-start sm:self-auto">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Full Selectable Language Cards */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`group flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom ${
                  language === "en"
                    ? "border-arom bg-arom/8 shadow-[0_0_0_1px_var(--arom)]"
                    : "border-arom-border bg-white hover:border-arom/40 hover:bg-arom-wash/50"
                }`}
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm ring-1 ring-arom-border">
                  🇬🇧
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-ink">English</p>
                    {language === "en" && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-arom text-white">
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">English (US / UK)</p>
                  <p className="mt-1 text-[0.72rem] text-ink-muted/80">
                    System UI, MindGuide lessons, and booking in English.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLanguage("km")}
                className={`group flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom ${
                  language === "km"
                    ? "border-arom bg-arom/8 shadow-[0_0_0_1px_var(--arom)]"
                    : "border-arom-border bg-white hover:border-arom/40 hover:bg-arom-wash/50"
                }`}
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm ring-1 ring-arom-border">
                  🇰🇭
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-khmer text-sm font-bold text-ink">ភាសាខ្មែរ</p>
                    {language === "km" && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-arom text-white">
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">Khmer</p>
                  <p className="mt-1 font-khmer text-[0.72rem] text-ink-muted/80">
                    ចំណុចប្រទាក់ មេរៀនមគ្គុទ្ទេសក៍ចិត្ត (MindGuide) និងការកក់ជាភាសាខ្មែរ។
                  </p>
                </div>
              </button>
            </div>
          </motion.section>

          {/* WELLBEING & NOTIFICATION PREFERENCES */}
          <motion.section
            variants={itemVariants}
            aria-labelledby="wellness-settings-title"
            className="mt-6 rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6"
          >
            <h2 id="wellness-settings-title" className="text-base font-bold text-ink sm:text-lg">
              {km ? "ការជូនដំណឹង និងសុខុមាលភាព (Notifications & Wellbeing)" : "Notifications & Wellbeing"}
            </h2>
            <p className="text-xs text-ink-muted sm:text-sm">
              {km
                ? "កំណត់ពេលរំលឹក និងទម្លាប់ពិនិត្យអារម្មណ៍ប្រចាំថ្ងៃ"
                : "Customize your daily check-in habits and reminders"}
            </p>

            <div className="mt-4 divide-y divide-arom-border/60">
              {/* Reminder 1 */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-arom-soft text-arom">
                    <Bell size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {km ? "រំលឹកពិនិត្យអារម្មណ៍ពេលព្រឹក (Morning Check-in)" : "Morning mood check-in"}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {km ? "រៀងរាល់ព្រឹក ម៉ោង ៨:០០ ព្រឹក" : "Every morning at 8:00 AM"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={morningReminder}
                  onClick={() => setMorningReminder((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-arom ${
                    morningReminder ? "bg-arom" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      morningReminder ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Reminder 2 */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-arom-soft text-arom">
                    <Moon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {km ? "រំលឹកដកដង្ហើមពេលយប់ (Evening Breathwork)" : "Evening breathwork reminder"}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {km ? "រៀងរាល់យប់ ម៉ោង ៩:៣០ យប់" : "Every evening at 9:30 PM"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={eveningReflection}
                  onClick={() => setEveningReflection((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-arom ${
                    eveningReflection ? "bg-arom" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      eveningReflection ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Sound effects */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-arom-soft text-arom">
                    <Volume2 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {km ? "សំឡេងបន្ធូរអារម្មណ៍ (Calming Sound & Haptics)" : "Calming sound & haptics"}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {km ? "សំឡេងរំងាប់អារម្មណ៍ពេលអនុវត្តលំហាត់" : "Gentle audio feedback during exercises"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={soundEffects}
                  onClick={() => setSoundEffects((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-arom ${
                    soundEffects ? "bg-arom" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block size-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      soundEffects ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.section>

          {/* QUICK LINKS & APP NAVIGATION */}
          <motion.section
            variants={itemVariants}
            aria-label="Quick links"
            className="mt-6 rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6"
          >
            <h2 className="text-base font-bold text-ink sm:text-lg">
              {km ? "សេវាកម្ម និងជំនួយ (Services & Support)" : "Services & Support"}
            </h2>

            <div className="mt-4 divide-y divide-arom-border/60">
              <Link
                href="/professional"
                className="group flex items-center justify-between py-3.5 text-ink transition-colors duration-150 hover:text-arom"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-arom-soft text-arom">
                    <Heart size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {km ? "ស្វែងរកអ្នកជំនាញ (Find a Professional)" : "Find a Professional"}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {km ? "ពិភាក្សាជាមួយអ្នកជំនាញដែលមានអាជ្ញាប័ណ្ណត្រឹមត្រូវ" : "Connect with certified specialists"}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-ink-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-arom"
                />
              </Link>

              <Link
                href="/mindguide"
                className="group flex items-center justify-between py-3.5 text-ink transition-colors duration-150 hover:text-arom"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-arom-soft text-arom">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {km ? "មេរៀនមគ្គុទ្ទេសក៍ចិត្ត (MindGuide Lessons)" : "MindGuide Lessons"}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {km ? "វិធីគ្រប់គ្រងភាពតានតឹង (Stress) ដំណេក និងការថប់បារម្ភ (Anxiety)" : "Managing stress, sleep, and anxiety"}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-ink-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-arom"
                />
              </Link>

              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="group flex w-full items-center justify-between py-3.5 text-left text-arom-danger transition-colors duration-150 hover:opacity-85"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-arom-danger-soft text-arom-danger">
                      <LogOut size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {km ? "ចាកចេញពីគណនី (Log Out)" : "Log out"}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {km ? "ចាកចេញពីគណនីលើឧបករណ៍នេះ" : "Sign out from this device"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-ink-muted" />
                </button>
              </form>
            </div>
          </motion.section>
        </motion.main>
      </div>

      <MobileNavigation active="Profile" />
    </div>
  );
}
