import { getClinicBooking } from "@/lib/controllers/clinic-controller";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return getClinicBooking(slug);
}
