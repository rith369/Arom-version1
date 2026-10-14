import { listMyAppointments } from "@/lib/controllers/appointments-controller";

export async function GET() {
  return listMyAppointments();
}
