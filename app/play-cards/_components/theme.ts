import type { CSSProperties } from "react";
import { Flower2, Route, Sunrise, Waves, type LucideIcon } from "lucide-react";
import type { MoodLevel } from "@/lib/mood";
import type { CardLevel, DeckChoice } from "../_data/cards";

// One look per level: warm sunrise, AROM lagoon green, soft blossom.
export type LevelTheme = {
  card: CSSProperties;
  text: string;
  sub: string;
  chip: string;
  page: string;
  glow: string;
  // Which AROM sprout hosts this level.
  sprout: MoodLevel;
  icon: LucideIcon;
};

export const LEVEL_THEME: Record<CardLevel, LevelTheme> = {
  warm: {
    card: { background: "linear-gradient(150deg, #FFF4DE 0%, #FFD9B6 55%, #FFBF9E 100%)" },
    text: "text-[#5B2B12]",
    sub: "text-[#8A4A26]",
    chip: "bg-white/65 text-[#8A4A26]",
    page: "#FFF8EF",
    glow: "rgba(255, 168, 118, 0.38)",
    sprout: "great",
    icon: Sunrise,
  },
  real: {
    card: { background: "linear-gradient(150deg, #2E9175 0%, #1F6F5B 55%, #154C3E 100%)" },
    text: "text-white",
    sub: "text-white/75",
    chip: "bg-white/15 text-white",
    page: "#EDF7F2",
    glow: "rgba(35, 170, 137, 0.36)",
    sprout: "okay",
    icon: Waves,
  },
  care: {
    card: { background: "linear-gradient(150deg, #FDEBF2 0%, #EFDDF7 55%, #DACCF6 100%)" },
    text: "text-[#45285A]",
    sub: "text-[#6E4B86]",
    chip: "bg-white/65 text-[#6E4B86]",
    page: "#F8F3FB",
    glow: "rgba(176, 138, 228, 0.36)",
    sprout: "good",
    icon: Flower2,
  },
};

export const JOURNEY_ICON = Route;

export const deckIcon = (deck: DeckChoice) => (deck === "journey" ? JOURNEY_ICON : LEVEL_THEME[deck].icon);

// The back of every card: AROM green with a soft dotted weave.
export const CARD_BACK: CSSProperties = {
  backgroundColor: "#1F6F5B",
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.14) 1px, transparent 0), linear-gradient(150deg, #2B8C72 0%, #1F6F5B 50%, #164F41 100%)",
  backgroundSize: "14px 14px, 100% 100%",
};

// Calm, clearly different colors for players' avatars.
export const PLAYER_COLORS = ["#E8895A", "#23AA89", "#A57FD6", "#5B8DEF", "#E37AA0", "#D9A53F", "#3FA9C2", "#7F72DE"];

export const initialOf = (name: string) => (name.trim()[0] ?? "?").toUpperCase();
