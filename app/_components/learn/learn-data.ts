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

export const REFERENCES_SADNESS_VS_DEPRESSION: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "WHO",
    title: "World Health Organization: Depressive Disorder (Depression)",
    url: "https://www.who.int/en/news-room/fact-sheets/detail/depression",
  },
  {
    id: 2,
    citation: "[2]",
    source: "NIMH",
    title: "National Institute of Mental Health: Depression",
    url: "https://www.nimh.nih.gov/health/publications/depression",
  },
  {
    id: 3,
    citation: "[3]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia: Mental Health",
    url: "https://www.unicef.org/cambodia/mental-health",
  },
  {
    id: 4,
    citation: "[4]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia: A Conversation on Mental Health",
    url: "https://www.unicef.org/cambodia/stories/conversation-mental-health",
  },
];

export const LESSON_SADNESS_VS_DEPRESSION: Lesson = {
  id: "sadness-vs-depression",
  title: "Sadness vs. Depression",
  kmTitle: "ភាពក្រៀមក្រំ និងជំងឺបាក់ទឹកចិត្ត (Sadness vs. Depression)",
  subtitle: "Understand your feelings, recognize the signs, and know when to seek support",
  kmSubtitle: "យល់ដឹងពីអារម្មណ៍របស់អ្នក សម្គាល់សញ្ញាព្រមាន និងដឹងពីពេលវេលាដែលត្រូវស្វែងរកជំនួយ",
  category: "Emotions",
  duration: "8 min",
  kmDuration: "៨ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Quiz",
  kmFormat: "ការអាន និងកម្រងសំណួរ (Reading & Quiz)",
  isAvailable: true,
  image: "/mindguide/strategies.png",
  heroImage: "/mindguide/sadness-vs-depression-hero.jpg",
  description:
    "Understand the key differences between everyday sadness and clinical depression, spot the early warning signs, and discover compassionate paths to healing on AROM.",
  kmDescription:
    "យល់ដឹងពីភាពខុសគ្នាសំខាន់ៗរវាងភាពក្រៀមក្រំធម្មតា និងជំងឺបាក់ទឹកចិត្ត សម្គាល់សញ្ញាព្រមានដំបូង និងស្វែងយល់ពីវិធីព្យាបាលប្រកបដោយក្តីមេត្តានៅលើ AROM។",
  totalSections: 9,
  outcomes: [
    {
      en: "Understand the natural role of everyday sadness in processing life events [1]",
      km: "ស្វែងយល់ពីតួនាទីធម្មជាតិនៃភាពក្រៀមក្រំក្នុងការឆ្លើយតបនឹងព្រឹត្តិការណ៍ជីវិត [1]",
    },
    {
      en: "Learn how depression uniquely affects mood, energy, thinking, and daily life [1, 2]",
      km: "ដឹងពីរបៀបដែលជំងឺបាក់ទឹកចិត្តជះឥទ្ធិពលលើអារម្មណ៍ ថាមពល ការគិត និងជីវិតប្រចាំថ្ងៃ [1, 2]",
    },
    {
      en: "Differentiate sadness from depression based on triggers, duration, and functioning",
      km: "បែងចែកភាពខុសគ្នារវាងភាពក្រៀមក្រំ និងជំងឺបាក់ទឹកចិត្ត ផ្អែកលើមូលហេតុ រយៈពេល និងសកម្មភាពប្រចាំថ្ងៃ",
    },
    {
      en: "Recognize emotional changes, daily disruptions, and serious warning signs [2, 3]",
      km: "សម្គាល់ការប្រែប្រួលអារម្មណ៍ ការរំខានដល់ទម្លាប់ប្រចាំថ្ងៃ និងសញ្ញាព្រមានធ្ងន់ធ្ងរ [2, 3]",
    },
    {
      en: "Know how to gently support a friend or family member without judgment [4]",
      km: "ដឹងពីរបៀបជួយគាំទ្រមិត្តភក្តិ ឬសមាជិកគ្រួសារដោយការយល់ចិត្ត និងមិនវិនិច្ឆ័យ [4]",
    },
    {
      en: "Reflect privately with AROM Journal and connect with confidential therapy [1, 3]",
      km: "ឆ្លុះបញ្ចាំងដោយសម្ងាត់ជាមួយកំណត់ហេតុ AROM និងភ្ជាប់ការប្រឹក្សាជាមួយអ្នកជំនាញ [1, 3]",
    },
  ],
  references: REFERENCES_SADNESS_VS_DEPRESSION,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "What Is Sadness?",
      kmTitle: "តើអ្វីទៅជាភាពក្រៀមក្រំ? (What Is Sadness?)",
      type: "reading",
      paragraphs: [
        "Have you ever felt sad after an argument, disappointed by an exam result, or worried about your future?",
        "Sadness is a normal human emotion. Everyone experiences it at different times, and it is almost always connected to something happening in our lives.",
        "You might feel sad because:",
        "• You did not get the exam results you hoped for.",
        "• You had an argument with a friend or family member.",
        "• Someone you care about moved away.",
        "• You experienced rejection or disappointment.",
        "• Things are not going the way you expected.",
        "Sadness can feel uncomfortable, but it is not a sign that something is wrong with you. When you feel sad, you might cry, want some quiet time, or need support from someone you trust.",
        "Your feelings may become easier to manage with time, rest, supportive relationships, or changes in the situation.",
        "However, sadness does not always disappear quickly. Grief and other difficult life events can affect people for a long time. The length of time you feel sad alone does not determine whether you have depression. The important thing is to notice how you feel, what you are experiencing, and how it affects your daily life.",
      ],
      kmParagraphs: [
        "តើអ្នកធ្លាប់មានអារម្មណ៍ក្រៀមក្រំបន្ទាប់ពីមានជម្លោះ ខកចិត្តនឹងលទ្ធផលប្រឡង ឬព្រួយបារម្ភពីអនាគតរបស់អ្នកដែរឬទេ?",
        "ភាពក្រៀមក្រំ គឺជាអារម្មណ៍ធម្មជាតិរបស់មនុស្ស។ មនុស្សគ្រប់គ្នាសុទ្ធតែធ្លាប់ឆ្លងកាត់វានៅពេលវេលាផ្សេងៗគ្នា ហើយវាច្រើនតែមានទំនាក់ទំនងជាមួយរឿងរ៉ាវជាក់លាក់ដែលកើតឡើងក្នុងជីវិត។",
        "អ្នកអាចមានអារម្មណ៍ក្រៀមក្រំដោយសារតែ៖",
        "• អ្នកមិនទទួលបានលទ្ធផលប្រឡងដូចការរំពឹងទុក។",
        "• អ្នកមានការខ្វែងគំនិតជាមួយមិត្តភក្តិ ឬសមាជិកគ្រួសារ។",
        "• មនុស្សជាទីស្រឡាញ់របស់អ្នកបានផ្លាស់ទៅរស់នៅឆ្ងាយ។",
        "• អ្នកជួបប្រទះការបដិសេធ ឬការខកចិត្ត។",
        "• អ្វីៗមិនដំណើរការទៅតាមការគ្រោងទុក។",
        "ភាពក្រៀមក្រំអាចធ្វើឱ្យអ្នកមានអារម្មណ៍មិនស្រួល ប៉ុន្តែវាមិនមែនជាសញ្ញាបញ្ជាក់ថាមានអ្វីមួយខុសប្រក្រតីចំពោះអ្នកនោះទេ។ នៅពេលអ្នកកើតទុក្ខ អ្នកអាចយំ ចង់បានពេលស្ងប់ស្ងាត់ ឬត្រូវការការគាំទ្រពីមនុស្សដែលអ្នកទុកចិត្ត។",
        "អារម្មណ៍របស់អ្នកអាចនឹងធូរស្រាលទៅតាមពេលវេលា ការសម្រាក ទំនាក់ទំនងដែលគាំទ្រ ឬការផ្លាស់ប្តូរនៃស្ថានភាព។",
        "ទោះជាយ៉ាងណា ភាពក្រៀមក្រំមិនតែងតែរសាត់បាត់ទៅលឿននោះឡើយ។ ទុក្ខសោក និងបទពិសោធន៍លំបាកៗអាចប៉ះពាល់ដល់មនុស្សម្នាក់ក្នុងរយៈពេលយូរ។ រយៈពេលដែលអ្នកកើតទុក្ខតែមួយមុខ មិនអាចកំណត់ថាអ្នកមានជំងឺបាក់ទឹកចិត្តនោះទេ។ អ្វីដែលសំខាន់ គឺត្រូវកត់សម្គាល់ពីរបៀបដែលអ្នកមានអារម្មណ៍ និងរបៀបដែលវាជះឥទ្ធិពលលើជីវិតប្រចាំថ្ងៃរបស់អ្នក។",
      ],
      keyPoints: [
        "Sadness is a natural and healthy emotional reaction to loss, disappointment, or change.",
        "It is usually tied to a specific life event or difficult circumstance.",
        "Feeling sad does not mean you are flawed or that something is wrong with you.",
      ],
      kmKeyPoints: [
        "ភាពក្រៀមក្រំ គឺជាប្រតិកម្មផ្លូវចិត្តធម្មជាតិ និងមានសុខភាពល្អចំពោះការបាត់បង់ ការខកចិត្ត ឬការផ្លាស់ប្តូរ។",
        "វាច្រើនតែផ្សារភ្ជាប់ទៅនឹងព្រឹត្តិការណ៍ជីវិតជាក់លាក់ ឬស្ថានភាពលំបាកណាមួយ។",
        "ការមានអារម្មណ៍កើតទុក្ខ មិនមែនមានន័យថាអ្នកខុស ឬមានបញ្ហាខុសប្រក្រតីនោះឡើយ។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "What Is Depression?",
      kmTitle: "តើអ្វីទៅជាជំងឺបាក់ទឹកចិត្ត? (What Is Depression?)",
      type: "reading",
      paragraphs: [
        "Depression is a mental health condition that affects how a person feels, thinks, and functions in daily life. [1, 2]",
        "It can involve persistent sadness, irritability, emptiness, or a loss of interest and pleasure in activities that were once meaningful.",
        "A person experiencing depression may find it difficult to study, work, sleep, maintain relationships, or complete everyday responsibilities.",
        "Depression can affect anyone. It is not a personal failure, a lack of willpower, or proof that someone is weak. It develops through a complex combination of biological, psychological, and social factors. Difficult life experiences, prolonged stress, and grief may contribute, but there is not always one clear cause. [1, 3]",
        "Depression can also affect people who appear cheerful, productive, or successful to others. You cannot reliably tell how someone is feeling simply by looking at them from the outside.",
        "Remember: Depression is a recognized health condition, and effective, evidence-based treatments are available. People can recover and feel hopeful again with appropriate support. [1, 2]",
      ],
      kmParagraphs: [
        "ជំងឺបាក់ទឹកចិត្ត (Depression) គឺជាស្ថានភាពសុខភាពផ្លូវចិត្តដែលជះឥទ្ធិពលលើរបៀបដែលមនុស្សម្នាក់មានអារម្មណ៍ ការគិត និងដំណើរការក្នុងជីវិតប្រចាំថ្ងៃ។ [1, 2]",
        "វាអាចពាក់ព័ន្ធនឹងអារម្មណ៍ក្រៀមក្រំជាប់រហូត ភាពឆាប់ខឹង អារម្មណ៍ទទេស្អាតក្នុងចិត្ត ឬការបាត់បង់ចំណាប់អារម្មណ៍ និងសេចក្តីរីករាយចំពោះសកម្មភាពដែលធ្លាប់ចូលចិត្តពីមុន។",
        "មនុស្សដែលជួបប្រទះជំងឺបាក់ទឹកចិត្ត អាចមានការលំបាកក្នុងការសិក្សា ការងារ ការគេង ការរក្សាទំនាក់ទំនង ឬការបំពេញទំនួលខុសត្រូវប្រចាំថ្ងៃ។",
        "ជំងឺបាក់ទឹកចិត្តអាចកើតឡើងលើមនុស្សគ្រប់រូប។ វាមិនមែនជាការបរាជ័យផ្ទាល់ខ្លួន មិនមែនជាកង្វះឆន្ទៈ ឬជាភស្តុតាងដែលបង្ហាញថាបុគ្គលនោះទន់ខ្សោយនោះឡើយ។ វាវិវត្តឡើងតាមរយៈការរួមបញ្ចូលគ្នាយ៉ាងស្មុគស្មាញនៃកត្តាជីវសាស្ត្រ ចិត្តសាស្ត្រ និងសង្គម។ បទពិសោធន៍ជីវិតដ៏លំបាក ភាពតានតឹងរ៉ាំរ៉ៃ និងការបាត់បង់ អាចជាកត្តារួមចំណែក ប៉ុន្តែមិនមែនតែងតែមានមូលហេតុច្បាស់លាស់តែមួយនោះទេ។ [1, 3]",
        "ជំងឺបាក់ទឹកចិត្តក៏អាចកើតលើអ្នកដែលមានទឹកមុខរីករាយ ឬទទួលបានជោគជ័យខាងក្រៅផងដែរ។ អ្នកមិនអាចដឹងច្បាស់ពីអារម្មណ៍ពិតរបស់អ្នកដទៃ ដោយគ្រាន់តែសម្លឹងមើលរូបរាងខាងក្រៅរបស់ពួកគេនោះឡើយ។",
        "ចូរចងចាំថា៖ ជំងឺបាក់ទឹកចិត្តគឺជាស្ថានភាពសុខភាពពិតប្រាកដមួយ ហើយវិធីសាស្ត្រព្យាបាលប្រកបដោយប្រសិទ្ធភាពគឺមានជានិច្ច។ មនុស្សគ្រប់រូបអាចជាសះស្បើយ និងទទួលបានក្តីសង្ឃឹមឡើងវិញ តាមរយៈការទទួលបានការគាំទ្រត្រឹមត្រូវ។ [1, 2]",
      ],
      keyPoints: [
        "Depression is a clinical health condition affecting mood, thoughts, and bodily energy [1].",
        "It is never a sign of personal weakness, laziness, or lack of character.",
        "People can experience depression while appearing completely cheerful on the outside.",
      ],
      kmKeyPoints: [
        "ជំងឺបាក់ទឹកចិត្តគឺជាស្ថានភាពសុខភាពផ្លូវចិត្តដែលប៉ះពាល់ដល់អារម្មណ៍ ការគិត និងថាមពលរាងកាយ [1]។",
        "វាមិនមែនជាសញ្ញានៃភាពទន់ខ្សោយ ភាពខ្ជិលច្រអូស ឬកង្វះឆន្ទៈផ្ទាល់ខ្លួននោះឡើយ។",
        "មនុស្សអាចប្រឈមនឹងជំងឺបាក់ទឹកចិត្ត ទោះបីជាពួកគេបង្ហាញភាពរីករាយនៅខាងក្រៅក៏ដោយ។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Sadness vs. Depression: What Is the Difference?",
      kmTitle: "ភាពខុសគ្នារវាងភាពក្រៀមក្រំ និងជំងឺបាក់ទឹកចិត្ត (Key Differences)",
      type: "quiz",
      paragraphs: [
        "Sadness and depression can share some emotional experiences, but they are fundamentally different:",
        "• Triggers: Everyday sadness is usually connected to a specific event or situation. Depression may follow difficult experiences, but it often occurs without any obvious trigger. [1, 2]",
        "• Duration: Sadness comes in waves and may fade with time or good news. Depression involves persistent low mood or numbness that continues most of the day, nearly every day, for weeks or months.",
        "• Capacity for Joy: When sad, you can still laugh at a joke or enjoy a favorite meal. With depression, activities that once brought joy feel completely empty or exhausting.",
        "• Daily Impact: Everyday sadness allows you to continue studying, working, and relating to others. Depression impairs your ability to complete everyday routines, concentrate, or get out of bed.",
        "• Support Needed: Sadness often eases with rest, personal reflection, and a caring friend. Depression frequently requires professional therapy, clinical counseling, and medical guidance. [1, 2]",
        "These distinctions are general guidelines rather than a formal diagnosis. People experience both in unique ways, and you do not need to identify the exact label before asking for support.",
      ],
      kmParagraphs: [
        "ភាពក្រៀមក្រំ និងជំងឺបាក់ទឹកចិត្តអាចមានលក្ខណៈស្រដៀងគ្នាមួយចំនួន ប៉ុន្តែវាមានភាពខុសគ្នាជាមូលដ្ឋាន៖",
        "• មូលហេតុជំរុញ៖ ភាពក្រៀមក្រំធម្មតា ច្រើនតែផ្សារភ្ជាប់នឹងព្រឹត្តិការណ៍ ឬស្ថានភាពជាក់លាក់។ រីឯជំងឺបាក់ទឹកចិត្ត អាចកើតឡើងបន្ទាប់ពីឧបសគ្គជីវិត ប៉ុន្តែក៏អាចកើតឡើងដោយគ្មានមូលហេតុច្បាស់លាស់ផងដែរ។ [1, 2]",
        "• រយៈពេល៖ ភាពក្រៀមក្រំមកហើយទៅ ហើយអាចធូរស្រាលតាមពេលវេលា ឬពេលមានដំណឹងល្អ។ រីឯជំងឺបាក់ទឹកចិត្ត ជាប់រហូតស្ទើរតែពេញមួយថ្ងៃ ស្ទើររាល់ថ្ងៃ រាប់សប្តាហ៍ ឬរាប់ខែ។",
        "• សមត្ថភាពក្នុងការរីករាយ៖ នៅពេលកើតទុក្ខ អ្នកនៅតែអាចសើចសប្បាយ ឬញ៉ាំអាហារឆ្ងាញ់ជាមួយមិត្តភក្តិបាន។ ចំណែកជំងឺបាក់ទឹកចិត្ត សកម្មភាពដែលធ្លាប់ចូលចិត្តប្រែជាគ្មានន័យ និងអស់កម្លាំងចិត្ត។",
        "• ផលប៉ះពាល់ប្រចាំថ្ងៃ៖ ភាពក្រៀមក្រំនៅតែអនុញ្ញាតឱ្យអ្នករៀន ធ្វើការ និងរស់នៅបាន។ រីឯជំងឺបាក់ទឹកចិត្ត ធ្វើឱ្យពិបាកបំពេញកិច្ចការប្រចាំថ្ងៃ ពិបាកផ្ចង់អារម្មណ៍ ឬពិបាកក្រោកពីគ្រែ។",
        "• ការគាំទ្រដែលត្រូវការ៖ ភាពក្រៀមក្រំអាចធូរស្បើយដោយការសម្រាក និងការលួងលោមពីមិត្តភក្តិ។ ជំងឺបាក់ទឹកចិត្តច្រើនតែទាមទារការពិគ្រោះយោបល់ជាមួយអ្នកជំនាញ និងការព្យាបាលត្រឹមត្រូវ។ [1, 2]",
        "ភាពខុសគ្នាទាំងនេះគឺជាគោលការណ៍ណែនាំទូទៅ មិនមែនជាការធ្វើរោគវិនិច្ឆ័យវេជ្ជសាស្ត្រនោះទេ។ អ្នកមិនចាំបាច់រង់ចាំដឹងឈ្មោះជំងឺច្បាស់លាស់ ទើបហ៊ានស្វែងរកជំនួយនោះឡើយ។",
      ],
      quiz: {
        question: "Which of the following is a key characteristic that distinguishes depression from ordinary sadness?",
        kmQuestion: "តើចំណុចមួយណាខាងក្រោមជាលក្ខណៈសំខាន់ដែលបែងចែកជំងឺបាក់ទឹកចិត្តពីភាពក្រៀមក្រំធម្មតា?",
        options: [
          {
            id: "opt-1",
            text: "Sadness only happens to adults, while depression only affects children",
            kmText: "ភាពក្រៀមក្រំកើតឡើងតែលើមនុស្សពេញវ័យ ចំណែកជំងឺបាក់ទឹកចិត្តកើតលើកុមារ",
            isCorrect: false,
          },
          {
            id: "opt-2",
            text: "Depression persists most of the day for weeks, removes the capacity for joy, and disrupts everyday functioning",
            kmText: "ជំងឺបាក់ទឹកចិត្តកើតមានស្ទើរពេញមួយថ្ងៃរាប់សប្តាហ៍ បាត់បង់សេចក្តីរីករាយ និងរំខានដល់ការរស់នៅប្រចាំថ្ងៃ",
            isCorrect: true,
          },
          {
            id: "opt-3",
            text: "Ordinary sadness always requires immediate hospitalization and prescription medication",
            kmText: "ភាពក្រៀមក្រំធម្មតាតែងតែទាមទារឱ្យសម្រាកនៅមន្ទីរពេទ្យ និងប្រើថ្នាំភ្លាមៗ",
            isCorrect: false,
          },
          {
            id: "opt-4",
            text: "Depression is solely caused by a lack of positive thinking and willpower",
            kmText: "ជំងឺបាក់ទឹកចិត្តកើតឡើងដោយសារតែកង្វះការគិតវិជ្ជមាន និងកង្វះការតស៊ូតែប៉ុណ្ណោះ",
            isCorrect: false,
          },
        ],
        explanation:
          "Correct. Ordinary sadness tends to be temporary, connected to specific events, and allows moments of joy. Depression persists across weeks, impairs daily functioning, and diminishes your ability to feel pleasure [1, 2].",
        kmExplanation:
          "ត្រឹមត្រូវណាស់។ ភាពក្រៀមក្រំធម្មតាច្រើនតែកើតឡើងបណ្តោះអាសន្ន ជាប់ទាក់ទងនឹងរឿងរ៉ាវជាក់លាក់ និងនៅតែអាចសប្បាយចិត្តបានខ្លះ។ រីឯជំងឺបាក់ទឹកចិត្តមានរយៈពេលវែង រំខានដល់ការរស់នៅ និងធ្វើឱ្យបាត់បង់សេចក្តីរីករាយ [1, 2]។",
      },
      keyPoints: [
        "Sadness comes and goes, whereas depression persists across weeks [1, 2].",
        "Depression often removes the ability to feel pleasure even during positive events.",
        "When emotions persistently impair work, sleep, or study, professional guidance is essential.",
      ],
      kmKeyPoints: [
        "ភាពក្រៀមក្រំមកហើយទៅ ប៉ុន្តែជំងឺបាក់ទឹកចិត្តនៅជាប់ជាប់រហូតរាប់សប្តាហ៍ [1, 2]។",
        "ជំងឺបាក់ទឹកចិត្តធ្វើឱ្យបាត់បង់សមត្ថភាពក្នុងការរីករាយ សូម្បីតែក្នុងព្រឹត្តិការណ៍ល្អៗ។",
        "នៅពេលអារម្មណ៍ប៉ះពាល់ដល់ការងារ ការគេង ឬការរៀនសូត្រ ការពិគ្រោះជាមួយអ្នកជំនាញគឺជារឿងចាំបាច់។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "Recognize Possible Signs of Depression",
      kmTitle: "ការសម្គាល់សញ្ញានៃជំងឺបាក់ទឹកចិត្ត (Recognize the Signs)",
      type: "reading",
      paragraphs: [
        "Depression manifests differently for everyone. Not everyone experiences the exact same symptoms, but healthcare professionals group the signs into three common categories [1, 2]:",
        "1. Emotional Changes:",
        "• Feeling sad, empty, numb, or low for most of the day.",
        "• Feeling hopeless, helpless, or pessimistic about the future.",
        "• Becoming unusually irritable, agitated, or easily frustrated over minor matters.",
        "• Carrying excessive guilt, harsh self-blame, or feelings of worthlessness.",
        "• Losing interest in hobbies, sports, music, or socializing.",
        "2. Changes in Daily Functioning:",
        "• Difficulty concentrating, remembering details, or making decisions.",
        "• Chronic fatigue, exhaustion, or feeling as though your body is drained of energy.",
        "• Sleeping much more than usual or struggling with persistent insomnia.",
        "• Changes in appetite, noticeable weight loss, or weight gain.",
        "• Withdrawing from family gatherings, friends, or messaging circles.",
        "• Falling behind in school assignments, workplace responsibilities, or household tasks.",
        "3. Serious Warning Signs:",
        "• Feeling that life is meaningless or that you are a burden to those around you.",
        "• Frequent thoughts about death, disappearing, or self-harm.",
        "These symptoms can also stem from medical conditions, nutritional deficiencies, or prolonged chronic stress. Only a qualified healthcare professional can evaluate your overall health.",
      ],
      kmParagraphs: [
        "ជំងឺបាក់ទឹកចិត្តបង្ហាញឡើងខុសៗគ្នាចំពោះមនុស្សម្នាក់ៗ។ មិនមែនគ្រប់គ្នាសុទ្ធតែមានរោគសញ្ញាដូចគ្នាបេះបិទនោះទេ ប៉ុន្តែអ្នកជំនាញសុខភាពផ្លូវចិត្តតែងតែចាត់ថ្នាក់សញ្ញាទាំងនោះជាបីក្រុមធំៗ [1, 2]៖",
        "១. ការប្រែប្រួលផ្នែកអារម្មណ៍៖",
        "• មានអារម្មណ៍កើតទុក្ខ ស្ពឹកស្រពន់ ឬទទេស្អាតស្ទើរពេញមួយថ្ងៃ។",
        "• អារម្មណ៍អស់សង្ឃឹម គ្មានកម្លាំងចិត្ត ឬគិតអវិជ្ជមានចំពោះអនាគត។",
        "• ឆាប់មួម៉ៅ ឆាប់ខឹង ឬរំខានចិត្តលើរឿងតូចតាចខុសពីធម្មតា។",
        "• មានអារម្មណ៍បន្ទោសខ្លួនឯងជ្រុល គិតថាខ្លួនគ្មានតម្លៃ ឬជាបន្ទុករបស់អ្នកដទៃ។",
        "• បាត់បង់ចំណាប់អារម្មណ៍លើចំណង់ចំណូលចិត្ត កីឡា តន្ត្រី ឬការជួបជុំ។",
        "២. ការប្រែប្រួលក្នុងជីវិតប្រចាំថ្ងៃ៖",
        "• ពិបាកផ្ចង់អារម្មណ៍ ពិបាកចងចាំ ឬពិបាកធ្វើការសម្រេចចិត្ត។",
        "• អស់កម្លាំងរ៉ាំរ៉ៃ គ្មានថាមពលក្នុងខ្លួន ទោះបីជាបានសម្រាកក៏ដោយ។",
        "• គេងច្រើនជ្រុលខុសធម្មតា ឬពិបាកគេងលក់ស្ទើររាល់យប់។",
        "• ការប្រែប្រួលចំណង់អាហារ ស្រកទម្ងន់ ឬឡើងទម្ងន់គួរឱ្យកត់សម្គាល់។",
        "• ដកខ្លួនចេញពីក្រុមគ្រួសារ មិត្តភក្តិ ឬឈប់តបសារអ្នកដទៃ។",
        "• ធ្លាក់ចុះការសិក្សា ការងារ ឬមិនអាចបំពេញកិច្ចការផ្ទះបាន។",
        "៣. សញ្ញាព្រមានធ្ងន់ធ្ងរ៖",
        "• អារម្មណ៍ថាជីវិតគ្មានន័យ ឬគិតថាអ្នកជាបន្ទុកដល់មនុស្សជុំវិញខ្លួន។",
        "• គិតចង់បាត់ខ្លួន គិតអំពីការស្លាប់ ឬចង់ធ្វើបាបខ្លួនឯង។",
        "រោគសញ្ញាទាំងនេះក៏អាចបណ្តាលមកពីបញ្ហាសុខភាពរាងកាយ កង្វះជីវជាតិ ឬភាពតានតឹងរ៉ាំរ៉ៃផងដែរ។ មានតែអ្នកជំនាញសុខភាពដែលមានវិជ្ជាជីវៈត្រឹមត្រូវប៉ុណ្ណោះដែលអាចវាយតម្លៃសុខភាពរបស់អ្នកបានត្រឹមត្រូវ។",
      ],
      alertBox: {
        type: "emergency",
        text: "Emergency Safety Notice: If you or someone you know is having thoughts of suicide or self-harm, please reach out for immediate support. Open your AROM Profile and tap 'Get help now' to access verified national crisis contacts and hotlines.",
        kmText:
          "ដំណឹងសុវត្ថិភាពបន្ទាន់៖ ប្រសិនបើអ្នក ឬមនុស្សដែលអ្នកស្គាល់កំពុងមានគំនិតចង់ធ្វើបាបខ្លួនឯង ឬគិតចង់ធ្វើអត្តឃាត សូមស្វែងរកជំនួយជាបន្ទាន់។ បើកផ្ទាំង Profile លើ AROM ហើយចុច 'Get help now' ដើម្បីទាក់ទងខ្សែទូរស័ព្ទសង្គ្រោះបន្ទាន់ជាតិ។",
      },
      keyPoints: [
        "Depression affects emotions, daily physical energy, and cognitive focus [1, 2].",
        "Withdrawal, chronic fatigue, and numbness are just as common as crying.",
        "Thoughts of self-harm require prompt and caring clinical attention.",
      ],
      kmKeyPoints: [
        "ជំងឺបាក់ទឹកចិត្តជះឥទ្ធិពលលើអារម្មណ៍ ថាមពលរាងកាយ និងការផ្ចង់ស្មារតី [1, 2]។",
        "ការដកខ្លួន ការអស់កម្លាំងរ៉ាំរ៉ៃ និងភាពស្ពឹកស្រពន់ កើតឡើងញឹកញាប់ដូចការយំដែរ។",
        "គំនិតចង់ធ្វើបាបខ្លួនឯង ទាមទារការយកចិត្តទុកដាក់ និងជំនួយបន្ទាន់ពីអ្នកជំនាញ។",
      ],
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "Why Does the Difference Matter?",
      kmTitle: "ហេតុអ្វីបានជាការយល់ដឹងពីភាពខុសគ្នានេះមានសារៈសំខាន់? (Why It Matters)",
      type: "reading",
      paragraphs: [
        "Understanding whether you are navigating everyday sadness or experiencing symptoms of depression enables you to respond to your body and mind with appropriate care:",
        "If you are experiencing sadness:",
        "• You can give yourself space and permission to process painful feelings without self-criticism.",
        "• Talking with a trusted family member or close friend brings relief and warmth. [3, 4]",
        "• Prioritizing restful sleep, nourishing meals, and comforting hobbies helps restore emotional balance.",
        "• You do not need to force yourself to feel cheerful overnight. Gentle self-care is usually enough.",
        "If you are experiencing depression:",
        "• Everyday self-care practices alone may not be sufficient to resolve what is happening.",
        "• Speaking with a licensed mental health professional, counselor, or clinical doctor is key to understanding your symptoms and exploring treatment paths. [1, 2]",
        "• Evidence-based treatments, such as cognitive behavioral therapy, lifestyle adjustments, and medical support, have high rates of success.",
        "• You never have to wait until your life feels completely unbearable before you ask for help.",
        "Remember: Self-care is a wonderful companion to mental wellness, but it is not a replacement for professional clinical care when a medical condition is present.",
      ],
      kmParagraphs: [
        "ការដឹងច្បាស់ថាតើអ្នកកំពុងជួបប្រទះភាពក្រៀមក្រំធម្មតា ឬរោគសញ្ញានៃជំងឺបាក់ទឹកចិត្ត ជួយឱ្យអ្នកអាចឆ្លើយតបចំពោះរាងកាយ និងចិត្តរបស់អ្នកដោយវិធីសាស្ត្រត្រឹមត្រូវ៖",
        "ប្រសិនបើអ្នកកំពុងជួបប្រទះភាពក្រៀមក្រំ៖",
        "• អ្នកអាចទុកពេល និងផ្តល់ការអនុញ្ញាតឱ្យខ្លួនឯងដោះស្រាយអារម្មណ៍ឈឺចាប់ ដោយមិនបន្ទោសខ្លួនឯង។",
        "• ការនិយាយជាមួយសមាជិកគ្រួសារ ឬមិត្តភក្តិដែលទុកចិត្ត នាំមកនូវភាពកក់ក្តៅ និងការធូរស្បើយក្នុងចិត្ត។ [3, 4]",
        "• ការគេងឱ្យបានគ្រប់គ្រាន់ ញ៉ាំអាហារមានជីវជាតិ និងធ្វើសកម្មភាពដែលចូលចិត្ត ជួយស្តារតុល្យភាពផ្លូវចិត្តឡើងវិញ។",
        "• អ្នកមិនចាំបាច់បង្ខំខ្លួនឯងឱ្យរីករាយភ្លាមៗនោះទេ ការថែទាំខ្លួនឯងដោយចិត្តមេត្តាគឺគ្រប់គ្រាន់ហើយ។",
        "ប្រសិនបើអ្នកកំពុងជួបប្រទះជំងឺបាក់ទឹកចិត្ត៖",
        "• ការថែទាំខ្លួនឯងធម្មតាប្រចាំថ្ងៃ អាចមិនគ្រប់គ្រាន់ដើម្បីដោះស្រាយស្ថានភាពនេះបានឡើយ។",
        "• ការពិភាក្សាជាមួយអ្នកជំនាញសុខភាពផ្លូវចិត្ត ឬអ្នកប្រឹក្សាដែលមានវិជ្ជាជីវៈ គឺជាគន្លឹះដើម្បីស្វែងយល់ពីរោគសញ្ញា និងវិធីសាស្ត្រព្យាបាល។ [1, 2]",
        "• ការព្យាបាលតាមបែបចិត្តសាស្ត្រ ការកែសម្រួលទម្លាប់រស់នៅ និងការប្រើថ្នាំវេជ្ជសាស្ត្រ សុទ្ធតែមានប្រសិទ្ធភាពខ្ពស់។",
        "• អ្នកមិនចាំបាច់រង់ចាំរហូតដល់ជីវិតលែងទ្រាំបាន ទើបសម្រេចចិត្តស្វែងរកជំនួយនោះទេ។",
        "ចូរចងចាំថា៖ ការថែទាំខ្លួនឯងគឺជាកម្លាំងជំនួយដ៏ល្អសម្រាប់សុខុមាលភាពផ្លូវចិត្ត ប៉ុន្តែវាមិនអាចជំនួសការព្យាបាលពីអ្នកជំនាញបានឡើយ នៅពេលមានជំងឺសុខភាពផ្លូវចិត្តកើតឡើង។",
      ],
      keyPoints: [
        "Sadness responds well to rest, conversation with friends, and gentle self-compassion [3, 4].",
        "Depression often requires clinical guidance and evidence-based psychotherapy [1, 2].",
        "Seeking clinical help early prevents symptoms from deepening over time.",
      ],
      kmKeyPoints: [
        "ភាពក្រៀមក្រំអាចធូរស្បើយតាមរយៈការសម្រាក ការជជែកជាមួយមិត្តភក្តិ និងការយល់ចិត្តខ្លួនឯង [3, 4]។",
        "ជំងឺបាក់ទឹកចិត្តទាមទារការណែនាំពីអ្នកជំនាញ និងការព្យាបាលតាមបែបចិត្តសាស្ត្រ [1, 2]។",
        "ការស្វែងរកជំនួយពីដំណាក់កាលដំបូង ជួយការពារកុំឱ្យរោគសញ្ញាកាន់តែធ្ងន់ធ្ងរ។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "When Should You Seek Help?",
      kmTitle: "តើនៅពេលណាដែលអ្នកគួរស្វែងរកជំនួយ? (When to Seek Help)",
      type: "reading",
      paragraphs: [
        "Knowing when to reach out to a professional protects your overall wellbeing and quality of life. Consider contacting a qualified healthcare professional or therapist if [1, 2]:",
        "• Low mood, lack of joy, or emotional numbness persists for two weeks or longer.",
        "• Your emotional distress is intensifying or feeling increasingly unmanageable.",
        "• You are experiencing persistent disruptions in your sleep patterns, appetite, energy, or focus.",
        "• Your studies, workplace performance, friendships, or family responsibilities are suffering.",
        "• You feel chronic hopelessness or the belief that things will never improve.",
        "• You feel uneasy or worried about your mental health, even if you cannot explain the reason.",
        "The two-week timeframe is a clinical benchmark for identifying possible depressive episodes, not a strict waiting rule. You can reach out for support at any time whenever you feel weighed down.",
        "Most importantly: If you are having thoughts of suicide or self-harm, do not wait two weeks. Reach out for caring support right away.",
      ],
      kmParagraphs: [
        "ការដឹងពីពេលវេលាដែលត្រូវស្វែងរកជំនួយពីអ្នកជំនាញ ជួយការពារសុខុមាលភាព និងគុណភាពជីវិតរបស់អ្នក។ សូមពិចារណាទាក់ទងអ្នកជំនាញសុខភាព ឬអ្នកប្រឹក្សាផ្លូវចិត្ត ប្រសិនបើ [1, 2]៖",
        "• អារម្មណ៍ក្រៀមក្រំ ការបាត់បង់សេចក្តីរីករាយ ឬភាពស្ពឹកស្រពន់នៅជាប់រហូតចាប់ពីពីរសប្តាហ៍ឡើងទៅ។",
        "• ទុក្ខព្រួយផ្លូវចិត្តរបស់អ្នកកាន់តែខ្លាំងឡើង ឬមានអារម្មណ៍ថាពិបាកគ្រប់គ្រងឡើងៗ។",
        "• អ្នកជួបប្រទះការរំខានជាប់រហូតលើដំណេក ចំណង់អាហារ ថាមពលរាងកាយ ឬការផ្ចង់ស្មារតី។",
        "• ការសិក្សា ការងារ មិត្តភាព ឬទំនួលខុសត្រូវក្នុងគ្រួសាររបស់អ្នករងផលប៉ះពាល់។",
        "• អ្នកមានអារម្មណ៍អស់សង្ឃឹមរ៉ាំរ៉ៃ ឬជឿជាក់ថាគ្មានអ្វីអាចប្រសើរឡើងវិញបានឡើយ។",
        "• អ្នកមានការបារម្ភពីសុខភាពផ្លូវចិត្តរបស់ខ្លួន ទោះបីជាមិនដឹងច្បាស់ពីមូលហេតុក៏ដោយ។",
        "រយៈពេលពីរសប្តាហ៍គឺជាគោលការណ៍ណែនាំវេជ្ជសាស្ត្រ ដើម្បីសម្គាល់សញ្ញានៃជំងឺបាក់ទឹកចិត្ត មិនមែនជាច្បាប់តម្រូវឱ្យអ្នកត្រូវតែរង់ចាំនោះឡើយ។ អ្នកអាចស្វែងរកជំនួយនៅពេលណាក៏បាន ឱ្យតែអ្នកមានអារម្មណ៍ធ្ងន់ធ្ងរក្នុងចិត្ត។",
        "អ្វីដែលសំខាន់បំផុត៖ ប្រសិនបើអ្នកមានគំនិតចង់ធ្វើបាបខ្លួនឯង ឬគិតចង់ធ្វើអត្តឃាត សូមកុំរង់ចាំពីរសប្តាហ៍ឡើយ ចូរស្វែងរកជំនួយជាបន្ទាន់។",
      ],
      alertBox: {
        type: "tip",
        text: "AROM Professional Care: On AROM, you can privately book confidential sessions with verified counselors and clinical psychologists in Cambodia. You do not need a referral, and your privacy is strictly protected.",
        kmText:
          "ការថែទាំពីអ្នកជំនាញ AROM៖ នៅលើ AROM អ្នកអាចកក់ការប្រឹក្សាជាសម្ងាត់ជាមួយអ្នកប្រឹក្សា និងអ្នកជំនាញចិត្តសាស្ត្រដែលមានអាជ្ញាបណ្ណនៅកម្ពុជា។ អ្នកមិនចាំបាច់មានលិខិតបញ្ជូនទេ ហើយការសម្ងាត់ត្រូវបានការពារយ៉ាងតឹងរ៉ឹងបំផុត។",
      },
      keyPoints: [
        "Two weeks of persistent low mood or loss of interest is a clinical signal to seek assessment [1, 2].",
        "You do not have to wait until you hit rock bottom to ask for help.",
        "Thoughts of suicide or self-harm require immediate intervention.",
      ],
      kmKeyPoints: [
        "អារម្មណ៍មិនល្អជាប់គ្នារយៈពេលពីរសប្តាហ៍ គឺជាសញ្ញាវេជ្ជសាស្ត្រដែលគួរស្វែងរកការវាយតម្លៃ [1, 2]។",
        "អ្នកមិនចាំបាច់រង់ចាំរហូតដល់ធ្លាក់ដល់ចំណុចទាល់ច្រក ទើបហ៊ានសុំជំនួយនោះទេ។",
        "គំនិតចង់ធ្វើអត្តឃាត ឬធ្វើបាបខ្លួនឯង ទាមទារការជួយសង្គ្រោះបន្ទាន់ភ្លាមៗ។",
      ],
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "How Can You Support Someone Who May Be Depressed?",
      kmTitle: "របៀបជួយគាំទ្រមនុស្សជុំវិញខ្លួន (Supporting Others)",
      type: "reading",
      paragraphs: [
        "You may notice that a close friend, classmate, sibling, or partner has become quiet, withdrawn from group activities, or seems to be carrying an invisible weight. You do not need to be a doctor to show genuine care. [4]",
        "Start a gentle conversation:",
        "• Pick a quiet, private, and comfortable environment where they will not feel rushed or overheard.",
        "• Use open and caring phrasing: 'I noticed you seem to be having a difficult time lately. How have you been feeling?'",
        "Listen without judgment:",
        "• Give them uninterrupted time to speak. Resist the urge to fix everything immediately.",
        "• Avoid toxic positivity or dismissive statements such as: 'You just need to think positively,' 'Other people have it much worse,' or 'You should be able to snap out of this.'",
        "• Even when spoken with good intentions, these words make someone feel misunderstood and deeply alone.",
        "• Instead, validate their experience: 'I am so sorry things have felt this heavy. Thank you for telling me. I am here with you.'",
        "Encourage professional care:",
        "• If their struggles persist, gently suggest speaking with a counselor or doctor. Offer to help them explore options or accompany them if that feels supportive.",
        "• Take any mention of self-harm or suicide with utmost seriousness. Ask clearly and compassionately, and connect them with emergency resources immediately.",
        "• Remember: You can be a deeply compassionate supporter without taking sole responsibility for their recovery.",
      ],
      kmParagraphs: [
        "អ្នកអាចសម្គាល់ឃើញថាមិត្តជិតស្និទ្ធ មិត្តរួមថ្នាក់ បងប្អូន ឬដៃគូរបស់អ្នកប្រែជាស្ងប់ស្ងាត់ ដកខ្លួនចេញពីការជួបជុំ ឬហាក់ដូចជាកំពុងរែកពន់បន្ទុកដ៏ធ្ងន់។ អ្នកមិនចាំបាច់ធ្វើជាគ្រូពេទ្យ ដើម្បីបង្ហាញការយកចិត្តទុកដាក់នោះឡើយ។ [4]",
        "ចាប់ផ្តើមការសន្ទនាដោយទន់ភ្លន់៖",
        "• ជ្រើសរើសទីកន្លែងស្ងប់ស្ងាត់ មានផាសុកភាព និងជាឯកជន ដែលពួកគេមិនមានអារម្មណ៍តក់ក្រហល់។",
        "• ប្រើពាក្យសម្តីដែលបង្ហាញការបារម្ភ៖ «ខ្ញុំសម្គាល់ឃើញថាអ្នកហាក់ដូចជាមានរឿងពិបាកចិត្តនាពេលថ្មីៗនេះ។ តើអ្នកមានអារម្មណ៍យ៉ាងណាដែរ?»",
        "ស្តាប់ដោយមិនវិនិច្ឆ័យ៖",
        "• ទុកពេលឱ្យពួកគេនិយាយដោយមិនកាត់សម្តី។ កុំទាន់ប្រញាប់ព្យាយាមដោះស្រាយបញ្ហាភ្លាមៗ។",
        "• ជៀសវាងការនិយាយបែបវិជ្ជមានជ្រុល ឬពាក្យសម្តីបន្ទោសដូចជា៖ «អ្នកគ្រាន់តែត្រូវគិតវិជ្ជមាន» «អ្នកដទៃជួបបញ្ហាធំជាងនេះផង» ឬ «រឿងប៉ុណ្ណឹងគួរតែទ្រាំបាន»។",
        "• ទោះបីជាអ្នកមានបំណងល្អក៏ដោយ ពាក្យសម្តីទាំងនេះអាចធ្វើឱ្យពួកគេមានអារម្មណ៍ថាគ្មានអ្នកយល់ចិត្ត និងឯកោជាងមុន។",
        "• ផ្ទុយទៅវិញ ចូរផ្តល់ការលើកទឹកចិត្ត៖ «ខ្ញុំសោកស្តាយណាស់ដែលអ្នកត្រូវឆ្លងកាត់រឿងលំបាកបែបនេះ។ អរគុណដែលបានចែករំលែកប្រាប់ខ្ញុំ។ ខ្ញុំនៅទីនេះជាមួយអ្នកជានិច្ច»។",
        "លើកទឹកចិត្តឱ្យស្វែងរកជំនួយពីអ្នកជំនាញ៖",
        "• ប្រសិនបើបញ្ហានៅតែបន្ត សូមលើកទឹកចិត្តពួកគេដោយទន់ភ្លន់ឱ្យជួបអ្នកប្រឹក្សាផ្លូវចិត្ត ឬគ្រូពេទ្យ។ អ្នកអាចជួយស្វែងរកសេវាកម្ម ឬទៅកំដរពួកគេប្រសិនបើពួកគេចង់បាន។",
        "• ប្រសិនបើពួកគេនិយាយពីការធ្វើបាបខ្លួនឯង ឬការសម្លាប់ខ្លួន សូមយកចិត្តទុកដាក់ខ្ពស់បំផុត។ សួរនាំដោយក្តីមេត្តា និងជួយពួកគេទាក់ទងសេវាសង្គ្រោះបន្ទាន់ភ្លាមៗ។",
        "• ចូរចងចាំថា៖ អ្នកអាចជាអ្នកគាំទ្រដ៏កក់ក្តៅម្នាក់ ដោយមិនចាំបាច់ទទួលខុសត្រូវទាំងស្រុងលើការព្យាបាលរបស់ពួកគេនោះឡើយ។",
      ],
      keyPoints: [
        "Reach out in a private setting and ask gentle, open questions [4].",
        "Avoid dismissive phrases or forced positivity: listen with genuine presence.",
        "Take any expression of self-harm seriously and assist them in accessing professional care.",
      ],
      kmKeyPoints: [
        "ចាប់ផ្តើមសន្ទនាក្នុងទីកន្លែងឯកជន និងសួរសំណួរបើកដោយក្តីមេត្តា [4]។",
        "ជៀសវាងការនិយាយបែបកាត់បន្ថយបញ្ហា ឬការបង្ខំឱ្យគិតវិជ្ជមាន៖ ចូរស្តាប់ដោយចិត្តស្មោះ។",
        "យកចិត្តទុកដាក់ខ្ពស់ចំពោះការលើកឡើងពីការធ្វើបាបខ្លួនឯង និងជួយពួកគេទាក់ទងអ្នកជំនាញ។",
      ],
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "A Gentle Check-In With Yourself",
      kmTitle: "ការពិនិត្យមើលខ្លួនឯងដោយក្តីមេត្តា (Self Check-In)",
      type: "reflection",
      paragraphs: [
        "Take a quiet moment to reflect on how you have been feeling recently. You can answer these six reflection prompts privately in your personal AROM Journal:",
        "1. How would I describe my mood over the past two weeks?",
        "2. Have I lost interest or pleasure in activities I usually enjoy?",
        "3. Have I noticed changes in my sleep, appetite, energy, or ability to concentrate?",
        "4. Have my feelings affected my studies, work, friendships, or daily responsibilities?",
        "5. Have I talked with someone I trust about what I am experiencing?",
        "6. Would it feel supportive to speak with a qualified mental health professional?",
        "There are no right or wrong answers, and you can skip any prompt that feels uncomfortable. These questions are for your personal reflection, not a medical test.",
      ],
      kmParagraphs: [
        "ឆ្លៀតពេលស្ងប់ស្ងាត់បន្តិច ដើម្បីឆ្លុះបញ្ចាំងពីរបៀបដែលអ្នកមានអារម្មណ៍នាពេលថ្មីៗនេះ។ អ្នកអាចឆ្លើយសំណួរឆ្លុះបញ្ចាំងទាំងប្រាំមួយនេះជាឯកជន នៅក្នុងកំណត់ហេតុ AROM របស់អ្នក៖",
        "១. តើខ្ញុំនឹងពណ៌នាអំពីអារម្មណ៍របស់ខ្ញុំក្នុងរយៈពេលពីរសប្តាហ៍កន្លងមកនេះយ៉ាងដូចម្តេច?",
        "២. តើខ្ញុំបានបាត់បង់ចំណាប់អារម្មណ៍ ឬសេចក្តីរីករាយចំពោះសកម្មភាពដែលខ្ញុំធ្លាប់ចូលចិត្តដែរឬទេ?",
        "៣. តើខ្ញុំបានកត់សម្គាល់ឃើញការប្រែប្រួលលើដំណេក ចំណង់អាហារ ថាមពល ឬការផ្ចង់អារម្មណ៍របស់ខ្ញុំដែរឬទេ?",
        "៤. តើអារម្មណ៍របស់ខ្ញុំបានប៉ះពាល់ដល់ការសិក្សា ការងារ មិត្តភាព ឬការទទួលខុសត្រូវប្រចាំថ្ងៃដែរឬទេ?",
        "៥. តើខ្ញុំធ្លាប់បាននិយាយជាមួយមនុស្សដែលខ្ញុំទុកចិត្ត អំពីអ្វីដែលខ្ញុំកំពុងជួបប្រទះដែរឬទេ?",
        "៦. តើការនិយាយជាមួយអ្នកជំនាញសុខភាពផ្លូវចិត្ត អាចជួយសម្រាលចិត្តរបស់ខ្ញុំបានដែរឬទេ?",
        "គ្មានចម្លើយណាត្រូវ ឬខុសនោះទេ ហើយអ្នកអាចរំលងសំណួរណាដែលធ្វើឱ្យអ្នកមិនស្រួលចិត្ត។ សំណួរទាំងនេះគឺសម្រាប់ការឆ្លុះបញ្ចាំងផ្ទាល់ខ្លួន មិនមែនជាការធ្វើតេស្តវេជ្ជសាស្ត្រនោះឡើយ។",
      ],
      reflection: {
        question: "Reflecting on your mood over the past two weeks, what feels most true for you right now?",
        kmQuestion: "ឆ្លុះបញ្ចាំងពីអារម្មណ៍របស់អ្នកក្នុងរយៈពេលពីរសប្តាហ៍កន្លងមកនេះ តើចំណុចមួយណាដែលពិពណ៌នាពីស្ថានភាពរបស់អ្នកបានច្បាស់បំផុត?",
        options: [
          "My feelings rise and fall with daily events, and I can still find joy in small moments",
          "I have felt consistently sad, exhausted, or empty almost every day",
          "I have lost interest in activities I used to love, and everyday tasks feel heavy",
          "I feel overwhelmed and would really benefit from speaking with a professional counselor",
        ],
        kmOptions: [
          "អារម្មណ៍របស់ខ្ញុំឡើងចុះតាមរឿងរ៉ាវប្រចាំថ្ងៃ ហើយខ្ញុំនៅតែអាចសប្បាយចិត្តនឹងរឿងតូចៗបាន",
          "ខ្ញុំមានអារម្មណ៍កើតទុក្ខ អស់កម្លាំង ឬទទេស្អាតក្នុងចិត្តស្ទើររាល់ថ្ងៃ",
          "ខ្ញុំបាត់បង់ចំណាប់អារម្មណ៍លើអ្វីដែលធ្លាប់ចូលចិត្ត ហើយកិច្ចការប្រចាំថ្ងៃមានអារម្មណ៍ថាធ្ងន់ធ្ងរ",
          "ខ្ញុំមានអារម្មណ៍ធុញថប់ខ្លាំង ហើយចង់និយាយពិគ្រោះជាមួយអ្នកជំនាញផ្លូវចិត្ត",
        ],
        feedbackMessage:
          "Thank you for honoring your truth. Whatever you are experiencing right now, your feelings are valid. You do not have to carry heavy feelings alone, and support is always within reach on AROM.",
        kmFeedbackMessage:
          "អរគុណដែលបានស្មោះត្រង់ចំពោះអារម្មណ៍ខ្លួនឯង។ មិនថាអ្នកកំពុងជួបប្រទះអ្វីទេ អារម្មណ៍របស់អ្នកសុទ្ធតែមានតម្លៃ។ អ្នកមិនចាំបាច់រែកពន់អារម្មណ៍ធ្ងន់ធ្ងរតែម្នាក់ឯងឡើយ ហើយការគាំទ្រតែងតែមានជានិច្ចនៅលើ AROM។",
      },
      keyPoints: [
        "Honest self-reflection without self-judgment is the first step toward healing.",
        "Your responses help clarify whether gentle rest or professional care is needed.",
        "Recording thoughts in your private AROM Journal provides emotional clarity.",
      ],
      kmKeyPoints: [
        "ការឆ្លុះបញ្ចាំងដោយស្មោះត្រង់ និងមិនបន្ទោសខ្លួនឯង គឺជាជំហានដំបូងនៃការព្យាបាលចិត្ត។",
        "ចម្លើយរបស់អ្នកជួយបញ្ជាក់ឱ្យច្បាស់ថាតើអ្នកត្រូវការការសម្រាក ឬជំនួយពីអ្នកជំនាញ។",
        "ការកត់ត្រាគំនិតក្នុងកំណត់ហេតុ AROM ជួយឱ្យចិត្តរបស់អ្នកកាន់តែស្រឡះល្អ។",
      ],
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "Next Steps and Support on AROM",
      kmTitle: "ជំហានបន្ទាប់ និងការគាំទ្រនៅលើ AROM (Next Steps & Support)",
      type: "coping",
      paragraphs: [
        "Sadness is a natural part of living. Depression is a health condition that responds to compassionate, evidence-based care. You do not need to feel ashamed of either experience.",
        "On AROM, dedicated wellness tools and professional resources are ready to walk beside you:",
        "• AROM Private Journal: Take a few quiet moments every evening to write down or voice record your feelings. Reflecting in a safe, encrypted space helps untangle thoughts and track your emotional progress over time.",
        "• AROM Professional Therapy: If low mood or exhaustion has persisted for two weeks or more, connect confidentially with verified counselors and clinical psychologists in Cambodia. You can choose a professional who matches your preferences and book a private consultation.",
        "• Practice Calming Exercises: Engage in science-backed breathing practices, such as the 1-Minute Calming Breath or Box Breathing, to soothe your nervous system when emotions feel intense.",
        "• Crisis Support: If you ever feel unsafe or experience thoughts of harming yourself, open your Profile and tap 'Get help now' for instant crisis contacts.",
        "Your feelings matter. You deserve to be heard, respected, and treated with unconditional care.",
      ],
      kmParagraphs: [
        "ភាពក្រៀមក្រំគឺជាផ្នែកធម្មជាតិនៃជីវិត។ ជំងឺបាក់ទឹកចិត្តគឺជាស្ថានភាពសុខភាពដែលអាចព្យាបាលបានតាមរយៈការថែទាំប្រកបដោយក្តីមេត្តា និងផ្អែកលើវិទ្យាសាស្ត្រ។ អ្នកមិនចាំបាច់មានអារម្មណ៍ខ្មាសអៀនចំពោះបទពិសោធន៍ទាំងពីរនេះឡើយ។",
        "នៅលើកម្មវិធី AROM ឧបករណ៍សុខុមាលភាព និងធនធានជំនាញជាច្រើនបានត្រៀមខ្លួនរួចជាស្រេចដើម្បីរួមដំណើរជាមួយអ្នក៖",
        "• កំណត់ហេតុឯកជន AROM (Private Journal)៖ ចំណាយពេលស្ងប់ស្ងាត់ពីរបីនាទីរៀងរាល់ល្ងាច ដើម្បីសរសេរ ឬកត់ត្រាសំឡេងអារម្មណ៍របស់អ្នក។ ការឆ្លុះបញ្ចាំងក្នុងទីកន្លែងសុវត្ថិភាពជួយឱ្យចិត្តរបស់អ្នកស្រឡះ និងតាមដានការវិវត្តអារម្មណ៍តាមពេលវេលា។",
        "• ការប្រឹក្សាជាមួយអ្នកជំនាញ AROM (Professional Therapy)៖ ប្រសិនបើអារម្មណ៍ក្រៀមក្រំ ឬការអស់កម្លាំងនៅជាប់រហូតចាប់ពីពីរសប្តាហ៍ឡើងទៅ អ្នកអាចភ្ជាប់ទំនាក់ទំនងជាសម្ងាត់ជាមួយអ្នកប្រឹក្សា និងអ្នកជំនាញចិត្តសាស្ត្រនៅកម្ពុជា។ អ្នកអាចជ្រើសរើសអ្នកជំនាញដែលត្រូវនឹងចិត្ត និងកក់ការប្រឹក្សាដោយផ្ទាល់។",
        "• អនុវត្តលំហាត់ដកដង្ហើម (Practices)៖ ចូលរួមអនុវត្តលំហាត់ដកដង្ហើមដែលផ្អែកលើវិទ្យាសាស្ត្រ ដូចជាការដកដង្ហើមស្ងប់ចិត្ត ១ នាទី ឬ Box Breathing ដើម្បីសម្រួលប្រព័ន្ធប្រសាទនៅពេលអារម្មណ៍តានតឹង។",
        "• ជំនួយសង្គ្រោះបន្ទាន់ (Crisis Support)៖ ប្រសិនបើអ្នកមានអារម្មណ៍មិនមានសុវត្ថិភាព ឬមានគំនិតចង់ធ្វើបាបខ្លួនឯង សូមបើក Profile ហើយចុច 'Get help now' ដើម្បីទទួលបានទំនាក់ទំនងបន្ទាន់ភ្លាមៗ។",
        "អារម្មណ៍របស់អ្នកពិតជាមានតម្លៃ។ អ្នកសមនឹងទទួលបានការស្តាប់ ការគោរព និងការថែទាំប្រកបដោយក្តីស្រឡាញ់។",
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
        "You do not need to wait for a crisis to care for your emotional health [1, 3].",
        "AROM Journal helps you safely process feelings and recognize changes over time.",
        "Verified counselors on AROM offer confidential, compassionate care tailored to your needs.",
      ],
      kmKeyPoints: [
        "អ្នកមិនចាំបាច់រង់ចាំដល់មានវិបត្តិធ្ងន់ធ្ងរ ទើបចាប់ផ្តើមថែទាំសុខភាពផ្លូវចិត្តនោះទេ [1, 3]។",
        "កំណត់ហេតុ AROM ជួយអ្នកកត់ត្រាអារម្មណ៍ដោយសុវត្ថិភាព និងសម្គាល់ការប្រែប្រួលតាមពេលវេលា។",
        "អ្នកជំនាញនៅលើ AROM ផ្តល់ការប្រឹក្សាប្រកបដោយការសម្ងាត់ និងការយល់ចិត្តដែលសមស្របនឹងតម្រូវការរបស់អ្នក។",
      ],
    },
  ],
};

export const REFERENCES_TALK_ABOUT_FEELINGS: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "NHS Every Mind Matters",
    title: "NHS Every Mind Matters: How to Talk About Your Mental Health",
    url: "https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-talk-about-your-mental-health/",
  },
  {
    id: 2,
    citation: "[2]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia: Mental Health",
    url: "https://www.unicef.org/cambodia/mental-health",
  },
  {
    id: 3,
    citation: "[3]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia: A Conversation on Mental Health",
    url: "https://www.unicef.org/cambodia/stories/conversation-mental-health",
  },
  {
    id: 4,
    citation: "[4]",
    source: "CDC",
    title: "CDC: How to Listen and Support Someone in Need",
    url: "https://www.cdc.gov/emotional-well-being/conversations-matter/",
  },
];

export const LESSON_TALK_ABOUT_FEELINGS: Lesson = {
  id: "talk-about-feelings",
  title: "How to Talk About Your Feelings",
  kmTitle: "របៀបនិយាយអំពីអារម្មណ៍របស់អ្នក (How to Talk About Your Feelings)",
  subtitle: "Learn to express what you feel, communicate your needs, and feel more comfortable opening up to others",
  kmSubtitle: "រៀនបញ្ចេញអារម្មណ៍ ប្រាប់ពីតម្រូវការ និងបើកចិត្តចែករំលែកជាមួយអ្នកដទៃដោយទំនុកចិត្ត",
  category: "Emotions",
  duration: "8 min",
  kmDuration: "៨ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Practice",
  kmFormat: "ការអាន និងការអនុវត្ត (Reading & Practice)",
  isAvailable: true,
  image: "/mindguide/strategies.png",
  heroImage: "/mindguide/talk-about-feelings-hero.jpg",
  description:
    "Learn to identify emotions before speaking, use constructive 'I feel' statements, overcome cultural hesitation, and express your true needs safely on AROM.",
  kmDescription:
    "រៀនសម្គាល់អារម្មណ៍មុនពេលនិយាយ ប្រើប្រាស់វិធីសាស្ត្រ «ខ្ញុំមានអារម្មណ៍ថា...» ជម្នះភាពស្ទាក់ស្ទើរក្នុងវប្បធម៌ និងប្រាប់ពីតម្រូវការរបស់អ្នកប្រកបដោយសុវត្ថិភាពនៅលើ AROM។",
  totalSections: 10,
  outcomes: [
    {
      en: "Understand why putting feelings into words relieves emotional strain and isolation [1, 2]",
      km: "យល់ដឹងពីមូលហេតុដែលការបញ្ចេញអារម្មណ៍ជាពាក្យពេចន៍ជួយសម្រាលបន្ទុកចិត្ត និងភាពឯកោ [1, 2]",
    },
    {
      en: "Learn a 3-step check-in to identify feelings and underlying needs before speaking",
      km: "រៀនវិធីសាស្ត្រពិនិត្យមើលខ្លួនឯង ៣ ជំហាន ដើម្បីស្គាល់អារម្មណ៍ និងតម្រូវការពិតប្រាកដមុនពេលនិយាយ",
    },
    {
      en: "Master constructive 'I feel' phrasing that prevents blame and defensive arguments [1, 4]",
      km: "ចេះប្រើប្រាស់ទម្រង់ «ខ្ញុំមានអារម្មណ៍ថា...» ដើម្បីជៀសវាងការបន្ទោស និងការប្រកែកគ្នា [1, 4]",
    },
    {
      en: "Clearly communicate whether you need a compassionate listener, advice, or reassurance",
      km: "ប្រាប់ឱ្យបានច្បាស់លាស់ថាតើអ្នកត្រូវការអ្នកស្តាប់ ការប្រឹក្សា ឬការលើកទឹកចិត្ត",
    },
    {
      en: "Navigate Cambodian family expectations and cultural reluctance with gentle steps [2, 3]",
      km: "រៀនបើកចិត្តសន្ទនាក្នុងបរិបទគ្រួសារ និងវប្បធម៌កម្ពុជាដោយភាពទន់ភ្លន់ និងឆ្លាតវៃ [2, 3]",
    },
    {
      en: "Practice externalizing thoughts in AROM Journal and access confidential therapy [1, 2]",
      km: "អនុវត្តការកត់ត្រាគំនិតក្នុងកំណត់ហេតុ AROM និងភ្ជាប់ការប្រឹក្សាជាមួយអ្នកជំនាញ [1, 2]",
    },
  ],
  references: REFERENCES_TALK_ABOUT_FEELINGS,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "Why Is It Important to Talk About Your Feelings?",
      kmTitle: "តើហេតុអ្វីបានជាការនិយាយពីអារម្មណ៍មានសារៈសំខាន់? (Why It Matters)",
      type: "reading",
      paragraphs: [
        "Have you ever wanted to tell someone how you feel but struggled to find the right words?",
        "Maybe you feel stressed about your studies, worried about your future, or hurt by something a friend or family member said. You might want someone to understand you, but you are afraid they will judge you, misunderstand you, or think you are weak. It often feels easier to say, 'I am fine,' even when you are carrying a heavy weight inside.",
        "Talking about your feelings is a learned skill, not an automatic talent. Opening up to someone you trust can transform your emotional health in meaningful ways [1, 2]:",
        "• Understand yourself: Putting raw emotions into spoken or written words forces your brain to organize thoughts, making the real problem clearer.",
        "• Reduce emotional isolation: Sharing vulnerability reveals that others experience similar heartaches, doubts, and pressures. [2, 3]",
        "• Build deeper relationships: Honest vulnerability invites genuine trust and helps loved ones understand how to support you.",
        "• Uncover constructive solutions: A trusted listener can offer fresh perspectives that you may not see while overwhelmed.",
        "• Receive compassionate care: Speaking up makes it possible for friends, mentors, or professionals to step in with help.",
        "Talking does not mean every problem disappears overnight. However, giving yourself permission to be heard is the indispensable first step toward healing.",
      ],
      kmParagraphs: [
        "តើអ្នកធ្លាប់ចង់ប្រាប់នរណាម្នាក់ពីអារម្មណ៍របស់អ្នក ប៉ុន្តែពិបាករកពាក្យនិយាយដែរឬទេ?",
        "ប្រហែលជាអ្នកមានអារម្មណ៍តានតឹងនឹងការរៀនសូត្រ បារម្ភពីអនាគត ឬឈឺចាប់ដោយសារសម្តីរបស់មិត្តភក្តិ ឬសមាជិកគ្រួសារ។ អ្នកចង់ឱ្យមានអ្នកយល់ចិត្ត ប៉ុន្តែអ្នកខ្លាចគេវិនិច្ឆ័យ យល់ច្រឡំ ឬគិតថាអ្នកទន់ខ្សោយ។ ជារឿយៗ វាហាក់ដូចជាងាយស្រួលជាងក្នុងការនិយាយថា «ខ្ញុំមិនអីទេ» ទោះបីជាការពិតអ្នកកំពុងរែកពន់បន្ទុកដ៏ធ្ងន់ក្នុងចិត្តក៏ដោយ។",
        "ការនិយាយអំពីអារម្មណ៍ គឺជាជំនាញដែលត្រូវរៀនសូត្រ មិនមែនជាទេពកោសល្យពីកំណើតនោះឡើយ។ ការបើកចិត្តចែករំលែកជាមួយមនុស្សដែលអ្នកទុកចិត្ត អាចផ្លាស់ប្តូរសុខភាពផ្លូវចិត្តរបស់អ្នកយ៉ាងច្រើន [1, 2]៖",
        "• យល់ដឹងពីខ្លួនឯងកាន់តែច្បាស់៖ ការបម្លែងអារម្មណ៍ទៅជាពាក្យពេចន៍ ឬការសរសេរ ជួយឱ្យខួរក្បាលរៀបចំគំនិតឱ្យមានរបៀប និងដឹងពីដើមហេតុពិតប្រាកដនៃបញ្ហា។",
        "• កាត់បន្ថយភាពឯកោក្នុងចិត្ត៖ ការចែករំលែកជួយឱ្យអ្នកដឹងថា អ្នកដទៃក៏ធ្លាប់ជួបប្រទះការឈឺចាប់ ការសង្ស័យលើខ្លួនឯង និងសម្ពាធស្រដៀងគ្នានេះដែរ។ [2, 3]",
        "• បង្កើតទំនាក់ទំនងកាន់តែស្អិតរមួត៖ ភាពស្មោះត្រង់បង្កើតនូវទំនុកចិត្តពិតប្រាកដ និងជួយឱ្យមនុស្សជាទីស្រឡាញ់ដឹងពីរបៀបជួយអ្នក។",
        "• ស្វែងរកដំណោះស្រាយល្អៗ៖ អ្នកស្តាប់ដ៏ល្អអាចផ្តល់ទស្សនៈថ្មីៗដែលអ្នកប្រហែលជាមើលមិនឃើញនៅពេលកំពុងធុញថប់។",
        "• ទទួលបានការថែទាំប្រកបដោយក្តីមេត្តា៖ ការនិយាយចេញមកក្រៅ ធ្វើឱ្យមិត្តភក្តិ គ្រូបង្រៀន ឬអ្នកជំនាញអាចជួយជ្រោមជ្រែងអ្នកបានទាន់ពេល។",
        "ការនិយាយមិនមែនធ្វើឱ្យបញ្ហាទាំងអស់រលាយបាត់មួយប៉ព្រិចភ្នែកនោះទេ។ ប៉ុន្តែការអនុញ្ញាតឱ្យសំឡេងរបស់អ្នកត្រូវបានគេស្តាប់ គឺជាជំហានដំបូងដែលមិនអាចខ្វះបាននៃការព្យាបាលចិត្ត។",
      ],
      keyPoints: [
        "Putting emotions into words organizes mental clutter and clarifies real needs [1].",
        "Sharing vulnerability breaks isolation and strengthens genuine bonds [2, 3].",
        "You do not have to share everything with everyone: selective sharing with safe people is healthy.",
      ],
      kmKeyPoints: [
        "ការបម្លែងអារម្មណ៍ទៅជាពាក្យពេចន៍ ជួយរៀបចំគំនិតឱ្យមានសណ្តាប់ធ្នាប់ និងបញ្ជាក់ពីតម្រូវការពិតប្រាកដ [1]។",
        "ការចែករំលែកដោយស្មោះត្រង់ បំបាត់ភាពឯកោ និងពង្រឹងចំណងមិត្តភាពពិតប្រាកដ [2, 3]។",
        "អ្នកមិនចាំបាច់ចែករំលែកគ្រប់រឿងជាមួយមនុស្សគ្រប់គ្នានោះទេ៖ ការជ្រើសរើសមនុស្សដែលមានសុវត្ថិភាពគឺជារឿងត្រឹមត្រូវ។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "Understand What You Are Feeling First",
      kmTitle: "ស្វែងយល់ពីអារម្មណ៍ខ្លួនឯងជាមុនសិន (Identify Your Feelings)",
      type: "reading",
      paragraphs: [
        "Before having an important conversation, take a brief moment to unpack what is happening inside your own body and mind. Sometimes we know we feel bad, but our feelings are tangled together.",
        "For example, after receiving an unexpected exam grade or workplace criticism, you might experience several conflicting layers at once:",
        "• Disappointment because you set a high personal expectation.",
        "• Worry about how this impacts your semester or future plans.",
        "• Embarrassment about what your parents or peers might say.",
        "• Frustration because your hard work did not produce the expected outcome.",
        "When you pause to name these individual threads, explaining your state to someone else becomes far simpler. Try this three-step reflection before speaking [1]:",
        "Step 1: Ask yourself, 'What am I feeling right now?' Look beyond 'bad' or 'stressed'. Are you sad, lonely, anxious, resentful, overwhelmed, or exhausted?",
        "Step 2: Ask, 'What might have triggered or contributed to this feeling?' Consider what happened right before the emotion surged. Did someone cross a boundary? Are you juggling too many deadlines?",
        "Step 3: Ask, 'What do I need right now?' Do you need someone to sit with you in silence, gentle reassurance, a break from duties, or practical advice?",
      ],
      kmParagraphs: [
        "មុនពេលចាប់ផ្តើមការសន្ទនាសំខាន់ណាមួយ សូមឆ្លៀតពេលបន្តិចដើម្បីស្វែងយល់ពីអ្វីដែលកំពុងកើតឡើងនៅក្នុងចិត្ត និងរាងកាយរបស់អ្នក។ ពេលខ្លះយើងដឹងថាយើងពិបាកចិត្ត ប៉ុន្តែអារម្មណ៍ជាច្រើនកំពុងច្របូកច្របល់ចូលគ្នា។",
        "ឧទាហរណ៍ បន្ទាប់ពីទទួលបានលទ្ធផលប្រឡងមិនល្អ ឬការរិះគន់នៅកន្លែងធ្វើការ អ្នកអាចជួបប្រទះអារម្មណ៍ជាច្រើនស្រទាប់ក្នុងពេលតែមួយ៖",
        "• ការខកចិត្ត ដោយសារអ្នកបានដាក់ការរំពឹងទុកខ្ពស់លើខ្លួនឯង។",
        "• ការព្រួយបារម្ភ អំពីផលប៉ះពាល់លើការសិក្សា ឬផែនការអនាគត។",
        "• ភាពខ្មាសអៀន អំពីអ្វីដែលឪពុកម្តាយ ឬមិត្តភក្តិអាចនិយាយមកលើអ្នក។",
        "• ភាពមួម៉ៅក្នុងចិត្ត ដោយសារការខិតខំប្រឹងប្រែងមិនបានផ្តល់លទ្ធផលដូចបំណង។",
        "នៅពេលអ្នកផ្អាកដើម្បីប្រាប់ឈ្មោះអារម្មណ៍ទាំងនេះម្តងមួយៗ ការពន្យល់ប្រាប់អ្នកដទៃនឹងកាន់តែងាយស្រួលជាងមុន។ សូមសាកល្បងការពិនិត្យមើលខ្លួនឯង ៣ ជំហាននេះមុនពេលនិយាយ [1]៖",
        "ជំហានទី ១៖ សួរខ្លួនឯងថា «តើខ្ញុំកំពុងមានអារម្មណ៍យ៉ាងណាពិតប្រាកដនៅពេលនេះ?» សម្លឹងឱ្យជ្រៅជាងពាក្យថា «មិនល្អ» ឬ «តានតឹង»។ តើអ្នកកំពុងកើតទុក្ខ ឯកោ ថប់បារម្ភ ថ្នាំងថ្នាក់ចិត្ត ធុញថប់ខ្លាំង ឬអស់កម្លាំងល្ហិតល្ហៃ?",
        "ជំហានទី ២៖ សួរថា «តើអ្វីដែលបានបង្ក ឬរួមចំណែកដល់អារម្មណ៍នេះ?» គិតអំពីអ្វីដែលបានកើតឡើងមុនពេលអារម្មណ៍នោះកើតឡើង។ តើនរណាម្នាក់បានរំលោភព្រំដែនរបស់អ្នក ឬតើអ្នកកំពុងរែកពន់កិច្ចការច្រើនពេក?",
        "ជំហានទី ៣៖ សួរថា «តើខ្ញុំត្រូវការអ្វីនៅពេលនេះ?» តើអ្នកត្រូវការនរណាម្នាក់នៅក្បែរដោយស្ងៀមស្ងាត់ ការលួងលោម ការសម្រាកពីការងារ ឬការប្រឹក្សាជាក់ស្តែង?",
      ],
      keyPoints: [
        "Pause and unravel mixed emotions before starting a conversation [1].",
        "Moving beyond 'I feel bad' helps you pinpoint the real roots of distress.",
        "Identifying your true need makes asking for support straightforward and clear.",
      ],
      kmKeyPoints: [
        "ផ្អាកបន្តិចដើម្បីស្វែងយល់ពីអារម្មណ៍ដែលច្របូកច្របល់ មុនពេលចាប់ផ្តើមនិយាយ [1]។",
        "ការពិនិត្យឱ្យជ្រៅជាងពាក្យ «ពិបាកចិត្ត» ជួយអ្នករកឃើញឫសគល់ពិតនៃបញ្ហា។",
        "ការស្គាល់តម្រូវការពិតប្រាកដ ជួយឱ្យការស្នើសុំជំនួយមានភាពច្បាស់លាស់ និងចំគោលដៅ។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Choose Someone You Feel Safe Talking To",
      kmTitle: "ការជ្រើសរើសមនុស្សដែលមានសុវត្ថិភាព (Choosing a Safe Person)",
      type: "reading",
      paragraphs: [
        "You do not owe your intimate thoughts or vulnerability to everyone. Sharing personal struggles requires emotional safety. Choose someone who has proven they can listen with patience and respect. [1, 4]",
        "A safe person may be:",
        "• A grounded close friend who does not gossip or share secrets.",
        "• A caring family member or sibling who listens without scolding.",
        "• A respected teacher, mentor, or community leader.",
        "• A licensed psychologist, counselor, or mental health professional.",
        "Before confiding, observe how this person interacts in everyday moments: Do they listen without interrupting? Do they honor confidences? When others make mistakes, do they offer compassion or humiliate them?",
        "What if you are terrified of judgment? Start small. You do not need to share your entire history in five minutes. Share one mild thought first: 'I have had a lot of study stress lately, and I wanted to chat with someone.' See how they respond. If they offer warmth, you can share more over time.",
        "Remember: If someone reacts dismissively or unsympathetically, their reaction reflects their own emotional limitations, not the validity of your feelings.",
      ],
      kmParagraphs: [
        "អ្នកមិនចាំបាច់ចែករំលែករឿងរ៉ាវផ្ទាល់ខ្លួន ឬភាពទន់ខ្សោយរបស់អ្នកជាមួយមនុស្សគ្រប់គ្នានោះទេ។ ការចែករំលែករឿងក្នុងចិត្តទាមទារនូវសុវត្ថិភាពផ្លូវចិត្ត។ ចូរជ្រើសរើសមនុស្សណាដែលធ្លាប់បង្ហាញថាពួកគេអាចស្តាប់អ្នកដោយការអត់ធ្មត់ និងការគោរព។ [1, 4]",
        "មនុស្សដែលមានសុវត្ថិភាពអាចជា៖",
        "• មិត្តភក្តិជិតស្និទ្ធដែលចេះរក្សាការសម្ងាត់ និងមិននិយាយដើមអ្នកដទៃ។",
        "• សមាជិកគ្រួសារ ឬបងប្អូនដែលចេះស្តាប់ដោយមិនស្តីបន្ទោសភ្លាមៗ។",
        "• គ្រូបង្រៀន រៀមច្បង ឬអ្នកណែនាំដែលអ្នកគោរពទុកចិត្ត។",
        "• អ្នកជំនាញចិត្តសាស្ត្រ អ្នកប្រឹក្សា ឬវេជ្ជបណ្ឌិតសុខភាពផ្លូវចិត្ត។",
        "មុននឹងបើកចិត្ត សូមសង្កេតមើលរបៀបដែលបុគ្គលនោះប្រាស្រ័យទាក់ទងក្នុងជីវិតប្រចាំថ្ងៃ៖ តើពួកគេស្តាប់ដោយមិនកាត់សម្តីដែរឬទេ? តើពួកគេរក្សាការសម្ងាត់បានល្អទេ? នៅពេលអ្នកដទៃធ្វើខុស តើពួកគេបង្ហាញក្តីមេត្តា ឬចំអកឱ្យគេ?",
        "ចុះបើអ្នកខ្លាចការវិនិច្ឆ័យ? ចាប់ផ្តើមពីជំហានតូចៗ។ អ្នកមិនចាំបាច់រៀបរាប់ប្រវត្តិជីវិតទាំងអស់ត្រឹម ៥ នាទីនោះទេ។ សាកល្បងចែករំលែករឿងស្រាលៗមួយសិន៖ «ថ្មីៗនេះខ្ញុំមានរឿងតានតឹងនឹងការរៀនបន្តិច ហើយចង់ជជែកជាមួយអ្នក»។ មើលប្រតិកម្មរបស់ពួកគេ។ ប្រសិនបើពួកគេឆ្លើយតបដោយភាពកក់ក្តៅ អ្នកអាចចែករំលែកបន្ថែមទៀតនៅពេលក្រោយ។",
        "ចូរចងចាំថា៖ ប្រសិនបើនរណាម្នាក់ឆ្លើយតបមកវិញដោយការមើលស្រាល ឬមិនខ្វល់ខ្វាយ ប្រតិកម្មនោះឆ្លុះបញ្ចាំងពីកម្រិតសមត្ថភាពផ្លូវចិត្តរបស់ពួកគេប៉ុណ្ណោះ មិនមែនមានន័យថាអារម្មណ៍របស់អ្នកគ្មានតម្លៃនោះឡើយ។",
      ],
      keyPoints: [
        "Evaluate emotional safety: pick people who protect secrets and listen patiently [1, 4].",
        "Test the waters by sharing small concerns before disclosing deeper vulnerabilities.",
        "An unhelpful reaction reflects the other person's limits, not your worth.",
      ],
      kmKeyPoints: [
        "វាយតម្លៃសុវត្ថិភាពផ្លូវចិត្ត៖ ជ្រើសរើសមនុស្សដែលចេះរក្សាការសម្ងាត់ និងស្តាប់ដោយអត់ធ្មត់ [1, 4]។",
        "សាកល្បងចែករំលែករឿងតូចតាចជាមុនសិន មុននឹងបើកចំហរឿងរ៉ាវស៊ីជម្រៅក្នុងចិត្ត។",
        "ប្រតិកម្មដែលគ្មានការយល់ចិត្ត ឆ្លុះបញ្ចាំងពីកម្រិតរបស់គេប៉ុណ្ណោះ មិនមែនតម្លៃរបស់អ្នកឡើយ។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "How to Start the Conversation and the 'I Feel' Method",
      kmTitle: "ការចាប់ផ្តើមសន្ទនា និងវិធីសាស្ត្រ «ខ្ញុំមានអារម្មណ៍ថា...» (Starting & 'I Feel')",
      type: "quiz",
      paragraphs: [
        "Finding the very first sentence is often the most intimidating hurdle. Keeping your opening statement brief and honest prevents anxiety from freezing you up [1]:",
        "• If feeling stressed: 'I have been carrying a lot of pressure lately, and I would love to talk it through with you for a few minutes.'",
        "• If feeling sad: 'I have not felt quite like myself recently. I am not completely sure why, but sharing it out loud might help.'",
        "• If feeling hurt by someone: 'I felt hurt by what happened earlier. Our relationship matters deeply to me, which is why I want to talk about it.'",
        "• If needing help without answers: 'I am going through a difficult stretch, and I am not sure of the solution yet. Could you just listen to me for a bit?'",
        "When expressing difficult feelings, avoid accusatory 'You' statements like 'You never listen to me' or 'You made me miserable.' Accusations immediately trigger defensive armor.",
        "Instead, use the constructive 'I feel' formula [4]:",
        "'I feel [emotion] when [specific situation] because [impact]. I would really appreciate [what would help].'",
        "For example: 'I feel overwhelmed when plans change at the last minute because I set aside study time to meet. I would appreciate it if you could give me a quick heads up earlier next time.'",
      ],
      kmParagraphs: [
        "ការស្វែងរកប្រយោគដំបូងបង្អស់ ច្រើនតែជាឧបសគ្គដ៏ពិបាកបំផុត។ ការរក្សាប្រយោគបើកឆាកឱ្យខ្លី និងស្មោះត្រង់ ជួយកាត់បន្ថយការភ័យខ្លាច [1]៖",
        "• បើមានអារម្មណ៍តានតឹង៖ «មួយរយៈនេះខ្ញុំមានសម្ពាធច្រើនក្នុងខ្លួន ហើយចង់ចំណាយពេលពីរបីនាទីជជែកជាមួយអ្នក»។",
        "• បើមានអារម្មណ៍ក្រៀមក្រំ៖ «ថ្មីៗនេះខ្ញុំមានអារម្មណ៍មិនសូវស្រួលក្នុងចិត្តសោះ។ ខ្ញុំមិនទាន់ដឹងច្បាស់ពីមូលហេតុទេ ប៉ុន្តែការនិយាយចេញមកក្រៅប្រហែលជាអាចជួយបាន»។",
        "• បើមានអារម្មណ៍ឈឺចាប់ដោយសារអ្នកដទៃ៖ «ខ្ញុំមានអារម្មណ៍អន់ចិត្តចំពោះរឿងដែលបានកើតឡើងមុននេះ។ ទំនាក់ទំនងរបស់យើងពិតជាសំខាន់ចំពោះខ្ញុំ ហេតុនេះហើយបានជាខ្ញុំចង់ជជែកគ្នា»។",
        "• បើត្រូវការជំនួយតែមិនទាន់ដឹងដំណោះស្រាយ៖ «ខ្ញុំកំពុងឆ្លងកាត់គ្រាលំបាកមួយ ហើយមិនទាន់ដឹងថាត្រូវធ្វើយ៉ាងណាទេ។ តើអ្នកអាចជួយស្តាប់ខ្ញុំបន្តិចបានទេ?»",
        "នៅពេលបញ្ចេញអារម្មណ៍ពិបាកៗ សូមជៀសវាងការប្រើពាក្យចោទប្រកាន់ដូចជា «អ្នកមិនដែលខ្វល់ពីខ្ញុំទេ» ឬ «អ្នកធ្វើឱ្យខ្ញុំវេទនា»។ ការចោទប្រកាន់នឹងធ្វើឱ្យភាគីម្ខាងទៀតប្រញាប់ការពារខ្លួនភ្លាមៗ។",
        "ផ្ទុយទៅវិញ សូមប្រើប្រាស់រូបមន្ត «ខ្ញុំមានអារម្មណ៍ថា...» [4]៖",
        "«ខ្ញុំមានអារម្មណ៍ [អារម្មណ៍] នៅពេល [ស្ថានភាពជាក់លាក់] ពីព្រោះ [ផលប៉ះពាល់]។ ខ្ញុំពិតជាអរគុណប្រសិនបើ [អ្វីដែលអាចជួយបាន]»។",
        "ឧទាហរណ៍៖ «ខ្ញុំមានអារម្មណ៍ធុញថប់នៅពេលគម្រោងជួបគ្នាត្រូវបានលុបចោលភ្លាមៗ ពីព្រោះខ្ញុំបានឆ្លៀតពេលរៀនដើម្បីមកជួប។ ខ្ញុំពិតជាអរគុណប្រសិនបើអ្នកអាចប្រាប់ខ្ញុំឱ្យបានលឿនជាងនេះនៅពេលក្រោយ»។",
      ],
      quiz: {
        question: "Which of the following phrases represents the most constructive way to express your feelings without provoking defensive conflict?",
        kmQuestion: "តើឃ្លាមួយណាខាងក្រោមជាវិធីសាស្ត្រស្ថាបនាបំផុតក្នុងការបញ្ចេញអារម្មណ៍ ដោយមិនបង្កឱ្យមានជម្លោះការពារខ្លួន?",
        options: [
          {
            id: "opt-1",
            text: "'You never support me and you always ruin my week whenever exams arrive.'",
            kmText: "«អ្នកមិនដែលគាំទ្រខ្ញុំទេ ហើយតែងតែធ្វើឱ្យខ្ញុំខូចចិត្តរាល់ពេលប្រឡងមកដល់»",
            isCorrect: false,
          },
          {
            id: "opt-2",
            text: "'I feel overwhelmed when study plans change suddenly because I need structure. Could we agree on our schedule a day ahead?'",
            kmText: "«ខ្ញុំមានអារម្មណ៍ធុញថប់នៅពេលកាលវិភាគរៀនប្រែប្រួលភ្លាមៗ ពីព្រោះខ្ញុំត្រូវការរៀបចំទុកជាមុន។ តើយើងអាចព្រមព្រៀងកាលវិភាគមុនមួយថ្ងៃបានទេ?»",
            isCorrect: true,
          },
          {
            id: "opt-3",
            text: "'Nothing matters anyway, so there is no point in telling you how bad you make me feel.'",
            kmText: "«គ្មានអ្វីសំខាន់ទៀតទេ ដូច្នេះគ្មានប្រយោជន៍នឹងប្រាប់អ្នកថាអ្នកធ្វើឱ្យខ្ញុំពិបាកចិត្តប៉ុណ្ណានោះឡើយ»",
            isCorrect: false,
          },
          {
            id: "opt-4",
            text: "'I am fine, everything is perfect, please just stop talking to me.'",
            kmText: "«ខ្ញុំមិនអីទេ អ្វីៗល្អទាំងអស់ សូមកុំនិយាយជាមួយខ្ញុំអី»",
            isCorrect: false,
          },
        ],
        explanation:
          "Correct. Using 'I feel' statements describes your personal experience and states a clear, collaborative need without attacking the other person's character [1, 4].",
        kmExplanation:
          "ត្រឹមត្រូវណាស់។ ការប្រើទម្រង់ «ខ្ញុំមានអារម្មណ៍ថា...» ពិពណ៌នាពីបទពិសោធន៍ផ្ទាល់ខ្លួន និងប្រាប់ពីតម្រូវការច្បាស់លាស់ ដោយមិនវាយប្រហារលើបុគ្គលិកលក្ខណៈរបស់អ្នកដទៃឡើយ [1, 4]។",
      },
      keyPoints: [
        "A single simple sentence is enough to initiate a meaningful conversation [1].",
        "Replace accusatory 'You' attacks with clear, personal 'I feel' statements [4].",
        "Pair the emotion with the specific trigger and a realistic, constructive request.",
      ],
      kmKeyPoints: [
        "ប្រយោគសាមញ្ញតែមួយឃ្លា គឺគ្រប់គ្រាន់ដើម្បីចាប់ផ្តើមការសន្ទនាដ៏មានអត្ថន័យ [1]។",
        "ជំនួសពាក្យចោទប្រកាន់ «អ្នក...» ដោយការប្រើទម្រង់ស្មោះត្រង់ «ខ្ញុំមានអារម្មណ៍ថា...» [4]។",
        "ផ្សារភ្ជាប់អារម្មណ៍ជាមួយមូលហេតុជាក់លាក់ និងសំណូមពរស្ថាបនាដែលសមហេតុផល។",
      ],
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "Tell People What Kind of Support You Need",
      kmTitle: "ការប្រាប់ពីប្រភេទជំនួយដែលអ្នកត្រូវការ (Clarify Your Support Needs)",
      type: "reading",
      paragraphs: [
        "One of the most frequent sources of frustration during emotional conversations is mismatched expectations.",
        "When you share sadness or stress, caring friends often jump directly into problem-solving mode: 'You should do this,' or 'Why don't you fix that?' While well-intentioned, unsolicited advice can make you feel dismissed or rushed when all you wanted was an empathetic ear. [1, 4]",
        "Prevent this friction by telling the listener what you need right at the start:",
        "• If you just need a listener: 'I don't need advice right now. I just need a safe space to vent and be heard while I process this.'",
        "• If you genuinely want advice: 'I am struggling to find a way forward with this problem. Could you help me brainstorm practical options?'",
        "• If you need reassurance: 'I am having doubts about my abilities right now. It would really help to hear an encouraging perspective from you.'",
        "• If you need practical teamwork: 'I am completely swamped with chores and assignments. Could you help me tackle this one specific task?'",
        "Clarifying your desired support takes the guesswork away from your friend and protects you from unwanted lectures.",
      ],
      kmParagraphs: [
        "ប្រភពនៃការខកចិត្តញឹកញាប់បំផុតក្នុងពេលសន្ទនាអំពីអារម្មណ៍ គឺការរំពឹងទុកមិនត្រូវគ្នា។",
        "នៅពេលអ្នកចែករំលែកពីទុក្ខព្រួយ ឬភាពតានតឹង មិត្តភក្តិដែលបារម្ភពីអ្នកច្រើនតែប្រញាប់ប្រញាល់លោតទៅរកការដោះស្រាយបញ្ហាភ្លាមៗ៖ «អ្នកគួរតែធ្វើបែបនេះ» ឬ «ហេតុអ្វីមិនធ្វើបែបនោះ?»។ ទោះបីជាពួកគេមានបំណងល្អក៏ដោយ ការផ្តល់ដំបូន្មានដែលមិនបានស្នើសុំអាចធ្វើឱ្យអ្នកមានអារម្មណ៍ថាគេមិនយល់ចិត្ត ឬប្រញាប់ពេក ខណៈពេលដែលការពិតអ្នកគ្រាន់តែចង់បានអ្នកស្តាប់ប៉ុណ្ណោះ។ [1, 4]",
        "ការពារការយល់ច្រឡំនេះ ដោយប្រាប់អ្នកស្តាប់ពីអ្វីដែលអ្នកត្រូវការតាំងពីដំបូង៖",
        "• បើអ្នកគ្រាន់តែត្រូវការអ្នកស្តាប់៖ «ខ្ញុំមិនទាន់ត្រូវការដំបូន្មាននៅពេលនេះទេ។ ខ្ញុំគ្រាន់តែចង់បានទីកន្លែងសុវត្ថិភាពដើម្បីបញ្ចេញអារម្មណ៍ និងឱ្យមានអ្នកស្តាប់ប៉ុណ្ណោះ»។",
        "• បើអ្នកចង់បានការប្រឹក្សាពិតប្រាកដ៖ «ខ្ញុំកំពុងពិបាកស្វែងរកផ្លូវចេញសម្រាប់បញ្ហានេះ។ តើអ្នកអាចជួយខ្ញុំគិតរកជម្រើសជាក់ស្តែងបានទេ?»",
        "• បើអ្នកត្រូវការការលើកទឹកចិត្ត៖ «ខ្ញុំកំពុងសង្ស័យលើសមត្ថភាពខ្លួនឯងនៅពេលនេះ។ ការទទួលបានការលើកទឹកចិត្តពីអ្នក ពិតជាជួយខ្ញុំបានច្រើន»។",
        "• បើអ្នកត្រូវការជំនួយជាក់ស្តែង៖ «ខ្ញុំកំពុងរវល់ខ្លាំងនឹងការងារផ្ទះ និងកិច្ចការសាលា។ តើអ្នកអាចជួយសម្រាលការងារមួយនេះបានទេ?»",
        "ការបញ្ជាក់ពីតម្រូវការឱ្យបានច្បាស់លាស់ ជួយឱ្យអ្នកស្តាប់ដឹងពីរបៀបជួយអ្នកបានត្រឹមត្រូវ និងការពារអ្នកពីការស្តាប់ដំបូន្មានដែលមិនចង់បាន។",
      ],
      keyPoints: [
        "Well-meaning friends often rush to solve problems instead of listening [1, 4].",
        "State your goal upfront: listening ear, practical brainstorming, or reassurance.",
        "Guiding your listener prevents misunderstandings and gives you the exact care you need.",
      ],
      kmKeyPoints: [
        "មិត្តភក្តិដែលមានបំណងល្អ ច្រើនតែប្រញាប់ដោះស្រាយបញ្ហាជាជាងការអង្គុយស្តាប់ [1, 4]។",
        "ប្រាប់គោលបំណងរបស់អ្នកជាមុន៖ ចង់បានអ្នកស្តាប់ ការគិតរកដំណោះស្រាយ ឬការលើកទឹកចិត្ត។",
        "ការណែនាំអ្នកស្តាប់ជាមុន ការពារការយល់ច្រឡំ និងផ្តល់ឱ្យអ្នកនូវការគាំទ្រចំតម្រូវការ។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "What If You Start Crying or Cannot Find the Words?",
      kmTitle: "នៅពេលស្រក់ទឹកភ្នែក ឬពិបាករកពាក្យនិយាយ (When Tears Flow)",
      type: "reading",
      paragraphs: [
        "Opening up can summon intense, physical somatic responses. You might experience a lump in your throat, your voice might tremble, tears may flow, or your mind might go blank.",
        "First, know this: Crying is not a sign of weakness. Crying is your nervous system's biological mechanism for discharging accumulated stress hormones and soothing physical tension. Never apologize for crying during an honest conversation.",
        "If waves of emotion overwhelm you while speaking:",
        "• Pause and take three slow, grounding breaths: breathe in through your nose and release a long exhale through your mouth.",
        "• Take a sip of cool water to ease the tightness in your throat.",
        "• Acknowledge the pause openly: 'Give me just a second to breathe, this is hard for me to talk about.' A safe person will gladly wait with you.",
        "• Use written communication: If speaking face-to-face feels too intimidating, write a note or send a text message first. You can write: 'I want to talk to you about something important, but I find it hard to speak aloud right now. Could you read this note first?'",
        "Communicating through text, voice notes, or letters is just as courageous and authentic as spoken conversation.",
      ],
      kmParagraphs: [
        "ការបើកចិត្តចែករំលែក អាចដាស់ឱ្យមានប្រតិកម្មរាងកាយយ៉ាងខ្លាំង។ អ្នកអាចមានអារម្មណ៍ស្លាក់ក្នុងបំពង់ក សំឡេងញ័រ ស្រក់ទឹកភ្នែក ឬខួរក្បាលគិតអ្វីមិនចេញ។",
        "ដំបូង សូមដឹងរឿងនេះ៖ ការយំមិនមែនជាសញ្ញានៃភាពទន់ខ្សោយនោះឡើយ។ ការយំគឺជាយន្តការជីវសាស្ត្រនៃប្រព័ន្ធប្រសាទ ដើម្បីបញ្ចេញអ័រម៉ូនតានតឹងដែលកកកុញ និងសម្រាលភាពតានតឹងក្នុងរាងកាយ។ កុំសុំទោសចំពោះការស្រក់ទឹកភ្នែកក្នុងពេលសន្ទនាដោយស្មោះត្រង់។",
        "ប្រសិនបើអារម្មណ៍ខ្លាំងក្លាធ្វើឱ្យអ្នកពិបាកបន្តការនិយាយ៖",
        "• ផ្អាកបន្តិច ហើយដកដង្ហើមវែងៗ ៣ ដង៖ ដកដង្ហើមចូលតាមច្រមុះយឺតៗ ហើយបញ្ចេញខ្យល់តាមមាត់ឱ្យវែង។",
        "• ផឹកទឹកត្រជាក់មួយក្អឹក ដើម្បីសម្រួលភាពតឹងណែនក្នុងបំពង់ក។",
        "• ប្រាប់ពីការផ្អាកដោយបើកចំហ៖ «សុំពេលខ្ញុំដកដង្ហើមមួយភ្លែត រឿងនេះពិតជាពិបាកនិយាយបន្តិចហើយ»។ មនុស្សដែលមានសុវត្ថិភាពនឹងរីករាយរង់ចាំអ្នកជានិច្ច។",
        "• ប្រើប្រាស់ការសរសេរ៖ ប្រសិនបើការនិយាយទល់មុខមានអារម្មណ៍ថាពិបាកពេក សូមសរសេរក្រដាស ឬផ្ញើសារជាមុន។ អ្នកអាចសរសេរថា៖ «ខ្ញុំចង់ជជែកជាមួយអ្នកពីរឿងសំខាន់មួយ ប៉ុន្តែខ្ញុំពិបាកនិយាយផ្ទាល់មាត់នៅពេលនេះ។ តើអ្នកអាចអានសារនេះមុនបានទេ?»",
        "ការប្រាស្រ័យទាក់ទងតាមរយៈសារអក្សរ សារជាសំឡេង ឬសំបុត្រ សុទ្ធតែជាទង្វើដ៏ក្លាហាន និងមានតម្លៃដូចគ្នានឹងការសន្ទនាផ្ទាល់មាត់ដែរ។",
      ],
      alertBox: {
        type: "tip",
        text: "AROM Voice Journal: If speaking out loud to another person feels terrifying, try recording your thoughts in the private AROM Voice Journal first. Listening back to your own voice helps demystify heavy feelings.",
        kmText:
          "កំណត់ហេតុសំឡេង AROM៖ ប្រសិនបើការនិយាយផ្ទាល់ទៅកាន់អ្នកដទៃធ្វើឱ្យអ្នកភ័យខ្លាច សូមសាកល្បងកត់ត្រាសំឡេងគំនិតរបស់អ្នកនៅក្នុងកំណត់ហេតុឯកជនលើ AROM ជាមុនសិន។ ការស្តាប់សំឡេងខ្លួនឯងឡើងវិញ ជួយឱ្យចិត្តរបស់អ្នកធូរស្រាល និងកាន់តែច្បាស់លាស់។",
      },
      keyPoints: [
        "Crying discharges stress hormones: it is a natural biological reset, not weakness.",
        "Take grounding breaths, sip water, and grant yourself permission to pause.",
        "Writing a note or sending a text message is a completely valid way to open up.",
      ],
      kmKeyPoints: [
        "ការយំជួយបញ្ចេញអ័រម៉ូនតានតឹង៖ វាជាការសម្រួលប្រព័ន្ធប្រសាទតាមធម្មជាតិ មិនមែនជាភាពទន់ខ្សោយទេ។",
        "ដកដង្ហើមវែងៗ ញ៉ាំទឹកមួយក្អឹក និងផ្តល់ការអនុញ្ញាតឱ្យខ្លួនឯងផ្អាកបន្តិច។",
        "ការសរសេរសំបុត្រ ឬការផ្ញើសារ គឺជាវិធីសាស្ត្រដ៏ត្រឹមត្រូវក្នុងការចាប់ផ្តើមបើកចិត្ត។",
      ],
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "Navigating Family and Cultural Expectations",
      kmTitle: "ការសន្ទនាក្នុងបរិបទគ្រួសារ និងវប្បធម៌កម្ពុជា (Cultural Context)",
      type: "reading",
      paragraphs: [
        "In Cambodian culture, open conversations about emotional vulnerability, anxiety, and depression can carry unique cultural complexities [2, 3].",
        "Young people often report feeling pressure to remain strong, show unwavering gratitude, and carry family expectations without complaining. You might worry that discussing distress will make parents feel burdened, disappointed, or believe you lack spiritual or mental resilience. [2, 3]",
        "Navigating these cultural realities requires patience and culturally sensitive approaches:",
        "• Pick ordinary shared moments: A quiet chat while taking a walk, preparing food, riding together, or washing dishes feels far less threatening than scheduling a formal, tense sit-down meeting.",
        "• Focus on tangible daily challenges: Rather than opening with broad clinical terminology like 'mental illness', describe specific everyday friction: 'I am finding it hard to sleep because my exam pressure feels heavy, and I wanted to ask for your advice.'",
        "• Reassure filial respect and gratitude: Frame your conversation around wanting to stay healthy for the future: 'I appreciate everything you do for me, which is why I want to share this so I can study well and stay healthy.'",
        "• Allow time for adjustment: Family members from older generations may not have vocabulary for modern emotional struggles. Give them space to process what you share.",
        "However, your health comes first. If family members are emotionally abusive or completely unwilling to understand, you are entitled to seek support from outside allies, mentors, and licensed counselors.",
      ],
      kmParagraphs: [
        "នៅក្នុងវប្បធម៌កម្ពុជា ការសន្ទនាដោយបើកចំហអំពីភាពទន់ខ្សោយផ្លូវចិត្ត ការថប់បារម្ភ និងជំងឺបាក់ទឹកចិត្ត អាចមានលក្ខណៈស្មុគស្មាញពិសេសមួយចំនួន [2, 3]។",
        "យុវជនជាច្រើនតែងតែមានអារម្មណ៍ថាត្រូវតែរឹងមាំ បង្ហាញការដឹងគុណជានិច្ច និងរែកពន់ការរំពឹងទុករបស់គ្រួសារដោយមិនត្អូញត្អែរ។ អ្នកអាចបារម្ភថា ការនិយាយពីការលំបាកក្នុងចិត្ត នឹងធ្វើឱ្យឪពុកម្តាយមានអារម្មណ៍ធ្ងន់ធ្ងរ ខកចិត្ត ឬគិតថាអ្នកខ្វះការតស៊ូក្នុងជីវិត។ [2, 3]",
        "ការដោះស្រាយរឿងរ៉ាវទាំងនេះ ទាមទារការអត់ធ្មត់ និងវិធីសាស្ត្រដែលសមស្របនឹងបរិបទវប្បធម៌៖",
        "• ជ្រើសរើសពេលធ្វើសកម្មភាពធម្មតាជាមួយគ្នា៖ ការជជែកគ្នាក្នុងពេលដើរហាត់ប្រាណ ពេលធ្វើម្ហូប ពេលជិះម៉ូតូ ឬពេលលាងចាន មានអារម្មណ៍ធូរស្រាលជាងការអង្គុយជជែកគ្នាបែបផ្លូវការ និងតានតឹង។",
        "• ផ្តោតលើបញ្ហាជាក់ស្តែងប្រចាំថ្ងៃ៖ ជំនួសឱ្យការប្រើពាក្យបច្ចេកទេសធំៗដូចជា «ជំងឺផ្លូវចិត្ត» សូមពណ៌នាពីការលំបាកជាក់ស្តែង៖ «ថ្មីៗនេះខ្ញុំពិបាកគេងលក់ ដោយសារសម្ពាធប្រឡងខ្លាំងពេក ហើយខ្ញុំចង់សុំយោបល់ពីពុកម៉ែ»។",
        "• បញ្ជាក់ពីការគោរព និងការដឹងគុណ៖ បង្ហាញថាអ្នកចង់ឱ្យសុខភាពល្អដើម្បីអនាគត៖ «ខ្ញុំដឹងគុណចំពោះអ្វីៗដែលពុកម៉ែបានលះបង់ ហេតុនេះហើយបានជាខ្ញុំចង់ចែករំលែករឿងនេះ ដើម្បីឱ្យខ្ញុំមានកម្លាំងចិត្តរៀនសូត្របានល្អ»។",
        "• ទុកពេលឱ្យពួកគាត់យល់៖ មនុស្សចាស់ជំនាន់មុនប្រហែលជាមិនសូវមានពាក្យពេចន៍សម្រាប់ពណ៌នាពីបញ្ហាផ្លូវចិត្តសម័យទំនើបនោះទេ។ ទុកពេលឱ្យពួកគាត់រំលាយព័ត៌មានដែលអ្នកបានចែករំលែក។",
        "ទោះជាយ៉ាងណា សុខភាពរបស់អ្នកគឺជាអាទិភាពចម្បង។ ប្រសិនបើសមាជិកគ្រួសារមានអាកប្បកិរិយាបៀតបៀនផ្លូវចិត្ត ឬមិនព្រមយល់ទាល់តែសោះ អ្នកមានសិទ្ធិពេញលេញក្នុងការស្វែងរកជំនួយពីអ្នកដទៃ រៀមច្បង ឬអ្នកជំនាញប្រឹក្សាផ្លូវចិត្ត។",
      ],
      keyPoints: [
        "In Cambodia, framing distress through tangible challenges eases cultural tension [2, 3].",
        "Choose casual moments like cooking or walking rather than heavy formal meetings.",
        "Acknowledge family care while clearly articulating your need for emotional breathing room.",
      ],
      kmKeyPoints: [
        "នៅកម្ពុជា ការលើកឡើងពីបញ្ហាជាក់ស្តែងក្នុងជីវិត ជួយកាត់បន្ថយភាពតានតឹងក្នុងវប្បធម៌ [2, 3]។",
        "ជ្រើសរើសពេលស្រួលៗដូចជាពេលធ្វើម្ហូប ឬដើរកម្សាន្ត ជាជាងការជួបជជែកបែបផ្លូវការតឹងតែង។",
        "បង្ហាញការដឹងគុណគ្រួសារ ខណៈពេលដែលប្រាប់ពីតម្រូវការសម្រាកផ្លូវចិត្តឱ្យបានច្បាស់។",
      ],
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "What If the Other Person Does Not Understand?",
      kmTitle: "នៅពេលដែលអ្នកដទៃមិនយល់ពីយើង (When They Don't Understand)",
      type: "reading",
      paragraphs: [
        "Opening your heart involves vulnerability, and it can sting deeply when the other person responds in an unhelpful or dismissive manner.",
        "They might change the topic awkwardly, minimize your experience ('Everyone is tired, just push through'), or give unhelpful advice. When this happens, remember:",
        "• Not everyone possesses the emotional maturity or current mental bandwidth to hold space for deep feelings.",
        "• You can gently clarify once: 'I know you want to help, but hearing that my problem is small makes me feel even more alone. I just wanted you to hear me.'",
        "• If they remain defensive or cold, pause the conversation without self-blame. You do not have to exhaust yourself trying to convince someone to care about your feelings.",
        "• Turn to alternative support: A different friend, a community support circle on AROM, or a licensed professional therapist.",
        "Your pain does not become invalid simply because someone else was incapable of understanding it.",
      ],
      kmParagraphs: [
        "ការបើកចិត្តចែករំលែកទាមទារនូវភាពក្លាហាន ហើយវាអាចធ្វើឱ្យអ្នកឈឺចាប់ខ្លាំង ប្រសិនបើអ្នកដទៃឆ្លើយតបមកវិញដោយការមើលស្រាល ឬគ្មានការយល់ចិត្ត។",
        "ពួកគេអាចប្តូរប្រធានបទយ៉ាងលឿន កាត់បន្ថយទំហំនៃបញ្ហារបស់អ្នក («នរណាក៏ហត់ដែរ ទ្រាំៗទៅ») ឬផ្តល់ដំបូន្មានដែលគ្មានប្រយោជន៍។ នៅពេលរឿងនេះកើតឡើង សូមចងចាំថា៖",
        "• មិនមែនមនុស្សគ្រប់គ្នាសុទ្ធតែមានភាពចាស់ទុំខាងផ្លូវចិត្ត ឬមានថាមពលគ្រប់គ្រាន់ដើម្បីទទួលស្តាប់អារម្មណ៍របស់អ្នកនោះទេ។",
        "• អ្នកអាចពន្យល់ដោយទន់ភ្លន់ម្តងទៀត៖ «ខ្ញុំដឹងថាអ្នកចង់ជួយ ប៉ុន្តែការនិយាយថាបញ្ហានេះតូចតាច ធ្វើឱ្យខ្ញុំកាន់តែមានអារម្មណ៍ឯកោ។ ខ្ញុំគ្រាន់តែចង់ឱ្យអ្នកស្តាប់ខ្ញុំប៉ុណ្ណោះ»។",
        "• ប្រសិនបើពួកគេនៅតែព្រងើយកន្តើយ សូមផ្អាកការសន្ទនាដោយកុំបន្ទោសខ្លួនឯង។ អ្នកមិនចាំបាច់ធ្វើឱ្យខ្លួនឯងហត់នឿយក្នុងការបង្ខំឱ្យនរណាម្នាក់មកខ្វល់ខ្វាយពីអារម្មណ៍របស់អ្នកនោះឡើយ។",
        "• ងាកទៅរកប្រភពគាំទ្រផ្សេងទៀត៖ មិត្តភក្តិផ្សេងទៀត ក្រុមសហគមន៍លើ AROM ឬអ្នកប្រឹក្សាផ្លូវចិត្តដែលមានវិជ្ជាជីវៈ។",
        "ការឈឺចាប់របស់អ្នកមិនមែនគ្មានតម្លៃនោះទេ ដោយគ្រាន់តែមនុស្សម្នាក់នោះមិនមានសមត្ថភាពយល់ពីវានោះឡើយ។",
      ],
      keyPoints: [
        "A dismissive response shows the other person's limits, not a defect in your feelings [4].",
        "You do not need everyone's approval to validate your emotional experience.",
        "Know when to pause an unhelpful conversation and reach out to alternative allies.",
      ],
      kmKeyPoints: [
        "ការឆ្លើយតបបែបព្រងើយកន្តើយ បង្ហាញពីកម្រិតសមត្ថភាពរបស់គេប៉ុណ្ណោះ មិនមែនកំហុសរបស់អ្នកឡើយ [4]។",
        "អ្នកមិនចាំបាច់ត្រូវការការយល់ព្រមពីមនុស្សគ្រប់គ្នា ដើម្បីបញ្ជាក់ថាអារម្មណ៍របស់អ្នកពិតនោះទេ។",
        "ដឹងពីពេលវេលាដែលត្រូវផ្អាកការសន្ទនាដែលគ្មានប្រយោជន៍ ហើយស្វែងរកមនុស្សផ្សេងដែលយល់ចិត្ត។",
      ],
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "Practice: Put Your Feelings Into Words",
      kmTitle: "ការអនុវត្ត៖ ការបម្លែងអារម្មណ៍ទៅជាពាក្យពេចន៍ (Practice Expression)",
      type: "reflection",
      paragraphs: [
        "You do not need to wait for a crisis to practice expressing how you feel. Building emotional articulation is like training a muscle.",
        "Take a moment right now to reflect on these four guided prompts. You can write your responses privately in your personal AROM Journal:",
        "1. Identify one feeling: 'Right now, I feel __________.' (e.g. overwhelmed, hopeful, lonely, nervous, relieved).",
        "2. Identify what contributed: 'I think I feel this way because __________.' (e.g. an upcoming deadline, feeling misunderstood, lack of sleep).",
        "3. Identify what you need: 'Something that would help me right now is __________.' (e.g. taking a quiet break, talking to a safe friend, receiving practical advice).",
        "4. Choose one small action: 'One gentle step I can take today is __________.' (e.g. writing in AROM Journal, scheduling a chat, practicing deep breathing).",
        "There are no right or wrong answers. This practice belongs entirely to you.",
      ],
      kmParagraphs: [
        "អ្នកមិនចាំបាច់រង់ចាំដល់មានវិបត្តិធ្ងន់ធ្ងរ ទើបចាប់ផ្តើមហាត់បញ្ចេញអារម្មណ៍នោះទេ។ ការរៀននិយាយពីអារម្មណ៍ប្រៀបដូចជាការហាត់ប្រាណពង្រឹងសាច់ដុំដូច្នោះដែរ។",
        "ឆ្លៀតពេលឥឡូវនេះ ដើម្បីឆ្លុះបញ្ចាំងពីសំណួរណែនាំទាំងបួននេះ។ អ្នកអាចកត់ត្រាចម្លើយរបស់អ្នកជាឯកជននៅក្នុងកំណត់ហេតុ AROM របស់អ្នក៖",
        "១. សម្គាល់អារម្មណ៍មួយ៖ «នៅពេលនេះ ខ្ញុំមានអារម្មណ៍ថា __________» (ឧទាហរណ៍៖ ធុញថប់ មានក្តីសង្ឃឹម ឯកោ ភ័យព្រួយ ឬធូរស្រាល)។",
        "២. រកមើលមូលហេតុរួមចំណែក៖ «ខ្ញុំគិតថាខ្ញុំមានអារម្មណ៍បែបនេះដោយសារតែ __________» (ឧទាហរណ៍៖ ការប្រឡងជិតមកដល់ អារម្មណ៍ថាគ្មានអ្នកយល់ ឬការគេងមិនបានគ្រប់គ្រាន់)។",
        "៣. កំណត់តម្រូវការ៖ «អ្វីដែលអាចជួយខ្ញុំបាននៅពេលនេះ គឺ __________» (ឧទាហរណ៍៖ ការសម្រាកស្ងប់ស្ងាត់ ការជជែកជាមួយមិត្តភក្តិ ឬការទទួលបានដំបូន្មានជាក់ស្តែង)។",
        "៤. ជ្រើសរើសសកម្មភាពតូចមួយ៖ «ជំហានតូចមួយដែលខ្ញុំអាចធ្វើបាននៅថ្ងៃនេះ គឺ __________» (ឧទាហរណ៍៖ កត់ត្រាក្នុងកំណត់ហេតុ AROM ផ្ញើសារទៅកាន់មិត្តភក្តិ ឬហាត់ដកដង្ហើមវែងៗ)។",
        "គ្មានចម្លើយណាត្រូវ ឬខុសនោះទេ។ ការអនុវត្តនេះគឺសម្រាប់តែរូបអ្នកផ្ទាល់ប៉ុណ្ណោះ។",
      ],
      reflection: {
        question: "When you reflect on opening up about your feelings, what feels like your biggest challenge right now?",
        kmQuestion: "នៅពេលអ្នកគិតអំពីការបើកចិត្តនិយាយពីអារម្មណ៍ តើអ្វីជាឧបសគ្គធំបំផុតសម្រាប់អ្នកនៅពេលនេះ?",
        options: [
          "Finding the right words to describe what is happening inside",
          "Fear of being judged, misunderstood, or thought of as weak",
          "Worrying that I will become a burden to the other person",
          "Not knowing who in my life is safe enough to confide in",
        ],
        kmOptions: [
          "ការស្វែងរកពាក្យពេចន៍ត្រឹមត្រូវដើម្បីពណ៌នាពីអ្វីដែលកើតឡើងក្នុងចិត្ត",
          "ការភ័យខ្លាចគេវិនិច្ឆ័យ យល់ច្រឡំ ឬគិតថាខ្លួនឯងទន់ខ្សោយ",
          "ការបារម្ភថាខ្លួនឯងនឹងក្លាយជាបន្ទុកដល់អ្នកដទៃ",
          "ការមិនដឹងថានរណាជាមនុស្សដែលមានសុវត្ថិភាពគ្រប់គ្រាន់ក្នុងការទុកចិត្ត",
        ],
        feedbackMessage:
          "Thank you for naming this hurdle. Every person who learns to speak their truth navigates this exact fear. Remember: you are not a burden, your feelings deserve voice, and AROM provides safe spaces to practice at your own pace.",
        kmFeedbackMessage:
          "អរគុណដែលបានប្រាប់ពីឧបសគ្គនេះ។ មនុស្សគ្រប់គ្នាដែលរៀននិយាយការពិត សុទ្ធតែធ្លាប់ឆ្លងកាត់ការភ័យខ្លាចនេះដូចគ្នា។ ចូរចងចាំថា៖ អ្នកមិនមែនជាបន្ទុករបស់អ្នកដទៃទេ អារម្មណ៍របស់អ្នកសមនឹងទទួលបានការបញ្ចេញ ហើយ AROM ផ្តល់ទីកន្លែងសុវត្ថិភាពដើម្បីឱ្យអ្នកអនុវត្តតាមលទ្ធភាពរបស់អ្នក។",
      },
      keyPoints: [
        "Externalizing emotions through a 4-step framework clarifies immediate needs.",
        "Your feelings are never a burden to those who truly care about your wellbeing.",
        "Writing in private before speaking out loud builds steady confidence.",
      ],
      kmKeyPoints: [
        "ការបម្លែងអារម្មណ៍តាមជំហានទាំង ៤ ជួយឱ្យអ្នកដឹងពីតម្រូវការបន្ទាន់បានច្បាស់លាស់។",
        "អារម្មណ៍របស់អ្នកមិនមែនជាបន្ទុកចំពោះអ្នកដែលស្រឡាញ់ និងបារម្ភពីអ្នកពិតប្រាកដនោះឡើយ។",
        "ការសរសេរជាឯកជនមុនពេលនិយាយចេញក្រៅ ជួយកសាងទំនុកចិត្តកាន់តែរឹងមាំ។",
      ],
    },
    {
      id: 10,
      sectionNumber: 10,
      title: "Next Steps and Support on AROM",
      kmTitle: "ជំហានបន្ទាប់ និងការគាំទ្រនៅលើ AROM (Next Steps & Support)",
      type: "coping",
      paragraphs: [
        "Talking about your feelings does not require grand speeches or flawless confidence. It begins with one honest emotion, one gentle sentence, or one written note to someone you trust.",
        "On AROM, you have compassionate, private tools designed to support your communication journey:",
        "• AROM Private Voice and Text Journal: Unpack messy emotions before talking to others. Voice record or type your feelings in complete confidentiality to find clarity and calm.",
        "• AROM Community Support Circles: Join safe, peer-moderated discussion groups where members openly share study stress, family dynamics, and friendship challenges without judgment.",
        "• AROM Verified Professional Care: If personal challenges feel persistent, heavy, or unmanageable, connect privately with licensed counselors and psychologists in Cambodia for one-on-one confidential sessions.",
        "• Emergency Crisis Support: If you or someone you know feels in immediate distress or danger, open your Profile and tap 'Get help now' for instant access to free crisis hotlines.",
        "You deserve relationships where you are heard with dignity, respect, and unconditional care.",
      ],
      kmParagraphs: [
        "ការនិយាយអំពីអារម្មណ៍មិនទាមទារនូវវោហារស័ព្ទល្អឥតខ្ចោះ ឬទំនុកចិត្តខ្ពស់ហួសហេតុនោះឡើយ។ វាចាប់ផ្តើមពីអារម្មណ៍ស្មោះត្រង់មួយ ប្រយោគទន់ភ្លន់មួយ ឬសារខ្លីមួយផ្ញើទៅកាន់មនុស្សដែលអ្នកទុកចិត្ត។",
        "នៅលើកម្មវិធី AROM អ្នកមានឧបករណ៍ឯកជនជាច្រើនដែលត្រូវបានរៀបចំឡើងដើម្បីគាំទ្រដំណើររបស់អ្នក៖",
        "• កំណត់ហេតុឯកជនជាសំឡេង និងអក្សរ (AROM Journal)៖ ដោះស្រាយអារម្មណ៍ច្របូកច្របល់មុនពេលនិយាយជាមួយអ្នកដទៃ។ កត់ត្រាសំឡេង ឬសរសេរអារម្មណ៍របស់អ្នកជាសម្ងាត់ទាំងស្រុង ដើម្បីទទួលបានភាពស្ងប់ក្នុងចិត្ត។",
        "• ក្រុមសហគមន៍ AROM (Community Support)៖ ចូលរួមក្រុមពិភាក្សាដែលមានការសម្របសម្រួលប្រកបដោយសុវត្ថិភាព ជាកន្លែងដែលសមាជិកចែករំលែកពីរឿងការរៀនសូត្រ បញ្ហាគ្រួសារ និងមិត្តភាពដោយគ្មានការវិនិច្ឆ័យ។",
        "• ការប្រឹក្សាជាមួយអ្នកជំនាញ AROM (Professional Care)៖ ប្រសិនបើបញ្ហាមានភាពរ៉ាំរ៉ៃ ធ្ងន់ធ្ងរ ឬពិបាកដោះស្រាយតែម្នាក់ឯង អ្នកអាចភ្ជាប់ទំនាក់ទំនងជាសម្ងាត់ជាមួយអ្នកប្រឹក្សា និងអ្នកជំនាញចិត្តសាស្ត្រនៅកម្ពុជា។",
        "• ជំនួយសង្គ្រោះបន្ទាន់ (Crisis Support)៖ ប្រសិនបើអ្នក ឬមនុស្សជុំវិញខ្លួនមានវិបត្តិផ្លូវចិត្តធ្ងន់ធ្ងរ ឬមានគ្រោះថ្នាក់បន្ទាន់ សូមបើក Profile ហើយចុច 'Get help now' ដើម្បីទទួលបានទំនាក់ទំនងបន្ទាន់ភ្លាមៗ។",
        "អ្នកសមនឹងទទួលបានទំនាក់ទំនងដែលស្តាប់អ្នកដោយសេចក្តីថ្លៃថ្នូរ ការគោរព និងក្តីមេត្តាពិតប្រាកដ។",
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
        "One honest sentence is a courageous and worthy beginning [1, 2].",
        "AROM Journal and Community Circles offer safe spaces to practice emotional expression.",
        "Confidential professional therapy is always available when conversations feel overwhelming.",
      ],
      kmKeyPoints: [
        "ប្រយោគស្មោះត្រង់តែមួយឃ្លា គឺជាការចាប់ផ្តើមដ៏ក្លាហាន និងមានតម្លៃ [1, 2]។",
        "កំណត់ហេតុ និងសហគមន៍ AROM ផ្តល់ទីកន្លែងសុវត្ថិភាពដើម្បីហាត់បញ្ចេញអារម្មណ៍។",
        "ការប្រឹក្សាជាសម្ងាត់ជាមួយអ្នកជំនាញ តែងតែមានជានិច្ចនៅពេលការសន្ទនាមានភាពធ្ងន់ធ្ងរ។",
      ],
    },
  ],
};

export const REFERENCES_SOCIAL_ANXIETY: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "NIMH",
    title: "National Institute of Mental Health: Social Anxiety Disorder",
    url: "https://www.nimh.nih.gov/health/publications/social-anxiety-disorder-more-than-just-shyness",
  },
  {
    id: 2,
    citation: "[2]",
    source: "NHS",
    title: "NHS: Social Anxiety",
    url: "https://www.nhs.uk/mental-health/conditions/social-anxiety/",
  },
  {
    id: 3,
    citation: "[3]",
    source: "NHS inform",
    title: "NHS inform: Social Anxiety Self-Help Guide",
    url: "https://www.nhsinform.scot/illnesses-and-conditions/mental-health/mental-health-self-help-guides/social-anxiety-self-help-guide/",
  },
  {
    id: 4,
    citation: "[4]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia: Mental Health",
    url: "https://www.unicef.org/cambodia/mental-health",
  },
];

export const LESSON_SOCIAL_ANXIETY: Lesson = {
  id: "how-to-handle-social-anxiety",
  title: "How to Handle Social Anxiety",
  kmTitle: "របៀបដោះស្រាយការថប់បារម្ភក្នុងសង្គម (How to Handle Social Anxiety)",
  subtitle: "Learn to manage the fear of being judged, feel more comfortable around others, and take social situations one step at a time",
  kmSubtitle: "រៀនគ្រប់គ្រងការភ័យខ្លាចគេវិនិច្ឆ័យ មានអារម្មណ៍ធូរស្រាលពេលនៅក្បែរអ្នកដទៃ និងប្រឈមមុខនឹងស្ថានភាពសង្គមមួយជំហានម្តងៗ",
  category: "Anxiety",
  duration: "8 min",
  kmDuration: "៨ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Practice",
  kmFormat: "ការអាន និងការអនុវត្ត (Reading & Practice)",
  isAvailable: true,
  image: "/mindguide/strategies.png",
  heroImage: "/mindguide/social-anxiety-hero.jpg",
  description:
    "Learn to recognize the social anxiety cycle, challenge catastrophic thoughts, practice gentle gradual exposure, and soothe bodily tension with AROM tools.",
  kmDescription:
    "រៀនសម្គាល់វដ្តនៃការថប់បារម្ភក្នុងសង្គម ចោទសួរគំនិតអវិជ្ជមាន អនុវត្តការប្រឈមមុខសន្សឹមៗ និងរំងាប់ភាពតានតឹងក្នុងរាងកាយជាមួយឧបករណ៍លើ AROM។",
  totalSections: 11,
  outcomes: [
    {
      en: "Understand what social anxiety is and how it differs from natural shyness [1, 2]",
      km: "យល់ដឹងពីអ្វីទៅជាការថប់បារម្ភក្នុងសង្គម និងភាពខុសគ្នារវាងវាជាមួយចរិតអៀនប្រៀនធម្មតា [1, 2]",
    },
    {
      en: "Identify how social anxiety affects thoughts, emotions, body signals, and behavior [1, 3]",
      km: "សម្គាល់របៀបដែលការថប់បារម្ភជះឥទ្ធិពលលើការគិត អារម្មណ៍ សញ្ញារាងកាយ និងអាកប្បកិរិយា [1, 3]",
    },
    {
      en: "Break the social anxiety cycle by identifying triggers and interrupting avoidance [3]",
      km: "កាត់ផ្តាច់វដ្តនៃការថប់បារម្ភក្នុងសង្គម តាមរយៈការសម្គាល់រឿងជំរុញ និងកាត់បន្ថយការគេចវេះ [3]",
    },
    {
      en: "Apply the 3-question cognitive restructuring method to challenge harsh assumptions [2, 3]",
      km: "អនុវត្តវិធីសាស្ត្រចោទសួរ ៣ សំណួរ ដើម្បីកែតម្រូវការសន្មតអវិជ្ជមានដែលគ្មានមូលដ្ឋាន [2, 3]",
    },
    {
      en: "Design a gradual exposure ladder to practice everyday social interactions step by step [2, 3]",
      km: "រៀបចំកាំជណ្ដើរនៃការប្រឈមមុខសន្សឹមៗ ដើម្បីហាត់ជួបប្រាស្រ័យទាក់ទងក្នុងសង្គមមួយជំហានម្តងៗ [2, 3]",
    },
    {
      en: "Manage physical trembling and post-event rumination using private AROM tools [1, 4]",
      km: "គ្រប់គ្រងការញាប់ញ័រក្នុងរាងកាយ និងការស្តីបន្ទោសខ្លួនឯងក្រោយការជួបជុំ ដោយប្រើឧបករណ៍ AROM [1, 4]",
    },
  ],
  references: REFERENCES_SOCIAL_ANXIETY,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "What Is Social Anxiety?",
      kmTitle: "តើអ្វីទៅជាការថប់បារម្ភក្នុងសង្គម? (What Is Social Anxiety?)",
      type: "reading",
      paragraphs: [
        "Have you ever wanted to talk to someone but worried that you might say something embarrassing?",
        "Maybe you feel nervous when meeting new people, speaking in class, joining a group conversation, eating in public, or asking a teacher for help. You might wonder: 'What if they think I am strange? What if I say something wrong? What if everyone notices my trembling?'",
        "These worries can make ordinary social settings feel like high-stakes performance tests.",
        "Social anxiety is the fear or intense worry about situations where you believe other people might scrutinize, judge, criticize, or reject you [1, 2].",
        "It is important to understand: Social anxiety is not simply being quiet, introverted, or shy. An introvert can be naturally quiet and feel completely relaxed at home or with friends. Social anxiety becomes concerning when persistent fear and avoidance cause distress or hold you back from living your life [1, 2].",
        "Social anxiety can affect anyone, regardless of intelligence, character, or background. You do not need to alter your core personality to overcome it: you can learn to be comfortably yourself around others.",
      ],
      kmParagraphs: [
        "តើអ្នកធ្លាប់ចង់និយាយជាមួយនរណាម្នាក់ ប៉ុន្តែបារម្ភខ្លាចនិយាយខុស ឬធ្វើឱ្យអាម៉ាស់មុខដែរឬទេ?",
        "ប្រហែលជាអ្នកមានអារម្មណ៍ភ័យនៅពេលជួបមនុស្សថ្មី ពេលនិយាយក្នុងថ្នាក់ ពេលចូលរួមការសន្ទនាជាក្រុម ពេលញ៉ាំអាហារនៅមុខអ្នកដទៃ ឬពេលសុំជំនួយពីគ្រូ។ អ្នកអាចឆ្ងល់ថា៖ «ចុះបើគេគិតថាខ្ញុំចម្លែក? ចុះបើខ្ញុំនិយាយខុស? ចុះបើគ្រប់គ្នាកត់សម្គាល់ឃើញថាខ្ញុំកំពុងភ័យ?»",
        "ការព្រួយបារម្ភទាំងនេះ អាចធ្វើឱ្យការជួបជុំសាមញ្ញប្រចាំថ្ងៃ មានអារម្មណ៍ដូចជាការប្រឡងដ៏តានតឹងមួយ។",
        "ការថប់បារម្ភក្នុងសង្គម (Social Anxiety) គឺជាការភ័យខ្លាច ឬការព្រួយបារម្ភយ៉ាងខ្លាំងចំពោះស្ថានភាពសង្គម ដែលអ្នកគិតថាអ្នកដទៃអាចនឹងសង្កេត វិនិច្ឆ័យ រិះគន់ ឬបដិសេធអ្នក [1, 2]។",
        "ចំណុចសំខាន់ដែលត្រូវយល់៖ ការថប់បារម្ភក្នុងសង្គម មិនមែនគ្រាន់តែជាការនៅស្ងៀម ឬមានចរិតអៀនប្រៀនធម្មតានោះឡើយ។ មនុស្សដែលចូលចិត្តភាពស្ងប់ស្ងាត់ (Introvert) អាចនៅស្ងៀម ប៉ុន្តែមានអារម្មណ៍ស្រួលចិត្តទាំងស្រុងនៅផ្ទះ ឬជាមួយមិត្តភក្តិ។ ការថប់បារម្ភក្នុងសង្គម ក្លាយជាបញ្ហានៅពេលដែលការភ័យខ្លាច និងការគេចវេះបង្កការឈឺចាប់ក្នុងចិត្ត ឬរារាំងអ្នកពីការរស់នៅប្រចាំថ្ងៃ [1, 2]។",
        "ការថប់បារម្ភក្នុងសង្គមអាចកើតឡើងលើមនុស្សគ្រប់រូប ដោយមិនប្រកាន់ចំណេះដឹង បុគ្គលិកលក្ខណៈ ឬប្រវត្តិជីវិតនោះឡើយ។ អ្នកមិនចាំបាច់កែប្រែអត្តចរិតដើមរបស់អ្នក ដើម្បីដោះស្រាយវាទេ៖ អ្នកគ្រាន់តែរៀនរស់នៅដោយមានអារម្មណ៍ស្រួលចិត្តជាមួយខ្លួនឯងនៅចំពោះមុខអ្នកដទៃ។",
      ],
      keyPoints: [
        "Social anxiety centers on the intense fear of being judged, scrutinized, or rejected [1, 2].",
        "It differs fundamentally from peaceful introversion or natural shyness.",
        "You do not need to become an outgoing extrovert to manage social situations successfully.",
      ],
      kmKeyPoints: [
        "ការថប់បារម្ភក្នុងសង្គមផ្តោតសំខាន់លើការភ័យខ្លាចគេវិនិច្ឆ័យ សង្កេត ឬបដិសេធ [1, 2]។",
        "វាមានភាពខុសគ្នាជាមូលដ្ឋានពីភាពស្ងប់ស្ងាត់តាមធម្មជាតិ ឬចរិតអៀនប្រៀន។",
        "អ្នកមិនចាំបាច់ក្លាយជាមនុស្សដែលរួសរាយនិយាយច្រើន ទើបអាចរស់នៅក្នុងសង្គមបានល្អនោះឡើយ។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "Recognize How Social Anxiety Affects You",
      kmTitle: "ឥទ្ធិពលលើចិត្ត គំនិត និងរាងកាយ (Mind & Body Signals)",
      type: "reading",
      paragraphs: [
        "Social anxiety is not just a mental worry: it activates four interconnected systems in your daily life [1, 3]:",
        "1. Your Thoughts:",
        "• 'Everyone is staring at me.'",
        "• 'I am going to stutter and make a fool of myself.'",
        "• 'They must think I am boring, awkward, or weird.'",
        "• 'If I make one mistake, nobody will ever forget it.'",
        "2. Your Emotions: Intense self-consciousness, shame, nervousness, dread before events, and a powerful urge to run away.",
        "3. Your Body: Fast heartbeat, sweaty palms, blushing cheeks, trembling hands or voice, dry mouth, churning stomach, muscle tightness, and feeling as though your mind has completely gone blank [1, 2]. These are involuntary biological fight-or-flight reactions to perceived danger.",
        "4. Your Behaviors: Avoiding parties or class presentations, sitting silently when you want to speak, rehearsing conversations for hours in your head, having someone else speak for you, and escaping situations early.",
        "Noticing these four channels helps you recognize when anxiety is driving your decisions rather than reality.",
      ],
      kmParagraphs: [
        "ការថប់បារម្ភក្នុងសង្គម មិនមែនគ្រាន់តែជាការព្រួយបារម្ភក្នុងចិត្តនោះទេ៖ វាដាស់ឱ្យដំណើរការប្រព័ន្ធទាំង ៤ ដែលផ្សារភ្ជាប់គ្នាក្នុងជីវិតប្រចាំថ្ងៃ [1, 3]៖",
        "១. គំនិតរបស់អ្នក៖",
        "• «គ្រប់គ្នាកំពុងតែសម្លឹងមើលមកខ្ញុំ»។",
        "• «ខ្ញុំនឹងនិយាយត្រដិត ហើយធ្វើឱ្យខ្លួនឯងអាម៉ាស់មុខ»។",
        "• «ពួកគេប្រហែលជាគិតថាខ្ញុំជាមនុស្សគួរឱ្យធុញ ចម្លែក ឬឆ្គង»។",
        "• «ប្រសិនបើខ្ញុំធ្វើខុសតែម្តង គ្មាននរណាម្នាក់ភ្លេចរឿងនេះឡើយ»។",
        "២. អារម្មណ៍របស់អ្នក៖ អារម្មណ៍ដឹងពីខ្លួនឯងជ្រុល ភាពខ្មាសអៀន ភាពភ័យខ្លាចមុនពេលកម្មវិធីមកដល់ និងអារម្មណ៍ចង់តែរត់ចេញពីកន្លែងនោះភ្លាមៗ។",
        "៣. រាងកាយរបស់អ្នក៖ បេះដូងលោតញាប់ បាតដៃចេញញើស មុខឡើងក្រហម ដៃឬសំឡេងញ័រ មាត់ស្ងួត ចុកពោះ សាច់ដុំតឹងណែន និងមានអារម្មណ៍ថាខួរក្បាលគិតអ្វីមិនចេញ [1, 2]។ ទាំងនេះគឺជាប្រតិកម្មស្វ័យប្រវត្តិនៃប្រព័ន្ធប្រសាទចំពោះការគិតថាមានគ្រោះថ្នាក់។",
        "៤. អាកប្បកិរិយារបស់អ្នក៖ ការគេចវេះពីការជួបជុំ ឬការឡើងនិយាយក្នុងថ្នាក់ ការអង្គុយស្ងៀមទោះបីជាចង់បញ្ចេញមតិ ការហាត់សមពាក្យនិយាយក្នុងក្បាលរាប់ម៉ោង ការពឹងពាក់អ្នកដទៃឱ្យនិយាយជំនួស និងការប្រញាប់ចាកចេញមុនគេ។",
        "ការកត់សម្គាល់ឃើញទម្រង់ទាំង ៤ នេះ ជួយឱ្យអ្នកដឹងច្បាស់នៅពេលដែលការថប់បារម្ភកំពុងដឹកមុខការសម្រេចចិត្តរបស់អ្នក។",
      ],
      keyPoints: [
        "Social anxiety manifests through thoughts, emotions, physical sensations, and avoidance [1, 3].",
        "Blushing, shaking, and a racing heart are biological defense reflexes, not signs of failure.",
        "Recognizing avoidance patterns is the first step toward reclaiming social freedom.",
      ],
      kmKeyPoints: [
        "ការថប់បារម្ភក្នុងសង្គមបង្ហាញឡើងតាមរយៈគំនិត អារម្មណ៍ ប្រតិកម្មរាងកាយ និងការគេចវេះ [1, 3]។",
        "មុខក្រហម ការញាប់ញ័រ និងបេះដូងលោតញាប់ គឺជាយន្តការការពារខ្លួនតាមធម្មជាតិ មិនមែនជាការបរាជ័យឡើយ។",
        "ការសម្គាល់ដឹងពីទម្លាប់គេចវេះ គឺជាជំហានដំបូងដើម្បីទទួលបានសេរីភាពក្នុងសង្គមឡើងវិញ។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "The Social Anxiety Cycle and How to Break It",
      kmTitle: "វដ្តនៃការថប់បារម្ភក្នុងសង្គម និងវិធីកាត់ផ្តាច់វា (The Anxiety Cycle)",
      type: "quiz",
      paragraphs: [
        "Social anxiety traps people inside a predictable repeating loop [3]:",
        "1. Trigger: You are placed in a social situation (e.g. asked to answer a question or join a table).",
        "2. Anxious Prediction: Your mind assumes the worst: 'If I speak, they will judge me and think I am foolish.'",
        "3. Physical Surge: Adrenaline rushes in, your heart beats fast, and your stomach knots up.",
        "4. Avoidance or Safety Behavior: You look down at your phone, stay silent, or leave the room entirely.",
        "5. Short-Term Relief: Leaving drops the anxiety immediately, creating a feeling of safety.",
        "The hidden danger: While avoidance brings instant relief, it teaches your brain that social situations are genuinely dangerous and that escaping was the only reason you survived. The next time you face the same situation, your fear will be twice as strong. [2, 3]",
        "To break the cycle, you do not need to jump into panic. You interrupt the loop by questioning anxious predictions and gently staying in manageable situations until your nervous system calms down.",
      ],
      kmParagraphs: [
        "ការថប់បារម្ភក្នុងសង្គមតែងតែទាក់ទាញមនុស្សឱ្យធ្លាក់ចូលក្នុងរង្វង់វិលវល់មួយដដែលៗ [3]៖",
        "១. រឿងជំរុញ៖ អ្នកស្ថិតក្នុងស្ថានភាពសង្គមណាមួយ (ឧទាហរណ៍៖ ត្រូវគេហៅឱ្យឆ្លើយសំណួរ ឬត្រូវចូលរួមតុញ៉ាំបាយ)។",
        "២. ការទស្សន៍ទាយអវិជ្ជមាន៖ ចិត្តរបស់អ្នកសន្មតរឿងអាក្រក់បំផុត៖ «បើខ្ញុំនិយាយ គេនឹងសើចចំអក ហើយគិតថាខ្ញុំល្ងង់»។",
        "៣. ប្រតិកម្មរាងកាយ៖ អ័រម៉ូន Adrenaline កើនឡើង បេះដូងលោតញាប់ និងចុកពោះ។",
        "៤. ការគេចវេះ ឬអាកប្បកិរិយាការពារខ្លួន៖ អ្នកឱនមុខមើលទូរស័ព្ទ អង្គុយស្ងៀម ឬដើរចេញពីបន្ទប់នោះភ្លាម។",
        "៥. ការធូរស្រាលបណ្តោះអាសន្ន៖ ការចាកចេញធ្វើឱ្យភាពភ័យខ្លាចធ្លាក់ចុះភ្លាមៗ ដែលនាំមកនូវអារម្មណ៍សុវត្ថិភាព។",
        "គ្រោះថ្នាក់ដែលមើលមិនឃើញ៖ ទោះបីជាការគេចវេះផ្តល់ការធូរស្រាលមួយភ្លែតក៏ដោយ វាបង្រៀនខួរក្បាលរបស់អ្នកថា ស្ថានភាពសង្គមគឺពិតជាមានគ្រោះថ្នាក់ ហើយការរត់គេចគឺជាមធ្យោបាយតែមួយគត់ដើម្បីរស់។ លើកក្រោយពេលជួបស្ថានភាពដដែល ការភ័យខ្លាចនឹងកើនឡើងទ្វេដង។ [2, 3]",
        "ដើម្បីកាត់ផ្តាច់វដ្តនេះ អ្នកមិនចាំបាច់បង្ខំខ្លួនឯងឱ្យតក់ស្លុតនោះទេ។ អ្នកអាចកាត់ផ្តាច់វាដោយការចោទសួរគំនិតអវិជ្ជមាន និងការតស៊ូស្នាក់នៅក្នុងស្ថានភាពតូចៗ រហូតដល់ប្រព័ន្ធប្រសាទស្ងប់ចុះមកវិញ។",
      ],
      quiz: {
        question: "Why does avoiding a social situation actually make social anxiety worse over time?",
        kmQuestion: "ហេតុអ្វីបានជាការគេចវេះពីស្ថានភាពសង្គម ធ្វើឱ្យការថប់បារម្ភកាន់តែធ្ងន់ធ្ងរទៅតាមពេលវេលា?",
        options: [
          {
            id: "opt-1",
            text: "Because other people will permanently resent you if you leave the room",
            kmText: "ពីព្រោះអ្នកដទៃនឹងស្អប់អ្នកជារៀងរហូត ប្រសិនបើអ្នកចាកចេញពីបន្ទប់",
            isCorrect: false,
          },
          {
            id: "opt-2",
            text: "Because avoidance reinforces the brain's false belief that social settings are dangerous and impossible to handle",
            kmText: "ពីព្រោះការគេចវេះពង្រឹងជំនឿមិនពិតរបស់ខួរក្បាលថា ស្ថានភាពសង្គមមានគ្រោះថ្នាក់ ហើយមិនអាចដោះស្រាយបាន",
            isCorrect: true,
          },
          {
            id: "opt-3",
            text: "Because avoiding situations immediately eliminates all future social fears",
            kmText: "ពីព្រោះការគេចវេះជួយបំបាត់ការភ័យខ្លាចក្នុងសង្គមទាំងអស់នាពេលអនាគតភ្លាមៗ",
            isCorrect: false,
          },
          {
            id: "opt-4",
            text: "Because avoiding conversations causes permanent physical vocal damage",
            kmText: "ពីព្រោះការគេចវេះមិននិយាយស្តី ធ្វើឱ្យខូចខាតសំឡេងរាងកាយជាអចិន្ត្រៃយ៍",
            isCorrect: false,
          },
        ],
        explanation:
          "Correct. Avoiding situations brings temporary relief, but it robs you of the opportunity to learn that anxiety naturally peaks and subsides, and that you are capable of handling social moments [2, 3].",
        kmExplanation:
          "ត្រឹមត្រូវណាស់។ ការគេចវេះនាំមកនូវការធូរស្រាលមួយភ្លែត ប៉ុន្តែវាដកហូតឱកាសរបស់អ្នកក្នុងការរៀនសូត្រថា ការថប់បារម្ភនឹងឡើងដល់ចំណុចកំពូលហើយស្រកចុះមកវិញតាមធម្មជាតិ ហើយអ្នកពិតជាមានសមត្ថភាពដោះស្រាយស្ថានភាពសង្គមទាំងនោះបាន [2, 3]។",
      },
      keyPoints: [
        "The anxiety cycle links triggers, catastrophic thoughts, physical tension, and avoidance [3].",
        "Avoidance provides short-term relief while cementing long-term fear.",
        "Breaking the cycle involves tolerating short-term discomfort to build enduring confidence.",
      ],
      kmKeyPoints: [
        "វដ្តនៃការថប់បារម្ភផ្សារភ្ជាប់រឿងជំរុញ ការគិតអវិជ្ជមាន ប្រតិកម្មរាងកាយ និងការគេចវេះ [3]។",
        "ការគេចវេះផ្តល់ការធូរស្រាលរយៈពេលខ្លី ប៉ុន្តែពង្រឹងការភ័យខ្លាចរយៈពេលវែង។",
        "ការកាត់ផ្តាច់វដ្តនេះ ទាមទារការអត់ធន់នឹងភាពមិនស្រួលរយៈពេលខ្លី ដើម្បីកសាងទំនុកចិត្តយូរអង្វែង។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "Challenge Your Anxious Thoughts",
      kmTitle: "ការចោទសួរ និងកែតម្រូវគំនិតថប់បារម្ភ (Cognitive Restructuring)",
      type: "reading",
      paragraphs: [
        "When social anxiety flares, our minds treat fearful assumptions as unquestionable facts.",
        "Imagine you speak in a study group and someone does not immediately reply. An anxious mind instantly jumps to: 'They think my opinion is foolish.' But in reality, they might be rereading a slide, exhausted from work, or simply processing your words. You cannot read minds.",
        "Whenever a catastrophic prediction enters your head, pause and test it with the 3-Question Method [2, 3]:",
        "Question 1: What am I afraid will happen? State the fear specifically: 'I am afraid that if I speak, everyone will laugh at me.'",
        "Question 2: What objective evidence do I have? Have people actually said they will laugh, or am I mind-reading and forecasting catastrophe?",
        "Question 3: What is a more balanced and realistic perspective? 'I might stumble on a word, and that feels awkward for a second. But everyone stumbles, people are focused on their own work, and one clumsy sentence does not define who I am.'",
        "The goal is not blind positive thinking: it is cognitive fairness and realistic balance.",
      ],
      kmParagraphs: [
        "នៅពេលការថប់បារម្ភក្នុងសង្គមកើនឡើង ចិត្តរបស់យើងតែងតែចាត់ទុកការសន្មតអវិជ្ជមានថាជាការពិតដែលមិនអាចប្រកែកបាន។",
        "ស្រមៃថាអ្នកនិយាយក្នុងក្រុមរៀន ហើយនរណាម្នាក់មិនបានឆ្លើយតបមកវិញភ្លាមៗ។ ចិត្តដែលថប់បារម្ភនឹងលោតទៅគិតភ្លាមថា៖ «គេប្រហែលជាគិតថាយោបល់ខ្ញុំល្ងង់ហើយ»។ ប៉ុន្តែតាមការពិត ពួកគេប្រហែលជាកំពុងអានស្លាយឡើងវិញ កំពុងហត់នឿយពីការងារ ឬគ្រាន់តែកំពុងពិចារណាសម្តីរបស់អ្នក។ អ្នកមិនអាចអានចិត្តអ្នកដទៃបាននោះឡើយ។",
        "នៅពេលណាដែលមានគំនិតអវិជ្ជមានកើតឡើង សូមផ្អាកបន្តិច ហើយសាកល្បងពិនិត្យវាដោយវិធីសាស្ត្រ ៣ សំណួរ [2, 3]៖",
        "សំណួរទី ១៖ តើខ្ញុំកំពុងភ័យខ្លាចថានឹងមានរឿងអ្វីកើតឡើង? ប្រាប់ការភ័យខ្លាចឱ្យជាក់លាក់៖ «ខ្ញុំខ្លាចថាបើខ្ញុំនិយាយ គ្រប់គ្នានឹងសើចចំអកឱ្យខ្ញុំ»។",
        "សំណួរទី ២៖ តើខ្ញុំមានភស្តុតាងជាក់ស្តែងអ្វីខ្លះ? តើធ្លាប់មានអ្នកណាប្រាប់ថានឹងសើច ឬតើខ្ញុំគ្រាន់តែទស្សន៍ទាយរឿងអាក្រក់ដោយខ្លួនឯង?",
        "សំណួរទី ៣៖ តើទស្សនៈណាដែលមានតុល្យភាព និងស្របតាមការពិតជាងនេះ? «ខ្ញុំអាចនឹងនិយាយទាក់ពាក្យបន្តិច ហើយវាអាចធ្វើឱ្យទើសទាល់មួយភ្លែត។ ប៉ុន្តែនរណាក៏ធ្លាប់និយាយទាក់ដែរ មនុស្សគ្រប់គ្នាកំពុងផ្តោតលើការងាររៀងៗខ្លួន ហើយពាក្យសម្តីឆ្គងមួយម៉ាត់ មិនកំណត់ថាខ្ញុំជាមនុស្សបែបណានោះឡើយ»។",
        "គោលដៅមិនមែនជាការបង្ខំខ្លួនឯងឱ្យគិតវិជ្ជមានងងឹតងងុលនោះទេ៖ វាគឺដើម្បីផ្តល់ឱ្យខ្លួនអ្នកនូវទស្សនៈដែលយុត្តិធម៌ និងស្របតាមការពិត។",
      ],
      keyPoints: [
        "Anxious thoughts are psychological predictions, not certified facts [2, 3].",
        "Recognize cognitive traps: mind-reading, fortune-telling, and catastrophizing.",
        "Replace harsh assumptions with balanced, fair, and compassionate realities.",
      ],
      kmKeyPoints: [
        "គំនិតថប់បារម្ភគ្រាន់តែជាការទស្សន៍ទាយផ្លូវចិត្ត មិនមែនជាការពិតជាក់ស្តែងនោះឡើយ [2, 3]។",
        "សម្គាល់អន្ទាក់គំនិត៖ ការស្មានចិត្តអ្នកដទៃ ការទស្សន៍ទាយរឿងអាក្រក់ និងការពង្រីកបញ្ហាឱ្យធំ។",
        "ជំនួសការសន្មតដ៏តឹងតែង ដោយទស្សនៈដែលមានតុល្យភាព យុត្តិធម៌ និងការយល់ចិត្តខ្លួនឯង។",
      ],
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "Start Small and Gradually Face Social Situations",
      kmTitle: "ការប្រឈមមុខសន្សឹមៗ៖ ជំហានតូចៗជាក់ស្តែង (Gradual Exposure)",
      type: "reading",
      paragraphs: [
        "Confidence is not something you wait to feel before you act: confidence is built through gentle, repeated action.",
        "In Cognitive Behavioral Therapy (CBT), the gold-standard method for overcoming social anxiety is called Gradual Exposure [1, 3]. Instead of jumping into your most terrifying scenario, you build an exposure ladder with small, manageable steps:",
        "Step 1: Make eye contact and smile at a campus cashier or barista.",
        "Step 2: Greet one classmate before a lecture begins with a simple, 'Good morning.'",
        "Step 3: Ask a peer a simple factual question: 'Do you know which chapter the quiz covers?'",
        "Step 4: Stay in a group conversation for five minutes without checking your phone.",
        "Step 5: Share one brief comment or opinion during a study session.",
        "Step 6: Ask a question during a classroom discussion.",
        "Key exposure guidelines: Pick a step that feels mildly uncomfortable (around a 3 or 4 out of 10 in anxiety) but doable. Stay in the situation until your heart rate begins to steady. Notice the outcome: What was I terrified would happen? What actually took place? You will discover that discomfort is temporary and that you are far more capable than your anxiety claimed. [2, 3]",
      ],
      kmParagraphs: [
        "ទំនុកចិត្តមិនមែនជារឿងដែលអ្នកត្រូវអង្គុយរង់ចាំឱ្យមាន ទើបចាប់ផ្តើមធ្វើសកម្មភាពនោះទេ៖ ទំនុកចិត្តត្រូវបានកសាងឡើងតាមរយៈសកម្មភាពតូចៗម្តងហើយម្តងទៀត។",
        "នៅក្នុងការព្យាបាលបែបការយល់ដឹង និងអាកប្បកិរិយា (CBT) វិធីសាស្ត្រស្តង់ដារមាសដើម្បីជម្នះការថប់បារម្ភក្នុងសង្គម ត្រូវបានហៅថា ការប្រឈមមុខសន្សឹមៗ (Gradual Exposure) [1, 3]។ ជំនួសឱ្យការលោតចូលទៅក្នុងស្ថានភាពដែលគួរឱ្យខ្លាចបំផុត អ្នកត្រូវរៀបចំកាំជណ្ដើរនៃការប្រឈមមុខ តាមរយៈជំហានតូចៗដែលអាចគ្រប់គ្រងបាន៖",
        "កាំទី ១៖ សម្លឹងភ្នែក និងញញឹមដាក់អ្នកគិតលុយ ឬអ្នកឆុងកាហ្វេ។",
        "កាំទី ២៖ និយាយពាក្យសួស្តីសាមញ្ញមួយម៉ាត់ទៅកាន់មិត្តរួមថ្នាក់ម្នាក់ មុនពេលម៉ោងរៀនចាប់ផ្តើម។",
        "កាំទី ៣៖ សួរសំណួរសាមញ្ញមួយទៅកាន់មិត្តភក្តិ៖ «តើអ្នកដឹងទេថាការប្រឡងនឹងចេញមេរៀនណាខ្លះ?»",
        "កាំទី ៤៖ ស្នាក់នៅក្នុងការសន្ទនាជាក្រុមរយៈពេល ៥ នាទី ដោយមិនដកទូរស័ព្ទមកមើល។",
        "កាំទី ៥៖ បញ្ចេញមតិ ឬយោបល់ខ្លីមួយក្នុងពេលពិភាក្សាការងារជាក្រុម។",
        "កាំទី ៦៖ លើកដៃសួរសំណួរក្នុងពេលគ្រូកំពុងបង្រៀន។",
        "គោលការណ៍សំខាន់៖ ជ្រើសរើសជំហានណាដែលមានអារម្មណ៍ទើសទាល់បន្តិច (កម្រិត ៣ ឬ ៤ លើ ១០) ប៉ុន្តែអាចធ្វើបាន។ ស្នាក់នៅក្នុងស្ថានភាពនោះរហូតដល់ចង្វាក់បេះដូងចាប់ផ្តើមស្ងប់។ កត់សម្គាល់លទ្ធផល៖ តើអ្វីដែលខ្ញុំខ្លាចថានឹងកើតឡើង? តើមានរឿងអ្វីកើតឡើងពិតប្រាកដ? អ្នកនឹងដឹងថា ភាពមិនស្រួលចិត្តគឺជារឿងបណ្តោះអាសន្ន ហើយអ្នកមានសមត្ថភាពខ្លាំងជាងការបំភិតបំភ័យនៃការថប់បារម្ភ។ [2, 3]",
      ],
      keyPoints: [
        "Gradual exposure breaks daunting social fears into manageable stairs [1, 3].",
        "Start with low-intensity challenges (level 3 out of 10) before progressing.",
        "Staying in the moment proves that physical discomfort naturally fades with time.",
      ],
      kmKeyPoints: [
        "ការប្រឈមមុខសន្សឹមៗជួយបំបែកការភ័យខ្លាចធំៗ ឱ្យទៅជាកាំជណ្ដើរតូចៗដែលអាចឡើងបាន [1, 3]។",
        "ចាប់ផ្តើមពីបញ្ហាប្រឈមកម្រិតស្រាល (កម្រិត ៣ លើ ១០) មុននឹងបន្តទៅមុខ។",
        "ការតស៊ូស្នាក់នៅក្នុងស្ថានភាពនោះ បង្ហាញថាប្រតិកម្មរាងកាយនឹងថមថយទៅវិញតាមធម្មជាតិ។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "Focus on the Conversation, Not Just Yourself",
      kmTitle: "ការបង្វែរការយកចិត្តទុកដាក់ចេញក្រៅ (External Focus)",
      type: "reading",
      paragraphs: [
        "When socially anxious, people get caught in intense self-focused attention.",
        "Your mental spotlight turns entirely inward: You monitor how your voice sounds, whether your hands are shaking, whether your smile looks fake, and what brilliant sentence you should deliver next. This internal multitasking creates severe cognitive overload and makes social interactions exhausting. [2, 3]",
        "Instead of keeping the spotlight on yourself, consciously turn it outward onto the other person and your surroundings:",
        "• Listen with genuine curiosity: Focus on the meaning of what the speaker is sharing, rather than rehearsing your next line.",
        "• Ask open-ended questions: People love being listened to. Ask: 'How did you get interested in this major?' or 'What do you enjoy doing on weekends?'",
        "• Embrace conversational pauses: A brief silence of three seconds is completely normal human conversation, not a social catastrophe. People often pause to think.",
        "• You are not an entertainer: You are not responsible for carrying the entertainment of the entire room. A shared moment of quiet presence is deeply okay.",
      ],
      kmParagraphs: [
        "នៅពេលមានការថប់បារម្ភក្នុងសង្គម មនុស្សភាគច្រើនច្រើនតែធ្លាក់ចូលទៅក្នុងការផ្តោតលើខ្លួនឯងខ្លាំងពេក (Self-focused attention)។",
        "ចំណុចចាប់អារម្មណ៍ក្នុងចិត្តរបស់អ្នកបានបង្វែរចូលមកក្នុងខ្លួនទាំងស្រុង៖ អ្នកតាមដានសំឡេងរបស់ខ្លួនឯង តាមដានថាតើដៃកំពុងញ័រឬអត់ ថាតើស្នាមញញឹមមើលទៅសមឬទេ និងខ្វល់ខ្វាយថាតើត្រូវនិយាយពាក្យអ្វីឱ្យពីរោះនៅបន្ទាប់។ ការគិតស្មុគស្មាញច្រើនក្នុងពេលតែមួយនេះ ធ្វើឱ្យខួរក្បាលហត់នឿយយ៉ាងខ្លាំង និងធ្វើឱ្យការជួបជុំសង្គមក្លាយជារឿងលំបាក។ [2, 3]",
        "ជំនួសឱ្យការចាំងពិលមកលើតែខ្លួនឯង សូមបង្វែរការយកចិត្តទុកដាក់ចេញទៅខាងក្រៅ ទៅកាន់អ្នកដទៃ និងបរិយាកាសជុំវិញខ្លួន៖",
        "• ស្តាប់ដោយក្តីចង់ដឹងពិតប្រាកដ៖ យកចិត្តទុកដាក់លើអត្ថន័យនៃអ្វីដែលអ្នកម្ខាងទៀតកំពុងនិយាយ ជាជាងការហាត់សមពាក្យនិយាយបន្ទាប់ក្នុងក្បាល។",
        "• សួរសំណួរបើក៖ មនុស្សគ្រប់គ្នាសុទ្ធតែចូលចិត្តឱ្យគេស្តាប់។ សួរថា៖ «តើអ្វីដែលធ្វើឱ្យអ្នកចាប់អារម្មណ៍រៀនជំនាញនេះ?» ឬ «តើអ្នកចូលចិត្តធ្វើអ្វីពេលទំនេរចុងសប្តាហ៍?»",
        "• ទទួលយកភាពស្ងៀមស្ងាត់៖ ភាពស្ងាត់បន្តិចបន្តួចរយៈពេល ៣ វិនាទី គឺជារឿងធម្មតាទាំងស្រុងនៃការសន្ទនារបស់មនុស្ស មិនមែនជាការបរាជ័យឡើយ។ មនុស្សត្រូវការពេលគិត។",
        "• អ្នកមិនមែនជាអ្នកកំប្លែងសម្តែងនោះទេ៖ អ្នកមិនមានកាតព្វកិច្ចធ្វើឱ្យបន្ទប់ទាំងមូលសប្បាយរីករាយគ្រប់វិនាទីនោះឡើយ។ ការរួមរស់ជាមួយគ្នាដោយភាពស្ងប់ស្ងាត់ គឺជារឿងធម្មតាបំផុត។",
      ],
      keyPoints: [
        "Turn your mental spotlight outward onto the other person rather than monitoring yourself [2, 3].",
        "Be curious rather than performing: ask open-ended questions.",
        "Brief pauses are natural pauses for thought, not social emergencies.",
      ],
      kmKeyPoints: [
        "បង្វែរការយកចិត្តទុកដាក់ចេញទៅខាងក្រៅរកអ្នកដទៃ ជាជាងការតាមដានរាល់កាយវិការខ្លួនឯង [2, 3]។",
        "ធ្វើជាអ្នកចង់ដឹង ជាជាងអ្នកសម្តែង៖ ចេះសួរសំណួរបើកចំហ។",
        "ភាពស្ងៀមស្ងាត់បន្តិចបន្តួច គឺជាពេលសម្រាប់គិត មិនមែនជាគ្រោះអាសន្នសង្គមឡើយ។",
      ],
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "Learn to Manage Physical Anxiety",
      kmTitle: "ការរំងាប់ប្រតិកម្មរាងកាយ (Somatic & Breath Regulation)",
      type: "reading",
      paragraphs: [
        "When adrenaline surges, your sympathetic nervous system triggers physical symptoms before you have time to reason through them.",
        "You can send an immediate counter-signal of biological safety to your brain using somatic regulation:",
        "1. Slow Diaphragmatic Breathing: Inhale gently through your nose for 4 seconds, and exhale slowly through your mouth for 6 seconds. Extending the exhale stimulates the vagus nerve and lowers your heart rate.",
        "2. The 3-2-1 Sensory Grounding: Look around the room and mentally note 3 objects you can see (e.g. wooden desk, blue book, green leaf), 2 sounds you can hear (e.g. fan hum, distant footsteps), and 1 physical contact point (e.g. your feet resting flat against the floor).",
        "3. Drop Your Shoulders and Soften Your Jaw: Anxiety naturally clamps your teeth and hunches your shoulders toward your ears. Consciously unclenching muscles signals to your amygdala that no physical threat is imminent.",
        "These practices do not permanently erase all nervous energy: they ground you enough to stay present and engage with dignity.",
      ],
      kmParagraphs: [
        "នៅពេលអ័រម៉ូន Adrenaline កើនឡើង ប្រព័ន្ធប្រសាទស្វ័យប្រវត្តិនឹងបញ្ចេញរោគសញ្ញារាងកាយភ្លាមៗ មុនពេលអ្នកមានពេលគិតពិចារណាបានដិតដល់។",
        "អ្នកអាចបញ្ជូនសញ្ញានៃសុវត្ថិភាពជីវសាស្ត្រត្រឡប់ទៅកាន់ខួរក្បាលវិញភ្លាមៗ តាមរយៈការសម្រួលរាងកាយ៖",
        "១. ការដកដង្ហើមវែងៗតាមពោះ៖ ដកដង្ហើមចូលតាមច្រមុះយឺតៗរយៈពេល ៤ វិនាទី ហើយបញ្ចេញខ្យល់តាមមាត់យឺតៗរយៈពេល ៦ វិនាទី។ ការបញ្ចេញខ្យល់ឱ្យវែងជាងដង្ហើមចូល ជួយដាស់ប្រព័ន្ធប្រសាទ Vagus Nerve និងបន្ថយចង្វាក់បេះដូងឱ្យស្ងប់ចុះ។",
        "២. ការតាំងអារម្មណ៍ ៣-២-១ (Grounding)៖ សម្លឹងមើលជុំវិញបន្ទប់ ហើយកត់សម្គាល់របស់ ៣ យ៉ាងដែលអ្នកមើលឃើញ (តុឈើ សៀវភៅពណ៌ខៀវ ស្លឹកឈើ) សំឡេង ២ យ៉ាងដែលអ្នកឮ (សំឡេងកង្ហារ សំឡេងជើងដើរ) និងអារម្មណ៍ប៉ះពាល់ ១ យ៉ាង (បាតជើងដែលជាន់ផ្ទាល់នឹងកម្រាលឥដ្ឋ)។",
        "៣. ទម្លាក់ស្មា និងបន្ធូរថ្គាម៖ ភាពថប់បារម្ភតែងតែធ្វើឱ្យអ្នកខាំធ្មេញ និងលើកស្មាឡើងលើដោយមិនដឹងខ្លួន។ ការបន្ធូរសាច់ដុំទាំងនេះ បញ្ជាក់ប្រាប់ខួរក្បាលថាគ្មានគ្រោះថ្នាក់នៅចំពោះមុខនោះឡើយ។",
        "ការអនុវត្តទាំងនេះ មិនមែនធ្វើឱ្យភាពភ័យខ្លាចបាត់ទាំងស្រុងនោះទេ៖ វាជួយឱ្យអ្នកមានលំនឹងគ្រប់គ្រាន់ ដើម្បីស្នាក់នៅចំពោះមុខ និងប្រាស្រ័យទាក់ទងដោយភាពថ្លៃថ្នូរ។",
      ],
      alertBox: {
        type: "tip",
        text: "AROM 1-Minute Breath: Before walking into a meeting, presentation, or classroom, tap '1-Minute Calming Breath' in your AROM app to steady your heart rate and ground your focus.",
        kmText:
          "ការដកដង្ហើម ១ នាទីលើ AROM៖ មុនពេលដើរចូលបន្ទប់ប្រជុំ បទបង្ហាញ ឬថ្នាក់រៀន សូមចុច '1-Minute Calming Breath' នៅក្នុងកម្មវិធី AROM ដើម្បីសម្រួលចង្វាក់បេះដូង និងប្រមូលស្មារតីឱ្យមូល។",
      },
      keyPoints: [
        "Slow diaphragmatic breathing directly stimulates the calming vagus nerve.",
        "The 3-2-1 sensory grounding pulls focus back into the present physical room.",
        "Releasing jaw and shoulder tension breaks the body's alarm cycle.",
      ],
      kmKeyPoints: [
        "ការដកដង្ហើមវែងៗតាមពោះ ជួយដាស់ប្រព័ន្ធប្រសាទឱ្យស្ងប់ចុះដោយផ្ទាល់។",
        "ការតាំងអារម្មណ៍ ៣-២-១ ទាញស្មារតីត្រឡប់មកកាន់បន្ទប់ជាក់ស្តែងនាពេលបច្ចុប្បន្ន។",
        "ការបន្ធូរថ្គាម និងទម្លាក់ស្មា ជួយកាត់ផ្តាច់សញ្ញាអាសន្នរបស់រាងកាយ។",
      ],
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "Stop Punishing Yourself After Social Interactions",
      kmTitle: "ការបញ្ឈប់ការស្តីបន្ទោសខ្លួនឯងក្រោយការជួបជុំ (Post-Event Rumination)",
      type: "reading",
      paragraphs: [
        "For many individuals, the most painful phase of social anxiety occurs after the event has already ended.",
        "You go home, lie in bed, and mentally replay every second: 'Why did I say that? Did they see my hands shake? They must think I was ridiculous.' Psychologists call this Post-Event Rumination [2, 3].",
        "The flaw with post-event rumination is that your memory is heavily distorted by anxiety. You magnify one awkward pause while completely deleting the forty minutes of pleasant, normal conversation that took place.",
        "Replace the internal interrogation with a Balanced Debrief [3]:",
        "1. What went well? Acknowledge courage: 'I went to the discussion, I stayed for twenty minutes, and I smiled at a colleague.'",
        "2. What did I learn? 'I learned that an awkward pause did not ruin the conversation.'",
        "3. What is one small thing I can practice next time? Pick one practical goal without self-criticism.",
        "Then, close the mental book. Most people are absorbed in their own lives and insecurities: they are not lying awake analyzing your sentences.",
      ],
      kmParagraphs: [
        "ចំពោះមនុស្សជាច្រើន ដំណាក់កាលដែលឈឺចាប់បំផុតនៃការថប់បារម្ភក្នុងសង្គម គឺកើតឡើងបន្ទាប់ពីការជួបជុំបានបញ្ចប់ទៅហើយ។",
        "អ្នកត្រឡប់ទៅផ្ទះ ទម្រេតខ្លួនលើគ្រែ ហើយគិតសារចុះសារឡើងនូវរាល់វិនាទីដែលបានកន្លងផុត៖ «ហេតុអ្វីខ្ញុំនិយាយពាក្យនោះ? តើគេឃើញដៃខ្ញុំញ័រទេ? ពួកគេច្បាស់ជាគិតថាខ្ញុំគួរឱ្យអស់សំណើចហើយ»។ អ្នកចិត្តសាស្រ្តហៅទម្លាប់នេះថា ការរំលឹកបន្ទោសខ្លួនឯងក្រោយព្រឹត្តិការណ៍ (Post-Event Rumination) [2, 3]។",
        "គុណវិបត្តិនៃទម្លាប់នេះ គឺការចងចាំរបស់អ្នកត្រូវបានបង្ខូចទ្រង់ទ្រាយដោយការថប់បារម្ភ។ អ្នកបានពង្រីកភាពទើសទាល់តែមួយវិនាទីឱ្យធំសម្បើម ខណៈពេលដែលបំភ្លេចចោលទាំងស្រុងនូវការសន្ទនាដ៏រីករាយ និងធម្មតារយៈពេល ៤០ នាទីមុននោះ។",
        "ជំនួសការសួរដេញដោលបន្ទោសខ្លួនឯង ដោយការវាយតម្លៃប្រកបដោយតុល្យភាព [3]៖",
        "១. តើមានចំណុចល្អអ្វីខ្លះ? ទទួលស្គាល់ភាពក្លាហានរបស់ខ្លួន៖ «ខ្ញុំបានទៅចូលរួមការពិភាក្សា ខ្ញុំស្នាក់នៅទីនោះបាន ២០ នាទី ហើយខ្ញុំបានញញឹមដាក់មិត្តរួមការងារ»។",
        "២. តើខ្ញុំបានរៀនសូត្រអ្វីខ្លះ? «ខ្ញុំបានដឹងថា ការស្ងាត់បន្តិចមិនបានបំផ្លាញការសន្ទនាទាំងមូលឡើយ»។",
        "៣. តើអ្វីជាចំណុចតូចមួយដែលខ្ញុំអាចហាត់នៅពេលក្រោយ? ជ្រើសរើសគោលដៅជាក់ស្តែងមួយ ដោយមិនបន្ទោសខ្លួនឯង។",
        "បន្ទាប់មក សូមបិទសៀវភៅគំនិតនេះចោលចុះ។ មនុស្សភាគច្រើនកំពុងរវល់នឹងជីវិត និងការព្រួយបារម្ភផ្ទាល់ខ្លួនរបស់គេ៖ គ្មាននរណាម្នាក់ដេកមិនលក់ដើម្បីអង្គុយវិភាគពាក្យសម្តីរបស់អ្នកនោះឡើយ។",
      ],
      keyPoints: [
        "Post-event rumination distorts memory by magnifying flaws and erasing successes [3].",
        "Conduct a 3-part debrief: what went well, what was learned, and what to practice next.",
        "Remember the spotlight effect: other people are focused on themselves, not scrutinizing you.",
      ],
      kmKeyPoints: [
        "ការរំលឹកបន្ទោសខ្លួនឯងធ្វើឱ្យការចងចាំខូចទ្រង់ទ្រាយ ដោយពង្រីកកំហុស និងលុបបំបាត់ភាពជោគជ័យ [3]។",
        "អនុវត្តការវាយតម្លៃ ៣ ចំណុច៖ អ្វីដែលធ្វើបានល្អ អ្វីដែលបានរៀន និងអ្វីដែលត្រូវហាត់បន្ត។",
        "ចងចាំពីឥទ្ធិពលចាំងពិល (Spotlight Effect)៖ អ្នកដទៃកំពុងខ្វល់ពីរឿងផ្ទាល់ខ្លួន មិនមែនអង្គុយតាមដានអ្នកឡើយ។",
      ],
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "When to Seek Professional Support",
      kmTitle: "ពេលវេលាដែលត្រូវស្វែងរកជំនួយពីអ្នកជំនាញ (When to Seek Help)",
      type: "reading",
      paragraphs: [
        "While self-guided tools and lifestyle habits build a wonderful foundation, social anxiety can sometimes feel too severe to navigate alone [1, 2].",
        "Consider connecting with a qualified therapist or psychologist if:",
        "• Fear or panic causes you to routinely avoid attending school, job interviews, or essential daily errands.",
        "• You spend days or weeks consumed by dread before a basic social situation.",
        "• The anxiety severely strains your friendships or isolates you from support networks.",
        "• You find yourself relying on alcohol or substances to feel confident in social settings.",
        "• Everyday self-help practices do not feel sufficient.",
        "Cognitive Behavioral Therapy (CBT) and Exposure Therapy conducted with a trained professional are proven clinical treatments with very high success rates [1, 2]. You do not have to wait until your life is crippled before reaching out.",
        "Seeking therapy is not a symptom of defeat: it is an investment in your personal freedom and emotional resilience.",
      ],
      kmParagraphs: [
        "ខណៈពេលដែលឧបករណ៍ជួយខ្លួនឯង និងទម្លាប់រស់នៅល្អៗបង្កើតបានជាគ្រឹះដ៏រឹងមាំ ការថប់បារម្ភក្នុងសង្គមក៏អាចមានកម្រិតធ្ងន់ធ្ងរដែលពិបាកដោះស្រាយតែម្នាក់ឯងផងដែរ [1, 2]។",
        "សូមពិចារណាភ្ជាប់ការប្រឹក្សាជាមួយអ្នកជំនាញចិត្តសាស្ត្រ ឬអ្នកព្យាបាល ប្រសិនបើ៖",
        "• ការភ័យខ្លាចធ្វើឱ្យអ្នកគេចវេះជាប្រចាំពីការទៅរៀន ការសម្ភាសន៍ការងារ ឬកិច្ចការចាំបាច់ប្រចាំថ្ងៃ។",
        "• អ្នកចំណាយពេលច្រើនថ្ងៃ ឬច្រើនសប្តាហ៍ភ័យព្រួយជាមុន ចំពោះការជួបជុំសាមញ្ញណាមួយ។",
        "• ការថប់បារម្ភប៉ះពាល់ខ្លាំងដល់មិត្តភាព ឬកាត់ផ្តាច់អ្នកចេញពីបណ្តាញសង្គមគាំទ្រ។",
        "• អ្នកពឹងផ្អែកលើគ្រឿងស្រវឹង ដើម្បីជួយឱ្យមានទំនុកចិត្តក្នុងពេលជួបជុំ។",
        "• យុទ្ធសាស្ត្រជួយខ្លួនឯងមិនគ្រប់គ្រាន់ដើម្បីដោះស្រាយស្ថានភាពនេះបាន។",
        "ការព្យាបាលបែប CBT និងការព្យាបាលតាមរយៈការប្រឈមមុខសន្សឹមៗជាមួយអ្នកជំនាញ គឺជាវិធីសាស្ត្រវេជ្ជសាស្ត្រដែលមានប្រសិទ្ធភាពខ្ពស់បំផុត [1, 2]។ អ្នកមិនចាំបាច់រង់ចាំដល់ជីវិតធ្លាក់ចូលក្នុងភាពទាល់ច្រក ទើបស្វែងរកជំនួយនោះទេ។",
        "ការស្វែងរកជំនួយពីអ្នកជំនាញ មិនមែនជាការចុះចាញ់នោះឡើយ៖ វាជាការវិនិយោគលើសេរីភាពផ្ទាល់ខ្លួន និងភាពរឹងមាំនៃផ្លូវចិត្តរបស់អ្នក។",
      ],
      alertBox: {
        type: "tip",
        text: "AROM Professional Care: On AROM, you can match in complete privacy with certified counselors and clinical psychologists experienced in CBT for social anxiety. Your sessions are strictly confidential.",
        kmText:
          "ការថែទាំពីអ្នកជំនាញ AROM៖ នៅលើ AROM អ្នកអាចភ្ជាប់ការប្រឹក្សាជាសម្ងាត់ទាំងស្រុង ជាមួយអ្នកប្រឹក្សា និងអ្នកជំនាញចិត្តសាស្ត្រដែលមានបទពិសោធន៍ព្យាបាល CBT សម្រាប់ការថប់បារម្ភក្នុងសង្គម។ ការសម្ងាត់របស់អ្នកត្រូវបានការពារយ៉ាងតឹងរ៉ឹងបំផុត។",
      },
      keyPoints: [
        "Professional therapy is recommended when social anxiety restricts education, career, or basic living [1, 2].",
        "CBT and exposure therapy offer structured, evidence-based roads to recovery.",
        "AROM enables private, confidential appointments with verified mental health experts.",
      ],
      kmKeyPoints: [
        "ការប្រឹក្សាជាមួយអ្នកជំនាញត្រូវបានណែនាំ នៅពេលការថប់បារម្ភរារាំងការសិក្សា អាជីព ឬការរស់នៅ [1, 2]។",
        "ការព្យាបាល CBT និងការប្រឈមមុខសន្សឹមៗ ផ្តល់នូវមាគ៌ាព្យាបាលផ្អែកលើវិទ្យាសាស្ត្រដ៏រឹងមាំ។",
        "AROM ផ្តល់ភាពងាយស្រួលក្នុងការកក់ការប្រឹក្សាជាសម្ងាត់ជាមួយអ្នកជំនាញសុខភាពផ្លូវចិត្ត។",
      ],
    },
    {
      id: 10,
      sectionNumber: 10,
      title: "Your Personal Practice: The Social Exposure Ladder",
      kmTitle: "ការអនុវត្តផ្ទាល់ខ្លួន៖ កាំជណ្ដើរនៃការប្រឈមមុខ (Personal Practice)",
      type: "reflection",
      paragraphs: [
        "Take a quiet moment to design your personal, step-by-step path to social confidence. You can reflect on these questions and write your answers privately in your personal AROM Journal:",
        "1. Which social situation triggers the most nervous tension for me right now?",
        "2. What specific catastrophic thought appears in my mind?",
        "3. What have I usually done in the past (avoidance, silence, looking at phone)?",
        "4. What is a realistic, balanced thought that I can carry with me instead?",
        "5. What is one small, level-3 exposure step I can intentionally practice this week?",
        "6. What encouraging words would I tell a friend facing this exact hesitation?",
        "There are no right or wrong answers. Every small step builds lasting resilience.",
      ],
      kmParagraphs: [
        "ឆ្លៀតពេលស្ងប់ស្ងាត់បន្តិច ដើម្បីរៀបចំមាគ៌ាផ្ទាល់ខ្លួនរបស់អ្នកឆ្ពោះទៅរកទំនុកចិត្តក្នុងសង្គម។ អ្នកអាចឆ្លុះបញ្ចាំងពីសំណួរទាំងនេះ ហើយកត់ត្រាចម្លើយជាឯកជននៅក្នុងកំណត់ហេតុ AROM របស់អ្នក៖",
        "១. តើស្ថានភាពសង្គមមួយណាដែលបង្កការភ័យខ្លាចខ្លាំងបំផុតសម្រាប់ខ្ញុំនៅពេលនេះ?",
        "២. តើគំនិតអវិជ្ជមានជាក់លាក់អ្វីខ្លះដែលផុសឡើងក្នុងក្បាលរបស់ខ្ញុំ?",
        "៣. តើកន្លងមកខ្ញុំតែងតែធ្វើអ្វី (ការគេចវេះ ការនៅស្ងៀម ការមើលទូរស័ព្ទ)?",
        "៤. តើគំនិតណាដែលមានតុល្យភាព និងស្របតាមការពិត ដែលខ្ញុំអាចយកមកជំនួសវិញ?",
        "៥. តើអ្វីជាជំហានតូចមួយកម្រិតទី ៣ ដែលខ្ញុំអាចហាត់អនុវត្តដោយស្ម័គ្រចិត្តក្នុងសប្តាហ៍នេះ?",
        "៦. តើខ្ញុំនឹងនិយាយពាក្យលើកទឹកចិត្តអ្វីខ្លះ ទៅកាន់មិត្តភក្តិដែលកំពុងជួបការស្ទាក់ស្ទើរដូចគ្នានេះ?",
        "គ្មានចម្លើយណាត្រូវ ឬខុសនោះទេ។ គ្រប់ជំហានតូចៗសុទ្ធតែកសាងភាពរឹងមាំយូរអង្វែង។",
      ],
      reflection: {
        question: "When you consider facing social situations, which approach feels most achievable for you right now?",
        kmQuestion: "នៅពេលអ្នកគិតដល់ការប្រឈមមុខនឹងស្ថានភាពសង្គម តើវិធីសាស្ត្រមួយណាដែលអ្នកយល់ថាអាចធ្វើទៅបានបំផុតនៅពេលនេះ?",
        options: [
          "Starting with gentle grounding breaths before entering a social setting",
          "Challenging anxious thoughts with the 3-Question balanced method",
          "Practicing a small level-3 exposure step like smiling or saying a simple hello",
          "Connecting with a professional therapist on AROM for structured CBT guidance",
        ],
        kmOptions: [
          "ការចាប់ផ្តើមដកដង្ហើមវែងៗដើម្បីតាំងលំនឹង មុនពេលចូលរួមការជួបជុំ",
          "ការចោទសួរ និងកែតម្រូវគំនិតអវិជ្ជមានតាមវិធីសាស្ត្រ ៣ សំណួរ",
          "ការហាត់ជំហានតូចៗកម្រិតទី ៣ ដូចជាការញញឹម ឬការនិយាយពាក្យសួស្តីសាមញ្ញ",
          "ការភ្ជាប់ការប្រឹក្សាជាមួយអ្នកជំនាញលើ AROM ដើម្បីទទួលបានការណែនាំតាមបែប CBT",
        ],
        feedbackMessage:
          "Thank you for honoring where you are. Remember: you do not have to eliminate every drop of nervousness before you can participate in life. Taking one small step while feeling nervous is true courage.",
        kmFeedbackMessage:
          "អរគុណដែលបានទទួលស្គាល់ស្ថានភាពជាក់ស្តែងរបស់ខ្លួនឯង។ ចូរចងចាំថា៖ អ្នកមិនចាំបាច់បំបាត់ភាពភ័យខ្លាចទាំងអស់ ទើបអាចរស់នៅក្នុងសង្គមបាននោះឡើយ។ ការបោះជំហានតូចមួយទាំងមានអារម្មណ៍ភ័យ គឺជាភាពក្លាហានពិតប្រាកដ។",
      },
      keyPoints: [
        "Personal reflection turns clinical concepts into an actionable exposure plan.",
        "A level-3 small step builds steady momentum without overwhelming your nervous system.",
        "Encouraging yourself with kindness replaces self-punishing habits.",
      ],
      kmKeyPoints: [
        "ការឆ្លុះបញ្ចាំងផ្ទាល់ខ្លួនបម្លែងទ្រឹស្តីទៅជាផែនការអនុវត្តជាក់ស្តែង។",
        "ជំហានតូចកម្រិត ៣ កសាងកម្លាំងចិត្តបន្តិចម្តងៗ ដោយមិនធ្វើឱ្យរាងកាយតក់ស្លុត។",
        "ការលើកទឹកចិត្តខ្លួនឯងដោយចិត្តមេត្តា ជួយជំនួសទម្លាប់បន្ទោសខ្លួនឯង។",
      ],
    },
    {
      id: 11,
      sectionNumber: 11,
      title: "Next Steps and Support on AROM",
      kmTitle: "ជំហានបន្ទាប់ និងការគាំទ្រនៅលើ AROM (Next Steps & Support)",
      type: "coping",
      paragraphs: [
        "Social anxiety can make ordinary interactions feel intimidating, but it does not get to decide who you are or what you achieve.",
        "You do not need to become the loudest voice in the room. You can take one small step at a time, question your catastrophic assumptions, and soothe physical jitters with gentle patience.",
        "On AROM, compassionate tools and clinical specialists are ready to support your progress:",
        "• AROM Private Journal: Design your personal exposure ladder, debrief conversations fairly, and record post-interaction wins in complete confidentiality.",
        "• AROM Calming Practices: Practice the 1-Minute Calming Breath or Grounding exercises before walking into social interactions.",
        "• AROM Verified Professional Care: Connect privately with licensed psychologists specializing in Cognitive Behavioral Therapy and social anxiety in Cambodia.",
        "• Crisis Emergency Support: If you or someone you know experiences severe distress, tap 'Get help now' in your Profile for instant crisis hotline contacts.",
        "You are allowed to be a work in progress. Take one small step today, and celebrate your quiet courage.",
      ],
      kmParagraphs: [
        "ការថប់បារម្ភក្នុងសង្គមអាចធ្វើឱ្យការប្រាស្រ័យទាក់ទងធម្មតាមានអារម្មណ៍ថាគួរឱ្យខ្លាច ប៉ុន្តែវាមិនអាចកំណត់ថាអ្នកជានរណា ឬអ្នកអាចសម្រេចអ្វីបាននោះឡើយ។",
        "អ្នកមិនចាំបាច់ក្លាយជាមនុស្សដែលនិយាយខ្លាំងជាងគេក្នុងបន្ទប់នោះទេ។ អ្នកអាចបោះជំហានតូចមួយម្តង ចោទសួរគំនិតអវិជ្ជមាន និងរំងាប់ភាពភ័យញាប់ញ័រក្នុងរាងកាយដោយចិត្តអត់ធ្មត់។",
        "នៅលើកម្មវិធី AROM ឧបករណ៍សុខុមាលភាព និងអ្នកជំនាញជាច្រើនបានត្រៀមខ្លួនរួចជាស្រេចដើម្បីគាំទ្រការរីកចម្រើនរបស់អ្នក៖",
        "• កំណត់ហេតុឯកជន AROM (Private Journal)៖ រៀបចំកាំជណ្ដើរនៃការប្រឈមមុខ វាយតម្លៃការសន្ទនាដោយយុត្តិធម៌ និងកត់ត្រាជោគជ័យតូចៗជាសម្ងាត់ទាំងស្រុង។",
        "• លំហាត់ស្ងប់ចិត្ត AROM (Practices)៖ អនុវត្តការដកដង្ហើមស្ងប់ចិត្ត ១ នាទី ឬការតាំងលំនឹងអារម្មណ៍ មុនពេលចូលរួមការជួបជុំសង្គម។",
        "• ការប្រឹក្សាជាមួយអ្នកជំនាញ AROM (Professional Care)៖ ភ្ជាប់ការប្រឹក្សាជាសម្ងាត់ជាមួយអ្នកជំនាញចិត្តសាស្ត្រដែលមានជំនាញក្នុងការព្យាបាល CBT និងការថប់បារម្ភក្នុងសង្គមនៅកម្ពុជា។",
        "• ជំនួយសង្គ្រោះបន្ទាន់ (Crisis Support)៖ ប្រសិនបើអ្នក ឬមនុស្សជុំវិញខ្លួនជួបវិបត្តិផ្លូវចិត្តធ្ងន់ធ្ងរ សូមចុច 'Get help now' ក្នុង Profile ដើម្បីទទួលបានទំនាក់ទំនងបន្ទាន់ភ្លាមៗ។",
        "អ្នកត្រូវបានអនុញ្ញាតឱ្យរីកចម្រើនសន្សឹមៗ។ ចាប់ផ្តើមបោះជំហានតូចមួយនៅថ្ងៃនេះ ហើយអបអរសាទរភាពក្លាហានស្ងៀមស្ងាត់របស់អ្នក។",
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
        "Progress is built through small, consistent, courageous steps [1, 2].",
        "AROM Journal and Calming Practices support you before and after social settings.",
        "CBT-trained psychologists on AROM provide private, clinical guidance when you need it.",
      ],
      kmKeyPoints: [
        "ការរីកចម្រើនត្រូវបានកសាងឡើងតាមរយៈជំហានតូចៗដែលក្លាហាន និងជាប់លាប់ [1, 2]។",
        "កំណត់ហេតុ និងលំហាត់ស្ងប់ចិត្តលើ AROM ជួយគាំទ្រអ្នកទាំងមុន និងក្រោយពេលជួបជុំ។",
        "អ្នកជំនាញផ្នែក CBT លើ AROM ផ្តល់ការប្រឹក្សាជាសម្ងាត់នៅពេលដែលអ្នកត្រូវការ។",
      ],
    },
  ],
};

export const REFERENCES_EXAM_ANXIETY: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "WHO",
    title: "World Health Organization: Doing What Matters in Times of Stress",
    url: "https://www.who.int/publications/i/item/9789240003927",
  },
  {
    id: 2,
    citation: "[2]",
    source: "NHS",
    title: "NHS: Tips to Help With Anxiety",
    url: "https://www.nhs.uk/mental-health/self-help/tips-and-support/",
  },
  {
    id: 3,
    citation: "[3]",
    source: "NIMH",
    title: "National Institute of Mental Health: Caring for Your Mental Health",
    url: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health",
  },
  {
    id: 4,
    citation: "[4]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia: Mental Health",
    url: "https://www.unicef.org/cambodia/mental-health",
  },
];

export const LESSON_EXAM_ANXIETY: Lesson = {
  id: "how-to-handle-anxiety-before-an-exam",
  title: "How to Handle Anxiety Before an Exam",
  kmTitle: "របៀបដោះស្រាយការថប់បារម្ភមុនពេលប្រឡង (How to Handle Anxiety Before an Exam)",
  subtitle: "Learn to calm physical jitters, organize focused study habits, and perform with quiet confidence",
  kmSubtitle: "រៀនរំងាប់ភាពភ័យញាប់ញ័រក្នុងរាងកាយ រៀបចំទម្លាប់រៀនសូត្រឱ្យមានប្រសិទ្ធភាព និងប្រឡងដោយទំនុកចិត្តស្ងប់ស្ងាត់",
  category: "Anxiety",
  duration: "8 min",
  kmDuration: "៨ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Practice",
  kmFormat: "ការអាន និងការអនុវត្ត (Reading & Practice)",
  isAvailable: true,
  image: "/mindguide/strategies.png",
  heroImage: "/mindguide/exam-anxiety-hero.jpg",
  description:
    "Master evidence-based strategies to manage academic stress, reset blank minds during tests, break the comparison habit, and anchor self-worth beyond exam scores.",
  kmDescription:
    "យល់ដឹងពីយុទ្ធសាស្ត្រផ្អែកលើវិទ្យាសាស្ត្រដើម្បីគ្រប់គ្រងសម្ពាធការសិក្សា ដោះស្រាយអាការគិតអ្វីមិនចេញពេលប្រឡង បញ្ឈប់ការប្រៀបធៀបខ្លួនឯង និងដឹងពីតម្លៃពិតដែលលើសពីពិន្ទុប្រឡង។",
  totalSections: 11,
  outcomes: [
    {
      en: "Understand why exam anxiety happens and how it affects Cambodian students during milestones like Bac II [1, 4]",
      km: "យល់ដឹងពីមូលហេតុនៃការថប់បារម្ភមុនពេលប្រឡង និងផលប៉ះពាល់លើសិស្សកម្ពុជាក្នុងពេលប្រឡងបាក់ឌុប [1, 4]",
    },
    {
      en: "Identify physical, emotional, cognitive, and behavioral signs of academic pressure [2, 3]",
      km: "សម្គាល់សញ្ញារាងកាយ អារម្មណ៍ គំនិត និងអាកប្បកិរិយានៃសម្ពាធការសិក្សា [2, 3]",
    },
    {
      en: "Practice slow diaphragmatic breathing to settle the nervous system before entering the exam room [1, 2]",
      km: "អនុវត្តការដកដង្ហើមវែងៗតាមពោះ ដើម្បីសម្រួលប្រព័ន្ធប្រសាទមុនពេលដើរចូលបន្ទប់ប្រឡង [1, 2]",
    },
    {
      en: "Construct a 3-step structured study plan with focused sprints and planned recovery breaks",
      km: "រៀបចំកាលវិភាគរៀនសូត្រ ៣ ជំហាន ដោយបែងចែកការរៀនជាវគ្គខ្លីៗ និងមានពេលសម្រាកច្បាស់លាស់",
    },
    {
      en: "Execute the 5-step in-exam reset protocol when your mind suddenly goes blank",
      km: "អនុវត្តវិធីសាស្ត្រ ៥ ជំហាន ដើម្បីទាញស្មារតីត្រឡប់មកវិញនៅពេលគិតអ្វីមិនចេញក្នុងបន្ទប់ប្រឡង",
    },
    {
      en: "Separate your fundamental human worth from grades and access confidential counseling on AROM [3, 4]",
      km: "បែងចែកតម្លៃផ្ទាល់ខ្លួនឱ្យដាច់ពីពិន្ទុប្រឡង និងភ្ជាប់ការប្រឹក្សាជាមួយអ្នកជំនាញលើ AROM [3, 4]",
    },
  ],
  references: REFERENCES_EXAM_ANXIETY,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "Understanding Exam Anxiety and Why It Happens",
      kmTitle: "ស្វែងយល់ពីការថប់បារម្ភមុនពេលប្រឡង (Why It Happens)",
      type: "reading",
      paragraphs: [
        "Have you ever felt your heart pounding before an exam? Perhaps your palms became clammy, your stomach knotted up, or your mind began looping: 'What if I fail? What if my mind goes blank?'",
        "These sensations are part of exam anxiety: the apprehension, worry, and physical tension experienced before or during an academic evaluation [1, 2].",
        "A small degree of nervousness is completely natural. In fact, mild arousal helps sharpen your alertness and motivates you to prepare. However, when anxiety becomes disproportionately intense, it interferes with your working memory, disrupts concentration, and causes sleepless nights.",
        "Exam anxiety stems from several common pressures [1, 4]:",
        "• Fear of failure and fear of the unknown.",
        "• Parental, family, and community expectations.",
        "• High-stakes consequences: in Cambodia, milestone examinations such as the national Grade 12 Bac II carry immense weight for university entrance and future career paths.",
        "• Comparing yourself with classmates who seem far ahead.",
        "• Past academic setbacks that you fear repeating.",
        "Understanding where this tension comes from helps you respond with compassion rather than panic. An exam is an important milestone, but it does not determine your worth as a human being.",
      ],
      kmParagraphs: [
        "តើអ្នកធ្លាប់មានអារម្មណ៍ថាបេះដូងលោតញាប់ខុសពីធម្មតាមុនពេលប្រឡងដែរឬទេ? ប្រហែលជាបាតដៃរបស់អ្នកចេញញើស ចុកពោះ ឬខួរក្បាលចាប់ផ្តើមគិតដដែលៗថា៖ «ចុះបើខ្ញុំធ្លាក់? ចុះបើខ្ញុំគិតអ្វីមិនចេញ?»",
        "អារម្មណ៍ទាំងនេះគឺជាផ្នែកមួយនៃការថប់បារម្ភមុនពេលប្រឡង (Exam Anxiety)៖ ភាពភ័យព្រួយ និងភាពតានតឹងក្នុងរាងកាយដែលកើតឡើងមុន ឬក្នុងពេលប្រឡង [1, 2]។",
        "ការភ័យបន្តិចបន្តួចគឺជារឿងធម្មតាទាំងស្រុង។ តាមពិតទៅ ភាពប្រុងប្រយ័ត្នកម្រិតស្រាលជួយដាស់ស្មារតីឱ្យមុតស្រួច និងជំរុញឱ្យអ្នកខិតខំត្រៀមខ្លួន។ ប៉ុន្តែនៅពេលដែលការថប់បារម្ភកើនឡើងខ្លាំងជ្រុល វាអាចរំខានដល់ការចងចាំ ធ្វើឱ្យបាត់បង់ការផ្ចង់អារម្មណ៍ និងធ្វើឱ្យគេងមិនលក់។",
        "ការថប់បារម្ភមុនពេលប្រឡងកើតឡើងមកពីសម្ពាធទូទៅមួយចំនួន [1, 4]៖",
        "• ការភ័យខ្លាចការបរាជ័យ និងភាពមិនច្បាស់លាស់។",
        "• ការរំពឹងទុករបស់ឪពុកម្តាយ ក្រុមគ្រួសារ និងសហគមន៍។",
        "• ផលវិបាកសំខាន់ៗ៖ នៅកម្ពុជា ការប្រឡងធំៗដូចជាការប្រឡងសញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ (បាក់ឌុប) មានឥទ្ធិពលយ៉ាងខ្លាំងលើឱកាសចូលរៀននៅសាកលវិទ្យាល័យ និងអាជីពនាពេលអនាគត។",
        "• ការប្រៀបធៀបខ្លួនឯងជាមួយមិត្តរួមថ្នាក់ដែលហាក់ដូចជារៀនពូកែជាង។",
        "• ការចងចាំពីលទ្ធផលមិនល្អកាលពីមុន ដែលធ្វើឱ្យខ្លាចប្រវត្តិសាស្ត្រកើតឡើងវិញ។",
        "ការយល់ដឹងពីប្រភពនៃភាពតានតឹងនេះ ជួយឱ្យអ្នកឆ្លើយតបដោយក្តីមេត្តាចំពោះខ្លួនឯង ជាជាងការភ័យស្លន់ស្លោ។ ការប្រឡងគឺជាព្រឹត្តិការណ៍សំខាន់មួយ ប៉ុន្តែវាមិនអាចកំណត់តម្លៃទាំងមូលនៃជីវិតរបស់អ្នកនោះឡើយ។",
      ],
      keyPoints: [
        "Mild nervous energy sharpens focus, but intense anxiety blocks working memory [1, 2].",
        "In Cambodia, high-stakes exams like Bac II create immense family and academic pressure [4].",
        "An exam evaluates specific academic skills on a single day, not your whole character.",
      ],
      kmKeyPoints: [
        "ការភ័យកម្រិតស្រាលជួយបង្កើនការផ្ចង់ស្មារតី ប៉ុន្តែការថប់បារម្ភខ្លាំងពេកនឹងបិទខ្ទប់ការចងចាំ [1, 2]។",
        "នៅកម្ពុជា ការប្រឡងធំៗដូចជាបាក់ឌុប បង្កើតនូវសម្ពាធគ្រួសារ និងការសិក្សាដ៏ធំធេង [4]។",
        "ការប្រឡងគ្រាន់តែវាស់ស្ទង់ចំណេះដឹងលើមុខវិជ្ជាមួយចំនួនក្នុងមួយថ្ងៃប៉ុណ្ណោះ មិនមែនគុណតម្លៃរបស់អ្នកឡើយ។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "Recognizing the Signs of Exam Anxiety",
      kmTitle: "ការសម្គាល់សញ្ញានៃការថប់បារម្ភ (Recognizing the Signs)",
      type: "reading",
      paragraphs: [
        "Exam anxiety affects four distinct domains of your wellbeing [2, 3]:",
        "1. Physical Reactions: Fast heart rate, clammy palms, tension headaches, nausea or stomach cramps, tight neck and shoulder muscles, and restless insomnia.",
        "2. Emotional Reactions: Overwhelm, impatience, irritability with family, dread when seeing textbooks, and feeling incapable of relaxing.",
        "3. Cognitive Reactions: Thinking 'I will definitely fail', assuming you will forget everything the moment you sit down, imagining catastrophe, and mental paralysis where words on the page stop making sense.",
        "4. Behavioral Reactions: Procrastinating because studying feels overwhelming, repeatedly checking how far friends have studied, cramming without eating or resting, or escaping into endless phone scrolling.",
        "Experiencing these signs does not mean you have a disorder. It simply indicates that your internal alarm is ringing too loudly.",
      ],
      kmParagraphs: [
        "ការថប់បារម្ភមុនពេលប្រឡងជះឥទ្ធិពលលើទិដ្ឋភាព ៤ យ៉ាងនៃសុខុមាលភាពរបស់អ្នក [2, 3]៖",
        "១. ប្រតិកម្មរាងកាយ៖ បេះដូងលោតញាប់ បាតដៃចេញញើស ឈឺក្បាល ចុកពោះ តឹងសាច់ដុំកនិងស្មា និងការគេងមិនលក់។",
        "២. ប្រតិកម្មអារម្មណ៍៖ អារម្មណ៍ធុញថប់ខ្លាំង ឆាប់ខឹងមួម៉ៅជាមួយគ្រួសារ ភ័យខ្លាចពេលឃើញសៀវភៅ និងមិនអាចសម្រាកចិត្តបាន។",
        "៣. ប្រតិកម្មគំនិត៖ គិតថា «ខ្ញុំច្បាស់ជាធ្លាក់ហើយ» គិតថាខ្លួនឯងនឹងភ្លេចអ្វីៗទាំងអស់ពេលអង្គុយប្រឡង និងការស្ពឹកស្រពន់ខួរក្បាលរហូតដល់អានអក្សរមិនយល់។",
        "៤. ប្រតិកម្មអាកប្បកិរិយា៖ ការពន្យារពេលរៀនដោយសារធុញថប់ខ្លាំង ការតាមសួរមិត្តភក្តិដដែលៗថាគេរៀនដល់ណា ការទន្ទេញទាំងយប់ដោយមិនញ៉ាំបាយសម្រាក ឬការគេចវេះដោយការចុចទូរស័ព្ទមិនឈប់។",
        "ការមានសញ្ញាទាំងនេះ មិនមែនមានន័យថាអ្នកមានជំងឺផ្លូវចិត្តនោះទេ។ វាគ្រាន់តែជាសញ្ញាបញ្ជាក់ថា ប្រព័ន្ធរោទ៍អាសន្នខាងក្នុងរបស់អ្នកកំពុងបន្លឺឡើងខ្លាំងពេកប៉ុណ្ណោះ។",
      ],
      keyPoints: [
        "Exam anxiety impacts physical sensations, emotions, thinking patterns, and study habits [2, 3].",
        "Procrastination is often a symptom of overwhelming anxiety rather than laziness.",
        "Noticing these indicators allows you to apply calming tools before panic sets in.",
      ],
      kmKeyPoints: [
        "ការថប់បារម្ភប៉ះពាល់ដល់រាងកាយ អារម្មណ៍ របៀបគិត និងទម្លាប់រៀនសូត្រ [2, 3]។",
        "ការពន្យារពេលច្រើនតែជាសញ្ញានៃការថប់បារម្ភខ្លាំង មិនមែនមកពីភាពខ្ជិលច្រអូសនោះឡើយ។",
        "ការដឹងខ្លួនទាន់ពេលវេលា ជួយឱ្យអ្នកអាចប្រើប្រាស់វិធីសាស្ត្ររំងាប់ចិត្ត មុនពេលការភ័យស្លន់ស្លោមកដល់។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Somatic Calming: Regulate Your Body and Breathing",
      kmTitle: "ការដកដង្ហើម និងការសម្រួលរាងកាយ (Somatic & Breath Calming)",
      type: "reading",
      paragraphs: [
        "When you feel anxious about an exam, your autonomic nervous system reacts as if you are facing a physical predator. Breathing becomes shallow and rapid, starving the brain of balanced oxygen.",
        "You can instantly send a biological safety signal to your nervous system with slow diaphragmatic breathing [1, 2]:",
        "Step 1: Sit comfortably in your study chair or outside the exam hall with your feet flat on the floor.",
        "Step 2: Drop your shoulders down and gently unclench your jaw.",
        "Step 3: Inhale gently through your nose for a count of 4 seconds, feeling your lower belly expand.",
        "Step 4: Exhale slowly and smoothly through your mouth for a count of 6 seconds, like blowing out a candle gently.",
        "Step 5: Repeat this sequence for two minutes.",
        "Extending the exhale directly triggers the parasympathetic vagus nerve, which slows your heart rate, relaxes trembling muscles, and restores oxygen flow to the prefrontal cortex where memory recall occurs.",
      ],
      kmParagraphs: [
        "នៅពេលអ្នកមានអារម្មណ៍ថប់បារម្ភនឹងការប្រឡង ប្រព័ន្ធប្រសាទស្វ័យប្រវត្តិនឹងមានប្រតិកម្មដូចជាអ្នកកំពុងជួបសត្វសាហាវដូច្នោះដែរ។ ការដកដង្ហើមក្លាយជាដង្ហើមខ្លីៗ និងញាប់ ដែលធ្វើឱ្យខួរក្បាលខ្វះអុកស៊ីសែនសមស្រប។",
        "អ្នកអាចបញ្ជូនសញ្ញានៃសុវត្ថិភាពជីវសាស្ត្រទៅកាន់ប្រព័ន្ធប្រសាទវិញភ្លាមៗ តាមរយៈការដកដង្ហើមវែងៗតាមពោះ [1, 2]៖",
        "ជំហានទី ១៖ អង្គុយឱ្យស្រួលបួលលើកៅអីរៀន ឬនៅមុខបន្ទប់ប្រឡង ដោយដាក់បាតជើងឱ្យស្មើនឹងកម្រាល។",
        "ជំហានទី ២៖ ទម្លាក់ស្មាចុះក្រោម ហើយបន្ធូរថ្គាមដែលកំពុងខាំតឹង។",
        "ជំហានទី ៣៖ ដកដង្ហើមចូលតាមច្រមុះយឺតៗរាប់ ៤ វិនាទី ដោយឱ្យពោះប៉ោងឡើងបន្តិច។",
        "ជំហានទី ៤៖ បញ្ចេញខ្យល់តាមមាត់យឺតៗរាប់ ៦ វិនាទី ដូចជាការផ្លុំពន្លត់ទៀនដោយថ្នមៗ។",
        "ជំហានទី ៥៖ ធ្វើលំហាត់ដកដង្ហើមនេះសារឡើងវិញរយៈពេល ២ នាទី។",
        "ការបញ្ចេញខ្យល់ឱ្យវែងជាងដង្ហើមចូល ជួយដាស់ប្រព័ន្ធប្រសាទ Parasympathetic Vagus Nerve ដែលជួយបន្ថយចង្វាក់បេះដូង រំងាប់ការញ័រនៃសាច់ដុំ និងបង្កើនលំហូរអុកស៊ីសែនទៅកាន់ខួរក្បាលផ្នែកមុខ ដែលជាកន្លែងទាញយកការចងចាំមកប្រើប្រាស់។",
      ],
      alertBox: {
        type: "tip",
        text: "AROM 1-Minute Breath: Before walking into your exam room, open your AROM app and practice the '1-Minute Calming Breath' to reset your mental focus.",
        kmText:
          "ការដកដង្ហើម ១ នាទីលើ AROM៖ មុនពេលដើរចូលបន្ទប់ប្រឡង សូមបើកកម្មវិធី AROM ហើយអនុវត្ត '1-Minute Calming Breath' ដើម្បីប្រមូលស្មារតី និងជួយឱ្យខួរក្បាលភ្លឺថ្លា។",
      },
      keyPoints: [
        "Slow diaphragmatic breathing with an extended exhale triggers the biological relaxation response [1, 2].",
        "Relaxing your jaw and dropping your shoulders cuts off tension feedback loops.",
        "Use this technique while sitting at your exam desk before the question papers are distributed.",
      ],
      kmKeyPoints: [
        "ការដកដង្ហើមវែងៗតាមពោះដោយបញ្ចេញខ្យល់យឺតៗ ជួយដាស់ប្រតិកម្មសម្រាកនៃរាងកាយ [1, 2]។",
        "ការបន្ធូរថ្គាម និងទម្លាក់ស្មា ជួយកាត់ផ្តាច់សញ្ញាអាសន្ននៃភាពតានតឹង។",
        "ប្រើប្រាស់វិធីសាស្ត្រនេះពេលអង្គុយនៅតុប្រឡង មុនពេលក្រដាសប្រឡងត្រូវបានចែកជូន។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "Make a Study Plan Instead of Panicking",
      kmTitle: "ការរៀបចំកាលវិភាគរៀនបែបស្ថាបនា (Structured Study Plan)",
      type: "quiz",
      paragraphs: [
        "Anxiety flourishes in ambiguity. Staring at an enormous stack of textbooks and thinking, 'I must learn all of chemistry today' triggers cognitive overwhelm and panic.",
        "Transform paralysis into progress with the 3-Step Study Method [1, 2]:",
        "Step 1: Identify your high-yield priorities. List the chapters and core concepts that appear most frequently on past exams and that you do not yet understand thoroughly.",
        "Step 2: Set bite-sized, actionable goals. Instead of broad intentions like 'Study Biology', define specific tasks: 'Summarize 1 cell biology diagram, solve 5 practice questions, and correct my mistakes.'",
        "Step 3: Use structured intervals with planned recovery. Study in focused sprints of 25 to 30 minutes, followed by a mandatory 5-minute break to stretch, drink water, and rest your eyes.",
        "Remember: A study schedule is a flexible compass, not a punishment. If you fall behind, adapt the plan rather than declaring defeat.",
      ],
      kmParagraphs: [
        "ការថប់បារម្ភតែងតែរីកធំធាត់នៅពេលដែលគ្មានភាពច្បាស់លាស់។ ការសម្លឹងមើលគំនរសៀវភៅដ៏ក្រាស់ ហើយគិតថា «ខ្ញុំត្រូវតែរៀនចប់គីមីទាំងអស់នៅថ្ងៃនេះ» នឹងធ្វើឱ្យខួរក្បាលស្ទះ និងភ័យស្លន់ស្លោ។",
        "បម្លែងការភ័យខ្លាចទៅជាសកម្មភាពជាក់ស្តែង តាមរយៈវិធីសាស្ត្ររៀនសូត្រ ៣ ជំហាន [1, 2]៖",
        "ជំហានទី ១៖ កំណត់អាទិភាពសំខាន់ៗ។ កត់ត្រាមេរៀន និងរូបមន្តគ្រឹះដែលតែងតែចេញប្រឡងញឹកញាប់ក្នុងវិញ្ញាសាចាស់ៗ ហើយដែលអ្នកមិនទាន់យល់ច្បាស់។",
        "ជំហានទី ២៖ កំណត់គោលដៅតូចៗជាក់ស្តែង។ ជំនួសឱ្យការនិយាយថា «ត្រូវរៀនជីវវិទ្យា» សូមកំណត់ឱ្យជាក់លាក់៖ «សង្ខេបដ្យាក្រាមកោសិកា ១ ធ្វើលំហាត់អនុវត្ត ៥ និងកែកំហុសដែលខុស»។",
        "ជំហានទី ៣៖ ប្រើប្រាស់ពេលវេលារៀនខ្លីៗ និងមានពេលសម្រាក។ រៀនផ្ចង់អារម្មណ៍រយៈពេល ២៥ ទៅ ៣០ នាទី បន្ទាប់មកត្រូវតែសម្រាក ៥ នាទីដើម្បីពត់ដៃពត់ជើង ញ៉ាំទឹក និងសម្រាកភ្នែក។",
        "ចងចាំថា៖ កាលវិភាគរៀនសូត្រគឺជាត្រីវិស័យសម្រាប់ណែនាំផ្លូវ មិនមែនជាទណ្ឌកម្មនោះឡើយ។ ប្រសិនបើអ្នករៀនមិនទាន់តាមផែនការ សូមកែសម្រួលវាឡើងវិញ ជាជាងការគិតថាខ្លួនឯងបរាជ័យ។",
      ],
      quiz: {
        question: "Which of the following revision strategies is most effective for reducing exam anxiety and improving memory retention?",
        kmQuestion: "តើយុទ្ធសាស្ត្ររំលឹកមេរៀនមួយណាខាងក្រោម ដែលមានប្រសិទ្ធភាពបំផុតក្នុងការកាត់បន្ថយការថប់បារម្ភ និងជួយឱ្យចាំមេរៀនបានល្អ?",
        options: [
          {
            id: "opt-1",
            text: "Cramming continuously for 10 hours overnight without taking any breaks",
            kmText: "ការទន្ទេញជាប់គ្នារយៈពេល ១០ ម៉ោងពេញមួយយប់ ដោយមិនសម្រាកទាល់តែសោះ",
            isCorrect: false,
          },
          {
            id: "opt-2",
            text: "Breaking study material into small 25-minute focused tasks with scheduled breaks to test recall",
            kmText: "ការបែងចែកមេរៀនជាកិច្ចការតូចៗរយៈពេល ២៥ នាទី និងមានពេលសម្រាកច្បាស់លាស់ដើម្បីសាកល្បងការចងចាំ",
            isCorrect: true,
          },
          {
            id: "opt-3",
            text: "Constantly messaging classmates to ask how many chapters they have mastered",
            kmText: "ការផ្ញើសារសួរមិត្តរួមថ្នាក់មិនឈប់ ដើម្បីដឹងថាគេរៀនចប់ប៉ុន្មានមេរៀនហើយ",
            isCorrect: false,
          },
          {
            id: "opt-4",
            text: "Avoiding reviewing difficult subjects entirely to keep from feeling nervous",
            kmText: "ការគេចវេះមិនមើលមុខវិជ្ជាពិបាកៗទាល់តែសោះ ដើម្បីកុំឱ្យមានអារម្មណ៍ភ័យ",
            isCorrect: false,
          },
        ],
        explanation:
          "Correct. Breaking study sessions into 25-minute focused blocks with breaks (such as the Pomodoro technique) prevents cognitive exhaustion, builds steady confidence, and consolidates memory [1, 2].",
        kmExplanation:
          "ត្រឹមត្រូវណាស់។ ការបែងចែកការរៀនជាវគ្គខ្លីៗ ២៥ នាទី និងមានពេលសម្រាក (ដូចជាវិធីសាស្ត្រ Pomodoro) ជួយការពារការហត់នឿយខួរក្បាល កសាងទំនុកចិត្តសន្សឹមៗ និងពង្រឹងការចងចាំបានល្អ [1, 2]។",
      },
      keyPoints: [
        "Chunking tasks into 25-minute intervals prevents mental exhaustion [1, 2].",
        "Focus on high-yield priorities and active recall rather than passive rereading.",
        "Scheduled breaks are essential cognitive recovery periods, not wasted time.",
      ],
      kmKeyPoints: [
        "ការបែងចែកកិច្ចការជារយៈពេល ២៥ នាទី ការពារការអស់កម្លាំងខួរក្បាល [1, 2]។",
        "ផ្តោតលើមេរៀនអាទិភាព និងការអនុវត្តលំហាត់ជាក់ស្តែង ជាជាងការគ្រាន់តែអានមើលឡើងវិញ។",
        "ការសម្រាកតាមកាលកំណត់ គឺជាពេលវេលាស្តារថាមពលខួរក្បាលដ៏ចាំបាច់ មិនមែនជាការខ្ជះខ្ជាយពេលឡើយ។",
      ],
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "Challenging Negative Thoughts",
      kmTitle: "ការកែតម្រូវគំនិតអវិជ្ជមានអំពីការប្រឡង (Cognitive Reframing)",
      type: "reading",
      paragraphs: [
        "Under exam stress, our minds tend to generate catastrophic predictions and treat them as guaranteed facts.",
        "For instance, when thinking: 'If I fail this exam, my entire future is destroyed.'",
        "Examine that assumption with four gentle reality checks [1, 2]:",
        "1. Do I know for absolute certain that this worst-case scenario will happen?",
        "2. Am I focusing only on catastrophe while ignoring all the preparation I have done?",
        "3. What would I say to comfort and encourage a close friend who had this exact worry?",
        "4. What is one practical, constructive action I can take right now to help myself?",
        "Practice reframing your common exam thoughts into realistic balance:",
        "• Anxious Thought: 'I must get a perfect score or I am a failure.'",
        "• Balanced Thought: 'I will aim to do my best, but perfection is never required. One score does not define my intelligence.'",
        "• Anxious Thought: 'Everyone else is far better prepared than me.'",
        "• Balanced Thought: 'I cannot know what others are feeling inside. I will focus on my own revision one topic at a time.'",
        "• Anxious Thought: 'If my mind goes blank on one question, I will fail everything.'",
        "• Balanced Thought: 'One difficult question does not ruin an entire paper. I can skip it and return to it later.'",
      ],
      kmParagraphs: [
        "នៅក្រោមសម្ពាធនៃការប្រឡង ចិត្តរបស់យើងតែងតែបង្កើតនូវការទស្សន៍ទាយរឿងអាក្រក់បំផុត ហើយចាត់ទុកវាថាជាការពិតដែលត្រូវតែកើតឡើង។",
        "ឧទាហរណ៍ នៅពេលគិតថា៖ «ប្រសិនបើខ្ញុំធ្លាក់ការប្រឡងនេះ អនាគតទាំងមូលរបស់ខ្ញុំនឹងត្រូវបំផ្លាញ»។",
        "សូមពិនិត្យមើលការសន្មតនោះ ដោយសំណួរស្ទង់ការពិត ៤ យ៉ាង [1, 2]៖",
        "១. តើខ្ញុំដឹងច្បាស់ ១០០% ថាស្ថានភាពអាក្រក់បំផុតនោះពិតជានឹងកើតឡើងមែនឬ?",
        "២. តើខ្ញុំកំពុងផ្តោតតែលើរឿងបរាជ័យ ដោយបំភ្លេចចោលរាល់ការខិតខំប្រឹងប្រែងដែលខ្ញុំបានធ្វើកន្លងមកមែនទេ?",
        "៣. តើខ្ញុំនឹងនិយាយពាក្យលើកទឹកចិត្តបែបណា ទៅកាន់មិត្តភក្តិជិតស្និទ្ធដែលមានការព្រួយបារម្ភបែបនេះដែរ?",
        "៤. តើអ្វីជាសកម្មភាពជាក់ស្តែងមួយដែលខ្ញុំអាចធ្វើបាននៅពេលនេះ ដើម្បីជួយខ្លួនឯង?",
        "ហាត់កែប្រែគំនិតថប់បារម្ភទូទៅ ឱ្យមានតុល្យភាពស្របតាមការពិត៖",
        "• គំនិតថប់បារម្ភ៖ «ខ្ញុំត្រូវតែបានពិន្ទុពេញ បើមិនដូច្នោះទេខ្ញុំជាមនុស្សបរាជ័យ»។",
        "• គំនិតមានតុល្យភាព៖ «ខ្ញុំនឹងប្រឹងប្រែងឱ្យអស់ពីលទ្ធភាព ប៉ុន្តែភាពឥតខ្ចោះមិនមែនជារឿងចាំបាច់ឡើយ។ ពិន្ទុមួយមិនអាចកំណត់ភាពឆ្លាតវៃរបស់ខ្ញុំបានទេ»។",
        "• គំនិតថប់បារម្ភ៖ «អ្នកដទៃរៀនពូកែ និងត្រៀមខ្លួនបានល្អជាងខ្ញុំឆ្ងាយណាស់»។",
        "• គំនិតមានតុល្យភាព៖ «ខ្ញុំមិនអាចដឹងពីអ្វីដែលអ្នកដទៃមានអារម្មណ៍ក្នុងចិត្តនោះទេ។ ខ្ញុំនឹងផ្តោតលើការរៀនសូត្ររបស់ខ្ញុំម្តងមួយមេរៀន»។",
        "• គំនិតថប់បារម្ភ៖ «បើខ្ញុំគិតមិនចេញលើសំណួរមួយ ខ្ញុំច្បាស់ជាធ្លាក់ទាំងអស់»។",
        "• គំនិតមានតុល្យភាព៖ «សំណួរពិបាកមួយមិនអាចបំផ្លាញក្រដាសប្រឡងទាំងមូលបានទេ។ ខ្ញុំអាចរំលងវា ហើយត្រឡប់មកធ្វើវានៅពេលក្រោយ»។",
      ],
      keyPoints: [
        "Catastrophic predictions assume the worst outcome without objective proof [1, 2].",
        "Replace perfectionism with balanced, fair, and self-compassionate statements.",
        "Focus on what is within your control right now: your preparation and attitude.",
      ],
      kmKeyPoints: [
        "ការទស្សន៍ទាយរឿងអាក្រក់គ្រាន់តែជាការភ័យខ្លាច ដោយគ្មានភស្តុតាងជាក់ស្តែងឡើយ [1, 2]។",
        "ជំនួសការទាមទារភាពល្អឥតខ្ចោះ ដោយការគិតប្រកបដោយតុល្យភាព និងការយល់ចិត្តខ្លួនឯង។",
        "ផ្តោតលើអ្វីដែលអ្នកអាចគ្រប់គ្រងបាននៅពេលនេះ៖ ការរៀបចំខ្លួន និងការខិតខំប្រឹងប្រែង។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "Caring for Your Body and Sleep",
      kmTitle: "ការថែទាំរាងកាយ និងដំណេកមុនថ្ងៃប្រឡង (Body & Sleep Care)",
      type: "reading",
      paragraphs: [
        "Your brain is a biological organ: its ability to recall complex formulas and construct essays depends entirely on the physical state of your body.",
        "Many students fall into the trap of sacrificing sleep for all-night cramming. Research shows that sleep deprivation impairs memory consolidation, slows down processing speed by up to 40%, and spikes cortisol levels [2, 3]. An all-nighter guarantees higher anxiety and slower thinking in the exam hall.",
        "Protect your physical engine in the days leading up to the test:",
        "• Prioritize 7 to 8 hours of sleep: Sleep is when your brain organizes and cements what you studied during the day into long-term memory [3].",
        "• Fuel with regular, balanced meals: Complex carbohydrates, proteins, and fresh fruit provide steady glucose to your brain, preventing energy crashes.",
        "• Hydrate with clean water: Mild dehydration reduces cognitive speed and causes headaches.",
        "• Limit high caffeine and energy drinks: Excessive caffeine triggers heart palpitations, hand tremors, and restlessness that mimic panic attacks.",
        "• Move your body: A brief 15-minute walk in fresh air clears mental cobwebs and dissipates built-up muscle tension.",
      ],
      kmParagraphs: [
        "ខួរក្បាលរបស់អ្នកគឺជាសរីរាង្គជីវសាស្ត្រមួយ៖ សមត្ថភាពក្នុងការចងចាំរូបមន្តស្មុគស្មាញ និងការសរសេរតែងសេចក្តី អាស្រ័យទាំងស្រុងលើសុខភាពរាងកាយរបស់អ្នក។",
        "សិស្សជាច្រើនតែងតែធ្លាក់ចូលទៅក្នុងអន្ទាក់នៃការលះបង់ការគេង ដើម្បីទន្ទេញមេរៀនពេញមួយយប់។ ការស្រាវជ្រាវបង្ហាញថា ការអត់គេងបំផ្លាញដំណើរការចងចាំមេរៀន បន្ថយល្បឿននៃការគិតរហូតដល់ ៤០% និងបង្កើនអ័រម៉ូនតានតឹង Cortisol យ៉ាងខ្លាំង [2, 3]។ ការទន្ទេញពេញមួយយប់ ធានាថានឹងធ្វើឱ្យអ្នកកាន់តែភ័យ និងគិតអ្វីមិនចេញនៅក្នុងបន្ទប់ប្រឡង។",
        "ថែរក្សារាងកាយរបស់អ្នកនៅក្នុងថ្ងៃជិតប្រឡង៖",
        "• គេងឱ្យបាន ៧ ទៅ ៨ ម៉ោងជារៀងរាល់យប់៖ ពេលគេងលក់ គឺជាពេលដែលខួរក្បាលរៀបចំ និងចាក់សោរចំណេះដឹងដែលបានរៀន ចូលទៅក្នុងការចងចាំរយៈពេលវែង [3]។",
        "• ញ៉ាំអាហារទៀងទាត់ និងមានជីវជាតិ៖ អាហារដែលមានជីវជាតិ និងផ្លែឈើស្រស់ ផ្តល់ជាតិស្ករថាមពលជាប់លាប់ដល់ខួរក្បាល ការពារកុំឱ្យអស់កម្លាំងល្ហិតល្ហៃ។",
        "• ញ៉ាំទឹកឱ្យបានគ្រប់គ្រាន់៖ ការខ្វះជាតិទឹកកម្រិតស្រាល ធ្វើឱ្យការគិតយឺត និងបង្កឱ្យឈឺក្បាល។",
        "• កាត់បន្ថយកាហ្វេ និងភេសជ្ជៈប៉ូវកម្លាំងច្រើនជ្រុល៖ ជាតិកាហ្វេអ៊ីនច្រើនពេក ធ្វើឱ្យបេះដូងលោតញាប់ ញ័រដៃ និងមានអារម្មណ៍ភ័យខ្លាចដូចការស្លន់ស្លោ។",
        "• ធ្វើចលនារាងកាយ៖ ការដើរលំហែកាយ ១៥ នាទីក្នុងខ្យល់អាកាសបរិសុទ្ធ ជួយឱ្យខួរក្បាលស្រឡះ និងរំសាយភាពតានតឹងនៃសាច់ដុំ។",
      ],
      keyPoints: [
        "All-night cramming severely damages working memory, processing speed, and focus [2, 3].",
        "Sleep is the biological phase where short-term study notes transform into durable memories.",
        "Steady meals, hydration, and moderate caffeine protect your physiological resilience.",
      ],
      kmKeyPoints: [
        "ការទន្ទេញពេញមួយយប់ដោយមិនគេង បំផ្លាញការចងចាំ ល្បឿននៃការគិត និងការផ្ចង់អារម្មណ៍ [2, 3]។",
        "ដំណេកគឺជាពេលវេលាជីវសាស្ត្រដែលខួរក្បាលបម្លែងចំណេះដឹងឱ្យក្លាយជាការចងចាំយូរអង្វែង។",
        "ការញ៉ាំអាហារទៀងទាត់ ការញ៉ាំទឹក និងការកាត់បន្ថយកាហ្វេអ៊ីន ជួយការពារសុខភាពរាងកាយរបស់អ្នក។",
      ],
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "Practical Exam Day Preparation",
      kmTitle: "ការរៀបចំជាក់ស្តែងសម្រាប់ថ្ងៃប្រឡង (Exam Day Routine)",
      type: "reading",
      paragraphs: [
        "Uncertainty and last-minute rushing feed anxiety. Establishing a predictable practical routine creates an inner sense of order and safety [1, 2].",
        "The Night Before:",
        "• Stop intense studying by early evening. Review light summaries, diagrams, or key formulas instead of opening new chapters.",
        "• Pack your clear bag with all required supplies: multiple blue and black pens, pencils, ruler, eraser, student identification card, and exam entrance ticket.",
        "• Double-check the exam center location and your assigned room.",
        "• Set two alarms to guarantee you wake up without panic, and wind down with a relaxing book or warm bath.",
        "The Morning Of:",
        "• Eat a light, digestible breakfast (e.g. rice porridge, eggs, or fruit) to maintain steady blood sugar.",
        "• Arrive at the testing center 30 to 45 minutes early so you have ample time to locate your room and use the restroom.",
        "• Avoid the 'Panic Circles': Steer clear of classmates standing outside frantically quizzing each other on obscure questions. Their anxious energy is contagious.",
        "• Stand in a quiet spot, take five slow breaths, and trust the work you have put in.",
      ],
      kmParagraphs: [
        "ភាពមិនច្បាស់លាស់ និងការប្រញាប់ប្រញាល់នៅនាទីចុងក្រោយ គឺជាចំណីនៃការថប់បារម្ភ។ ការរៀបចំទម្លាប់ជាក់ស្តែងទុកជាមុន ជួយបង្កើតអារម្មណ៍ស្ងប់ និងសុវត្ថិភាពក្នុងចិត្ត [1, 2]។",
        "នៅយប់មុនថ្ងៃប្រឡង៖",
        "• បញ្ឈប់ការរៀនតានតឹងនៅពេលល្ងាច។ មើលតែសេចក្តីសង្ខេប ដ្យាក្រាម ឬរូបមន្តសំខាន់ៗ ជាជាងការបើកមេរៀនថ្មីដែលមិនធ្លាប់រៀន។",
        "• រៀបចំកាតាប និងសម្ភារចាំបាច់ឱ្យបានរួចរាល់៖ ប៊ិចខៀវនិងខ្មៅច្រើនដើម ខ្មៅដៃ បន្ទាត់ ជ័រលុប អត្តសញ្ញាណប័ណ្ណសិស្ស និងប័ណ្ណអនុញ្ញាតចូលប្រឡង។",
        "• ពិនិត្យមើលទីតាំងមណ្ឌលប្រឡង និងលេខបន្ទប់របស់អ្នកឱ្យបានច្បាស់លាស់។",
        "• ដាក់រោទ៍ម៉ោង ២ ដងដើម្បីធានាថាភ្ញាក់ទាន់ពេលដោយមិនភ័យស្លន់ស្លោ ហើយសម្រាកឱ្យបានស្រួល។",
        "នៅព្រឹកថ្ងៃប្រឡង៖",
        "• ញ៉ាំអាហារពេលព្រឹកស្រាលៗដែលងាយរំលាយ (បបរ ស៊ុត ឬផ្លែឈើ) ដើម្បីរក្សាជាតិស្ករក្នុងឈាម។",
        "• ទៅដល់មណ្ឌលប្រឡងឱ្យបានមុន ៣០ ទៅ ៤៥ នាទី ដើម្បីមានពេលគ្រប់គ្រាន់ក្នុងការស្វែងរកបន្ទប់ និងចូលបន្ទប់ទឹក។",
        "• ជៀសវាង «ក្រុមភ័យស្លន់ស្លោ»៖ កុំទៅឈរជជែកជាមួយមិត្តភក្តិដែលកំពុងសួរសំណួរដេញដោលគ្នាយ៉ាងតានតឹងនៅមុខបន្ទប់។ ភាពភ័យខ្លាចរបស់ពួកគេអាចឆ្លងមកអ្នកបានយ៉ាងងាយ។",
        "• ឈរនៅកន្លែងស្ងប់ស្ងាត់មួយ ដកដង្ហើមវែងៗ ៥ ដង ហើយជឿជាក់លើការខិតខំប្រឹងប្រែងដែលអ្នកបានធ្វើកន្លងមក។",
      ],
      keyPoints: [
        "Pack all materials, documents, and multiple pens the night before [1, 2].",
        "Arrive early to avoid stressful rushing and locate your assigned desk.",
        "Avoid high-anxiety peer groups outside the examination hall.",
      ],
      kmKeyPoints: [
        "រៀបចំសម្ភារ ប៊ិច និងឯកសារប្រឡងទាំងអស់ឱ្យរួចរាល់តាំងពីយប់មុន [1, 2]។",
        "ទៅដល់ឱ្យបានមុនម៉ោង ដើម្បីជៀសវាងការប្រញាប់ប្រញាល់ និងរកបន្ទប់ឱ្យឃើញ។",
        "ជៀសវាងការឈរជជែកជាមួយក្រុមមិត្តភក្តិដែលកំពុងភ័យស្លន់ស្លោនៅមុខបន្ទប់។",
      ],
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "When Your Mind Goes Blank: The 5-Step In-Exam Reset",
      kmTitle: "នៅពេលគិតអ្វីមិនចេញក្នុងពេលប្រឡង៖ វិធីសាស្ត្រ ៥ ជំហាន (In-Exam Mind Blank Reset)",
      type: "reading",
      paragraphs: [
        "It is a universal student experience: You open the exam booklet, read a question, and suddenly feel as though all your knowledge has vanished into thin air. Your heart thumps and panic sets in.",
        "When your mind goes blank, do not panic about panicking. Your knowledge is not gone: stress hormones have temporarily narrowed your cognitive focus. Follow this 5-step emergency reset [1, 2]:",
        "Step 1: Put your pen down. Lean back against your chair, let your arms rest loosely, and drop your shoulders.",
        "Step 2: Take three slow, silent breaths. Inhale for 4 seconds, exhale for 6 seconds. This physical signal tells your brain that you are safe in this chair.",
        "Step 3: Reread the prompt slowly. Highlight or circle the key command words: 'Define', 'Calculate', 'Compare', or 'Explain'.",
        "Step 4: Move to an easy question first. If the answer still does not appear, skip it immediately. Scan the paper for a question you know well and answer that first. Scoring quick points builds momentum and unlocks mental recall.",
        "Step 5: Return with fresh eyes. Once your nervous system stabilizes and your confidence returns, return to the difficult question. The answers will often flow naturally.",
      ],
      kmParagraphs: [
        "នេះជាបទពិសោធន៍ទូទៅដែលសិស្សគ្រប់រូបធ្លាប់ជួប៖ អ្នកបើកក្រដាសវិញ្ញាសា អានសំណួរមួយ ហើយស្រាប់តែមានអារម្មណ៍ថាចំណេះដឹងទាំងអស់បានរលាយបាត់អស់រលីង។ បេះដូងលោតញាប់ ហើយការភ័យស្លន់ស្លោចាប់ផ្តើមកើតឡើង។",
        "នៅពេលគិតអ្វីមិនចេញ សូមកុំភ័យស្លន់ស្លោចំពោះភាពភ័យនោះឡើយ។ ចំណេះដឹងរបស់អ្នកមិនបានបាត់ទៅណាទេ៖ អ័រម៉ូនតានតឹងគ្រាន់តែកំពុងបិទខ្ទប់ការចងចាំមួយភ្លែតប៉ុណ្ណោះ។ សូមអនុវត្តវិធីសាស្ត្រសង្គ្រោះបន្ទាន់ ៥ ជំហាននេះ [1, 2]៖",
        "ជំហានទី ១៖ ដាក់ប៊ិចចុះ។ ទ្រេតខ្នងផ្អែកនឹងកៅអី បន្ធូរដៃទាំងសងខាង និងទម្លាក់ស្មាចុះ។",
        "ជំហានទី ២៖ ដកដង្ហើមវែងៗដោយស្ងៀមស្ងាត់ ៣ ដង។ ដកដង្ហើមចូល ៤ វិនាទី បញ្ចេញខ្យល់ ៦ វិនាទី។ សញ្ញារាងកាយនេះប្រាប់ខួរក្បាលថាអ្នកមានសុវត្ថិភាពនៅលើកៅអីនេះ។",
        "ជំហានទី ៣៖ អានសំណួរឡើងវិញយឺតៗ។ គូសបន្ទាត់ក្រោមពាក្យគន្លឹះសំខាន់ៗ៖ «ចូរកំណត់ន័យ» «ចូរគណនា» «ចូរប្រៀបធៀប» ឬ «ចូរពន្យល់»។",
        "ជំហានទី ៤៖ ទៅធ្វើសំណួរងាយៗជាមុនសិន។ ប្រសិនបើនៅតែគិតមិនទាន់ចេញ សូមរំលងវាភ្លាម។ រកមើលសំណួរណាដែលអ្នកចេះច្បាស់ ហើយសរសេរចម្លើយសំណួរនោះមុនគេ។ ការធ្វើសំណួរដែលចេះ ជួយកសាងទំនុកចិត្តឡើងវិញ និងដោះសោការចងចាំក្នុងខួរក្បាល។",
        "ជំហានទី ៥៖ ត្រឡប់មកធ្វើសំណួរពិបាកវិញ។ នៅពេលប្រព័ន្ធប្រសាទរបស់អ្នកមានលំនឹង និងមានទំនុកចិត្តឡើងវិញ ចូរត្រឡប់មកមើលសំណួរពិបាកនោះម្តងទៀត។ ជារឿយៗ ចម្លើយនឹងផុសឡើងមកដោយឯកឯង។",
      ],
      keyPoints: [
        "A blank mind is a temporary stress hormone bottleneck, not permanent memory loss [1, 2].",
        "Put your pen down, take three deep breaths, and let your nervous system reset.",
        "Skip difficult items to collect quick points on easy questions, then circle back.",
      ],
      kmKeyPoints: [
        "ការគិតអ្វីមិនចេញ គ្រាន់តែជាការស្ទះបណ្តោះអាសន្នដោយសារអ័រម៉ូនតានតឹង មិនមែនបាត់ការចងចាំឡើយ [1, 2]។",
        "ដាក់ប៊ិចចុះ ដកដង្ហើមវែងៗ ៣ ដង និងទុកពេលឱ្យប្រព័ន្ធប្រសាទស្ងប់ចុះ។",
        "រំលងសំណួរពិបាក ដើម្បីទៅប្រមូលពិន្ទុលើសំណួរសាមញ្ញជាមុនសិន រួចចាំត្រឡប់មកវិញ។",
      ],
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "Freedom From Comparison: Your Worth Beyond Grades",
      kmTitle: "ការបញ្ឈប់ការប្រៀបធៀប និងតម្លៃពិតរបស់ខ្លួន (Worth Beyond Grades)",
      type: "reading",
      paragraphs: [
        "One of the primary engines of academic anxiety is social comparison.",
        "Hearing classmates brag that they finished every past exam paper or studying late into the night can make you feel inadequate, even when your own preparation is thorough.",
        "Remember that everyone has distinct cognitive styles, memorization speeds, and study methods. You cannot judge someone's true readiness by what they say aloud. Turn your attention away from them and ask self-anchoring questions [1, 4]:",
        "• What key concept have I understood today that I did not understand last week?",
        "• Which formulas or vocabulary words can I recall with confidence?",
        "• What is one small, manageable study task I can complete in the next thirty minutes?",
        "Most importantly, anchor your fundamental worth outside the examination booklet. An exam measures your recall of specific academic facts on a single morning. It does not measure your kindness, emotional resilience, problem-solving creativity, loyalty as a friend, or potential to contribute to Cambodia's future.",
        "Take your education seriously, but treat yourself with unconditional respect.",
      ],
      kmParagraphs: [
        "ម៉ាស៊ីនរុញច្រានដ៏ធំបំផុតមួយនៃការថប់បារម្ភក្នុងការរៀនសូត្រ គឺការប្រៀបធៀបខ្លួនឯងជាមួយអ្នកដទៃ។",
        "ការឮមិត្តរួមថ្នាក់អួតថាគេរៀនចប់អស់វិញ្ញាសា ឬរៀនដល់យប់ជ្រៅ អាចធ្វើឱ្យអ្នកមានអារម្មណ៍ថាខ្លួនឯងខ្វះខាត ទោះបីជាការរៀបចំខ្លួនរបស់អ្នកមានភាពរៀបរយយ៉ាងណាក៏ដោយ។",
        "ចូរចងចាំថាមនុស្សម្នាក់ៗមានរបៀបរៀន ល្បឿននៃការចងចាំ និងវិធីសាស្ត្ររៀនសូត្រខុសៗគ្នា។ អ្នកមិនអាចវាស់ស្ទង់សមត្ថភាពពិតរបស់នរណាម្នាក់ ដោយគ្រាន់តែស្តាប់សម្តីដែលគេនិយាយចេញក្រៅនោះឡើយ។ សូមបង្វែរការយកចិត្តទុកដាក់មករកខ្លួនឯងវិញ ដោយសួរសំណួរពង្រឹងស្មារតី [1, 4]៖",
        "• តើគោលគំនិតសំខាន់អ្វីខ្លះដែលខ្ញុំបានយល់នៅថ្ងៃនេះ ដែលកាលពីសប្តាហ៍មុនខ្ញុំមិនទាន់យល់?",
        "• តើរូបមន្ត ឬពាក្យគន្លឹះណាខ្លះដែលខ្ញុំអាចចងចាំបានដោយទំនុកចិត្ត?",
        "• តើអ្វីជាកិច្ចការតូចមួយដែលខ្ញុំអាចរៀនឱ្យចប់ក្នុងរយៈពេល ៣០ នាទីបន្ទាប់?",
        "អ្វីដែលសំខាន់បំផុត សូមចងចាំថាតម្លៃពិតប្រាកដនៃជីវិតរបស់អ្នក មិនស្ថិតនៅលើក្រដាសប្រឡងនោះឡើយ។ ការប្រឡងគ្រាន់តែវាស់ស្ទង់ការចងចាំមេរៀនមួយចំនួនក្នុងពេលមួយព្រឹកប៉ុណ្ណោះ។ វាមិនអាចវាស់ស្ទង់សេចក្តីសប្បុរស ភាពរឹងមាំនៃផ្លូវចិត្ត ភាពច្នៃប្រឌិតក្នុងការដោះស្រាយបញ្ហា ភាពស្មោះត្រង់ក្នុងមិត្តភាព ឬសក្តានុពលរបស់អ្នកក្នុងការជួយសង្គមកម្ពុជានាពេលអនាគតនោះឡើយ។",
        "ចូរយកចិត្តទុកដាក់លើការសិក្សា ប៉ុន្តែត្រូវប្រព្រឹត្តចំពោះខ្លួនឯងដោយការគោរព និងក្តីស្រឡាញ់ជានិច្ច។",
      ],
      keyPoints: [
        "Social comparison magnifies anxiety without providing accurate preparation data [1, 4].",
        "Measure progress against your own past understanding, not your peers' claims.",
        "Your human dignity, intelligence, and potential far exceed any letter grade or exam score.",
      ],
      kmKeyPoints: [
        "ការប្រៀបធៀបខ្លួនឯងជាមួយអ្នកដទៃ បង្កើនការថប់បារម្ភដោយគ្មានប្រយោជន៍ជាក់ស្តែងឡើយ [1, 4]។",
        "វាស់ស្ទង់ការរីកចម្រើនធៀបនឹងខ្លួនឯងកាលពីមុន ជាជាងស្តាប់សម្តីរបស់មិត្តរួមថ្នាក់។",
        "សេចក្តីថ្លៃថ្នូរ ភាពឆ្លាតវៃ និងសក្តានុពលរបស់អ្នក គឺធំធេងជាងពិន្ទុ ឬនិទ្ទេសប្រឡងឆ្ងាយណាស់។",
      ],
    },
    {
      id: 10,
      sectionNumber: 10,
      title: "Personal Reflection in AROM Journal",
      kmTitle: "ការឆ្លុះបញ្ចាំងផ្ទាល់ខ្លួនក្នុងកំណត់ហេតុ AROM (Reflection Activity)",
      type: "reflection",
      paragraphs: [
        "Take a quiet moment to reflect on your personal experiences with academic anxiety. You can explore these five prompts privately in your personal AROM Journal:",
        "1. What worries me most when I picture my upcoming exam?",
        "2. When I feel anxious, what physical sensations or behaviors appear first (fast heart, procrastination, self-criticism)?",
        "3. What is one catastrophic thought that repeatedly drains my confidence?",
        "4. What is a realistic, balanced thought that I can use to replace it?",
        "5. What is one small, manageable study action I can take today without overwhelming myself?",
        "Honest self-awareness is the foundation of emotional resilience.",
      ],
      kmParagraphs: [
        "ឆ្លៀតពេលស្ងប់ស្ងាត់បន្តិច ដើម្បីឆ្លុះបញ្ចាំងពីបទពិសោធន៍ផ្ទាល់ខ្លួនរបស់អ្នកជាមួយនឹងការថប់បារម្ភក្នុងការសិក្សា។ អ្នកអាចឆ្លើយសំណួរទាំង ៥ នេះជាឯកជន នៅក្នុងកំណត់ហេតុ AROM របស់អ្នក៖",
        "១. តើអ្វីដែលធ្វើឱ្យខ្ញុំបារម្ភបំផុត នៅពេលស្រមៃដល់ការប្រឡងដែលជិតមកដល់?",
        "២. នៅពេលខ្ញុំមានអារម្មណ៍ថប់បារម្ភ តើប្រតិកម្មរាងកាយ ឬអាកប្បកិរិយាណាដែលកើតឡើងមុនគេ (បេះដូងលោតញាប់ ការពន្យារពេល ការបន្ទោសខ្លួនឯង)?",
        "៣. តើគំនិតអវិជ្ជមានមួយណាដែលតែងតែបំបាក់ទំនុកចិត្តរបស់ខ្ញុំម្តងហើយម្តងទៀត?",
        "៤. តើគំនិតណាដែលមានតុល្យភាព និងស្របតាមការពិត ដែលខ្ញុំអាចយកមកជំនួសវិញបាន?",
        "៥. តើអ្វីជាសកម្មភាពរៀនសូត្រតូចមួយដែលខ្ញុំអាចធ្វើបាននៅថ្ងៃនេះ ដោយមិនបង្កការតានតឹងដល់ខ្លួនឯង?",
        "ការដឹងច្បាស់ពីអារម្មណ៍ខ្លួនឯង គឺជាគ្រឹះដ៏រឹងមាំនៃភាពធន់ផ្លូវចិត្ត។",
      ],
      reflection: {
        question: "Thinking about your upcoming exams, what is your biggest emotional challenge right now?",
        kmQuestion: "គិតអំពីការប្រឡងដែលជិតមកដល់ តើអ្វីជាបញ្ហាប្រឈមផ្លូវចិត្តដ៏ធំបំផុតរបស់អ្នកនៅពេលនេះ?",
        options: [
          "Feeling overwhelmed by how much material I need to study",
          "Fear of failing and disappointing my parents or family",
          "Constant physical anxiety (racing heart, sleep problems, trembling)",
          "Comparing myself to classmates and feeling completely behind",
        ],
        kmOptions: [
          "អារម្មណ៍ធុញថប់ខ្លាំងដោយសារមេរៀនច្រើនពេកដែលត្រូវរៀន",
          "ការភ័យខ្លាចការធ្លាក់ និងខ្លាចធ្វើឱ្យឪពុកម្តាយ ឬគ្រួសារខកចិត្ត",
          "ការថប់បារម្ភក្នុងរាងកាយជាប់រហូត (បេះដូងលោតញាប់ គេងមិនលក់ ញ័រដៃ)",
          "ការប្រៀបធៀបខ្លួនឯងជាមួយមិត្តភក្តិ ហើយមានអារម្មណ៍ថារៀនមិនទាន់គេ",
        ],
        feedbackMessage:
          "Thank you for naming your challenge honestly. Remember: you do not need to master everything at once. Breaking your study into small 25-minute tasks and taking slow breaths will guide you forward with confidence.",
        kmFeedbackMessage:
          "អរគុណដែលបានចែករំលែកដោយស្មោះត្រង់។ ចូរចងចាំថា៖ អ្នកមិនចាំបាច់រៀនចប់អ្វីៗទាំងអស់ក្នុងពេលតែមួយនោះឡើយ។ ការបំបែកមេរៀនជាកិច្ចការតូចៗ ២៥ នាទី និងការដកដង្ហើមវែងៗ នឹងជួយឱ្យអ្នកបោះជំហានទៅមុខដោយទំនុកចិត្ត។",
      },
      keyPoints: [
        "Identifying specific worry triggers allows you to dismantle them objectively.",
        "Writing balanced thoughts in AROM Journal replaces automatic catastrophic fears.",
        "Committing to one small action restores a sense of agency and control.",
      ],
      kmKeyPoints: [
        "ការស្គាល់ច្បាស់ពីដើមហេតុនៃការព្រួយបារម្ភ ជួយឱ្យអ្នកអាចដោះស្រាយវាបានចំគោលដៅ។",
        "ការកត់ត្រាគំនិតដែលមានតុល្យភាពក្នុងកំណត់ហេតុ AROM ជួយជំនួសការភ័យខ្លាចដោយស្វ័យប្រវត្តិ។",
        "ការប្តេជ្ញាចិត្តធ្វើសកម្មភាពតូចមួយ ស្តារនូវអារម្មណ៍ម្ចាស់ការ និងការគ្រប់គ្រងលើខ្លួនឯងឡើងវិញ។",
      ],
    },
    {
      id: 11,
      sectionNumber: 11,
      title: "Next Steps and Support on AROM",
      kmTitle: "ជំហានបន្ទាប់ និងការគាំទ្រនៅលើ AROM (Next Steps & Support)",
      type: "coping",
      paragraphs: [
        "Exam anxiety is a common experience, but it does not mean you are incapable of achieving your goals.",
        "You do not need to feel completely fearless before walking into an exam. You can feel nervous and still perform with clarity, method, and courage.",
        "On AROM, specialized student wellness tools and clinical counselors are available to support you throughout your academic journey:",
        "• AROM Private Journal: Outline your daily study sprints, write down balanced thoughts, and externalize nighttime worries so you can sleep peacefully.",
        "• AROM Calming Practices: Practice the 1-Minute Calming Breath before study sessions and right before entering the exam room.",
        "• AROM Verified Professional Counseling: If exam stress feels paralyzing, prevents sleep, or leads to panic attacks, book a private, confidential session with licensed psychologists and youth counselors in Cambodia.",
        "• Emergency Support: If academic pressure ever leaves you feeling hopeless or unsafe, tap 'Get help now' in your Profile for immediate, free crisis hotlines.",
        "Your future is vast and full of opportunity. Take a gentle breath, focus on one question at a time, and do your best.",
      ],
      kmParagraphs: [
        "ការថប់បារម្ភមុនពេលប្រឡងគឺជាបទពិសោធន៍ទូទៅមួយ ប៉ុន្តែវាមិនមែនមានន័យថាអ្នកគ្មានសមត្ថភាពអាចសម្រេចគោលដៅនោះឡើយ។",
        "អ្នកមិនចាំបាច់បំបាត់ភាពភ័យខ្លាចទាំងអស់ ទើបអាចដើរចូលបន្ទប់ប្រឡងនោះទេ។ អ្នកអាចមានអារម្មណ៍ភ័យខ្លះ ប៉ុន្តែនៅតែអាចធ្វើការប្រឡងដោយភាពច្បាស់លាស់ តាមវិធីសាស្ត្រត្រឹមត្រូវ និងដោយភាពក្លាហាន។",
        "នៅលើកម្មវិធី AROM ឧបករណ៍សុខុមាលភាព និងអ្នកប្រឹក្សាជំនាញបានត្រៀមខ្លួនជាស្រេចដើម្បីគាំទ្រការសិក្សារបស់អ្នក៖",
        "• កំណត់ហេតុឯកជន AROM (Private Journal)៖ រៀបចំកាលវិភាគរៀនសូត្រ កត់ត្រាគំនិតដែលមានតុល្យភាព និងបញ្ចេញកង្វល់ពេលយប់ ដើម្បីឱ្យគេងលក់ស្រួល។",
        "• លំហាត់ស្ងប់ចិត្ត AROM (Practices)៖ អនុវត្តការដកដង្ហើមស្ងប់ចិត្ត ១ នាទី មុនពេលរៀន និងមុនពេលដើរចូលបន្ទប់ប្រឡង។",
        "• ការប្រឹក្សាជាមួយអ្នកជំនាញ AROM (Professional Care)៖ ប្រសិនបើសម្ពាធការសិក្សាធ្វើឱ្យអ្នកពិបាកទ្រាំ គេងមិនលក់ ឬមានអាការស្លន់ស្លោ សូមកក់ការប្រឹក្សាជាសម្ងាត់ជាមួយអ្នកចិត្តសាស្ត្រ និងអ្នកប្រឹក្សាយុវជននៅកម្ពុជា។",
        "• ជំនួយសង្គ្រោះបន្ទាន់ (Crisis Support)៖ ប្រសិនបើសម្ពាធការសិក្សាធ្វើឱ្យអ្នកអស់សង្ឃឹម ឬមានអារម្មណ៍មិនមានសុវត្ថិភាព សូមចុច 'Get help now' ក្នុង Profile ដើម្បីទទួលបានទំនាក់ទំនងបន្ទាន់ភ្លាមៗ។",
        "អនាគតរបស់អ្នកគឺធំធេង និងពោរពេញដោយកាលានុវត្តភាព។ ដកដង្ហើមវែងៗ ផ្តោតលើសំណួរម្តងមួយ ហើយធ្វើវាឱ្យអស់ពីលទ្ធភាព។",
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
        "Managing anxiety is about preparation, breath regulation, and realistic thinking [1, 2].",
        "AROM Journal and Calming Breath provide steady support before and during exams.",
        "Confidential professional support is available when academic stress feels overwhelming.",
      ],
      kmKeyPoints: [
        "ការគ្រប់គ្រងការថប់បារម្ភ គឺអំពីការរៀបចំខ្លួន ការសម្រួលដង្ហើម និងការគិតស្របតាមការពិត [1, 2]។",
        "កំណត់ហេតុ និងការដកដង្ហើមលើ AROM ផ្តល់ការគាំទ្រដ៏រឹងមាំទាំងមុន និងអំឡុងពេលប្រឡង។",
        "ការប្រឹក្សាជាសម្ងាត់ជាមួយអ្នកជំនាញ តែងតែមានជានិច្ចនៅពេលសម្ពាធការសិក្សាមានភាពធ្ងន់ធ្ងរ។",
      ],
    },
  ],
};

export const REFERENCES_FEAR_OF_FAILURE: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "APA",
    title: "American Psychological Association: Overcoming Fear of Failure and Perfectionism",
    url: "https://www.apa.org/topics/stress/perfectionism",
  },
  {
    id: 2,
    citation: "[2]",
    source: "Harvard Health",
    title: "Harvard Health Publishing: The Core Driver of Perfectionism Is Fear",
    url: "https://www.health.harvard.edu/mind-and-mood/perfectionism-the-hidden-driver-of-fear-of-failure",
  },
  {
    id: 3,
    citation: "[3]",
    source: "NHS inform",
    title: "NHS inform: Dealing with Unhelpful Thoughts and Perfectionism",
    url: "https://www.nhsinform.scot/illnesses-and-conditions/mental-health/mental-health-self-help-guides/unhelpful-thoughts-and-perfectionism/",
  },
  {
    id: 4,
    citation: "[4]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia: Mental Health",
    url: "https://www.unicef.org/cambodia/mental-health",
  },
];

export const LESSON_FEAR_OF_FAILURE: Lesson = {
  id: "how-to-handle-fear-of-failure",
  title: "How to Handle Fear of Failure",
  kmTitle: "របៀបដោះស្រាយការភ័យខ្លាចការបរាជ័យ (How to Handle Fear of Failure)",
  subtitle: "Develop a healthier relationship with mistakes and free your self-worth from perfectionism",
  kmSubtitle: "បង្កើតទំនាក់ទំនងដែលមានសុខភាពល្អជាមួយនឹងកំហុសឆ្គង និងរំដោះតម្លៃផ្ទាល់ខ្លួនពីភាពឥតខ្ចោះ",
  category: "Self-esteem",
  duration: "8 min",
  kmDuration: "៨ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Practice",
  kmFormat: "ការអាន និងការអនុវត្ត (Reading & Practice)",
  isAvailable: true,
  image: "/mindguide/strategies.png",
  heroImage: "/mindguide/fear-of-failure-hero.jpg",
  description:
    "Unpack the roots of perfectionism, transform mistakes into valuable growth data, silence harsh self-criticism with self-compassion, and take courageous steps on AROM.",
  kmDescription:
    "ស្វែងយល់ពីឫសគល់នៃភាពឥតខ្ចោះ បម្លែងកំហុសឆ្គងទៅជាទិន្នន័យនៃការរៀនសូត្រ បញ្ឈប់ការបន្ទោសខ្លួនឯងដោយក្តីមេត្តា និងបោះជំហានដ៏ក្លាហាននៅលើ AROM។",
  totalSections: 11,
  outcomes: [
    {
      en: "Understand the psychological link between fear of failure and conditional self-worth [1, 2]",
      km: "យល់ដឹងពីទំនាក់ទំនងផ្លូវចិត្តរវាងការភ័យខ្លាចការបរាជ័យ និងតម្លៃខ្លួនឯងដែលមានលក្ខខណ្ឌ [1, 2]",
    },
    {
      en: "Recognize how socially prescribed perfectionism and Cambodian family honor amplify dread [1, 4]",
      km: "សម្គាល់របៀបដែលការទាមទារភាពឥតខ្ចោះ និងកិត្តិយសគ្រួសារក្នុងសង្គមកម្ពុជាបង្កើនការភ័យខ្លាច [1, 4]",
    },
    {
      en: "Break the cycle of avoidance, procrastination, and imposter syndrome caused by fear [2, 3]",
      km: "កាត់ផ្តាច់វដ្តនៃការគេចវេះ ការពន្យារពេល និងការសង្ស័យលើសមត្ថភាពខ្លួនឯងដែលបង្កឡើងដោយការភ័យខ្លាច [2, 3]",
    },
    {
      en: "Adopt a growth mindset where mistakes are treated as normal learning data rather than identity defects [3]",
      km: "ទទួលយកផ្នត់គំនិតរីកចម្រើន ដោយចាត់ទុកកំហុសឆ្គងជាទិន្នន័យរៀនសូត្រ មិនមែនជាការខូចខាតតម្លៃផ្ទាល់ខ្លួន [3]",
    },
    {
      en: "Apply the 'Good Enough' standard and practice micro-courage experiments in daily life",
      km: "អនុវត្តគោលការណ៍ «ល្អគ្រប់គ្រាន់» និងការសាកល្បងភាពក្លាហានតាមជំហានតូចៗក្នុងជីវិតប្រចាំថ្ងៃ",
    },
    {
      en: "Practice self-compassionate reflection in AROM Journal and access confidential therapy [1, 4]",
      km: "អនុវត្តការឆ្លុះបញ្ចាំងដោយក្តីមេត្តាក្នុងកំណត់ហេតុ AROM និងភ្ជាប់ការប្រឹក្សាជាមួយអ្នកជំនាញ [1, 4]",
    },
  ],
  references: REFERENCES_FEAR_OF_FAILURE,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "What Is the Fear of Failure?",
      kmTitle: "តើអ្វីទៅជាការភ័យខ្លាចការបរាជ័យ? (What Is Fear of Failure?)",
      type: "reading",
      paragraphs: [
        "Have you ever hesitated to start a creative project, apply for an opportunity, or share an idea because you were terrified of getting it wrong?",
        "You might think: 'If I cannot do this perfectly, I should not do it at all. If I make a mistake, people will discover that I am not truly competent.'",
        "This experience is known psychologically as the fear of failure, or atychiphobia [1, 2]. It is not a lack of ambition or talent. In fact, it most frequently strikes high-achieving, conscientious individuals who care deeply about their work and their community.",
        "The fear of failure occurs when we link our fundamental worth as a human being to our visible performance. When a single mistake feels like conclusive proof that you are fundamentally flawed, everyday efforts begin to feel life-threatening [1, 3].",
        "Understanding this dynamic is liberating: The fear is not protecting you from danger. It is an overprotective internal alarm that confuses temporary mistakes with permanent unworthiness.",
      ],
      kmParagraphs: [
        "តើអ្នកធ្លាប់ស្ទាក់ស្ទើរក្នុងការចាប់ផ្តើមគម្រោងថ្មី ការដាក់ពាក្យស្នើសុំឱកាស ឬការបញ្ចេញគំនិត ដោយសារតែខ្លាចធ្វើមិនបានល្អដែរឬទេ?",
        "អ្នកអាចគិតថា៖ «បើខ្ញុំមិនអាចធ្វើវាឱ្យល្អឥតខ្ចោះទេ ខ្ញុំមិនគួរធ្វើវាទាល់តែសោះ។ បើខ្ញុំធ្វើខុស គេនឹងដឹងថាខ្ញុំគ្មានសមត្ថភាពពិតប្រាកដ»។",
        "បទពិសោធន៍នេះត្រូវបានហៅតាមបែបចិត្តវិទ្យាថា ការភ័យខ្លាចការបរាជ័យ (Fear of Failure) [1, 2]។ វាមិនមែនជាកង្វះមហិច្ឆតា ឬកង្វះទេពកោសល្យនោះឡើយ។ តាមពិតទៅ វាច្រើនតែកើតឡើងលើមនុស្សដែលខិតខំប្រឹងប្រែង និងយកចិត្តទុកដាក់ខ្ពស់ចំពោះការងារ និងមនុស្សជុំវិញខ្លួន។",
        "ការភ័យខ្លាចការបរាជ័យកើតឡើង នៅពេលដែលយើងយកតម្លៃពិតប្រាកដនៃជីវិតទៅផ្សារភ្ជាប់នឹងលទ្ធផលការងារខាងក្រៅ។ នៅពេលកំហុសតែមួយ មានអារម្មណ៍ដូចជាភស្តុតាងដែលបញ្ជាក់ថាអ្នកជាមនុស្សអន់ ការខិតខំប្រឹងប្រែងប្រចាំថ្ងៃនឹងមានអារម្មណ៍ដូចជាការប្រថុយប្រថានដ៏គ្រោះថ្នាក់ [1, 3]។",
        "ការយល់ដឹងពីរឿងនេះជួយឱ្យអ្នកមានសេរីភាពក្នុងចិត្ត៖ ការភ័យខ្លាចមិនមែនកំពុងការពារអ្នកពីគ្រោះថ្នាក់នោះទេ។ វាគ្រាន់តែជាប្រព័ន្ធរោទ៍អាសន្នខាងក្នុងដែលបារម្ភជ្រុល និងយល់ច្រឡំរវាងកំហុសបណ្តោះអាសន្ន ជាមួយតម្លៃនៃជីវិតរបស់អ្នក។",
      ],
      keyPoints: [
        "Fear of failure ties fundamental self-worth directly to external success [1, 2].",
        "It commonly affects conscientious, dedicated people rather than careless ones.",
        "A mistake is an event that occurred, not an identity of who you are.",
      ],
      kmKeyPoints: [
        "ការភ័យខ្លាចការបរាជ័យចងភ្ជាប់តម្លៃផ្ទាល់ខ្លួនទៅនឹងលទ្ធផលជោគជ័យខាងក្រៅ [1, 2]។",
        "វាច្រើនតែកើតលើអ្នកដែលខិតខំប្រឹងប្រែង មិនមែនអ្នកដែលមិនខ្វល់ខ្វាយនោះឡើយ។",
        "កំហុសឆ្គងគ្រាន់តែជាព្រឹត្តិការណ៍មួយដែលបានកើតឡើង មិនមែនជាអត្តសញ្ញាណរបស់អ្នកឡើយ។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "The Roots of Perfectionism and Cultural Pressure",
      kmTitle: "ឫសគល់នៃភាពឥតខ្ចោះ និងសម្ពាធសង្គម (Roots of Perfectionism)",
      type: "reading",
      paragraphs: [
        "Clinical psychologists distinguish between two forms of perfectionism [1, 2]:",
        "1. Healthy Striving: Setting ambitious personal standards while enjoying the process, accepting human errors, and separating self-worth from outcomes.",
        "2. Maladaptive Perfectionism: Setting impossibly rigid standards driven entirely by fear: 'If I am not flawless, I am worthless.' [2, 3]",
        "A particularly intense driver is socially prescribed perfectionism: the belief that family, peers, and society demand perfection from you, and that making an error will lead to severe disappointment, shame, or rejection [1, 3].",
        "In Cambodia, this dynamic is often magnified by deep cultural values of filial gratitude and family reputation ('face') [4]. Young people frequently carry an unspoken dread that stumbling in school or career will bring dishonor upon their parents or waste their family sacrifices. [4]",
        "While honoring family is a beautiful virtue, believing you must never stumble creates chronic exhaustion. Parents who love you want your health and resilience, not your burnout.",
      ],
      kmParagraphs: [
        "អ្នកចិត្តសាស្រ្តគ្លីនិកបានបែងចែកភាពឥតខ្ចោះជាពីរទម្រង់ [1, 2]៖",
        "១. ការខិតខំប្រកបដោយសុខភាពល្អ៖ ការកំណត់គោលដៅខ្ពស់ ខណៈពេលដែលរីករាយនឹងដំណើរការរៀនសូត្រ ទទួលយកកំហុសរបស់មនុស្ស និងបែងចែកតម្លៃខ្លួនឯងឱ្យដាច់ពីលទ្ធផល។",
        "២. ភាពឥតខ្ចោះដែលបង្កគ្រោះថ្នាក់៖ ការកំណត់ស្តង់ដារតឹងរ៉ឹងហួសហេតុ ដែលជំរុញដោយការភ័យខ្លាចសុទ្ធសាធ៖ «បើខ្ញុំមិនល្អឥតខ្ចោះ ខ្ញុំគ្មានតម្លៃឡើយ» [2, 3]។",
        "កត្តាជំរុញដ៏ធ្ងន់ធ្ងរមួយគឺ ការទាមទារភាពឥតខ្ចោះពីសង្គម (Socially Prescribed Perfectionism)៖ ជំនឿដែលគិតថា គ្រួសារ មិត្តភក្តិ និងសង្គម ទាមទារឱ្យអ្នកល្អឥតខ្ចោះ ហើយការធ្វើខុសនឹងនាំមកនូវការខកចិត្ត ភាពអាម៉ាស់ ឬការបដិសេធ [1, 3]។",
        "នៅកម្ពុជា បញ្ហានេះកាន់តែមានទំហំធំឡើង ដោយសារគុណតម្លៃវប្បធម៌នៃការដឹងគុណឪពុកម្តាយ និងកិត្តិយសគ្រួសារ [4]។ យុវជនជាច្រើនតែងតែរែកពន់ការភ័យខ្លាចថា ការជួបឧបសគ្គក្នុងការរៀន ឬការងារ នឹងធ្វើឱ្យឪពុកម្តាយបាត់បង់មុខមាត់ ឬធ្វើឱ្យខកបំណងការលះបង់របស់គ្រួសារ។ [4]",
        "ខណៈពេលដែលការគោរពដឹងគុណគ្រួសារគឺជាគុណធម៌ដ៏ល្អ ការគិតថាខ្លួនឯងមិនត្រូវធ្វើខុសសោះ បង្កើតនូវការអស់កម្លាំងចិត្តរ៉ាំរ៉ៃ។ ឪពុកម្តាយដែលស្រឡាញ់អ្នក ចង់ឃើញអ្នកមានសុខភាពល្អ និងរឹងមាំ មិនមែនចង់ឃើញអ្នកអស់កម្លាំងចិត្តនោះឡើយ។",
      ],
      keyPoints: [
        "Healthy striving enjoys the journey: toxic perfectionism is driven by avoidance of shame [2, 3].",
        "Socially prescribed perfectionism assumes others will reject you for human mistakes [1].",
        "In Cambodia, untangling family love from unrealistic pressure preserves long-term wellbeing [4].",
      ],
      kmKeyPoints: [
        "ការខិតខំល្អរីករាយនឹងដំណើរការ៖ ភាពឥតខ្ចោះពុលត្រូវបានជំរុញដោយការខ្លាចភាពអាម៉ាស់ [2, 3]។",
        "ការគិតថាអ្នកដទៃទាមទារភាពឥតខ្ចោះ ធ្វើឱ្យយើងខ្លាចគេបដិសេធពេលមានកំហុស [1]។",
        "នៅកម្ពុជា ការបែងចែកសេចក្តីស្រឡាញ់គ្រួសារចេញពីសម្ពាធ ជួយការពារសុខុមាលភាពផ្លូវចិត្ត [4]។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "The Cost of Playing It Too Safe",
      kmTitle: "តម្លៃនៃការគេចវេះ និងការរារាំងជីវិត (The Cost of Avoidance)",
      type: "reading",
      paragraphs: [
        "When the fear of failure takes the wheel, it does not keep you safe: it quietly shrinks your world [2, 3].",
        "Notice if you engage in any of these common self-protective behaviors:",
        "• Chronic Procrastination: Delaying important assignments or job applications until the final hour. If you do poorly, you can comfort yourself by thinking, 'I only had two hours, so it does not count.'",
        "• Analysis Paralysis: Over-researching, rewriting the first sentence twenty times, or never submitting work because it is not quite perfect yet.",
        "• Underachievement: Deliberately choosing paths far below your true capabilities where failure is impossible, depriving yourself of growth.",
        "• Imposter Syndrome: Dismissing your genuine successes as mere luck or timing, while treating small errors as absolute proof of inadequacy.",
        "Avoiding failure gives you temporary emotional safety, but its long-term cost is regret, unfulfilled dreams, and lingering self-doubt.",
      ],
      kmParagraphs: [
        "នៅពេលដែលការភ័យខ្លាចការបរាជ័យគ្រប់គ្រងជីវិតរបស់អ្នក វាមិនមែនជួយការពារអ្នកនោះទេ៖ វាគ្រាន់តែកាត់បន្ថយឱកាស និងបង្រួមពិភពលោករបស់អ្នកឱ្យកាន់តែតូចទៅៗ [2, 3]។",
        "សូមកត់សម្គាល់ថាតើអ្នកធ្លាប់មានអាកប្បកិរិយាការពារខ្លួនទាំងនេះដែរឬទេ៖",
        "• ការពន្យារពេលរ៉ាំរ៉ៃ៖ ពន្យារពេលកិច្ចការសំខាន់ ឬការដាក់ពាក្យការងាររហូតដល់ម៉ោងចុងក្រោយ។ ប្រសិនបើធ្វើមិនបានល្អ អ្នកអាចលួងចិត្តខ្លួនឯងថា៖ «ខ្ញុំទើបតែធ្វើបាន ២ ម៉ោងប៉ុណ្ណោះ វាមិនរាប់ជាការបរាជ័យទេ»។",
        "• ការស្ទះដោយសារគិតច្រើន៖ ការស្រាវជ្រាវច្រើនហួសហេតុ ការលុបកែប្រយោគដំបូង ២០ ដង ឬមិនព្រមប្រគល់ការងារ ដោយសារតែយល់ថាវាមិនទាន់ល្អឥតខ្ចោះ។",
        "• ការបន្ទាបសមត្ថភាពខ្លួនឯង៖ ជ្រើសរើសផ្លូវដែលទាបជាងសមត្ថភាពពិតរបស់ខ្លួនឆ្ងាយ ជាកន្លែងដែលគ្មានថ្ងៃបរាជ័យ ដែលធ្វើឱ្យបាត់បង់ឱកាសរីកចម្រើន។",
        "• វិបត្តិសង្ស័យលើសមត្ថភាពខ្លួន (Imposter Syndrome)៖ ចាត់ទុកជោគជ័យពិតប្រាកដរបស់ខ្លួនថាជាការចៃដន្យ ប៉ុន្តែចាត់ទុកកំហុសតូចតាចថាជាភស្តុតាងនៃភាពអសមត្ថភាព។",
        "ការគេចវេះពីការបរាជ័យ ផ្តល់សុវត្ថិភាពផ្លូវចិត្តមួយភ្លែត ប៉ុន្តែតម្លៃដែលត្រូវបង់រយៈពេលវែង គឺការស្តាយក្រោយ និងការបាត់បង់ក្តីសុបិន។",
      ],
      keyPoints: [
        "Procrastination is often a protective shield against the pain of imperfection [2, 3].",
        "Playing it too safe creates the very failure you feared: missing out on meaningful living.",
        "Recognizing self-sabotage allows you to choose courage over paralysis.",
      ],
      kmKeyPoints: [
        "ការពន្យារពេលច្រើនតែជាខែលការពារខ្លួនពីការឈឺចាប់នៃភាពមិនល្អឥតខ្ចោះ [2, 3]។",
        "ការមិនហ៊ានប្រថុយទាល់តែសោះ បង្កើតនូវការបរាជ័យពិតប្រាកដ៖ ការបាត់បង់ជីវិតដ៏មានន័យ។",
        "ការដឹងខ្លួនពីទម្លាប់រារាំងខ្លួនឯង ជួយឱ្យអ្នកជ្រើសរើសភាពក្លាហានជំនួសភាពស្ពឹកស្រពន់។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "The Growth Mindset: Redefining Mistakes as Data",
      kmTitle: "ផ្នត់គំនិតរីកចម្រើន៖ ការបម្លែងកំហុសជាព័ត៌មានរៀនសូត្រ (Growth Mindset)",
      type: "quiz",
      paragraphs: [
        "Pioneering psychological research by Dr. Carol Dweck identifies two distinct frameworks for interpreting setbacks [3]:",
        "• Fixed Mindset: Believing your intelligence, talent, and creativity are carved in stone. Under a fixed mindset, an error proves you lack innate talent. Effort is viewed as a shameful sign of weakness.",
        "• Growth Mindset: Believing that cognitive abilities, emotional skills, and knowledge expand through feedback, practice, and correction. Under a growth mindset, an error is not a verdict: it is valuable data.",
        "Think of learning to ride a bicycle or play an instrument: nobody masters balance on the first push. Wobbling and scraping a knee is not failure: it is your brain calibrating balance.",
        "Whenever a project stumbles, shift from the prosecutor's question ('Why did I mess this up?') to the scientist's question ('What did this experiment teach me about what to adjust next?'). [1, 3]",
      ],
      kmParagraphs: [
        "ការស្រាវជ្រាវចិត្តវិទ្យាដ៏ល្បីល្បាញរបស់លោកស្រីបណ្ឌិត Carol Dweck បានរកឃើញក្របខ័ណ្ឌគំនិតពីរផ្សេងគ្នា ក្នុងការបកស្រាយឧបសគ្គជីវិត [3]៖",
        "• ផ្នត់គំនិតជាប់គាំង (Fixed Mindset)៖ ជឿជាក់ថាភាពឆ្លាតវៃ ទេពកោសល្យ និងសមត្ថភាព ត្រូវបានកំណត់រួចជាស្រេចតាំងពីកំណើត។ នៅក្រោមផ្នត់គំនិតនេះ កំហុសឆ្គងបញ្ជាក់ថាអ្នកគ្មានសមត្ថភាពពីកំណើត។ ការខិតខំប្រឹងប្រែងត្រូវបានគេមើលឃើញថាជាសញ្ញានៃភាពទន់ខ្សោយ។",
        "• ផ្នត់គំនិតរីកចម្រើន (Growth Mindset)៖ ជឿជាក់ថាសមត្ថភាពខួរក្បាល ជំនាញផ្លូវចិត្ត និងចំណេះដឹង អាចរីកចម្រើនបានតាមរយៈការអនុវត្ត ការកែតម្រូវ និងការរៀនសូត្រ។ នៅក្រោមផ្នត់គំនិតនេះ កំហុសមិនមែនជាការកាត់ទោសទេ៖ វាជាទិន្នន័យដ៏មានតម្លៃ។",
        "ស្រមៃដល់ការរៀនជិះកង់ ឬលេងឧបករណ៍ភ្លេង៖ គ្មាននរណាម្នាក់ចេះជិះតាំងពីធាក់លើកដំបូងនោះទេ។ ការទ្រេតទ្រោត និងការដួលរលាត់ជង្គង់ មិនមែនជាការបរាជ័យឡើយ៖ វាជាវិធីដែលខួរក្បាលកំពុងរៀនរក្សាលំនឹង។",
        "នៅពេលណាដែលកិច្ចការមិនដំណើរការល្អ សូមប្តូរពីសំណួរបន្ទោសខ្លួនឯង («ហេតុអ្វីខ្ញុំល្ងង់ម្ល៉េះ?») ទៅជាសំណួររបស់អ្នកវិទ្យាសាស្ត្រ («តើការពិសោធន៍នេះបានបង្រៀនអ្វីខ្លះដល់ខ្ញុំ ដើម្បីកែសម្រួលនៅពេលក្រោយ?» [1, 3])។",
      ],
      quiz: {
        question: "Which of the following internal statements best exemplifies a resilient Growth Mindset after receiving critical feedback on an assignment?",
        kmQuestion: "តើការគិតមួយណាខាងក្រោម ដែលឆ្លុះបញ្ចាំងពីផ្នត់គំនិតរីកចម្រើន (Growth Mindset) យ៉ាងពិតប្រាកដ បន្ទាប់ពីទទួលបានការរិះគន់លើកិច្ចការ?",
        options: [
          {
            id: "opt-1",
            text: "'This low score proves I was never cut out for this subject, so I should quit trying.'",
            kmText: "«ពិន្ទុទាបនេះបញ្ជាក់ថាខ្ញុំគ្មានដុងខាងមុខវិជ្ជានេះទេ ដូច្នេះខ្ញុំគួរតែឈប់ប្រឹងទៅ»",
            isCorrect: false,
          },
          {
            id: "opt-2",
            text: "'This feedback highlights specific areas I didn't fully grasp yet. I can review these notes and improve my approach.'",
            kmText: "«ការរិះគន់នេះបង្ហាញពីចំណុចជាក់លាក់ដែលខ្ញុំមិនទាន់យល់ច្បាស់។ ខ្ញុំអាចមើលឡើងវិញ និងកែសម្រួលវិធីសាស្ត្ររៀនឱ្យកាន់តែល្អ»",
            isCorrect: true,
          },
          {
            id: "opt-3",
            text: "'The reviewer is completely biased and doesn't understand my genius.'",
            kmText: "«អ្នកដាក់ពិន្ទុមានការរើសអើង និងមិនយល់ពីភាពឆ្លាតវៃរបស់ខ្ញុំ»",
            isCorrect: false,
          },
          {
            id: "opt-4",
            text: "'I will never submit another assignment to avoid ever feeling criticized again.'",
            kmText: "«ខ្ញុំនឹងមិនប្រគល់កិច្ចការណាទៀតឡើយ ដើម្បីកុំឱ្យគេរិះគន់ម្តងទៀត»",
            isCorrect: false,
          },
        ],
        explanation:
          "Correct. A growth mindset views critical feedback as valuable objective information that guides personal improvement rather than a lethal attack on your identity [1, 3].",
        kmExplanation:
          "ត្រឹមត្រូវណាស់។ ផ្នត់គំនិតរីកចម្រើនចាត់ទុកការរិះគន់ស្ថាបនាថាជាព័ត៌មានជាក់ស្តែងដ៏មានតម្លៃសម្រាប់ជួយកែលម្អខ្លួន មិនមែនជាការវាយប្រហារលើតម្លៃផ្ទាល់ខ្លួនឡើយ [1, 3]។",
      },
      keyPoints: [
        "A fixed mindset treats mistakes as verdicts: a growth mindset treats them as data [3].",
        "Effort and revision are the biological mechanisms of neural mastery.",
        "Add the magic word 'yet': 'I haven't mastered this concept yet.'",
      ],
      kmKeyPoints: [
        "ផ្នត់គំនិតជាប់គាំងចាត់ទុកកំហុសជាការកាត់ទោស៖ ផ្នត់គំនិតរីកចម្រើនចាត់ទុកវាជាទិន្នន័យ [3]។",
        "ការខិតខំ និងការកែតម្រូវ គឺជាយន្តការជីវសាស្ត្រនៃការអភិវឌ្ឍខួរក្បាល។",
        "បន្ថែមពាក្យ «មិនទាន់»៖ «ខ្ញុំមិនទាន់ចេះមេរៀននេះច្បាស់នៅឡើយទេ»។",
      ],
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "Practicing Self-Compassion over Harsh Self-Criticism",
      kmTitle: "ការអនុវត្តក្តីមេត្តាចំពោះខ្លួនឯង (Self-Compassion)",
      type: "reading",
      paragraphs: [
        "When things go wrong, many people unleash a vicious internal monologue: 'You fool, how could you be so clumsy?'",
        "Research from Harvard Health and clinical psychologist Dr. Kristin Neff shows that self-criticism does not motivate: it floods your bloodstream with stress hormones like cortisol, elevating anxiety and paralyzing problem-solving [2, 3].",
        "In contrast, practicing self-compassion activates the oxytocin and mammalian caregiving system, calming the amygdala and allowing you to rebound with energy.",
        "Adopt the Best Friend Rule [2, 3]:",
        "Imagine your closest, dearest friend walked into the room in tears, having failed an exam, botched an interview, or made an embarrassing social mistake.",
        "Would you look them in the eyes and sneer: 'You are worthless, and you will never succeed'?",
        "Never. You would offer a glass of water, put an arm around their shoulder, and say: 'I know how much this hurts. But you worked hard, this is one stumble, and I am right here with you.'",
        "You deserve the exact same gentleness and warmth from your own inner voice.",
      ],
      kmParagraphs: [
        "នៅពេលមានរឿងខុសឆ្គងកើតឡើង មនុស្សជាច្រើនតែងតែបើកការវាយប្រហារខ្លួនឯងដោយពាក្យសម្តីអាក្រក់ៗ៖ «ល្ងង់ណាស់ ហេតុអ្វីធ្វើរឿងឆ្កួតៗបែបនេះ?»",
        "ការស្រាវជ្រាវពីសាលាវេជ្ជសាស្ត្រ Harvard និងអ្នកចិត្តវិទ្យា Dr. Kristin Neff បង្ហាញថា ការបន្ទោសខ្លួនឯងមិនបានជួយជំរុញទឹកចិត្តនោះទេ៖ វាបង្កើនអ័រម៉ូនតានតឹង Cortisol ធ្វើឱ្យការថប់បារម្ភកើនឡើង និងរារាំងសមត្ថភាពដោះស្រាយបញ្ហា [2, 3]។",
        "ផ្ទុយទៅវិញ ការអនុវត្តក្តីមេត្តាចំពោះខ្លួនឯង ដាស់អ័រម៉ូននៃភាពកក់ក្តៅ Oxytocin ជួយឱ្យខួរក្បាលស្ងប់ និងជួយឱ្យអ្នកមានកម្លាំងចិត្តក្រោកឈរឡើងវិញបានលឿន។",
        "អនុវត្តច្បាប់មិត្តល្អបំផុត (Best Friend Rule) [2, 3]៖",
        "ស្រមៃថាមិត្តភក្តិដែលអ្នកស្រឡាញ់បំផុត បានដើរចូលមកក្នុងបន្ទប់ទាំងទឹកភ្នែក ដោយសារតែធ្លាក់ការប្រឡង បរាជ័យក្នុងការសម្ភាសន៍ ឬធ្វើរឿងខុសឆ្គងមួយ។",
        "តើអ្នកនឹងសម្លឹងមុខគេ ហើយនិយាយមើលងាយថា៖ «ឯងគ្មានតម្លៃទេ ឯងគ្មានថ្ងៃជោគជ័យឡើយ» មែនទេ?",
        "ពិតជាមិនអាចឡើយ។ អ្នកនឹងហុចទឹកមួយកែវ ឱបស្មាគេ ហើយនិយាយថា៖ «ខ្ញុំដឹងថាឯងឈឺចាប់។ ប៉ុន្តែឯងបានខិតខំប្រឹងប្រែងហើយ នេះគ្រាន់តែជាឧបសគ្គមួយពេលប៉ុណ្ណោះ ខ្ញុំនៅក្បែរឯងជានិច្ច»។",
        "អ្នកសមនឹងទទួលបានការលើកទឹកចិត្ត និងភាពទន់ភ្លន់បែបនេះពីសំឡេងខាងក្នុងចិត្តរបស់អ្នកដូចគ្នា។",
      ],
      keyPoints: [
        "Harsh self-criticism paralyzes the brain with cortisol and fear [2, 3].",
        "Self-compassion restores emotional equilibrium and constructive problem-solving.",
        "Apply the Best Friend Rule: speak to yourself with the same warmth you offer loved ones.",
      ],
      kmKeyPoints: [
        "ការបន្ទោសខ្លួនឯងយ៉ាងចាស់ដៃ ធ្វើឱ្យខួរក្បាលស្ពឹកស្រពន់ដោយសារភាពភ័យខ្លាច [2, 3]។",
        "ក្តីមេត្តាចំពោះខ្លួនឯង ស្តារឡើងវិញនូវតុល្យភាពអារម្មណ៍ និងការដោះស្រាយបញ្ហា។",
        "អនុវត្តច្បាប់មិត្តល្អបំផុត៖ និយាយជាមួយខ្លួនឯងដោយក្តីកក់ក្តៅ ដូចអ្នកនិយាយជាមួយមនុស្សជាទីស្រឡាញ់។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "The 'Good Enough' Principle and Lowering Artificial Stakes",
      kmTitle: "គោលការណ៍ «ល្អគ្រប់គ្រាន់» និងការបន្ថយសម្ពាធ (The Good Enough Standard)",
      type: "reading",
      paragraphs: [
        "Perfectionists treat every trivial task as if it were open-heart surgery, pouring 100% of their emotional energy into every email, note, and assignment [3].",
        "This inevitably leads to burnout and exhaustion. Mental health clinicians emphasize adopting the 'Good Enough' Principle [3]:",
        "• Differentiate critical tasks from routine tasks: Highly important tasks (such as final exams or official legal documents) warrant careful detail. Everyday tasks (like lecture notes, draft emails, or casual presentations) simply need to be clear and functional.",
        "• Give yourself permission to make 'messy first drafts': Whether writing an essay or learning to code, accept that early attempts will be unpolished. Polishing comes later.",
        "• Lower artificial stakes: Ask yourself the Decatastrophizing Question: 'If this does not go well, what is the realistic worst-case scenario? Will this matter in six months? Can I handle that outcome?' In almost every case, the answer is yes.",
      ],
      kmParagraphs: [
        "មនុស្សដែលស្រឡាញ់ភាពឥតខ្ចោះ តែងតែចាត់ទុកកិច្ចការតូចតាចគ្រប់យ៉ាងដូចជាការវះកាត់បេះដូង ដោយបញ្ចេញថាមពលផ្លូវចិត្ត ១០០% ទៅលើរាល់សារអ៊ីមែល កំណត់ត្រា និងកិច្ចការប្រចាំថ្ងៃ [3]។",
        "ទម្លាប់នេះច្បាស់ជានាំទៅរកការអស់កម្លាំងចិត្ត និងភាពតានតឹងរ៉ាំរ៉ៃ។ អ្នកជំនាញសុខភាពផ្លូវចិត្តណែនាំឱ្យអនុវត្តគោលការណ៍ «ល្អគ្រប់គ្រាន់» (The Good Enough Principle) [3]៖",
        "• បែងចែកកិច្ចការសំខាន់ និងកិច្ចការទូទៅ៖ កិច្ចការដែលសំខាន់បំផុត (ដូចជាការប្រឡងបញ្ចប់ ឬឯកសារច្បាប់) ទាមទារការផ្ចិតផ្ចង់។ ប៉ុន្តែកិច្ចការទូទៅប្រចាំថ្ងៃ (ដូចជាការកត់ត្រាមេរៀន ការផ្ញើសារ ឬបទបង្ហាញសាមញ្ញ) គ្រាន់តែទាមទារភាពច្បាស់លាស់ និងដំណើរការបានគឺគ្រប់គ្រាន់ហើយ។",
        "• អនុញ្ញាតឱ្យខ្លួនឯងធ្វើ «សេចក្តីព្រាងដំបូងដែលមិនទាន់ស្អាត»៖ មិនថាជាការសរសេរតែងសេចក្តី ឬការរៀនសរសេរកូដ សូមទទួលយកថាការសាកល្បងដំបូងនឹងមិនទាន់រលូនឡើយ។ ការកែសម្រួលនឹងមកដល់នៅពេលក្រោយ។",
        "• បន្ថយទំហំនៃបញ្ហា៖ សួរខ្លួនឯងនូវសំណួរស្វែងរកការពិត៖ «ប្រសិនបើរឿងនេះមិនដំណើរការល្អ តើរឿងអាក្រក់បំផុតដែលអាចកើតឡើងជាអ្វី? តើរឿងនេះនៅតែសំខាន់ក្នុងរយៈពេល ៦ ខែទៀតដែរឬទេ? តើខ្ញុំអាចដោះស្រាយវាបានទេ?» ស្ទើរតែគ្រប់ករណីទាំងអស់ ចម្លើយគឺអ្នកពិតជាអាចដោះស្រាយបាន។",
      ],
      keyPoints: [
        "Not every daily task requires 100% perfection: embrace 'good enough' to conserve energy [3].",
        "Allow messy first drafts in writing, art, studying, and speaking.",
        "Decatastrophizing proves that most setbacks have minor, survivable consequences.",
      ],
      kmKeyPoints: [
        "មិនមែនរាល់កិច្ចការប្រចាំថ្ងៃសុទ្ធតែទាមទារភាពឥតខ្ចោះទេ៖ ទទួលយកភាព «ល្អគ្រប់គ្រាន់» ដើម្បីសន្សំថាមពល [3]។",
        "អនុញ្ញាតឱ្យមានសេចក្តីព្រាងដំបូងដែលមិនទាន់ស្អាត ក្នុងការរៀនសូត្រ ការសរសេរ និងការងារ។",
        "ការពិនិត្យមើលការពិត បង្ហាញថាឧបសគ្គភាគច្រើនផ្តល់ផលវិបាកតិចតួច និងអាចដោះស្រាយបាន។",
      ],
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "Micro-Risk Taking: The Gradual Courage Ladder",
      kmTitle: "ការប្រថុយជំហានតូចៗ៖ កាំជណ្ដើរនៃភាពក្លាហាន (Micro-Risk Taking)",
      type: "reading",
      paragraphs: [
        "Courage is not the absence of fear: it is the realization that something else matters more than fear.",
        "The fastest way to dismantle atychiphobia is through intentional micro-risk experiments [1, 3]. By deliberately taking small, low-stakes risks where imperfection might happen, you show your nervous system that making a mistake does not lead to annihilation:",
        "• Experiment 1: Ask a question during class or a webinar without rehearsing it three times in your head.",
        "• Experiment 2: Submit a draft assignment that is 85% polished instead of spending 10 more hours obsessing over commas.",
        "• Experiment 3: Say 'I am not sure of the answer, but let me look it up' in front of peers.",
        "• Experiment 4: Try a new activity or sport where you are guaranteed to be a beginner who fumbles.",
        "After each experiment, observe reality: Did people reject you? Did the sky fall? By surviving small imperfections, you build unshakeable real-world confidence.",
      ],
      kmParagraphs: [
        "ភាពក្លាហានមិនមែនជាការគ្មានការភ័យខ្លាចនោះទេ៖ វាជាការដឹងថាមានរឿងមួយផ្សេងទៀតដែលសំខាន់ជាងការភ័យខ្លាច។",
        "វិធីសាស្ត្រលឿនបំផុតដើម្បីរំលាយការភ័យខ្លាចការបរាជ័យ គឺតាមរយៈការពិសោធន៍ប្រថុយជំហានតូចៗ (Micro-Risk Experiments) [1, 3]។ តាមរយៈការហ៊ានប្រឈមនឹងស្ថានភាពតូចៗដែលកំហុសអាចកើតឡើង អ្នកនឹងបង្ហាញប្រព័ន្ធប្រសាទរបស់អ្នកថា កំហុសមិនបាននាំមកនូវគ្រោះថ្នាក់ដល់ជីវិតឡើយ៖",
        "• ការពិសោធន៍ទី ១៖ សួរសំណួរមួយក្នុងថ្នាក់រៀន ដោយមិនបាច់ហាត់សមពាក្យក្នុងក្បាល ៣ ដងជាមុន។",
        "• ការពិសោធន៍ទី ២៖ ប្រគល់កិច្ចការដែលធ្វើបានល្អ ៨៥% ជាជាងការចំណាយពេល ១០ ម៉ោងទៀតដើម្បីអង្គុយខ្វល់រឿងសញ្ញាក្បៀស។",
        "• ការពិសោធន៍ទី ៣៖ ហ៊ាននិយាយពាក្យថា «ខ្ញុំមិនទាន់ដឹងច្បាស់ពីចម្លើយនេះទេ ប៉ុន្តែចាំខ្ញុំស្រាវជ្រាវបន្ថែម» នៅមុខមិត្តភក្តិ។",
        "• ការពិសោធន៍ទី ៤៖ សាកល្បងសកម្មភាពថ្មី ឬកីឡាថ្មី ដែលអ្នកដឹងច្បាស់ថាអ្នកជាមនុស្សទើបតែចាប់ផ្តើមដំបូងដែលត្រូវតែឆ្គង។",
        "បន្ទាប់ពីការពិសោធន៍នីមួយៗ សូមសង្កេតមើលការពិតជាក់ស្តែង៖ តើមានគេបដិសេធអ្នកទេ? តើពិភពលោកបានបែកបាក់ទេ? តាមរយៈការឆ្លងកាត់ភាពមិនល្អឥតខ្ចោះតូចៗទាំងនេះ អ្នកនឹងកសាងទំនុកចិត្តពិតប្រាកដដែលមិនអាចរង្គោះរង្គើបាន។",
      ],
      keyPoints: [
        "Intentional micro-risks desensitize your nervous system to the pain of mistakes [1, 3].",
        "Saying 'I don't know' or submitting functional drafts builds genuine psychological stamina.",
        "Surviving minor stumbles proves that imperfection is manageable and harmless.",
      ],
      kmKeyPoints: [
        "ការហ៊ានប្រថុយជំហានតូចៗជួយឱ្យប្រព័ន្ធប្រសាទស៊ាំនឹងភាពមិនស្រួលនៃកំហុស [1, 3]។",
        "ការហ៊ាននិយាយថា «ខ្ញុំមិនដឹង» ឬការប្រគល់ការងារសមស្រប កសាងភាពរឹងមាំផ្លូវចិត្តពិតប្រាកដ។",
        "ការឆ្លងកាត់ឧបសគ្គតូចៗ បង្ហាញថាភាពមិនល្អឥតខ្ចោះគឺជារឿងធម្មតា និងគ្មានគ្រោះថ្នាក់ឡើយ។",
      ],
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "Somatic Grounding When Shame or Panic Strikes",
      kmTitle: "ការរំងាប់រាងកាយនៅពេលមានអារម្មណ៍ខ្មាសអៀន (Somatic Grounding)",
      type: "reading",
      paragraphs: [
        "When an error occurs, your brain interprets social disapproval as a threat of social exile, triggering a rush of adrenaline and shame.",
        "You might feel burning heat in your face, a dropping pit in your stomach, trembling fingers, or an overwhelming urge to disappear.",
        "Do not fight these physical waves. Use somatic self-soothing to settle your physiological response [2, 3]:",
        "1. Hand-on-Heart Soothing: Place one warm hand gently over your chest or upper sternum. The warmth and gentle pressure stimulate oxytocin release, signaling physical warmth and safety to your brain.",
        "2. Long Audible Exhales: Take a slow breath through your nose and release a long, sighing exhale through parted lips. Sighing resets autonomic nervous tension.",
        "3. Sip Cool Water: Cool water stimulates the swallowing reflex and interrupts sympathetic hyperarousal.",
        "4. Compassionate Grounding Mantra: Whisper silently to yourself: 'This is a moment of discomfort. Discomfort is part of learning. May I be kind to myself right now.'",
      ],
      kmParagraphs: [
        "នៅពេលមានកំហុសកើតឡើង ខួរក្បាលតែងតែបកស្រាយការមិនពេញចិត្តរបស់អ្នកដទៃ ថាជាការគំរាមកំហែងនៃការត្រូវគេបោះបង់ចោល ដែលបង្កឱ្យមានអ័រម៉ូន Adrenaline និងភាពខ្មាសអៀនយ៉ាងខ្លាំង។",
        "អ្នកអាចមានអារម្មណ៍ក្តៅភាយៗលើផ្ទៃមុខ ចុកណែនក្នុងពោះ ញ័រចុងដៃ ឬមានអារម្មណ៍ចង់តែបាត់ខ្លួនមួយភ្លែត។",
        "កុំព្យាយាមប្រយុទ្ធប្រឆាំងនឹងប្រតិកម្មរាងកាយទាំងនេះ។ សូមប្រើប្រាស់វិធីសាស្ត្ររំងាប់រាងកាយ ដើម្បីសម្រួលប្រព័ន្ធប្រសាទ [2, 3]៖",
        "១. ដាក់ដៃលើទ្រូង៖ ដាក់បាតដៃដ៏កក់ក្តៅថ្នមៗលើទ្រូងខាងឆ្វេង។ ភាពកក់ក្តៅ និងការប៉ះពាល់ថ្នមៗ ជួយដាស់អ័រម៉ូន Oxytocin និងបញ្ជូនសញ្ញានៃសុវត្ថិភាពទៅកាន់ខួរក្បាល។",
        "២. ដកដង្ហើមវែងៗ និងបញ្ចេញខ្យល់ដោយដកដង្ហើមធំ៖ ដកដង្ហើមចូលយឺតៗតាមច្រមុះ ហើយបញ្ចេញខ្យល់តាមមាត់យឺតៗ។ ការបញ្ចេញដង្ហើមវែងៗជួយសម្រាលភាពតានតឹងស្វ័យប្រវត្តិនៃរាងកាយ។",
        "៣. ញ៉ាំទឹកត្រជាក់មួយក្អឹក៖ ទឹកត្រជាក់ជួយដាស់ការលេប និងកាត់ផ្តាច់អាការភ័យស្លន់ស្លោ។",
        "៤. ពាក្យរំឭកចិត្តប្រកបដោយក្តីមេត្តា៖ ខ្សឹបប្រាប់ខ្លួនឯងដោយស្ងៀមស្ងាត់៖ «នេះគ្រាន់តែជាអារម្មណ៍មិនស្រួលមួយភ្លែតប៉ុណ្ណោះ។ ភាពមិនស្រួលគឺជាផ្នែកមួយនៃការរៀនសូត្រ។ ខ្ញុំសូមផ្តល់ក្តីមេត្តាចំពោះខ្លួនឯងនៅពេលនេះ»។",
      ],
      alertBox: {
        type: "tip",
        text: "AROM Somatic Calming: When experiencing a wave of shame after a setback, open AROM and practice the '1-Minute Calming Breath' to stabilize your nervous system.",
        kmText:
          "ការរំងាប់រាងកាយលើ AROM៖ នៅពេលមានអារម្មណ៍ខ្មាសអៀន ឬតានតឹងបន្ទាប់ពីមានកំហុស សូមបើក AROM ហើយអនុវត្ត '1-Minute Calming Breath' ដើម្បីឱ្យប្រព័ន្ធប្រសាទស្ងប់ចុះមកវិញ។",
      },
      keyPoints: [
        "Shame and panic produce somatic heat, stomach drops, and trembling [2, 3].",
        "Soothing touch (hand on heart) and long exhales activate mammalian calming pathways.",
        "Gentle words break the cycle of internal self-punishment.",
      ],
      kmKeyPoints: [
        "ភាពខ្មាសអៀន និងការភ័យស្លន់ស្លោ បង្កឱ្យក្តៅមុខ ចុកពោះ និងញាប់ញ័រ [2, 3]។",
        "ការដាក់ដៃលើទ្រូង និងការបញ្ចេញខ្យល់វែងៗ ជួយដាស់ប្រព័ន្ធប្រសាទឱ្យស្ងប់។",
        "ពាក្យសម្តីទន់ភ្លន់ជួយកាត់ផ្តាច់ទម្លាប់ដាក់ទណ្ឌកម្មលើខ្លួនឯង។",
      ],
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "When to Seek Professional Support",
      kmTitle: "ពេលវេលាដែលត្រូវស្វែងរកជំនួយពីអ្នកជំនាញ (When to Seek Help)",
      type: "reading",
      paragraphs: [
        "While self-guided tools help loosen the grip of perfectionism, fear of failure can sometimes become deeply entrenched and debilitating [1, 3].",
        "Consider seeking guidance from a licensed therapist or psychologist if [1, 3]:",
        "• Fear of failure prevents you from completing your studies, holding a job, or pursuing healthy relationships.",
        "• You experience persistent panic attacks, chronic insomnia, or severe depressive episodes whenever evaluated.",
        "• You find yourself trapped in severe compulsive checking, eating disturbances, or obsessive perfectionism.",
        "• You feel chronic feelings of worthlessness, shame, or despair.",
        "Evidence-based therapies like Cognitive Behavioral Therapy (CBT) and Acceptance and Commitment Therapy (ACT) are extraordinarily effective at helping individuals untangle their identity from external performance [1, 3].",
        "Remember: Reaching out for professional guidance is not proof of failure: it is the ultimate act of self-respect and courage.",
      ],
      kmParagraphs: [
        "ខណៈពេលដែលឧបករណ៍ជួយខ្លួនឯងជួយសម្រាលសម្ពាធនៃភាពឥតខ្ចោះ ការភ័យខ្លាចការបរាជ័យក៏អាចចាក់ឫសយ៉ាងជ្រៅ និងធ្វើឱ្យជីវិតស្ទះដំណើរការផងដែរ [1, 3]។",
        "សូមពិចារណាស្វែងរកការប្រឹក្សាពីអ្នកជំនាញចិត្តសាស្ត្រ ឬអ្នកព្យាបាល ប្រសិនបើ [1, 3]៖",
        "• ការភ័យខ្លាចការបរាជ័យរារាំងអ្នកពីការរៀនសូត្រ ការបំពេញការងារ ឬការកសាងទំនាក់ទំនងល្អ។",
        "• អ្នកជួបប្រទះអាការស្លន់ស្លោ ការគេងមិនលក់រ៉ាំរ៉ៃ ឬការបាក់ទឹកចិត្តធ្ងន់ធ្ងរ រាល់ពេលមានការវាយតម្លៃ។",
        "• អ្នកធ្លាក់ចូលទៅក្នុងទម្លាប់ផ្ទៀងផ្ទាត់ដដែលៗដោយបង្ខំ បញ្ហាការញ៉ាំអាហារ ឬភាពឥតខ្ចោះហួសហេតុ។",
        "• អ្នកមានអារម្មណ៍អស់សង្ឃឹម ខ្មាសអៀន ឬគិតថាខ្លួនឯងគ្មានតម្លៃជាប់ជាប្រចាំ។",
        "វិធីសាស្ត្រព្យាបាលផ្អែកលើវិទ្យាសាស្ត្រដូចជា CBT និង ACT មានប្រសិទ្ធភាពខ្ពស់ក្នុងការជួយបុគ្គលម្នាក់ៗបែងចែកតម្លៃពិតរបស់ខ្លួន ឱ្យដាច់ចេញពីលទ្ធផលការងារ [1, 3]។",
        "ចូរចងចាំថា៖ ការស្វែងរកជំនួយពីអ្នកជំនាញ មិនមែនជាការបរាជ័យនោះឡើយ៖ វាជាទង្វើដ៏ក្លាហានបំផុតនៃការគោរព និងស្រឡាញ់ខ្លួនឯង។",
      ],
      alertBox: {
        type: "tip",
        text: "AROM Professional Matching: Connect confidentially with certified youth counselors and clinical psychologists on AROM specializing in perfectionism, academic pressure, and self-esteem.",
        kmText:
          "ការស្វែងរកអ្នកជំនាញ AROM៖ ភ្ជាប់ការប្រឹក្សាជាសម្ងាត់ជាមួយអ្នកប្រឹក្សា និងអ្នកជំនាញចិត្តសាស្ត្រលើ AROM ដែលមានជំនាញក្នុងការព្យាបាលភាពឥតខ្ចោះ សម្ពាធការសិក្សា និងការកសាងតម្លៃខ្លួនឯង។",
      },
      keyPoints: [
        "Seek therapy when fear of failure causes chronic avoidance, insomnia, or despair [1, 3].",
        "CBT and ACT provide proven roadmaps to rebuild unconditional self-worth.",
        "AROM enables private, secure bookings with verified psychologists in Cambodia.",
      ],
      kmKeyPoints: [
        "ស្វែងរកជំនួយពីអ្នកជំនាញនៅពេលការភ័យខ្លាចបង្កការគេចវេះ ការគេងមិនលក់ ឬភាពអស់សង្ឃឹម [1, 3]។",
        "ការព្យាបាល CBT និង ACT ផ្តល់មាគ៌ាដ៏រឹងមាំដើម្បីកសាងតម្លៃខ្លួនឯងឡើងវិញ។",
        "AROM ផ្តល់ភាពងាយស្រួលក្នុងការកក់ការប្រឹក្សាជាសម្ងាត់ជាមួយអ្នកជំនាញនៅកម្ពុជា។",
      ],
    },
    {
      id: 10,
      sectionNumber: 10,
      title: "Personal Reflection in AROM Journal",
      kmTitle: "ការឆ្លុះបញ្ចាំងផ្ទាល់ខ្លួនក្នុងកំណត់ហេតុ AROM (Reflection Activity)",
      type: "reflection",
      paragraphs: [
        "Take a few quiet minutes to examine your personal relationship with mistakes. You can explore these five prompts privately in your personal AROM Journal:",
        "1. What is one goal, project, or conversation that I have been delaying out of fear of making a mistake?",
        "2. What does my internal critic usually whisper when I stumble or receive feedback?",
        "3. What is the realistic worst-case scenario if things do not go as planned, and could I survive it?",
        "4. How would I respond with compassion if a dear friend experienced this exact setback?",
        "5. What is one small 'messy' action I can courageously take today without demanding perfection?",
        "There are no grades or scores here. This reflection is your safe space for growth.",
      ],
      kmParagraphs: [
        "ឆ្លៀតពេលស្ងប់ស្ងាត់ពីរបីនាទី ដើម្បីពិនិត្យមើលទំនាក់ទំនងផ្ទាល់ខ្លួនរបស់អ្នកជាមួយនឹងកំហុសឆ្គង។ អ្នកអាចឆ្លុះបញ្ចាំងពីសំណួរទាំង ៥ នេះជាឯកជន នៅក្នុងកំណត់ហេតុ AROM របស់អ្នក៖",
        "១. តើអ្វីជាគោលដៅ គម្រោង ឬការសន្ទនាមួយ ដែលខ្ញុំបានពន្យារពេលដោយសារខ្លាចធ្វើមិនបានល្អ?",
        "២. តើសំឡេងរិះគន់ក្នុងចិត្តរបស់ខ្ញុំតែងតែខ្សឹបប្រាប់អ្វី នៅពេលខ្ញុំជួបឧបសគ្គ ឬទទួលបានការរិះគន់?",
        "៣. តើរឿងអាក្រក់បំផុតដែលអាចកើតឡើងជាអ្វី ប្រសិនបើអ្វីៗមិនដំណើរការតាមការគ្រោងទុក ហើយតើខ្ញុំអាចរស់នៅបន្តបានទេ?",
        "៤. តើខ្ញុំនឹងឆ្លើយតបដោយក្តីមេត្តាយ៉ាងដូចម្តេច ប្រសិនបើមិត្តភក្តិជិតស្និទ្ធជួបឧបសគ្គដូចគ្នានេះ?",
        "៥. តើអ្វីជាសកម្មភាពតូចមួយដែលខ្ញុំអាចធ្វើបាននៅថ្ងៃនេះ ដោយមិនចាំបាច់ទាមទារភាពល្អឥតខ្ចោះ?",
        "គ្មានពិន្ទុ ឬការវាយតម្លៃនៅទីនេះឡើយ។ ការឆ្លុះបញ្ចាំងនេះគឺជាទីកន្លែងសុវត្ថិភាពសម្រាប់ការរីកចម្រើនរបស់អ្នក។",
      ],
      reflection: {
        question: "When you reflect on making a mistake in your life, what thought causes you the greatest distress?",
        kmQuestion: "នៅពេលអ្នកគិតដល់ការធ្វើខុសក្នុងជីវិត តើគំនិតមួយណាដែលធ្វើឱ្យអ្នកឈឺចាប់ខ្លាំងបំផុត?",
        options: [
          "The fear that people will judge me, lose respect, or think I am incompetent",
          "The fear of disappointing my parents and family after all their sacrifices",
          "The inner harsh voice telling me that I am fundamentally a failure",
          "The dread that one setback will permanently ruin all my future opportunities",
        ],
        kmOptions: [
          "ការភ័យខ្លាចគេវិនិច្ឆ័យ បាត់បង់ការគោរព ឬគិតថាខ្ញុំគ្មានសមត្ថភាព",
          "ការភ័យខ្លាចធ្វើឱ្យឪពុកម្តាយ និងគ្រួសារខកចិត្ត បន្ទាប់ពីការលះបង់របស់ពួកគាត់",
          "សំឡេងរិះគន់ខាងក្នុងចិត្តដែលប្រាប់ថាខ្ញុំជាមនុស្សបរាជ័យតាំងពីកំណើត",
          "ការភ័យខ្លាចថាឧបសគ្គមួយនេះ នឹងបំផ្លាញឱកាសអនាគតទាំងអស់ជារៀងរហូត",
        ],
        feedbackMessage:
          "Thank you for honoring your truth. Remember: you are allowed to be imperfect. A stumble does not erase your worth, your intelligence, or your future. Healing begins when you meet mistakes with curiosity rather than shame.",
        kmFeedbackMessage:
          "អរគុណដែលបានស្មោះត្រង់ចំពោះអារម្មណ៍ខ្លួនឯង។ ចូរចងចាំថា៖ អ្នកត្រូវបានអនុញ្ញាតឱ្យមានកំហុស។ ឧបសគ្គមួយមិនអាចលុបបំបាត់តម្លៃ ភាពឆ្លាតវៃ ឬអនាគតរបស់អ្នកបានឡើយ។ ការព្យាបាលចិត្តចាប់ផ្តើមនៅពេលអ្នកប្រឈមមុខនឹងកំហុសដោយការចង់រៀនសូត្រ ជាជាងភាពខ្មាសអៀន។",
      },
      keyPoints: [
        "Unpacking the roots of your fear dismantles its power over your daily decisions.",
        "Reframing mistakes with self-compassion protects your self-esteem and energy.",
        "One small courageous action today builds enduring real-world confidence.",
      ],
      kmKeyPoints: [
        "ការស្វែងយល់ពីឫសគល់នៃការភ័យខ្លាច ជួយកាត់បន្ថយឥទ្ធិពលរបស់វាលើការសម្រេចចិត្តប្រចាំថ្ងៃ។",
        "ការកែសម្រួលគំនិតដោយក្តីមេត្តា ការពារតម្លៃខ្លួនឯង និងថាមពលផ្លូវចិត្តរបស់អ្នក។",
        "សកម្មភាពក្លាហានតូចមួយនៅថ្ងៃនេះ កសាងទំនុកចិត្តជាក់ស្តែងដ៏យូរអង្វែង។",
      ],
    },
    {
      id: 11,
      sectionNumber: 11,
      title: "Next Steps and Support on AROM",
      kmTitle: "ជំហានបន្ទាប់ និងការគាំទ្រនៅលើ AROM (Next Steps & Support)",
      type: "coping",
      paragraphs: [
        "Freeing yourself from the fear of failure is not about becoming careless. It is about realizing that you are allowed to be human, to learn in public, and to stumble on the road to growth.",
        "You do not need to wait until you feel 100% fearless to start living. You can feel nervous and still take meaningful steps forward.",
        "On AROM, compassionate tools and clinical specialists are here to walk with you:",
        "• AROM Private Journal: Record messy first drafts, challenge harsh self-critical thoughts, and track your daily courage wins in total confidentiality.",
        "• AROM Calming Practices: Practice the 1-Minute Calming Breath whenever a surge of panic or shame appears after an error.",
        "• AROM Verified Professional Care: Connect privately with licensed psychologists and youth counselors specializing in perfectionism, academic stress, and healthy self-esteem in Cambodia.",
        "• Crisis Support: If emotional distress ever feels unbearable, tap 'Get help now' in your Profile for instant access to free crisis resources.",
        "Your worth is already whole and unconditional. Take a deep breath, let go of perfection, and take your next courageous step.",
      ],
      kmParagraphs: [
        "ការរំដោះខ្លួនចេញពីការភ័យខ្លាចការបរាជ័យ មិនមែនជាការបណ្តោយខ្លួនដោយគ្មានការទទួលខុសត្រូវនោះទេ។ វាគឺអំពីការដឹងថា អ្នកត្រូវបានអនុញ្ញាតឱ្យធ្វើជាមនុស្សធម្មតា ហ៊ានរៀនសូត្រ និងហ៊ានជួបឧបសគ្គនៅលើមាគ៌ានៃការរីកចម្រើន។",
        "អ្នកមិនចាំបាច់រង់ចាំដល់មានអារម្មណ៍ក្លាហាន ១០០% ទើបចាប់ផ្តើមរស់នៅនោះទេ។ អ្នកអាចមានអារម្មណ៍ភ័យខ្លះ ប៉ុន្តែនៅតែអាចបោះជំហានដ៏មានន័យទៅមុខ។",
        "នៅលើកម្មវិធី AROM ឧបករណ៍សុខុមាលភាព និងអ្នកជំនាញជាច្រើនបានត្រៀមខ្លួនរួចជាស្រេចដើម្បីរួមដំណើរជាមួយអ្នក៖",
        "• កំណត់ហេតុឯកជន AROM (Private Journal)៖ កត់ត្រាសេចក្តីព្រាងដំបូង កែតម្រូវសំឡេងបន្ទោសខ្លួនឯង និងកត់ត្រាជោគជ័យនៃភាពក្លាហានប្រចាំថ្ងៃជាសម្ងាត់ទាំងស្រុង។",
        "• លំហាត់ស្ងប់ចិត្ត AROM (Practices)៖ អនុវត្តការដកដង្ហើមស្ងប់ចិត្ត ១ នាទី នៅពេលណាដែលមានអារម្មណ៍ភ័យ ឬខ្មាសអៀនកើតឡើង។",
        "• ការប្រឹក្សាជាមួយអ្នកជំនាញ AROM (Professional Care)៖ ភ្ជាប់ការប្រឹក្សាជាសម្ងាត់ជាមួយអ្នកចិត្តសាស្ត្រ និងអ្នកប្រឹក្សាយុវជនដែលមានជំនាញក្នុងការព្យាបាលភាពឥតខ្ចោះ សម្ពាធការសិក្សា និងការកសាងតម្លៃខ្លួនឯងនៅកម្ពុជា។",
        "• ជំនួយសង្គ្រោះបន្ទាន់ (Crisis Support)៖ ប្រសិនបើទុក្ខព្រួយផ្លូវចិត្តមានសភាពធ្ងន់ធ្ងរខ្លាំង សូមចុច 'Get help now' ក្នុង Profile ដើម្បីទទួលបានទំនាក់ទំនងបន្ទាន់ភ្លាមៗ។",
        "តម្លៃរបស់អ្នកគឺពេញលេញ និងគ្មានលក្ខខណ្ឌរួចជាស្រេចហើយ។ ដកដង្ហើមវែងៗ លះបង់ភាពឥតខ្ចោះចោល ហើយបោះជំហានដ៏ក្លាហានបន្ទាប់របស់អ្នក។",
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
        "Unconditional self-worth exists independent of grades, output, or perfection [1, 2].",
        "AROM Journal and Calming Practices support your emotional courage every day.",
        "Verified counselors on AROM offer confidential, compassionate care tailored to your needs.",
      ],
      kmKeyPoints: [
        "តម្លៃខ្លួនឯងពិតប្រាកដកើតមានដោយគ្មានលក្ខខណ្ឌ ដោយមិនអាស្រ័យលើពិន្ទុ ឬភាពឥតខ្ចោះឡើយ [1, 2]។",
        "កំណត់ហេតុ និងការដកដង្ហើមលើ AROM ជួយគាំទ្រភាពក្លាហានផ្លូវចិត្តរបស់អ្នកជារៀងរាល់ថ្ងៃ។",
        "អ្នកជំនាញនៅលើ AROM ផ្តល់ការប្រឹក្សាប្រកបដោយការសម្ងាត់ និងការយល់ចិត្តដែលសមស្របនឹងតម្រូវការរបស់អ្នក។",
      ],
    },
  ],
};


export const REFERENCES_BALANCE_LIFE: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "WHO",
    title: "World Health Organization: Burnout an Occupational Phenomenon (ICD-11)",
    url: "https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases",
  },
  {
    id: 2,
    citation: "[2]",
    source: "APA",
    title: "American Psychological Association: The Myth of Multitasking and Setting Boundaries",
    url: "https://www.apa.org/topics/stress/boundaries",
  },
  {
    id: 3,
    citation: "[3]",
    source: "Harvard Health",
    title: "Harvard Health Publishing: Managing Energy, Not Just Time, to Prevent Exhaustion",
    url: "https://www.health.harvard.edu/mind-and-mood/preventing-burnout-restoring-energy",
  },
  {
    id: 4,
    citation: "[4]",
    source: "NHS Every Mind Matters",
    title: "NHS Every Mind Matters: Coping With Study and Work Stress",
    url: "https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/coping-with-study-and-work-stress/",
  },
  {
    id: 5,
    citation: "[5]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia: Youth Mental Health, Education, and Economic Pressures",
    url: "https://www.unicef.org/cambodia/mental-health",
  },
];

export const LESSON_BALANCE_STUDY_WORK_LIFE: Lesson = {
  id: "how-to-balance-study-work-life",
  title: "How to Balance Study, Work, and Life",
  kmTitle: "របៀបបង្កើតតុល្យភាពរវាងការសិក្សា ការងារ និងជីវិតផ្ទាល់ខ្លួន (How to Balance Study, Work, and Life)",
  subtitle: "Learn realistic ways to manage competing responsibilities and protect your mental well-being",
  kmSubtitle: "រៀនវិធីជាក់ស្តែងដើម្បីគ្រប់គ្រងទំនួលខុសត្រូវច្រើនក្នុងពេលតែមួយ និងការពារសុខុមាលភាពផ្លូវចិត្ត",
  category: "Burnout",
  duration: "8 min",
  kmDuration: "៨ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Practice",
  kmFormat: "ការអាន និងការអនុវត្ត (Reading & Practice)",
  isAvailable: true,
  image: "/mindguide/strategies.png",
  heroImage: "/mindguide/balance-study-work-hero.jpg",
  badge: "Essential",
  description:
    "Unpack realistic strategies to juggle study, jobs, and personal needs without burning out. Learn to manage your energy batteries, set healthy boundaries, practice micro-rest, and quiet guilt on AROM.",
  kmDescription:
    "ស្វែងយល់ពីយុទ្ធសាស្ត្រជាក់ស្តែងក្នុងការគ្រប់គ្រងការរៀនសូត្រ ការងារ និងជីវិតផ្ទាល់ខ្លួនដោយមិនអស់កម្លាំងចិត្ត។ រៀនគ្រប់គ្រងថាមពល កំណត់ព្រំដែនសុខភាពល្អ និងកាត់បន្ថយអារម្មណ៍ខុសនៅលើ AROM។",
  totalSections: 11,
  outcomes: [
    {
      en: "Understand why rigid 50/50 balance is an unhelpful myth and adopt dynamic equilibrium [1, 2]",
      km: "យល់ដឹងពីមូលហេតុដែលតុល្យភាពស្មើគ្នា ៥០/៥០ គឺជាការស្រមើស្រមៃ និងទទួលយកលំនឹងជាក់ស្តែង [1, 2]",
    },
    {
      en: "Recognize the early physical, emotional, and cognitive warning signs of systemic burnout [1, 3]",
      km: "សម្គាល់សញ្ញាព្រមានដំបូងនៃរាងកាយ អារម្មណ៍ និងការគិតនៃការអស់កម្លាំងចិត្តកម្រិតរ៉ាំរ៉ៃ [1, 3]",
    },
    {
      en: "Navigate Cambodian cultural pressures of dual-shift routines, family expectations, and rest guilt [4, 5]",
      km: "គ្រប់គ្រងសម្ពាធវប្បធម៌កម្ពុជាក្នុងការរៀនបណ្តើរធ្វើការបណ្តើរ ការរំពឹងទុករបស់គ្រួសារ និងការបន្ទោសខ្លួន [4, 5]",
    },
    {
      en: "Manage your 4 energy batteries: physical, mental, emotional, and spiritual, rather than just chasing hours [3]",
      km: "គ្រប់គ្រងអាគុយថាមពលទាំង ៤ គឺរាងកាយ ការផ្តោតអារម្មណ៍ អារម្មណ៍ផ្លូវចិត្ត និងអត្ថន័យជីវិត [3]",
    },
    {
      en: "Set assertive, respectful boundaries at university, work, and home using calm communication scripts [2, 4]",
      km: "កំណត់ព្រំដែនដោយម៉ឺងម៉ាត់ និងទន់ភ្លន់នៅសាលារៀន កន្លែងធ្វើការ និងផ្ទះដោយប្រើពាក្យសម្តីសមរម្យ [2, 4]",
    },
    {
      en: "Integrate micro-rest transitions and reflect safely with AROM Journal and professional counselors [4, 5]",
      km: "អនុវត្តការសម្រាកខ្លីៗរវាងភារកិច្ច និងឆ្លុះបញ្ចាំងសុវត្ថិភាពជាមួយកំណត់ហេតុ និងអ្នកជំនាញ AROM [4, 5]",
    },
  ],
  references: REFERENCES_BALANCE_LIFE,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "The Reality of Competing Demands: Why Perfect Balance Is a Myth",
      kmTitle: "ការពិតនៃទំនួលខុសត្រូវចម្រុះ៖ ហេតុអ្វីតុល្យភាពដ៏ល្អឥតខ្ចោះគ្រាន់តែជាការស្រមើស្រមៃ (The Reality of Competing Demands)",
      type: "reading",
      paragraphs: [
        "Do you ever feel like you are running on a treadmill that never slows down? You wake up early to commute through heavy traffic, work an eight-hour shift, rush to university evening classes, and return home only to face assignments, family responsibilities, and endless messages.",
        "Many of us carry an unrealistic image of balance. We imagine a calm, flawless life where every single day provides equal hours for studying, career ambition, family time, social connection, and peaceful sleep. When life does not look like this fantasy, we blame ourselves for being disorganized or undisciplined.",
        "Clinical research from the American Psychological Association shows that balance is not a static, 50/50 division of hours [2]. Life is dynamic, like riding a bicycle. Balance means making continuous micro-adjustments as conditions change, leaning into study during exam periods, leaning into work deadlines, and deliberately pulling back to recharge before exhaustion takes over.",
      ],
      kmParagraphs: [
        "តើអ្នកធ្លាប់មានអារម្មណ៍ថាអ្នកកំពុងរត់នៅលើខ្សែរត់ហាត់ប្រាណដែលមិនចេះឈប់ដែរឬទេ? អ្នកក្រោកពីព្រលឹមដើម្បីធ្វើដំណើរឆ្លងកាត់ការកកស្ទះចរាចរណ៍ ធ្វើការពេញម៉ោង ៨ ម៉ោង រួចប្រញាប់ប្រញាល់ទៅរៀនថ្នាក់យប់នៅសាកលវិទ្យាល័យ ហើយត្រឡប់មកផ្ទះវិញជួបកិច្ចការស្រាវជ្រាវ ទំនួលខុសត្រូវគ្រួសារ និងសារការងារជាច្រើនទៀត។",
        "មនុស្សជាច្រើនតែងតែស្រមើស្រមៃអំពីរូបភាពមិនពិតនៃតុល្យភាព។ យើងគិតថាជីវិតដែលមានតុល្យភាព គឺជាជីវិតដែលបែងចែកម៉ោងស្មើៗគ្នារវាងការរៀនសូត្រ ការងារ គ្រួសារ មិត្តភក្តិ និងការគេងលក់ស្កប់ស្កល់ជារៀងរាល់ថ្ងៃ។ នៅពេលដែលជីវិតមិនដូចការស្រមើស្រមៃនេះ យើងចាប់ផ្តើមបន្ទោសខ្លួនឯងថាជាមនុស្សខ្វះវិន័យ ឬមិនចេះចាត់ចែងពេលវេលា។",
        "ការស្រាវជ្រាវគ្លីនិកពីសមាគមចិត្តវិទ្យាអាមេរិក (APA) បង្ហាញថាតុល្យភាពមិនមែនជាការចែកម៉ោង ៥០/៥០ ដ៏តឹងរ៉ឹងនោះឡើយ [2]។ ជីវិតមានភាពបត់បែន ដូចជាការជិះកង់អញ្ចឹងដែរ។ តុល្យភាពមានន័យថាជាការសម្របសម្រួលជាប្រចាំទៅតាមកាលៈទេសៈជាក់ស្តែង ផ្ដោតលើការរៀននៅរដូវប្រឡង ផ្ដោតលើគម្រោងការងារបន្ទាន់ ហើយដកថយមកសម្រាកបំពេញថាមពលវិញ មុនពេលរាងកាយអស់កម្លាំង។",
      ],
      keyPoints: [
        "Balance is dynamic rhythm, not a rigid 24-hour mathematical division [2].",
        "Having multiple responsibilities does not make you disorganized; modern life is genuinely demanding.",
        "Sustainability comes from adjusting your pace rather than demanding perfection every day.",
      ],
      kmKeyPoints: [
        "តុល្យភាពគឺជាចលនាលំនឹងដែលបត់បែន មិនមែនជាការចែកម៉ោងស្មើគ្នាដ៏តឹងតែងឡើយ [2]។",
        "ការមានបន្ទុកទំនួលខុសត្រូវច្រើន មិនមែនមានន័យថាអ្នកខ្វះវិន័យនោះទេ ពីព្រោះជីវិតបច្ចុប្បន្នពិតជាមានភាពមមាញឹកខ្លាំង។",
        "និរន្តរភាពកើតចេញពីការកែសម្រួលល្បឿនជីវិត មិនមែនកើតចេញពីការទាមទារភាពឥតខ្ចោះគ្រប់ពេលនោះទេ។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "The Hidden Cost: Recognizing Signs of Overload and Burnout [1, 3]",
      kmTitle: "ផលប៉ះពាល់លាក់កំបាំង៖ ការសម្គាល់សញ្ញានៃការលើសចំណុះ និងភាពអស់កម្លាំងចិត្ត (Signs of Overload and Burnout)",
      type: "reading",
      paragraphs: [
        "When competing obligations overwhelm your nervous system for months without adequate rest, ordinary tiredness transforms into burnout. The World Health Organization defines burnout as a clinical syndrome resulting from chronic workplace and educational stress that has not been successfully managed [1].",
        "Burnout rarely arrives overnight. It whispers before it shouts. Physical indicators include persistent morning exhaustion even after eight hours in bed, frequent tension headaches, stomach discomfort, and sudden susceptibility to colds.",
        "Emotionally and cognitively, burnout surfaces as cynicism, mental detachment, chronic irritability with loved ones, and persistent brain fog [3]. You might find yourself staring at an assignment for hours unable to write a single coherent sentence, feeling deep dread before opening your messaging apps.",
      ],
      kmParagraphs: [
        "នៅពេលដែលបន្ទុកការងារ និងការរៀនសូត្រលើសចំណុះនៃប្រព័ន្ធប្រសាទអស់រយៈពេលជាច្រើនខែដោយគ្មានការសម្រាកគ្រប់គ្រាន់ ការអស់កម្លាំងធម្មតានឹងប្រែទៅជាភាពអស់កម្លាំងចិត្តរ៉ាំរ៉ៃ (Burnout)។ អង្គការសុខភាពពិភពលោក (WHO) បានកំណត់ថា ភាពអស់កម្លាំងចិត្តគឺជាអាការគ្លីនិកដែលបណ្តាលមកពីភាពតានតឹងរ៉ាំរ៉ៃក្នុងបរិយាកាសការងារ និងការសិក្សាដែលមិនត្រូវបានគ្រប់គ្រងឱ្យបានត្រឹមត្រូវ [1]។",
        "ភាពអស់កម្លាំងចិត្តកម្រកើតឡើងភ្លាមៗមួយយប់ណាស់។ វាតែងតែផ្តល់សញ្ញាព្រមានជាមុន។ សញ្ញារាងកាយរួមមាន៖ អស់កម្លាំងខ្លាំងនៅពេលព្រឹកទោះបីជាគេងបាន ៨ ម៉ោងក៏ដោយ ឈឺក្បាលតានតឹងញឹកញាប់ មិនស្រួលក្នុងក្រពះពោះវៀន និងងាយឆ្លងជំងឺផ្តាសាយ។",
        "ចំពោះអារម្មណ៍ និងការគិតវិញ ភាពអស់កម្លាំងចិត្តស្តែងចេញតាមរយៈការអស់ទឹកចិត្ត ភាពសោះកក្រោះ ឆាប់ខឹងមួរម៉ៅជាមួយមនុស្សជុំវិញខ្លួន និងខួរក្បាលមិនដំណើរការ (Brain Fog) [3]។ អ្នកអាចនឹងអង្គុយមើលកិច្ចការរាប់ម៉ោងដោយមិនអាចសរសេរចេញមួយប្រយោគ ឬមានអារម្មណ៍ភ័យខ្លាចយ៉ាងខ្លាំងមុនពេលបើកសារទូរស័ព្ទ។",
      ],
      keyPoints: [
        "Burnout has 3 clinical pillars: exhaustion, mental cynicism, and reduced efficacy [1].",
        "Physical warning signs often precede conscious emotional distress [3].",
        "Chronic dread and apathy are biological alarms that your system has surpassed capacity.",
      ],
      kmKeyPoints: [
        "ភាពអស់កម្លាំងចិត្ត (Burnout) មានសសរស្តម្ភ ៣៖ ការអស់ថាមពល អារម្មណ៍សោះកក្រោះ និងការថយចុះប្រសិទ្ធភាព [1]។",
        "សញ្ញាព្រមានលើរាងកាយច្រើនតែកើតឡើងមុនអារម្មណ៍តានតឹងផ្លូវចិត្ត [3]។",
        "អារម្មណ៍ភ័យខ្លាចការភ្ញាក់ពីគេង និងភាពស្ពឹកស្រពន់ គឺជាសំឡេងរោទ៍ប្រាប់ថាប្រព័ន្ធរាងកាយរបស់អ្នកលើសកម្រិតទ្រាំទ្រហើយ។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Cambodian Context: Dual Shifts, Family Duty, and Rest Guilt [4, 5]",
      kmTitle: "បរិបទសង្គម និងវប្បធម៌កម្ពុជា៖ ការរៀនបណ្តើរធ្វើការបណ្តើរ និងអារម្មណ៍ខុសពេលសម្រាក (Cambodian Context & Rest Guilt)",
      type: "reading",
      paragraphs: [
        "In Cambodia, the pressure to juggle multiple spheres of life carries unique cultural and economic weight. Many young adults and students work full-time day jobs in companies or small family businesses, rush to evening university classes until 8:30 PM, and dedicate weekends to family gatherings, household chores, or extra freelance tasks [5].",
        "Cultural values emphasize filial piety, hard work, and family sacrifice. Young Cambodians frequently feel an enormous responsibility to succeed financially to support their parents and siblings. While these values foster deep loyalty and resilience, they can also cultivate intense guilt whenever you attempt to take personal rest.",
        "You may tell yourself: 'My parents worked so much harder, so I have no right to complain,' or 'If I take Sunday off, I am falling behind my peers.' UNICEF Cambodia notes that internalized pressure often leads youth to treat rest as laziness rather than a biological necessity [5]. Recognizing this cultural backdrop helps you understand that your stress is not a personal failure, but the natural outcome of carrying heavy societal expectations.",
      ],
      kmParagraphs: [
        "នៅក្នុងសង្គមកម្ពុជា សម្ពាធក្នុងការបំពេញភារកិច្ចចម្រុះបង្កប់នូវទម្ងន់វប្បធម៌ និងសេដ្ឋកិច្ចជាក់លាក់។ យុវជន និងនិស្សិតជាច្រើនត្រូវធ្វើការពេញម៉ោងនៅពេលថ្ងៃ ធ្វើដំណើរប្រញាប់ប្រញាល់ទៅរៀនថ្នាក់យប់នៅសាកលវិទ្យាល័យរហូតដល់ម៉ោង ៨:៣០ យប់ ហើយចុងសប្តាហ៍ត្រូវជួយកិច្ចការគ្រួសារ ជួបជុំបងប្អូន ឬឆ្លៀតធ្វើការងារបន្ថែម [5]។",
        "វប្បធម៌ខ្មែរផ្តល់តម្លៃខ្ពស់លើការដឹងគុណឪពុកម្តាយ ភាពឧស្សាហ៍ព្យាយាម និងការលះបង់ដើម្បីគ្រួសារ។ យុវជនកម្ពុជាច្រើនតែមានអារម្មណ៍ថាខ្លួនមានទំនួលខុសត្រូវខ្ពស់ក្នុងការជួយសម្រាលបន្ទុកជីវភាពគ្រួសារ។ ទោះបីជាគុណតម្លៃទាំងនេះបង្កើតភាពរឹងមាំ និងកត្តញ្ញុតាធម៌ក៏ដោយ វាក៏អាចបង្កើតអារម្មណ៍ខុសឆ្គងយ៉ាងខ្លាំងរាល់ពេលដែលអ្នកចង់សម្រាកផ្ទាល់ខ្លួនផងដែរ។",
        "អ្នកប្រហែលជាធ្លាប់ប្រាប់ខ្លួនឯងថា៖ «ឪពុកម្តាយខ្ញុំលំបាកជាងខ្ញុំឆ្ងាយណាស់ ដូច្នេះខ្ញុំគ្មានសិទ្ធិរអ៊ូរទាំទេ» ឬ «បើខ្ញុំសម្រាកនៅថ្ងៃអាទិត្យ ខ្ញុំនឹងដើរយឺតជាងគេ»។ អង្គការ UNICEF Cambodia បង្ហាញថា សម្ពាធក្នុងចិត្តបែបនេះច្រើនតែធ្វើឱ្យយុវជនចាត់ទុកការសម្រាកថាជាភាពខ្ជិលច្រអូស ជំនួសឱ្យតម្រូវការធម្មជាតិនៃរាងកាយ [5]។ ការយល់ដឹងពីបរិបទនេះ ជួយឱ្យអ្នកដឹងថាភាពតានតឹងរបស់អ្នកមិនមែនជាការបរាជ័យផ្ទាល់ខ្លួនឡើយ ប៉ុន្តែជាលទ្ធផលនៃការផ្ទុកបន្ទុកសង្គមដ៏ធំធេង។",
      ],
      keyPoints: [
        "Cambodian dual-shift routines (work by day, university by night) represent exceptional physical loads [5].",
        "Filial gratitude should not require complete physical self-destruction.",
        "Rest is not a reward earned only after total exhaustion; it is fuel required to keep going.",
      ],
      kmKeyPoints: [
        "ការរៀនបណ្តើរធ្វើការបណ្តើររបស់យុវជនកម្ពុជា គឺជាបន្ទុករាងកាយ និងស្មារតីដ៏ធ្ងន់ធ្ងរ [5]។",
        "ការដឹងគុណ និងការទទួលខុសត្រូវចំពោះគ្រួសារ មិនគួរតម្រូវឱ្យអ្នកបំផ្លាញសុខភាពខ្លួនឯងទាំងស្រុងនោះទេ។",
        "ការសម្រាកមិនមែនជារង្វាន់ដែលត្រូវទាមទាររហូតដល់អស់កម្លាំងនោះទេ ប៉ុន្តែជាថាមពលចាំបាច់ដើម្បីបន្តដំណើរទៅមុខ។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "Check Your Understanding: Burnout vs. Sustainable Productivity",
      kmTitle: "ពិនិត្យការយល់ដឹង៖ ភាពអស់កម្លាំងចិត្ត និងផលិតភាពប្រកបដោយចីរភាព (Burnout vs. Productivity)",
      type: "quiz",
      paragraphs: [
        "Sustainable performance requires honest self-awareness. Let us test your instinct about how our bodies and minds recharge under competing workloads.",
      ],
      kmParagraphs: [
        "សមត្ថភាពការងារប្រកបដោយចីរភាព ទាមទារឱ្យមានការដឹងច្បាស់ពីខ្លួនឯងដោយស្មោះត្រង់។ ចូរយើងសាកល្បងពិនិត្យការយល់ដឹងអំពីរបៀបដែលរាងកាយ និងចិត្តស្តារថាមពលឡើងវិញ។",
      ],
      quiz: {
        question: "Which of the following reflects a sustainable and healthy approach to managing study and work?",
        kmQuestion: "តើចំណុចមួយណាខាងក្រោមឆ្លុះបញ្ចាំងពីវិធីសាស្ត្រប្រកបដោយចីរភាព និងសុខភាពល្អក្នុងការគ្រប់គ្រងការរៀនសូត្រ និងការងារ?",
        options: [
          {
            id: "opt-a",
            text: "Sacrificing sleep to finish all pending tasks so that you never fall behind peers",
            kmText: "កាត់បន្ថយម៉ោងគេងដើម្បីបំពេញកិច្ចការដែលនៅសេសសល់ទាំងអស់កុំឱ្យដើរយឺតជាងគេ",
            isCorrect: false,
          },
          {
            id: "opt-b",
            text: "Recognizing that energy fluctuates and scheduling deliberate breaks before your body forces a shutdown",
            kmText: "ទទួលស្គាល់ថាថាមពលតែងតែមានការប្រែប្រួល និងកំណត់ពេលសម្រាកឱ្យបានច្បាស់លាស់ មុនពេលរាងកាយបង្ខំឱ្យដួល",
            isCorrect: true,
          },
          {
            id: "opt-c",
            text: "Saying yes to every single extra request from bosses and professors to prove your dedication",
            kmText: "យល់ព្រមទទួលយកគ្រប់សំណើបន្ថែមពីថ្នាក់លើ ឬសាស្ត្រាចារ្យ ដើម្បីបង្ហាញពីការប្តេជ្ញាចិត្ត",
            isCorrect: false,
          },
          {
            id: "opt-d",
            text: "Pushing through intense mental exhaustion with more energy drinks and extra caffeine",
            kmText: "បន្តខំប្រឹងទោះបីជាខួរក្បាលអស់កម្លាំងខ្លាំង ដោយពឹងផ្អែកលើភេសជ្ជៈប៉ូវកម្លាំង និងកាហ្វេ",
            isCorrect: false,
          },
        ],
        explanation:
          "Sustainable productivity is built on biological reality. Sleep and active breaks restore your cognitive functions, memory, and emotional resilience. Pushing through exhaustion damages both the quality of your work and your health [1, 2].",
        kmExplanation:
          "ផលិតភាពប្រកបដោយចីរភាពពឹងផ្អែកលើការពិតនៃរាងកាយ។ ដំណេក និងការសម្រាកជួយស្តារមុខងារខួរក្បាល ការចងចាំ និងភាពរឹងមាំនៃអារម្មណ៍។ ការបង្ខំខ្លួនឯងទាំងអស់កម្លាំង នឹងបំផ្លាញទាំងគុណភាពការងារ និងសុខភាពរបស់អ្នក [1, 2]។",
      },
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "Energy Management vs. Time Management: The 4 Life Batteries [3]",
      kmTitle: "ការគ្រប់គ្រងថាមពលធៀបនឹងការគ្រប់គ្រងពេលវេលា៖ អាគុយជីវិតទាំង ៤ (The 4 Life Batteries)",
      type: "reading",
      paragraphs: [
        "Most advice on balance tells you to download a new planner, organize color-coded calendars, and wake up at five in the morning. However, time management is useless if your energy is empty. Scheduling two hours to write a paper means nothing if your brain is too depleted to focus.",
        "Clinical experts at Harvard Health recommend shifting focus from managing hours to managing energy [3]. Think of yourself as operating on four distinct batteries: Physical, Mental, Emotional, and Meaning.",
        "Your physical battery charges with adequate sleep, balanced nutrition, and hydration. Your mental battery charges through single-tasking and breaks from digital screens. Your emotional battery charges through genuine connection, laughter, and feeling heard. Your meaning battery charges when your daily efforts align with what genuinely matters to your heart.",
      ],
      kmParagraphs: [
        "ដំបូន្មានភាគច្រើនអំពីតុល្យភាពតែងតែប្រាប់ឱ្យអ្នកទិញសៀវភៅកត់ត្រាថ្មី គូសពណ៌លើកាលវិភាគ ឬភ្ញាក់ពីគេងនៅម៉ោង ៥ ព្រឹក។ ប៉ុន្តែការគ្រប់គ្រងពេលវេលានឹងគ្មានប្រយោជន៍ឡើយ ប្រសិនបើថាមពលរបស់អ្នកអស់ពីខ្លួននោះ។ ការទុកពេល ២ ម៉ោងដើម្បីសរសេរកិច្ចការ នឹងមិនមានលទ្ធផលទេ ប្រសិនបើខួរក្បាលរបស់អ្នកហត់នឿយរហូតដល់មិនអាចផ្ដោតអារម្មណ៍បាន។",
        "អ្នកជំនាញគ្លីនិកនៅសាកលវិទ្យាល័យ Harvard ណែនាំឱ្យយើងប្តូរការផ្តោតអារម្មណ៍ពីការគ្រប់គ្រងម៉ោង មកជាការគ្រប់គ្រងថាមពលវិញ [3]។ សូមស្រមៃគិតថារាងកាយ និងចិត្តរបស់អ្នកដំណើរការដោយអាគុយ ៤ ប្រភេទផ្សេងគ្នា៖ អាគុយរាងកាយ អាគុយខួរក្បាល អាគុយអារម្មណ៍ និងអាគុយអត្ថន័យជីវិត។",
        "អាគុយរាងកាយសាកពេញតាមរយៈការគេងគ្រប់គ្រាន់ អាហារូបត្ថម្ភ និងការទទួលទានទឹក។ អាគុយខួរក្បាលសាកពេញតាមរយៈការធ្វើការងារម្តងមួយមុខ និងការសម្រាកពីអេក្រង់ទូរស័ព្ទ។ អាគុយអារម្មណ៍សាកពេញតាមរយៈការជជែកជាមួយមនុស្សដែលយល់ចិត្ត និងការសើចសប្បាយ។ រីឯអាគុយអត្ថន័យជីវិតសាកពេញនៅពេលដែលការខិតខំរបស់អ្នកផ្សារភ្ជាប់ទៅនឹងគោលបំណងពិតប្រាកដដែលអ្នកស្រឡាញ់។",
      ],
      keyPoints: [
        "Time is fixed at 24 hours, but your personal energy is renewable [3].",
        "Focusing while exhausted takes twice as long and produces inferior work.",
        "Monitoring which of your four batteries is draining helps you pick the right restorative action.",
      ],
      kmKeyPoints: [
        "ពេលវេលាមានត្រឹមតែ ២៤ ម៉ោងប៉ុណ្ណោះ ប៉ុន្តែថាមពលរបស់អ្នកអាចបង្កើត និងស្តារឡើងវិញបាន [3]។",
        "ការខំធ្វើការទាំងខួរក្បាលអស់កម្លាំង ត្រូវចំណាយពេលយូរទ្វេដង និងមិនសូវមានប្រសិទ្ធភាព។",
        "ការតាមដានមើលថាអាគុយណាមួយកំពុងអស់ ជួយឱ្យអ្នកជ្រើសរើសវិធីសម្រាកបានត្រឹមត្រូវ។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "The Power of Saying No: Setting Boundaries Without Guilt [2, 4]",
      kmTitle: "ថាមពលនៃការបដិសេធ៖ ការកំណត់ព្រំដែនដោយមិនមានអារម្មណ៍ខុស (Setting Boundaries Without Guilt)",
      type: "reading",
      paragraphs: [
        "One of the primary drivers of burnout is boundary collapse. Many of us say yes to extra workplace projects, take on our classmates' share of group assignments, and accept every social invitation because we fear disappointing people or appearing uncooperative [2].",
        "Every time you say yes to something non-essential, you are involuntarily saying no to your sleep, your health, and your peace of mind. Setting boundaries is not selfish or rude; it is the fundamental condition for staying reliable over the long run.",
        "Practice polite and clear boundary scripts: 'Thank you for thinking of me for this project. Given my current academic deadlines, I cannot take on this responsibility and deliver quality work,' or 'I would love to help, but my schedule is completely booked this week. Can we revisit this next month?' [4].",
      ],
      kmParagraphs: [
        "មូលហេតុចម្បងមួយនៃការអស់កម្លាំងចិត្ត គឺការបាត់បង់ព្រំដែនផ្ទាល់ខ្លួន។ យើងជាច្រើនតែងតែឆ្លើយថា «បាទ/ចាស» ទទួលយកគម្រោងការងារបន្ថែម ទទួលធ្វើកិច្ចការក្រុមជំនួសមិត្តភក្តិ និងទៅចូលរួមគ្រប់ការណាត់ជួប ដោយសារតែយើងខ្លាចធ្វើឱ្យអ្នកដទៃខកចិត្ត ឬខ្លាចគេគិតថាយើងមិនចេះជួយ [2]។",
        "រាល់ពេលដែលអ្នកយល់ព្រមទទួលយកកិច្ចការដែលមិនចាំបាច់ មានន័យថាអ្នកកំពុងតែបដិសេធពេលវេលាគេង សុខភាព និងសេចក្តីស្ងប់ក្នុងចិត្តរបស់អ្នកដោយមិនដឹងខ្លួន។ ការកំណត់ព្រំដែនមិនមែនជាភាពអត្មានិយម ឬឈ្លើយនោះទេ ប៉ុន្តែជាលក្ខខណ្ឌចាំបាច់ដើម្បីរក្សាភាពរឹងមាំក្នុងការងារ និងការរៀនសូត្រយូរអង្វែង។",
        "សូមអនុវត្តការប្រើប្រាស់ពាក្យសម្តីច្បាស់លាស់ និងគួរសមដូចជា៖ «អរគុណច្រើនដែលបានផ្តល់ឱកាសនេះដល់ខ្ញុំ។ ដោយសារសប្តាហ៍នេះខ្ញុំត្រូវផ្ដោតលើការប្រឡង ខ្ញុំមិនអាចទទួលភារកិច្ចនេះបន្ថែមដោយធានាគុណភាពបានទេ» ឬ «ខ្ញុំចង់ជួយខ្លាំងណាស់ ប៉ុន្តែកាលវិភាគរបស់ខ្ញុំពេញអស់ហើយក្នុងសប្តាហ៍នេះ តើយើងអាចពិភាក្សាគ្នានៅខែក្រោយបានទេ?» [4]។",
      ],
      keyPoints: [
        "A boundary is a parameter that protects your capacity to perform and care [2].",
        "Saying no politely preserves your respect and credibility far more than agreeing and delivering late.",
        "You do not need to over-explain or invent elaborate excuses; clarity and calm respect are enough.",
      ],
      kmKeyPoints: [
        "ព្រំដែនគឺជាខែលការពារសមត្ថភាពរបស់អ្នកក្នុងការបំពេញការងារ និងការថែទាំខ្លួនឯង [2]។",
        "ការបដិសេធដោយគួរសម ជួយរក្សាកិត្តិយស និងទំនុកចិត្តបានល្អជាងការទទួលយកហើយធ្វើមិនទាន់ពេលវេលា។",
        "អ្នកមិនចាំបាច់រកលេសវែងអន្លាយនោះទេ ការបញ្ជាក់យ៉ាងច្បាស់លាស់ និងទន់ភ្លន់គឺគ្រប់គ្រាន់ហើយ។",
      ],
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "The Priority Matrix and the 'Good Enough' Standard [2, 4]",
      kmTitle: "តារាងអាទិភាព និងគោលការណ៍ «ល្អគ្រប់គ្រាន់» (Prioritization & Good Enough)",
      type: "reading",
      paragraphs: [
        "When your task list contains twenty items, everything feels like an emergency. Psychologists recommend applying the Eisenhower Principle to separate urgent matters from truly important matters [2].",
        "Important tasks contribute to your long-term values, health, and career growth, such as studying core concepts, resting, and preparing key work deliverables. Urgent tasks demand immediate attention but often have low real value, such as replying instantly to non-urgent group chats or formatting slides for hours.",
        "Complement this with the 'Good Enough' standard. Perfectionism is a major cause of exhaustion. Not every email requires poetic phrasing; not every summary needs ten revisions. Ask yourself: 'What does 80% excellence look like here?' Often, delivering a solid result and going to bed at 10:30 PM is far wiser than obsessing for three more hours to reach 95% [4].",
      ],
      kmParagraphs: [
        "នៅពេលដែលបញ្ជីកិច្ចការរបស់អ្នកមានរហូតដល់ម្ភៃមុខ អ្វីៗទាំងអស់នឹងមើលទៅដូចជារឿងបន្ទាន់។ អ្នកចិត្តវិទ្យាណែនាំឱ្យអនុវត្តគោលការណ៍ Eisenhower ដើម្បីបែងចែករវាងកិច្ចការបន្ទាន់ និងកិច្ចការដែលមានសារៈសំខាន់ពិតប្រាកដ [2]។",
        "កិច្ចការសំខាន់ គឺជារឿងដែលផ្តល់ផលប្រយោជន៍ដល់តម្លៃជីវិតយូរអង្វែង សុខភាព និងការរីកចម្រើនការងារ ដូចជាការរៀនមេរៀនគ្រឹះ ការសម្រាក និងការត្រៀមគម្រោងធំ។ រីឯកិច្ចការបន្ទាន់ ជារឿយៗទាមទារការឆ្លើយតបភ្លាមៗប៉ុន្តែមិនសូវមានតម្លៃពិតប្រាកដ ដូចជាការតបសារក្នុងគ្រុបជជែកដែលមិនសំខាន់ ឬការចំណាយពេលច្រើនម៉ោងតាក់តែងពណ៌ស្លាយ។",
        "បន្ថែមពីនេះ សូមអនុវត្តគោលការណ៍ «ល្អគ្រប់គ្រាន់» (Good Enough Standard)។ ភាពចង់បានឥតខ្ចោះ គឺជាមូលហេតុចម្បងនៃការអស់កម្លាំងចិត្ត។ មិនមែនគ្រប់សារអ៊ីមែលសុទ្ធតែត្រូវសរសេរយ៉ាងពិរោះរណ្តំ ឬគ្រប់កិច្ចការសុទ្ធតែកែសម្រួលដប់ដងនោះទេ។ សូមសួរខ្លួនឯងថា៖ «តើកម្រិត ៨០% នៃកិច្ចការនេះមានទម្រង់បែបណា?» ជារឿយៗ ការបញ្ចប់កិច្ចការឱ្យបានល្អល្មមរួចចូលគេងនៅម៉ោង ១០:៣០ យប់ មានប្រយោជន៍ជាងការចំណាយពេល ៣ ម៉ោងបន្ថែមដើម្បីឱ្យបាន ៩៥% [4]។",
      ],
      keyPoints: [
        "Not everything that shouts for your attention is genuinely important [2].",
        "Focus your peak energy on top two daily priorities before touching minor chores.",
        "Embrace 'good enough' to protect your evening sleep and recovery.",
      ],
      kmKeyPoints: [
        "មិនមែនគ្រប់រឿងដែលទាមទារការយកចិត្តទុកដាក់សុទ្ធតែជារឿងសំខាន់នោះទេ [2]។",
        "សូមប្រើប្រាស់ថាមពលខួរក្បាលដ៏ល្អបំផុតលើអាទិភាពធំៗ ២ ក្នុងមួយថ្ងៃ មុននឹងធ្វើកិច្ចការតូចតាច។",
        "ទទួលយកគោលការណ៍ «ល្អគ្រប់គ្រាន់» ដើម្បីការពារដំណេក និងការស្តារថាមពលពេលយប់។",
      ],
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "Personal Energy Audit: Identifying Your Energy Leaks",
      kmTitle: "ការពិនិត្យថាមពលផ្ទាល់ខ្លួន៖ កំណត់ចំណុចដែលថាមពលរបស់អ្នកកំពុងលេចធ្លាយ (Energy Audit)",
      type: "reflection",
      paragraphs: [
        "Rebalancing begins with identifying where your vitality slips away unnoticed. Consider your typical week and select the scenario that drains you the most.",
      ],
      kmParagraphs: [
        "ការស្តារតុល្យភាពឡើងវិញ ចាប់ផ្តើមពីការស្វែងរកចំណុចដែលថាមពលរបស់អ្នកកំពុងបាត់បង់ដោយមិនដឹងខ្លួន។ សូមពិចារណាពីសប្តាហ៍ធម្មតារបស់អ្នក ហើយជ្រើសរើសស្ថានភាពដែលធ្វើឱ្យអ្នកអស់កម្លាំងខ្លាំងបំផុត។",
      ],
      reflection: {
        question: "When you feel completely drained at the end of the day, what is usually the biggest contributor?",
        kmQuestion: "នៅពេលដែលអ្នកមានអារម្មណ៍ថាអស់កម្លាំងពីខ្លួនទាំងស្រុងនៅចុងបញ្ចប់នៃថ្ងៃ តើកត្តាណាដែលជាមូលហេតុចម្បងបំផុត?",
        options: [
          "Spending late nights scrolling on social media or watching videos while feeling too tired to sleep",
          "Inability to say no to extra tasks from work colleagues, supervisors, or university study groups",
          "Constantly worrying about the future, exams, and family finances even during free time",
          "Trying to do every assignment and work deliverable with 100% perfection",
        ],
        kmOptions: [
          "ការចំណាយពេលពេលយប់ជ្រៅអូសមើលបណ្តាញសង្គម ឬវីដេអូ ដោយសារតែហត់ពេកមិនចង់បិទភ្នែកគេង",
          "ការពិបាកក្នុងការបដិសេធសំណើបន្ថែមពីមិត្តរួមការងារ មេ ឬក្រុមរៀននៅសាកលវិទ្យាល័យ",
          "ការបារម្ភមិនឈប់អំពីអនាគត ការប្រឡង និងបញ្ហាហិរញ្ញវត្ថុគ្រួសារ សូម្បីតែក្នុងពេលទំនេរ",
          "ការព្យាយាមធ្វើគ្រប់កិច្ចការសាលា និងការងារឱ្យបានល្អឥតខ្ចោះ ១០០% ដោយគ្មានកំហុស",
        ],
        feedbackMessage:
          "Identifying your personal energy leak is the first step toward regaining balance. Acknowledging where your vitality slips away allows you to install gentle boundaries rather than fighting yourself with harsh discipline.",
        kmFeedbackMessage:
          "ការសម្គាល់ដឹងពីកន្លែងដែលថាមពលរបស់អ្នកលេចធ្លាយ គឺជាជំហានដំបូងក្នុងការស្តារតុល្យភាពឡើងវិញ។ នៅពេលដែលអ្នកដឹងច្បាស់ពីចំណុចនេះ អ្នកអាចបង្កើតព្រំដែនសុវត្ថិភាពដោយក្តីមេត្តា ជំនួសឱ្យការបន្ទោសខ្លួនឯង។",
      },
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "Micro-Rest and the Daily Reset Routine [3, 4]",
      kmTitle: "ការសម្រាកខ្លីៗ និងទម្លាប់កំណត់ជីវិតឡើងវិញប្រចាំថ្ងៃ (Micro-Rest & Daily Reset)",
      type: "reading",
      paragraphs: [
        "You do not need to book an expensive vacation to experience recovery. Neuroscientists and occupational therapists emphasize the transformative power of 'micro-rest', intentional pauses lasting from two to five minutes scattered across your day [3].",
        "When transitioning from your daytime job to your evening class, do not immediately open your notes or check group chats while stuck in traffic. Use that transition as a buffer zone: listen to calming instrumental music, take three conscious deep breaths, or notice the trees and sky.",
        "Establish an evening shutdown ritual. When work and study finish, close your laptop screen, tidy your desk, and say out loud: 'Work is finished for today; whatever is undone can wait until tomorrow morning.' This simple verbal boundary signals your brain that it is safe to down-regulate from work arousal into restorative sleep mode [4].",
      ],
      kmParagraphs: [
        "អ្នកមិនចាំបាច់រង់ចាំដល់មានពេលទៅដើរលេងកម្សាន្តឆ្ងាយទើបអាចសម្រាកបាននោះទេ។ អ្នកវិទ្យាសាស្ត្រប្រព័ន្ធប្រសាទ និងអ្នកជំនាញសុខភាពការងារបញ្ជាក់ពីអត្ថប្រយោជន៍ដ៏អស្ចារ្យនៃ «ការសម្រាកខ្លីៗ» (Micro-Rest) ដែលមានរយៈពេលត្រឹមតែ ២ ទៅ ៥ នាទីនៅចន្លោះពេលបំពេញកិច្ចការប្រចាំថ្ងៃ [3]។",
        "នៅពេលផ្លាស់ប្តូរពីកន្លែងធ្វើការទៅថ្នាក់រៀនពេលយប់ សូមកុំប្រញាប់បើកមើលសៀវភៅ ឬតបសារក្រុមភ្លាមៗពេលកំពុងធ្វើដំណើរ។ ចូរប្រើពេលវេលានេះជាតំបន់ទ្រនាប់ (Buffer Zone)៖ ស្តាប់តន្ត្រីរំងាប់អារម្មណ៍ ដកដង្ហើមវែងៗ ៣ ដង ឬសម្លឹងមើលដើមឈើ និងផ្ទៃមេឃ។",
        "សូមបង្កើតទម្លាប់បញ្ចប់កិច្ចការពេលយប់ (Shutdown Ritual)។ នៅពេលបញ្ចប់ការរៀន និងការងារ សូមបិទកុំព្យូទ័រ រៀបចំតុឱ្យមានរបៀប រួចនិយាយទៅកាន់ខ្លួនឯងថា៖ «ការងារសម្រាប់ថ្ងៃនេះត្រូវបានបញ្ចប់ហើយ រឿងដែលនៅសល់ទុកដល់ព្រឹកស្អែក»។ ការកំណត់ព្រំដែនបែបនេះ ជួយផ្តល់សញ្ញាដល់ខួរក្បាលថាដល់ពេលត្រូវរំងាប់អារម្មណ៍ និងរៀបចំចូលគេងដោយសុវត្ថិភាព [4]។",
      ],
      keyPoints: [
        "Micro-breaks of 2 to 5 minutes reset nervous system stress levels before overwhelm builds up [3].",
        "Create buffer zones between work, university, and home rather than jumping instantaneously.",
        "A physical and verbal shutdown ritual prevents study anxiety from invading your bedtime.",
      ],
      kmKeyPoints: [
        "ការសម្រាកខ្លីៗ ២ ទៅ ៥ នាទី ជួយសម្រួលប្រព័ន្ធប្រសាទ មុនពេលភាពតានតឹងកើនឡើងខ្ពស់ [3]។",
        "បង្កើតចន្លោះពេលទ្រនាប់រវាងការងារ ការរៀន និងការចូលផ្ទះ កុំផ្លាស់ប្តូរភ្លាមៗដោយគ្មានពេលសម្រាក។",
        "ទម្លាប់បិទបញ្ចប់កិច្ចការជួយការពារកុំឱ្យការព្រួយបារម្ភរំខានដល់ដំណេករបស់អ្នក។",
      ],
    },
    {
      id: 10,
      sectionNumber: 10,
      title: "Grounding in the Moment: The 1-Minute Transition Breath",
      kmTitle: "ការតាំងចិត្តក្នុងពេលបច្ចុប្បន្ន៖ លំហាត់ដកដង្ហើមស្ងប់ចិត្ត ១ នាទី (1-Minute Transition Breath)",
      type: "coping",
      paragraphs: [
        "Whenever you feel your chest tightening, your shoulders hunching, or your thoughts racing with twenty unfinished deadlines, pause immediately. Your body is signaling an acute stress response.",
        "Let us practice the 1-Minute Transition Breath. Inhale slowly through your nose for a count of 4, feeling your belly expand. Hold gently for a count of 2. Exhale smoothly and slowly through your mouth for a count of 6. Repeat this cycle 4 times.",
        "Lengthening your exhale triggers your parasympathetic nervous system, slowing your heart rate, releasing muscle tension, and bringing your cognitive mind back into the present moment.",
      ],
      kmParagraphs: [
        "នៅពេលណាដែលអ្នកមានអារម្មណ៍ថាណែនទ្រូង ស្មាឡើងរឹង ឬគំនិតរវើរវាយព្រួយបារម្ភអំពីកាលកំណត់ការងារ សូមឈប់មួយភ្លែត។ រាងកាយរបស់អ្នកកំពុងផ្តល់សញ្ញាអាសន្នថាភាពតានតឹងបានកើនឡើងហើយ។",
        "ចូរយើងអនុវត្តលំហាត់ដកដង្ហើមស្ងប់ចិត្ត ១ នាទីជាមួយគ្នា។ ដកដង្ហើមចូលយឺតៗតាមច្រមុះរាប់ដល់ ៤ ដោយឱ្យពោះប៉ោងឡើង។ ទប់ដង្ហើមថ្នមៗរាប់ដល់ ២។ បន្ទាប់មកដកដង្ហើមចេញយឺតៗតាមមាត់រាប់ដល់ ៦។ អនុវត្តបែបនេះឡើងវិញចំនួន ៤ ដង។",
        "ការដកដង្ហើមចេញឱ្យវែងជាងដង្ហើមចូល ជួយជំរុញប្រព័ន្ធប្រសាទស្ងប់ចិត្ត (Parasympathetic Nervous System) បន្ថយចង្វាក់បេះដូង បន្ធូរសាច់ដុំ និងនាំការផ្តោតអារម្មណ៍របស់អ្នកត្រឡប់មកកាន់ពេលបច្ចុប្បន្នវិញ។",
      ],
      keyPoints: [
        "A longer exhale activates your body's natural relaxation response.",
        "You can practice this breath silently at your desk, in class, or before entering your home.",
        "One minute of intentional respiration resets cortisol and restores emotional clarity.",
      ],
      kmKeyPoints: [
        "ការដកដង្ហើមចេញវែង ជួយដាស់ប្រព័ន្ធរំងាប់អារម្មណ៍ធម្មជាតិរបស់រាងកាយ។",
        "អ្នកអាចអនុវត្តលំហាត់ដង្ហើមនេះដោយស្ងៀមស្ងាត់នៅលើតុធ្វើការ ក្នុងថ្នាក់រៀន ឬមុនពេលចូលផ្ទះ។",
        "ការដកដង្ហើមដោយស្មារតីត្រឹមតែ ១ នាទី ជួយកាត់បន្ថយអ័រម៉ូនស្ត្រេស និងស្តារភាពច្បាស់លាស់នៃចិត្តឡើងវិញ។",
      ],
      actions: [
        {
          label: "Try 1-Minute Calming Breath",
          kmLabel: "អនុវត្តលំហាត់ដកដង្ហើមស្ងប់ចិត្ត ១ នាទី (1-Min Breath)",
          actionType: "exercise",
        },
      ],
    },
    {
      id: 11,
      sectionNumber: 11,
      title: "Building Your Ongoing Support System on AROM [4, 5]",
      kmTitle: "ការកសាងប្រព័ន្ធគាំទ្របន្តនៅលើ AROM (Building Support on AROM)",
      type: "reading",
      paragraphs: [
        "Balancing study, work, and personal well-being is not a one-time achievement. It is a continuous practice of self-awareness, compassionate adjustment, and mutual support.",
        "On AROM, you have dedicated tools designed to protect your mental reserves. Open your private AROM Journal (/journal) to conduct a daily two-minute energy check-in. Record which of your four batteries felt drained, celebrate one boundary you held, and note what you can let go of without guilt.",
        "If you find that chronic exhaustion, pervasive anxiety, or feelings of hopelessness persist despite your best efforts, you do not have to carry the burden alone. Through AROM Professional (/professional), you can connect confidentially with verified Cambodian therapists and counselors who understand the real pressures of local workplace cultures and academic expectations [5].",
        "If work or academic pressure ever leads to overwhelming emotional crisis, despair, or thoughts of giving up, immediate confidential assistance is available. Reach out to the National Child and Youth Helpline at 1280, the National Health Hotline at 119, or TPO Cambodia at 017 222 372. Your worth as a human being is not defined by how much work you produce.",
      ],
      kmParagraphs: [
        "ការបង្កើតតុល្យភាពរវាងការសិក្សា ការងារ និងសុខុមាលភាពផ្ទាល់ខ្លួន មិនមែនជាការធ្វើតែម្តងចប់នោះទេ។ វាគឺជាការអនុវត្តជាប្រចាំនូវការដឹងពីខ្លួនឯង ការកែសម្រួលដោយក្តីមេត្តា និងការស្វែងរកការគាំទ្រពីអ្នកដទៃ។",
        "នៅលើ AROM អ្នកមានឧបករណ៍សុវត្ថិភាពជាច្រើនដើម្បីការពារថាមពលផ្លូវចិត្តរបស់អ្នក។ សូមបើកកំណត់ហេតុផ្ទាល់ខ្លួន AROM Journal (/journal) ដើម្បីពិនិត្យថាមពលប្រចាំថ្ងៃត្រឹមតែ ២ នាទី។ កត់ត្រាមើលថាអាគុយណាដែលកំពុងអស់ កោតសរសើរខ្លួនឯងចំពោះព្រំដែនមួយដែលអ្នកបានរក្សា និងកំណត់រឿងមួយដែលអ្នកអាចលះបង់ចោលបានដោយមិនមានអារម្មណ៍ខុស។",
        "ប្រសិនបើអ្នកសង្កេតឃើញថា ភាពអស់កម្លាំងរ៉ាំរ៉ៃ ការថប់បារម្ភមិនឈប់ ឬអារម្មណ៍អស់សង្ឃឹមនៅតែបន្តទោះបីជាអ្នកបានព្យាយាមកែសម្រួលហើយក៏ដោយ អ្នកមិនចាំបាច់ទ្រាំរែកពន់បន្ទុកនេះតែម្នាក់ឯងឡើយ។ តាមរយៈ AROM Professional (/professional) អ្នកអាចភ្ជាប់ទំនាក់ទំនងប្រឹក្សាដោយសម្ងាត់ជាមួយអ្នកចិត្តវិទ្យា និងអ្នកជំនាញកម្ពុជាដែលមានការទទួលស្គាល់ត្រឹមត្រូវ ដែលយល់ច្បាស់ពីសម្ពាធការងារ និងការសិក្សាក្នុងសង្គមយើង [5]។",
        "ប្រសិនបើសម្ពាធការងារ ឬការរៀនសូត្រឈានដល់កម្រិតវិបត្តិផ្លូវចិត្តធ្ងន់ធ្ងរ ឬមានគំនិតចង់បោះបង់ជីវិត សូមស្វែងរកជំនួយបន្ទាន់ភ្លាមៗ។ អ្នកអាចទាក់ទងខ្សែទូរស័ព្ទជំនួយកុមារ និងយុវជនលេខ 1280 ខ្សែទូរស័ព្ទសុខភាពជាតិលេខ 119 ឬអង្គការចិត្តសង្គមកម្ពុជា (TPO Cambodia) តាមលេខ 017 222 372។ តម្លៃរបស់អ្នកជាមនុស្ស មិនត្រូវបានកំណត់ដោយបរិមាណការងារដែលអ្នកធ្វើបាននោះឡើយ។",
      ],
      keyPoints: [
        "Use AROM Journal (/journal) for daily 2-minute energy check-ins and boundary reflections.",
        "Connect with verified counselors on AROM Professional (/professional) for sustainable life strategies [5].",
        "Emergency support is always available: 1280, 119, or TPO Cambodia 017 222 372.",
      ],
      kmKeyPoints: [
        "ប្រើប្រាស់កំណត់ហេតុ AROM Journal (/journal) សម្រាប់ពិនិត្យថាមពលប្រចាំថ្ងៃ និងឆ្លុះបញ្ចាំងពីព្រំដែនផ្ទាល់ខ្លួន។",
        "ភ្ជាប់ទំនាក់ទំនងជាមួយអ្នកជំនាញលើ AROM Professional (/professional) ដើម្បីរៀបចំយុទ្ធសាស្ត្រជីវិតប្រកបដោយចីរភាព [5]។",
        "លេខទូរស័ព្ទទាន់ហេតុការណ៍ត្រៀមជួយជានិច្ច៖ 1280, 119 ឬ TPO Cambodia 017 222 372។",
      ],
      alertBox: {
        type: "tip",
        text: "Remember: Rest is not a reward you earn after finishing everything. Rest is an essential biological requirement to sustain your life, your health, and your loved ones.",
        kmText: "សូមចងចាំថា៖ ការសម្រាកមិនមែនជារង្វាន់ដែលអ្នកត្រូវទាមទារបន្ទាប់ពីធ្វើការងារគ្រប់យ៉ាងចប់នោះទេ។ ការសម្រាកគឺជាតម្រូវការធម្មជាតិដ៏ចាំបាច់បំផុត ដើម្បីទ្រទ្រង់ជីវិត សុខភាព និងមនុស្សជាទីស្រឡាញ់របស់អ្នក។",
      },
      actions: [
        {
          label: "Open AROM Journal",
          kmLabel: "បើកកំណត់ហេតុ AROM Journal",
          actionType: "tips",
        },
        {
          label: "Talk to a Professional",
          kmLabel: "ពិគ្រោះជាមួយអ្នកជំនាញ AROM",
          actionType: "professional",
        },
      ],
    },
  ],
};


export const REFERENCES_LOST_INTEREST: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "NIMH",
    title: "National Institute of Mental Health: Depression and Anhedonia (Loss of Interest)",
    url: "https://www.nimh.nih.gov/health/topics/depression",
  },
  {
    id: 2,
    citation: "[2]",
    source: "WHO",
    title: "World Health Organization: Depressive Disorder Key Facts and Diagnostic Criteria",
    url: "https://www.who.int/news-room/fact-sheets/detail/depression",
  },
  {
    id: 3,
    citation: "[3]",
    source: "Harvard Health",
    title: "Harvard Health Publishing: Anhedonia: Why Can't I Enjoy the Things I Used to Love?",
    url: "https://www.health.harvard.edu/mind-and-mood/anhedonia-loss-of-pleasure",
  },
  {
    id: 4,
    citation: "[4]",
    source: "NHS inform",
    title: "NHS inform: Coping with Low Mood, Anhedonia, and Behavioral Activation",
    url: "https://www.nhsinform.scot/illnesses-and-conditions/mental-health/mental-health-self-help-guides/low-mood-and-depression/",
  },
  {
    id: 5,
    citation: "[5]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia & TPO: Youth Mental Health and Overcoming Stigma in Cambodia",
    url: "https://www.unicef.org/cambodia/mental-health",
  },
];

export const LESSON_LOST_INTEREST: Lesson = {
  id: "why-lost-interest-motivation",
  title: "Why Have I Lost Interest in Things I Used to Love?",
  kmTitle: "ហេតុអ្វីខ្ញុំបាត់បង់ចំណាប់អារម្មណ៍លើអ្វីដែលធ្លាប់ចូលចិត្ត? (Why Have I Lost Interest?)",
  subtitle: "Explore possible explanations for changes in motivation and learn gentle ways forward",
  kmSubtitle: "ស្វែងយល់ពីមូលហេតុនៃការថយចុះកម្លាំងចិត្ត និងរៀនបោះជំហានទៅមុខដោយក្តីមេត្តា",
  category: "Emotions",
  duration: "8 min",
  kmDuration: "៨ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Self-Check",
  kmFormat: "ការអាន និងការពិនិត្យខ្លួនឯង (Reading & Self-Check)",
  isAvailable: true,
  image: "/mindguide/emotions.png",
  heroImage: "/mindguide/lost-interest-hero.jpg",
  badge: "Popular",
  description:
    "Unpack the neurobiology and psychology behind lost motivation and anhedonia. Learn to distinguish burnout from depression, break free from the 'laziness' stigma in Cambodia, and rekindle connection with zero pressure on AROM.",
  kmDescription:
    "ស្វែងយល់ពីមូលហេតុផ្លូវចិត្ត និងជីវសាស្ត្រនៃការបាត់បង់ចំណាប់អារម្មណ៍ (Anhedonia)។ រៀនបែងចែកការអស់កម្លាំងចិត្តពីជំងឺបាក់ទឹកចិត្ត បំបាត់ការបន្ទោសខ្លួនឯងក្នុងសង្គមខ្មែរ និងស្តារក្តីរីករាយឡើងវិញនៅលើ AROM។",
  totalSections: 11,
  outcomes: [
    {
      en: "Understand the clinical concept of anhedonia and how chronic stress dulls dopamine reward circuits [1, 3]",
      km: "យល់ដឹងពីអាការគ្លីនិក Anhedonia និងរបៀបដែលភាពតានតឹងរ៉ាំរ៉ៃកាត់បន្ថយសារធាតុ Dopamine ក្នុងខួរក្បាល [1, 3]",
    },
    {
      en: "Distinguish between temporary burnout, natural personal evolution, and clinical depressive episodes [1, 2]",
      km: "បែងចែកឱ្យច្បាស់រវាងការអស់កម្លាំងចិត្តបណ្តោះអាសន្ន ការផ្លាស់ប្តូរធម្មជាតិនៃចំណូលចិត្ត និងជំងឺបាក់ទឹកចិត្ត [1, 2]",
    },
    {
      en: "Deconstruct the Cambodian cultural stigma that mistakenly labels emotional numbness as 'laziness' [5]",
      km: "បំបាត់ការយល់ច្រឡំក្នុងសង្គមកម្ពុជាដែលចាត់ទុកការស្ពឹកស្រពន់ផ្លូវចិត្តថាជា «ភាពខ្ជិលច្រអូស» [5]",
    },
    {
      en: "Escape the motivation trap by using behavioral activation and low-pressure micro-engagements [3, 4]",
      km: "ចាកចេញពីអន្ទាក់កម្លាំងចិត្តដោយអនុវត្តសកម្មភាពកម្រិតស្រាល និងគោលការណ៍គ្មានសម្ពាធ [3, 4]",
    },
    {
      en: "Apply the 5-Minute Low-Pressure Rule to experience sensory grounding without expecting intense euphoria",
      km: "អនុវត្តគោលការណ៍ «៥ នាទីគ្មានសម្ពាធ» ដើម្បីទទួលបានសេចក្តីស្ងប់ដោយមិនទាមទារឱ្យមានក្តីរំភើបខ្លាំង",
    },
    {
      en: "Conduct self-compassionate reflections in AROM Journal and connect confidentially with licensed counselors [4, 5]",
      km: "ឆ្លុះបញ្ចាំងដោយក្តីមេត្តាក្នុងកំណត់ហេតុ AROM និងភ្ជាប់ការពិគ្រោះយោបល់ដោយសម្ងាត់ជាមួយអ្នកជំនាញ [4, 5]",
    },
  ],
  references: REFERENCES_LOST_INTEREST,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "The Mystery of the Missing Spark: When Joy Suddenly Goes Flat",
      kmTitle: "អាថ៌កំបាំងនៃការបាត់បង់ភាពរំភើប៖ នៅពេលដែលក្តីរីករាយប្រែជាសោះកក្រោះ (The Missing Spark)",
      type: "reading",
      paragraphs: [
        "You sit down with your guitar, open your sketchbook, or log into a favorite game, but nothing happens. The warmth, curiosity, and excitement you used to feel have vanished, replaced by a hollow indifference.",
        "You might force yourself to participate, hoping the familiar spark will return, only to feel detached and exhausted. Soon, unhelpful thoughts begin to whisper: 'Why cannot I just enjoy this anymore? Am I becoming boring? Am I just lazy?'",
        "Losing interest in beloved hobbies is a deeply unsettling experience, yet it is one of the most common human psychological responses to prolonged strain. It is not a moral failing or a sign that you have lost your true self; it is an important communication from your nervous system.",
      ],
      kmParagraphs: [
        "អ្នកអង្គុយចុះកាន់ហ្គីតា បើកសៀវភៅគំនូរ ឬចូលលេងល្បែងកម្សាន្តដែលធ្លាប់ចូលចិត្ត ប៉ុន្តែគ្មានអ្វីកើតឡើងទាល់តែសោះ។ ភាពកក់ក្តៅ ការចង់ដឹងចង់ឃើញ និងក្តីរំភើបដែលអ្នកធ្លាប់មានបានរលាយបាត់អស់ ដោយជំនួសមកវិញនូវអារម្មណ៍សោះកក្រោះ និងទទេស្អាត។",
        "អ្នកប្រហែលជាបង្ខំខ្លួនឯងឱ្យធ្វើ ដោយសង្ឃឹមថានឹងរកឃើញភាពរីករាយដូចមុន ប៉ុន្តែលទ្ធផលគឺរឹតតែមានអារម្មណ៍អស់កម្លាំង និងឯកោ។ មិនយូរប៉ុន្មាន គំនិតអវិជ្ជមានចាប់ផ្តើមរំខានថា៖ «ហេតុអ្វីខ្ញុំមិនអាចសប្បាយដូចមុន? តើខ្ញុំក្លាយជាមនុស្សគួរឱ្យធុញទ្រាន់ឬ? ឬមួយខ្ញុំពិតជាខ្ជិល?»",
        "ការបាត់បង់ចំណាប់អារម្មណ៍លើអ្វីដែលធ្លាប់ស្រឡាញ់ គឺជាបទពិសោធន៍ដែលធ្វើឱ្យយើងច្របូកច្របល់ក្នុងចិត្ត ប៉ុន្តែវាគឺជាប្រតិកម្មធម្មជាតិទូទៅបំផុតនៃប្រព័ន្ធប្រសាទនៅពេលរាងកាយរងសម្ពាធយូរ។ នេះមិនមែនជាការបរាជ័យនៃចរិតលក្ខណៈ ឬបាត់បង់អត្តសញ្ញាណរបស់អ្នកឡើយ ប៉ុន្តែជាសារដាស់តឿនដ៏សំខាន់ពីរាងកាយរបស់អ្នក។",
      ],
      keyPoints: [
        "Losing interest in passions is an emotional signal, not a personal character defect.",
        "Forcing excitement when your system is flat often creates more frustration and guilt.",
        "Understanding the root causes provides relief and a gentle path forward.",
      ],
      kmKeyPoints: [
        "ការបាត់បង់ចំណាប់អារម្មណ៍លើអ្វីដែលធ្លាប់ស្រឡាញ់ គឺជាសញ្ញាព្រមានផ្លូវចិត្ត មិនមែនជាការខូចខាតចរិតនោះទេ។",
        "ការបង្ខំខ្លួនឯងឱ្យមានក្តីរំភើបទាំងចិត្តអស់ថាមពល រឹតតែបង្កើនការខកចិត្ត និងអារម្មណ៍ខុសឆ្គង។",
        "ការយល់ដឹងពីឫសគល់នៃបញ្ហានឹងជួយសម្រាលបន្ទុកក្នុងចិត្ត និងបើកផ្លូវឆ្ពោះទៅមុខដោយទន់ភ្លន់។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "Clinical Anhedonia: The Science of Emotional Flatness [1, 3]",
      kmTitle: "អសមត្ថភាពទទួលអារម្មណ៍រីករាយ (Anhedonia)៖ វិទ្យាសាស្ត្រនៃការស្ពឹកស្រពន់ផ្លូវចិត្ត (Clinical Anhedonia)",
      type: "reading",
      paragraphs: [
        "In clinical psychology, the loss of interest or inability to experience pleasure from once enjoyable activities is called anhedonia [1]. The word comes from ancient Greek, meaning 'without pleasure'.",
        "Neuroscientific research from Harvard Health reveals that pleasure and motivation depend on dopamine pathways in the brain's reward system [3]. When you experience continuous high stress, emotional heartbreak, or unrelenting academic pressure, your body pumps out cortisol and inflammatory cytokines. Over time, these biochemical stress alarms temporarily down-regulate your dopamine receptors.",
        "In simple terms, your brain's emotional volume switch has been turned down to protect you from total burnout. When you feel emotionally numb, your system is not broken; it is in energy-saving survival mode, conserving vital resources until safety is restored [1, 3].",
      ],
      kmParagraphs: [
        "ក្នុងចិត្តវិទ្យាគ្លីនិក ការបាត់បង់ចំណាប់អារម្មណ៍ ឬអសមត្ថភាពក្នុងការទទួលអារម្មណ៍រីករាយពីសកម្មភាពដែលធ្លាប់ចូលចិត្តត្រូវបានគេហៅថា Anhedonia [1]។ ពាក្យនេះមានប្រភពមកពីភាសាក្រិកបុរាណ ដែលមានន័យថា «គ្មានក្តីរីករាយ»។",
        "ការស្រាវជ្រាវប្រព័ន្ធប្រសាទពីសាកលវិទ្យាល័យ Harvard បង្ហាញថាក្តីរីករាយ និងកម្លាំងចិត្តពឹងផ្អែកលើចរន្តសារធាតុ Dopamine ក្នុងប្រព័ន្ធរង្វាន់នៃខួរក្បាល [3]។ នៅពេលដែលអ្នកជួបប្រទះភាពតានតឹងខ្ពស់ជាប់រហូត ការឈឺចាប់ផ្លូវចិត្ត ឬសម្ពាធការងារមិនឈប់ រាងកាយនឹងបញ្ចេញអ័រម៉ូនស្ត្រេស Cortisol។ យូរៗទៅ អ័រម៉ូនទាំងនេះនឹងកាត់បន្ថយសមត្ថភាពទទួលដឹងនៃប្រព័ន្ធ Dopamine ជាបណ្តោះអាសន្ន។",
        "និយាយឱ្យងាយយល់ ខួរក្បាលរបស់អ្នកបានបន្ថយសំឡេងនៃអារម្មណ៍ដោយស្វ័យប្រវត្តិ ដើម្បីការពារអ្នកកុំឱ្យដួលរលំទាំងស្រុង។ នៅពេលដែលអ្នកមានអារម្មណ៍ស្ពឹកស្រពន់ផ្លូវចិត្ត មិនមែនមានន័យថាខួរក្បាលរបស់អ្នកខូចខាតនោះទេ ប៉ុន្តែវាបានចូលទៅក្នុងទម្រង់សន្សំសំចៃថាមពល (Power-Saving Mode) ដើម្បីការពារជីវិតរហូតដល់មានសុវត្ថិភាពឡើងវិញ [1, 3]។",
      ],
      keyPoints: [
        "Anhedonia is the clinical term for reduced ability to feel pleasure or motivation [1].",
        "Chronic stress and high cortisol temporarily down-regulate dopamine reward receptors [3].",
        "Emotional numbness is a protective shutdown mechanism, not permanent apathy.",
      ],
      kmKeyPoints: [
        "Anhedonia គឺជាពាក្យគ្លីនិកសម្រាប់សម្គាល់ការថយចុះសមត្ថភាពក្នុងការទទួលអារម្មណ៍រីករាយ ឬកម្លាំងចិត្ត [1]។",
        "ភាពតានតឹងរ៉ាំរ៉ៃ និងអ័រម៉ូន Cortisol កាត់បន្ថយការដំណើរការនៃសារធាតុ Dopamine ក្នុងខួរក្បាលជាបណ្តោះអាសន្ន [3]។",
        "ការស្ពឹកស្រពន់ផ្លូវចិត្ត គឺជាយន្តការការពាររាងកាយ មិនមែនជាការបាត់បង់ក្តីរីករាយជារៀងរហូតឡើយ។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Burnout, Depression, or Natural Change? Disentangling the Causes [1, 2]",
      kmTitle: "ការអស់កម្លាំងចិត្ត ជំងឺបាក់ទឹកចិត្ត ឬការវិវត្តធម្មជាតិ? ការស្វែងយល់ពីឫសគល់ (Exploring the Causes)",
      type: "reading",
      paragraphs: [
        "When motivation disappears, it is helpful to explore what kind of shift your mind is undergoing. Mental health clinicians usually distinguish between three distinct patterns [1, 2]:",
        "First is systemic burnout. If you have been overworking, pulling double shifts, or caregiving without breaks, your battery is simply at zero percent. In burnout, you still love the hobby in concept, but you lack the physical and cognitive energy to engage.",
        "Second is a depressive episode. The World Health Organization notes that when loss of interest persists almost every day for more than two consecutive weeks, and is accompanied by deep sadness, changes in appetite, insomnia, and pervasive feelings of guilt, it may indicate clinical depression [2].",
        "Third is natural personal evolution. Human beings are not static statues. Sometimes you lose interest in a hobby simply because you have outgrown it, your values have evolved, or you are entering a new chapter in your life. This is healthy growth, not a psychological disorder.",
      ],
      kmParagraphs: [
        "នៅពេលដែលកម្លាំងចិត្តបាត់បង់ វាមានសារៈសំខាន់ខ្លាំងណាស់ក្នុងការស្វែងយល់ថាតើចិត្តរបស់អ្នកកំពុងឆ្លងកាត់ស្ថានភាពបែបណា។ អ្នកជំនាញសុខភាពផ្លូវចិត្តតែងតែបែងចែកស្ថានភាពនេះជា ៣ ទម្រង់ខុសៗគ្នា [1, 2]៖",
        "ទីមួយ គឺការអស់កម្លាំងចិត្តកម្រិតរ៉ាំរ៉ៃ (Burnout)។ ប្រសិនបើអ្នកបានធ្វើការហួសកម្លាំង រៀនបណ្តើរធ្វើការបណ្តើរ ឬមើលថែគ្រួសារដោយគ្មានពេលសម្រាក នោះអាគុយរាងកាយរបស់អ្នកគឺអស់ថាមពលទាំងស្រុង។ ក្នុងស្ថានភាពនេះ អ្នកនៅតែស្រឡាញ់ចំណង់ចំណូលចិត្តនោះដដែល ប៉ុន្តែអ្នកគ្មានកម្លាំងកាយ និងស្មារតីដើម្បីធ្វើវា។",
        "ទីពីរ គឺជំងឺបាក់ទឹកចិត្ត (Depression)។ អង្គការសុខភាពពិភពលោក (WHO) បញ្ជាក់ថា នៅពេលដែលការបាត់បង់ចំណាប់អារម្មណ៍កើតឡើងស្ទើរតែរាល់ថ្ងៃលើសពី ២ សប្តាហ៍ជាប់ៗគ្នា ហើយអមដោយអារម្មណ៍ក្រៀមក្រំ ពិបាកគេង មិនចង់ញ៉ាំបាយ និងមានអារម្មណ៍បន្ទោសខ្លួនឯងខ្លាំង នោះវាអាចជាសញ្ញានៃជំងឺបាក់ទឹកចិត្ត [2]។",
        "ទីបី គឺការវិវត្តធម្មជាតិនៃជីវិត (Natural Personal Growth)។ មនុស្សយើងមិនមែនជារូបសំណាកដែលនៅដដែលនោះទេ។ ពេលខ្លះអ្នកបាត់បង់ចំណាប់អារម្មណ៍លើអ្វីមួយ ដោយសារតែអ្នកបានរីកចម្រើនផ្លាស់ប្តូរទស្សនៈ ឬកំពុងឈានចូលដំណាក់កាលថ្មីនៃជីវិត។ នេះគឺជាការលូតលាស់ដ៏មានសុខភាពល្អ មិនមែនជាបញ្ហាផ្លូវចិត្តឡើយ។",
      ],
      keyPoints: [
        "Burnout: You value the activity, but your physical battery is completely empty [1].",
        "Depression: Pervasive emotional flatness lasting over 2 weeks with changes in sleep and appetite [2].",
        "Evolution: Your interests have naturally outgrown past activities as you mature.",
      ],
      kmKeyPoints: [
        "ភាពអស់កម្លាំងចិត្ត (Burnout)៖ អ្នកនៅតែស្រឡាញ់សកម្មភាពនោះ ប៉ុន្តែរាងកាយគ្មានថាមពលសល់ឡើយ [1]។",
        "ជំងឺបាក់ទឹកចិត្ត (Depression)៖ ការស្ពឹកស្រពន់កើតឡើងលើសពី ២ សប្តាហ៍ អមដោយការប្រែប្រួលដំណេក និងការហូបចុក [2]។",
        "ការវិវត្តធម្មជាតិ៖ ចំណាប់អារម្មណ៍របស់អ្នកផ្លាស់ប្តូរទៅតាមវ័យ និងការលូតលាស់នៃជីវិត។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "Check Your Understanding: Myths About Motivation and Joy",
      kmTitle: "ពិនិត្យការយល់ដឹង៖ ជំនឿមិនពិតអំពីកម្លាំងចិត្ត និងក្តីរីករាយ (Motivation Myths)",
      type: "quiz",
      paragraphs: [
        "How we think about motivation determines how kindly we treat ourselves during low-energy seasons. Test your understanding of how human motivation works.",
      ],
      kmParagraphs: [
        "ការយល់ដឹងរបស់យើងអំពីកម្លាំងចិត្ត កំណត់ថាតើយើងមានក្តីមេត្តាចំពោះខ្លួនឯងកម្រិតណាពេលអស់ថាមពល។ សូមសាកល្បងពិនិត្យការយល់ដឹងអំពីយន្តការនៃកម្លាំងចិត្តរបស់មនុស្ស។",
      ],
      quiz: {
        question: "Which statement about motivation and lost interest is clinically accurate?",
        kmQuestion: "តើការលើកឡើងមួយណាខាងក្រោមអំពីកម្លាំងចិត្ត និងការបាត់បង់ចំណាប់អារម្មណ៍ ដែលត្រឹមត្រូវតាមក្បួនគ្លីនិក?",
        options: [
          {
            id: "opt-a",
            text: "You must wait until you feel deep passion and motivation before taking any creative action",
            kmText: "អ្នកត្រូវតែរង់ចាំទាល់តែមានកម្លាំងចិត្ត និងក្តីរំភើបខ្លាំងក្នុងចិត្តសិន ទើបអាចចាប់ផ្តើមធ្វើសកម្មភាពបាន",
            isCorrect: false,
          },
          {
            id: "opt-b",
            text: "Motivation often follows action rather than preceding it, and small low-pressure steps can gently re-engage reward pathways",
            kmText: "កម្លាំងចិត្តច្រើនតែកើតឡើងបន្ទាប់ពីយើងចាប់ផ្តើមធ្វើសកម្មភាព ហើយជំហានតូចៗដោយគ្មានសម្ពាធជួយដាស់ប្រព័ន្ធរង្វាន់ខួរក្បាលថ្នមៗ",
            isCorrect: true,
          },
          {
            id: "opt-c",
            text: "Losing interest in a long-term hobby means you never truly cared about it in the first place",
            kmText: "ការបាត់បង់ចំណាប់អារម្មណ៍លើចំណង់ចំណូលចិត្តយូរអង្វែង បង្ហាញថាអ្នកមិនដែលស្រឡាញ់វាពិតប្រាកដតាំងពីដំបូង",
            isCorrect: false,
          },
          {
            id: "opt-d",
            text: "Emotional flatness is purely caused by a weak mindset and can be cured instantly with harsh discipline",
            kmText: "ការស្ពឹកស្រពន់ផ្លូវចិត្តបណ្តាលមកពីចិត្តទន់ខ្សោយ ហើយអាចព្យាបាលបានភ្លាមៗដោយការដាក់វិន័យតឹងរ៉ឹងលើខ្លួនឯង",
            isCorrect: false,
          },
        ],
        explanation:
          "In cognitive behavioral therapy, behavioral activation shows that motivation frequently arrives after initiating gentle, low-pressure movement. Waiting for passion while feeling burned out traps people in cycles of paralysis [3, 4].",
        kmExplanation:
          "ក្នុងការព្យាបាលចិត្តសាស្ត្របែប CBT គោលការណ៍ Behavioral Activation បង្ហាញថាកម្លាំងចិត្តច្រើនតែកើតឡើងបន្ទាប់ពីយើងធ្វើសកម្មភាពតូចៗដោយទន់ភ្លន់។ ការអង្គុយរង់ចាំកម្លាំងចិត្តទាំងរាងកាយអស់ថាមពល នឹងធ្វើឱ្យយើងជាប់គាំងក្នុងភាពទាល់ច្រក [3, 4]។",
      },
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "Cambodian Context: The 'Laziness' Stigma and Internalized Guilt [5]",
      kmTitle: "បរិបទសង្គមកម្ពុជា៖ ការយល់ច្រឡំថាជា «ភាពខ្ជិល» និងអារម្មណ៍បន្ទោសខ្លួនឯង (The 'Laziness' Stigma)",
      type: "reading",
      paragraphs: [
        "In Cambodian society, there is immense cultural admiration for hard work, diligence, and endurance. When someone suddenly stops waking up early, withdraws from conversations, or abandons their hobbies, peers and family members frequently misinterpret it as 'laziness' (ខ្ជិល) or 'overthinking' (គិតច្រើនពេក) [5].",
        "Well-meaning elders might tell you: 'Just smile more, go outside, or pray, and you will be fine.' While spoken with good intentions, these remarks can induce excruciating shame. You begin to believe that your inability to feel joy is a sign of ungratefulness or weak character.",
        "UNICEF Cambodia and local mental health advocates point out that emotional numbness and anhedonia are neurobiological conditions, not moral failings [5]. You cannot cure a depleted nervous system with guilt. Acknowledging that your exhaustion is genuine allows you to replace self-punishment with clinical self-care.",
      ],
      kmParagraphs: [
        "នៅក្នុងសង្គមខ្មែរ យើងមានការកោតសរសើរយ៉ាងខ្លាំងចំពោះភាពឧស្សាហ៍ព្យាយាម ការអត់ធន់ និងការខិតខំប្រឹងប្រែង។ នៅពេលដែលនរណាម្នាក់ស្រាប់តែបាត់បង់កម្លាំងចិត្ត មិនចង់ក្រោកពីព្រលឹម ដកខ្លួនចេញពីការជជែក ឬបោះបង់ចំណង់ចំណូលចិត្ត មិត្តភក្តិ និងក្រុមគ្រួសារច្រើនតែយល់ច្រឡំថាជា «ភាពខ្ជិល» ឬ «មកពីគិតច្រើនពេក» [5]។",
        "មនុស្សចាស់ដែលមានបំណងល្អអាចនឹងប្រាប់អ្នកថា៖ «គ្រាន់តែញញឹមឱ្យច្រើន ចេញទៅក្រៅ ឬទៅវត្តទៅ នឹងជាហើយ»។ ទោះបីជាពាក្យទាំងនេះនិយាយចេញពីបំណងល្អក៏ដោយ វាក៏អាចបង្កើតអារម្មណ៍ខ្មាសអៀន និងឈឺចាប់ក្នុងចិត្តយ៉ាងខ្លាំង។ អ្នកចាប់ផ្តើមគិតថាអសមត្ថភាពក្នុងការសប្បាយរបស់អ្នក គឺជាការមិនចេះដឹងគុណ ឬជាភាពទន់ខ្សោយផ្ទាល់ខ្លួន។",
        "អង្គការ UNICEF Cambodia និងអ្នកជំនាញសុខភាពផ្លូវចិត្តក្នុងស្រុកបញ្ជាក់ថា ការស្ពឹកស្រពន់ផ្លូវចិត្ត និង Anhedonia គឺជាអាការជីវសាស្ត្រនៃប្រព័ន្ធប្រសាទ មិនមែនជាការខូចចរិតឡើយ [5]។ អ្នកមិនអាចព្យាបាលប្រព័ន្ធប្រសាទដែលអស់កម្លាំងដោយប្រើការស្តីបន្ទោសខ្លួនឯងបានទេ។ ការទទួលស្គាល់ថាការអស់ថាមពលរបស់អ្នកជារឿងពិត នឹងជួយឱ្យអ្នកប្តូរពីការដាក់ទណ្ឌកម្មខ្លួនឯង មកជាការថែទាំសុខភាពផ្លូវចិត្តតាមក្បួនត្រឹមត្រូវ។",
      ],
      keyPoints: [
        "Loss of motivation is routinely mislabeled as laziness (ខ្ជិល) in local culture [5].",
        "Telling someone with anhedonia to 'just be positive' increases shame and isolation.",
        "Your emotional state is a neurobiological signal requiring rest, not a moral defect.",
      ],
      kmKeyPoints: [
        "ការបាត់បង់កម្លាំងចិត្ត ជារឿយៗត្រូវបានគេយល់ច្រឡំថាជាភាពខ្ជិលច្រអូស [5]។",
        "ការប្រាប់អ្នកដែលមានអាការស្ពឹកស្រពន់ឱ្យ «គ្រាន់តែញញឹម» រឹតតែបង្កើនការឈឺចាប់ និងភាពឯកោ។",
        "ស្ថានភាពផ្លូវចិត្តរបស់អ្នកគឺជាសញ្ញាព្រមានជីវសាស្ត្រដែលទាមទារការសម្រាក មិនមែនជាកំហុសចរិតឡើយ។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "The Motivation Trap: Why Waiting for Passion Keeps You Stuck [4]",
      kmTitle: "អន្ទាក់នៃកម្លាំងចិត្ត៖ ហេតុអ្វីការរង់ចាំការបំផុសគំនិតធ្វើឱ្យអ្នកជាប់គាំង? (The Motivation Trap)",
      type: "reading",
      paragraphs: [
        "Many people believe in a simple sequence: First comes inspiration, then motivation, and finally action. When you feel numb, you wait on your sofa for inspiration to strike like lightning before touching your instruments or hobbies.",
        "Unfortunately, when anhedonia is present, inspiration almost never arrives first. Waiting passively creates a self-fulfilling trap: inactivity leads to deeper guilt, which lowers dopamine further, cementing the apathy [4].",
        "Clinical cognitive behavioral therapy reverses this arrow: Action comes first, even in tiny microscopic amounts. Action creates mild sensory feedback, which triggers small dopamine trickles, gradually awakening motivation. You do not need to feel passionate to begin; you only need to take one small, gentle action.",
      ],
      kmParagraphs: [
        "មនុស្សជាច្រើនជឿលើលំដាប់លំដោយមួយថា៖ ដំបូងត្រូវមានការបំផុសគំនិត (Inspiration) បន្ទាប់មកកើតកម្លាំងចិត្ត (Motivation) ហើយចុងក្រោយទើបចាប់ផ្តើមធ្វើសកម្មភាព (Action)។ នៅពេលដែលអ្នកស្ពឹកស្រពន់ក្នុងចិត្ត អ្នកតែងតែអង្គុយរង់ចាំឱ្យមានកម្លាំងចិត្តហោះមកដូចរន្ទះ ទើបព្រមប៉ះឧបករណ៍ ឬសៀវភៅរបស់អ្នក។",
        "ជាអកុសល នៅពេលដែលអ្នកមានអាការ Anhedonia ការបំផុសគំនិតកម្រនឹងកើតឡើងមុនគេណាស់។ ការអង្គុយរង់ចាំបង្កើតបានជាអន្ទាក់មួយ៖ អសកម្មភាពនាំឱ្យមានការបន្ទោសខ្លួនឯង កាត់បន្ថយសារធាតុ Dopamine រឹតតែខ្លាំង ហើយធ្វើឱ្យអ្នកកាន់តែស្ពឹកស្រពន់ [4]។",
        "វិធីសាស្ត្រព្យាបាលចិត្តសាស្ត្របែប CBT បញ្ច្រាសព្រួញនេះឡើងវិញ៖ សកម្មភាពកើតឡើងមុន ទោះបីជាក្នុងកម្រិតតូចល្អិតបំផុតក៏ដោយ។ សកម្មភាពបង្កើតការភ្ញោចអារម្មណ៍ស្រាលៗ ដែលជួយបញ្ចេញ Dopamine បន្តិចម្តងៗដើម្បីដាស់កម្លាំងចិត្ត។ អ្នកមិនចាំបាច់រង់ចាំទាល់តែមានក្តីរំភើបខ្លាំងទើបចាប់ផ្តើមឡើយ អ្នកគ្រាន់តែត្រូវការបោះជំហានតូចមួយដោយទន់ភ្លន់ប៉ុណ្ណោះ។",
      ],
      keyPoints: [
        "Waiting for motivation before acting is a psychological trap [4].",
        "The healthy sequence is: Micro-Action -> Sensory Feedback -> Gentle Motivation.",
        "You do not need to feel like doing it; you only need to lower the threshold.",
      ],
      kmKeyPoints: [
        "ការអង្គុយរង់ចាំកម្លាំងចិត្តមុននឹងធ្វើសកម្មភាព គឺជាអន្ទាក់ផ្លូវចិត្ត [4]។",
        "លំដាប់លំដោយត្រឹមត្រូវគឺ៖ សកម្មភាពតូចមួយ -> ការទទួលដឹងនៃអារម្មណ៍ -> កម្លាំងចិត្តទន់ភ្លន់។",
        "អ្នកមិនចាំបាច់មានអារម្មណ៍ចង់ធ្វើខ្លាំងនោះទេ អ្នកគ្រាន់តែបន្ថយកម្រិតលំបាកឱ្យនៅទាបបំផុត។",
      ],
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "The '5-Minute Low-Pressure Rule' and Micro-Dosing Pleasure [3, 4]",
      kmTitle: "គោលការណ៍ «៥ នាទីគ្មានសម្ពាធ» និងការទទួលយកក្តីរីករាយកម្រិតស្រាល (The 5-Minute Low-Pressure Rule)",
      type: "reading",
      paragraphs: [
        "How do you practice action when your energy is near zero? You implement the '5-Minute Low-Pressure Rule' [4].",
        "Give yourself permission to do the activity for exactly five minutes, with zero expectation of joy, mastery, or finishing a project. If you play guitar, pluck three strings while sitting on the floor. If you draw, scribble lines on a scrap of paper for two minutes. If you read, glance at one single paragraph.",
        "Crucially, release the demand for euphoria. Do not ask: 'Did I love that as much as before?' Instead, adopt neutral curiosity: 'How did the strings feel under my fingertips? What did the paper look like?' This is called micro-dosing pleasure. It gently exercises your reward circuits without overloading your fragile nervous system [3].",
      ],
      kmParagraphs: [
        "តើអ្នកអាចធ្វើសកម្មភាពដោយរបៀបណា នៅពេលដែលថាមពលរបស់អ្នកស្ទើរតែស្មើសូន្យ? ចម្លើយគឺការអនុវត្ត «គោលការណ៍ ៥ នាទីគ្មានសម្ពាធ» [4]។",
        "សូមផ្តល់ការអនុញ្ញាតឱ្យខ្លួនឯងធ្វើសកម្មភាពនោះត្រឹមតែ ៥ នាទីប៉ុណ្ណោះ ដោយមិនទាមទារឱ្យមានក្តីរីករាយ មិនទាមទារឱ្យធ្វើបានល្អឥតខ្ចោះ និងមិនចាំបាច់បញ្ចប់គម្រោងនោះឡើយ។ ប្រសិនបើអ្នកលេងហ្គីតា សូមគ្រាន់តែដេញខ្សែ ៣ ខ្សែពេលកំពុងអង្គុយលើកម្រាល។ ប្រសិនបើអ្នកចូលចិត្តគូររូប សូមគ្រាន់តែគូសវាសបន្ទាត់លើក្រដាសកាកសំណល់ ២ នាទី។ ប្រសិនបើអ្នកចូលចិត្តអាន សូមអានត្រឹមតែមួយកថាខណ្ឌ។",
        "ចំណុចសំខាន់បំផុត គឺកុំទាមទារឱ្យមានអារម្មណ៍រំភើបខ្លាំង។ កុំសួរខ្លួនឯងថា៖ «តើខ្ញុំសប្បាយដូចកាលពីមុនទេ?» ប៉ុន្តែសូមសង្កេតដោយចិត្តស្ងប់ថា៖ «តើខ្សែហ្គីតាមានអារម្មណ៍យ៉ាងណាលើចុងម្រាមដៃ? តើទឹកថ្នាំមានពណ៌បែបណា?» នេះហៅថាការទទួលយកក្តីរីករាយកម្រិតស្រាល (Micro-Dosing Pleasure)។ វាជួយហាត់សមប្រព័ន្ធរង្វាន់ខួរក្បាលថ្នមៗ ដោយមិនដាក់បន្ទុកលើប្រព័ន្ធប្រសាទ [3]។",
      ],
      keyPoints: [
        "Commit to only 5 minutes with total permission to stop immediately afterwards [4].",
        "Detach from the demand for ecstasy; focus on neutral sensory presence.",
        "Micro-steps build trust between your conscious mind and your weary body.",
      ],
      kmKeyPoints: [
        "ប្តេជ្ញាធ្វើត្រឹមតែ ៥ នាទីប៉ុណ្ណោះ រួចឈប់ភ្លាមៗប្រសិនបើមិនចង់បន្ត [4]។",
        "កុំទាមទារឱ្យមានក្តីរំភើបខ្លាំង ចូរផ្ដោតលើការដឹងនៃញាណរាងកាយធម្មតា។",
        "ជំហានតូចៗជួយកសាងទំនុកចិត្តរវាងចិត្ត និងរាងកាយដែលកំពុងហត់នឿយរបស់អ្នក។",
      ],
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "Personal Motivation Check-in: What Is Your Body Asking For?",
      kmTitle: "ការពិនិត្យកម្លាំងចិត្តផ្ទាល់ខ្លួន៖ តើរាងកាយរបស់អ្នកកំពុងទាមទារអ្វី? (Personal Motivation Check-in)",
      type: "reflection",
      paragraphs: [
        "When your interest in life goes quiet, it is often because your body is trying to tell you something important. Take a quiet breath and listen without judgment.",
      ],
      kmParagraphs: [
        "នៅពេលដែលចំណាប់អារម្មណ៍របស់អ្នកក្នុងជីវិតប្រែជាស្ងប់ស្ងាត់ វាច្រើនតែកើតឡើងដោយសាររាងកាយកំពុងព្យាយាមប្រាប់រឿងសំខាន់ដល់អ្នក។ សូមដកដង្ហើមស្ងប់ចិត្ត ហើយស្តាប់ខ្លួនឯងដោយគ្មានការវិនិច្ឆ័យ។",
      ],
      reflection: {
        question: "When you reflect honestly on your loss of interest lately, which feeling resonates most closely?",
        kmQuestion: "នៅពេលដែលអ្នកឆ្លុះបញ្ចាំងដោយស្មោះត្រង់ពីការបាត់បង់ចំណាប់អារម្មណ៍នាពេលថ្មីៗនេះ តើអារម្មណ៍មួយណាដែលត្រូវនឹងអ្នកបំផុត?",
        options: [
          "I am profoundly exhausted physically and mentally from carrying continuous stress and responsibilities",
          "I feel an overarching emotional numbness and sadness across almost everything in my life, not just hobbies",
          "I feel intense pressure to perform and succeed, which has drained all the fun out of things I used to enjoy",
          "I feel that my interests and life priorities are naturally evolving, but I feel guilty about moving on",
        ],
        kmOptions: [
          "ខ្ញុំហត់នឿយខ្លាំងទាំងរាងកាយ និងចិត្តដោយសារតែរែកពន់ភាពតានតឹង និងការទទួលខុសត្រូវមិនឈប់",
          "ខ្ញុំមានអារម្មណ៍ស្ពឹកស្រពន់ និងក្រៀមក្រំលើស្ទើរតែគ្រប់រឿងក្នុងជីវិត មិនមែនតែលើចំណង់ចំណូលចិត្តប៉ុណ្ណោះទេ",
          "ខ្ញុំមានសម្ពាធខ្លាំងក្នុងការប្រឹងប្រែងឱ្យជោគជ័យ ដែលធ្វើឱ្យបាត់បង់ភាពសប្បាយរីករាយទាំងអស់",
          "ខ្ញុំមានអារម្មណ៍ថាចំណូលចិត្ត និងអាទិភាពជីវិតកំពុងផ្លាស់ប្តូរតាមធម្មជាតិ ប៉ុន្តែខ្ញុំមានអារម្មណ៍ខុសឆ្គង",
        ],
        feedbackMessage:
          "Honoring your emotional state is the foundation of genuine healing. Whether your numbness is driven by physical exhaustion, depressive weight, performance pressure, or natural evolution, your feelings are valid. You do not need to rush yourself back to who you were yesterday.",
        kmFeedbackMessage:
          "ការទទួលស្គាល់ស្ថានភាពអារម្មណ៍ពិតប្រាកដ គឺជាគ្រឹះនៃការជាសះស្បើយ។ ទោះបីជាការស្ពឹកស្រពន់របស់អ្នកបណ្តាលមកពីការអស់កម្លាំង សម្ពាធការងារ ជំងឺបាក់ទឹកចិត្ត ឬការផ្លាស់ប្តូរធម្មជាតិក៏ដោយ អារម្មណ៍របស់អ្នកសុទ្ធតែត្រឹមត្រូវ និងសមហេតុផល។ អ្នកមិនចាំបាច់បង្ខំខ្លួនឯងឱ្យវិលត្រឡប់ទៅរកអតីតកាលភ្លាមៗនោះទេ។",
      },
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "Knowing When to Seek Professional Support [1, 2]",
      kmTitle: "ពេលណាដែលការបាត់បង់ចំណាប់អារម្មណ៍ទាមទារការគាំទ្រពីអ្នកជំនាញ? (When to Seek Support)",
      type: "reading",
      paragraphs: [
        "While a temporary loss of motivation is common during periods of stress, persistent and pervasive anhedonia warrants caring clinical attention [1].",
        "If your lack of interest has persisted for more than two to three weeks, if you struggle to get out of bed, if your appetite or sleep has drastically altered, or if you feel a pervasive sense of hopelessness, you do not have to endure this in silence [2].",
        "Licensed counselors and clinical psychologists provide evidence-based therapies, including Cognitive Behavioral Therapy (CBT) and Acceptance and Commitment Therapy (ACT). These structured approaches help you safely untangle emotional numbness, address underlying trauma or burnout, and restore neurochemical balance at your own pace.",
      ],
      kmParagraphs: [
        "ទោះបីជាការបាត់បង់កម្លាំងចិត្តបណ្តោះអាសន្នជារឿងធម្មតាក្នុងពេលមានស្ត្រេសក៏ដោយ ប៉ុន្តែប្រសិនបើអាការ Anhedonia កើតឡើងជាប់រហូត និងប៉ះពាល់គ្រប់រឿង នោះវាទាមទារការយកចិត្តទុកដាក់ខាងវេជ្ជសាស្ត្រ និងចិត្តសាស្ត្រ [1]។",
        "ប្រសិនបើការបាត់បង់ចំណាប់អារម្មណ៍របស់អ្នកបន្តលើសពី ២ ទៅ ៣ សប្តាហ៍ ប្រសិនបើអ្នកពិបាកក្រោកពីគ្រែ ប្រសិនបើការហូបចុក ឬការគេងប្រែប្រួលខ្លាំង ឬអ្នកមានអារម្មណ៍អស់សង្ឃឹមខ្លាំង អ្នកមិនគួរទ្រាំរែកពន់ការឈឺចាប់នេះដោយស្ងៀមស្ងាត់ឡើយ [2]។",
        "អ្នកចិត្តវិទ្យា និងអ្នកប្រឹក្សាដែលមានអាជ្ញាប័ណ្ណត្រឹមត្រូវ អាចជួយអ្នកតាមរយៈការព្យាបាលចិត្តសាស្ត្របែប CBT និង ACT។ វិធីសាស្ត្រទាំងនេះជួយអ្នកស្រាយភាពស្ពឹកស្រពន់ផ្លូវចិត្ត ដោះស្រាយបញ្ហាអស់កម្លាំងចិត្ត ឬរបួសផ្លូវចិត្តកន្លងមក និងស្តារតុល្យភាពប្រព័ន្ធប្រសាទឡើងវិញតាមល្បឿនដែលអ្នកមានអារម្មណ៍សុវត្ថិភាព។",
      ],
      keyPoints: [
        "Seek professional support if numbness lasts longer than 2 weeks across multiple areas [1, 2].",
        "CBT and ACT provide structured, non-judgmental roadmaps to restore vitality.",
        "Reaching out is an act of courageous self-preservation, not a sign of surrender.",
      ],
      kmKeyPoints: [
        "សូមស្វែងរកជំនួយពីអ្នកជំនាញ ប្រសិនបើការស្ពឹកស្រពន់មានរយៈពេលលើសពី ២ សប្តាហ៍ [1, 2]។",
        "ការព្យាបាលតាមបែប CBT និង ACT ផ្តល់នូវផែនទីច្បាស់លាស់ក្នុងការស្តារថាមពលឡើងវិញដោយគ្មានការវិនិច្ឆ័យ។",
        "ការស្វែងរកជំនួយ គឺជាទង្វើដ៏ក្លាហានក្នុងការថែរក្សាជីវិត មិនមែនជាការចុះចាញ់ឡើយ។",
      ],
    },
    {
      id: 10,
      sectionNumber: 10,
      title: "Grounding the Nervous System: The 1-Minute Calming Breath",
      kmTitle: "ការរំងាប់ប្រព័ន្ធប្រសាទ៖ លំហាត់ដកដង្ហើមស្ងប់ចិត្ត ១ នាទី (1-Minute Calming Breath)",
      type: "coping",
      paragraphs: [
        "When we feel frustrated by our lack of motivation, our autonomic nervous system often contracts into a state of chronic alarm. Let us release that tension with one minute of intentional breathing.",
        "Rest your hands comfortably on your lap or place one hand over your heart. Breathe in gently through your nose for a count of 4. Pause smoothly for a count of 2. Exhale slowly and softly through parted lips for a count of 6.",
        "With each long exhale, whisper to yourself: 'I am safe in this moment. I do not have to perform or produce right now.' Feel the support of the chair underneath you and allow your shoulders to drop.",
      ],
      kmParagraphs: [
        "នៅពេលដែលយើងមានការខកចិត្តចំពោះការបាត់បង់កម្លាំងចិត្ត ប្រព័ន្ធប្រសាទរបស់យើងច្រើនតែរឹតបន្តឹងដោយភាពតានតឹង។ ចូរយើងរំដោះភាពតានតឹងនោះចេញ តាមរយៈការដកដង្ហើមដោយស្មារតីត្រឹមតែ ១ នាទី។",
        "ដាក់ដៃរបស់អ្នកដោយស្រួលនៅលើភ្លៅ ឬដាក់ដៃម្ខាងលើទ្រូង។ ដកដង្ហើមចូលថ្នមៗតាមច្រមុះរាប់ដល់ ៤។ ផ្អាកដង្ហើមមួយភ្លែตรាប់ដល់ ២។ បន្ទាប់មកដកដង្ហើមចេញយឺតៗតាមមាត់រាប់ដល់ ៦។",
        "នៅរាល់ពេលដកដង្ហើមចេញវែងៗ សូមខ្សឹបប្រាប់ខ្លួនឯងថា៖ «ខ្ញុំមានសុវត្ថិភាពក្នុងពេលនេះ។ ខ្ញុំមិនចាំបាច់ប្រឹងធ្វើអ្វីឱ្យល្អឥតខ្ចោះនៅពេលនេះទេ»។ ទទួលដឹងពីការទ្រទ្រង់នៃកៅអីខាងក្រោមអ្នក ហើយទម្លាក់ស្មារបស់អ្នកចុះដោយធូរស្រាល។",
      ],
      keyPoints: [
        "Deep, extended exhalations down-regulate acute fight-or-flight arousal.",
        "Placing a hand over your heart stimulates the release of calming oxytocin.",
        "One minute of somatic safety signals your nervous system that it is safe to rest.",
      ],
      kmKeyPoints: [
        "ការដកដង្ហើមចេញវែងៗ ជួយបន្ថយភាពតានតឹងនៃប្រព័ន្ធប្រសាទស្វ័យប្រវត្ត។",
        "ការដាក់ដៃលើទ្រូងជួយបញ្ចេញអ័រម៉ូន Oxytocin ដែលផ្តល់ភាពកក់ក្តៅដល់ចិត្ត។",
        "ការផ្តល់សុវត្ថិភាពដល់រាងកាយត្រឹមតែ ១ នាទី ជួយផ្តល់សញ្ញាថាដល់ពេលអាចសម្រាកបានហើយ។",
      ],
      actions: [
        {
          label: "Practice 1-Minute Calming Breath",
          kmLabel: "អនុវត្តលំហាត់ដកដង្ហើមស្ងប់ចិត្ត ១ នាទី (1-Min Breath)",
          actionType: "exercise",
        },
      ],
    },
    {
      id: 11,
      sectionNumber: 11,
      title: "Gentle Pathways Forward on AROM [4, 5]",
      kmTitle: "មាគ៌ាដ៏ទន់ភ្លន់ឆ្ពោះទៅមុខនៅលើ AROM (Gentle Pathways on AROM)",
      type: "reading",
      paragraphs: [
        "Regaining motivation is not about forcing an instant turnaround. It is about offering yourself the same patient kindness you would give to an exhausted close friend.",
        "On AROM, you have a judgment-free space to rebuild at your own pace. Open your private AROM Journal (/journal) to write a zero-pressure check-in: describe one tiny sensory moment you noticed today, or simply write down: 'Today I rested, and that was enough.'",
        "If you want compassionate, personalized guidance to navigate anhedonia or life changes, visit AROM Professional (/professional) to connect with verified Cambodian counselors and therapists who specialize in burnout, depression, and youth pressures [5].",
        "If low motivation or deep sadness ever escalates into overwhelming crisis, despair, or thoughts that life is not worth living, please remember that immediate compassionate support is available. Call the National Child and Youth Helpline at 1280, the National Health Hotline at 119, or TPO Cambodia at 017 222 372. You are never alone on this path.",
      ],
      kmParagraphs: [
        "ការស្តារកម្លាំងចិត្តឡើងវិញ មិនមែនជាការបង្ខំឱ្យជាភ្លាមៗក្នុងមួយប៉ព្រិចភ្នែកនោះទេ។ វាគឺជាការផ្តល់ឱ្យខ្លួនឯងនូវក្តីមេត្តា និងការអត់ធ្មត់ ដូចដែលអ្នកផ្តល់ឱ្យមិត្តភក្តិជិតស្និទ្ធដែលកំពុងហត់នឿយខ្លាំងអញ្ចឹងដែរ។",
        "នៅលើ AROM អ្នកមានលំហសុវត្ថិភាពដែលគ្មានការវិនិច្ឆ័យដើម្បីស្តារថាមពលឡើងវិញ។ សូមបើកកំណត់ហេតុផ្ទាល់ខ្លួន AROM Journal (/journal) ដើម្បីកត់ត្រាដោយគ្មានសម្ពាធ៖ រៀបរាប់ពីរឿងតូចមួយដែលអ្នកបានកត់សម្គាល់ឃើញនៅថ្ងៃនេះ ឬគ្រាន់តែសរសេរថា៖ «ថ្ងៃនេះខ្ញុំបានសម្រាក ហើយប៉ុណ្ណឹងគឺគ្រប់គ្រាន់ហើយ»។",
        "ប្រសិនបើអ្នកចង់បានការណែនាំផ្ទាល់ខ្លួនប្រកបដោយក្តីមេត្តាដើម្បីដោះស្រាយបញ្ហាស្ពឹកស្រពន់ ឬការប្រែប្រួលជីវិត សូមចូលទៅកាន់ AROM Professional (/professional) ដើម្បីភ្ជាប់ទំនាក់ទំនងជាមួយអ្នកចិត្តវិទ្យាកម្ពុជាដែលមានការទទួលស្គាល់ត្រឹមត្រូវ ឯកទេសលើបញ្ហាអស់កម្លាំងចិត្ត និងជំងឺបាក់ទឹកចិត្ត [5]។",
        "ប្រសិនបើការបាត់បង់កម្លាំងចិត្ត ឬភាពក្រៀមក្រំឈានដល់កម្រិតវិបត្តិផ្លូវចិត្តធ្ងន់ធ្ងរ ឬមានអារម្មណ៍មិនចង់រស់នៅ សូមចងចាំថាជំនួយបន្ទាន់ត្រៀមជួយអ្នកជានិច្ច។ សូមទាក់ទងខ្សែទូរស័ព្ទជំនួយកុមារ និងយុវជនលេខ 1280 ខ្សែទូរស័ព្ទសុខភាពជាតិលេខ 119 ឬអង្គការចិត្តសង្គមកម្ពុជា (TPO Cambodia) តាមលេខ 017 222 372។ អ្នកមិនឯកោលើវិថីនេះឡើយ។",
      ],
      keyPoints: [
        "Record micro-moments without pressure in your private AROM Journal (/journal).",
        "Connect with verified therapists on AROM Professional (/professional) for caring support [5].",
        "Crisis help lines are always free, confidential, and ready: 1280, 119, or TPO Cambodia 017 222 372.",
      ],
      kmKeyPoints: [
        "កត់ត្រាអារម្មណ៍តូចៗដោយគ្មានសម្ពាធក្នុងកំណត់ហេតុផ្ទាល់ខ្លួន AROM Journal (/journal)។",
        "ភ្ជាប់ទំនាក់ទំនងជាមួយអ្នកជំនាញលើ AROM Professional (/professional) ដើម្បីទទួលបានការគាំទ្រ [5]។",
        "ខ្សែទូរស័ព្ទទាន់ហេតុការណ៍ឥតគិតថ្លៃ និងសម្ងាត់ត្រៀមជួយជានិច្ច៖ 1280, 119 ឬ TPO Cambodia 017 222 372។",
      ],
      alertBox: {
        type: "tip",
        text: "Compassionate Reminder: When a flower does not bloom, you do not blame the flower. You adjust the environment, the soil, and the sunlight. Give yourself patience while your inner soil recovers.",
        kmText: "សារដាស់តឿនដោយក្តីមេត្តា៖ នៅពេលដែលផ្កាមួយទងមិនរីក យើងមិនដែលបន្ទោសផ្កានោះឡើយ។ យើងតែងតែពិនិត្យបរិស្ថាន ដី និងពន្លឺថ្ងៃ។ សូមផ្តល់ការអត់ធ្មត់ដល់ខ្លួនឯង ក្នុងកំឡុងពេលដែលដីជីវិតរបស់អ្នកកំពុងស្តារឡើងវិញ។",
      },
      actions: [
        {
          label: "Open AROM Journal",
          kmLabel: "បើកកំណត់ហេតុ AROM Journal",
          actionType: "tips",
        },
        {
          label: "Talk to a Professional",
          kmLabel: "ពិគ្រោះជាមួយអ្នកជំនាញ AROM",
          actionType: "professional",
        },
      ],
    },
  ],
};


export const REFERENCES_SUPPORT_FRIEND: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "WHO",
    title: "World Health Organization: Psychological First Aid Guide for Field Workers",
    url: "https://www.who.int/publications/i/item/9789241548205",
  },
  {
    id: 2,
    citation: "[2]",
    source: "Mental Health Foundation",
    title: "Mental Health Foundation: How to Support Someone with a Mental Health Problem",
    url: "https://www.mentalhealth.org.uk/explore-mental-health/articles/how-support-someone-mental-health-problem",
  },
  {
    id: 3,
    citation: "[3]",
    source: "APA",
    title: "American Psychological Association: Listening to Friends in Distress and Preventing Burnout",
    url: "https://www.apa.org/topics/stress/support-network",
  },
  {
    id: 4,
    citation: "[4]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia: Peer Support and Mental Well-Being Among Cambodian Youth",
    url: "https://www.unicef.org/cambodia/mental-health",
  },
  {
    id: 5,
    citation: "[5]",
    source: "TPO Cambodia",
    title: "TPO Cambodia: Community Guidelines for Recognizing Emotional Distress and Crisis Response",
    url: "https://tpocambodia.org/",
  },
];

export const LESSON_SUPPORT_FRIEND: Lesson = {
  id: "how-to-support-a-struggling-friend",
  title: "How to Support a Friend Who Is Struggling",
  kmTitle: "របៀបជួយគាំទ្រមិត្តភក្តិដែលកំពុងជួបការលំបាក (How to Support a Struggling Friend)",
  subtitle: "Learn how to listen with empathy, avoid unhelpful advice, and encourage appropriate care",
  kmSubtitle: "រៀនស្តាប់ដោយក្តីមេត្តា ជៀសវាងការផ្តល់ដំបូន្មានខុសកាលៈទេសៈ និងជួយនាំផ្លូវរកជំនួយត្រឹមត្រូវ",
  category: "Relationships",
  duration: "8 min",
  kmDuration: "៨ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Practice",
  kmFormat: "ការអាន និងការអនុវត្ត (Reading & Practice)",
  isAvailable: true,
  image: "/mindguide/strategies.png",
  heroImage: "/mindguide/support-friend-hero.jpg",
  badge: "Essential",
  description:
    "Master the core principles of Psychological First Aid (Look, Listen, Link). Learn active emotional validation, establish healthy helper boundaries, overcome local stigma, and guide friends safely to care on AROM.",
  kmDescription:
    "ស្វែងយល់ពីគោលការណ៍គ្រឹះនៃជំនួយសង្គ្រោះបឋមផ្លូវចិត្ត (មើល ស្តាប់ ភ្ជាប់)។ រៀនស្តាប់ដោយក្តីមេត្តា បង្កើតព្រំដែនសុវត្ថិភាពផ្ទាល់ខ្លួន បំបាត់ការរើសអើង និងជួយណែនាំមិត្តភក្តិទៅរកអ្នកជំនាញនៅលើ AROM។",
  totalSections: 11,
  outcomes: [
    {
      en: "Apply Psychological First Aid principles: Look, Listen, and Link, to support friends ethically [1]",
      km: "អនុវត្តគោលការណ៍ជំនួយសង្គ្រោះបឋមផ្លូវចិត្ត (មើល ស្តាប់ ភ្ជាប់) ដើម្បីជួយមិត្តភក្តិដោយត្រឹមត្រូវ [1]",
    },
    {
      en: "Avoid the 'fix-it' trap and toxic positivity by practicing compassionate emotional validation [2, 3]",
      km: "ជៀសវាងអន្ទាក់នៃការចង់ដោះស្រាយជំនួស និងពាក្យលួងលោមដែលគ្មានប្រយោជន៍ ដោយអនុវត្តការយល់ចិត្ត [2, 3]",
    },
    {
      en: "Navigate Cambodian cultural nuances by replacing 'do not overthink' with genuine emotional presence [4, 5]",
      km: "យល់ដឹងពីបរិបទសង្គមខ្មែរ ដោយជំនួសពាក្យ «កុំគិតច្រើន» មកជាការនៅក្បែរដោយស្មោះត្រង់ [4, 5]",
    },
    {
      en: "Maintain healthy personal boundaries to prevent caregiver burnout and compassion fatigue [2, 3]",
      km: "រក្សាព្រំដែនសុខភាពល្អផ្ទាល់ខ្លួន ដើម្បីការពារការអស់កម្លាំងចិត្ត និងការហត់នឿយក្នុងការជួយអ្នកដទៃ [2, 3]",
    },
    {
      en: "Identify acute crisis warning signs and understand when confidentiality must give way to physical safety [1, 5]",
      km: "សម្គាល់សញ្ញាអាសន្នធ្ងន់ធ្ងរ និងដឹងច្បាស់ពីពេលដែលត្រូវស្វែងរកជំនួយសង្គ្រោះបន្ទាន់ភ្លាមៗ [1, 5]",
    },
    {
      en: "Encourage professional counseling gently on AROM and access national Cambodian crisis hotlines [4, 5]",
      km: "លើកទឹកចិត្តឱ្យស្វែងរកការប្រឹក្សាលើ AROM ដោយទន់ភ្លន់ និងស្គាល់ខ្សែទូរស័ព្ទទាន់ហេតុការណ៍កម្ពុជា [4, 5]",
    },
  ],
  references: REFERENCES_SUPPORT_FRIEND,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "The Urge to Fix vs. The Gift of Presence: What Friends Truly Need",
      kmTitle: "ចង់ជួយដោះស្រាយ ឬការនៅក្បែរដោយស្មោះត្រង់៖ អ្វីដែលមិត្តភក្តិកំពុងត្រូវការពិតប្រាកដ (Presence vs Fixing)",
      type: "reading",
      paragraphs: [
        "When a close friend opens up about feeling broken, exhausted, or overwhelmed, our immediate human instinct is to jump into problem-solving mode. We offer advice, suggest schedules, or rush to cheer them up by saying: 'Look on the bright side, things could be worse!'",
        "While this reaction comes from genuine love, psychologists at the American Psychological Association point out that unsolicited advice often backfires [3]. When someone is carrying intense grief or anxiety, being handed quick fixes makes them feel unheard, misunderstood, and even more isolated.",
        "What struggling friends need most is not a lecture or a motivational speech. They need your compassionate presence: a safe human space where they can be messy, imperfect, and vulnerable without being judged, rushed, or dismissed [2, 3].",
      ],
      kmParagraphs: [
        "នៅពេលដែលមិត្តភក្តិជិតស្និទ្ធបើកចិត្តប្រាប់ពីការឈឺចាប់ ភាពអស់កម្លាំង ឬវិបត្តិផ្លូវចិត្ត អារម្មណ៍ដំបូងបង្អស់របស់យើងគឺចង់ជួយដោះស្រាយបញ្ហាភ្លាមៗ។ យើងប្រញាប់ផ្តល់ដំបូន្មាន រៀបចំកាលវិភាគ ឬព្យាយាមលួងលោមគេថា៖ «កុំគិតច្រើនពេក មើលទៅមនុស្សផ្សេងទៀតគេលំបាកជាងយើងឆ្ងាយណាស់!»",
        "ទោះបីជាប្រតិកម្មនេះកើតចេញពីក្តីស្រឡាញ់ដ៏ស្មោះក៏ដោយ អ្នកចិត្តវិទ្យានៃសមាគមចិត្តវិទ្យាអាមេរិក (APA) បង្ហាញថាការផ្តល់ដំបូន្មានលឿនពេកច្រើនតែផ្តល់ផលអវិជ្ជមាន [3]។ នៅពេលដែលនរណាម្នាក់កំពុងរែកពន់ទុក្ខសោកធ្ងន់ធ្ងរ ការទទួលបានដំណោះស្រាយតក់ក្រហល់ធ្វើឱ្យគេមានអារម្មណ៍ថាយើងមិនយល់ពីគេ ហើយធ្វើឱ្យគេកាន់តែឯកោ។",
        "អ្វីដែលមិត្តភក្តិកំពុងជួបការលំបាកត្រូវការបំផុត មិនមែនជាការបង្រៀន ឬការលើកទឹកចិត្តបែបខ្យល់នោះឡើយ។ ពួកគេត្រូវការវត្តមានដ៏កក់ក្តៅរបស់អ្នក៖ លំហសុវត្ថិភាពដែលពួកគេអាចយំ អាចទន់ខ្សោយ និងអាចបង្ហាញអារម្មណ៍ពិត ដោយមិនភ័យខ្លាចការស្តីបន្ទោស ការវិនិច្ឆ័យ ឬការរុញច្រានចេញ [2, 3]។",
      ],
      keyPoints: [
        "Resist the urge to immediately fix your friend's painful emotions [3].",
        "Quick advice and toxic positivity make vulnerable friends feel dismissed.",
        "Emotional presence and deep listening heal far more effectively than lectures.",
      ],
      kmKeyPoints: [
        "ទប់ទល់នឹងអារម្មណ៍ចង់ប្រញាប់ប្រញាល់ដោះស្រាយបញ្ហាជំនួសមិត្តភក្តិ [3]។",
        "ការផ្តល់ដំណោះស្រាយតក់ក្រហល់ និងពាក្យលួងលោមបែបបង្ខំ ធ្វើឱ្យមិត្តភក្តិមានអារម្មណ៍ឯកោ។",
        "វត្តមានដ៏ស្ងប់ស្ងាត់ និងការស្តាប់ដោយយកចិត្តទុកដាក់ មានតម្លៃព្យាបាលខ្ពស់ជាងការផ្តល់ដំបូន្មាន។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "Psychological First Aid: The 3 Core Principles: Look, Listen, Link [1]",
      kmTitle: "ជំនួយសង្គ្រោះបឋមផ្លូវចិត្ត៖ គោលការណ៍គ្រឹះទាំង ៣៖ មើល ស្តាប់ និងភ្ជាប់ (Look, Listen, Link)",
      type: "reading",
      paragraphs: [
        "The World Health Organization developed the framework of Psychological First Aid (PFA) to guide humane, practical, and supportive care for people in distress [1]. The framework centers on three actionable pillars: Look, Listen, and Link.",
        "First, Look: Notice subtle shifts in your friend's baseline. Are they withdrawing from social gatherings, skipping class, staying silent in group chats, or appearing noticeably exhausted and disheveled?",
        "Second, Listen: Approach them in a calm, private setting. Ask open-ended questions like: 'I noticed you have seemed really quiet lately, how are you really holding up?' Listen patiently without interrupting, checking your phone, or trying to debate their feelings.",
        "Third, Link: Help them connect to practical support, trusted community members, basic biological care like water and food, and professional counseling resources [1].",
      ],
      kmParagraphs: [
        "អង្គការសុខភាពពិភពលោក (WHO) បានបង្កើតឡើងនូវគោលការណ៍ជំនួយសង្គ្រោះបឋមផ្លូវចិត្ត (Psychological First Aid) ដើម្បីជួយណែនាំការគាំទ្រប្រកបដោយក្តីមេត្តា និងការអនុវត្តជាក់ស្តែងដល់មនុស្សដែលជួបទុក្ខលំបាក [1]។ គោលការណ៍នេះផ្អែកលើសសរស្តម្ភសំខាន់ៗ ៣ គឺ៖ មើល ស្តាប់ និងភ្ជាប់។",
        "ទីមួយ គឺ មើល (Look)៖ សង្កេតមើលការផ្លាស់ប្តូរនៃអាកប្បកិរិយារបស់មិត្តភក្តិ។ តើពួកគេចាប់ផ្តើមដកខ្លួនចេញពីក្រុម ឈប់មកសាលា ស្ងាត់ស្ងៀមក្នុងគ្រុបជជែក ឬមើលទៅហត់នឿយខ្លាំងខុសពីធម្មតាដែរឬទេ?",
        "ទីពីរ គឺ ស្តាប់ (Listen)៖ ចូលទៅជួបពួកគេក្នុងកន្លែងស្ងប់ស្ងាត់ និងមានសុវត្ថិភាព។ សួរសំណួរបើកចំហដូចជា៖ «មួយរយៈនេះខ្ញុំកត់សម្គាល់ឃើញថាមិត្តមើលទៅស្ងប់ស្ងាត់ប្លែក តើមានរឿងអ្វីកើតឡើងក្នុងចិត្តដែរទេ?» ស្តាប់ដោយអត់ធ្មត់ដោយមិនកាត់សម្តី មិនចុចទូរស័ព្ទ និងមិនប្រកែកជាមួយអារម្មណ៍របស់គេ។",
        "ទីបី គឺ ភ្ជាប់ (Link)៖ ជួយភ្ជាប់ពួកគេទៅរកការគាំទ្រជាក់ស្តែង តម្រូវការមូលដ្ឋានដូចជាការហូបចុក និងដំណេក មនុស្សជិតស្និទ្ធដែលទុកចិត្ត និងអ្នកជំនាញប្រឹក្សាផ្លូវចិត្ត [1]។",
      ],
      keyPoints: [
        "Look: Observe warning signs and changes in baseline habits [1].",
        "Listen: Create a private, non-judgmental space with zero distractions.",
        "Link: Help connect them to biological stability and professional support.",
      ],
      kmKeyPoints: [
        "មើល (Look)៖ សង្កេតមើលសញ្ញាព្រមាន និងការប្រែប្រួលទម្លាប់ប្រចាំថ្ងៃ [1]។",
        "ស្តាប់ (Listen)៖ បង្កើតលំហជជែកផ្ទាល់ខ្លួនដោយគ្មានការរំខាន និងគ្មានការវិនិច្ឆ័យ។",
        "ភ្ជាប់ (Link)៖ ជួយសម្របសម្រួលតម្រូវការជាក់ស្តែង និងភ្ជាប់ទៅរកអ្នកជំនាញ។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Cambodian Context: Moving Beyond 'Don't Overthink' and Shame [4, 5]",
      kmTitle: "បរិបទសង្គមកម្ពុជា៖ ឈានឆ្លងផុតពាក្យ «កុំគិតច្រើន» និងការភ័យខ្លាចការបាក់មុខ (Cambodian Context & Stigma)",
      type: "reading",
      paragraphs: [
        "In Cambodian communities, the most common cultural phrase uttered when someone feels anxious or depressed is 'កុំគិតច្រើន' (Don't think too much) or 'គិតតែរឿងល្អៗទៅ' (Just think positive thoughts) [4].",
        "While elders and friends use these phrases to express goodwill, they inadvertently tell the person that their internal distress is an intentional, controllable mistake. It implies that if they just tried harder, they would not be suffering, which generates deep shame.",
        "Additionally, the fear of losing face or bringing embarrassment upon one's family often prevents young Cambodians from seeking help. As a supportive friend, you can break this silence. Reassure them that emotional pain is not a failure, and pledge that whatever they share with you remains strictly confidential and safe [4, 5].",
      ],
      kmParagraphs: [
        "នៅក្នុងសង្គមខ្មែរ ពាក្យដែលយើងឮញឹកញាប់បំផុតនៅពេលនរណាម្នាក់មានអារម្មណ៍ថប់បារម្ភ ឬក្រៀមក្រំ គឺពាក្យ «កុំគិតច្រើនពេក» ឬ «គិតតែរឿងសប្បាយៗទៅ» [4]។",
        "ទោះបីជាមនុស្សចាស់ ឬមិត្តភក្តិប្រើពាក្យទាំងនេះដោយបំណងល្អក៏ដោយ វាបែរជាធ្វើឱ្យអ្នកស្តាប់យល់ថា ទុក្ខសោករបស់ពួកគេគឺជាកំហុសរបស់ខ្លួនឯងទៅវិញ។ ពាក្យនេះបង្កប់ន័យថា ប្រសិនបើពួកគេគ្រាន់តែប្រឹងគិតវិជ្ជមាន នោះនឹងមិនមានរឿងអ្វីកើតឡើងឡើយ ដែលនាំឱ្យមានអារម្មណ៍ខ្មាសអៀន និងបន្ទោសខ្លួនឯងកាន់តែខ្លាំង។",
        "លើសពីនេះ ការភ័យខ្លាចការបាក់មុខ ឬខ្លាចធ្វើឱ្យខូចកិត្តិយសគ្រួសារ តែងតែរារាំងយុវជនកម្ពុជាមិនឱ្យហ៊ានបើកចំហរឿងរ៉ាវផ្ទាល់ខ្លួន។ ក្នុងនាមជាមិត្តភក្តិដែលយល់ចិត្ត អ្នកអាចជួយបំបែកភាពស្ងៀមស្ងាត់នេះបាន។ សូមធានាជាមួយពួកគេថា ការឈឺចាប់ផ្លូវចិត្តមិនមែនជាការបរាជ័យឡើយ ហើយរាល់រឿងរ៉ាវដែលពួកគេចែករំលែក នឹងត្រូវបានរក្សាទុកជាការសម្ងាត់យ៉ាងកក់ក្តៅបំផុត [4, 5]។",
      ],
      keyPoints: [
        "Replace 'កុំគិតច្រើន' (don't overthink) with genuine validation: 'I hear how painful this is' [4].",
        "Acknowledge the fear of losing face and family judgment in Cambodian culture.",
        "Strict confidentiality builds the safety required for genuine emotional healing.",
      ],
      kmKeyPoints: [
        "ជំនួសពាក្យ «កុំគិតច្រើន» ដោយការទទួលដឹងពីការឈឺចាប់៖ «ខ្ញុំដឹងថារឿងនេះពិតជាលំបាកខ្លាំងសម្រាប់មិត្ត» [4]។",
        "យល់ដឹងពីការភ័យខ្លាចការបាក់មុខ និងសម្ពាធគ្រួសារក្នុងវប្បធម៌ខ្មែរ។",
        "ការរក្សាការសម្ងាត់យ៉ាងម៉ឺងម៉ាត់ គឺជាគ្រឹះក្នុងការកសាងទំនុកចិត្តផ្លូវចិត្ត។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "Check Your Understanding: Supportive Validation vs. Accidental Invalidation",
      kmTitle: "ពិនិត្យការយល់ដឹង៖ ការផ្តល់កម្លាំងចិត្តត្រឹមត្រូវ និងការធ្វើឱ្យប៉ះពាល់អារម្មណ៍ដោយអចេតនា (Validation vs Invalidation)",
      type: "quiz",
      paragraphs: [
        "When someone we care about is crying or visibly distressed, our spontaneous reaction matters immensely. Test your instinct on what creates true emotional safety.",
      ],
      kmParagraphs: [
        "នៅពេលដែលមនុស្សជាទីស្រឡាញ់របស់យើងកំពុងយំ ឬមានទុក្ខព្រួយ ប្រតិកម្មដំបូងរបស់យើងមានឥទ្ធិពលយ៉ាងខ្លាំង។ សូមសាកល្បងពិនិត្យការយល់ដឹងអំពីវិធីបង្កើតសុវត្ថិភាពផ្លូវចិត្តពិតប្រាកដ។",
      ],
      quiz: {
        question: "Your friend says: 'I feel completely overwhelmed by exams and my family's financial debt. I feel like a useless failure.' Which response offers the most supportive validation?",
        kmQuestion: "មិត្តភក្តិរបស់អ្នកនិយាយថា៖ «ខ្ញុំមានអារម្មណ៍ថាលើសលប់ខ្លាំងណាស់ទាំងរឿងប្រឡង និងបំណុលគ្រួសារ។ ខ្ញុំមានអារម្មណ៍ថាខ្លួនឯងជាមនុស្សអត់បានការ និងបរាជ័យខ្លាំងណាស់។» តើការឆ្លើយតបមួយណាដែលផ្តល់ការយល់ចិត្ត និងកម្លាំងចិត្តត្រឹមត្រូវបំផុត?",
        options: [
          {
            id: "opt-a",
            text: "Do not say that! You have a great future, stop overthinking and just study harder tonight",
            kmText: "កុំនិយាយអញ្ចឹង! មិត្តមានអនាគតល្អណាស់ ឈប់គិតច្រើនទៅ ហើយយប់នេះខំមើលសៀវភៅថែមទៅ",
            isCorrect: false,
          },
          {
            id: "opt-b",
            text: "I am so sorry you are carrying so much heavy weight right now. You are not a failure to me. I am right here with you, and we will take this one step at a time",
            kmText: "ខ្ញុំសោកស្តាយណាស់ដែលមិត្តត្រូវរែកពន់បន្ទុកដ៏ធ្ងន់បែបនេះ។ សម្រាប់ខ្ញុំ មិត្តមិនមែនជាមនុស្សបរាជ័យឡើយ។ ខ្ញុំនៅក្បែរមិត្តទីនេះ ហើយយើងនឹងដើរទៅមុខមួយជំហានម្តងៗជាមួយគ្នា",
            isCorrect: true,
          },
          {
            id: "opt-c",
            text: "Everyone has financial problems in Cambodia, you just need to get used to it",
            kmText: "នៅស្រុកខ្មែរនរណាក៏មានបញ្ហាលុយកាក់ដែរ មិត្តត្រូវតែរៀនស៊ាំនឹងរឿងនេះទៅ",
            isCorrect: false,
          },
          {
            id: "opt-d",
            text: "Let me call your parents right now and tell them that they are putting too much pressure on you",
            kmText: "ចាំខ្ញុំទូរស័ព្ទទៅប្រាប់ឪពុកម្តាយមិត្តឥឡូវនេះ ថាកុំឱ្យដាក់សម្ពាធខ្លាំងពេកលើមិត្ត",
            isCorrect: false,
          },
        ],
        explanation:
          "Option B acknowledges the reality of their pain without dismissing their feelings or taking aggressive control away from them. It offers emotional co-presence, counters catastrophic self-loathing with genuine warmth, and promises collaborative pacing [2, 3].",
        kmExplanation:
          "ចម្លើយ ខ ទទួលស្គាល់ការឈឺចាប់ពិតប្រាកដរបស់គេ ដោយមិនច្រានចោលអារម្មណ៍ ឬដណ្តើមសិទ្ធិសម្រេចចិត្តពីគេឡើយ។ វាផ្តល់នូវវត្តមានដ៏កក់ក្តៅ បន្សាបការបន្ទោសខ្លួនឯង និងសន្យាដើរទៅមុខមួយជំហានម្តងៗជាមួយគ្នា [2, 3]។",
      },
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "The Art of Active Validation: Words That Heal and Words That Hurt [2, 3]",
      kmTitle: "សិល្បៈនៃការយល់ចិត្ត៖ ពាក្យសម្តីដែលផ្តល់ភាពកក់ក្តៅ និងពាក្យសម្តីដែលគួរជៀសវាង (Active Validation)",
      type: "reading",
      paragraphs: [
        "Words have immense power to either soothe a wounded nervous system or deepen its isolation. When supporting someone in crisis, small adjustments in language make a profound difference [2].",
        "Phrases that heal focus on validating their emotional reality: 'Thank you for trusting me enough to share this with me.' 'It makes total sense that you feel exhausted given everything on your plate.' 'I might not have all the answers, but I care about you deeply and I am not going anywhere.'",
        "Phrases to avoid include comparisons and minimizing statements: 'It could be worse.' 'Look at what I went through last year, I survived!' 'You just need to be more resilient.' Comparing their pain to others turns vulnerability into a competition and triggers defensive withdrawal [3].",
      ],
      kmParagraphs: [
        "ពាក្យសម្តីមានឥទ្ធិពលយ៉ាងធំធេងក្នុងការរំងាប់ចិត្ត ឬរុញច្រានគេឱ្យកាន់តែឯកោ។ នៅពេលជួយគាំទ្រនរណាម្នាក់ ការកែសម្រួលពាក្យសម្តីបន្តិចបន្តួចអាចបង្កើតភាពខុសប្លែកយ៉ាងធំធេង [2]។",
        "ពាក្យសម្តីដែលផ្តល់ភាពកក់ក្តៅ ផ្ដោតលើការទទួលដឹងពីអារម្មណ៍ពិតរបស់គេ៖ «អរគុណច្រើនដែលទុកចិត្តខ្ញុំ ហើយចែករំលែករឿងនេះជាមួយខ្ញុំ។» «វាពិតជាសមហេតុផលណាស់ដែលមិត្តមានអារម្មណ៍អស់កម្លាំងខ្លាំងបែបនេះ នៅពេលជួបរឿងច្រើនយ៉ាងនេះ។» «ខ្ញុំប្រហែលជាគ្មានចម្លើយដោះស្រាយគ្រប់យ៉ាងទេ ប៉ុន្តែខ្ញុំបារម្ភពីមិត្តខ្លាំងណាស់ ហើយខ្ញុំនៅក្បែរមិត្តជានិច្ច។»",
        "ពាក្យសម្តីដែលគួរជៀសវាង រួមមានការប្រៀបធៀប និងការបន្ទាបតម្លៃបញ្ហា៖ «រឿងប៉ុណ្ណឹងមិនអីទេ អ្នកផ្សេងគេលំបាកជាងនេះទៀត។» «មើលកាលពីឆ្នាំទៅខ្ញុំជួបលំបាកជាងនេះផង ខ្ញុំនៅតែទ្រាំបាន!» «មកពីមិត្តមិនព្រមរឹងមាំខ្លួនឯង។» ការយកការឈឺចាប់របស់គេទៅប្រៀបធៀបជាមួយអ្នកដទៃ នឹងធ្វើឱ្យគេមានអារម្មណ៍អាម៉ាស់ និងដកខ្លួនចេញ [3]។",
      ],
      keyPoints: [
        "Validation means accepting their emotional reality as legitimate, even if you see solutions [2].",
        "Never turn suffering into a competition by sharing your own struggles to one-up them.",
        "Silence and warm eye contact are often more powerful than clever words.",
      ],
      kmKeyPoints: [
        "ការយល់ចិត្ត (Validation) មានន័យថាទទួលស្គាល់អារម្មណ៍របស់គេថាជារឿងពិត ទោះបីជាអ្នកឃើញដំណោះស្រាយក៏ដោយ [2]។",
        "កុំយកការឈឺចាប់មកប្រកួតប្រជែង ដោយលើករឿងរ៉ាវផ្ទាល់ខ្លួនមកបង្អាប់បញ្ហារបស់គេ។",
        "ភាពស្ងៀមស្ងាត់ប្រកបដោយការយកចិត្តទុកដាក់ និងក្រសែភ្នែកកក់ក្តៅ មានឥទ្ធិពលខ្លាំងជាងពាក្យពេចន៍វៃឆ្លាត។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "The Golden Boundary: Being a Loving Friend, Not an Unlicensed Therapist [2, 3]",
      kmTitle: "ព្រំដែនមាស៖ ធ្វើជាមិត្តភក្តិដែលស្រឡាញ់រាប់អាន មិនមែនជាអ្នកព្យាបាលផ្លូវចិត្ត (Friend vs Therapist)",
      type: "reading",
      paragraphs: [
        "One of the most dangerous traps for caring people is taking on total responsibility for another person's emotional survival. When a friend calls you at 3:00 AM every night crying, you may feel immense guilt if you do not stay awake, fearing that something catastrophic might happen if you set a boundary [2].",
        "Clinicians call this 'compassion fatigue' and 'helper burnout'. When you absorb your friend's trauma without boundaries, your own nervous system deteriorates. Soon, you become resentful, exhausted, and incapable of supporting anyone, including yourself [3].",
        "Remember: You are their peer and friend, not their primary healthcare provider. You can love someone fiercely while still holding necessary limits: 'I love you so much and want to support you. I need to sleep now so I can function at work tomorrow, but let us talk at lunchtime.' Setting boundaries preserves the friendship for the long run [2, 3].",
      ],
      kmParagraphs: [
        "អន្ទាក់ដ៏គ្រោះថ្នាក់បំផុតមួយសម្រាប់មនុស្សដែលមានចិត្តមេត្តា គឺការទទួលខុសត្រូវទាំងស្រុងលើការរស់រានផ្លូវចិត្តរបស់អ្នកដទៃ។ នៅពេលដែលមិត្តភក្តិទូរស័ព្ទមករកអ្នកនៅម៉ោង ៣ ទៀបភ្លឺរាល់យប់ទាំងយំសោក អ្នកអាចនឹងមានអារម្មណ៍ខុសឆ្គងខ្លាំងប្រសិនបើអ្នកមិនលើកទូរស័ព្ទ ដោយសារខ្លាចមានរឿងអាក្រក់កើតឡើងប្រសិនបើអ្នកកំណត់ព្រំដែន [2]។",
        "អ្នកជំនាញហៅបញ្ហានេះថា «ការអស់កម្លាំងចិត្តរបស់អ្នកជួយ» (Compassion Fatigue / Helper Burnout)។ នៅពេលដែលអ្នកស្រូបយកការឈឺចាប់របស់អ្នកដទៃដោយគ្មានព្រំដែន ប្រព័ន្ធប្រសាទរបស់អ្នកនឹងរងការខូចខាត។ មិនយូរប៉ុន្មាន អ្នកនឹងចាប់ផ្តើមធុញទ្រាន់ អស់កម្លាំង និងលែងមានសមត្ថភាពជួយនរណាម្នាក់បានទៀត សូម្បីតែខ្លួនឯង [3]។",
        "សូមចងចាំថា៖ អ្នកគឺជាមិត្តភក្តិ មិនមែនជាគ្រូពេទ្យ ឬអ្នកព្យាបាលចិត្តសាស្ត្ររបស់គេឡើយ។ អ្នកអាចស្រឡាញ់មិត្តភក្តិយ៉ាងជ្រាលជ្រៅ ដោយនៅតែរក្សាព្រំដែនចាំបាច់បាន៖ «ខ្ញុំស្រឡាញ់មិត្តខ្លាំងណាស់ ហើយចង់ជួយគាំទ្រមិត្ត។ ប៉ុន្តែយប់នេះខ្ញុំត្រូវគេងសិន ដើម្បីមានកម្លាំងធ្វើការនៅថ្ងៃស្អែក ចាំថ្ងៃត្រង់យើងជជែកគ្នាបន្តណា។» ការកំណត់ព្រំដែនជួយការពារមិត្តភាពឱ្យគង់វង្សយូរអង្វែង [2, 3]។",
      ],
      keyPoints: [
        "You are not responsible for fixing or curing your friend's mental health conditions [2].",
        "Compassion fatigue occurs when you absorb distress without replenishing your own energy.",
        "Clear, loving boundaries protect both your well-being and the authenticity of the relationship [3].",
      ],
      kmKeyPoints: [
        "អ្នកមិនមានទំនួលខុសត្រូវក្នុងការកែប្រែ ឬព្យាបាលជំងឺផ្លូវចិត្តរបស់មិត្តភក្តិឱ្យជាសះស្បើយនោះទេ [2]។",
        "ការអស់ថាមពលរបស់អ្នកជួយ កើតឡើងនៅពេលអ្នកស្រូបយកទុក្ខសោកដោយគ្មានការស្តារថាមពលផ្ទាល់ខ្លួន។",
        "ព្រំដែនច្បាស់លាស់ប្រកបដោយក្តីស្រឡាញ់ ជួយការពារសុខភាពរបស់អ្នក និងរក្សាមិត្តភាពឱ្យរឹងមាំ [3]។",
      ],
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "How to Gently Encourage Professional Care Without Being Pushy [1, 4]",
      kmTitle: "របៀបលើកទឹកចិត្តឱ្យស្វែងរកអ្នកជំនាញដោយទន់ភ្លន់ និងមិនបង្ខិតបង្ខំ (Encouraging Professional Care)",
      type: "reading",
      paragraphs: [
        "When you notice that your friend's distress is persistent, severe, or beyond what peer support can carry, guiding them toward professional care is the kindest step you can take. However, forcing or commanding them often creates defensiveness [1].",
        "Instead, frame professional therapy as a normal, healthy resource. Compare it to physical health: 'If you twisted your ankle and could not walk for three weeks, you would see a doctor. Seeing a counselor for emotional heaviness is exactly the same.'",
        "Offer collaborative companionship rather than an ultimatum: 'You do not have to figure this out alone. Would you like me to sit with you while we explore verified counselors on AROM?' or 'If you feel nervous, I can wait in the lobby during your first appointment' [4].",
      ],
      kmParagraphs: [
        "នៅពេលដែលអ្នកសង្កេតឃើញថា ទុក្ខសោករបស់មិត្តភក្តិកើតឡើងរ៉ាំរ៉ៃ ធ្ងន់ធ្ងរ ឬលើសពីសមត្ថភាពដែលមិត្តភក្តិអាចជួយបាន ការណែនាំពួកគេទៅរកអ្នកជំនាញ គឺជាទង្វើដ៏ល្អបំផុតដែលអ្នកអាចធ្វើបាន។ ប៉ុន្តែការបង្ខិតបង្ខំ ឬបញ្ជា ច្រើនតែធ្វើឱ្យពួកគេភ័យខ្លាច និងបដិសេធ [1]។",
        "ផ្ទុយទៅវិញ សូមពន្យល់ពួកគេឱ្យយល់ថា ការពិគ្រោះផ្លូវចិត្តជារឿងធម្មតា និងមានសុខភាពល្អ។ សូមប្រៀបធៀបវាទៅនឹងសុខភាពរាងកាយ៖ «ប្រសិនបើមិត្តគ្រេចជើងដើរមិនរួច ៣ សប្តាហ៍ មិត្តច្បាស់ជាទៅជួបគ្រូពេទ្យ។ ការទៅជួបអ្នកប្រឹក្សាផ្លូវចិត្តពេលមានទុក្ខសោកធ្ងន់ធ្ងរ គឺជារឿងដូចគ្នាទាំងស្រុង។»",
        "សូមផ្តល់ការកំដរដោយក្តីស្រឡាញ់ ជំនួសឱ្យការពាក្យគំរាមកំហែង៖ «មិត្តមិនបាច់ដោះស្រាយរឿងនេះតែម្នាក់ឯងទេ។ តើមិត្តចង់ឱ្យខ្ញុំអង្គុយក្បែរពេលមិត្តបើកមើលប្រវត្តិអ្នកជំនាញលើ AROM ដែរទេ?» ឬ «ប្រសិនបើមិត្តភ័យ ខ្ញុំអាចទៅចាំនៅខាងមុខគ្លីនិកពេលមិត្តចូលជួបអ្នកជំនាញលើកដំបូង» [4]។",
      ],
      keyPoints: [
        "Normalize mental health care by comparing it directly to physical medical treatment [1].",
        "Offer to accompany them through administrative steps like booking or finding contacts [4].",
        "Collaborative, gentle invitations work far better than demands or ultimatums.",
      ],
      kmKeyPoints: [
        "ពន្យល់ថាការថែទាំសុខភាពផ្លូវចិត្ត ជារឿងធម្មតាដូចគ្នានឹងការព្យាបាលជំងឺរាងកាយដែរ [1]។",
        "ផ្តល់ការកំដរជួយស្វែងរកព័ត៌មាន ឬជួយកក់ការណាត់ជួបជាមួយអ្នកជំនាញ [4]។",
        "ការអញ្ជើញដោយទន់ភ្លន់ និងសហការគ្នា មានប្រសិទ្ធភាពជាងការបង្ខិតបង្ខំ។",
      ],
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "Helper Self-Check: Reflecting on Your Personal Capacity",
      kmTitle: "ការពិនិត្យសមត្ថភាពផ្ទាល់ខ្លួន៖ តើថាមពលរបស់អ្នកមានកម្រិតណា? (Helper Self-Check)",
      type: "reflection",
      paragraphs: [
        "To pour into someone else's cup, your own vessel must have water. Take a moment to reflect on your honest experience as a supportive friend.",
      ],
      kmParagraphs: [
        "ដើម្បីអាចចាក់ទឹកចូលក្នុងកែវរបស់អ្នកដទៃបាន កែវផ្ទាល់ខ្លួនរបស់អ្នកត្រូវតែមានទឹកសិន។ សូមឆ្លុះបញ្ចាំងដោយស្មោះត្រង់ពីបទពិសោធន៍ផ្ទាល់ខ្លួនរបស់អ្នកក្នុងការជួយមិត្តភក្តិ។",
      ],
      reflection: {
        question: "When supporting a friend going through an intense crisis, what is usually your biggest personal struggle?",
        kmQuestion: "នៅពេលជួយគាំទ្រមិត្តភក្តិដែលកំពុងជួបវិបត្តិធ្ងន់ធ្ងរ តើអ្វីជាការលំបាកផ្ទាល់ខ្លួនដ៏ធំបំផុតរបស់អ្នក?",
        options: [
          "Feeling overwhelming anxiety that I am solely responsible for fixing their pain or keeping them safe",
          "Absorbing their grief and heaviness so deeply that I cannot sleep or concentrate on my own work",
          "Feeling awkward and tongue-tied, terrified that I will say the wrong thing and make them feel worse",
          "Feeling resentful and burned out because they lean on me 24/7 without respecting my personal limits",
        ],
        kmOptions: [
          "មានអារម្មណ៍ថប់បារម្ភខ្លាំងថា ខ្ញុំត្រូវតែជាអ្នកដោះស្រាយការឈឺចាប់របស់គេ ឬការពារគេតែម្នាក់ឯង",
          "ស្រូបយកទុក្ខសោករបស់គេខ្លាំងពេក រហូតដល់ខ្លួនឯងគេងមិនលក់ និងមិនអាចផ្ដោតលើការងារផ្ទាល់ខ្លួន",
          "មានអារម្មណ៍ទល់គំនិត និងខ្លាចនិយាយខុស ដែលធ្វើឱ្យគេកាន់តែពិបាកចិត្តជាងមុន",
          "មានអារម្មណ៍ធុញទ្រាន់ និងអស់កម្លាំងចិត្ត ដោយសារគេពឹងផ្អែកលើខ្ញុំ ២៤ ម៉ោងដោយមិនគោរពពេលវេលាផ្ទាល់ខ្លួន",
        ],
        feedbackMessage:
          "Recognizing your personal helper struggle is essential for sustainable compassion. You do not need to be an all-knowing superhero. Accepting your limitations protects your ability to love authentically without destroying your own peace.",
        kmFeedbackMessage:
          "ការដឹងពីចំណុចពិបាករបស់ខ្លួនឯង គឺជាកត្តាចាំបាច់ដើម្បីរក្សាក្តីមេត្តាឱ្យបានយូរអង្វែង។ អ្នកមិនចាំបាច់ធ្វើជាមនុស្សអស្ចារ្យដែលចេះគ្រប់រឿងនោះទេ។ ការទទួលស្គាល់ដែនកំណត់ផ្ទាល់ខ្លួន ជួយការពារសមត្ថភាពរបស់អ្នកក្នុងការផ្តល់ក្តីស្រឡាញ់ពិតប្រាកដ ដោយមិនបំផ្លាញសេចក្តីស្ងប់ក្នុងចិត្តខ្លួនឯង។",
      },
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "Recognizing Crisis Signs: What to Do When Safety Is at Risk [1, 5]",
      kmTitle: "ការសម្គាល់សញ្ញាអាសន្ន៖ អ្វីដែលត្រូវធ្វើនៅពេលមានគ្រោះថ្នាក់ដល់សុវត្ថិភាព (Crisis Intervention)",
      type: "reading",
      paragraphs: [
        "There is one critical exception to normal confidentiality: when your friend's immediate physical safety or life is in imminent danger [1].",
        "Warning signs of an acute mental health crisis include: talking directly or indirectly about wanting to die or disappear ('Everyone would be better off without me'), giving away prized belongings, saying goodbye unexpectedly, engaging in dangerous self-harm, or severe disoriented panic.",
        "If you see these signs, never leave them alone. Do not swear an oath of secrecy regarding suicide. Calmly and directly inform a trusted adult, family member, university counselor, or emergency hotline. Breaking confidentiality to save a life is the ultimate act of friendship [1, 5].",
      ],
      kmParagraphs: [
        "មានករណីលើកលែងដ៏សំខាន់មួយចំពោះការរក្សាការសម្ងាត់៖ នោះគឺនៅពេលដែលសុវត្ថិភាពរាងកាយ ឬអាយុជីវិតរបស់មិត្តភក្តិស្ថិតក្នុងគ្រោះថ្នាក់បន្ទាន់ [1]។",
        "សញ្ញាព្រមាននៃវិបត្តិផ្លូវចិត្តកម្រិតអាសន្នរួមមាន៖ ការនិយាយដោយផ្ទាល់ ឬដោយប្រយោលអំពីការចង់ស្លាប់ ឬចង់បាត់ខ្លួន («បើគ្មានខ្ញុំ អ្នកទាំងអស់គ្នាច្បាស់ជាធូរស្រាលជាងនេះ») ការប្រគល់របស់របរជាទីស្រឡាញ់ឱ្យអ្នកដទៃ ការនិយាយលាខុសប្លែកពីធម្មតា ការធ្វើបាបខ្លួនឯងធ្ងន់ធ្ងរ ឬការភ័យស្លន់ស្លោរវើរវាយ។",
        "ប្រសិនបើអ្នកឃើញសញ្ញាទាំងនេះ សូមកុំទុកពួកគេចោលតែម្នាក់ឯងឱ្យសោះ។ កុំសន្យាថានឹងរក្សាការសម្ងាត់រឿងគំនិតចង់សម្លាប់ខ្លួនឡើយ។ សូមទាក់ទងមនុស្សចាស់ដែលទុកចិត្ត គ្រួសារ អ្នកប្រឹក្សានៅសាលា ឬខ្សែទូរស័ព្ទទាន់ហេតុការណ៍ជាបន្ទាន់។ ការបំបែកការសម្ងាត់ដើម្បីជួយសង្គ្រោះជីវិតមនុស្ស គឺជាទង្វើមិត្តភាពដ៏ខ្ពង់ខ្ពស់បំផុត [1, 5]។",
      ],
      keyPoints: [
        "Physical safety always overrides confidentiality during a life-threatening crisis [1].",
        "Never promise to keep suicidal intent or self-harm plans a secret.",
        "Stay with them and involve professional emergency responders immediately [5].",
      ],
      kmKeyPoints: [
        "សុវត្ថិភាពអាយុជីវិត តែងតែសំខាន់ជាងការរក្សាការសម្ងាត់ក្នុងពេលមានវិបត្តិអាសន្ន [1]។",
        "កុំសន្យាថានឹងលាក់ការសម្ងាត់អំពីគំនិតចង់ធ្វើបាបខ្លួនឯង ឬការសម្លាប់ខ្លួនឱ្យសោះ។",
        "នៅក្បែរពួកគេ ហើយទាក់ទងអ្នកជំនាញសង្គ្រោះបន្ទាន់ភ្លាមៗ [5]។",
      ],
    },
    {
      id: 10,
      sectionNumber: 10,
      title: "Shared Co-Regulation: The 1-Minute Calming Breath",
      kmTitle: "ការរំងាប់អារម្មណ៍រួមគ្នា៖ លំហាត់ដកដង្ហើមស្ងប់ចិត្ត ១ នាទី (1-Minute Co-Regulation Breath)",
      type: "coping",
      paragraphs: [
        "When your friend is weeping heavily or hyperventilating, words often fail. What their nervous system needs is 'co-regulation': syncing with your calm, grounded physical presence.",
        "Gently invite them: 'Let us take three slow breaths together. You do not have to say anything right now.' Place your feet flat on the floor, unclench your jaw, and breathe in through your nose for 4 counts.",
        "Hold gently for 2 counts, and exhale smoothly through your mouth for 6 counts. Repeat 4 times. As your breathing slows, their mirror neurons will unconsciously register safety, allowing their heart rate to decelerate.",
      ],
      kmParagraphs: [
        "នៅពេលដែលមិត្តភក្តិកំពុងយំខ្លាំង ឬដកដង្ហើមញាប់ៗដោយសារការភ័យស្លន់ស្លោ ពាក្យសម្តីជារឿយៗមិនអាចជួយបានភ្លាមៗឡើយ។ អ្វីដែលប្រព័ន្ធប្រសាទរបស់គេត្រូវការ គឺការរំងាប់អារម្មណ៍រួមគ្នា (Co-Regulation)៖ ការតភ្ជាប់ទៅនឹងវត្តមានដ៏ស្ងប់ស្ងាត់ពីរាងកាយរបស់អ្នក។",
        "សូមអញ្ជើញគេដោយទន់ភ្លន់៖ «ចូរយើងដកដង្ហើមវែងៗ ៣ ដងជាមួយគ្នាណា។ មិត្តមិនបាច់និយាយអ្វីទាំងអស់នៅពេលនេះទេ»។ ដាក់ជើងទាំងពីរលើកម្រាល បន្ធូរថ្គាម រួចដកដង្ហើមចូលតាមច្រមុះរាប់ដល់ ៤។",
        "ទប់ដង្ហើមថ្នមៗរាប់ដល់ ២ ហើយដកដង្ហើមចេញយឺតៗតាមមាត់រាប់ដល់ ៦។ អនុវត្តឡើងវិញ ៤ ដង។ នៅពេលដែលដង្ហើមរបស់អ្នកយឺត ប្រព័ន្ធប្រសាទរបស់មិត្តភក្តិនឹងទទួលដឹងពីសុវត្ថិភាពដោយស្វ័យប្រវត្តិ ដែលជួយបន្ថយចង្វាក់បេះដូងរបស់គេ។",
      ],
      keyPoints: [
        "Co-regulation uses your own nervous system to steady someone else's panic.",
        "A prolonged exhale triggers parasympathetic calming in both bodies.",
        "Somatic pacing is far more reassuring than saying 'calm down'.",
      ],
      kmKeyPoints: [
        "ការរំងាប់អារម្មណ៍រួមគ្នា ប្រើប្រាស់សេចក្តីស្ងប់ក្នុងខ្លួនរបស់អ្នក ដើម្បីជួយបន្ថយភាពស្លន់ស្លោរបស់អ្នកដទៃ។",
        "ការដកដង្ហើមចេញវែងៗ ជួយជំរុញប្រព័ន្ធរំងាប់អារម្មណ៍ដល់រាងកាយទាំងសងខាង។",
        "ការដកដង្ហើមជាមួយគ្នា មានប្រសិទ្ធភាពជាងការស្រែកប្រាប់គេឱ្យ «ស្ងប់ចិត្ត»។",
      ],
      actions: [
        {
          label: "Try 1-Minute Calming Breath",
          kmLabel: "អនុវត្តលំហាត់ដកដង្ហើមស្ងប់ចិត្ត ១ នាទី (1-Min Breath)",
          actionType: "exercise",
        },
      ],
    },
    {
      id: 11,
      sectionNumber: 11,
      title: "Connecting Your Support Circle on AROM [4, 5]",
      kmTitle: "ការភ្ជាប់រង្វង់គាំទ្ររបស់អ្នកនៅលើ AROM (Connecting on AROM)",
      type: "reading",
      paragraphs: [
        "Supporting a friend through emotional turmoil is one of the most generous gifts of human connection. However, true support is a shared village, not an isolated burden on your shoulders alone.",
        "On AROM, you and your friends have access to dedicated, confidential tools. You can use your private AROM Journal (/journal) to debrief your own emotional reactions after a heavy conversation, releasing any vicarious stress you absorbed.",
        "When your friend is ready for clinical guidance, direct them to AROM Professional (/professional). AROM connects seekers with licensed Cambodian psychologists and counselors who specialize in youth well-being, family dynamics, and trauma recovery [4, 5].",
        "If you or your friend ever face an acute emotional emergency, suicidal despair, or physical crisis, reach out immediately. The National Child and Youth Helpline is available at 1280, the National Health Hotline at 119, and TPO Cambodia crisis support at 017 222 372. Standing together creates lasting resilience.",
      ],
      kmParagraphs: [
        "ការជួយគាំទ្រមិត្តភក្តិឆ្លងកាត់ព្យុះភ្លៀងនៃអារម្មណ៍ គឺជាកាដូដ៏ថ្លៃថ្លាបំផុតនៃមិត្តភាព។ ប៉ុន្តែការគាំទ្រពិតប្រាកដ គឺជាការសហការគ្នារបស់សហគមន៍ មិនមែនជាការដាក់បន្ទុកទាំងស្រុងលើស្មារបស់អ្នកតែម្នាក់ឯងនោះឡើយ។",
        "នៅលើ AROM អ្នក និងមិត្តភក្តិរបស់អ្នកមានលទ្ធភាពប្រើប្រាស់ឧបករណ៍សុវត្ថិភាព និងសម្ងាត់ជាច្រើន។ អ្នកអាចប្រើប្រាស់កំណត់ហេតុ AROM Journal (/journal) ដើម្បីឆ្លុះបញ្ចាំងអារម្មណ៍ផ្ទាល់ខ្លួនបន្ទាប់ពីការសន្ទនាដ៏តានតឹង ដើម្បីរំដោះភាពនឿយហត់ដែលអ្នកបានស្រូបយក។",
        "នៅពេលដែលមិត្តភក្តិរបស់អ្នកត្រៀមខ្លួនរួចរាល់សម្រាប់ការប្រឹក្សាជាមួយអ្នកជំនាញ សូមណែនាំពួកគេទៅកាន់ AROM Professional (/professional)។ AROM ជួយភ្ជាប់ពួកគេទៅកាន់អ្នកចិត្តវិទ្យាកម្ពុជាដែលមានអាជ្ញាប័ណ្ណត្រឹមត្រូវ ឯកទេសលើសុខុមាលភាពយុវជន ទំនាក់ទំនងគ្រួសារ និងការដោះស្រាយរបួសផ្លូវចិត្ត [4, 5]។",
        "ប្រសិនបើអ្នក ឬមិត្តភក្តិជួបប្រទះវិបត្តិផ្លូវចិត្តកម្រិតអាសន្ន ឬមានគ្រោះថ្នាក់ដល់អាយុជីវិត សូមស្វែងរកជំនួយភ្លាមៗ។ ខ្សែទូរស័ព្ទជំនួយកុមារ និងយុវជនលេខ 1280 ខ្សែទូរស័ព្ទសុខភាពជាតិលេខ 119 និងអង្គការចិត្តសង្គមកម្ពុជា (TPO Cambodia) តាមលេខ 017 222 372។ ការឈរនៅក្បែរគ្នា នឹងបង្កើតបាននូវភាពរឹងមាំយូរអង្វែង។",
      ],
      keyPoints: [
        "Use AROM Journal (/journal) to process your own feelings and prevent burnout.",
        "Help friends connect with certified therapists on AROM Professional (/professional) [4].",
        "Emergency hotlines are free, confidential, and always available: 1280, 119, or TPO Cambodia 017 222 372.",
      ],
      kmKeyPoints: [
        "ប្រើប្រាស់កំណត់ហេតុ AROM Journal (/journal) ដើម្បីរំដោះអារម្មណ៍តានតឹង និងការពារការអស់កម្លាំងចិត្ត។",
        "ជួយណែនាំមិត្តភក្តិឱ្យភ្ជាប់ការប្រឹក្សាជាមួយអ្នកជំនាញលើ AROM Professional (/professional) [4]។",
        "ខ្សែទូរស័ព្ទជំនួយបន្ទាន់ឥតគិតថ្លៃ និងសម្ងាត់ត្រៀមជួយជានិច្ច៖ 1280, 119 ឬ TPO Cambodia 017 222 372។",
      ],
      alertBox: {
        type: "tip",
        text: "Important Reminder: Loving a struggling friend does not mean saving them alone. Your role is to walk beside them with warmth and hold their hand as you connect them to professional support.",
        kmText: "សារដាស់តឿនសំខាន់៖ ការស្រឡាញ់មិត្តភក្តិដែលកំពុងជួបទុក្ខ មិនមែនមានន័យថាអ្នកត្រូវសង្គ្រោះគេតែម្នាក់ឯងនោះទេ។ តួនាទីរបស់អ្នក គឺការដើរនៅក្បែរគេដោយក្តីមេត្តា និងកាន់ដៃគេភ្ជាប់ទៅរកជំនួយពីអ្នកជំនាញ។",
      },
      actions: [
        {
          label: "Open AROM Journal",
          kmLabel: "បើកកំណត់ហេតុ AROM Journal",
          actionType: "tips",
        },
        {
          label: "Talk to a Professional",
          kmLabel: "ពិគ្រោះជាមួយអ្នកជំនាញ AROM",
          actionType: "professional",
        },
      ],
    },
  ],
};


export const REFERENCES_LONELINESS: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "WHO",
    title: "World Health Organization: Commission on Social Connection and the Health Impacts of Loneliness",
    url: "https://www.who.int/groups/commission-on-social-connection",
  },
  {
    id: 2,
    citation: "[2]",
    source: "APA",
    title: "American Psychological Association: The Science of Loneliness and Building Meaningful Bonds",
    url: "https://www.apa.org/topics/stress/social-support",
  },
  {
    id: 3,
    citation: "[3]",
    source: "Harvard Health",
    title: "Harvard Health Publishing: Loneliness vs. Solitude: How to Turn Isolation into Restorative Care",
    url: "https://www.health.harvard.edu/mind-and-mood/the-difference-between-loneliness-and-solitude",
  },
  {
    id: 4,
    citation: "[4]",
    source: "NHS Every Mind Matters",
    title: "NHS Every Mind Matters: Managing Loneliness and Building Everyday Social Connections",
    url: "https://www.nhs.uk/every-mind-matters/lifes-challenges/loneliness/",
  },
  {
    id: 5,
    citation: "[5]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia: Youth Urban Migration, Living Away from Home, and Overcoming Isolation",
    url: "https://www.unicef.org/cambodia/mental-health",
  },
];

export const LESSON_LONELINESS: Lesson = {
  id: "how-to-deal-with-loneliness",
  title: "How to Deal With Loneliness",
  kmTitle: "របៀបដោះស្រាយភាពឯកោ (How to Deal With Loneliness)",
  subtitle: "Explore meaningful connection, transform solitude, and cultivate gentle self-care",
  kmSubtitle: "ស្វែងយល់ពីការតភ្ជាប់ទំនាក់ទំនងប្រកបដោយអត្ថន័យ ការផ្លាស់ប្តូរភាពនៅម្នាក់ឯង និងការថែទាំខ្លួនឯង",
  category: "Relationships",
  duration: "8 min",
  kmDuration: "៨ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Practice",
  kmFormat: "ការអាន និងការអនុវត្ត (Reading & Practice)",
  isAvailable: true,
  image: "/mindguide/strategies.png",
  heroImage: "/mindguide/loneliness-hero.jpg",
  badge: "Popular",
  description:
    "Unpack the neurobiology and psychology of loneliness. Learn the difference between isolation and nourishing solitude, navigate Cambodian urban migration pressures, build a low-stakes connection ladder, and ground in self-compassion on AROM.",
  kmDescription:
    "ស្វែងយល់ពីចិត្តវិទ្យានៃភាពឯកោ។ រៀនបែងចែកភាពឯកោពីភាពនៅម្នាក់ឯងដោយស្ងប់ស្ងាត់ (Solitude) គ្រប់គ្រងសម្ពាធនៃការផ្លាស់ទីមករាជធានី និងកសាងការតភ្ជាប់ទំនាក់ទំនងតាមជំហានតូចៗនៅលើ AROM។",
  totalSections: 11,
  outcomes: [
    {
      en: "Understand loneliness as an instinctive biological signal rather than a shameful personal defect [1, 2]",
      km: "យល់ដឹងពីភាពឯកោថាជាសញ្ញាព្រមានជីវសាស្ត្រធម្មជាតិ មិនមែនជាការខូចខាតតម្លៃផ្ទាល់ខ្លួនឡើយ [1, 2]",
    },
    {
      en: "Distinguish painful social disconnection from nourishing, restorative solitude [3]",
      km: "បែងចែកឱ្យច្បាស់រវាងការឯកោឈឺចាប់ និងភាពនៅម្នាក់ឯងដោយស្ងប់ស្ងាត់ដែលជួយស្តារថាមពល (Solitude) [3]",
    },
    {
      en: "Address Cambodian urban migration realities, rented room isolation, and social media comparison [4, 5]",
      km: "ដោះស្រាយបញ្ហាជាក់ស្តែងនៃការផ្លាស់ទីមករៀននៅរាជធានី ការនៅបន្ទប់ជួលម្នាក់ឯង និងការប្រៀបធៀបលើបណ្តាញសង្គម [4, 5]",
    },
    {
      en: "Deactivate the lonely brain's social threat hypervigilance loop and re-engage with neutrality [1, 2]",
      km: "កាត់ផ្តាច់រង្វិលជុំនៃការភ័យខ្លាចការបដិសេធក្នុងខួរក្បាល និងចាប់ផ្តើមទំនាក់ទំនងដោយចិត្តស្ងប់ [1, 2]",
    },
    {
      en: "Implement the 3-tier low-stakes connection ladder to build genuine social warmth without overwhelm [2, 4]",
      km: "អនុវត្តជណ្តើរនៃការតភ្ជាប់ ៣ កម្រិត ដើម្បីបង្កើតភាពកក់ក្តៅក្នុងសង្គមដោយគ្មានសម្ពាធ [2, 4]",
    },
    {
      en: "Practice somatic self-compassion breathwork and access confidential professional counseling on AROM [4, 5]",
      km: "អនុវត្តលំហាត់ដង្ហើមមេត្តាចំពោះខ្លួនឯង និងភ្ជាប់ការប្រឹក្សាដោយសម្ងាត់ជាមួយអ្នកជំនាញនៅលើ AROM [4, 5]",
    },
  ],
  references: REFERENCES_LONELINESS,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "The Loneliness Paradox: Feeling Alone in a Crowded Room",
      kmTitle: "ភាពផ្ទុយគ្នានៃភាពឯកោ៖ អារម្មណ៍នៅម្នាក់ឯងកណ្តាលចំណោមមនុស្សជាច្រើន (The Loneliness Paradox)",
      type: "reading",
      paragraphs: [
        "Have you ever sat in a crowded lecture hall, walked through a bustling market, or scrolled through hundreds of online messages, while feeling completely invisible and alone?",
        "This is the loneliness paradox. Loneliness is not simply the physical absence of people; it is the subjective emotional distress of feeling unseen, unknown, and misunderstood. You can be physically alone for days and feel completely at peace, or you can be surrounded by family and peers and feel an aching emotional vacuum.",
        "Clinical psychologists at the American Psychological Association remind us that loneliness is not a personal failure, a lack of social charm, or a character flaw [2]. It is a primal biological alarm. Just as physical hunger signals that your body needs calories, loneliness signals that your emotional nervous system needs meaningful social nourishment.",
      ],
      kmParagraphs: [
        "តើអ្នកធ្លាប់អង្គុយក្នុងបន្ទប់រៀនដែលមានមនុស្សពេញ ដើរក្នុងផ្សារដ៏អ៊ូអរ ឬអូសមើលសាររាប់រយក្នុងទូរស័ព្ទ ប៉ុន្តែនៅតែមានអារម្មណ៍ថាខ្លួនឯងទទេស្អាត និងឯកោខ្លាំងដែរឬទេ?",
        "នេះគឺជាភាពផ្ទុយគ្នានៃភាពឯកោ (Loneliness Paradox)។ ភាពឯកោមិនមែនគ្រាន់តែជាការគ្មានមនុស្សនៅក្បែរនោះឡើយ ប៉ុន្តែវាគឺជាការឈឺចាប់ផ្លូវចិត្តនៅពេលមានអារម្មណ៍ថា គ្មាននរណាម្នាក់មើលឃើញ គ្មាននរណាយល់ និងគ្មានអ្នកស្គាល់ចិត្តពិតប្រាកដ។ អ្នកអាចនៅម្នាក់ឯងជាច្រើនថ្ងៃដោយមានសេចក្តីសុខពេញលេញ ឬអ្នកអាចនៅកណ្តាលក្រុមគ្រួសារ និងមិត្តភក្តិ ប៉ុន្តែមានអារម្មណ៍ឯកោដូចនៅកណ្តាលវាលខ្សាច់។",
        "អ្នកចិត្តវិទ្យានៃសមាគមចិត្តវិទ្យាអាមេរិក (APA) រំលឹកយើងថា ភាពឯកោមិនមែនជាការបរាជ័យផ្ទាល់ខ្លួន ឬកង្វះភាពរួសរាយនោះទេ [2]។ វាគឺជាសំឡេងរោទ៍ជីវសាស្ត្រធម្មជាតិ។ ដូចគ្នានឹងអារម្មណ៍ឃ្លានបាយដែលប្រាប់ថារាងកាយត្រូវការអាហារ អារម្មណ៍ឯកោគឺជាសញ្ញាប្រាប់ថាប្រព័ន្ធប្រសាទរបស់អ្នកត្រូវការទំនាក់ទំនងដែលមានអត្ថន័យ។",
      ],
      keyPoints: [
        "Loneliness is the subjective feeling of being disconnected, not physical isolation.",
        "You can feel lonely in a crowded room, a busy office, or a large family gathering.",
        "Loneliness is a natural biological alarm signaling a hunger for genuine connection [2].",
      ],
      kmKeyPoints: [
        "ភាពឯកោគឺជាអារម្មណ៍ខាងក្នុងនៃការដាច់ទំនាក់ទំនង មិនមែនគ្រាន់តែជាការនៅម្នាក់ឯងឡើយ។",
        "អ្នកអាចមានអារម្មណ៍ឯកោកណ្តាលបន្ទប់រៀន កន្លែងធ្វើការ ឬក្នុងចំណោមគ្រួសារធំ។",
        "ភាពឯកោគឺជាសំឡេងរោទ៍ធម្មជាតិដែលប្រាប់ថាយើងត្រូវការការតភ្ជាប់ទំនាក់ទំនង [2]។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "Loneliness vs. Solitude: The Power of Restorative Aloneness [2, 3]",
      kmTitle: "ភាពឯកោ ធៀបនឹងភាពនៅម្នាក់ឯងដោយស្ងប់ស្ងាត់ (Loneliness vs. Solitude)",
      type: "reading",
      paragraphs: [
        "To heal our relationship with loneliness, we must understand the crucial distinction between loneliness and solitude [3].",
        "Loneliness is a state of lack and pain. It is accompanied by feelings of rejection, anxiety, emptiness, and the painful thought: 'Nobody cares about me, I am unwanted.'",
        "Solitude, on the other hand, is the state of being peacefully alone. Solitude is rich, chosen, and restorative. In solitude, you engage in creative writing, listen to music, sip hot tea, or water your plants without feeling rushed or judged. When you learn to transform unwanted isolation into nourishing solitude, being alone shifts from an emotional prison into a quiet sanctuary of recovery [2, 3].",
      ],
      kmParagraphs: [
        "ដើម្បីព្យាបាលភាពឯកោ យើងត្រូវយល់ដឹងពីភាពខុសគ្នាយ៉ាងសំខាន់រវាងភាពឯកោ (Loneliness) និងភាពនៅម្នាក់ឯងដោយស្ងប់ស្ងាត់ (Solitude) [3]។",
        "ភាពឯកោ គឺជាស្ថានភាពនៃការខ្វះខាត និងការឈឺចាប់។ វាអមដោយអារម្មណ៍ភ័យខ្លាច ភាពទទេស្អាត និងគំនិតអវិជ្ជមានថា៖ «គ្មាននរណាម្នាក់ខ្វល់ពីខ្ញុំទេ ខ្ញុំជាមនុស្សដែលគេមិនត្រូវការ។»",
        "ផ្ទុយទៅវិញ ភាពនៅម្នាក់ឯងដោយស្ងប់ស្ងាត់ (Solitude) គឺជាការពេញចិត្តក្នុងការនៅជាមួយខ្លួនឯង។ វាគឺជាពេលវេលាដ៏ស្ងប់ស្ងាត់ដែលអ្នកជ្រើសរើសដើម្បីស្តារថាមពល។ ក្នុងភាពនៅម្នាក់ឯងនេះ អ្នកអាចសរសេរអាន ស្តាប់តន្ត្រី ញ៉ាំតែ ឬស្រោចផ្កា ដោយគ្មានការវិនិច្ឆ័យពីអ្នកដទៃ។ នៅពេលដែលអ្នករៀនផ្លាស់ប្តូរការនៅម្នាក់ឯងឱ្យទៅជា Solitude ពេលវេលានៅម្នាក់ឯងនឹងប្រែពីគុកនៃអារម្មណ៍ ទៅជាកន្លែងសន្សំសេចក្តីស្ងប់ក្នុងចិត្តវិញ [2, 3]។",
      ],
      keyPoints: [
        "Loneliness is marked by an emotional vacuum and yearning for connection [3].",
        "Solitude is chosen, peaceful, self-nourishing time alone.",
        "Learning to enjoy your own company turns isolation into restorative healing.",
      ],
      kmKeyPoints: [
        "ភាពឯកោស្តែងចេញតាមរយៈភាពទទេស្អាត និងការឈឺចាប់នៃការដាច់ទំនាក់ទំនង [3]។",
        "Solitude គឺជាការជ្រើសរើសនៅម្នាក់ឯងដោយស្ងប់ចិត្ត ដើម្បីស្តារថាមពលឡើងវិញ។",
        "ការរៀនរីករាយជាមួយវត្តមានខ្លួនឯង ជួយប្តូរភាពឯកោឱ្យទៅជាការជាសះស្បើយ។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Cambodian Context: Urban Migration, Rented Rooms, and Social Media [4, 5]",
      kmTitle: "បរិបទសង្គមកម្ពុជា៖ ការផ្លាស់ទីមករាជធានី បន្ទប់ជួល និងបណ្តាញសង្គម (Cambodian Urban Isolation)",
      type: "reading",
      paragraphs: [
        "In modern Cambodia, demographic shifts have brought unprecedented waves of loneliness among young adults. Every year, thousands of students and workers leave their home provinces (ស្រុកកំណើត) to pursue university degrees or career opportunities in Phnom Penh [5].",
        "Moving from close-knit rural villages into crowded urban centers often means living alone in small rented rooms (បន្ទប់ជួល). After long shifts or late classes, coming home to an empty, silent room can feel overwhelmingly cold. The absence of family cooking, evening chats under the house stilt, and familiar neighbors creates acute cultural homesickness.",
        "This ache is magnified by social media. Sitting alone at night scrolling through TikTok, Instagram, and Facebook feeds filled with friends enjoying hotpot, birthday parties, or outings creates the painful illusion that everyone else is surrounded by love except you. UNICEF Cambodia emphasizes that this urban isolation is widespread and systemic, not a sign that you are unlikable [5].",
      ],
      kmParagraphs: [
        "នៅក្នុងសង្គមកម្ពុជាសម័យបច្ចុប្បន្ន ការផ្លាស់ប្តូរការរស់នៅបាននាំមកនូវរលកនៃភាពឯកោដែលមិនធ្លាប់មានក្នុងចំណោមយុវជន។ ជារៀងរាល់ឆ្នាំ និស្សិត និងយុវជនរាប់ម៉ឺននាក់បានចាកចេញពីស្រុកកំណើតនៅតាមបណ្តាខេត្ត ដើម្បីមកបន្តការសិក្សានៅសាកលវិទ្យាល័យ ឬធ្វើការងារនៅរាជធានីភ្នំពេញ [5]។",
        "ការផ្លាស់ប្តូរពីភូមិស្រុកដែលធ្លាប់មានភាពជិតស្និទ្ធ មករស់នៅក្នុងបន្ទប់ជួលតូចចង្អៀតតែម្នាក់ឯង គឺជាការផ្លាស់ប្តូរដ៏ធំធេង។ បន្ទាប់ពីការងារពេញមួយថ្ងៃ ឬថ្នាក់រៀនយប់ ការត្រឡប់មកដល់បន្ទប់ជួលដ៏ស្ងប់ស្ងាត់អាចធ្វើឱ្យមានអារម្មណ៍ត្រជាក់ស្រងាត់ និងនឹកផ្ទះយ៉ាងខ្លាំង។ ការបាត់បង់ស្នូរជជែកគ្នាក្រោមផ្ទះ និងម្ហូបម្តាយ បង្កើតបានជាភាពឯកោដ៏ឈឺចាប់។",
        "ភាពឯកោនេះរឹតតែកើនឡើងដោយសារឥទ្ធិពលបណ្តាញសង្គម។ ការអង្គុយម្នាក់ឯងពេលយប់អូសមើល TikTok, Facebook និង Instagram ឃើញគេដើរលេង ញ៉ាំអាហារជុំគ្នា ឬជួបជុំសប្បាយ បង្កើតបានជាការបំភាន់ថា មនុស្សគ្រប់គ្នាសុទ្ធតែមានគេស្រឡាញ់លើកលែងតែខ្លួនឯង។ អង្គការ UNICEF Cambodia បញ្ជាក់ថា ភាពឯកោនៃការផ្លាស់ទីមករស់នៅទីក្រុងនេះ គឺជាបញ្ហារួមរបស់យុវជនជាច្រើន មិនមែនមានន័យថាអ្នកជាមនុស្សដែលគ្មានគេស្រឡាញ់នោះឡើយ [5]។",
      ],
      keyPoints: [
        "Rural-to-urban migration in Cambodia places thousands in isolated rented rooms [5].",
        "Social media feeds curate highlight reels that amplify perceived abandonment.",
        "Your loneliness in the city is a common shared experience, not a personal flaw.",
      ],
      kmKeyPoints: [
        "ការផ្លាស់ទីពីស្រុកកំណើតមករាជធានី ធ្វើឱ្យយុវជនជាច្រើនត្រូវរស់នៅឯកោក្នុងបន្ទប់ជួល [5]។",
        "បណ្តាញសង្គមបង្ហាញតែទិដ្ឋភាពសប្បាយៗ ដែលធ្វើឱ្យយើងមានអារម្មណ៍ឯកោទ្វេដង។",
        "ភាពឯកោរបស់អ្នកក្នុងទីក្រុង គឺជាបទពិសោធន៍ទូទៅរបស់មនុស្សជាច្រើន មិនមែនជាកំហុសរបស់អ្នកឡើយ។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "Check Your Understanding: Myths and Facts About Loneliness",
      kmTitle: "ពិនិត្យការយល់ដឹង៖ ការពិត និងការយល់ច្រឡំអំពីភាពឯកោ (Facts vs. Myths)",
      type: "quiz",
      paragraphs: [
        "How we interpret our feelings of isolation shapes how we respond to them. Test your understanding of connection and social well-being.",
      ],
      kmParagraphs: [
        "របៀបដែលយើងយល់ដឹងអំពីភាពឯកោ កំណត់វិធីដែលយើងដោះស្រាយវា។ សូមសាកល្បងពិនិត្យការយល់ដឹងអំពីការតភ្ជាប់ទំនាក់ទំនង និងសុខុមាលភាពសង្គម។",
      ],
      quiz: {
        question: "Which of the following is clinically proven to reduce chronic loneliness most effectively?",
        kmQuestion: "តើចំណុចមួយណាខាងក្រោមដែលត្រូវបានបញ្ជាក់តាមក្បួនគ្លីនិកថា ជួយកាត់បន្ថយភាពឯកោរ៉ាំរ៉ៃបានប្រកបដោយប្រសិទ្ធភាពបំផុត?",
        options: [
          {
            id: "opt-a",
            text: "Accumulating hundreds of casual online followers and constantly posting updates",
            kmText: "ការប្រមូលអ្នកតាមដានរាប់រយនាក់លើបណ្តាញសង្គម និងការបង្ហោះរូបភាពជាប្រចាំ",
            isCorrect: false,
          },
          {
            id: "opt-b",
            text: "Cultivating one or two genuine, authentic relationships where you can share feelings honestly without pretending",
            kmText: "ការកសាងទំនាក់ទំនងពិតប្រាកដជាមួយមនុស្សម្នាក់ ឬពីរនាក់ ដែលអ្នកអាចចែករំលែកអារម្មណ៍ពិតដោយមិនបាច់ក្លែងបន្លំ",
            isCorrect: true,
          },
          {
            id: "opt-c",
            text: "Forcing yourself to attend loud parties every weekend even when you feel completely disconnected",
            kmText: "ការបង្ខំខ្លួនឯងឱ្យទៅចូលរួមពិធីជប់លៀងរៀងរាល់ចុងសប្តាហ៍ ទោះបីជាមានអារម្មណ៍មិនត្រូវគ្នាក៏ដោយ",
            isCorrect: false,
          },
          {
            id: "opt-d",
            text: "Pretending that you never need human connection and suppressing all vulnerable emotions",
            kmText: "ការធ្វើពុតជាមិនដែលត្រូវការអ្នកដទៃ ហើយសង្កត់សង្កិនអារម្មណ៍ឯកោចោលទាំងអស់",
            isCorrect: false,
          },
        ],
        explanation:
          "Research across social neuroscience and the WHO confirms that relationship quality far outweighs quantity. Having just one person with whom you can be emotionally authentic and vulnerable provides greater protection against loneliness than hundreds of shallow acquaintances [1, 2].",
        kmExplanation:
          "ការស្រាវជ្រាវប្រព័ន្ធប្រសាទ និងអង្គការសុខភាពពិភពលោក (WHO) បញ្ជាក់ថា គុណភាពនៃទំនាក់ទំនងមានតម្លៃខ្ពស់ជាងបរិមាណ។ ការមានមនុស្សតែម្នាក់ដែលអ្នកអាចបង្ហាញភាពស្មោះត្រង់ និងអារម្មណ៍ពិតបាន ជួយការពារអ្នកពីភាពឯកោបានល្អជាងការស្គាល់មនុស្សរាប់រយនាក់តែសំបកក្រៅ [1, 2]។",
      },
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "The Brain Under Loneliness: Breaking the Threat Alarm [1, 2]",
      kmTitle: "ខួរក្បាលក្នុងស្ថានភាពឯកោ៖ ការកាត់ផ្តាច់រង្វិលជុំនៃការភ័យខ្លាច (The Threat Alarm)",
      type: "reading",
      paragraphs: [
        "When loneliness becomes chronic, it changes the way your brain processes social interactions. Evolutionary psychologists explain that to ancient humans, being separated from the tribe was a death sentence. Therefore, a lonely brain enters a state of 'hypervigilance for social threat' [2].",
        "If a friend takes two hours to reply to a Telegram text, a lonely brain immediately catastrophizes: 'They do not like me anymore, I am annoying.' If someone at university does not smile back, the lonely brain assumes rejection. To protect itself from pain, the mind urges you to withdraw even further into your room.",
        "This creates a vicious loop: Loneliness leads to hypervigilance, which leads to social anxiety and withdrawal, which deepens loneliness. Recognizing this cognitive distortion is liberating: your brain is simply over-protecting you. You can gently challenge these thoughts: 'A late reply means they are busy, not that I am unloved' [1, 2].",
      ],
      kmParagraphs: [
        "នៅពេលដែលភាពឯកោក្លាយជារ៉ាំរ៉ៃ វាផ្លាស់ប្តូររបៀបដែលខួរក្បាលរបស់អ្នកបកស្រាយទំនាក់ទំនងសង្គម។ អ្នកចិត្តវិទ្យាពន្យល់ថា ចំពោះមនុស្សសម័យបុរាណ ការបែកចេញពីកុលសម្ព័ន្ធមានន័យស្មើនឹងសេចក្តីស្លាប់។ ដូច្នេះហើយ ខួរក្បាលដែលឯកោនឹងចូលទៅក្នុងស្ថានភាព «ប្រុងប្រយ័ត្នហួសហេតុចំពោះការបដិសេធ» (Hypervigilance) [2]។",
        "ប្រសិនបើមិត្តភក្តិឆ្លើយតបសារ Telegram យឺត ២ ម៉ោង ខួរក្បាលដែលឯកោនឹងគិតភ្លាមថា៖ «គេលែងចូលចិត្តខ្ញុំហើយ ខ្ញុំជាមនុស្សគួរឱ្យធុញ។» ប្រសិនបើអ្នកណាម្នាក់នៅសាលាមិនបានញញឹមតប ខួរក្បាលនឹងសន្និដ្ឋានថាគេស្អប់យើង។ ដើម្បីការពារការឈឺចាប់ ចិត្តរបស់អ្នកនឹងបង្ខំឱ្យអ្នកដកខ្លួនកាន់តែជ្រៅទៅក្នុងបន្ទប់។",
        "រឿងនេះបង្កើតជារង្វិលជុំដ៏គ្រោះថ្នាក់៖ ភាពឯកោបង្កើតការភ័យខ្លាចការបដិសេធ ការភ័យខ្លាចនាំឱ្យដកខ្លួនចេញ ហើយការដកខ្លួនចេញរឹតតែធ្វើឱ្យឯកោខ្លាំងឡើង។ ការដឹងទាន់ការយល់ច្រឡំនេះ ជួយរំដោះចិត្តរបស់អ្នកបាន៖ ខួរក្បាលរបស់អ្នកគ្រាន់តែព្យាយាមការពារអ្នកហួសហេតុប៉ុណ្ណោះ។ អ្នកអាចកែសម្រួលការគិតនេះថា៖ «គេតបសារយឺតព្រោះគេរវល់ មិនមែនមានន័យថាគេស្អប់ខ្ញុំឡើយ» [1, 2]។",
      ],
      keyPoints: [
        "Chronic loneliness makes your brain hypervigilant, misinterpreting neutral cues as rejection [2].",
        "The loneliness loop: Distress -> Over-sensitivity -> Withdrawal -> Deeper loneliness.",
        "Pause and reality-check assumptions before concluding that people are ignoring you.",
      ],
      kmKeyPoints: [
        "ភាពឯកោរ៉ាំរ៉ៃធ្វើឱ្យខួរក្បាលប្រុងប្រយ័ត្នហួសហេតុ និងបកស្រាយខុសថាគេបដិសេធ [2]។",
        "រង្វិលជុំនៃភាពឯកោ៖ ការឈឺចាប់ -> ការសង្ស័យហួសហេតុ -> ការដកខ្លួន -> កាន់តែឯកោ។",
        "សូមផ្អាកមួយភ្លែតដើម្បីពិនិត្យការពិត មុននឹងសន្និដ្ឋានថាគេមិនត្រូវការអ្នក។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "Building the Low-Stakes Connection Ladder: Small Daily Steps [2, 4]",
      kmTitle: "ជណ្តើរនៃការតភ្ជាប់ទំនាក់ទំនងតាមជំហានតូចៗ (The Low-Stakes Connection Ladder)",
      type: "reading",
      paragraphs: [
        "When you feel deeply isolated, the thought of attending large parties or making brand new lifelong friends feels terrifying and exhausting. Instead of huge leaps, psychologists recommend building a 'Low-Stakes Connection Ladder' [4].",
        "Rung 1: Micro-Connections. Start with tiny, low-pressure human acknowledgments that carry zero risk of rejection. Smile and say 'Thank you, take care' to the tuk-tuk driver or iced coffee vendor. Make brief eye contact and nod to a neighbor in your building hallway. These micro-interactions signal to your nervous system that the world is friendly [2].",
        "Rung 2: Shared-Context Interactions. Join environments where human beings gather around a common task rather than face-to-face small talk. Study in a sunlit public library, join a community clean-up, participate in a local youth workshop, or attend a group exercise session. You feel part of a collective without having to perform.",
        "Rung 3: Deepening One Existing Spark. Reach out to one person you used to know with a warm, low-pressure message: 'Hi, I was thinking about our conversation the other day and just wanted to see how you are doing. No need to reply quickly!' [4].",
      ],
      kmParagraphs: [
        "នៅពេលដែលអ្នកមានអារម្មណ៍ឯកោខ្លាំង ការគិតដល់ការទៅចូលរួមកម្មវិធីធំៗ ឬការស្វែងរកមិត្តភក្តិថ្មីភ្លាមៗ អាចជារឿងគួរឱ្យភ័យខ្លាច។ ជំនួសឱ្យការបោះជំហានធំៗ អ្នកចិត្តវិទ្យាណែនាំឱ្យអនុវត្ត «ជណ្តើរនៃការតភ្ជាប់ទំនាក់ទំនងតាមជំហានតូចៗ» [4]។",
        "កាំជណ្តើរទី ១៖ ការតភ្ជាប់កម្រិតតូច (Micro-Connections)។ ចាប់ផ្តើមពីការស្វាគមន៍តូចៗដែលគ្មានសម្ពាធ និងគ្មានហានិភ័យនៃការបដិសេធ។ ញញឹមហើយនិយាយថា «អរគុណច្រើនបង» ទៅកាន់អ្នករត់កង់បី ឬអ្នកលក់កាហ្វេ។ ងក់ក្បាលរាក់ទាក់អ្នកជិតខាងនៅមុខបន្ទប់ជួល។ ការប្រាស្រ័យទាក់ទងតូចៗទាំងនេះ ជួយផ្តល់សញ្ញាដល់ប្រព័ន្ធប្រសាទថាពិភពលោកនៅតែមានភាពកក់ក្តៅ [2]។",
        "កាំជណ្តើរទី ២៖ ការចូលរួមក្នុងបរិយាកាសរួម (Shared Context)។ ទៅកាន់កន្លែងដែលមនុស្សជួបជុំគ្នាធ្វើសកម្មភាពរួម ជាជាងការអង្គុយទល់មុខជជែកគ្នា។ អានសៀវភៅក្នុងបណ្ណាល័យសាធារណៈ ចូលរួមការងារស្ម័គ្រចិត្តសហគមន៍ រៀនវគ្គបណ្តុះបណ្តាលយុវជន ឬហាត់ប្រាណជាក្រុម។ អ្នកនឹងមានអារម្មណ៍ថាជាផ្នែកមួយនៃសង្គមដោយមិនបាច់បង្ខំនិយាយច្រើន។",
        "កាំជណ្តើរទី ៣៖ ការដាស់ទំនាក់ទំនងចាស់ឡើងវិញ។ ផ្ញើសារទន់ភ្លន់ដែលគ្មានសម្ពាធទៅកាន់មិត្តចាស់ម្នាក់៖ «សួស្តីមិត្ត ថ្ងៃមុននឹកឃើញរឿងយើងជជែកគ្នា ក៏ចង់សួរសុខទុក្ខបន្តិច។ បើមិនទាន់ទំនេរ មិនបាច់ប្រញាប់តបក៏បានណា!» [4]។",
      ],
      keyPoints: [
        "Do not leap into overwhelming social settings; use the 3-rung connection ladder [4].",
        "Micro-interactions with vendors and neighbors rebuild feelings of belonging.",
        "Shared-task spaces allow connection without social performance anxiety.",
      ],
      kmKeyPoints: [
        "កុំប្រញាប់ប្រញាល់ចូលរួមកម្មវិធីសង្គមធំៗ ចូរប្រើប្រាស់ជណ្តើរតភ្ជាប់ ៣ កម្រិត [4]។",
        "ការរាក់ទាក់តូចៗជាមួយអ្នកលក់ដូរ និងអ្នកជិតខាង ជួយស្តារអារម្មណ៍កក់ក្តៅឡើងវិញ។",
        "ការធ្វើសកម្មភាពរួមគ្នា ជួយកាត់បន្ថយការភ័យខ្លាចក្នុងការនិយាយស្តី។",
      ],
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "Nourishing Solitude: Learning to Befriend Yourself [3]",
      kmTitle: "ការបង្កើតមិត្តភាពជាមួយខ្លួនឯង៖ ការថែទាំខ្លួនឯងក្នុងភាពស្ងប់ស្ងាត់ (Befriending Yourself)",
      type: "reading",
      paragraphs: [
        "While building external connections is vital, learning to treat yourself with warmth when alone is equally transformative. Often, loneliness hurts not because we are alone, but because the person we are trapped with, our own inner critic, is harsh and cruel [3].",
        "Practice 'nourishing solitude'. Treat your solitary evenings like hosting a cherished guest. Cook or buy a nourishing warm meal instead of skipping food or eating chips in bed. Clean your room, put clean sheets on your mattress, and light a small fragrant candle or open the window for fresh air.",
        "Engage in activities that give you sensory delight without screens: sketch lines in a journal, brew fragrant ginger or green tea, read a page of an inspiring book, or stretch gently on a mat. When you discover that your own company can be safe, peaceful, and warm, the desperation fades from loneliness [2, 3].",
      ],
      kmParagraphs: [
        "ទោះបីជាការកសាងទំនាក់ទំនងខាងក្រៅជារឿងសំខាន់ក៏ដោយ ការរៀនប្រព្រឹត្តចំពោះខ្លួនឯងដោយក្តីមេត្តាក្នុងពេលនៅម្នាក់ឯង ក៏មានតម្លៃធំធេងដូចគ្នាដែរ។ ជារឿយៗ ភាពឯកោធ្វើឱ្យយើងឈឺចាប់ មិនមែនដោយសារយើងនៅម្នាក់ឯងនោះទេ ប៉ុន្តែដោយសារតែសំឡេងក្នុងចិត្តរបស់យើងតែងតែស្តីបន្ទោស និងធ្វើបាបខ្លួនឯង [3]។",
        "សូមអនុវត្ត «ភាពនៅម្នាក់ឯងដ៏មានជីវជាតិ» (Nourishing Solitude)។ សូមចាត់ទុកពេលវេលានៅម្នាក់ឯង ដូចជាការទទួលស្វាគមន៍ភ្ញៀវដ៏ពិសេសម្នាក់។ ធ្វើម្ហូបក្តៅៗ ឬទិញអាហារឆ្ងាញ់ៗញ៉ាំ ជំនួសឱ្យការបង្អត់បាយ ឬញ៉ាំនំកញ្ចប់លើគ្រែ។ រៀបចំបន្ទប់ឱ្យមានរបៀប ប្តូរកម្រាលពូក និងបើកបង្អួចឱ្យខ្យល់បរិសុទ្ធចូល។",
        "ធ្វើសកម្មភាពដែលផ្តល់សេចក្តីសុខដល់អារម្មណ៍ដោយមិនប្រើអេក្រង់ទូរស័ព្ទ៖ គូររូបក្នុងសៀវភៅ ឆុងតែខ្ញីក្តៅៗ អានសៀវភៅល្អៗ ឬហាត់យឺតសរសៃថ្នមៗ។ នៅពេលដែលអ្នកដឹងថា វត្តមានរបស់ខ្លួនឯងគឺជាកន្លែងដែលមានសុវត្ថិភាព និងភាពកក់ក្តៅ នោះការឈឺចាប់នៃភាពឯកោនឹងចាប់ផ្តើមរលាយបាត់ [2, 3]។",
      ],
      keyPoints: [
        "Loneliness is often painful because our inner dialogue is self-critical [3].",
        "Host yourself like an honored guest: warm food, a tidy space, and fresh air.",
        "Sensory, non-digital rituals transform empty isolation into restful solitude.",
      ],
      kmKeyPoints: [
        "ភាពឯកោច្រើនតែឈឺចាប់ដោយសារតែយើងមានការបន្ទោសខ្លួនឯងក្នុងចិត្ត [3]។",
        "ចាត់ទុកខ្លួនឯងដូចជាភ្ញៀវកិត្តិយស៖ អាហារក្តៅៗ បន្ទប់ស្អាត និងខ្យល់បរិសុទ្ធ។",
        "ទម្លាប់ថែទាំខ្លួនដោយមិនប្រើទូរស័ព្ទ ជួយប្តូរភាពឯកោឱ្យទៅជាសេចក្តីស្ងប់។",
      ],
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "Personal Loneliness Check-in: Understanding Your Need",
      kmTitle: "ការពិនិត្យភាពឯកោផ្ទាល់ខ្លួន៖ ស្វែងយល់ពីតម្រូវការក្នុងចិត្ត (Personal Loneliness Check-in)",
      type: "reflection",
      paragraphs: [
        "Loneliness wears different faces for each of us. Identifying the specific shape of your loneliness helps you pick the right healing remedy.",
      ],
      kmParagraphs: [
        "ភាពឯកោមានទម្រង់ខុសៗគ្នាសម្រាប់មនុស្សម្នាក់ៗ។ ការដឹងច្បាស់ពីទម្រង់នៃភាពឯកោរបស់អ្នក ជួយឱ្យអ្នកជ្រើសរើសវិធីព្យាបាលបានត្រឹមត្រូវ។",
      ],
      reflection: {
        question: "When you feel the ache of loneliness most acutely, what does your heart yearn for most?",
        kmQuestion: "នៅពេលដែលអ្នកមានអារម្មណ៍ឯកោខ្លាំង តើអ្វីជាតម្រូវការដែលចិត្តរបស់អ្នកចង់បានបំផុត?",
        options: [
          "Having one close, trusted confidant to whom I can share my deepest thoughts without fear of judgment",
          "Feeling like I belong to a wider community, group, or circle of friends who share my passions",
          "Homesickness and missing the familiar warmth of my family, hometown, and childhood memories",
          "Feeling disconnected from my own soul, numb and exhausted from constant work and digital noise",
        ],
        kmOptions: [
          "ការមានមនុស្សជិតស្និទ្ធម្នាក់ដែលទុកចិត្ត ដើម្បីចែករំលែកអារម្មណ៍ក្នុងចិត្តដោយគ្មានការវិនិច្ឆ័យ",
          "អារម្មណ៍នៃការជាផ្នែកមួយនៃសហគមន៍ ក្រុម ឬរង្វង់មិត្តភក្តិដែលមានចំណូលចិត្តដូចគ្នា",
          "ការនឹកផ្ទះ នឹកភាពកក់ក្តៅនៃគ្រួសារ ស្រុកកំណើត និងអនុស្សាវរីយ៍កាលពីកុមារភាព",
          "អារម្មណ៍នៃការដាច់ចេញពីខ្លួនឯង ស្ពឹកស្រពន់ និងអស់កម្លាំងដោយសារតែការងារ និងទូរស័ព្ទ",
        ],
        feedbackMessage:
          "Naming your loneliness with honesty takes away its power to shame you. Whether you are craving deep intimacy, a sense of community belonging, ancestral home roots, or reunion with your inner self, your longing is profoundly human and valid.",
        kmFeedbackMessage:
          "ការហ៊ានទទួលស្គាល់ភាពឯកោដោយស្មោះត្រង់ ជួយដកការខ្មាសអៀនចេញពីចិត្ត។ ទោះបីជាអ្នកកំពុងស្រេកឃ្លានទំនាក់ទំនងជិតស្និទ្ធ ការជាផ្នែកមួយនៃក្រុម ភាពកក់ក្តៅនៃស្រុកកំណើត ឬការតភ្ជាប់ជាមួយខ្លួនឯងក៏ដោយ បំណងប្រាថ្នារបស់អ្នកសុទ្ធតែជារឿងធម្មជាតិរបស់មនុស្ស។",
      },
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "The Physical Health Link and When to Seek Therapy [1, 2]",
      kmTitle: "ទំនាក់ទំនងរវាងភាពឯកោ និងសុខភាពរាងកាយ៖ ពេលណាត្រូវស្វែងរកជំនួយ? (Health Link & Clinical Support)",
      type: "reading",
      paragraphs: [
        "In 2023, the World Health Organization declared loneliness a pressing global public health threat [1]. Research demonstrates that chronic loneliness and social isolation carry health consequences equivalent to smoking up to fifteen cigarettes a day, elevating blood pressure, dampening immune function, and accelerating cardiovascular risk.",
        "Loneliness and depression frequently reinforce one another. Prolonged emotional disconnection can deepen into persistent depressive episodes, panic attacks, or profound agoraphobia (fear of leaving your room).",
        "If loneliness has caused you to withdraw completely for months, if you feel intense dread whenever someone speaks to you, or if thoughts of worthlessness consume you, seeking professional psychotherapy is a courageous choice. Cognitive Behavioral Therapy (CBT) and relational therapy provide a secure, confidential environment to unpack past social rejections and rebuild social confidence at your own pace [1, 2].",
      ],
      kmParagraphs: [
        "នៅឆ្នាំ ២០២៣ អង្គការសុខភាពពិភពលោក (WHO) បានប្រកាសថា ភាពឯកោគឺជាការគំរាមកំហែងសុខភាពសាធារណៈដ៏ធ្ងន់ធ្ងរ [1]។ ការស្រាវជ្រាវបង្ហាញថា ភាពឯកោរ៉ាំរ៉ៃមានផលប៉ះពាល់ដល់រាងកាយស្មើនឹងការជក់បារី ១៥ ដើមក្នុងមួយថ្ងៃ ដោយបង្កើនសម្ពាធឈាម បន្ថយប្រព័ន្ធការពាររាងកាយ និងប៉ះពាល់ដល់បេះដូង។",
        "ភាពឯកោ និងជំងឺបាក់ទឹកចិត្តតែងតែដើរទន្ទឹមគ្នា។ ការដាច់ទំនាក់ទំនងយូរអង្វែងអាចប្រែទៅជាជំងឺបាក់ទឹកចិត្តធ្ងន់ធ្ងរ ការភ័យស្លន់ស្លោ ឬការភ័យខ្លាចការចេញក្រៅបន្ទប់ (Agoraphobia)។",
        "ប្រសិនបើភាពឯកោបានធ្វើឱ្យអ្នកដកខ្លួនចេញពីសង្គមទាំងស្រុងអស់ជាច្រើនខែ ប្រសិនបើអ្នកមានអារម្មណ៍ភ័យខ្លាចខ្លាំងរាល់ពេលមានគេមកនិយាយរក ឬមានគំនិតបន្ទោសខ្លួនឯងមិនឈប់ ការស្វែងរកជំនួយពីអ្នកចិត្តវិទ្យាគឺជាការសម្រេចចិត្តដ៏ក្លាហាន។ ការព្យាបាលចិត្តសាស្ត្របែប CBT ផ្តល់នូវលំហសុវត្ថិភាពដើម្បីស្រាយរបួសផ្លូវចិត្តកន្លងមក និងកសាងទំនុកចិត្តក្នុងសង្គមឡើងវិញ [1, 2]។",
      ],
      keyPoints: [
        "Chronic loneliness produces physical health risks comparable to smoking [1].",
        "Prolonged isolation can evolve into clinical depression and agoraphobic fear.",
        "Psychotherapy provides a safe, structured space to rebuild relational trust.",
      ],
      kmKeyPoints: [
        "ភាពឯកោរ៉ាំរ៉ៃប៉ះពាល់ដល់សុខភាពរាងកាយស្មើនឹងការជក់បារីជាប្រចាំ [1]។",
        "ការនៅឯកោយូរពេកអាចវិវត្តទៅជាជំងឺបាក់ទឹកចិត្ត និងការភ័យខ្លាចសង្គម។",
        "ការព្យាបាលចិត្តសាស្ត្រជួយកសាងទំនុកចិត្ត និងទំនាក់ទំនងសង្គមឡើងវិញដោយសុវត្ថិភាព។",
      ],
    },
    {
      id: 10,
      sectionNumber: 10,
      title: "Grounding in Warmth: The 1-Minute Self-Compassion Breath",
      kmTitle: "ការតាំងចិត្តក្នុងភាពកក់ក្តៅ៖ លំហាត់ដកដង្ហើមមេត្តាចំពោះខ្លួនឯង ១ នាទី (Self-Compassion Breath)",
      type: "coping",
      paragraphs: [
        "When loneliness feels like a cold wave in your chest, somatic touch and intentional respiration can directly soothe your nervous system.",
        "Gently place one or both hands over your heart, or wrap your arms around your shoulders in a comforting hug. Feel the warmth of your palms transferring into your chest. Inhale slowly through your nose for 4 counts, allowing your chest and belly to expand.",
        "Hold gently for 2 counts. As you exhale slowly through your mouth for 6 counts, silently whisper to yourself: 'I am here with myself. I am worthy of love and connection. I am not alone in my human longing.' Repeat this cycle 4 times.",
      ],
      kmParagraphs: [
        "នៅពេលដែលភាពឯកោបង្កើតអារម្មណ៍ត្រជាក់ស្រងាត់ក្នុងទ្រូង ការប៉ះពាល់រាងកាយដោយក្តីមេត្តា និងការដកដង្ហើមវែងៗអាចជួយរំងាប់ប្រព័ន្ធប្រសាទបានភ្លាមៗ។",
        "ដាក់ដៃម្ខាង ឬទាំងសងខាងលើទ្រូងរបស់អ្នក ឬឱបស្មារបស់អ្នកថ្នមៗដូចជាការឱបផ្តល់កម្លាំងចិត្ត។ ទទួលដឹងពីភាពកក់ក្តៅនៃបាតដៃរបស់អ្នកដែលជ្រួតជ្រាបចូលទៅក្នុងទ្រូង។ ដកដង្ហើមចូលយឺតៗតាមច្រមុះរាប់ដល់ ៤ ដោយឱ្យទ្រូង និងពោះប៉ោងឡើង។",
        "ទប់ដង្ហើមថ្នមៗរាប់ដល់ ២។ នៅពេលដកដង្ហើមចេញយឺតៗតាមមាត់រាប់ដល់ ៦ សូមខ្សឹបប្រាប់ខ្លួនឯងថា៖ «ខ្ញុំនៅទីនេះជាមួយខ្លួនឯង។ ខ្ញុំសមនឹងទទួលបានក្តីស្រឡាញ់ និងទំនាក់ទំនងដ៏កក់ក្តៅ។ ខ្ញុំមិនឯកោលើលោកនេះឡើយ»។ អនុវត្តឡើងវិញ ៤ ដង។",
      ],
      keyPoints: [
        "Placing hands over your heart triggers the release of oxytocin, soothing feelings of abandonment.",
        "Lengthening the exhale signals physical safety to the brain's survival centers.",
        "Self-compassion embraces loneliness with patience instead of self-judgment.",
      ],
      kmKeyPoints: [
        "ការដាក់ដៃលើទ្រូងជួយបញ្ចេញអ័រម៉ូន Oxytocin បន្ថយអារម្មណ៍នៃការត្រូវគេបោះបង់ចោល។",
        "ការដកដង្ហើមចេញវែងៗជួយផ្តល់សញ្ញាសុវត្ថិភាពដល់ខួរក្បាល។",
        "ក្តីមេត្តាចំពោះខ្លួនឯងជួយទទួលយកភាពឯកោដោយការអត់ធ្មត់ ជំនួសឱ្យការបន្ទោសខ្លួនឯង។",
      ],
      actions: [
        {
          label: "Try 1-Minute Calming Breath",
          kmLabel: "អនុវត្តលំហាត់ដកដង្ហើមស្ងប់ចិត្ត ១ នាទី (1-Min Breath)",
          actionType: "exercise",
        },
      ],
    },
    {
      id: 11,
      sectionNumber: 11,
      title: "Finding Connection and Support on AROM [4, 5]",
      kmTitle: "ការស្វែងរកការតភ្ជាប់ និងការគាំទ្រនៅលើ AROM (Connecting on AROM)",
      type: "reading",
      paragraphs: [
        "Overcoming loneliness is not about becoming a charismatic extrovert. It is about gently opening small windows to let the warmth of the world back in, one micro-connection at a time.",
        "On AROM, you have a safe, confidential environment designed to support you. Open your private AROM Journal (/journal) to write about your feelings of isolation without fear of being judged. Logging what kind of connection you crave is often the first step to seeking it out in daily life.",
        "If you want personalized support to navigate life transitions, homesickness, or social anxiety, connect with verified Cambodian therapists through AROM Professional (/professional). A counselor can offer compassionate guidance tailored to local life and cultural expectations [5].",
        "If loneliness ever deepens into unbearable despair, helplessness, or thoughts of giving up on life, please know that you do not have to walk through the dark alone. Immediate free and confidential support is waiting. Contact the National Child and Youth Helpline at 1280, the National Health Hotline at 119, or TPO Cambodia at 017 222 372. Your voice matters, and your presence is deeply needed in this world.",
      ],
      kmParagraphs: [
        "ការយកឈ្នះលើភាពឯកោ មិនមែនជាការបង្ខំខ្លួនឯងឱ្យក្លាយជាមនុស្សពូកែនិយាយ ឬចូលចិត្តជប់លៀងនោះទេ។ វាគឺជាការបើកបង្អួចបេះដូងបន្តិចម្តងៗ ដើម្បីទទួលយកភាពកក់ក្តៅពីពិភពលោក តាមរយៈការតភ្ជាប់តូចៗប្រចាំថ្ងៃ។",
        "នៅលើ AROM អ្នកមានលំហសុវត្ថិភាព និងសម្ងាត់ដែលត្រៀមជួយអ្នកជានិច្ច។ សូមបើកកំណត់ហេតុផ្ទាល់ខ្លួន AROM Journal (/journal) ដើម្បីសរសេររៀបរាប់ពីអារម្មណ៍ឯកោរបស់អ្នកដោយគ្មានការវិនិច្ឆ័យ។ ការកត់ត្រាពីតម្រូវការផ្លូវចិត្ត គឺជាជំហានដំបូងក្នុងការស្វែងរកទំនាក់ទំនងពិតប្រាកដក្នុងជីវិតរស់នៅ។",
        "ប្រសិនបើអ្នកចង់បានការណែនាំផ្ទាល់ខ្លួនដើម្បីដោះស្រាយការនឹកផ្ទះ ភាពឯកោក្នុងទីក្រុង ឬការថប់បារម្ភក្នុងសង្គម សូមភ្ជាប់ទំនាក់ទំនងជាមួយអ្នកចិត្តវិទ្យាកម្ពុជាតាមរយៈ AROM Professional (/professional)។ អ្នកប្រឹក្សាអាចជួយអ្នកស្វែងរកផ្លូវដើរដ៏កក់ក្តៅ និងសមស្របតាមវប្បធម៌រស់នៅ [5]។",
        "ប្រសិនបើភាពឯកោវិវត្តទៅជាភាពអស់សង្ឃឹមខ្លាំង ឬមានគំនិតមិនចង់រស់នៅ សូមចងចាំថាអ្នកមិនចាំបាច់ដើរកាត់ផ្លូវងងឹតនេះតែម្នាក់ឯងឡើយ។ ជំនួយបន្ទាន់ឥតគិតថ្លៃ និងសម្ងាត់ត្រៀមជួយអ្នកជានិច្ច។ សូមទាក់ទងខ្សែទូរស័ព្ទជំនួយកុមារ និងយុវជនលេខ 1280 ខ្សែទូរស័ព្ទសុខភាពជាតិលេខ 119 ឬអង្គការចិត្តសង្គមកម្ពុជា (TPO Cambodia) តាមលេខ 017 222 372។ សំឡេងរបស់អ្នកមានតម្លៃ ហើយវត្តមានរបស់អ្នកពិតជាមានសារៈសំខាន់សម្រាប់ពិភពលោកនេះ។",
      ],
      keyPoints: [
        "Use AROM Journal (/journal) to express vulnerable feelings and clarify your social needs.",
        "Connect with licensed counselors on AROM Professional (/professional) for caring guidance [5].",
        "Crisis support is always free, confidential, and available: 1280, 119, or TPO Cambodia 017 222 372.",
      ],
      kmKeyPoints: [
        "ប្រើប្រាស់កំណត់ហេតុ AROM Journal (/journal) ដើម្បីកត់ត្រាអារម្មណ៍ និងស្វែងយល់ពីតម្រូវការសង្គម។",
        "ភ្ជាប់ទំនាក់ទំនងជាមួយអ្នកជំនាញលើ AROM Professional (/professional) ដើម្បីទទួលបានការណែនាំ [5]។",
        "ខ្សែទូរស័ព្ទជំនួយបន្ទាន់ត្រៀមជួយជានិច្ចដោយសម្ងាត់៖ 1280, 119 ឬ TPO Cambodia 017 222 372។",
      ],
      alertBox: {
        type: "tip",
        text: "Comforting Truth: Needing human connection is not a weakness; it is the most fundamental sign that you are human. Be patient with your journey toward belonging.",
        kmText: "ការពិតដ៏កក់ក្តៅ៖ ការត្រូវការទំនាក់ទំនងជាមួយមនុស្សដទៃ មិនមែនជាភាពទន់ខ្សោយឡើយ ប៉ុន្តែវាជាសញ្ញាបញ្ជាក់យ៉ាងច្បាស់ថាអ្នកជាមនុស្ស។ សូមផ្តល់ការអត់ធ្មត់ដល់ខ្លួនឯងក្នុងដំណើរឆ្ពោះទៅរកភាពកក់ក្តៅ។",
      },
      actions: [
        {
          label: "Open AROM Journal",
          kmLabel: "បើកកំណត់ហេតុ AROM Journal",
          actionType: "tips",
        },
        {
          label: "Talk to a Professional",
          kmLabel: "ពិគ្រោះជាមួយអ្នកជំនាញ AROM",
          actionType: "professional",
        },
      ],
    },
  ],
};


export const REFERENCES_ACADEMIC_PRESSURE: ReferenceItem[] = [
  {
    id: 1,
    citation: "[1]",
    source: "APA",
    title: "American Psychological Association: Stress in America and High-Stakes Academic Expectations",
    url: "https://www.apa.org/topics/stress",
  },
  {
    id: 2,
    citation: "[2]",
    source: "Harvard GSE",
    title: "Harvard Graduate School of Education: The Mental Health Toll of Academic Pressure and Shifting Toward Meaningful Learning",
    url: "https://mcc.gse.harvard.edu/",
  },
  {
    id: 3,
    citation: "[3]",
    source: "WHO",
    title: "World Health Organization: Adolescent Mental Health, School Stress, and Emotional Resilience",
    url: "https://www.who.int/news-room/fact-sheets/detail/adolescent-mental-health",
  },
  {
    id: 4,
    citation: "[4]",
    source: "UNICEF Cambodia",
    title: "UNICEF Cambodia: Student Well-Being, Exam Anxiety, and Navigating Parental Expectations",
    url: "https://www.unicef.org/cambodia/mental-health",
  },
  {
    id: 5,
    citation: "[5]",
    source: "NHS inform",
    title: "NHS inform: Coping with Study and Exam Stress Through Brain-Friendly Habits",
    url: "https://www.nhsinform.scot/healthy-living/mental-wellbeing/stress/coping-with-exam-stress/",
  },
];

export const LESSON_ACADEMIC_PRESSURE: Lesson = {
  id: "how-to-deal-with-academic-pressure",
  title: "How to Deal With Academic Pressure",
  kmTitle: "របៀបដោះស្រាយសម្ពាធការសិក្សា (How to Deal With Academic Pressure)",
  subtitle: "Explore healthier ways to handle expectations and protect your well-being",
  kmSubtitle: "ស្វែងយល់ពីវិធីសាស្ត្រដែលមានសុខភាពល្អក្នុងការគ្រប់គ្រងការរំពឹងទុក និងការពារសុខុមាលភាពផ្លូវចិត្ត",
  category: "Stress",
  duration: "8 min",
  kmDuration: "៨ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Reading + Practice",
  kmFormat: "ការអាន និងការអនុវត្ត (Reading & Practice)",
  isAvailable: true,
  image: "/mindguide/strategies.png",
  heroImage: "/mindguide/academic-pressure-hero.jpg",
  badge: "Essential",
  description:
    "Unpack the psychological and physiological weight of academic expectations. Learn to separate human self-worth from grades, navigate Cambodian family honor and Bac II pressure, study sustainably, and ground your nervous system on AROM.",
  kmDescription:
    "ស្វែងយល់ពីទម្ងន់ផ្លូវចិត្ត និងរាងកាយនៃសម្ពាធការសិក្សា។ រៀនបែងចែកតម្លៃខ្លួនឯងចេញពីពិន្ទុប្រឡង គ្រប់គ្រងការរំពឹងទុករបស់គ្រួសារ និងការប្រឡងបាក់ឌុប រៀនសូត្រប្រកបដោយនិរន្តរភាព និងរំងាប់ចិត្តនៅលើ AROM។",
  totalSections: 11,
  outcomes: [
    {
      en: "Differentiate healthy academic motivation from toxic chronic performance pressure [1, 2]",
      km: "បែងចែកឱ្យច្បាស់រវាងកម្លាំងចិត្តរៀនសូត្រដែលមានសុខភាពល្អ និងសម្ពាធលទ្ធផលដែលបំផ្លាញផ្លូវចិត្ត [1, 2]",
    },
    {
      en: "Understand how acute academic dread shuts down the prefrontal cortex and memory recall [1, 3]",
      km: "យល់ដឹងពីរបៀបដែលការភ័យខ្លាចខ្លាំងកាត់បន្ថយសមត្ថភាពខួរក្បាលផ្នែកចងចាំ និងការគិតពិចារណា [1, 3]",
    },
    {
      en: "Navigate Cambodian family sacrifices, Bac II national exam stress, and harmful peer comparisons [4]",
      km: "គ្រប់គ្រងអារម្មណ៍ជុំវិញការលះបង់របស់ឪពុកម្តាយ សម្ពាធប្រឡងបាក់ឌុប និងការប្រៀបធៀបក្នុងគ្រួសារ [4]",
    },
    {
      en: "Uncouple personal self-worth from GPA and exam scores using cognitive restructuring [2, 5]",
      km: "បំបែកតម្លៃផ្ទាល់ខ្លួនចេញពីចំណាត់ថ្នាក់ និងពិន្ទុប្រឡង ដោយប្រើការកែសម្រួលផ្នត់គំនិតត្រឹមត្រូវ [2, 5]",
    },
    {
      en: "Adopt brain-friendly study methods: Pomodoro sprints, active recall, and non-negotiable sleep [1, 5]",
      km: "អនុវត្តវិធីសាស្ត្ររៀនសូត្របែបវិទ្យាសាស្ត្រ៖ បច្ចេកទេស Pomodoro ការរំលឹកមេរៀនសកម្ម និងការគេងគ្រប់គ្រាន់ [1, 5]",
    },
    {
      en: "Communicate respectfully with parents using boundary scripts and access professional therapy on AROM [4, 5]",
      km: "ប្រាស្រ័យទាក់ទងជាមួយឪពុកម្តាយដោយការគោរព និងភ្ជាប់ទំនាក់ទំនងប្រឹក្សាជាមួយអ្នកជំនាញ AROM [4, 5]",
    },
  ],
  references: REFERENCES_ACADEMIC_PRESSURE,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: "The Weight of Expectations: When Studying Becomes Suffocating",
      kmTitle: "ទម្ងន់នៃការរំពឹងទុក៖ នៅពេលដែលការរៀនសូត្រក្លាយជាសម្ពាធដ៏ធ្ងន់ (The Weight of Expectations)",
      type: "reading",
      paragraphs: [
        "Do you ever sit down with your textbooks feeling a tight knot in your stomach, your heart racing before you have even opened the first chapter? You might think: 'If I do not get top marks, my entire future is ruined, and everyone will look down on me.'",
        "There is a crucial clinical distinction between healthy academic ambition and toxic academic pressure. Healthy ambition comes from curiosity and personal growth. It energizes you to learn, while accepting that mistakes are part of the journey [2].",
        "Toxic academic pressure, on the other hand, comes from chronic fear: fear of disappointing family, fear of being rejected, and the belief that your worth as a human being depends entirely on your report card. When learning is powered by terror, curiosity vanishes, replaced by constant dread [1, 2].",
      ],
      kmParagraphs: [
        "តើអ្នកធ្លាប់អង្គុយចុះមុខសៀវភៅពុម្ពដោយមានអារម្មណ៍ណែនក្នុងពោះ និងបេះដូងលោតញាប់ ទាំងដែលមិនទាន់បានបើកមើលមេរៀនទំព័រដំបូងផងដែរឬទេ? អ្នកប្រហែលជាធ្លាប់គិតថា៖ «បើខ្ញុំមិនបានពិន្ទុខ្ពស់ទេ អនាគតរបស់ខ្ញុំនឹងត្រូវរលាយ ហើយមនុស្សគ្រប់គ្នានឹងមើលងាយខ្ញុំ។»",
        "មានភាពខុសគ្នាដាច់ស្រឡះរវាងកម្លាំងចិត្តរៀនសូត្រដែលមានសុខភាពល្អ និងសម្ពាធការសិក្សាដែលបំផ្លាញផ្លូវចិត្ត។ កម្លាំងចិត្តដែលមានសុខភាពល្អកើតចេញពីការចង់ចេះចង់ដឹង និងការអភិវឌ្ឍខ្លួន។ វាជួយជំរុញឱ្យអ្នកខិតខំ ដោយទទួលស្គាល់ថាកំហុសឆ្គងគឺជាផ្នែកមួយនៃការរៀនសូត្រ [2]។",
        "ផ្ទុយទៅវិញ សម្ពាធការសិក្សាដែលបំផ្លាញផ្លូវចិត្ត កើតចេញពីការភ័យខ្លាចរ៉ាំរ៉ៃ៖ ខ្លាចធ្វើឱ្យឪពុកម្តាយខកចិត្ត ខ្លាចគេរើសអើង និងការយល់ច្រឡំថាតម្លៃរបស់អ្នកជាមនុស្សពឹងផ្អែកលើតែពិន្ទុលើក្រដាស។ នៅពេលដែលការរៀនសូត្រដំណើរការដោយការភ័យខ្លាច ភាពរីករាយក្នុងការស្រាវជ្រាវនឹងរលាយបាត់ ដោយជំនួសមកវិញនូវអារម្មណ៍តានតឹងគ្រប់វិនាទី [1, 2]។",
      ],
      keyPoints: [
        "Healthy motivation builds skills; toxic pressure is driven by fear of shame and rejection [2].",
        "Believing your entire future hinges on a single test score creates chronic anxiety.",
        "Recognizing this pressure is the first step toward reclaiming your love of learning.",
      ],
      kmKeyPoints: [
        "កម្លាំងចិត្តល្អជួយបង្កើនជំនាញ រីឯសម្ពាធអវិជ្ជមានកើតចេញពីការភ័យខ្លាចការអាម៉ាស់ [2]។",
        "ការជឿថាតម្លៃនៃអនាគតទាំងមូលពឹងផ្អែកលើពិន្ទុតែមួយមុខ បង្កើតបានជាការថប់បារម្ភរ៉ាំរ៉ៃ។",
        "ការដឹងទាន់សម្ពាធនេះ គឺជាជំហានដំបូងក្នុងការស្តារក្តីស្រឡាញ់ចំពោះការរៀនសូត្រឡើងវិញ។",
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: "The Mind and Body Toll: How Chronic Pressure Backfires [1, 3]",
      kmTitle: "ផលប៉ះពាល់លើរាងកាយ និងចិត្ត៖ ហេតុអ្វីសម្ពាធរ៉ាំរ៉ៃកាត់បន្ថយសមត្ថភាពខួរក្បាល? (Mind and Body Toll)",
      type: "reading",
      paragraphs: [
        "When you push your mind and body beyond healthy limits for months, academic stress leaves measurable physical footprints. You experience persistent morning headaches, stomach aches, chronic muscle tightness in your neck and shoulders, and disrupted sleep patterns [1].",
        "Cognitively, extreme pressure produces a cruel biological paradox. Neuroscientists show that when fear spikes, the amygdala floods your system with cortisol and adrenaline, effectively dialing down the prefrontal cortex. The prefrontal cortex is the brain region responsible for working memory, logic, and creative problem solving [1, 3].",
        "In short, the more panicked you are about failing, the harder it becomes for your brain to remember formulas or write clear essays. Protecting your calm is not a waste of time; it is a neurological necessity for peak academic performance.",
      ],
      kmParagraphs: [
        "នៅពេលដែលអ្នកបង្ខំចិត្ត និងរាងកាយឱ្យហួសកម្រិតទ្រាំទ្រអស់ជាច្រើនខែ សម្ពាធការសិក្សានឹងបន្សល់ទុកនូវផលប៉ះពាល់រាងកាយយ៉ាងច្បាស់ក្រឡែត។ អ្នកនឹងចាប់ផ្តើមឈឺក្បាលពេលព្រឹក មិនស្រួលក្នុងក្រពះ រឹងសាច់ដុំកញ្ចឹងក និងស្មា ហើយគេងមិនដែលស្កប់ស្កល់ [1]។",
        "ចំពោះខួរក្បាលវិញ សម្ពាធខ្លាំងពេកបង្កើតនូវភាពផ្ទុយគ្នាខាងជីវសាស្ត្រ។ អ្នកវិទ្យាសាស្ត្រប្រព័ន្ធប្រសាទបង្ហាញថា នៅពេលដែលការភ័យខ្លាចកើនឡើងខ្ពស់ ខួរក្បាលនឹងបញ្ចេញអ័រម៉ូនស្ត្រេស Cortisol ដែលកាត់បន្ថយដំណើរការនៃខួរក្បាលផ្នែកខាងមុខ (Prefrontal Cortex)។ ខួរក្បាលផ្នែកនេះ គឺជាអ្នកទទួលខុសត្រូវលើការចងចាំ ការគិតបែបឡូជីខល និងការដោះស្រាយបញ្ហា [1, 3]។",
        "និយាយឱ្យខ្លី អ្នកកាន់តែភ័យស្លន់ស្លោខ្លាចធ្លាក់ ខួរក្បាលរបស់អ្នករឹតតែពិបាកទាញយកមេរៀន ឬសរសេរសំណេរឱ្យបានល្អ។ ដូច្នេះ ការរក្សាសេចក្តីស្ងប់ក្នុងចិត្តមិនមែនជាការខាតពេលនោះទេ ប៉ុន្តែវាជាលក្ខខណ្ឌជីវសាស្ត្រចាំបាច់បំផុត ដើម្បីឱ្យខួរក្បាលដំណើរការបានល្អបំផុត។",
      ],
      keyPoints: [
        "Physical symptoms (headaches, nausea, insomnia) are biological distress alarms [1].",
        "Panic floods the brain with cortisol, paralyzing working memory and logical reasoning [3].",
        "Emotional calm protects and unlocks your brain's highest cognitive capacity.",
      ],
      kmKeyPoints: [
        "អាការរាងកាយ (ឈឺក្បាល ចង្អោរ គេងមិនលក់) គឺជាសំឡេងរោទ៍ប្រាប់ថាអ្នកលើសចំណុះ [1]។",
        "ការភ័យស្លន់ស្លោបង្កើនអ័រម៉ូនស្ត្រេស និងធ្វើឱ្យស្ពឹកស្មារតីក្នុងការចងចាំមេរៀន [3]។",
        "សេចក្តីស្ងប់ក្នុងចិត្តជួយការពារ និងបើកសមត្ថភាពខួរក្បាលឱ្យគិតបានច្បាស់លាស់។",
      ],
    },
    {
      id: 3,
      sectionNumber: 3,
      title: "Cambodian Context: Parental Sacrifices, Bac II, and Comparison [4]",
      kmTitle: "បរិបទសង្គមកម្ពុជា៖ ការលះបង់របស់ឪពុកម្តាយ ការប្រឡងបាក់ឌុប និងការប្រៀបធៀប (Cambodian Context)",
      type: "reading",
      paragraphs: [
        "In Cambodian culture, academic achievement carries profound emotional and economic meaning. Many parents have endured unimaginable hardships, poverty, or missed educational opportunities. To ensure a brighter future for their children, they sacrifice daily savings to pay for tuition, uniforms, and extra tutoring classes (រៀនគួរ) [4].",
        "Because of these sacrifices, Cambodian youth often carry an overwhelming sense of filial debt: 'My parents worked under the scorching sun for me; if I fail Grade 12 Bac II (បាក់ឌុប) or do not graduate with honors, I will bring deep shame to my entire family.'",
        "This filial weight is frequently intensified by toxic family comparisons at gatherings: hearing relatives compare grades, university scholarships, or civil service placements. UNICEF Cambodia highlights that while honoring parents is a noble value, living in perpetual terror of family disappointment damages student mental health. Your parents love you as their child, not merely as a trophy of academic grades [4].",
      ],
      kmParagraphs: [
        "នៅក្នុងវប្បធម៌ខ្មែរ ភាពជោគជ័យក្នុងការសិក្សាបង្កប់នូវអត្ថន័យផ្លូវចិត្ត និងសេដ្ឋកិច្ចយ៉ាងជ្រាលជ្រៅ។ ឪពុកម្តាយជាច្រើនបានឆ្លងកាត់ការលំបាក ភាពក្រីក្រ ឬខកខានមិនបានរៀនសូត្រជ្រៅជ្រះក្នុងអតីតកាល។ ដើម្បីធានាអនាគតភ្លឺស្វាងសម្រាប់កូនៗ ពួកគាត់បានលះបង់កម្លាំងកាយចិត្ត សន្សំប្រាក់បង់ថ្លៃសាលា សម្លៀកបំពាក់ និងប្រាក់រៀនគួរ [4]។",
        "ដោយសារតែការលះបង់ដ៏ធំធេងនេះ យុវជនកម្ពុជាច្រើនតែមានអារម្មណ៍ថាខ្លួនមានបំណុលគុណធម៌ដ៏ធ្ងន់៖ «ឪពុកម្តាយខ្ញុំលំបាកហាលថ្ងៃហាលភ្លៀងដើម្បីខ្ញុំ ប្រសិនបើខ្ញុំប្រឡងបាក់ឌុបធ្លាក់ ឬមិនបាននិទ្ទេសល្អ ខ្ញុំនឹងធ្វើឱ្យគ្រួសារបាក់មុខខ្លាំងណាស់។»",
        "សម្ពាធនេះរឹតតែកើនឡើងដោយសារការប្រៀបធៀបក្នុងរង្វង់សាច់ញាតិ៖ ការឮគេនិយាយប្រៀបធៀបពិន្ទុ អាហារូបករណ៍ ឬមុខងារការងារ។ អង្គការ UNICEF Cambodia បង្ហាញថា ទោះបីជាការដឹងគុណឪពុកម្តាយជាគុណធម៌ដ៏ប្រពៃក៏ដោយ ប៉ុន្តែការរស់នៅក្នុងការភ័យខ្លាចការខកចិត្តរបស់គ្រួសាររហូត នឹងបំផ្លាញសុខភាពផ្លូវចិត្តរបស់សិស្ស។ ឪពុកម្តាយស្រឡាញ់អ្នកក្នុងនាមជាកូនបង្កើត មិនមែនស្រឡាញ់តែលើពានរង្វាន់នៃពិន្ទុប្រឡងនោះឡើយ [4]។",
      ],
      keyPoints: [
        "Filial gratitude in Cambodia can unintentionally transform into paralyzing guilt [4].",
        "Grade 12 Bac II national exams and family comparisons amplify perceived stakes.",
        "Your family's love for you is fundamentally deeper than any academic report card.",
      ],
      kmKeyPoints: [
        "ការដឹងគុណឪពុកម្តាយក្នុងសង្គមខ្មែរ អាចប្រែទៅជាអារម្មណ៍បន្ទោសខ្លួនឯងដោយមិនដឹងខ្លួន [4]។",
        "ការប្រឡងបាក់ឌុប និងការប្រៀបធៀបរវាងសាច់ញាតិ បង្កើនសម្ពាធផ្លូវចិត្តយ៉ាងខ្លាំង។",
        "សេចក្តីស្រឡាញ់របស់គ្រួសារចំពោះអ្នក មានទំហំធំធេងជាងពិន្ទុនៅលើក្រដាសប្រឡង [4]។",
      ],
    },
    {
      id: 4,
      sectionNumber: 4,
      title: "Check Your Understanding: Brain-Friendly Studying vs. Exhaustion Habits",
      kmTitle: "ពិនិត្យការយល់ដឹង៖ ការរៀនសូត្រប្រកបដោយប្រសិទ្ធភាព និងទម្លាប់បំផ្លាញថាមពល (Effective Learning vs Exhaustion)",
      type: "quiz",
      paragraphs: [
        "Many students fall into study habits that feel productive because they cause exhaustion, yet actually impair memory. Test your knowledge of cognitive science.",
      ],
      kmParagraphs: [
        "សិស្សជាច្រើនធ្លាក់ចូលទៅក្នុងទម្លាប់រៀនសូត្រដែលមើលទៅហាក់ដូចជាខិតខំខ្លាំងព្រោះតែអស់កម្លាំង ប៉ុន្តែតាមពិតវាបែរជាបំផ្លាញការចងចាំទៅវិញ។ សូមសាកល្បងពិនិត្យការយល់ដឹងអំពីវិទ្យាសាស្ត្រខួរក្បាល។",
      ],
      quiz: {
        question: "Which approach is proven by educational psychology to maximize long-term exam retention while protecting mental health?",
        kmQuestion: "តើវិធីសាស្ត្រមួយណាដែលត្រូវបានបញ្ជាក់តាមចិត្តវិទ្យាអប់រំថា ជួយបង្កើនការចងចាំមេរៀនបានយូរអង្វែង និងការពារសុខភាពផ្លូវចិត្តបានល្អបំផុត?",
        options: [
          {
            id: "opt-a",
            text: "Staying awake all night before the exam, highlighting every textbook page with energy drinks",
            kmText: "ការទប់ភ្នែកមិនគេងពេញមួយយប់មុនពេលប្រឡង គូសពណ៌លើគ្រប់ទំព័រសៀវភៅ និងផឹកភេសជ្ជៈប៉ូវកម្លាំង",
            isCorrect: false,
          },
          {
            id: "opt-b",
            text: "Studying in focused 25-minute sprints using active recall, accompanied by 7 to 8 hours of restorative sleep",
            kmText: "ការរៀនដោយផ្ដោតអារម្មណ៍ជាវគ្គខ្លីៗ ២៥ នាទីដោយប្រើការរំលឹកមេរៀនសកម្ម អមដោយការគេងលក់ស្កប់ស្កល់ ៧ ទៅ ៨ ម៉ោង",
            isCorrect: true,
          },
          {
            id: "opt-c",
            text: "Studying 14 hours straight without meals or bathroom breaks to prove your commitment to family",
            kmText: "ការអង្គុយរៀន ១៤ ម៉ោងជាប់គ្នាដោយមិនញ៉ាំបាយ ឬសម្រាក ដើម្បីបង្ហាញការប្តេជ្ញាចិត្តចំពោះគ្រួសារ",
            isCorrect: false,
          },
          {
            id: "opt-d",
            text: "Constantly checking social media while keeping your notebook open beside you for 8 hours",
            kmText: "ការបើកសៀវភៅចោលបណ្តើរ និងអូសមើលបណ្តាញសង្គមបណ្តើរអស់រយៈពេល ៨ ម៉ោង",
            isCorrect: false,
          },
        ],
        explanation:
          "Cognitive science shows that memory consolidation occurs primarily during slow-wave and REM sleep in the hippocampus. Studying in manageable intervals with active retrieval and protecting 7 to 8 hours of sleep yields vastly higher exam performance than sleep-deprived cramming [1, 5].",
        kmExplanation:
          "វិទ្យាសាស្ត្រខួរក្បាលបង្ហាញថា ការផ្ទេរការចងចាំទៅរក្សាទុកបានយូរ កើតឡើងជាចម្បងក្នុងកំឡុងពេលគេងលក់ស្កប់ស្កល់។ ការរៀនជាវគ្គខ្លីៗដោយការរំលឹកមេរៀនដោយខ្លួនឯង និងការគេង ៧ ទៅ ៨ ម៉ោង ផ្តល់លទ្ធផលប្រឡងខ្ពស់ជាងការមិនព្រមគេងរៀនទល់ភ្លឺឆ្ងាយណាស់ [1, 5]។",
      },
    },
    {
      id: 5,
      sectionNumber: 5,
      title: "Uncoupling Your Self-Worth from Your Grades: You Are More Than an Exam Score",
      kmTitle: "ការបំបែកតម្លៃផ្ទាល់ខ្លួនចេញពីពិន្ទុ៖ អ្នកមានតម្លៃលើសពីលទ្ធផលប្រឡង (Self-Worth vs Grades)",
      type: "reading",
      paragraphs: [
        "One of the most liberating mental shifts you can ever make is uncoupling your human dignity from your academic GPA [2].",
        "What does an exam grade actually measure? It measures how well you memorized and reproduced a specific set of prompts, on a specific morning, under specific time constraints, while managing your nervous system. That is all.",
        "An exam does not measure your emotional kindness. It does not measure your resilience, your creative imagination, your loyalty to friends, your capacity to love, or your future potential. When you remind yourself that your worth as a human being is absolute and unconditional, a low grade stops being a personal catastrophe and becomes simply a data point showing what to revise next [2, 5].",
      ],
      kmParagraphs: [
        "ការផ្លាស់ប្តូរផ្នត់គំនិតដ៏មានតម្លៃបំផុតមួយដែលអ្នកអាចធ្វើបាន គឺការបំបែកតម្លៃនៃជីវិតរបស់អ្នកចេញពីចំណាត់ថ្នាក់ ឬពិន្ទុប្រឡង [2]។",
        "តើពិន្ទុប្រឡងពិតជាវាស់វែងអ្វីខ្លះ? វាគ្រាន់តែវាស់វែងថាតើអ្នកអាចចងចាំ និងសរសេរឡើងវិញនូវមេរៀនជាក់លាក់ណាមួយ នៅព្រឹកជាក់លាក់ណាមួយ ក្រោមសម្ពាធពេលវេលាកំណត់ បានកម្រិតណា។ វាមានត្រឹមតែប៉ុណ្ណឹង។",
        "ការប្រឡងមិនអាចវាស់វែងសេចក្តីមេត្តាក្នុងបេះដូងរបស់អ្នកឡើយ។ វាមិនអាចវាស់វែងភាពអត់ធន់ ការស្រមើលស្រមៃ ភាពស្មោះត្រង់ចំពោះមិត្តភក្តិ ឬសក្តានុពលពេញមួយជីវិតរបស់អ្នកនោះទេ។ នៅពេលដែលអ្នកដឹងច្បាស់ថាតម្លៃរបស់អ្នកជាមនុស្សមានភាពពេញលេញដោយមិនបាច់មានលក្ខខណ្ឌ នោះការទទួលបានពិន្ទុមិនសមបំណងនឹងលែងជាមហន្តរាយជីវិតទៀតហើយ ប៉ុន្តែគ្រាន់តែជាទិន្នន័យប្រាប់ថាត្រូវកែលម្អត្រង់ណាទៀតប៉ុណ្ណោះ [2, 5]។",
      ],
      keyPoints: [
        "An exam score reflects temporary performance on a specific test, not your lifelong potential [2].",
        "Grades cannot measure moral character, creativity, empathy, or resilience.",
        "Unconditional self-worth frees you to study with clarity rather than panic.",
      ],
      kmKeyPoints: [
        "ពិន្ទុប្រឡងឆ្លុះបញ្ចាំងតែសមត្ថភាពលើវិញ្ញាសានៅពេលនោះ មិនមែនជាវាសនាពេញមួយជីវិតឡើយ [2]។",
        "ពិន្ទុមិនអាចវាស់វែងគុណធម៌ ភាពច្នៃប្រឌិត ឬភាពរឹងមាំនៃចិត្តរបស់អ្នកបានទេ។",
        "ការផ្តល់តម្លៃលើខ្លួនឯងដោយគ្មានលក្ខខណ្ឌ ជួយឱ្យអ្នករៀនដោយស្មារតីភ្លឺស្វាង មិនមែនដោយការភ័យខ្លាច។",
      ],
    },
    {
      id: 6,
      sectionNumber: 6,
      title: "Sustainable Study Strategies: Protecting Your Prefrontal Cortex [1, 5]",
      kmTitle: "យុទ្ធសាស្ត្ររៀនសូត្រប្រកបដោយចីរភាព៖ ការការពារថាមពលខួរក្បាល (Sustainable Study Strategies)",
      type: "reading",
      paragraphs: [
        "Studying longer hours does not equal studying better. To maximize retention while protecting your mental health, adopt science-backed learning habits [5].",
        "First, implement the Pomodoro Technique: study with total, single-minded focus for 25 minutes, then stand up and take a complete 5-minute break. Walk away from your desk, stretch, drink a glass of water, and look outside the window. Do not check social media during breaks, as rapid digital scrolling exhausts mental energy rather than restoring it.",
        "Second, practice Active Retrieval instead of passive rereading. Close your textbook and write down the three core ideas from memory, or explain the concept out loud in Khmer as if teaching a younger sibling. This builds robust neural connections in fraction of the time [1, 5].",
      ],
      kmParagraphs: [
        "ការអង្គុយរៀនច្រើនម៉ោងមិនមែនមានន័យថារៀនបានល្អនោះទេ។ ដើម្បីចងចាំបានល្អ និងការពារសុខភាពផ្លូវចិត្ត សូមអនុវត្តទម្លាប់រៀនសូត្រតាមក្បួនវិទ្យាសាស្ត្រ [5]។",
        "ទីមួយ សូមអនុវត្តបច្ចេកទេស Pomodoro៖ រៀនដោយផ្ដោតអារម្មណ៍ពេញលេញលើកិច្ចការតែមួយមុខរយៈពេល ២៥ នាទី រួចក្រោកឈរសម្រាក ៥ នាទីពេញ។ ដើរចេញពីតុ រលាស់ដៃជើង ញ៉ាំទឹកមួយកែវ និងសម្លឹងមើលទៅខាងក្រៅបង្អួច។ កុំលួចអូសទូរស័ព្ទក្នុងពេលសម្រាក ពីព្រោះការមើលវីដេអូលឿនៗធ្វើឱ្យខួរក្បាលកាន់តែហត់នឿយ។",
        "ទីពីរ សូមអនុវត្តការរំលឹកមេរៀនសកម្ម (Active Retrieval) ជំនួសឱ្យការគ្រាន់តែអានឡើងវិញ។ បិទសៀវភៅ រួចសរសេរគំនិតសំខាន់ៗ ៣ ចេញពីការចងចាំ ឬសាកល្បងនិយាយពន្យល់មេរៀននោះជាភាសាខ្មែរដូចជាកំពុងបង្រៀនប្អូនតូច។ វិធីសាស្ត្រនេះជួយកសាងការចងចាំរឹងមាំក្នុងខួរក្បាលដោយចំណាយពេលតិចជាងមុន [1, 5]។",
      ],
      keyPoints: [
        "Use 25-minute focused sprints with 5-minute screen-free breaks (Pomodoro) [5].",
        "Active retrieval (teaching out loud, testing recall) outperforms passive rereading.",
        "Taking mindful breaks actually speeds up understanding and prevents cognitive fatigue.",
      ],
      kmKeyPoints: [
        "រៀន ២៥ នាទី និងសម្រាក ៥ នាទីដោយមិនមើលអេក្រង់ទូរស័ព្ទ (Pomodoro) [5]។",
        "ការរំលឹកមេរៀនចេញពីការចងចាំ និងការពន្យល់ មានប្រសិទ្ធភាពជាងការគ្រាន់តែអានសៀវភៅឡើងវិញ។",
        "ការសម្រាកឱ្យបានត្រឹមត្រូវ ជួយឱ្យខួរក្បាលយល់មេរៀនបានលឿន និងមិនឆាប់អស់កម្លាំង។",
      ],
    },
    {
      id: 7,
      sectionNumber: 7,
      title: "Navigating Family Expectations: Respectful Boundary Scripts [4, 5]",
      kmTitle: "ការដោះស្រាយការរំពឹងទុករបស់គ្រួសារ៖ ពាក្យសម្តីប្រកបដោយការគោរព និងព្រំដែន (Respectful Family Scripts)",
      type: "reading",
      paragraphs: [
        "When parents pressure you about high grades, it is almost always motivated by anxiety for your economic security. However, enduring constant criticism or comparisons erodes motivation. You can communicate your needs respectfully without creating family conflict [4].",
        "Use a 3-part script: Validation, Reality, and Request.",
        "Script: 'Mum and Dad, I know how hard you work every day to support my schooling, and I am so grateful for your sacrifices (Validation). I am studying diligently every single day, but when I hear comparisons to relatives, my heart beats fast with panic and my brain freezes (Reality). If you could encourage me with patience and trust, it would help me stay focused and perform much better (Request)' [4, 5].",
      ],
      kmParagraphs: [
        "នៅពេលដែលឪពុកម្តាយដាក់សម្ពាធរឿងពិន្ទុ វាច្រើនតែកើតចេញពីការបារម្ភចំពោះអនាគត និងជីវភាពរបស់អ្នក។ ប៉ុន្តែការរស់នៅក្រោមការស្តីបន្ទោស ឬការប្រៀបធៀបជាប្រចាំ នឹងធ្វើឱ្យអ្នកបាត់បង់កម្លាំងចិត្ត។ អ្នកអាចប្រាស្រ័យទាក់ទងពីតម្រូវការរបស់អ្នកដោយការគោរព ដោយមិនបង្កើតជម្លោះក្នុងគ្រួសារឡើយ [4]។",
        "សូមប្រើប្រាស់រូបមន្ត ៣ ជំហាន៖ ការដឹងគុណ ការប្រាប់ការពិត និងការស្នើសុំ។",
        "ពាក្យសម្តីគំរូ៖ «ម៉ែ និងពុក ខ្ញុំដឹងច្បាស់ណាស់ថាពុកម៉ែលំបាកខ្លាំងរាល់ថ្ងៃដើម្បីឱ្យកូនបានរៀន ហើយកូនដឹងគុណពុកម៉ែណាស់ (ការដឹងគុណ)។ កូនកំពុងខិតខំប្រឹងប្រែងរៀនរាល់ថ្ងៃ ប៉ុន្តែនៅពេលដែលឮការប្រៀបធៀបជាមួយអ្នកដទៃ ចិត្តកូនភ័យញាប់ញ័រខ្លាំងរហូតដល់គិតមេរៀនលែងចេញ (ការប្រាប់ការពិត)។ ប្រសិនបើពុកម៉ែជួយផ្តល់កម្លាំងចិត្ត និងការទុកចិត្តដល់កូន នោះកូននឹងមានស្មារតីរឹងមាំ និងរៀនបានកាន់តែល្អ (ការស្នើសុំ)» [4, 5]។",
      ],
      keyPoints: [
        "Acknowledge parental love and sacrifices before expressing your emotional struggle [4].",
        "Explain clearly that fear and comparison freeze memory instead of helping performance.",
        "Inviting encouragement transforms family tension into collaborative support.",
      ],
      kmKeyPoints: [
        "ទទួលស្គាល់សេចក្តីស្រឡាញ់ និងការលះបង់របស់ឪពុកម្តាយ មុននឹងរៀបរាប់ពីការលំបាក [4]។",
        "ពន្យល់ឱ្យច្បាស់ថាការភ័យខ្លាច និងការប្រៀបធៀប ធ្វើឱ្យខួរក្បាលស្ពឹកមិនអាចគិតមេរៀនចេញ។",
        "ការស្នើសុំការលើកទឹកចិត្ត ជួយប្តូរសម្ពាធក្នុងគ្រួសារឱ្យទៅជាការគាំទ្រដ៏កក់ក្តៅ។",
      ],
    },
    {
      id: 8,
      sectionNumber: 8,
      title: "Personal Academic Pressure Check-in: Tracing Your Core Anxiety",
      kmTitle: "ការពិនិត្យសម្ពាធការសិក្សាផ្ទាល់ខ្លួន៖ កំណត់ឫសគល់នៃការព្រួយបារម្ភ (Academic Pressure Check-in)",
      type: "reflection",
      paragraphs: [
        "Academic stress feels like a chaotic whirlwind, but it usually originates from a specific root concern. Take a deep breath and identify where your burden weighs heaviest.",
      ],
      kmParagraphs: [
        "សម្ពាធការសិក្សាអាចធ្វើឱ្យយើងមានអារម្មណ៍វង្វេងវង្វាន់ ប៉ុន្តែវាច្រើនតែកើតចេញពីឫសគល់ជាក់លាក់មួយ។ សូមដកដង្ហើមវែងៗ ហើយស្វែងយល់ថាតើអ្វីជាបន្ទុកដ៏ធ្ងន់បំផុតរបស់អ្នក។",
      ],
      reflection: {
        question: "When you feel overwhelmed by academic dread, which fear is shouting the loudest in your mind?",
        kmQuestion: "នៅពេលដែលអ្នកមានអារម្មណ៍ថាលើសលប់ដោយសារការសិក្សា តើការភ័យខ្លាចមួយណាដែលលាន់ឮខ្លាំងបំផុតក្នុងចិត្តរបស់អ្នក?",
        options: [
          "Terror of disappointing my parents and wasting the hard-earned money they sacrificed for my education",
          "Fear of falling behind my classmates, being perceived as incapable, or facing judgment from peers",
          "My own harsh perfectionism: demanding that I get a flawless grade, and punishing myself for any tiny mistake",
          "Physical exhaustion and burnout from juggling university classes with daytime employment or family duties",
        ],
        kmOptions: [
          "ការភ័យខ្លាចធ្វើឱ្យឪពុកម្តាយខកចិត្ត និងខ្លាចខ្ជះខ្ជាយលុយកាក់ដែលពួកគាត់លះបង់ដើម្បីខ្ញុំ",
          "ការភ័យខ្លាចដើរយឺតជាងមិត្តភក្តិ ខ្លាចគេមើលងាយ ឬការរងការវិនិច្ឆ័យពីមនុស្សជុំវិញខ្លួន",
          "ភាពចង់បានល្អឥតខ្ចោះរបស់ខ្លួនឯង៖ បង្ខំឱ្យខ្លួនឯងបានពិន្ទុខ្ពស់ដាច់គេ និងបន្ទោសខ្លួនឯងពេលមានកំហុសបន្តិចបន្តួច",
          "ការអស់កម្លាំងកាយ និងចិត្តទាំងស្រុងដោយសារតែត្រូវរៀនផង និងធ្វើការងារពេញម៉ោងដើម្បីគ្រួសារផង",
        ],
        feedbackMessage:
          "Naming your primary fear takes away its ability to silently control you. Acknowledging whether your stress stems from parental expectations, peer comparison, internal perfectionism, or overwork allows you to address the root with compassion rather than self-blame.",
        kmFeedbackMessage:
          "ការហ៊ានបញ្ចេញឈ្មោះការភ័យខ្លាចចម្បងរបស់អ្នក ជួយដកអំណាចរបស់វាចេញពីចិត្ត។ ការដឹងច្បាស់ថាតើស្ត្រេសរបស់អ្នកកើតចេញពីការរំពឹងទុករបស់ឪពុកម្តាយ ការប្រៀបធៀប ភាពចង់បានឥតខ្ចោះ ឬការហត់នឿយ ជួយឱ្យអ្នកដោះស្រាយបញ្ហាដោយក្តីមេត្តា ជំនួសឱ្យការបន្ទោសខ្លួនឯង។",
      },
    },
    {
      id: 9,
      sectionNumber: 9,
      title: "Recognizing When Academic Dread Becomes a Mental Health Concern [3, 4]",
      kmTitle: "ការសម្គាល់នៅពេលដែលសម្ពាធការសិក្សាឈានដល់កម្រិតគ្រោះថ្នាក់ (Recognizing Crisis Signs)",
      type: "reading",
      paragraphs: [
        "While a degree of exam nervousness is normal, chronic academic dread can cross into clinical distress that requires compassionate intervention [3].",
        "Warning signs include: severe insomnia lasting for weeks, constant nausea or vomiting before class, panic attacks during exams where your vision blurs and you cannot breathe, withdrawing entirely from friends, or experiencing overwhelming thoughts that you would be better off disappearing.",
        "Your health and your life are infinitely more valuable than any degree, diploma, or test score. If academic pressure is driving you toward despair, talking to a licensed counselor is a courageous and essential step. There is always a way forward, and you do not have to carry this alone [3, 4].",
      ],
      kmParagraphs: [
        "ទោះបីជាការភ័យបន្តិចបន្តួចមុនពេលប្រឡងជារឿងធម្មតាក៏ដោយ ប៉ុន្តែការភ័យខ្លាចរ៉ាំរ៉ៃអាចវិវត្តទៅជាបញ្ហាសុខភាពផ្លូវចិត្តធ្ងន់ធ្ងរដែលទាមទារការជួយសង្គ្រោះ [3]។",
        "សញ្ញាព្រមានរួមមាន៖ ការគេងមិនលក់ជាច្រើនសប្តាហ៍ ការក្អួតចង្អោរញឹកញាប់មុនពេលចូលរៀន ការកើតអាការស្លន់ស្លោ (Panic Attacks) ក្នុងបន្ទប់ប្រឡងរហូតដល់ងងឹតមុខ និងថប់ដង្ហើម ការដកខ្លួនចេញពីមិត្តភក្តិ ឬមានគំនិតអស់សង្ឃឹមខ្លាំងរហូតដល់មិនចង់រស់នៅ។",
        "សុខភាព និងអាយុជីវិតរបស់អ្នកមានតម្លៃធំធេងលើសលប់ជាងសញ្ញាបត្រ ឬពិន្ទុប្រឡងទាំងអស់នៅលើលោកនេះ។ ប្រសិនបើសម្ពាធការសិក្សាកំពុងរុញច្រានអ្នកឱ្យធ្លាក់ក្នុងភាពអស់សង្ឃឹម ការជួបពិគ្រោះជាមួយអ្នកចិត្តវិទ្យាគឺជាទង្វើដ៏ក្លាហាន និងចាំបាច់បំផុត។ ជីវិតតែងតែមានផ្លូវចេញជានិច្ច ហើយអ្នកមិនចាំបាច់រែកពន់បន្ទុកនេះតែម្នាក់ឯងឡើយ [3, 4]។",
      ],
      keyPoints: [
        "Panic attacks, chronic nausea, and despair are signs that stress has exceeded safety [3].",
        "Your life and well-being will always be more important than any academic evaluation.",
        "Professional counselors provide practical, non-judgmental support to restore balance [4].",
      ],
      kmKeyPoints: [
        "អាការស្លន់ស្លោ ការក្អួតចង្អោរ និងការអស់សង្ឃឹម បញ្ជាក់ថាភាពតានតឹងលើសកម្រិតសុវត្ថិភាព [3]។",
        "ជីវិត និងសុខុមាលភាពរបស់អ្នក មានតម្លៃខ្ពស់ជាងការវាយតម្លៃលទ្ធផលសិក្សាទាំងអស់។",
        "អ្នកចិត្តវិទ្យាអាចជួយអ្នកស្វែងរកតុល្យភាពឡើងវិញដោយគ្មានការវិនិច្ឆ័យ [4]។",
      ],
    },
    {
      id: 10,
      sectionNumber: 10,
      title: "The Anti-Panic Reset: The 1-Minute Grounding Breath",
      kmTitle: "ការរំងាប់ភាពស្លន់ស្លោ៖ លំហាត់ដកដង្ហើមស្ងប់ចិត្ត ១ នាទី (1-Minute Grounding Breath)",
      type: "coping",
      paragraphs: [
        "Before entering an examination room, presenting in front of your class, or opening your books after a stressful day, take sixty seconds to regulate your autonomic nervous system.",
        "Plant both feet firmly on the floor. Rest your hands gently on your thighs. Inhale deeply through your nose for a count of 4, feeling your lower belly expand with cool air. Hold smoothly for a count of 2.",
        "Exhale slowly and completely through your mouth for a count of 6. As the breath leaves your body, release the tension from your forehead, drop your shoulders away from your ears, and remind yourself: 'I am safe in this moment. I will do my best, and my best is enough.' Repeat 4 times.",
      ],
      kmParagraphs: [
        "មុនពេលឈានជើងចូលបន្ទប់ប្រឡង ឡើងធ្វើបទបង្ហាញមុខថ្នាក់ ឬបើកសៀវភៅរៀនក្រោយថ្ងៃដ៏នឿយហត់ សូមចំណាយពេល ៦០ វិនាទីដើម្បីរំងាប់ប្រព័ន្ធប្រសាទរបស់អ្នក។",
        "ដាក់ជើងទាំងសងខាងឱ្យរាបស្មើលើកម្រាល។ ដាក់ដៃថ្នមៗលើភ្លៅ។ ដកដង្ហើមចូលជ្រៅៗតាមច្រមុះរាប់ដល់ ៤ ដោយឱ្យពោះប៉ោងឡើង។ ទប់ដង្ហើមថ្នមៗរាប់ដល់ ២។",
        "បន្ទាប់មកដកដង្ហើមចេញយឺតៗតាមមាត់រាប់ដល់ ៦។ នៅពេលដង្ហើមចេញផុត សូមបន្ធូរសាច់ដុំថ្ងាស ទម្លាក់ស្មាចុះ ហើយប្រាប់ខ្លួនឯងថា៖ «ខ្ញុំមានសុវត្ថិភាពក្នុងពេលនេះ។ ខ្ញុំនឹងខិតខំឱ្យអស់ពីលទ្ធភាព ហើយការខិតខំរបស់ខ្ញុំគឺល្អគ្រប់គ្រាន់ហើយ»។ អនុវត្តឡើងវិញ ៤ ដង។",
      ],
      keyPoints: [
        "Feet flat on the floor grounds your physical body and signals spatial stability.",
        "Extended exhalation activates parasympathetic calming, reducing test tachycardia.",
        "Sixty seconds of intentional breath clears mental fog and restores focus.",
      ],
      kmKeyPoints: [
        "ការដាក់ជើងរាបស្មើលើកម្រាល ជួយឱ្យរាងកាយមានលំនឹង និងកាត់បន្ថយការភ័យស្លន់ស្លោ។",
        "ការដកដង្ហើមចេញវែងៗ ជួយបន្ថយចង្វាក់បេះដូងដែលលោតញាប់មុនពេលប្រឡង។",
        "ការដកដង្ហើមដោយស្មារតី ៦០ វិនាទី ជួយបំបាត់ភាពស្ពឹកស្មារតី និងស្តារការផ្ដោតអារម្មណ៍។",
      ],
      actions: [
        {
          label: "Try 1-Minute Calming Breath",
          kmLabel: "អនុវត្តលំហាត់ដកដង្ហើមស្ងប់ចិត្ត ១ នាទី (1-Min Breath)",
          actionType: "exercise",
        },
      ],
    },
    {
      id: 11,
      sectionNumber: 11,
      title: "Building Your Academic Support Village on AROM [4, 5]",
      kmTitle: "ការកសាងភូមិគាំទ្រការសិក្សារបស់អ្នកនៅលើ AROM (Support on AROM)",
      type: "reading",
      paragraphs: [
        "Navigating education does not have to be an exhausting solo battle. Success is sustained by self-compassion, balanced habits, and a trusted community.",
        "On AROM, you have private, judgment-free tools built to support your mental health journey. Open your private AROM Journal (/journal) to unload academic anxieties, track your daily energy batteries, and practice celebrating small study milestones rather than obsessing over perfection.",
        "If academic pressure or parental expectations feel too heavy to navigate alone, explore AROM Professional (/professional) to connect with verified Cambodian counselors and therapists. These professionals understand the exact cultural and academic realities of students in Cambodia and can help you build realistic coping roadmaps [4, 5].",
        "If study stress ever escalates into a severe emotional crisis or thoughts of self-harm, please reach out immediately. Free, confidential help is available 24/7. Call the National Child and Youth Helpline at 1280, the National Health Hotline at 119, or TPO Cambodia at 017 222 372. Your journey is unique, and you are worthy of care every single day.",
      ],
      kmParagraphs: [
        "ការរៀនសូត្រមិនគួរជាសមរភូមិដ៏ឯកោដែលបំផ្លាញសុខភាពនោះឡើយ។ ជោគជ័យយូរអង្វែងកើតចេញពីក្តីមេត្តាចំពោះខ្លួនឯង ទម្លាប់រស់នៅមានតុល្យភាព និងការគាំទ្រពីអ្នកជុំវិញខ្លួន។",
        "នៅលើ AROM អ្នកមានឧបករណ៍សុវត្ថិភាព និងសម្ងាត់ជាច្រើនដើម្បីការពារសុខភាពផ្លូវចិត្ត។ សូមបើកកំណត់ហេតុ AROM Journal (/journal) ដើម្បីទម្លាក់ចោលការថប់បារម្ភរឿងរៀនសូត្រ តាមដានថាមពលប្រចាំថ្ងៃ និងកោតសរសើរខ្លួនឯងចំពោះជំហានតូចៗដែលសម្រេចបាន ជំនួសឱ្យការទាមទារភាពឥតខ្ចោះ។",
        "ប្រសិនបើសម្ពាធការសិក្សា ឬការរំពឹងទុករបស់គ្រួសារមានទម្ងន់ធ្ងន់ពេក សូមចូលទៅកាន់ AROM Professional (/professional) ដើម្បីភ្ជាប់ទំនាក់ទំនងជាមួយអ្នកចិត្តវិទ្យាកម្ពុជាដែលមានការទទួលស្គាល់ត្រឹមត្រូវ។ អ្នកជំនាញយល់ច្បាស់ពីទិដ្ឋភាពវប្បធម៌ និងការសិក្សាក្នុងសង្គមយើង ហើយអាចជួយអ្នករៀបចំយុទ្ធសាស្ត្រជីវិតដ៏មានប្រសិទ្ធភាព [4, 5]។",
        "ប្រសិនបើសម្ពាធការសិក្សាឈានដល់កម្រិតវិបត្តិផ្លូវចិត្តធ្ងន់ធ្ងរ ឬមានគំនិតចង់ធ្វើបាបខ្លួនឯង សូមទាក់ទងជំនួយបន្ទាន់ភ្លាមៗ។ ខ្សែទូរស័ព្ទជំនួយកុមារ និងយុវជនលេខ 1280 ខ្សែទូរស័ព្ទសុខភាពជាតិលេខ 119 ឬអង្គការចិត្តសង្គមកម្ពុជា (TPO Cambodia) តាមលេខ 017 222 372 ត្រៀមជួយជានិច្ចដោយឥតគិតថ្លៃ និងសម្ងាត់។ ដំណើរជីវិតរបស់អ្នកមានតម្លៃ ហើយអ្នកសមនឹងទទួលបានការថែទាំជារៀងរាល់ថ្ងៃ។",
      ],
      keyPoints: [
        "Unload academic dread into your private AROM Journal (/journal) to protect sleep.",
        "Connect with verified youth counselors on AROM Professional (/professional) [4].",
        "Emergency hotlines are free, confidential, and always available: 1280, 119, or TPO Cambodia 017 222 372.",
      ],
      kmKeyPoints: [
        "កត់ត្រាការព្រួយបារម្ភក្នុងកំណត់ហេតុ AROM Journal (/journal) ដើម្បីការពារដំណេកពេលយប់។",
        "ភ្ជាប់ទំនាក់ទំនងជាមួយអ្នកប្រឹក្សាលើ AROM Professional (/professional) ដើម្បីទទួលបានការណែនាំ [4]។",
        "ខ្សែទូរស័ព្ទទាន់ហេតុការណ៍ឥតគិតថ្លៃ និងសម្ងាត់ត្រៀមជួយជានិច្ច៖ 1280, 119 ឬ TPO Cambodia 017 222 372។",
      ],
      alertBox: {
        type: "tip",
        text: "Clinical Truth: A student's physical and mental health is infinitely more valuable than any grade, ranking, or academic trophy. Never sacrifice your sanity for a scorecard.",
        kmText: "ការពិតតាមក្បួនចិត្តវិទ្យា៖ សុខភាពផ្លូវកាយ និងផ្លូវចិត្តរបស់សិស្ស មានតម្លៃធំធេងលើសលប់ជាងពិន្ទុ ចំណាត់ថ្នាក់ ឬពានរង្វាន់សិក្សាទាំងអស់។ សូមកុំលះបង់សុខុមាលភាពរបស់អ្នក ដើម្បីតែក្រដាសពិន្ទុឡើយ។",
      },
      actions: [
        {
          label: "Open AROM Journal",
          kmLabel: "បើកកំណត់ហេតុ AROM Journal",
          actionType: "tips",
        },
        {
          label: "Talk to a Professional",
          kmLabel: "ពិគ្រោះជាមួយអ្នកជំនាញ AROM",
          actionType: "professional",
        },
      ],
    },
  ],
};

export const ALL_LESSONS: Lesson[] = [
  LESSON_ACADEMIC_PRESSURE,
  LESSON_LONELINESS,
  LESSON_SUPPORT_FRIEND,
  LESSON_LOST_INTEREST,
  LESSON_BALANCE_STUDY_WORK_LIFE,
  LESSON_WHAT_IS_MENTAL_HEALTH,
  LESSON_ABOUT_STRESS,
  LESSON_UNDERSTANDING_ANXIETY,
  LESSON_UNDERSTAND_YOURSELF,
  LESSON_KNOW_WHEN_TO_SEEK_HELP,
  LESSON_BETTER_SLEEP,
  LESSON_BUILD_HEALTHY_RELATIONSHIPS,
  LESSON_SADNESS_VS_DEPRESSION,
  LESSON_TALK_ABOUT_FEELINGS,
  LESSON_SOCIAL_ANXIETY,
  LESSON_EXAM_ANXIETY,
  LESSON_FEAR_OF_FAILURE,
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
