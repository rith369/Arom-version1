"use client";

import { Star } from "lucide-react";
import { useState } from "react";

const STAR_ON = "fill-[#f6c445] text-[#f6c445]";
const STAR_OFF = "fill-transparent text-[#a9b7b3]";

/** Stars to read, for example on a review. */
export function StarRow({ rating, size = 16, label }: { rating: number; size?: number; label: string }) {
  return (
    <span role="img" aria-label={label} className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star key={value} aria-hidden="true" size={size} className={value <= Math.round(rating) ? STAR_ON : STAR_OFF} />
      ))}
    </span>
  );
}

/** Words for each star count, shown under the picker. */
export function ratingWord(rating: number, km: boolean) {
  const words: Record<number, [string, string]> = {
    1: ["មិនល្អ", "Poor"],
    2: ["គួរសម", "Fair"],
    3: ["ល្អ", "Good"],
    4: ["ល្អណាស់", "Very good"],
    5: ["ល្អឥតខ្ចោះ", "Excellent"],
  };
  const word = words[rating];
  return word ? (km ? word[0] : word[1]) : "";
}

export function starsLabel(rating: number, km: boolean) {
  return km ? `${rating} ក្នុងចំណោម 5 ផ្កាយ` : `${rating} out of 5 stars`;
}

/** Choose 1 to 5 stars. Built from radio buttons, so it works with a keyboard and screen readers. */
export function StarPicker({
  value,
  onChange,
  name,
  legend,
  km,
  disabled,
}: {
  value: number;
  onChange: (rating: number) => void;
  name: string;
  legend: string;
  km: boolean;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      <div className="mt-1.5 flex items-center gap-3">
        <div className="flex items-center" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <label
              key={rating}
              onMouseEnter={() => setHover(rating)}
              className="cursor-pointer rounded-lg p-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-arom"
            >
              <input
                type="radio"
                name={name}
                value={rating}
                checked={value === rating}
                onChange={() => onChange(rating)}
                className="sr-only"
              />
              <span className="sr-only">{starsLabel(rating, km)}</span>
              <Star
                aria-hidden="true"
                size={30}
                className={`transition-colors duration-100 ${rating <= shown ? STAR_ON : STAR_OFF}`}
              />
            </label>
          ))}
        </div>
        {shown > 0 && <span className="text-sm font-semibold text-ink-muted">{ratingWord(shown, km)}</span>}
      </div>
    </fieldset>
  );
}

/** "October 2026" in Cambodia time. Reviews show the month only, never the exact day. */
export function reviewMonth(iso: string, km: boolean) {
  return new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Phnom_Penh",
  }).format(new Date(iso));
}
