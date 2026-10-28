"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Compass } from "lucide-react";
import { LOOK_AGAIN_DAYS, SELF_MAP_PARTS, type SelfMapPart, type SelfMapResponse } from "@/lib/self-map";
import { useAuth } from "../_components/auth-provider";

// Understand yourself on Home (BACKEND-HANDOFF.md section 38), for new and
// existing users. Home never shows results: other people can see a phone's
// Home screen. Only how many parts are done, and when to look again.

type CardState =
  | { kind: "new" }
  | { kind: "continue"; next: SelfMapPart; done: number }
  | { kind: "look_again" }
  | { kind: "hidden" };

export function useSelfMapCard(): CardState {
  const { user, status } = useAuth();
  const [state, setState] = useState<CardState>({ kind: "hidden" });

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetch("/api/self-map", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as SelfMapResponse;
        const done = data.parts.map((part) => part.part);
        const next = SELF_MAP_PARTS.find((part) => !done.includes(part));
        const newest = Math.max(...data.parts.map((part) => Date.parse(part.updatedAt)));
        if (!active) return;
        if (done.length === 0) setState({ kind: "new" });
        else if (next) setState({ kind: "continue", next, done: done.length });
        else setState(Date.now() - newest > LOOK_AGAIN_DAYS * 86_400_000 ? { kind: "look_again" } : { kind: "hidden" });
      })
      .catch(() => {
        // Home still works without it; /understand shows any error.
      });
    return () => {
      active = false;
    };
  }, [user]);

  // People who are not logged in see the invitation, as a friendly way in.
  if (status === "guest") return { kind: "new" };
  return user ? state : { kind: "hidden" };
}

export function SelfMapCard({ state, km }: { state: CardState; km: boolean }) {
  if (state.kind === "hidden") return null;
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const text =
    state.kind === "new"
      ? {
          title: t("ស្គាល់ខ្លួនឯង", "Understand yourself"),
          body: t(
            "ស្វែងយល់ពីអ្វីដែលសំខាន់សម្រាប់អ្នក និងរបៀបដែលអ្នកទប់ទល់នឹងភាពតានតឹង។ ប្រហែល ៣ នាទី។",
            "Find out what matters to you and how you handle stress. About 3 minutes to start.",
          ),
          action: t("ចាប់ផ្តើម", "Start"),
          href: "/understand",
        }
      : state.kind === "continue"
        ? {
            title: t("បន្តផែនទីខ្លួនឯងរបស់អ្នក", "Continue your self map"),
            body: t(`អ្នកបានធ្វើរួច ${state.done} នៃ ${SELF_MAP_PARTS.length}។`, `You have done ${state.done} of ${SELF_MAP_PARTS.length}.`),
            action: t("បន្ត", "Continue"),
            href: `/understand?start=${state.next}`,
          }
        : {
            title: t("មើលផែនទីខ្លួនឯងរបស់អ្នកម្តងទៀត", "Look at your self map again"),
            body: t("បានជាង ៣ ខែហើយ។ សាកមើលថាតើមានអ្វីផ្លាស់ប្តូរ។", "It has been over 3 months. See what has changed."),
            action: t("មើល", "Open"),
            href: "/understand",
          };

  return (
    <section
      aria-labelledby="self-map-card-title"
      className="flex items-center gap-3 rounded-[20px] border border-[#cfe5dd] bg-white px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e0f3ed] text-[#1f6f5b]">
        <Compass size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="self-map-card-title" className="text-sm font-semibold text-[#14221f]">
          {text.title}
        </h2>
        <p className="text-xs text-ink-muted">{text.body}</p>
      </div>
      <Link
        href={text.href}
        className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-xs font-semibold text-[#1f6f5b] hover:underline sm:text-sm"
      >
        {text.action}
        <ChevronRight size={15} aria-hidden="true" />
      </Link>
    </section>
  );
}
