import type { NextRequest } from "next/server";
import { getLessonProgress, saveLessonProgress } from "@/lib/controllers/saved-controller";

export async function GET() {
  return getLessonProgress();
}

export async function PUT(request: NextRequest) {
  return saveLessonProgress(request);
}
