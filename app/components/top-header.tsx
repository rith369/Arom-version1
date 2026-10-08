"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { useLanguage } from "../_components/language-provider";
import { useSidebar } from "../_components/sidebar-provider";
import { UserAvatar } from "../_components/user-avatar";

export type TopHeaderProps = {
  level?: number;
  currentXp?: number;
  maxXp?: number;
  streak?: number;
  coins?: number;
  onOpenSidebar?: () => void;
};

export function TopHeader({
  level = 4,
  currentXp = 54,
  maxXp = 100,
  streak = 0,
  coins = 98,
  onOpenSidebar,
}: TopHeaderProps) {
  const { language } = useLanguage();
  const sidebar = useSidebar();
  const km = language === "km";

  const handleOpenSidebar = onOpenSidebar || sidebar.openSidebar;

  const xpPercent = Math.min(100, Math.max(0, (currentXp / maxXp) * 100));

  return (
    <header className="flex w-full items-center justify-between gap-3 pt-2">
      {/* LEFT: Level Badge, Circular Progress, & XP Bar (AROM Brand Green) */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Circular Progress Ring with AROM brand green arc */}
        <div className="relative flex size-10 shrink-0 items-center justify-center">
          <svg className="size-10" viewBox="0 0 36 36" aria-hidden="true">
            {/* Background track circle using AROM border token */}
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="var(--arom-border)"
              strokeWidth="3.2"
            />
            {/* AROM brand green progress arc */}
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="var(--arom)"
              strokeWidth="3.2"
              strokeDasharray="94.25"
              strokeDashoffset={94.25 * (1 - xpPercent / 100)}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          </svg>
          <span className="absolute text-[13px] font-bold text-arom">
            {level}
          </span>
        </div>

        {/* Level Label & XP Progress Bar */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-bold text-ink sm:text-sm leading-none">
            {km ? `កម្រិត ${level}` : `Level ${level}`}
          </span>
          <div className="mt-1.5 h-2 w-24 sm:w-28 rounded-full border border-arom-border bg-white overflow-hidden shadow-xs">
            <div
              className="h-full rounded-full bg-arom transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <span className="mt-1 text-[10.5px] font-semibold text-ink-muted leading-none">
            {currentXp} / {maxXp} XP
          </span>
        </div>
      </div>

      {/* RIGHT: Gamification Badges (Streak, Coins), & Menu Button */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Streak Pill: AROM soft border and subtle ambient shadow */}
        <div
          title={km ? `ថ្ងៃជាប់គ្នា: ${streak} ថ្ងៃ` : `Streak: ${streak} days`}
          className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-white border border-arom-border px-2.5 sm:px-3 py-1 shadow-[0_2px_8px_rgba(20,54,47,0.06)] transition-all hover:border-arom/40 cursor-default select-none"
        >
          <Flame className="size-4 text-[#ec4899]" strokeWidth={2.2} />
          <span className="text-xs sm:text-sm font-bold text-ink">{streak}</span>
        </div>

        {/* Coins Pill: AROM soft border and subtle ambient shadow */}
        <div
          title={km ? `កាក់ AROM: ${coins}` : `AROM Coins: ${coins}`}
          className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-white border border-arom-border px-2.5 sm:px-3 py-1 shadow-[0_2px_8px_rgba(20,54,47,0.06)] transition-all hover:border-amber-400/50 cursor-default select-none"
        >
          <svg
            className="size-4 text-[#f59e0b]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="6" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
            <path d="M18 12a6 6 0 1 1-6-6" />
            <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
          </svg>
          <span className="text-xs sm:text-sm font-bold text-ink">{coins}</span>
        </div>

        {/* Hamburger Menu Button (AROM brand green palette, opens mobile sidebar drawer) */}
        <button
          type="button"
          onClick={handleOpenSidebar}
          aria-label={km ? "បើកម៉ឺនុយរុករក" : "Open sidebar navigation"}
          className="flex size-9 sm:size-10 items-center justify-center rounded-2xl bg-arom-soft border border-arom/30 shadow-[0_2px_10px_rgba(31,111,91,0.12)] text-arom transition-all hover:bg-arom-soft/80 hover:shadow-[0_4px_14px_rgba(31,111,91,0.18)] active:scale-95 cursor-pointer lg:hidden"
        >
          <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1f6f5b"
            strokeWidth="2.4"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="16" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>

        {/* Desktop Profile avatar (displayed on laptop since sidebar is already auto-opened) */}
        <Link
          href="/profile"
          aria-label={km ? "ប្រវត្តិរូប និងការកំណត់" : "Profile and settings"}
          className="hidden rounded-full ring-2 ring-white shadow-[0_4px_14px_rgba(31,111,91,0.18)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-arom lg:inline-flex"
        >
          <UserAvatar className="size-10 rounded-full text-xs" />
        </Link>
      </div>
    </header>
  );
}
