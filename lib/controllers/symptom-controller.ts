import type { NextRequest } from "next/server";
import {
  MAX_SYMPTOM_CHECKS,
  newSymptomCheckSchema,
  scoreSymptomCheck,
  type SupportJourneyDto,
  type SupportPath,
  type SymptomCheckDto,
  type SymptomCheckSavedResponse,
  type SymptomChecksResponse,
  type SymptomCheckType,
  type SymptomLevel,
} from "@/lib/symptom-checks";
import { createClient } from "@/lib/supabase/server";
import { fail, invalidInput, json, readJson, unauthorized } from "./shared";

/*
 * AROM symptom check controller (BACKEND-HANDOFF.md section 35). Runs as the
 * signed in person: RLS on symptom_checks and support_journeys returns only
 * their own rows. The server scores every check again, so the level and the
 * safety flag never come from the browser. The trigger
 * apply_support_path() then sets the 14 day support journey. Responses never
 * carry the answers. Never log an answer, a score or a level.
 */

async function signedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

interface CheckRow {
  id: string;
  check_type: SymptomCheckType;
  score: number;
  max_score: number;
  level: SymptomLevel;
  safety_concern: boolean;
  recommended_path: SupportPath | null;
  created_at: string;
}

interface JourneyRow {
  concern: SymptomCheckType;
  start_level: SymptomLevel;
  latest_level: SymptomLevel;
  path: SupportPath;
  review_due_on: string;
  professional_recommended_at: string | null;
}

const CHECK_COLUMNS = "id, check_type, score, max_score, level, safety_concern, recommended_path, created_at";
const JOURNEY_COLUMNS = "concern, start_level, latest_level, path, review_due_on, professional_recommended_at";
const TYPES: SymptomCheckType[] = ["depression", "anxiety"];

function toCheck(row: CheckRow): SymptomCheckDto {
  return {
    id: row.id,
    type: row.check_type,
    score: row.score,
    maxScore: row.max_score,
    level: row.level,
    safetyConcern: row.safety_concern,
    recommendedPath: row.recommended_path,
    createdAt: row.created_at,
  };
}

function toJourney(row: JourneyRow): SupportJourneyDto {
  return {
    concern: row.concern,
    startLevel: row.start_level,
    latestLevel: row.latest_level,
    path: row.path,
    reviewDueOn: row.review_due_on,
    professionalRecommended: row.professional_recommended_at !== null,
  };
}

/** GET /api/symptom-checks: the person's own checks, newest first, and active journeys. */
export async function listSymptomChecks() {
  const session = await signedIn();
  if (!session) return unauthorized();

  const [checks, journeys] = await Promise.all([
    session.supabase
      .from("symptom_checks")
      .select(CHECK_COLUMNS)
      .eq("user_id", session.userId)
      .in("check_type", TYPES)
      .order("created_at", { ascending: false })
      .limit(MAX_SYMPTOM_CHECKS)
      .returns<CheckRow[]>(),
    session.supabase
      .from("support_journeys")
      .select(JOURNEY_COLUMNS)
      .eq("user_id", session.userId)
      .eq("status", "active")
      .in("concern", TYPES)
      .returns<JourneyRow[]>(),
  ]);
  if (checks.error || journeys.error) return fail("server_error", "Your checks could not be loaded.", 500);

  return json<SymptomChecksResponse>({
    checks: (checks.data ?? []).map(toCheck),
    journeys: (journeys.data ?? []).map(toJourney),
  });
}

/** POST /api/symptom-checks `{ type, answers }`: scores and saves one check. */
export async function createSymptomCheck(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const body = newSymptomCheckSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const result = scoreSymptomCheck(body.data.type, body.data.answers);
  if (!result) return invalidInput();

  const inserted = await session.supabase
    .from("symptom_checks")
    .insert({
      user_id: session.userId,
      check_type: body.data.type,
      answers: result.answers,
      score: result.score,
      max_score: result.maxScore,
      level: result.level,
      safety_concern: result.safetyConcern,
    })
    .select("id")
    .single<{ id: string }>();
  if (inserted.error || !inserted.data) {
    return fail("server_error", "Your check could not be saved. Please try again.", 500);
  }

  // Read again: the trigger sets recommended_path and the journey after the insert.
  const [check, journey] = await Promise.all([
    session.supabase
      .from("symptom_checks")
      .select(CHECK_COLUMNS)
      .eq("id", inserted.data.id)
      .single<CheckRow>(),
    session.supabase
      .from("support_journeys")
      .select(JOURNEY_COLUMNS)
      .eq("user_id", session.userId)
      .eq("concern", body.data.type)
      .eq("status", "active")
      .maybeSingle<JourneyRow>(),
  ]);
  if (check.error || !check.data) return fail("server_error", "Your check was saved but could not be loaded.", 500);

  return json<SymptomCheckSavedResponse>(
    { check: toCheck(check.data), journey: journey.data ? toJourney(journey.data) : null },
    201,
  );
}
