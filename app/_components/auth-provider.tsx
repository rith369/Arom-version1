"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthErrorBody,
  AuthUser,
  ProfileResponse,
  ProfileUpdateValues,
  SessionResponse,
} from "@/lib/auth";
import { useLanguage } from "./language-provider";

type AuthStatus = "loading" | "authenticated" | "guest";

type UpdateResult = { ok: true } | { ok: false; message: string };

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  /** Re-reads the session from `/api/auth/me`. Call after login or signup. */
  refresh: () => Promise<void>;
  updateProfile: (changes: ProfileUpdateValues) => Promise<UpdateResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    if (!response.ok) return null;
    const body = (await response.json()) as SessionResponse;
    return body.user;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // The saved profile language wins whenever the session loads.
  const applyUser = useCallback(
    (nextUser: AuthUser | null) => {
      setUser(nextUser);
      setStatus(nextUser ? "authenticated" : "guest");
      if (nextUser) setLanguage(nextUser.locale);
    },
    [setLanguage],
  );

  const refresh = useCallback(async () => {
    applyUser(await fetchCurrentUser());
  }, [applyUser]);

  useEffect(() => {
    let active = true;
    fetchCurrentUser().then((nextUser) => {
      if (active) applyUser(nextUser);
    });
    return () => {
      active = false;
    };
  }, [applyUser]);

  const updateProfile = useCallback(
    async (changes: ProfileUpdateValues): Promise<UpdateResult> => {
      try {
        const response = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changes),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as AuthErrorBody | null;
          if (response.status === 401) {
            setUser(null);
            setStatus("guest");
          }
          return {
            ok: false,
            message: body?.error.message ?? "We could not save your changes. Please try again.",
          };
        }

        const body = (await response.json()) as ProfileResponse;
        setUser(body.user);
        return { ok: true };
      } catch {
        return { ok: false, message: "You seem to be offline. Check your connection and try again." };
      }
    },
    [],
  );

  // Switching language while signed in saves it to the profile (an external system).
  useEffect(() => {
    if (!user || language === user.locale) return;
    let active = true;

    fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: language }),
    })
      .then((response) => (response.ok ? (response.json() as Promise<ProfileResponse>) : null))
      .then((body) => {
        if (active && body) setUser(body.user);
      })
      .catch(() => {
        // Offline: the choice stays in this browser and saves next time.
      });

    return () => {
      active = false;
    };
  }, [language, user]);

  return (
    <AuthContext.Provider value={{ user, status, refresh, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

/** First name for greetings, or null for guests. */
export function useFirstName() {
  const { user } = useAuth();
  const first = user?.fullName.trim().split(/\s+/)[0];
  return first || null;
}
