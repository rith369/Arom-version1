/*
 * On logout, forget what this browser kept for the person (saved lessons,
 * lesson answers, plans, drafts), so the next person on a shared phone or
 * computer cannot see it (security audit L10, BACKEND-HANDOFF.md section 48).
 *
 * Only device settings that say nothing about the person stay. A new store is
 * cleared too unless it is added here, which is the safe default.
 */

const KEEP = new Set([
  "arom-language",
  "arom_install_popup_snoozed_until_v1",
  "arom-dismissed-announcement",
  "arom.pro.noteFormat",
]);

export function clearBrowserDataOnLogout() {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (!KEEP.has(key)) window.localStorage.removeItem(key);
    }
  } catch {
    // Storage can be blocked. Logging out still works.
  }
  try {
    window.sessionStorage.clear();
  } catch {
    // Same.
  }
}
