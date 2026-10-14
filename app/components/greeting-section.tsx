"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../_components/language-provider";
import { useFirstName } from "../_components/auth-provider";

type Greeting = "hello" | "morning" | "afternoon" | "evening";

const GREETINGS: Record<Greeting, { en: string; km: string }> = {
  hello: { en: "Hello", km: "សួស្តី" },
  morning: { en: "Good morning", km: "អរុណសួស្តី" },
  afternoon: { en: "Good afternoon", km: "ទិវាសួស្តី" },
  evening: { en: "Good evening", km: "សាយ័ណ្ហសួស្តី" },
};

// Late at night "Hello", not "Good night", which reads like a goodbye.
function greetingFor(hour: number): Greeting {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "hello";
}

export function GreetingSection() {
  const { language } = useLanguage();
  const km = language === "km";
  const firstName = useFirstName();
  const name = firstName ? ` ${firstName}` : "";

  // The server's clock is not the visitor's, so the greeting is chosen in the
  // browser after the page loads. "Hello" until then keeps hydration stable.
  const [greeting, setGreeting] = useState<Greeting>("hello");
  useEffect(() => {
    const update = () => setGreeting(greetingFor(new Date().getHours()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const words = GREETINGS[greeting];

  return (
    <section aria-label={km ? "ការស្វាគមន៍" : "Greeting"} className="pt-2">
      <h1 className="text-xl font-bold tracking-tight text-[#1f6f5b] sm:text-2xl">
        {km ? `${words.km}${name}!` : `${words.en}${name}!`}
      </h1>
      <p className="mt-1 text-sm font-normal text-black/90 sm:text-base">
        {km ? "តើថ្ងៃនេះអារម្មណ៍របស់អ្នកយ៉ាងណាដែរ?" : "How are you feeling today?"}
      </p>
    </section>
  );
}
