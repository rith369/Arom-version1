import { cambodiaDay } from "@/lib/mood";
import type { SymptomCheckDto, SymptomCheckType, SymptomLevel } from "@/lib/symptom-checks";

// 2 week programs (BACKEND-HANDOFF.md section 36): one small step a day for
// people whose symptom check shows Some or Clear signs. Self help, never
// treatment. Each day points to content that already exists in MindGuide
// (unavailable items are hidden). The Khmer needs a professional's review.

export const TWO_WEEK_PROGRAMS = ["stress", "anxiety"] as const;
export type ProgramId = (typeof TWO_WEEK_PROGRAMS)[number];

export const PROGRAM_LENGTH = 14;

type Text = { en: string; km: string };

export type ProgramLink =
  | { kind: "lesson" | "tip" | "practice"; id: string }
  | { kind: "journal" }
  | { kind: "check" }
  /** The program's community support group, only when a real one is open. */
  | { kind: "group" };

export type ProgramDay = {
  title: Text;
  /** One sentence on why this step helps. */
  why: Text;
  /** What to do today. */
  step: Text;
  /** Added to the step only when a support group for the topic exists. */
  withGroup?: Text;
  links?: ProgramLink[];
};

export type Program = {
  id: ProgramId;
  name: Text;
  description: Text;
  /** Symptom checks that can lead to this program, the closest match first. */
  checks: SymptomCheckType[];
  weeks: [Text, Text];
  days: ProgramDay[];
};

/** Some and Clear signs. Strong signs go to a professional first. */
export const PROGRAM_LEVELS: SymptomLevel[] = ["low", "medium"];

/** Checks whose result offers a program. General distress offers both. */
export const CHECK_PROGRAMS: Partial<Record<SymptomCheckType, ProgramId[]>> = {
  stress: ["stress"],
  anxiety: ["anxiety"],
  distress: ["stress", "anxiety"],
};

const BREATHING: ProgramDay = {
  title: { en: "Slow your breathing", km: "ដកដង្ហើមយឺតៗ" },
  why: {
    en: "Slow breathing tells your body it is safe, so your heart and muscles can calm down.",
    km: "ការដកដង្ហើមយឺតៗប្រាប់រាងកាយថាវាមានសុវត្ថិភាព ដូច្នេះបេះដូង និងសាច់ដុំអាចស្ងប់ចុះ។",
  },
  step: {
    en: "Do the breathing exercise twice today: once in the morning, and once when you feel tense.",
    km: "ធ្វើលំហាត់ដកដង្ហើមពីរដងនៅថ្ងៃនេះ៖ ម្តងនៅពេលព្រឹក និងម្តងទៀតនៅពេលអ្នកមានអារម្មណ៍តានតឹង។",
  },
  links: [{ kind: "practice", id: "interactive-breathing" }],
};

const GROUNDING_STEP: Text = {
  en: "When it rises today, name 5 things you can see, 4 you can hear, 3 you can touch, 2 you can smell and 1 you can taste.",
  km: "នៅពេលវាកើនឡើងនៅថ្ងៃនេះ ចូររាប់ឈ្មោះរបស់ ៥ ដែលអ្នកមើលឃើញ ៤ ដែលអ្នកឮ ៣ ដែលអ្នកអាចប៉ះ ២ ដែលអ្នកអាចហិតក្លិន និង ១ ដែលអ្នកអាចភ្លក់។",
};

const WEEK_ONE_REVIEW: ProgramDay = {
  title: { en: "Look back on week 1", km: "ក្រឡេកមើលសប្តាហ៍ទី ១" },
  why: {
    en: "Seeing what helped shows you what to keep doing.",
    km: "ការមើលឃើញអ្វីដែលបានជួយ បង្ហាញអ្នកពីអ្វីដែលគួរបន្តធ្វើ។",
  },
  step: {
    en: "Which day helped you most this week? Write one or two lines about it in your journal. Keep doing that step next week.",
    km: "តើថ្ងៃណាដែលបានជួយអ្នកច្រើនជាងគេនៅសប្តាហ៍នេះ? សរសេរមួយ ឬពីរបន្ទាត់អំពីវានៅក្នុងកំណត់ហេតុរបស់អ្នក។ បន្តធ្វើជំហាននោះនៅសប្តាហ៍ក្រោយ។",
  },
  withGroup: {
    en: "If you like, share one thing that helped in the support group.",
    km: "ប្រសិនបើអ្នកចង់ សូមចែករំលែករឿងមួយដែលបានជួយ នៅក្នុងក្រុមគាំទ្រ។",
  },
  links: [{ kind: "journal" }, { kind: "group" }],
};

const TALK_STEP: Text = {
  en: "Talk to a friend or family member you trust today, even for 10 minutes. You can share how these two weeks went.",
  km: "និយាយជាមួយមិត្តភក្តិ ឬសមាជិកគ្រួសារដែលអ្នកទុកចិត្តនៅថ្ងៃនេះ ទោះបីតែ ១០ នាទីក៏ដោយ។ អ្នកអាចចែករំលែកពីរបៀបដែលពីរសប្តាហ៍នេះបានកន្លងទៅ។",
};

// Day 13: for people who have no one they trust to talk to.
const TALK_WITH_GROUP: Text = {
  en: "If there is no one you can talk to, the support group is there for you. Reading without writing is fine.",
  km: "ប្រសិនបើគ្មាននរណាម្នាក់ដែលអ្នកអាចនិយាយជាមួយទេ ក្រុមគាំទ្រនៅទីនេះសម្រាប់អ្នក។ ការអានដោយមិនសរសេរក៏បានដែរ។",
};

const CHECK_AGAIN: ProgramDay = {
  title: { en: "Look back and check again", km: "ក្រឡេកមើលក្រោយ ហើយពិនិត្យម្តងទៀត" },
  why: {
    en: "Checking again shows what changed, and helps you choose what comes next.",
    km: "ការពិនិត្យម្តងទៀតបង្ហាញពីអ្វីដែលបានផ្លាស់ប្តូរ ហើយជួយអ្នកជ្រើសរើសជំហានបន្ទាប់។",
  },
  step: {
    en: "Take the check again. Then pick the 2 or 3 steps that helped most and keep them in your daily plan.",
    km: "ធ្វើការពិនិត្យម្តងទៀត។ បន្ទាប់មក ជ្រើសរើសជំហាន ២ ឬ ៣ ដែលបានជួយច្រើនជាងគេ ហើយរក្សាវាទុកក្នុងផែនការប្រចាំថ្ងៃរបស់អ្នក។",
  },
  links: [{ kind: "check" }],
};

export const PROGRAMS: Record<ProgramId, Program> = {
  stress: {
    id: "stress",
    name: { en: "2 week stress program", km: "វគ្គ ២ សប្តាហ៍ សម្រាប់ភាពតានតឹង (Stress)" },
    description: {
      en: "One small step a day to calm your body and deal with what stresses you.",
      km: "ជំហានតូចមួយរៀងរាល់ថ្ងៃ ដើម្បីសម្រួលរាងកាយ និងដោះស្រាយរឿងដែលធ្វើឱ្យអ្នកតានតឹង។",
    },
    checks: ["stress", "distress"],
    weeks: [
      { en: "Calm your body and mind", km: "សម្រួលរាងកាយ និងចិត្ត" },
      { en: "Deal with what stresses you", km: "ដោះស្រាយរឿងដែលធ្វើឱ្យអ្នកតានតឹង" },
    ],
    days: [
      {
        title: { en: "What stress does to you", km: "ភាពតានតឹងធ្វើអ្វីខ្លះចំពោះអ្នក" },
        why: {
          en: "When you understand stress, it feels less scary and easier to manage.",
          km: "នៅពេលអ្នកយល់ពីភាពតានតឹង វាហាក់មិនសូវគួរឱ្យខ្លាច ហើយងាយស្រួលគ្រប់គ្រងជាងមុន។",
        },
        step: {
          en: "Read the lesson. Then write down 3 things that stress you right now. You do not need to fix them yet.",
          km: "អានមេរៀននេះ។ បន្ទាប់មក សរសេររឿង ៣ ដែលធ្វើឱ្យអ្នកតានតឹងនៅពេលនេះ។ អ្នកមិនទាន់ចាំបាច់ដោះស្រាយវាទេ។",
        },
        links: [{ kind: "lesson", id: "learn-about-stress" }],
      },
      BREATHING,
      {
        title: { en: "Notice your stress signs", km: "កត់សម្គាល់សញ្ញានៃភាពតានតឹងរបស់អ្នក" },
        why: {
          en: "Stress often shows in the body first. Noticing it early helps you act sooner.",
          km: "ភាពតានតឹងច្រើនតែបង្ហាញនៅលើរាងកាយមុនគេ។ ការកត់សម្គាល់វាឆាប់ៗ ជួយឱ្យអ្នកចាត់វិធានការបានលឿនជាងមុន។",
        },
        step: {
          en: "Three times today, stop and ask: where do I feel stress in my body right now? Shoulders, jaw, stomach or head? Relax that part for a few breaths.",
          km: "បីដងនៅថ្ងៃនេះ សូមឈប់មួយភ្លែត ហើយសួរខ្លួនឯងថា៖ តើខ្ញុំមានអារម្មណ៍តានតឹងនៅត្រង់ណានៃរាងកាយឥឡូវនេះ? ស្មា ថ្គាម ពោះ ឬក្បាល? បន្ធូរផ្នែកនោះ ខណៈពេលដកដង្ហើមពីរបីដង។",
        },
        links: [{ kind: "tip", id: "how-to-control-stress" }],
      },
      {
        title: { en: "Come back to the present", km: "នាំចិត្តមកកាន់បច្ចុប្បន្ន (Grounding)" },
        why: {
          en: "When stress pulls your mind away, your senses can bring you back to the present.",
          km: "នៅពេលភាពតានតឹងទាញចិត្តអ្នកចេញឆ្ងាយ ញ្ញាណរបស់អ្នកអាចនាំអ្នកត្រឡប់មកបច្ចុប្បន្នវិញ។",
        },
        step: GROUNDING_STEP,
        links: [{ kind: "practice", id: "sensory-grounding" }],
      },
      {
        title: { en: "Rest and sleep", km: "សម្រាក និងដំណេក" },
        why: {
          en: "Stress makes sleep harder, and poor sleep makes stress stronger. A small change can break the circle.",
          km: "ភាពតានតឹងធ្វើឱ្យពិបាកគេង ហើយការគេងមិនបានល្អធ្វើឱ្យភាពតានតឹងកាន់តែខ្លាំង។ ការផ្លាស់ប្តូរតូចមួយអាចបំបែករង្វង់នេះបាន។",
        },
        step: {
          en: "Pick one habit for tonight: go to bed at the same time, or put your phone away 30 minutes before sleep.",
          km: "ជ្រើសរើសទម្លាប់មួយសម្រាប់យប់នេះ៖ ចូលគេងនៅម៉ោងដដែល ឬដាក់ទូរស័ព្ទចោល ៣០ នាទីមុនពេលគេង។",
        },
        links: [{ kind: "lesson", id: "better-sleep" }],
      },
      {
        title: { en: "Move your body", km: "ធ្វើចលនារាងកាយ" },
        why: {
          en: "Moving your body uses up stress energy and lifts your mood.",
          km: "ការធ្វើចលនារាងកាយជួយបញ្ចេញថាមពលនៃភាពតានតឹង ហើយធ្វើឱ្យអារម្មណ៍ប្រសើរឡើង។",
        },
        step: {
          en: "Take a 10 minute walk or stretch today. Notice how you feel before and after.",
          km: "ដើរ ឬលាតសន្ធឹងរាងកាយ ១០ នាទីនៅថ្ងៃនេះ។ កត់សម្គាល់ពីអារម្មណ៍របស់អ្នក មុន និងក្រោយ។",
        },
        links: [{ kind: "practice", id: "progressive-muscle-relaxation" }],
      },
      WEEK_ONE_REVIEW,
      {
        title: { en: "Sort your stress", km: "បែងចែកភាពតានតឹងរបស់អ្នក" },
        why: {
          en: "Some problems you can change, and some you cannot. Knowing which is which saves your energy.",
          km: "បញ្ហាខ្លះអ្នកអាចផ្លាស់ប្តូរបាន ហើយខ្លះទៀតមិនអាច។ ការដឹងថាមួយណាជាមួយណា ជួយសន្សំថាមពលរបស់អ្នក។",
        },
        step: {
          en: "Look at your list from day 1. Put each thing in one of two groups: things I can change, and things I cannot change.",
          km: "មើលបញ្ជីរបស់អ្នកពីថ្ងៃទី ១។ ដាក់រឿងនីមួយៗក្នុងក្រុមមួយក្នុងចំណោមពីរ៖ រឿងដែលខ្ញុំអាចផ្លាស់ប្តូរបាន និងរឿងដែលខ្ញុំមិនអាចផ្លាស់ប្តូរបាន។",
        },
      },
      {
        title: { en: "Solve one small problem", km: "ដោះស្រាយបញ្ហាតូចមួយ" },
        why: {
          en: "Breaking a problem into small steps makes it feel possible.",
          km: "ការបំបែកបញ្ហាជាជំហានតូចៗ ធ្វើឱ្យវាហាក់អាចធ្វើបាន។",
        },
        step: {
          en: "Pick one thing you can change. Write 3 ways to deal with it, choose the easiest, and do its first small step today.",
          km: "ជ្រើសរើសរឿងមួយដែលអ្នកអាចផ្លាស់ប្តូរបាន។ សរសេរវិធី ៣ ដើម្បីដោះស្រាយវា ជ្រើសរើសវិធីដែលងាយជាងគេ ហើយធ្វើជំហានតូចដំបូងរបស់វានៅថ្ងៃនេះ។",
        },
        links: [{ kind: "lesson", id: "how-to-deal-with-academic-pressure" }],
      },
      {
        title: { en: "Set a gentle boundary", km: "កំណត់ព្រំដែនដោយទន់ភ្លន់" },
        why: {
          en: "Saying yes to everything leaves no time to rest. A kind no protects your energy.",
          km: "ការយល់ព្រមលើអ្វីៗទាំងអស់ ធ្វើឱ្យគ្មានពេលសម្រាក។ ការបដិសេធដោយសុភាព ជួយការពារថាមពលរបស់អ្នក។",
        },
        step: {
          en: "Say no, or not now, to one thing today, kindly and clearly.",
          km: "បដិសេធ ឬនិយាយថា \"មិនទាន់ពេលនេះទេ\" ចំពោះរឿងមួយនៅថ្ងៃនេះ ដោយសុភាព និងច្បាស់លាស់។",
        },
        links: [{ kind: "tip", id: "setting-gentle-boundaries" }],
      },
      {
        title: { en: "A break from screens", km: "សម្រាកពីអេក្រង់" },
        why: {
          en: "News, messages and social media keep the mind on alert. A short break lets it rest.",
          km: "ព័ត៌មាន សារ និងបណ្តាញសង្គម ធ្វើឱ្យចិត្តប្រុងប្រយ័ត្នជានិច្ច។ ការសម្រាកខ្លីមួយ អនុញ្ញាតឱ្យវាបានសម្រាក។",
        },
        step: {
          en: "Spend one hour without your phone today. Do something calm instead, such as a walk, music or cooking.",
          km: "ចំណាយពេលមួយម៉ោងដោយគ្មានទូរស័ព្ទនៅថ្ងៃនេះ។ ធ្វើអ្វីដែលស្ងប់ស្ងាត់ជំនួសវិញ ដូចជាដើរលេង ស្តាប់តន្ត្រី ឬធ្វើម្ហូប។",
        },
        links: [{ kind: "tip", id: "mindful-digital-detox" }],
      },
      {
        title: { en: "Plan a balanced day", km: "រៀបចំថ្ងៃដែលមានតុល្យភាព" },
        why: {
          en: "A day with breaks and something you enjoy is easier to get through.",
          km: "ថ្ងៃដែលមានពេលសម្រាក និងរឿងដែលអ្នកចូលចិត្ត ងាយស្រួលឆ្លងកាត់ជាងមុន។",
        },
        step: {
          en: "Plan tomorrow tonight. Add one real break and one thing you enjoy, and keep them like an appointment.",
          km: "រៀបចំផែនការសម្រាប់ថ្ងៃស្អែកនៅយប់នេះ។ បន្ថែមពេលសម្រាកពិតប្រាកដមួយ និងរឿងមួយដែលអ្នកចូលចិត្ត ហើយរក្សាវាដូចជាការណាត់ជួប។",
        },
        links: [{ kind: "lesson", id: "how-to-balance-study-work-life" }],
      },
      {
        title: { en: "Connect with someone", km: "ភ្ជាប់ទំនាក់ទំនងជាមួយនរណាម្នាក់" },
        why: {
          en: "Sharing stress with someone you trust makes it lighter.",
          km: "ការចែករំលែកភាពតានតឹងជាមួយនរណាម្នាក់ដែលអ្នកទុកចិត្ត ធ្វើឱ្យវាស្រាលជាងមុន។",
        },
        step: TALK_STEP,
        withGroup: TALK_WITH_GROUP,
        links: [{ kind: "lesson", id: "talk-about-feelings" }, { kind: "group" }],
      },
      CHECK_AGAIN,
    ],
  },
  anxiety: {
    id: "anxiety",
    name: { en: "2 week anxiety program", km: "វគ្គ ២ សប្តាហ៍ សម្រាប់ការថប់បារម្ភ (Anxiety)" },
    description: {
      en: "One small step a day to calm the alarm in your body and face your worries.",
      km: "ជំហានតូចមួយរៀងរាល់ថ្ងៃ ដើម្បីសម្រួលរាងកាយ និងប្រឈមមុខនឹងការព្រួយបារម្ភរបស់អ្នក។",
    },
    checks: ["anxiety", "distress"],
    weeks: [
      { en: "Calm your body and your worries", km: "សម្រួលរាងកាយ និងការព្រួយបារម្ភ" },
      { en: "Face your worries step by step", km: "ប្រឈមមុខនឹងការព្រួយបារម្ភម្តងមួយជំហាន" },
    ],
    days: [
      {
        title: { en: "What anxiety is", km: "ការថប់បារម្ភជាអ្វី" },
        why: {
          en: "Anxiety is your body's alarm. Knowing how it works makes it less frightening.",
          km: "ការថប់បារម្ភគឺជាសំឡេងរោទិ៍របស់រាងកាយ។ ការដឹងពីរបៀបដែលវាដំណើរការ ធ្វើឱ្យវាមិនសូវគួរឱ្យភ័យខ្លាច។",
        },
        step: {
          en: "Read the lesson. Then write about one time you felt anxious this week: what happened, what you thought, and what your body did.",
          km: "អានមេរៀននេះ។ បន្ទាប់មក សរសេរអំពីពេលមួយដែលអ្នកមានអារម្មណ៍ថប់បារម្ភនៅសប្តាហ៍នេះ៖ អ្វីបានកើតឡើង អ្នកគិតអ្វី និងរាងកាយរបស់អ្នកមានប្រតិកម្មយ៉ាងដូចម្តេច។",
        },
        links: [{ kind: "lesson", id: "understanding-anxiety" }],
      },
      {
        ...BREATHING,
        why: {
          en: "Anxiety makes breathing fast and shallow. Slow breathing turns the alarm down.",
          km: "ការថប់បារម្ភធ្វើឱ្យដង្ហើមលឿន និងខ្លី។ ការដកដង្ហើមយឺតៗជួយបន្ថយសំឡេងរោទិ៍នោះ។",
        },
      },
      {
        title: { en: "Come back to the present", km: "នាំចិត្តមកកាន់បច្ចុប្បន្ន (Grounding)" },
        why: {
          en: "When worry pulls you into the future, your senses bring you back to now.",
          km: "នៅពេលការព្រួយបារម្ភទាញអ្នកទៅអនាគត ញ្ញាណរបស់អ្នកនាំអ្នកត្រឡប់មកពេលនេះវិញ។",
        },
        step: GROUNDING_STEP,
        links: [{ kind: "practice", id: "sensory-grounding" }],
      },
      {
        title: { en: "Step back from a worry", km: "ដកខ្លួនចេញពីការព្រួយបារម្ភ" },
        why: {
          en: "A worry is a thought, not a fact. Naming it gives you some space from it.",
          km: "ការព្រួយបារម្ភគឺជាគំនិត មិនមែនជាការពិតទេ។ ការដាក់ឈ្មោះវា ផ្តល់ឱ្យអ្នកនូវចន្លោះខ្លះពីវា។",
        },
        step: {
          en: "When a worry loops today, say to yourself: \"I am having the thought that...\" Then bring your attention back to what you are doing.",
          km: "នៅពេលការព្រួយបារម្ភវិលវល់នៅថ្ងៃនេះ ចូរនិយាយទៅកាន់ខ្លួនឯងថា៖ \"ខ្ញុំកំពុងមានគំនិតថា...\" បន្ទាប់មក នាំការយកចិត្តទុកដាក់របស់អ្នកត្រឡប់មកកាន់អ្វីដែលអ្នកកំពុងធ្វើវិញ។",
        },
        links: [{ kind: "tip", id: "im-overthinking-right-now" }],
      },
      {
        title: { en: "Worry time", km: "ពេលវេលាសម្រាប់ព្រួយបារម្ភ (Worry time)" },
        why: {
          en: "Giving worry a set time stops it from taking over the whole day.",
          km: "ការកំណត់ពេលវេលាជាក់លាក់សម្រាប់ការព្រួយបារម្ភ ជួយកុំឱ្យវាគ្របដណ្តប់ពេញមួយថ្ងៃ។",
        },
        step: {
          en: "Choose 15 minutes at the same time each day as your worry time. When a worry comes at another time, write it down and save it for then.",
          km: "ជ្រើសរើស ១៥ នាទីនៅម៉ោងដដែលរៀងរាល់ថ្ងៃ ជាពេលវេលាសម្រាប់ព្រួយបារម្ភ។ នៅពេលការព្រួយបារម្ភមកដល់នៅពេលផ្សេង ចូរសរសេរវាទុក ហើយទុកវាសម្រាប់ពេលនោះ។",
        },
      },
      {
        title: { en: "Quiet a busy mind at night", km: "សម្រួលចិត្តដែលគិតច្រើននៅពេលយប់" },
        why: {
          en: "Worries often grow at night. Putting them on paper helps the mind let go.",
          km: "ការព្រួយបារម្ភច្រើនតែកើនឡើងនៅពេលយប់។ ការសរសេរវាលើក្រដាស ជួយឱ្យចិត្តបានធូរស្រាល។",
        },
        step: {
          en: "Before bed, write tomorrow's worries and one small step for each. Then close the notebook and breathe slowly for a few minutes.",
          km: "មុនពេលគេង សរសេរការព្រួយបារម្ភសម្រាប់ថ្ងៃស្អែក និងជំហានតូចមួយសម្រាប់នីមួយៗ។ បន្ទាប់មក បិទសៀវភៅ ហើយដកដង្ហើមយឺតៗពីរបីនាទី។",
        },
        links: [{ kind: "tip", id: "calming-racing-thoughts" }],
      },
      WEEK_ONE_REVIEW,
      {
        title: { en: "Check the thought", km: "ពិនិត្យមើលគំនិត" },
        why: {
          en: "Anxiety makes the worst outcome feel likely. Looking at the facts gives a fairer view.",
          km: "ការថប់បារម្ភធ្វើឱ្យលទ្ធផលអាក្រក់បំផុតហាក់ដូចជាទំនងនឹងកើតឡើង។ ការពិនិត្យមើលការពិតផ្តល់ឱ្យអ្នកនូវទស្សនៈដែលត្រឹមត្រូវជាង។",
        },
        step: {
          en: "Pick one worry. Ask: what is the evidence for it, and against it? What would I tell a friend? Write a calmer, more balanced thought.",
          km: "ជ្រើសរើសការព្រួយបារម្ភមួយ។ សួរខ្លួនឯងថា៖ តើមានភស្តុតាងអ្វីខ្លះគាំទ្រវា និងប្រឆាំងនឹងវា? តើខ្ញុំនឹងប្រាប់មិត្តភក្តិម្នាក់ដូចម្តេច? សរសេរគំនិតមួយដែលស្ងប់ និងមានតុល្យភាពជាងមុន។",
        },
      },
      {
        title: { en: "Stress or anxiety?", km: "ភាពតានតឹង ឬការថប់បារម្ភ?" },
        why: {
          en: "Stress is about a real problem now. Anxiety is often about what might happen. Each needs a different step.",
          km: "ភាពតានតឹងទាក់ទងនឹងបញ្ហាពិតប្រាកដនៅពេលនេះ។ ការថប់បារម្ភច្រើនតែទាក់ទងនឹងអ្វីដែលអាចនឹងកើតឡើង។ នីមួយៗត្រូវការជំហានខុសគ្នា។",
        },
        step: {
          en: "Read the lesson. For each worry today, ask: is this a problem I can act on now, or a \"what if\"? Act on the first kind, and save the second for worry time.",
          km: "អានមេរៀននេះ។ ចំពោះការព្រួយបារម្ភនីមួយៗនៅថ្ងៃនេះ សួរខ្លួនឯងថា៖ តើនេះជាបញ្ហាដែលខ្ញុំអាចដោះស្រាយបានឥឡូវនេះ ឬជា \"ចុះបើ...\"? ដោះស្រាយប្រភេទទីមួយ ហើយទុកប្រភេទទីពីរសម្រាប់ពេលវេលាព្រួយបារម្ភ។",
        },
        links: [{ kind: "lesson", id: "stress-vs-anxiety-difference" }],
      },
      {
        title: { en: "Face one small fear", km: "ប្រឈមមុខនឹងការភ័យខ្លាចតូចមួយ" },
        why: {
          en: "Avoiding things keeps anxiety strong. Facing them in small steps teaches your body it can cope.",
          km: "ការចៀសវាងធ្វើឱ្យការថប់បារម្ភនៅតែខ្លាំង។ ការប្រឈមមុខនឹងវាជាជំហានតូចៗ បង្រៀនរាងកាយរបស់អ្នកថាវាអាចទប់ទល់បាន។",
        },
        step: {
          en: "List things you avoid because of anxiety, from easiest to hardest. Do the easiest one today, and stay with it until the anxiety starts to go down.",
          km: "សរសេរបញ្ជីរឿងដែលអ្នកចៀសវាងដោយសារការថប់បារម្ភ ពីងាយបំផុតទៅពិបាកបំផុត។ ធ្វើរឿងដែលងាយបំផុតនៅថ្ងៃនេះ ហើយនៅជាមួយវារហូតដល់ការថប់បារម្ភចាប់ផ្តើមធូរស្រាល។",
        },
        links: [{ kind: "lesson", id: "how-to-handle-social-anxiety" }],
      },
      {
        title: { en: "The next small step", km: "ជំហានតូចបន្ទាប់" },
        why: {
          en: "Each step you take makes the next one easier.",
          km: "ជំហាននីមួយៗដែលអ្នកបោះ ធ្វើឱ្យជំហានបន្ទាប់កាន់តែងាយស្រួល។",
        },
        step: {
          en: "Do the easiest step again, or try the next one on your list. Notice that the anxiety rises, then falls.",
          km: "ធ្វើជំហានដែលងាយបំផុតម្តងទៀត ឬសាកល្បងជំហានបន្ទាប់ក្នុងបញ្ជីរបស់អ្នក។ កត់សម្គាល់ថាការថប់បារម្ភកើនឡើង ហើយបន្ទាប់មកធ្លាក់ចុះវិញ។",
        },
        withGroup: {
          en: "One small step could be saying hello in the support group.",
          km: "ជំហានតូចមួយអាចជាការនិយាយសួស្តីនៅក្នុងក្រុមគាំទ្រ។",
        },
        links: [{ kind: "lesson", id: "how-to-handle-anxiety-before-an-exam" }, { kind: "group" }],
      },
      {
        title: { en: "Care for your body", km: "ថែរក្សារាងកាយរបស់អ្នក" },
        why: {
          en: "Caffeine, little sleep and no movement can all make anxiety stronger.",
          km: "កាហ្វេអ៊ីន ការគេងតិច និងការមិនសូវធ្វើចលនា អាចធ្វើឱ្យការថប់បារម្ភកាន់តែខ្លាំង។",
        },
        step: {
          en: "Have less coffee, tea or energy drinks today, and take a 10 minute walk.",
          km: "ផឹកកាហ្វេ តែ ឬភេសជ្ជៈប៉ូវកម្លាំងឱ្យតិចជាងមុននៅថ្ងៃនេះ ហើយដើរលេង ១០ នាទី។",
        },
        links: [{ kind: "lesson", id: "better-sleep" }],
      },
      {
        title: { en: "Connect with someone", km: "ភ្ជាប់ទំនាក់ទំនងជាមួយនរណាម្នាក់" },
        why: {
          en: "Anxiety grows in silence. Telling someone you trust often makes it smaller.",
          km: "ការថប់បារម្ភកើនឡើងនៅក្នុងភាពស្ងៀមស្ងាត់។ ការប្រាប់នរណាម្នាក់ដែលអ្នកទុកចិត្ត ច្រើនតែធ្វើឱ្យវាតូចជាងមុន។",
        },
        step: TALK_STEP,
        withGroup: TALK_WITH_GROUP,
        links: [{ kind: "lesson", id: "talk-about-feelings" }, { kind: "group" }],
      },
      CHECK_AGAIN,
    ],
  },
};

export function isProgramId(value: unknown): value is ProgramId {
  return typeof value === "string" && (TWO_WEEK_PROGRAMS as readonly string[]).includes(value);
}

// A running program is one task in Your Plan For Today (daily-plan-store.ts).
// Its item key holds the program and the Cambodia day it started, so no new
// table is needed: "two-week:stress:2026-10-26".
const KEY_PREFIX = "two-week:";

export const programKey = (id: ProgramId, startDay: string) => `${KEY_PREFIX}${id}:${startDay}`;

export function parseProgramKey(key: string): { id: ProgramId; startDay: string } | null {
  if (!key.startsWith(KEY_PREFIX)) return null;
  const [id, startDay] = key.slice(KEY_PREFIX.length).split(":");
  if (!isProgramId(id) || !/^\d{4}-\d{2}-\d{2}$/.test(startDay ?? "")) return null;
  return { id, startDay };
}

const dayNumber = (day: string) => Date.parse(`${day}T00:00:00Z`) / 86_400_000;

/** Day of the program (1 on the start day). Above PROGRAM_LENGTH means finished. */
export function programDay(startDay: string, today: string) {
  return Math.max(1, Math.round(dayNumber(today) - dayNumber(startDay)) + 1);
}

/** Who the program is for, from the newest matching check (checks are newest first). */
export type ProgramFit =
  | { kind: "no_check" }
  | { kind: "old_check"; check: SymptomCheckDto }
  | { kind: "few_signs"; check: SymptomCheckDto }
  | { kind: "strong_signs"; check: SymptomCheckDto }
  | { kind: "fits"; check: SymptomCheckDto };

export function programFit(program: Program, checks: SymptomCheckDto[], today: string): ProgramFit {
  const check = checks.find((item) => program.checks.includes(item.type));
  if (!check) return { kind: "no_check" };
  // A result older than the 2 weeks may not show how the person feels now.
  if (dayNumber(today) - dayNumber(cambodiaDay(Date.parse(check.createdAt))) > PROGRAM_LENGTH) {
    return { kind: "old_check", check };
  }
  if (check.level === "high") return { kind: "strong_signs", check };
  if (!PROGRAM_LEVELS.includes(check.level)) return { kind: "few_signs", check };
  return { kind: "fits", check };
}
