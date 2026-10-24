import { listMyDesks } from "@/lib/controllers/clinic-controller";

export async function GET() {
  return listMyDesks();
}
