import type { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { databaseError, invalidInput, json, readJson, unauthorized } from "./shared";

/*
 * AROM booking controller. A signed in user books one open time.
 * book_appointment() checks the time is still open, the professional is
 * listed, the session type and the minimum notice, all in one transaction.
 */

const bookSchema = z.object({
  slotId: z.string().uuid(),
  sessionType: z.enum(["online", "in_person"]),
  note: z.string().trim().max(500).default(""),
});

/** POST /api/bookings  body `{ slotId, sessionType, note? }` */
export async function bookAppointment(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const body = bookSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { data, error } = await supabase.rpc("book_appointment", {
    p_slot_id: body.data.slotId,
    p_session_type: body.data.sessionType,
    p_intake_note: body.data.note || null,
  });
  if (error) return databaseError(error, "We could not book this time. Please try again in a moment.", 409);

  return json({ appointmentId: data as string }, 201);
}
