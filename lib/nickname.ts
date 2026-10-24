/*
 * "Name your therapist sees" (BACKEND-HANDOFF.md section 29). A user who
 * hides their identity can pick a nickname; empty means "Anonymous". The
 * same rules are checked by the database (profiles_nickname_check, migration
 * 20261024001200): no contact details, no fake "#code", no staff names.
 */

export const MIN_NICKNAME = 2;
export const MAX_NICKNAME = 30;

/** Null when the nickname is fine (or empty), otherwise why it is not. */
export function nicknameProblem(value: string): "length" | "contact" | "reserved" | null {
  const nickname = value.trim();
  if (!nickname) return null;
  if (nickname.length < MIN_NICKNAME || nickname.length > MAX_NICKNAME) return "length";
  if (/[\u0000-\u001f#@<>]/.test(nickname)) return "contact";
  if (/(https?:\/\/|www\.|\.com|\.kh|t\.me)/i.test(nickname) || /[0-9]{5,}/.test(nickname)) return "contact";
  if (/(arom|admin|moderator)/i.test(nickname)) return "reserved";
  return null;
}

export function nicknameProblemText(problem: ReturnType<typeof nicknameProblem>, km: boolean) {
  if (problem === "length") {
    return km ? `ឈ្មោះត្រូវមាន ${MIN_NICKNAME} ដល់ ${MAX_NICKNAME} តួអក្សរ។` : `Use ${MIN_NICKNAME} to ${MAX_NICKNAME} characters.`;
  }
  if (problem === "contact") {
    return km
      ? "សូមកុំដាក់តំណ អ៊ីមែល លេខទូរស័ព្ទ ឬសញ្ញា # @ ក្នុងឈ្មោះ។"
      : "Please leave out links, emails, phone numbers and the # or @ signs.";
  }
  if (problem === "reserved") {
    return km ? "ឈ្មោះនេះមិនអាចប្រើបានទេ។" : "This name cannot be used.";
  }
  return "";
}
