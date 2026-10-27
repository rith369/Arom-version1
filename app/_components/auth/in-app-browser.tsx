"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { useLanguage } from "../language-provider";

// Google blocks sign in inside the browsers built into apps like Messenger,
// Facebook, Instagram, TikTok and LINE ("Error 403: disallowed_useragent"),
// and those browsers do not share the Chrome or Safari login. So when the page
// is open in one, we ask people to open AROM in their real browser instead.

type InAppPlatform = "android" | "ios" | null;

const APP_MARKERS = /FBAN|FBAV|FB_IAB|FBIOS|Messenger|Instagram|Line\/|TikTok|musical_ly|Bytedance|Snapchat|Telegram/i;

function detectInAppBrowser(): InAppPlatform {
  const ua = navigator.userAgent;
  const android = /Android/i.test(ua);
  const ios = /iPhone|iPad|iPod/i.test(ua);
  if (!android && !ios) return null;
  // Android WebViews add "; wv)". On iPhone, Safari and its in app view say
  // "Safari/", plain app web views do not.
  const webView = android ? /; wv\)/.test(ua) : !/Safari\//.test(ua);
  if (APP_MARKERS.test(ua) || webView) return android ? "android" : "ios";
  return null;
}

const subscribe = () => () => {};

export function useInAppBrowser(): InAppPlatform {
  return useSyncExternalStore(subscribe, detectInAppBrowser, () => null);
}

export function OpenInBrowserNotice({ platform }: { platform: "android" | "ios" }) {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [copied, setCopied] = useState(false);

  const here = typeof window === "undefined" ? "" : window.location.href;
  const { host, pathname, search } = typeof window === "undefined" ? { host: "", pathname: "", search: "" } : window.location;
  const browserLink =
    platform === "android"
      ? `intent://${host}${pathname}${search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(here)};end`
      : `x-safari-${here}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(here);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div role="note" className={`rounded-xl border border-arom-border bg-arom-wash p-4 text-sm text-ink ${km ? "font-khmer" : ""}`}>
      <p className="font-semibold">
        {t("បើក AROM ក្នុង Chrome ឬ Safari ដើម្បីចូលជាមួយ Google", "Open AROM in Chrome or Safari to use Google")}
      </p>
      <p className="mt-1.5 leading-6 text-ink-muted">
        {t(
          "Google មិនអនុញ្ញាតឱ្យចូលនៅក្នុងកម្មវិធីដូចជា Messenger ឬ Telegram ទេ។ អ្នកក៏អាចចូលដោយប្រើអ៊ីមែលខាងលើបានដែរ។",
          "Google does not allow sign in inside apps like Messenger or Telegram. You can also use your email above.",
        )}
      </p>

      <a
        href={browserLink}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-arom px-4 text-sm font-bold text-white hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
      >
        <ExternalLink size={17} aria-hidden="true" />
        {platform === "android" ? t("បើកក្នុង Chrome", "Open in Chrome") : t("បើកក្នុង Safari", "Open in Safari")}
      </a>

      <p className="mt-3 leading-6 text-ink-muted">
        {platform === "android"
          ? t(
              "បើមិនដំណើរការ ចុច ⋮ នៅជ្រុងខាងលើ រួចជ្រើសរើស «បើកក្នុងកម្មវិធីរុករក»។",
              "If that does not work, tap ⋮ at the top, then choose Open in browser.",
            )
          : t(
              "បើមិនដំណើរការ ចុច ⋯ ឬប៊ូតុងចែករំលែក រួចជ្រើសរើស «បើកក្នុង Safari»។",
              "If that does not work, tap ⋯ or the share button, then choose Open in Safari.",
            )}
      </p>

      <button
        type="button"
        onClick={() => void copyLink()}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-arom-border bg-white px-4 text-sm font-semibold text-ink hover:border-arom/35 hover:text-arom focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
      >
        {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
        <span aria-live="polite">
          {copied ? t("បានចម្លងតំណ", "Link copied") : t("ចម្លងតំណ ដើម្បីបិទភ្ជាប់ក្នុងកម្មវិធីរុករក", "Copy link to paste in your browser")}
        </span>
      </button>
    </div>
  );
}
