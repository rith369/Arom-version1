export type TopicCategory =
  | "All"
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

export const ALL_LESSONS: Lesson[] = [
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
