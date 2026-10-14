import { getMoodWeek } from "@/lib/controllers/mood-controller";

export async function GET() {
  return getMoodWeek();
}
