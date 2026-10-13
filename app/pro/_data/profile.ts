import { getTherapist, type SessionOption, type Therapist } from '@/lib/therapists';
import type { SessionPrice } from '@/lib/pricing';

// The signed in professional's own profile. Mirrors professional_profiles
// and professional_credentials. Mock until the backend is connected.

export type SessionType = 'online' | 'in_person';

export type ProProfile = {
  slug: string;
  displayName: string;
  kmDisplayName: string;
  title: string;
  kmTitle: string;
  bio: string;
  kmBio: string;
  photoUrl: string;
  specialties: string[];
  languages: string[];
  sessionTypes: SessionType[];
  // Shown to users for information only; nobody pays yet. null = not chosen.
  price: SessionPrice | null;
  yearsExperience: number | null;
  licenseNumber: string;
  issuingBody: string;
};

// Soft gray silhouette used in the preview until a photo is added.
export const PLACEHOLDER_PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#dff3ee"/><circle cx="200" cy="160" r="70" fill="#a9cfc4"/><path d="M70 380c10-90 70-130 130-130s120 40 130 130z" fill="#a9cfc4"/></svg>',
)}`;

// Changing these waits for an admin, the public profile keeps the old value.
export const REVIEWED_FIELDS = [
  'displayName',
  'kmDisplayName',
  'title',
  'kmTitle',
  'licenseNumber',
  'issuingBody',
] as const;

export type ReviewedField = (typeof REVIEWED_FIELDS)[number];

export type PendingChange = {
  field: ReviewedField;
  from: string;
  to: string;
  requestedAt: string;
};

export const SPECIALTY_OPTIONS = [
  'Anxiety',
  'Depression',
  'Stress',
  'Sleep',
  'Relationships',
  'Burnout',
  'Life transitions',
  'Self-confidence',
  'Grief',
  'Trauma',
  'Family',
  'Students',
] as const;

export const LANGUAGE_OPTIONS = ['Khmer', 'English'] as const;

export type ChecklistItem = {
  key: 'photo' | 'bio' | 'kmBio' | 'specialties' | 'languages' | 'sessions' | 'schedule' | 'price';
  done: boolean;
  label: { en: string; km: string };
  href: string;
};

// What a new professional must finish before users can see them.
export function profileChecklist(
  profile: ProProfile,
  options: { hasSchedule: boolean },
): ChecklistItem[] {
  const items: ChecklistItem[] = [
    { key: 'photo', done: Boolean(profile.photoUrl), label: { en: 'Add a clear photo of yourself', km: 'បន្ថែមរូបថតច្បាស់របស់អ្នក' }, href: '/pro/profile#pro-photo' },
    { key: 'bio', done: profile.bio.trim().length >= 80, label: { en: 'Write your bio in English (at least 80 characters)', km: 'សរសេរប្រវត្តិរូបជាភាសាអង់គ្លេស (យ៉ាងហោចណាស់ ៨០ តួអក្សរ)' }, href: '/pro/profile#pro-bio' },
    { key: 'kmBio', done: profile.kmBio.trim().length >= 40, label: { en: 'Write your bio in Khmer', km: 'សរសេរប្រវត្តិរូបជាភាសាខ្មែរ' }, href: '/pro/profile#pro-kmBio' },
    { key: 'specialties', done: profile.specialties.length > 0, label: { en: 'Choose what you help with', km: 'ជ្រើសរើសអ្វីដែលអ្នកជួយ' }, href: '/pro/profile#pro-specialties' },
    { key: 'languages', done: profile.languages.length > 0, label: { en: 'Choose your session languages', km: 'ជ្រើសរើសភាសាពិគ្រោះ' }, href: '/pro/profile#pro-languages' },
    { key: 'sessions', done: profile.sessionTypes.length > 0, label: { en: 'Choose online, in person or both', km: 'ជ្រើសរើសអនឡាញ ជួបផ្ទាល់ ឬទាំងពីរ' }, href: '/pro/profile#pro-sessions' },
    { key: 'schedule', done: options.hasSchedule, label: { en: 'Open times in your schedule', km: 'បើកម៉ោងក្នុងកាលវិភាគរបស់អ្នក' }, href: '/pro/schedule' },
    { key: 'price', done: profile.price !== null, label: { en: 'Choose your price, or Free', km: 'ជ្រើសរើសតម្លៃ ឬឥតគិតថ្លៃ' }, href: '/pro/profile#pro-price' },
  ];

  return items;
}

// Turns the profile into the object the public profile page draws, so the
// preview is the real page users see.
export function toPublicTherapist(profile: ProProfile, base?: Therapist): Therapist {
  const online = profile.sessionTypes.includes('online');
  const inPerson = profile.sessionTypes.includes('in_person');
  const sessionOptions: SessionOption[] =
    online && inPerson ? ['Online', 'In-person', 'Both'] : online ? ['Online'] : inPerson ? ['In-person'] : [];
  const years = profile.yearsExperience;

  return {
    availability: 'Available Now',
    rating: 0,
    reviews: 0,
    ...base,
    slug: profile.slug,
    name: profile.displayName || 'Your name',
    kmName: profile.kmDisplayName || undefined,
    role: profile.title || 'Your title',
    kmRole: profile.kmTitle || undefined,
    about: profile.bio,
    kmAbout: profile.kmBio || undefined,
    image: profile.photoUrl || PLACEHOLDER_PHOTO,
    specialties: profile.specialties,
    languages: profile.languages,
    sessionOptions,
    price: profile.price ?? undefined,
    experience: years === null ? '' : `${years}+ years of experience`,
    kmExperience: years === null ? undefined : `បទពិសោធន៍ ${years}+ ឆ្នាំ`,
  };
}

// Demo: an established professional already visible to users.
const sopheap = getTherapist('sopheap-chan');

export const establishedProfile: ProProfile = {
  slug: 'sopheap-chan',
  displayName: sopheap?.name ?? 'Dr. Sopheap Chan',
  kmDisplayName: sopheap?.kmName ?? '',
  title: sopheap?.role ?? 'Clinical Psychologist',
  kmTitle: sopheap?.kmRole ?? '',
  bio: sopheap?.about ?? '',
  kmBio: sopheap?.kmAbout ?? '',
  photoUrl: sopheap?.image ?? '',
  specialties: [...(sopheap?.specialties ?? [])],
  languages: [...(sopheap?.languages ?? [])],
  sessionTypes: ['online', 'in_person'],
  price: sopheap?.price ?? { kind: 'fixed', amount: 20 },
  yearsExperience: 8,
  licenseNumber: 'MOH PSY 2019 041',
  issuingBody: 'Ministry of Health, Cambodia',
};

// Demo: a professional who was just approved and has not finished yet.
export const newProfile: ProProfile = {
  slug: 'vanna-keo',
  displayName: 'Vanna Keo',
  kmDisplayName: 'កែវ វណ្ណា',
  title: 'Licensed Counselor',
  kmTitle: 'អ្នកប្រឹក្សាមានអាជ្ញាប័ណ្ណ',
  bio: '',
  kmBio: '',
  photoUrl: '',
  specialties: ['Anxiety', 'Students'],
  languages: ['Khmer', 'English'],
  sessionTypes: [],
  price: null,
  yearsExperience: 4,
  licenseNumber: 'MOH CNS 2022 207',
  issuingBody: 'Ministry of Health, Cambodia',
};
