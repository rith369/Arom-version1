import { z } from "zod";
import {
  LANGUAGE_OPTIONS,
  MAX_DOCUMENT_BYTES,
  MAX_OTHER_SPECIALTIES,
  SPECIALTY_OPTIONS,
  type ProfessionalApplication,
} from "@/app/profile/become-professional/_data/application";

/*
 * Server rules for "Become a professional". They repeat the browser form
 * (`createApplicationSchema`) so a request sent without the form is held to
 * the same limits. See BACKEND-HANDOFF.md section 8.
 */

export const CAMBODIA_PHONE = /^(?:\+?855|0)[1-9]\d{7,8}$/;
export const TELEGRAM_USERNAME = /^@?[A-Za-z0-9_]{5,32}$/;

const LISTED_SPECIALTIES: readonly string[] = SPECIALTY_OPTIONS.map((option) => option.value);
const LANGUAGES: readonly string[] = LANGUAGE_OPTIONS.map((option) => option.value);

/** Reads a JSON encoded string array sent as one multipart field. */
const stringList = z.string().transform((value, context) => {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return [...new Set(parsed.map((item) => item.trim()).filter(Boolean))];
    }
  } catch {
    // reported below
  }
  context.addIssue({ code: "custom", message: "Expected a list" });
  return z.NEVER;
});

export const applicationFieldsSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    title: z.string().trim().min(2).max(120),
    licenseNumber: z.string().trim().min(3).max(60),
    issuingBody: z.string().trim().min(2).max(120),
    specialties: stringList,
    languages: stringList,
    yearsExperience: z.coerce.number().int().min(0).max(60),
    phone: z
      .string()
      .transform((value) => value.replace(/[\s.()]/g, ""))
      .refine((value) => CAMBODIA_PHONE.test(value)),
    telegram: z.string().trim().max(33).default(""),
    motivation: z.string().trim().max(2000).default(""),
  })
  .superRefine((values, context) => {
    const others = values.specialties.filter((item) => !LISTED_SPECIALTIES.includes(item));
    if (
      values.specialties.length === 0 ||
      others.length > MAX_OTHER_SPECIALTIES ||
      others.some((item) => item.length > 40)
    ) {
      context.addIssue({ code: "custom", path: ["specialties"], message: "Invalid specialties" });
    }
    if (values.languages.length === 0 || values.languages.some((item) => !LANGUAGES.includes(item))) {
      context.addIssue({ code: "custom", path: ["languages"], message: "Invalid languages" });
    }
    if (
      values.telegram &&
      values.telegram !== values.phone &&
      !TELEGRAM_USERNAME.test(values.telegram)
    ) {
      context.addIssue({ code: "custom", path: ["telegram"], message: "Invalid Telegram" });
    }
  });

export type ApplicationFields = z.output<typeof applicationFieldsSchema>;

/** License file types, keyed by MIME type, with the first bytes each file must start with. */
export const LICENSE_FILE_TYPES: Record<string, { extension: string; signature: number[] }> = {
  "application/pdf": { extension: "pdf", signature: [0x25, 0x50, 0x44, 0x46] },
  "image/jpeg": { extension: "jpg", signature: [0xff, 0xd8, 0xff] },
  "image/png": { extension: "png", signature: [0x89, 0x50, 0x4e, 0x47] },
};

export { MAX_DOCUMENT_BYTES };

/** The caller's own application, as the "Become a professional" page shows it. */
export type OwnApplication = ProfessionalApplication;

export interface OwnApplicationResponse {
  application: OwnApplication | null;
}
