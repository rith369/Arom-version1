import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "@/lib/auth";
import { ROLE_ROUTES } from "@/lib/roles";
import { supabaseAnonKey, supabaseUrl } from "./env";

/** Routes that need a signed in user. */
const PROTECTED_PREFIXES = ["/profile", "/settings"];
const PROTECTED_PATTERNS = [/^\/professional\/[^/]+\/book(\/|$)/];

/** Auth pages a signed in user should skip. */
const GUEST_ONLY = ["/login", "/signup"];

const startsWithSegment = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

function isProtected(pathname: string) {
  return (
    PROTECTED_PREFIXES.some((prefix) => startsWithSegment(pathname, prefix)) ||
    PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname)) ||
    ROLE_ROUTES.some(({ prefix }) => startsWithSegment(pathname, prefix))
  );
}

/** Role from the `user_role` JWT claim set by `custom_access_token_hook`. */
function roleFromClaims(claims: Record<string, unknown> | undefined): UserRole {
  const role = claims?.user_role;
  return role === "admin" || role === "professional" ? role : "user";
}

/**
 * Refreshes the Supabase session cookie on every request and applies
 * route guards. Called from the root `proxy.ts`.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // Do not run code between createServerClient and getClaims: it can sign users out at random.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

  if (!signedIn && isProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return withCookies(NextResponse.redirect(url), response);
  }

  // Fast page guard from the token. APIs re-check the role in the database.
  const roleRoute = ROLE_ROUTES.find(({ prefix }) => startsWithSegment(pathname, prefix));
  if (signedIn && roleRoute && !roleRoute.roles.includes(roleFromClaims(data?.claims))) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return withCookies(NextResponse.redirect(url), response);
  }

  if (signedIn && GUEST_ONLY.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return withCookies(NextResponse.redirect(url), response);
  }

  return response;
}

/** Carries refreshed auth cookies over to a redirect response. */
function withCookies(target: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}
