import { cancelMyClinicRequest } from "@/lib/controllers/clinic-controller";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return cancelMyClinicRequest(id);
}
