// What a person's journal week is about, and the AROM content that helps with
// it (BACKEND-HANDOFF.md section 22). One fixed list: the journal feelings and
// Gemini's summary only ever pick from it, and plain code turns a topic into
// real lessons, tips, practices and professionals. Never a diagnosis.

export const WELLBEING_TOPICS = [
  "stress",
  "anxiety",
  "sleep",
  "low_mood",
  "burnout",
  "relationships",
  "loneliness",
  "self_esteem",
] as const;
export type WellbeingTopic = (typeof WELLBEING_TOPICS)[number];

export type TopicContent = {
  en: string;
  km: string;
  /** Best first. Only available items are shown. */
  lessons: string[];
  tips: string[];
  practices: string[];
  /** Professional specialties (SPECIALTY_OPTIONS) that fit. */
  specialties: string[];
};

export const TOPIC_CONTENT: Record<WellbeingTopic, TopicContent> = {
  stress: {
    en: "Stress",
    km: "ភាពតានតឹង (Stress)",
    lessons: ["learn-about-stress", "how-to-deal-with-academic-pressure", "stress-vs-anxiety-difference"],
    tips: ["how-to-control-stress", "mindful-digital-detox"],
    practices: ["interactive-breathing", "progressive-muscle-relaxation", "mindful-body-scan"],
    specialties: ["Stress"],
  },
  anxiety: {
    en: "Anxiety",
    km: "ការថប់បារម្ភ (Anxiety)",
    lessons: ["understanding-anxiety", "how-to-handle-anxiety-before-an-exam", "how-to-handle-social-anxiety"],
    tips: ["im-overthinking-right-now", "calming-racing-thoughts"],
    practices: ["sensory-grounding", "interactive-breathing"],
    specialties: ["Anxiety"],
  },
  sleep: {
    en: "Sleep",
    km: "ដំណេក (Sleep)",
    lessons: ["better-sleep"],
    tips: ["sleep-hygiene-essentials", "mindful-digital-detox"],
    practices: ["evening-relaxation", "interactive-breathing"],
    specialties: ["Sleep"],
  },
  low_mood: {
    en: "Low mood",
    km: "អារម្មណ៍ធ្លាក់ចុះ (Low mood)",
    lessons: ["sadness-vs-depression", "why-lost-interest-motivation", "talk-about-feelings"],
    tips: [],
    practices: ["loving-kindness", "interactive-breathing"],
    specialties: ["Depression"],
  },
  burnout: {
    en: "Burnout",
    km: "ការអស់កម្លាំងចិត្ត (Burnout)",
    lessons: ["burnout-recovery", "how-to-balance-study-work-life"],
    tips: ["mindful-digital-detox", "setting-gentle-boundaries"],
    practices: ["mindful-body-scan", "interactive-breathing"],
    specialties: ["Burnout", "Stress"],
  },
  relationships: {
    en: "Relationships",
    km: "ទំនាក់ទំនង (Relationships)",
    lessons: ["build-healthy-relationships", "talk-about-feelings"],
    tips: ["setting-gentle-boundaries"],
    practices: ["loving-kindness"],
    specialties: ["Relationships", "Family"],
  },
  loneliness: {
    en: "Loneliness",
    km: "ភាពឯកោ (Loneliness)",
    lessons: ["how-to-deal-with-loneliness", "talk-about-feelings"],
    tips: [],
    practices: ["loving-kindness"],
    specialties: ["Relationships"],
  },
  self_esteem: {
    en: "Self esteem",
    km: "ការគោរពខ្លួនឯង (Self esteem)",
    lessons: ["building-self-esteem", "how-to-handle-fear-of-failure"],
    tips: [],
    practices: ["loving-kindness"],
    specialties: ["Self-confidence"],
  },
};

/** Journal feelings (the page's EMOTIONS) that point to a topic. */
export const FEELING_TOPICS: Record<string, WellbeingTopic[]> = {
  Stressed: ["stress"],
  Overwhelmed: ["stress", "burnout"],
  Angry: ["stress"],
  Anxious: ["anxiety"],
  Worried: ["anxiety"],
  Tired: ["sleep", "burnout"],
  Sad: ["low_mood"],
  Lonely: ["loneliness"],
  Insecure: ["self_esteem"],
  Hurt: ["relationships"],
};

export function isWellbeingTopic(value: unknown): value is WellbeingTopic {
  return typeof value === "string" && (WELLBEING_TOPICS as readonly string[]).includes(value);
}

/**
 * The week's topics, strongest first. Each picked feeling counts 1, Gemini's
 * topics (when the summary is on) count 3 and 2. Ties keep the list order.
 */
export function weekTopics(feelings: string[], summaryTopics: WellbeingTopic[] = []): WellbeingTopic[] {
  const score = new Map<WellbeingTopic, number>();
  for (const feeling of feelings) {
    for (const topic of FEELING_TOPICS[feeling] ?? []) score.set(topic, (score.get(topic) ?? 0) + 1);
  }
  summaryTopics.slice(0, 2).forEach((topic, index) => score.set(topic, (score.get(topic) ?? 0) + (index === 0 ? 3 : 2)));
  return WELLBEING_TOPICS.filter((topic) => (score.get(topic) ?? 0) > 0).sort(
    (a, b) => (score.get(b) ?? 0) - (score.get(a) ?? 0),
  );
}
