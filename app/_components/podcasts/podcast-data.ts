// MindGuide podcasts are made by the AROM team (admins). They are separate
// from professional podcasts, which professionals publish on their own
// profile so users can hear them before booking (see lib/therapists.ts).

export type MindGuidePodcastChapter = {
  id: string;
  // Start time in seconds.
  seconds: number;
  title: string;
  kmTitle: string;
};

export type MindGuidePodcast = {
  id: string;
  title: string;
  kmTitle: string;
  description: string;
  kmDescription: string;
  topic: string;
  kmTopic: string;
  durationSeconds: number;
  // Empty until an admin uploads the audio file.
  audioUrl: string;
  publishedDate: string;
  // Optional guest from the professional directory (their slug).
  guestProfessionalId: string;
  takeaways: { en: string; km: string }[];
  chapters: MindGuidePodcastChapter[];
};

export function formatDuration(totalSeconds: number, km: boolean) {
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  return km ? `${minutes} នាទី` : `${minutes} min`;
}

export function formatTimestamp(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const MINDGUIDE_PODCASTS: MindGuidePodcast[] = [
  {
    id: 'stress-in-the-body',
    title: 'Why stress shows up in your body',
    kmTitle: 'ហេតុអ្វីភាពតានតឹងបង្ហាញខ្លួនក្នុងរាងកាយ',
    description:
      'Tight shoulders, a racing heart, an upset stomach. We talk about how stress travels through the body, why that is normal, and three small ways to help your body settle.',
    kmDescription:
      'ស្មាតឹង បេះដូងលោតញាប់ ឈឺពោះ។ យើងនិយាយអំពីរបៀបដែលភាពតានតឹងប៉ះពាល់ដល់រាងកាយ ហេតុអ្វីវាជារឿងធម្មតា និងវិធីតូចៗបីយ៉ាងដើម្បីជួយរាងកាយឱ្យស្ងប់។',
    topic: 'Stress',
    kmTopic: 'ភាពតានតឹង',
    durationSeconds: 1080,
    audioUrl: '',
    publishedDate: '2026-10-02',
    guestProfessionalId: 'sopheap-chan',
    takeaways: [
      {
        en: 'Body signs of stress are your alarm system working, not a sign that something is wrong with you.',
        km: 'សញ្ញានៃភាពតានតឹងក្នុងរាងកាយ គឺជាប្រព័ន្ធការពាររបស់អ្នកកំពុងដំណើរការ មិនមែនជាសញ្ញាថាអ្នកមានបញ្ហានោះទេ។',
      },
      {
        en: 'A slow breath out is one of the fastest ways to tell your body it is safe.',
        km: 'ការដកដង្ហើមចេញយឺតៗ គឺជាវិធីលឿនបំផុតមួយដើម្បីប្រាប់រាងកាយថាវាមានសុវត្ថិភាព។',
      },
      {
        en: 'If body signs last for weeks or affect sleep and work, it is worth talking to a professional.',
        km: 'ប្រសិនបើសញ្ញានៅក្នុងរាងកាយនៅតែមានច្រើនសប្តាហ៍ ឬប៉ះពាល់ដល់ការគេង និងការងារ គួរតែពិភាក្សាជាមួយអ្នកជំនាញ។',
      },
    ],
    chapters: [
      { id: 'c1', seconds: 0, title: 'Welcome', kmTitle: 'សូមស្វាគមន៍' },
      { id: 'c2', seconds: 95, title: 'What stress does in the body', kmTitle: 'អ្វីដែលភាពតានតឹងធ្វើក្នុងរាងកាយ' },
      { id: 'c3', seconds: 420, title: 'Why it is normal', kmTitle: 'ហេតុអ្វីវាជារឿងធម្មតា' },
      { id: 'c4', seconds: 690, title: 'Three ways to settle', kmTitle: 'វិធីបីយ៉ាងដើម្បីឱ្យស្ងប់' },
      { id: 'c5', seconds: 960, title: 'When to ask for help', kmTitle: 'ពេលណាគួរស្វែងរកជំនួយ' },
    ],
  },
  {
    id: 'sleep-busy-mind',
    title: 'Sleep when your mind will not stop',
    kmTitle: 'ការគេងនៅពេលចិត្តមិនព្រមឈប់គិត',
    description:
      'Lying awake with a busy mind is one of the most common worries we hear. This episode shares gentle habits for the hour before bed and what to do when you wake at night.',
    kmDescription:
      'ការដេកមិនលក់ដោយសារគិតច្រើន គឺជាការព្រួយបារម្ភទូទៅបំផុតមួយ។ ភាគនេះចែករំលែកទម្លាប់ស្រាលៗសម្រាប់មួយម៉ោងមុនចូលគេង និងអ្វីដែលត្រូវធ្វើពេលភ្ញាក់ពេលយប់។',
    topic: 'Sleep',
    kmTopic: 'ការគេង',
    durationSeconds: 840,
    audioUrl: '',
    publishedDate: '2026-10-07',
    guestProfessionalId: '',
    takeaways: [
      {
        en: 'Keep the hour before bed slow and screen light.',
        km: 'រក្សាមួយម៉ោងមុនចូលគេងឱ្យយឺត និងប្រើអេក្រង់តិច។',
      },
      {
        en: 'Write worries on paper so your mind does not have to hold them.',
        km: 'សរសេរការព្រួយបារម្ភលើក្រដាស ដើម្បីកុំឱ្យចិត្តត្រូវកាន់វា។',
      },
    ],
    chapters: [
      { id: 'c1', seconds: 0, title: 'Why a busy mind keeps us awake', kmTitle: 'ហេតុអ្វីការគិតច្រើនធ្វើឱ្យយើងដេកមិនលក់' },
      { id: 'c2', seconds: 300, title: 'The hour before bed', kmTitle: 'មួយម៉ោងមុនចូលគេង' },
      { id: 'c3', seconds: 600, title: 'Waking up at night', kmTitle: 'ការភ្ញាក់ពេលយប់' },
    ],
  },
  {
    id: 'talking-to-family',
    title: 'Talking to family about how you feel',
    kmTitle: 'និយាយជាមួយគ្រួសារអំពីអារម្មណ៍របស់អ្នក',
    description:
      'Sharing feelings with family can feel hard, especially when mental health is not talked about at home. We share simple words to start the conversation and what to do if it does not go well.',
    kmDescription:
      'ការចែករំលែកអារម្មណ៍ជាមួយគ្រួសារអាចពិបាក ជាពិសេសនៅពេលដែលសុខភាពផ្លូវចិត្តមិនត្រូវបាននិយាយនៅផ្ទះ។ យើងចែករំលែកពាក្យសាមញ្ញដើម្បីចាប់ផ្តើមការសន្ទនា និងអ្វីដែលត្រូវធ្វើប្រសិនបើវាមិនដំណើរការល្អ។',
    topic: 'Relationships',
    kmTopic: 'ទំនាក់ទំនង',
    durationSeconds: 1320,
    audioUrl: '',
    publishedDate: '2026-10-11',
    guestProfessionalId: 'ratanak-pich',
    takeaways: [
      {
        en: 'Start small: "I have been feeling tired and low lately" is enough.',
        km: 'ចាប់ផ្តើមតិចៗ៖ "ថ្មីៗនេះខ្ញុំមានអារម្មណ៍នឿយហត់ និងធ្លាក់ចុះ" គឺគ្រប់គ្រាន់ហើយ។',
      },
      {
        en: 'Choose a calm time and place, not in the middle of an argument.',
        km: 'ជ្រើសរើសពេលវេលា និងទីកន្លែងស្ងប់ មិនមែនពេលកំពុងឈ្លោះគ្នាទេ។',
      },
      {
        en: 'If family cannot listen yet, a friend or professional can.',
        km: 'ប្រសិនបើគ្រួសារមិនទាន់អាចស្តាប់បាន មិត្តភក្តិ ឬអ្នកជំនាញអាចស្តាប់បាន។',
      },
    ],
    chapters: [
      { id: 'c1', seconds: 0, title: 'Why it feels hard', kmTitle: 'ហេតុអ្វីវាពិបាក' },
      { id: 'c2', seconds: 360, title: 'Words to start with', kmTitle: 'ពាក្យសម្រាប់ចាប់ផ្តើម' },
      { id: 'c3', seconds: 780, title: 'If it does not go well', kmTitle: 'ប្រសិនបើវាមិនដំណើរការល្អ' },
      { id: 'c4', seconds: 1140, title: 'Other people who can listen', kmTitle: 'មនុស្សផ្សេងទៀតដែលអាចស្តាប់' },
    ],
  },
  {
    id: 'coping-with-stress-at-school',
    title: 'Coping with stress at school',
    kmTitle: 'ការរៀបចំចិត្តជាមួយភាពតានតឹងនៅសាលា',
    description:
      'In this episode, we talk about common stress factors for students and share simple and practical ways to manage stress, stay balanced, and take care of your mental health.',
    kmDescription:
      'ក្នុងភាគនេះ យើងនិយាយអំពីមូលហេតុទូទៅនៃភាពតានតឹងរបស់សិស្ស និងចែករំលែកវិធីសាមញ្ញ និងអាចអនុវត្តបាន ដើម្បីគ្រប់គ្រងភាពតានតឹង រក្សាតុល្យភាព និងថែរក្សាសុខភាពផ្លូវចិត្តរបស់អ្នក។',
    topic: 'Stress',
    kmTopic: 'ភាពតានតឹង',
    durationSeconds: 734,
    audioUrl: '',
    publishedDate: '2026-10-18',
    guestProfessionalId: '',
    takeaways: [
      {
        en: 'Understand common student stress',
        km: 'យល់ពីភាពតានតឹងទូទៅរបស់សិស្ស',
      },
      {
        en: 'Practical tips to manage stress',
        km: 'គន្លឹះអនុវត្តបានដើម្បីគ្រប់គ្រងភាពតានតឹង',
      },
      {
        en: 'Build healthier study habits',
        km: 'បង្កើតទម្លាប់រៀនដែលល្អជាងមុន',
      },
    ],
    chapters: [
      { id: 'c1', seconds: 0, title: 'What stresses students', kmTitle: 'អ្វីដែលធ្វើឱ្យសិស្សតានតឹង' },
      { id: 'c2', seconds: 210, title: 'Tips for busy weeks', kmTitle: 'គន្លឹះសម្រាប់សប្តាហ៍មមាញឹក' },
      { id: 'c3', seconds: 480, title: 'Healthier study habits', kmTitle: 'ទម្លាប់រៀនដែលល្អជាងមុន' },
    ],
  },
  {
    id: 'building-self-confidence',
    title: 'Building your self confidence',
    kmTitle: 'ការកសាងទំនុកចិត្តលើខ្លួនឯង',
    description:
      'Confidence grows from small steps, not big speeches. We talk about the voice in your head, how to notice what you do well, and one small habit to start this week.',
    kmDescription:
      'ទំនុកចិត្តលូតលាស់ពីជំហានតូចៗ មិនមែនពីសុន្ទរកថាធំៗទេ។ យើងនិយាយអំពីសំឡេងក្នុងក្បាលរបស់អ្នក របៀបកត់សម្គាល់អ្វីដែលអ្នកធ្វើបានល្អ និងទម្លាប់តូចមួយដើម្បីចាប់ផ្តើមសប្តាហ៍នេះ។',
    topic: 'Mental Health',
    kmTopic: 'សុខភាពផ្លូវចិត្ត',
    durationSeconds: 900,
    audioUrl: '',
    publishedDate: '2026-10-17',
    guestProfessionalId: '',
    takeaways: [
      {
        en: 'Notice the voice in your head and answer it kindly',
        km: 'កត់សម្គាល់សំឡេងក្នុងក្បាលរបស់អ្នក ហើយឆ្លើយតបវាដោយក្តីមេត្តា',
      },
      {
        en: 'Write down one thing you did well each day',
        km: 'សរសេរអ្វីមួយដែលអ្នកធ្វើបានល្អរាល់ថ្ងៃ',
      },
      {
        en: 'Start with a goal small enough to finish',
        km: 'ចាប់ផ្តើមជាមួយគោលដៅតូចល្មមអាចបញ្ចប់បាន',
      },
    ],
    chapters: [
      { id: 'c1', seconds: 0, title: 'Where confidence comes from', kmTitle: 'ទំនុកចិត្តមកពីណា' },
      { id: 'c2', seconds: 300, title: 'The voice in your head', kmTitle: 'សំឡេងក្នុងក្បាលរបស់អ្នក' },
      { id: 'c3', seconds: 640, title: 'One small habit', kmTitle: 'ទម្លាប់តូចមួយ' },
    ],
  },
  {
    id: 'understanding-anxiety',
    title: 'Understanding anxiety',
    kmTitle: 'ការយល់ដឹងអំពីការថប់បារម្ភ',
    description:
      'Worry is normal, but sometimes it grows too big. We explain what anxiety feels like, why it happens, and simple ways to ease it when it shows up.',
    kmDescription:
      'ការព្រួយបារម្ភជារឿងធម្មតា ប៉ុន្តែពេលខ្លះវាកើនឡើងខ្លាំងពេក។ យើងពន្យល់ពីអារម្មណ៍នៃការថប់បារម្ភ មូលហេតុដែលវាកើតឡើង និងវិធីសាមញ្ញដើម្បីបន្ធូរបន្ថយនៅពេលវាមកដល់។',
    topic: 'Anxiety',
    kmTopic: 'ការថប់បារម្ភ',
    durationSeconds: 720,
    audioUrl: '',
    publishedDate: '2026-10-16',
    guestProfessionalId: 'sopheap-chan',
    takeaways: [
      {
        en: 'Anxiety is a normal alarm that sometimes rings too loudly',
        km: 'ការថប់បារម្ភគឺជាសំឡេងរោទិ៍ធម្មតាដែលពេលខ្លះរោទិ៍ខ្លាំងពេក',
      },
      {
        en: 'Slow breathing and grounding help the body settle',
        km: 'ការដកដង្ហើមយឺតៗ និងការផ្តោតលើបច្ចុប្បន្នជួយឱ្យរាងកាយស្ងប់',
      },
      {
        en: 'Ask for help when worry stops you from living your day',
        km: 'សូមស្វែងរកជំនួយនៅពេលការព្រួយបារម្ភរារាំងថ្ងៃរបស់អ្នក',
      },
    ],
    chapters: [
      { id: 'c1', seconds: 0, title: 'What anxiety feels like', kmTitle: 'អារម្មណ៍នៃការថប់បារម្ភ' },
      { id: 'c2', seconds: 240, title: 'Why it happens', kmTitle: 'ហេតុអ្វីវាកើតឡើង' },
      { id: 'c3', seconds: 480, title: 'Ways to ease it', kmTitle: 'វិធីបន្ធូរបន្ថយ' },
    ],
  },
  {
    id: 'better-sleep',
    title: 'Better sleep, step by step',
    kmTitle: 'ការគេងឱ្យបានល្អជាងមុន ម្តងមួយជំហាន',
    description:
      'A longer episode for a quiet evening. We walk through how sleep works, what keeps you awake, and a gentle routine you can try for one week.',
    kmDescription:
      'ភាគវែងជាងមុនសម្រាប់ល្ងាចស្ងប់ស្ងាត់។ យើងពន្យល់ពីរបៀបដែលការគេងដំណើរការ អ្វីដែលធ្វើឱ្យអ្នកភ្ញាក់ និងទម្លាប់ស្រាលៗដែលអ្នកអាចសាកល្បងមួយសប្តាហ៍។',
    topic: 'Sleep',
    kmTopic: 'ការគេង',
    durationSeconds: 1800,
    audioUrl: '',
    publishedDate: '2026-10-15',
    guestProfessionalId: '',
    takeaways: [
      {
        en: 'Go to bed and wake up at about the same time each day',
        km: 'ចូលគេង និងភ្ញាក់ពីគេងនៅម៉ោងប្រហាក់ប្រហែលគ្នារាល់ថ្ងៃ',
      },
      {
        en: 'Keep your bed for sleep and rest',
        km: 'ទុកគ្រែសម្រាប់ការគេង និងការសម្រាកប៉ុណ្ណោះ',
      },
    ],
    chapters: [
      { id: 'c1', seconds: 0, title: 'How sleep works', kmTitle: 'ការគេងដំណើរការយ៉ាងដូចម្តេច' },
      { id: 'c2', seconds: 600, title: 'What keeps you awake', kmTitle: 'អ្វីដែលធ្វើឱ្យអ្នកភ្ញាក់' },
      { id: 'c3', seconds: 1260, title: 'A gentle one week routine', kmTitle: 'ទម្លាប់ស្រាលៗមួយសប្តាហ៍' },
    ],
  },
  {
    id: 'mindful-moment',
    title: 'A mindful moment for your day',
    kmTitle: 'ពេលវេលាស្មារតីសម្រាប់ថ្ងៃរបស់អ្នក',
    description:
      'A short, calm episode to pause between classes or work. We guide you through noticing your breath, your body, and the room around you.',
    kmDescription:
      'ភាគខ្លីមួយដ៏ស្ងប់ ដើម្បីផ្អាកសម្រាកចន្លោះម៉ោងរៀន ឬម៉ោងធ្វើការ។ យើងនាំអ្នកកត់សម្គាល់ដង្ហើម រាងកាយ និងបន្ទប់ជុំវិញខ្លួនអ្នក។',
    topic: 'Mental Health',
    kmTopic: 'សុខភាពផ្លូវចិត្ត',
    durationSeconds: 720,
    audioUrl: '',
    publishedDate: '2026-10-14',
    guestProfessionalId: '',
    takeaways: [
      {
        en: 'One minute of slow breathing is enough to begin',
        km: 'ការដកដង្ហើមយឺតៗមួយនាទីគឺគ្រប់គ្រាន់ដើម្បីចាប់ផ្តើម',
      },
      {
        en: 'Name three things you can see, hear and feel',
        km: 'ហៅឈ្មោះអ្វីបីយ៉ាងដែលអ្នកអាចមើលឃើញ ឮ និងមានអារម្មណ៍',
      },
    ],
    chapters: [
      { id: 'c1', seconds: 0, title: 'Arrive and settle', kmTitle: 'មកដល់ និងអង្គុយឱ្យស្ងប់' },
      { id: 'c2', seconds: 180, title: 'Notice your breath', kmTitle: 'កត់សម្គាល់ដង្ហើម' },
      { id: 'c3', seconds: 480, title: 'Return to your day', kmTitle: 'ត្រឡប់ទៅថ្ងៃរបស់អ្នក' },
    ],
  },
];

export function getMindGuidePodcast(id: string) {
  return MINDGUIDE_PODCASTS.find((podcast) => podcast.id === id);
}
