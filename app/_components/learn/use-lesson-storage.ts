"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  BOOKMARKS_UPDATED_EVENT,
  EMPTY_LESSON_PROGRESS,
  STORAGE_KEYS,
  type ProgressData,
} from "./learn-data";

// Lesson progress and bookmarks live in localStorage, which the server cannot
// read. These hooks give the server render and the first browser render the
// same empty value, then switch to the saved value, so hydration matches.

function readStorage(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

const serverSnapshot = () => "";

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(BOOKMARKS_UPDATED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(BOOKMARKS_UPDATED_EVENT, onChange);
  };
}

export function useLessonProgress(lessonId: string): ProgressData {
  const key = `${STORAGE_KEYS.LESSON_PROGRESS}_${lessonId}`;
  const raw = useSyncExternalStore(subscribeToStorage, () => readStorage(key), serverSnapshot);
  return useMemo(() => {
    if (!raw) return EMPTY_LESSON_PROGRESS;
    try {
      return JSON.parse(raw) as ProgressData;
    } catch {
      return EMPTY_LESSON_PROGRESS;
    }
  }, [raw]);
}

export function useLessonBookmarked(lessonId: string): boolean {
  const raw = useSyncExternalStore(
    subscribeToStorage,
    () => readStorage(STORAGE_KEYS.BOOKMARKS),
    serverSnapshot,
  );
  return useMemo(() => {
    if (!raw) return false;
    try {
      return (JSON.parse(raw) as string[]).includes(lessonId);
    } catch {
      return false;
    }
  }, [raw, lessonId]);
}
