// Imported by client components only (it uses React hooks).
import { useEffect, useSyncExternalStore } from "react";
import {
  INITIAL_SAVED_STATE,
  getSavedState,
  loadSaved,
  subscribeSaved,
  type SavedKind,
  type SavedState,
} from "./saved-store";

const serverSnapshot = () => INITIAL_SAVED_STATE;

/** Saved items and whether they are loaded. Loads them the first time a screen asks. */
export function useSavedState(): SavedState {
  const saved = useSyncExternalStore(subscribeSaved, getSavedState, serverSnapshot);
  useEffect(() => {
    const { status } = getSavedState();
    if (status === "loading" || status === "error") void loadSaved();
  }, []);
  return saved;
}

/** The saved ids of one kind, oldest saved first. */
export function useSavedIds(kind: SavedKind): string[] {
  return useSavedState().ids[kind];
}
