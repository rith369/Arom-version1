"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { useMindGuidePick } from "../mindguide-pick";
import { BreathingExperience } from "../breathing-session";
import {
  ALL_LESSONS,
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
  // Opens one lesson directly, for example from a professional's care task.
  initialItemId?: string;
};

export function LearnContainer({ initialMode = "home", initialItemId }: LearnContainerProps) {
  const router = useRouter();
  // Set when a professional browses MindGuide to give a care task.
  const pick = useMindGuidePick();
  const initialLesson = ALL_LESSONS.find((lesson) => lesson.id === initialItemId && lesson.isAvailable);
  const [mode, setMode] = useState<LearnScreenMode>(initialLesson ? "detail" : initialMode);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(initialLesson ?? LESSON_ABOUT_STRESS);
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
        onOpenProfessional={() => (pick ? undefined : router.push("/professional"))}
      />
    );
  }

  return (
    <div className={pick ? "bg-canvas" : "min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]"}>
      {/* Desktop Sidebar Navigation */}
      {!pick && <DesktopNavigation active="MindGuide" />}

      {/* Main View Area */}
      <div className="min-w-0">
        {mode === "home" && (
          <LearnHomeView
            onSelectLesson={handleSelectLesson}
            onOpenSaved={() => setMode("saved")}
            onBackToMindGuide={() => (pick ? pick.close() : router.push("/mindguide"))}
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
              const lesson = ALL_LESSONS.find((item) => item.id === lessonId && item.isAvailable);
              if (lesson) {
                setSelectedLesson(lesson);
                setMode("detail");
              }
            }}
          />
        )}
      </div>

      {/* Mobile Navigation bar */}
      {!pick && <MobileNavigation active="MindGuide" />}
    </div>
  );
}
