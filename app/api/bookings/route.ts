import type { NextRequest } from "next/server";
import { bookAppointment } from "@/lib/controllers/booking-controller";

export async function POST(request: NextRequest) {
  return bookAppointment(request);
}
