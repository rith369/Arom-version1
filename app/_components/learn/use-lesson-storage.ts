"use client";

import { useEffect, useSyncExternalStore } from "react";
import { EMPTY_LESSON_PROGRESS, type ProgressData } from "./learn-data";
import {
  INITIAL_LESSON_PROGRESS_STATE,
  getLessonProgressState,
  loadLessonProgress,
  subscribeLessonProgress,
} from "./lesson-progress-store";
import { useSavedIds } from "../saved/use-saved";

// Lesson progress (lesson-progress-store.ts) and bookmarks (saved-store.ts)
// live in the person's account. The server render and the first browser
// render both see nothing saved, then the real values load, so hydration
// matches.

const serverSnapshot = () => INITIAL_LESSON_PROGRESS_STATE;

export function useLessonProgress(lessonId: string): ProgressData {
  const store = useSyncExternalStore(subscribeLessonProgress, getLessonProgressState, serverSnapshot);
  useEffect(() => {
    const { status } = getLessonProgressState();
    if (status === "loading" || status === "error") void loadLessonProgress();
  }, []);
  return store.progress[lessonId] ?? EMPTY_LESSON_PROGRESS;
}

export function useLessonBookmarked(lessonId: string): boolean {
  return useSavedIds("lesson").includes(lessonId);
}
