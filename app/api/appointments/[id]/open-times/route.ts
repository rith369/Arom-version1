import { listMoveTimes } from "@/lib/controllers/appointments-controller";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return listMoveTimes(id);
}
