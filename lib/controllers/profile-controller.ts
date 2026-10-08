import type { NextRequest } from "next/server";
import { profileUpdateSchema, type ProfileResponse } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  PROFILE_COLUMNS,
  buildAuthUser,
  fail,
  invalidInput,
  json,
  readJson,
  toAuthUser,
  unauthorized,
  type ProfileRow,
} from "./shared";

/*
 * AROM profile controller. Every query runs as the signed in user, so RLS
 * keeps it to their own row. Role is never accepted from the client.
 */

/** GET /api/profile */
export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return unauthorized();
  return json<ProfileResponse>({ user: await toAuthUser(supabase, user) });
}

/** PATCH /api/profile. Accepts `fullName` and `locale` only. */
export async function updateProfile(request: NextRequest) {
  const parsed = profileUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const { fullName, locale } = parsed.data;
  const changes: { full_name?: string; locale?: "en" | "km" } = {};
  if (fullName !== undefined) changes.full_name = fullName;
  if (locale !== undefined) changes.locale = locale;

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(changes)
    .eq("id", user.id)
    .select(PROFILE_COLUMNS)
    .maybeSingle<ProfileRow>();

  if (error || !profile) {
    return fail("server_error", "We could not save your changes. Please try again.", 500);
  }

  // Keep auth metadata in step so emails and fallbacks use the new name.
  if (fullName !== undefined) {
    await supabase.auth.updateUser({ data: { full_name: fullName } });
  }

  return json<ProfileResponse>({ user: buildAuthUser(user, profile) });
}
