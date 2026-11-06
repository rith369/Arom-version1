import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { CrashGroup } from "@/app/admin/_data/crashes";
import { cambodiaDay } from "@/lib/mood";
import { createPrivateStorageClient } from "@/lib/supabase/private-storage";
import { createClient } from "@/lib/supabase/server";
import { NO_STORE, fail, invalidInput, json } from "./shared";
import { requireRole } from "./role-controller";

/*
 * AROM crash tracking (BACKEND-HANDOFF.md section 14). The browser sends
 * only the error, the page path and the build. The address is never stored:
 * it becomes a hash that changes every day, used only to limit reports.
 */

const crashSchema = z.object({
  kind: z.enum(["render", "app"]),
  message: z.string().min(1).max(300),
  // A path only. Anything after ? or # is cut off again here.
  route: z.string().max(200).transform((value) => value.split(/[?#]/)[0]),
  release: z.string().max(20),
  digest: z.string().max(100).nullable(),
  occurredAt: z.string().datetime({ offset: true }),
});

function clientKey(request: NextRequest) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  if (!address) return "";
  return createHash("sha256").update(`${address}|${cambodiaDay(Date.now())}`).digest("hex").slice(0, 32);
}

/** Only the host, or a keyword such as "inline": a full address can hold private details. */
function blockedSource(value: unknown) {
  if (typeof value !== "string" || !value) return "unknown";
  if (!value.includes(":")) return value.slice(0, 40);
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.host : url.protocol.replace(":", "");
  } catch {
    return value.split(":")[0].slice(0, 40);
  }
}

function pagePath(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    return new URL(value).pathname.slice(0, 200);
  } catch {
    return "";
  }
}

/**
 * POST /api/csp-report: browsers report what the content policy would block
 * (BACKEND-HANDOFF.md section 45). Saved as a crash report, so admins see them
 * in Admin, Crashes. Always answers 204.
 */
export async function receiveCspReport(request: NextRequest) {
  const done = new NextResponse(null, { status: 204, headers: NO_STORE });
  let raw: unknown = null;
  try {
    const text = await request.text();
    if (text.length > 20_000) return done;
    raw = JSON.parse(text);
  } catch {
    return done;
  }

  const report = (raw as { "csp-report"?: Record<string, unknown> } | null)?.["csp-report"];
  if (!report || typeof report !== "object") return done;

  const directive = String(report["effective-directive"] ?? report["violated-directive"] ?? "unknown")
    .split(" ")[0]
    .slice(0, 40);
  const source = blockedSource(report["blocked-uri"]);
  // Browser add ons are not AROM's code.
  if (/extension$/.test(source)) return done;

  await saveCrash(request, {
    p_kind: "app",
    p_message: `CSP would block ${directive}: ${source}`,
    p_route: pagePath(report["document-uri"]),
    p_release: "csp",
    p_digest: null,
    p_occurred_at: new Date().toISOString(),
  });
  return done;
}

type CrashFields = {
  p_kind: "render" | "app";
  p_message: string;
  p_route: string;
  p_release: string;
  p_digest: string | null;
  p_occurred_at: string;
};

/**
 * Only the server may save a crash report (security audit L3), so the limit
 * key always comes from the visitor's real address, never from the browser.
 * The account, if any, is kept only to count how many people saw a crash.
 */
async function saveCrash(request: NextRequest, fields: CrashFields) {
  try {
    const { data } = await (await createClient()).auth.getClaims();
    const reporter = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
    const { error } = await createPrivateStorageClient().rpc("report_crash", {
      ...fields,
      p_client_key: clientKey(request),
      p_reporter_id: reporter,
    });
    if (error) console.error("Crash report not saved:", error.code);
  } catch {
    // No secret key (local work) or no database: a crash report is never worth an error.
  }
}

/** POST /api/crash-reports: sent with navigator.sendBeacon. Always answers 204. */
export async function receiveCrashReport(request: NextRequest) {
  let raw: unknown = null;
  try {
    raw = JSON.parse(await request.text());
  } catch {
    return invalidInput();
  }
  const body = crashSchema.safeParse(raw);
  if (!body.success) return invalidInput();

  await saveCrash(request, {
    p_kind: body.data.kind,
    p_message: body.data.message,
    p_route: body.data.route,
    p_release: body.data.release,
    p_digest: body.data.digest,
    p_occurred_at: body.data.occurredAt,
  });
  return new NextResponse(null, { status: 204, headers: NO_STORE });
}

interface CrashRow {
  id: string;
  kind: CrashGroup["kind"];
  message: string;
  route: string;
  count: number;
  people: number;
  last_seen_at: string;
  release: string;
}

/** GET /api/admin/crashes?days=7: the most frequent crashes, grouped. */
export async function listCrashGroups(request: NextRequest) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const days = z.coerce.number().int().min(1).max(30).safeParse(request.nextUrl.searchParams.get("days") ?? 7);
  if (!days.success) return invalidInput();

  const { data, error } = await guard.supabase.rpc("admin_crash_groups", { p_days: days.data });
  if (error) return fail("server_error", "Crashes could not be loaded.", 500);

  const crashes: CrashGroup[] = ((data ?? []) as CrashRow[]).map((row) => ({
    id: row.id,
    kind: row.kind,
    message: row.message,
    count: row.count,
    people: row.people,
    lastSeenAt: row.last_seen_at,
    route: row.route,
    release: row.release,
  }));
  return json({ crashes });
}
