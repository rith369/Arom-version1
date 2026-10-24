export type ClinicService = {
  id: string;
  name: string;
  nameKm: string;
  duration: string;
  durationKm: string;
  fee: string;
  description: string;
  descriptionKm: string;
};

export type ClinicReview = {
  id: string;
  author: string;
  date: string;
  rating: number;
  comment: string;
  commentKm: string;
};

export type Clinic = {
  id: string;
  slug: string;
  name: string;
  nameKm: string;
  category: "clinic" | "hospital" | "counseling";
  rating: number;
  reviewCount: number;
  distance: string;
  distanceKm: string;
  city: string;
  cityKm: string;
  address: string;
  addressKm: string;
  tags: string[];
  tagsKm: string[];
  status: string;
  statusKm: string;
  image: string;
  phone: string;
  phoneDisplay: string;
  googleMapsUrl: string;
  about: string;
  aboutKm: string;
  /** Percentage coordinates on the preview map (x: 0-100, y: 0-100) */
  mapCoords: { x: number; y: number };
  services: ClinicService[];
  reviews: ClinicReview[];
  /** Shown to confirmed University of Puthisastra students only (lib/up-student.ts). */
  upStudentsOnly?: boolean;
};

export const CLINICS_DATA: Clinic[] = [
  {
    id: "riverside-wellness",
    slug: "riverside-mental-wellness-center",
    name: "Riverside mental Wellness Center",
    nameKm: "មជ្ឈមណ្ឌលសុខភាពផ្លូវចិត្ត Riverside",
    category: "clinic",
    rating: 4.8,
    reviewCount: 120,
    distance: "1.2 km",
    distanceKm: "១.២ គ.ម",
    city: "Phnom Penh, Cambodia",
    cityKm: "ភ្នំពេញ, កម្ពុជា",
    address: "#128, Preah Monivong Blvd, PhnomPenh",
    addressKm: "ផ្ទះលេខ ១២៨ មហាវិថីព្រះមុនីវង្ស រាជធានីភ្នំពេញ",
    tags: ["Counseling", "Psychology", "Mental health Support"],
    tagsKm: ["ការប្រឹក្សា (Counseling)", "ចិត្តវិទ្យា (Psychology)", "ការគាំទ្រផ្លូវចិត្ត (Mental Health)"],
    status: "Open Closes 6:00 PM",
    statusKm: "កំពុងបើក បិទនៅម៉ោង 6:00 ល្ងាច",
    image: "/clinics/riverside.jpg",
    phone: "+85523888999",
    phoneDisplay: "+855 23 888 999",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=128+Preah+Monivong+Blvd+Phnom+Penh",
    about: "Riverside mental wellness Center provides professional mental health services including counseling, therapy, and psychological support for individuals of all ages.",
    aboutKm: "មជ្ឈមណ្ឌលសុខភាពផ្លូវចិត្ត Riverside ផ្តល់ជូនសេវាកម្មសុខភាពផ្លូវចិត្តប្រកបដោយវិជ្ជាជីវៈ រួមមានការប្រឹក្សា ការព្យាបាល និងការគាំទ្រផ្នែកចិត្តសាស្រ្តសម្រាប់មនុស្សគ្រប់វ័យ។",
    mapCoords: { x: 58, y: 52 },
    services: [
      {
        id: "counseling-individual",
        name: "Individual Counseling Session",
        nameKm: "ការប្រឹក្សាផ្លូវចិត្តបុគ្គល (Individual Counseling)",
        duration: "50 min",
        durationKm: "៥០ នាទី",
        fee: "$35",
        description: "One-on-one compassionate session tailored to address stress, life transitions, and anxiety.",
        descriptionKm: "ការពិគ្រោះផ្ទាល់ខ្លួនប្រកបដោយក្តីមេត្តា ដើម្បីដោះស្រាយភាពតានតឹង និងការថប់បារម្ភ។",
      },
      {
        id: "psychological-eval",
        name: "Clinical Psychological Evaluation",
        nameKm: "ការវាយតម្លៃផ្នែកចិត្តវិទ្យាគ្លីនិក (Clinical Evaluation)",
        duration: "90 min",
        durationKm: "៩០ នាទី",
        fee: "$65",
        description: "Thorough diagnostic assessment by licensed clinical psychologists with treatment planning.",
        descriptionKm: "ការវាយតម្លៃរោគវិនិច្ឆ័យយ៉ាងម៉ត់ចត់ដោយចិត្តវិទូគ្លីនិកដែលមានអាជ្ញាប័ណ្ណត្រឹមត្រូវ។",
      },
      {
        id: "cbt-therapy",
        name: "Cognitive Behavioral Therapy (CBT)",
        nameKm: "ការព្យាបាលការយល់ដឹង និងអាកប្បកិរិយា (CBT)",
        duration: "60 min",
        durationKm: "៦០ នាទី",
        fee: "$45",
        description: "Structured sessions helping you identify unhelpful thinking patterns and adopt healthier habits.",
        descriptionKm: "វគ្គព្យាបាលដែលមានរចនាសម្ព័ន្ធ ដើម្បីជួយកែប្រែគំរូគំនិត និងបង្កើតទម្លាប់រស់នៅល្អ។",
      },
    ],
    reviews: [
      {
        id: "rev-1",
        author: "Sophea K.",
        date: "2 days ago",
        rating: 5,
        comment: "The environment is peaceful and welcoming. My counselor was attentive and helped me process burnout with genuine kindness.",
        commentKm: "បរិយាកាសស្ងប់ស្ងាត់ និងកក់ក្តៅណាស់។ អ្នកប្រឹក្សាបានស្តាប់ និងជួយខ្ញុំឆ្លងកាត់ភាពតានតឹងដោយក្តីយកចិត្តទុកដាក់។",
      },
      {
        id: "rev-2",
        author: "Dara M.",
        date: "1 week ago",
        rating: 5,
        comment: "Highly recommend the counseling team. Booking was easy, and the location on Monivong is very accessible.",
        commentKm: "សូមណែនាំក្រុមអ្នកប្រឹក្សាដោយស្មោះ។ ទីតាំងនៅលើមហាវិថីមុនីវង្សងាយស្រួលធ្វើដំណើរណាស់។",
      },
      {
        id: "rev-3",
        author: "Chantrea V.",
        date: "3 weeks ago",
        rating: 4,
        comment: "Clean facilities, very respectful staff, and clinical grade confidentiality.",
        commentKm: "កន្លែងស្អាត បុគ្គលិកមានការគោរពខ្ពស់ និងរក្សាការសម្ងាត់បានយ៉ាងល្អ។",
      },
    ],
  },
  {
    id: "harmony-care",
    slug: "harmony-care-hospital",
    name: "Harmony Care Hospital",
    nameKm: "មន្ទីរពេទ្យ Harmony Care",
    category: "hospital",
    rating: 4.9,
    reviewCount: 184,
    distance: "3.5 km",
    distanceKm: "៣.៥ គ.ម",
    city: "Phnom Penh, Cambodia",
    cityKm: "ភ្នំពេញ, កម្ពុជា",
    address: "#45, Russian Federation Blvd, Phnom Penh",
    addressKm: "ផ្ទះលេខ ៤៥ មហាវិថីសហព័ន្ធរុស្ស៊ី រាជធានីភ្នំពេញ",
    tags: ["Counseling", "Psychology", "Mental health Support"],
    tagsKm: ["ការប្រឹក្សា (Counseling)", "ចិត្តវិទ្យា (Psychology)", "ការគាំទ្រផ្លូវចិត្ត (Mental Health)"],
    status: "Open 24 Hours",
    statusKm: "បើកដំណើរការ ២៤ ម៉ោង",
    image: "/clinics/harmony.jpg",
    phone: "+85523999111",
    phoneDisplay: "+855 23 999 111",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=45+Russian+Federation+Blvd+Phnom+Penh",
    about: "Harmony Care Hospital is a premier medical facility providing 24/7 psychiatric care, inpatient wellness recovery, crisis intervention, and specialized outpatient psychological counseling.",
    aboutKm: "មន្ទីរពេទ្យ Harmony Care គឺជាមន្ទីរពេទ្យវេជ្ជសាស្ត្រឈានមុខគេ ដែលផ្តល់ការថែទាំចិត្តសាស្ត្រ ២៤ ម៉ោង ការសម្រាកព្យាបាល ការអន្តរាគមន៍គ្រាអាសន្ន និងការប្រឹក្សាផ្លូវចិត្តកម្រិតខ្ពស់។",
    mapCoords: { x: 34, y: 36 },
    services: [
      {
        id: "crisis-support",
        name: "24/7 Crisis Intervention & Emergency Support",
        nameKm: "អន្តរាគមន៍គ្រាអាសន្ន និងការគាំទ្រ ២៤ ម៉ោង",
        duration: "Immediate",
        durationKm: "ភ្លាមៗ",
        fee: "Covered by insurance",
        description: "Immediate clinical intervention for acute emotional distress, panic, or psychiatric emergencies.",
        descriptionKm: "ការអន្តរាគមន៍ភ្លាមៗសម្រាប់វិបត្តិអារម្មណ៍ធ្ងន់ធ្ងរ ឬស្ថានភាពសង្គ្រោះបន្ទាន់។",
      },
      {
        id: "inpatient-wellness",
        name: "Inpatient Wellness & Psychiatric Care",
        nameKm: "ការសម្រាកព្យាបាលសុខភាពផ្លូវចិត្តក្នុងមន្ទីរពេទ្យ",
        duration: "Multi-day",
        durationKm: "ច្រើនថ្ងៃ",
        fee: "Consultation required",
        description: "Comprehensive residential treatment in private, calming suites with continuous medical supervision.",
        descriptionKm: "ការព្យាបាលស្នាក់នៅក្នុងបន្ទប់ស្ងប់ស្ងាត់ មានការត្រួតពិនិត្យវេជ្ជសាស្ត្រជាប់ជានិច្ច។",
      },
      {
        id: "outpatient-psychiatry",
        name: "Psychiatric Consultation & Medication Review",
        nameKm: "ការពិគ្រោះផ្នែកវិកលចរិត និងការពិនិត្យថ្នាំ",
        duration: "45 min",
        durationKm: "៤៥ នាទី",
        fee: "$50",
        description: "Evaluation and personalized pharmacological support supervised by board certified psychiatrists.",
        descriptionKm: "ការវាយតម្លៃ និងការគាំទ្រឱសថផ្ទាល់ខ្លួនក្រោមការត្រួតពិនិត្យរបស់វិកលចរិតវិទូ។",
      },
    ],
    reviews: [
      {
        id: "rev-h1",
        author: "Bopha T.",
        date: "5 days ago",
        rating: 5,
        comment: "Outstanding medical staff. During an urgent emotional crisis, their team treated my family member with immense dignity and empathy.",
        commentKm: "ក្រុមគ្រូពេទ្យពូកែ និងមានវិជ្ជាជីវៈខ្ពស់។ ក្នុងគ្រាអាសន្ន ពួកគេបានជួយក្រុមគ្រួសារខ្ញុំប្រកបដោយការគោរព និងក្តីមេត្តា។",
      },
      {
        id: "rev-h2",
        author: "Vireak N.",
        date: "2 weeks ago",
        rating: 5,
        comment: "Modern facility, very clean, and top tier psychiatrists in Cambodia.",
        commentKm: "មន្ទីរពេទ្យទំនើប ស្អាត និងមានវេជ្ជបណ្ឌិតវិកលចរិតលំដាប់កំពូលនៅកម្ពុជា។",
      },
    ],
  },
  {
    id: "mind-and-life",
    slug: "mind-and-life-clinic",
    name: "Mind & Life Clinic",
    nameKm: "គ្លីនិក Mind & Life",
    category: "clinic",
    rating: 4.7,
    reviewCount: 96,
    distance: "2.8 km",
    distanceKm: "២.៨ គ.ម",
    city: "Phnom Penh, Cambodia",
    cityKm: "ភ្នំពេញ, កម្ពុជា",
    address: "#202, Norodom Blvd, Phnom Penh",
    addressKm: "ផ្ទះលេខ ២០២ មហាវិថីនរោត្តម រាជធានីភ្នំពេញ",
    tags: ["Counseling", "Psychology", "Mental health Support"],
    tagsKm: ["ការប្រឹក្សា (Counseling)", "ចិត្តវិទ្យា (Psychology)", "ការគាំទ្រផ្លូវចិត្ត (Mental Health)"],
    status: "Open Closes 7:30 PM",
    statusKm: "កំពុងបើក បិទនៅម៉ោង 7:30 យប់",
    image: "/clinics/mind-life.jpg",
    phone: "+85523777555",
    phoneDisplay: "+855 23 777 555",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=202+Norodom+Blvd+Phnom+Penh",
    about: "Mind & Life Clinic provides evidence-based psychotherapy, mindfulness training, youth counseling, and emotional wellness consultations in a confidential and serene setting.",
    aboutKm: "គ្លីនិក Mind & Life ផ្តល់នូវការព្យាបាលចិត្តសាស្ត្រផ្អែកលើភស្តុតាង ការបណ្តុះបណ្តាលសតិ ការប្រឹក្សាយុវវ័យ និងការពិគ្រោះសុខភាពផ្លូវចិត្តក្នុងបរិយាកាសសម្ងាត់ និងស្ងប់ស្ងាត់។",
    mapCoords: { x: 52, y: 72 },
    services: [
      {
        id: "mindfulness-training",
        name: "Mindfulness & Stress Reduction Workshop",
        nameKm: "វគ្គបណ្តុះបណ្តាលសតិ និងកាត់បន្ថយស្ត្រេស",
        duration: "75 min",
        durationKm: "៧៥ នាទី",
        fee: "$30",
        description: "Practical breathing, guided grounding, and somatic techniques for long term emotional balance.",
        descriptionKm: "បច្ចេកទេសដកដង្ហើម ការធ្វើលំហាត់អារម្មណ៍ជាក់ស្តែងសម្រាប់លំនឹងផ្លូវចិត្តយូរអង្វែង។",
      },
      {
        id: "youth-counseling",
        name: "Adolescent & Young Adult Counseling",
        nameKm: "ការប្រឹក្សាសម្រាប់យុវវ័យ និងសិស្សនិស្សិត",
        duration: "50 min",
        durationKm: "៥០ នាទី",
        fee: "$28",
        description: "Safe space for students and young professionals navigating academic pressure and identity.",
        descriptionKm: "កន្លែងប្រកបដោយសុវត្ថិភាពសម្រាប់យុវវ័យក្នុងការដោះស្រាយសម្ពាធការសិក្សា និងការងារ។",
      },
      {
        id: "family-therapy",
        name: "Family & Couples Therapy",
        nameKm: "ការព្យាបាលគ្រួសារ និងគូស្នេហ៍ (Family Therapy)",
        duration: "80 min",
        durationKm: "៨០ នាទី",
        fee: "$55",
        description: "Fostering healthy communication and understanding between partners and family members.",
        descriptionKm: "ការកសាងទំនាក់ទំនងប្រកបដោយសុខភាពល្អ និងការយល់ចិត្តគ្នាក្នុងគ្រួសារ។",
      },
    ],
    reviews: [
      {
        id: "rev-m1",
        author: "Kosal R.",
        date: "4 days ago",
        rating: 5,
        comment: "The mindfulness and counseling sessions brought tremendous clarity to my life. Friendly staff and cozy rooms.",
        commentKm: "វគ្គហ្វឹកហាត់សតិ និងការប្រឹក្សាបានជួយឱ្យចិត្តខ្ញុំស្ងប់ និងភ្លឺស្វាងឡើងវិញ។ បន្ទប់កក់ក្តៅ និងបុគ្គលិកគួរសម។",
      },
      {
        id: "rev-m2",
        author: "Malis P.",
        date: "3 weeks ago",
        rating: 4,
        comment: "Great location on Norodom Boulevard, very punctual appointments and reasonable pricing.",
        commentKm: "ទីតាំងល្អលើមហាវិថីនរោត្តម គោរពម៉ោងណាត់ជួប និងតម្លៃសមរម្យ។",
      },
    ],
  },
  {
    // SAMPLE: replace the address, hours, phone, map link and photo with the
    // real UP clinic details before launch (BACKEND-HANDOFF.md section 33).
    id: "up-student-wellness",
    slug: "up-student-wellness-clinic",
    name: "UP Student Wellness Clinic",
    nameKm: "គ្លីនិកសុខុមាលភាពនិស្សិត UP",
    category: "clinic",
    rating: 0,
    reviewCount: 0,
    distance: "1.0 km",
    distanceKm: "១.០ គ.ម",
    city: "Phnom Penh, Cambodia",
    cityKm: "ភ្នំពេញ, កម្ពុជា",
    address: "University of Puthisastra campus, Phnom Penh",
    addressKm: "បរិវេណសាកលវិទ្យាល័យពុទ្ធិសាស្ត្រ រាជធានីភ្នំពេញ",
    tags: ["Free for UP students", "Counseling", "Student support"],
    tagsKm: ["ឥតគិតថ្លៃសម្រាប់និស្សិត UP", "ការប្រឹក្សា (Counseling)", "ការគាំទ្រនិស្សិត (Student support)"],
    status: "Opening hours coming soon",
    statusKm: "ម៉ោងបើកនឹងប្រកាសឆាប់ៗ",
    image: "/clinics/mind-life.jpg",
    phone: "",
    phoneDisplay: "",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=University+of+Puthisastra+Phnom+Penh",
    about: "Free counseling for University of Puthisastra students. Talk with a counselor about study stress, worry, low mood or anything on your mind, in a private room on campus.",
    aboutKm: "ការប្រឹក្សាឥតគិតថ្លៃសម្រាប់និស្សិតសាកលវិទ្យាល័យពុទ្ធិសាស្ត្រ។ និយាយជាមួយអ្នកប្រឹក្សាអំពីសម្ពាធការសិក្សា ការព្រួយបារម្ភ អារម្មណ៍ធ្លាក់ចុះ ឬអ្វីដែលនៅក្នុងចិត្តរបស់អ្នក ក្នុងបន្ទប់ឯកជននៅក្នុងបរិវេណសាលា។",
    mapCoords: { x: 38, y: 40 },
    services: [
      {
        id: "up-student-counseling",
        name: "Student Counseling Session",
        nameKm: "ការប្រឹក្សាសម្រាប់និស្សិត",
        duration: "50 min",
        durationKm: "៥០ នាទី",
        fee: "Free",
        description: "A private one to one session with a counselor for UP students.",
        descriptionKm: "ការពិភាក្សាឯកជនម្នាក់ទល់ម្នាក់ជាមួយអ្នកប្រឹក្សា សម្រាប់និស្សិត UP។",
      },
    ],
    reviews: [],
    upStudentsOnly: true,
  },
];

/** The clinics this person may see. UP only clinics are for confirmed UP students. */
export function visibleClinics(upStudent: boolean): Clinic[] {
  return upStudent ? CLINICS_DATA : CLINICS_DATA.filter((clinic) => !clinic.upStudentsOnly);
}
