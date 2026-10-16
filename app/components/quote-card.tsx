"use client";

import { useSyncExternalStore } from "react";
import { FigmaIcon } from "./figma-icon";
import { useLanguage } from "../_components/language-provider";

// A different gentle line each day (Cambodia date), the same for everyone.
const QUOTES: { en: string; km: string }[] = [
  {
    en: "Progress is still progress, no matter how small.",
    km: "ការបោះជំហានទៅមុខ ទោះជាតិចតួចក្តី ក៏នៅតែជាការរីកចម្រើនដ៏មានតម្លៃ។",
  },
  {
    en: "You don't have to feel better all at once. One gentle step is enough.",
    km: "អ្នកមិនចាំបាច់ធូរស្រាលភ្លាមៗទេ។ ជំហានតូចមួយគឺគ្រប់គ្រាន់ហើយ។",
  },
  {
    en: "Rest is not a reward. It is something you need.",
    km: "ការសម្រាកមិនមែនជារង្វាន់ទេ វាជាអ្វីដែលអ្នកត្រូវការ។",
  },
  {
    en: "Your feelings are real, and they will not last forever.",
    km: "អារម្មណ៍របស់អ្នកគឺពិត ហើយវានឹងមិននៅជាប់រហូតទេ។",
  },
  {
    en: "Be as kind to yourself as you are to a good friend.",
    km: "ចូរល្អចំពោះខ្លួនឯង ដូចដែលអ្នកល្អចំពោះមិត្តភក្តិ។",
  },
  {
    en: "Asking for help is a sign of strength.",
    km: "ការសុំជំនួយ គឺជាសញ្ញានៃភាពខ្លាំង។",
  },
  {
    en: "Breathe in slowly. This moment is enough.",
    km: "ដកដង្ហើមចូលយឺតៗ។ ពេលនេះគឺគ្រប់គ្រាន់ហើយ។",
  },
  {
    en: "Small habits, repeated with care, change how a day feels.",
    km: "ទម្លាប់តូចៗ ដែលធ្វើដោយយកចិត្តទុកដាក់ អាចផ្លាស់ប្តូរអារម្មណ៍នៃថ្ងៃមួយ។",
  },
];

// Days since 1970 in Cambodia time (UTC+7). The server has no visitor clock,
// so it renders the first quote and the browser switches to today's.
const dayNumber = () => Math.floor((Date.now() + 7 * 3_600_000) / 86_400_000);
const subscribe = () => () => {};

export function QuoteCard() {
  const { language } = useLanguage();
  const km = language === "km";
  const day = useSyncExternalStore(subscribe, dayNumber, () => 0);
  const quote = QUOTES[day % QUOTES.length];

  return (
    <aside
      aria-label={km ? "សម្រង់សម្ដីប្រចាំថ្ងៃ" : "Quote of the day"}
      className="flex items-center gap-3 rounded-[14px] bg-[#e0f3ed] px-4 py-3.5 text-[#1f6f5b] shadow-sm"
    >
      <div className="flex size-7 items-center justify-center shrink-0">
        <FigmaIcon name="boxicons_quote-left-alt-filled" size={24} />
      </div>

      <p className="flex-1 text-[13px] sm:text-sm font-normal leading-snug text-[#1f6f5b]">
        {km ? quote.km : quote.en}
      </p>
    </aside>
  );
}
