"use client";

import { TopHeader } from "./top-header";
import { GreetingSection } from "./greeting-section";
import { DailyPlanCard } from "./daily-plan-card";
import { QuoteCard } from "./quote-card";
import { MoodSelector } from "./mood-selector";
import { ProgressDashboard } from "./progress-dashboard";
import { BottomNav } from "./bottom-nav";
import { NextSessionCard, useNextSession } from "./next-session-card";
import { DesktopNavigation } from "../_components/app-navigation";
import { useLanguage } from "../_components/language-provider";

export function AromMainView() {
  const { language } = useLanguage();
  const nextSession = useNextSession();

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#14221f] lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      {/* Desktop Sidebar Navigation */}
      <DesktopNavigation active="Home" />

      {/* Main Content Area */}
      <div className="min-w-0 pb-28 sm:pb-32 lg:pb-12">
        <main className="mx-auto w-full max-w-[430px] px-5 pt-4 sm:px-6 md:max-w-xl lg:max-w-2xl lg:pt-8 xl:max-w-5xl">
          {/* Top Brand Header matching Figma */}
          <TopHeader />

          {/* Responsive Layout Container */}
          <div className="mt-6 flex flex-col gap-5 sm:gap-6 lg:mt-8">
            {/* Greeting */}
            <GreetingSection />

            {/* The user's next booked session, when there is one */}
            {nextSession && <NextSessionCard next={nextSession} km={language === "km"} />}

            {/* Laptops: two columns. Phones: one column in this same order
                (plan, quote, mood check in, progress). */}
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-6">
              {/* Left: the plan, with the day's quote under it */}
              <div className="flex w-full flex-col gap-5">
                <DailyPlanCard tuckBanner={!nextSession} />
                <QuoteCard />
              </div>

              {/* Right on laptops: today's mood, then the week it adds to */}
              <div className="flex flex-col gap-5">
                <div className="rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-5">
                  <MoodSelector />
                </div>
                <ProgressDashboard />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Figma Bottom Navigation (Mobile/Tablet) */}
      <div className="lg:hidden">
        <BottomNav activeTab="Home" />
      </div>
    </div>
  );
}
