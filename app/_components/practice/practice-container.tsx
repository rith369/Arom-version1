"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { BreathingExperience } from "../breathing-session";
import {
  PRACTICE_BREATHING,
  type PracticeItem,
} from "./practice-data";
import { PracticeCompleteView } from "./practice-complete-view";
import { PracticeDetailView } from "./practice-detail-view";
import { PracticeHomeView } from "./practice-home-view";
import { SavedPracticesView } from "./saved-practices-view";

export type PracticeScreenMode =
  | "home"
  | "detail"
  | "exercise"
  | "complete"
  | "saved";

type PracticeContainerProps = {
  initialMode?: PracticeScreenMode;
};

export function PracticeContainer({
  initialMode = "home",
}: PracticeContainerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<PracticeScreenMode>(initialMode);
  const [selectedPractice, setSelectedPractice] =
    useState<PracticeItem>(PRACTICE_BREATHING);

  const handleSelectPractice = (practice: PracticeItem) => {
    setSelectedPractice(practice);
    setMode("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartPractice = () => {
    setMode("exercise");
  };

  const handleExerciseComplete = () => {
    setMode("complete");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (mode === "exercise") {
    return (
      <BreathingExperience
        onExit={() => {
          handleExerciseComplete();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      {/* Desktop Sidebar Navigation */}
      <DesktopNavigation active="MindGuide" />

      {/* Main View Area */}
      <div className="min-w-0">
        {mode === "home" && (
          <PracticeHomeView
            onSelectPractice={handleSelectPractice}
            onOpenSaved={() => setMode("saved")}
            onBackToMindGuide={() => router.push("/mindguide")}
          />
        )}

        {mode === "detail" && (
          <PracticeDetailView
            practice={selectedPractice}
            onBack={() => setMode("home")}
            onStartPractice={handleStartPractice}
          />
        )}

        {mode === "complete" && (
          <PracticeCompleteView
            practice={selectedPractice}
            onPracticeAgain={() => setMode("exercise")}
            onGoToLearn={() => router.push("/learn")}
            onBackToPractices={() => setMode("home")}
          />
        )}

        {mode === "saved" && (
          <SavedPracticesView
            onBack={() => setMode("home")}
            onSelectPractice={(practice) => {
              setSelectedPractice(practice);
              setMode("detail");
            }}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation active="MindGuide" />
    </div>
  );
}
