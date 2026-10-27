export type ClinicService = {
  id: string;
  name: string;
  nameKm: string;
  /** "" when not known: the page hides it. */
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
  city: string;
  cityKm: string;
  address: string;
  addressKm: string;
  tags: string[];
  tagsKm: string[];
  status: string;
  statusKm: string;
  /** Photo path, or "" when we have no real photo (the page shows an icon). */
  image: string;
  /** CSS object-position for a tall photo, so the crop keeps the sign or building (e.g. "50% 15%"). */
  imagePosition?: string;
  /** Credit for an openly licensed photo (shown under it, the license asks for it). */
  imageCredit?: { text: string; url: string };
  phone: string;
  phoneDisplay: string;
  googleMapsUrl: string;
  about: string;
  aboutKm: string;
  /** Where the clinic is, for the map and the distance. */
  lat: number;
  lng: number;
  services: ClinicService[];
  reviews: ClinicReview[];
  /** Shown to confirmed University of Puthisastra students and staff only (lib/up-student.ts). */
  upStudentsOnly?: boolean;
  /**
   * A real place AROM is not connected to: people call it to book. No
   * ratings, reviews or booking in AROM.
   */
  isListed?: boolean;
  /** Where the details come from and when they were checked (team only). */
  source?: string;
  checkedOn?: string;
};

/** A Google Maps search, so Directions find the place even when our pin is only on the street. */
function mapsSearch(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const PHNOM_PENH = { city: "Phnom Penh, Cambodia", cityKm: "ភ្នំពេញ, កម្ពុជា" };
const NO_REVIEWS = { rating: 0, reviewCount: 0, reviews: [] };
const CALL_TO_ASK = { status: "Call to ask for opening times", statusKm: "សូមទូរស័ព្ទសួរម៉ោងបើក" };
const EMERGENCY_24H = { status: "Emergency open 24 hours", statusKm: "ផ្នែកសង្គ្រោះបន្ទាន់ បើក ២៤ ម៉ោង" };

/** A service with no fee or length we could confirm. */
function service(id: string, name: string, nameKm: string, description: string, descriptionKm: string): ClinicService {
  return { id, name, nameKm, duration: "", durationKm: "", fee: "", description, descriptionKm };
}

// Real places in Phnom Penh that AROM is not connected to yet, shown with a
// "Call to book" label. Real AROM clinics come from the database (GET
// /api/clinics, section 32). Pins marked "street" sit on the right street but
// not on the building; Directions search Google Maps by name and address.
export const LISTED_CLINICS: Clinic[] = [
  {
    id: "tpo-cambodia",
    slug: "tpo-cambodia",
    name: "TPO Cambodia Treatment Center",
    nameKm: "មជ្ឈមណ្ឌលព្យាបាល អង្គការ TPO កម្ពុជា",
    category: "clinic",
    ...NO_REVIEWS,
    ...PHNOM_PENH,
    address: "#2 & 4, Oknha Vaing Road (Street 1952), Phnom Penh Thmey, Sen Sok, Phnom Penh",
    addressKm: "ផ្ទះលេខ ២ និង ៤ ផ្លូវឧកញ៉ាវ៉ាំង (ផ្លូវ ១៩៥២) សង្កាត់ភ្នំពេញថ្មី ខណ្ឌសែនសុខ រាជធានីភ្នំពេញ",
    tags: ["Counseling", "Psychiatry", "Trauma care"],
    tagsKm: ["ការប្រឹក្សា (Counseling)", "វិកលចរិតវិទ្យា (Psychiatry)", "ការព្យាបាលរបួសផ្លូវចិត្ត (Trauma)"],
    status: "Every day, 8:00 AM to 12:00 PM and 1:00 PM to 4:00 PM",
    statusKm: "រៀងរាល់ថ្ងៃ ម៉ោង ៨:០០ ព្រឹក ដល់ ១២:០០ ថ្ងៃត្រង់ និង ១:០០ ដល់ ៤:០០ រសៀល",
    // Sent by Rith, 27 Oct 2026.
    image: "/clinics/tpo-cambodia.jpg",
    imagePosition: "50% 4%",
    phone: "+85516222597",
    phoneDisplay: "016 222 597",
    googleMapsUrl: mapsSearch("TPO Cambodia, Oknha Vaing Road, Sen Sok, Phnom Penh"),
    about:
      "TPO (Transcultural Psychosocial Organization) is a Cambodian mental health organization. Its Treatment Center in Phnom Penh offers counseling and psychiatric care in Khmer. You can also call 095 777 004.",
    aboutKm:
      "TPO (អង្គការសង្គមចិត្តសាស្ត្រឆ្លងវប្បធម៌) គឺជាអង្គការសុខភាពផ្លូវចិត្តកម្ពុជា។ មជ្ឈមណ្ឌលព្យាបាលរបស់ TPO នៅភ្នំពេញ ផ្តល់ការប្រឹក្សា និងការព្យាបាលផ្នែកវិកលចរិតជាភាសាខ្មែរ។ អ្នកក៏អាចហៅលេខ ០៩៥ ៧៧៧ ០០៤ ផងដែរ។",
    // street
    lat: 11.583244,
    lng: 104.880269,
    isListed: true,
    source: "tpocambodia.org contact page; UK government list of doctors in Cambodia (Jan 2026)",
    checkedOn: "2026-10-27",
    services: [
      service(
        "tpo-counseling",
        "Counseling",
        "ការប្រឹក្សា (Counseling)",
        "Talk with a counselor or psychologist about stress, worry, low mood or trauma.",
        "និយាយជាមួយអ្នកប្រឹក្សា ឬចិត្តវិទូ អំពីភាពតានតឹង ការព្រួយបារម្ភ អារម្មណ៍ធ្លាក់ចុះ ឬរបួសផ្លូវចិត្ត។",
      ),
      service(
        "tpo-psychiatry",
        "Psychiatric care",
        "ការព្យាបាលផ្នែកវិកលចរិត (Psychiatry)",
        "See a psychiatrist for assessment and, when needed, medicine.",
        "ជួបវិកលចរិតវិទូ ដើម្បីពិនិត្យ និងទទួលថ្នាំនៅពេលចាំបាច់។",
      ),
    ],
  },
  {
    id: "khmer-soviet-friendship-hospital",
    slug: "khmer-soviet-friendship-hospital",
    name: "Khmer Soviet Friendship Hospital, Mental Health Department",
    nameKm: "មន្ទីរពេទ្យមិត្តភាពខ្មែរ សូវៀត ផ្នែកសុខភាពផ្លូវចិត្ត",
    category: "hospital",
    ...NO_REVIEWS,
    ...PHNOM_PENH,
    address: "Street 271, Tumnub Teuk, Phnom Penh",
    addressKm: "ផ្លូវ ២៧១ សង្កាត់ទំនប់ទឹក រាជធានីភ្នំពេញ",
    tags: ["Public hospital", "Psychiatry"],
    tagsKm: ["មន្ទីរពេទ្យរដ្ឋ (Public hospital)", "វិកលចរិតវិទ្យា (Psychiatry)"],
    ...CALL_TO_ASK,
    image: "/clinics/khmer-soviet-friendship-hospital.jpg",
    imageCredit: {
      text: "Photo: Kiensvay, CC BY-SA 3.0, Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Khmer%E2%80%93Soviet_Friendship_Hospital_Dec_2022.jpg",
    },
    phone: "+85523424373",
    phoneDisplay: "023 424 373",
    googleMapsUrl: mapsSearch("Khmer Soviet Friendship Hospital, Street 271, Phnom Penh"),
    about:
      "A large public hospital with one of the main psychiatry departments in Cambodia. Psychiatrists see outpatients for mental health and substance use, and the hospital has a few beds for people who need to stay.",
    aboutKm:
      "មន្ទីរពេទ្យរដ្ឋធំមួយ ដែលមានផ្នែកវិកលចរិតសំខាន់មួយនៅកម្ពុជា។ វិកលចរិតវិទូពិនិត្យអ្នកជំងឺក្រៅ អំពីសុខភាពផ្លូវចិត្ត និងការប្រើប្រាស់គ្រឿងញៀន ហើយមន្ទីរពេទ្យមានគ្រែមួយចំនួនសម្រាប់អ្នកដែលត្រូវសម្រាកព្យាបាល។",
    lat: 11.543656,
    lng: 104.904738,
    isListed: true,
    source: "UK government list of doctors in Cambodia (Jan 2026); OpenStreetMap",
    checkedOn: "2026-10-27",
    services: [
      service(
        "ksfh-outpatient",
        "Psychiatric outpatient care",
        "ការពិនិត្យជំងឺក្រៅផ្នែកវិកលចរិត (Outpatient)",
        "See a psychiatrist at a public hospital without staying overnight.",
        "ជួបវិកលចរិតវិទូនៅមន្ទីរពេទ្យរដ្ឋ ដោយមិនចាំបាច់ស្នាក់នៅ។",
      ),
      service(
        "ksfh-inpatient",
        "Inpatient care",
        "ការសម្រាកព្យាបាលក្នុងមន្ទីរពេទ្យ (Inpatient)",
        "A few beds for people who need closer care for a short time.",
        "គ្រែមួយចំនួនសម្រាប់អ្នកដែលត្រូវការការថែទាំជិតស្និទ្ធក្នុងរយៈពេលខ្លី។",
      ),
    ],
  },
  {
    id: "sunrise-mental-clinic",
    slug: "sunrise-mental-clinic",
    name: "Sunrise Mental Clinic",
    nameKm: "គ្លីនិកសុខភាពផ្លូវចិត្ត Sunrise",
    category: "clinic",
    ...NO_REVIEWS,
    ...PHNOM_PENH,
    address: "#112, Street 432, Toul Tum Poung II, Phnom Penh (west of the Chinese Embassy)",
    addressKm: "ផ្ទះលេខ ១១២ ផ្លូវ ៤៣២ សង្កាត់ទួលទំពូងទី២ រាជធានីភ្នំពេញ (ខាងលិចស្ថានទូតចិន)",
    tags: ["Psychiatry", "Counseling", "Private"],
    tagsKm: ["វិកលចរិតវិទ្យា (Psychiatry)", "ការប្រឹក្សា (Counseling)", "ឯកជន (Private)"],
    status: "Every day, 8:00 AM to 8:00 PM",
    statusKm: "រៀងរាល់ថ្ងៃ ម៉ោង ៨:០០ ព្រឹក ដល់ ៨:០០ យប់",
    image: "",
    phone: "+85599545565",
    phoneDisplay: "099 545 565",
    googleMapsUrl: mapsSearch("Sunrise Mental Clinic, Street 432, Phnom Penh"),
    about:
      "A private mental health clinic near Toul Tum Poung market. It offers mental health assessment and treatment, counseling and psychotherapy, and psychological testing.",
    aboutKm:
      "គ្លីនិកសុខភាពផ្លូវចិត្តឯកជន នៅក្បែរផ្សារទួលទំពូង។ គ្លីនិកផ្តល់ការវាយតម្លៃ និងការព្យាបាលសុខភាពផ្លូវចិត្ត ការប្រឹក្សា និងការព្យាបាលដោយការនិយាយ (Psychotherapy) និងការធ្វើតេស្តផ្លូវចិត្ត។",
    // street
    lat: 11.541572,
    lng: 104.913143,
    isListed: true,
    source: "sunriseclinic.com.kh (hours, services); UK government list of doctors in Cambodia (Jan 2026)",
    checkedOn: "2026-10-27",
    services: [
      service(
        "sunrise-assessment",
        "Mental health assessment and treatment",
        "ការវាយតម្លៃ និងការព្យាបាលសុខភាពផ្លូវចិត្ត",
        "A doctor checks how you are doing and plans treatment with you.",
        "វេជ្ជបណ្ឌិតពិនិត្យស្ថានភាពរបស់អ្នក ហើយរៀបចំផែនការព្យាបាលជាមួយអ្នក។",
      ),
      service(
        "sunrise-therapy",
        "Counseling and psychotherapy",
        "ការប្រឹក្សា និងការព្យាបាលដោយការនិយាយ (Psychotherapy)",
        "Regular sessions to talk through what you are going through.",
        "វគ្គជាប្រចាំ ដើម្បីនិយាយអំពីអ្វីដែលអ្នកកំពុងឆ្លងកាត់។",
      ),
      service(
        "sunrise-testing",
        "Psychological testing",
        "ការធ្វើតេស្តផ្លូវចិត្ត (Psychological testing)",
        "Tests that help understand your mood, thinking and needs.",
        "តេស្តដែលជួយឱ្យយល់ពីអារម្មណ៍ ការគិត និងតម្រូវការរបស់អ្នក។",
      ),
    ],
  },
  {
    id: "the-bamboo-centre",
    slug: "the-bamboo-centre",
    name: "The Bamboo Centre",
    nameKm: "មជ្ឈមណ្ឌលប្រឹក្សា The Bamboo Centre",
    category: "clinic",
    ...NO_REVIEWS,
    ...PHNOM_PENH,
    address: "#30B, Street 21, Tonle Bassac, Phnom Penh (near Aeon Mall 1)",
    addressKm: "ផ្ទះលេខ ៣០B ផ្លូវ ២១ សង្កាត់ទន្លេបាសាក់ រាជធានីភ្នំពេញ (ក្បែរផ្សារទំនើបអ៊ីអន ១)",
    tags: ["Counseling", "Couples and families", "English and Khmer"],
    tagsKm: ["ការប្រឹក្សា (Counseling)", "គូស្វាមីភរិយា និងគ្រួសារ", "ភាសាអង់គ្លេស និងខ្មែរ"],
    ...CALL_TO_ASK,
    // Sent by Rith, 27 Oct 2026.
    image: "/clinics/the-bamboo-centre.jpg",
    phone: "+85512208318",
    phoneDisplay: "012 208 318",
    googleMapsUrl: mapsSearch("The Bamboo Centre, Street 21, Tonle Bassac, Phnom Penh"),
    about:
      "A counseling center for individuals, couples, families and teenagers. Sessions are in English or Khmer, in person or online.",
    aboutKm:
      "មជ្ឈមណ្ឌលប្រឹក្សាសម្រាប់បុគ្គល គូស្វាមីភរិយា គ្រួសារ និងយុវវ័យ។ វគ្គប្រឹក្សាជាភាសាអង់គ្លេស ឬខ្មែរ ដោយផ្ទាល់ ឬតាមអនឡាញ។",
    // street
    lat: 11.550143,
    lng: 104.930161,
    isListed: true,
    source: "UK government list of doctors in Cambodia (Jan 2026)",
    checkedOn: "2026-10-27",
    services: [
      service(
        "bamboo-individual",
        "Individual counseling",
        "ការប្រឹក្សាបុគ្គល (Individual counseling)",
        "One to one sessions with a counselor, in person or online.",
        "វគ្គម្នាក់ទល់ម្នាក់ជាមួយអ្នកប្រឹក្សា ដោយផ្ទាល់ ឬតាមអនឡាញ។",
      ),
      service(
        "bamboo-couples-families",
        "Couples, family and teen counseling",
        "ការប្រឹក្សាគូស្វាមីភរិយា គ្រួសារ និងយុវវ័យ",
        "Sessions for partners, families and teenagers.",
        "វគ្គសម្រាប់គូស្វាមីភរិយា គ្រួសារ និងយុវវ័យ។",
      ),
    ],
  },
  {
    id: "sombok-psychology",
    slug: "sombok-psychology",
    name: "Sombok Psychology",
    nameKm: "Sombok Psychology (ចិត្តវិទ្យា)",
    category: "clinic",
    ...NO_REVIEWS,
    ...PHNOM_PENH,
    address: "#10A, Street 75, Srah Chak, Daun Penh, Phnom Penh",
    addressKm: "ផ្ទះលេខ ១០A ផ្លូវ ៧៥ សង្កាត់ស្រះចក ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ",
    tags: ["Psychology", "Children and families"],
    tagsKm: ["ចិត្តវិទ្យា (Psychology)", "កុមារ និងគ្រួសារ"],
    status: "Tue and Thu 8:00 AM to 7:00 PM. Wed, Fri and Sat 8:00 AM to 5:00 PM",
    statusKm: "ថ្ងៃអង្គារ និងព្រហស្បតិ៍ ៨:០០ ព្រឹក ដល់ ៧:០០ យប់។ ថ្ងៃពុធ សុក្រ និងសៅរ៍ ៨:០០ ព្រឹក ដល់ ៥:០០ ល្ងាច",
    // Used with permission (Rith asked, 27 Oct 2026).
    image: "/clinics/sombok-psychology.jpg",
    imageCredit: { text: "Photo: Sombok Psychology", url: "https://www.sombokpsychology.com/" },
    phone: "+85577566110",
    phoneDisplay: "077 566 110",
    googleMapsUrl: mapsSearch("Sombok Psychology, Street 75, Daun Penh, Phnom Penh"),
    about:
      "A team of Cambodian and international psychologists working with children, young people and families. The number also works on WhatsApp, Telegram and Signal.",
    aboutKm:
      "ក្រុមចិត្តវិទូកម្ពុជា និងបរទេស ដែលធ្វើការជាមួយកុមារ យុវវ័យ និងគ្រួសារ។ លេខទូរស័ព្ទនេះក៏ប្រើបានតាម WhatsApp, Telegram និង Signal ផងដែរ។",
    // street
    lat: 11.578893,
    lng: 104.918015,
    isListed: true,
    source: "sombokpsychology.com (address, hours, services)",
    checkedOn: "2026-10-27",
    services: [
      service(
        "sombok-therapy",
        "Therapy",
        "ការព្យាបាលដោយការនិយាយ (Therapy)",
        "Sessions with a psychologist for children, young people, adults and families.",
        "វគ្គជាមួយចិត្តវិទូ សម្រាប់កុមារ យុវវ័យ មនុស្សពេញវ័យ និងគ្រួសារ។",
      ),
      service(
        "sombok-assessment",
        "Assessments",
        "ការវាយតម្លៃផ្លូវចិត្ត (Assessment)",
        "Psychological assessments to understand needs and plan support.",
        "ការវាយតម្លៃផ្លូវចិត្ត ដើម្បីយល់ពីតម្រូវការ និងរៀបចំការគាំទ្រ។",
      ),
    ],
  },
  {
    id: "emdr-association-cambodia",
    slug: "emdr-association-cambodia",
    name: "EMDR Association Cambodia (EMDRAC)",
    nameKm: "សមាគម EMDR កម្ពុជា (EMDRAC)",
    category: "clinic",
    ...NO_REVIEWS,
    ...PHNOM_PENH,
    address: "#126, Street 12BT, Boeung Tumpun, Meanchey, Phnom Penh",
    addressKm: "ផ្ទះលេខ ១២៦ ផ្លូវ ១២BT សង្កាត់បឹងទំពុន ខណ្ឌមានជ័យ រាជធានីភ្នំពេញ",
    tags: ["EMDR therapy", "Trauma care", "English and Khmer"],
    tagsKm: ["ការព្យាបាល EMDR", "ការព្យាបាលរបួសផ្លូវចិត្ត (Trauma)", "ភាសាអង់គ្លេស និងខ្មែរ"],
    status: "Monday to Friday, 8:00 AM to 5:00 PM",
    statusKm: "ថ្ងៃច័ន្ទ ដល់ថ្ងៃសុក្រ ម៉ោង ៨:០០ ព្រឹក ដល់ ៥:០០ ល្ងាច",
    image: "",
    phone: "+85589968678",
    phoneDisplay: "089 968 678",
    googleMapsUrl: mapsSearch("EMDR Association Cambodia, #126 Street 12BT, Boeung Tumpun, Phnom Penh"),
    about:
      "A Cambodian association of psychologists that helps people heal from trauma, with offices in Phnom Penh, Siem Reap and Battambang. Its therapists also run the free UP Counseling clinic for University of Puthisastra students and staff.",
    aboutKm:
      "សមាគមចិត្តវិទូកម្ពុជា ដែលជួយមនុស្សឱ្យជាសះស្បើយពីរបួសផ្លូវចិត្ត មានការិយាល័យនៅភ្នំពេញ សៀមរាប និងបាត់ដំបង។ អ្នកព្យាបាលរបស់សមាគមក៏ផ្តល់សេវាប្រឹក្សាឥតគិតថ្លៃ UP Counseling សម្រាប់និស្សិត និងបុគ្គលិកសាកលវិទ្យាល័យពុទ្ធិសាស្ត្រផងដែរ។",
    // street
    lat: 11.534012,
    lng: 104.909635,
    isListed: true,
    source:
      "emdrcambodia.org (phone, hours, services, fee); CCC Cambodia member directory (2024) and EMDRAC Facebook page (Phnom Penh address)",
    checkedOn: "2026-10-27",
    services: [
      {
        id: "emdrac-therapy",
        name: "Therapy session",
        nameKm: "វគ្គព្យាបាល (Therapy session)",
        duration: "",
        durationKm: "",
        fee: "$40",
        description:
          "One to one therapy for trauma, in English or Khmer. EMDR, and with some therapists CBT, trauma focused CBT, family or art therapy.",
        descriptionKm:
          "ការព្យាបាលម្នាក់ទល់ម្នាក់សម្រាប់របួសផ្លូវចិត្ត ជាភាសាអង់គ្លេស ឬខ្មែរ។ EMDR និងជាមួយអ្នកព្យាបាលខ្លះ CBT, CBT សម្រាប់របួសផ្លូវចិត្ត ការព្យាបាលគ្រួសារ ឬការព្យាបាលតាមរយៈសិល្បៈ។",
      },
    ],
  },
  {
    id: "calmette-hospital",
    slug: "calmette-hospital",
    name: "Calmette Hospital",
    nameKm: "មន្ទីរពេទ្យកាល់ម៉ែត",
    category: "hospital",
    ...NO_REVIEWS,
    ...PHNOM_PENH,
    address: "#3, Monivong Blvd, Srah Chak, Daun Penh, Phnom Penh",
    addressKm: "ផ្ទះលេខ ៣ មហាវិថីព្រះមុនីវង្ស សង្កាត់ស្រះចក ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ",
    tags: ["Public hospital", "Emergency 24 hours"],
    tagsKm: ["មន្ទីរពេទ្យរដ្ឋ (Public hospital)", "សង្គ្រោះបន្ទាន់ ២៤ ម៉ោង"],
    ...EMERGENCY_24H,
    // Used with permission (Rith asked, 27 Oct 2026).
    image: "/clinics/calmette-hospital.jpg",
    imageCredit: { text: "Photo: Calmette Hospital", url: "https://www.calmette.gov.kh/" },
    phone: "+85523426948",
    phoneDisplay: "023 426 948",
    googleMapsUrl: mapsSearch("Calmette Hospital, Monivong Blvd, Phnom Penh"),
    about:
      "A large public hospital with emergency care day and night. It does not list a separate mental health department, so go here if you or someone else is in danger right now. Hotline 011 426 948.",
    aboutKm:
      "មន្ទីរពេទ្យរដ្ឋធំមួយ ដែលមានការសង្គ្រោះបន្ទាន់ទាំងថ្ងៃ និងយប់។ មន្ទីរពេទ្យមិនបានបង្ហាញផ្នែកសុខភាពផ្លូវចិត្តដាច់ដោយឡែកទេ ដូច្នេះសូមមកទីនេះ ប្រសិនបើអ្នក ឬនរណាម្នាក់កំពុងមានគ្រោះថ្នាក់ឥឡូវនេះ។ លេខបន្ទាន់ ០១១ ៤២៦ ៩៤៨។",
    lat: 11.581144,
    lng: 104.916869,
    isListed: true,
    source: "UK government list of doctors in Cambodia (Jan 2026); OpenStreetMap",
    checkedOn: "2026-10-27",
    services: [
      service(
        "calmette-emergency",
        "Emergency care",
        "ការសង្គ្រោះបន្ទាន់ (Emergency)",
        "Open 24 hours for urgent medical help.",
        "បើក ២៤ ម៉ោង សម្រាប់ជំនួយវេជ្ជសាស្ត្របន្ទាន់។",
      ),
    ],
  },
  {
    id: "royal-phnom-penh-hospital",
    slug: "royal-phnom-penh-hospital",
    name: "Royal Phnom Penh Hospital",
    nameKm: "មន្ទីរពេទ្យរ៉ូយ៉ាល់ភ្នំពេញ",
    category: "hospital",
    ...NO_REVIEWS,
    ...PHNOM_PENH,
    address: "#888, Russian Federation Blvd (Street 110), Sen Sok, Phnom Penh",
    addressKm: "ផ្ទះលេខ ៨៨៨ មហាវិថីសហព័ន្ធរុស្ស៊ី (ផ្លូវ ១១០) ខណ្ឌសែនសុខ រាជធានីភ្នំពេញ",
    tags: ["Private hospital", "Emergency 24 hours"],
    tagsKm: ["មន្ទីរពេទ្យឯកជន (Private hospital)", "សង្គ្រោះបន្ទាន់ ២៤ ម៉ោង"],
    ...EMERGENCY_24H,
    // Used with permission (Rith asked, 27 Oct 2026). Only a small photo exists on their site.
    image: "/clinics/royal-phnom-penh-hospital.jpg",
    imagePosition: "50% 50%",
    imageCredit: { text: "Photo: Royal Phnom Penh Hospital", url: "https://www.royalphnompenhhospital.com/" },
    phone: "+85523991222",
    phoneDisplay: "023 991 222",
    googleMapsUrl: mapsSearch("Royal Phnom Penh Hospital, Russian Federation Blvd, Phnom Penh"),
    about:
      "A private hospital with emergency care day and night. The Call button rings the 24 hour emergency line. For other questions, call the main line 023 991 000.",
    aboutKm:
      "មន្ទីរពេទ្យឯកជន ដែលមានការសង្គ្រោះបន្ទាន់ទាំងថ្ងៃ និងយប់។ ប៊ូតុងហៅទូរស័ព្ទ ហៅទៅលេខសង្គ្រោះបន្ទាន់ ២៤ ម៉ោង។ សម្រាប់សំណួរផ្សេងៗ សូមហៅលេខ ០២៣ ៩៩១ ០០០។",
    lat: 11.562118,
    lng: 104.880789,
    isListed: true,
    source: "UK government list of doctors in Cambodia (Jan 2026); OpenStreetMap",
    checkedOn: "2026-10-27",
    services: [
      service(
        "rpph-emergency",
        "Emergency care",
        "ការសង្គ្រោះបន្ទាន់ (Emergency)",
        "Open 24 hours for urgent medical help.",
        "បើក ២៤ ម៉ោង សម្រាប់ជំនួយវេជ្ជសាស្ត្របន្ទាន់។",
      ),
    ],
  },
];

/**
 * The clinics this person may see. UP only clinics are for confirmed UP
 * students and staff, and for that clinic's desk and therapists (`allowed`,
 * from GET /api/clinics/access).
 */
export function visibleClinics(
  clinics: Clinic[],
  upStudent: boolean,
  allowed: ReadonlySet<string> = new Set(),
): Clinic[] {
  return clinics.filter((clinic) => !clinic.upStudentsOnly || upStudent || allowed.has(clinic.slug));
}

/** Straight line distance in kilometres (haversine). */
export function distanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const rad = (value: number) => (value * Math.PI) / 180;
  const dLat = rad(to.lat - from.lat);
  const dLng = rad(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number, isKm: boolean) {
  const text = km < 10 ? km.toFixed(1) : String(Math.round(km));
  if (!isKm) return `${text} km`;
  const khmerDigits = "០១២៣៤៥៦៧៨៩";
  return `${text.replace(/[0-9]/g, (digit) => khmerDigits[Number(digit)])} គ.ម`;
}
