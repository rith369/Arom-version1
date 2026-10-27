import type { LessonProgress, LessonProgressResponse } from "@/lib/saved";

// How far the person got in each lesson (BACKEND-HANDOFF.md section 30).
// Signed in, it lives in the person's account (/api/lesson-progress). Signed
// out, it stays in this browser until the person logs in; then it moves to
// the account and is removed from the browser. The hooks are in
// use-lesson-storage.ts.

// The key older versions used, followed by "_<lesson id>".
const BROWSER_PREFIX = "arom_lesson_progress_v1_";

export type LessonProgressStatus = "loading" | "signed_out" | "ready" | "error";
export type LessonProgressState = { status: LessonProgressStatus; progress: Record<string, LessonProgress> };

export const INITIAL_LESSON_PROGRESS_STATE: LessonProgressState = { status: "loading", progress: {} };

let state: LessonProgressState = INITIAL_LESSON_PROGRESS_STATE;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: LessonProgressState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function subscribeLessonProgress(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getLessonProgressState = () => state;

function browserKeys(): string[] {
  try {
    return Object.keys(window.localStorage).filter((key) => key.startsWith(BROWSER_PREFIX));
  } catch {
    return [];
  }
}

function readBrowser(): Record<string, LessonProgress> {
  const progress: Record<string, LessonProgress> = {};
  for (const key of browserKeys()) {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null") as LessonProgress | null;
      if (parsed && typeof parsed.completedSections === "number") progress[key.slice(BROWSER_PREFIX.length)] = parsed;
    } catch {
      // A broken entry is skipped.
    }
  }
  return progress;
}

function clearBrowser() {
  try {
    for (const key of browserKeys()) window.localStorage.removeItem(key);
  } catch {
    // Blocked storage: nothing was saved there either.
  }
}

function put(items: { lessonId: string; progress: LessonProgress }[], keepExisting = false) {
  return fetch("/api/lesson-progress", {
    method: "PUT",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, keepExisting }),
  });
}

/** Moves progress kept in this browser before logging in to the account. */
async function moveBrowserProgress() {
  const local = Object.entries(readBrowser()).map(([lessonId, progress]) => ({ lessonId, progress }));
  if (local.length === 0) return;
  // The account's own progress wins for a lesson it already has.
  const response = await put(local.slice(0, 100), true);
  const data = response.ok ? ((await response.json().catch(() => null)) as LessonProgressResponse | null) : null;
  if (!data) return; // Kept in the browser; tried again next time.
  clearBrowser();
  setState({ status: "ready", progress: data.progress });
}

/** Loads the progress once; screens call it through useLessonProgress. */
export function loadLessonProgress(): Promise<void> {
  if (loading) return loading;
  loading = (async () => {
    try {
      const response = await fetch("/api/lesson-progress", { cache: "no-store" });
      if (response.status === 401) {
        setState({ status: "signed_out", progress: readBrowser() });
        return;
      }
      const data = response.ok ? ((await response.json().catch(() => null)) as LessonProgressResponse | null) : null;
      if (!data) {
        setState({ ...state, status: "error" });
        return;
      }
      setState({ status: "ready", progress: data.progress });
      await moveBrowserProgress();
    } catch {
      setState({ ...state, status: "error" });
    } finally {
      loading = null;
    }
  })();
  return loading;
}

/** Saves a lesson's progress. Shown at once; a failed save keeps it for this visit. */
export function saveLessonProgress(lessonId: string, progress: LessonProgress): void {
  setState({ ...state, progress: { ...state.progress, [lessonId]: progress } });

  const keepInBrowser = () => {
    try {
      window.localStorage.setItem(`${BROWSER_PREFIX}${lessonId}`, JSON.stringify(progress));
    } catch {
      // Blocked storage: the progress lasts until the page closes.
    }
  };
  if (state.status === "signed_out") return keepInBrowser();

  void put([{ lessonId, progress }])
    .then((response) => {
      if (response.status !== 401) return;
      setState({ ...state, status: "signed_out" });
      keepInBrowser();
    })
    .catch(() => {
      // Offline: kept for this visit; the next finished section saves it again.
    });
}
