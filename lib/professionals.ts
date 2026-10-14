import type { SessionPrice } from "./pricing";
import { createClient } from "./supabase/server";
import type { SessionOption, Therapist } from "./therapists";

/*
 * Public professional directory, read on the server (BACKEND-HANDOFF.md
 * section 16). Only "listed" professionals come back: verified, active,
 * profile complete and at least one open time. The database functions
 * return public fields only, never credentials, contacts or meeting links.
 */

const TIME_ZONE = "Asia/Phnom_Penh";

interface PublicRow {
  slug: string;
  display_name: string;
  display_name_km: string | null;
  title: string;
  title_km: string | null;
  bio: string | null;
  bio_km: string | null;
  photo_url: string | null;
  specialties: string[] | null;
  languages: string[] | null;
  years_experience: number | null;
  session_types: string[] | null;
  price_kind: "free" | "fixed" | "range" | null;
  price_usd: number | string | null;
  price_max_usd: number | string | null;
  next_open_at: string | null;
}

export interface OpenTime {
  id: string;
  startsAt: string;
  endsAt: string;
  sessionTypes: ("online" | "in_person")[];
}

export function toPrice(
  kind: PublicRow["price_kind"],
  amount: PublicRow["price_usd"],
  max: PublicRow["price_max_usd"],
): SessionPrice | undefined {
  if (kind === "free") return { kind: "free" };
  if (kind === "fixed" && amount !== null) return { kind: "fixed", amount: Number(amount) };
  if (kind === "range" && amount !== null && max !== null) {
    return { kind: "range", min: Number(amount), max: Number(max) };
  }
  return undefined;
}

const cambodiaDay = (value: number) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(value);

/** "Available Today", "Available Tomorrow" or "Open times this month", from the next open time. */
function availabilityLabel(nextOpenAt: string | null, now: number) {
  if (!nextOpenAt) return "No open times";
  const day = cambodiaDay(Date.parse(nextOpenAt));
  if (day === cambodiaDay(now)) return "Available Today";
  if (day === cambodiaDay(now + 86_400_000)) return "Available Tomorrow";
  return "Open times available";
}

function toTherapist(row: PublicRow, now: number): Therapist {
  const online = row.session_types?.includes("online") ?? false;
  const inPerson = row.session_types?.includes("in_person") ?? false;
  const sessionOptions: SessionOption[] =
    online && inPerson ? ["Online", "In-person", "Both"] : online ? ["Online"] : ["In-person"];
  const years = row.years_experience;

  return {
    slug: row.slug,
    name: row.display_name,
    kmName: row.display_name_km ?? undefined,
    role: row.title,
    kmRole: row.title_km ?? undefined,
    specialties: row.specialties ?? [],
    availability: availabilityLabel(row.next_open_at, now),
    image: row.photo_url ?? "",
    experience: years === null ? "" : `${years}+ years of experience`,
    kmExperience: years === null ? undefined : `បទពិសោធន៍ ${years}+ ឆ្នាំ`,
    rating: 0,
    reviews: 0,
    about: row.bio ?? "",
    kmAbout: row.bio_km ?? undefined,
    languages: row.languages ?? [],
    sessionOptions,
    price: toPrice(row.price_kind, row.price_usd, row.price_max_usd),
  };
}

/** Every listed professional, for the directory. Empty on any error. */
export async function listPublicTherapists(): Promise<Therapist[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_public_professionals");
  if (error || !data) return [];
  const now = Date.now();
  return (data as PublicRow[]).map((row) => toTherapist(row, now));
}

/** One listed professional by slug, or null. */
export async function getPublicTherapist(slug: string): Promise<Therapist | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_public_professionals", { p_slug: slug });
  if (error || !data || data.length === 0) return null;
  return toTherapist((data as PublicRow[])[0], Date.now());
}

/** Times a user can book with this professional, soonest first. */
export async function getOpenTimes(slug: string): Promise<OpenTime[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("public_open_slots", { p_slug: slug });
  if (error || !data) return [];
  return (
    data as { id: string; starts_at: string; ends_at: string; session_types: OpenTime["sessionTypes"] }[]
  ).map((row) => ({
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    sessionTypes: row.session_types,
  }));
}
