import type { User } from "@supabase/supabase-js";

/*
 * University of Puthisastra (UP) students get free UP professionals and the
 * UP clinic (BACKEND-HANDOFF.md section 33). A student address looks like
 * `name.student@puthisastra.edu.kh`. Staff use the same domain without
 * `.student`, so they do not count. UP mail runs on Google Workspace.
 *
 * The database function `public.is_up_student()` uses the same rule and is
 * what actually protects UP only bookings. This copy only decides what the
 * page shows.
 */

export const UP_DOMAIN = "puthisastra.edu.kh";

const UP_STUDENT_EMAIL = /^[^\s@]+\.student@puthisastra\.edu\.kh$/i;

export function isUpStudentEmail(email: string | null | undefined) {
  return typeof email === "string" && UP_STUDENT_EMAIL.test(email.trim());
}

/**
 * The confirmed UP student address on this account, or null. It counts when it
 * is the confirmed login email, or the email of a linked Google account.
 */
export function upStudentEmail(user: User): string | null {
  if (user.email_confirmed_at && isUpStudentEmail(user.email)) return user.email ?? null;
  for (const identity of user.identities ?? []) {
    if (identity.provider !== "google") continue;
    const email = identity.identity_data?.email;
    const verified = identity.identity_data?.email_verified;
    if (typeof email === "string" && verified !== false && isUpStudentEmail(email)) return email;
  }
  return null;
}
