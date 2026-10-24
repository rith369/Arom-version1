import { listClinicPages } from "@/lib/controllers/clinic-controller";

export async function GET() {
  return listClinicPages();
}
