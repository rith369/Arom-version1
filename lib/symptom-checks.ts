import { z } from "zod";

// Symptom checks (BACKEND-HANDOFF.md section 35). An early warning for the
// person only, never a diagnosis. Questions, scoring and levels are shared by
// the browser and the API; the API always scores again, so a level can never
// come from the browser. Answers are private health data: they never go in a
// URL, browser storage or a log, and professionals never see them.
//
// Questionnaires (all free to use, see BACKEND-HANDOFF.md for licences):
// - PHQ-9, Kroenke, Spitzer and Williams 2001 (low mood)
// - GAD-7, Spitzer, Kroenke, Williams and Löwe 2006 (anxiety)
// - PSS-10, Cohen, Kamarck and Mermelstein 1983 (stress)
// - Copenhagen Burnout Inventory, personal burnout, Kristensen et al. 2005
// - WHO-5 Well-Being Index, Topp et al. 2015 (higher score is better)
// - UCLA 3 item Loneliness Scale, Hughes et al. 2004
// - PCL-5, US National Center for PTSD, Weathers et al. 2013 (public domain)
// - K-10 Kessler Psychological Distress Scale, Kessler et al. 2002 (distress)
// - PC-PTSD-5, US National Center for PTSD, Prins et al. 2016 (public domain)
// The PHQ-9 and GAD-7 Khmer is the wording validated in Cambodia by Steinman
// et al. 2025, PLOS Mental Health 2(4):e0000228 (S1 and S2 Appendix). The
// K-10 and PC-PTSD-5 Khmer is EMDR Association Cambodia's, used with their
// permission. It was typed from their paper form and is waiting for their
// therapist to proofread every line; it is not called "tested". The other
// checks have no Khmer yet, so `khmerReady` is false: they are hidden while
// the app is in Khmer until a professional gives us the Khmer.
// Do not reword any question without a professional's review.

export const SYMPTOM_CHECK_TYPES = [
  "depression",
  "anxiety",
  "distress",
  "stress",
  "burnout",
  "wellbeing",
  "loneliness",
  "trauma",
  "trauma_screen",
] as const;
export type SymptomCheckType = (typeof SYMPTOM_CHECK_TYPES)[number];

export const SYMPTOM_LEVELS = ["none", "low", "medium", "high"] as const;
export type SymptomLevel = (typeof SYMPTOM_LEVELS)[number];

export type SupportPath = "self_help" | "self_help_and_professional" | "professional";

type Text = { en: string; km: string };
// Question text: Khmer only where a tested or reviewed version exists.
type QuestionText = { en: string; km?: string };

export interface SymptomQuestion {
  id: string;
  text: QuestionText;
  // Counted in the score. The safety question in the anxiety check is not.
  scored: boolean;
  // Positive item (for example "felt confident"): points run the other way.
  reverse?: boolean;
}

export interface AnswerOption {
  label: QuestionText;
  points: number;
}

export interface Questionnaire {
  type: SymptomCheckType;
  instrument: string;
  name: Text;
  description: QuestionText;
  prompt: QuestionText;
  // Lowest points first. The answer sent is the option's index.
  options: AnswerOption[];
  questions: SymptomQuestion[];
  maxScore: number;
  // From the summed points of the scored questions to the saved score.
  total: (sum: number) => number;
  level: (score: number) => SymptomLevel;
  // True for checks where a higher score means feeling better.
  higherIsBetter: boolean;
  khmerReady: boolean;
  // Shown above the first question, for checks that need context first.
  intro?: QuestionText;
  // Show Get help now with every result, not only strong ones.
  alwaysShowHelp?: boolean;
}

/** How a question or label reads in the current language, English when no Khmer exists. */
export function textFor(text: QuestionText, km: boolean) {
  return km && text.km ? text.km : text.en;
}

const OFTEN_OPTIONS: AnswerOption[] = [
  { points: 0, label: { en: "Not at all", km: "មិនមានទាល់តែសោះ" } },
  { points: 1, label: { en: "Several days", km: "ពីរបីថ្ងៃ" } },
  { points: 2, label: { en: "More than half the days", km: "ច្រើនជាងមួយសប្តាហ៍" } },
  { points: 3, label: { en: "Nearly every day", km: "មានស្ទើរតែគ្រប់ពេល ឬរាល់ថ្ងៃ" } },
];

const TWO_WEEK_PROMPT: QuestionText = {
  en: "Over the last 2 weeks, how often have you been bothered by this?",
  km: "ជាង២អាទិត្យចុងក្រោយនេះ តើអ្នកត្រូវបានរំខានញឹកញាប់យ៉ាងណាដោយសារបញ្ហានេះ?",
};

// PHQ-9 item 9. Any answer above "Not at all" shows Get help now straight
// away, whatever the total. It is also asked at the end of the anxiety check.
export const SAFETY_QUESTION_ID = "phq_9";

const SAFETY_TEXT: QuestionText = {
  en: "Thoughts that you would be better off dead, or of hurting yourself in some way",
  km: "មានគំនិតថា បើអ្នកស្លាប់ទៅប្រសើរជាងអ្នករស់នៅ ឬចង់តែធ្វើបាបខ្លួនឯង ដោយមធ្យោបាយផ្សេងៗ",
};

// Standard PHQ-9 and GAD-7 bands (Kroenke 2001, Spitzer 2006).
const phqGadLevel = (score: number): SymptomLevel =>
  score <= 4 ? "none" : score <= 9 ? "low" : score <= 14 ? "medium" : "high";

const sum = (points: number) => points;

export const QUESTIONNAIRES: Record<SymptomCheckType, Questionnaire> = {
  depression: {
    type: "depression",
    instrument: "PHQ-9",
    name: { en: "Low mood", km: "អារម្មណ៍ធ្លាក់ចុះ (Low mood)" },
    description: {
      en: "9 questions about your mood, sleep and energy.",
      km: "សំណួរ ៩ អំពីអារម្មណ៍ ការគេង និងកម្លាំងរបស់អ្នក។",
    },
    prompt: TWO_WEEK_PROMPT,
    options: OFTEN_OPTIONS,
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
    total: sum,
    level: phqGadLevel,
    higherIsBetter: false,
    khmerReady: true,
  },
  anxiety: {
    type: "anxiety",
    instrument: "GAD-7",
    name: { en: "Anxiety", km: "ការថប់បារម្ភ (Anxiety)" },
    description: {
      en: "7 questions about worry and feeling on edge, and one about your safety.",
      km: "សំណួរ ៧ អំពីការព្រួយបារម្ភ និងភាពតានតឹង និងសំណួរមួយអំពីសុវត្ថិភាពរបស់អ្នក។",
    },
    prompt: TWO_WEEK_PROMPT,
    options: OFTEN_OPTIONS,
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
    total: sum,
    level: phqGadLevel,
    higherIsBetter: false,
    khmerReady: true,
  },
  stress: {
    type: "stress",
    instrument: "PSS-10",
    name: { en: "Stress", km: "ភាពតានតឹង (Stress)" },
    description: { en: "10 questions about stress in the last month." },
    prompt: { en: "In the last month, how often have you:" },
    options: [
      { points: 0, label: { en: "Never" } },
      { points: 1, label: { en: "Almost never" } },
      { points: 2, label: { en: "Sometimes" } },
      { points: 3, label: { en: "Fairly often" } },
      { points: 4, label: { en: "Very often" } },
    ],
    questions: [
      { id: "pss_1", scored: true, text: { en: "Been upset because of something that happened unexpectedly" } },
      { id: "pss_2", scored: true, text: { en: "Felt that you were unable to control the important things in your life" } },
      { id: "pss_3", scored: true, text: { en: "Felt nervous and stressed" } },
      { id: "pss_4", scored: true, reverse: true, text: { en: "Felt confident about your ability to handle your personal problems" } },
      { id: "pss_5", scored: true, reverse: true, text: { en: "Felt that things were going your way" } },
      { id: "pss_6", scored: true, text: { en: "Found that you could not cope with all the things that you had to do" } },
      { id: "pss_7", scored: true, reverse: true, text: { en: "Been able to control irritations in your life" } },
      { id: "pss_8", scored: true, reverse: true, text: { en: "Felt that you were on top of things" } },
      { id: "pss_9", scored: true, text: { en: "Been angered because of things that happened that were outside of your control" } },
      { id: "pss_10", scored: true, text: { en: "Felt difficulties were piling up so high that you could not overcome them" } },
    ],
    maxScore: 40,
    total: sum,
    // Commonly used bands: 0 to 13 low, 14 to 26 moderate, 27 to 40 high stress.
    level: (score) => (score <= 13 ? "none" : score <= 26 ? "medium" : "high"),
    higherIsBetter: false,
    khmerReady: false,
  },
  burnout: {
    type: "burnout",
    instrument: "CBI personal burnout",
    name: { en: "Burnout", km: "ភាពអស់កម្លាំង (Burnout)" },
    description: { en: "6 questions about feeling worn out." },
    prompt: { en: "How often do you feel this way?" },
    options: [
      { points: 0, label: { en: "Never or almost never" } },
      { points: 25, label: { en: "Seldom" } },
      { points: 50, label: { en: "Sometimes" } },
      { points: 75, label: { en: "Often" } },
      { points: 100, label: { en: "Always" } },
    ],
    questions: [
      { id: "cbi_1", scored: true, text: { en: "How often do you feel tired?" } },
      { id: "cbi_2", scored: true, text: { en: "How often are you physically exhausted?" } },
      { id: "cbi_3", scored: true, text: { en: "How often are you emotionally exhausted?" } },
      { id: "cbi_4", scored: true, text: { en: "How often do you think: \"I can't take it anymore\"?" } },
      { id: "cbi_5", scored: true, text: { en: "How often do you feel worn out?" } },
      { id: "cbi_6", scored: true, text: { en: "How often do you feel weak and susceptible to illness?" } },
    ],
    maxScore: 100,
    // The score is the average of the 6 answers, from 0 to 100.
    total: (points) => Math.round(points / 6),
    // Commonly used bands: under 50 low, 50 to 74 moderate, 75 or more high.
    level: (score) => (score < 50 ? "none" : score < 75 ? "medium" : "high"),
    higherIsBetter: false,
    khmerReady: false,
  },
  wellbeing: {
    type: "wellbeing",
    instrument: "WHO-5",
    name: { en: "Wellbeing", km: "សុខុមាលភាព (Wellbeing)" },
    description: { en: "5 questions about how you have felt in the last 2 weeks." },
    prompt: { en: "Over the last 2 weeks, how often has this been true for you?" },
    options: [
      { points: 0, label: { en: "At no time" } },
      { points: 1, label: { en: "Some of the time" } },
      { points: 2, label: { en: "Less than half of the time" } },
      { points: 3, label: { en: "More than half of the time" } },
      { points: 4, label: { en: "Most of the time" } },
      { points: 5, label: { en: "All of the time" } },
    ],
    questions: [
      { id: "who_1", scored: true, text: { en: "I have felt cheerful and in good spirits" } },
      { id: "who_2", scored: true, text: { en: "I have felt calm and relaxed" } },
      { id: "who_3", scored: true, text: { en: "I have felt active and vigorous" } },
      { id: "who_4", scored: true, text: { en: "I woke up feeling fresh and rested" } },
      { id: "who_5", scored: true, text: { en: "My daily life has been filled with things that interest me" } },
    ],
    maxScore: 100,
    // Raw 0 to 25, times 4, as a percentage. Higher is better.
    total: (points) => points * 4,
    // WHO-5 guidance: 50 or below is poor wellbeing, 28 or below suggests depression.
    level: (score) => (score > 50 ? "none" : score > 28 ? "medium" : "high"),
    higherIsBetter: true,
    khmerReady: false,
  },
  loneliness: {
    type: "loneliness",
    instrument: "UCLA-3",
    name: { en: "Loneliness", km: "ភាពឯកោ (Loneliness)" },
    description: { en: "3 questions about feeling alone." },
    prompt: { en: "How often do you feel this way?" },
    options: [
      { points: 1, label: { en: "Hardly ever" } },
      { points: 2, label: { en: "Some of the time" } },
      { points: 3, label: { en: "Often" } },
    ],
    questions: [
      { id: "ucla_1", scored: true, text: { en: "How often do you feel that you lack companionship?" } },
      { id: "ucla_2", scored: true, text: { en: "How often do you feel left out?" } },
      { id: "ucla_3", scored: true, text: { en: "How often do you feel isolated from others?" } },
    ],
    maxScore: 9,
    total: sum,
    // Score 3 to 9. 6 or more is commonly used for "lonely" (Steptoe 2013).
    level: (score) => (score <= 5 ? "none" : "medium"),
    higherIsBetter: false,
    khmerReady: false,
  },
  trauma: {
    type: "trauma",
    instrument: "PCL-5",
    name: { en: "Trauma", km: "របួសផ្លូវចិត្ត (Trauma)" },
    description: { en: "20 questions about how a very stressful experience still affects you." },
    intro: {
      en: "These questions are about a very stressful experience, such as an accident, violence, a disaster, or losing someone suddenly. Keep that experience in mind. You do not need to describe it, and you can stop at any time.",
    },
    prompt: { en: "In the past month, how much were you bothered by this?" },
    options: [
      { points: 0, label: { en: "Not at all" } },
      { points: 1, label: { en: "A little bit" } },
      { points: 2, label: { en: "Moderately" } },
      { points: 3, label: { en: "Quite a bit" } },
      { points: 4, label: { en: "Extremely" } },
    ],
    questions: [
      { id: "pcl_1", scored: true, text: { en: "Repeated, disturbing, and unwanted memories of the stressful experience" } },
      { id: "pcl_2", scored: true, text: { en: "Repeated, disturbing dreams of the stressful experience" } },
      {
        id: "pcl_3",
        scored: true,
        text: {
          en: "Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were actually back there reliving it)",
        },
      },
      { id: "pcl_4", scored: true, text: { en: "Feeling very upset when something reminded you of the stressful experience" } },
      {
        id: "pcl_5",
        scored: true,
        text: {
          en: "Having strong physical reactions when something reminded you of the stressful experience (for example, heart pounding, trouble breathing, sweating)",
        },
      },
      { id: "pcl_6", scored: true, text: { en: "Avoiding memories, thoughts, or feelings related to the stressful experience" } },
      {
        id: "pcl_7",
        scored: true,
        text: {
          en: "Avoiding external reminders of the stressful experience (for example, people, places, conversations, activities, objects, or situations)",
        },
      },
      { id: "pcl_8", scored: true, text: { en: "Trouble remembering important parts of the stressful experience" } },
      {
        id: "pcl_9",
        scored: true,
        text: {
          en: "Having strong negative beliefs about yourself, other people, or the world (for example, having thoughts such as: I am bad, there is something seriously wrong with me, no one can be trusted, the world is completely dangerous)",
        },
      },
      { id: "pcl_10", scored: true, text: { en: "Blaming yourself or someone else for the stressful experience or what happened after it" } },
      { id: "pcl_11", scored: true, text: { en: "Having strong negative feelings such as fear, horror, anger, guilt, or shame" } },
      { id: "pcl_12", scored: true, text: { en: "Loss of interest in activities that you used to enjoy" } },
      { id: "pcl_13", scored: true, text: { en: "Feeling distant or cut off from other people" } },
      {
        id: "pcl_14",
        scored: true,
        text: {
          en: "Trouble experiencing positive feelings (for example, being unable to feel happiness or have loving feelings for people close to you)",
        },
      },
      { id: "pcl_15", scored: true, text: { en: "Irritable behavior, angry outbursts, or acting aggressively" } },
      { id: "pcl_16", scored: true, text: { en: "Taking too many risks or doing things that could cause you harm" } },
      { id: "pcl_17", scored: true, text: { en: "Being \"superalert\" or watchful or on guard" } },
      { id: "pcl_18", scored: true, text: { en: "Feeling jumpy or easily startled" } },
      { id: "pcl_19", scored: true, text: { en: "Having difficulty concentrating" } },
      { id: "pcl_20", scored: true, text: { en: "Trouble falling or staying asleep" } },
    ],
    maxScore: 80,
    total: sum,
    // National Center for PTSD: 31 to 33 suggests probable PTSD, so 31 or more
    // is high. The 15 split below it is AROM's, for a professional to confirm.
    level: (score) => (score <= 14 ? "none" : score <= 30 ? "medium" : "high"),
    higherIsBetter: false,
    khmerReady: false,
    alwaysShowHelp: true,
  },
  // Khmer below: EMDR Association Cambodia, waiting for proofreading.
  distress: {
    type: "distress",
    instrument: "K-10",
    name: { en: "General distress", km: "បញ្ហាផ្លូវចិត្តទូទៅ (General distress)" },
    description: {
      en: "10 questions about how you have felt in the last 30 days, and one about your safety.",
      km: "សំណួរ ១០ អំពីអារម្មណ៍របស់អ្នកក្នុងរយៈពេល ៣០ថ្ងៃចុងក្រោយ និងសំណួរមួយអំពីសុវត្ថិភាពរបស់អ្នក។",
    },
    prompt: {
      en: "During the last 30 days, about how often did you feel:",
      km: "ក្នុងអំឡុងពេល ៣០ថ្ងៃ ចុងក្រោយនេះ៖ តើអ្នកមានអារម្មណ៍ដូចខាងក្រោម ញឹកញាប់ កម្រិតណាដែរ?",
    },
    // EMDR's Khmer labels give the days; "១-៥" is written "១ ដល់ ៥" (no dashes).
    options: [
      { points: 1, label: { en: "None of the time", km: "មិនដែលសោះ (០ថ្ងៃ)" } },
      { points: 2, label: { en: "A little of the time", km: "កម្រ ឬតិចតួច (១ ដល់ ៥ថ្ងៃ)" } },
      { points: 3, label: { en: "Some of the time", km: "ពេលខ្លះ (៦ ដល់ ១៥ថ្ងៃ)" } },
      { points: 4, label: { en: "Most of the time", km: "ស្ទើរគ្រប់ពេល (១៦ ដល់ ២៩ថ្ងៃ)" } },
      { points: 5, label: { en: "All of the time", km: "គ្រប់ពេល (៣០ថ្ងៃ)" } },
    ],
    questions: [
      { id: "k10_1", scored: true, text: { en: "Tired out for no good reason", km: "អារម្មណ៍នឿយហត់ដោយគ្មានមូលហេតុសមរម្យ" } },
      { id: "k10_2", scored: true, text: { en: "Nervous", km: "អារម្មណ៍ជ្រួលច្រាល" } },
      {
        id: "k10_3",
        scored: true,
        text: { en: "So nervous that nothing could calm you down", km: "អារម្មណ៍ជ្រួលច្រាលខ្លាំងរហូតគ្មានអ្វីអាចធ្វើឱ្យស្ងប់" },
      },
      { id: "k10_4", scored: true, text: { en: "Hopeless", km: "អារម្មណ៍អស់សង្ឃឹម" } },
      { id: "k10_5", scored: true, text: { en: "Restless or fidgety", km: "អារម្មណ៍រសាប់រសល់នៅមិនសុខ" } },
      {
        id: "k10_6",
        scored: true,
        text: { en: "So restless you could not sit still", km: "អារម្មណ៍រសាប់រសល់ខ្លាំង មិនអាចអង្គុយមួយកន្លែងបាន" },
      },
      { id: "k10_7", scored: true, text: { en: "Depressed", km: "អារម្មណ៍ធ្លាក់ទឹកចិត្ត" } },
      { id: "k10_8", scored: true, text: { en: "That everything was an effort", km: "មានអារម្មណ៍ថាអ្វីៗទាំងអស់សុទ្ធតែពិបាក" } },
      {
        id: "k10_9",
        scored: true,
        text: { en: "So sad that nothing could cheer you up", km: "អារម្មណ៍សោកសៅខ្លាំង គ្មានអ្វីធ្វើឲ្យរីករាយបាន" },
      },
      { id: "k10_10", scored: true, text: { en: "Worthless", km: "មានអារម្មណ៍ថា ខ្លួនឯងគ្មានតំលៃសោះ" } },
      // Not part of K-10: asked unscored at the end, as in the anxiety check.
      { id: SAFETY_QUESTION_ID, scored: false, text: SAFETY_TEXT },
    ],
    maxScore: 50,
    total: sum,
    // Score 10 to 50. Commonly used bands (Andrews and Slade 2001): 10 to 15
    // low, 16 to 21 moderate, 22 to 29 high, 30 to 50 very high distress.
    level: (score) => (score <= 15 ? "none" : score <= 21 ? "low" : score <= 29 ? "medium" : "high"),
    higherIsBetter: false,
    khmerReady: true,
  },
  trauma_screen: {
    type: "trauma_screen",
    instrument: "PC-PTSD-5",
    name: { en: "Trauma (short check)", km: "ការពិនិត្យខ្លីអំពីរបួសផ្លូវចិត្ត (Trauma short check)" },
    description: {
      en: "5 yes or no questions about how a very frightening experience still affects you.",
      km: "សំណួរ ៥ ឆ្លើយ បាទ/ចាស ឬ ទេ អំពីរបៀបដែលបទពិសោធន៍តក់ស្លុតនៅតែប៉ះពាល់អ្នក។",
    },
    // The first Khmer sentence is EMDR's; the rest is AROM's. PC-PTSD-5 starts
    // by asking if such an event ever happened; here the intro says the check
    // is only for people it happened to, so no answer about the event is kept.
    intro: {
      en: "After a very frightening or shocking experience, such as violence, abuse, trafficking, kidnapping, war, insecurity, a traffic accident, a natural disaster, losing a loved one, or seeing violence happen, some people are left with fear, horror, anger or distress. This check is for people who have been through an experience like this. Keep it in mind as you answer. You do not need to describe it, and you can stop at any time.",
      km: "បន្ទាប់ពីឆ្លងកាត់បទពិសោធន៍ ឬព្រឹត្តិការណ៍តក់ស្លុត ដូចជា អំពើហិង្សា ការរំលោភបំពាន ការជួញដូរ ការចាប់ជម្រិត សង្គ្រាម បញ្ហាអសន្តិសុខ គ្រោះថ្នាក់ចរាចរ គ្រោះធម្មជាតិ ការបាត់បង់មនុស្សជាទីស្រលាញ់ ការឃើញផ្ទាល់ ឬសាក្សីនៃអំពើហិង្សាផ្សេងៗ ។ល។ មនុស្សមួយចំនួនអាចបន្សល់នូវអារម្មណ៍ភ័យខ្លាច រន្ធត់ កំហឹង វិប្បដិសារី ជុំវិញហេតុការណ៍ប៉ះទង្គិចដល់ផ្លូវចិត្ត។ ការពិនិត្យនេះសម្រាប់អ្នកដែលធ្លាប់ជួបប្រទះហេតុការណ៍បែបនេះ។ សូមគិតពីហេតុការណ៍នោះ ពេលអ្នកឆ្លើយ។ អ្នកមិនចាំបាច់រៀបរាប់វាទេ ហើយអ្នកអាចឈប់បានគ្រប់ពេល។",
    },
    prompt: { en: "In the past month, have you:", km: "ក្នុងរយៈពេល ៤សប្តាហ៍ចុងក្រោយនេះ៖" },
    options: [
      { points: 0, label: { en: "No", km: "ទេ" } },
      { points: 1, label: { en: "Yes", km: "បាទ/ចាស" } },
    ],
    questions: [
      {
        id: "pcptsd_1",
        scored: true,
        text: {
          en: "Had nightmares about the event(s) or thought about the event(s) when you did not want to",
          km: "តើអ្នកមានយល់សប្តិអាក្រក់ ឬគិតអំពីហេតុការណ៍នោះ ទោះជាអ្នកមិនចង់គិតពីវាដែរឬទេ?",
        },
      },
      {
        id: "pcptsd_2",
        scored: true,
        text: {
          en: "Tried hard not to think about the event(s) or went out of your way to avoid situations that reminded you of the event(s)",
          km: "តើអ្នកធ្លាប់ព្យាយាមមិនចង់គិតពីហេតុការណ៍ ឬរឿងរ៉ាវនោះ ឬគេចវេសពីស្ថានភាពដែលធ្វើឱ្យនឹកដល់រឿងនោះឡើងវិញដែរឬទេ?",
        },
      },
      {
        id: "pcptsd_3",
        scored: true,
        text: {
          en: "Been constantly on guard, watchful, or easily startled",
          km: "តើអ្នកមានអារម្មណ៍ប្រុងប្រយ័ត្នជ្រុលហួសហេតុ ងាយភ្ញាក់ ឬផ្អើលៗដែរឬទេ?",
        },
      },
      {
        id: "pcptsd_4",
        scored: true,
        text: {
          en: "Felt numb or detached from people, activities, or your surroundings",
          km: "តើអ្នកធ្លាប់ស្ពឹកអារម្មណ៍ ឬដកខ្លួនឆ្ងាយចេញពីគេឯង ឬសកម្មភាពផ្សេងៗជុំវិញអ្នកដែរឬទេ?",
        },
      },
      {
        id: "pcptsd_5",
        scored: true,
        text: {
          en: "Felt guilty or unable to stop blaming yourself or others for the event(s) or any problems the event(s) may have caused",
          km: "តើអ្នកមានអារម្មណ៍បន្ទោសខ្លួនឯង ឬមិនអាចបញ្ឈប់ការស្តីបន្ទោសខ្លួនឯង ឬអ្នកដទៃ ជុំវិញហេតុការណ៍ (ព្រឹត្តិការណ៍ដែលបង្កឱ្យមានផលប៉ះពាល់) ដែលបានកើតឡើងដែរឬទេ?",
        },
      },
    ],
    maxScore: 5,
    total: sum,
    // Score is the number of yes answers. 3 or more is a positive screen
    // (Prins 2016: 3 catches the most people, which suits an early warning;
    // Rith chose 3 on 26 Oct 2026). 1 or 2 is AROM's own "some signs".
    level: (score) => (score === 0 ? "none" : score <= 2 ? "low" : "high"),
    higherIsBetter: false,
    khmerReady: true,
    alwaysShowHelp: true,
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
  // The index of the chosen answer option.
  value: z.number().int().min(0).max(9),
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
 * Scores one check. Every question must be answered exactly once with a
 * valid option, in any order, or the result is null. Answers come back in
 * question order.
 */
export function scoreSymptomCheck(type: SymptomCheckType, answers: SymptomAnswer[]): SymptomScore | null {
  const questionnaire = QUESTIONNAIRES[type];
  if (answers.length !== questionnaire.questions.length) return null;

  const byId = new Map(answers.map((answer) => [answer.questionId, answer.value]));
  if (byId.size !== answers.length) return null;

  const lastOption = questionnaire.options.length - 1;
  const ordered: SymptomAnswer[] = [];
  let points = 0;
  for (const question of questionnaire.questions) {
    const value = byId.get(question.id);
    if (value === undefined || value > lastOption) return null;
    ordered.push({ questionId: question.id, value });
    if (question.scored) {
      points += questionnaire.options[question.reverse ? lastOption - value : value].points;
    }
  }

  const score = questionnaire.total(points);
  const safetyConcern = (byId.get(SAFETY_QUESTION_ID) ?? 0) > 0;
  return { answers: ordered, score, maxScore: questionnaire.maxScore, level: questionnaire.level(score), safetyConcern };
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
 * True when the newest check of this type looks harder than the one before.
 * Used for the gentle "harder than before" nudge. Checks are newest first.
 */
export function isHarderThanBefore(checks: SymptomCheckDto[], type: SymptomCheckType) {
  const ofType = checks.filter((check) => check.type === type);
  if (ofType.length < 2) return false;
  return QUESTIONNAIRES[type].higherIsBetter ? ofType[0].score < ofType[1].score : ofType[0].score > ofType[1].score;
}
