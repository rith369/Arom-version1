import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  loginSchema,
  resendSchema,
  safeNextPath,
  signupSchema,
  verifyCodeSchema,
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

/**
 * Someone signed up with an email that already has an account. If the
 * password they typed is right, they own the account, so log them in. In
 * every other case answer exactly like a new signup, so nobody can use this
 * form to find out which emails have accounts.
 */
async function signInExistingAccount(
  supabase: SupabaseClient,
  email: string,
  password: string,
  origin: string,
) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (!error && data.user) {
    return json<RegisterResponse>(
      { needsConfirmation: false, user: await toAuthUser(supabase, data.user) },
      200,
    );
  }
  if (error && isRateLimited(error)) {
    return fail("rate_limited", "Too many attempts. Please wait a moment and try again.", 429);
  }
  if (error?.code === "email_not_confirmed") {
    // Their own account, not confirmed yet: send a fresh link.
    await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${origin}/auth/confirm` },
    });
  }
  return json<RegisterResponse>({ needsConfirmation: true, user: null }, 201);
}

/** POST /api/auth/register */
export async function register(request: NextRequest) {
  const parsed = signupSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput();

  const { email, password, fullName, language } = parsed.data;
  const origin = request.nextUrl.origin;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Role is not sent. The database trigger always creates new accounts as `user`.
      data: { full_name: fullName, language: language ?? "en" },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    if (isRateLimited(error)) {
      return fail("rate_limited", "Too many attempts. Please wait a moment and try again.", 429);
    }
    if (error.code === "weak_password") return invalidInput();
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return signInExistingAccount(supabase, email, password, origin);
    }
    return fail("server_error", "We could not create your account. Please try again.", 500);
  }

  // With email confirmation on, Supabase hides an existing confirmed account by
  // returning a user with no identities and sending no email.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    return signInExistingAccount(supabase, email, password, origin);
  }

  // A new account: no session until the email is confirmed.
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

/**
 * GET /auth/confirm. Opening the link from the confirmation email.
 *
 *   - Success: the person is signed in on this device and goes home.
 *   - `code` that cannot be used here (usually the email was opened on
 *     another device or browser): Supabase has already confirmed the email
 *     before sending them back, so say so and ask them to log in. Never
 *     "expired" for an account that is confirmed.
 *   - Already signed in (the link was opened twice): just go home.
 *   - Anything else (link expired or already used): the expired page, which
 *     offers Log in first and a new link second.
 */
export async function confirmEmail(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));
  const supabase = await createClient();

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const redirect = (target: string) =>
    NextResponse.redirect(new URL(target, request.url), { headers: NO_STORE });

  // Linking a UP Google account from /profile/up-student (`link=up`,
  // BACKEND-HANDOFF.md section 33). That page says whether it worked.
  if (searchParams.get("link") === "up") {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return redirect("/profile/up-student?linked=1");
    }
    const taken = searchParams.get("error_code") === "identity_already_exists";
    return redirect(`/profile/up-student?error=${taken ? "taken" : "failed"}`);
  }

  // Google sign in comes back here too (`provider=google`). Without a page to
  // return to, people land where their role starts. If Google did not finish
  // (cancelled or refused), the login page says so.
  if (searchParams.get("provider") === "google") {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        if (searchParams.get("next")) return redirect(next);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const role = user ? (await toAuthUser(supabase, user)).role : "user";
        return redirect(role === "admin" ? "/admin" : role === "professional" ? "/pro" : "/");
      }
    }
    return redirect(`/login?error=google${searchParams.get("next") ? `&next=${encodeURIComponent(next)}` : ""}`);
  }

  if (tokenHash && (type === "email" || type === "signup")) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return redirect(next);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return redirect(next);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return redirect(next);

  // Supabase only hands out a code after confirming the email.
  if (code && !searchParams.get("error")) {
    return redirect(`/login?confirmed=1${next === "/" ? "" : `&next=${encodeURIComponent(next)}`}`);
  }

  return redirect("/signup/confirm?status=expired");
}

/**
 * POST /api/auth/verify  body `{ email, code }`. The 6 digit code from the
 * confirmation email, typed on the device that signed up. Signs them in.
 */
export async function verifyCode(request: NextRequest) {
  const parsed = verifyCodeSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput();

  const supabase = await createClient();
  const { email, code } = parsed.data;
  let { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
  // Older Supabase Auth versions only accept the signup type for this code.
  if (error && !isRateLimited(error)) {
    ({ data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "signup" }));
  }

  if (error || !data.user) {
    if (error && isRateLimited(error)) {
      return fail("rate_limited", "Too many attempts. Please wait a moment and try again.", 429);
    }
    // Same answer for a wrong, used or expired code.
    return fail("invalid_input", "That code is not right or has expired.", 400);
  }

  return json<LoginResponse>({ user: await toAuthUser(supabase, data.user) });
}
