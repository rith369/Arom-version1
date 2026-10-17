// Play Cards with Friends (BACKEND-HANDOFF.md section 28). The cards live in
// code for version 1: friends sit together and pass one phone, nothing is
// saved. "Getting real" and "Care" cards must be checked by an AROM
// professional before launch.

export type CardLevel = "warm" | "real" | "care";
export type CardKind = "question" | "breathe" | "kind" | "together";

export type PlayCard = { id: string; level: CardLevel; kind: CardKind; en: string; km: string };

export const LEVELS: Record<
  CardLevel,
  { en: string; km: string; blurb: string; kmBlurb: string }
> = {
  warm: {
    en: "Warm up",
    km: "កម្តៅចិត្ត (Warm up)",
    blurb: "Light and fun, to get everyone talking.",
    kmBlurb: "ស្រាលៗ និងសប្បាយ ដើម្បីឱ្យគ្រប់គ្នាចាប់ផ្តើមនិយាយ។",
  },
  real: {
    en: "Getting real",
    km: "និយាយពីចិត្ត (Getting real)",
    blurb: "Feelings, stress and what is on your mind.",
    kmBlurb: "អារម្មណ៍ ភាពតានតឹង និងអ្វីដែលនៅក្នុងចិត្ត។",
  },
  care: {
    en: "Care",
    km: "យកចិត្តទុកដាក់ (Care)",
    blurb: "Thanks, kindness and support for each other.",
    kmBlurb: "ការដឹងគុណ ចិត្តល្អ និងការគាំទ្រគ្នាទៅវិញទៅមក។",
  },
};

export const KINDS: Record<CardKind, { en: string; km: string }> = {
  question: { en: "Question", km: "សំណួរ" },
  breathe: { en: "Breathe together", km: "ដកដង្ហើមជាមួយគ្នា" },
  kind: { en: "Kind words", km: "ពាក្យល្អ" },
  together: { en: "Everyone together", km: "គ្រប់គ្នារួមគ្នា" },
};

const card = (level: CardLevel, kind: CardKind, n: number, en: string, km: string): PlayCard => ({
  id: `${level}-${n}`,
  level,
  kind,
  en,
  km,
});

export const PLAY_CARDS: PlayCard[] = [
  // ---------- Warm up ----------
  card("warm", "question", 1, "What song always makes you feel better?", "តើបទចម្រៀងអ្វីដែលតែងតែធ្វើឱ្យអ្នកមានអារម្មណ៍ល្អ?"),
  card("warm", "question", 2, "What food reminds you of home?", "តើម្ហូបអ្វីដែលរំលឹកអ្នកពីផ្ទះ?"),
  card("warm", "question", 3, "What is the best thing that happened to you this week?", "តើរឿងល្អបំផុតដែលបានកើតឡើងចំពោះអ្នកក្នុងសប្តាហ៍នេះគឺជាអ្វី?"),
  card("warm", "question", 4, "If you could live anywhere in Cambodia for one year, where would you go?", "ប្រសិនបើអ្នកអាចរស់នៅកន្លែងណាមួយក្នុងប្រទេសកម្ពុជាបានមួយឆ្នាំ តើអ្នកនឹងទៅកន្លែងណា?"),
  card("warm", "question", 5, "What is your favorite Khmer New Year memory?", "តើអនុស្សាវរីយ៍បុណ្យចូលឆ្នាំខ្មែរដែលអ្នកចូលចិត្តបំផុតគឺជាអ្វី?"),
  card("warm", "question", 6, "What small thing made you smile today?", "តើរឿងតូចមួយណាដែលធ្វើឱ្យអ្នកញញឹមនៅថ្ងៃនេះ?"),
  card("warm", "question", 7, "What hobby would you love to try one day?", "តើចំណង់ចំណូលចិត្តអ្វីដែលអ្នកចង់សាកល្បងនៅថ្ងៃណាមួយ?"),
  card("warm", "question", 8, "Which place makes you feel calm?", "តើកន្លែងណាដែលធ្វើឱ្យអ្នកមានអារម្មណ៍ស្ងប់ចិត្ត?"),
  card("warm", "question", 9, "What was your favorite game as a child?", "តើល្បែងអ្វីដែលអ្នកចូលចិត្តលេងបំផុតកាលពីនៅក្មេង?"),
  card("warm", "question", 10, "Describe your perfect lazy Sunday.", "សូមរៀបរាប់ពីថ្ងៃអាទិត្យសម្រាកដ៏ល្អឥតខ្ចោះរបស់អ្នក។"),
  card("warm", "question", 11, "What is one thing you are looking forward to?", "តើមានរឿងអ្វីមួយដែលអ្នកកំពុងទន្ទឹងរង់ចាំ?"),
  card("warm", "question", 12, "Who was your favorite teacher, and why?", "តើគ្រូណាដែលអ្នកចូលចិត្តបំផុត ហើយហេតុអ្វី?"),
  card("warm", "question", 13, "What is a skill you are quietly proud of?", "តើជំនាញអ្វីដែលអ្នកមានមោទនភាពដោយស្ងាត់ៗ?"),
  card("warm", "question", 14, "If today were weather, what would it be right now?", "ប្រសិនបើថ្ងៃនេះជាអាកាសធាតុ តើឥឡូវនេះវាជាអាកាសធាតុបែបណា?"),
  card("warm", "question", 15, "What movie or show could you watch again and again?", "តើភាពយន្ត ឬកម្មវិធីអ្វីដែលអ្នកអាចមើលម្តងហើយម្តងទៀតមិនចេះធុញ?"),
  card("warm", "question", 16, "What is the kindest thing a stranger has done for you?", "តើរឿងល្អបំផុតដែលមនុស្សមិនស្គាល់ធ្លាប់ធ្វើសម្រាប់អ្នកគឺជាអ្វី?"),
  card("warm", "breathe", 17, "Breathe in for 4, out for 6. Three times, all together.", "ដកដង្ហើមចូល ៤ ដង្ហើមចេញ ៦ ។ ធ្វើបីដងជាមួយគ្នា។"),
  card("warm", "kind", 18, "Tell the person on your right one thing you like about them.", "ប្រាប់អ្នកនៅខាងស្តាំអ្នកពីចំណុចមួយដែលអ្នកចូលចិត្តលើពួកគេ។"),
  card("warm", "together", 19, "Show everyone a photo on your phone that makes you happy.", "បង្ហាញរូបថតមួយក្នុងទូរស័ព្ទរបស់អ្នកដែលធ្វើឱ្យអ្នកសប្បាយចិត្ត។"),
  card("warm", "together", 20, "Everyone: say one word that describes your day.", "គ្រប់គ្នា៖ និយាយពាក្យមួយដែលពិពណ៌នាពីថ្ងៃរបស់អ្នក។"),

  // ---------- Getting real ----------
  card("real", "question", 1, "What has felt heavy for you this month?", "តើអ្វីដែលធ្វើឱ្យអ្នកមានអារម្មណ៍ធ្ងន់ចិត្តក្នុងខែនេះ?"),
  card("real", "question", 2, "When do you feel most like yourself?", "តើនៅពេលណាដែលអ្នកមានអារម្មណ៍ថាជាខ្លួនឯងបំផុត?"),
  card("real", "question", 3, "What do you do when you feel stressed? Does it help?", "តើអ្នកធ្វើអ្វីនៅពេលមានភាពតានតឹង? តើវាជួយបានទេ?"),
  card("real", "question", 4, "What do you wish people understood about you?", "តើមានអ្វីដែលអ្នកចង់ឱ្យមនុស្សយល់ពីអ្នក?"),
  card("real", "question", 5, "What pressure do you feel from family, school or work?", "តើអ្នកមានអារម្មណ៍សម្ពាធអ្វីខ្លះពីគ្រួសារ សាលា ឬការងារ?"),
  card("real", "question", 6, "When did you last feel really overwhelmed? What helped?", "តើលើកចុងក្រោយដែលអ្នកមានអារម្មណ៍តានតឹងខ្លាំងគឺនៅពេលណា? តើអ្វីបានជួយអ្នក?"),
  card("real", "question", 7, "What is a worry you have about the future?", "តើអ្នកមានការព្រួយបារម្ភអ្វីខ្លះអំពីអនាគត?"),
  card("real", "question", 8, "What would you tell your younger self?", "តើអ្នកនឹងប្រាប់ខ្លួនឯងកាលពីនៅក្មេងថាអ្វី?"),
  card("real", "question", 9, "What does a good friend mean to you?", "តើមិត្តល្អមានន័យយ៉ាងណាសម្រាប់អ្នក?"),
  card("real", "question", 10, "What helps you sleep when your mind will not slow down?", "តើអ្វីជួយឱ្យអ្នកគេងលក់ នៅពេលដែលចិត្តរបស់អ្នកមិនព្រមស្ងប់?"),
  card("real", "question", 11, "Is there something you have been putting off? What makes it hard?", "តើមានរឿងអ្វីដែលអ្នកកំពុងពន្យារពេល? តើអ្វីធ្វើឱ្យវាពិបាក?"),
  card("real", "question", 12, "How do you know when you need a break?", "តើអ្នកដឹងដោយរបៀបណាថាអ្នកត្រូវការសម្រាក?"),
  card("real", "question", 13, "What is a mistake that taught you something important?", "តើកំហុសមួយណាដែលបានបង្រៀនអ្នកនូវរឿងសំខាន់?"),
  card("real", "question", 14, "What makes it hard for you to ask for help?", "តើអ្វីដែលធ្វើឱ្យអ្នកពិបាកសុំជំនួយពីគេ?"),
  card("real", "question", 15, "When did you last feel truly proud of yourself?", "តើលើកចុងក្រោយដែលអ្នកមានមោទនភាពលើខ្លួនឯងពិតប្រាកដគឺនៅពេលណា?"),
  card("real", "question", 16, "What do you need more of in your life right now?", "តើពេលនេះអ្នកត្រូវការអ្វីបន្ថែមទៀតក្នុងជីវិត?"),
  card("real", "breathe", 17, "Close your eyes. Breathe slowly and notice three sounds around you.", "បិទភ្នែក។ ដកដង្ហើមយឺតៗ ហើយស្តាប់សំឡេងបីនៅជុំវិញអ្នក។"),
  card("real", "breathe", 18, "Breathe in for 4, out for 6. Let your shoulders drop.", "ដកដង្ហើមចូល ៤ ដង្ហើមចេញ ៦ ។ បន្ធូរស្មារបស់អ្នក។"),
  card("real", "kind", 19, "Tell someone here about a time they helped you.", "ប្រាប់នរណាម្នាក់នៅទីនេះពីពេលដែលពួកគេធ្លាប់ជួយអ្នក។"),
  card("real", "together", 20, "Everyone: show your energy today from 1 to 5 with your fingers.", "គ្រប់គ្នា៖ បង្ហាញកម្រិតថាមពលរបស់អ្នកថ្ងៃនេះពី ១ ដល់ ៥ ដោយប្រើម្រាមដៃ។"),
  card(
    "real",
    "question",
    21,
    "Is there a page on social media (Instagram, Facebook, TikTok, etc.) that you go to on a bad day that gives you life? What about that page feels healing for you?",
    "តើមានទំព័របណ្តាញសង្គម (Instagram, Facebook, TikTok ជាដើម) ណាមួយដែលអ្នកចូលមើលនៅថ្ងៃពិបាកចិត្ត ហើយវាធ្វើឱ្យអ្នកមានកម្លាំងចិត្តឡើងវិញទេ? តើអ្វីខ្លះនៅក្នុងទំព័រនោះដែលជួយព្យាបាលចិត្តអ្នក?",
  ),

  // ---------- Care ----------
  card("care", "question", 1, "What is one thing you admire about the person on your left?", "តើមានចំណុចអ្វីមួយដែលអ្នកកោតសរសើរលើអ្នកនៅខាងឆ្វេងអ្នក?"),
  card("care", "question", 2, "How can this group support you this week?", "តើក្រុមនេះអាចគាំទ្រអ្នកយ៉ាងដូចម្តេចក្នុងសប្តាហ៍នេះ?"),
  card("care", "question", 3, "Who are you grateful for, and have you told them?", "តើអ្នកដឹងគុណនរណាម្នាក់ ហើយតើអ្នកបានប្រាប់គេហើយឬនៅ?"),
  card("care", "question", 4, "What is a kind thing you can do for yourself tomorrow?", "តើមានរឿងល្អអ្វីមួយដែលអ្នកអាចធ្វើសម្រាប់ខ្លួនឯងនៅថ្ងៃស្អែក?"),
  card("care", "question", 5, "What memory with this group makes you smile?", "តើអនុស្សាវរីយ៍ណាជាមួយក្រុមនេះដែលធ្វើឱ្យអ្នកញញឹម?"),
  card("care", "question", 6, "What would you like to forgive yourself for?", "តើមានរឿងអ្វីដែលអ្នកចង់អភ័យទោសឱ្យខ្លួនឯង?"),
  card("care", "question", 7, "What small win have you not celebrated yet?", "តើមានជោគជ័យតូចមួយណាដែលអ្នកមិនទាន់បានអបអរ?"),
  card("care", "question", 8, "What makes you feel safe with someone?", "តើអ្វីដែលធ្វើឱ្យអ្នកមានអារម្មណ៍សុវត្ថិភាពនៅជាមួយនរណាម្នាក់?"),
  card("care", "question", 9, "What would you like to hear more often?", "តើអ្នកចង់ឮពាក្យអ្វីឱ្យបានញឹកញាប់ជាងនេះ?"),
  card("care", "question", 10, "How do you like to be comforted when you are sad?", "តើអ្នកចូលចិត្តឱ្យគេលួងលោមអ្នកបែបណា នៅពេលអ្នកកើតទុក្ខ?"),
  card("care", "question", 11, "What promise do you want to make to yourself?", "តើមានការសន្យាមួយណាដែលអ្នកចង់ធ្វើចំពោះខ្លួនឯង?"),
  card("care", "question", 12, "What is something you are learning to accept?", "តើមានអ្វីដែលអ្នកកំពុងរៀនទទួលយក?"),
  card("care", "question", 13, "What part of yourself are you learning to love?", "តើផ្នែកណាមួយនៃខ្លួនអ្នកដែលអ្នកកំពុងរៀនស្រឡាញ់?"),
  card("care", "question", 14, "What does real rest look like for you?", "តើការសម្រាកពិតប្រាកដសម្រាប់អ្នកមានរូបរាងបែបណា?"),
  card("care", "question", 15, "Who taught you how to be kind?", "តើនរណាជាអ្នកបង្រៀនអ្នកឱ្យចេះមានចិត្តល្អ?"),
  card("care", "kind", 16, "Share one hope you have for each person here.", "ចែករំលែកក្តីសង្ឃឹមមួយសម្រាប់មនុស្សម្នាក់ៗនៅទីនេះ។"),
  card("care", "kind", 17, "Say a sincere thank you to everyone here, one by one.", "និយាយពាក្យអរគុណដោយស្មោះទៅកាន់មនុស្សម្នាក់ៗនៅទីនេះ។"),
  card("care", "kind", 18, "Tell the person on your left what they bring to this group.", "ប្រាប់អ្នកនៅខាងឆ្វេងអ្នកពីអ្វីដែលពួកគេនាំមកឱ្យក្រុមនេះ។"),
  card("care", "breathe", 19, "Put a hand on your heart. Breathe slowly together three times.", "ដាក់ដៃលើទ្រូង។ ដកដង្ហើមយឺតៗជាមួយគ្នាបីដង។"),
  card("care", "together", 20, "Plan one small thing to do together soon.", "រៀបចំផែនការធ្វើរឿងតូចមួយជាមួយគ្នាឆាប់ៗនេះ។"),
];

// ---------- Dealing ----------

export type DeckChoice = CardLevel | "journey";
export const ROUND_OPTIONS = [9, 15, 21] as const;
export type RoundCount = (typeof ROUND_OPTIONS)[number];

const LIGHTER: Record<CardLevel, CardLevel | null> = { warm: null, real: "warm", care: "real" };
export const lighterLevel = (level: CardLevel) => LIGHTER[level];

/** The level for each turn: one level, or a journey from light to deep. */
export function levelPlan(deck: DeckChoice, rounds: number): CardLevel[] {
  if (deck !== "journey") return Array.from({ length: rounds }, () => deck);
  const third = Math.ceil(rounds / 3);
  return Array.from({ length: rounds }, (_, index) => (index < third ? "warm" : index < third * 2 ? "real" : "care"));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** A shuffled pile per level. Call in an event handler, not while rendering. */
export function shuffledPiles(): Record<CardLevel, PlayCard[]> {
  return {
    warm: shuffle(PLAY_CARDS.filter((item) => item.level === "warm")),
    real: shuffle(PLAY_CARDS.filter((item) => item.level === "real")),
    care: shuffle(PLAY_CARDS.filter((item) => item.level === "care")),
  };
}
