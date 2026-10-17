// Truth or dare, the AROM way (Rith, 17 Oct 2026): truths are light and
// friendly, dares are silly but safe. No private or hurtful questions, no
// danger, nothing embarrassing, no touching, nothing posted online, and
// Pass is always there. Drafted by Claude; a Khmer speaker should read it.

export type TodLevel = "chill" | "silly";
export type TodKind = "truth" | "dare";
export type TodCard = { id: string; level: TodLevel; kind: TodKind; en: string; km: string };

export const TOD_LEVELS: Record<TodLevel, { en: string; km: string; blurb: string; kmBlurb: string }> = {
  chill: {
    en: "Chill",
    km: "ស្រាលៗ (Chill)",
    blurb: "Easy, friendly questions and small dares.",
    kmBlurb: "សំណួរងាយៗ រួសរាយ និងការប្រកួតតូចៗ។",
  },
  silly: {
    en: "Silly",
    km: "កំប្លែង (Silly)",
    blurb: "Goofy questions and funny dares.",
    kmBlurb: "សំណួរកំប្លែង និងការប្រកួតដែលធ្វើឱ្យសើច។",
  },
};

const card = (level: TodLevel, kind: TodKind, n: number, en: string, km: string): TodCard => ({ id: `${level}-${kind}-${n}`, level, kind, en, km });

export const TOD_CARDS: TodCard[] = [
  // ---------- Chill truths ----------
  card("chill", "truth", 1, "What is a song you secretly love?", "តើបទចម្រៀងអ្វីដែលអ្នកចូលចិត្តដោយសម្ងាត់?"),
  card("chill", "truth", 2, "What is the last thing that made you laugh out loud?", "តើរឿងចុងក្រោយដែលធ្វើឱ្យអ្នកសើចខ្លាំងគឺជាអ្វី?"),
  card("chill", "truth", 3, "What food could you eat every day?", "តើម្ហូបអ្វីដែលអ្នកអាចញ៉ាំរាល់ថ្ងៃមិនចេះធុញ?"),
  card("chill", "truth", 4, "Which emoji do you use the most?", "តើរូបអារម្មណ៍ (emoji) ណាដែលអ្នកប្រើច្រើនបំផុត?"),
  card("chill", "truth", 5, "What is a small habit you are proud of?", "តើទម្លាប់តូចមួយណាដែលអ្នកមានមោទនភាព?"),
  card("chill", "truth", 6, "Who here would you tell first if you had good news?", "តើអ្នកនឹងប្រាប់នរណាម្នាក់នៅទីនេះមុនគេ ពេលអ្នកមានដំណឹងល្អ?"),
  card("chill", "truth", 7, "What is a talent nobody here knows you have?", "តើអ្នកមានទេពកោសល្យអ្វីដែលគ្មាននរណាម្នាក់នៅទីនេះដឹង?"),
  card("chill", "truth", 8, "What was your dream job as a child?", "តើការងារក្នុងក្តីស្រមៃរបស់អ្នកកាលពីក្មេងគឺជាអ្វី?"),
  card("chill", "truth", 9, "What is the nicest compliment you have ever received?", "តើពាក្យសរសើរល្អបំផុតដែលអ្នកធ្លាប់ទទួលបានគឺជាអ្វី?"),
  card("chill", "truth", 10, "If you could have dinner with anyone, who would it be?", "ប្រសិនបើអ្នកអាចញ៉ាំអាហារពេលល្ងាចជាមួយនរណាម្នាក់ តើអ្នកនឹងជ្រើសរើសនរណា?"),
  card("chill", "truth", 11, "What are you looking forward to this month?", "តើអ្នកកំពុងទន្ទឹងរង់ចាំអ្វីក្នុងខែនេះ?"),
  card("chill", "truth", 12, "What is the best gift you have ever given someone?", "តើកាដូល្អបំផុតដែលអ្នកធ្លាប់ឱ្យនរណាម្នាក់គឺជាអ្វី?"),

  // ---------- Chill dares ----------
  card("chill", "dare", 1, "Give a real compliment to the person on your left.", "និយាយសរសើរដោយស្មោះទៅកាន់អ្នកនៅខាងឆ្វេងអ្នក។"),
  card("chill", "dare", 2, "Show a photo from your phone that you are happy to share.", "បង្ហាញរូបថតមួយក្នុងទូរស័ព្ទរបស់អ្នក ដែលអ្នកសុខចិត្តចែករំលែក។"),
  card("chill", "dare", 3, "Do your best slow motion walk across the room.", "ដើរយឺតៗដូចក្នុងភាពយន្ត ឆ្លងកាត់បន្ទប់។"),
  card("chill", "dare", 4, "Hum a song and let everyone guess it.", "ច្រៀងហ៊ឹមបទមួយ ហើយឱ្យគ្រប់គ្នាទាយ។"),
  card("chill", "dare", 5, "Tell a joke, even a really bad one.", "និយាយរឿងកំប្លែងមួយ ទោះបីវាមិនសូវសើចក៏ដោយ។"),
  card("chill", "dare", 6, "Teach everyone a word in a language you know.", "បង្រៀនគ្រប់គ្នានូវពាក្យមួយ ក្នុងភាសាដែលអ្នកចេះ។"),
  card("chill", "dare", 7, "Do your happiest dance for 10 seconds.", "រាំរបាំរីករាយបំផុតរបស់អ្នក រយៈពេល ១០ វិនាទី។"),
  card("chill", "dare", 8, "Make everyone smile without saying a word.", "ធ្វើឱ្យគ្រប់គ្នាញញឹម ដោយមិននិយាយពាក្យណាមួយ។"),
  card("chill", "dare", 9, "Describe your day using only three words.", "ពិពណ៌នាថ្ងៃរបស់អ្នក ដោយប្រើតែពាក្យបី។"),
  card("chill", "dare", 10, "Do 5 jumping jacks while smiling.", "លោតទះដៃ ៥ ដង ទាំងញញឹម។"),
  card("chill", "dare", 11, "Draw a tiny portrait of the person on your right in 20 seconds and show it.", "គូររូបតូចមួយនៃអ្នកនៅខាងស្តាំអ្នក ក្នុង ២០ វិនាទី ហើយបង្ហាញ។"),
  card("chill", "dare", 12, "Say three nice things about yourself out loud.", "និយាយរឿងល្អៗបីអំពីខ្លួនឯង ឱ្យឮៗ។"),

  // ---------- Silly truths ----------
  card("silly", "truth", 1, "What is the silliest thing you were scared of as a kid?", "តើរឿងឆ្កួតៗបំផុតដែលអ្នកធ្លាប់ខ្លាចកាលពីក្មេងគឺជាអ្វី?"),
  card("silly", "truth", 2, "What is the weirdest food combination you enjoy?", "តើការលាយម្ហូបចម្លែកបំផុតដែលអ្នកចូលចិត្តគឺជាអ្វី?"),
  card("silly", "truth", 3, "What is the funniest thing you have done when nobody was watching?", "តើរឿងកំប្លែងបំផុតដែលអ្នកធ្លាប់ធ្វើ ពេលគ្មាននរណាមើលគឺជាអ្វី?"),
  card("silly", "truth", 4, "If you were an animal, which one would you be and why?", "ប្រសិនបើអ្នកជាសត្វ តើអ្នកនឹងជាសត្វអ្វី ហើយហេតុអ្វី?"),
  card("silly", "truth", 5, "What is a word you always say wrong?", "តើពាក្យអ្វីដែលអ្នកតែងតែនិយាយខុស?"),
  card("silly", "truth", 6, "What is the most useless thing you know a lot about?", "តើរឿងដែលគ្មានប្រយោជន៍បំផុត ដែលអ្នកដឹងច្រើនគឺជាអ្វី?"),
  card("silly", "truth", 7, "What is your favorite dance move?", "តើក្បាច់រាំដែលអ្នកចូលចិត្តបំផុតគឺជាអ្វី?"),
  card("silly", "truth", 8, "What is the strangest dream you remember?", "តើសុបិនចម្លែកបំផុតដែលអ្នកចាំបានគឺជាអ្វី?"),
  card("silly", "truth", 9, "Which cartoon character are you most like?", "តើអ្នកដូចតួគំនូរជីវចលណាជាងគេ?"),
  card("silly", "truth", 10, "What did you believe as a kid that was totally wrong?", "តើរឿងអ្វីដែលអ្នកជឿកាលពីក្មេង ប៉ុន្តែវាខុសទាំងស្រុង?"),
  card("silly", "truth", 11, "If you could eat food of only one color for a week, which color?", "ប្រសិនបើអ្នកអាចញ៉ាំម្ហូបតែមួយពណ៌ក្នុងមួយសប្តាហ៍ តើពណ៌អ្វី?"),
  card("silly", "truth", 12, "What is the funniest typo you have ever sent?", "តើកំហុសវាយអក្សរដែលកំប្លែងបំផុត ដែលអ្នកធ្លាប់ផ្ញើគឺជាអ្វី?"),

  // ---------- Silly dares ----------
  card("silly", "dare", 1, "Talk like a news reporter until your next turn.", "និយាយដូចអ្នកយកព័ត៌មាន រហូតដល់វេនបន្ទាប់របស់អ្នក។"),
  card("silly", "dare", 2, "Make your best animal sound and let everyone guess the animal.", "ធ្វើសំឡេងសត្វមួយឱ្យដូចបំផុត ហើយឱ្យគ្រប់គ្នាទាយ។"),
  card("silly", "dare", 3, "Do your best impression of a famous cartoon character.", "ត្រាប់តាមតួគំនូរជីវចលល្បីមួយ ឱ្យដូចបំផុត។"),
  card("silly", "dare", 4, "Sing the chorus of any song in an opera voice.", "ច្រៀងបន្ទរនៃបទណាមួយ ដោយសំឡេងបែបអូប៉េរ៉ា។"),
  card("silly", "dare", 5, "Pretend to be a robot ordering food at a restaurant.", "ធ្វើពុតជារ៉ូបូត កំពុងកុម្ម៉ង់ម្ហូបនៅភោជនីយដ្ឋាន។"),
  card("silly", "dare", 6, "Invent a secret group greeting that needs no touching.", "បង្កើតរបៀបស្វាគមន៍សម្ងាត់មួយសម្រាប់ក្រុម ដែលមិនចាំបាច់ប៉ះគ្នា។"),
  card("silly", "dare", 7, "Speak only in questions until your next turn.", "និយាយតែជាសំណួរ រហូតដល់វេនបន្ទាប់របស់អ្នក។"),
  card("silly", "dare", 8, "Do a 15 second runway walk like a supermodel.", "ដើរម៉ូដដូចតារាម៉ូដែល រយៈពេល ១៥ វិនាទី។"),
  card("silly", "dare", 9, "Explain how to cook rice like a TV chef.", "ពន្យល់ពីរបៀបដាំបាយ ដូចចុងភៅលើកញ្ចក់ទូរទស្សន៍។"),
  card("silly", "dare", 10, "Make up a short rap about the snack closest to you.", "តែងបទរ៉េបខ្លីមួយ អំពីអាហារសម្រន់ដែលនៅជិតអ្នកបំផុត។"),
  card("silly", "dare", 11, "Act out your morning routine without words.", "សម្តែងទម្លាប់ពេលព្រឹករបស់អ្នក ដោយមិននិយាយ។"),
  card("silly", "dare", 12, "Laugh like a movie villain for 5 seconds.", "សើចដូចតួអាក្រក់ក្នុងភាពយន្ត រយៈពេល ៥ វិនាទី។"),
];

export const TOD_ROUNDS = [10, 20, 30] as const;
export type TodRounds = (typeof TOD_ROUNDS)[number];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export type TodPiles = Record<TodKind, TodCard[]>;

/** Shuffled truths and dares for one level. Call in an event handler. */
export function todPiles(level: TodLevel): TodPiles {
  return {
    truth: shuffle(TOD_CARDS.filter((item) => item.level === level && item.kind === "truth")),
    dare: shuffle(TOD_CARDS.filter((item) => item.level === level && item.kind === "dare")),
  };
}

/** Takes the next truth or dare, reshuffling when the pile runs out. */
export function drawTod(piles: TodPiles, level: TodLevel, kind: TodKind, avoid?: string): { card: TodCard; piles: TodPiles } {
  let pile = piles[kind].filter((item) => item.id !== avoid);
  if (!pile.length) pile = todPiles(level)[kind].filter((item) => item.id !== avoid);
  const [next, ...rest] = pile;
  return { card: next, piles: { ...piles, [kind]: rest } };
}
