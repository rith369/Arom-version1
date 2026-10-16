/*
 * Where a professional sees clients in person (BACKEND-HANDOFF.md section 24).
 * The professional types it in My profile; everyone can see it on the public
 * profile. An address is required to offer in person sessions.
 */

export interface OfficeLocation {
  /** e.g. "Calm Mind Clinic". Optional. */
  name: string;
  /** e.g. "St. 271, Toul Kork, Phnom Penh". Required for in person sessions. */
  address: string;
  /** A Google Maps (or other) https link. Optional; a search link is used without it. */
  mapUrl: string;
}

export const MAX_OFFICE_NAME = 120;
export const MAX_OFFICE_ADDRESS = 300;
export const MAX_OFFICE_MAP_URL = 500;

export const hasOffice = (office: OfficeLocation | null | undefined): office is OfficeLocation =>
  Boolean(office && office.address.trim());

export function isMapUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && url.hostname.includes(".");
  } catch {
    return false;
  }
}

/** The professional's own map link, or a Google Maps search for the place. */
export function mapsLink(office: OfficeLocation) {
  if (office.mapUrl && isMapUrl(office.mapUrl)) return office.mapUrl;
  const query = [office.name, office.address].map((part) => part.trim()).filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** One line for calendars and summaries: "Calm Mind Clinic, St. 271, Toul Kork". */
export const officeLine = (office: OfficeLocation) =>
  [office.name, office.address].map((part) => part.trim()).filter(Boolean).join(", ");
