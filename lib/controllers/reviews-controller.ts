import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  MAX_HIDE_REASON,
  MAX_REVIEW_COMMENT,
  MAX_REVIEW_REPLY,
  type AdminReview,
  type AdminReviewsResponse,
  type MyReview,
  type MyReviewsResponse,
  type ProReview,
  type ProReviewsResponse,
} from "@/lib/reviews";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "./role-controller";
import { databaseError, fail, invalidInput, json, readJson, unauthorized } from "./shared";

/*
 * AROM reviews controller (BACKEND-HANDOFF.md section 30). Every write goes
 * through a database function that checks the rules again: a completed
 * session to review, the owner to reply, an admin to hide. No response ever
 * says who wrote a review.
 */

const slugSchema = z.string().trim().min(1).max(120);

interface MyReviewRow {
  rating: number;
  comment: string | null;
  reply: string | null;
  replied_at: string | null;
  hidden_at: string | null;
  hidden_reason: string | null;
  created_at: string;
  updated_at: string;
  professional: { slug: string } | { slug: string }[] | null;
}

async function signedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

async function loadMyReviews(supabase: SupabaseClient): Promise<MyReview[] | null> {
  // RLS returns the caller's own reviews only.
  const { data, error } = await supabase
    .from("professional_reviews")
    .select("rating, comment, reply, replied_at, hidden_at, hidden_reason, created_at, updated_at, professional:professional_profiles(slug)")
    .order("created_at", { ascending: false })
    .returns<MyReviewRow[]>();
  if (error) return null;
  return (data ?? []).flatMap((row) => {
    const professional = Array.isArray(row.professional) ? row.professional[0] : row.professional;
    if (!professional) return [];
    return [
      {
        professionalSlug: professional.slug,
        rating: row.rating,
        comment: row.comment ?? "",
        reply: row.reply ?? "",
        repliedAt: row.replied_at,
        hiddenReason: row.hidden_at ? (row.hidden_reason ?? "") : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    ];
  });
}

async function myReviewsResponse(supabase: SupabaseClient) {
  const reviews = await loadMyReviews(supabase);
  if (!reviews) return fail("server_error", "We could not load your reviews.", 500);
  return json<MyReviewsResponse>({ reviews });
}

/** GET /api/reviews: the caller's own reviews. */
export async function listMyReviews() {
  const supabase = await signedIn();
  if (!supabase) return unauthorized();
  return myReviewsResponse(supabase);
}

const saveSchema = z.object({
  slug: slugSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(MAX_REVIEW_COMMENT).default(""),
});

/** PUT /api/reviews  body `{ slug, rating, comment? }`: write or edit the caller's review. */
export async function saveMyReview(request: NextRequest) {
  const supabase = await signedIn();
  if (!supabase) return unauthorized();

  const body = saveSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { error } = await supabase.rpc("save_my_review", {
    p_slug: body.data.slug,
    p_rating: body.data.rating,
    p_comment: body.data.comment || null,
  });
  if (error) return databaseError(error, "Your review could not be saved. Please try again.");
  return myReviewsResponse(supabase);
}

/** DELETE /api/reviews?slug=  : delete the caller's review of that professional. */
export async function deleteMyReview(request: NextRequest) {
  const supabase = await signedIn();
  if (!supabase) return unauthorized();

  const slug = slugSchema.safeParse(request.nextUrl.searchParams.get("slug"));
  if (!slug.success) return invalidInput();

  const { error } = await supabase.rpc("delete_my_review", { p_slug: slug.data });
  if (error) return databaseError(error, "Your review could not be deleted. Please try again.");
  return myReviewsResponse(supabase);
}

interface ProReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  replied_at: string | null;
  hidden: boolean;
  hidden_reason: string | null;
  created_at: string;
}

async function loadProReviews(supabase: SupabaseClient): Promise<ProReview[] | null> {
  const { data, error } = await supabase.rpc("my_professional_reviews");
  if (error) return null;
  return ((data ?? []) as ProReviewRow[]).map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment ?? "",
    reply: row.reply ?? "",
    repliedAt: row.replied_at,
    createdAt: row.created_at,
    hidden: row.hidden,
    hiddenReason: row.hidden_reason ?? "",
  }));
}

/** GET /api/pro/reviews: the professional's own reviews, hidden ones included. */
export async function listProReviews() {
  const guard = await requireRole("professional", "admin");
  if (!guard.ok) return guard.response;

  const reviews = await loadProReviews(guard.supabase);
  if (!reviews) return fail("server_error", "We could not load your reviews.", 500);
  return json<ProReviewsResponse>({ reviews });
}

const replySchema = z.object({ reply: z.string().trim().max(MAX_REVIEW_REPLY) });

/** PUT /api/pro/reviews/:id  body `{ reply }`. An empty reply removes it. */
export async function replyToReview(request: NextRequest, reviewId: string) {
  const guard = await requireRole("professional", "admin");
  if (!guard.ok) return guard.response;

  const id = z.string().uuid().safeParse(reviewId);
  const body = replySchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  const { error } = await guard.supabase.rpc("reply_to_review", {
    p_review_id: id.data,
    p_reply: body.data.reply || null,
  });
  if (error) return databaseError(error, "Your reply could not be saved. Please try again.");

  const reviews = await loadProReviews(guard.supabase);
  return json<ProReviewsResponse>({ reviews: reviews ?? [] });
}

interface AdminReviewRow {
  id: string;
  professional_slug: string;
  professional_name: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  replied_at: string | null;
  hidden_at: string | null;
  hidden_reason: string | null;
  created_at: string;
}

async function loadAdminReviews(supabase: SupabaseClient): Promise<AdminReview[] | null> {
  const { data, error } = await supabase.rpc("admin_list_reviews");
  if (error) return null;
  return ((data ?? []) as AdminReviewRow[]).map((row) => ({
    id: row.id,
    professionalSlug: row.professional_slug,
    professionalName: row.professional_name,
    rating: row.rating,
    comment: row.comment ?? "",
    reply: row.reply ?? "",
    repliedAt: row.replied_at,
    createdAt: row.created_at,
    hiddenAt: row.hidden_at,
    hiddenReason: row.hidden_reason ?? "",
  }));
}

/** GET /api/admin/reviews: every review, newest first, without the writer. */
export async function listAdminReviews() {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const reviews = await loadAdminReviews(guard.supabase);
  if (!reviews) return fail("server_error", "We could not load reviews.", 500);
  return json<AdminReviewsResponse>({ reviews });
}

const hideSchema = z.discriminatedUnion("hidden", [
  z.object({ hidden: z.literal(true), reason: z.string().trim().min(1).max(MAX_HIDE_REASON) }),
  z.object({ hidden: z.literal(false) }),
]);

/** POST /api/admin/reviews/:id  body `{ hidden: true, reason }` or `{ hidden: false }`. */
export async function setReviewHidden(request: NextRequest, reviewId: string) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const id = z.string().uuid().safeParse(reviewId);
  const body = hideSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  const { error } = await guard.supabase.rpc("admin_set_review_hidden", {
    p_review_id: id.data,
    p_hidden: body.data.hidden,
    p_reason: body.data.hidden ? body.data.reason : null,
  });
  if (error) return databaseError(error, "That review could not be changed. Please try again.");

  const reviews = await loadAdminReviews(guard.supabase);
  return json<AdminReviewsResponse>({ reviews: reviews ?? [] });
}
