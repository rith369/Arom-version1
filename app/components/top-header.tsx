"use client";

import Link from "next/link";
import { useLanguage } from "../_components/language-provider";
import { useSidebar } from "../_components/sidebar-provider";
import { AromBrand } from "../_components/app-navigation";
import { UserAvatar } from "../_components/user-avatar";

export type TopHeaderProps = {
  onOpenSidebar?: () => void;
};

export function TopHeader({ onOpenSidebar }: TopHeaderProps) {
  const { language } = useLanguage();
  const sidebar = useSidebar();
  const km = language === "km";

  const handleOpenSidebar = onOpenSidebar || sidebar.openSidebar;

  return (
    <header className="flex w-full items-center justify-between gap-3 pt-2 lg:justify-end">
      {/* LEFT: AROM brand with tagline (desktop shows the brand in the sidebar) */}
      <div className="lg:hidden">
        <AromBrand />
      </div>

      {/* RIGHT: Menu button (opens mobile sidebar drawer) & Profile avatar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleOpenSidebar}
          aria-label={km ? "បើកម៉ឺនុយរុករក" : "Open sidebar navigation"}
          className="flex size-10 items-center justify-center rounded-2xl bg-arom-soft border border-arom/30 shadow-[0_2px_10px_rgba(31,111,91,0.12)] text-arom transition-all hover:bg-arom-soft/80 hover:shadow-[0_4px_14px_rgba(31,111,91,0.18)] active:scale-95 cursor-pointer lg:hidden"
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

        <Link
          href="/profile"
          aria-label={km ? "ប្រវត្តិរូប និងការកំណត់" : "Profile and settings"}
          className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-arom"
        >
          <UserAvatar className="size-11 rounded-full ring-2 ring-white shadow-[0_5px_18px_rgba(20,75,63,0.15)] text-xs" />
        </Link>
      </div>
    </header>
  );
}
