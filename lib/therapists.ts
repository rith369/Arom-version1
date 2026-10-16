export type SessionOption = "Online" | "In-person" | "Both";

export type PodcastChapter = {
  timestamp: string;
  seconds: number;
  title: string;
  kmTitle: string;
};

export type TherapistPodcast = {
  id: string;
  episodeNumber: string;
  kmEpisodeNumber: string;
  title: string;
  kmTitle: string;
  subtitle: string;
  kmSubtitle: string;
  description: string;
  kmDescription: string;
  duration: string;
  durationSeconds: number;
  topic: string;
  kmTopic: string;
  publishedDate: string;
  kmPublishedDate: string;
  quote: string;
  kmQuote: string;
  takeaways: string[];
  kmTakeaways: string[];
  chapters: PodcastChapter[];
};

import type { SessionPrice } from './pricing';
import type { OfficeLocation } from './office';

export type Therapist = {
  slug: string;
  name: string;
  kmName?: string;
  role: string;
  kmRole?: string;
  specialties: string[];
  availability: string;
  kmAvailability?: string;
  image: string;
  imagePosition?: string;
  experience: string;
  kmExperience?: string;
  rating: number;
  reviews: number;
  about: string;
  kmAbout?: string;
  languages: string[];
  sessionOptions: SessionOption[];
  // Where in person sessions happen. Set only when in person is offered.
  office?: OfficeLocation;
  // Shown to users for information only. AROM takes no payments yet.
  price?: SessionPrice;
  podcast?: TherapistPodcast;
};

export const supportAreas = [
  "Anxiety",
  "Depression",
  "Stress",
  "Sleep",
  "Relationships",
  "Burnout",
  "Life transitions",
  "Self-confidence",
  "Other",
] as const;

export const filterLanguages = ["English", "Khmer"] as const;

export type SessionFilter = "Online" | "In-person" | "Both";

export type TherapistFilters = {
  areas: string[];
  session: SessionFilter | null;
  availableNow: boolean;
  languages: string[];
};

export const emptyFilters: TherapistFilters = {
  areas: [],
  session: null,
  availableNow: false,
  languages: [],
};

export function countActiveFilters(filters: TherapistFilters) {
  return (
    filters.areas.length +
    (filters.session ? 1 : 0) +
    (filters.availableNow ? 1 : 0) +
    filters.languages.length
  );
}

const knownAreas: readonly string[] = supportAreas.filter((area) => area !== "Other");

export function matchesFilters(therapist: Therapist, filters: TherapistFilters) {
  if (filters.areas.length > 0) {
    const matchesArea = filters.areas.some((area) =>
      area === "Other"
        ? therapist.specialties.some((specialty) => !knownAreas.includes(specialty))
        : therapist.specialties.includes(area),
    );
    if (!matchesArea) return false;
  }

  if (filters.session) {
    const offersOnline = therapist.sessionOptions.includes("Online");
    const offersInPerson = therapist.sessionOptions.includes("In-person");
    if (filters.session === "Online" && !offersOnline) return false;
    if (filters.session === "In-person" && !offersInPerson) return false;
    if (filters.session === "Both" && !(offersOnline && offersInPerson)) return false;
  }

  if (
    filters.availableNow &&
    therapist.availability !== "Available Now" &&
    therapist.availability !== "Available Today"
  ) {
    return false;
  }

  if (filters.languages.length > 0) {
    const speaksAll = filters.languages.every((language) => therapist.languages.includes(language));
    if (!speaksAll) return false;
  }

  return true;
}

export const therapists: Therapist[] = [
  {
    slug: "sopheap-chan",
    name: "Dr. Sopheap Chan",
    kmName: "វេជ្ជបណ្ឌិត ចាន់ សុភាព",
    role: "Clinical Psychologist",
    kmRole: "អ្នកចិត្តវិទ្យាព្យាបាល (Clinical Psychologist)",
    specialties: ["Depression", "Anxiety", "Stress"],
    availability: "Available Now",
    kmAvailability: "ទំនេរឥឡូវនេះ (Available Now)",
    image: "/therapists/sopheap-chan.jpg",
    imagePosition: "58% center",
    experience: "8+ years of experience",
    kmExperience: "បទពិសោធន៍ ៨+ ឆ្នាំ",
    rating: 4.9,
    reviews: 127,
    about:
      "Dr. Chan has spent over eight years helping clients work through anxiety, depression, and everyday stress using an integrative, client-centered approach.",
    kmAbout:
      "លោកស្រីវេជ្ជបណ្ឌិត សុភាព មានបទពិសោធន៍ជាង ៨ ឆ្នាំ ក្នុងការជួយអតិថិជនដោះស្រាយការថប់បារម្ភ ការបាក់ទឹកចិត្ត និងភាពតានតឹងប្រចាំថ្ងៃ ដោយប្រើវិធីសាស្ត្រផ្តោតលើបុគ្គល និងការយល់ចិត្តគ្នា។",
    languages: ["Khmer", "English"],
    sessionOptions: ["Online", "In-person", "Both"],
    price: { kind: 'fixed', amount: 20 },
    podcast: {
      id: "pod-sopheap-anxiety",
      episodeNumber: "Episode 12",
      kmEpisodeNumber: "ភាគ ១២",
      title: "Demystifying Therapy & Healing High-Functioning Anxiety",
      kmTitle: "ស្វែងយល់ពីការព្យាបាលផ្លូវចិត្ត និងការដោះស្រាយការថប់បារម្ភ",
      subtitle: "What actually happens in session #1, breaking cultural stigmas, and calming an overactive nervous system.",
      kmSubtitle: "អ្វីដែលកើតឡើងក្នុងជំនួបដំបូង ការលុបបំបាត់ការរើសអើង និងការគ្រប់គ្រងប្រព័ន្ធប្រសាទដែលតានតឹង។",
      description:
        "In this candid conversation, Dr. Sopheap Chan breaks down the stigma around therapy in Cambodia, explaining why so many ambitious people struggle with silent anxiety, and sharing a simple 3-minute somatic reset technique anyone can use at home.",
      kmDescription:
        "នៅក្នុងកិច្ចសន្ទនាដ៏ស៊ីជម្រៅនេះ លោកស្រីវេជ្ជបណ្ឌិត ចាន់ សុភាព បានពន្យល់ពីអ្វីដែលកើតឡើងជាក់ស្តែងក្នុងបន្ទប់ពិគ្រោះយោបល់ មូលហេតុដែលមនុស្សពូកែជាច្រើនជួបប្រទះការថប់បារម្ភដោយស្ងប់ស្ងាត់ និងលំហាត់ដកដង្ហើម ៣ នាទីដើម្បីសម្រួលអារម្មណ៍។",
      duration: "14:15",
      durationSeconds: 855,
      topic: "Anxiety & Therapy 101",
      kmTopic: "ការថប់បារម្ភ និងចំណេះដឹងព្យាបាល (Anxiety & Therapy)",
      publishedDate: "March 2026",
      kmPublishedDate: "មីនា ២០២៦",
      quote:
        "Seeking therapy is not an admission of weakness. It is taking intentional ownership of your peace and future.",
      kmQuote:
        "ការស្វែងរកជំនួយផ្លូវចិត្តមិនមែនជាភាពកំសោយនោះទេ ប៉ុន្តែជាការទទួលខុសត្រូវលើក្តីសុខសាន្ត និងអនាគតផ្ទាល់ខ្លួន។",
      takeaways: [
        "Why your very first session is gentle, conversational, and completely non-judgmental.",
        "How to distinguish healthy motivation from debilitating high-functioning anxiety.",
        "Dr. Chan's 5-4-3-2-1 sensory grounding exercise for sudden overwhelm.",
        "How to talk to conservative family members about mental health with compassion.",
      ],
      kmTakeaways: [
        "ហេតុអ្វីជំនួបដំបូងមានភាពទន់ភ្លន់ គ្មានការវិនិច្ឆ័យ និងមានផាសុកភាពខ្ពស់។",
        "របៀបបែងចែករវាងការលើកទឹកចិត្តធម្មតា និងការថប់បារម្ភកម្រិតខ្ពស់ដែលធ្វើឱ្យហត់នឿយ។",
        "លំហាត់ញ្ញាណ ៥-៤-៣-២-១ របស់លោកស្រីវេជ្ជបណ្ឌិតសម្រាប់ពេលតក់ស្លុត ឬភ័យខ្លាច។",
        "វិធីសាស្រ្តនិយាយជាមួយគ្រួសារអំពីសុខភាពផ្លូវចិត្តដោយក្តីមេត្តា និងការយោគយល់។",
      ],
      chapters: [
        { timestamp: "00:00", seconds: 0, title: "Welcome & Dr. Chan's clinical philosophy", kmTitle: "ស្វាគមន៍ និងទស្សនវិស័យព្យាបាលរបស់វេជ្ជបណ្ឌិត" },
        { timestamp: "02:45", seconds: 165, title: "Inside session #1: What actually happens?", kmTitle: "តើមានអ្វីកើតឡើងពិតប្រាកដក្នុងជំនួបដំបូង?" },
        { timestamp: "06:20", seconds: 380, title: "High-functioning anxiety & perfectionism", kmTitle: "ការថប់បារម្ភ និងភាពល្អឥតខ្ចោះហួសហេតុ" },
        { timestamp: "09:40", seconds: 580, title: "Cultural stigmas in Southeast Asia", kmTitle: "ការលុបបំបាត់ការរើសអើងផ្លូវចិត្តក្នុងសង្គម" },
        { timestamp: "12:10", seconds: 730, title: "Guided 3-minute somatic reset", kmTitle: "ការណែនាំលំហាត់សម្រួលអារម្មណ៍ ៣ នាទី" },
      ],
    },
  },
  {
    slug: "ratanak-pich",
    name: "Dr. Ratanak Pich",
    kmName: "វេជ្ជបណ្ឌិត ពេជ្រ រតនៈ",
    role: "Counselor",
    kmRole: "អ្នកប្រឹក្សាផ្លូវចិត្ត (Counselor)",
    specialties: ["Anxiety", "Relationships", "Life transitions"],
    availability: "Available Today",
    kmAvailability: "ទំនេរថ្ងៃនេះ (Available Today)",
    image: "/therapists/ratanak-pich.jpg",
    imagePosition: "50% center",
    experience: "6+ years of experience",
    kmExperience: "បទពិសោធន៍ ៦+ ឆ្នាំ",
    rating: 4.8,
    reviews: 94,
    about:
      "Dr. Pich supports individuals and couples navigating anxiety, communication challenges, and major life transitions with practical, compassionate counseling.",
    kmAbout:
      "លោកវេជ្ជបណ្ឌិត រតនៈ ផ្តល់ការប្រឹក្សាគាំទ្រដល់បុគ្គល និងគូស្នេហ៍ ក្នុងការដោះស្រាយបញ្ហាថប់បារម្ភ ឧបសគ្គនៃការប្រាស្រ័យទាក់ទង និងការផ្លាស់ប្តូរជីវិតសំខាន់ៗ ប្រកបដោយការអនុវត្តជាក់ស្តែង និងក្តីមេត្តា។",
    languages: ["Khmer", "English", "French"],
    sessionOptions: ["Online", "In-person", "Both"],
    price: { kind: 'range', min: 30, max: 50 },
    podcast: {
      id: "pod-ratanak-relationships",
      episodeNumber: "Episode 08",
      kmEpisodeNumber: "ភាគ ០៨",
      title: "Navigating Relationship Strains & Life Transitions",
      kmTitle: "ការដោះស្រាយទំនាស់ក្នុងទំនាក់ទំនង និងការផ្លាស់ប្តូរជីវិត",
      subtitle: "Why couples experience disconnect, how attachment styles dictate reactions, and finding your ground in life changes.",
      kmSubtitle: "មូលហេតុដែលដៃគូបាត់បង់ការយល់ចិត្តគ្នា ឥទ្ធិពលនៃទម្លាប់ពីកុមារភាព និងការស្វែងរកលំនឹងក្នុងជីវិត។",
      description:
        "Counselor Dr. Ratanak Pich explores why modern couples struggle with emotional distance, how childhood attachments influence adult conflict, and how to express vulnerability without defensiveness.",
      kmDescription:
        "អ្នកប្រឹក្សាផ្លូវចិត្ត លោកវេជ្ជបណ្ឌិត ពេជ្រ រតនៈ ស្វែងយល់ពីមូលហេតុដែលគូស្នេហ៍បច្ចុប្បន្នជួបបញ្ហាបែកបាក់ទំនាក់ទំនង ឥទ្ធិពលនៃទម្លាប់ពីអតីតកាល និងវិធីបង្ហាញអារម្មណ៍ពិតដោយមិនបង្កជម្លោះ។",
      duration: "16:40",
      durationSeconds: 1000,
      topic: "Relationships & Life Transitions",
      kmTopic: "ទំនាក់ទំនង និងការផ្លាស់ប្តូរជីវិត (Relationships)",
      publishedDate: "February 2026",
      kmPublishedDate: "កុម្ភៈ ២០២៦",
      quote:
        "In conflict, the goal isn't to win the argument; it is to understand each other's emotional safety needs.",
      kmQuote:
        "ក្នុងជម្លោះ គោលដៅមិនមែនដើម្បីឈ្នះចាញ់ទេ ប៉ុន្តែដើម្បីយល់ពីតម្រូវការសុវត្ថិភាពផ្លូវចិត្តរបស់គ្នាទៅវិញទៅមក។",
      takeaways: [
        "The 4 common miscommunication loops in couples and how to interrupt them.",
        "Understanding whether you lean anxious, avoidant, or secure in stressful moments.",
        "Managing fear and emotional paralysis when facing major life transitions.",
        "A 5-minute daily curiosity dialogue to rebuild emotional intimacy.",
      ],
      kmTakeaways: [
        "បញ្ហាខុសឆ្គងទាំង ៤ ក្នុងការទំនាក់ទំនងរវាងដៃគូ និងរបៀបកែប្រែ។",
        "ការយល់ដឹងពីទម្លាប់ផ្លូវចិត្តរបស់អ្នកពេលមានការប៉ះទង្គិចពាក្យសម្តី។",
        "ការគ្រប់គ្រងការភ័យខ្លាចពេលប្តូរការងារ ទីកន្លែង ឬស្ថានភាពគ្រួសារ។",
        "ទម្លាប់សន្ទនារយៈពេល ៥ នាទីរៀងរាល់ថ្ងៃដើម្បីបង្កើនភាពជិតស្និទ្ធឡើងវិញ។",
      ],
      chapters: [
        { timestamp: "00:00", seconds: 0, title: "Meet Dr. Ratanak & counseling approach", kmTitle: "ស្គាល់លោកវេជ្ជបណ្ឌិត រតនៈ និងរបៀបប្រឹក្សា" },
        { timestamp: "03:15", seconds: 195, title: "The hidden roots of partner frustration", kmTitle: "ឬសគល់ពិតប្រាកដនៃភាពតានតឹងក្នុងគូស្នេហ៍" },
        { timestamp: "07:30", seconds: 450, title: "De-escalating heated arguments gently", kmTitle: "វិធីសម្រាលកម្តៅពេលមានជម្លោះតឹងតែង" },
        { timestamp: "11:15", seconds: 675, title: "Embracing unexpected life transitions", kmTitle: "ការទទួលយក និងសម្របខ្លួននឹងការផ្លាស់ប្តូរ" },
        { timestamp: "14:20", seconds: 860, title: "Daily check-in ritual for clarity", kmTitle: "ទម្លាប់សួរនាំចិត្តប្រចាំថ្ងៃ" },
      ],
    },
  },
  {
    slug: "malika-sok",
    name: "Dr. Malika Sok",
    kmName: "វេជ្ជបណ្ឌិត សុក ម៉ាលីកា",
    role: "Psychiatrist",
    kmRole: "វេជ្ជបណ្ឌិតវិកលចរិត (Psychiatrist)",
    specialties: ["Sleep", "Burnout", "Stress", "Self-confidence"],
    availability: "Available Tomorrow",
    kmAvailability: "ទំនេរថ្ងៃស្អែក (Available Tomorrow)",
    image: "/therapists/malika-sok.jpg",
    imagePosition: "50% center",
    experience: "9+ years of experience",
    kmExperience: "បទពិសោធន៍ ៩+ ឆ្នាំ",
    rating: 4.9,
    reviews: 108,
    about:
      "Dr. Sok works with adults experiencing sleep difficulties, burnout, and chronic stress, combining careful assessment with clear, collaborative treatment plans.",
    kmAbout:
      "លោកស្រីវេជ្ជបណ្ឌិត ម៉ាលីកា ធ្វើការជាមួយមនុស្សពេញវ័យដែលជួបប្រទះការពិបាកក្នុងដំណេក ភាពហត់នឿយ (Burnout) និងភាពតានតឹងរ៉ាំរ៉ៃ ដោយរួមបញ្ចូលការវាយតម្លៃយ៉ាងម៉ត់ចត់ ជាមួយនឹងផែនការព្យាបាលច្បាស់លាស់ និងសហការគ្នា។",
    languages: ["Khmer", "English"],
    sessionOptions: ["Online", "In-person"],
    price: { kind: 'free' },
    podcast: {
      id: "pod-malika-sleep-burnout",
      episodeNumber: "Episode 15",
      kmEpisodeNumber: "ភាគ ១៥",
      title: "The Science of Restful Sleep & Recovering from Burnout",
      kmTitle: "វិទ្យាសាស្ត្រនៃដំណេកលក់ស្រួល និងការស្តារថាមពលពីភាពហត់នឿយ",
      subtitle: "Resetting your nervous system before bed, distinguishing burnout from depression, and evidence-based mental rest.",
      kmSubtitle: "ការរំងាប់អារម្មណ៍មុនចូលគេង ភាពខុសគ្នារវាងការហត់នឿយនិងជំងឺបាក់ទឹកចិត្ត និងវិធីសម្រាកបែបវិទ្យាសាស្ត្រ។",
      description:
        "Psychiatrist Dr. Malika Sok unpacks how modern digital overstimulation destroys circadian rhythms, why racing thoughts strike the second we lie down, and holistic medical approaches to deep restoration before considering prescription aids.",
      kmDescription:
        "លោកស្រីវេជ្ជបណ្ឌិត សុក ម៉ាលីកា បានពន្យល់ពីរបៀបដែលបច្ចេកវិទ្យានិងភាពតានតឹងបំផ្លាញដំណេក ហេតុអ្វីខួរក្បាលគិតច្រើនពេលចូលគេង និងវិធីសាស្ត្រស្តារថាមពលទាំងផ្លូវកាយនិងផ្លូវចិត្តមុនពេលប្រើប្រាស់ថ្នាំ។",
      duration: "18:25",
      durationSeconds: 1105,
      topic: "Sleep & Burnout Recovery",
      kmTopic: "ដំណេក និងការស្តារភាពហត់នឿយ (Sleep & Burnout Recovery)",
      publishedDate: "March 2026",
      kmPublishedDate: "មីនា ២០២៦",
      quote:
        "Rest is not laziness. When your mind is properly restored, you regain emotional clarity and joy.",
      kmQuote:
        "ការសម្រាកមិនមែនជាភាពខ្ជិលនោះទេ។ នៅពេលចិត្តបានសម្រាកគ្រប់គ្រាន់ អ្នកនឹងទទួលបានភាពស្រស់ថ្លា និងក្តីរីករាយឡើងវិញ។",
      takeaways: [
        "The biological loop between cortisol, screen blue light, and disrupted sleep.",
        "Early warning signs that workplace fatigue has turned into clinical burnout.",
        "Dr. Sok's 'Brain Dump & Dim Down' 30-minute evening transition.",
        "When to consider medical psychiatric support vs cognitive behavioral therapy.",
      ],
      kmTakeaways: [
        "ទំនាក់ទំនងរវាងអ័រម៉ូនតានតឹង ពន្លឺទូរស័ព្ទ និងការពិបាកក្នុងដំណេក។",
        "សញ្ញាព្រមានដំបូងដែលបង្ហាញថាភាពហត់នឿយបានក្លាយជាភាពតានតឹងធ្ងន់ធ្ងរ (Burnout)។",
        "ទម្លាប់រំសាយគំនិត ៣០ នាទីមុនចូលគេងរបស់លោកស្រីវេជ្ជបណ្ឌិត។",
        "ពេលណាដែលគួរស្វែងរកការព្យាបាលវេជ្ជសាស្ត្រ ឬការប្រឹក្សាផ្លូវចិត្ត។",
      ],
      chapters: [
        { timestamp: "00:00", seconds: 0, title: "Introduction to psychiatric wellness", kmTitle: "សេចក្តីផ្តើមអំពីសុខុមាលភាពផ្លូវចិត្ត" },
        { timestamp: "03:40", seconds: 220, title: "The anatomy of insomnia & racing thoughts", kmTitle: "មូលហេតុនៃការពិបាកក្នុងដំណេក និងការគិតច្រើន" },
        { timestamp: "08:15", seconds: 495, title: "Burnout vs clinical depression", kmTitle: "ភាពខុសគ្នារវាងភាពហត់នឿយ (Burnout) និងការបាក់ទឹកចិត្ត" },
        { timestamp: "12:50", seconds: 770, title: "Evening wind-down & environmental cues", kmTitle: "ការរៀបចំបរិយាកាស និងទម្លាប់ពេលយប់" },
        { timestamp: "16:10", seconds: 970, title: "Closing thoughts on compassionate rest", kmTitle: "ការសន្និដ្ឋានអំពីការសម្រាកប្រកបដោយក្តីស្រឡាញ់" },
      ],
    },
  },
];

export function getTherapist(slug: string) {
  return therapists.find((therapist) => therapist.slug === slug);
}

export function getSpecialtyLabel(specialty: string, km: boolean): string {
  if (!km) return specialty;
  switch (specialty) {
    case "Anxiety":
      return "ការថប់បារម្ភ (Anxiety)";
    case "Depression":
      return "ការបាក់ទឹកចិត្ត (Depression)";
    case "Stress":
      return "ភាពតានតឹង (Stress)";
    case "Sleep":
      return "ដំណេក (Sleep)";
    case "Relationships":
      return "ទំនាក់ទំនង (Relationships)";
    case "Burnout":
      return "ភាពហត់នឿយ (Burnout)";
    case "Life transitions":
      return "ការផ្លាស់ប្តូរជីវិត (Life Transitions)";
    case "Self-confidence":
      return "ទំនុកចិត្តលើខ្លួនឯង (Self-Confidence)";
    case "Other":
      return "ផ្សេងទៀត (Other)";
    default:
      return specialty;
  }
}

export function getSessionOptionLabel(option: SessionOption, km: boolean): string {
  if (!km) return option;
  switch (option) {
    case "Online":
      return "តាមអនឡាញ (Online)";
    case "In-person":
      return "ជួបផ្ទាល់ (In-Person)";
    case "Both":
      return "ទាំងពីរ (Both)";
    default:
      return option;
  }
}

export function getAvailabilityLabel(availability: string, km: boolean): string {
  if (!km) return availability;
  switch (availability) {
    case "Available Now":
      return "ទំនេរឥឡូវនេះ (Available Now)";
    case "Available Today":
      return "ទំនេរថ្ងៃនេះ (Available Today)";
    case "Available Tomorrow":
      return "ទំនេរថ្ងៃស្អែក (Available Tomorrow)";
    case "Open times available":
      return "មានម៉ោងទំនេរ (Open times available)";
    case "No open times":
      return "មិនមានម៉ោងទំនេរ (No open times)";
    default:
      return availability;
  }
}

export function getLanguageLabel(lang: string, km: boolean): string {
  if (!km) return lang;
  switch (lang) {
    case "English":
      return "ភាសាអង់គ្លេស (English)";
    case "Khmer":
      return "ភាសាខ្មែរ (Khmer)";
    case "French":
      return "ភាសាបារាំង (French)";
    default:
      return lang;
  }
}

export function getTherapistName(therapist: Therapist, km: boolean): string {
  return km && therapist.kmName ? therapist.kmName : therapist.name;
}

export function getTherapistRole(therapist: Therapist, km: boolean): string {
  return km && therapist.kmRole ? therapist.kmRole : therapist.role;
}

export function getTherapistExperience(therapist: Therapist, km: boolean): string {
  return km && therapist.kmExperience ? therapist.kmExperience : therapist.experience;
}

export function getTherapistAbout(therapist: Therapist, km: boolean): string {
  return km && therapist.kmAbout ? therapist.kmAbout : therapist.about;
}
