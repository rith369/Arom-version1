export type TopicCategory =
  | "All"
  | "Basics"
  | "Stress"
  | "Anxiety"
  | "Sleep"
  | "Emotions"
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

export const ALL_LESSONS: Lesson[] = [
  LESSON_WHAT_IS_MENTAL_HEALTH,
  LESSON_ABOUT_STRESS,
  LESSON_UNDERSTANDING_ANXIETY,
  {
    id: "better-sleep",
    title: "Better Sleep",
    kmTitle: "ដំណេកប្រកបដោយគុណភាព (Better Sleep)",
    subtitle: "Understand healthy sleep habits and why sleep matters",
    kmSubtitle: "ទម្លាប់គេងល្អ និងសារៈសំខាន់នៃដំណេក",
    category: "Sleep",
    duration: "5 min",
    kmDuration: "៥ នាទី",
    difficulty: "Beginner",
    kmDifficulty: "កម្រិតដំបូង (Beginner)",
    format: "Reading + Interactive",
    kmFormat: "ការអាន និងអន្តរកម្ម (Reading & Interactive)",
    isAvailable: false,
    badge: "Coming Soon",
    image: "/mindguide/sleep.png",
    description:
      "Understand healthy sleep hygiene, evening wind-down routines, and why deep rest powers your mind.",
    kmDescription: "យល់ដឹងពីទម្លាប់គេងប្រកបដោយសុខភាព និងសារៈសំខាន់នៃការសម្រាក។",
    totalSections: 4,
    outcomes: [
      { en: "The science of sleep cycles and brain recovery" },
      { en: "Creating an evening wind-down sanctuary" },
      { en: "What to do when racing thoughts keep you awake" },
    ],
    sections: [],
    references: [],
  },
  {
    id: "understanding-emotions",
    title: "Understanding Your Emotions",
    kmTitle: "ស្វែងយល់ពីអារម្មណ៍របស់អ្នក (Emotions)",
    subtitle: "Learn how emotions work and how to recognize them",
    kmSubtitle: "ដំណើរការនៃរលកអារម្មណ៍ និងការសម្គាល់ពួកវា",
    category: "Emotions",
    duration: "6 min",
    kmDuration: "៦ នាទី",
    difficulty: "Beginner",
    kmDifficulty: "កម្រិតដំបូង (Beginner)",
    format: "Reading + Guided Reflection",
    kmFormat: "ការអាន និងការឆ្លុះបញ្ចាំង (Guided Reflection)",
    isAvailable: false,
    badge: "Coming Soon",
    image: "/mindguide/strategies.png",
    description:
      "Learn how emotional waves function in the brain and simple ways to observe feelings without reacting immediately.",
    kmDescription: "រៀនពីរបៀបដែលអារម្មណ៍ដំណើរការ និងរបៀបសង្កេតពួកវាដោយចិត្តស្ងប់។",
    totalSections: 4,
    outcomes: [
      { en: "The primary purpose of emotions as messengers" },
      { en: "Expanding your emotional vocabulary" },
      { en: "Allowing difficult emotions to pass naturally" },
    ],
    sections: [],
    references: [],
  },
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
