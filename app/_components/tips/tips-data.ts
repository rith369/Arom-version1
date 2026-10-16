export type TipCategory =
  | "All"
  | "Stress"
  | "Anxiety"
  | "Sleep"
  | "Emotions"
  | "Productivity"
  | "Body";

export type TipStep = {
  number: number;
  title: string;
  kmTitle: string;
  body: string;
  kmBody: string;
  tryNow: string;
  kmTryNow: string;
  hasBreathingAction?: boolean;
};

export type TipItem = {
  id: string;
  title: string;
  kmTitle: string;
  subtitle: string;
  kmSubtitle: string;
  introduction: string;
  kmIntroduction: string;
  category: TipCategory;
  kmCategory?: string;
  duration: string;
  kmDuration: string;
  difficulty: "Beginner" | "Intermediate";
  kmDifficulty: string;
  format: string;
  kmFormat: string;
  isAvailable: boolean;
  badge?: string;
  image: string;
  heroImage?: string;
  sourceCitation: string;
  kmSourceCitation: string;
  steps: TipStep[];
  supportCallout: {
    title: string;
    kmTitle: string;
    body: string;
    kmBody: string;
    actionLabel: string;
    kmActionLabel: string;
  };
};

export type SavedTip = {
  id: string;
  title: string;
  kmTitle: string;
  category: string;
  duration: string;
  thumbnail: string;
};

export const TIP_CATEGORIES: {
  id: TipCategory;
  label: string;
  kmLabel: string;
}[] = [
  { id: "All", label: "All", kmLabel: "ទាំងអស់" },
  { id: "Stress", label: "Stress", kmLabel: "ភាពតានតឹង (Stress)" },
  { id: "Anxiety", label: "Anxiety", kmLabel: "ការថប់បារម្ភ (Anxiety)" },
  { id: "Sleep", label: "Sleep", kmLabel: "ដំណេក (Sleep)" },
  { id: "Emotions", label: "Emotions", kmLabel: "អារម្មណ៍ (Emotions)" },
  { id: "Body", label: "Body", kmLabel: "រាងកាយ (Body)" },
];

export const TIP_CONTROL_STRESS: TipItem = {
  id: "how-to-control-stress",
  title: "How to control your Stress",
  kmTitle: "របៀបគ្រប់គ្រងភាពតានតឹង (How to Control Stress)",
  subtitle: "Stress Isn't the Enemy. Here's How to Handle It.",
  kmSubtitle: "ភាពតានតឹងមិនមែនជាសត្រូវទេ។ នេះជាវិធីដោះស្រាយវា។",
  introduction:
    "Stress is your body's alarm system. A little helps you focus, like before a big presentation. The problem starts when the alarm never switches off. You can't delete stress from life, but you can change how it hits you.",
  kmIntroduction:
    "ភាពតានតឹងគឺជាប្រព័ន្ធរោទិ៍ប្រកាសអាសន្ននៃរាងកាយរបស់អ្នក។ កម្រិតតិចតួចជួយឱ្យអ្នកផ្តោតអារម្មណ៍។ បញ្ហាកើតឡើងនៅពេលសំឡេងរោទិ៍មិនដែលបិទ។ អ្នកមិនអាចលុបបំបាត់ភាពតានតឹងចេញពីជីវិតបានទេ ប៉ុន្តែអ្នកអាចផ្លាស់ប្តូររបៀបដែលវាជះឥទ្ធិពលមកលើអ្នក។",
  category: "Stress",
  kmCategory: "ភាពតានតឹង (Stress)",
  duration: "4 min",
  kmDuration: "៤ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "6 Practical Tips",
  kmFormat: "៦ គន្លឹះអនុវត្តជាក់ស្តែង",
  isAvailable: true,
  image: "/mindguide/icon-7.svg",
  heroImage: "/mindguide/managing-stress-hero.svg",
  sourceCitation: "Adapted from the American Psychological Association (2024).",
  kmSourceCitation: "ដកស្រង់ចេញពីសមាគមចិត្តសាស្រ្តអាមេរិក (APA, 2024)។",
  supportCallout: {
    title: "When to get more support",
    kmTitle: "នៅពេលដែលអ្នកត្រូវការជំនួយបន្ថែម",
    body: "If stress has felt heavy for weeks, or it's hurting your sleep, studies, work, or relationships, that's not weakness. It's a signal. Tap Match Me Now to find a therapist.",
    kmBody:
      "ប្រសិនបើភាពតានតឹងមានអារម្មណ៍ធ្ងន់ធ្ងរជាច្រើនសប្តាហ៍ ឬវាប៉ះពាល់ដល់ដំណេក ការសិក្សា ការងារ ឬទំនាក់ទំនងរបស់អ្នក នោះមិនមែនជាភាពទន់ខ្សោយទេ។ វាជាសញ្ញាប្រាប់។ ចុច ផ្គូផ្គងខ្ញុំឥឡូវនេះ ដើម្បីស្វែងរកអ្នកជំនាញពិគ្រោះយោបល់។",
    actionLabel: "Match Me Now",
    kmActionLabel: "ផ្គូផ្គងខ្ញុំឥឡូវនេះ (Match Me)",
  },
  steps: [
    {
      number: 1,
      title: "Cut what you control.",
      kmTitle: "កាត់បន្ថយអ្វីដែលអ្នកអាចគ្រប់គ្រងបាន",
      body: 'Write down everything stressing you, then circle what you can actually change (your schedule, a "no," asking for help). Let the rest wait.',
      kmBody:
        "សរសេរអ្វីៗទាំងអស់ដែលធ្វើឱ្យអ្នកតានតឹង រួចគូសរង្វង់លើអ្វីដែលអ្នកពិតជាអាចផ្លាស់ប្តូរបាន (កាលវិភាគរបស់អ្នក ការនិយាយពាក្យ 'ទេ' ឬការសុំជំនួយ)។ ទុកអ្វីដែលនៅសល់សិន។",
      tryNow: "drop or delay ONE thing this week.",
      kmTryNow: "លុបចោល ឬពន្យារពេលរឿងមួយក្នុងសប្តាហ៍នេះ។",
    },
    {
      number: 2,
      title: "Protect your joy.",
      kmTitle: "ការពារក្តីរីករាយរបស់អ្នក",
      body: "When life gets busy, fun is the first thing we cut, and it's what we need most.",
      kmBody:
        "ពេលជីវិតមមាញឹក ការកម្សាន្តគឺជារឿងដំបូងដែលយើងកាត់បន្ថយ ប៉ុន្តែវាជាអ្វីដែលយើងត្រូវការបំផុត។",
      tryNow: "10 minutes of music, a show, or a game. No guilt.",
      kmTryNow: "ស្តាប់ចម្រៀង មើលរឿង ឬលេងហ្គេម ១០ នាទី ដោយមិនមានអារម្មណ៍ខុសឆ្គង។",
    },
    {
      number: 3,
      title: "Change the story.",
      kmTitle: "ផ្លាស់ប្តូររឿងរ៉ាវក្នុងចិត្ត",
      body: 'Thought -> feeling -> action. "I\'m going to fail" feeds panic. "This is hard, but I\'ve handled hard things before" calms it.',
      kmBody:
        "គំនិត បង្កើតជាអារម្មណ៍ និងឈានដល់សកម្មភាព។ ពាក្យ 'ខ្ញុំនឹងបរាជ័យ' បង្កើនការភ័យស្លន់ស្លោ។ ពាក្យ 'រឿងនេះពិបាក ប៉ុន្តែខ្ញុំធ្លាប់ឆ្លងកាត់រឿងលំបាកពីមុនមក' ជួយឱ្យចិត្តស្ងប់។",
      tryNow: "write one stressful thought, then rewrite it to be kinder and more realistic.",
      kmTryNow: "សរសេរគំនិតតានតឹងមួយ រួចសរសេរវាឡើងវិញឱ្យកាន់តែទន់ភ្លន់ និងជាក់ស្តែង។",
    },
    {
      number: 4,
      title: "Lean on someone.",
      kmTitle: "ពឹងពាក់លើនរណាម្នាក់",
      body: 'You don\'t need a perfect speech. "I\'m having a rough week" is enough.',
      kmBody:
        "អ្នកមិនចាំបាច់មានពាក្យពេចន៍ល្អឥតខ្ចោះទេ។ គ្រាន់តែនិយាយថា 'ខ្ញុំកំពុងជួបសប្តាហ៍លំបាក' គឺគ្រប់គ្រាន់ហើយ។",
      tryNow: "message one person you trust.",
      kmTryNow: "ផ្ញើសារទៅកាន់មនុស្សម្នាក់ដែលអ្នកទុកចិត្ត។",
    },
    {
      number: 5,
      title: "Look after your body.",
      kmTitle: "ថែរក្សារាងកាយរបស់អ្នក",
      body: "Move a little, eat regular meals, drink water, protect your sleep.",
      kmBody: "ធ្វើចលនារាងកាយ ញ៉ាំអាហារទៀងទាត់ ផឹកទឹក និងការពារដំណេករបស់អ្នក។",
      tryNow: "a 10-minute walk or stretch.",
      kmTryNow: "ដើរ ឬពត់ខ្លួន ១០ នាទី។",
    },
    {
      number: 6,
      title: "Slow your breathing.",
      kmTitle: "បន្ថយល្បឿនដកដង្ហើម",
      body: "Slow breathing tells your body it's safe.",
      kmBody: "ការដកដង្ហើមយឺតៗប្រាប់រាងកាយរបស់អ្នកថាវាមានសុវត្ថិភាព។",
      tryNow: "2 minutes of 4-7-8 breathing.",
      kmTryNow: "ដកដង្ហើមតាមចង្វាក់ ៤, ៧, ៨ រយៈពេល ២ នាទី។",
      hasBreathingAction: true,
    },
  ],
};

export const ALL_TIPS: TipItem[] = [
  TIP_CONTROL_STRESS,
  {
    id: "sleep-hygiene-essentials",
    title: "Sleep Hygiene Essentials",
    kmTitle: "មូលដ្ឋានគ្រឹះនៃដំណេកលក់ស្រួល (Sleep Hygiene)",
    subtitle: "Small Nighttime Adjustments for Restful Sleep",
    kmSubtitle: "ការកែសម្រួលទម្លាប់ពេលយប់ដើម្បីគេងលក់ស្កប់ស្កល់",
    introduction:
      "Good sleep starts hours before you lie down. Creating a wind-down routine allows your circadian rhythm to cue melatonin release naturally.",
    kmIntroduction:
      "ការគេងឱ្យបានល្អចាប់ផ្តើមជាច្រើនម៉ោងមុនពេលអ្នកចូលគេង។ ការបង្កើតទម្លាប់សម្រាកជួយឱ្យរាងកាយបញ្ចេញអ័រម៉ូនគេងលក់ដោយធម្មជាតិ។",
    category: "Sleep",
    kmCategory: "ដំណេក (Sleep)",
    duration: "3 min",
    kmDuration: "៣ នាទី",
    difficulty: "Beginner",
    kmDifficulty: "កម្រិតដំបូង (Beginner)",
    format: "5 Evening Tips",
    kmFormat: "៥ គន្លឹះពេលល្ងាច",
    isAvailable: false,
    badge: "Coming Soon",
    image: "/mindguide/sleep.png",
    sourceCitation: "National Sleep Foundation guidelines (2024).",
    kmSourceCitation: "គោលការណ៍ណែនាំមូលនិធិដំណេកជាតិ (2024)។",
    supportCallout: {
      title: "Chronic Insomnia Support",
      kmTitle: "ជំនួយពេលគេងមិនលក់រ៉ាំរ៉ៃ",
      body: "If sleeplessness persists more than three nights a week for over a month, consult a clinical sleep specialist.",
      kmBody: "ប្រសិនបើដំណេកមិនលក់នៅតែបន្តលើសពី ៣ យប់ក្នុងមួយសប្តាហ៍ សូមពិគ្រោះជាមួយអ្នកជំនាញ។",
      actionLabel: "Find Sleep Support",
      kmActionLabel: "ស្វែងរកជំនួយដំណេក (Find Sleep Support)",
    },
    steps: [],
  },
  {
    id: "calming-racing-thoughts",
    title: "Calming Racing Thoughts",
    kmTitle: "ការបន្ធូរបន្ថយគំនិតរវើរវាយ (Racing Thoughts)",
    subtitle: "When Your Brain Refuses to Slow Down",
    kmSubtitle: "នៅពេលដែលខួរក្បាលមិនព្រមសម្រាក",
    introduction:
      "Racing thoughts are often unaddressed worries competing for your attention. Externalizing them onto paper removes the cognitive load.",
    kmIntroduction:
      "គំនិតរវើរវាយច្រើនតែកើតចេញពីការព្រួយបារម្ភ។ ការសរសេរវាចេញមកក្រៅជួយកាត់បន្ថយបន្ទុកផ្លូវចិត្ត។",
    category: "Anxiety",
    kmCategory: "ការថប់បារម្ភ (Anxiety)",
    duration: "4 min",
    kmDuration: "៤ នាទី",
    difficulty: "Beginner",
    kmDifficulty: "កម្រិតដំបូង (Beginner)",
    format: "Brain Dump Guide",
    kmFormat: "ការណែនាំសរសេរបញ្ចេញគំនិត",
    isAvailable: false,
    badge: "Coming Soon",
    image: "/mindguide/icon-10.svg",
    sourceCitation: "Anxiety & Depression Association of America (2024).",
    kmSourceCitation: "សមាគមថប់បារម្ភ និងបាក់ទឹកចិត្តអាមេរិក (ADAA, 2024)។",
    supportCallout: {
      title: "Overwhelming Anxiety",
      kmTitle: "ការថប់បារម្ភខ្លាំង",
      body: "When intrusive thoughts interfere with daily focus, talking to a licensed counselor offers structured grounding tools.",
      kmBody: "នៅពេលដែលគំនិតរំខានរារាំងការផ្តោតអារម្មណ៍ប្រចាំថ្ងៃ ការពិគ្រោះជាមួយអ្នកប្រឹក្សាផ្តល់នូវឧបករណ៍ទប់លំនឹងចិត្ត។",
      actionLabel: "Match Me Now",
      kmActionLabel: "ផ្គូផ្គងខ្ញុំឥឡូវនេះ (Match Me)",
    },
    steps: [],
  },
  {
    id: "setting-gentle-boundaries",
    title: "Setting Gentle Boundaries",
    kmTitle: "ការកំណត់ព្រំដែនផ្ទាល់ខ្លួនដោយទន់ភ្លន់ (Boundaries)",
    subtitle: "Saying No Without Feeling Selfish",
    kmSubtitle: "ការបដិសេធដោយមិនមានអារម្មណ៍អាត្មានិយម",
    introduction:
      "Boundaries are not walls; they are clear property lines that let people know how to care for you without draining your energy.",
    kmIntroduction:
      "ព្រំដែនមិនមែនជាជញ្ជាំងទេ ប៉ុន្តែជាបន្ទាត់ច្បាស់លាស់ដែលឱ្យអ្នកដទៃដឹងពីរបៀបគោរពអ្នកដោយមិនធ្វើឱ្យអ្នកអស់ថាមពល។",
    category: "Emotions",
    kmCategory: "អារម្មណ៍ (Emotions)",
    duration: "5 min",
    kmDuration: "៥ នាទី",
    difficulty: "Intermediate",
    kmDifficulty: "កម្រិតមធ្យម (Intermediate)",
    format: "Boundary Scripts",
    kmFormat: "គំរូពាក្យបដិសេធ",
    isAvailable: false,
    badge: "Coming Soon",
    image: "/mindguide/icon-7.svg",
    sourceCitation: "American Psychological Association (2023).",
    kmSourceCitation: "សមាគមចិត្តសាស្រ្តអាមេរិក (2023)។",
    supportCallout: {
      title: "Interpersonal Strain",
      kmTitle: "ភាពតានតឹងក្នុងទំនាក់ទំនង",
      body: "If people-pleasing creates deep burnout, therapy helps untangle guilt and build assertiveness.",
      kmBody: "ប្រសិនបើការផ្គាប់ចិត្តអ្នកដទៃបង្កឱ្យអស់កម្លាំងចិត្ត ការព្យាបាលជួយបំបាត់អារម្មណ៍ខុសឆ្គង។",
      actionLabel: "Match Me Now",
      kmActionLabel: "ផ្គូផ្គងខ្ញុំឥឡូវនេះ (Match Me)",
    },
    steps: [],
  },
  {
    id: "mindful-digital-detox",
    title: "Mindful Digital Detox",
    kmTitle: "ការកាត់បន្ថយការប្រើប្រាស់បច្ចេកវិទ្យា (Digital Detox)",
    subtitle: "Reclaiming Attention from Endless Scrolling",
    kmSubtitle: "ទាញយកការយកចិត្តទុកដាក់ត្រឡប់មកវិញ",
    introduction:
      "Constant notifications flood the nervous system with micro-stressors. Establishing phone-free windows restores calm dopamine baselines.",
    kmIntroduction:
      "ការជូនដំណឹងឥតឈប់ឈរធ្វើឱ្យប្រព័ន្ធប្រសាទតានតឹង។ ការកំណត់ពេលមិនប្រើទូរស័ព្ទជួយស្តារភាពស្ងប់ស្ងាត់ឡើងវិញ។",
    category: "Body",
    kmCategory: "រាងកាយ (Body)",
    duration: "4 min",
    kmDuration: "៤ នាទី",
    difficulty: "Beginner",
    kmDifficulty: "កម្រិតដំបូង (Beginner)",
    format: "Micro-Habits",
    kmFormat: "ទម្លាប់តូចៗ",
    isAvailable: false,
    badge: "Coming Soon",
    image: "/mindguide/strategies.png",
    sourceCitation: "Harvard Health Publishing (2024).",
    kmSourceCitation: "ការបោះពុម្ពផ្សាយសុខភាពហាវឺដ (2024)។",
    supportCallout: {
      title: "Screen Addiction",
      kmTitle: "ការញៀនអេក្រង់",
      body: "When digital consumption replaces sleep and social connection, behavioral guidance helps rebuild healthy routines.",
      kmBody: "នៅពេលដែលការប្រើប្រាស់អេក្រង់ជំនួសដំណេក ការណែនាំអំពីអាកប្បកិរិយាជួយកសាងទម្លាប់ល្អឡើងវិញ។",
      actionLabel: "Find Guidance",
      kmActionLabel: "ស្វែងរកការណែនាំ (Find Guidance)",
    },
    steps: [],
  },
];

export const STORAGE_TIPS_KEYS = {
  BOOKMARKS: "arom_bookmarked_tips_v1",
  COMPLETIONS: "arom_tip_completions_v1",
};

export function isTipBookmarked(tipId: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(STORAGE_TIPS_KEYS.BOOKMARKS);
    if (!raw) return true;
    const list: string[] = JSON.parse(raw);
    return list.includes(tipId);
  } catch {
    return true;
  }
}

export function toggleTipBookmark(tipId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_TIPS_KEYS.BOOKMARKS);
    let list: string[] = raw ? JSON.parse(raw) : ["how-to-control-stress"];
    const exists = list.includes(tipId);
    if (exists) {
      list = list.filter((id) => id !== tipId);
    } else {
      list.push(tipId);
    }
    window.localStorage.setItem(STORAGE_TIPS_KEYS.BOOKMARKS, JSON.stringify(list));
    return !exists;
  } catch {
    return false;
  }
}
