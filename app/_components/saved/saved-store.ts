import { SAVED_KINDS, type SavedIds, type SavedKind, type SavedResponse } from "@/lib/saved";

export type { SavedKind } from "@/lib/saved";

// Saved lessons, tips, practice and podcasts (BACKEND-HANDOFF.md section 30).
// Signed in, they live in the person's account (/api/saved). Signed out, they
// stay in this browser until the person logs in; then they move to the
// account and are removed from the browser, because anyone using the same
// phone could read them. No React here: learn-data.ts, which the server also
// reads, imports toggleSaved. The hooks are in use-saved.ts.

// The keys older versions used, so nothing saved before is lost.
const BROWSER_KEYS: Record<SavedKind, string> = {
  lesson: "arom_bookmarked_lessons_v1",
  tip: "arom_bookmarked_tips_v1",
  practice: "arom_bookmarked_practices_v1",
  podcast: "arom_saved_podcasts_v1",
};

export type SavedStatus = "loading" | "signed_out" | "ready" | "error";
export type SavedState = { status: SavedStatus; ids: SavedIds };

const emptyIds = (): SavedIds => ({ lesson: [], tip: [], practice: [], podcast: [] });

export const INITIAL_SAVED_STATE: SavedState = { status: "loading", ids: emptyIds() };

let state: SavedState = INITIAL_SAVED_STATE;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: SavedState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function subscribeSaved(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getSavedState = () => state;

function readBrowser(): SavedIds {
  const ids = emptyIds();
  for (const kind of SAVED_KINDS) {
    try {
      const parsed: unknown = JSON.parse(window.localStorage.getItem(BROWSER_KEYS[kind]) ?? "[]");
      if (Array.isArray(parsed)) ids[kind] = parsed.filter((id): id is string => typeof id === "string");
    } catch {
      // Blocked or broken storage: nothing to read.
    }
  }
  return ids;
}

function writeBrowser(kind: SavedKind, ids: string[]) {
  try {
    window.localStorage.setItem(BROWSER_KEYS[kind], JSON.stringify(ids));
  } catch {
    // Blocked storage: the change lasts until the page closes.
  }
}

function clearBrowser() {
  try {
    for (const kind of SAVED_KINDS) window.localStorage.removeItem(BROWSER_KEYS[kind]);
  } catch {
    // Blocked storage: nothing was saved there either.
  }
}

/** Moves items saved in this browser before logging in to the account. */
async function moveBrowserItems(account: SavedIds) {
  const local = readBrowser();
  const items = SAVED_KINDS.flatMap((kind) =>
    local[kind].filter((id) => !account[kind].includes(id)).map((id) => ({ kind, id })),
  ).slice(0, 200);
  if (items.length === 0) return clearBrowser();

  const response = await fetch("/api/saved", {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const data = response.ok ? ((await response.json().catch(() => null)) as SavedResponse | null) : null;
  if (!data) return; // Kept in the browser; tried again next time.
  clearBrowser();
  setState({ status: "ready", ids: data.saved });
}

/** Loads the saved items once; screens call it through useSavedIds. */
export function loadSaved(): Promise<void> {
  if (loading) return loading;
  loading = (async () => {
    try {
      const response = await fetch("/api/saved", { cache: "no-store" });
      if (response.status === 401) {
        setState({ status: "signed_out", ids: readBrowser() });
        return;
      }
      const data = response.ok ? ((await response.json().catch(() => null)) as SavedResponse | null) : null;
      if (!data) {
        setState({ ...state, status: "error" });
        return;
      }
      setState({ status: "ready", ids: data.saved });
      await moveBrowserItems(data.saved);
    } catch {
      setState({ ...state, status: "error" });
    } finally {
      loading = null;
    }
  })();
  return loading;
}

function withItem(kind: SavedKind, id: string, saved: boolean) {
  const list = state.ids[kind].filter((item) => item !== id);
  return { ...state.ids, [kind]: saved ? [...list, id] : list };
}

/** Saves the item when it is not saved and removes it when it is. Returns the new state. */
export function toggleSaved(kind: SavedKind, id: string): boolean {
  const saved = !state.ids[kind].includes(id);
  setState({ ...state, ids: withItem(kind, id, saved) });

  if (state.status === "signed_out") {
    writeBrowser(kind, state.ids[kind]);
    return saved;
  }

  // Shown at once; put back if the account does not take it.
  const undo = () => setState({ ...state, ids: withItem(kind, id, !saved) });
  void fetch("/api/saved", {
    method: "PUT",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, id, saved }),
  })
    .then((response) => {
      if (response.status === 401) {
        setState({ ...state, status: "signed_out" });
        writeBrowser(kind, state.ids[kind]);
      } else if (!response.ok) {
        undo();
      }
    })
    .catch(undo);
  return saved;
}

export function removeSaved(kind: SavedKind, id: string): void {
  if (state.ids[kind].includes(id)) toggleSaved(kind, id);
}
