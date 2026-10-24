"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Languages, UserRound, X } from "lucide-react";
import type { ClinicTherapist } from "@/lib/clinic-booking";
import { getSpecialtyLabel } from "@/lib/therapists";
import { SheetDialog } from "../sheet-dialog";

type GenderFilter = "all" | "female" | "male";

function genderLabel(gender: ClinicTherapist["gender"], km: boolean) {
  if (gender === "female") return km ? "ស្រី (Female)" : "Female";
  if (gender === "male") return km ? "ប្រុស (Male)" : "Male";
  return "";
}

/**
 * The clinic's therapists (section 34). Only to explore who works there:
 * students book the clinic, and the clinic chooses the therapist.
 */
export function ClinicTherapists({ therapists, km }: { therapists: ClinicTherapist[]; km: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [filter, setFilter] = useState<GenderFilter>("all");
  const [open, setOpen] = useState<ClinicTherapist | null>(null);

  const hasFemale = therapists.some((item) => item.gender === "female");
  const hasMale = therapists.some((item) => item.gender === "male");
  const shown = filter === "all" ? therapists : therapists.filter((item) => item.gender === filter);

  const filters: { value: GenderFilter; label: string }[] = [
    { value: "all", label: t("ទាំងអស់ (All)", "All") },
    ...(hasFemale ? [{ value: "female" as const, label: t("ស្រី (Female)", "Female") }] : []),
    ...(hasMale ? [{ value: "male" as const, label: t("ប្រុស (Male)", "Male") }] : []),
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs leading-5 text-ink-muted">
        {t(
          "ស្គាល់អ្នកព្យាបាលរបស់គ្លីនិក។ ពេលកក់ អ្នកអាចប្រាប់ថាចង់បានអ្នកព្យាបាលស្រី ឬប្រុស ហើយគ្លីនិកនឹងជ្រើសរើសអ្នកព្យាបាលឱ្យអ្នក។",
          "Meet the clinic's therapists. When you book, you can say if you prefer a female or male therapist, and the clinic chooses your therapist.",
        )}
      </p>

      {filters.length > 1 && (
        <div role="group" aria-label={t("តម្រងតាមភេទ", "Filter by gender")} className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === item.value ? "bg-[#185a4d] text-white" : "bg-[#dcefe9] text-[#185a4d] hover:bg-[#cde7df]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {shown.map((item) => (
          <li key={item.slug}>
            <button
              type="button"
              onClick={() => setOpen(item)}
              className="flex h-full w-full flex-col items-center rounded-2xl border border-arom-border/70 bg-white p-3 text-center transition-colors hover:border-arom/40 focus-visible:outline-2 focus-visible:outline-arom"
            >
              <span className="relative size-16 overflow-hidden rounded-full bg-arom-soft">
                {item.photoUrl ? (
                  <Image src={item.photoUrl} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <UserRound aria-hidden="true" size={28} className="absolute inset-0 m-auto text-arom" />
                )}
              </span>
              <span className="mt-2 line-clamp-2 text-sm font-bold text-ink">{(km && item.kmName) || item.name}</span>
              <span className="mt-0.5 line-clamp-2 text-xs text-ink-muted">{(km && item.kmTitle) || item.title}</span>
              {genderLabel(item.gender, km) && (
                <span className="mt-1.5 rounded-full bg-arom-wash px-2 py-0.5 text-[11px] font-medium text-arom-deep">
                  {genderLabel(item.gender, km)}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {open && <TherapistSheet therapist={open} km={km} onClose={() => setOpen(null)} />}
    </div>
  );
}

function TherapistSheet({ therapist, km, onClose }: { therapist: ClinicTherapist; km: boolean; onClose: () => void }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setClosing(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const about = (km && therapist.kmAbout) || therapist.about;
  const years = therapist.yearsExperience;

  return (
    <SheetDialog
      closing={closing}
      onClosed={onClose}
      labelledBy="clinic-therapist-title"
      panelClassName="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px]"
    >
      <div className="flex justify-end">
        <button
          type="button"
          autoFocus
          onClick={() => setClosing(true)}
          aria-label={t("បិទ", "Close")}
          className="-mr-2 -mt-2 rounded-full p-2 text-ink-muted hover:bg-arom-wash"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="relative size-24 overflow-hidden rounded-full bg-arom-soft">
          {therapist.photoUrl ? (
            <Image src={therapist.photoUrl} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <UserRound aria-hidden="true" size={40} className="absolute inset-0 m-auto text-arom" />
          )}
        </span>
        <h2 id="clinic-therapist-title" className="mt-3 text-xl font-bold text-ink">
          {(km && therapist.kmName) || therapist.name}
        </h2>
        <p className="text-sm text-ink-muted">{(km && therapist.kmTitle) || therapist.title}</p>
        <p className="mt-1 text-xs text-ink-muted">
          {[genderLabel(therapist.gender, km), years ? t(`បទពិសោធន៍ ${years}+ ឆ្នាំ`, `${years}+ years of experience`) : ""]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      {about && <p className="mt-5 whitespace-pre-line text-sm leading-6 text-ink">{about}</p>}

      {therapist.specialties.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {therapist.specialties.map((specialty) => (
            <span key={specialty} className="rounded-full bg-arom-soft px-2.5 py-1 text-xs font-medium text-arom-deep">
              {getSpecialtyLabel(specialty, km)}
            </span>
          ))}
        </div>
      )}

      {therapist.languages.length > 0 && (
        <p className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
          <Languages aria-hidden="true" size={16} className="shrink-0 text-arom" />
          {therapist.languages.join(", ")}
        </p>
      )}

      <p className="mt-5 rounded-2xl bg-arom-wash px-4 py-3 text-xs leading-5 text-ink-muted">
        {t(
          "ដើម្បីកក់ សូមចុច \"កក់វគ្គ\" នៅទំព័រគ្លីនិក។ គ្លីនិកជ្រើសរើសអ្នកព្យាបាលសម្រាប់វគ្គនីមួយៗ។",
          "To book, tap \"Book a session\" on the clinic page. The clinic chooses the therapist for each session.",
        )}
      </p>
    </SheetDialog>
  );
}
