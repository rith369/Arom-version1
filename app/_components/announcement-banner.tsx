"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Info, X } from "lucide-react";
import { useLanguage } from "./language-provider";
import {
  ANNOUNCEMENTS,
  currentAnnouncement,
  type Announcement,
  type AnnouncementTone,
} from "./announcements";

const toneStyles: Record<AnnouncementTone, { bar: string; icon: typeof Info }> = {
  info: { bar: "border-[#cfe0f5] bg-[#eef5fc] text-[#1d4f8a]", icon: Info },
  good: { bar: "border-arom/20 bg-arom-soft text-arom-deep", icon: CheckCircle2 },
  important: { bar: "border-arom-warning/30 bg-arom-warning-soft text-arom-warning", icon: AlertTriangle },
};

// The bar itself, also used by the admin form as a live preview.
export function AnnouncementBar({
  announcement,
  km,
  onDismiss,
}: {
  announcement: Pick<Announcement, "kmText" | "enText" | "tone" | "link">;
  km: boolean;
  onDismiss?: () => void;
}) {
  const { bar, icon: Icon } = toneStyles[announcement.tone];
  const showKhmer = km || !announcement.enText;
  const text = showKhmer ? announcement.kmText : announcement.enText;

  return (
    <div role="status" className={`border-b ${bar}`}>
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-2.5 text-sm sm:items-center sm:px-6">
        <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0 sm:mt-0" />
        <p className={`min-w-0 flex-1 leading-6 ${showKhmer ? "font-khmer" : ""}`}>{text}</p>
        {announcement.link && (
          <Link
            href={announcement.link}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold hover:bg-white focus-visible:outline-2 focus-visible:outline-current"
          >
            {km ? "បើក" : "Open"}
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={km ? "បិទសេចក្តីជូនដំណឹង" : "Close announcement"}
            className="shrink-0 rounded-full p-1 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-current"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

const DISMISSED_KEY = "arom-dismissed-announcement";

function readDismissed() {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

// Shown at the top of every user page. Hidden in the admin area and the
// admin preview frame.
export function AnnouncementBanner() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [now] = useState(() => Date.now());
  const storedDismissed = useSyncExternalStore(subscribe, readDismissed, () => "");
  const [dismissedNow, setDismissedNow] = useState("");
  const [loaded, setLoaded] = useState<Announcement[]>(ANNOUNCEMENTS);
  const hidden = pathname.startsWith("/admin") || pathname.startsWith("/content-preview");

  // The newest running announcement, from GET /api/announcements/current.
  useEffect(() => {
    if (hidden) return;
    let active = true;
    fetch("/api/announcements/current")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { announcement: Announcement | null } | null) => {
        if (active && data) setLoaded(data.announcement ? [data.announcement] : []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [hidden]);

  if (hidden) return null;

  const announcement = currentAnnouncement(loaded, now);
  if (!announcement || [storedDismissed, dismissedNow].includes(announcement.id)) return null;

  function dismiss() {
    if (!announcement) return;
    setDismissedNow(announcement.id);
    try {
      window.localStorage.setItem(DISMISSED_KEY, announcement.id);
    } catch {
      // Private mode can block storage. It stays closed for this visit.
    }
  }

  return <AnnouncementBar announcement={announcement} km={language === "km"} onDismiss={dismiss} />;
}
