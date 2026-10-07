"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Settings,
  X,
  Flame,
  Globe,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSidebar } from "./sidebar-provider";
import { useLanguage } from "./language-provider";
import { useDetection } from "./detection-provider";
import { AromBrand } from "./app-navigation";
import { NAVIGATION_SECTIONS, type NavItem } from "./navigation-config";

export function MobileSidebarDrawer() {
  const { isOpen, closeSidebar } = useSidebar();
  const { language, setLanguage } = useLanguage();
  const { openDetection } = useDetection();
  const pathname = usePathname();

  const isKm = language === "km";

  // Determine active item from current route pathname
  const getIsActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay tinted with AROM dark ink */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-[#14221f]/35 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer container matching AROM sidebar aesthetic */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 left-0 flex w-[86%] max-w-[330px] flex-col bg-white shadow-2xl border-r border-arom-border overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={isKm ? "ម៉ឺនុយរុករក (Navigation Menu)" : "Navigation Menu"}
          >
            {/* Top header with AROM Brand & Refined Close Button */}
            <div className="flex items-center justify-between border-b border-arom-border/70 px-4 py-4 shrink-0">
              <AromBrand compact />
              <button
                type="button"
                onClick={closeSidebar}
                aria-label={isKm ? "បិទម៉ឺនុយ" : "Close menu"}
                className="flex size-9 items-center justify-center rounded-2xl bg-arom-wash text-arom hover:bg-arom-soft transition-colors border border-arom-border cursor-pointer active:scale-95"
              >
                <X size={18} strokeWidth={2.4} />
              </button>
            </div>

            {/* User Level & Wellness Progress Badge in AROM brand green style */}
            <div className="px-3.5 pt-3.5 shrink-0">
              <div className="rounded-2xl border border-arom-border bg-gradient-to-br from-arom-wash/70 to-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Circle badge */}
                    <div className="relative flex size-8 items-center justify-center shrink-0">
                      <svg className="size-8" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="var(--arom-border)"
                          strokeWidth="3.2"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="var(--arom)"
                          strokeWidth="3.2"
                          strokeDasharray="94.25"
                          strokeDashoffset="43.35"
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                        />
                      </svg>
                      <span className="absolute text-[11px] font-bold text-arom">
                        4
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-ink leading-tight">
                        {isKm ? "កម្រិត ៤ (Level 4)" : "Level 4"}
                      </p>
                      <p className="text-[10px] font-semibold text-ink-muted">
                        54 / 100 XP
                      </p>
                    </div>
                  </div>

                  {/* Pills row */}
                  <div className="flex items-center gap-1.5">
                    {/* Streak pill */}
                    <div className="flex items-center gap-1 rounded-full bg-white border border-arom-border px-2 py-0.5 shadow-xs">
                      <Flame size={12} className="text-[#ec4899]" strokeWidth={2.2} />
                      <span className="text-[10.5px] font-bold text-ink">0</span>
                    </div>
                    {/* Coins pill */}
                    <div className="flex items-center gap-1 rounded-full bg-white border border-arom-border px-2 py-0.5 shadow-xs">
                      <svg
                        className="size-3 text-[#f59e0b]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="8" cy="8" r="6" />
                        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                        <path d="M18 12a6 6 0 1 1-6-6" />
                        <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
                      </svg>
                      <span className="text-[10.5px] font-bold text-ink">98</span>
                    </div>
                  </div>
                </div>

                {/* Mini progress bar in AROM brand green */}
                <div className="mt-2 h-1.5 w-full rounded-full border border-arom-border/60 bg-white overflow-hidden">
                  <div
                    className="h-full rounded-full bg-arom"
                    style={{ width: "54%" }}
                  />
                </div>
              </div>
            </div>

            {/* 3 Navigation Sections: Main Page, Professional, Community */}
            <nav aria-label="Mobile Primary" className="mt-4 flex-1 space-y-4 px-3">
              {NAVIGATION_SECTIONS.map((section) => (
                <div key={section.id} className="space-y-1">
                  {/* Section Title */}
                  <p className="px-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-muted/80">
                    {isKm ? section.kmTitle : section.enTitle}
                  </p>

                  {/* Section Items */}
                  <div className="flex flex-col gap-0.5">
                    {section.items.map((item: NavItem) => {
                      const Icon = item.icon;
                      const isActive =
                        item.id === "detection"
                          ? pathname.startsWith("/detection")
                          : getIsActive(item.href);

                      // Coming Soon item
                      if (item.isComingSoon) {
                        return (
                          <div
                            key={item.id}
                            title={
                              isKm
                                ? `${item.kmTitle}: មុខងារនេះនឹងមកដល់ឆាប់ៗនេះ (Coming Soon)`
                                : `${item.enTitle}: Coming Soon`
                            }
                            className="group flex min-h-10 items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium text-ink-muted/65 transition-colors cursor-default select-none"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon size={17} strokeWidth={1.8} className="shrink-0 text-ink-muted/50" />
                              <span className="truncate">
                                {isKm ? item.kmTitle : item.enTitle}
                              </span>
                            </div>
                            <span className="shrink-0 rounded-full bg-arom-wash px-1.5 py-0.5 text-[9.5px] font-bold text-arom border border-arom-border/60">
                              {isKm ? "ឆាប់ៗ" : "Soon"}
                            </span>
                          </div>
                        );
                      }

                      // Detection modal trigger
                      if (item.id === "detection") {
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              closeSidebar();
                              openDetection();
                            }}
                            aria-current={isActive ? "page" : undefined}
                            className={`group flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors duration-150 text-left cursor-pointer ${
                              isActive
                                ? "bg-arom-soft text-arom shadow-xs"
                                : "text-ink-muted hover:bg-arom-wash hover:text-arom"
                            }`}
                          >
                            <Icon size={18} strokeWidth={isActive ? 2.3 : 1.9} className="shrink-0" />
                            <span className="truncate">
                              {isKm ? item.kmTitle : item.enTitle}
                            </span>
                          </button>
                        );
                      }

                      // Standard navigation link
                      return (
                        <Link
                          key={item.id}
                          href={item.href || "/"}
                          onClick={closeSidebar}
                          aria-current={isActive ? "page" : undefined}
                          className={`group flex min-h-10 items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                            isActive
                              ? "bg-arom-soft text-arom shadow-xs"
                              : "text-ink-muted hover:bg-arom-wash hover:text-arom"
                          }`}
                        >
                          <Icon size={18} strokeWidth={isActive ? 2.3 : 1.9} className="shrink-0" />
                          <span className="truncate">
                            {isKm ? item.kmTitle : item.enTitle}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Profile & Settings Link matching DesktopNavigation */}
            <div className="mt-4 px-3 shrink-0">
              <Link
                href="/profile"
                onClick={closeSidebar}
                className={`group flex items-center gap-2.5 rounded-xl border p-2.5 transition-colors duration-150 ${
                  pathname.startsWith("/profile")
                    ? "border-arom/40 bg-arom-soft text-arom shadow-xs"
                    : "border-arom-border bg-white text-ink hover:border-arom/30 hover:bg-arom-wash"
                }`}
              >
                <Image
                  src="/brand/muoyly-avatar.svg"
                  alt="Muoyly"
                  width={34}
                  height={34}
                  className="size-8 rounded-full object-cover ring-2 ring-arom/20"
                  unoptimized
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold leading-tight text-ink">
                    Muoyly Seng
                  </p>
                  <p className="truncate text-[0.65rem] text-ink-muted">
                    {isKm
                      ? "ប្រវត្តិរូប និងការកំណត់ (Profile & Settings)"
                      : "Profile & Settings"}
                  </p>
                </div>
                <Settings
                  size={16}
                  className="text-ink-muted transition-transform duration-150 group-hover:rotate-45 group-hover:text-arom"
                />
              </Link>
            </div>

            {/* Language Switcher */}
            <div className="mt-2 px-3 shrink-0">
              <div className="flex items-center justify-between rounded-xl border border-arom-border bg-[#f8fbfa] p-2">
                <div className="flex items-center gap-2 pl-2">
                  <Globe size={15} className="text-arom" />
                  <span className="text-xs font-semibold text-ink">
                    {isKm ? "ភាសា (Language)" : "Language"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("km")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                      isKm
                        ? "bg-arom text-white shadow-xs"
                        : "text-ink-muted hover:bg-white hover:text-ink"
                    }`}
                  >
                    ខ្មែរ
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                      !isKm
                        ? "bg-arom text-white shadow-xs"
                        : "text-ink-muted hover:bg-white hover:text-ink"
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>

            {/* Mindful Card at bottom directly matching DesktopNavigation */}
            <div className="mt-4 p-3 shrink-0 pb-6">
              <div className="rounded-2xl bg-arom p-4 text-white shadow-md">
                <div className="mb-2.5 flex size-8 items-center justify-center rounded-full bg-white/14">
                  <Heart size={16} />
                </div>
                <p className="text-xs font-semibold leading-snug">
                  {isKm
                    ? "ទុកពេលវេលាសម្រាប់ខ្លួនឯង។"
                    : "Make space for yourself."}
                </p>
                <p className="mt-1 text-[11px] leading-4 text-white/70">
                  {isKm
                    ? "ការពិនិត្យនិងសួរសុខទុក្ខចិត្តខ្លួនឯងបន្តិច អាចផ្លាស់ប្តូរថ្ងៃរបស់អ្នកឱ្យកាន់តែស្រស់បំព្រង។"
                    : "A small check-in can change the shape of your day."}
                </p>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
