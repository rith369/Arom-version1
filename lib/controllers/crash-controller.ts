import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { CrashGroup } from "@/app/admin/_data/crashes";
import { cambodiaDay } from "@/lib/mood";
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

  const supabase = await createClient();
  // Signed in or not: the function stores the account only to count people.
  await supabase.rpc("report_crash", {
    p_kind: body.data.kind,
    p_message: body.data.message,
    p_route: body.data.route,
    p_release: body.data.release,
    p_digest: body.data.digest,
    p_occurred_at: body.data.occurredAt,
    p_client_key: clientKey(request),
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
