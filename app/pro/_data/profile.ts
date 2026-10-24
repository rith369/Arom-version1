import { type SessionOption, type Therapist } from '@/lib/therapists';
import type { SessionPrice } from '@/lib/pricing';
import { hasOffice, type OfficeLocation } from '@/lib/office';

// The signed in professional's own profile. Mirrors professional_profiles
// and professional_credentials (loaded by /api/pro/me).

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
  // Where in person sessions happen. Required to offer in person; public, saves at once.
  office: OfficeLocation;
  // Shown to users for information only; nobody pays yet. null = not chosen.
  price: SessionPrice | null;
  yearsExperience: number | null;
  // Shown on the clinic's Therapists tab so students can choose a preference.
  gender: ProGender | null;
  licenseNumber: string;
  issuingBody: string;
  // Set by an admin when they work at a clinic (section 34). The clinic books
  // their sessions, so they need no schedule or price and are not on the
  // Professional page.
  clinic: { slug: string; name: string; kmName: string } | null;
};

export type ProGender = 'female' | 'male' | 'prefer_not_say';

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
  // A clinic therapist shows in the clinic once they have a photo and an
  // English bio (clinic_therapists()). The clinic books, so no schedule or price.
  const clinicKeys: ChecklistItem['key'][] = ['photo', 'bio'];
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

  return profile.clinic ? items.filter((item) => clinicKeys.includes(item.key)) : items;
}

// Turns the profile into the object the public profile page draws, so the
// preview is the real page users see.
export function toPublicTherapist(profile: ProProfile, base?: Therapist): Therapist {
  const online = profile.sessionTypes.includes('online');
  // In person is offered only with an address, the same as the public profile.
  const inPerson = profile.sessionTypes.includes('in_person') && hasOffice(profile.office);
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
    office: inPerson ? profile.office : undefined,
    price: profile.price ?? undefined,
    experience: years === null ? '' : `${years}+ years of experience`,
    kmExperience: years === null ? undefined : `បទពិសោធន៍ ${years}+ ឆ្នាំ`,
  };
}
