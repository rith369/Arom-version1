import { z } from "zod";
import type { UserRole } from "./auth";

/*
 * Role rules shared by the role controller and the admin screens.
 *   user          signs up here automatically.
 *   professional  only through an admin: application review, or a direct
 *                 promotion with license details.
 *   admin         an admin makes another admin. Nobody changes their own
 *                 role and the last active admin cannot be removed
 *                 (checked in set_user_role()).
 */

/** Role change sent by the admin Users page. A direct promotion needs license details. */
export const assignableRoleSchema = z
  .object({
    role: z.enum(["user", "professional", "admin"]),
    promotion: z
      .object({
        title: z.string().trim().min(2).max(120),
        licenseNumber: z.string().trim().min(3).max(60),
        issuingBody: z.string().trim().min(2).max(120),
        note: z.string().trim().max(500).default(""),
      })
      .optional(),
  });

export const reviewApplicationSchema = z.object({
  approve: z.boolean(),
  note: z.string().trim().max(1000).optional(),
});

export const applicationListQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

export const uuidSchema = z.string().uuid();

export type AssignableRole = z.infer<typeof assignableRoleSchema>["role"];
export type ReviewApplicationValues = z.infer<typeof reviewApplicationSchema>;

export interface ApplicationSummary {
  id: string;
  userId: string;
  fullName: string;
  title: string;
  licenseNumber: string;
  issuingBody: string | null;
  /** Original file name only. The file itself is opened through a signed URL. */
  documentName: string | null;
  specialties: string[];
  languages: string[];
  yearsExperience: number | null;
  /** Private contact details. Admins only, never in public queries. */
  phone: string | null;
  telegram: string | null;
  motivation: string | null;
  status: "pending" | "approved" | "rejected";
  reviewNote: string | null;
  createdAt: string;
}

/** Pages each role may open. Checked in `proxy.ts` from the JWT `user_role` claim. */
export const ROLE_ROUTES: { prefix: string; roles: readonly UserRole[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/pro", roles: ["professional", "admin"] },
];
