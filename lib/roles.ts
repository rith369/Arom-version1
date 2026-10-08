import { z } from "zod";
import type { UserRole } from "./auth";

/*
 * Role rules shared by the role controller and the admin screens.
 *   user          signs up here automatically.
 *   professional  only through an admin (application review or set role).
 *   admin         only by hand in the Supabase SQL editor. No API grants it.
 */

/** Roles an admin may set through the API. `admin` is never allowed. */
export const assignableRoleSchema = z.object({
  role: z.enum(["user", "professional"]),
});

export const reviewApplicationSchema = z.object({
  approve: z.boolean(),
  note: z.string().trim().max(1000).optional(),
});

export const userListQuerySchema = z.object({
  role: z.enum(["user", "professional", "admin"]).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});

export const applicationListQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

export const uuidSchema = z.string().uuid();

export type AssignableRole = z.infer<typeof assignableRoleSchema>["role"];
export type ReviewApplicationValues = z.infer<typeof reviewApplicationSchema>;

/** Admin view of an account. Email is not included: it stays in auth.users. */
export interface AdminUserSummary {
  id: string;
  fullName: string | null;
  role: UserRole;
  accountStatus: "active" | "suspended";
  createdAt: string;
}

export interface AdminUserList {
  users: AdminUserSummary[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ApplicationSummary {
  id: string;
  userId: string;
  fullName: string;
  title: string;
  licenseNumber: string;
  issuingBody: string | null;
  specialties: string[];
  languages: string[];
  yearsExperience: number | null;
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
