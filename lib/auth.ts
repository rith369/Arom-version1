import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(60, "Name must be 60 characters or fewer"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number")
      .regex(/[^A-Za-z0-9]/, "Include a special character"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    terms: z.boolean().refine((value) => value, {
      message: "Please accept the Terms and Privacy Policy",
    }),
    /** App language at signup. The database trigger saves it to the profile. */
    language: z.enum(["en", "km"]).optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const resendSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export const profileUpdateSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(60, "Name must be 60 characters or fewer"),
    language: z.enum(["en", "km"]),
  })
  .partial()
  .refine((values) => Object.keys(values).length > 0, {
    message: "Nothing to update",
  });

/** sessionStorage key that carries the signup email to the confirm page. Never put it in the URL. */
export const PENDING_CONFIRMATION_KEY = "arom:pending-confirmation";

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ResendValues = z.infer<typeof resendSchema>;
export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;

/** Mirrors the `user_role` enum in Supabase. */
export type UserRole = "user" | "professional" | "admin";

/** Safe public shape of the signed in user. Never includes tokens. */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  language: "en" | "km";
  accountStatus: "active" | "suspended";
  /** ISO timestamp of when the profile was created. */
  createdAt: string;
}

/** Stable error codes the auth endpoints return. Forms map them to copy. */
export type AuthErrorCode =
  | "invalid_input"
  | "invalid_credentials"
  | "email_not_confirmed"
  | "rate_limited"
  | "unauthorized"
  | "forbidden"
  | "server_error";

export interface AuthErrorBody {
  error: { code: AuthErrorCode; message: string };
}

/** Session check. `user` is null for guests, so it is not an error. */
export interface SessionResponse {
  user: AuthUser | null;
}

export interface ProfileResponse {
  user: AuthUser;
}

export interface LoginResponse {
  user: AuthUser;
}

export interface RegisterResponse {
  needsConfirmation: boolean;
  user: AuthUser | null;
}
