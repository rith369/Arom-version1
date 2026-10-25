import { json } from "@/lib/controllers/shared";
import { listPublicTherapists } from "@/lib/professionals";
import type { ProfessionalCard } from "@/lib/therapists";

// GET /api/professionals: the public directory (the same list /professional
// shows, UP only professionals included for UP students and staff), slimmed
// for the journal's suggestions card (BACKEND-HANDOFF.md section 22).
export async function GET() {
  const therapists = await listPublicTherapists();
  return json<{ professionals: ProfessionalCard[] }>({
    professionals: therapists.map((therapist) => ({
      slug: therapist.slug,
      name: therapist.name,
      kmName: therapist.kmName,
      role: therapist.role,
      kmRole: therapist.kmRole,
      image: therapist.image,
      imagePosition: therapist.imagePosition,
      specialties: therapist.specialties,
      price: therapist.price,
      upStudentsOnly: therapist.upStudentsOnly,
    })),
  });
}
