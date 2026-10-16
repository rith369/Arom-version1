"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { EditPlanTask, NewPlanTask, PlanResponse, PlanSource, PlanTask } from "@/lib/plan";

// Your Plan For Today (BACKEND-HANDOFF.md section 27). Tasks are saved to the
// person's account through /api/plan and kept here in memory only, never in
// browser storage. Screens that add MindGuide items keep using
// getCustomPlanItems / isItemInDailyPlan / toggleCustomPlanItem, and listen
// for the "arom_plan_updated" event.

export type DailyPlanSource = "mindguide" | "practice" | "learn" | "guide" | "tip" | "custom";

// What MindGuide screens pass when they add an item. `id` becomes the task's item key.
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

export type PlanStatus = "loading" | "signed_out" | "ready" | "error";
export type PlanState = { status: PlanStatus; day: string; tasks: PlanTask[] };
export type PlanResult = { ok: true } | { ok: false; message: string };

const initial: PlanState = { status: "loading", day: "", tasks: [] };
let state: PlanState = initial;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: PlanState) {
  state = next;
  listeners.forEach((listener) => listener());
  if (typeof window !== "undefined") window.dispatchEvent(new Event("arom_plan_updated"));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const updateTasks = (change: (tasks: PlanTask[]) => PlanTask[]) => setState({ ...state, tasks: change(state.tasks) });

async function send(url: string, method: string, body?: unknown) {
  try {
    const response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    return { ok: response.ok, status: response.status, data, message: data?.error?.message };
  } catch {
    return { ok: false, status: 0, data: null, message: "Could not reach the server. Check your connection." };
  }
}

// ---------- Loading ----------

export function loadPlan(): Promise<void> {
  if (loading) return loading;
  loading = (async () => {
    const result = await send("/api/plan", "GET");
    if (result.status === 401) setState({ ...initial, status: "signed_out" });
    else if (!result.ok || !result.data) setState({ ...initial, status: "error" });
    else {
      const plan = result.data as unknown as PlanResponse;
      setState({ status: "ready", day: plan.day, tasks: plan.tasks });
      void moveOldBrowserItems();
    }
  })().finally(() => {
    loading = null;
  });
  return loading;
}

/** The plan, loaded when the first component using it appears. */
export function usePlan() {
  const store = useSyncExternalStore(subscribe, () => state, () => initial);
  useEffect(() => {
    if (state.status === "loading" || state.status === "error") void loadPlan();
  }, []);
  return store;
}

function ensureLoaded() {
  if (typeof window !== "undefined" && state.status === "loading") void loadPlan();
}

// Older versions kept the plan in this browser. Move those items into the
// account once (they are plan items, not private writing), then remove them.
const OLD_KEYS = ["arom_custom_daily_plan_v2", "arom_daily_plan_try_now_v1"];

async function moveOldBrowserItems() {
  const old: NewPlanTask[] = [];
  try {
    for (const key of OLD_KEYS) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const items = JSON.parse(raw) as Partial<DailyPlanCustomItem & { stepNumber: number; kmTitle: string; kmSubtitle: string }>[];
      for (const item of Array.isArray(items) ? items : []) {
        const isTip = typeof item.stepNumber === "number";
        const id = isTip ? `tip-try-now-${item.stepNumber}` : item.id;
        if (!id || !item.title || state.tasks.some((task) => task.itemKey === id)) continue;
        old.push({
          itemKey: id,
          source: isTip ? "tip" : (item.source ?? "custom"),
          title: item.title,
          titleKm: (isTip ? item.kmTitle : item.titleKm) ?? "",
          subtitle: item.subtitle ?? "",
          subtitleKm: (isTip ? item.kmSubtitle : item.subtitleKm) ?? "",
          href: isTip ? "/tips" : (item.href ?? null),
          icon: isTip ? "boxicons_note-filled" : (item.icon ?? null),
          repeat: "daily",
        });
      }
    }
  } catch {
    // Unreadable old data: nothing to move.
  }
  for (const task of old) await addPlanTask(task);
  try {
    OLD_KEYS.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage blocked: nothing was kept there either.
  }
}

// ---------- Actions ----------

export async function addPlanTask(task: NewPlanTask): Promise<PlanResult> {
  const result = await send("/api/plan/tasks", "POST", task);
  if (!result.ok || !result.data) return { ok: false, message: result.message ?? "The task could not be added." };
  const added = result.data as unknown as PlanTask;
  updateTasks((tasks) => [...tasks.filter((item) => item.itemKey !== added.itemKey), added]);
  return { ok: true };
}

export async function editPlanTask(id: string, edit: EditPlanTask): Promise<PlanResult> {
  const result = await send(`/api/plan/tasks/${id}`, "PATCH", edit);
  if (!result.ok || !result.data) return { ok: false, message: result.message ?? "The task could not be saved." };
  const saved = result.data as unknown as PlanTask;
  updateTasks((tasks) => tasks.map((item) => (item.id === id ? saved : item)));
  return { ok: true };
}

export async function deletePlanTask(id: string): Promise<PlanResult> {
  const before = state.tasks;
  updateTasks((tasks) => tasks.filter((item) => item.id !== id));
  const result = await send(`/api/plan/tasks/${id}`, "DELETE");
  if (!result.ok) {
    updateTasks(() => before);
    return { ok: false, message: result.message ?? "The task could not be removed." };
  }
  return { ok: true };
}

/** Ticks or unticks a task for today. The screen changes at once and goes back if saving fails. */
export async function setPlanTaskDone(id: string, done: boolean): Promise<PlanResult> {
  updateTasks((tasks) => tasks.map((item) => (item.id === id ? { ...item, doneToday: done } : item)));
  const result = await send(`/api/plan/tasks/${id}/check`, "PUT", { done });
  if (!result.ok) {
    updateTasks((tasks) => tasks.map((item) => (item.id === id ? { ...item, doneToday: !done } : item)));
    return { ok: false, message: result.message ?? "That could not be saved." };
  }
  return { ok: true };
}

export async function reorderPlanTasks(ids: string[]): Promise<PlanResult> {
  const before = state.tasks;
  const position = new Map(ids.map((id, index) => [id, index]));
  updateTasks((tasks) =>
    [...tasks]
      .map((item) => ({ ...item, sortOrder: position.get(item.id) ?? item.sortOrder }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const result = await send("/api/plan/order", "PUT", { ids });
  if (!result.ok) {
    updateTasks(() => before);
    return { ok: false, message: result.message ?? "The new order could not be saved." };
  }
  return { ok: true };
}

// ---------- Used by MindGuide and Tips screens ----------

/** Plan items as MindGuide screens read them: `id` is the task's item key. */
export function getCustomPlanItems(): DailyPlanCustomItem[] {
  ensureLoaded();
  return state.tasks.map((task) => ({
    id: task.itemKey,
    source: (task.source === "suggestion" || task.source === "starter" ? "custom" : task.source) as DailyPlanSource,
    title: task.title,
    titleKm: task.titleKm,
    subtitle: task.subtitle,
    subtitleKm: task.subtitleKm,
    icon: task.icon ?? undefined,
    href: task.href ?? "/",
    completed: task.doneToday,
    addedAt: task.sortOrder,
  }));
}

export function isItemInDailyPlan(id: string): boolean {
  ensureLoaded();
  return state.tasks.some((task) => task.itemKey === id);
}

/**
 * Adds a MindGuide item to the plan, or removes it if it is already there.
 * Returns true when it was added. Saving needs an account, so someone who is
 * signed out is sent to log in.
 */
export function toggleCustomPlanItem(item: Omit<DailyPlanCustomItem, "completed" | "addedAt">): boolean {
  if (typeof window === "undefined") return false;
  if (state.status === "signed_out") {
    // Not a component, so there is no router here; a full page load is fine before login.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    return false;
  }
  const existing = state.tasks.find((task) => task.itemKey === item.id);
  if (existing) {
    void deletePlanTask(existing.id);
    return false;
  }
  const source: PlanSource = item.source;
  void addPlanTask({
    itemKey: item.id,
    source,
    // Same limits as the table, so a long MindGuide subtitle never blocks saving.
    title: item.title.slice(0, 120),
    titleKm: item.titleKm.slice(0, 160),
    subtitle: item.subtitle.slice(0, 200),
    subtitleKm: item.subtitleKm.slice(0, 260),
    href: item.href.startsWith("/") ? item.href : null,
    icon: item.icon ?? null,
    repeat: "daily",
  });
  return true;
}

export function removeCustomPlanItem(id: string): boolean {
  const existing = state.tasks.find((task) => task.itemKey === id);
  if (!existing) return false;
  void deletePlanTask(existing.id);
  return true;
}
