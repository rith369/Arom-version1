import type { DeskTherapist } from "@/lib/clinic-booking";

/** POST to a clinic desk endpoint. Returns the server's message on failure. */
export async function deskSend(url: string, body: Record<string, unknown>) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) return { ok: true as const };
    const data = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    return { ok: false as const, message: data?.error?.message ?? null };
  } catch {
    return { ok: false as const, message: null };
  }
}

export function genderText(gender: DeskTherapist["gender"] | "female" | "male", km: boolean) {
  if (gender === "female") return km ? "ស្រី" : "Female";
  if (gender === "male") return km ? "ប្រុស" : "Male";
  return "";
}
