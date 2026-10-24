import { GraduationCap } from "lucide-react";

// Marks a professional or clinic that only University of Puthisastra students
// see. Only UP students ever get these listings, so only they see the badge.
export function UpStudentBadge({ km, tone = "light" }: { km: boolean; tone?: "light" | "dark" }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold leading-none sm:text-xs ${
        tone === "dark" ? "bg-white/15 text-white" : "bg-arom-soft text-arom-deep"
      }`}
    >
      <GraduationCap aria-hidden="true" size={13} />
      {km ? "សម្រាប់និស្សិត UP (For UP students)" : "For UP students"}
    </span>
  );
}
