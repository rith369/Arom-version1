"use client";

import { getCustomPlanItems, isItemInDailyPlan, toggleCustomPlanItem } from "../daily-plan-store";
import type { TipItem, TipStep } from "./tips-data";

// Kept out of tips-data.ts, which server code (lib/care.ts) also imports.
// "Try now" steps added to Your Plan For Today. They are saved as plan tasks
// in the person's account (daily-plan-store.ts) with item key "tip-try-now-<n>".
const tryNowKey = (stepNumber: number) => `tip-try-now-${stepNumber}`;

export type PlanTryNowItem = { stepNumber: number };

/** The try now steps in the plan (used to show which steps are added). */
export function getPlanTryNowItems(): PlanTryNowItem[] {
  return getCustomPlanItems()
    .filter((item) => item.id.startsWith("tip-try-now-"))
    .map((item) => ({ stepNumber: Number(item.id.replace("tip-try-now-", "")) }));
}

export function isTryNowInPlan(stepNumber: number): boolean {
  return isItemInDailyPlan(tryNowKey(stepNumber));
}

/** Adds a try now step to the plan, or removes it. Returns true when added. */
export function toggleTryNowInPlan(step: TipStep, tip: TipItem): boolean {
  const tryNow = step.tryNow.charAt(0).toUpperCase() + step.tryNow.slice(1);
  return toggleCustomPlanItem({
    id: tryNowKey(step.number),
    source: "tip",
    title: step.title.replace(/\.$/, ""),
    titleKm: step.kmTitle.replace(/\.$/, ""),
    subtitle: tryNow,
    subtitleKm: step.kmTryNow,
    icon: "boxicons_note-filled",
    href: `/mindguide/tips?open=${encodeURIComponent(tip.id)}`,
  });
}
