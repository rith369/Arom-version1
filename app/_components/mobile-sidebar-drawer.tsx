"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Settings,
  X,
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

            {/* 3 Navigation Sections: Main Page, Professional, Community */}
            <nav aria-label="Mobile Primary" className="mt-3 flex-1 space-y-4 px-3">
              {NAVIGATION_SECTIONS.map((section) => {
                const activeItems = section.items.filter((item) => !item.isComingSoon);
                const comingSoonItems = section.items.filter((item) => item.isComingSoon);

                return (
                  <div
                    key={section.id}
                    className="rounded-2xl border border-arom-border/60 bg-[#f8faf9] p-2 shadow-[0_1px_3px_rgba(20,54,47,0.03)] space-y-1"
                  >
                    {/* Section Header with subtle emerald dot */}
                    <div className="flex items-center gap-1.5 px-2.5 pt-1 pb-1.5">
                      <span className="size-1.5 rounded-full bg-arom/70" />
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-arom-deep">
                        {isKm ? section.kmTitle : section.enTitle}
                      </p>
                    </div>

                    {/* Active Section Items */}
                    <div className="flex flex-col gap-1">
                      {activeItems.map((item: NavItem) => {
                        const Icon = item.icon;
                        const isActive =
                          item.id === "detection"
                            ? pathname.startsWith("/detection")
                            : getIsActive(item.href);

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
                              className={`group flex min-h-[46px] w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left transition-all duration-150 cursor-pointer ${
                                isActive
                                  ? "bg-white text-arom shadow-xs ring-1 ring-arom/20"
                                  : "text-ink hover:bg-white hover:text-arom hover:shadow-2xs"
                              }`}
                            >
                              <div
                                className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-150 ${
                                  isActive
                                    ? "bg-arom text-white shadow-[0_2px_8px_rgba(31,111,91,0.28)]"
                                    : "bg-white text-arom border border-arom-border/70 group-hover:bg-arom-soft group-hover:border-arom/40"
                                }`}
                              >
                                <Icon size={19} strokeWidth={isActive ? 2.3 : 2} />
                              </div>
                              <span
                                className={`truncate text-sm font-semibold leading-tight ${
                                  isActive ? "text-arom font-bold" : "text-ink group-hover:text-arom"
                                }`}
                              >
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
                            className={`group flex min-h-[46px] items-center gap-3 rounded-xl px-2.5 py-1.5 transition-all duration-150 ${
                              isActive
                                ? "bg-white text-arom shadow-xs ring-1 ring-arom/20"
                                : "text-ink hover:bg-white hover:text-arom hover:shadow-2xs"
                            }`}
                          >
                            <div
                              className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-150 ${
                                isActive
                                  ? "bg-arom text-white shadow-[0_2px_8px_rgba(31,111,91,0.28)]"
                                  : "bg-white text-arom border border-arom-border/70 group-hover:bg-arom-soft group-hover:border-arom/40"
                              }`}
                            >
                              <Icon size={19} strokeWidth={isActive ? 2.3 : 2} />
                            </div>
                            <span
                              className={`truncate text-sm font-semibold leading-tight ${
                                isActive ? "text-arom font-bold" : "text-ink group-hover:text-arom"
                              }`}
                            >
                              {isKm ? item.kmTitle : item.enTitle}
                            </span>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Upcoming Items (if any in this section) */}
                    {comingSoonItems.length > 0 && (
                      <div className="pt-1.5 mt-1 border-t border-arom-border/50 space-y-0.5">
                        <p className="px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/70">
                          {isKm ? "មុខងារនឹងមកដល់ឆាប់ៗ" : "Coming Soon"}
                        </p>
                        {comingSoonItems.map((item: NavItem) => {
                          const Icon = item.icon;
                          return (
                            <div
                              key={item.id}
                              title={
                                isKm
                                  ? `${item.kmTitle}: មុខងារនេះនឹងមកដល់ឆាប់ៗនេះ (Coming Soon)`
                                  : `${item.enTitle}: Coming Soon`
                              }
                              className="group flex min-h-9 items-center justify-between rounded-xl px-2.5 py-1 text-xs font-medium text-ink-muted/75 transition-colors cursor-default select-none"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/80 border border-arom-border/50 text-ink-muted/60">
                                  <Icon size={14} strokeWidth={1.8} />
                                </div>
                                <span className="truncate text-xs font-medium text-ink-muted">
                                  {isKm ? item.kmTitle : item.enTitle}
                                </span>
                              </div>
                              <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[9.5px] font-bold text-arom border border-arom-border/60">
                                {isKm ? "ឆាប់ៗ" : "Soon"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
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
