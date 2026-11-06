import "server-only";
import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { createPrivateStorageClient } from "@/lib/supabase/private-storage";

/*
 * Limits on login attempts (BACKEND-HANDOFF.md section 43). Counts live in the
 * database, so they hold across every server instance. Only hashes are stored,
 * never an email or an internet address.
 *
 * If the check itself fails, the attempt is allowed: a database problem must not
 * stop people logging in. Supabase's own limits still apply underneath.
 */

const MINUTE = 60;
const HOUR = 60 * MINUTE;

export const LIMITS = {
  /** Password tries on one account, shared by login and signup. Cleared by a successful login. */
  passwordPerAccount: { max: 10, windowSeconds: 15 * MINUTE },
  /** Password checks by someone already signed in (change password, delete account). */
  passwordCheckPerUser: { max: 5, windowSeconds: 15 * MINUTE },
  /** High, because a campus or a phone network shares one address. */
  loginPerAddress: { max: 100, windowSeconds: 15 * MINUTE },
  signupPerAddress: { max: 20, windowSeconds: HOUR },
  codePerAccount: { max: 10, windowSeconds: 15 * MINUTE },
  codePerAddress: { max: 100, windowSeconds: 15 * MINUTE },
  emailPerAccount: { max: 5, windowSeconds: HOUR },
  emailPerAddress: { max: 20, windowSeconds: HOUR },
  resetPerAddress: { max: 20, windowSeconds: 15 * MINUTE },
} as const;

type Limit = { max: number; windowSeconds: number };

/** The visitor's address. Vercel sets this header itself, so it cannot be faked from outside. */
export function clientAddress(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
}

/**
 * The rule name stays readable, so a lock can be counted by kind on the Admin
 * dashboard (section 47). The person or address is only ever a hash.
 */
function hashKey(secret: string, name: string, value: string) {
  const hash = createHash("sha256").update(`${secret}|${name}|${value.trim().toLowerCase()}`).digest("hex");
  return `${name}:${hash.slice(0, 40)}`;
}

function limiter() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) return null;
  try {
    return { secret, service: createPrivateStorageClient() };
  } catch {
    return null;
  }
}

/** Counts this attempt against every rule. True when any of them is over its limit. */
export async function overLimit(rules: { name: string; value: string; limit: Limit }[]) {
  const active = limiter();
  if (!active) return false;

  const results = await Promise.all(
    rules
      .filter((rule) => rule.value)
      .map(async (rule) => {
        const { data, error } = await active.service.rpc("rate_limit_hit", {
          p_key: hashKey(active.secret, rule.name, rule.value),
          p_max: rule.limit.max,
          p_window_seconds: rule.limit.windowSeconds,
        });
        if (error) {
          console.error("Rate limit check failed:", error.code);
          return true;
        }
        return data === true;
      }),
  );
  return results.some((allowed) => !allowed);
}

/** Forgets the count for one rule, after someone proves who they are. */
export async function clearRateLimit(name: string, value: string) {
  const active = limiter();
  if (!active) return;
  const { error } = await active.service.rpc("rate_limit_clear", { p_key: hashKey(active.secret, name, value) });
  if (error) console.error("Rate limit clear failed:", error.code);
}
