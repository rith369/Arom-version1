import { listMyClinicChats } from "@/lib/controllers/clinic-chat-controller";

export async function GET() {
  return listMyClinicChats();
}
