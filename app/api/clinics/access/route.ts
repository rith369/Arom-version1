import { listClinicAccess } from "@/lib/controllers/clinic-controller";

export async function GET() {
  return listClinicAccess();
}
