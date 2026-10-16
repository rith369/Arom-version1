"use client";

import { Apple, Footprints, GlassWater, Heart, ListTodo, MessageCircleHeart, Moon, PersonStanding, Smartphone, Sun, type LucideIcon } from "lucide-react";
import { FigmaIcon } from "./figma-icon";

// Icons for suggestions and typed tasks (PLAN_ICON_KEYS in lib/plan.ts).
// MindGuide items keep their own icon file from public/figma/icons.
const LUCIDE: Record<string, LucideIcon> = {
  water: GlassWater,
  sleep: Moon,
  walk: Footprints,
  phone: Smartphone,
  food: Apple,
  friend: MessageCircleHeart,
  stretch: PersonStanding,
  grateful: Heart,
  sun: Sun,
  task: ListTodo,
};

export function PlanTaskIcon({ icon, size = 22, className = "" }: { icon: string | null; size?: number; className?: string }) {
  const Lucide = LUCIDE[icon ?? "task"];
  if (Lucide) return <Lucide size={size} aria-hidden="true" className={className} />;
  return <FigmaIcon name={icon ?? "boxicons_note-filled"} size={size} className={className} />;
}
