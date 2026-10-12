"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { useLanguage } from "./language-provider";

// Fixed safety text on every MindGuide screen. It lives in code, not in
// editable content, so it can never be removed from the admin editor.
export function EducationalNote({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  const km = language === "km";

  return (
    <p
      className={`flex items-start gap-2 rounded-2xl border border-arom-border bg-white/70 px-4 py-3 text-xs leading-5 text-ink-muted ${
        km ? "font-khmer" : ""
      } ${className}`}
    >
      <Info size={15} className="mt-0.5 shrink-0 text-arom" aria-hidden="true" />
      <span>
        {km
          ? "សម្រាប់ការសិក្សាប៉ុណ្ណោះ។ នេះមិនមែនជាការធ្វើរោគវិនិច្ឆ័យ ឬការព្យាបាលទេ។ ប្រសិនបើអ្នកព្រួយបារម្ភអំពីសុខភាពផ្លូវចិត្តរបស់អ្នក "
          : "For learning only. This is not a diagnosis or treatment. If you are worried about your mental health, "}
        <Link href="/professional" className="font-semibold text-arom underline hover:text-arom-deep">
          {km ? "សូមពិភាក្សាជាមួយអ្នកជំនាញ" : "talk to a professional"}
        </Link>
        {km ? "។" : "."}
      </span>
    </p>
  );
}
