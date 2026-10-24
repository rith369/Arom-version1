import { therapists } from '../../../lib/therapists';

// Mirrors professional_profiles.verification_status and profiles.account_status
// so the backend can replace this mock list without changing the UI.
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type AccountStatus = 'active' | 'suspended';

export type ProfessionalCredential = {
  licenseNumber: string;
  issuingBody: string;
  documentName: string;
  submittedAt: string;
};

// Changes to identity or license details wait for admin review before going live.
export type ReviewedField = 'name' | 'kmName' | 'role' | 'kmRole' | 'licenseNumber' | 'issuingBody';

// How they became a professional: their own application, or promoted directly by an admin.
export type ProfessionalSource = 'application' | 'admin';

export type ProfileChange = {
  field: ReviewedField;
  from: string;
  to: string;
};

export type Professional = {
  id: string;
  name: string;
  kmName: string;
  role: string;
  kmRole: string;
  specialties: string[];
  languages: string[];
  experience: string;
  about: string;
  kmAbout: string;
  image: string;
  session: 'Online' | 'In-person' | 'Both';
  verificationStatus: VerificationStatus;
  accountStatus: AccountStatus;
  // Listed and bookable for University of Puthisastra students only.
  // professional_profiles.up_students_only, set by admins only.
  upStudentsOnly?: boolean;
  credential: ProfessionalCredential;
  // Private contact for verification only. Never shown on the public profile.
  phone: string;
  telegram: string;
  pendingChanges: ProfileChange[];
  reviewNote: string;
  source: ProfessionalSource;
  joinedAt: string;
  // The application that holds the license file. Opens through
  // GET /api/admin/applications/<applicationId>/license (short lived link).
  applicationId?: string;
};

const directoryProfessionals: Professional[] = therapists.map((item, index) => ({
  id: item.slug,
  name: item.name,
  kmName: item.kmName ?? '',
  role: item.role,
  kmRole: item.kmRole ?? '',
  specialties: [...item.specialties],
  languages: [...item.languages],
  experience: item.experience,
  about: item.about,
  kmAbout: item.kmAbout ?? '',
  image: item.image,
  session:
    item.sessionOptions.length > 1
      ? 'Both'
      : item.sessionOptions[0] === 'In-person'
        ? 'In-person'
        : 'Online',
  verificationStatus: 'verified',
  accountStatus: 'active',
  credential: {
    licenseNumber: `MOH PSY ${2019 + index} 0${index + 41}`,
    issuingBody: 'Ministry of Health, Cambodia',
    documentName: `license-${item.slug}.pdf`,
    submittedAt: `2026-0${index + 3}-12`,
  },
  phone: `01${index + 1} 555 01${index}`,
  telegram: `01${index + 1} 555 01${index}`,
  pendingChanges:
    item.slug === 'ratanak-pich'
      ? [
          {
            field: 'role',
            from: item.role,
            to: 'Senior Clinical Psychologist',
          },
          {
            field: 'licenseNumber',
            from: `MOH PSY ${2019 + index} 0${index + 41}`,
            to: 'MOH PSY 2026 118',
          },
        ]
      : [],
  reviewNote: '',
  source: 'application',
  joinedAt: `2026-0${index + 3}-15`,
}));

const reviewProfessionals: Professional[] = [
  {
    id: 'vanna-keo',
    name: 'Vanna Keo',
    kmName: 'កែវ វណ្ណា',
    role: 'Licensed Counselor',
    kmRole: 'អ្នកប្រឹក្សាមានអាជ្ញាប័ណ្ណ',
    specialties: ['Anxiety', 'Student stress'],
    languages: ['Khmer', 'English'],
    experience: '4 years',
    about:
      'Supports university students with exam stress, sleep and building calm daily routines.',
    kmAbout:
      'ជួយនិស្សិតសាកលវិទ្យាល័យដោះស្រាយភាពតានតឹងពេលប្រឡង ការគេង និងទម្លាប់ប្រចាំថ្ងៃ។',
    image: '',
    session: 'Online',
    verificationStatus: 'pending',
    accountStatus: 'active',
    credential: {
      licenseNumber: 'MOH CNS 2022 207',
      issuingBody: 'Ministry of Health, Cambodia',
      documentName: 'vanna-keo-license.pdf',
      submittedAt: '2026-10-09',
    },
    phone: '012 345 678',
    telegram: '012 345 678',
    pendingChanges: [],
    reviewNote: '',
    source: 'application',
    joinedAt: '2026-10-09',
  },
  {
    id: 'dara-lim',
    name: 'Dara Lim',
    kmName: 'លឹម ដារ៉ា',
    role: 'Family Therapist',
    kmRole: 'អ្នកព្យាបាលគ្រួសារ',
    specialties: ['Family conflict', 'Grief'],
    languages: ['Khmer'],
    experience: '7 years',
    about:
      'Works with families through loss, conflict and big life changes, in person in Phnom Penh.',
    kmAbout:
      'ធ្វើការជាមួយគ្រួសារដែលកំពុងឆ្លងកាត់ការបាត់បង់ ជម្លោះ និងការផ្លាស់ប្តូរធំៗក្នុងជីវិត។',
    image: '',
    session: 'In-person',
    verificationStatus: 'pending',
    accountStatus: 'active',
    credential: {
      licenseNumber: 'MOH FAM 2019 054',
      issuingBody: 'Ministry of Health, Cambodia',
      documentName: 'dara-lim-license.pdf',
      submittedAt: '2026-10-11',
    },
    phone: '097 888 2041',
    telegram: '@daralim_family',
    pendingChanges: [],
    reviewNote: '',
    source: 'application',
    joinedAt: '2026-10-11',
  },
  {
    id: 'sreyneang-heng',
    name: 'Sreyneang Heng',
    kmName: 'ហេង ស្រីនាង',
    role: 'Psychologist',
    kmRole: 'អ្នកចិត្តសាស្ត្រ',
    specialties: ['Depression', 'Burnout'],
    languages: ['Khmer', 'English'],
    experience: '6 years',
    about: 'Helps working adults recover from burnout and low mood.',
    kmAbout: 'ជួយមនុស្សពេញវ័យដែលធ្វើការ ឱ្យជាសះស្បើយពីភាពអស់កម្លាំង និងអារម្មណ៍ធ្លាក់ចុះ។',
    image: '',
    session: 'Both',
    verificationStatus: 'verified',
    accountStatus: 'suspended',
    credential: {
      licenseNumber: 'MOH PSY 2020 093',
      issuingBody: 'Ministry of Health, Cambodia',
      documentName: 'sreyneang-heng-license.pdf',
      submittedAt: '2026-05-02',
    },
    phone: '010 456 789',
    telegram: '010 456 789',
    pendingChanges: [],
    reviewNote: 'License expired on 30 Sep 2026. Waiting for the renewed copy.',
    source: 'application',
    joinedAt: '2026-05-04',
  },
  {
    id: 'piseth-nhem',
    name: 'Piseth Nhem',
    kmName: 'ញឹម ពិសិដ្ឋ',
    role: 'Life Coach',
    kmRole: 'គ្រូបង្វឹកជីវិត',
    specialties: ['Motivation'],
    languages: ['English'],
    experience: '2 years',
    about: 'Coaching for goals and motivation.',
    kmAbout: '',
    image: '',
    session: 'Online',
    verificationStatus: 'rejected',
    accountStatus: 'active',
    credential: {
      licenseNumber: 'Not provided',
      issuingBody: '',
      documentName: '',
      submittedAt: '2026-09-20',
    },
    phone: '088 765 4321',
    telegram: '',
    pendingChanges: [],
    reviewNote:
      'No clinical license. AROM lists licensed mental health professionals only.',
    source: 'application',
    joinedAt: '2026-09-20',
  },
];

export const initialProfessionals: Professional[] = [
  ...directoryProfessionals,
  ...reviewProfessionals,
];
