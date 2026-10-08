"use client";

import { useLanguage } from "../_components/language-provider";
import { useFirstName } from "../_components/auth-provider";

export function GreetingSection() {
  const { language } = useLanguage();
  const km = language === "km";
  const firstName = useFirstName();
  const name = firstName ? ` ${firstName}` : "";

  return (
    <section aria-label="Greeting" className="pt-2">
      <h1 className="text-xl font-bold tracking-tight text-[#1f6f5b] sm:text-2xl">
        {km ? `អរុណសួស្តី${name}!` : `Good morning${name}!`}
      </h1>
      <p className="mt-1 text-sm font-normal text-black/90 sm:text-base">
        {km ? "តើថ្ងៃនេះអារម្មណ៍របស់អ្នកយ៉ាងណាដែរ?" : "How are you feeling today?"}
      </p>
    </section>
  );
}
