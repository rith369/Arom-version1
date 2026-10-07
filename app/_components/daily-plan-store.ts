"use client";

import {
  getPlanTryNowItems,
  STORAGE_PLAN_TRY_NOW_KEY,
  type PlanTryNowItem,
} from "./tips/tips-data";

export type DailyPlanSource =
  | "mindguide"
  | "practice"
  | "learn"
  | "guide"
  | "tip"
  | "custom";

export type DailyPlanCustomItem = {
  id: string;
  source: DailyPlanSource;
  title: string;
  titleKm: string;
  subtitle: string;
  subtitleKm: string;
  badge?: string;
  badgeKm?: string;
  icon?: string;
  href: string;
  completed: boolean;
  addedAt: number;
};

export const STORAGE_CUSTOM_PLAN_KEY = "arom_custom_daily_plan_v2";

export function getCustomPlanItems(): DailyPlanCustomItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_CUSTOM_PLAN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isItemInDailyPlan(id: string): boolean {
  if (typeof window === "undefined") return false;
  const items = getCustomPlanItems();
  if (items.some((item) => item.id === id)) return true;

  // Also check legacy tip items
  if (id.startsWith("tip-try-now-")) {
    const num = parseInt(id.replace("tip-try-now-", ""), 10);
    const tryItems = getPlanTryNowItems();
    return tryItems.some((item) => item.stepNumber === num);
  }
  return false;
}

export function toggleCustomPlanItem(
  item: Omit<DailyPlanCustomItem, "completed" | "addedAt">
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const items = getCustomPlanItems();
    const existingIndex = items.findIndex((i) => i.id === item.id);
    let updated: DailyPlanCustomItem[];
    let isAdded = false;

    if (existingIndex >= 0) {
      updated = items.filter((i) => i.id !== item.id);
      isAdded = false;
    } else {
      const newItem: DailyPlanCustomItem = {
        ...item,
        completed: false,
        addedAt: Date.now(),
      };
      updated = [...items, newItem];
      isAdded = true;
    }

    window.localStorage.setItem(STORAGE_CUSTOM_PLAN_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("arom_plan_updated"));
    return isAdded;
  } catch {
    return false;
  }
}

export function removeCustomPlanItem(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const items = getCustomPlanItems();
    const updated = items.filter((i) => i.id !== id);
    window.localStorage.setItem(STORAGE_CUSTOM_PLAN_KEY, JSON.stringify(updated));

    // Also remove from tips storage if it is a tip
    if (id.startsWith("tip-try-now-")) {
      const num = parseInt(id.replace("tip-try-now-", ""), 10);
      const tipItems = getPlanTryNowItems();
      const nextTipItems = tipItems.filter((t) => t.stepNumber !== num);
      window.localStorage.setItem(
        STORAGE_PLAN_TRY_NOW_KEY,
        JSON.stringify(nextTipItems)
      );
    }

    window.dispatchEvent(new Event("arom_plan_updated"));
    return true;
  } catch {
    return false;
  }
}

export function toggleCustomPlanItemComplete(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const items = getCustomPlanItems();
    let nextState = false;
    let found = false;

    const updated = items.map((i) => {
      if (i.id === id) {
        nextState = !i.completed;
        found = true;
        return { ...i, completed: nextState };
      }
      return i;
    });

    if (found) {
      window.localStorage.setItem(STORAGE_CUSTOM_PLAN_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("arom_plan_updated"));
      return nextState;
    }

    // Fallback for tips storage
    if (id.startsWith("tip-try-now-")) {
      const num = parseInt(id.replace("tip-try-now-", ""), 10);
      const tipItems = getPlanTryNowItems();
      const nextTipItems = tipItems.map((t) => {
        if (t.stepNumber === num) {
          nextState = !t.completed;
          return { ...t, completed: nextState };
        }
        return t;
      });
      window.localStorage.setItem(
        STORAGE_PLAN_TRY_NOW_KEY,
        JSON.stringify(nextTipItems)
      );
      window.dispatchEvent(new Event("arom_plan_updated"));
      return nextState;
    }

    return false;
  } catch {
    return false;
  }
}
