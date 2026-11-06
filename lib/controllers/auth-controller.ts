import { NextResponse, type NextRequest } from "next/server";
import { createClient as createPlainClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  PASSWORD_RESET_EMAIL_ON,
  changePasswordSchema,
  loginSchema,
  resendSchema,
  resetPasswordSchema,
  safeNextPath,
  signupSchema,
  verifyCodeSchema,
  type LoginResponse,
  type RegisterResponse,
  type SessionResponse,
} from "@/lib/auth";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { LIMITS, clearRateLimit, clientAddress, overLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import {
  NO_STORE,
  fail,
  invalidInput,
  isRateLimited,
  json,
  readJson,
  toAuthUser,
  unauthorized,
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

  // This form can also log in to an existing account, so it shares the password limit.
  const limited = await overLimit([
    { name: "password", value: email, limit: LIMITS.passwordPerAccount },
    { name: "signup-address", value: clientAddress(request), limit: LIMITS.signupPerAddress },
  ]);
  if (limited) return fail("rate_limited", "Too many attempts. Please wait a while and try again.", 429);

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

  const limited = await overLimit([
    { name: "email", value: parsed.data.email, limit: LIMITS.emailPerAccount },
    { name: "email-address", value: clientAddress(request), limit: LIMITS.emailPerAddress },
  ]);
  if (limited) return fail("rate_limited", "Please wait a while before asking for another email.", 429);

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

  const limited = await overLimit([
    { name: "password", value: parsed.data.email, limit: LIMITS.passwordPerAccount },
    { name: "login-address", value: clientAddress(request), limit: LIMITS.loginPerAddress },
  ]);
  if (limited) return fail("rate_limited", "Too many attempts. Please wait 15 minutes and try again.", 429);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (isRateLimited(error)) {
      return fail("rate_limited", "Too many attempts. Please wait a moment and try again.", 429);
    }
    if (error.code === "email_not_confirmed") {
      return fail("email_not_confirmed", "Please confirm your email before logging in.", 403);
    }
    if (error.code === "user_banned") {
      return fail("forbidden", "This account is suspended. Please contact AROM support.", 403);
    }
    if (error.code === "invalid_credentials" || error.status === 400) {
      return fail("invalid_credentials", "Email or password is incorrect.", 401);
    }
    return fail("server_error", "We could not log you in. Please try again.", 500);
  }

  await clearRateLimit("password", parsed.data.email);

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

  // A suspended account's login is banned, so Supabase refuses Google sign in
  // and sends the reason back here. Say so, instead of "please try again".
  if (
    searchParams.get("error_code") === "user_banned" ||
    /banned/i.test(searchParams.get("error_description") ?? "")
  ) {
    return redirect("/login?error=suspended");
  }

  // A password reset email. With a custom email template the link carries a
  // token, which is not used yet: email scanners open links, and that would use
  // it up before the person sees the page. With Supabase's default email it
  // carries a code, which only works in the browser that asked for the email.
  if (searchParams.get("flow") === "recovery") {
    if (tokenHash) return redirect(`/reset-password?token_hash=${encodeURIComponent(tokenHash)}`);
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return redirect("/reset-password?via=link");
    }
    return redirect("/forgot-password?expired=1");
  }

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

  // A link that carries a token signs in whoever opens it. Someone could send
  // their own link to another person, who would then write into the wrong
  // account (security audit L9). Email scanners open links too. So the person
  // presses Continue on AROM's own page first (confirmEmailLink).
  if (tokenHash && (type === "email" || type === "signup")) {
    const params = new URLSearchParams({ token_hash: tokenHash, type });
    if (next !== "/") params.set("next", next);
    return redirect(`/signup/confirm?${params.toString()}`);
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

/** POST /api/auth/forgot-password. Always answers the same way, so emails cannot be probed. */
export async function forgotPassword(request: NextRequest) {
  if (!PASSWORD_RESET_EMAIL_ON) {
    return fail("forbidden", "Password reset emails are not available yet.", 403);
  }

  const parsed = resendSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput();

  const limited = await overLimit([
    { name: "email", value: parsed.data.email, limit: LIMITS.emailPerAccount },
    { name: "email-address", value: clientAddress(request), limit: LIMITS.emailPerAddress },
  ]);
  if (limited) return fail("rate_limited", "Please wait a while before asking for another email.", 429);

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${request.nextUrl.origin}/auth/confirm?flow=recovery`,
  });

  if (error && isRateLimited(error)) {
    return fail("rate_limited", "Please wait a moment before asking for another email.", 429);
  }
  return json({ ok: true });
}

/** Saves the new password and ends the person's other sessions. Null when it worked. */
async function saveNewPassword(supabase: SupabaseClient, password: string) {
  const { error } = await supabase.auth.updateUser({ password });

  if (!error) {
    // Anyone who was using an old password is logged out.
    await supabase.auth.signOut({ scope: "others" });
    return null;
  }
  if (isRateLimited(error)) {
    return fail("rate_limited", "Too many attempts. Please wait a moment and try again.", 429);
  }
  switch (error.code) {
    case "weak_password":
      return fail("invalid_input", "Please choose a stronger password. This one is too weak or has appeared in a data leak.", 400);
    case "same_password":
      return fail("invalid_input", "That is already your password. Please choose a different one.", 400);
    case "insufficient_aal":
      return fail("mfa_required", "Please enter the code from your authenticator app first.", 403);
    case "reauthentication_needed":
      return fail("forbidden", "Please log out, log in again, and then try once more.", 403);
    default:
      return fail("server_error", "Your password could not be saved. Please try again.", 500);
  }
}

const RESET_LINK_EXPIRED =
  "This link has expired, was already used, or was opened in a different browser. Please ask for a new one.";
/** How long after opening the reset email a new password can be saved without the old one. */
const RECOVERY_SESSION_SECONDS = 30 * 60;

/**
 * True only for a session opened from a reset email a short time ago, so a
 * normal signed in session can never reach this without the current password.
 */
async function isFreshRecoverySession(supabase: SupabaseClient) {
  const { data } = await supabase.auth.getClaims();
  const entries: unknown = data?.claims?.amr;
  if (!Array.isArray(entries)) return false;
  const now = Math.floor(Date.now() / 1000);
  return entries.some((entry: unknown) => {
    if (typeof entry !== "object" || entry === null) return false;
    const { method, timestamp } = entry as { method?: unknown; timestamp?: unknown };
    return method === "recovery" && typeof timestamp === "number" && now - timestamp < RECOVERY_SESSION_SECONDS;
  });
}

/** POST /api/auth/reset-password  body `{ tokenHash?, password, confirmPassword }`. Signs them in. */
export async function resetPassword(request: NextRequest) {
  const parsed = resetPasswordSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput();

  const limited = await overLimit([
    { name: "reset-address", value: clientAddress(request), limit: LIMITS.resetPerAddress },
  ]);
  if (limited) return fail("rate_limited", "Too many attempts. Please wait 15 minutes and try again.", 429);

  const supabase = await createClient();

  if (parsed.data.tokenHash) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: parsed.data.tokenHash,
      type: "recovery",
    });
    if (error || !data.user) {
      if (error && isRateLimited(error)) {
        return fail("rate_limited", "Too many attempts. Please wait a moment and try again.", 429);
      }
      if (error?.code === "user_banned") {
        return fail("forbidden", "This account is suspended. Please contact AROM support.", 403);
      }
      return fail("invalid_input", RESET_LINK_EXPIRED, 400);
    }
  } else if (!(await isFreshRecoverySession(supabase))) {
    return fail("invalid_input", RESET_LINK_EXPIRED, 400);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("invalid_input", RESET_LINK_EXPIRED, 400);

  const failed = await saveNewPassword(supabase, parsed.data.password);
  if (failed) return failed;

  return json<LoginResponse>({ user: await toAuthUser(supabase, user) });
}

/** Checks a password on a separate client, so the person's own session stays as it is. */
export async function passwordIsRight(email: string, password: string): Promise<"ok" | "wrong" | "rate_limited"> {
  const checker = createPlainClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error } = await checker.auth.signInWithPassword({ email, password });
  if (error) return isRateLimited(error) ? "rate_limited" : "wrong";
  await checker.auth.signOut({ scope: "local" });
  return "ok";
}

/** POST /api/auth/password  body `{ currentPassword, password, confirmPassword }`. */
export async function changePassword(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return unauthorized();

  const parsed = changePasswordSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput();

  const limited = await overLimit([
    { name: "password-check", value: user.id, limit: LIMITS.passwordCheckPerUser },
  ]);
  if (limited) return fail("rate_limited", "Too many attempts. Please wait 15 minutes and try again.", 429);

  const check = await passwordIsRight(user.email, parsed.data.currentPassword);
  if (check === "rate_limited") {
    return fail("rate_limited", "Too many attempts. Please wait a moment and try again.", 429);
  }
  if (check === "wrong") return fail("invalid_credentials", "Your current password is not right.", 400);
  await clearRateLimit("password-check", user.id);

  const failed = await saveNewPassword(supabase, parsed.data.password);
  if (failed) return failed;

  return json({ ok: true });
}

/**
 * POST /api/auth/verify  body `{ email, code }`. The 6 digit code from the
 * confirmation email, typed on the device that signed up. Signs them in.
 */
export async function verifyCode(request: NextRequest) {
  const parsed = verifyCodeSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput();

  const { email, code } = parsed.data;
  const limited = await overLimit([
    { name: "code", value: email, limit: LIMITS.codePerAccount },
    { name: "code-address", value: clientAddress(request), limit: LIMITS.codePerAddress },
  ]);
  if (limited) return fail("rate_limited", "Too many attempts. Please wait 15 minutes and try again.", 429);

  const supabase = await createClient();
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

const confirmLinkSchema = z.object({
  tokenHash: z.string().trim().min(10).max(200),
  type: z.enum(["email", "signup"]),
});

/**
 * POST /api/auth/confirm-link  body `{ tokenHash, type }`. The Continue button
 * on /signup/confirm, after opening a confirmation link (security audit L9).
 * Only AROM's own pages can call it: another site cannot press it for someone.
 */
export async function confirmEmailLink(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return fail("forbidden", "Please open the link from your email again.", 403);
  }
  const parsed = confirmLinkSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput();

  const limited = await overLimit([
    { name: "code-address", value: clientAddress(request), limit: LIMITS.codePerAddress },
  ]);
  if (limited) return fail("rate_limited", "Too many attempts. Please wait 15 minutes and try again.", 429);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: parsed.data.tokenHash,
    type: parsed.data.type,
  });
  if (error || !data.user) {
    if (error && isRateLimited(error)) {
      return fail("rate_limited", "Too many attempts. Please wait a moment and try again.", 429);
    }
    return fail("invalid_input", "This link was already used or has expired.", 400);
  }

  return json<LoginResponse>({ user: await toAuthUser(supabase, data.user) });
}
