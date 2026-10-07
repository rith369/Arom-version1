"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { BreathingExperience } from "../breathing-session";
import {
  LESSON_ABOUT_STRESS,
  type Lesson,
} from "./learn-data";
import { LearnHomeView } from "./learn-home-view";
import { LessonCompleteView } from "./lesson-complete-view";
import { LessonDetailView } from "./lesson-detail-view";
import { LessonScreen } from "./lesson-screen";
import { SavedLearningView } from "./saved-learning-view";

export type LearnScreenMode =
  | "home"
  | "detail"
  | "lesson"
  | "complete"
  | "saved"
  | "exercise";

type LearnContainerProps = {
  initialMode?: LearnScreenMode;
};

export function LearnContainer({ initialMode = "home" }: LearnContainerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<LearnScreenMode>(initialMode);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(LESSON_ABOUT_STRESS);
  const [lessonStartSection, setLessonStartSection] = useState<number>(1);

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setMode("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartLesson = (startSection = 1) => {
    setLessonStartSection(startSection);
    setMode("lesson");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLessonComplete = () => {
    setMode("complete");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If in immersive interactive session (breathing or full screen lesson), hide standard shell
  if (mode === "exercise") {
    return (
      <BreathingExperience
        onExit={() => {
          setMode("complete");
        }}
      />
    );
  }

  if (mode === "lesson") {
    return (
      <LessonScreen
        lesson={selectedLesson}
        initialSection={lessonStartSection}
        onExit={() => setMode("detail")}
        onComplete={handleLessonComplete}
        onOpenExercise={() => setMode("exercise")}
        onOpenProfessional={() => router.push("/professional")}
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
          <LearnHomeView
            onSelectLesson={handleSelectLesson}
            onOpenSaved={() => setMode("saved")}
            onBackToMindGuide={() => router.push("/mindguide")}
          />
        )}

        {mode === "detail" && (
          <LessonDetailView
            lesson={selectedLesson}
            onBack={() => setMode("home")}
            onStartLesson={handleStartLesson}
          />
        )}

        {mode === "complete" && (
          <LessonCompleteView
            lesson={selectedLesson}
            onTryExercise={() => setMode("exercise")}
            onReadAnother={() => setMode("home")}
            onViewSaved={() => setMode("saved")}
          />
        )}

        {mode === "saved" && (
          <SavedLearningView
            onBack={() => setMode("home")}
            onSelectLesson={(lessonId) => {
              if (lessonId === "learn-about-stress") {
                setSelectedLesson(LESSON_ABOUT_STRESS);
                setMode("detail");
              }
            }}
          />
        )}
      </div>

      {/* Mobile Navigation bar */}
      <MobileNavigation active="MindGuide" />
    </div>
  );
}
