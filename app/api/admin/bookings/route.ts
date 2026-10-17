import { listAdminBookings } from "@/lib/controllers/admin-controller";

export async function GET() {
  return listAdminBookings();
}
