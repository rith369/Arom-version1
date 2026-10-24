import type { NextRequest } from "next/server";
import { createSymptomCheck, listSymptomChecks } from "@/lib/controllers/symptom-controller";

export async function GET() {
  return listSymptomChecks();
}

export async function POST(request: NextRequest) {
  return createSymptomCheck(request);
}
