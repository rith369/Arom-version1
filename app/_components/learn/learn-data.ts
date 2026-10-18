export type TopicCategory =
  | "All"
  | "Basics"
  | "Stress"
  | "Anxiety"
  | "Sleep"
  | "Emotions"
  | "Relationships"
  | "Self-esteem"
  | "Burnout";

export type ReferenceItem = {
  id: number;
  citation: string;
  source: string;
  title: string;
  year?: string;
  url?: string;
};

export type QuizOption = {
  id: string;
  text: string;
  kmText?: string;
  isCorrect: boolean;
};

export type LessonSection = {
  id: number;
  sectionNumber: number;
  title: string;
  kmTitle?: string;
  type: "reading" | "quiz" | "reflection" | "coping";
  paragraphs: string[];
  kmParagraphs?: string[];
  keyPoints?: string[];
  kmKeyPoints?: string[];
  quiz?: {
    question: string;
    kmQuestion?: string;
    options: QuizOption[];
    explanation: string;
    kmExplanation?: string;
  };
  reflection?: {
    question: string;
    kmQuestion?: string;
    options: string[];
    kmOptions?: string[];
    feedbackMessage: string;
    kmFeedbackMessage?: string;
  };
  alertBox?: {
    type: "emergency" | "tip";
    text: string;
    kmText?: string;
  };
  actions?: {
    label: string;
    kmLabel?: string;
    actionType: "tips" | "professional" | "exercise";
  }[];
};

export type Lesson = {
  id: string;
  title: string;
  kmTitle?: string;
  subtitle: string;
  kmSubtitle?: string;
  category: TopicCategory;
  duration: string;
  kmDuration?: string;
  difficulty: "Beginner" | "Intermediate";
  kmDifficulty?: string;
  format: string;
  kmFormat?: string;
  isAvailable: boolean;
  description: string;
  kmDescription?: string;
  image: string;
  heroImage?: string;
  badge?: string;
  totalSections: number;
  outcomes: { en: string; km?: string }[];
  sections: LessonSection[];
  references: ReferenceItem[];
};

export type SavedItem = {
  id: string;
  type: "lesson" | "tip" | "podcast";
  title: string;
  kmTitle?: string;
  category: string;
  duration: string;
  progressPercent?: number;
  thumbnail: string;
  href?: string;
  dateSaved?: string;
};

export const TOPIC_CATEGORIES: { id: TopicCategory; label: string; kmLabel: string }[] = [
  { id: "All", label: "All", kmLabel: "ទាំងអស់" },
  { id: "Basics", label: "Basics", kmLabel: "មូលដ្ឋានគ្រឹះ (Basics)" },
  { id: "Stress", label: "Stress", kmLabel: "ភាពតានតឹង (Stress)" },
  { id: "Anxiety", label: "Anxiety", kmLabel: "ការថប់បារម្ភ (Anxiety)" },
  { id: "Sleep", label: "Sleep", kmLabel: "ដំណេក (Sleep)" },
  { id: "Emotions", label: "Emotions", kmLabel: "អារម្មណ៍ (Emotions)" },
  { id: "Relationships", label: "Relationships", kmLabel: "ទំនាក់ទំនង (Relationships)" },
  { id: "Self-esteem", label: "Self-esteem", kmLabel: "តម្លៃខ្លួនឯង (Self-Esteem)" },
  { id: "Burnout", label: "Burnout", kmLabel: "ភាពអស់កម្លាំងចិត្ត (Burnout)" },
];

export const REFERENCES_STRESS: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "WHO",
    title: "WHO, Stress (2025)",
    year: "2025",
    url: "https://www.who.int/news-room/questions-and-answers/item/stress",
  },
  {
    id: 2,
    citation: "[2]",
    source: "MedlinePlus",
    title: "MedlinePlus, Stress and your health",
    url: "https://medlineplus.gov/stress.html",
  },
  {
    id: 3,
    citation: "[3]",
    source: "Mayo Clinic News Network",
    title: "Mayo Clinic News Network, How stress affects your body",
    url: "https://newsnetwork.mayoclinic.org",
  },
  {
    id: 4,
    citation: "[4]",
    source: "ABCT",
    title: "ABCT, Stress fact sheet",
    url: "https://www.abct.org",
  },
  {
    id: 5,
    citation: "[5]",
    source: "NIMH",
    title: "NIMH, I'm So Stressed Out! Fact Sheet",
    url: "https://www.nimh.nih.gov",
  },
  {
    id: 6,
    citation: "[6]",
    source: "Mayo Clinic",
    title: "Mayo Clinic, Stress symptoms",
    url: "https://www.mayoclinic.org",
  },
];

export const LESSON_ABOUT_STRESS: Lesson = {
  id: "learn-about-stress",
  title: "Learn About Stress",
  kmTitle: "ស្វែងយល់ពីភាពតានតឹង (Stress)",
  subtitle: "Stress 101: It's Not Just You",
  kmSubtitle: "មូលដ្ឋានគ្រឹះនៃភាពតានតឹង៖ មិនមែនតែអ្នកនោះទេ",
  category: "Stress",
  duration: "6 min",
  kmDuration: "៦ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Interactive",
  kmFormat: "ការអាន និងអន្តរកម្ម (Reading & Interactive)",
  isAvailable: true,
  image: "/mindguide/stress.png",
  heroImage: "/mindguide/managing-stress-hero.svg",
  description:
    "Stress is your body reacting to pressure. It's totally natural, and everyone gets it. Learn what stress is, why it happens, and small things that truly help.",
  kmDescription:
    "ភាពតានតឹងគឺជាប្រតិកម្មរបស់រាងកាយអ្នកចំពោះសម្ពាធ។ វាជារឿងធម្មជាតិដែលកើតលើមនុស្សគ្រប់គ្នា។ រៀនស្វែងយល់ និងដឹងពីវិធីតូចៗដែលអាចជួយសម្រាលអារម្មណ៍បាន។",
  totalSections: 5,
  outcomes: [
    {
      en: "What stress is and how your body reacts to pressure [1]",
      km: "ស្វែងយល់ថាភាពតានតឹងជាអ្វី និងប្រតិកម្មរាងកាយចំពោះសម្ពាធ [1]",
    },
    {
      en: "When stress can help vs when it wears you down [2, 3]",
      km: "ពេលណាភាពតានតឹងផ្ដល់ប្រយោជន៍ និងពេលណាវាធ្វើឱ្យអ្នកហត់នឿយ [2, 3]",
    },
    {
      en: "Common signs: mood, body aches, sleep & appetite shifts [4]",
      km: "សញ្ញាទូទៅ៖ អារម្មណ៍មួម៉ៅ ឈឺរាងកាយ ពិបាកគេង និងការប្រែប្រួលចំណង់អាហារ [4]",
    },
    {
      en: "Small things that count: 1-minute breathing, walking, thought shifts",
      km: "សកម្មភាពតូចៗដែលមានប្រយោជន៍៖ ការហាត់ដកដង្ហើម ១ នាទី ការដើរលំហែ និងការកែប្រែគំនិត",
    },
    {
      en: "When to get backup & connect with a professional [5]",
      km: "ដឹងពីពេលវេលាដែលត្រូវស្វែងរកជំនួយពីអ្នកជំនាញ (Professional) [5]",
    },
    {
      en: "Emergency alert: knowing when symptoms require immediate medical help [6]",
      km: "សញ្ញាអាសន្ន៖ ដឹងពីស្ថានភាពដែលត្រូវការជំនួយសង្គ្រោះបន្ទាន់ភ្លាមៗ [6]",
    },
  ],
  references: REFERENCES_STRESS,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "Stress 101: It's Not Just You",
      kmTitle: "មូលដ្ឋានគ្រឹះនៃភាពតានតឹង៖ មិនមែនតែអ្នកនោះទេ",
      type: "reading",
      paragraphs: [
        "Stress is your body reacting to pressure. It's totally natural, and everyone gets it. [1]",
        "The good news: A little stress can actually help. It gets you focused before an exam or a deadline. [2]",
        "The not-so-fun part: When it sticks around too long, it can wear you down. [2] Your brain hits the alarm and releases hormones, so your heart races and your energy spikes. [3]",
      ],
      kmParagraphs: [
        "ភាពតានតឹង (Stress) គឺជាប្រតិកម្មធម្មជាតិរបស់រាងកាយអ្នកចំពោះសម្ពាធ។ មនុស្សគ្រប់គ្នាតែងតែជួបប្រទះវាជារឿយៗ។ [1]",
        "ដំណឹងល្អ៖ ភាពតានតឹងបន្តិចបន្តួចពិតជាអាចផ្ដល់ផលល្អ ដោយជួយឱ្យអ្នកផ្ដោតអារម្មណ៍បានល្អមុនពេលប្រឡង ឬដល់កាលកំណត់ការងារសំខាន់។ [2]",
        "ផ្នែកដែលមិនសូវល្អ៖ នៅពេលដែលវានៅជាប់យូរពេក វាអាចធ្វើឱ្យអ្នកទ្រុឌទ្រោម និងហត់នឿយ។ [2] ខួរក្បាលរបស់អ្នកនឹងបញ្ជូនសញ្ញាអាសន្ន ព្រមទាំងបញ្ចេញអ័រម៉ូន ធ្វើឱ្យបេះដូងលោតញាប់ និងថាមពលកើនឡើងភ្លាមៗ។ [3]",
      ],
      keyPoints: [
        "Stress is a natural biological response to pressure [1].",
        "Short-term stress sharpens focus and alertness [2].",
        "Long-term stress triggers prolonged alarms that drain your body [3].",
      ],
      kmKeyPoints: [
        "ភាពតានតឹង (Stress) គឺជាប្រតិកម្មជីវសាស្ត្រធម្មជាតិរបស់រាងកាយចំពោះសម្ពាធ [1]។",
        "ភាពតានតឹងរយៈពេលខ្លីជួយបង្កើនការផ្ដោតអារម្មណ៍ និងការប្រុងប្រយ័ត្ន [2]។",
        "ភាពតានតឹងរ៉ាំរ៉ៃបញ្ចេញអ័រម៉ូនអូសបន្លាយ ដែលធ្វើឱ្យរាងកាយអស់ថាមពល [3]។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "What You Might Notice",
      kmTitle: "អ្វីដែលអ្នកអាចសម្គាល់ឃើញ",
      type: "reading",
      paragraphs: [
        "When pressure builds up and sticks around, your mind and body send clear signals. You might notice [4]:",
        "• Feeling cranky, overwhelmed, or unable to focus\n• Headaches, muscle tension, or stomach aches\n• Bad sleep, trouble falling asleep, or eating way more or less than usual [4]",
        "Notice these signs with kindness. Your nervous system is communicating with you, not working against you.",
      ],
      kmParagraphs: [
        "នៅពេលដែលសម្ពាធកើនឡើង និងនៅជាប់យូរ រាងកាយ និងចិត្តរបស់អ្នកនឹងបញ្ជូនសញ្ញាយ៉ាងច្បាស់។ អ្នកអាចសម្គាល់ឃើញ [4]៖",
        "• មានអារម្មណ៍មួម៉ៅ ធុញថប់ ឬមិនអាចផ្ដោតអារម្មណ៍បាន\n• ឈឺក្បាល តឹងសាច់ដុំ ឬឈឺពោះ\n• គេងមិនសូវលក់ ឬញ៉ាំច្រើនជ្រុល ឬតិចជ្រុលខុសពីធម្មតា [4]",
        "សម្គាល់សញ្ញាទាំងនេះដោយក្តីមេត្តាចំពោះខ្លួនឯង។ ប្រព័ន្ធប្រសាទរបស់អ្នកគ្រាន់តែផ្ដល់សញ្ញាព្រមានប៉ុណ្ណោះ។",
      ],
      alertBox: {
        type: "emergency",
        text: "Chest pain and trouble breathing? That can be a heart problem, not just stress. Get emergency help right away. [6]",
        kmText:
          "ឈឺទ្រូង និងពិបាកដកដង្ហើម? នោះអាចជាបញ្ហាបេះដូង មិនមែនគ្រាន់តែជាភាពតានតឹងនោះទេ។ សូមស្វែងរកជំនួយសង្គ្រោះបន្ទាន់ភ្លាមៗ។ [6]",
      },
      keyPoints: [
        "Stress shows up emotionally (cranky, unfocused) and physically (aches, poor sleep) [4].",
        "Everyone experiences symptoms in different combinations.",
        "Chest pain or acute breathing trouble requires immediate medical care [6].",
      ],
      kmKeyPoints: [
        "ភាពតានតឹងបង្ហាញឡើងតាមរយៈអារម្មណ៍ (មួម៉ៅ, ខ្វះការផ្ដោត) និងរាងកាយ (ការឈឺចុកចាប់, ពិបាកគេង) [4]។",
        "មនុស្សម្នាក់ៗជួបប្រទះរោគសញ្ញាក្នុងទម្រង់ខុសៗគ្នា។",
        "ការឈឺទ្រូង ឬពិបាកដកដង្ហើមធ្ងន់ធ្ងរ ត្រូវការការពិនិត្យព្យាបាលបន្ទាន់ [6]។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Quick Question",
      kmTitle: "សំណួររហ័ស",
      type: "quiz",
      paragraphs: [
        "Let's pause and test your understanding of what causes pressure on your body and mind.",
      ],
      kmParagraphs: [
        "សូមផ្អាកបន្តិច ហើយសាកល្បងការយល់ដឹងរបស់អ្នកអំពីមូលហេតុនៃសម្ពាធ។",
      ],
      quiz: {
        question: "Which situation can cause stress?",
        kmQuestion: "តើស្ថានភាពណាខ្លះដែលអាចបង្កឱ្យមានភាពតានតឹង?",
        options: [
          {
            id: "rest",
            text: "Getting enough rest",
            kmText: "ការសម្រាកឱ្យបានគ្រប់គ្រាន់",
            isCorrect: false,
          },
          {
            id: "responsibilities",
            text: "Having too many responsibilities",
            kmText: "ការមានការទទួលខុសត្រូវច្រើនលើសលប់",
            isCorrect: true,
          },
          {
            id: "relaxing",
            text: "Relaxing with a book",
            kmText: "ការសម្រាកអានសៀវភៅ",
            isCorrect: false,
          },
          {
            id: "break",
            text: "Taking a mindful break",
            kmText: "ការឈប់សម្រាកមួយភ្លែត",
            isCorrect: false,
          },
        ],
        explanation:
          "Correct! Having too many responsibilities can increase pressure on your capacity, leading to stress. Rest, relaxing, and taking breaks help restore balance.",
        kmExplanation:
          "ត្រឹមត្រូវ! ការមានការទទួលខុសត្រូវច្រើនលើសលប់អាចបង្កើនសម្ពាធដល់សមត្ថភាពរបស់អ្នក ដែលនាំឱ្យកើតភាពតានតឹង។ ការសម្រាក និងការឈប់លំហែជួយស្តារលំនឹងឡើងវិញ។",
      },
      keyPoints: [
        "Overload happens when demands exceed our perceived resources.",
        "Recognizing triggers empowers you to prioritize and set boundaries.",
      ],
      kmKeyPoints: [
        "សម្ពាធកើតឡើងនៅពេលការទទួលខុសត្រូវច្រើនហួសកម្រិត។",
        "ការស្គាល់កត្តាជំរុញជួយឱ្យអ្នកចេះកំណត់ព្រំដែន និងអាទិភាព។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "Reflection: Check In With Yourself",
      kmTitle: "ការឆ្លុះបញ្ចាំង៖ ពិនិត្យមើលខ្លួនឯង (Check-in)",
      type: "reflection",
      paragraphs: [
        "Take a moment to check in with how your body and mind are feeling right now.",
      ],
      kmParagraphs: [
        "ឆ្លៀតពេលបន្តិចដើម្បីពិនិត្យមើលអារម្មណ៍ និងរាងកាយរបស់អ្នកនៅពេលនេះ។",
      ],
      reflection: {
        question: "Have you experienced feeling stressed or overwhelmed recently?",
        kmQuestion: "តើថ្មីៗនេះអ្នកធ្លាប់មានអារម្មណ៍តានតឹង ឬធុញថប់លើសលប់ដែរឬទេ?",
        options: ["Often", "Sometimes", "Rarely", "Not sure"],
        kmOptions: ["ញឹកញាប់", "ជួនកាល", "កម្រ", "មិនប្រាកដ"],
        feedbackMessage:
          "Thank you for acknowledging where you are right now. Naming what you feel is the foundation of regaining calm and finding what works for you.",
        kmFeedbackMessage:
          "អរគុណសម្រាប់ការបើកចិត្តទទួលស្គាល់អារម្មណ៍ពិតរបស់អ្នក។ ការដឹងច្បាស់ពីអារម្មណ៍ខ្លួនឯងគឺជាមូលដ្ឋានគ្រឹះក្នុងការស្តារភាពស្ងប់ស្ងាត់ឡើងវិញ។",
      },
      keyPoints: [
        "Self-awareness is not self-criticism, notice without judgment.",
        "Tracking your stress frequency helps you take small restorative steps early.",
      ],
      kmKeyPoints: [
        "ការយល់ដឹងពីខ្លួនឯងដោយមិនវិនិច្ឆ័យទោស គឺជាការចាប់ផ្តើមនៃភាពស្ងប់។",
        "ការតាមដានកម្រិតភាពតានតឹងជួយឱ្យអ្នកចាត់វិធានការថែទាំខ្លួនឯងបានទាន់ពេល។",
      ],
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "What Helps & Getting Backup",
      kmTitle: "វិធីសាស្ត្រជួយសម្រាល និងការស្វែងរកជំនួយ",
      type: "coping",
      paragraphs: [
        "What helps? Small things count:",
        "• Breathe slowly for 1 minute\n• Go for a short walk\n• Text someone you trust\n• Rewrite the scary thought",
        "(Tap Tips for quick how-tos on daily coping.)",
        "Get backup if stress won't leave, messes up your day, or makes you avoid stuff. [5] Asking for help is a smart move, not a weak one. Tap Match Me Now to find a professional.",
        "Key takeaway: Stress is normal. You don't need to erase it, just learn the tools. You've got this.",
      ],
      kmParagraphs: [
        "តើអ្វីខ្លះដែលអាចជួយបាន? សកម្មភាពតូចៗពិតជាមានប្រយោជន៍៖",
        "• ដកដង្ហើមវែងៗយឺតៗរយៈពេល ១ នាទី\n• ដើរលំហែរយៈពេលខ្លី\n• ផ្ញើសារ ឬជជែកជាមួយមនុស្សដែលអ្នកទុកចិត្ត\n• កែសម្រួលការគិតដែលគួរឱ្យបារម្ភឡើងវិញ",
        "(ចុចលើ «គន្លឹះ» ដើម្បីស្វែងយល់ពីវិធីអនុវត្តជាក់ស្តែងប្រចាំថ្ងៃ។)",
        "ស្វែងរកជំនួយបន្ថែម ប្រសិនបើភាពតានតឹងមិនព្រមបាត់ទៅណា រំខានដល់ការរស់នៅប្រចាំថ្ងៃ ឬធ្វើឱ្យអ្នកចង់គេចវេះពីកិច្ចការ។ [5] ការសុំជំនួយគឺជាការសម្រេចចិត្តដ៏ឆ្លាតវៃ មិនមែនជាភាពទន់ខ្សោយនោះទេ។ ចុច «ស្វែងរកអ្នកជំនាញ» ដើម្បីជួបអ្នកប្រឹក្សាផ្លូវចិត្ត។",
        "ចំណុចគន្លឹះសំខាន់៖ ភាពតានតឹងគឺជារឿងធម្មតា។ អ្នកមិនចាំបាច់លុបបំបាត់វាចោលទាំងអស់នោះទេ គ្រាន់តែរៀនប្រើប្រាស់វិធីសាស្ត្រជំនួយ។ អ្នកពិតជាអាចឆ្លងកាត់វាបាន!",
      ],
      actions: [
        { label: "Practice 1-Minute Calm Breathing", kmLabel: "ហាត់ដកដង្ហើមស្ងប់ចិត្ត ១ នាទី (Breathing)", actionType: "exercise" },
        { label: "Explore Mental Health Tips", kmLabel: "ស្វែងយល់គន្លឹះថែទាំចិត្ត (Tips)", actionType: "tips" },
        { label: "Find a Professional (Match Me)", kmLabel: "ស្វែងរកអ្នកជំនាញចិត្តសាស្ត្រ (Match Me)", actionType: "professional" },
      ],
      keyPoints: [
        "Small, consistent physical actions signal your nervous system to downshift.",
        "Asking for support is a sign of resilience and self-care [5].",
        "You do not need to eliminate all stress, just learn the tools.",
      ],
      kmKeyPoints: [
        "សកម្មភាពតូចៗជួយឱ្យប្រព័ន្ធប្រសាទរបស់អ្នកធូរស្រាល។",
        "ការស្វែងរកជំនួយជាភាពរឹងមាំ និងការថែទាំខ្លួនឯង [5]។",
        "អ្នកមិនចាំបាច់លុបបំបាត់ភាពតានតឹងទេ គ្រាន់តែរៀនប្រើឧបករណ៍ជំនួយ។",
      ],
    },
  ],
};

export const REFERENCES_ANXIETY: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "WHO",
    title: "WHO, Anxiety disorders fact sheet (2026)",
    year: "2026",
    url: "https://www.who.int/news-room/fact-sheets/detail/anxiety-disorders",
  },
  {
    id: 2,
    citation: "[2]",
    source: "NIMH",
    title: "NIMH, Anxiety Disorders",
    url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
  },
  {
    id: 3,
    citation: "[3]",
    source: "NHS",
    title: "NHS, Anxiety, fear and panic",
    url: "https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/anxiety-fear-panic/",
  },
  {
    id: 4,
    citation: "[4]",
    source: "NIMH",
    title: "NIMH, Generalized Anxiety Disorder: What You Need to Know",
    url: "https://www.nimh.nih.gov/health/publications/generalized-anxiety-disorder-gad",
  },
  {
    id: 5,
    citation: "[5]",
    source: "NHS",
    title: "NHS, Panic disorder",
    url: "https://www.nhs.uk/mental-health/conditions/panic-disorder/",
  },
  {
    id: 6,
    citation: "[6]",
    source: "NHS",
    title: "NHS, Breathing exercises for stress",
    url: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/",
  },
  {
    id: 7,
    citation: "[7]",
    source: "University of Rochester Medical Center",
    title: "URMC, 5 4 3 2 1 Coping Technique for Anxiety (2018)",
    year: "2018",
    url: "https://www.urmc.rochester.edu/behavioral-health-partners/bhp-blog/april-2018/5-4-3-2-1-coping-technique-for-anxiety",
  },
  {
    id: 8,
    citation: "[8]",
    source: "NHS",
    title: "NHS, Heart attack",
    url: "https://www.nhs.uk/conditions/heart-attack/",
  },
];

export const LESSON_UNDERSTANDING_ANXIETY: Lesson = {
  id: "understanding-anxiety",
  title: "Understanding Anxiety",
  kmTitle: "ស្វែងយល់ពីការថប់បារម្ភ (Anxiety)",
  subtitle: "Anxiety 101: Your Body's Alarm",
  kmSubtitle: "មូលដ្ឋានគ្រឹះនៃការថប់បារម្ភ៖ សញ្ញាព្រមានរបស់រាងកាយ",
  category: "Anxiety",
  duration: "7 min",
  kmDuration: "៧ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Interactive",
  kmFormat: "ការអាន និងអន្តរកម្ម (Reading & Interactive)",
  isAvailable: true,
  image: "/mindguide/icon-10.svg",
  // Photo by Jared Rice on Unsplash (Unsplash License), cropped.
  heroImage: "/mindguide/understanding-anxiety-hero.jpg",
  description:
    "Everyone feels anxious sometimes. Learn what anxiety is, how it shows up in your mind and body, and simple tools that help you feel steady again.",
  kmDescription:
    "មនុស្សគ្រប់គ្នាតែងមានអារម្មណ៍ថប់បារម្ភម្តងម្កាល។ ស្វែងយល់ថាការថប់បារម្ភជាអ្វី វាបង្ហាញខ្លួនក្នុងចិត្ត និងរាងកាយយ៉ាងដូចម្តេច និងវិធីសាមញ្ញៗដែលជួយឱ្យអ្នកមានអារម្មណ៍នឹងនរឡើងវិញ។",
  totalSections: 5,
  outcomes: [
    {
      en: "What anxiety is and why your body sounds the alarm [1, 2]",
      km: "ស្វែងយល់ថាការថប់បារម្ភជាអ្វី និងហេតុអ្វីរាងកាយបញ្ចេញសញ្ញាព្រមាន [1, 2]",
    },
    {
      en: "When normal worry becomes something more [2, 4]",
      km: "ពេលណាការព្រួយបារម្ភធម្មតា ក្លាយជាបញ្ហាធំជាងនេះ [2, 4]",
    },
    {
      en: "Common signs in your mind and body, including panic attacks [3, 5]",
      km: "សញ្ញាទូទៅក្នុងចិត្ត និងរាងកាយ រួមទាំងការភ័យស្លន់ស្លោភ្លាមៗ (Panic attack) [3, 5]",
    },
    {
      en: "Two quick tools: slow breathing and the 5 4 3 2 1 grounding method [6, 7]",
      km: "វិធីរហ័សពីរ៖ ការដកដង្ហើមយឺតៗ និងវិធីទាញចិត្តមកបច្ចុប្បន្ន ៥ ៤ ៣ ២ ១ (Grounding) [6, 7]",
    },
    {
      en: "When to get support from a professional [1, 4]",
      km: "ដឹងពីពេលវេលាដែលត្រូវស្វែងរកជំនួយពីអ្នកជំនាញ (Professional) [1, 4]",
    },
    {
      en: "Emergency alert: chest pain that needs help right away [8]",
      km: "សញ្ញាអាសន្ន៖ ការឈឺទ្រូងដែលត្រូវការជំនួយភ្លាមៗ [8]",
    },
  ],
  references: REFERENCES_ANXIETY,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "Anxiety 101: Your Body's Alarm",
      kmTitle: "មូលដ្ឋានគ្រឹះនៃការថប់បារម្ភ៖ សញ្ញាព្រមានរបស់រាងកាយ",
      type: "reading",
      paragraphs: [
        "Everyone feels anxious sometimes. Worry about health, money, school, work or family is a normal part of life. [1, 2]",
        "Anxiety is your body's alarm. When your brain thinks something might go wrong, it gets you ready to act. A little of this can help you prepare for an exam or a hard conversation.",
        "Sometimes the alarm keeps ringing. The worry does not go away, shows up in many situations, and can get worse over time. [2] That is when anxiety needs more care.",
        "You are not alone. In 2023, about 470 million people around the world lived with an anxiety disorder, making it the most common mental health condition. [1]",
      ],
      kmParagraphs: [
        "មនុស្សគ្រប់គ្នាតែងមានអារម្មណ៍ថប់បារម្ភម្តងម្កាល។ ការព្រួយបារម្ភអំពីសុខភាព លុយកាក់ ការសិក្សា ការងារ ឬគ្រួសារ គឺជាផ្នែកធម្មតានៃជីវិត។ [1, 2]",
        "ការថប់បារម្ភ (Anxiety) គឺជាសញ្ញាព្រមានរបស់រាងកាយអ្នក។ នៅពេលខួរក្បាលគិតថាអាចមានរឿងមិនល្អកើតឡើង វាត្រៀមខ្លួនអ្នកឱ្យរួចរាល់។ ការថប់បារម្ភបន្តិចបន្តួចអាចជួយអ្នកត្រៀមខ្លួនសម្រាប់ការប្រឡង ឬការនិយាយរឿងពិបាកៗ។",
        "ពេលខ្លះ សញ្ញាព្រមាននេះមិនព្រមឈប់។ ការព្រួយបារម្ភមិនបាត់ទៅវិញ កើតឡើងក្នុងស្ថានភាពជាច្រើន ហើយអាចកាន់តែធ្ងន់ទៅៗ។ [2] នោះហើយជាពេលដែលការថប់បារម្ភត្រូវការការថែទាំបន្ថែម។",
        "អ្នកមិននៅម្នាក់ឯងទេ។ នៅឆ្នាំ ២០២៣ មនុស្សប្រមាណ ៤៧០ លាននាក់ទូទាំងពិភពលោក រស់នៅជាមួយជំងឺថប់បារម្ភ (Anxiety disorder) ដែលជាបញ្ហាសុខភាពផ្លូវចិត្តទូទៅបំផុត។ [1]",
      ],
      keyPoints: [
        "Feeling anxious sometimes is normal and human [1, 2].",
        "Anxiety is an alarm that helps you prepare for challenges.",
        "When worry stays, spreads and grows, it needs more care [2].",
      ],
      kmKeyPoints: [
        "ការមានអារម្មណ៍ថប់បារម្ភម្តងម្កាល គឺជារឿងធម្មតារបស់មនុស្ស [1, 2]។",
        "ការថប់បារម្ភជាសញ្ញាព្រមានដែលជួយអ្នកត្រៀមខ្លួនប្រឈមនឹងបញ្ហា។",
        "នៅពេលការព្រួយបារម្ភនៅជាប់ រីករាលដាល និងកាន់តែធ្ងន់ វាត្រូវការការថែទាំបន្ថែម [2]។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "What Anxiety Can Feel Like",
      kmTitle: "ការថប់បារម្ភអាចមានអារម្មណ៍បែបណា",
      type: "reading",
      paragraphs: [
        "Anxiety shows up in both your mind and your body. You might notice [3, 4]:",
        "• Worry that is hard to control or switch off\n• Feeling tense, restless or on edge\n• Trouble focusing or falling asleep\n• A racing heart, sweating or shaking\n• Stomach aches, headaches or feeling out of breath",
        "Some people have panic attacks: a sudden rush of strong fear with a racing heart, dizziness and short breath. They feel frightening, but they are not dangerous, and most pass within 5 to 20 minutes. [5]",
        "These signs are your alarm system working too hard, not a sign that you are weak.",
      ],
      kmParagraphs: [
        "ការថប់បារម្ភបង្ហាញខ្លួនទាំងក្នុងចិត្ត និងរាងកាយ។ អ្នកអាចសម្គាល់ឃើញ [3, 4]៖",
        "• ការព្រួយបារម្ភដែលពិបាកគ្រប់គ្រង ឬពិបាកបញ្ឈប់\n• មានអារម្មណ៍តឹងសរសៃ អង្គុយមិនស្ងៀម ឬភ័យញញើត\n• ពិបាកផ្តោតអារម្មណ៍ ឬពិបាកចូលគេង\n• បេះដូងលោតញាប់ បែកញើស ឬញ័រខ្លួន\n• ឈឺពោះ ឈឺក្បាល ឬដកដង្ហើមមិនទាន់",
        "មនុស្សខ្លះជួបការភ័យស្លន់ស្លោភ្លាមៗ (Panic attack)៖ ការភ័យខ្លាចខ្លាំងកើតឡើងភ្លាមៗ ជាមួយនឹងបេះដូងលោតញាប់ វិលមុខ និងដកដង្ហើមខ្លី។ វាគួរឱ្យភ័យខ្លាច ប៉ុន្តែមិនមានគ្រោះថ្នាក់ទេ ហើយភាគច្រើនបាត់ទៅវិញក្នុងរយៈពេល ៥ ទៅ ២០ នាទី។ [5]",
        "សញ្ញាទាំងនេះបង្ហាញថាប្រព័ន្ធព្រមានរបស់អ្នកកំពុងធ្វើការខ្លាំងពេក មិនមែនមានន័យថាអ្នកទន់ខ្សោយនោះទេ។",
      ],
      alertBox: {
        type: "emergency",
        text: "Chest pain that feels tight or squeezing, pain that spreads to your arm, neck or jaw, or very hard breathing can be a heart attack. Get emergency help right away, and do not drive yourself. [8]",
        kmText:
          "ការឈឺទ្រូងដូចមានអ្វីច្របាច់ ឬសង្កត់ ការឈឺដែលរាលដាលទៅដៃ ក ឬថ្គាម ឬការពិបាកដកដង្ហើមខ្លាំង អាចជាសញ្ញាគាំងបេះដូង (Heart attack)។ សូមស្វែងរកជំនួយសង្គ្រោះបន្ទាន់ភ្លាមៗ ហើយកុំបើកបរដោយខ្លួនឯង។ [8]",
      },
      keyPoints: [
        "Anxiety affects thoughts, feelings and the body [3, 4].",
        "Panic attacks are frightening but not dangerous, and they pass [5].",
        "Squeezing chest pain or severe breathing trouble needs emergency care [8].",
      ],
      kmKeyPoints: [
        "ការថប់បារម្ភប៉ះពាល់ដល់គំនិត អារម្មណ៍ និងរាងកាយ [3, 4]។",
        "ការភ័យស្លន់ស្លោភ្លាមៗគួរឱ្យភ័យខ្លាច ប៉ុន្តែមិនមានគ្រោះថ្នាក់ ហើយវានឹងបាត់ទៅវិញ [5]។",
        "ការឈឺទ្រូងដូចមានអ្វីច្របាច់ ឬពិបាកដកដង្ហើមខ្លាំង ត្រូវការការសង្គ្រោះបន្ទាន់ [8]។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Quick Question",
      kmTitle: "សំណួររហ័ស",
      type: "quiz",
      paragraphs: [
        "Let's pause and check what you have learned about calming a panic attack.",
      ],
      kmParagraphs: [
        "សូមផ្អាកបន្តិច ហើយពិនិត្យមើលអ្វីដែលអ្នកបានរៀនអំពីការធ្វើឱ្យចិត្តស្ងប់ពេលភ័យស្លន់ស្លោភ្លាមៗ។",
      ],
      quiz: {
        question: "During a panic attack, what can help?",
        kmQuestion: "ពេលកំពុងភ័យស្លន់ស្លោភ្លាមៗ តើអ្វីអាចជួយបាន?",
        options: [
          {
            id: "hold-breath",
            text: "Holding your breath until it stops",
            kmText: "ទប់ដង្ហើមរហូតដល់វាឈប់",
            isCorrect: false,
          },
          {
            id: "breathe-slowly",
            text: "Breathing slowly and reminding yourself it will pass",
            kmText: "ដកដង្ហើមយឺតៗ ហើយរំលឹកខ្លួនឯងថាវានឹងកន្លងផុតទៅ",
            isCorrect: true,
          },
          {
            id: "alcohol",
            text: "Drinking alcohol to calm down",
            kmText: "ផឹកស្រាដើម្បីឱ្យស្ងប់ចិត្ត",
            isCorrect: false,
          },
          {
            id: "avoid",
            text: "Avoiding every place where it has happened",
            kmText: "គេចចេញពីគ្រប់កន្លែងដែលវាធ្លាប់កើតឡើង",
            isCorrect: false,
          },
        ],
        explanation:
          "Correct! Breathing slowly and deeply, and reminding yourself the attack will pass, helps your body settle. [5] Alcohol and avoiding places can make anxiety worse over time. [3]",
        kmExplanation:
          "ត្រឹមត្រូវ! ការដកដង្ហើមយឺតៗ និងជ្រៅ ព្រមទាំងរំលឹកខ្លួនឯងថាវានឹងកន្លងផុតទៅ ជួយឱ្យរាងកាយស្ងប់វិញ។ [5] ការផឹកស្រា និងការគេចចេញពីកន្លែងនានា អាចធ្វើឱ្យការថប់បារម្ភកាន់តែធ្ងន់ទៅៗ។ [3]",
      },
      keyPoints: [
        "Slow, deep breaths tell your body it is safe [5].",
        "Avoidance and alcohol bring short relief but keep anxiety going [3].",
      ],
      kmKeyPoints: [
        "ការដកដង្ហើមយឺតៗ និងជ្រៅ ប្រាប់រាងកាយថាអ្នកមានសុវត្ថិភាព [5]។",
        "ការគេចវេះ និងការផឹកស្រា ធ្វើឱ្យធូរស្រាលតែមួយភ្លែត ប៉ុន្តែធ្វើឱ្យការថប់បារម្ភនៅតែបន្ត [3]។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "Reflection: Check In With Yourself",
      kmTitle: "ការឆ្លុះបញ្ចាំង៖ ពិនិត្យមើលខ្លួនឯង (Check in)",
      type: "reflection",
      paragraphs: [
        "Take a moment to notice how worry has been showing up for you lately.",
      ],
      kmParagraphs: [
        "ឆ្លៀតពេលបន្តិច ដើម្បីសម្គាល់មើលថាការព្រួយបារម្ភបានកើតឡើងចំពោះអ្នកយ៉ាងណាកន្លងមក។",
      ],
      reflection: {
        question: "Has worry made it hard to relax or focus in the past two weeks?",
        kmQuestion: "ក្នុងរយៈពេលពីរសប្តាហ៍កន្លងមក តើការព្រួយបារម្ភធ្វើឱ្យអ្នកពិបាកសម្រាក ឬពិបាកផ្តោតអារម្មណ៍ដែរឬទេ?",
        options: ["Often", "Sometimes", "Rarely", "Not sure"],
        kmOptions: ["ញឹកញាប់", "ជួនកាល", "កម្រ", "មិនប្រាកដ"],
        feedbackMessage:
          "Thank you for checking in with yourself. Noticing your worry, without judging it, is the first step to feeling calmer.",
        kmFeedbackMessage:
          "អរគុណដែលបានពិនិត្យមើលខ្លួនឯង។ ការសម្គាល់ឃើញការព្រួយបារម្ភរបស់អ្នក ដោយមិនវិនិច្ឆ័យ គឺជាជំហានដំបូងឆ្ពោះទៅរកភាពស្ងប់ចិត្ត។",
      },
      keyPoints: [
        "Noticing worry is not the same as judging yourself.",
        "Checking in often helps you use your tools early.",
      ],
      kmKeyPoints: [
        "ការសម្គាល់ឃើញការព្រួយបារម្ភ មិនមែនជាការវិនិច្ឆ័យខ្លួនឯងនោះទេ។",
        "ការពិនិត្យមើលខ្លួនឯងជាញឹកញាប់ ជួយឱ្យអ្នកប្រើវិធីជួយសម្រាលបានទាន់ពេល។",
      ],
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "What Helps & Getting Support",
      kmTitle: "វិធីជួយសម្រាល និងការស្វែងរកជំនួយ",
      type: "coping",
      paragraphs: [
        "Two tools you can use anywhere:",
        "• Slow breathing: breathe in gently through your nose while counting 1 to 5, then breathe out through your mouth counting 1 to 5. Keep going for a few minutes. [6]\n• 5 4 3 2 1 grounding: name 5 things you see, 4 things you can touch, 3 things you hear, 2 things you smell and 1 thing you taste. [7]",
        "Small daily habits help too: move your body, keep regular sleep and meals, cut down on caffeine and alcohol, and talk to someone you trust. [1, 3, 4]",
        "Get support if worry happens most days, is hard to control, or gets in the way of school, work or family. [1, 4] Talking therapy such as cognitive behavioural therapy (CBT) works well for anxiety. [1, 4] Tap Match Me With A Professional below to get started.",
        "If you ever think about hurting yourself, get help right away. Open Profile and tap Get help now.",
        "Key takeaway: Anxiety is a normal alarm. You can learn to turn the volume down, one breath at a time.",
      ],
      kmParagraphs: [
        "វិធីពីរយ៉ាងដែលអ្នកអាចប្រើបានគ្រប់ទីកន្លែង៖",
        "• ការដកដង្ហើមយឺតៗ៖ ដកដង្ហើមចូលតាមច្រមុះថ្នមៗ ដោយរាប់ពី ១ ដល់ ៥ បន្ទាប់មកដកដង្ហើមចេញតាមមាត់ ដោយរាប់ពី ១ ដល់ ៥។ ធ្វើបែបនេះបន្តពីរបីនាទី។ [6]\n• វិធីទាញចិត្តមកបច្ចុប្បន្ន ៥ ៤ ៣ ២ ១ (Grounding)៖ ប្រាប់ឈ្មោះរបស់ ៥ ដែលអ្នកមើលឃើញ ៤ ដែលអ្នកអាចប៉ះបាន ៣ ដែលអ្នកឮ ២ ដែលអ្នកធុំក្លិន និង ១ ដែលអ្នកភ្លក់រសជាតិ។ [7]",
        "ទម្លាប់តូចៗប្រចាំថ្ងៃក៏ជួយបានដែរ៖ ធ្វើចលនារាងកាយ គេង និងញ៉ាំអាហារឱ្យទៀងពេល កាត់បន្ថយកាហ្វេអ៊ីន និងស្រា ហើយនិយាយជាមួយមនុស្សដែលអ្នកទុកចិត្ត។ [1, 3, 4]",
        "ស្វែងរកជំនួយ ប្រសិនបើការព្រួយបារម្ភកើតឡើងស្ទើររាល់ថ្ងៃ ពិបាកគ្រប់គ្រង ឬរំខានដល់ការសិក្សា ការងារ ឬគ្រួសារ។ [1, 4] ការព្យាបាលដោយការនិយាយ ដូចជាការព្យាបាលដោយការយល់ដឹង និងអាកប្បកិរិយា (CBT) មានប្រសិទ្ធភាពល្អសម្រាប់ការថប់បារម្ភ។ [1, 4] ចុច «ស្វែងរកអ្នកជំនាញ (Match Me)» ខាងក្រោម ដើម្បីចាប់ផ្តើម។",
        "ប្រសិនបើអ្នកធ្លាប់គិតចង់ធ្វើបាបខ្លួនឯង សូមស្វែងរកជំនួយភ្លាមៗ។ បើកទំព័រប្រវត្តិរូប (Profile) ហើយចុច «ជំនួយបន្ទាន់ (Get help now)»។",
        "ចំណុចគន្លឹះសំខាន់៖ ការថប់បារម្ភគឺជាសញ្ញាព្រមានធម្មតា។ អ្នកអាចរៀនបន្ថយកម្រិតរបស់វាបាន ម្តងមួយដង្ហើមៗ។",
      ],
      actions: [
        { label: "Practice Calm Breathing", kmLabel: "ហាត់ដកដង្ហើមស្ងប់ចិត្ត (Breathing)", actionType: "exercise" },
        { label: "Explore Mental Health Tips", kmLabel: "ស្វែងយល់គន្លឹះថែទាំចិត្ត (Tips)", actionType: "tips" },
        { label: "Find a Professional (Match Me)", kmLabel: "ស្វែងរកអ្នកជំនាញចិត្តសាស្ត្រ (Match Me)", actionType: "professional" },
      ],
      keyPoints: [
        "Slow breathing and grounding calm your body in minutes [6, 7].",
        "Talking therapy such as CBT is well proven for anxiety [1, 4].",
        "Asking for help early is a strong and caring choice.",
      ],
      kmKeyPoints: [
        "ការដកដង្ហើមយឺតៗ និងការទាញចិត្តមកបច្ចុប្បន្ន ជួយឱ្យរាងកាយស្ងប់ក្នុងរយៈពេលប៉ុន្មាននាទី [6, 7]។",
        "ការព្យាបាលដោយការនិយាយ ដូចជា CBT ត្រូវបានបញ្ជាក់ថាមានប្រសិទ្ធភាពសម្រាប់ការថប់បារម្ភ [1, 4]។",
        "ការសុំជំនួយឱ្យបានឆាប់ គឺជាជម្រើសដ៏រឹងមាំ និងការថែទាំខ្លួនឯង។",
      ],
    },
  ],
};

export const REFERENCES_MENTAL_HEALTH: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "WHO",
    title: "WHO, Mental health fact sheet (2026)",
    year: "2026",
    url: "https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response",
  },
  {
    id: 2,
    citation: "[2]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia, Mental health",
    url: "https://www.unicef.org/cambodia/mental-health",
  },
  {
    id: 3,
    citation: "[3]",
    source: "WHO",
    title: "WHO, Self care for health and wellbeing",
    url: "https://www.who.int/health-topics/self-care",
  },
];

export const LESSON_WHAT_IS_MENTAL_HEALTH: Lesson = {
  id: "what-is-mental-health",
  title: "What Is Mental Health?",
  kmTitle: "តើសុខភាពផ្លូវចិត្តជាអ្វី? (Mental Health)",
  subtitle: "Everyone has mental health",
  kmSubtitle: "មនុស្សគ្រប់គ្នាសុទ្ធតែមានសុខភាពផ្លូវចិត្ត",
  category: "Basics",
  duration: "5 min",
  kmDuration: "៥ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Reflection",
  kmFormat: "ការអាន និងការឆ្លុះបញ្ចាំង (Reading & Reflection)",
  isAvailable: true,
  image: "/mindguide/icon-9.svg",
  // Photo by Mufid Majnun on Unsplash (Unsplash License), cropped.
  heroImage: "/mindguide/what-is-mental-health-hero.jpg",
  description:
    "Mental health is about how we think, feel, respond to challenges and connect with other people. Learn why it matters for everyone and small ways to take care of it.",
  kmDescription:
    "សុខភាពផ្លូវចិត្ត គឺអំពីរបៀបដែលយើងគិត មានអារម្មណ៍ ឆ្លើយតបនឹងបញ្ហាប្រឈម និងទាក់ទងជាមួយអ្នកដទៃ។ ស្វែងយល់ពីមូលហេតុដែលវាសំខាន់សម្រាប់មនុស្សគ្រប់គ្នា និងវិធីតូចៗដើម្បីថែរក្សាវា។",
  totalSections: 9,
  outcomes: [
    {
      en: "What mental health means, in simple words [1]",
      km: "អត្ថន័យនៃសុខភាពផ្លូវចិត្ត ជាពាក្យសាមញ្ញ [1]",
    },
    {
      en: "How mental health affects thinking, feelings, relationships and daily challenges",
      km: "របៀបដែលសុខភាពផ្លូវចិត្តប៉ះពាល់ដល់ការគិត អារម្មណ៍ ទំនាក់ទំនង និងបញ្ហាប្រចាំថ្ងៃ",
    },
    {
      en: "The difference between a difficult emotion and a mental health condition",
      km: "ភាពខុសគ្នារវាងអារម្មណ៍ពិបាក និងបញ្ហាសុខភាពផ្លូវចិត្ត",
    },
    {
      en: "What can affect our mental health [1, 2]",
      km: "កត្តាដែលអាចប៉ះពាល់ដល់សុខភាពផ្លូវចិត្តរបស់យើង [1, 2]",
    },
    {
      en: "Five small ways to take care of your mental health [3]",
      km: "វិធីតូចៗប្រាំយ៉ាង ដើម្បីថែរក្សាសុខភាពផ្លូវចិត្តរបស់អ្នក [3]",
    },
  ],
  references: REFERENCES_MENTAL_HEALTH,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "What Is Mental Health?",
      kmTitle: "តើសុខភាពផ្លូវចិត្តជាអ្វី?",
      type: "reading",
      paragraphs: [
        "When people hear the words \"mental health\", they may think about mental illness or people who need to see a psychologist. However, mental health is important for everyone, not only people experiencing mental health difficulties.",
        "According to the World Health Organization (WHO), mental health is a state of wellbeing that helps us cope with life's stresses, recognize our abilities, learn and work effectively, and contribute to our communities. [1]",
        "In simple words, mental health is about how we think, feel, respond to challenges and connect with other people. Just as we take care of our physical health, we also need to take care of our mental health.",
        "For example, a university student may feel excited about an upcoming examination but also worried about passing. A young employee may feel stressed about work while trying to meet family responsibilities. Someone may feel sad after an argument with a friend.",
        "These feelings are part of everyday life. Experiencing them does not automatically mean that someone has a mental health condition.",
        "Mental health is not about feeling happy all the time. It is about understanding our emotions, managing life's challenges as best we can, and knowing when to seek support.",
      ],
      kmParagraphs: [
        "នៅពេលមនុស្សឮពាក្យ «សុខភាពផ្លូវចិត្ត» ពួកគេអាចគិតដល់ជំងឺផ្លូវចិត្ត ឬមនុស្សដែលត្រូវជួបអ្នកចិត្តសាស្ត្រ។ ប៉ុន្តែ សុខភាពផ្លូវចិត្តសំខាន់សម្រាប់មនុស្សគ្រប់គ្នា មិនមែនតែចំពោះអ្នកដែលកំពុងជួបការលំបាកផ្លូវចិត្តប៉ុណ្ណោះទេ។",
        "យោងតាមអង្គការសុខភាពពិភពលោក (WHO) សុខភាពផ្លូវចិត្ត គឺជាស្ថានភាពសុខុមាលភាព (Wellbeing) ដែលជួយយើងទប់ទល់នឹងភាពតានតឹងក្នុងជីវិត ស្គាល់សមត្ថភាពរបស់ខ្លួន រៀន និងធ្វើការបានល្អ ព្រមទាំងចូលរួមចំណែកដល់សហគមន៍។ [1]",
        "និយាយឱ្យសាមញ្ញ សុខភាពផ្លូវចិត្ត គឺអំពីរបៀបដែលយើងគិត មានអារម្មណ៍ ឆ្លើយតបនឹងបញ្ហាប្រឈម និងទាក់ទងជាមួយអ្នកដទៃ។ ដូចដែលយើងថែរក្សាសុខភាពរាងកាយដែរ យើងក៏ត្រូវថែរក្សាសុខភាពផ្លូវចិត្តផងដែរ។",
        "ឧទាហរណ៍ និស្សិតសាកលវិទ្យាល័យម្នាក់ អាចរំភើបចំពោះការប្រឡងដែលនឹងមកដល់ ប៉ុន្តែក៏ព្រួយបារម្ភថាប្រឡងមិនជាប់។ បុគ្គលិកវ័យក្មេងម្នាក់ អាចតានតឹងពីការងារ ខណៈពេលព្យាយាមបំពេញការទទួលខុសត្រូវក្នុងគ្រួសារ។ មនុស្សម្នាក់ទៀត អាចកើតទុក្ខក្រោយពីឈ្លោះប្រកែកជាមួយមិត្តភក្តិ។",
        "អារម្មណ៍ទាំងនេះ គឺជាផ្នែកមួយនៃជីវិតប្រចាំថ្ងៃ។ ការមានអារម្មណ៍ទាំងនេះ មិនមែនមានន័យដោយស្វ័យប្រវត្តិថា មនុស្សម្នាក់នោះមានបញ្ហាសុខភាពផ្លូវចិត្តនោះទេ។",
        "សុខភាពផ្លូវចិត្ត មិនមែនមានន័យថាត្រូវតែសប្បាយចិត្តគ្រប់ពេលនោះទេ។ វាគឺអំពីការយល់ពីអារម្មណ៍របស់ខ្លួន ការដោះស្រាយបញ្ហាក្នុងជីវិតតាមលទ្ធភាពដែលយើងអាចធ្វើបាន និងការដឹងថាពេលណាត្រូវស្វែងរកជំនួយ។",
      ],
      keyPoints: [
        "Everyone has mental health, just as everyone has physical health.",
        "Mental health is about how we think, feel, respond to challenges and connect with others [1].",
        "Difficult feelings are part of life and are not automatically a mental health condition.",
      ],
      kmKeyPoints: [
        "មនុស្សគ្រប់គ្នាមានសុខភាពផ្លូវចិត្ត ដូចដែលមនុស្សគ្រប់គ្នាមានសុខភាពរាងកាយដែរ។",
        "សុខភាពផ្លូវចិត្ត គឺអំពីរបៀបដែលយើងគិត មានអារម្មណ៍ ឆ្លើយតបនឹងបញ្ហា និងទាក់ទងជាមួយអ្នកដទៃ [1]។",
        "អារម្មណ៍ពិបាកៗ គឺជាផ្នែកមួយនៃជីវិត ហើយមិនមែនជាបញ្ហាសុខភាពផ្លូវចិត្តដោយស្វ័យប្រវត្តិនោះទេ។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "Why Does Mental Health Matter?",
      kmTitle: "ហេតុអ្វីសុខភាពផ្លូវចិត្តសំខាន់?",
      type: "reading",
      paragraphs: [
        "Mental health affects many parts of our everyday lives.",
        "How we think: our mental wellbeing can influence how we concentrate, solve problems, make decisions and respond to difficult situations. For example, a student who is overwhelmed by examination pressure may find it difficult to concentrate on studying. Learning to manage stress and seeking support when needed may help.",
        "How we feel: we may feel happy, sad, worried, frustrated, calm or overwhelmed at different times. Understanding these feelings can help us recognize what we need, instead of ignoring our emotions or judging ourselves for having them. If you feel exhausted after a difficult week, you may need rest, time to reflect, or support from someone you trust.",
        "How we connect with others: someone dealing with a lot of stress may become quieter, more irritable or less interested in social activities than usual. Recognizing these changes can help us respond with understanding, rather than blaming ourselves or others.",
        "In Cambodia, family relationships and responsibilities are important parts of many people's lives. Balancing family expectations, education, work and personal needs can sometimes feel difficult. Taking care of your mental health does not mean that you care less about your family. It can help you understand your needs and communicate with the people around you more effectively.",
        "How we handle daily challenges: everyone faces challenges such as examination pressure, money worries, relationship difficulties and uncertainty about the future. Good mental health does not make these problems disappear. It helps us recognize our feelings, consider our options, adapt, and reach out for support when necessary.",
        "Sometimes handling a challenge means taking action. At other times, it means resting, talking to someone, or accepting that we cannot control everything.",
      ],
      kmParagraphs: [
        "សុខភាពផ្លូវចិត្តប៉ះពាល់ដល់ផ្នែកជាច្រើននៃជីវិតប្រចាំថ្ងៃរបស់យើង។",
        "របៀបដែលយើងគិត៖ សុខុមាលភាពផ្លូវចិត្ត អាចមានឥទ្ធិពលលើការផ្តោតអារម្មណ៍ ការដោះស្រាយបញ្ហា ការសម្រេចចិត្ត និងរបៀបឆ្លើយតបនឹងស្ថានភាពលំបាក។ ឧទាហរណ៍ សិស្សម្នាក់ដែលមានសម្ពាធខ្លាំងពីការប្រឡង អាចពិបាកផ្តោតអារម្មណ៍លើការរៀន។ ការរៀនគ្រប់គ្រងភាពតានតឹង និងការស្វែងរកជំនួយនៅពេលចាំបាច់ អាចជួយបាន។",
        "របៀបដែលយើងមានអារម្មណ៍៖ យើងអាចមានអារម្មណ៍សប្បាយ កើតទុក្ខ ព្រួយបារម្ភ ខកចិត្ត ស្ងប់ស្ងាត់ ឬធុញថប់ខ្លាំង នៅពេលផ្សេងៗគ្នា។ ការយល់ពីអារម្មណ៍ទាំងនេះ អាចជួយយើងដឹងថាយើងត្រូវការអ្វី ជំនួសឱ្យការមិនអើពើនឹងអារម្មណ៍ ឬការបន្ទោសខ្លួនឯង។ ប្រសិនបើអ្នកហត់នឿយក្រោយសប្តាហ៍ដ៏លំបាកមួយ អ្នកប្រហែលជាត្រូវការសម្រាក ពេលវេលាដើម្បីគិតពិចារណា ឬជំនួយពីមនុស្សដែលអ្នកទុកចិត្ត។",
        "របៀបដែលយើងទាក់ទងជាមួយអ្នកដទៃ៖ មនុស្សដែលកំពុងមានភាពតានតឹងខ្លាំង អាចស្ងៀមជាងមុន ឆាប់ខឹងជាងមុន ឬលែងសូវចាប់អារម្មណ៍នឹងសកម្មភាពសង្គមដូចធម្មតា។ ការសម្គាល់ឃើញការផ្លាស់ប្តូរទាំងនេះ អាចជួយយើងឆ្លើយតបដោយការយោគយល់ ជាជាងការបន្ទោសខ្លួនឯង ឬអ្នកដទៃ។",
        "នៅកម្ពុជា ទំនាក់ទំនង និងការទទួលខុសត្រូវក្នុងគ្រួសារ គឺជាផ្នែកសំខាន់នៃជីវិតមនុស្សជាច្រើន។ ការរក្សាតុល្យភាពរវាងការរំពឹងទុករបស់គ្រួសារ ការសិក្សា ការងារ និងតម្រូវការផ្ទាល់ខ្លួន ពេលខ្លះអាចពិបាក។ ការថែរក្សាសុខភាពផ្លូវចិត្ត មិនមែនមានន័យថាអ្នកយកចិត្តទុកដាក់ចំពោះគ្រួសារតិចជាងមុននោះទេ។ វាអាចជួយអ្នកយល់ពីតម្រូវការរបស់ខ្លួន និងប្រាស្រ័យទាក់ទងជាមួយមនុស្សនៅជុំវិញខ្លួនបានល្អជាងមុន។",
        "របៀបដែលយើងដោះស្រាយបញ្ហាប្រចាំថ្ងៃ៖ មនុស្សគ្រប់គ្នាជួបបញ្ហាប្រឈម ដូចជាសម្ពាធពីការប្រឡង ការព្រួយបារម្ភពីលុយកាក់ ការលំបាកក្នុងទំនាក់ទំនង និងភាពមិនប្រាកដប្រជាអំពីអនាគត។ សុខភាពផ្លូវចិត្តល្អ មិនធ្វើឱ្យបញ្ហាទាំងនេះបាត់ទៅវិញទេ។ វាជួយយើងស្គាល់អារម្មណ៍ខ្លួនឯង ពិចារណាជម្រើសនានា សម្របខ្លួន និងស្វែងរកជំនួយនៅពេលចាំបាច់។",
        "ពេលខ្លះ ការដោះស្រាយបញ្ហាមានន័យថាត្រូវចាត់វិធានការ។ ពេលខ្លះទៀត វាមានន័យថាត្រូវសម្រាក និយាយជាមួយនរណាម្នាក់ ឬទទួលស្គាល់ថាយើងមិនអាចគ្រប់គ្រងអ្វីៗទាំងអស់បាន។",
      ],
      keyPoints: [
        "Mental health shapes how we think, feel, connect and handle challenges.",
        "Caring for your mental health does not mean caring less about your family.",
        "Sometimes coping means acting, and sometimes it means resting or asking for help.",
      ],
      kmKeyPoints: [
        "សុខភាពផ្លូវចិត្ត កំណត់របៀបដែលយើងគិត មានអារម្មណ៍ ទាក់ទង និងដោះស្រាយបញ្ហា។",
        "ការថែរក្សាសុខភាពផ្លូវចិត្ត មិនមែនមានន័យថាយកចិត្តទុកដាក់ចំពោះគ្រួសារតិចជាងមុននោះទេ។",
        "ពេលខ្លះការដោះស្រាយមានន័យថាត្រូវធ្វើសកម្មភាព ហើយពេលខ្លះមានន័យថាត្រូវសម្រាក ឬសុំជំនួយ។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Is It Normal to Feel Sad, Stressed or Worried?",
      kmTitle: "តើការកើតទុក្ខ តានតឹង ឬព្រួយបារម្ភ ជារឿងធម្មតាឬទេ?",
      type: "reading",
      paragraphs: [
        "Yes. Sadness, stress and worry are common human experiences. For example:",
        "• You may feel nervous before an important examination.\n• You may feel sad after a disagreement with someone you care about.\n• You may feel worried when your family faces money difficulties.\n• You may feel disappointed when something does not go as planned.",
        "These emotions are not automatically signs of mental illness.",
        "Pay attention when difficult feelings become intense, last a long time, happen often, or start to get in the way of sleeping, studying, working or your relationships.",
        "If you have been feeling sad for a long time, losing interest in things you usually enjoy, or struggling with everyday responsibilities, consider talking to a qualified mental health professional. You do not need to wait until things feel unbearable before asking for help.",
      ],
      kmParagraphs: [
        "ពិតមែនហើយ។ ការកើតទុក្ខ ភាពតានតឹង និងការព្រួយបារម្ភ គឺជាបទពិសោធន៍ទូទៅរបស់មនុស្ស។ ឧទាហរណ៍៖",
        "• អ្នកអាចភ័យមុនការប្រឡងសំខាន់មួយ។\n• អ្នកអាចកើតទុក្ខក្រោយពីមានការខ្វែងគំនិតជាមួយមនុស្សដែលអ្នកស្រលាញ់។\n• អ្នកអាចព្រួយបារម្ភនៅពេលគ្រួសារជួបការលំបាកផ្នែកលុយកាក់។\n• អ្នកអាចខកចិត្តនៅពេលអ្វីមួយមិនដំណើរការដូចការគ្រោងទុក។",
        "អារម្មណ៍ទាំងនេះ មិនមែនជាសញ្ញានៃជំងឺផ្លូវចិត្តដោយស្វ័យប្រវត្តិនោះទេ។",
        "សូមយកចិត្តទុកដាក់ នៅពេលអារម្មណ៍ពិបាកៗកាន់តែខ្លាំង នៅជាប់យូរ កើតឡើងញឹកញាប់ ឬចាប់ផ្តើមរំខានដល់ការគេង ការរៀន ការងារ ឬទំនាក់ទំនងរបស់អ្នក។",
        "ប្រសិនបើអ្នកកើតទុក្ខយូរមកហើយ លែងចាប់អារម្មណ៍នឹងអ្វីដែលអ្នកធ្លាប់ចូលចិត្ត ឬពិបាកបំពេញការងារប្រចាំថ្ងៃ សូមពិចារណានិយាយជាមួយអ្នកជំនាញសុខភាពផ្លូវចិត្តដែលមានលក្ខណៈសម្បត្តិគ្រប់គ្រាន់។ អ្នកមិនចាំបាច់រង់ចាំរហូតដល់ស្ថានភាពហួសពីការទ្រាំទ្រ ទើបសុំជំនួយនោះទេ។",
      ],
      alertBox: {
        type: "tip",
        text: "There is a difference between experiencing a difficult emotion and experiencing a mental health condition. Understanding that difference can help you decide what kind of support you may need.",
        kmText:
          "មានភាពខុសគ្នារវាងការមានអារម្មណ៍ពិបាក និងការមានបញ្ហាសុខភាពផ្លូវចិត្ត។ ការយល់ពីភាពខុសគ្នានេះ អាចជួយអ្នកសម្រេចចិត្តថាអ្នកត្រូវការជំនួយប្រភេទណា។",
      },
      keyPoints: [
        "Sadness, stress and worry are common human experiences.",
        "Watch for feelings that are intense, long lasting, frequent or getting in the way of daily life.",
        "You do not need to wait until things feel unbearable to ask for help.",
      ],
      kmKeyPoints: [
        "ការកើតទុក្ខ ភាពតានតឹង និងការព្រួយបារម្ភ គឺជាបទពិសោធន៍ទូទៅរបស់មនុស្ស។",
        "សូមប្រុងប្រយ័ត្នចំពោះអារម្មណ៍ដែលខ្លាំង នៅជាប់យូរ កើតញឹកញាប់ ឬរំខានដល់ជីវិតប្រចាំថ្ងៃ។",
        "អ្នកមិនចាំបាច់រង់ចាំរហូតដល់ហួសពីការទ្រាំទ្រ ទើបសុំជំនួយនោះទេ។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "What Can Affect Our Mental Health?",
      kmTitle: "តើអ្វីខ្លះអាចប៉ះពាល់ដល់សុខភាពផ្លូវចិត្តរបស់យើង?",
      type: "reading",
      paragraphs: [
        "Mental health is influenced by many factors. It is rarely explained by just one thing. [1]",
        "Life experiences: losing someone important, conflict, money pressure or big life changes can affect our wellbeing. Positive experiences, meaningful activities and supportive relationships can help us stay well. [1]",
        "Physical health and daily habits: sleep, physical activity, food and general health can influence how we feel. Regularly staying up late to study may leave a student tired and make it harder to concentrate the next day. Healthier routines may help, although they alone may not be enough for someone with a mental health condition.",
        "Relationships and support: having people who listen without judging us makes difficult times easier. Healthy connections with parents, friends and mentors help us become stronger over time. [2] Support may come from a trusted friend, family member, teacher, mentor, counselor or mental health professional.",
        "In Cambodian communities, people may turn to family, friends or religious communities for support. But not everyone feels comfortable sharing personal difficulties with people they know. Some worry about being misunderstood, judged or becoming a burden. [2] If that is you, you can speak with a qualified professional or a confidential support service.",
        "Expectations and everyday pressure: pressure to do well in school, earn an income, support family or meet other people's expectations can affect our wellbeing. A young adult may feel they must succeed quickly because their family made sacrifices for their education. It is understandable to want to make your family proud. Struggling does not mean that you have failed as a person.",
      ],
      kmParagraphs: [
        "សុខភាពផ្លូវចិត្តទទួលឥទ្ធិពលពីកត្តាជាច្រើន។ វាកម្រនឹងអាចពន្យល់បានដោយកត្តាតែមួយណាស់។ [1]",
        "បទពិសោធន៍ជីវិត៖ ការបាត់បង់មនុស្សសំខាន់ ជម្លោះ សម្ពាធផ្នែកលុយកាក់ ឬការផ្លាស់ប្តូរធំៗក្នុងជីវិត អាចប៉ះពាល់ដល់សុខុមាលភាពរបស់យើង។ បទពិសោធន៍វិជ្ជមាន សកម្មភាពដែលមានអត្ថន័យ និងទំនាក់ទំនងដែលគាំទ្រ អាចជួយឱ្យយើងរក្សាសុខភាពល្អ។ [1]",
        "សុខភាពរាងកាយ និងទម្លាប់ប្រចាំថ្ងៃ៖ ការគេង ការធ្វើចលនារាងកាយ អាហារ និងសុខភាពទូទៅ អាចមានឥទ្ធិពលលើអារម្មណ៍របស់យើង។ ការគេងយប់ជ្រៅជាប្រចាំដើម្បីរៀន អាចធ្វើឱ្យសិស្សហត់នឿយ និងពិបាកផ្តោតអារម្មណ៍នៅថ្ងៃបន្ទាប់។ ទម្លាប់ដែលល្អជាងមុនអាចជួយបាន ប៉ុន្តែវាតែម្នាក់ឯងប្រហែលមិនគ្រប់គ្រាន់សម្រាប់អ្នកដែលមានបញ្ហាសុខភាពផ្លូវចិត្តទេ។",
        "ទំនាក់ទំនង និងការគាំទ្រ៖ ការមានមនុស្សដែលស្តាប់យើងដោយមិនវិនិច្ឆ័យ ធ្វើឱ្យពេលវេលាលំបាកកាន់តែងាយស្រួល។ ទំនាក់ទំនងល្អជាមួយឪពុកម្តាយ មិត្តភក្តិ និងអ្នកណែនាំ ជួយឱ្យយើងរឹងមាំជាងមុនតាមពេលវេលា។ [2] ការគាំទ្រអាចមកពីមិត្តដែលទុកចិត្ត សមាជិកគ្រួសារ គ្រូ អ្នកណែនាំ អ្នកប្រឹក្សា ឬអ្នកជំនាញសុខភាពផ្លូវចិត្ត។",
        "នៅក្នុងសហគមន៍ខ្មែរ មនុស្សអាចស្វែងរកការគាំទ្រពីគ្រួសារ មិត្តភក្តិ ឬសហគមន៍សាសនា។ ប៉ុន្តែមិនមែនគ្រប់គ្នាសុទ្ធតែស្រួលចិត្តក្នុងការចែករំលែកការលំបាកផ្ទាល់ខ្លួនជាមួយមនុស្សដែលខ្លួនស្គាល់នោះទេ។ អ្នកខ្លះបារម្ភថាត្រូវគេយល់ខុស វិនិច្ឆ័យ ឬក្លាយជាបន្ទុកដល់អ្នកដទៃ។ [2] ប្រសិនបើអ្នកមានអារម្មណ៍បែបនេះ អ្នកអាចនិយាយជាមួយអ្នកជំនាញដែលមានលក្ខណៈសម្បត្តិគ្រប់គ្រាន់ ឬសេវាគាំទ្រដែលរក្សាការសម្ងាត់។",
        "ការរំពឹងទុក និងសម្ពាធប្រចាំថ្ងៃ៖ សម្ពាធឱ្យរៀនពូកែ រកប្រាក់ចំណូល ជួយគ្រួសារ ឬបំពេញការរំពឹងទុករបស់អ្នកដទៃ អាចប៉ះពាល់ដល់សុខុមាលភាពរបស់យើង។ យុវជនម្នាក់អាចមានអារម្មណ៍ថាត្រូវតែជោគជ័យឱ្យបានលឿន ព្រោះគ្រួសារបានលះបង់ច្រើនសម្រាប់ការសិក្សារបស់ខ្លួន។ ការចង់ឱ្យគ្រួសារមានមោទនភាព គឺជារឿងដែលអាចយល់បាន។ ការជួបការលំបាក មិនមែនមានន័យថាអ្នកបរាជ័យក្នុងនាមជាមនុស្សម្នាក់នោះទេ។",
      ],
      keyPoints: [
        "Many things shape mental health: life events, habits, relationships and pressure [1].",
        "Supportive relationships help us cope and grow stronger [1, 2].",
        "Struggling does not mean that you have failed as a person.",
      ],
      kmKeyPoints: [
        "កត្តាជាច្រើនកំណត់សុខភាពផ្លូវចិត្ត៖ ព្រឹត្តិការណ៍ជីវិត ទម្លាប់ ទំនាក់ទំនង និងសម្ពាធ [1]។",
        "ទំនាក់ទំនងដែលគាំទ្រ ជួយឱ្យយើងទប់ទល់ និងរឹងមាំជាងមុន [1, 2]។",
        "ការជួបការលំបាក មិនមែនមានន័យថាអ្នកបរាជ័យក្នុងនាមជាមនុស្សម្នាក់នោះទេ។",
      ],
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "How Can You Take Care of Your Mental Health?",
      kmTitle: "តើអ្នកអាចថែរក្សាសុខភាពផ្លូវចិត្តរបស់អ្នកយ៉ាងដូចម្តេច?",
      type: "reading",
      paragraphs: [
        "You do not need to change your whole life in one day. Small, realistic actions are a good place to start.",
        "1. Notice your emotions. Ask yourself: How am I feeling today? What might be causing this feeling? What do I need right now? You do not have to answer every question. Simply noticing helps you understand yourself better.",
        "2. Keep healthy daily habits. Try to get enough sleep, eat regularly, move your body in ways that suit you, and make time for rest. Problems with sleep, appetite or energy can also have medical or psychological causes.",
        "3. Stay connected with people you trust. You do not need to explain everything. You could start with: \"I have been feeling stressed lately. Could we talk for a little while?\" If you prefer not to share details, you can simply ask someone to spend time with you.",
        "4. Take breaks without feeling guilty. Rest is a normal part of taking care of yourself. After studying or working for several hours, take a short break, stretch, walk or do something relaxing. You do not have to be productive every moment to be valuable.",
        "5. Ask for help when you need it. If emotional difficulties are lasting, overwhelming or affecting your daily life, consider support from a qualified mental health professional. Asking for help does not mean that you are weak. It means you are taking your wellbeing seriously.",
        "Self care can help, but it does not replace professional assessment or treatment when these are needed. [3]",
      ],
      kmParagraphs: [
        "អ្នកមិនចាំបាច់ផ្លាស់ប្តូរជីវិតទាំងមូលក្នុងមួយថ្ងៃនោះទេ។ សកម្មភាពតូចៗដែលអាចធ្វើបានពិតប្រាកដ គឺជាចំណុចចាប់ផ្តើមដ៏ល្អ។",
        "១. សម្គាល់អារម្មណ៍របស់អ្នក។ សួរខ្លួនឯងថា៖ តើថ្ងៃនេះខ្ញុំមានអារម្មណ៍យ៉ាងណា? តើអ្វីអាចជាមូលហេតុនៃអារម្មណ៍នេះ? តើខ្ញុំត្រូវការអ្វីឥឡូវនេះ? អ្នកមិនចាំបាច់ឆ្លើយគ្រប់សំណួរទេ។ គ្រាន់តែសម្គាល់ឃើញ ក៏ជួយឱ្យអ្នកយល់ពីខ្លួនឯងកាន់តែច្បាស់ដែរ។",
        "២. រក្សាទម្លាប់ល្អប្រចាំថ្ងៃ។ ព្យាយាមគេងឱ្យបានគ្រប់គ្រាន់ ញ៉ាំអាហារឱ្យទៀងពេល ធ្វើចលនារាងកាយតាមបែបដែលសមនឹងអ្នក និងចំណាយពេលសម្រាក។ បញ្ហាការគេង ចំណង់អាហារ ឬថាមពល ក៏អាចមានមូលហេតុផ្នែកវេជ្ជសាស្ត្រ ឬផ្លូវចិត្តដែរ។",
        "៣. រក្សាទំនាក់ទំនងជាមួយមនុស្សដែលអ្នកទុកចិត្ត។ អ្នកមិនចាំបាច់ពន្យល់អ្វីៗទាំងអស់ទេ។ អ្នកអាចចាប់ផ្តើមដោយនិយាយថា៖ «ថ្មីៗនេះខ្ញុំមានអារម្មណ៍តានតឹង។ តើយើងអាចនិយាយគ្នាបន្តិចបានទេ?» ប្រសិនបើអ្នកមិនចង់ចែករំលែកលម្អិត អ្នកគ្រាន់តែអាចសុំឱ្យនរណាម្នាក់ចំណាយពេលនៅជាមួយអ្នក។",
        "៤. សម្រាកដោយមិនបាច់មានអារម្មណ៍ថាមានកំហុស។ ការសម្រាកគឺជាផ្នែកធម្មតានៃការថែរក្សាខ្លួនឯង។ ក្រោយពីរៀន ឬធ្វើការជាច្រើនម៉ោង សូមសម្រាកបន្តិច លាតសន្ធឹងខ្លួន ដើរលេង ឬធ្វើអ្វីដែលធ្វើឱ្យអ្នកធូរស្រាល។ អ្នកមិនចាំបាច់ធ្វើការគ្រប់ពេលវេលា ទើបមានតម្លៃនោះទេ។",
        "៥. សុំជំនួយនៅពេលអ្នកត្រូវការ។ ប្រសិនបើការលំបាកផ្លូវចិត្តនៅជាប់យូរ ធ្ងន់ធ្ងរពេក ឬប៉ះពាល់ដល់ជីវិតប្រចាំថ្ងៃ សូមពិចារណាស្វែងរកជំនួយពីអ្នកជំនាញសុខភាពផ្លូវចិត្តដែលមានលក្ខណៈសម្បត្តិគ្រប់គ្រាន់។ ការសុំជំនួយមិនមែនមានន័យថាអ្នកទន់ខ្សោយនោះទេ។ វាមានន័យថាអ្នកយកចិត្តទុកដាក់ចំពោះសុខុមាលភាពរបស់ខ្លួនយ៉ាងពិតប្រាកដ។",
        "ការថែទាំខ្លួនឯង (Self care) អាចជួយបាន ប៉ុន្តែវាមិនជំនួសការវាយតម្លៃ ឬការព្យាបាលពីអ្នកជំនាញ នៅពេលដែលត្រូវការនោះទេ។ [3]",
      ],
      keyPoints: [
        "Start small: notice your emotions and keep healthy habits.",
        "Stay connected and rest without guilt.",
        "Self care helps, but it does not replace professional care when it is needed [3].",
      ],
      kmKeyPoints: [
        "ចាប់ផ្តើមពីតូចៗ៖ សម្គាល់អារម្មណ៍ខ្លួនឯង និងរក្សាទម្លាប់ល្អ។",
        "រក្សាទំនាក់ទំនងជាមួយអ្នកដទៃ និងសម្រាកដោយមិនមានអារម្មណ៍ថាមានកំហុស។",
        "ការថែទាំខ្លួនឯងជួយបាន ប៉ុន្តែមិនជំនួសការថែទាំពីអ្នកជំនាញ នៅពេលដែលត្រូវការនោះទេ [3]។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "Let's Reflect: How Have You Been Feeling?",
      kmTitle: "តោះឆ្លុះបញ្ចាំង៖ តើអ្នកមានអារម្មណ៍យ៉ាងណាកន្លងមក?",
      type: "reflection",
      paragraphs: [
        "Take a moment to think about the past seven days. There are no right or wrong answers. These questions are for personal reflection, not a mental health diagnosis.",
      ],
      kmParagraphs: [
        "ឆ្លៀតពេលបន្តិច ដើម្បីគិតអំពីរយៈពេលប្រាំពីរថ្ងៃកន្លងមក។ គ្មានចម្លើយត្រូវ ឬខុសនោះទេ។ សំណួរទាំងនេះសម្រាប់ការឆ្លុះបញ្ចាំងផ្ទាល់ខ្លួន មិនមែនជាការធ្វើរោគវិនិច្ឆ័យសុខភាពផ្លូវចិត្តនោះទេ។",
      ],
      reflection: {
        question: "How have you generally been feeling?",
        kmQuestion: "ជាទូទៅ តើអ្នកមានអារម្មណ៍យ៉ាងណា?",
        options: [
          "Mostly calm or content",
          "Occasionally stressed or worried",
          "Frequently overwhelmed",
          "Often sad or emotionally exhausted",
          "Unsure how I feel",
        ],
        kmOptions: [
          "ភាគច្រើនស្ងប់ ឬពេញចិត្ត",
          "ម្តងម្កាលតានតឹង ឬព្រួយបារម្ភ",
          "ញឹកញាប់មានអារម្មណ៍ធុញថប់ខ្លាំង",
          "ច្រើនតែកើតទុក្ខ ឬហត់នឿយផ្លូវចិត្ត",
          "មិនច្បាស់ថាខ្លួនមានអារម្មណ៍យ៉ាងណា",
        ],
        feedbackMessage:
          "Thank you for checking in with yourself. Whatever you chose, noticing how you feel is a useful first step.",
        kmFeedbackMessage:
          "អរគុណដែលបានពិនិត្យមើលខ្លួនឯង។ មិនថាអ្នកជ្រើសរើសអ្វីទេ ការសម្គាល់ឃើញអារម្មណ៍ខ្លួនឯង គឺជាជំហានដំបូងដ៏មានប្រយោជន៍។",
      },
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "Let's Reflect: Your Daily Life",
      kmTitle: "តោះឆ្លុះបញ្ចាំង៖ ជីវិតប្រចាំថ្ងៃរបស់អ្នក",
      type: "reflection",
      paragraphs: [
        "Think about the past seven days again.",
      ],
      kmParagraphs: [
        "សូមគិតអំពីរយៈពេលប្រាំពីរថ្ងៃកន្លងមកម្តងទៀត។",
      ],
      reflection: {
        question: "Has your emotional wellbeing affected your daily life?",
        kmQuestion: "តើសុខុមាលភាពផ្លូវចិត្តរបស់អ្នក បានប៉ះពាល់ដល់ជីវិតប្រចាំថ្ងៃដែរឬទេ?",
        options: ["Not really", "A little", "Sometimes", "Frequently", "Significantly"],
        kmOptions: ["មិនសូវទេ", "បន្តិចបន្តួច", "ជួនកាល", "ញឹកញាប់", "យ៉ាងខ្លាំង"],
        feedbackMessage:
          "Thank you for being honest with yourself. If your feelings have been affecting your daily life frequently or significantly, consider talking to a qualified mental health professional.",
        kmFeedbackMessage:
          "អរគុណដែលបានស្មោះត្រង់ជាមួយខ្លួនឯង។ ប្រសិនបើអារម្មណ៍របស់អ្នកបានប៉ះពាល់ដល់ជីវិតប្រចាំថ្ងៃញឹកញាប់ ឬយ៉ាងខ្លាំង សូមពិចារណានិយាយជាមួយអ្នកជំនាញសុខភាពផ្លូវចិត្តដែលមានលក្ខណៈសម្បត្តិគ្រប់គ្រាន់។",
      },
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "Let's Reflect: What Might Help?",
      kmTitle: "តោះឆ្លុះបញ្ចាំង៖ តើអ្វីអាចជួយបាន?",
      type: "reflection",
      paragraphs: [
        "Choose the one that feels closest to what you need right now.",
      ],
      kmParagraphs: [
        "ជ្រើសរើសមួយដែលជិតបំផុតនឹងអ្វីដែលអ្នកត្រូវការនៅពេលនេះ។",
      ],
      reflection: {
        question: "What might help you right now?",
        kmQuestion: "តើអ្វីអាចជួយអ្នកបាននៅពេលនេះ?",
        options: [
          "Getting more rest",
          "Talking to someone I trust",
          "Learning how to manage stress",
          "Practicing relaxation or meditation",
          "Understanding my emotions better",
          "Exploring professional support",
          "I'm not sure yet",
        ],
        kmOptions: [
          "សម្រាកឱ្យបានច្រើនជាងមុន",
          "និយាយជាមួយមនុស្សដែលខ្ញុំទុកចិត្ត",
          "រៀនពីរបៀបគ្រប់គ្រងភាពតានតឹង",
          "ហាត់សម្រាកកាយចិត្ត ឬសមាធិ",
          "យល់ពីអារម្មណ៍ខ្លួនឯងកាន់តែច្បាស់",
          "ស្វែងរកជំនួយពីអ្នកជំនាញ",
          "ខ្ញុំមិនទាន់ប្រាកដនៅឡើយ",
        ],
        feedbackMessage:
          "That is a good place to start. You can come back to these questions whenever you want to check in with yourself.",
        kmFeedbackMessage:
          "នោះជាចំណុចចាប់ផ្តើមដ៏ល្អ។ អ្នកអាចត្រឡប់មកសំណួរទាំងនេះវិញ គ្រប់ពេលដែលអ្នកចង់ពិនិត្យមើលខ្លួនឯង។",
      },
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "One Thing to Remember",
      kmTitle: "រឿងមួយដែលត្រូវចងចាំ",
      type: "coping",
      paragraphs: [
        "You do not have to wait until you are struggling badly to take care of your mental health. You can start by noticing your emotions, building healthy habits, connecting with people you trust, and learning when to seek support.",
        "Some days will be easier than others, and that is part of being human.",
        "Your mental health matters, even when other people cannot see what you are going through. You deserve care and support, just as you would if you had a physical health problem.",
        "Choose one small step for today:\n• Learn: read Learn About Stress or Understanding Anxiety.\n• Practice: try the short breathing exercise below.\n• Talk: tap Match Me With A Professional below if you would like support.",
        "If you ever think about hurting yourself, get help right away. Open Profile and tap Get help now.",
        "You do not have to do everything at once. Start with what feels manageable for you.",
      ],
      kmParagraphs: [
        "អ្នកមិនចាំបាច់រង់ចាំរហូតដល់ជួបការលំបាកធ្ងន់ធ្ងរ ទើបថែរក្សាសុខភាពផ្លូវចិត្តនោះទេ។ អ្នកអាចចាប់ផ្តើមដោយការសម្គាល់អារម្មណ៍ខ្លួនឯង បង្កើតទម្លាប់ល្អ រក្សាទំនាក់ទំនងជាមួយមនុស្សដែលអ្នកទុកចិត្ត និងរៀនដឹងថាពេលណាត្រូវស្វែងរកជំនួយ។",
        "ថ្ងៃខ្លះនឹងងាយស្រួលជាងថ្ងៃខ្លះទៀត ហើយនោះជាផ្នែកមួយនៃការជាមនុស្ស។",
        "សុខភាពផ្លូវចិត្តរបស់អ្នកសំខាន់ ទោះបីជាអ្នកដទៃមើលមិនឃើញអ្វីដែលអ្នកកំពុងឆ្លងកាត់ក៏ដោយ។ អ្នកសមនឹងទទួលបានការថែទាំ និងការគាំទ្រ ដូចពេលដែលអ្នកមានបញ្ហាសុខភាពរាងកាយដែរ។",
        "ជ្រើសរើសជំហានតូចមួយសម្រាប់ថ្ងៃនេះ៖\n• រៀន៖ អានមេរៀន ស្វែងយល់ពីភាពតានតឹង ឬ ស្វែងយល់ពីការថប់បារម្ភ។\n• អនុវត្ត៖ សាកល្បងលំហាត់ដកដង្ហើមខ្លីៗខាងក្រោម។\n• និយាយ៖ ចុច «ស្វែងរកអ្នកជំនាញ (Match Me)» ខាងក្រោម ប្រសិនបើអ្នកចង់បានការគាំទ្រ។",
        "ប្រសិនបើអ្នកធ្លាប់គិតចង់ធ្វើបាបខ្លួនឯង សូមស្វែងរកជំនួយភ្លាមៗ។ បើកទំព័រប្រវត្តិរូប (Profile) ហើយចុច «ជំនួយបន្ទាន់ (Get help now)»។",
        "អ្នកមិនចាំបាច់ធ្វើអ្វីៗទាំងអស់ក្នុងពេលតែមួយនោះទេ។ ចាប់ផ្តើមពីអ្វីដែលអ្នកអាចធ្វើបាន។",
      ],
      actions: [
        { label: "Practice Calm Breathing", kmLabel: "ហាត់ដកដង្ហើមស្ងប់ចិត្ត (Breathing)", actionType: "exercise" },
        { label: "Explore Mental Health Tips", kmLabel: "ស្វែងយល់គន្លឹះថែទាំចិត្ត (Tips)", actionType: "tips" },
        { label: "Find a Professional (Match Me)", kmLabel: "ស្វែងរកអ្នកជំនាញចិត្តសាស្ត្រ (Match Me)", actionType: "professional" },
      ],
      keyPoints: [
        "Your mental health matters, even when others cannot see what you are going through.",
        "You deserve care and support, just like with a physical health problem.",
        "Start with one small step that feels manageable.",
      ],
      kmKeyPoints: [
        "សុខភាពផ្លូវចិត្តរបស់អ្នកសំខាន់ ទោះបីអ្នកដទៃមើលមិនឃើញអ្វីដែលអ្នកកំពុងឆ្លងកាត់ក៏ដោយ។",
        "អ្នកសមនឹងទទួលបានការថែទាំ និងការគាំទ្រ ដូចបញ្ហាសុខភាពរាងកាយដែរ។",
        "ចាប់ផ្តើមពីជំហានតូចមួយដែលអ្នកអាចធ្វើបាន។",
      ],
    },
  ],
};

export const REFERENCES_UNDERSTAND_YOURSELF: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "UNICEF",
    title: "UNICEF, Adolescent Mental Health Hub: Resources for Adolescents",
    url: "https://www.unicef.org/adolescentmentalhealthhub/resources/adolescents",
  },
  {
    id: 2,
    citation: "[2]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia, Mental Health",
    url: "https://www.unicef.org/cambodia/mental-health",
  },
  {
    id: 3,
    citation: "[3]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia, A Conversation on Mental Health",
    url: "https://www.unicef.org/cambodia/stories/conversation-mental-health",
  },
  {
    id: 4,
    citation: "[4]",
    source: "WHO",
    title: "WHO, Self Care for Health and Wellbeing",
    url: "https://www.who.int/news-room/questions-and-answers/item/self-care-for-health-and-well-being",
  },
];

export const LESSON_UNDERSTAND_YOURSELF: Lesson = {
  id: "understand-yourself",
  title: "Understand Yourself",
  kmTitle: "ស្វែងយល់ពីខ្លួនឯង (Understand Yourself)",
  subtitle: "Learn to recognize your emotions, thoughts, needs and what matters to you",
  kmSubtitle: "រៀនស្គាល់អារម្មណ៍ គំនិត តម្រូវការ និងអ្វីដែលសំខាន់ចំពោះអ្នក",
  category: "Emotions",
  duration: "7 min",
  kmDuration: "៧ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Reflection",
  kmFormat: "ការអាន និងការឆ្លុះបញ្ចាំង (Reading & Reflection)",
  isAvailable: true,
  image: "/mindguide/icon-11.svg",
  // Photo by Aaron Burden on Unsplash (Unsplash License), cropped.
  heroImage: "/mindguide/understand-yourself-hero.jpg",
  description:
    "Learn to observe your emotions, question stressful assumptions, and discover the needs and values that matter most to you.",
  kmDescription:
    "រៀនសង្កេតមើលអារម្មណ៍របស់អ្នក ចោទសួរគំនិតដែលតានតឹង និងស្វែងយល់ពីតម្រូវការព្រមទាំងគុណតម្លៃដែលសំខាន់បំផុតសម្រាប់អ្នក។",
  totalSections: 9,
  outcomes: [
    {
      en: "What understanding yourself and self awareness mean in daily life [1]",
      km: "អត្ថន័យនៃការយល់ដឹងពីខ្លួនឯង និងការដឹងពីខ្លួនឯងក្នុងជីវិតប្រចាំថ្ងៃ [1]",
    },
    {
      en: "How to name emotions and explore what they might tell you [1]",
      km: "របៀបប្រាប់ឈ្មោះអារម្មណ៍ និងស្វែងយល់ពីអ្វីដែលអារម្មណ៍ទាំងនោះចង់ប្រាប់ [1]",
    },
    {
      en: "How to examine stressful thoughts with realistic balance",
      km: "របៀបពិនិត្យមើលគំនិតដែលតានតឹង ប្រកបដោយតុល្យភាពជាក់ស្តែង",
    },
    {
      en: "Common factors that influence your mood and daily patterns [2, 3]",
      km: "កត្តាទូទៅដែលមានឥទ្ធិពលលើអារម្មណ៍ និងទម្លាប់ប្រចាំថ្ងៃរបស់អ្នក [2, 3]",
    },
    {
      en: "Recognizing your personal needs, values and strengths",
      km: "ការស្គាល់តម្រូវការផ្ទាល់ខ្លួន គុណតម្លៃ និងភាពខ្លាំងរបស់អ្នក",
    },
    {
      en: "Small daily reflection practices and when to reach out for professional care [4]",
      km: "ការអនុវត្តការឆ្លុះបញ្ចាំងតូចៗប្រចាំថ្ងៃ និងពេលវេលាដែលត្រូវស្វែងរកជំនួយពីអ្នកជំនាញ [4]",
    },
  ],
  references: REFERENCES_UNDERSTAND_YOURSELF,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "What Does It Mean to Understand Yourself?",
      kmTitle: "តើការយល់ដឹងពីខ្លួនឯងមានន័យដូចម្តេច?",
      type: "reading",
      paragraphs: [
        "Have you ever felt upset but struggled to explain why? Or felt stressed without knowing exactly what was causing it?",
        "Sometimes, we experience emotions before we fully understand them. We might feel irritated with our family, lose motivation to study or work, or worry about the future without knowing where these feelings come from.",
        "Understanding yourself, also called self awareness, means noticing what you feel, what you think, what you need, and how your experiences affect you. [1]",
        "For example, you may notice that you feel anxious before an important exam. You may realize that you become quiet when you feel hurt. You may discover that comparing yourself with others makes you feel less confident, or that spending time with someone you trust helps you feel calmer.",
        "These observations help you understand yourself better. They do not mean that something is wrong with you.",
        "Remember: understanding yourself is not about judging who you are. It is about learning to recognize your experiences with honesty and kindness.",
      ],
      kmParagraphs: [
        "តើអ្នកធ្លាប់មានអារម្មណ៍មិនសប្បាយចិត្ត ប៉ុន្តែពិបាកពន្យល់ពីមូលហេតុដែរឬទេ? ឬមានអារម្មណ៍តានតឹងដោយមិនដឹងច្បាស់ថាអ្វីជាដើមហេតុ?",
        "ពេលខ្លះ យើងជួបប្រទះអារម្មណ៍ផ្សេងៗ មុនពេលយើងយល់ពីពួកវាបានច្បាស់។ យើងអាចមានអារម្មណ៍មួម៉ៅជាមួយគ្រួសារ បាត់បង់កម្លាំងចិត្តក្នុងការរៀន ឬធ្វើការ ឬព្រួយបារម្ភអំពីអនាគត ដោយមិនដឹងថាអារម្មណ៍ទាំងនេះមកពីណា។",
        "ការយល់ដឹងពីខ្លួនឯង (Self-awareness) មានន័យថាសម្គាល់នូវអ្វីដែលអ្នកមានអារម្មណ៍ អ្វីដែលអ្នកគិត អ្វីដែលអ្នកត្រូវការ និងរបៀបដែលបទពិសោធន៍របស់អ្នកប៉ះពាល់ដល់អ្នក។ [1]",
        "ឧទាហរណ៍ អ្នកអាចសម្គាល់ឃើញថាអ្នកមានអារម្មណ៍ថប់បារម្ភមុនការប្រឡងសំខាន់។ អ្នកអាចដឹងថាខ្លួនឯងប្រែជាស្ងៀមស្ងាត់នៅពេលមានអារម្មណ៍ឈឺចាប់។ អ្នកអាចរកឃើញថាការប្រៀបធៀបខ្លួនឯងជាមួយអ្នកដទៃធ្វើឱ្យអ្នកថយទំនុកចិត្ត ឬការចំណាយពេលជាមួយមនុស្សដែលអ្នកទុកចិត្តជួយឱ្យអ្នកមានអារម្មណ៍ស្ងប់ជាងមុន។",
        "ការសង្កេតទាំងនេះ ជួយឱ្យអ្នកយល់ពីខ្លួនឯងកាន់តែច្បាស់។ វាមិនមានន័យថាមានអ្វីមួយខុសប្រក្រតីចំពោះអ្នកនោះទេ។",
        "ចូរចងចាំថា៖ ការយល់ដឹងពីខ្លួនឯង មិនមែនជាការវិនិច្ឆ័យ ឬបន្ទោសថាខ្លួនឯងជាមនុស្សបែបណានោះទេ។ វាគឺអំពីការរៀនសម្គាល់បទពិសោធន៍របស់អ្នក ដោយភាពស្មោះត្រង់ និងចិត្តមេត្តា។",
      ],
      keyPoints: [
        "Self awareness means noticing your emotions, thoughts, needs and values [1].",
        "You do not need to have all the answers right away: small observations matter.",
        "Understanding yourself is about curiosity and kindness, not self judgment.",
      ],
      kmKeyPoints: [
        "ការយល់ដឹងពីខ្លួនឯង (Self-awareness) មានន័យថាសម្គាល់អារម្មណ៍ គំនិត តម្រូវការ និងគុណតម្លៃរបស់អ្នក [1]។",
        "អ្នកមិនចាំបាច់មានចម្លើយទាំងអស់ភ្លាមៗនោះទេ៖ ការសង្កេតតូចៗសុទ្ធតែមានតម្លៃ។",
        "ការយល់ដឹងពីខ្លួនឯង គឺអំពីការចង់ដឹង និងចិត្តមេត្តា មិនមែនជាការបន្ទោសខ្លួនឯងឡើយ។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "Get to Know Your Emotions",
      kmTitle: "ស្វែងយល់ពីអារម្មណ៍របស់អ្នក",
      type: "reading",
      paragraphs: [
        "Emotions are part of being human. Happiness, sadness, anger, fear, frustration and excitement are all normal emotional experiences.",
        "However, identifying what you feel is not always easy. Sometimes, we say, \"I'm fine,\" even when we feel overwhelmed. Other times, we become angry when we are actually disappointed, worried or hurt.",
        "Learning to name your emotions can help you understand what you are experiencing. When you notice a change in your mood, pause and try this simple three step method [1]:",
        "Step 1: What am I feeling? Describe the emotion as specifically as possible. Instead of saying, \"I feel bad,\" you might say: I feel disappointed, nervous, lonely, overwhelmed or frustrated.",
        "Step 2: What happened before I felt this way? Think about what was happening when the feeling began. Did someone say something that hurt you? Are you worried about an upcoming exam? Have you been trying to meet too many expectations?",
        "Step 3: What might I need right now? Different emotions point toward different needs. Feeling overwhelmed might mean you need a break or help with a task. Feeling lonely might mean you need connection with someone you trust. Feeling worried might mean you need more information or reassurance.",
      ],
      kmParagraphs: [
        "អារម្មណ៍គឺជាផ្នែកមួយនៃការជាមនុស្ស។ សេចក្តីរីករាយ ទុក្ខព្រួយ កំហឹង ការភ័យខ្លាច ការខកចិត្ត និងភាពរំភើប សុទ្ធតែជាបទពិសោធន៍អារម្មណ៍ធម្មតា។",
        "ទោះជាយ៉ាងណា ការកំណត់ថាតើអ្នកកំពុងមានអារម្មណ៍យ៉ាងណា មិនមែនតែងតែងាយស្រួលនោះទេ។ ពេលខ្លះ យើងនិយាយថា «ខ្ញុំមិនអីទេ» ទោះបីជាយើងមានអារម្មណ៍ធុញថប់ខ្លាំងក៏ដោយ។ ពេលខ្លះទៀត យើងខឹង នៅពេលដែលការពិតយើងកំពុងខកចិត្ត ព្រួយបារម្ភ ឬឈឺចាប់។",
        "ការរៀនប្រាប់ឈ្មោះអារម្មណ៍របស់អ្នក អាចជួយឱ្យអ្នកយល់ពីអ្វីដែលអ្នកកំពុងជួបប្រទះ។ នៅពេលអ្នកសម្គាល់ឃើញការផ្លាស់ប្តូរអារម្មណ៍ សូមផ្អាកបន្តិច ហើយសាកល្បងវិធីសាមញ្ញបីជំហាននេះ [1]៖",
        "ជំហានទី ១៖ តើខ្ញុំកំពុងមានអារម្មណ៍យ៉ាងណា? ព្យាយាមពណ៌នាអារម្មណ៍នោះឱ្យបានជាក់លាក់តាមដែលអាចធ្វើបាន។ ជំនួសឱ្យការនិយាយថា «ខ្ញុំមានអារម្មណ៍មិនល្អ» អ្នកអាចនិយាយថា៖ ខ្ញុំមានអារម្មណ៍ខកចិត្ត ភ័យ ឯកោ ធុញថប់ខ្លាំង ឬមួម៉ៅ។",
        "ជំហានទី ២៖ តើមានអ្វីកើតឡើងមុនពេលខ្ញុំមានអារម្មណ៍បែបនេះ? គិតអំពីអ្វីដែលបានកើតឡើងនៅពេលអារម្មណ៍នោះចាប់ផ្តើម។ តើនរណាម្នាក់បាននិយាយអ្វីដែលធ្វើឱ្យអ្នកឈឺចាប់ដែរឬទេ? តើអ្នកព្រួយបារម្ភអំពីការប្រឡងដែលជិតមកដល់ឬ? តើអ្នកកំពុងព្យាយាមបំពេញការរំពឹងទុកច្រើនពេកមែនទេ?",
        "ជំហានទី ៣៖ តើខ្ញុំអាចត្រូវការអ្វីនៅពេលនេះ? អារម្មណ៍ផ្សេងៗគ្នា អាចចង្អុលបង្ហាញពីតម្រូវការខុសៗគ្នា។ ការមានអារម្មណ៍ធុញថប់ខ្លាំង អាចមានន័យថាអ្នកត្រូវការសម្រាក ឬត្រូវការជំនួយក្នុងការងារ។ ការមានអារម្មណ៍ឯកោ អាចមានន័យថាអ្នកត្រូវការការប្រាស្រ័យទាក់ទងជាមួយមនុស្សដែលអ្នកទុកចិត្ត។ ការព្រួយបារម្ភ អាចមានន័យថាអ្នកត្រូវការព័ត៌មានបន្ថែម ឬការលើកទឹកចិត្ត។",
      ],
      alertBox: {
        type: "tip",
        text: "Your emotions provide useful information, but they do not always tell the whole story. Give yourself time to understand them before making important decisions.",
        kmText:
          "អារម្មណ៍របស់អ្នកផ្តល់ព័ត៌មានដ៏មានប្រយោជន៍ ប៉ុន្តែវាមិនតែងតែប្រាប់រឿងរ៉ាវទាំងអស់នោះទេ។ ទុកពេលឱ្យខ្លួនឯងយល់ពីអារម្មណ៍ទាំងនោះ មុននឹងធ្វើការសម្រេចចិត្តសំខាន់ៗ។",
      },
      keyPoints: [
        "All emotions are normal human responses, including anger and sadness.",
        "Naming specific emotions helps you move past \"I'm fine\" [1].",
        "A three step check in connects what you feel with what you need.",
      ],
      kmKeyPoints: [
        "អារម្មណ៍ទាំងអស់សុទ្ធតែជាការឆ្លើយតបធម្មតារបស់មនុស្ស រួមទាំងកំហឹង និងការកើតទុក្ខផងដែរ។",
        "ការប្រាប់ឈ្មោះអារម្មណ៍ជាក់លាក់ ជួយឱ្យអ្នកយល់ច្បាស់ជាងការគ្រាន់តែនិយាយថា «ខ្ញុំមិនអីទេ» [1]។",
        "ការពិនិត្យមើលខ្លួនឯងបីជំហាន ជួយផ្សារភ្ជាប់រវាងអ្វីដែលអ្នកមានអារម្មណ៍ និងអ្វីដែលអ្នកត្រូវការ។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Understand Your Thoughts",
      kmTitle: "ស្វែងយល់ពីគំនិតរបស់អ្នក",
      type: "reading",
      paragraphs: [
        "Our thoughts influence how we interpret situations and how we feel about them.",
        "Imagine you send a message to a friend, but they do not reply for several hours. You might think: \"Maybe they are busy.\" Or you might think: \"Maybe I did something wrong,\" or \"Maybe they do not want to talk to me.\"",
        "The situation is exactly the same, but your interpretation completely changes how you feel. Sometimes our minds make quick assumptions, especially when we are stressed, tired or worried.",
        "When a thought makes you feel upset, learn to question it with four gentle questions:\n1. What am I telling myself about this situation?\n2. Do I know for certain this is true, or am I making an assumption?\n3. Is there another possible explanation?\n4. What would I tell a close friend who had this exact thought?",
        "For example, if your initial thought is, \"I failed one exam, so I will never succeed,\" a more balanced thought might be, \"I am disappointed about this exam, but one result does not determine my whole future. I can learn from my mistakes and prepare differently next time.\"",
        "The purpose is not to force yourself to think positively all the time. It is to give yourself a fairer and more realistic view of the situation.",
      ],
      kmParagraphs: [
        "គំនិតរបស់យើងមានឥទ្ធិពលលើរបៀបដែលយើងបកស្រាយស្ថានភាពនានា និងរបៀបដែលយើងមានអារម្មណ៍ចំពោះស្ថានភាពទាំងនោះ។",
        "ស្រមៃថាអ្នកផ្ញើសារទៅកាន់មិត្តភក្តិម្នាក់ ប៉ុន្តែពួកគេមិនបានឆ្លើយតបអស់រយៈពេលជាច្រើនម៉ោង។ អ្នកអាចគិតថា៖ «ប្រហែលជាពួកគេកំពុងរវល់»។ ឬអ្នកអាចគិតថា៖ «ប្រហែលជាខ្ញុំបានធ្វើអ្វីខុសហើយ» ឬ «ប្រហែលជាពួកគេលែងចង់និយាយជាមួយខ្ញុំ»។",
        "ស្ថានភាពគឺដូចគ្នាបេះបិទ ប៉ុន្តែការបកស្រាយរបស់អ្នកបានផ្លាស់ប្តូរអារម្មណ៍របស់អ្នកទាំងស្រុង។ ពេលខ្លះ ចិត្តរបស់យើងធ្វើការសន្មតយ៉ាងលឿន ជាពិសេសនៅពេលដែលយើងតានតឹង ហត់នឿយ ឬព្រួយបារម្ភ។",
        "នៅពេលដែលគំនិតណាមួយធ្វើឱ្យអ្នកពិបាកចិត្ត សូមរៀនចោទសួរវាដោយសំណួរសាមញ្ញបួនយ៉ាង៖\n១. តើខ្ញុំកំពុងប្រាប់ខ្លួនឯងយ៉ាងណាអំពីស្ថានភាពនេះ?\n២. តើខ្ញុំដឹងច្បាស់ថាវាជាការពិត ឬខ្ញុំគ្រាន់តែសន្មតដោយខ្លួនឯង?\n៣. តើអាចមានការពន្យល់ផ្សេងទៀតដែរឬទេ?\n៤. តើខ្ញុំនឹងប្រាប់មិត្តភក្តិជិតស្និទ្ធយ៉ាងណា ប្រសិនបើពួកគេមានគំនិតបែបនេះដែរ?",
        "ឧទាហរណ៍ ប្រសិនបើគំនិតដំបូងរបស់អ្នកគឺ «ខ្ញុំធ្លាក់ការប្រឡងមួយ ដូច្នេះខ្ញុំនឹងមិនអាចជោគជ័យបានឡើយ» គំនិតដែលមានតុល្យភាពជាងនេះអាចជា «ខ្ញុំខកចិត្តចំពោះការប្រឡងនេះ ប៉ុន្តែលទ្ធផលមួយនេះមិនកំណត់អនាគតទាំងមូលរបស់ខ្ញុំទេ។ ខ្ញុំអាចរៀនពីកំហុស ហើយត្រៀមខ្លួនឱ្យខុសពីមុននៅពេលក្រោយ»។",
        "គោលបំណង មិនមែនជាការបង្ខំខ្លួនឯងឱ្យគិតវិជ្ជមានគ្រប់ពេលវេលានោះទេ។ វាគឺដើម្បីផ្តល់ឱ្យខ្លួនអ្នកនូវទស្សនៈដែលយុត្តិធម៌ និងស្របតាមការពិតជាងមុន។",
      ],
      keyPoints: [
        "How you interpret a situation shapes how you feel about it.",
        "Stress and fatigue make our minds jump to quick assumptions.",
        "A balanced thought is not fake positivity: it is a realistic and fair perspective.",
      ],
      kmKeyPoints: [
        "របៀបដែលអ្នកបកស្រាយស្ថានភាព កំណត់នូវអារម្មណ៍របស់អ្នកចំពោះស្ថានភាពនោះ។",
        "ភាពតានតឹង និងការហត់នឿយ ធ្វើឱ្យចិត្តរបស់យើងឆាប់សន្មតសេចក្តីសន្និដ្ឋានភ្លាមៗ។",
        "គំនិតដែលមានតុល្យភាព មិនមែនជាការគិតវិជ្ជមានក្លែងក្លាយទេ៖ វាជាទស្សនៈដែលស្របតាមការពិត និងយុត្តិធម៌។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "What Affects Your Mood",
      kmTitle: "អ្វីដែលប៉ះពាល់ដល់អារម្មណ៍របស់អ្នក",
      type: "reading",
      paragraphs: [
        "Your mood can be influenced by many things, including your surroundings, relationships, daily habits, responsibilities and physical health.",
        "For young people in Cambodia, common sources of pressure often include [2, 3]:\n• Studies and work: exams, assignments, job duties or uncertainty about future career paths.\n• Family expectations: feeling pressure to meet family goals, support parents or manage responsibilities at home.\n• Relationships: disagreements with friends, misunderstandings, loneliness or feeling unsupported.\n• Social media: comparing your life, appearance or achievements with people online.\n• Daily habits: sleeping late, skipping meals or having very little time to rest.",
        "Not everyone is affected by the same things in the same way. One person may feel motivated by a busy schedule, while another feels overwhelmed by it. Neither reaction means that one person is better or stronger than the other.",
        "Over time, you can begin to notice your personal patterns. For example: \"When I sleep late and have several assignments due, I become more impatient with my family.\"",
        "Recognizing a pattern helps you decide what small adjustment might support your wellbeing. You do not need to fix everything at once. Start by simply noticing what happens.",
      ],
      kmParagraphs: [
        "អារម្មណ៍របស់អ្នកអាចរងឥទ្ធិពលពីកត្តាជាច្រើន រួមទាំងបរិយាកាសជុំវិញខ្លួន ទំនាក់ទំនង ទម្លាប់ប្រចាំថ្ងៃ ការទទួលខុសត្រូវ និងសុខភាពរាងកាយ។\n• ការសិក្សា និងការងារ៖ ការប្រឡង កិច្ចការសាលា ភារកិច្ចការងារ ឬភាពមិនច្បាស់លាស់អំពីផ្លូវអាជីពនាពេលអនាគត។\n• ការរំពឹងទុករបស់គ្រួសារ៖ អារម្មណ៍តានតឹងក្នុងការបំពេញបំណងគ្រួសារ ការជួយសម្រាលបន្ទុកឪពុកម្តាយ ឬការគ្រប់គ្រងការទទួលខុសត្រូវក្នុងផ្ទះ។\n• ទំនាក់ទំនង៖ ការខ្វែងគំនិតជាមួយមិត្តភក្តិ ការយល់ច្រឡំ ភាពឯកោ ឬអារម្មណ៍ថាមិនមានអ្នកគាំទ្រ។\n• បណ្តាញសង្គម៖ ការប្រៀបធៀបជីវិត រូបរាង ឬសមិទ្ធផលផ្ទាល់ខ្លួន ជាមួយមនុស្សនៅលើអ៊ីនធឺណិត។\n• ទម្លាប់ប្រចាំថ្ងៃ៖ ការគេងយប់ជ្រៅ ការរំលងអាហារ ឬការមានពេលតិចតួចពេកសម្រាប់សម្រាក។",
        "មិនមែនគ្រប់គ្នាសុទ្ធតែរងផលប៉ះពាល់ដោយកត្តាដូចគ្នា តាមរបៀបដូចគ្នានោះទេ។ មនុស្សម្នាក់អាចមានកម្លាំងចិត្តពីកាលវិភាគដ៏មមាញឹក ខណៈដែលមនុស្សម្នាក់ទៀតមានអារម្មណ៍ធុញថប់ខ្លាំងដោយសារវា។ ប្រតិកម្មទាំងពីរនេះ មិនមែនមានន័យថាម្នាក់ល្អ ឬរឹងមាំជាងម្នាក់ទៀតនោះឡើយ។",
        "យូរៗទៅ អ្នកអាចចាប់ផ្តើមកត់សម្គាល់ឃើញទម្លាប់ផ្ទាល់ខ្លួនរបស់អ្នក។ ឧទាហរណ៍៖ «នៅពេលខ្ញុំគេងយប់ជ្រៅ ហើយមានកិច្ចការសាលាច្រើន ខ្ញុំប្រែជាឆាប់ខឹងជាមួយគ្រួសារ»។",
        "ការសម្គាល់ឃើញទម្លាប់ទាំងនេះ ជួយឱ្យអ្នកសម្រេចចិត្តថាតើការកែសម្រួលតូចមួយណាដែលអាចជួយដល់សុខុមាលភាពរបស់អ្នកបាន។ អ្នកមិនចាំបាច់កែប្រែអ្វីៗទាំងអស់ក្នុងពេលតែមួយនោះទេ។ ចាប់ផ្តើមដោយគ្រាន់តែកត់សម្គាល់អ្វីដែលកើតឡើង។",
      ],
      keyPoints: [
        "Exams, family responsibilities, social media and sleep routines all shape your mood [2, 3].",
        "Different people respond differently: neither response makes you weaker.",
        "Noticing personal patterns is the foundation for making gentle changes.",
      ],
      kmKeyPoints: [
        "ការប្រឡង ការទទួលខុសត្រូវក្នុងគ្រួសារ បណ្តាញសង្គម និងការគេង សុទ្ធតែកំណត់អារម្មណ៍របស់អ្នក [2, 3]។",
        "មនុស្សផ្សេងគ្នាឆ្លើយតបខុសៗគ្នា៖ គ្មានប្រតិកម្មណាមួយដែលបង្ហាញថាអ្នកទន់ខ្សោយនោះទេ។",
        "ការសម្គាល់ឃើញទម្លាប់ផ្ទាល់ខ្លួន គឺជាមូលដ្ឋានគ្រឹះសម្រាប់ការផ្លាស់ប្តូរជាវិជ្ជមាន។",
      ],
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "Discover Your Needs and Values",
      kmTitle: "ស្វែងយល់ពីតម្រូវការ និងគុណតម្លៃរបស់អ្នក",
      type: "reading",
      paragraphs: [
        "Understanding yourself also means knowing what helps you function well and what truly matters to you.",
        "Your needs are things that support your health and emotional stability. They may include: getting enough sleep and rest, feeling safe and respected, having someone who listens without judgment, having quiet time alone to recharge, receiving guidance when facing a difficult problem, and feeling connected to friends and community.",
        "Needing support is a normal part of being human. Everyone needs backup at different times in life.",
        "Your values are the core principles that guide how you want to live. For example, you may value family, education, honesty, friendship, kindness, independence, personal growth or helping others.",
        "Knowing your values helps you make choices that feel authentic to who you are. However, values can sometimes feel like they pull in different directions. In Cambodia, you might want to make your parents proud while also wanting to pursue an interest of your own [2, 3].",
        "It is completely normal to need time to navigate these situations. You can honor your family and care deeply about their guidance while still learning to understand your own personal path.",
      ],
      kmParagraphs: [
        "ការយល់ដឹងពីខ្លួនឯង ក៏មានន័យថាដឹងពីអ្វីដែលជួយឱ្យអ្នករស់នៅបានល្អ និងអ្វីដែលពិតជាមានសារៈសំខាន់ចំពោះអ្នកផងដែរ។",
        "តម្រូវការរបស់អ្នក គឺជាអ្វីៗដែលជួយទ្រទ្រង់សុខភាព និងស្ថិរភាពផ្លូវចិត្តរបស់អ្នក។ ពួកវាអាចរួមមាន៖ ការគេង និងការសម្រាកបានគ្រប់គ្រាន់ អារម្មណ៍មានសុវត្ថិភាព និងទទួលបានការគោរព ការមានមនុស្សដែលស្តាប់ដោយមិនវិនិច្ឆ័យ ការមានពេលវេលាស្ងប់ស្ងាត់ម្នាក់ឯងដើម្បីស្តារថាមពល ការទទួលបានការណែនាំពេលជួបបញ្ហាលំបាក និងអារម្មណ៍មានទំនាក់ទំនងជាមួយមិត្តភក្តិ និងសហគមន៍។",
        "ការត្រូវការការគាំទ្រ គឺជាផ្នែកធម្មតានៃការជាមនុស្ស។ មនុស្សគ្រប់គ្នាសុទ្ធតែត្រូវការជំនួយនៅពេលវេលាផ្សេងៗគ្នាក្នុងជីវិត។",
        "គុណតម្លៃរបស់អ្នក គឺជាគោលការណ៍គ្រឹះដែលណែនាំពីរបៀបដែលអ្នកចង់រស់នៅ។ ឧទាហរណ៍ អ្នកអាចឱ្យតម្លៃលើគ្រួសារ ការអប់រំ ភាពស្មោះត្រង់ មិត្តភាព ចិត្តសប្បុរស ភាពម្ចាស់ការលើខ្លួនឯង ការរីកចម្រើនផ្ទាល់ខ្លួន ឬការជួយអ្នកដទៃ។",
        "ការស្គាល់គុណតម្លៃរបស់ខ្លួន ជួយឱ្យអ្នកធ្វើការសម្រេចចិត្តដែលស្របនឹងអ្វីដែលអ្នកចង់ក្លាយជា។ ប៉ុន្តែ ពេលខ្លះគុណតម្លៃអាចហាក់ដូចជាមានការខ្វែងគំនិតគ្នា។ នៅកម្ពុជា អ្នកអាចចង់ធ្វើឱ្យឪពុកម្តាយមានមោទនភាព ខណៈពេលដែលអ្នកក៏ចង់បន្តនូវចំណង់ចំណូលចិត្តផ្ទាល់ខ្លួនរបស់អ្នកដែរ [2, 3]។",
        "វាជារឿងធម្មតាទាំងស្រុងដែលត្រូវការពេលវេលាដើម្បីដោះស្រាយស្ថានភាពទាំងនេះ។ អ្នកអាចគោរពគ្រួសារ និងយកចិត្តទុកដាក់ចំពោះការណែនាំរបស់ពួកគាត់ ខណៈពេលដែលនៅតែរៀនយល់ពីមាគ៌ាផ្ទាល់ខ្លួនរបស់អ្នក។",
      ],
      keyPoints: [
        "Needs support your stability: rest, safety, respect, connection and guidance.",
        "Values are your compass: they guide your decisions and personal goals.",
        "Honoring family and understanding your own path can grow together [2, 3].",
      ],
      kmKeyPoints: [
        "តម្រូវការជួយទ្រទ្រង់ស្ថិរភាពរបស់អ្នក៖ ការសម្រាក សុវត្ថិភាព ការគោរព ការប្រាស្រ័យទាក់ទង និងការណែនាំ។",
        "គុណតម្លៃជាត្រីវិស័យរបស់អ្នក៖ ពួកវាណែនាំការសម្រេចចិត្ត និងគោលដៅផ្ទាល់ខ្លួនរបស់អ្នក។",
        "ការគោរពគ្រួសារ និងការយល់ដឹងពីផ្លូវផ្ទាល់ខ្លួន អាចរីកចម្រើនទៅជាមួយគ្នាបាន [2, 3]។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "Check In: Notice How You Respond",
      kmTitle: "ការឆ្លុះបញ្ចាំង៖ សម្គាល់របៀបដែលអ្នកឆ្លើយតប",
      type: "reflection",
      paragraphs: [
        "Take a quiet moment to reflect on how you typically respond when life feels difficult or stressful.",
        "There are no right or wrong answers. This question is for your personal awareness.",
      ],
      kmParagraphs: [
        "ឆ្លៀតពេលស្ងប់ស្ងាត់បន្តិច ដើម្បីឆ្លុះបញ្ចាំងពីរបៀបដែលអ្នកតែងតែឆ្លើយតប នៅពេលជីវិតមានភាពលំបាក ឬតានតឹង។",
        "គ្មានចម្លើយណាត្រូវ ឬខុសនោះទេ។ សំណួរនេះគឺសម្រាប់ការដឹងពីខ្លួនឯងប៉ុណ្ណោះ។",
      ],
      reflection: {
        question: "When you feel stressed or upset, what do you usually do first?",
        kmQuestion: "នៅពេលអ្នកមានអារម្មណ៍តានតឹង ឬពិបាកចិត្ត តើអ្នកតែងតែធ្វើអ្វីមុនគេ?",
        options: [
          "I say 'I am fine' and keep going",
          "I become quiet and withdraw",
          "I feel irritated or frustrated",
          "I reach out to someone I trust",
          "I pause and check what I need",
        ],
        kmOptions: [
          "ខ្ញុំនិយាយថា «ខ្ញុំមិនអីទេ» ហើយបន្តទៅមុខទៀត",
          "ខ្ញុំនៅស្ងៀម ហើយនៅដាច់ដោយឡែក",
          "ខ្ញុំមានអារម្មណ៍មួម៉ៅ ឬឆាប់ខឹង",
          "ខ្ញុំស្វែងរកជំនួយពីមនុស្សដែលខ្ញុំទុកចិត្ត",
          "ខ្ញុំផ្អាកបន្តិច ហើយពិនិត្យមើលអ្វីដែលខ្ញុំត្រូវការ",
        ],
        feedbackMessage:
          "Thank you for noticing your response. Whatever you chose, recognizing your natural tendency without blaming yourself is the first step toward greater self awareness.",
        kmFeedbackMessage:
          "អរគុណដែលបានសម្គាល់ឃើញប្រតិកម្មរបស់អ្នក។ មិនថាអ្នកបានជ្រើសរើសអ្វីទេ ការទទួលស្គាល់ទំនោរធម្មជាតិរបស់អ្នកដោយមិនបន្ទោសខ្លួនឯង គឺជាជំហានដំបូងឆ្ពោះទៅរកការយល់ដឹងពីខ្លួនឯងកាន់តែច្បាស់។",
      },
      keyPoints: [
        "Noticing your immediate reaction gives you insight into your coping style.",
        "Self awareness starts with observing your habits without judgment.",
      ],
      kmKeyPoints: [
        "ការសម្គាល់ឃើញប្រតិកម្មភ្លាមៗរបស់អ្នក ផ្តល់ការយល់ដឹងពីរបៀបដែលអ្នកទប់ទល់នឹងបញ្ហា។",
        "ការយល់ដឹងពីខ្លួនឯង ចាប់ផ្តើមពីការសង្កេតមើលទម្លាប់របស់ខ្លួន ដោយមិនមានការវិនិច្ឆ័យ។",
      ],
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "When It Feels Difficult",
      kmTitle: "នៅពេលមានអារម្មណ៍ថាពិបាកយល់ពីខ្លួនឯង",
      type: "reading",
      paragraphs: [
        "If you find it hard to understand yourself, that is completely normal.",
        "You may find it difficult to name your emotions, explain what you need, or figure out why certain situations affect you so strongly. Sometimes, self reflection can also uncover feelings you would rather not look at.",
        "You do not have to solve everything immediately. Give yourself permission to take it slowly:\n• Write your thoughts down on paper if speaking feels difficult.\n• Talk with someone you trust when you feel ready.\n• Avoid judging yourself for experiencing difficult emotions.",
        "In Cambodia, some people feel uncomfortable discussing emotional health because they worry about being misunderstood, judged or thought of as weak [2, 3]. It is okay to start small. Choose one safe, trusted person and share only what feels comfortable.",
        "If your feelings feel persistent, overwhelming or get in the way of your daily responsibilities, remember that professional counselors and psychologists are trained to help you sort through them in confidence. [4]",
        "Understanding yourself is a lifelong journey, not a test you need to pass.",
      ],
      kmParagraphs: [
        "ប្រសិនបើអ្នកមានអារម្មណ៍ថាពិបាកយល់ពីខ្លួនឯង នោះជារឿងធម្មតាទាំងស្រុង។",
        "អ្នកអាចពិបាកប្រាប់ឈ្មោះអារម្មណ៍ ពន្យល់ពីអ្វីដែលអ្នកត្រូវការ ឬដឹងពីមូលហេតុដែលស្ថានភាពខ្លះជះឥទ្ធិពលខ្លាំងលើអ្នក។ ពេលខ្លះ ការឆ្លុះបញ្ចាំងមើលខ្លួនឯង ក៏អាចបង្ហាញឱ្យឃើញនូវអារម្មណ៍ដែលអ្នកចង់គេចវេះផងដែរ។",
        "អ្នកមិនចាំបាច់ដោះស្រាយអ្វីៗទាំងអស់ភ្លាមៗនោះទេ។ ផ្តល់ការអនុញ្ញាតឱ្យខ្លួនឯងធ្វើវាដោយសន្សឹមៗ៖\n• កត់ត្រាគំនិតរបស់អ្នកលើក្រដាស ប្រសិនបើការនិយាយមានអារម្មណ៍ថាពិបាក។\n• និយាយជាមួយមនុស្សដែលអ្នកទុកចិត្ត នៅពេលអ្នកមានអារម្មណ៍ថាត្រៀមខ្លួនរួចរាល់។\n• ជៀសវាងការបន្ទោសខ្លួនឯងចំពោះការមានអារម្មណ៍ពិបាកៗ។",
        "នៅកម្ពុជា មនុស្សមួយចំនួនមានអារម្មណ៍មិនស្រួលចិត្តក្នុងការពិភាក្សាអំពីសុខភាពផ្លូវចិត្ត ព្រោះពួកគេបារម្ភពីការយល់ច្រឡំ ការវិនិច្ឆ័យ ឬការគិតថាខ្លួនទន់ខ្សោយ [2, 3]។ វាជារឿងធម្មតាដែលត្រូវចាប់ផ្តើមពីតូចៗ។ ជ្រើសរើសមនុស្សម្នាក់ដែលមានសុវត្ថិភាព និងគួរឱ្យទុកចិត្ត ហើយចែករំលែកតែអ្វីដែលអ្នកមានអារម្មណ៍ថាស្រួលចិត្តប៉ុណ្ណោះ។",
        "ប្រសិនបើអារម្មណ៍របស់អ្នកនៅជាប់យូរ ធ្ងន់ធ្ងរខ្លាំង ឬរំខានដល់ការទទួលខុសត្រូវប្រចាំថ្ងៃរបស់អ្នក សូមចងចាំថាអ្នកប្រឹក្សា និងអ្នកជំនាញចិត្តសាស្ត្រ ត្រូវបានបណ្តុះបណ្តាលដើម្បីជួយអ្នកដោះស្រាយរឿងទាំងនេះដោយការសម្ងាត់។ [4]",
        "ការយល់ដឹងពីខ្លួនឯង គឺជាដំណើរពេញមួយជីវិត មិនមែនជាការប្រឡងដែលអ្នកត្រូវតែជាប់នោះទេ។",
      ],
      keyPoints: [
        "It is normal to find self reflection confusing or uncomfortable at first.",
        "Share with safe people at your own pace without pressure [2, 3].",
        "Professional support is always available when emotions feel overwhelming [4].",
      ],
      kmKeyPoints: [
        "វាជារឿងធម្មតាដែលយល់ថាការឆ្លុះបញ្ចាំងមើលខ្លួនឯងមានការភាន់ច្រឡំ ឬមិនស្រួលចិត្តនៅពេលដំបូង។",
        "ចែករំលែកជាមួយមនុស្សដែលមានសុវត្ថិភាព តាមលទ្ធភាពរបស់អ្នក ដោយគ្មានសម្ពាធ [2, 3]។",
        "ជំនួយពីអ្នកជំនាញតែងតែមានជានិច្ច នៅពេលអារម្មណ៍មានភាពធ្ងន់ធ្ងរខ្លាំង [4]។",
      ],
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "Your Self-Reflection Journal",
      kmTitle: "កំណត់ហេតុឆ្លុះបញ្ចាំងផ្ទាល់ខ្លួនរបស់អ្នក",
      type: "reflection",
      paragraphs: [
        "Take a quiet moment to reflect on these questions. You can write your answers privately in a notebook or journal:\n1. What emotion have I experienced most often recently?\n2. What situations tend to affect my mood the most?\n3. When I feel stressed or upset, what do I usually do?\n4. What helps me feel safe, calm or supported?\n5. What is one thing I would like to understand better about myself?\n6. What is one small thing I can do this week to support my wellbeing?",
        "You can skip any question that feels uncomfortable. You do not have to share your answers with anyone. These questions are for your personal reflection, not a psychological test.",
      ],
      kmParagraphs: [
        "ឆ្លៀតពេលស្ងប់ស្ងាត់បន្តិច ដើម្បីគិតពិចារណាលើសំណួរទាំងនេះ។ អ្នកអាចកត់ត្រាចម្លើយដោយសម្ងាត់នៅក្នុងសៀវភៅ ឬកំណត់ហេតុផ្ទាល់ខ្លួន៖\n១. តើអារម្មណ៍មួយណាដែលខ្ញុំជួបប្រទះញឹកញាប់បំផុតថ្មីៗនេះ?\n២. តើស្ថានភាពណាខ្លះដែលតែងតែប៉ះពាល់ដល់អារម្មណ៍របស់ខ្ញុំខ្លាំងបំផុត?\n៣. នៅពេលខ្ញុំមានអារម្មណ៍តានតឹង ឬពិបាកចិត្ត តើខ្ញុំតែងតែធ្វើអ្វី?\n៤. តើអ្វីខ្លះដែលជួយឱ្យខ្ញុំមានអារម្មណ៍សុវត្ថិភាព ស្ងប់ចិត្ត ឬមានអ្នកគាំទ្រ?\n៥. តើអ្វីជារឿងមួយដែលខ្ញុំចង់យល់ពីខ្លួនឯងឱ្យកាន់តែច្បាស់?\n៦. តើអ្វីជាសកម្មភាពតូចមួយដែលខ្ញុំអាចធ្វើបានក្នុងសប្តាហ៍នេះ ដើម្បីជួយដល់សុខុមាលភាពរបស់ខ្ញុំ?",
        "អ្នកអាចរំលងសំណួរណាដែលធ្វើឱ្យអ្នកមិនស្រួលចិត្ត។ អ្នកមិនចាំបាច់ចែករំលែកចម្លើយជាមួយនរណាម្នាក់ឡើយ។ សំណួរទាំងនេះគឺសម្រាប់ការឆ្លុះបញ្ចាំងផ្ទាល់ខ្លួន មិនមែនជាការធ្វើតេស្តចិត្តសាស្ត្រនោះទេ។",
      ],
      reflection: {
        question: "Which area would you like to explore first in your reflection?",
        kmQuestion: "តើផ្នែកមួយណាដែលអ្នកចង់ស្វែងយល់មុនគេក្នុងការឆ្លុះបញ្ចាំងរបស់អ្នក?",
        options: [
          "Naming my emotions",
          "Questioning stressful thoughts",
          "Noticing personal triggers",
          "Honoring my needs and values",
          "Taking small steps for wellbeing",
        ],
        kmOptions: [
          "ការប្រាប់ឈ្មោះអារម្មណ៍របស់ខ្ញុំ",
          "ការចោទសួរគំនិតដែលតានតឹង",
          "ការសម្គាល់កត្តាដែលជះឥទ្ធិពលលើខ្ញុំ",
          "ការគោរពតម្រូវការ និងគុណតម្លៃរបស់ខ្ញុំ",
          "ការបោះជំហានតូចៗសម្រាប់សុខុមាលភាព",
        ],
        feedbackMessage:
          "Choosing one focus helps you start gently. Take your time, write in your journal when you are ready, and celebrate every small step you take toward understanding yourself.",
        kmFeedbackMessage:
          "ការជ្រើសរើសចំណុចផ្តោតមួយ ជួយឱ្យអ្នកចាប់ផ្តើមដោយថ្នមៗ។ កុំប្រញាប់ប្រញាល់ កត់ត្រាក្នុងកំណត់ហេតុនៅពេលអ្នករួចរាល់ ហើយអបអរគ្រប់ជំហានតូចៗដែលអ្នកបោះឆ្ពោះទៅរកការយល់ដឹងពីខ្លួនឯង។",
      },
      keyPoints: [
        "Journaling creates private space to notice what you think and feel.",
        "You are always in control: answer what feels right and skip what does not.",
        "Start with one area that feels most meaningful to you today.",
      ],
      kmKeyPoints: [
        "ការសរសេរកំណត់ហេតុ បង្កើតកន្លែងផ្ទាល់ខ្លួនដើម្បីសម្គាល់នូវអ្វីដែលអ្នកគិត និងមានអារម្មណ៍។",
        "អ្នកតែងតែជាម្ចាស់លើខ្លួនឯងជានិច្ច៖ ឆ្លើយអ្វីដែលសមស្រប ហើយរំលងអ្វីដែលមិនស្រួលចិត្ត។",
        "ចាប់ផ្តើមពីផ្នែកមួយដែលអ្នកយល់ថាមានអត្ថន័យបំផុតសម្រាប់អ្នកនៅថ្ងៃនេះ។",
      ],
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "One Thing to Remember",
      kmTitle: "រឿងមួយដែលត្រូវចងចាំ",
      type: "coping",
      paragraphs: [
        "You do not need to have your whole life figured out today.",
        "You are allowed to change, learn, make mistakes and discover new things about yourself as you grow.",
        "The more you notice your emotions, thoughts, needs and personal patterns, the better equipped you may be to make choices that support your mental wellbeing.",
        "Start small. Be curious about yourself, not critical of yourself.",
        "Choose a next step for today:\n• Practice: try the one minute calming breath below.\n• Read: explore Learn About Stress or Understanding Anxiety.\n• Support: if you are carrying heavy feelings, tap Match Me With A Professional below.",
        "If you ever think about hurting yourself, get help right away. Open Profile and tap Get help now.",
      ],
      kmParagraphs: [
        "អ្នកមិនចាំបាច់មានចម្លើយទាំងអស់សម្រាប់ជីវិតទាំងមូលរបស់អ្នកនៅថ្ងៃនេះនោះទេ។",
        "អ្នកត្រូវបានអនុញ្ញាតឱ្យផ្លាស់ប្តូរ រៀនសូត្រ ធ្វើខុស និងស្វែងរកឃើញរឿងថ្មីៗអំពីខ្លួនអ្នក នៅពេលអ្នកធំធាត់ឡើង។",
        "កាន់តែអ្នកសម្គាល់ឃើញអារម្មណ៍ គំនិត តម្រូវការ និងទម្លាប់ផ្ទាល់ខ្លួនរបស់អ្នក អ្នកកាន់តែមានលទ្ធភាពធ្វើការសម្រេចចិត្តដែលគាំទ្រដល់សុខុមាលភាពផ្លូវចិត្តរបស់អ្នក។",
        "ចាប់ផ្តើមពីតូចៗ។ ចូរមានការចង់ដឹងអំពីខ្លួនឯង ជាជាងការរិះគន់បន្ទោសខ្លួនឯង។",
        "ជ្រើសរើសជំហានបន្ទាប់សម្រាប់ថ្ងៃនេះ៖\n• អនុវត្ត៖ សាកល្បងការហាត់ដកដង្ហើមស្ងប់ចិត្ត ១ នាទីខាងក្រោម។\n• អាន៖ ស្វែងយល់បន្ថែមក្នុងមេរៀន ស្វែងយល់ពីភាពតានតឹង ឬ ស្វែងយល់ពីការថប់បារម្ភ។\n• ការគាំទ្រ៖ ប្រសិនបើអ្នកកំពុងមានអារម្មណ៍ធ្ងន់ធ្ងរ សូមចុច «ស្វែងរកអ្នកជំនាញ (Match Me)» ខាងក្រោម។",
        "ប្រសិនបើអ្នកធ្លាប់គិតចង់ធ្វើបាបខ្លួនឯង សូមស្វែងរកជំនួយភ្លាមៗ។ បើកទំព័រប្រវត្តិរូប (Profile) ហើយចុច «ជំនួយបន្ទាន់ (Get help now)»។",
      ],
      actions: [
        { label: "Practice Calm Breathing", kmLabel: "ហាត់ដកដង្ហើមស្ងប់ចិត្ត (Breathing)", actionType: "exercise" },
        { label: "Explore Mental Health Tips", kmLabel: "ស្វែងយល់គន្លឹះថែទាំចិត្ត (Tips)", actionType: "tips" },
        { label: "Find a Professional (Match Me)", kmLabel: "ស្វែងរកអ្នកជំនាញ (Match Me)", actionType: "professional" },
      ],
      keyPoints: [
        "You do not need to have everything figured out to make progress.",
        "Curiosity towards yourself opens the door to self understanding.",
        "Reaching out for help is a sign of wisdom and self care [4].",
      ],
      kmKeyPoints: [
        "អ្នកមិនចាំបាច់ដឹងអ្វីៗទាំងអស់ ទើបអាចមានការរីកចម្រើននោះទេ។",
        "ការចង់ដឹងអំពីខ្លួនឯង បើកទ្វារឆ្ពោះទៅរកការយល់ដឹងពីខ្លួនឯងកាន់តែច្បាស់។",
        "ការស្វែងរកជំនួយ គឺជាសញ្ញានៃភាពវៃឆ្លាត និងការថែទាំខ្លួនឯង [4]។",
      ],
    },
  ],
};

export const REFERENCES_SEEK_HELP: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "NIMH",
    title: "National Institute of Mental Health, Caring for Your Mental Health",
    url: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health",
  },
  {
    id: 2,
    citation: "[2]",
    source: "NIMH",
    title: "National Institute of Mental Health, My Mental Health: Do I Need Help?",
    url: "https://www.nimh.nih.gov/health/publications/my-mental-health-do-i-need-help",
  },
  {
    id: 3,
    citation: "[3]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia, Mental Health",
    url: "https://www.unicef.org/cambodia/mental-health",
  },
  {
    id: 4,
    citation: "[4]",
    source: "WHO",
    title: "World Health Organization, Mental Well-Being Resources for the Public",
    url: "https://www.who.int/news-room/feature-stories/mental-well-being-resources-for-the-public",
  },
];

export const LESSON_KNOW_WHEN_TO_SEEK_HELP: Lesson = {
  id: "know-when-to-seek-help",
  title: "Know When to Seek Help",
  kmTitle: "ដឹងពីពេលវេលាដែលត្រូវស្វែងរកជំនួយ (Know When to Seek Help)",
  subtitle: "Recognize when you need support and learn where to find it",
  kmSubtitle: "ស្គាល់ពីពេលវេលាដែលអ្នកត្រូវការការគាំទ្រ និងរៀនពីកន្លែងដែលត្រូវស្វែងរកវា",
  category: "Basics",
  duration: "6 min",
  kmDuration: "៦ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Reflection",
  kmFormat: "ការអាន និងការឆ្លុះបញ្ចាំង (Reading & Reflection)",
  isAvailable: true,
  image: "/mindguide/icon-10.svg",
  // Photo by Max Bender on Unsplash (Unsplash License), cropped.
  heroImage: "/mindguide/know-when-to-seek-help-hero.jpg",
  description:
    "Recognize when emotional difficulties need extra care, learn how to talk with trusted people or professionals, and discover support options in Cambodia.",
  kmDescription:
    "រៀនសម្គាល់នៅពេលដែលការលំបាកផ្លូវចិត្តត្រូវការការថែទាំបន្ថែម របៀបនិយាយជាមួយមនុស្សដែលទុកចិត្ត ឬអ្នកជំនាញ និងស្គាល់ជម្រើសជំនួយនៅក្នុងប្រទេសកម្ពុជា។",
  totalSections: 9,
  outcomes: [
    {
      en: "Recognizing emotional and physical signs that signal a need for support [1, 2]",
      km: "ការសម្គាល់សញ្ញាអារម្មណ៍ និងរាងកាយដែលបញ្ជាក់ថាត្រូវការការគាំទ្រ [1, 2]",
    },
    {
      en: "Understanding when to try self care and when to speak with a professional [1, 4]",
      km: "ការយល់ដឹងពីពេលវេលាដែលត្រូវសាកល្បងការថែទាំខ្លួនឯង និងពេលវេលាដែលត្រូវពិគ្រោះជាមួយអ្នកជំនាញ [1, 4]",
    },
    {
      en: "How to start a conversation with someone you trust or reach out to a counselor",
      km: "របៀបចាប់ផ្តើមការសន្ទនាជាមួយមនុស្សដែលទុកចិត្ត ឬទាក់ទងទៅកាន់អ្នកប្រឹក្សាផ្លូវចិត្ត",
    },
    {
      en: "Overcoming stigma and identifying supportive mental health services in Cambodia [3]",
      km: "ការជម្នះការមាក់ងាយ និងការស្គាល់សេវាគាំទ្រសុខភាពផ្លូវចិត្តនៅក្នុងប្រទេសកម្ពុជា [3]",
    },
    {
      en: "Crucial steps for handling a crisis or supporting a friend in need",
      km: "ជំហានសំខាន់ៗសម្រាប់ដោះស្រាយវិបត្តិបន្ទាន់ ឬការជួយគាំទ្រមិត្តភក្តិដែលកំពុងជួបការលំបាក",
    },
  ],
  references: REFERENCES_SEEK_HELP,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "When Might You Need More Support?",
      kmTitle: "តើនៅពេលណាដែលអ្នកអាចត្រូវការការគាំទ្របន្ថែម?",
      type: "reading",
      paragraphs: [
        "Everyone experiences difficult moments. You might feel stressed about your studies, worried about your future, lonely in a relationship, or overwhelmed by daily responsibilities.",
        "Sometimes rest, healthy routines and talking with someone you trust can help you feel better. At other times, your feelings may become difficult to manage on your own. Knowing when to seek help is an important part of caring for your mental health.",
        "There is no single way to experience emotional difficulties. Some people notice changes in their feelings, such as frequent sadness, anger or feeling overwhelmed. Others notice changes in their sleep, appetite, or ability to concentrate on work and study. [1, 2]",
        "You might also notice changes in your relationships: withdrawing from friends and family, repeated conflicts, or feeling isolated even around others.",
        "These changes do not automatically mean you have a mental health condition, but when they persist or interfere with your life, seeking support can help you understand what is happening and find a way forward.",
      ],
      kmParagraphs: [
        "មនុស្សគ្រប់គ្នាសុទ្ធតែធ្លាប់ឆ្លងកាត់គ្រាលំបាក។ អ្នកអាចមានអារម្មណ៍តានតឹងរឿងការសិក្សា ព្រួយបារម្ភអំពីអនាគត ឯកោក្នុងទំនាក់ទំនង ឬលើសលប់ដោយសារទំនួលខុសត្រូវប្រចាំថ្ងៃ។",
        "ពេលខ្លះ ការសម្រាក ទម្លាប់ល្អ និងការនិយាយជាមួយមនុស្សដែលទុកចិត្ត អាចជួយឱ្យអ្នកមានអារម្មណ៍ប្រសើរឡើង។ ប៉ុន្តែនៅពេលផ្សេងទៀត អារម្មណ៍របស់អ្នកអាចក្លាយជាពិបាកគ្រប់គ្រងដោយខ្លួនឯង។ ការដឹងពីពេលវេលាដែលត្រូវស្វែងរកជំនួយ គឺជាផ្នែកមួយដ៏សំខាន់ក្នុងការថែទាំសុខភាពផ្លូវចិត្តរបស់អ្នក។",
        "គ្មានទម្រង់តែមួយគត់នៃការជួបប្រទះការលំបាកផ្លូវចិត្តនោះទេ។ មនុស្សមួយចំនួនសម្គាល់ឃើញការផ្លាស់ប្តូរនៅក្នុងអារម្មណ៍ ដូចជាការកើតទុក្ខញឹកញាប់ កំហឹង ឬអារម្មណ៍លើសលប់។ អ្នកខ្លះទៀតសម្គាល់ឃើញការផ្លាស់ប្តូរក្នុងដំណេក ចំណង់អាហារ ឬសមត្ថភាពផ្ដោតលើការរៀន និងការងារ។ [1, 2]",
        "អ្នកក៏អាចកត់សម្គាល់ឃើញការផ្លាស់ប្តូរក្នុងទំនាក់ទំនងផងដែរ ដូចជាការនៅដាច់ដោយឡែកពីមិត្តភក្តិ និងគ្រួសារ ការមានជម្លោះម្តងហើយម្តងទៀត ឬអារម្មណ៍ឯកោទោះបីជានៅក្បែរអ្នកដទៃក៏ដោយ។",
        "ការផ្លាស់ប្តូរទាំងនេះមិនមានន័យថាអ្នកមានជំងឺផ្លូវចិត្តភ្លាមៗនោះទេ ប៉ុន្តែនៅពេលដែលវានៅតែបន្តកើតមាន ឬរំខានដល់ជីវិតប្រចាំថ្ងៃរបស់អ្នក ការស្វែងរកការគាំទ្រអាចជួយឱ្យអ្នកយល់ពីអ្វីដែលកំពុងកើតឡើង និងស្វែងរកផ្លូវទៅមុខ។",
      ],
      keyPoints: [
        "Emotional distress shows up in feelings, physical habits, and relationships [1].",
        "Changes in sleep, appetite, and concentration signal a need to check in [2].",
        "Seeking support early prevents mild difficulties from growing heavier.",
      ],
      kmKeyPoints: [
        "ការពិបាកចិត្តអាចស្តែងចេញតាមរយៈអារម្មណ៍ ទម្លាប់រាងកាយ និងទំនាក់ទំនង [1]។",
        "ការផ្លាស់ប្តូរដំណេក ចំណង់អាហារ និងការផ្ដោតអារម្មណ៍ ជាសញ្ញាដែលត្រូវពិនិត្យមើលខ្លួនឯង [2]។",
        "ការស្វែងរកការគាំទ្រពីដំបូង ជួយការពារកុំឱ្យការលំបាកតូចតាចប្រែជាធ្ងន់ធ្ងរ។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "Should You Wait and See?",
      kmTitle: "តើអ្នកគួររង់ចាំមើលសិនដែរឬទេ?",
      type: "reading",
      paragraphs: [
        "Not necessarily. Some mild emotional difficulties may improve with rest, supportive relationships and healthy daily routines. However, you do not need to wait a specific number of days before reaching out for help.",
        "If your difficulties are mild and recent, focus on getting enough rest, eating regular meals, taking breaks and talking with someone you trust. Notice whether these steps bring relief.",
        "If your difficulties continue, worsen, or begin affecting your daily life and relationships, consider speaking with a qualified mental health professional or healthcare provider. You do not need to prove that your situation is serious enough before asking for an appointment. [1, 2]",
        "The severity of your symptoms and your safety matter far more than how many days or weeks you have felt this way.",
      ],
      kmParagraphs: [
        "មិនចាំបាច់នោះទេ។ ការលំបាកផ្លូវចិត្តកម្រិតស្រាលមួយចំនួន អាចប្រសើរឡើងដោយសារការសម្រាក ទំនាក់ទំនងគាំទ្រ និងទម្លាប់ប្រចាំថ្ងៃល្អ។ ទោះជាយ៉ាងណាក៏ដោយ អ្នកមិនចាំបាច់រង់ចាំចំនួនថ្ងៃជាក់លាក់ណាមួយ មុនពេលស្វែងរកជំនួយនោះទេ។",
        "ប្រសិនបើការលំបាករបស់អ្នកនៅស្រាល និងទើបតែកើតឡើង សូមផ្ដោតលើការសម្រាកឱ្យបានគ្រប់គ្រាន់ ទទួលទានអាហារទៀងទាត់ សម្រាកលំហែ និងនិយាយជាមួយមនុស្សដែលអ្នកទុកចិត្ត។ សង្កេតមើលថាតើជំហានទាំងនេះជួយសម្រាលអារម្មណ៍បានដែរឬទេ។",
        "ប្រសិនបើការលំបាករបស់អ្នកនៅតែបន្ត កាន់តែធ្ងន់ធ្ងរ ឬចាប់ផ្តើមប៉ះពាល់ដល់ជីវិតប្រចាំថ្ងៃ និងទំនាក់ទំនង សូមពិចារណាពិគ្រោះជាមួយអ្នកជំនាញសុខភាពផ្លូវចិត្ត ឬអ្នកផ្តល់សេវាថែទាំសុខភាព។ អ្នកមិនចាំបាច់បញ្ជាក់ថាស្ថានភាពរបស់អ្នកធ្ងន់ធ្ងរខ្លាំង ទើបអាចសុំការណាត់ជួបបាននោះទេ។ [1, 2]",
        "កម្រិតធ្ងន់ធ្ងរនៃរោគសញ្ញា និងសុវត្ថិភាពរបស់អ្នក សំខាន់ជាងចំនួនថ្ងៃ ឬសប្តាហ៍ដែលអ្នកមានអារម្មណ៍បែបនេះ។",
      ],
      alertBox: {
        type: "tip",
        text: "Good to know: You do not need to wait until you reach a breaking point before you deserve help. Seeking guidance early is a proactive act of self care.",
        kmText: "គួរដឹង៖ អ្នកមិនចាំបាច់រង់ចាំរហូតដល់ទ្រាំលែងបាន ទើបសមនឹងទទួលបានជំនួយនោះទេ។ ការស្វែងរកការណែនាំពីដំបូង គឺជាសកម្មភាពដ៏ឆ្លាតវៃក្នុងការថែទាំខ្លួនឯង។",
      },
      keyPoints: [
        "You never have to prove your pain is severe enough to deserve support.",
        "Symptom intensity and safety matter more than how long you have felt upset [2].",
        "Self care routines complement professional care but do not replace it when needed [4].",
      ],
      kmKeyPoints: [
        "អ្នកមិនចាំបាច់បញ្ជាក់ថាការឈឺចាប់របស់អ្នកធ្ងន់ធ្ងរប៉ុនណា ទើបសមនឹងទទួលបានការគាំទ្រនោះទេ។",
        "កម្រិតនៃរោគសញ្ញា និងសុវត្ថិភាព មានសារៈសំខាន់ជាងរយៈពេលដែលអ្នកមានអារម្មណ៍ពិបាកចិត្ត [2]។",
        "ទម្លាប់ថែទាំខ្លួនឯង ជួយបំពេញបន្ថែមដល់ការថែទាំពីអ្នកជំនាញ ប៉ុន្តែមិនអាចជំនួសវាបានទេនៅពេលចាំបាច់ [4]។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Who Can You Talk To?",
      kmTitle: "តើអ្នកអាចនិយាយជាមួយនរណាបានខ្លះ?",
      type: "reading",
      paragraphs: [
        "Seeking help does not always begin with a formal clinic visit. There are different ways to receive support, depending on what you need.",
        "You can start by talking to someone you trust: a close friend, family member, teacher or mentor who listens with respect. You do not have to explain everything at once. You can begin with a simple sentence:\n• \"I have been feeling stressed lately, and I just need someone to listen.\"\n• \"I am going through a difficult time, and I do not want to handle it alone.\"\n• \"You do not need to solve this for me, just being here helps.\"",
        "If the first person you reach out to does not respond supportively, that does not mean your feelings are unimportant. Give yourself permission to reach out to someone else.",
        "You can also speak with a qualified mental health professional, such as a counselor, psychologist or psychiatrist. They provide a confidential space to explore your concerns, understand emotional patterns and learn practical ways to cope. [1, 4]",
        "You can seek professional help because something feels wrong, even if you do not know the clinical name for it.",
      ],
      kmParagraphs: [
        "ការស្វែងរកជំនួយ មិនមែនតែងតែចាប់ផ្តើមដោយការទៅជួបគ្រូពេទ្យនៅគ្លីនិកភ្លាមៗនោះទេ។ មានវិធីជាច្រើនក្នុងការទទួលបានការគាំទ្រ អាស្រ័យលើអ្វីដែលអ្នកត្រូវការ។",
        "អ្នកអាចចាប់ផ្តើមដោយការនិយាយជាមួយមនុស្សដែលអ្នកទុកចិត្ត៖ មិត្តភក្តិជិតស្និទ្ធ សមាជិកគ្រួសារ គ្រូបង្រៀន ឬអ្នកណែនាំដែលស្តាប់ដោយការគោរព។ អ្នកមិនចាំបាច់ពន្យល់អ្វីៗទាំងអស់ក្នុងពេលតែមួយនោះទេ។ អ្នកអាចចាប់ផ្តើមដោយឃ្លាសាមញ្ញមួយ៖\n• «ខ្ញុំមានអារម្មណ៍តានតឹងមួយរយៈនេះ ហើយខ្ញុំគ្រាន់តែត្រូវការអ្នកស្តាប់ប៉ុណ្ណោះ។»\n• «ខ្ញុំកំពុងឆ្លងកាត់គ្រាលំបាក ហើយខ្ញុំមិនចង់ប្រឈមមុខនឹងវាតែម្នាក់ឯងទេ។»\n• «អ្នកមិនចាំបាច់ដោះស្រាយវាជំនួសខ្ញុំទេ គ្រាន់តែនៅទីនេះជាមួយខ្ញុំ គឺជួយបានច្រើនណាស់។»",
        "ប្រសិនបើមនុស្សដំបូងដែលអ្នកទាក់ទង មិនបានឆ្លើយតបដោយការយល់ចិត្ត វាមិនមានន័យថាអារម្មណ៍របស់អ្នកមិនសំខាន់នោះទេ។ សូមផ្តល់ឱកាសឱ្យខ្លួនឯងក្នុងការទាក់ទងទៅកាន់អ្នកផ្សេងទៀត។",
        "អ្នកក៏អាចពិគ្រោះជាមួយអ្នកជំនាញសុខភាពផ្លូវចិត្តដែលមានលក្ខណៈសម្បត្តិគ្រប់គ្រាន់ ដូចជាអ្នកប្រឹក្សាផ្លូវចិត្ត អ្នកចិត្តសាស្រ្ត ឬវិកជ្ជបណ្ឌិត។ ពួកគេផ្តល់នូវទីកន្លែងសម្ងាត់ដើម្បីស្វែងយល់ពីកង្វល់របស់អ្នក យល់ពីទម្រង់អារម្មណ៍ និងរៀនពីវិធីជាក់ស្តែងដើម្បីទប់ទល់។ [1, 4]",
        "អ្នកអាចស្វែងរកជំនួយពីអ្នកជំនាញដោយសារតែអ្នកមានអារម្មណ៍ថាមានអ្វីមួយមិនស្រួល ទោះបីជាអ្នកមិនដឹងឈ្មោះវេជ្ជសាស្ត្ររបស់វាក៏ដោយ។",
      ],
      keyPoints: [
        "Simple sentences make opening up to a trusted person less intimidating.",
        "If one person responds poorly, it is okay to choose another safe listener.",
        "Counselors and psychologists provide private, non-judgmental guidance [4].",
      ],
      kmKeyPoints: [
        "ឃ្លាសាមញ្ញៗជួយឱ្យការបើកចិត្តនិយាយជាមួយមនុស្សដែលទុកចិត្ត មិនមានភាពភ័យខ្លាច។",
        "ប្រសិនបើនរណាម្នាក់ឆ្លើយតបមិនសមរម្យ អ្នកអាចជ្រើសរើសអ្នកស្តាប់ដែលមានសុវត្ថិភាពផ្សេងទៀត។",
        "អ្នកប្រឹក្សា និងអ្នកចិត្តសាស្រ្ត ផ្តល់ការណែនាំជាសម្ងាត់ដោយគ្មានការវិនិច្ឆ័យ [4]។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "Overcoming Hesitation and Stigma",
      kmTitle: "ការជម្នះភាពស្ទាក់ស្ទើរ និងការមាក់ងាយ",
      type: "reading",
      paragraphs: [
        "You might worry that other people will judge you, misunderstand you, or think you cannot handle your own life. You might also believe that you should solve everything completely on your own.",
        "These worries are very common, especially in communities where mental health is rarely discussed openly [3]. But experiencing emotional difficulties does not make you weak, unsuccessful, or less worthy.",
        "You can care about your family, respect other people's opinions, and still acknowledge that you need support.",
        "If seeking help feels intimidating, start with one small step:\n1. Write down what you have been experiencing in a private note.\n2. Identify one person you feel relatively safe talking with.\n3. Share only as much as you feel comfortable sharing.\n4. Ask a trusted friend or family member to help you look for professional options.\n5. Inquire about confidentiality before sharing personal details.",
        "You are allowed to take your time choosing whom to trust.",
      ],
      kmParagraphs: [
        "អ្នកអាចព្រួយបារម្ភថាអ្នកដទៃនឹងវិនិច្ឆ័យអ្នក យល់ច្រឡំលើអ្នក ឬគិតថាអ្នកមិនអាចគ្រប់គ្រងជីវិតខ្លួនឯងបាន។ អ្នកក៏អាចជឿថាអ្នកគួរតែដោះស្រាយអ្វីៗគ្រប់យ៉ាងដោយខ្លួនឯងទាំងស្រុង។",
        "ការព្រួយបារម្ភទាំងនេះកើតមានជាទូទៅ ជាពិសេសនៅក្នុងសហគមន៍ដែលសុខភាពផ្លូវចិត្តកម្រត្រូវបានលើកយកមកពិភាក្សាដោយចំហ [3]។ ប៉ុន្តែការជួបប្រទះការលំបាកផ្លូវចិត្ត មិនធ្វើឱ្យអ្នកក្លាយជាមនុស្សទន់ខ្សោយ បរាជ័យ ឬមានតម្លៃតិចជាងមុននោះទេ។",
        "អ្នកអាចស្រឡាញ់គ្រួសារ គោរពមតិរបស់អ្នកដទៃ ហើយនៅតែអាចទទួលស្គាល់ថាអ្នកត្រូវការការគាំទ្រ។",
        "ប្រសិនបើការស្វែងរកជំនួយមានអារម្មណ៍ថាពិបាកខ្លាំង សូមចាប់ផ្តើមដោយជំហានតូចមួយ៖\n១. កត់ត្រានូវអ្វីដែលអ្នកបានជួបប្រទះក្នុងកំណត់ត្រាឯកជន។\n២. កំណត់មនុស្សម្នាក់ដែលអ្នកមានអារម្មណ៍ថាមានសុវត្ថិភាពក្នុងការនិយាយជាមួយ។\n៣. ចែករំលែកត្រឹមតែកម្រិតណាដែលអ្នកមានអារម្មណ៍ស្រួលចិត្តប៉ុណ្ណោះ។\n៤. សុំឱ្យមិត្តភក្តិ ឬសមាជិកគ្រួសារដែលទុកចិត្ត ជួយអ្នកស្វែងរកជម្រើសអ្នកជំនាញ។\n៥. សាកសួរអំពីការរក្សាការសម្ងាត់ មុនពេលចែករំលែកព័ត៌មានផ្ទាល់ខ្លួន។",
        "អ្នកត្រូវបានអនុញ្ញាតឱ្យចំណាយពេលក្នុងការជ្រើសរើសមនុស្សដែលអ្នកទុកចិត្ត។",
      ],
      keyPoints: [
        "Needing help is a human reality, never a sign of failure or weakness.",
        "Writing down your feelings first can make talking much easier.",
        "You have full control over how much personal information you share.",
      ],
      kmKeyPoints: [
        "ការត្រូវការជំនួយ គឺជាការពិតរបស់មនុស្ស មិនមែនជាសញ្ញានៃការបរាជ័យ ឬភាពទន់ខ្សោយឡើយ។",
        "ការកត់ត្រាអារម្មណ៍របស់អ្នកជាមុន ជួយឱ្យការនិយាយកាន់តែងាយស្រួល។",
        "អ្នកមានសិទ្ធិពេញលេញលើកម្រិតព័ត៌មានផ្ទាល់ខ្លួនដែលអ្នកចង់ចែករំលែក។",
      ],
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "When Someone You Know Needs Help",
      kmTitle: "នៅពេលនរណាម្នាក់ដែលអ្នកស្គាល់ត្រូវការជំនួយ",
      type: "reading",
      paragraphs: [
        "Sometimes we notice that a friend, family member or classmate is struggling before they tell us. They may become unusually quiet, withdraw from social activities, seem persistently down, or struggle with their daily responsibilities.",
        "You do not need to be a psychologist or have all the answers to offer meaningful support.",
        "Start with care: You could say, \"I noticed you seem to be having a hard time lately. I am here if you ever want to talk.\"",
        "Listen without judgment: Let them share at their own pace without interrupting, comparing their difficulties to others, or immediately telling them what they should do.",
        "Ask what would help: For instance, \"Would you like me to just listen, help you think through this, or help you find professional support?\"",
        "Encourage professional help gently: Offer to accompany them or help research options if they feel ready.",
        "Remember: you can support someone with compassion without carrying the responsibility of solving all their problems alone.",
      ],
      kmParagraphs: [
        "ពេលខ្លះ យើងកត់សម្គាល់ឃើញថាមិត្តភក្តិ សមាជិកគ្រួសារ ឬមិត្តរួមថ្នាក់កំពុងជួបការលំបាក មុនពេលពួកគេប្រាប់យើង។ ពួកគេអាចប្រែជាស្ងប់ស្ងាត់ខុសពីធម្មតា ដកខ្លួនចេញពីសកម្មភាពសង្គម មើលទៅស្រពោនចិត្តជាប់រហូត ឬពិបាកបំពេញកាតព្វកិច្ចប្រចាំថ្ងៃ។",
        "អ្នកមិនចាំបាច់ជាអ្នកចិត្តសាស្រ្ត ឬមានចម្លើយទាំងអស់ ទើបអាចផ្តល់ការគាំទ្រប្រកបដោយអត្ថន័យនោះទេ។",
        "ចាប់ផ្តើមដោយក្តីបារម្ភ៖ អ្នកអាចនិយាយថា «ខ្ញុំសម្គាល់ឃើញថាអ្នកហាក់ដូចជាកំពុងជួបការលំបាកមួយរយៈនេះ។ ខ្ញុំនៅទីនេះ ប្រសិនបើអ្នកចង់និយាយគ្នា។»",
        "ស្តាប់ដោយគ្មានការវិនិច្ឆ័យ៖ ទុកឱ្យពួកគេចែករំលែកតាមការសម្រេចចិត្តរបស់ពួកគេ ដោយមិនកាត់សម្តី មិនប្រៀបធៀបការលំបាករបស់ពួកគេទៅនឹងអ្នកដទៃ ឬប្រាប់ភ្លាមៗនូវអ្វីដែលពួកគេគួរធ្វើនោះទេ។",
        "សួរថាតើអ្វីអាចជួយបាន៖ ឧទាហរណ៍ «តើអ្នកចង់ឱ្យខ្ញុំគ្រាន់តែស្តាប់ ជួយគិតពិចារណា ឬជួយស្វែងរកការគាំទ្រពីអ្នកជំនាញ?»",
        "លើកទឹកចិត្តឱ្យស្វែងរកជំនួយពីអ្នកជំនាញដោយទន់ភ្លន់៖ ផ្តល់ការកំដរពួកគេទៅជួបអ្នកជំនាញ ឬជួយស្រាវជ្រាវជម្រើសផ្សេងៗ ប្រសិនបើពួកគេត្រៀមខ្លួនរួចរាល់។",
        "សូមចងចាំថា៖ អ្នកអាចគាំទ្រនរណាម្នាក់ដោយក្តីមេត្តា ដោយមិនចាំបាច់រែកពន់បន្ទុកក្នុងការដោះស្រាយបញ្ហាទាំងអស់របស់ពួកគេតែម្នាក់ឯងឡើយ។",
      ],
      keyPoints: [
        "Notice changes in friends early and approach them with gentle care.",
        "Listening without judgment is more helpful than giving quick advice.",
        "You can support a loved one without taking full responsibility for their recovery.",
      ],
      kmKeyPoints: [
        "សម្គាល់ឃើញការផ្លាស់ប្តូររបស់មិត្តភក្តិឱ្យបានលឿន និងចូលទៅជិតពួកគេដោយក្តីបារម្ភដ៏ទន់ភ្លន់។",
        "ការស្តាប់ដោយគ្មានការវិនិច្ឆ័យ មានប្រយោជន៍ជាងការផ្តល់ដំបូន្មានយ៉ាងលឿនភ្លាមៗ។",
        "អ្នកអាចគាំទ្រមនុស្សជាទីស្រឡាញ់បាន ដោយមិនចាំបាច់ទទួលខុសត្រូវទាំងស្រុងលើការជាសះស្បើយរបស់ពួកគេ។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "When Is It an Emergency?",
      kmTitle: "តើនៅពេលណាដែលជាស្ថានភាពសង្គ្រោះបន្ទាន់?",
      type: "reading",
      paragraphs: [
        "Some situations require immediate medical and safety intervention rather than waiting for a regular appointment.",
        "Seek urgent assistance right away if:\n• You feel you might act on thoughts of suicide or seriously harm yourself.\n• You have already harmed yourself or taken something dangerous.\n• You feel unable to keep yourself or another person safe.\n• You or someone else is experiencing an immediate mental health crisis.",
        "If you are in immediate danger, do not wait for a therapy appointment or rely on an app. Reach out immediately to local emergency medical services, go to the nearest hospital emergency department, or contact a trusted person and ask them to stay with you while you get help.",
        "If you are supporting someone in crisis, take their words seriously. Ask directly if they are thinking about suicide, help them reach urgent medical care, and never leave them alone if their safety is at risk.",
      ],
      kmParagraphs: [
        "ស្ថានភាពមួយចំនួនទាមទារឱ្យមានអន្តរាគមន៍វេជ្ជសាស្ត្រ និងសុវត្ថិភាពជាបន្ទាន់ ជាជាងការរង់ចាំការណាត់ជួបធម្មតា។",
        "សូមស្វែងរកជំនួយបន្ទាន់ភ្លាមៗប្រសិនបើ៖\n• អ្នកមានអារម្មណ៍ថាអ្នកអាចធ្វើតាមគំនិតនៃការធ្វើអត្តឃាត ឬធ្វើបាបខ្លួនឯងយ៉ាងធ្ងន់ធ្ងរ។\n• អ្នកបានធ្វើបាបខ្លួនឯងរួចហើយ ឬបានលេបអ្វីមួយដែលមានគ្រោះថ្នាក់។\n• អ្នកមានអារម្មណ៍ថាមិនអាចរក្សាសុវត្ថិភាពផ្ទាល់ខ្លួន ឬសុវត្ថិភាពរបស់អ្នកដទៃបាន។\n• អ្នក ឬនរណាម្នាក់ផ្សេងទៀតកំពុងជួបប្រទះវិបត្តិសុខភាពផ្លូវចិត្តបន្ទាន់។",
        "ប្រសិនបើអ្នកស្ថិតក្នុងគ្រោះថ្នាក់បន្ទាន់ សូមកុំរង់ចាំការណាត់ជួប ឬពឹងផ្អែកលើកម្មវិធីទូរស័ព្ទឡើយ។ សូមទាក់ទងភ្លាមៗទៅកាន់សេវាសង្គ្រោះបន្ទាន់ក្នុងតំបន់ អញ្ជើញទៅកាន់ផ្នែកសង្គ្រោះបន្ទាន់នៃមន្ទីរពេទ្យដែលនៅជិតបំផុត ឬទាក់ទងមនុស្សដែលអ្នកទុកចិត្ត ហើយសុំឱ្យពួកគេនៅជាមួយអ្នកក្នុងពេលស្វែងរកជំនួយ។",
        "ប្រសិនបើអ្នកកំពុងជួយគាំទ្រនរណាម្នាក់ក្នុងគ្រាមានវិបត្តិ សូមយកចិត្តទុកដាក់លើសម្តីរបស់ពួកគេដោយហ្មត់ចត់។ សួរបញ្ជាក់ដោយផ្ទាល់ថាតើពួកគេកំពុងគិតអំពីការធ្វើអត្តឃាតដែរឬទេ ជួយពួកគេឱ្យទទួលបានការថែទាំវេជ្ជសាស្ត្របន្ទាន់ និងកុំទុកពួកគេឱ្យនៅម្នាក់ឯងប្រសិនបើសុវត្ថិភាពរបស់ពួកគេកំពុងប្រឈមនឹងគ្រោះថ្នាក់។",
      ],
      alertBox: {
        type: "emergency",
        text: "Immediate Safety Warning: If you or someone you know is in immediate danger of suicide or self harm, seek emergency medical care immediately, go to the nearest hospital emergency department, or call local emergency services right away.",
        kmText: "ការព្រមានសុវត្ថិភាពបន្ទាន់៖ ប្រសិនបើអ្នក ឬនរណាម្នាក់ដែលអ្នកស្គាល់ កំពុងស្ថិតក្នុងគ្រោះថ្នាក់បន្ទាន់នៃការធ្វើអត្តឃាត ឬការធ្វើបាបខ្លួនឯង សូមស្វែងរកជំនួយសង្គ្រោះបន្ទាន់ភ្លាមៗ អញ្ជើញទៅកាន់ផ្នែកសង្គ្រោះបន្ទាន់នៃមន្ទីរពេទ្យដែលនៅជិតបំផុត ឬទាក់ទងសេវាសង្គ្រោះបន្ទាន់ជាបន្ទាន់។",
      },
      keyPoints: [
        "Crisis situations require immediate medical emergency care, not self help apps.",
        "Never keep immediate thoughts of self harm or suicide a secret.",
        "Emergency departments and crisis hotlines exist to keep you safe.",
      ],
      kmKeyPoints: [
        "ស្ថានភាពវិបត្តិទាមទារការថែទាំវេជ្ជសាស្ត្រសង្គ្រោះបន្ទាន់ភ្លាមៗ មិនមែនកម្មវិធីទូរស័ព្ទនោះទេ។",
        "កុំរក្សាគំនិតនៃការធ្វើបាបខ្លួនឯង ឬការធ្វើអត្តឃាតទុកជាការសម្ងាត់ឡើយ។",
        "ផ្នែកសង្គ្រោះបន្ទាន់នៃមន្ទីរពេទ្យ និងខ្សែទូរស័ព្ទជំនួយវិបត្តិ មានតួនាទីដើម្បីការពារសុវត្ថិភាពរបស់អ្នក។",
      ],
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "Getting Support in Cambodia and on AROM",
      kmTitle: "ការទទួលបានការគាំទ្រនៅក្នុងប្រទេសកម្ពុជា និងនៅលើ AROM",
      type: "reading",
      paragraphs: [
        "If you are in Cambodia, there are several pathways to find mental health care and emotional support [3]:\n• Public and referral hospitals: Ask about outpatient psychiatric and psychological services.\n• Community organizations: Non-profit organizations such as TPO Cambodia (Transcultural Psychosocial Organization) provide clinical counseling, community outreach and mental health hotlines.\n• Trusted community mentors: Supportive teachers, mentors, or family members who can help connect you with local services.",
        "Why finding support in private matters:\nIn Cambodia, many people hesitate to visit a hospital or clinic because they worry that family, neighbors or colleagues might see them and judge them [3]. Fear of gossip or misunderstanding often prevents people from getting help early.",
        "Connecting directly with care on AROM:\nAROM was designed to make professional mental health care discreet, safe, and stigma-free. Directly within the AROM app, you can:\n• Browse verified therapists, psychologists, and counselors: View their genuine clinical licenses, educational background, and areas of specialization (such as stress, anxiety, family relationships, or trauma).\n• Book appointments in complete privacy: Schedule confidential sessions directly from your phone. You do not need to sit in a public waiting room where acquaintances might see you.\n• Choose your preferred consultation format: Connect through confidential online sessions or book private appointments at verified partner locations.\n• Filter by language: Find professionals who speak fluent Khmer or English, so you can express your thoughts in whichever language feels most comfortable.\n• Instant crisis assistance: Open Profile and tap Get help now to reach verified Cambodian emergency hotlines 24/7.",
      ],
      kmParagraphs: [
        "ប្រសិនបើអ្នកនៅក្នុងប្រទេសកម្ពុជា មានមធ្យោបាយជាច្រើនក្នុងការស្វែងរកការថែទាំសុខភាពផ្លូវចិត្ត និងការគាំទ្រអារម្មណ៍ [3]៖\n• មន្ទីរពេទ្យរដ្ឋ និងមន្ទីរពេទ្យបង្អែក៖ សាកសួរអំពីសេវាពិគ្រោះជំងឺផ្លូវចិត្ត និងចិត្តសាស្ត្រក្រៅមន្ទីរពេទ្យ។\n• អង្គការសហគមន៍៖ អង្គការមិនមែនរដ្ឋាភិបាល ដូចជាអង្គការចិត្តសង្គមអន្តរវប្បធម៌ TPO Cambodia ផ្តល់សេវាប្រឹក្សាផ្លូវចិត្តគ្លីនិក ការចុះជួយសហគមន៍ និងខ្សែទូរស័ព្ទជំនួយសុខភាពផ្លូវចិត្ត។\n• អ្នកណែនាំក្នុងសហគមន៍ដែលទុកចិត្ត៖ គ្រូបង្រៀន ឬសមាជិកគ្រួសារដែលអាចជួយភ្ជាប់អ្នកទៅកាន់សេវាជំនួយក្នុងតំបន់។",
        "មូលហេតុដែលការស្វែងរកជំនួយជាឯកជនមានសារៈសំខាន់៖\nនៅក្នុងប្រទេសកម្ពុជា មនុស្សជាច្រើនមានភាពស្ទាក់ស្ទើរក្នុងការទៅជួបគ្រូពេទ្យនៅមន្ទីរពេទ្យ ឬគ្លីនិក ដោយសារតែពួកគេបារម្ភថាក្រុមគ្រួសារ អ្នកជិតខាង ឬមិត្តរួមការងារអាចនឹងឃើញ ហើយវិនិច្ឆ័យមកលើពួកគេ [3]។ ការព្រួយបារម្ភពីការនិយាយដើម ឬការយល់ច្រឡំ តែងតែរារាំងមនុស្សមិនឱ្យស្វែងរកជំនួយបានទាន់ពេលវេលា។",
        "ការភ្ជាប់ទំនាក់ទំនងជាមួយការថែទាំដោយផ្ទាល់នៅលើ AROM៖\nកម្មវិធី AROM ត្រូវបានបង្កើតឡើងដើម្បីធ្វើឱ្យការទទួលបានការថែទាំសុខភាពផ្លូវចិត្តប្រកបដោយវិជ្ជាជីវៈ មានភាពសម្ងាត់ សុវត្ថិភាព និងគ្មានការរើសអើង។ ដោយផ្ទាល់នៅក្នុងកម្មវិធី AROM អ្នកអាច៖\n• ស្វែងរកអ្នកចិត្តសាស្រ្ត អ្នកប្រឹក្សាផ្លូវចិត្ត និងអ្នកព្យាបាលដែលមានការបញ្ជាក់៖ ពិនិត្យមើលអាជ្ញាបណ្ណគ្លីនិកពិតប្រាកដ កម្រិតវប្បធម៌ និងជំនាញឯកទេស (ដូចជាភាពតានតឹង ការថប់បារម្ភ ទំនាក់ទំនងគ្រួសារ ឬការប៉ះទង្គិចផ្លូវចិត្ត)។\n• កក់ការណាត់ជួបជាលក្ខណៈឯកជនទាំងស្រុង៖ កំណត់កាលវិភាគពិគ្រោះជាសម្ងាត់ដោយផ្ទាល់ពីទូរស័ព្ទដៃរបស់អ្នក។ អ្នកមិនចាំបាច់ទៅអង្គុយរង់ចាំនៅកន្លែងរង់ចាំសាធារណៈ ដែលអ្នកស្គាល់គ្នាអាចឃើញនោះទេ។\n• ជ្រើសរើសទម្រង់ពិគ្រោះយោបល់ដែលអ្នកពេញចិត្ត៖ ភ្ជាប់ការពិគ្រោះតាមអនឡាញជាសម្ងាត់ ឬកក់ការណាត់ជួបផ្ទាល់នៅទីតាំងដៃគូដែលបានផ្ទៀងផ្ទាត់។\n• ជ្រើសរើសតាមភាសា៖ ស្វែងរកអ្នកជំនាញដែលនិយាយភាសាខ្មែរ ឬអង់គ្លេសយ៉ាងស្ទាត់ជំនាញ ដើម្បីឱ្យអ្នកអាចបង្ហាញពីគំនិតរបស់អ្នកជាភាសាដែលអ្នកមានអារម្មណ៍ថាស្រួលបំផុត។\n• ជំនួយបន្ទាន់ភ្លាមៗ៖ បើក Profile ហើយចុច Get help now ដើម្បីទាក់ទងខ្សែទូរស័ព្ទជំនួយបន្ទាន់នៅកម្ពុជាបាន ២៤ ម៉ោង។",
      ],
      alertBox: {
        type: "tip",
        text: "Good to know: On AROM, your privacy is protected with clinical grade confidentiality. Your therapy bookings, private reflections, and mood check-ins are strictly private. No family member, classmate, or employer can ever see who you speak with or what you discuss.",
        kmText: "គួរដឹង៖ នៅលើកម្មវិធី AROM ឯកជនភាពរបស់អ្នកត្រូវបានការពារកម្រិតគ្លីនិកយ៉ាងតឹងរ៉ឹងបំផុត។ ការកក់ការពិគ្រោះយោបល់ ការឆ្លុះបញ្ចាំងផ្ទាល់ខ្លួន និងកំណត់ត្រាអារម្មណ៍របស់អ្នក ត្រូវបានរក្សាជាការសម្ងាត់ទាំងស្រុង។ គ្មានសមាជិកគ្រួសារ មិត្តរួមថ្នាក់ ឬថៅកែណាអាចដឹងថាអ្នកកំពុងនិយាយជាមួយនរណា ឬពិភាក្សាអំពីអ្វីឡើយ។",
      },
      actions: [
        { label: "Box breathing", kmLabel: "លំហាត់ដកដង្ហើម (Box Breathing)", actionType: "exercise" },
        { label: "Match Me With A Professional", kmLabel: "ស្វែងរកអ្នកជំនាញ (Match Me)", actionType: "professional" },
      ],
      keyPoints: [
        "Traditional support options in Cambodia include public hospitals and TPO Cambodia [3].",
        "AROM allows you to find verified therapists and book appointments in complete digital privacy.",
        "Your appointments, reflections, and identity on AROM remain 100% confidential.",
      ],
      kmKeyPoints: [
        "ជម្រើសជំនួយប្រពៃណីនៅកម្ពុជា រួមមានមន្ទីរពេទ្យរដ្ឋ និងអង្គការ TPO Cambodia [3]។",
        "AROM អនុញ្ញាតឱ្យអ្នកស្វែងរកអ្នកជំនាញដែលមានការបញ្ជាក់ និងកក់ការណាត់ជួបជាសម្ងាត់ឌីជីថលទាំងស្រុង។",
        "ការណាត់ជួប ការឆ្លុះបញ្ចាំង និងអត្តសញ្ញាណរបស់អ្នកនៅលើ AROM ត្រូវបានរក្សាជាសម្ងាត់ ១០០%។",
      ],
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "Your Personal Check-In",
      kmTitle: "ការពិនិត្យមើលខ្លួនឯងផ្ទាល់ខ្លួន",
      type: "reflection",
      paragraphs: [
        "Take a quiet moment to reflect on how you have been feeling recently. These questions are for your personal awareness and self reflection, not a clinical diagnosis or test:\n1. Have my feelings been affecting my daily activities, studies, work, or relationships?\n2. Have I noticed significant changes in my sleep, appetite, energy, or interest in hobbies?\n3. Have I been trying to carry everything alone without asking for support?\n4. Is there someone in my life I would feel safe opening up to?\n5. Would speaking with a professional counselor help me understand what I am experiencing?\n6. What is one small step I could take this week to get the support I need?",
        "You do not need to answer every question or share your answers with anyone. Notice what feels most relevant to your life right now.",
      ],
      kmParagraphs: [
        "សូមចំណាយពេលស្ងប់ស្ងាត់មួយភ្លែត ដើម្បីពិចារណាលើអារម្មណ៍របស់អ្នកមួយរយៈចុងក្រោយនេះ។ សំណួរទាំងនេះគឺសម្រាប់ការដឹងពីខ្លួនឯង និងការឆ្លុះបញ្ចាំងផ្ទាល់ខ្លួន មិនមែនជាការធ្វើរោគវិនិច្ឆ័យគ្លីនិក ឬការធ្វើតេស្តនោះទេ៖\n១. តើអារម្មណ៍របស់ខ្ញុំបានប៉ះពាល់ដល់សកម្មភាពប្រចាំថ្ងៃ ការសិក្សា ការងារ ឬទំនាក់ទំនងដែរឬទេ?\n២. តើខ្ញុំបានកត់សម្គាល់ឃើញការផ្លាស់ប្តូរសំខាន់ៗក្នុងដំណេក ចំណង់អាហារ ថាមពល ឬចំណាប់អារម្មណ៍លើចំណូលចិត្តដែរឬទេ?\n៣. តើខ្ញុំបានព្យាយាមរែកពន់អ្វីៗគ្រប់យ៉ាងតែម្នាក់ឯង ដោយមិនសុំជំនួយដែរឬទេ?\n៤. តើមាននរណាម្នាក់ក្នុងជីវិតខ្ញុំ ដែលខ្ញុំមានអារម្មណ៍ថាមានសុវត្ថិភាពក្នុងការបើកចិត្តនិយាយជាមួយដែរឬទេ?\n៥. តើការនិយាយជាមួយអ្នកប្រឹក្សាជំនាញ អាចជួយឱ្យខ្ញុំយល់ពីអ្វីដែលខ្ញុំកំពុងជួបប្រទះដែរឬទេ?\n៦. តើអ្វីជាជំហានតូចមួយដែលខ្ញុំអាចធ្វើបានក្នុងសប្តាហ៍នេះ ដើម្បីទទួលបានការគាំទ្រដែលខ្ញុំត្រូវការ?",
        "អ្នកមិនចាំបាច់ឆ្លើយគ្រប់សំណួរ ឬចែករំលែកចម្លើយរបស់អ្នកជាមួយនរណាម្នាក់ឡើយ។ គ្រាន់តែកត់សម្គាល់នូវអ្វីដែលទាក់ទងនឹងជីវិតរបស់អ្នកបំផុតនៅពេលនេះ។",
      ],
      reflection: {
        question:
          "Reflecting on your recent feelings, what is one area where having support would help you most right now?",
        kmQuestion:
          "ឆ្លុះបញ្ចាំងពីអារម្មណ៍ថ្មីៗរបស់អ្នក តើផ្នែកមួយណាដែលការទទួលបានការគាំទ្រអាចជួយអ្នកបានច្រើនបំផុតនៅពេលនេះ?",
        options: [
          "Managing overwhelming emotions, worry or sadness",
          "Restoring healthy sleep, appetite or daily routines",
          "Talking through relationship conflicts or feeling lonely",
          "Exploring whether professional counseling is right for me",
          "Learning how to safely support a friend or loved one",
        ],
        kmOptions: [
          "ការគ្រប់គ្រងអារម្មណ៍ដែលលើសលប់ ការព្រួយបារម្ភ ឬការកើតទុក្ខ",
          "ការស្តារឡើងវិញនូវដំណេកល្អ ចំណង់អាហារ ឬទម្លាប់ប្រចាំថ្ងៃ",
          "ការនិយាយពិភាក្សាអំពីជម្លោះក្នុងទំនាក់ទំនង ឬអារម្មណ៍ឯកោ",
          "ការស្វែងយល់ថាតើការប្រឹក្សាជាមួយអ្នកជំនាញសមស្របសម្រាប់ខ្ញុំដែរឬទេ",
          "ការរៀនពីរបៀបជួយគាំទ្រមិត្តភក្តិ ឬមនុស្សជាទីស្រឡាញ់ដោយសុវត្ថិភាព",
        ],
        feedbackMessage:
          "Thank you for checking in with yourself. Acknowledging where you feel strained is the first courageous step toward getting the right support. You do not have to carry everything alone.",
        kmFeedbackMessage:
          "អរគុណដែលបានពិនិត្យមើលខ្លួនឯង។ ការទទួលស្គាល់កន្លែងដែលអ្នកមានអារម្មណ៍តានតឹង គឺជាជំហានដ៏ក្លាហានដំបូងគេឆ្ពោះទៅរកការទទួលបានការគាំទ្រត្រឹមត្រូវ។ អ្នកមិនចាំបាច់រែកពន់អ្វីៗគ្រប់យ៉ាងតែម្នាក់ឯងនោះទេ។",
      },
      keyPoints: [
        "Self reflection helps you identify where you need support most right now.",
        "Choosing one manageable step makes seeking help feel achievable.",
      ],
      kmKeyPoints: [
        "ការឆ្លុះបញ្ចាំងពីខ្លួនឯង ជួយអ្នកកំណត់ផ្នែកដែលអ្នកត្រូវការការគាំទ្រច្រើនបំផុតនៅពេលនេះ។",
        "ការជ្រើសរើសជំហានតូចមួយដែលងាយស្រួល ជួយឱ្យការស្វែងរកជំនួយអាចសម្រេចបាន។",
      ],
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "Next Steps for Seeking Support",
      kmTitle: "ជំហានបន្ទាប់សម្រាប់ការស្វែងរកជំនួយ",
      type: "coping",
      paragraphs: [
        "Remember: you do not have to reach a breaking point before you deserve support. Mental health difficulties can affect anyone, and reaching out is a natural and healthy part of caring for your wellbeing.",
        "If you feel nervous about reaching out, try a gentle grounding breathing exercise first to calm your nervous system. When you feel ready, explore talking to someone you trust or booking a confidential session with a verified counselor.",
        "If you ever think about hurting yourself, get help right away. Open Profile and tap Get help now.",
      ],
      kmParagraphs: [
        "សូមចងចាំថា៖ អ្នកមិនចាំបាច់រង់ចាំរហូតដល់ទ្រាំលែងបាន ទើបសមនឹងទទួលបានការគាំទ្រនោះទេ។ ការលំបាកផ្នែកសុខភាពផ្លូវចិត្តអាចកើតមានលើមនុស្សគ្រប់គ្នា ហើយការស្វែងរកជំនួយ គឺជាផ្នែកមួយដ៏ធម្មជាតិ និងល្អប្រសើរក្នុងការថែទាំសុខុមាលភាពរបស់អ្នក។",
        "ប្រសិនបើអ្នកមានអារម្មណ៍ភ័យ ឬស្ទាក់ស្ទើរក្នុងការទាក់ទងសុំជំនួយ សូមសាកល្បងលំហាត់ដកដង្ហើមស្ងប់អារម្មណ៍ជាមុនសិន ដើម្បីជួយឱ្យប្រព័ន្ធប្រសាទរបស់អ្នកធូរស្រាល។ នៅពេលដែលអ្នកមានអារម្មណ៍ថាត្រៀមខ្លួនរួចរាល់ សូមសាកល្បងនិយាយជាមួយមនុស្សដែលអ្នកទុកចិត្ត ឬកក់ការពិគ្រោះយោបល់ជាសម្ងាត់ជាមួយអ្នកជំនាញដែលបានផ្ទៀងផ្ទាត់។",
        "ប្រសិនបើអ្នកធ្លាប់មានគំនិតចង់ធ្វើបាបខ្លួនឯង សូមស្វែងរកជំនួយជាបន្ទាន់។ បើក Profile ហើយចុច Get help now។",
      ],
      actions: [
        { label: "Box breathing", kmLabel: "លំហាត់ដកដង្ហើម (Box Breathing)", actionType: "exercise" },
        { label: "Match Me With A Professional", kmLabel: "ស្វែងរកអ្នកជំនាញ (Match Me)", actionType: "professional" },
      ],
      keyPoints: [
        "Grounding exercises help calm anxiety before opening up to someone.",
        "Reaching out is an act of courage and self care, never weakness.",
        "Emergency resources are always available in your Profile under Get help now.",
      ],
      kmKeyPoints: [
        "លំហាត់ទប់លំនឹងអារម្មណ៍ ជួយកាត់បន្ថយការថប់បារម្ភមុនពេលបើកចិត្តនិយាយជាមួយនរណាម្នាក់។",
        "ការស្វែងរកជំនួយ គឺជាទង្វើនៃភាពក្លាហាន និងការថែទាំខ្លួនឯង មិនមែនជាភាពទន់ខ្សោយឡើយ។",
        "ធនធានជំនួយបន្ទាន់ តែងតែមានជានិច្ចនៅក្នុង Profile ក្រោមផ្នែក Get help now។",
      ],
    },
  ],
};


export const REFERENCES_BETTER_SLEEP: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "CDC",
    title: "Centers for Disease Control and Prevention, About Sleep and Healthy Sleep Habits",
    url: "https://www.cdc.gov/sleep/about/index.html",
  },
  {
    id: 2,
    citation: "[2]",
    source: "NIH",
    title: "National Institutes of Health, Sleep Deprivation and Deficiency",
    url: "https://www.nhlbi.nih.gov/health/sleep-deprivation",
  },
  {
    id: 3,
    citation: "[3]",
    source: "Sleep Foundation",
    title: "Sleep Foundation, Sleep Hygiene Guidelines",
    url: "https://www.sleepfoundation.org/sleep-hygiene",
  },
  {
    id: 4,
    citation: "[4]",
    source: "NHS",
    title: "NHS Every Mind Matters, How to Fall Asleep Faster and Sleep Better",
    url: "https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/",
  },
];

export const LESSON_BETTER_SLEEP: Lesson = {
  id: "better-sleep",
  title: "Better Sleep",
  kmTitle: "ដំណេកប្រកបដោយគុណភាព (Better Sleep)",
  subtitle: "Understand healthy sleep habits, evening wind-down routines, and why deep rest powers your mind",
  kmSubtitle: "យល់ដឹងពីទម្លាប់គេងល្អ ការសម្រាកមុនចូលគេង និងសារៈសំខាន់នៃការសម្រាក",
  category: "Sleep",
  duration: "6 min",
  kmDuration: "៦ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Reflection",
  kmFormat: "ការអាន និងការឆ្លុះបញ្ចាំង (Reading & Reflection)",
  isAvailable: true,
  image: "/mindguide/sleep.png",
  // Photo by Suhwa Lee on Unsplash (Unsplash License), cropped.
  heroImage: "/mindguide/better-sleep-hero.jpg",
  description:
    "Understand healthy sleep hygiene, evening wind-down routines, and why deep rest powers your mind and emotional balance.",
  kmDescription:
    "យល់ដឹងពីទម្លាប់គេងប្រកបដោយសុខភាព ទម្លាប់សម្រាកមុនពេលចូលគេង និងសារៈសំខាន់នៃការសម្រាកដើម្បីពង្រឹងចិត្ត និងអារម្មណ៍របស់អ្នក។",
  totalSections: 9,
  outcomes: [
    {
      en: "The science of sleep cycles and brain recovery [1, 2]",
      km: "វិទ្យាសាស្ត្រនៃវដ្តដំណេក និងការស្តារឡើងវិញនៃខួរក្បាល [1, 2]",
    },
    {
      en: "How your body clock and light exposure control your sleep drive [1, 3]",
      km: "របៀបដែលនាឡិកាជីវសាស្ត្ររាងកាយ និងពន្លឺគ្រប់គ្រងកម្លាំងជំរុញដំណេក [1, 3]",
    },
    {
      en: "Practical ways to calm racing thoughts when lying in bed [4]",
      km: "វិធីជាក់ស្តែងដើម្បីធ្វើឱ្យគំនិតស្ងប់ នៅពេលដេកមិនលក់នៅលើគ្រែ [4]",
    },
    {
      en: "Building a realistic 30-minute evening wind-down routine [3]",
      km: "ការបង្កើតទម្លាប់សម្រាក ៣០ នាទីមុនចូលគេងដ៏មានប្រសិទ្ធភាព [3]",
    },
    {
      en: "When to seek confidential counseling for chronic sleeplessness on AROM",
      km: "ពេលវេលាដែលត្រូវស្វែងរកការប្រឹក្សាជាសម្ងាត់លើ AROM សម្រាប់ការគេងមិនលក់រ៉ាំរ៉ៃ",
    },
  ],
  references: REFERENCES_BETTER_SLEEP,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "Why Sleep Matters for Your Mind and Body",
      kmTitle: "ហេតុអ្វីបានជាដំណេកសំខាន់សម្រាប់ចិត្ត និងរាងកាយរបស់អ្នក",
      type: "reading",
      paragraphs: [
        "Sleep is not just empty time when your body shuts down. It is an active, essential process where your brain cleanses metabolic waste, consolidates memories, and repairs physical tissues. [1, 2]",
        "When you get quality rest, your brain resets its emotional processing centers. You wake up with greater patience, better concentration, and higher resilience against daily stress.",
        "When sleep is cut short, your brain struggles to regulate emotions. You may find yourself irritable, easily overwhelmed, anxious about small problems, or unable to focus on work and studies. [2]",
        "In Cambodia, many students and hardworking professionals stay up late studying or working, believing they can catch up on rest later. But consistent sleep debt gradually drains your mood, memory, and immune health.",
      ],
      kmParagraphs: [
        "ដំណេក មិនមែនគ្រាន់តែជាពេលវេលាទទេដែលរាងកាយរបស់អ្នកបិទដំណើរការនោះទេ។ វាគឺជាដំណើរការដ៏សកម្ម និងចាំបាច់បំផុត ដែលខួរក្បាលរបស់អ្នកសម្អាតកាកសំណល់ រៀបចំការចងចាំ និងជួសជុលកោសិការាងកាយ។ [1, 2]",
        "នៅពេលដែលអ្នកទទួលបានការសម្រាកប្រកបដោយគុណភាព ខួរក្បាលរបស់អ្នកនឹងកំណត់ប្រព័ន្ធដំណើរការអារម្មណ៍ឡើងវិញ។ អ្នកភ្ញាក់ឡើងដោយមានការអត់ធ្មត់ខ្ពស់ ការផ្ដោតអារម្មណ៍ប្រសើរជាងមុន និងភាពធន់នឹងភាពតានតឹងប្រចាំថ្ងៃ។",
        "នៅពេលដែលដំណេកត្រូវបានកាត់បន្ថយ ខួរក្បាលរបស់អ្នកនឹងពិបាកក្នុងការគ្រប់គ្រងអារម្មណ៍។ អ្នកអាចមានអារម្មណ៍មួម៉ៅ ឆាប់លើសលប់ ថប់បារម្ភចំពោះរឿងតូចតាច ឬមិនអាចផ្ដោតលើការងារ និងការសិក្សាបានឡើយ។ [2]",
        "នៅក្នុងប្រទេសកម្ពុជា សិស្សានុសិស្ស និងអ្នកធ្វើការជាច្រើនតែងតែចូលគេងយឺតដោយសារតែការរៀនសូត្រ ឬការងារ ដោយជឿថាពួកគេអាចគេងប៉ះប៉ូវនៅពេលក្រោយបាន។ ប៉ុន្តែការខ្វះដំណេកជាប់រហូត នឹងធ្វើឱ្យអារម្មណ៍ ការចងចាំ និងប្រព័ន្ធការពាររាងកាយរបស់អ្នកចុះខ្សោយជាបណ្តើរៗ។",
      ],
      keyPoints: [
        "Sleep is active biological recovery, not lost time [1].",
        "Quality rest directly strengthens emotional resilience and focus [2].",
        "Consistent sleep debt increases irritability and vulnerability to anxiety.",
      ],
      kmKeyPoints: [
        "ដំណេក គឺជាការស្តារឡើងវិញនៃជីវសាស្ត្រយ៉ាងសកម្ម មិនមែនជាការខាតបង់ពេលវេលាទេ [1]។",
        "ការសម្រាកប្រកបដោយគុណភាព ពង្រឹងភាពធន់នៃអារម្មណ៍ និងការផ្ដោតអារម្មណ៍ដោយផ្ទាល់ [2]។",
        "ការខ្វះដំណេកជាប់រហូត បង្កើនភាពមួម៉ៅ និងធ្វើឱ្យងាយនឹងមានការថប់បារម្ភ។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "The Body Clock and Sleep Drive",
      kmTitle: "នាឡិកាជីវសាស្ត្ររាងកាយ និងកម្លាំងជំរុញដំណេក",
      type: "reading",
      paragraphs: [
        "Your sleep is regulated by two powerful biological forces: your internal body clock and your sleep drive. [1, 3]",
        "Your internal clock (the circadian rhythm) responds strongly to natural light. When morning sunlight hits your eyes, your brain produces cortisol and stops producing melatonin, signaling that it is time to wake up and feel alert.",
        "Your sleep drive builds up pressure the longer you stay awake. By the end of the day, high sleep pressure combined with darkness signals your brain to release melatonin, preparing you for natural, deep sleep. [1]",
        "When your sleep schedule changes wildly from day to day, your body clock becomes confused, making it difficult to fall asleep even when your body feels exhausted.",
      ],
      kmParagraphs: [
        "ដំណេករបស់អ្នកត្រូវបានគ្រប់គ្រងដោយកម្លាំងជីវសាស្ត្រសំខាន់ពីរ៖ នាឡិកាជីវសាស្ត្រក្នុងខ្លួនរបស់អ្នក និងកម្លាំងជំរុញដំណេក។ [1, 3]",
        "នាឡិកាជីវសាស្ត្ររបស់អ្នក ឆ្លើយតបយ៉ាងខ្លាំងចំពោះពន្លឺធម្មជាតិ។ នៅពេលដែលពន្លឺថ្ងៃពេលព្រឹកប៉ះភ្នែករបស់អ្នក ខួរក្បាលនឹងបញ្ឈប់ការផលិតអ័រម៉ូនមេឡាតូនីន (Melatonin) ដែលជាសញ្ញាបញ្ជាក់ថាដល់ពេលត្រូវភ្ញាក់ និងមានស្មារតីស្រស់ស្រាយ។",
        "កម្លាំងជំរុញដំណេក បង្កើតសម្ពាធកាន់តែខ្លាំងនៅពេលអ្នកភ្ញាក់កាន់តែយូរ។ នៅចុងបញ្ចប់នៃថ្ងៃ សម្ពាធដំណេកខ្ពស់រួមផ្សំជាមួយភាពងងឹត ផ្តល់សញ្ញាឱ្យខួរក្បាលបញ្ចេញអ័រម៉ូនមេឡាតូនីន ដើម្បីរៀបចំឱ្យអ្នកគេងលក់ស្រួល និងស្កប់ស្កល់។ [1]",
        "នៅពេលដែលម៉ោងគេងរបស់អ្នកប្រែប្រួលខ្លាំងពីមួយថ្ងៃទៅមួយថ្ងៃ នាឡិកាជីវសាស្ត្ររបស់អ្នកនឹងច្របូកច្របល់ ដែលធ្វើឱ្យពិបាកគេងលក់ ទោះបីជារាងកាយរបស់អ្នកហត់នឿយខ្លាំងក៏ដោយ។",
      ],
      alertBox: {
        type: "tip",
        text: "Good to know: Getting 10 to 15 minutes of natural morning sunlight helps anchor your body clock, making it much easier to fall asleep naturally at night.",
        kmText: "គួរដឹង៖ ការទទួលបានពន្លឺថ្ងៃធម្មជាតិពេលព្រឹកពី ១០ ទៅ ១៥ នាទី ជួយកំណត់នាឡិកាជីវសាស្ត្ររបស់អ្នក និងធ្វើឱ្យអ្នកកាន់តែងាយស្រួលគេងលក់នៅពេលយប់។",
      },
      keyPoints: [
        "Morning light sets your internal rhythm for the rest of the day [1].",
        "Sleep drive naturally accumulates throughout your waking hours.",
        "A consistent wake-up time is the single best anchor for restful sleep [3].",
      ],
      kmKeyPoints: [
        "ពន្លឺពេលព្រឹក កំណត់ចង្វាក់ខាងក្នុងរាងកាយរបស់អ្នកសម្រាប់ពេញមួយថ្ងៃ [1]។",
        "កម្លាំងជំរុញដំណេក កើនឡើងជាធម្មជាតិក្នុងអំឡុងពេលដែលអ្នកភ្ញាក់។",
        "ម៉ោងភ្ញាក់ពីគេងដែលទៀងទាត់ គឺជាគ្រឹះដ៏ល្អបំផុតសម្រាប់ដំណេកស្កប់ស្កល់ [3]។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Common Sleep Disruptors",
      kmTitle: "ឧបសគ្គទូទៅដែលរំខានដល់ដំណេក",
      type: "reading",
      paragraphs: [
        "Many habits that seem harmless can severely undermine your ability to get deep rest. [3, 4]",
        "Blue light from screens: Scrolling through short videos, social media or studying on a bright phone right before bed tricks your brain into thinking it is still daytime, suppressing the natural release of melatonin. [3]",
        "Late caffeine and sweet drinks: Iced coffee, milk tea, and energy drinks are very popular across Cambodia. Caffeine stays in your bloodstream for up to 6 hours, keeping your nervous system on high alert even if you manage to drift off.",
        "Hot and noisy surroundings: A warm room or unexpected street noise interrupts deep sleep cycles. Using a gentle fan, breathable cotton bedding, and keeping the bedroom as cool and dark as possible supports uninterrupted rest.",
      ],
      kmParagraphs: [
        "ទម្លាប់ជាច្រើនដែលមើលទៅហាក់ដូចជាគ្មានបញ្ហា អាចរំខានយ៉ាងខ្លាំងដល់សមត្ថភាពរបស់អ្នកក្នុងការទទួលបានការសម្រាកដ៏ស្កប់ស្កល់។ [3, 4]",
        "ពន្លឺពណ៌ខៀវពីអេក្រង់៖ ការមើលវីដេអូខ្លីៗ បណ្តាញសង្គម ឬការរៀនតាមទូរស័ព្ទភ្លឺៗមុនពេលចូលគេង ធ្វើឱ្យខួរក្បាលរបស់អ្នកយល់ច្រឡំថាជាពេលថ្ងៃ ដែលរារាំងការបញ្ចេញអ័រម៉ូនមេឡាតូនីនតាមធម្មជាតិ។ [3]",
        "ជាតិកាហ្វេអ៊ីន និងភេសជ្ជៈផ្អែមពេលយប់៖ កាហ្វេទឹកកក តែទឹកដោះគោ និងភេសជ្ជៈប៉ូវកម្លាំង គឺមានការពេញនិយមយ៉ាងខ្លាំងនៅកម្ពុជា។ ជាតិកាហ្វេអ៊ីនស្ថិតនៅក្នុងចរន្តឈាមរបស់អ្នករហូតដល់ ៦ ម៉ោង ដែលធ្វើឱ្យប្រព័ន្ធប្រសាទរបស់អ្នកប្រុងប្រយ័ត្នខ្ពស់ ទោះបីជាអ្នកគេងលក់ក៏ដោយ។",
        "បរិយាកាសក្តៅ និងសំឡេងរំខាន៖ បន្ទប់ដែលក្តៅ ឬសំឡេងរំខានពីផ្លូវ រំខានដល់វដ្តនៃដំណេកជ្រៅ។ ការប្រើកង្ហារខ្យល់ស្រាលៗ កម្រាលពូកកប្បាសដែលត្រជាក់ និងការរក្សាបន្ទប់ឱ្យត្រជាក់ និងងងឹតតាមដែលអាចធ្វើទៅបាន ជួយឱ្យការគេងមិនមានការភ្ញាក់កណ្តាលយប់។",
      ],
      keyPoints: [
        "Screens fool your brain into delaying melatonin production [3].",
        "Avoid caffeine for at least 6 hours before your intended bedtime.",
        "Keep your sleeping space cool, dim, and quiet.",
      ],
      kmKeyPoints: [
        "អេក្រង់ទូរស័ព្ទ បន្លំខួរក្បាលរបស់អ្នកឱ្យពន្យារពេលផលិតអ័រម៉ូនគេងលក់ [3]។",
        "ជៀសវាងជាតិកាហ្វេអ៊ីនយ៉ាងហោចណាស់ ៦ ម៉ោងមុនពេលចូលគេង។",
        "រក្សាកន្លែងគេងរបស់អ្នកឱ្យត្រជាក់ ស្រអាប់ និងស្ងប់ស្ងាត់។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "When Racing Thoughts Keep You Awake",
      kmTitle: "នៅពេលដែលការគិតច្រើនធ្វើឱ្យអ្នកដេកមិនលក់",
      type: "reading",
      paragraphs: [
        "Have you ever felt exhausted all evening, only to lie awake the moment your head touches the pillow with worries racing through your mind? [4]",
        "During the busy day, work, conversations, and notifications keep your attention occupied. When you lie down in silence, your brain finally has empty space, and unaddressed concerns about exams, family responsibilities, or the future rush to the surface.",
        "Two evidence-based techniques can help break this cycle:\n1. The Evening Brain Dump in AROM Journal: An hour before bed, take 5 minutes to release whatever is racing through your mind. You can open the private Journal in AROM (or write on paper) to record tomorrow's tasks, pending worries, or your emotional reflections. Because your AROM journal is 100% private and protected, putting thoughts into words or recording a quick voice note signals to your mind that they are safely stored, so it does not have to stay awake holding them.",
        "2. The 20-Minute Rule: If you cannot fall asleep after 20 minutes, do not toss and turn in frustration. Staying in bed agitated trains your brain to associate the mattress with stress. Get up gently, sit in dim light, read a book or do a quiet activity, and return to bed only when your eyelids feel heavy. [3, 4]",
      ],
      kmParagraphs: [
        "តើអ្នកធ្លាប់មានអារម្មណ៍ហត់នឿយពេញមួយល្ងាច ប៉ុន្តែនៅពេលក្បាលដល់ខ្នើយ ស្រាប់តែភ្នែកភ្លឺ ហើយគំនិតព្រួយបារម្ភរត់ពេញក្បាលដែរឬទេ? [4]",
        "ក្នុងអំឡុងពេលថ្ងៃដ៏រវល់ ការងារ ការសន្ទនា និងការជូនដំណឹងផ្សេងៗបានទាញយកចំណាប់អារម្មណ៍របស់អ្នក។ នៅពេលដែលអ្នកគេងក្នុងភាពស្ងប់ស្ងាត់ ខួរក្បាលរបស់អ្នកមានកន្លែងទំនេរ ហើយការព្រួយបារម្ភដែលមិនទាន់ដោះស្រាយអំពីការប្រឡង ទំនួលខុសត្រូវគ្រួសារ ឬអនាគត នឹងហក់ឡើងមកភ្លាមៗ។",
        "បច្ចេកទេសពីរដែលផ្អែកលើភស្តុតាងវិទ្យាសាស្ត្រ អាចជួយកាត់ផ្តាច់វដ្តនេះបាន៖\n១. ការកត់ត្រាជម្រះគំនិតក្នុងកំណត់ហេតុ AROM (The Evening Brain Dump)៖ មួយម៉ោងមុនចូលគេង សូមចំណាយពេល ៥ នាទីដើម្បីបញ្ចេញនូវអ្វីៗដែលកំពុងរត់ក្នុងគំនិតរបស់អ្នក។ អ្នកអាចបើកមុខងារ «កំណត់ហេតុ (Journal)» នៅក្នុងកម្មវិធី AROM (ឬសរសេរលើក្រដាស) ដើម្បីកត់ត្រាកិច្ចការថ្ងៃស្អែក ការព្រួយបារម្ភ ឬអារម្មណ៍របស់អ្នកនៅថ្ងៃនេះ។ ដោយសារតែកំណត់ហេតុ AROM របស់អ្នកត្រូវបានការពារជាសម្ងាត់ ១០០% ការសរសេរ ឬការកត់ត្រាសំឡេងនូវគំនិតរបស់អ្នក ជួយឱ្យចិត្តដឹងថាពួកវាត្រូវបានរក្សាទុកដោយសុវត្ថិភាព ដូច្នេះអ្នកមិនចាំបាច់នៅភ្ញាក់ដើម្បីទន្ទេញចាំវានោះឡើយ។",
        "២. ច្បាប់ ២០ នាទី (The 20-Minute Rule)៖ ប្រសិនបើអ្នកដេកមិនលក់លើសពី ២០ នាទី សូមកុំប្រែខ្លួនចុះឡើងដោយការខកចិត្ត។ ការបន្តដេកនៅលើគ្រែដោយភាពតានតឹង ធ្វើឱ្យខួរក្បាលរបស់អ្នកចងចាំថាពូកគឺជាកន្លែងនៃភាពតានតឹង។ សូមក្រោកឡើងថ្នមៗ អង្គុយក្នុងពន្លឺស្រអាប់ អានសៀវភៅ ឬធ្វើសកម្មភាពស្ងប់ស្ងាត់ ហើយត្រឡប់ទៅគ្រែវិញនៅពេលដែលអ្នកមានអារម្មណ៍ថាធ្ងន់ភ្នែកចង់គេង។ [3, 4]",
      ],
      alertBox: {
        type: "tip",
        text: "Good to know: On AROM, you can open the private Journal at any time before bed. Whether you type your thoughts or record a private voice note, unloading racing thoughts into your secure journal helps quiet bedtime anxiety and clears your head for sleep.",
        kmText: "គួរដឹង៖ នៅលើកម្មវិធី AROM អ្នកអាចបើកមុខងារ «កំណត់ហេតុ (Journal)» ជាលក្ខណៈឯកជនបានគ្រប់ពេលវេលាមុនចូលគេង។ មិនថាអ្នកវាយអក្សរ ឬកត់ត្រាសំឡេងផ្ទាល់ខ្លួន ការបញ្ចេញគំនិតដែលកំពុងរត់ក្នុងក្បាលចូលទៅក្នុងកំណត់ហេតុដែលមានសុវត្ថិភាព ជួយឱ្យចិត្តស្ងប់ពីការថប់បារម្ភពេលយប់ និងជួយឱ្យខួរក្បាលរបស់អ្នកស្រឡះដើម្បីគេងលក់។",
      },
      keyPoints: [
        "Using the AROM private Journal unloads racing worries so your mind can rest [4].",
        "Lying awake in bed for hours trains your brain to link bed with anxiety.",
        "Use the 20-minute rule: leave bed if frustrated, return only when sleepy [3].",
      ],
      kmKeyPoints: [
        "ការប្រើកំណត់ហេតុឯកជនលើ AROM ជួយផ្ទេរការព្រួយបារម្ភចេញពីក្បាល ដើម្បីឱ្យចិត្តបានសម្រាក [4]។",
        "ការដេកមិនលក់នៅលើគ្រែរាប់ម៉ោង ធ្វើឱ្យខួរក្បាលភ្ជាប់គ្រែទៅនឹងការថប់បារម្ភ។",
        "ប្រើច្បាប់ ២០ នាទី៖ ក្រោកពីគ្រែប្រសិនបើពិបាកចិត្ត ហើយត្រឡប់មកវិញពេលងងុយ [3]។",
      ],
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "Building an Evening Wind-Down Routine",
      kmTitle: "ការបង្កើតទម្លាប់សម្រាកមុនពេលចូលគេង",
      type: "reading",
      paragraphs: [
        "Sleep does not happen like a light switch. Your nervous system needs a gradual ramp down from high alert to calm recovery. [3, 4]",
        "Try designing a 30 to 60 minute evening buffer before your target bedtime:\n• Dim bright overhead lights and switch to warm, soft ambient lighting.\n• Put your phone in another room or switch on \"Do Not Disturb\".\n• Take a warm shower or wash your face and feet with warm water to help your body relax.\n• Engage in low-stimulation activities: light reading, journaling, or listening to calm audio.",
        "On AROM, you can listen to the therapist podcast \"Sleep when your mind will not stop\" (`sleep-busy-mind`), where clinicians discuss practical evening routines tailored for busy minds.",
        "Consistency is key: when you repeat the same gentle cues each night, your brain learns to recognize that sleep is coming.",
      ],
      kmParagraphs: [
        "ដំណេក មិនមែនកើតឡើងដូចជាការចុចកុងតាក់ភ្លើងបិទបើកភ្លាមៗនោះទេ។ ប្រព័ន្ធប្រសាទរបស់អ្នកត្រូវការពេលវេលាដើម្បីបន្ថយល្បឿនពីការប្រុងប្រយ័ត្នខ្ពស់ មកកាន់ការសម្រាកស្ងប់ស្ងាត់។ [3, 4]",
        "សាកល្បងរៀបចំពេលវេលាសម្រាកពី ៣០ ទៅ ៦០ នាទី មុនម៉ោងគេងដែលអ្នកចង់បាន៖\n• បន្ថយពន្លឺភ្លើងចាំងៗពីលើពិដាន ហើយប្តូរមកប្រើពន្លឺស្រទន់កក់ក្តៅ។\n• ទុកទូរស័ព្ទរបស់អ្នកនៅបន្ទប់ផ្សេង ឬបើកមុខងារ «កុំរំខាន (Do Not Disturb)»។\n• ងូតទឹកក្តៅឧណ្ហៗ ឬលាងមុខ និងជើងដោយទឹកក្តៅឧណ្ហៗ ដើម្បីជួយឱ្យរាងកាយធូរស្រាល។\n• ធ្វើសកម្មភាពដែលមិនរំញោចខ្លាំង៖ អានសៀវភៅស្រាលៗ កត់ត្រាកំណត់ហេតុ ឬស្តាប់សំឡេងស្ងប់អារម្មណ៍។",
        "នៅលើកម្មវិធី AROM អ្នកអាចស្តាប់ផតខាសរបស់អ្នកជំនាញ «ការគេងនៅពេលចិត្តមិនព្រមឈប់គិត (Sleep when your mind will not stop)» ដែលអ្នកជំនាញចែករំលែកទម្លាប់ពេលល្ងាចជាក់ស្តែងសម្រាប់អ្នកដែលគិតច្រើន។",
        "ភាពទៀងទាត់គឺជាគន្លឹះ៖ នៅពេលដែលអ្នកធ្វើទម្លាប់ស្រាលៗដដែលៗរៀងរាល់យប់ ខួរក្បាលរបស់អ្នកនឹងរៀនដឹងថានេះជាពេលវេលាដែលត្រូវគេង។",
      ],
      keyPoints: [
        "Your nervous system requires 30 to 60 minutes to transition into rest [3].",
        "Dim lighting and phone boundaries signal safety to your body clock.",
        "AROM therapist podcasts provide soothing, practical guidance before bed.",
      ],
      kmKeyPoints: [
        "ប្រព័ន្ធប្រសាទរបស់អ្នកត្រូវការពេលពី ៣០ ទៅ ៦០ នាទី ដើម្បីត្រៀមខ្លួនសម្រាក [3]។",
        "ពន្លឺស្រអាប់ និងការកម្រិតទូរស័ព្ទ បញ្ជាក់ប្រាប់រាងកាយរបស់អ្នកពីសុវត្ថិភាព។",
        "ផតខាសអ្នកជំនាញលើ AROM ផ្តល់ការណែនាំដ៏កក់ក្តៅ និងជាក់ស្តែងមុនពេលគេង។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "Check Your Sleep Knowledge",
      kmTitle: "ពិនិត្យមើលចំណេះដឹងអំពីដំណេករបស់អ្នក",
      type: "quiz",
      paragraphs: [
        "Test your understanding of healthy sleep habits and what to do when falling asleep feels difficult.",
      ],
      kmParagraphs: [
        "សាកល្បងការយល់ដឹងរបស់អ្នកអំពីទម្លាប់គេងល្អ និងអ្វីដែលត្រូវធ្វើនៅពេលមានអារម្មណ៍ថាពិបាកគេងលក់។",
      ],
      quiz: {
        question:
          "If you have been lying awake in bed for over 20 minutes unable to fall asleep, what is the most helpful step to take?",
        kmQuestion:
          "ប្រសិនបើអ្នកដេកមិនលក់នៅលើគ្រែលើសពី ២០ នាទី តើជំហានណាដែលល្អបំផុតដែលគួរធ្វើ?",
        options: [
          {
            id: "a",
            text: "Stay in bed and keep scrolling on your phone until you feel exhausted",
            kmText: "បន្តដេកនៅលើគ្រែ ហើយបន្តចុចទូរស័ព្ទរហូតដល់ងងុយ",
            isCorrect: false,
          },
          {
            id: "b",
            text: "Get out of bed, do a calm activity in dim light, and return only when sleepy",
            kmText: "ក្រោកពីគ្រែ ធ្វើសកម្មភាពស្ងប់ស្ងាត់ក្នុងពន្លឺស្រអាប់ ហើយត្រឡប់មកវិញពេលងងុយ",
            isCorrect: true,
          },
          {
            id: "c",
            text: "Force yourself to keep your eyes tightly closed and worry about tomorrow",
            kmText: "បង្ខំខ្លួនឯងឱ្យបិទភ្នែកឱ្យជិត ហើយបារម្ភពីរឿងថ្ងៃស្អែក",
            isCorrect: false,
          },
          {
            id: "d",
            text: "Drink a strong cup of sweet iced tea to calm your throat",
            kmText: "ផឹកតែផ្អែមត្រជាក់មួយកែវធំ ដើម្បីឱ្យស្រួលក",
            isCorrect: false,
          },
        ],
        explanation:
          "Correct! If you cannot sleep after 20 minutes, getting out of bed prevents your brain from linking your bed with anxiety and frustration. Returning only when drowsy rebuilds the strong mental association between your mattress and deep sleep.",
        kmExplanation:
          "ត្រឹមត្រូវហើយ! ប្រសិនបើអ្នកដេកមិនលក់លើសពី ២០ នាទី ការក្រោកពីគ្រែជួយការពារកុំឱ្យខួរក្បាលរបស់អ្នកចងចាំថាគ្រែជាកន្លែងនៃការថប់បារម្ភ និងការមួម៉ៅ។ ការត្រឡប់មកគ្រែវិញនៅពេលងងុយ ជួយកសាងទំនាក់ទំនងផ្លូវចិត្តដ៏រឹងមាំរវាងពូក និងដំណេកស្កប់ស្កល់ឡើងវិញ។",
      },
      keyPoints: [
        "Staying in bed while agitated trains your brain to associate bed with stress.",
        "Leave bed after 20 minutes and do something soothing until drowsiness returns [3, 4].",
      ],
      kmKeyPoints: [
        "ការបន្តដេកទាំងមួម៉ៅ ធ្វើឱ្យខួរក្បាលភ្ជាប់គ្រែទៅនឹងភាពតានតឹង។",
        "ក្រោកពីគ្រែក្រោយ ២០ នាទី ហើយធ្វើអ្វីដែលស្ងប់ចិត្ត រហូតដល់ងងុយគេងម្តងទៀត [3, 4]។",
      ],
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "Your Personal Sleep Check-In",
      kmTitle: "ការពិនិត្យមើលទម្លាប់គេងផ្ទាល់ខ្លួនរបស់អ្នក",
      type: "reflection",
      paragraphs: [
        "Improving your sleep does not require changing everything overnight. Choosing one small, realistic habit to focus on can create lasting momentum for your energy and mental health.",
      ],
      kmParagraphs: [
        "ការកែលម្អដំណេករបស់អ្នក មិនទាមទារឱ្យអ្នកផ្លាស់ប្តូរអ្វីៗទាំងអស់ក្នុងពេលតែមួយយប់នោះទេ។ ការជ្រើសរើសទម្លាប់តូចមួយដែលស្របតាមការពិត អាចបង្កើតភាពរីកចម្រើនយូរអង្វែងសម្រាប់ថាមពល និងសុខភាពផ្លូវចិត្តរបស់អ្នក។",
      ],
      reflection: {
        question:
          "Which sleep habit would you like to focus on improving first?",
        kmQuestion:
          "តើទម្លាប់គេងមួយណាដែលអ្នកចង់ផ្ដោតលើការកែលម្អជាមុនសិន?",
        options: [
          "Setting a consistent wake-up time every morning",
          "Putting my phone away 30 minutes before sleep",
          "Writing down my racing worries before bed",
          "Cutting off afternoon coffee and sweet drinks",
        ],
        kmOptions: [
          "ការកំណត់ម៉ោងក្រោកពីគេងឱ្យទៀងទាត់រៀងរាល់ព្រឹក",
          "ការទុកទូរស័ព្ទឱ្យឆ្ងាយ ៣០ នាទីមុនចូលគេង",
          "ការសរសេរជម្រះការព្រួយបារម្ភលើក្រដាសមុនគេង",
          "ការកាត់បន្ថយកាហ្វេ និងភេសជ្ជៈផ្អែមពេលរសៀល",
        ],
        feedbackMessage:
          "Excellent choice. Focusing on just this one habit for the next seven days will help your body clock adjust naturally. Consistency always beats perfection.",
        kmFeedbackMessage:
          "ជាជម្រើសដ៏ល្អប្រសើរ។ ការផ្ដោតលើទម្លាប់តែមួយនេះសម្រាប់រយៈពេល ៧ ថ្ងៃខាងមុខ នឹងជួយឱ្យនាឡិកាជីវសាស្ត្ររបស់អ្នកសម្របខ្លួនតាមធម្មជាតិ។ ភាពទៀងទាត់តែងតែមានប្រសិទ្ធភាពជាងភាពល្អឥតខ្ចោះ។",
      },
      keyPoints: [
        "Start small with one single habit change.",
        "Give your body clock at least 7 to 10 days to adapt to a new routine.",
      ],
      kmKeyPoints: [
        "ចាប់ផ្តើមពីតូច ដោយការផ្លាស់ប្តូរទម្លាប់តែមួយគត់។",
        "ផ្តល់ពេលវេលាឱ្យនាឡិកាជីវសាស្ត្ររបស់អ្នកយ៉ាងហោចណាស់ពី ៧ ទៅ ១០ ថ្ងៃ ដើម្បីសម្របខ្លួន។",
      ],
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "When Chronic Sleeplessness Needs Support on AROM",
      kmTitle: "នៅពេលដែលការគេងមិនលក់រ៉ាំរ៉ៃត្រូវការការគាំទ្រនៅលើ AROM",
      type: "reading",
      paragraphs: [
        "Occasional sleepless nights before a major exam or life change are normal. But when difficulty sleeping lasts for weeks or months, it is often intertwined with chronic stress, anxiety, or depression. [2, 4]",
        "Sleeplessness and emotional distress feed each other: worry prevents sleep, and sleep deprivation makes anxiety feel far more severe the next morning.",
        "If you have tried healthy sleep hygiene but still struggle with persistent insomnia, professional guidance can help. On AROM, you can connect with verified psychologists and counselors who specialize in sleep difficulties and stress management.",
        "You can browse therapist profiles, review their clinical experience, and book confidential sessions in complete privacy from your phone. No one in your family or circle will ever know you reached out.",
      ],
      kmParagraphs: [
        "ការដេកមិនលក់ម្តងម្កាលមុនការប្រឡងធំ ឬការផ្លាស់ប្តូរជីវិត គឺជារឿងធម្មតា។ ប៉ុន្តែនៅពេលដែលការពិបាកគេងកើតមានជាប់គ្នារាប់សប្តាហ៍ ឬរាប់ខែ វាច្រើនតែជាប់ទាក់ទងនឹងភាពតានតឹងរ៉ាំរ៉ៃ ការថប់បារម្ភ ឬជំងឺបាក់ទឹកចិត្ត។ [2, 4]",
        "ការគេងមិនលក់ និងការលំបាកផ្នែកអារម្មណ៍ មានទំនាក់ទំនងគ្នាទៅវិញទៅមក៖ ការព្រួយបារម្ភរារាំងដំណេក ហើយការខ្វះដំណេកធ្វើឱ្យការថប់បារម្ភកាន់តែធ្ងន់ធ្ងរនៅព្រឹកបន្ទាប់។",
        "ប្រសិនបើអ្នកបានសាកល្បងទម្លាប់គេងល្អហើយ ប៉ុន្តែនៅតែបន្តគេងមិនលក់ ការណែនាំពីអ្នកជំនាញអាចជួយបាន។ នៅលើកម្មវិធី AROM អ្នកអាចភ្ជាប់ទំនាក់ទំនងជាមួយអ្នកចិត្តសាស្រ្ត និងអ្នកប្រឹក្សាផ្លូវចិត្តដែលមានការបញ្ជាក់ ដែលមានជំនាញឯកទេសលើការលំបាកក្នុងការគេង និងការគ្រប់គ្រងភាពតានតឹង។",
        "អ្នកអាចមើលប្រវត្តិអ្នកជំនាញ ពិនិត្យមើលបទពិសោធន៍គ្លីនិក និងកក់ការពិគ្រោះយោបល់ជាសម្ងាត់ដោយផ្ទាល់ពីទូរស័ព្ទរបស់អ្នក។ គ្មាននរណាម្នាក់ក្នុងគ្រួសារ ឬមជ្ឈដ្ឋានជុំវិញអ្នកដឹងថាអ្នកបានទាក់ទងសុំជំនួយឡើយ។",
      ],
      alertBox: {
        type: "tip",
        text: "Good to know: If sleeplessness has persisted for more than three nights a week for over a month, speaking with a professional on AROM can help uncover root emotional causes in complete confidence.",
        kmText: "គួរដឹង៖ ប្រសិនបើការដេកមិនលក់បានបន្តលើសពី ៣ យប់ក្នុងមួយសប្តាហ៍ អស់រយៈពេលជាងមួយខែ ការពិគ្រោះជាមួយអ្នកជំនាញនៅលើ AROM អាចជួយស្វែងរកដើមហេតុអារម្មណ៍បានដោយការសម្ងាត់ទាំងស្រុង។",
      },
      keyPoints: [
        "Chronic sleeplessness is frequently connected to unaddressed anxiety or depression [2].",
        "Breaking long-term insomnia often requires addressing underlying stress patterns.",
        "AROM provides 100% confidential professional support directly from your mobile device.",
      ],
      kmKeyPoints: [
        "ការគេងមិនលក់រ៉ាំរ៉ៃ ច្រើនតែទាក់ទងនឹងការថប់បារម្ភ ឬការបាក់ទឹកចិត្តដែលមិនទាន់បានដោះស្រាយ [2]។",
        "ការដោះស្រាយការគេងមិនលក់យូរអង្វែង ទាមទារឱ្យមានការស្វែងយល់ពីទម្រង់ភាពតានតឹងខាងក្នុង។",
        "AROM ផ្តល់ការគាំទ្រប្រកបដោយវិជ្ជាជីវៈជាសម្ងាត់ ១០០% ដោយផ្ទាល់ពីទូរស័ព្ទដៃរបស់អ្នក។",
      ],
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "Next Steps for Restful Sleep",
      kmTitle: "ជំហានបន្ទាប់សម្រាប់ដំណេកប្រកបដោយផាសុកភាព",
      type: "coping",
      paragraphs: [
        "Quality sleep is a form of self care you practice every day. Tonight, give yourself permission to step away from screens 30 minutes before bed, dim the lights, and let your body unwind.",
        "If your mind feels restless right now, practice a gentle calming breath to slow your heart rate and prepare for rest. You can also listen to the therapist podcast \"Sleep when your mind will not stop\" on AROM.",
        "If you ever think about hurting yourself, get help right away. Open Profile and tap Get help now.",
      ],
      kmParagraphs: [
        "ដំណេកប្រកបដោយគុណភាព គឺជាទម្រង់នៃការថែទាំខ្លួនឯងដែលអ្នកអនុវត្តរៀងរាល់ថ្ងៃ។ យប់នេះ សូមផ្តល់ការអនុញ្ញាតឱ្យខ្លួនឯងដកឃ្លាពីអេក្រង់ទូរស័ព្ទ ៣០ នាទីមុនចូលគេង បន្ថយពន្លឺភ្លើង និងទុកឱ្យរាងកាយរបស់អ្នកបានសម្រាក។",
        "ប្រសិនបើចិត្តរបស់អ្នកមានអារម្មណ៍ថាមិនស្ងប់នៅពេលនេះ សូមសាកល្បងហាត់ដកដង្ហើមវែងៗ ដើម្បីបន្ថយចង្វាក់បេះដូង និងរៀបចំខ្លួនសម្រាក។ អ្នកក៏អាចស្តាប់ផតខាសអ្នកជំនាញ «ការគេងនៅពេលចិត្តមិនព្រមឈប់គិត» នៅលើ AROM ផងដែរ។",
        "ប្រសិនបើអ្នកធ្លាប់មានគំនិតចង់ធ្វើបាបខ្លួនឯង សូមស្វែងរកជំនួយជាបន្ទាន់។ បើក Profile ហើយចុច Get help now។",
      ],
      actions: [
        { label: "Box breathing", kmLabel: "លំហាត់ដកដង្ហើម (Box Breathing)", actionType: "exercise" },
        { label: "Match Me With A Professional", kmLabel: "ស្វែងរកអ្នកជំនាញ (Match Me)", actionType: "professional" },
      ],
      keyPoints: [
        "Wind down 30 minutes before bed with dim lights and no screens.",
        "Breathing exercises physically switch your nervous system into rest mode.",
        "Crisis support is always available in your Profile under Get help now.",
      ],
      kmKeyPoints: [
        "សម្រាក ៣០ នាទីមុនចូលគេង ដោយប្រើពន្លឺស្រអាប់ និងគ្មានអេក្រង់ទូរស័ព្ទ។",
        "លំហាត់ដកដង្ហើម ជួយផ្លាស់ប្តូរប្រព័ន្ធប្រសាទរបស់អ្នកទៅកាន់ស្ថានភាពសម្រាក។",
        "ជំនួយបន្ទាន់ តែងតែមានជានិច្ចនៅក្នុង Profile របស់អ្នកក្រោមផ្នែក Get help now។",
      ],
    },
  ],
};


export const REFERENCES_RELATIONSHIPS: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "Healthdirect Australia",
    title: "Healthdirect Australia, Building and Maintaining Healthy Relationships",
    url: "https://www.healthdirect.gov.au/healthy-living/emotional-wellbeing/building-and-maintaining-healthy-relationships",
  },
  {
    id: 2,
    citation: "[2]",
    source: "NHS",
    title: "NHS, Maintaining Healthy Relationships and Mental Wellbeing",
    url: "https://www.nhs.uk/every-mind-matters/lifes-challenges/maintaining-healthy-relationships-and-mental-wellbeing/",
  },
  {
    id: 3,
    citation: "[3]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia, Mental Health",
    url: "https://www.unicef.org/cambodia/mental-health",
  },
  {
    id: 4,
    citation: "[4]",
    source: "ACOG",
    title: "American College of Obstetricians and Gynecologists, Healthy Relationships",
    url: "https://www.acog.org/womens-health/faqs/healthy-relationships",
  },
  {
    id: 5,
    citation: "[5]",
    source: "NIH",
    title: "National Institutes of Health, Social Wellness Toolkit",
    url: "https://www.nih.gov/health-information/your-healthiest-self-wellness-toolkits/social-wellness-toolkit",
  },
];

export const LESSON_BUILD_HEALTHY_RELATIONSHIPS: Lesson = {
  id: "build-healthy-relationships",
  title: "Build Healthy Relationships",
  kmTitle: "ការកសាងទំនាក់ទំនងប្រកបដោយសុខភាពល្អ (Build Healthy Relationships)",
  subtitle: "Communicate with respect, set healthy boundaries, and build supportive connections",
  kmSubtitle: "រៀនប្រាស្រ័យទាក់ទងដោយការគោរព កំណត់ព្រំដែនផ្ទាល់ខ្លួន និងកសាងចំណងមេត្រីភាព",
  category: "Relationships",
  duration: "7 min",
  kmDuration: "៧ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Practice",
  kmFormat: "ការអាន និងការឆ្លុះបញ្ចាំង (Reading & Reflection)",
  isAvailable: true,
  image: "/mindguide/strategies.png",
  heroImage: "/mindguide/build-healthy-relationships-hero.jpg",
  description:
    "Learn the core pillars of healthy relationships, how to communicate with 'I' statements, set gentle boundaries, navigate family expectations in Cambodia, and recognize unhealthy patterns.",
  kmDescription:
    "ស្វែងយល់ពីសសរស្តម្ភនៃទំនាក់ទំនងល្អ របៀបប្រើប្រាស់ពាក្យពេចន៍សមរម្យ ការកំណត់ព្រំដែនផ្ទាល់ខ្លួន ការដោះស្រាយការរំពឹងទុករបស់គ្រួសារនៅកម្ពុជា និងការសម្គាល់សញ្ញាព្រមាន។",
  totalSections: 9,
  outcomes: [
    {
      en: "The 6 core pillars of healthy connections and mutual respect [1, 2]",
      km: "សសរស្តម្ភគ្រឹះទាំង ៦ នៃទំនាក់ទំនងល្អ និងការគោរពគ្នាទៅវិញទៅមក [1, 2]",
    },
    {
      en: "Communicating with 'I' statements and active listening during conflict [2, 5]",
      km: "ការប្រាស្រ័យទាក់ទងតាមរយៈឃ្លាផ្ទាល់ខ្លួន និងការស្តាប់ដោយយកចិត្តទុកដាក់ពេលមានជម្លោះ [2, 5]",
    },
    {
      en: "Setting and honoring personal boundaries without guilt [1, 5]",
      km: "ការកំណត់ និងការគោរពព្រំដែនផ្ទាល់ខ្លួនដោយគ្មានអារម្មណ៍ខុសឆ្គង [1, 5]",
    },
    {
      en: "Recognizing warning signs of control, manipulation, and disrespect [1, 4]",
      km: "ការសម្គាល់សញ្ញាព្រមាននៃការគ្រប់គ្រង ការបោកបញ្ឆោត និងការមិនគោរពគ្នា [1, 4]",
    },
    {
      en: "Navigating family expectations and filial respect in Cambodia [3]",
      km: "ការស្វែងយល់ និងការដោះស្រាយការរំពឹងទុករបស់គ្រួសារក្នុងបរិបទកម្ពុជា [3]",
    },
  ],
  references: REFERENCES_RELATIONSHIPS,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "What Does a Healthy Relationship Look Like?",
      kmTitle: "តើទំនាក់ទំនងប្រកបដោយសុខភាពល្អមានទម្រង់បែបណា?",
      type: "reading",
      paragraphs: [
        "Relationships are an important part of our lives. Our connections with family, friends, romantic partners, classmates, and colleagues influence how we feel about ourselves and how we navigate daily challenges. A supportive relationship helps us feel understood, respected, and less alone, while repeated conflict, pressure, or feeling controlled affects our emotional wellbeing. [1, 2]",
        "Healthy relationships do not mean that people always agree or never make mistakes. They grow through mutual care, honest communication, and a shared commitment to treat each other with dignity. A healthy connection often includes six foundational qualities [1, 4]:",
        "1. Respect: You treat each other's feelings, opinions, choices, and personal boundaries seriously. You do not have to agree about everything, but you can disagree without insults, humiliation, or threats.",
        "2. Trust: You can depend on each other and feel safe being honest. Trust develops over time through consistent actions. It does not require sharing every password, private thought, or personal detail.",
        "3. Honest communication: You can express your feelings, needs, and concerns without fear of being deliberately shamed or intimidated. Both people listen to understand rather than simply waiting for their turn to speak.",
        "4. Support: You encourage each other's personal growth and offer presence during difficult moments. Support does not mean solving every problem for the other person; sometimes, listening is enough.",
        "5. Independence: You can enjoy time together while keeping your own interests, friendships, responsibilities, and goals. Being close never means giving up your personal identity.",
        "6. Mutual effort: Both people contribute to the relationship. One person should not always carry the entire responsibility for apologizing, planning, or resolving conflict.",
      ],
      kmParagraphs: [
        "ទំនាក់ទំនងគឺជាផ្នែកមួយដ៏សំខាន់នៃជីវិតរបស់យើង។ ចំណងមេត្រីភាពជាមួយគ្រួសារ មិត្តភក្តិ ដៃគូស្នេហា មិត្តរួមថ្នាក់ និងសហការី ជះឥទ្ធិពលយ៉ាងខ្លាំងទៅលើអារម្មណ៍របស់យើងចំពោះខ្លួនឯង និងរបៀបដែលយើងដោះស្រាយបញ្ហាប្រឈមប្រចាំថ្ងៃ។ ទំនាក់ទំនងដែលផ្តល់ការគាំទ្រ ជួយឱ្យយើងមានអារម្មណ៍ថានរណាម្នាក់យល់ពីយើង មានការគោរព និងកាត់បន្ថយភាពឯកោ។ ផ្ទុយទៅវិញ ជម្លោះដដែលៗ សម្ពាធ ឬអារម្មណ៍នៃការត្រូវគេគ្រប់គ្រង អាចប៉ះពាល់ដល់សុខុមាលភាពផ្លូវចិត្ត។ [1, 2]",
        "ទំនាក់ទំនងល្អមិនមែនមានន័យថាភាគីទាំងសងខាងត្រូវតែយល់ស្របគ្នារាល់ពេល ឬមិនដែលខុសឆ្គងទាល់តែសោះនោះទេ។ វាចម្រើនឡើងតាមរយៈការយកចិត្តទុកដាក់គ្នា ការប្រាស្រ័យទាក់ទងដោយស្មោះត្រង់ និងការប្តេជ្ញាចិត្តរួមគ្នាក្នុងការប្រព្រឹត្តចំពោះគ្នាទៅវិញទៅមកដោយសេចក្តីថ្លៃថ្នូរ។ ទំនាក់ទំនងល្អច្រើនតែរួមបញ្ចូលនូវគុណសម្បត្តិគ្រឹះទាំង ៦ យ៉ាង [1, 4]៖",
        "១. ការគោរពគ្នា (Respect)៖ អ្នកចាត់ទុកអារម្មណ៍ គំនិត ជម្រើស និងព្រំដែនផ្ទាល់ខ្លួនរបស់គ្នាទៅវិញទៅមកយ៉ាងហ្មត់ចត់។ អ្នកមិនចាំបាច់យល់ស្របគ្រប់រឿងទាំងអស់នោះទេ ប៉ុន្តែអ្នកអាចខ្វែងគំនិតគ្នាដោយគ្មានពាក្យប្រមាថ ការបន្ទាបបន្ថោក ឬការគំរាមកំហែង។",
        "២. ការជឿទុកចិត្ត (Trust)៖ អ្នកអាចពឹងពាក់គ្នាទៅវិញទៅមក និងមានអារម្មណ៍កក់ក្តៅក្នុងការនិយាយពាក្យពិត។ ទំនុកចិត្តកសាងឡើងជាលំដាប់តាមរយៈសកម្មភាពជាក់ស្តែងដែលទៀងទាត់។ វាមិនមានន័យថាអ្នកត្រូវចែករំលែកគ្រប់លេខសម្ងាត់ ឬគំនិតផ្ទាល់ខ្លួនទាំងអស់នោះឡើយ។",
        "៣. ការប្រាស្រ័យទាក់ទងដោយស្មោះត្រង់ (Honest Communication)៖ អ្នកអាចបង្ហាញពីអារម្មណ៍ សេចក្តីត្រូវការ និងការព្រួយបារម្ភដោយគ្មានការភ័យខ្លាចថាត្រូវគេបន្ទោស ឬបំភិតបំភ័យ។ មនុស្សទាំងពីរខិតខំស្តាប់ដើម្បីយល់ ជាជាងគ្រាន់តែរង់ចាំដល់វេនខ្លួននិយាយ។",
        "៤. ការគាំទ្រគ្នា (Support)៖ អ្នកលើកទឹកចិត្តដល់ការលូតលាស់របស់គ្នា និងផ្តល់វត្តមានគាំទ្រក្នុងគ្រាលំបាក។ ការគាំទ្រមិនមែនមានន័យថាត្រូវដោះស្រាយគ្រប់បញ្ហាជំនួសគេនោះទេ ជួនកាលការស្តាប់ដោយចិត្តស្ងប់គឺគ្រប់គ្រាន់ហើយ។",
        "៥. ភាពឯករាជ្យ (Independence)៖ អ្នកអាចរីករាយនឹងពេលវេលាជាមួយគ្នា ដោយនៅតែរក្សាបាននូវចំណង់ចំណូលចិត្ត មិត្តភាព និងគោលដៅផ្ទាល់ខ្លួន។ ភាពជិតស្និទ្ធមិនដែលតម្រូវឱ្យអ្នកលះបង់អត្តសញ្ញាណផ្ទាល់ខ្លួនឡើយ។",
        "៦. ការខិតខំប្រឹងប្រែងទៅវិញទៅមក (Mutual Effort)៖ មនុស្សទាំងពីរនាក់រួមចំណែកដល់ទំនាក់ទំនង។ មនុស្សម្នាក់មិនគួរត្រូវទទួលខុសត្រូវរាល់ការសុំទោស ការរៀបចំគម្រោង ឬការដោះស្រាយជម្លោះតែម្នាក់ឯងរហូតនោះទេ។",
      ],
      alertBox: {
        type: "tip",
        text: "Good to know: A healthy relationship is not perfect. It is one where both people make a consistent effort to treat each other with safety, kindness, and dignity.",
        kmText: "គួរដឹង៖ ទំនាក់ទំនងល្អមិនមែនល្អឥតខ្ចោះនោះទេ។ វាជាទំនាក់ទំនងដែលភាគីទាំងសងខាងខិតខំប្រឹងប្រែងប្រព្រឹត្តចំពោះគ្នាទៅវិញទៅមកដោយសុវត្ថិភាព សេចក្តីសប្បុរស និងសេចក្តីថ្លៃថ្នូរ។",
      },
      keyPoints: [
        "Healthy relationships are grounded in mutual respect, trust, and communication [1].",
        "Supportive connections strengthen emotional resilience and reduce isolation [2].",
        "Independence is essential: closeness should never erase your personal identity [4].",
      ],
      kmKeyPoints: [
        "ទំនាក់ទំនងល្អផ្អែកលើការគោរពគ្នា ការជឿទុកចិត្ត និងការប្រាស្រ័យទាក់ទង [1]។",
        "ចំណងមេត្រីភាពដែលគាំទ្រគ្នា ជួយពង្រឹងភាពរឹងមាំផ្លូវចិត្ត និងកាត់បន្ថយភាពឯកោ [2]។",
        "ភាពឯករាជ្យគឺសំខាន់៖ ភាពជិតស្និទ្ធមិនគួរលុបបំបាត់អត្តសញ្ញាណផ្ទាល់ខ្លួនឡើយ [4]។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "Learn to Communicate Clearly",
      kmTitle: "រៀនប្រាស្រ័យទាក់ទងឱ្យបានច្បាស់លាស់",
      type: "quiz",
      paragraphs: [
        "Misunderstandings happen in every relationship. Sometimes we expect others to guess our feelings without explaining them. Other times, we react quickly while angry or hurt.",
        "Learning to communicate clearly reduces unnecessary conflict and makes it easier to understand each other. Three practical habits make a powerful difference [2, 5]:",
        "1. Use 'I' statements: When upset, describe your own experience instead of immediately blaming the other person. Instead of saying 'You never listen to me,' try: 'I feel ignored when I am speaking and you look at your phone. I would appreciate it if we could talk without distractions.' This explains what happened, how you feel, and what you need without automatically attacking the other person.",
        "2. Listen to understand: Communication is not only about speaking; it is about receiving the other person's perspective. Give them time to finish, avoid interrupting or planning an argument while they talk, and check that you have understood: 'It sounds like you felt disappointed when I cancelled our plans. Have I understood correctly?'",
        "3. Choose the right time: Difficult conversations become unproductive when people are exhausted, angry, or distracted. If either person feels overwhelmed, agree to take a calm pause and set a specific time to continue.",
      ],
      kmParagraphs: [
        "ការយល់ច្រឡំកើតឡើងនៅក្នុងគ្រប់ទំនាក់ទំនង។ ជួនកាលយើងរំពឹងថាអ្នកដទៃអាចទាយដឹងពីអារម្មណ៍របស់យើងដោយមិនបាច់ពន្យល់។ ពេលខ្លះទៀត យើងមានប្រតិកម្មតបតភ្លាមៗនៅពេលកំពុងខឹង ឬឈឺចាប់។",
        "ការរៀនប្រាស្រ័យទាក់ទងឱ្យបានច្បាស់លាស់ ជួយកាត់បន្ថយជម្លោះដែលមិនចាំបាច់ និងធ្វើឱ្យកាន់តែងាយស្រួលក្នុងការយល់ចិត្តគ្នា។ ទម្លាប់ជាក់ស្តែងចំនួន ៣ អាចបង្កើតភាពខុសប្លែកគ្នាជាវិជ្ជមាន [2, 5]៖",
        "១. ប្រើប្រាស់ឃ្លាផ្ទាល់ខ្លួន (I statements)៖ នៅពេលមានអារម្មណ៍មិនសប្បាយចិត្ត សូមរៀបរាប់ពីបទពិសោធន៍ផ្ទាល់ខ្លួនរបស់អ្នក ជាជាងការស្តីបន្ទោសភ្លាមៗទៅកាន់ភាគីម្ខាងទៀត។ ជំនួសឱ្យការនិយាយថា «ឯងមិនដែលស្តាប់ខ្ញុំទេ!» សូមសាកល្បងនិយាយថា «ខ្ញុំមានអារម្មណ៍ថាមិនសូវមានគេយកចិត្តទុកដាក់ នៅពេលខ្ញុំកំពុងនិយាយ ហើយអ្នកមើលទូរស័ព្ទ។ ខ្ញុំនឹងអរគុណខ្លាំងណាស់ ប្រសិនបើយើងអាចជជែកគ្នាដោយមិនមានអ្វីរំខាន»។ វិធីនេះពន្យល់ពីអ្វីដែលបានកើតឡើង អារម្មណ៍របស់អ្នក និងអ្វីដែលអ្នកត្រូវការ ដោយមិនវាយប្រហារទៅលើភាគីម្ខាងទៀត។",
        "២. ស្តាប់ដើម្បីយល់ (Listen to understand)៖ ការប្រាស្រ័យទាក់ទងមិនមែនត្រឹមតែការនិយាយចេញនោះទេ ប៉ុន្តែវារួមបញ្ចូលទាំងការស្តាប់ទស្សនៈរបស់អ្នកដទៃផងដែរ។ ទុកពេលឱ្យពួកគេនិយាយចប់ កុំកាត់សម្តី ឬរៀបចំគំនិតប្រកែកគ្នាក្នុងក្បាលពេលគេកំពុងនិយាយ និងផ្ទៀងផ្ទាត់ការយល់ដឹងរបស់អ្នក៖ «ដូចជាអ្នកមានអារម្មណ៍ខកចិត្តនៅពេលខ្ញុំលុបចោលគម្រោងរបស់យើង។ តើខ្ញុំយល់ត្រឹមត្រូវទេ?»",
        "៣. ជ្រើសរើសពេលវេលាត្រឹមត្រូវ (Choose the right time)៖ ការសន្ទនាដ៏លំបាកអាចក្លាយជាគ្មានប្រសិទ្ធភាព នៅពេលដែលមនុស្សអស់កម្លាំង ខឹង ឬមានការរំខាន។ ប្រសិនបើភាគីណាម្នាក់មានអារម្មណ៍លើសលប់ សូមយល់ព្រមផ្អាកមួយរយៈសិន ហើយកំណត់ពេលបន្តជជែកគ្នានៅពេលដែលអារម្មណ៍ស្ងប់។",
      ],
      quiz: {
        question: "Which of the following phrases is the most constructive example of an 'I' statement during a disagreement?",
        kmQuestion: "តើឃ្លាមួយណាខាងក្រោមនេះជាគំរូដ៏ល្អបំផុតនៃការប្រើប្រាស់ឃ្លាផ្ទាល់ខ្លួន (I statement) នៅពេលមានការខ្វែងគំនិតគ្នា?",
        options: [
          {
            id: "opt-1",
            text: "You always ruin our plans and you never care about my time.",
            kmText: "ឯងតែងតែធ្វើឱ្យខូចគម្រោង ហើយមិនដែលខ្វល់ពីពេលវេលារបស់ខ្ញុំទាល់តែសោះ។",
            isCorrect: false,
          },
          {
            id: "opt-2",
            text: "I feel stressed when our plans change suddenly, and I would appreciate a message earlier.",
            kmText: "ខ្ញុំមានអារម្មណ៍តានតឹងនៅពេលគម្រោងផ្លាស់ប្តូរភ្លាមៗ ហើយខ្ញុំនឹងអរគុណប្រសិនបើមានការប្រាប់ទុកមុន។",
            isCorrect: true,
          },
          {
            id: "opt-3",
            text: "If you truly cared about me, you would already know why I am upset.",
            kmText: "ប្រសិនបើអ្នកខ្វល់ពីខ្ញុំពិតប្រាកដ អ្នកច្បាស់ជាដឹងថាហេតុអ្វីបានជាខ្ញុំខឹង។",
            isCorrect: false,
          },
          {
            id: "opt-4",
            text: "Why can you never do anything right when we talk?",
            kmText: "ហេតុអ្វីបានជាអ្នកមិនដែលធ្វើអ្វីត្រូវសោះពេលយើងជជែកគ្នា?",
            isCorrect: false,
          },
        ],
        explanation:
          "Expressing how a specific action affects your feelings and stating what would help creates understanding without triggering defensive arguments.",
        kmExplanation:
          "ការបង្ហាញពីអារម្មណ៍ផ្ទាល់ខ្លួនចំពោះស្ថានភាពជាក់លាក់ រួមជាមួយអ្វីដែលអ្នកត្រូវការ ជួយកាត់បន្ថយការប្រកាន់ខឹង និងបើកផ្លូវឱ្យមានការសហការដោះស្រាយបញ្ហាជាមួយគ្នា។",
      },
      keyPoints: [
        "Use 'I' statements to explain what you feel without attacking character [5].",
        "Listen to understand rather than preparing your next argument [2].",
        "Pause difficult conversations when emotions are high, and return when calm.",
      ],
      kmKeyPoints: [
        "ប្រើឃ្លាផ្ទាល់ខ្លួនដើម្បីពន្យល់ពីអារម្មណ៍ ដោយមិនវាយប្រហារចរិតលក្ខណៈ [5]។",
        "ស្តាប់ដើម្បីយល់ ជាជាងរៀបចំគំនិតប្រកែកគ្នា [2]។",
        "ផ្អាកការសន្ទនាពេលអារម្មណ៍តានតឹង ហើយត្រឡប់មកវិញពេលចិត្តស្ងប់។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Set and Respect Boundaries",
      kmTitle: "ការកំណត់ និងការគោរពព្រំដែនផ្ទាល់ខ្លួន",
      type: "reading",
      paragraphs: [
        "A boundary is a healthy limit you establish to protect your wellbeing, time, privacy, energy, and comfort. Boundaries help other people understand what is acceptable to you and what crosses your comfort line. [1, 5]",
        "Healthy boundaries may look like: taking time to rest after a busy day before answering calls, not allowing someone to inspect your private phone without consent, declining to discuss topics you are not ready for, or stepping away if someone shouts at you.",
        "How to express a boundary: Communicate your limit calmly and clearly. You do not need a lengthy excuse or an apology for having limits. For example: 'I value our friendship, but I cannot reply right away while I am studying. I will message you when I am free.' Or: 'I want to discuss this, but I am not comfortable while we are shouting. Let us pause and talk when we are calmer.'",
        "Respect other people's boundaries as well. When someone expresses discomfort or says no, their boundary does not mean they do not care about you. It means they are honoring their own capacity. A healthy boundary is never a tool to control someone else; it protects your own wellbeing while respecting theirs. [4, 5]",
      ],
      kmParagraphs: [
        "ព្រំដែនផ្ទាល់ខ្លួន គឺជាដែនកំណត់ដ៏ល្អមួយដែលអ្នកបង្កើតឡើងដើម្បីការពារសុខុមាលភាព ពេលវេលា ភាពឯកជន ថាមពល និងផាសុកភាពរបស់អ្នក។ ព្រំដែនជួយឱ្យអ្នកដទៃយល់ពីអ្វីដែលអ្នកអាចទទួលយកបាន និងអ្វីដែលរំលោភលើសេចក្តីសុខផ្លូវចិត្តរបស់អ្នក។ [1, 5]",
        "ព្រំដែនល្អអាចមានទម្រង់ដូចជា៖ ការចំណាយពេលសម្រាកក្រោយថ្ងៃដ៏មមាញឹកមុនពេលទទួលទូរស័ព្ទ, ការមិនអនុញ្ញាតឱ្យនរណាម្នាក់ឆែកទូរស័ព្ទផ្ទាល់ខ្លួនដោយគ្មានការយល់ព្រម, ការបដិសេធមិនជជែកពីប្រធានបទដែលអ្នកមិនទាន់រួចរាល់, ឬការដើរចេញប្រសិនបើនរណាម្នាក់ស្រែកគំហកដាក់អ្នក។",
        "របៀបបង្ហាញព្រំដែន៖ ប្រាស្រ័យទាក់ទងព្រំដែនរបស់អ្នកដោយស្ងប់ស្ងាត់ និងច្បាស់លាស់។ អ្នកមិនចាំបាច់មានលេសវែងអន្លាយ ឬពាក្យសុំទោសចំពោះការមានដែនកំណត់នោះឡើយ។ ឧទាហរណ៍៖ «ខ្ញុំឱ្យតម្លៃដល់មិត្តភាពរបស់យើង ប៉ុន្តែខ្ញុំមិនអាចតបសារភ្លាមៗពេលកំពុងរៀនបានទេ។ ខ្ញុំនឹងផ្ញើសារត្រឡប់ទៅវិញពេលខ្ញុំទំនេរ»។ ឬ «ខ្ញុំចង់ជជែករឿងនេះជាមួយអ្នក ប៉ុន្តែខ្ញុំមិនស្រួលចិត្តទេនៅពេលយើងស្រែកដាក់គ្នា។ យើងផ្អាកសិន ហើយចាំជជែកគ្នានៅពេលដែលចិត្តស្ងប់»។",
        "ការគោរពព្រំដែនរបស់អ្នកដទៃក៏សំខាន់ដូចគ្នាដែរ។ នៅពេលដែលនរណាម្នាក់បង្ហាញពីភាពមិនស្រួលចិត្ត ឬនិយាយពាក្យ 'ទេ' ព្រំដែនរបស់ពួកគេមិនមែនមានន័យថាគេមិនខ្វល់ពីអ្នកនោះទេ។ វាមានន័យថាពួកគេកំពុងថែរក្សាសមត្ថភាពផ្លូវចិត្តផ្ទាល់ខ្លួន។ ព្រំដែនត្រឹមត្រូវមិនមែនជាឧបករណ៍គ្រប់គ្រងអ្នកដទៃទេ ប៉ុន្តែវាការពារសុខុមាលភាពរបស់អ្នក និងផ្តល់ការគោរពដល់អ្នកដទៃ។ [4, 5]",
      ],
      alertBox: {
        type: "tip",
        text: "Good to know: On AROM, your personal boundaries and privacy are strictly protected. Your journals and mood logs are 100% confidential, and community support groups operate with clear guidelines so everyone feels safe.",
        kmText: "គួរដឹង៖ នៅលើកម្មវិធី AROM ព្រំដែនផ្ទាល់ខ្លួន និងភាពឯកជនរបស់អ្នកត្រូវបានការពារយ៉ាងម៉ឺងម៉ាត់។ កំណត់ហេតុ និងទិន្នន័យអារម្មណ៍របស់អ្នកត្រូវបានរក្សាទុកជាការសម្ងាត់ ១០០% ហើយក្រុមសហគមន៍ដំណើរការដោយមានគោលការណ៍ច្បាស់លាស់ដើម្បីឱ្យសមាជិកគ្រប់រូបមានអារម្មណ៍កក់ក្តៅ និងមានសុវត្ថិភាព។",
      },
      keyPoints: [
        "Boundaries protect your time, privacy, energy, and values [1, 5].",
        "State limits clearly and warmly without needing long justifications.",
        "Respecting someone else's boundary reflects maturity and care [4].",
      ],
      kmKeyPoints: [
        "ព្រំដែនផ្ទាល់ខ្លួនជួយការពារពេលវេលា ភាពឯកជន ថាមពល និងតម្លៃរបស់អ្នក [1, 5]។",
        "បង្ហាញដែនកំណត់ដោយច្បាស់លាស់ និងទន់ភ្លន់ ដោយមិនចាំបាច់មានលេសវែងឆ្ងាយ។",
        "ការគោរពព្រំដែនរបស់អ្នកដទៃឆ្លុះបញ្ចាំងពីភាពចាស់ទុំ និងការយកចិត្តទុកដាក់ [4]។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "Handle Disagreements in a Healthy Way",
      kmTitle: "ការដោះស្រាយការខ្វែងគំនិតគ្នាតាមវិធីត្រឹមត្រូវ",
      type: "reading",
      paragraphs: [
        "Conflict is a normal part of all relationships. We all bring different backgrounds, expectations, communication habits, and needs. The goal is not to avoid every disagreement, but to learn how to resolve differences without harming each other. [2]",
        "Try these four steps during a disagreement [2, 5]:",
        "Step 1: Pause before reacting. If you feel anger or distress rising, take a few slow breaths or ask for a short break. You can return when you feel more able to listen and explain yourself.",
        "Step 2: Describe the problem. Focus on the specific situation rather than attacking the other person's character. 'I felt disappointed when plans changed without letting me know' is far more constructive than 'You are always selfish.'",
        "Step 3: Listen to each other. Give both people space to explain what happened. Disagreements often come from mismatched assumptions rather than an intention to cause harm.",
        "Step 4: Look for a fair next step. Agree on what both people can do differently moving forward.",
        "What if you make a mistake? Everyone makes mistakes in relationships. A meaningful apology includes acknowledging what you did, recognizing how it affected the other person, taking responsibility without excuses, and making a genuine effort to change your behavior. An apology is a beginning; rebuilding trust takes consistent actions over time. [2]",
      ],
      kmParagraphs: [
        "ជម្លោះគឺជាផ្នែកធម្មតាមួយនៃគ្រប់ទំនាក់ទំនង។ យើងទាំងអស់គ្នាសុទ្ធតែមានប្រវត្តិ ការរំពឹងទុក ទម្លាប់ប្រាស្រ័យទាក់ទង និងសេចក្តីត្រូវការខុសៗគ្នា។ គោលដៅមិនមែនជាការគេចវេះពីការខ្វែងគំនិតទាំងអស់នោះទេ ប៉ុន្តែគឺរៀនពីរបៀបដោះស្រាយភាពខុសគ្នាដោយមិនធ្វើឱ្យប៉ះពាល់ដល់គ្នាទៅវិញទៅមក។ [2]",
        "សាកល្បងអនុវត្តជំហានទាំង ៤ នេះនៅពេលមានការខ្វែងគំនិតគ្នា [2, 5]៖",
        "ជំហានទី ១៖ ផ្អាកមួយភ្លែតមុនពេលមានប្រតិកម្ម។ ប្រសិនបើអ្នកមានអារម្មណ៍ថាខឹងខ្លាំង សូមដកដង្ហើមវែងៗយឺតៗ ឬសុំពេលសម្រាកខ្លី។ អ្នកអាចត្រឡប់មកវិញនៅពេលដែលអ្នកមានអារម្មណ៍ថាអាចស្តាប់ និងពន្យល់ខ្លួនឯងបានប្រសើរជាងមុន។",
        "ជំហានទី ២៖ រៀបរាប់ពីបញ្ហាជាក់ស្តែង។ ផ្តោតលើស្ថានភាពជាក់លាក់ ជាជាងការវាយប្រហារលើចរិតលក្ខណៈរបស់មនុស្ស។ ការនិយាយថា «ខ្ញុំមានអារម្មណ៍ខកចិត្តនៅពេលគម្រោងផ្លាស់ប្តូរដោយមិនបានប្រាប់ខ្ញុំ» គឺមានលក្ខណៈស្ថាបនាជាងពាក្យថា «ឯងតែងតែអាត្មានិយមរហូត»។",
        "ជំហានទី ៣៖ ស្តាប់គ្នាទៅវិញទៅមក។ ផ្តល់ឱកាសឱ្យភាគីទាំងសងខាងពន្យល់ពីអ្វីដែលបានកើតឡើង។ ការខ្វែងគំនិតគ្នាច្រើនតែកើតចេញពីការរំពឹងទុកខុសគ្នា ជាជាងចេតនាចង់ធ្វើបាបនរណាម្នាក់។",
        "ជំហានទី ៤៖ ស្វែងរកជំហានបន្ទាប់ដែលសមរម្យ។ ព្រមព្រៀងលើអ្វីដែលមនុស្សទាំងពីរអាចធ្វើខុសពីមុននៅពេលខាងមុខ។",
        "ចុះប្រសិនបើអ្នកជាអ្នកខុស? មនុស្សគ្រប់គ្នាសុទ្ធតែធ្លាប់ខុសក្នុងទំនាក់ទំនង។ ការសុំទោសដ៏មានអត្ថន័យរួមបញ្ចូលនូវ៖ ការទទួលស្គាល់នូវអ្វីដែលអ្នកបានធ្វើ, ការយល់ដឹងពីរបៀបដែលវាប៉ះពាល់ដល់អ្នកដទៃ, ការទទួលខុសត្រូវដោយគ្មានលេសដោះសារ, និងការខិតខំពិតប្រាកដក្នុងការផ្លាស់ប្តូរអាកប្បកិរិយារបស់អ្នក។ ការសុំទោសគឺជាចំណុចចាប់ផ្តើម ហើយការកសាងទំនុកចិត្តឡើងវិញទាមទារសកម្មភាពជាក់ស្តែងដែលទៀងទាត់។ [2]",
      ],
      keyPoints: [
        "Disagreements are natural: resolve them without personal attacks [2].",
        "Pause and breathe when anger surges before continuing the discussion.",
        "A genuine apology includes owning mistakes and changing real behavior [2].",
      ],
      kmKeyPoints: [
        "ការខ្វែងគំនិតគ្នាជារឿងធម្មតា៖ ដោះស្រាយបញ្ហាដោយមិនវាយប្រហារបុគ្គល [2]។",
        "ផ្អាក និងដកដង្ហើមវែងៗនៅពេលកំហឹងកើតឡើង មុនពេលបន្តការសន្ទនា។",
        "ការសុំទោសពិតប្រាកដ រួមបញ្ចូលការទទួលខុសត្រូវ និងការផ្លាស់ប្តូរអាកប្បកិរិយាជាក់ស្តែង [2]។",
      ],
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "Recognize Unhealthy Relationship Patterns",
      kmTitle: "សម្គាល់ទម្រង់ទំនាក់ទំនងដែលគ្មានសុខភាពល្អ",
      type: "reading",
      paragraphs: [
        "Not every relationship feels smooth all the time. People can have rough days, misunderstand each other, or make mistakes and later take responsibility. However, repeated patterns of disrespect, fear, manipulation, or control should never be dismissed as normal relationship difficulties. [1, 4]",
        "Warning signs of unhealthy patterns include [1, 4]:",
        "• Controlling behavior: Repeatedly dictating who you can see, what you wear, where you go, or constantly demanding to know where you are.",
        "• Disrespect and humiliation: Regularly insulting you, mocking your goals, embarrassing you on purpose, or making you feel worthless.",
        "• Excessive monitoring: Demanding passwords, searching your private messages without permission, or tracking your location.",
        "• Emotional manipulation: Using guilt, silent treatments, or threats to pressure you. For example, threatening self-harm if you do not obey demands. Take threats of self-harm seriously, but remember you are not responsible for managing someone's safety alone; seek professional help.",
        "• Isolation: Trying to cut you off from friends, family, school, or work connections.",
        "• Pressure and disregard for consent: Pressuring you into choices you do not want, ignoring your refusal, or acting as though you owe physical affection.",
        "• Threats or physical violence: Threatening harm, causing physical injury, or making you afraid for your safety.",
      ],
      kmParagraphs: [
        "មិនមែនគ្រប់ទំនាក់ទំនងសុទ្ធតែមានអារម្មណ៍ល្អគ្រប់ពេលវេលានោះទេ។ មនុស្សអាចមានថ្ងៃលំបាក យល់ច្រឡំគ្នា ឬធ្វើខុសហើយក្រោយមកទទួលខុសត្រូវ។ ប៉ុន្តែ ទម្រង់ដដែលៗនៃការមិនគោរព ការភ័យខ្លាច ការបោកបញ្ឆោត ឬការគ្រប់គ្រង មិនគួរត្រូវបានចាត់ទុកថាជាជម្លោះធម្មតានោះឡើយ។ [1, 4]",
        "សញ្ញាព្រមាននៃទំនាក់ទំនងដែលគ្មានសុខភាពល្អរួមមាន [1, 4]៖",
        "• អាកប្បកិរិយាគ្រប់គ្រង (Controlling behavior)៖ ព្យាយាមគ្រប់គ្រងម្តងហើយម្តងទៀតនូវមនុស្សដែលអ្នកជួប អ្វីដែលអ្នកស្លៀកពាក់ កន្លែងដែលអ្នកទៅ ឬទាមទារដឹងពីទីតាំងរបស់អ្នកគ្រប់ពេលវេលា។",
        "• ការមិនគោរព និងការបន្ទាបបន្ថោក (Disrespect and humiliation)៖ ជេរប្រមាថជាប្រចាំ បន្ទាបបន្ថោកគោលដៅរបស់អ្នក ធ្វើឱ្យអ្នកខ្មាសគេដោយចេតនា ឬធ្វើឱ្យអ្នកមានអារម្មណ៍ថាខ្លួនឯងគ្មានតម្លៃ។",
        "• ការតាមដានហួសហេតុ (Excessive monitoring)៖ ទាមទារលេខសម្ងាត់ លួចឆែកសារផ្ទាល់ខ្លួនដោយគ្មានការអនុញ្ញាត ឬតាមដានទីតាំងរបស់អ្នក។",
        "• ការបោកបញ្ឆោតផ្លូវចិត្ត (Emotional manipulation)៖ ប្រើអារម្មណ៍ខុសឆ្គង ការធ្វើមិនដឹងមិនឮ ឬការគំរាមកំហែងដើម្បីបង្ខំអ្នក។ ឧទាហរណ៍ ការគំរាមធ្វើបាបខ្លួនឯងប្រសិនបើអ្នកមិនស្តាប់តាម។ សូមយកចិត្តទុកដាក់ចំពោះការគំរាមធ្វើបាបខ្លួនឯង ប៉ុន្តែចងចាំថាអ្នកមិនមែនជាអ្នកទទួលខុសត្រូវគ្រប់គ្រងសុវត្ថិភាពរបស់នរណាម្នាក់តែម្នាក់ឯងនោះទេ សូមស្វែងរកជំនួយពីអ្នកជំនាញ។",
        "• ការផ្តាច់ទំនាក់ទំនង (Isolation)៖ ព្យាយាមរារាំងអ្នកមិនឱ្យជួបមិត្តភក្តិ គ្រួសារ ឬកន្លែងសិក្សា និងការងារ។",
        "• សម្ពាធ និងការរំលោភលើការយល់ព្រម (Pressure and disregard for consent)៖ បង្ខំឱ្យអ្នកធ្វើរឿងដែលអ្នកមិនចង់ធ្វើ មិនអើពើចំពោះការបដិសេធ ឬធ្វើឱ្យអ្នកមានអារម្មណ៍ថាជំពាក់ការស្រឡាញ់រាងកាយ។",
        "• ការគំរាមកំហែង ឬអំពើហិង្សា (Threats or physical violence)៖ ការគំរាមធ្វើបាប ការបង្ករបួសរាងកាយ ឬធ្វើឱ្យអ្នកមានការភ័យខ្លាចចំពោះសុវត្ថិភាព។",
      ],
      alertBox: {
        type: "emergency",
        text: "Important safety reminder: You deserve relationships where your safety, dignity, and boundaries are respected. If someone threatens you, acts violently, or makes you feel unsafe, prioritize your safety immediately. Open Profile in AROM and tap Get help now to connect with confidential emergency support.",
        kmText: "ការរំលឹកសុវត្ថិភាពសំខាន់៖ អ្នកសមនឹងទទួលបានទំនាក់ទំនងដែលមានការគោរពសេចក្តីថ្លៃថ្នូរ និងព្រំដែនសុវត្ថិភាព។ ប្រសិនបើនរណាម្នាក់គំរាមកំហែង ប្រើអំពើហិង្សា ឬធ្វើឱ្យអ្នកមានការភ័យខ្លាច សូមផ្តល់អាទិភាពដល់សុវត្ថិភាពផ្ទាល់ខ្លួនជាបន្ទាន់។ បើក Profile ក្នុង AROM ហើយចុច Get help now ដើម្បីទាក់ទងជំនួយបន្ទាន់ជាសម្ងាត់។",
      },
      keyPoints: [
        "Controlling behavior, excessive monitoring, and manipulation are clear warning signs [1, 4].",
        "Love and jealousy never excuse intimidation or disregard for consent.",
        "Prioritize your physical and emotional safety whenever a dynamic feels dangerous [4].",
      ],
      kmKeyPoints: [
        "អាកប្បកិរិយាគ្រប់គ្រង ការតាមដានហួសហេតុ និងការបោកបញ្ឆោត ជាសញ្ញាព្រមានច្បាស់លាស់ [1, 4]។",
        "សេចក្តីស្រឡាញ់ និងការប្រចណ្ឌ មិនអាចយកមកធ្វើជាលេសសម្រាប់ភាពគំរាមកំហែងបានឡើយ។",
        "ផ្តល់អាទិភាពដល់សុវត្ថិភាពផ្លូវកាយ និងផ្លូវចិត្ត នៅពេលមានអារម្មណ៍មិនមានសុវត្ថិភាព [4]។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "Strengthen Connections and Family in Cambodia",
      kmTitle: "ការពង្រឹងទំនាក់ទំនងប្រចាំថ្ងៃ និងបរិបទគ្រួសារនៅកម្ពុជា",
      type: "reading",
      paragraphs: [
        "Healthy relationships develop through everyday moments, not only during major conversations. Simple daily actions build strong safety over time [2, 5]: checking in with genuine curiosity ('How have things been for you lately?'), showing appreciation for small gestures, sharing quality time without phone distractions, offering support by listening first before giving advice, and accepting personal differences.",
        "Family relationships in Cambodia: In Cambodian culture, family connections, filial gratitude, and shared responsibilities are central pillars of daily life. Many young people experience stress balancing deep respect for parents and family goals with their own personal educational aspirations, career choices, and emotional needs. [3]",
        "Approaching family conversations with respect and clarity: Caring for your mental health does not mean you care less about your family. Approach important conversations during calm moments. Acknowledge your parents' loving intentions first: 'I understand you want me to have a stable future, and I am grateful for your sacrifices. I would also like to explain why this path matters to me, so we can explore it together.' Some conversations take time and patient compromises to unfold. [3]",
      ],
      kmParagraphs: [
        "ទំនាក់ទំនងល្អចម្រើនឡើងតាមរយៈសកម្មភាពតូចៗប្រចាំថ្ងៃ មិនមែនកើតឡើងតែពេលមានការសន្ទនាធំដុំនោះឡើយ។ សកម្មភាពសាមញ្ញៗជួយកសាងសុវត្ថិភាពផ្លូវចិត្តជារៀងរាល់ថ្ងៃ [2, 5]៖ ការសួរសុខទុក្ខដោយការយកចិត្តទុកដាក់ («តើមួយរយៈនេះជីវិតយ៉ាងម៉េចដែរ?»), ការបង្ហាញការដឹងគុណចំពោះរឿងតូចតាច, ការចំណាយពេលជាមួយគ្នាដោយមិនមានការរំខានពីទូរស័ព្ទ, ការផ្តល់ការគាំទ្រដោយការស្តាប់ជាមុនសិនមុននឹងផ្តល់យោបល់, និងការទទួលយកភាពខុសគ្នារបស់បុគ្គលម្នាក់ៗ។",
        "ទំនាក់ទំនងគ្រួសារនៅក្នុងប្រទេសកម្ពុជា៖ នៅក្នុងវប្បធម៌ខ្មែរ ចំណងមិត្តភាពគ្រួសារ ការដឹងគុណចំពោះឪពុកម្តាយ និងការទទួលខុសត្រូវរួមគ្នា គឺជាសសរស្តម្ភដ៏សំខាន់នៃជីវិត។ យុវជនជាច្រើនជួបប្រទះការលំបាកក្នុងការថ្លឹងថ្លែងរវាងការគោរពឪពុកម្តាយ និងការបំពេញតាមការរំពឹងទុករបស់គ្រួសារ ជាមួយនឹងក្តីប្រាថ្នាផ្ទាល់ខ្លួនក្នុងការសិក្សា អាជីពការងារ និងសេចក្តីត្រូវការផ្លូវចិត្ត។ [3]",
        "ការជជែកជាមួយគ្រួសារដោយការគោរព និងភាពច្បាស់លាស់៖ ការថែទាំសុខភាពផ្លូវចិត្តរបស់អ្នកមិនមែនមានន័យថាអ្នកមិនខ្វល់ពីគ្រួសារនោះទេ។ សូមជ្រើសរើសពេលវេលាស្ងប់ស្ងាត់ដើម្បីជជែកគ្នា។ ទទួលស្គាល់នូវចេតនាល្អរបស់ឪពុកម្តាយជាមុន៖ «ខ្ញុំយល់ថាពុកម៉ែចង់ឱ្យកូនមានអនាគតល្អ ហើយកូនដឹងគុណចំពោះការលះបង់គ្រប់យ៉ាង។ កូនក៏ចង់ពន្យល់ពីមូលហេតុដែលការសិក្សានេះសំខាន់សម្រាប់កូន ដើម្បីឱ្យយើងអាចពិភាក្សាគ្នាបាន»។ ការសន្ទនាខ្លះត្រូវការពេលវេលា និងការសម្របសម្រួលដោយការអត់ធ្មត់។ [3]",
      ],
      keyPoints: [
        "Small daily check-ins and genuine appreciation build lasting connection [5].",
        "Balancing family respect with personal goals is possible through patient dialogue [3].",
        "Acknowledge loving intentions first before discussing your personal needs.",
      ],
      kmKeyPoints: [
        "ការសួរសុខទុក្ខប្រចាំថ្ងៃ និងការដឹងគុណជួយកសាងចំណងមេត្រីភាពយូរអង្វែង [5]។",
        "ការថ្លឹងថ្លែងរវាងការគោរពគ្រួសារ និងគោលដៅផ្ទាល់ខ្លួន អាចធ្វើទៅបានតាមរយៈការសន្ទនាដោយអត់ធ្មត់ [3]។",
        "ទទួលស្គាល់ចេតនាល្អរបស់គ្រួសារជាមុន មុននឹងពន្យល់ពីសេចក្តីត្រូវការផ្ទាល់ខ្លួន។",
      ],
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "Healthy Relationships Include You, Too",
      kmTitle: "ទំនាក់ទំនងល្អត្រូវគិតគូរពីសុខុមាលភាពរបស់អ្នកផងដែរ",
      type: "reading",
      paragraphs: [
        "Sometimes people focus so much on keeping others happy that they forget their own wellbeing. You might agree to every demand because you fear disappointing people, hide your honest feelings to avoid conflict, or feel guilty whenever you take time for yourself. [1, 2]",
        "Caring about others is valuable, but your own emotional health and boundaries matter just as much. A relationship where you must constantly diminish yourself to maintain peace is not emotionally sustainable.",
        "Ask yourself these gentle reflection questions [1, 2]:",
        "• Can I express my genuine opinions in this relationship without fear?",
        "• Do I feel comfortable saying no when something crosses my limits?",
        "• Can I spend time on my own interests without being made to feel guilty?",
        "• Do I feel respected and heard when we disagree?",
        "• Do both of us make an effort to nurture this relationship, or am I carrying it alone?",
      ],
      kmParagraphs: [
        "ពេលខ្លះ មនុស្សផ្តោតខ្លាំងពេកលើការធ្វើឱ្យអ្នកដទៃសប្បាយចិត្ត រហូតដល់ភ្លេចសុខុមាលភាពផ្ទាល់ខ្លួន។ អ្នកអាចយល់ព្រមគ្រប់រឿងដោយសារខ្លាចធ្វើឱ្យគេខកចិត្ត លាក់បាំងអារម្មណ៍ពិតដើម្បីជៀសវាងជម្លោះ ឬមានអារម្មណ៍ខុសឆ្គងរាល់ពេលដែលអ្នកចំណាយពេលសម្រាកសម្រាប់ខ្លួនឯង។ [1, 2]",
        "ការខ្វល់ខ្វាយពីអ្នកដទៃគឺជារឿងល្អ ប៉ុន្តែសុខភាពផ្លូវចិត្ត និងព្រំដែនរបស់អ្នកក៏មានសារៈសំខាន់ស្មើគ្នាដែរ។ ទំនាក់ទំនងដែលទាមទារឱ្យអ្នកបំបិទសម្លេងខ្លួនឯងជាប្រចាំដើម្បីរក្សាភាពស្ងប់ស្ងាត់ គឺជាទំនាក់ទំនងដែលមិនអាចទ្រទ្រង់បានយូរអង្វែងឡើយ។",
        "សូមសួរសំណួរឆ្លុះបញ្ចាំងទាំងនេះទៅកាន់ខ្លួនឯង [1, 2]៖",
        "• តើខ្ញុំអាចបញ្ចេញមតិពិតប្រាកដក្នុងទំនាក់ទំនងនេះដោយគ្មានការភ័យខ្លាចដែរឬទេ?",
        "• តើខ្ញុំមានអារម្មណ៍ស្រួលចិត្តក្នុងការនិយាយពាក្យ 'ទេ' នៅពេលរឿងនោះហួសពីដែនកំណត់របស់ខ្ញុំដែរឬទេ?",
        "• តើខ្ញុំអាចចំណាយពេលលើចំណង់ចំណូលចិត្តផ្ទាល់ខ្លួនដោយមិនមានអារម្មណ៍ខុសឆ្គងដែរឬទេ?",
        "• តើខ្ញុំមានអារម្មណ៍ថាទទួលបានការគោរព និងការស្តាប់នៅពេលយើងខ្វែងគំនិតគ្នាដែរឬទេ?",
        "• តើយើងទាំងពីរនាក់រួមចំណែកដល់ទំនាក់ទំនងនេះ ឬមានតែខ្ញុំម្នាក់ឯងដែលកំពុងរែកពន់វា?",
      ],
      keyPoints: [
        "Caring for others should never require abandoning your own needs [1, 2].",
        "Healthy connections leave room for both people to be authentic and heard.",
        "You are allowed to care about someone while recognizing that dynamics must change.",
      ],
      kmKeyPoints: [
        "ការខ្វល់ខ្វាយពីអ្នកដទៃ មិនគួរតម្រូវឱ្យអ្នកបោះបង់សេចក្តីត្រូវការផ្ទាល់ខ្លួនឡើយ [1, 2]។",
        "ទំនាក់ទំនងល្អទុកកន្លែងឱ្យមនុស្សទាំងពីរនាក់រស់នៅជាខ្លួនឯង និងទទួលបានការស្តាប់។",
        "អ្នកអាចស្រឡាញ់នរណាម្នាក់ ដោយនៅតែទទួលស្គាល់ថាទម្រង់ទំនាក់ទំនងនោះត្រូវការការកែសម្រួល។",
      ],
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "Self-Reflection on an Important Relationship",
      kmTitle: "ការឆ្លុះបញ្ចាំងពីទំនាក់ទំនងសំខាន់មួយក្នុងជីវិត",
      type: "reflection",
      paragraphs: [
        "Choose one relationship you would like to understand better. It could be with a friend, family member, partner, classmate, or colleague.",
        "You do not need to choose the most painful relationship in your life; start with one that feels safe to reflect upon. Reflection is not a test with right or wrong answers; it is an opportunity to cultivate self awareness and notice where you can invite more calm and honest communication.",
      ],
      kmParagraphs: [
        "ជ្រើសរើសទំនាក់ទំនងមួយដែលអ្នកចង់ស្វែងយល់ឱ្យកាន់តែច្បាស់។ វាអាចជាទំនាក់ទំនងជាមួយមិត្តភក្តិ សមាជិកគ្រួសារ ដៃគូស្នេហា មិត្តរួមថ្នាក់ ឬសហការី។",
        "អ្នកមិនចាំបាច់ជ្រើសរើសទំនាក់ទំនងដែលពិបាកបំផុតក្នុងជីវិតនោះទេ សូមចាប់ផ្តើមជាមួយទំនាក់ទំនងណាដែលមានអារម្មណ៍ថាសុវត្ថិភាពក្នុងការឆ្លុះបញ្ចាំង។ ការឆ្លុះបញ្ចាំងមិនមែនជាការប្រឡងដែលមានចម្លើយត្រូវឬខុសឡើយ ប៉ុន្តែវាជាឱកាសដើម្បីបង្កើនការយល់ដឹងពីខ្លួនឯង និងកត់សម្គាល់កន្លែងដែលអ្នកអាចបង្កើតការសន្ទនាដោយស្មោះត្រង់។",
      ],
      reflection: {
        question: "When reflecting on your important connections right now, what is one area you would like to strengthen?",
        kmQuestion: "នៅពេលឆ្លុះបញ្ចាំងពីទំនាក់ទំនងសំខាន់ៗរបស់អ្នកនៅពេលនេះ តើចំណុចមួយណាដែលអ្នកចង់ពង្រឹងបន្ថែម?",
        options: [
          "Expressing my personal boundaries and needs more calmly and clearly.",
          "Practicing deeper active listening without getting defensive.",
          "Sharing honest feelings and appreciation more openly with people I value.",
          "Setting healthy distance from relationships that consistently drain my energy.",
        ],
        kmOptions: [
          "ការបង្ហាញព្រំដែន និងសេចក្តីត្រូវការផ្ទាល់ខ្លួនឱ្យកាន់តែច្បាស់លាស់ និងស្ងប់ស្ងាត់។",
          "ការហាត់ស្តាប់ដោយយកចិត្តទុកដាក់ឱ្យកាន់តែស៊ីជម្រៅ ដោយមិនប្រកាន់ខឹង។",
          "ការចែករំលែកអារម្មណ៍ពិត និងការដឹងគុណឱ្យកាន់តែបើកចំហជាមួយមនុស្សដែលខ្ញុំស្រឡាញ់។",
          "ការកំណត់គម្លាតសុខភាពល្អពីទំនាក់ទំនងដែលធ្វើឱ្យខ្ញុំអស់ថាមពលជាប្រចាំ។",
        ],
        feedbackMessage:
          "Recognizing what you need is the foundation of healthier relationships. Growth in connections happens one honest conversation and one clear boundary at a time.",
        kmFeedbackMessage:
          "ការកត់សម្គាល់ឃើញនូវអ្វីដែលអ្នកត្រូវការ គឺជាមូលដ្ឋានគ្រឹះនៃទំនាក់ទំនងកាន់តែល្អប្រសើរ។ ការរីកចម្រើនក្នុងទំនាក់ទំនងកើតឡើងតាមរយៈការសន្ទនាដោយស្មោះត្រង់ និងការកំណត់ព្រំដែនម្តងមួយៗ។",
      },
      keyPoints: [
        "Personal reflection brings clarity to what is working and what feels strained.",
        "Small shifts in communication create lasting improvements in closeness.",
        "Be patient with yourself as you practice setting boundaries and expressing needs.",
      ],
      kmKeyPoints: [
        "ការឆ្លុះបញ្ចាំងជួយឱ្យយល់ច្បាស់ពីអ្វីដែលដំណើរការល្អ និងអ្វីដែលកំពុងតានតឹង។",
        "ការផ្លាស់ប្តូរតូចៗក្នុងការប្រាស្រ័យទាក់ទង បង្កើតភាពស្និទ្ធស្នាលយូរអង្វែង។",
        "សូមអត់ធ្មត់ចំពោះខ្លួនឯងនៅពេលអ្នកហាត់កំណត់ព្រំដែន និងបង្ហាញសេចក្តីត្រូវការ។",
      ],
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "Next Steps and Support on AROM",
      kmTitle: "ជំហានបន្ទាប់ និងការគាំទ្រនៅលើ AROM",
      type: "coping",
      paragraphs: [
        "Healthy relationships are an ongoing journey of learning, listening, and respecting boundaries. You do not have to carry relationship stress alone.",
        "On AROM, you have dedicated tools to nurture your relational wellbeing:",
        "• AROM Community Support Groups: Join safe, peer-moderated community circles to discuss family dynamics, study stress, and friendship with people who understand your journey.",
        "• AROM Private Journal: Take a few minutes after difficult conversations to type or voice record your reflections. Unloading thoughts into your confidential journal helps untangle feelings before you respond.",
        "• AROM Professional Support: If you are experiencing ongoing family conflict, relationship grief, or unhealthy dynamics, connect in complete privacy with verified therapists and counselors specializing in family and interpersonal counseling.",
        "Remember: If a relationship ever threatens your physical safety or makes you feel in immediate danger, prioritize your physical safety. Open your Profile and tap Get help now to access emergency support.",
      ],
      kmParagraphs: [
        "ទំនាក់ទំនងល្អ គឺជាដំណើរនៃការរៀនសូត្រ ការស្តាប់ និងការគោរពព្រំដែនជាបន្តបន្ទាប់។ អ្នកមិនចាំបាច់រែកពន់ភាពតានតឹងក្នុងទំនាក់ទំនងតែម្នាក់ឯងនោះឡើយ។",
        "នៅលើកម្មវិធី AROM អ្នកមានឧបករណ៍ជាច្រើនដើម្បីជួយដល់សុខុមាលភាពក្នុងទំនាក់ទំនងរបស់អ្នក៖",
        "• ក្រុមសហគមន៍ AROM (Community Groups)៖ ចូលរួមក្រុមសហគមន៍ដែលមានការសម្របសម្រួលប្រកបដោយសុវត្ថិភាព ដើម្បីពិភាក្សាពីរឿងគ្រួសារ សម្ពាធការសិក្សា និងមិត្តភាពជាមួយអ្នកដទៃដែលយល់ចិត្តអ្នក។",
        "• កំណត់ហេតុឯកជន AROM (Private Journal)៖ ចំណាយពេលពីរបីនាទីបន្ទាប់ពីការសន្ទនាដ៏លំបាក ដើម្បីសរសេរ ឬកត់ត្រាសំឡេងគំនិតរបស់អ្នក។ ការបញ្ចេញអារម្មណ៍ចូលក្នុងកំណត់ហេតុសម្ងាត់ជួយឱ្យចិត្តរបស់អ្នកស្រឡះមុនពេលឆ្លើយតប។",
        "• ការគាំទ្រពីអ្នកជំនាញ AROM (Professional Support)៖ ប្រសិនបើអ្នកកំពុងជួបប្រទះជម្លោះគ្រួសាររ៉ាំរ៉ៃ ការបែកបាក់ ឬទម្រង់ទំនាក់ទំនងដែលប៉ះពាល់ផ្លូវចិត្តខ្លាំង អ្នកអាចភ្ជាប់ទំនាក់ទំនងជាសម្ងាត់ជាមួយអ្នកជំនាញចិត្តសាស្រ្ត និងអ្នកប្រឹក្សាដែលមានជំនាញក្នុងទំនាក់ទំនងគ្រួសារ និងអន្តរបុគ្គល។",
        "ចងចាំថា៖ ប្រសិនបើទំនាក់ទំនងណាមួយគំរាមកំហែងដល់សុវត្ថិភាពរាងកាយ ឬធ្វើឱ្យអ្នកមានគ្រោះថ្នាក់បន្ទាន់ សូមផ្តល់អាទិភាពដល់សុវត្ថិភាពផ្ទាល់ខ្លួនជាមុន។ បើក Profile ហើយចុច Get help now ដើម្បីទាក់ទងជំនួយបន្ទាន់។",
      ],
      actions: [
        {
          label: "1-Minute Calming Breath",
          kmLabel: "ហាត់ដកដង្ហើមស្ងប់ចិត្ត ១ នាទី (Breathing)",
          actionType: "exercise",
        },
        {
          label: "Match Me With A Professional",
          kmLabel: "ស្វែងរកអ្នកជំនាញ (Match Me)",
          actionType: "professional",
        },
      ],
      keyPoints: [
        "Healthy relationships take ongoing practice, patience, and mutual care [1, 2].",
        "AROM Community and Journal provide private, safe spaces to process feelings.",
        "Verified counselors on AROM offer confidential guidance for navigating family and relationship strain.",
      ],
      kmKeyPoints: [
        "ទំនាក់ទំនងល្អទាមទារការអនុវត្ត ការអត់ធ្មត់ និងការយកចិត្តទុកដាក់បន្តបន្ទាប់ [1, 2]។",
        "សហគមន៍ និងកំណត់ហេតុ AROM ផ្តល់ទីកន្លែងសុវត្ថិភាពជាឯកជនដើម្បីរំងាប់អារម្មណ៍។",
        "អ្នកជំនាញលើ AROM ផ្តល់ការប្រឹក្សាជាសម្ងាត់សម្រាប់ដោះស្រាយបញ្ហាគ្រួសារ និងទំនាក់ទំនង។",
      ],
    },
  ],
};

export const ALL_LESSONS: Lesson[] = [
  LESSON_WHAT_IS_MENTAL_HEALTH,
  LESSON_ABOUT_STRESS,
  LESSON_UNDERSTANDING_ANXIETY,
  LESSON_UNDERSTAND_YOURSELF,
  LESSON_KNOW_WHEN_TO_SEEK_HELP,
  LESSON_BETTER_SLEEP,
  LESSON_BUILD_HEALTHY_RELATIONSHIPS,
  {
    id: "burnout-recovery",
    title: "Burnout & Recovery",
    kmTitle: "ភាពអស់កម្លាំងចិត្ត និងការស្តារឡើងវិញ (Burnout)",
    subtitle: "Spot exhaustion early and rebuild your mental reserves",
    kmSubtitle: "សម្គាល់ការអស់កម្លាំងចិត្ត និងការស្តារថាមពល",
    category: "Burnout",
    duration: "8 min",
    kmDuration: "៨ នាទី",
    difficulty: "Intermediate",
    kmDifficulty: "កម្រិតមធ្យម (Intermediate)",
    format: "Reading + Self-Assessment",
    kmFormat: "ការអាន និងការវាយតម្លៃខ្លួនឯង (Self-Assessment)",
    isAvailable: false,
    badge: "Coming Soon",
    image: "/mindguide/icon-11.svg",
    description:
      "Recognize the distinction between ordinary tiredness and systemic burnout, and learn realistic steps to recharge.",
    kmDescription: "ស្គាល់ពីភាពខុសគ្នារវាងការអស់កម្លាំងធម្មតា និងការអស់កម្លាំងចិត្តរ៉ាំរ៉ៃ។",
    totalSections: 5,
    outcomes: [
      { en: "The 3 clinical pillars of burnout" },
      { en: "Restructuring personal and work boundaries" },
      { en: "Small daily restoration practices" },
    ],
    sections: [],
    references: [],
  },
  {
    id: "building-self-esteem",
    title: "Building Self-Esteem",
    kmTitle: "ការកសាងតម្លៃខ្លួនឯង (Self-Esteem)",
    subtitle: "Develop self-compassion and silence harsh self-criticism",
    kmSubtitle: "បង្កើតក្តីមេត្តាចំពោះខ្លួនឯង និងបន្ថយការបន្ទោសខ្លួន",
    category: "Self-esteem",
    duration: "6 min",
    kmDuration: "៦ នាទី",
    difficulty: "Beginner",
    kmDifficulty: "កម្រិតដំបូង (Beginner)",
    format: "Reading + Exercises",
    kmFormat: "ការអាន និងលំហាត់ (Exercises)",
    isAvailable: false,
    badge: "Coming Soon",
    image: "/mindguide/icon-7.svg",
    description:
      "Practice speaking to yourself with genuine warmth, rewriting internal critics, and grounding your self-worth.",
    kmDescription: "ហាត់និយាយជាមួយខ្លួនឯងដោយក្តីមេត្តា និងបង្កើនទំនុកចិត្តលើខ្លួនឯង។",
    totalSections: 4,
    outcomes: [
      { en: "Unpacking the roots of negative self-talk" },
      { en: "The 3 elements of self-compassion" },
      { en: "Daily affirmations grounded in reality" },
    ],
    sections: [],
    references: [],
  },
];

export const INITIAL_SAVED_ITEMS: SavedItem[] = [
  {
    id: "learn-about-stress",
    type: "lesson",
    title: "Learn About Stress",
    kmTitle: "ស្វែងយល់ពីភាពតានតឹង (Stress)",
    category: "Stress",
    duration: "6 min",
    progressPercent: 60,
    thumbnail: "/mindguide/stress.png",
  },
  {
    id: "tip-slow-breathing",
    type: "tip",
    title: "1-Minute Calming Breath",
    kmTitle: "ដកដង្ហើមស្ងប់ចិត្ត ១ នាទី (1-Min Breath)",
    category: "Technique",
    duration: "1 min",
    thumbnail: "/mindguide/icon-11.svg",
  },
  {
    id: "podcast-stress-signals",
    type: "podcast",
    title: "Episode 04: Listening to Your Body's Stress Alarm",
    kmTitle: "ភាគ ០៤៖ ស្តាប់សញ្ញាអាសន្នរបស់រាងកាយ (Body Signals)",
    category: "Mind & Body",
    duration: "12 min",
    thumbnail: "/mindguide/icon-9.svg",
  },
];

export const STORAGE_KEYS = {
  SAVED_ITEMS: "arom_saved_items_v1",
  LESSON_PROGRESS: "arom_lesson_progress_v1",
  BOOKMARKS: "arom_bookmarked_lessons_v1",
};

export type ProgressData = {
  completedSections: number;
  totalSections: number;
  isComplete: boolean;
  lastVisitedSection: number;
  quizAnswer?: string;
  reflectionAnswer?: string;
};

export const EMPTY_LESSON_PROGRESS: ProgressData = {
  completedSections: 0,
  totalSections: 5,
  isComplete: false,
  lastVisitedSection: 1,
};

// Fired after a bookmark changes, so open screens update (see use-lesson-storage.ts).
export const BOOKMARKS_UPDATED_EVENT = "arom_bookmarks_updated";

export function getLessonProgress(lessonId: string): ProgressData {
  if (typeof window === "undefined") return EMPTY_LESSON_PROGRESS;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEYS.LESSON_PROGRESS}_${lessonId}`);
    return raw ? JSON.parse(raw) : EMPTY_LESSON_PROGRESS;
  } catch {
    return EMPTY_LESSON_PROGRESS;
  }
}

export function saveLessonProgress(lessonId: string, data: ProgressData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${STORAGE_KEYS.LESSON_PROGRESS}_${lessonId}`, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save lesson progress", err);
  }
}

export function isLessonBookmarked(lessonId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!raw) return false;
    const list: string[] = JSON.parse(raw);
    return list.includes(lessonId);
  } catch {
    return false;
  }
}

export function toggleLessonBookmark(lessonId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    let list: string[] = raw ? JSON.parse(raw) : [];
    const exists = list.includes(lessonId);
    if (exists) {
      list = list.filter((id) => id !== lessonId);
    } else {
      list.push(lessonId);
    }
    window.localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
    window.dispatchEvent(new Event(BOOKMARKS_UPDATED_EVENT));
    return !exists;
  } catch {
    return false;
  }
}
