"use client";

import { useMemo, useSyncExternalStore } from "react";

// Saved items live in the browser until the backend has a saved items table
// (see BACKEND-HANDOFF.md). Lessons, tips and practice keep the keys their own
// screens already use; podcasts have a new key. Keep these in sync with
// STORAGE_KEYS.BOOKMARKS (learn-data.ts), STORAGE_TIPS_KEYS.BOOKMARKS
// (tips-data.ts) and STORAGE_PRACTICE_KEYS.BOOKMARKS (practice-data.ts). They
// are repeated here so a light screen like the podcast player does not have to
// load the whole lesson library.
export type SavedKind = "lesson" | "tip" | "practice" | "podcast";

export const SAVED_KEYS: Record<SavedKind, string> = {
  lesson: "arom_bookmarked_lessons_v1",
  tip: "arom_bookmarked_tips_v1",
  practice: "arom_bookmarked_practices_v1",
  podcast: "arom_saved_podcasts_v1",
};

// Tips and practice show one saved example until the person changes it, the
// same as their own Saved screens.
const DEFAULT_IDS: Record<SavedKind, string[]> = {
  lesson: [],
  tip: ["how-to-control-stress"],
  practice: ["interactive-breathing"],
  podcast: [],
};

export const SAVED_UPDATED_EVENT = "arom_saved_updated";

function readRaw(kind: SavedKind): string {
  try {
    return window.localStorage.getItem(SAVED_KEYS[kind]) ?? "";
  } catch {
    return "";
  }
}

function parseIds(kind: SavedKind, raw: string): string[] {
  if (!raw) return DEFAULT_IDS[kind];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SAVED_UPDATED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SAVED_UPDATED_EVENT, onChange);
  };
}

const serverSnapshot = () => "";

// The server and the first browser render both see the default list, then the
// real saved list takes over, so hydration matches.
export function useSavedIds(kind: SavedKind): string[] {
  const raw = useSyncExternalStore(subscribe, () => readRaw(kind), serverSnapshot);
  return useMemo(() => parseIds(kind, raw), [kind, raw]);
}

// Adds the id when it is not saved and removes it when it is. Returns the new state.
export function toggleSaved(kind: SavedKind, id: string): boolean {
  try {
    const list = parseIds(kind, readRaw(kind));
    const exists = list.includes(id);
    const next = exists ? list.filter((item) => item !== id) : [...list, id];
    window.localStorage.setItem(SAVED_KEYS[kind], JSON.stringify(next));
    window.dispatchEvent(new Event(SAVED_UPDATED_EVENT));
    return !exists;
  } catch {
    return false;
  }
}

export function removeSaved(kind: SavedKind, id: string): void {
  if (parseIds(kind, readRaw(kind)).includes(id)) toggleSaved(kind, id);
}
