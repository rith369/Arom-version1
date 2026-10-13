"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { BreathingExperience } from "../breathing-session";
import {
  ALL_TIPS,
  TIP_CONTROL_STRESS,
  type TipItem,
} from "./tips-data";
import { TipCompleteView } from "./tip-complete-view";
import { TipDetailView } from "./tip-detail-view";
import { TipInteractiveView } from "./tip-interactive-view";
import { TipsHomeView } from "./tips-home-view";
import { SavedTipsView } from "./saved-tips-view";

export type TipsScreenMode =
  | "home"
  | "detail"
  | "interactive"
  | "complete"
  | "saved"
  | "breathing";

type TipsContainerProps = {
  initialMode?: TipsScreenMode;
  // Opens one tip directly, for example from a professional's care task.
  initialItemId?: string;
};

export function TipsContainer({
  initialMode = "home",
  initialItemId,
}: TipsContainerProps) {
  const router = useRouter();
  const initialTip = ALL_TIPS.find((tip) => tip.id === initialItemId && tip.isAvailable);
  const [mode, setMode] = useState<TipsScreenMode>(initialTip ? "detail" : initialMode);
  const [selectedTip, setSelectedTip] = useState<TipItem>(initialTip ?? TIP_CONTROL_STRESS);

  const handleSelectTip = (tip: TipItem) => {
    setSelectedTip(tip);
    setMode("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartTips = () => {
    setMode("interactive");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleComplete = () => {
    setMode("complete");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (mode === "breathing") {
    return (
      <BreathingExperience
        onExit={() => {
          setMode("interactive");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      {/* Desktop Navigation Sidebar */}
      <DesktopNavigation active="MindGuide" />

      {/* Main View Area */}
      <div className="min-w-0">
        {mode === "home" && (
          <TipsHomeView
            onSelectTip={handleSelectTip}
            onOpenSaved={() => setMode("saved")}
            onBackToMindGuide={() => router.push("/mindguide")}
          />
        )}

        {mode === "detail" && (
          <TipDetailView
            tip={selectedTip}
            onBack={() => setMode("home")}
            onStartTips={handleStartTips}
          />
        )}

        {mode === "interactive" && (
          <TipInteractiveView
            tip={selectedTip}
            onBack={() => setMode("detail")}
            onComplete={handleComplete}
            onOpenBreathing={() => setMode("breathing")}
            onOpenProfessional={() => router.push("/professional")}
          />
        )}

        {mode === "complete" && (
          <TipCompleteView
            tip={selectedTip}
            onTryBreathing={() => setMode("breathing")}
            onBackToTips={() => setMode("home")}
            onViewSaved={() => setMode("saved")}
          />
        )}

        {mode === "saved" && (
          <SavedTipsView
            onBack={() => setMode("home")}
            onSelectTip={(tip) => {
              setSelectedTip(tip);
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
