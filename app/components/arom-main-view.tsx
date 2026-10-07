"use client";

import { TopHeader } from "./top-header";
import { GreetingSection } from "./greeting-section";
import { DailyPlanCard } from "./daily-plan-card";
import { QuoteCard } from "./quote-card";
import { MoodSelector } from "./mood-selector";
import { ProgressDashboard } from "./progress-dashboard";
import { BottomNav } from "./bottom-nav";
import { DesktopNavigation } from "../_components/app-navigation";

export function AromMainView() {

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

            {/* Desktop 2-column or Mobile 1-column layout */}
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-6">
              {/* Daily Plan Card */}
              <div className="w-full">
                <DailyPlanCard />
              </div>

              {/* Right column on desktop / below on mobile */}
              <div className="flex flex-col gap-5">
                <QuoteCard />
                <div className="rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-5">
                  <MoodSelector />
                </div>
              </div>
            </div>

            {/* Wellness Progress Dashboard */}
            <ProgressDashboard />
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
