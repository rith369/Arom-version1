import type { AuthError, SupabaseClient, User } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import type {
  AuthErrorBody,
  AuthErrorCode,
  AuthUser,
  UserRole,
} from '@/lib/auth';
import { upStudentEmail } from '@/lib/up-student';

/*
 * Helpers shared by every AROM controller. Responses are never cached,
 * because they carry private account data.
 */

export const NO_STORE = { 'Cache-Control': 'private, no-store' };

const ROLES: readonly UserRole[] = ['user', 'professional', 'admin'];

export function json<T>(body: T, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function fail(code: AuthErrorCode, message: string, status: number) {
  return json<AuthErrorBody>({ error: { code, message } }, status);
}

export async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * Answers a failed database call. Messages our SQL functions raise for people
 * (code P0001, for example "This time is no longer available") are shown;
 * anything else is a database detail, so the person sees `fallback` instead.
 */
export function databaseError(error: { code?: string; message: string }, fallback: string, status = 400) {
  if (error.code === "P0001") return fail("invalid_input", error.message, status);
  return fail("server_error", fallback, 500);
}

export function invalidInput() {
  return fail('invalid_input', 'Please check the details you entered.', 400);
}

export function unauthorized() {
  return fail('unauthorized', 'Please log in to continue.', 401);
}

export function isRateLimited(error: AuthError) {
  return error.status === 429 || error.code === 'over_request_rate_limit';
}

export interface ProfileRow {
  full_name: string | null;
  pronouns: string | null;
  about_me: string | null;
  avatar_path: string | null;
  role: string;
  language: string;
  account_status: string;
  hide_identity: boolean;
  nickname: string | null;
  created_at: string;
  updated_at: string;
}

export const PROFILE_COLUMNS =
  'full_name, pronouns, about_me, avatar_path, role, language, account_status, hide_identity, nickname, created_at, updated_at';

/** Builds the public user shape from the auth user and their profile row. */
export function buildAuthUser(
  user: User,
  profile: ProfileRow | null,
): AuthUser {
  const metadataName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : '';
  const upEmail = upStudentEmail(user);

  return {
    id: user.id,
    email: user.email ?? '',
    fullName: profile?.full_name ?? metadataName,
    pronouns: profile?.pronouns ?? '',
    aboutMe: profile?.about_me ?? '',
    avatarUrl: profile?.avatar_path
      ? `/api/profile/photo?v=${encodeURIComponent(profile.updated_at)}`
      : null,
    role: ROLES.find((value) => value === profile?.role) ?? 'user',
    language: profile?.language === 'km' ? 'km' : 'en',
    accountStatus:
      profile?.account_status === 'suspended' ? 'suspended' : 'active',
    hideIdentity: profile?.hide_identity ?? true,
    nickname: profile?.nickname ?? '',
    upStudent: upEmail !== null,
    upEmail,
    createdAt: profile?.created_at ?? user.created_at,
  };
}

/** Reads the caller's own profile row. RLS limits it to `auth.uid() = id`. */
export async function toAuthUser(
  supabase: SupabaseClient,
  user: User,
): Promise<AuthUser> {
  const { data: profile } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  return buildAuthUser(user, profile);
}
