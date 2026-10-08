import { NextResponse, type NextRequest } from "next/server";
import {
  loginSchema,
  resendSchema,
  signupSchema,
  type LoginResponse,
  type RegisterResponse,
  type SessionResponse,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  NO_STORE,
  fail,
  invalidInput,
  isRateLimited,
  json,
  readJson,
  toAuthUser,
} from "./shared";

/*
 * AROM auth controller. Route Handlers in `app/api/auth/*` stay thin and call
 * these functions. Rules for every handler here:
 *   1. Validate input with the shared zod schemas before calling Supabase.
 *   2. Return stable error codes, never raw Supabase messages.
 *   3. Never log request bodies, passwords or tokens.
 */

/** POST /api/auth/register */
export async function register(request: NextRequest) {
  const parsed = signupSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput();

  const { email, password, fullName, language } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Role is not sent. The database trigger always creates new accounts as `user`.
      data: { full_name: fullName, language: language ?? "en" },
      emailRedirectTo: `${request.nextUrl.origin}/auth/confirm`,
    },
  });

  if (error) {
    if (isRateLimited(error)) {
      return fail("rate_limited", "Too many attempts. Please wait a moment and try again.", 429);
    }
    if (error.code === "weak_password") return invalidInput();
    // Same answer for "already registered" and other failures, so emails cannot be probed.
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return json<RegisterResponse>({ needsConfirmation: true, user: null }, 201);
    }
    return fail("server_error", "We could not create your account. Please try again.", 500);
  }

  // With email confirmation on, Supabase returns no session until the link is opened.
  if (!data.session || !data.user) {
    return json<RegisterResponse>({ needsConfirmation: true, user: null }, 201);
  }

  return json<RegisterResponse>(
    { needsConfirmation: false, user: await toAuthUser(supabase, data.user) },
    201,
  );
}

/** POST /api/auth/resend. Always answers the same way, so emails cannot be probed. */
export async function resendConfirmation(request: NextRequest) {
  const parsed = resendSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput();

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${request.nextUrl.origin}/auth/confirm` },
  });

  if (error && isRateLimited(error)) {
    return fail("rate_limited", "Please wait a moment before asking for another email.", 429);
  }
  return json({ ok: true });
}

/** POST /api/auth/login */
export async function login(request: NextRequest) {
  const parsed = loginSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (isRateLimited(error)) {
      return fail("rate_limited", "Too many attempts. Please wait a moment and try again.", 429);
    }
    if (error.code === "email_not_confirmed") {
      return fail("email_not_confirmed", "Please confirm your email before logging in.", 403);
    }
    if (error.code === "invalid_credentials" || error.status === 400) {
      return fail("invalid_credentials", "Email or password is incorrect.", 401);
    }
    return fail("server_error", "We could not log you in. Please try again.", 500);
  }

  return json<LoginResponse>({ user: await toAuthUser(supabase, data.user) });
}

/** POST /api/auth/logout. Form posts get redirected, fetch calls get JSON. */
export async function logout(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const wantsJson = request.headers.get("accept")?.includes("application/json");
  if (wantsJson) return json({ ok: true });

  return NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
    headers: NO_STORE,
  });
}

/** GET /api/auth/me. Guests get `{ user: null }` with 200, so the check is not an error. */
export async function me() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return json<SessionResponse>({ user: null });
  return json<SessionResponse>({ user: await toAuthUser(supabase, user) });
}

/** Only same site relative paths, so `next` cannot redirect off AROM. */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

/** GET /auth/confirm. Handles both email template styles Supabase can send. */
export async function confirmEmail(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const supabase = await createClient();

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  let ok = false;
  if (tokenHash && (type === "email" || type === "signup")) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  const target = ok ? next : "/signup/confirm?status=expired";
  return NextResponse.redirect(new URL(target, request.url), { headers: NO_STORE });
}
