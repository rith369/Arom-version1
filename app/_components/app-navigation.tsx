"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  BookOpen,
  Heart,
  Home,
  Settings,
  UsersRound,
} from "lucide-react";
import { useLanguage } from "./language-provider";
import { useDetection } from "./detection-provider";

import { NAVIGATION_SECTIONS, type NavItem } from "./navigation-config";
import { UserAvatar } from "./user-avatar";
import { useAuth } from "./auth-provider";

export type NavigationLabel =
  | "Home"
  | "MindGuide"
  | "Journal"
  | "Detection"
  | "Progress"
  | "Professional"
  | "ClinicHospital"
  | "Appointments"
  | "Community"
  | "PlayCards"
  | "Profile";

export function AromBrand({ compact = false }: { compact?: boolean }) {
  const { language } = useLanguage();
  return (
    <Link
      href="/"
      aria-label="AROM home"
      className="flex w-fit items-center gap-2 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
    >
      <Image
        src="/brand/arom-mark.svg"
        alt=""
        width={40}
        height={32}
        className="h-8 w-10 shrink-0"
        unoptimized
      />
      <span>
        <span className="block text-[1.45rem] font-bold leading-none tracking-[-0.04em] text-arom">
          AROM
        </span>
        {!compact && (
          <span className="mt-2 block text-xs font-medium tracking-[-0.01em] text-ink-muted">
            {language === "km" ? "ចិត្តកាន់តែស្ងប់ ជីវិតកាន់តែភ្លឺស្វាង" : "A calmer mind, a brighter you"}
          </span>
        )}
      </span>
    </Link>
  );
}

export function DesktopNavigation({ active }: { active: NavigationLabel }) {
  const { language } = useLanguage();
  const { openDetection } = useDetection();
  const isKm = language === "km";
  const { user, status } = useAuth();

  return (
    <aside className="sticky top-0 hidden h-screen w-full flex-col border-r border-arom-border bg-white px-4.5 py-6 lg:flex overflow-hidden">
      {/* Brand Header */}
      <div className="px-1 shrink-0">
        <AromBrand compact />
      </div>

      {/* 3 Navigation Sections: Main Page, Professional, Community */}
      <nav
        aria-label="Primary"
        className="mt-6 flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-arom-border"
      >
        {NAVIGATION_SECTIONS.map((section) => {
          const activeItems = section.items.filter((item) => !item.isComingSoon);
          const comingSoonItems = section.items.filter((item) => item.isComingSoon);

          return (
            <div
              key={section.id}
              className="rounded-2xl border border-arom-border/60 bg-[#f8faf9] p-2.5 shadow-[0_1px_3px_rgba(20,54,47,0.03)] space-y-1.5"
            >
              {/* Section Heading with subtle emerald dot */}
              <div className="flex items-center gap-2 px-2.5 pt-1 pb-1">
                <span className="size-1.5 rounded-full bg-arom/70" />
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-arom-deep">
                  {isKm ? section.kmTitle : section.enTitle}
                </p>
              </div>

              {/* Active Section Items */}
              <div className="flex flex-col gap-1">
                {activeItems.map((item: NavItem) => {
                  const Icon = item.icon;
                  const isActive = active === item.label;

                  // Detection modal trigger
                  if (item.id === "detection") {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={openDetection}
                        aria-current={isActive ? "page" : undefined}
                        className={`group flex min-h-[46px] w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all duration-150 cursor-pointer ${
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
                          className={`text-[14px] font-semibold leading-snug ${
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
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex min-h-[46px] items-center gap-3 rounded-xl px-3 py-2 transition-all duration-150 ${
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
                        className={`text-[14px] font-semibold leading-snug ${
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
                <div className="pt-2 mt-1 border-t border-arom-border/50 space-y-0.5">
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
                        className="group flex min-h-[38px] items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium text-ink-muted/75 transition-colors cursor-default select-none"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-white/80 border border-arom-border/50 text-ink-muted/60">
                            <Icon size={15} strokeWidth={1.8} />
                          </div>
                          <span className="text-[12.5px] font-medium text-ink-muted leading-tight">
                            {isKm ? item.kmTitle : item.enTitle}
                          </span>
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[9.5px] font-bold text-arom border border-arom-border/60 ml-2">
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

      {/* Footer: User Profile */}
      <div className="mt-auto shrink-0 pt-3 border-t border-arom-border/60">
        <Link
          href="/profile"
          aria-label="Profile and Settings"
          className={`group flex items-center gap-3 rounded-2xl border p-2.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-arom ${
            active === "Profile"
              ? "border-arom/40 bg-arom-soft text-arom shadow-xs"
              : "border-arom-border bg-white text-ink hover:border-arom/30 hover:bg-arom-wash"
          }`}
        >
          <UserAvatar className="size-9.5 rounded-full ring-2 ring-arom/20 text-xs" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold leading-tight text-ink">
              {user?.fullName || (status === "loading" ? "\u00a0" : isKm ? "ភ្ញៀវ (Guest)" : "Guest")}
            </p>
            <p className="truncate text-[0.68rem] text-ink-muted">
              {isKm ? "ប្រវត្តិរូប និងការកំណត់ (Profile & Settings)" : "Profile & Settings"}
            </p>
          </div>
          <Settings aria-hidden="true" size={16} className="text-ink-muted transition-transform duration-150 group-hover:rotate-45 group-hover:text-arom" />
        </Link>
      </div>
    </aside>
  );
}

type BottomNavItem = {
  label: NavigationLabel;
  icon: typeof Home;
  href: string;
  km: string;
  emphasized?: boolean;
};

const bottomNavItems: BottomNavItem[] = [
  { label: "Home", icon: Home, href: "/", km: "ទំព័រដើម" },
  { label: "MindGuide", icon: BookOpen, href: "/mindguide", km: "មគ្គុទ្ទេសក៍ចិត្ត" },
  { label: "Detection", icon: Activity, href: "/detection", km: "ពិនិត្យអារម្មណ៍", emphasized: true },
  { label: "Professional", icon: Heart, href: "/professional", km: "អ្នកជំនាញ" },
  { label: "Community", icon: UsersRound, href: "/community", km: "សហគមន៍" },
];

export function MobileNavigation({
  active,
  onOpenDetection,
}: {
  active: NavigationLabel;
  onOpenDetection?: () => void;
}) {
  const { language } = useLanguage();
  const { openDetection: globalOpenDetection } = useDetection();
  const handleOpenDetection = onOpenDetection || globalOpenDetection;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-arom-border bg-white/96 px-3 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(15,80,65,0.06)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {bottomNavItems.map(({ label, icon: Icon, href, km, emphasized }) => {
          const isActive = active === label;
          const content = (
            <>
              <span
                className={
                  emphasized
                    ? `absolute -top-6 flex size-12 items-center justify-center rounded-full bg-arom text-white shadow-[0_8px_22px_rgba(31,111,91,0.26)] ring-4 ring-white transition-transform duration-200 ${
                        isActive ? "scale-105 ring-arom/20" : "hover:scale-105"
                      }`
                    : "flex h-7 items-center justify-center"
                }
              >
                <Icon
                  aria-hidden="true"
                  size={emphasized ? 25 : 24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={
                    emphasized
                      ? ""
                      : isActive
                      ? "text-arom"
                      : "text-ink-muted/80 group-hover:text-arom"
                  }
                />
              </span>
              <span
                className={`transition-colors duration-150 ${
                  emphasized ? "mt-7" : ""
                } ${
                  isActive
                    ? "font-bold text-arom"
                    : "font-medium text-ink/75 group-hover:text-arom"
                }`}
              >
                {language === "km" ? km : label}
              </span>
            </>
          );

          if (emphasized) {
            return (
              <button
                key={label}
                type="button"
                onClick={handleOpenDetection}
                aria-label={language === "km" ? km : label}
                className="group relative flex min-h-[52px] flex-col items-center justify-end gap-1 rounded-xl text-[0.66rem] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-arom cursor-pointer select-none"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className="group relative flex min-h-[52px] flex-col items-center justify-end gap-1 rounded-xl text-[0.66rem] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-arom cursor-pointer select-none"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { MobileSidebarDrawer } from "./mobile-sidebar-drawer";
export { SidebarProvider, useSidebar } from "./sidebar-provider";

