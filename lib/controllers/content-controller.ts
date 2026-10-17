import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  initialContentRecords,
  type ContentBody,
  type ContentRecord,
  type ContentType,
} from "@/app/admin/_data/content";
import { checkDraft, checkForPublish } from "@/app/admin/_data/content-checks";
import { fail, invalidInput, json, readJson } from "./shared";
import { requireRole } from "./role-controller";

/*
 * AROM MindGuide content editor (BACKEND-HANDOFF.md section 9). Admins only.
 * Lessons, tips and practices start in code (initialContentRecords). An item
 * enters the database, with its code version, the first time an admin
 * changes it; after that the database is the record. Every change goes
 * through a security definer function; publishing, hiding, deleting and
 * restoring are audit logged.
 */

type Supabase = Extract<Awaited<ReturnType<typeof requireRole>>, { ok: true }>["supabase"];

const SEED_AUTHOR = "AROM team";
const MAX_BODY_BYTES = 300_000;

interface ItemRow {
  kind: ContentType;
  key: string;
  live_version: number | null;
  deleted_at: string | null;
}
interface VersionRow {
  kind: ContentType;
  key: string;
  version: number;
  body: ContentBody;
  published_at: string;
  publisher: { full_name: string | null } | null;
}
interface DraftRow {
  kind: ContentType;
  key: string;
  body: ContentBody;
  base_version: number | null;
  updated_at: string;
  editor: { full_name: string | null } | null;
}

const iso = (value: string) => new Date(value).toISOString();
const seedById = new Map(initialContentRecords.map((record) => [record.id, record]));

async function loadRecords(supabase: Supabase): Promise<ContentRecord[] | null> {
  const [items, versions, drafts] = await Promise.all([
    supabase.from("content_items").select("kind, key, live_version, deleted_at").returns<ItemRow[]>(),
    supabase
      .from("content_versions")
      .select("kind, key, version, body, published_at, publisher:profiles!content_versions_published_by_fkey(full_name)")
      .order("version", { ascending: true })
      .returns<VersionRow[]>(),
    supabase
      .from("content_drafts")
      .select("kind, key, body, base_version, updated_at, editor:profiles!content_drafts_updated_by_fkey(full_name)")
      .returns<DraftRow[]>(),
  ]);
  if (items.error || versions.error || drafts.error) return null;

  const stored = new Map<string, ContentRecord>();
  const deleted = new Set<string>();
  for (const item of items.data ?? []) {
    const id = `${item.kind}:${item.key}`;
    if (item.deleted_at) {
      deleted.add(id);
      continue;
    }
    stored.set(id, { id, sourceId: item.key, type: item.kind, liveVersion: item.live_version, versions: [], draft: null });
  }
  for (const row of versions.data ?? []) {
    stored.get(`${row.kind}:${row.key}`)?.versions.push({
      version: row.version,
      body: row.body,
      publishedAt: iso(row.published_at),
      publishedBy: row.publisher?.full_name || SEED_AUTHOR,
    });
  }
  for (const row of drafts.data ?? []) {
    const record = stored.get(`${row.kind}:${row.key}`);
    if (record) {
      record.draft = {
        body: row.body,
        baseVersion: row.base_version,
        updatedAt: iso(row.updated_at),
        updatedBy: row.editor?.full_name || SEED_AUTHOR,
      };
    }
  }

  // Code items not changed yet keep their code version; deleted ones stay gone.
  const fromCode = initialContentRecords.filter((record) => !stored.has(record.id) && !deleted.has(record.id));
  return [...fromCode, ...stored.values()];
}

/** GET /api/admin/content */
export async function listContent() {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const records = await loadRecords(guard.supabase);
  if (!records) return fail("server_error", "Content could not be loaded.", 500);
  return json({ records });
}

// Brings a code item into the database before its first change.
async function ensureStored(supabase: Supabase, id: string) {
  const seed = seedById.get(id);
  if (!seed) return null;
  const live = seed.versions[0];
  const body = live?.body ?? seed.draft?.body;
  if (!body) return null;
  return supabase.rpc("admin_init_content_item", {
    p_kind: seed.type,
    p_key: seed.sourceId,
    p_seed_body: body,
    p_seed_live: Boolean(live),
  });
}

const idSchema = z.string().regex(/^(lesson|tip|practice):[^:#\s]{1,100}$/);
const bodySchema = z
  .object({
    type: z.enum(["lesson", "tip", "practice"]),
    meta: z.object({
      // Above the editor's own limits, so text written in code always fits.
      title: z.string().max(300),
      kmTitle: z.string().max(400),
      description: z.string().max(6000),
      kmDescription: z.string().max(8000),
      category: z.string().max(100),
      duration: z.string().max(50),
      difficulty: z.enum(["Beginner", "Intermediate"]),
      image: z.string().max(500),
    }),
    details: z.object({ sourceId: z.string() }).passthrough(),
  })
  .passthrough();

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), id: idSchema, body: z.unknown(), expectedUpdatedAt: z.string().datetime({ offset: true }).nullable() }),
  z.object({ action: z.literal("publish"), id: idSchema, expectedUpdatedAt: z.string().datetime({ offset: true }).nullable() }),
  z.object({ action: z.literal("discard"), id: idSchema }),
  z.object({ action: z.literal("delete"), id: idSchema }),
  z.object({ action: z.literal("hidden"), id: idSchema, hidden: z.boolean() }),
  z.object({ action: z.literal("restore"), id: idSchema, version: z.number().int().min(1) }),
]);

type ActionAnswer = { ok: true; updatedAt: string | null; records: ContentRecord[] } | { ok: false; code: "stale" | "shape" };

/** POST /api/admin/content `{ action, id, ... }`: save, publish, discard, delete, hidden, restore. */
export async function changeContent(request: NextRequest) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;
  const { supabase } = guard;

  const input = actionSchema.safeParse(await readJson(request));
  if (!input.success) return invalidInput();
  const data = input.data;
  const [kind, key] = data.id.split(":") as [ContentType, string];

  const init = await ensureStored(supabase, data.id);
  if (init?.error) return fail("server_error", "That could not be saved. Please try again.", 500);

  const shape = () => json<ActionAnswer>({ ok: false, code: "shape" }, 400);
  let call;
  if (data.action === "save") {
    const body = bodySchema.safeParse(data.body);
    if (
      !body.success ||
      body.data.type !== kind ||
      body.data.details.sourceId !== key ||
      JSON.stringify(data.body).length > MAX_BODY_BYTES ||
      checkDraft(data.body as ContentBody).length > 0
    ) {
      return shape();
    }
    call = supabase.rpc("save_content_draft", { p_kind: kind, p_key: key, p_body: data.body, p_expected: data.expectedUpdatedAt });
  } else if (data.action === "publish") {
    // The full check runs on exactly the saved draft, the same rules the editor shows.
    const { data: draft } = await supabase
      .from("content_drafts")
      .select("body")
      .eq("kind", kind)
      .eq("key", key)
      .maybeSingle<{ body: ContentBody }>();
    if (!draft) return json<ActionAnswer>({ ok: false, code: "stale" }, 409);
    if (checkForPublish(draft.body, false).some((problem) => problem.level === "error")) return shape();
    call = supabase.rpc("publish_content", { p_kind: kind, p_key: key, p_expected: data.expectedUpdatedAt });
  } else if (data.action === "discard") {
    call = supabase.rpc("discard_content_draft", { p_kind: kind, p_key: key });
  } else if (data.action === "delete") {
    call = supabase.rpc("delete_content", { p_kind: kind, p_key: key });
  } else if (data.action === "hidden") {
    call = supabase.rpc("set_content_hidden", { p_kind: kind, p_key: key, p_hidden: data.hidden });
  } else {
    call = supabase.rpc("restore_content_version", { p_kind: kind, p_key: key, p_version: data.version });
  }

  const { data: result, error } = await call;
  if (error) {
    if (error.code === "PT409") return json<ActionAnswer>({ ok: false, code: "stale" }, 409);
    if (error.code === "P0001" || error.code === "22023") return fail("invalid_input", error.message, 400);
    return fail("server_error", "That could not be saved. Please try again.", 500);
  }

  const records = await loadRecords(supabase);
  if (!records) return fail("server_error", "Content could not be loaded.", 500);
  return json<ActionAnswer>({ ok: true, updatedAt: typeof result === "string" ? iso(result) : null, records });
}
