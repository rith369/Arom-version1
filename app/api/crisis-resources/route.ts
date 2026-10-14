import { listActiveHelplines } from "@/lib/controllers/crisis-controller";

export async function GET() {
  return listActiveHelplines();
}
