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
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "./language-provider";
import { useDetection } from "./detection-provider";

import { NAVIGATION_SECTIONS, type NavItem } from "./navigation-config";

export type NavigationLabel =
  | "Home"
  | "Quests"
  | "Shop"
  | "Friends"
  | "MindGuide"
  | "Journal"
  | "Detection"
  | "Progress"
  | "Professional"
  | "ClinicHospital"
  | "BookingHistory"
  | "Schedule"
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

  return (
    <aside className="sticky top-0 hidden h-screen w-full flex-col border-r border-arom-border bg-white px-3.5 py-6 lg:flex overflow-hidden">
      {/* Brand Header */}
      <div className="px-2 shrink-0">
        <AromBrand compact />
      </div>

      {/* 3 Navigation Sections: Main Page, Professional, Community */}
      <nav
        aria-label="Primary"
        className="mt-6 flex-1 overflow-y-auto pr-1 space-y-5 scrollbar-thin scrollbar-thumb-arom-border"
      >
        {NAVIGATION_SECTIONS.map((section) => (
          <div key={section.id} className="space-y-1">
            {/* Section Heading */}
            <p className="px-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-muted/80">
              {isKm ? section.kmTitle : section.enTitle}
            </p>

            {/* Section Items */}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item: NavItem) => {
                const Icon = item.icon;
                const isActive = active === item.label;

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
                      onClick={openDetection}
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-arom text-left cursor-pointer ${
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
                    aria-current={isActive ? "page" : undefined}
                    className={`group flex min-h-10 items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-arom ${
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

      {/* Footer: User Profile */}
      <div className="mt-auto shrink-0 pt-3 border-t border-arom-border/60">
        <Link
          href="/profile"
          aria-label="Profile and Settings"
          className={`group flex items-center gap-2.5 rounded-xl border p-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-arom ${
            active === "Profile"
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
            <p className="truncate text-xs font-bold leading-tight text-ink">Muoyly Seng</p>
            <p className="truncate text-[0.65rem] text-ink-muted">
              {isKm ? "ប្រវត្តិរូប និងការកំណត់ (Profile & Settings)" : "Profile & Settings"}
            </p>
          </div>
          <Settings aria-hidden="true" size={15} className="text-ink-muted transition-transform duration-150 group-hover:rotate-45 group-hover:text-arom" />
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

