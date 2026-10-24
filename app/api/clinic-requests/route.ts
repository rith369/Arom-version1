import { listMyClinicRequests } from "@/lib/controllers/clinic-controller";

export async function GET() {
  return listMyClinicRequests();
}
