export type PracticeCategory =
  | "All"
  | "Breathing"
  | "Meditation"
  | "Grounding"
  | "Body Scan"
  | "Sleep";

export type PracticeItem = {
  id: string;
  title: string;
  kmTitle?: string;
  subtitle: string;
  kmSubtitle?: string;
  category: PracticeCategory;
  duration: string;
  kmDuration?: string;
  difficulty: "Beginner" | "Intermediate";
  kmDifficulty?: string;
  format: string;
  kmFormat?: string;
  isAvailable: boolean;
  badge?: string;
  image: string;
  heroImage?: string;
  description: string;
  kmDescription?: string;
  outcomes: { en: string; km?: string }[];
};

export type SavedPractice = {
  id: string;
  title: string;
  kmTitle?: string;
  category: string;
  duration: string;
  thumbnail: string;
};

export const PRACTICE_CATEGORIES: {
  id: PracticeCategory;
  label: string;
  kmLabel: string;
}[] = [
  { id: "All", label: "All", kmLabel: "ទាំងអស់" },
  { id: "Breathing", label: "Breathing", kmLabel: "ការដកដង្ហើម (Breathing)" },
  { id: "Meditation", label: "Meditation", kmLabel: "ការធ្វើសមាធិ (Meditation)" },
  { id: "Grounding", label: "Grounding", kmLabel: "ការទប់លំនឹងចិត្ត (Grounding)" },
  { id: "Body Scan", label: "Body Scan", kmLabel: "ការពិនិត្យរាងកាយ (Body Scan)" },
  { id: "Sleep", label: "Sleep", kmLabel: "ដំណេក (Sleep)" },
];

export const PRACTICE_BREATHING: PracticeItem = {
  id: "interactive-breathing",
  title: "Interactive Breathing Exercise",
  kmTitle: "ការហាត់ដកដង្ហើម (Breathing Exercise)",
  subtitle: "4-4 Calming Breath to reset your mind and body",
  kmSubtitle: "ការដកដង្ហើមស្ងប់ចិត្ត ៤, ៤ ដើម្បីឱ្យចិត្ត និងរាងកាយធូរស្រាល",
  category: "Breathing",
  duration: "4 min",
  kmDuration: "៤ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "Interactive Guided Session",
  kmFormat: "ការអនុវត្តណែនាំអន្តរកម្ម (Interactive)",
  isAvailable: true,
  image: "/mindguide/icon-11.svg",
  heroImage: "/mindguide/managing-stress-hero.svg",
  description:
    "Follow the rhythmic expanding orb to balance your nervous system, slow down your heart rate, and bring gentle calm back to your day.",
  kmDescription:
    "ដកដង្ហើមតាមចលនារង្វង់ដើម្បីសម្រួលប្រព័ន្ធប្រសាទ បន្ថយចង្វាក់បេះដូង និងនាំមកនូវភាពស្ងប់ស្ងាត់ដល់ចិត្តរបស់អ្នក។",
  outcomes: [
    {
      en: "Restore nervous system balance through steady 4-second cycles",
      km: "ស្តារលំនឹងប្រព័ន្ធប្រសាទតាមរយៈវដ្តដកដង្ហើម ៤ វិនាទី",
    },
    {
      en: "Follow visual orb expansion and contraction cues",
      km: "អនុវត្តតាមចលនារង្វង់រីក និងរួមស្មើៗគ្នា",
    },
    {
      en: "Hold and release phases that naturally lower muscle tension",
      km: "ទប់ និងបញ្ចេញដង្ហើមដើម្បីបន្ធូរបន្ថយភាពតានតឹងសាច់ដុំ",
    },
    {
      en: "Optional gentle sound guidance to stay centered without looking",
      km: "សំឡេងណែនាំស្រទន់ជួយឱ្យចិត្តស្ងប់",
    },
  ],
};

export const ALL_PRACTICES: PracticeItem[] = [
  PRACTICE_BREATHING,
  {
    id: "mindful-body-scan",
    title: "Mindful Body Scan",
    kmTitle: "ការពិនិត្យរាងកាយដោយសតិ (Body Scan)",
    subtitle: "Notice sensations from head to toe without judgment",
    kmSubtitle: "កត់សម្គាល់អារម្មណ៍រាងកាយពីក្បាលដល់ចុងជើង",
    category: "Body Scan",
    duration: "8 min",
    kmDuration: "៨ នាទី",
    difficulty: "Beginner",
    kmDifficulty: "កម្រិតដំបូង (Beginner)",
    format: "Audio Guided Practice",
    kmFormat: "ការអនុវត្តតាមសំឡេង (Audio)",
    isAvailable: false,
    badge: "Coming Soon",
    image: "/mindguide/strategies.png",
    description:
      "A slow, attentive journey releasing physical tension held in the jaw, neck, shoulders, and back.",
    kmDescription: "ការបន្ធូរបន្ថយភាពតានតឹងសាច់ដុំក ស្មា និងខ្នងដោយការផ្ដោតអារម្មណ៍។",
    outcomes: [
      { en: "Tune into physical sensations with gentle curiosity" },
      { en: "Release unconscious tightness in the face and shoulders" },
      { en: "Cultivate bodily presence and comfort" },
    ],
  },
  {
    id: "sensory-grounding",
    title: "5-4-3-2-1 Sensory Grounding",
    kmTitle: "ការទប់លំនឹងចិត្ត ៥ ជំហាន (Grounding)",
    subtitle: "Anchor yourself firmly in the present moment",
    kmSubtitle: "ភ្ជាប់ទំនាក់ទំនងជាមួយបច្ចុប្បន្នភាព",
    category: "Grounding",
    duration: "5 min",
    kmDuration: "៥ នាទី",
    difficulty: "Beginner",
    kmDifficulty: "កម្រិតដំបូង (Beginner)",
    format: "Interactive Mental Exercise",
    kmFormat: "លំហាត់ចិត្តអន្តរកម្ម (Interactive)",
    isAvailable: false,
    badge: "Coming Soon",
    image: "/mindguide/icon-10.svg",
    description:
      "A grounding technique that engages sight, touch, sound, smell, and taste to break anxious thought spirals.",
    kmDescription: "វិធីសាស្ត្រទប់លំនឹងចិត្តដោយប្រើអារម្មណ៍ទាំងប្រាំដើម្បីកាត់បន្ថយការភ័យព្រួយ។",
    outcomes: [
      { en: "Interrupt racing thoughts by engaging the external senses" },
      { en: "Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste" },
      { en: "Return quickly to baseline safety and orientation" },
    ],
  },
  {
    id: "evening-relaxation",
    title: "Evening Deep Relaxation",
    kmTitle: "ការសម្រាកឱ្យលក់ស្រួលពេលយប់ (Deep Sleep)",
    subtitle: "Wind down your thoughts and prepare for restorative sleep",
    kmSubtitle: "រៀបចំចិត្ត និងរាងកាយសម្រាប់ការគេងលក់ស្រួល",
    category: "Sleep",
    duration: "10 min",
    kmDuration: "១០ នាទី",
    difficulty: "Beginner",
    kmDifficulty: "កម្រិតដំបូង (Beginner)",
    format: "Audio Relaxation",
    kmFormat: "ការសម្រាកតាមសំឡេង (Audio)",
    isAvailable: false,
    badge: "Coming Soon",
    image: "/mindguide/sleep.png",
    description:
      "A soothing evening meditation to let go of the day, ease mental chatter, and invite deep sleep.",
    kmDescription: "ការធ្វើសមាធិពេលល្ងាចដើម្បីបំភ្លេចទុក្ខកង្វល់ និងគេងឱ្យបានស្កប់ស្កល់។",
    outcomes: [
      { en: "Transition smoothly from busy daytime mode to rest" },
      { en: "Gentle diaphragmatic breathing for parasympathetic activation" },
      { en: "Quiet mental to-do lists before resting your head" },
    ],
  },
  {
    id: "loving-kindness",
    title: "Loving-Kindness Meditation",
    kmTitle: "សមាធិមេត្តាធម៌ (Loving-Kindness)",
    subtitle: "Cultivate warmth, compassion, and gentle care",
    kmSubtitle: "បណ្ដុះសេចក្ដីមេត្តា និងការស្រឡាញ់ខ្លួនឯង",
    category: "Meditation",
    duration: "7 min",
    kmDuration: "៧ នាទី",
    difficulty: "Intermediate",
    kmDifficulty: "កម្រិតមធ្យម (Intermediate)",
    format: "Guided Audio Meditation",
    kmFormat: "សមាធិណែនាំតាមសំឡេង (Audio)",
    isAvailable: false,
    badge: "Coming Soon",
    image: "/mindguide/icon-7.svg",
    description:
      "Send compassionate intentions first to yourself, then to loved ones, and outwards to your community.",
    kmDescription: "ផ្ញើសេចក្ដីមេត្តា និងថាមពលវិជ្ជមានដល់ខ្លួនឯង និងមនុស្សជុំវិញខ្លួន។",
    outcomes: [
      { en: "Counter harsh inner critics with compassionate phrasing" },
      { en: "Build emotional resilience through connection" },
      { en: "Strengthen self-acceptance and patience" },
    ],
  },
  {
    id: "progressive-muscle-relaxation",
    title: "Muscle Tension Release",
    kmTitle: "ការបន្ធូរបន្ថយសាច់ដុំ (Muscle Release)",
    subtitle: "Systematically tense and release targeted muscle groups",
    kmSubtitle: "ការរឹត និងបន្ធូរសាច់ដុំជាដំណាក់កាល",
    category: "Grounding",
    duration: "6 min",
    kmDuration: "៦ នាទី",
    difficulty: "Beginner",
    kmDifficulty: "កម្រិតដំបូង (Beginner)",
    format: "Somatic Practice",
    kmFormat: "ការអនុវត្តរាងកាយ (Somatic)",
    isAvailable: false,
    badge: "Coming Soon",
    image: "/mindguide/stress.png",
    description:
      "Learn the physical contrast between tension and complete muscular ease across your whole body.",
    kmDescription: "ស្វែងយល់ពីភាពខុសគ្នារវាងការតឹងតែង និងការធូរស្រាលនៃរាងកាយ។",
    outcomes: [
      { en: "Identify where your body stores subconscious stress" },
      { en: "Actively contract and release muscle groups" },
      { en: "Experience immediate physical softening" },
    ],
  },
];

// Saved practices are saved items (saved-store.ts), in the person's account.
