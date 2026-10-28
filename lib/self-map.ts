import { z } from "zod";

// Understand yourself, "My self map" (BACKEND-HANDOFF.md section 38). Self
// knowledge, never a diagnosis and never a level of how unwell someone is.
// Results say "you tend to", never "you are". Answers are private: they never
// go in a URL, browser storage or a log. The person may share their self map
// with a professional they have booked; admins never see it.
//
// Parts:
// - values: AROM's own value cards. Pick 3 to 5, then say how much you lived
//   each one in the last 2 weeks (the "living your values" idea from ACT).
// - coping: Brief COPE, Carver 1997, Int J Behav Med 4(1):92 to 100. Free to
//   use in research and clinical work without asking (Carver's own page). The
//   wording is unchanged. The three groups below (facing the problem, caring
//   for feelings, pulling away) follow Cooper, Katona and Livingston 2008; the
//   Brief COPE itself has no total score, so none is made here.
// All Khmer in this file is a draft by AROM, waiting for a Khmer speaking
// professional to review it. Do not reword any question without that review.

export const SELF_MAP_PARTS = ["values", "coping"] as const;
export type SelfMapPart = (typeof SELF_MAP_PARTS)[number];

type Text = { en: string; km: string };

// ---------------------------------------------------------------------------
// My values
// ---------------------------------------------------------------------------

export interface ValueCard {
  id: string;
  name: Text;
  description: Text;
  // One small thing to try this week when this value is not being lived much.
  smallStep: Text;
}

export const VALUE_CARDS: ValueCard[] = [
  {
    id: "family",
    name: { en: "Family", km: "គ្រួសារ (Family)" },
    description: { en: "Caring for my family and being close to them", km: "យកចិត្តទុកដាក់ និងនៅជិតស្និទ្ធជាមួយគ្រួសារ" },
    smallStep: { en: "Share one meal or one phone call with a family member this week, with your phone put away.", km: "ញ៉ាំអាហារមួយពេល ឬទូរស័ព្ទទៅសមាជិកគ្រួសារម្នាក់ក្នុងសប្តាហ៍នេះ ដោយដាក់ទូរស័ព្ទចោលសិន។" },
  },
  {
    id: "respect",
    name: { en: "Respect", km: "ការគោរព (Respect)" },
    description: { en: "Treating others with respect, and being respected", km: "គោរពអ្នកដទៃ និងទទួលបានការគោរពវិញ" },
    smallStep: { en: "Thank an older person or a teacher for something they did for you.", km: "អរគុណមនុស្សចាស់ ឬគ្រូម្នាក់ ចំពោះអ្វីដែលគាត់បានធ្វើឱ្យអ្នក។" },
  },
  {
    id: "faith",
    name: { en: "Faith", km: "ជំនឿ និងសាសនា (Faith)" },
    description: { en: "Living by my religion or spiritual beliefs", km: "រស់នៅតាមសាសនា ឬជំនឿរបស់ខ្ញុំ" },
    smallStep: { en: "Set aside 10 quiet minutes for prayer, meditation or a visit to the pagoda or your place of worship.", km: "ទុកពេលស្ងាត់ ១០ នាទី សម្រាប់បួងសួង ធ្វើសមាធិ ឬទៅវត្ត ឬកន្លែងគោរពបូជារបស់អ្នក។" },
  },
  {
    id: "kindness",
    name: { en: "Kindness", km: "ចិត្តសប្បុរស (Kindness)" },
    description: { en: "Being caring and generous to others", km: "យកចិត្តទុកដាក់ និងចិត្តទូលាយចំពោះអ្នកដទៃ" },
    smallStep: { en: "Do one small kind thing for someone without being asked.", km: "ធ្វើអំពើល្អតូចមួយឱ្យនរណាម្នាក់ ដោយគេមិនបានសុំ។" },
  },
  {
    id: "honesty",
    name: { en: "Honesty", km: "ភាពស្មោះត្រង់ (Honesty)" },
    description: { en: "Telling the truth and being myself", km: "និយាយការពិត និងរស់នៅជាខ្លួនឯង" },
    smallStep: { en: "Tell one person how you really feel about something small.", km: "ប្រាប់មនុស្សម្នាក់ពីអារម្មណ៍ពិតរបស់អ្នក អំពីរឿងតូចមួយ។" },
  },
  {
    id: "learning",
    name: { en: "Learning", km: "ការរៀនសូត្រ (Learning)" },
    description: { en: "Growing my knowledge and skills", km: "បង្កើនចំណេះដឹង និងជំនាញរបស់ខ្ញុំ" },
    smallStep: { en: "Spend 15 minutes learning something you are curious about, just for you.", km: "ចំណាយពេល ១៥ នាទី រៀនអ្វីមួយដែលអ្នកចង់ដឹង សម្រាប់តែខ្លួនអ្នក។" },
  },
  {
    id: "achievement",
    name: { en: "Achievement", km: "ភាពជោគជ័យ (Achievement)" },
    description: { en: "Reaching my goals and doing things well", km: "សម្រេចគោលដៅ និងធ្វើការងារបានល្អ" },
    smallStep: { en: "Choose one small goal you can finish in a day, then finish it.", km: "ជ្រើសគោលដៅតូចមួយដែលអាចធ្វើរួចក្នុងមួយថ្ងៃ ហើយធ្វើវាឱ្យរួច។" },
  },
  {
    id: "freedom",
    name: { en: "Freedom", km: "សេរីភាព (Freedom)" },
    description: { en: "Making my own choices about my life", km: "ធ្វើការសម្រេចចិត្តដោយខ្លួនឯងអំពីជីវិតរបស់ខ្ញុំ" },
    smallStep: { en: "Make one choice this week only because it is right for you.", km: "ធ្វើការសម្រេចចិត្តមួយក្នុងសប្តាហ៍នេះ ដោយសារតែវាត្រឹមត្រូវសម្រាប់អ្នក។" },
  },
  {
    id: "peace",
    name: { en: "Inner peace", km: "សន្តិភាពក្នុងចិត្ត (Inner peace)" },
    description: { en: "Feeling calm and balanced inside", km: "មានអារម្មណ៍ស្ងប់ និងមានតុល្យភាពក្នុងចិត្ត" },
    smallStep: { en: "Try a 5 minute breathing practice on AROM once a day.", km: "សាកល្បងលំហាត់ដកដង្ហើម ៥ នាទីនៅលើ AROM ម្តងក្នុងមួយថ្ងៃ។" },
  },
  {
    id: "health",
    name: { en: "Health", km: "សុខភាព (Health)" },
    description: { en: "Looking after my body and mind", km: "ថែរក្សារាងកាយ និងចិត្តរបស់ខ្ញុំ" },
    smallStep: { en: "Go to bed 30 minutes earlier on two nights, or take a 15 minute walk.", km: "ចូលគេងឱ្យបានមុន ៣០ នាទី ពីរយប់ ឬដើរលេង ១៥ នាទី។" },
  },
  {
    id: "friendship",
    name: { en: "Friendship", km: "មិត្តភាព (Friendship)" },
    description: { en: "Having close friends I trust", km: "មានមិត្តជិតស្និទ្ធដែលខ្ញុំទុកចិត្ត" },
    smallStep: { en: "Send a message to a friend you have not talked to in a while.", km: "ផ្ញើសារទៅមិត្តម្នាក់ដែលអ្នកមិនបាននិយាយគ្នាយូរហើយ។" },
  },
  {
    id: "love",
    name: { en: "Love", km: "សេចក្តីស្រឡាញ់ (Love)" },
    description: { en: "Loving others and being loved", km: "ស្រឡាញ់អ្នកដទៃ និងត្រូវបានគេស្រឡាញ់" },
    smallStep: { en: "Tell someone you love what you like about them.", km: "ប្រាប់មនុស្សដែលអ្នកស្រឡាញ់ ពីអ្វីដែលអ្នកចូលចិត្តលើគាត់។" },
  },
  {
    id: "security",
    name: { en: "Security", km: "ស្ថិរភាព (Security)" },
    description: { en: "Feeling safe and stable, including with money", km: "មានអារម្មណ៍សុវត្ថិភាព និងស្ថិរភាព រួមទាំងផ្នែកហិរញ្ញវត្ថុ" },
    smallStep: { en: "Write down this week's spending, or put a small amount aside.", km: "កត់ត្រាការចំណាយក្នុងសប្តាហ៍នេះ ឬសន្សំលុយបន្តិចទុក។" },
  },
  {
    id: "fun",
    name: { en: "Fun", km: "ភាពសប្បាយរីករាយ (Fun)" },
    description: { en: "Enjoying life and laughing", km: "រីករាយនឹងជីវិត និងសើចសប្បាយ" },
    smallStep: { en: "Plan one thing this week that you do only because you enjoy it.", km: "គ្រោងធ្វើរឿងមួយក្នុងសប្តាហ៍នេះ ដោយសារតែអ្នកចូលចិត្តវា។" },
  },
  {
    id: "creativity",
    name: { en: "Creativity", km: "ការច្នៃប្រឌិត (Creativity)" },
    description: { en: "Making new things and ideas", km: "បង្កើតរបស់ និងគំនិតថ្មីៗ" },
    smallStep: { en: "Spend 20 minutes drawing, writing, cooking or making music.", km: "ចំណាយពេល ២០ នាទី គូររូប សរសេរ ធ្វើម្ហូប ឬលេងតន្ត្រី។" },
  },
  {
    id: "community",
    name: { en: "Helping my community", km: "ការជួយសហគមន៍ (Community)" },
    description: { en: "Making a difference for others and my country", km: "ធ្វើឱ្យមានភាពខុសគ្នាសម្រាប់អ្នកដទៃ និងប្រទេសរបស់ខ្ញុំ" },
    smallStep: { en: "Give one hour to help someone in your community or a cause you care about.", km: "ចំណាយពេលមួយម៉ោង ជួយនរណាម្នាក់ក្នុងសហគមន៍ ឬការងារសង្គមដែលអ្នកយកចិត្តទុកដាក់។" },
  },
  {
    id: "gratitude",
    name: { en: "Gratitude", km: "ការដឹងគុណ (Gratitude)" },
    description: { en: "Being thankful, and giving back to people who helped me", km: "ដឹងគុណ និងតបស្នងដល់អ្នកដែលបានជួយខ្ញុំ" },
    smallStep: { en: "Each night, write down one thing you are thankful for.", km: "រៀងរាល់យប់ សរសេររឿងមួយដែលអ្នកដឹងគុណ។" },
  },
  {
    id: "courage",
    name: { en: "Courage", km: "ភាពក្លាហាន (Courage)" },
    description: { en: "Facing my fears and doing what is right", km: "ប្រឈមមុខនឹងការភ័យខ្លាច និងធ្វើអ្វីដែលត្រឹមត្រូវ" },
    smallStep: { en: "Do one small thing you have been putting off because it feels scary.", km: "ធ្វើរឿងតូចមួយ ដែលអ្នកបានពន្យារពេល ព្រោះវាគួរឱ្យខ្លាច។" },
  },
  {
    id: "responsibility",
    name: { en: "Responsibility", km: "ការទទួលខុសត្រូវ (Responsibility)" },
    description: { en: "Keeping my promises and doing my part", km: "រក្សាពាក្យសន្យា និងបំពេញតួនាទីរបស់ខ្ញុំ" },
    smallStep: { en: "Pick one promise you made and keep it this week.", km: "ជ្រើសរើសពាក្យសន្យាមួយដែលអ្នកបានសន្យា ហើយធ្វើវាក្នុងសប្តាហ៍នេះ។" },
  },
  {
    id: "patience",
    name: { en: "Patience", km: "ការអត់ធ្មត់ (Patience)" },
    description: { en: "Staying calm and kind when things are slow or hard", km: "នៅស្ងប់ និងមានចិត្តល្អ ពេលអ្វីៗយឺត ឬពិបាក" },
    smallStep: { en: "When you feel rushed, take three slow breaths before you answer.", km: "ពេលអ្នកមានអារម្មណ៍ប្រញាប់ ដកដង្ហើមយឺតៗបីដង មុននឹងឆ្លើយ។" },
  },
];

export const VALUE_IDS = VALUE_CARDS.map((card) => card.id);
export const MIN_VALUES = 3;
export const MAX_VALUES = 5;

// How much the person lived a value in the last 2 weeks, 0 to 4.
export const LIVING_OPTIONS: Text[] = [
  { en: "Not at all", km: "មិនបានសោះ" },
  { en: "A little", km: "បន្តិចបន្តួច" },
  { en: "Somewhat", km: "ខ្លះៗ" },
  { en: "Mostly", km: "ភាគច្រើន" },
  { en: "Fully", km: "ពេញលេញ" },
];

export const valuesAnswersSchema = z.object({
  picks: z
    .array(z.object({ id: z.enum(VALUE_IDS as [string, ...string[]]), living: z.number().int().min(0).max(4) }))
    .min(MIN_VALUES)
    .max(MAX_VALUES)
    .refine((picks) => new Set(picks.map((pick) => pick.id)).size === picks.length),
});
export type ValuesAnswers = z.infer<typeof valuesAnswersSchema>;

export function valueCard(id: string) {
  return VALUE_CARDS.find((card) => card.id === id);
}

/** The picked value lived least, when it is below "Mostly". First in order wins a tie. */
export function valueToGrowInto(answers: ValuesAnswers) {
  const lowest = answers.picks.reduce((low, pick) => (pick.living < low.living ? pick : low), answers.picks[0]);
  return lowest.living < 3 ? lowest : null;
}

// ---------------------------------------------------------------------------
// How I handle stress (Brief COPE)
// ---------------------------------------------------------------------------

export const COPING_STYLES = ["solve", "feel", "avoid"] as const;
export type CopingStyle = (typeof COPING_STYLES)[number];

export const COPING_SCALES = [
  "active_coping",
  "planning",
  "instrumental_support",
  "emotional_support",
  "positive_reframing",
  "acceptance",
  "humor",
  "religion",
  "self_distraction",
  "venting",
  "denial",
  "behavioral_disengagement",
  "substance_use",
  "self_blame",
] as const;
export type CopingScale = (typeof COPING_SCALES)[number];

export interface CopingScaleInfo {
  style: CopingStyle;
  name: Text;
  // One line shown when this is something the person does a lot.
  note: Text;
}

export const COPING_SCALE_INFO: Record<CopingScale, CopingScaleInfo> = {
  active_coping: {
    style: "solve",
    name: { en: "Taking action", km: "ការចាត់វិធានការ (Taking action)" },
    note: { en: "You do something about the problem.", km: "អ្នកធ្វើអ្វីមួយដើម្បីដោះស្រាយបញ្ហា។" },
  },
  planning: {
    style: "solve",
    name: { en: "Making a plan", km: "ការធ្វើផែនការ (Planning)" },
    note: { en: "You think through the steps to take.", km: "អ្នកគិតពីជំហានដែលត្រូវធ្វើ។" },
  },
  instrumental_support: {
    style: "solve",
    name: { en: "Asking for advice", km: "ការសុំដំបូន្មាន (Asking for advice)" },
    note: { en: "You ask other people for help and advice.", km: "អ្នកសុំជំនួយ និងដំបូន្មានពីអ្នកដទៃ។" },
  },
  emotional_support: {
    style: "feel",
    name: { en: "Getting comfort from others", km: "ការទទួលការលួងលោមពីអ្នកដទៃ (Comfort from others)" },
    note: { en: "You let people comfort and understand you.", km: "អ្នកអនុញ្ញាតឱ្យអ្នកដទៃលួងលោម និងយល់ពីអ្នក។" },
  },
  positive_reframing: {
    style: "feel",
    name: { en: "Seeing it in a new light", km: "ការមើលរឿងតាមទស្សនៈថ្មី (New light)" },
    note: { en: "You look for something good or useful in what happened.", km: "អ្នកស្វែងរកអ្វីដែលល្អ ឬមានប្រយោជន៍ក្នុងអ្វីដែលបានកើតឡើង។" },
  },
  acceptance: {
    style: "feel",
    name: { en: "Accepting it", km: "ការទទួលយក (Acceptance)" },
    note: { en: "You accept what you cannot change.", km: "អ្នកទទួលយកអ្វីដែលអ្នកមិនអាចផ្លាស់ប្តូរបាន។" },
  },
  humor: {
    style: "feel",
    name: { en: "Humour", km: "ការលេងសើច (Humour)" },
    note: { en: "You find something to laugh about.", km: "អ្នករកអ្វីមួយដើម្បីសើច។" },
  },
  religion: {
    style: "feel",
    name: { en: "Faith, prayer or meditation", km: "ជំនឿ ការបួងសួង ឬសមាធិ (Faith)" },
    note: { en: "You find comfort in your faith, prayer or meditation.", km: "អ្នករកឃើញការលួងលោមក្នុងជំនឿ ការបួងសួង ឬសមាធិ។" },
  },
  self_distraction: {
    style: "avoid",
    name: { en: "Keeping busy to not think about it", km: "ការរវល់ដើម្បីកុំឱ្យគិត (Keeping busy)" },
    note: {
      en: "A break can help, but if it is the main thing you do, the problem may still be waiting.",
      km: "ការសម្រាកអាចជួយបាន ប៉ុន្តែបើវាជារឿងចម្បងដែលអ្នកធ្វើ បញ្ហាអាចនៅតែរង់ចាំអ្នក។",
    },
  },
  venting: {
    style: "avoid",
    name: { en: "Letting feelings out", km: "ការបញ្ចេញអារម្មណ៍ (Venting)" },
    note: {
      en: "Letting feelings out can help, especially with someone safe. On its own it may not make them lighter.",
      km: "ការបញ្ចេញអារម្មណ៍អាចជួយបាន ជាពិសេសជាមួយមនុស្សដែលអ្នកទុកចិត្ត។ ប៉ុន្តែវាតែឯងប្រហែលជាមិនធ្វើឱ្យវាស្រាលទេ។",
    },
  },
  denial: {
    style: "avoid",
    name: { en: "Pretending it is not real", km: "ការបដិសេធការពិត (Denial)" },
    note: {
      en: "It is a natural first reaction, but it can keep you from getting help.",
      km: "វាជាប្រតិកម្មដំបូងធម្មតា ប៉ុន្តែវាអាចរារាំងអ្នកពីការទទួលជំនួយ។",
    },
  },
  behavioral_disengagement: {
    style: "avoid",
    name: { en: "Giving up", km: "ការបោះបង់ (Giving up)" },
    note: {
      en: "Feeling like giving up often means you are very tired. You do not have to do this alone.",
      km: "អារម្មណ៍ចង់បោះបង់ ច្រើនតែមានន័យថាអ្នកហត់នឿយខ្លាំង។ អ្នកមិនចាំបាច់ធ្វើវាតែម្នាក់ឯងទេ។",
    },
  },
  substance_use: {
    style: "avoid",
    name: { en: "Alcohol or drugs", km: "គ្រឿងស្រវឹង ឬគ្រឿងញៀន (Alcohol or drugs)" },
    note: {
      en: "Alcohol and drugs can make stress and low mood worse over time. A professional can help you find other ways.",
      km: "គ្រឿងស្រវឹង និងគ្រឿងញៀន អាចធ្វើឱ្យភាពតានតឹង និងអារម្មណ៍ធ្លាក់ចុះកាន់តែធ្ងន់ធ្ងរ។ អ្នកជំនាញអាចជួយអ្នករកវិធីផ្សេងទៀត។",
    },
  },
  self_blame: {
    style: "avoid",
    name: { en: "Blaming yourself", km: "ការបន្ទោសខ្លួនឯង (Self blame)" },
    note: {
      en: "Being hard on yourself makes stress heavier. Try talking to yourself the way you would talk to a friend.",
      km: "ការតឹងតែងលើខ្លួនឯង ធ្វើឱ្យភាពតានតឹងកាន់តែធ្ងន់។ សាកល្បងនិយាយទៅកាន់ខ្លួនឯង ដូចដែលអ្នកនិយាយទៅកាន់មិត្តភក្តិ។",
    },
  },
};

export const COPING_STYLE_INFO: Record<CopingStyle, { name: Text; description: Text }> = {
  solve: {
    name: { en: "Facing the problem", km: "ការប្រឈមមុខនឹងបញ្ហា (Facing the problem)" },
    description: {
      en: "Working on the problem itself: making a plan, taking action and asking for advice.",
      km: "ដោះស្រាយបញ្ហាដោយផ្ទាល់៖ ធ្វើផែនការ ចាត់វិធានការ និងសុំដំបូន្មាន។",
    },
  },
  feel: {
    name: { en: "Caring for your feelings", km: "ការថែទាំអារម្មណ៍ (Caring for feelings)" },
    description: {
      en: "Looking after how you feel: finding comfort, meaning, faith and acceptance.",
      km: "ថែរក្សាអារម្មណ៍របស់អ្នក៖ ស្វែងរកការលួងលោម អត្ថន័យ ជំនឿ និងការទទួលយក។",
    },
  },
  avoid: {
    name: { en: "Pulling away", km: "ការគេចចេញ (Pulling away)" },
    description: {
      en: "Stepping away from the problem or from yourself. A little can give you a rest, a lot can keep you stuck.",
      km: "គេចចេញពីបញ្ហា ឬពីខ្លួនឯង។ បន្តិចបន្តួចអាចឱ្យអ្នកបានសម្រាក ប៉ុន្តែច្រើនពេកអាចធ្វើឱ្យអ្នកជាប់គាំង។",
    },
  },
};

export const COPING_INTRO: Text = {
  en: "Think about the hardest thing in your life lately. There are no right or wrong answers. Answer for what you have really been doing, not what you think you should do.",
  km: "សូមគិតអំពីរឿងដែលពិបាកបំផុតក្នុងជីវិតរបស់អ្នកនាពេលថ្មីៗនេះ។ គ្មានចម្លើយត្រូវ ឬខុសទេ។ សូមឆ្លើយតាមអ្វីដែលអ្នកបានធ្វើពិតៗ មិនមែនអ្វីដែលអ្នកគិតថាគួរធ្វើនោះទេ។",
};

export const COPING_PROMPT: Text = {
  en: "To cope with it lately:",
  km: "ដើម្បីទប់ទល់នឹងវា នាពេលថ្មីៗនេះ៖",
};

export const COPING_OPTIONS: Text[] = [
  { en: "I haven't been doing this at all", km: "ខ្ញុំមិនបានធ្វើដូចនេះទាល់តែសោះ" },
  { en: "I've been doing this a little bit", km: "ខ្ញុំបានធ្វើដូចនេះបន្តិចបន្តួច" },
  { en: "I've been doing this a medium amount", km: "ខ្ញុំបានធ្វើដូចនេះមធ្យម" },
  { en: "I've been doing this a lot", km: "ខ្ញុំបានធ្វើដូចនេះច្រើន" },
];

export const COPING_CREDIT: Text = {
  en: "Questions from the Brief COPE (Carver 1997). Khmer draft by AROM, waiting for review by a professional.",
  km: "សំណួរពី Brief COPE (Carver 1997)។ សេចក្តីព្រាងភាសាខ្មែរដោយ AROM កំពុងរង់ចាំការពិនិត្យដោយអ្នកជំនាញ។",
};

// Brief COPE items in their original order, each with its scale.
export const COPING_QUESTIONS: { scale: CopingScale; text: Text }[] = [
  { scale: "self_distraction", text: { en: "I've been turning to work or other activities to take my mind off things.", km: "ខ្ញុំបានងាកទៅធ្វើការងារ ឬសកម្មភាពផ្សេងៗ ដើម្បីកុំឱ្យគិតពីរឿងនោះ។" } },
  { scale: "active_coping", text: { en: "I've been concentrating my efforts on doing something about the situation I'm in.", km: "ខ្ញុំបានផ្តោតកម្លាំងទៅលើការធ្វើអ្វីមួយ ដើម្បីដោះស្រាយស្ថានភាពដែលខ្ញុំកំពុងជួប។" } },
  { scale: "denial", text: { en: "I've been saying to myself \"this isn't real.\"", km: "ខ្ញុំបាននិយាយប្រាប់ខ្លួនឯងថា \"រឿងនេះមិនមែនជាការពិតទេ\"។" } },
  { scale: "substance_use", text: { en: "I've been using alcohol or other drugs to make myself feel better.", km: "ខ្ញុំបានប្រើគ្រឿងស្រវឹង ឬគ្រឿងញៀន ដើម្បីឱ្យខ្លួនមានអារម្មណ៍ស្រួលជាងមុន។" } },
  { scale: "emotional_support", text: { en: "I've been getting emotional support from others.", km: "ខ្ញុំបានទទួលការគាំទ្រផ្លូវចិត្តពីអ្នកដទៃ។" } },
  { scale: "behavioral_disengagement", text: { en: "I've been giving up trying to deal with it.", km: "ខ្ញុំបានបោះបង់ការព្យាយាមដោះស្រាយជាមួយវា។" } },
  { scale: "active_coping", text: { en: "I've been taking action to try to make the situation better.", km: "ខ្ញុំបានចាត់វិធានការ ដើម្បីព្យាយាមធ្វើឱ្យស្ថានភាពប្រសើរឡើង។" } },
  { scale: "denial", text: { en: "I've been refusing to believe that it has happened.", km: "ខ្ញុំបានបដិសេធមិនព្រមជឿថារឿងនេះបានកើតឡើង។" } },
  { scale: "venting", text: { en: "I've been saying things to let my unpleasant feelings escape.", km: "ខ្ញុំបាននិយាយចេញមក ដើម្បីបញ្ចេញអារម្មណ៍មិនល្អរបស់ខ្ញុំ។" } },
  { scale: "instrumental_support", text: { en: "I've been getting help and advice from other people.", km: "ខ្ញុំបានទទួលជំនួយ និងដំបូន្មានពីអ្នកដទៃ។" } },
  { scale: "substance_use", text: { en: "I've been using alcohol or other drugs to help me get through it.", km: "ខ្ញុំបានប្រើគ្រឿងស្រវឹង ឬគ្រឿងញៀន ដើម្បីជួយឱ្យខ្ញុំឆ្លងកាត់វាបាន។" } },
  { scale: "positive_reframing", text: { en: "I've been trying to see it in a different light, to make it seem more positive.", km: "ខ្ញុំបានព្យាយាមមើលរឿងនេះតាមទស្សនៈផ្សេង ដើម្បីឱ្យវាមើលទៅវិជ្ជមានជាងមុន។" } },
  { scale: "self_blame", text: { en: "I've been criticizing myself.", km: "ខ្ញុំបានរិះគន់ខ្លួនឯង។" } },
  { scale: "planning", text: { en: "I've been trying to come up with a strategy about what to do.", km: "ខ្ញុំបានព្យាយាមរកវិធីអំពីអ្វីដែលត្រូវធ្វើ។" } },
  { scale: "emotional_support", text: { en: "I've been getting comfort and understanding from someone.", km: "ខ្ញុំបានទទួលការលួងលោម និងការយល់ចិត្តពីនរណាម្នាក់។" } },
  { scale: "behavioral_disengagement", text: { en: "I've been giving up the attempt to cope.", km: "ខ្ញុំបានបោះបង់ការប៉ុនប៉ងដើម្បីទប់ទល់ជាមួយវា។" } },
  { scale: "positive_reframing", text: { en: "I've been looking for something good in what is happening.", km: "ខ្ញុំបានស្វែងរកអ្វីដែលល្អ នៅក្នុងអ្វីដែលកំពុងកើតឡើង។" } },
  { scale: "humor", text: { en: "I've been making jokes about it.", km: "ខ្ញុំបាននិយាយលេងសើចអំពីរឿងនេះ។" } },
  {
    scale: "self_distraction",
    text: {
      en: "I've been doing something to think about it less, such as going to movies, watching TV, reading, daydreaming, sleeping, or shopping.",
      km: "ខ្ញុំបានធ្វើអ្វីមួយដើម្បីឱ្យគិតពីវាតិចជាងមុន ដូចជាមើលកុន មើលទូរទស្សន៍ អានសៀវភៅ ស្រមើស្រមៃ គេង ឬដើរទិញឥវ៉ាន់។",
    },
  },
  { scale: "acceptance", text: { en: "I've been accepting the reality of the fact that it has happened.", km: "ខ្ញុំបានទទួលយកការពិតថា រឿងនេះបានកើតឡើងហើយ។" } },
  { scale: "venting", text: { en: "I've been expressing my negative feelings.", km: "ខ្ញុំបានបញ្ចេញអារម្មណ៍អវិជ្ជមានរបស់ខ្ញុំ។" } },
  { scale: "religion", text: { en: "I've been trying to find comfort in my religion or spiritual beliefs.", km: "ខ្ញុំបានព្យាយាមស្វែងរកការលួងលោមចិត្ត នៅក្នុងសាសនា ឬជំនឿរបស់ខ្ញុំ។" } },
  { scale: "instrumental_support", text: { en: "I've been trying to get advice or help from other people about what to do.", km: "ខ្ញុំបានព្យាយាមសុំដំបូន្មាន ឬជំនួយពីអ្នកដទៃ អំពីអ្វីដែលត្រូវធ្វើ។" } },
  { scale: "acceptance", text: { en: "I've been learning to live with it.", km: "ខ្ញុំបានរៀនរស់នៅជាមួយវា។" } },
  { scale: "planning", text: { en: "I've been thinking hard about what steps to take.", km: "ខ្ញុំបានគិតយ៉ាងខ្លាំងអំពីជំហានដែលត្រូវធ្វើ។" } },
  { scale: "self_blame", text: { en: "I've been blaming myself for things that happened.", km: "ខ្ញុំបានបន្ទោសខ្លួនឯងចំពោះរឿងដែលបានកើតឡើង។" } },
  { scale: "religion", text: { en: "I've been praying or meditating.", km: "ខ្ញុំបានបួងសួង ឬធ្វើសមាធិ។" } },
  { scale: "humor", text: { en: "I've been making fun of the situation.", km: "ខ្ញុំបានធ្វើឱ្យស្ថានភាពនេះក្លាយជារឿងកំប្លែង។" } },
];

export const COPING_LENGTH = COPING_QUESTIONS.length;

// Each answer is the chosen option's index, 0 to 3 (Brief COPE's 1 to 4).
export const copingAnswersSchema = z.array(z.number().int().min(0).max(3)).length(COPING_LENGTH);
export type CopingAnswers = z.infer<typeof copingAnswersSchema>;

// Each scale is the sum of its 2 items on Brief COPE's 1 to 4 points, so 2 to 8.
export const SCALE_MIN = 2;
export const SCALE_MAX = 8;
// "A medium amount" or more on average: something the person does a lot.
export const SCALE_HIGH = 6;

export interface CopingResult {
  scales: Record<CopingScale, number>;
  // Each style as 0 to 100: how much of it the person does, for a simple bar.
  styles: Record<CopingStyle, number>;
  // Up to 3 scales the person uses most, most first, only from "a little" up.
  most: CopingScale[];
  // "Pulling away" scales done a lot.
  stuck: CopingScale[];
  // Up to 2 helpful scales done least, at "a little" or less, as ideas to try.
  tryMore: CopingScale[];
}

export function scoreCoping(answers: CopingAnswers): CopingResult {
  const scales = Object.fromEntries(COPING_SCALES.map((scale) => [scale, 0])) as Record<CopingScale, number>;
  COPING_QUESTIONS.forEach((question, index) => {
    scales[question.scale] += answers[index] + 1;
  });

  const styles = Object.fromEntries(
    COPING_STYLES.map((style) => {
      const own = COPING_SCALES.filter((scale) => COPING_SCALE_INFO[scale].style === style);
      const average = own.reduce((total, scale) => total + scales[scale], 0) / own.length;
      return [style, Math.round(((average - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100)];
    }),
  ) as Record<CopingStyle, number>;

  // Stable sort keeps the list order for ties.
  const byScore = [...COPING_SCALES].sort((a, b) => scales[b] - scales[a]);
  const most = byScore.filter((scale) => scales[scale] > SCALE_MIN + 1).slice(0, 3);
  const stuck = COPING_SCALES.filter((scale) => COPING_SCALE_INFO[scale].style === "avoid" && scales[scale] >= SCALE_HIGH);
  const tryMore = [...COPING_SCALES]
    .filter((scale) => COPING_SCALE_INFO[scale].style !== "avoid" && scales[scale] <= SCALE_MIN + 2)
    .sort((a, b) => scales[a] - scales[b])
    .slice(0, 2);

  return { scales, styles, most, stuck, tryMore };
}

/** Any alcohol or drug use to cope. Shows a gentle note with a way to a professional. */
export function usesSubstances(answers: CopingAnswers) {
  return COPING_QUESTIONS.some((question, index) => question.scale === "substance_use" && answers[index] > 0);
}

// ---------------------------------------------------------------------------
// API shapes
// ---------------------------------------------------------------------------

export type SelfMapPartDto =
  | { part: "values"; answers: ValuesAnswers; previous: ValuesAnswers | null; previousAt: string | null; updatedAt: string }
  | { part: "coping"; answers: CopingAnswers; previous: CopingAnswers | null; previousAt: string | null; updatedAt: string };

/** A professional the person has booked, and whether they see the self map. */
export interface SelfMapShareDto {
  professionalSlug: string;
  name: string;
  nameKm: string | null;
  photoUrl: string | null;
  shared: boolean;
}

/** GET, PUT and DELETE /api/self-map, and PUT /api/self-map/sharing. */
export interface SelfMapResponse {
  parts: SelfMapPartDto[];
  shares: SelfMapShareDto[];
}

export const saveSelfMapSchema = z.discriminatedUnion("part", [
  z.object({ part: z.literal("values"), answers: valuesAnswersSchema }),
  z.object({ part: z.literal("coping"), answers: copingAnswersSchema }),
]);
export type SaveSelfMap = z.infer<typeof saveSelfMapSchema>;

export const shareSelfMapSchema = z.object({
  professionalSlug: z.string().min(1).max(100),
  share: z.boolean(),
});

/** GET /api/pro/clients/:clientId/self-map. Null when the client does not share it. */
export type ProClientSelfMap = {
  values: { answers: ValuesAnswers; updatedAt: string } | null;
  coping: { answers: CopingAnswers; updatedAt: string } | null;
} | null;

/** Reads a part's saved answers, or null when they do not match the current questions. */
export function parsePart(part: string, answers: unknown) {
  if (part === "values") {
    const parsed = valuesAnswersSchema.safeParse(answers);
    return parsed.success ? ({ part: "values", answers: parsed.data } as const) : null;
  }
  if (part === "coping") {
    const parsed = copingAnswersSchema.safeParse(answers);
    return parsed.success ? ({ part: "coping", answers: parsed.data } as const) : null;
  }
  return null;
}

/** Days since a part was last saved, to suggest looking again after 3 months. */
export const LOOK_AGAIN_DAYS = 90;
