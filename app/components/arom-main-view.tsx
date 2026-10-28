"use client";

import { TopHeader } from "./top-header";
import { GreetingSection } from "./greeting-section";
import { DailyPlanCard, PlanBanner } from "./daily-plan-card";
import { QuoteCard } from "./quote-card";
import { MoodSelector } from "./mood-selector";
import { ProgressDashboard } from "./progress-dashboard";
import { BottomNav } from "./bottom-nav";
import { NextSessionCard, useNextSession } from "./next-session-card";
import { CheckInDueCard, useCheckInDue } from "./check-in-due-card";
import { SelfMapCard, useSelfMapCard } from "./self-map-card";
import { DesktopNavigation } from "../_components/app-navigation";
import { useLanguage } from "../_components/language-provider";
import { InstallPopup } from "../_components/install-app/install-popup";

export function AromMainView() {
  const { language } = useLanguage();
  const nextSession = useNextSession();
  const checkInDue = useCheckInDue();
  const selfMap = useSelfMapCard();

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

            {/* A 14 day symptom recheck is due. Never names the check. */}
            {checkInDue && <CheckInDueCard km={language === "km"} />}

            {/* Laptops: the sprout picture has a row of its own, so the right
                column starts level with the top of the plan card. Phones: one
                column (picture, plan, quote, mood check in, progress). */}
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-x-6">
              <div className="lg:col-start-1 lg:row-start-1">
                <PlanBanner tuck={!nextSession && !checkInDue} />
              </div>
              <div className="w-full lg:col-start-1 lg:row-start-2">
                <DailyPlanCard />
              </div>

              {/* Right on laptops: the day's quote, today's mood, then the week */}
              <div className="mt-5 flex flex-col gap-5 lg:col-start-2 lg:row-start-2 lg:mt-0">
                <QuoteCard />
                <div className="rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-5">
                  <MoodSelector />
                </div>
                {/* Understand yourself: an invitation, how far along, or look again */}
                <SelfMapCard state={selfMap} km={language === "km"} />
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

      {/* Popup inviting people to put AROM on their home screen */}
      <InstallPopup />
    </div>
  );
}
