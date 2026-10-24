"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, GraduationCap, MapPin, Stethoscope } from "lucide-react";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { useAuth } from "../auth-provider";
import { useLanguage } from "../language-provider";
import { createClient } from "@/lib/supabase/client";
import { UP_DOMAIN } from "@/lib/up-student";

/*
 * University of Puthisastra students and staff verify here
 * (BACKEND-HANDOFF.md section 33). People who log in with their UP Google
 * account are verified already. Everyone else links their UP Google account to this AROM account:
 * Google proves they own the address, and their login stays the same.
 * Google sends them back through /auth/confirm?link=up.
 */

export function UpStudentView() {
  const { language } = useLanguage();
  const { user, status } = useAuth();
  const searchParams = useSearchParams();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  const returned = searchParams.get("linked") === "1";
  const linkError = searchParams.get("error");

  async function verify() {
    if (starting) return;
    setStarting(true);
    setStartError("");
    const back = new URL("/auth/confirm", window.location.origin);
    back.searchParams.set("link", "up");
    const { error } = await createClient().auth.linkIdentity({
      provider: "google",
      options: {
        redirectTo: back.toString(),
        // Ask Google to offer UP accounts and always let them pick one.
        queryParams: { hd: UP_DOMAIN, prompt: "select_account" },
      },
    });
    if (error) {
      setStarting(false);
      setStartError(
        t(
          "ការផ្ទៀងផ្ទាត់មិនទាន់អាចប្រើបាននៅពេលនេះទេ។ សូមព្យាយាមម្តងទៀតពេលក្រោយ។",
          "Verifying is not available right now. Please try again later.",
        ),
      );
    }
  }

  const problem =
    linkError === "taken"
      ? t(
          "គណនី Google UP នេះមានគណនី AROM ផ្ទាល់ខ្លួនរួចហើយ។ សូមចាកចេញ ហើយចូលដោយ Google ជាមួយគណនី UP របស់អ្នក។",
          "This UP Google account already has its own AROM account. Log out, then log in with Google using your UP account.",
        )
      : linkError
        ? t("ការផ្ទៀងផ្ទាត់មិនបានបញ្ចប់ទេ។ សូមព្យាយាមម្តងទៀត។", "Verifying did not finish. Please try again.")
        : returned && user && !user.upStudent
          ? t(
              "គណនី Google ដែលអ្នកបានជ្រើសរើស មិនមែនជាអាសយដ្ឋាន UP ទេ។ សូមព្យាយាមម្តងទៀត ហើយជ្រើសរើសគណនីដែលបញ្ចប់ដោយ @puthisastra.edu.kh។",
              "The Google account you picked is not a UP address. Try again and pick the account that ends in @puthisastra.edu.kh.",
            )
          : startError;

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Profile" />

      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8 xl:px-14">
        <div className="mx-auto w-full max-w-[40rem]">
          <Link
            href="/profile"
            aria-label={t("ត្រឡប់ទៅការកំណត់", "Back to settings")}
            className="-ml-2 flex size-11 items-center justify-center rounded-full text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
          >
            <ChevronLeft size={26} aria-hidden="true" />
          </Link>

          <header className="mt-1">
            <h1 className="text-[28px] font-semibold leading-tight text-arom sm:text-4xl">
              {t("និស្សិត ឬបុគ្គលិក UP (UP Student or Staff)", "UP Student or Staff")}
            </h1>
            <p className="mt-2 text-[15px] font-light leading-snug text-ink">
              {t(
                "និស្សិត និងបុគ្គលិកសាកលវិទ្យាល័យពុទ្ធិសាស្ត្រ អាចជួបអ្នកជំនាញ UP និងគ្លីនិក UP ដោយឥតគិតថ្លៃ។",
                "University of Puthisastra students and staff can see UP professionals and the UP clinic for free.",
              )}
            </p>
          </header>

          {status === "loading" ? (
            <p className="mt-8 text-sm text-ink-muted">{t("កំពុងផ្ទុក…", "Loading…")}</p>
          ) : !user ? (
            <section className="mt-6 rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
              <p className="text-sm text-ink">
                {t("សូមចូលគណនីជាមុនសិន ដើម្បីផ្ទៀងផ្ទាត់។", "Please log in first to verify.")}
              </p>
              <Link
                href="/login?next=/profile/up-student"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-arom px-5 text-sm font-semibold text-white hover:bg-arom-deep"
              >
                {t("ចូលគណនី (Log in)", "Log in")}
              </Link>
            </section>
          ) : user.upStudent ? (
            <>
              <section className="mt-6 rounded-3xl border border-arom/30 bg-arom-soft p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={24} aria-hidden="true" className="mt-0.5 shrink-0 text-arom" />
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-ink">
                      {t("បានផ្ទៀងផ្ទាត់គណនី UP", "Verified UP account")}
                    </h2>
                    {user.upEmail && (
                      <p className="mt-1 break-all text-sm text-ink-muted">
                        {t("ផ្ទៀងផ្ទាត់ជាមួយ", "Verified with")} {user.upEmail}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <nav className="mt-4 divide-y divide-arom-border rounded-3xl border border-arom-border bg-white px-5 shadow-card sm:px-6">
                <Link
                  href="/professional"
                  className="group flex items-center justify-between gap-3 py-4 text-ink hover:text-arom"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-arom-soft text-arom">
                      <Stethoscope size={18} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold">
                      {t("ស្វែងរកអ្នកជំនាញ UP (Find UP professionals)", "Find UP professionals")}
                    </span>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" className="text-ink-muted group-hover:text-arom" />
                </Link>
                <Link
                  href="/clinic-hospital"
                  className="group flex items-center justify-between gap-3 py-4 text-ink hover:text-arom"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-arom-soft text-arom">
                      <MapPin size={18} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold">
                      {t("គ្លីនិក UP (UP clinic)", "UP clinic")}
                    </span>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" className="text-ink-muted group-hover:text-arom" />
                </Link>
              </nav>
            </>
          ) : (
            <section className="mt-6 rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-arom-soft text-arom">
                  <GraduationCap size={21} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-ink">
                    {t("ផ្ទៀងផ្ទាត់អ៊ីមែល UP របស់អ្នក", "Verify your UP email")}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">
                    {t(
                      "ជ្រើសរើសគណនី Google UP របស់អ្នក ដែលបញ្ចប់ដោយ @puthisastra.edu.kh។",
                      "Pick your UP Google account, the one that ends in @puthisastra.edu.kh.",
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={verify}
                disabled={starting}
                aria-busy={starting}
                className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-arom px-5 text-sm font-bold text-white transition-colors duration-150 hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom disabled:opacity-65"
              >
                {starting
                  ? t("កំពុងបើក Google…", "Opening Google…")
                  : t("ផ្ទៀងផ្ទាត់ដោយគណនី Google UP", "Verify with my UP Google account")}
              </button>

              {problem && (
                <p role="alert" className="mt-3 text-sm text-arom-danger">
                  {problem}
                </p>
              )}

              <p className="mt-4 text-xs leading-5 text-ink-muted">
                {t(
                  "យើងពិនិត្យតែថាអាសយដ្ឋាននេះជាអាសយដ្ឋាន UP ប៉ុណ្ណោះ។ របៀបចូលគណនីរបស់អ្នកនៅដដែល។",
                  "We only check that the address is a UP address. The way you log in stays the same.",
                )}
              </p>
            </section>
          )}
        </div>
      </main>

      <MobileNavigation active="Profile" />
    </div>
  );
}
