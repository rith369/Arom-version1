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
];

export function getMindGuidePodcast(id: string) {
  return MINDGUIDE_PODCASTS.find((podcast) => podcast.id === id);
}
