import { z } from "zod";

// Symptom checks (BACKEND-HANDOFF.md section 35). An early warning for the
// person only, never a diagnosis. Questions, scoring and levels are shared by
// the browser and the API; the API always scores again, so a level can never
// come from the browser. Answers are private health data: they never go in a
// URL, browser storage or a log, and professionals never see them.
//
// Questionnaires: PHQ-9 (Kroenke, Spitzer and Williams 2001) and GAD-7
// (Spitzer, Kroenke, Williams and Löwe 2006), both free to use. The Khmer is
// the wording validated in Cambodia by Steinman et al. 2025, PLOS Mental
// Health 2(4):e0000228 (S1 and S2 Appendix). Do not reword the questions
// without a professional's review, because that changes what they measure.

export const SYMPTOM_CHECK_TYPES = ["depression", "anxiety"] as const;
export type SymptomCheckType = (typeof SYMPTOM_CHECK_TYPES)[number];

export const SYMPTOM_LEVELS = ["none", "low", "medium", "high"] as const;
export type SymptomLevel = (typeof SYMPTOM_LEVELS)[number];

export type SupportPath = "self_help" | "self_help_and_professional" | "professional";

type Text = { en: string; km: string };

export interface SymptomQuestion {
  id: string;
  text: Text;
  // Counted in the score. The safety question in the anxiety check is not.
  scored: boolean;
}

export interface Questionnaire {
  type: SymptomCheckType;
  instrument: string;
  name: Text;
  description: Text;
  questions: SymptomQuestion[];
  maxScore: number;
  // Highest score for each level, lowest level first.
  bands: { level: SymptomLevel; max: number }[];
}

export const ANSWER_OPTIONS: { value: 0 | 1 | 2 | 3; label: Text }[] = [
  { value: 0, label: { en: "Not at all", km: "មិនមានទាល់តែសោះ" } },
  { value: 1, label: { en: "Several days", km: "ពីរបីថ្ងៃ" } },
  { value: 2, label: { en: "More than half the days", km: "ច្រើនជាងមួយសប្តាហ៍" } },
  { value: 3, label: { en: "Nearly every day", km: "មានស្ទើរតែគ្រប់ពេល ឬរាល់ថ្ងៃ" } },
];

export const QUESTION_PROMPT: Text = {
  en: "Over the last 2 weeks, how often have you been bothered by this?",
  km: "ជាង២អាទិត្យចុងក្រោយនេះ តើអ្នកត្រូវបានរំខានញឹកញាប់យ៉ាងណាដោយសារបញ្ហានេះ?",
};

// PHQ-9 item 9. Any answer above "Not at all" shows Get help now straight
// away, whatever the total. It is also asked at the end of the anxiety check.
export const SAFETY_QUESTION_ID = "phq_9";

const SAFETY_TEXT: Text = {
  en: "Thoughts that you would be better off dead, or of hurting yourself in some way",
  km: "មានគំនិតថា បើអ្នកស្លាប់ទៅប្រសើរជាងអ្នករស់នៅ ឬចង់តែធ្វើបាបខ្លួនឯង ដោយមធ្យោបាយផ្សេងៗ",
};

const STANDARD_BANDS = (high: number): Questionnaire["bands"] => [
  { level: "none", max: 4 },
  { level: "low", max: 9 },
  { level: "medium", max: 14 },
  { level: "high", max: high },
];

export const QUESTIONNAIRES: Record<SymptomCheckType, Questionnaire> = {
  depression: {
    type: "depression",
    instrument: "PHQ-9",
    name: { en: "Low mood", km: "អារម្មណ៍ធ្លាក់ចុះ (Low mood)" },
    description: {
      en: "9 questions about your mood, sleep and energy.",
      km: "សំណួរ ៩ អំពីអារម្មណ៍ ការគេង និងកម្លាំងរបស់អ្នក។",
    },
    questions: [
      {
        id: "phq_1",
        scored: true,
        text: {
          en: "Little interest or pleasure in doing things",
          km: "មានការចាប់អារម្មណ៍តិចតួចឬសប្បាយចិត្តតិចតួចក្នុងការធ្វើការងារផ្សេងៗ",
        },
      },
      {
        id: "phq_2",
        scored: true,
        text: {
          en: "Feeling down, depressed, or hopeless",
          km: "មានអារម្មណ៍ស្រងូតស្រងាត់ ធ្លាក់ទឹកចិត្ត ឬអស់សង្ឃឹម",
        },
      },
      {
        id: "phq_3",
        scored: true,
        text: {
          en: "Trouble falling or staying asleep, or sleeping too much",
          km: "ពិបាកក្នុងការគេង ឬគេងលង់លក់ពិបាកងើប ឬគេងច្រើនម៉ោងពេក",
        },
      },
      {
        id: "phq_4",
        scored: true,
        text: {
          en: "Feeling tired or having little energy",
          km: "មានអារម្មណ៍អស់កម្លាំង ឬមានកម្លាំងពលំតិចតួច",
        },
      },
      {
        id: "phq_5",
        scored: true,
        text: {
          en: "Poor appetite or overeating",
          km: "មិនចង់បរិភោគអាហារ ឬពិសារអាហារច្រើនពេក",
        },
      },
      {
        id: "phq_6",
        scored: true,
        text: {
          en: "Feeling bad about yourself, or that you are a failure or have let yourself or your family down",
          km: "មានអារម្មណ៍មិនល្អចំពោះខ្លួនឯង ឬមានអារម្មណ៍ថាខ្លួនមិនជោគជ័យ ធ្វើឲ្យខ្លួនឯង ឬគ្រួសាររបស់ខ្លួនអាប់អោនកិត្តិយស",
        },
      },
      {
        id: "phq_7",
        scored: true,
        text: {
          en: "Trouble concentrating on things, such as reading the newspaper or watching television",
          km: "ពិបាកក្នុងការប្រមូលអារម្មណ៍ទៅលើអ្វីមួយ ដូចជាការអានកាសែត ឬមើលទូរទស្សន៍",
        },
      },
      {
        id: "phq_8",
        scored: true,
        text: {
          en: "Moving or speaking so slowly that other people could have noticed. Or the opposite, being so fidgety or restless that you have been moving around a lot more than usual",
          km: "ប្រើចលនាកំរើក ឬនិយាយយឺតពេកដែលធ្វើឲ្យមនុស្សឯទៀតកត់សម្គាល់បាន? ឬផ្ទុយទៅវិញ រពិសពេក ឬនៅមិនស្ងៀមដែលទៅនេះទៅនោះច្រើនជាងធម្មតា",
        },
      },
      { id: SAFETY_QUESTION_ID, scored: true, text: SAFETY_TEXT },
    ],
    maxScore: 27,
    bands: STANDARD_BANDS(27),
  },
  anxiety: {
    type: "anxiety",
    instrument: "GAD-7",
    name: { en: "Anxiety", km: "ការថប់បារម្ភ (Anxiety)" },
    description: {
      en: "7 questions about worry and feeling on edge, and one about your safety.",
      km: "សំណួរ ៧ អំពីការព្រួយបារម្ភ និងភាពតានតឹង និងសំណួរមួយអំពីសុវត្ថិភាពរបស់អ្នក។",
    },
    questions: [
      {
        id: "gad_1",
        scored: true,
        text: {
          en: "Feeling nervous, anxious, or on edge",
          km: "មានអារម្មណ៍ច្រួលច្រាលក្នុងចិត្ត អន្ទះអន្ទែង ឬតានតឹងក្នុងចិត្ត",
        },
      },
      {
        id: "gad_2",
        scored: true,
        text: {
          en: "Not being able to stop or control worrying",
          km: "មិនអាចបញ្ឈប់ ឬគ្រប់គ្រងការព្រួយបារម្ភបាន",
        },
      },
      {
        id: "gad_3",
        scored: true,
        text: { en: "Worrying too much about different things", km: "កង្វល់ច្រើនពេកពីរឿងផ្សេងៗ" },
      },
      {
        id: "gad_4",
        scored: true,
        text: { en: "Trouble relaxing", km: "ពិបាកក្នុងការធ្វើឲ្យបាត់ភាពតានតឹងក្នុងចិត្ត" },
      },
      {
        id: "gad_5",
        scored: true,
        text: {
          en: "Being so restless that it is hard to sit still",
          km: "រសាប់រសល់ ច្រាស់ច្រាល អន្ទះអន្ទែងក្នុងខ្លួនខ្លាំងដែលពិបាកឲ្យអង្គុយស្ងៀមបាន",
        },
      },
      {
        id: "gad_6",
        scored: true,
        text: { en: "Becoming easily annoyed or irritable", km: "ឆាប់ហ្មួហ្មង ទើសចិត្ត ឬឆាប់ខឹង" },
      },
      {
        id: "gad_7",
        scored: true,
        text: {
          en: "Feeling afraid, as if something awful might happen",
          km: "មានអារម្មណ៍ខ្លាច ហាក់ដូចជាមានអ្វីដែលគួរអោយខ្លាចកើតឡើង",
        },
      },
      { id: SAFETY_QUESTION_ID, scored: false, text: SAFETY_TEXT },
    ],
    maxScore: 21,
    bands: STANDARD_BANDS(21),
  },
};

export const LEVEL_LABELS: Record<SymptomLevel, Text> = {
  none: { en: "Few signs", km: "សញ្ញាតិចតួច (Few signs)" },
  low: { en: "Some signs", km: "សញ្ញាខ្លះៗ (Some signs)" },
  medium: { en: "Clear signs", km: "សញ្ញាច្បាស់ (Clear signs)" },
  high: { en: "Strong signs", km: "សញ្ញាខ្លាំង (Strong signs)" },
};

export const answerSchema = z.object({
  questionId: z.string().min(1).max(20),
  value: z.number().int().min(0).max(3),
});
export type SymptomAnswer = z.infer<typeof answerSchema>;

export const newSymptomCheckSchema = z.object({
  type: z.enum(SYMPTOM_CHECK_TYPES),
  answers: z.array(answerSchema).min(1).max(20),
});
export type NewSymptomCheck = z.infer<typeof newSymptomCheckSchema>;

export interface SymptomScore {
  answers: SymptomAnswer[];
  score: number;
  maxScore: number;
  level: SymptomLevel;
  safetyConcern: boolean;
}

/**
 * Scores one check. Every question must be answered exactly once, in any
 * order, or the result is null. Answers come back in question order.
 */
export function scoreSymptomCheck(type: SymptomCheckType, answers: SymptomAnswer[]): SymptomScore | null {
  const questionnaire = QUESTIONNAIRES[type];
  if (answers.length !== questionnaire.questions.length) return null;

  const byId = new Map(answers.map((answer) => [answer.questionId, answer.value]));
  if (byId.size !== answers.length) return null;

  const ordered: SymptomAnswer[] = [];
  let score = 0;
  for (const question of questionnaire.questions) {
    const value = byId.get(question.id);
    if (value === undefined) return null;
    ordered.push({ questionId: question.id, value });
    if (question.scored) score += value;
  }

  const level = questionnaire.bands.find((band) => score <= band.max)?.level ?? "high";
  const safetyConcern = (byId.get(SAFETY_QUESTION_ID) ?? 0) > 0;
  return { answers: ordered, score, maxScore: questionnaire.maxScore, level, safetyConcern };
}

/** One saved check. Never carries the answers. */
export interface SymptomCheckDto {
  id: string;
  type: SymptomCheckType;
  score: number;
  maxScore: number;
  level: SymptomLevel;
  safetyConcern: boolean;
  recommendedPath: SupportPath | null;
  createdAt: string;
}

/** The person's active support journey for one concern (14 day rule). */
export interface SupportJourneyDto {
  concern: SymptomCheckType;
  startLevel: SymptomLevel;
  latestLevel: SymptomLevel;
  path: SupportPath;
  // Cambodia day the app asks the person to check again.
  reviewDueOn: string;
  professionalRecommended: boolean;
}

/** GET /api/symptom-checks: newest first, plus active journeys. */
export interface SymptomChecksResponse {
  checks: SymptomCheckDto[];
  journeys: SupportJourneyDto[];
}

/** POST /api/symptom-checks answer. `journey` is null when none is active. */
export interface SymptomCheckSavedResponse {
  check: SymptomCheckDto;
  journey: SupportJourneyDto | null;
}

export const MAX_SYMPTOM_CHECKS = 30;

/**
 * True when the newest check of this type scored higher than the one before.
 * Used for the gentle "harder than before" nudge. Checks are newest first.
 */
export function isHarderThanBefore(checks: SymptomCheckDto[], type: SymptomCheckType) {
  const ofType = checks.filter((check) => check.type === type);
  return ofType.length >= 2 && ofType[0].score > ofType[1].score;
}
