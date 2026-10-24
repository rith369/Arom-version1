import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

/** Every rule a new password must meet. The signup form lists them all as a checklist. */
export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { id: 'lowercase', label: 'A lowercase letter (a to z)', test: (value: string) => /[a-z]/.test(value) },
  { id: 'uppercase', label: 'An uppercase letter (A to Z)', test: (value: string) => /[A-Z]/.test(value) },
  { id: 'number', label: 'A number (0 to 9)', test: (value: string) => /[0-9]/.test(value) },
  { id: 'special', label: 'A special character, such as ! @ # ?', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

// Supabase Auth hashes at most 72 characters; longer would be cut silently.
export const MAX_PASSWORD_LENGTH = 72;

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Enter your full name')
      .max(60, 'Name must be 60 characters or fewer'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: z
      .string()
      .max(MAX_PASSWORD_LENGTH, `Use ${MAX_PASSWORD_LENGTH} characters or fewer`)
      .superRefine((value, context) => {
        for (const rule of PASSWORD_RULES) {
          if (!rule.test(value)) context.addIssue({ code: 'custom', message: rule.label });
        }
      }),
    confirmPassword: z.string().min(1, 'Confirm your password'),

    terms: z.boolean().refine((value) => value, {
      message: 'Please accept the Terms and Privacy Policy',
    }),
    /** App language at signup. The database trigger saves it to the profile. */
    language: z.enum(['en', 'km']).optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const resendSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

export const profileUpdateSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Enter your full name')
      .max(60, 'Name must be 60 characters or fewer'),
    pronouns: z.string().trim().max(60, 'Pronouns must be 60 characters or fewer'),
    aboutMe: z.string().trim().max(280, 'About you must be 280 characters or fewer'),
    language: z.enum(['en', 'km']),
    hideIdentity: z.boolean(),
  })
  .partial();

/** The 6 digit code from the confirmation email, typed on the device that signed up. */
export const verifyCodeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6 digit code from the email'),
});

export type VerifyCodeValues = z.infer<typeof verifyCodeSchema>;

/**
 * Only same site paths, so a `next` link can never send someone off AROM.
 * Rejects "//host" and "/\host" (browsers read both as another site) and
 * control characters.
 */
export function safeNextPath(value: string | null | undefined, fallback = '/') {
  if (!value || !value.startsWith('/') || value.startsWith('//'))
    return fallback;
  if (/[\\\u0000-\u001f]/.test(value)) return fallback;
  return value;
}

/** sessionStorage key that carries the signup email to the confirm page. Never put it in the URL. */
export const PENDING_CONFIRMATION_KEY = 'arom:pending-confirmation';

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ResendValues = z.infer<typeof resendSchema>;
export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;

/** Mirrors the `user_role` enum in Supabase. */
export type UserRole = 'user' | 'professional' | 'admin';

/** Safe public shape of the signed in user. Never includes tokens. */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  pronouns?: string;
  aboutMe?: string;
  avatarUrl?: string | null;
  role: UserRole;
  language: 'en' | 'km';
  accountStatus: 'active' | 'suspended';
  /** ISO timestamp of when the profile was created. */

  hideIdentity?: boolean;
  /** Confirmed University of Puthisastra student or staff (lib/up-student.ts). */
  upStudent?: boolean;
  /** The UP address that proved it, shown only to its owner. */
  upEmail?: string | null;
  createdAt: string;
}

/** Stable error codes the auth endpoints return. Forms map them to copy. */
export type AuthErrorCode =
  | 'invalid_input'
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'rate_limited'
  | 'unauthorized'
  | 'forbidden'
  | 'server_error';

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
