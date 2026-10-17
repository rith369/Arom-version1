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

export const TIP_SLEEP_HYGIENE: TipItem = {
  id: "sleep-hygiene-essentials",
  title: "Sleep Hygiene Essentials",
  kmTitle: "មូលដ្ឋានគ្រឹះនៃដំណេកលក់ស្រួល (Sleep Hygiene)",
  subtitle: "Small Nighttime Adjustments for Restful Sleep",
  kmSubtitle: "ការកែសម្រួលទម្លាប់ពេលយប់ដើម្បីគេងលក់ស្កប់ស្កល់",
  introduction:
    "Good sleep does not start the moment your head hits the pillow; it begins with the signals you send your nervous system throughout the evening. Sleep hygiene is the collection of evidence-based habits and bedroom adjustments that allow your circadian rhythm to cue natural melatonin release. Here are 5 practical evening adjustments you can practice tonight.",
  kmIntroduction:
    "ដំណេកប្រកបដោយគុណភាពមិនមែនចាប់ផ្តើមនៅពេលដែលក្បាលរបស់អ្នកប៉ះនឹងខ្នើយនោះទេ ប៉ុន្តែវាចាប់ផ្តើមពីសញ្ញាតូចៗដែលអ្នកបញ្ជូនទៅកាន់ប្រព័ន្ធប្រសាទពេញមួយល្ងាច។ មូលដ្ឋានគ្រឹះនៃដំណេក (Sleep Hygiene) គឺជាបណ្តុំនៃទម្លាប់ និងបរិយាកាសជុំវិញខ្លួន ដែលជួយឱ្យចង្វាក់ជីវសាស្ត្រ (Circadian Rhythm) របស់អ្នកបញ្ចុះអ័រម៉ូនស្ត្រេស និងបញ្ចេញអ័រម៉ូនមេឡាតូនីន (Melatonin) ឱ្យគេងលក់ដោយធម្មជាតិ។ ខាងក្រោមនេះជាការកែសម្រួលទម្លាប់ពេលល្ងាចចំនួន ៥ ដែលផ្អែកលើការស្រាវជ្រាវវិទ្យាសាស្ត្រ ដែលអ្នកអាចសាកល្បងបាននៅយប់នេះ។",
  category: "Sleep",
  kmCategory: "ដំណេក (Sleep)",
  duration: "3 min",
  kmDuration: "៣ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "5 Evening Tips",
  kmFormat: "៥ គន្លឹះពេលល្ងាច",
  isAvailable: true,
  image: "/mindguide/sleep.png",
  heroImage: "/mindguide/better-sleep-hero.jpg",
  sourceCitation:
    "Adapted from the American Academy of Sleep Medicine (AASM) and National Sleep Foundation clinical guidelines (2024).",
  kmSourceCitation:
    "ដកស្រង់ចេញពីគោលការណ៍ណែនាំគ្លីនិករបស់បណ្ឌិត្យសភាវេជ្ជសាស្ត្រដំណេកអាមេរិក (AASM) និងមូលនិធិដំណេកជាតិ (2024)។",
  supportCallout: {
    title: "Chronic Insomnia Support",
    kmTitle: "ជំនួយសម្រាប់បញ្ហាគេងមិនលក់រ៉ាំរ៉ៃ (Chronic Insomnia)",
    body:
      "If sleeplessness persists more than three nights a week for over a month despite healthy routines, that is a clinical signal. On AROM, you can match with verified therapists and counselors who specialize in cognitive behavioral therapy for insomnia (CBT-I) and stress relief.",
    kmBody:
      "ប្រសិនបើដំណេកមិនលក់នៅតែបន្តលើសពី ៣ យប់ក្នុងមួយសប្តាហ៍ អស់រយៈពេលជាងមួយខែ បើទោះបីជាបានកែប្រែទម្លាប់ហើយក៏ដោយ នោះគឺជាសញ្ញាដែលត្រូវការជំនួយ។ នៅលើកម្មវិធី AROM អ្នកអាចភ្ជាប់ទំនាក់ទំនងជាមួយអ្នកជំនាញចិត្តសាស្រ្ត និងអ្នកប្រឹក្សាដែលមានការបញ្ជាក់ត្រឹមត្រូវ ដែលមានជំនាញក្នុងការព្យាបាលការគេងមិនលក់ (CBT-I) និងការគ្រប់គ្រងភាពតានតឹង។",
    actionLabel: "Find Sleep Support",
    kmActionLabel: "ស្វែងរកជំនួយដំណេក (Find Sleep Support)",
  },
  steps: [
    {
      number: 1,
      title: "Anchor your wake time.",
      kmTitle: "កំណត់ម៉ោងភ្ញាក់ពីគេងឱ្យទៀងទាត់",
      body:
        "Your internal biological clock resets each morning with light. Waking up at the same hour every day, even on weekends, strengthens your circadian rhythm and ensures healthy sleep pressure builds up by nightfall.",
      kmBody:
        "នាឡិកាជីវសាស្ត្រក្នុងរាងកាយរបស់អ្នកកំណត់ឡើងវិញរៀងរាល់ព្រឹកនៅពេលជួបពន្លឺថ្ងៃ។ ការភ្ញាក់ពីគេងនៅម៉ោងដដែលជារៀងរាល់ថ្ងៃ ទោះជាថ្ងៃចុងសប្តាហ៍ក៏ដោយ ជួយពង្រឹងចង្វាក់ជីវសាស្ត្រ និងជួយឱ្យអ្នកមានអារម្មណ៍ងងុយគេងទាន់ពេលវេលានៅពេលយប់។",
      tryNow: "pick a consistent wake-up time and stick to it tomorrow morning.",
      kmTryNow: "ជ្រើសរើសម៉ោងភ្ញាក់ពីគេងជាក់លាក់មួយ ហើយក្រោកឱ្យចំម៉ោងនៅព្រឹកស្អែក។",
    },
    {
      number: 2,
      title: "Clear mental clutter in AROM Journal.",
      kmTitle: "ជម្រះការព្រួយបារម្ភក្នុងកំណត់ហេតុ AROM",
      body:
        "When you lie down in silence, unaddressed worries and tomorrow's to-do list compete for your attention. Take 5 minutes before bed to open your private AROM Journal and type or voice record whatever is on your mind. Because your reflections are confidential, externalizing thoughts signals to your brain that they are safely stored, so it does not have to stay awake holding them.",
      kmBody:
        "នៅពេលអ្នកចូលគេងក្នុងភាពស្ងប់ស្ងាត់ ការព្រួយបារម្ភដែលមិនទាន់ដោះស្រាយ និងកិច្ចការថ្ងៃស្អែកនឹងដណ្តើមការយកចិត្តទុកដាក់ក្នុងចិត្ត។ សូមចំណាយពេល ៥ នាទីមុនចូលគេង បើកមុខងារ «កំណត់ហេតុ (Journal)» ក្នុងកម្មវិធី AROM ដើម្បីសរសេរ ឬកត់ត្រាសំឡេងនូវអ្វីៗដែលនៅក្នុងចិត្ត។ ដោយសារកំណត់ហេតុរបស់អ្នកមានសុវត្ថិភាពជាឯកជន ១០០% ការបញ្ចេញគំនិតទាំងនោះប្រាប់ខួរក្បាលថាពួកវាត្រូវបានរក្សាទុកដោយសុវត្ថិភាព ដូច្នេះអ្នកមិនចាំបាច់នៅភ្ញាក់ចាំវានោះឡើយ។",
      tryNow: "record 3 thoughts or tomorrow's tasks in AROM Journal.",
      kmTryNow: "កត់ត្រា ៣ គំនិត ឬកិច្ចការថ្ងៃស្អែកចូលក្នុងកំណត់ហេតុ AROM។",
    },
    {
      number: 3,
      title: "Slow your heart with 4-7-8 breathing.",
      kmTitle: "បន្ថយចង្វាក់បេះដូងដោយការដកដង្ហើម ៤, ៧, ៨",
      body:
        "Racing bedtime thoughts trigger shallow breathing and elevate your heart rate. Practicing slow rhythmic breathing stimulates the vagus nerve and activates your parasympathetic rest response, switching your body from alert mode to deep relaxation.",
      kmBody:
        "ការគិតច្រើនមុនពេលគេងធ្វើឱ្យការដកដង្ហើមញាប់ និងបង្កើនចង្វាក់បេះដូង។ ការហាត់ដកដង្ហើមយឺតៗតាមចង្វាក់ ជួយភ្ញោចសរសៃប្រសាទ Vagus និងជំរុញឱ្យរាងកាយផ្លាស់ប្តូរពីសភាពប្រុងប្រយ័ត្ន មកកាន់ភាពស្ងប់ស្ងាត់ដើម្បីត្រៀមគេង។",
      tryNow: "tap below to start 2 minutes of guided 4-7-8 breathing in AROM.",
      kmTryNow: "ចុចខាងក្រោមដើម្បីហាត់ដកដង្ហើម ៤, ៧, ៨ រយៈពេល ២ នាទីក្នុង AROM។",
      hasBreathingAction: true,
    },
    {
      number: 4,
      title: "Set a digital sunset 60 minutes before bed.",
      kmTitle: "កាត់បន្ថយអេក្រង់ ៦០ នាទីមុនចូលគេង",
      body:
        "The short-wavelength blue light emitted from smartphones, tablets, and laptops fools your brain into thinking it is daytime, delaying the natural release of sleep hormones like melatonin. Dim bright overhead lights and switch off social feeds at least 60 minutes before sleeping.",
      kmBody:
        "ពន្លឺពណ៌ខៀវចេញពីអេក្រង់ទូរស័ព្ទ និងកុំព្យូទ័រ បោកបញ្ឆោតខួរក្បាលឱ្យគិតថាជាពេលថ្ងៃ ដែលធ្វើឱ្យពន្យារការបញ្ចេញអ័រម៉ូនមេឡាតូនីន (Melatonin) សម្រាប់ដំណេក។ សូមបន្ថយពន្លឺភ្លើងក្នុងបន្ទប់ និងឈប់ប្រើប្រាស់បណ្តាញសង្គមយ៉ាងហោចណាស់ ៦០ នាទីមុនពេលអ្នកចូលគេង។",
      tryNow: "charge your phone away from your pillow and turn off notifications.",
      kmTryNow: "សាកថ្មទូរស័ព្ទឱ្យឆ្ងាយពីគ្រែ និងបិទសំឡេងជូនដំណឹង។",
    },
    {
      number: 5,
      title: "Cool and darken your room.",
      kmTitle: "រៀបចំបន្ទប់គេងឱ្យត្រជាក់ និងងងឹតល្អ",
      body:
        "To initiate deep sleep, your body temperature must drop by 1 to 2 degrees Fahrenheit. A bedroom kept cool, well ventilated, and fully dark signals your brain that it is time to rest, preventing nighttime awakenings.",
      kmBody:
        "ដើម្បីគេងលក់ស្កប់ សីតុណ្ហភាពរាងកាយរបស់អ្នកត្រូវការចុះត្រជាក់បន្តិច។ បន្ទប់គេងដែលមានខ្យល់ចេញចូលត្រជាក់ស្រួល និងងងឹតល្អ ផ្តល់សញ្ញាដល់ខួរក្បាលថាដល់ពេលសម្រាក ដែលជួយការពារកុំឱ្យភ្ញាក់កណ្តាលយប់។",
      tryNow: "dim all room lights and open a window or fan for airflow.",
      kmTryNow: "បិទភ្លើងបន្ទប់ឱ្យងងឹត និងបើកកង្ហារ ឬបង្អួចឱ្យមានខ្យល់ចេញចូលត្រជាក់។",
    },
  ],
};

export const TIP_CALMING_RACING_THOUGHTS: TipItem = {
  id: "calming-racing-thoughts",
  title: "Calming Racing Thoughts",
  kmTitle: "ការបន្ធូរបន្ថយគំនិតរវើរវាយ (Racing Thoughts)",
  subtitle: "When Your Brain Refuses to Slow Down",
  kmSubtitle: "នៅពេលដែលខួរក្បាលមិនព្រមសម្រាក",
  introduction:
    "Racing thoughts happen when unaddressed worries, fears, and imagined scenarios compete for mental bandwidth all at once. When your brain gets stuck in overdrive, trying to force your mind to be quiet often backfires. Evidence-based grounding techniques and expressive unloading give your nervous system permission to slow down. Here are 5 practical steps to regain calm when your mind refuses to rest.",
  kmIntroduction:
    "គំនិតរវើរវាយកើតឡើងនៅពេលដែលការព្រួយបារម្ភ ការភ័យខ្លាច និងការគិតស្រមើស្រមៃដណ្តើមគ្នាក្នុងចិត្តក្នុងពេលតែមួយ។ នៅពេលដែលខួរក្បាលដំណើរការលឿនហួសហេតុ ការបង្ខំចិត្តឱ្យនៅស្ងៀមតែងតែធ្វើឱ្យគំនិតកាន់តែរត់ខ្លាំងឡើង។ បច្ចេកទេសទប់លំនឹងចិត្ត និងការបញ្ចេញគំនិតចេញមកក្រៅ ជួយឱ្យប្រព័ន្ធប្រសាទរបស់អ្នកវិលមករកភាពស្ងប់ស្ងាត់ឡើងវិញ។ ខាងក្រោមនេះជា ៥ ជំហានជាក់ស្តែងដើម្បីគ្រប់គ្រងចិត្ត នៅពេលដែលខួរក្បាលរបស់អ្នកមិនព្រមសម្រាក។",
  category: "Anxiety",
  kmCategory: "ការថប់បារម្ភ (Anxiety)",
  duration: "4 min",
  kmDuration: "៤ នាទី",
  difficulty: "Beginner",
  kmDifficulty: "កម្រិតដំបូង (Beginner)",
  format: "5 Calming Steps",
  kmFormat: "៥ ជំហានបន្ធូរបន្ថយគំនិត",
  isAvailable: true,
  image: "/mindguide/icon-10.svg",
  heroImage: "/mindguide/understanding-anxiety-hero.jpg",
  sourceCitation:
    "Adapted from the Anxiety and Depression Association of America (ADAA) and American Psychological Association guidelines (2024).",
  kmSourceCitation:
    "ដកស្រង់ចេញពីគោលការណ៍ណែនាំរបស់សមាគមថប់បារម្ភ និងបាក់ទឹកចិត្តអាមេរិក (ADAA) និងសមាគមចិត្តសាស្រ្តអាមេរិក (APA, 2024)។",
  supportCallout: {
    title: "Intrusive Anxiety Support",
    kmTitle: "ជំនួយសម្រាប់គំនិតថប់បារម្ភខ្លាំង (Intrusive Anxiety)",
    body:
      "When racing thoughts feel uncontrollable, provoke panic, or prevent you from working, studying, and sleeping for multiple weeks, you do not have to carry them alone. On AROM, you can connect in complete privacy with verified therapists and counselors who specialize in anxiety management and mindfulness.",
    kmBody:
      "នៅពេលដែលគំនិតរវើរវាយពិបាកគ្រប់គ្រង បង្កឱ្យភ័យស្លន់ស្លោ ឬរំខានដល់ការងារ ការសិក្សា និងដំណេកអស់ជាច្រើនសប្តាហ៍ អ្នកមិនចាំបាច់ទ្រាំរែកពន់តែម្នាក់ឯងនោះទេ។ នៅលើកម្មវិធី AROM អ្នកអាចភ្ជាប់ទំនាក់ទំនងជាលក្ខណៈសម្ងាត់ ១០០% ជាមួយអ្នកជំនាញចិត្តសាស្រ្ត និងអ្នកប្រឹក្សាដែលមានការបញ្ជាក់ត្រឹមត្រូវ ដែលមានជំនាញក្នុងការគ្រប់គ្រងការថប់បារម្ភ និងសតិដឹង។",
    actionLabel: "Find Anxiety Support",
    kmActionLabel: "ស្វែងរកជំនួយការថប់បារម្ភ (Find Anxiety Support)",
  },
  steps: [
    {
      number: 1,
      title: "Name the mental loop.",
      kmTitle: "សម្គាល់ និងដាក់ឈ្មោះគំនិតដែលកំពុងរត់",
      body:
        'When thoughts race, your brain treats every imagined catastrophe as an immediate crisis. Pause and say silently: "I notice my mind is spinning with what-ifs." Naming the pattern creates psychological distance, reminding you that a thought is just mental weather, not an emergency.',
      kmBody:
        "នៅពេលដែលគំនិតរត់ប្រជែងគ្នា ខួរក្បាលរបស់អ្នកចាត់ទុកគ្រប់ការព្រួយបារម្ភទាំងអស់ថាជាគ្រោះអាសន្នបន្ទាន់។ សូមផ្អាកមួយភ្លែត ហើយប្រាប់ខ្លួនឯងដោយស្ងប់ស្ងាត់ថា «ខ្ញុំកំពុងកត់សម្គាល់ឃើញចិត្តរបស់ខ្ញុំកំពុងព្រួយបារម្ភរឿងដែលមិនទាន់មកដល់»។ ការដាក់ឈ្មោះឱ្យទម្រង់គំនិតនេះជួយបង្កើតគម្លាតផ្លូវចិត្ត និងរំលឹកអ្នកថា គំនិតគ្រាន់តែជាអារម្មណ៍ដែលឆ្លងកាត់ មិនមែនជាគ្រោះថ្នាក់ជាក់ស្តែងនោះឡើយ។",
      tryNow: 'tell yourself: "This is a passing worry loop, not a fact."',
      kmTryNow: "ប្រាប់ខ្លួនឯងថា «នេះគ្រាន់តែជាការគិតព្រួយបារម្ភដែលឆ្លងកាត់ មិនមែនជាការពិតទេ»។",
    },
    {
      number: 2,
      title: "Unload onto your private AROM Journal.",
      kmTitle: "បញ្ចេញគំនិតចូលទៅក្នុងកំណត់ហេតុ AROM",
      body:
        "Keeping racing thoughts inside your head causes them to loop repeatedly like an echo chamber. Open your private AROM Journal and write freely for 3 minutes without editing, or record a quiet voice note. Because your entries are 100% private and encrypted, externalizing thoughts empties your working memory and breaks the mental loop.",
      kmBody:
        "ការទុកគំនិតដែលកំពុងរត់ឱ្យវិលវល់ក្នុងក្បាល ធ្វើឱ្យពួកវាបន្លឺឡើងសារចុះសារឡើងមិនចេះចប់។ សូមបើកមុខងារ «កំណត់ហេតុ (Journal)» ក្នុងកម្មវិធី AROM ដើម្បីសរសេរដោយសេរីរយៈពេល ៣ នាទី ឬកត់ត្រាសំឡេងផ្ទាល់ខ្លួនរបស់អ្នក។ ដោយសារកំណត់ហេតុ AROM ត្រូវបានការពារជាសម្ងាត់ ១០០% ការបញ្ចេញគំនិតចេញមកក្រៅជួយសម្រាលបន្ទុកខួរក្បាល និងកាត់ផ្តាច់វដ្តគំនិតដែលវិលវល់។",
      tryNow: "open AROM Journal and type or voice record your top 3 worries.",
      kmTryNow: "បើកកំណត់ហេតុ AROM ហើយសរសេរ ឬកត់ត្រាសំឡេងការព្រួយបារម្ភចម្បង ៣ យ៉ាង។",
    },
    {
      number: 3,
      title: "Ground your senses in the room.",
      kmTitle: "ទាញអារម្មណ៍មកកាន់បច្ចុប្បន្នដោយវិញ្ញាណទាំង ៥",
      body:
        "Racing thoughts pull your mind into imagined future scenarios. Bring yourself back into your physical surroundings by naming 5 things you can see, 4 things you can touch, 3 sounds you can hear, 2 scents you can smell, and 1 slow breath you can feel.",
      kmBody:
        "គំនិតរវើរវាយតែងតែទាញចិត្តរបស់អ្នកឱ្យគិតទៅរកព្រឹត្តិការណ៍អវិជ្ជមានក្នុងអនាគតដែលមិនទាន់កើតឡើង។ សូមទាញស្មារតីត្រឡប់មកកាន់បរិយាកាសជាក់ស្តែងជុំវិញខ្លួន ដោយកត់សម្គាល់ ៥ យ៉ាងដែលអ្នកមើលឃើញ, ៤ យ៉ាងដែលអ្នកអាចប៉ះបាន, ៣ សំឡេងដែលអ្នកឮ, ២ ក្លិនដែលអ្នកធុំ, និង ១ ដង្ហើមចេញចូលដែលអ្នកមានអារម្មណ៍ដឹង។",
      tryNow: "look around right now and touch 3 different physical textures.",
      kmTryNow: "ក្រឡេកមើលជុំវិញខ្លួនឥឡូវនេះ ហើយប៉ះវត្ថុដែលមានផ្ទៃខុសគ្នា ៣ យ៉ាង។",
    },
    {
      number: 4,
      title: "Reset your nervous system with 4-7-8 breathing.",
      kmTitle: "បន្ថយចង្វាក់ដង្ហើមដោយការហាត់ដកដង្ហើម ៤, ៧, ៨",
      body:
        "When your brain is on overdrive, your heart rate accelerates and breathing becomes shallow. Practicing slow rhythmic breathing sends physical signals through the vagus nerve to slow down your heart and switch off the adrenaline surge.",
      kmBody:
        "នៅពេលដែលខួរក្បាលដំណើរការលឿនហួសហេតុ ចង្វាក់បេះដូងរបស់អ្នកនឹងកើនឡើង ហើយការដកដង្ហើមនឹងញាប់។ ការហាត់ដកដង្ហើមយឺតៗតាមចង្វាក់ ៤, ៧, ៨ បញ្ជូនសញ្ញារាងកាយតាមរយៈសរសៃប្រសាទ Vagus ដើម្បីបន្ថយចង្វាក់បេះដូង និងបិទការបញ្ចេញអ័រម៉ូនអាដ្រេណាលីន។",
      tryNow: "tap below to start 2 minutes of calming 4-7-8 breathing in AROM.",
      kmTryNow: "ចុចខាងក្រោមដើម្បីហាត់ដកដង្ហើម ៤, ៧, ៨ រយៈពេល ២ នាទីក្នុង AROM។",
      hasBreathingAction: true,
    },
    {
      number: 5,
      title: "Schedule a dedicated worry window.",
      kmTitle: "កំណត់ពេលព្រួយបារម្ភ ១៥ នាទីក្នុងមួយថ្ងៃ",
      body:
        'Telling yourself "do not think about it" makes racing thoughts stronger. Instead, postpone them by telling your mind: "I will review this worry during my 15-minute worry window at 4:00 PM." If a worry appears outside that window, gently remind yourself that it has an appointment later.',
      kmBody:
        "ការប្រាប់ខ្លួនឯងថា «កុំគិតពីរឿងហ្នឹង» ផ្ទុយទៅវិញកាន់តែធ្វើឱ្យគំនិតនោះរត់ខ្លាំងឡើង។ វិធីដ៏មានប្រសិទ្ធភាពគឺពន្យារពេលវា ដោយប្រាប់ចិត្តរបស់អ្នកថា «ខ្ញុំនឹងពិចារណាការព្រួយបារម្ភនេះក្នុងអំឡុងពេល ១៥ នាទីនៅម៉ោង ៤ រសៀល»។ ប្រសិនបើគំនិតព្រួយបារម្ភលេចឡើងក្រៅម៉ោងនោះ សូមរំលឹកខ្លួនឯងថាយើងបានកំណត់ពេលដោះស្រាយវារួចហើយ។",
      tryNow: "choose a 15-minute window tomorrow afternoon for productive problem solving.",
      kmTryNow: "ជ្រើសរើសពេលវេលា ១៥ នាទីនៅរសៀលថ្ងៃស្អែកសម្រាប់ការដោះស្រាយបញ្ហាជាក់ស្តែង។",
    },
  ],
};

export const ALL_TIPS: TipItem[] = [
  TIP_CONTROL_STRESS,
  TIP_SLEEP_HYGIENE,
  TIP_CALMING_RACING_THOUGHTS,
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
