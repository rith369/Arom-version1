import {
  Activity,
  BatteryCharging,
  BookOpen,
  CloudRain,
  Compass,
  GitCompare,
  GraduationCap,
  Heart,
  HeartHandshake,
  LifeBuoy,
  MessageCircle,
  Moon,
  Scale,
  ShieldCheck,
  Sunrise,
  Target,
  UserCheck,
  Users,
  UsersRound,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { Lesson } from "./learn-data";

/**
 * Maps each specific lesson to an intuitive, clinical, and human Lucide icon.
 * Ensures no two lessons in the same category repeat the same generic icon.
 * Adheres strictly to anti-AI guidelines (no sparkles, no generic 4-point stars).
 */
export const LESSON_ICONS: Record<string, LucideIcon> = {
  // Anxiety lessons - distinct icons per topic
  "understanding-anxiety": Waves,
  "how-to-handle-social-anxiety": Users,
  "how-to-handle-anxiety-before-an-exam": GraduationCap,

  // Stress lessons - distinct icons per topic
  "learn-about-stress": Activity,
  "how-to-deal-with-academic-pressure": BookOpen,
  "how-to-balance-study-work-life": Scale,
  "stress-vs-anxiety-difference": GitCompare,

  // Mental Health lessons
  "what-is-mental-health": Compass,
  "understand-yourself": UserCheck,
  "know-when-to-seek-help": LifeBuoy,

  // Sleep lessons
  "better-sleep": Moon,

  // Relationships lessons
  "how-to-support-a-struggling-friend": HeartHandshake,
  "build-healthy-relationships": ShieldCheck,
  "talk-about-feelings": MessageCircle,

  // Loneliness lessons
  "how-to-deal-with-loneliness": UsersRound,

  // Depression lessons
  "why-lost-interest-motivation": Sunrise,
  "sadness-vs-depression": CloudRain,

  // Self-esteem and Burnout lessons
  "how-to-handle-fear-of-failure": Target,
  "burnout-recovery": BatteryCharging,
  "building-self-esteem": Heart,
};

/**
 * Safe fallback mapping by category name.
 */
export const CATEGORY_FALLBACK_ICONS: Record<string, LucideIcon> = {
  Stress: Activity,
  Anxiety: Waves,
  Depression: CloudRain,
  Sleep: Moon,
  Relationships: HeartHandshake,
  "Mental Health": Compass,
  Loneliness: UsersRound,
  Burnout: BatteryCharging,
  "Self-esteem": Heart,
};

export function getLessonIcon(lesson: { id: string; category?: string }): LucideIcon {
  return (
    LESSON_ICONS[lesson.id] ??
    (lesson.category ? CATEGORY_FALLBACK_ICONS[lesson.category] : undefined) ??
    BookOpen
  );
}

export function LessonTopicIcon({
  lesson,
  className = "size-6",
}: {
  lesson: { id: string; category?: string };
  className?: string;
}) {
  const Icon = getLessonIcon(lesson);
  return <Icon className={className} strokeWidth={1.8} aria-hidden="true" />;
}
