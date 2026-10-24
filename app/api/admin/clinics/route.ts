import { listAdminClinics } from "@/lib/controllers/clinic-controller";

export async function GET() {
  return listAdminClinics();
}
