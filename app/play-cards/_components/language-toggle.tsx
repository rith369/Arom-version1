"use client";

import { useLanguage, type Language } from "../../_components/language-provider";

const OPTIONS: { id: Language; label: string; name: string }[] = [
  { id: "en", label: "EN", name: "English" },
  { id: "km", label: "ខ្មែរ", name: "ភាសាខ្មែរ (Khmer)" },
];

/**
 * English or Khmer, switchable in the middle of a game, because friends
 * around the table may read different languages. Uses the app's language.
 */
export function LanguageToggle({ onDark = false }: { onDark?: boolean }) {
  const { language, setLanguage } = useLanguage();
  return (
    <div
      role="group"
      aria-label="Language / ភាសា"
      className={`flex shrink-0 items-center rounded-full p-0.5 shadow-sm backdrop-blur ${onDark ? "bg-white/15" : "bg-white/85"}`}
    >
      {OPTIONS.map((option) => {
        const on = language === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setLanguage(option.id)}
            aria-pressed={on}
            aria-label={option.name}
            className={`h-9 min-w-10 rounded-full px-2.5 text-xs font-semibold transition-colors ${
              on
                ? onDark
                  ? "bg-white text-arom shadow-sm"
                  : "bg-arom text-white shadow-sm"
                : onDark
                  ? "text-white/85 hover:text-white"
                  : "text-ink-muted hover:text-arom"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
