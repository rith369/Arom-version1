// The Terms and Privacy pages. Written from what the code does (5 Nov 2026).
// When a feature changes what is collected or who sees it, change this too.
// A lawyer has not reviewed this, and the Khmer needs a native review.

export const LEGAL_EMAIL = "arom.mental@gmail.com";
export const LEGAL_UPDATED = { km: "ថ្ងៃទី ៥ ខែវិច្ឆិកា ឆ្នាំ ២០២៦", en: "5 November 2026" };

export type LegalText = { km: string; en: string };

export type LegalSection = {
  title: LegalText;
  body?: LegalText[];
  items?: LegalText[];
  after?: LegalText[];
};

export const PRIVACY_TITLE: LegalText = { km: "គោលការណ៍ឯកជនភាព (Privacy Policy)", en: "Privacy Policy" };
export const TERMS_TITLE: LegalText = { km: "លក្ខខណ្ឌប្រើប្រាស់ (Terms of Service)", en: "Terms of Service" };

export const PRIVACY_INTRO: LegalText = {
  km: "AROM គឺជាកម្មវិធីសុខុមាលភាពផ្លូវចិត្តនៅកម្ពុជា។ អ្វីដែលអ្នកសរសេរនៅទីនេះមានលក្ខណៈឯកជន។ ទំព័រនេះពន្យល់ជាភាសាសាមញ្ញអំពីទិន្នន័យដែលយើងរក្សាទុក អ្នកណាអាចមើលឃើញវា និងជម្រើសដែលអ្នកមាន។",
  en: "AROM is a mental wellbeing app in Cambodia. What you write here is private. This page explains in plain words what we keep, who can see it, and the choices you have.",
};

export const TERMS_INTRO: LegalText = {
  km: "លក្ខខណ្ឌទាំងនេះពន្យល់អំពីការប្រើប្រាស់ AROM។ នៅពេលអ្នកបង្កើតគណនី មានន័យថាអ្នកយល់ព្រមតាមលក្ខខណ្ឌទាំងនេះ និងគោលការណ៍ឯកជនភាពរបស់យើង។",
  en: "These terms explain how AROM can be used. By creating an account, you agree to these terms and to our Privacy Policy.",
};

export const CRISIS_NOTE: LegalText = {
  km: "AROM មិនមែនជាសេវាសង្គ្រោះបន្ទាន់ទេ។ ប្រសិនបើអ្នក ឬនរណាម្នាក់កំពុងមានគ្រោះថ្នាក់ សូមទូរស័ព្ទទៅសេវាសង្គ្រោះបន្ទាន់ក្នុងតំបន់ ឬទៅមន្ទីរពេទ្យដែលនៅជិតបំផុត។ លេខជំនួយមាននៅក្នុង Profile នៅផ្នែក Get Help។",
  en: "AROM is not an emergency service. If you or someone else is in danger, call your local emergency services or go to the nearest hospital. Helplines are in Profile, under Get Help.",
};

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: { km: "១. ទិន្នន័យដែលយើងរក្សាទុក", en: "1. What we keep" },
    items: [
      {
        km: "គណនី៖ ឈ្មោះ អ៊ីមែល ភាសា និងវិធីចូលគណនី។ ពាក្យសម្ងាត់ត្រូវបានរក្សាទុកជាទម្រង់សម្ងាត់ (hash) ហើយយើងមិនអាចអានវាបានទេ។",
        en: "Account: your name, email, language and how you log in. Passwords are stored in a protected form (hashed) that we cannot read.",
      },
      {
        km: "ប្រវត្តិរូបដែលអ្នកជ្រើសរើសបន្ថែម៖ ឈ្មោះហៅក្រៅ សព្វនាម អំពីខ្លួនអ្នក និងរូបថត។",
        en: "Profile details you choose to add: nickname, pronouns, about you and a photo.",
      },
      {
        km: "សុខុមាលភាព៖ កំណត់ហេតុ អារម្មណ៍ លទ្ធផលតេស្ត (ដូចជា PHQ-9 និង GAD-7) ការស្ទង់មតិពេលចាប់ផ្តើម ផែនទីខ្លួនឯង (Self map) និងចម្លើយអំពីបទពិសោធន៍កុមារភាព (ACE) ប្រសិនបើអ្នកឆ្លើយ។",
        en: "Wellbeing: your journal, moods, screening results (such as PHQ-9 and GAD-7), the starting survey, your self map, and childhood experience (ACE) answers if you give them.",
      },
      {
        km: "ការកក់៖ ពេលវេលា អ្នកជំនាញ កំណត់ចំណាំ និងចម្លើយដែលអ្នកសរសេរមុនវគ្គ។ សំណើទៅគ្លីនិកក៏មានអាយុ និងភេទដែលអ្នកផ្តល់ឱ្យផងដែរ។",
        en: "Bookings: times, your professional, and the note and answers you write before a session. Clinic requests also hold the age and sex you give.",
      },
      {
        km: "សារ៖ សារជាលាយលក្ខណ៍អក្សរ សារជាសំឡេង រូបថត និងឯកសារ PDF ដែលអ្នកផ្ញើទៅអ្នកជំនាញ គ្លីនិក ឬក្រុម។",
        en: "Messages: the text, voice messages, photos and PDFs you send to professionals, clinics or groups.",
      },
      {
        km: "ការប្រើប្រាស់៖ មេរៀន មាតិកាដែលបានរក្សាទុក ផែនការ ការវាយតម្លៃ និងរបាយការណ៍ដែលអ្នកផ្ញើ។",
        en: "Use of the app: lessons, saved items, your plan, reviews, and reports you send.",
      },
      {
        km: "របាយការណ៍កំហុស៖ សារកំហុស ទំព័រ និងកំណែកម្មវិធី។ យើងមិនរក្សាទុកអាសយដ្ឋានអ៊ីនធឺណិត (IP) របស់អ្នកទេ មានតែកូដដែលផ្លាស់ប្តូររៀងរាល់ថ្ងៃ។",
        en: "Error reports: the error, the page and the app version. We do not store your internet address (IP), only a code that changes every day.",
      },
    ],
  },
  {
    title: { km: "២. ហេតុអ្វីយើងប្រើវា", en: "2. Why we use it" },
    body: [
      {
        km: "យើងប្រើទិន្នន័យរបស់អ្នក ដើម្បីដំណើរការកម្មវិធី បង្ហាញប្រវត្តិរបស់អ្នកផ្ទាល់ ភ្ជាប់អ្នកជាមួយអ្នកជំនាញដែលអ្នកជ្រើសរើស រក្សាសុវត្ថិភាពក្រុម និងជួសជុលបញ្ហា។ យើងមិនលក់ទិន្នន័យរបស់អ្នកទេ មិនបង្ហាញការផ្សាយពាណិជ្ជកម្ម និងមិនប្រើឧបករណ៍វិភាគការប្រើប្រាស់ពីភាគីទីបីទេ។",
        en: "We use your data to run the app, show you your own history, connect you with the professionals you choose, keep groups safe, and fix problems. We do not sell your data, show ads, or use outside analytics tools.",
      },
    ],
  },
  {
    title: { km: "៣. អ្នកណាអាចមើលឃើញអ្វីខ្លះ", en: "3. Who can see what" },
    items: [
      {
        km: "អ្នកជំនាញដែលអ្នកកក់៖ ការកក់របស់អ្នក កំណត់ចំណាំ និងចម្លើយមុនវគ្គ សារជាមួយគាត់ និងអ្វីដែលអ្នកជ្រើសរើសចែករំលែក ដូចជាការស្ទង់មតិ ពិន្ទុតេស្ត និន្នាការអារម្មណ៍ និងផែនទីខ្លួនឯង។ គាត់មិនឃើញកំណត់ហេតុរបស់អ្នកទេ។ ប្រសិនបើអ្នកលាក់អត្តសញ្ញាណ គាត់នឹងឃើញឈ្មោះហៅក្រៅ ឬ Anonymous ជំនួសឈ្មោះរបស់អ្នក។",
        en: "A professional you book: your booking, your note and answers before the session, your messages with them, and what you choose to share, such as your survey, screening scores, mood trend and self map. They do not see your journal. If you hide your identity, they see your nickname or Anonymous instead of your name.",
      },
      {
        km: "អ្នកជំនាញក៏សរសេរកំណត់ត្រារបស់ខ្លួនអំពីវគ្គផងដែរ។ អ្នកមិនឃើញកំណត់ត្រាទាំងនេះទេ ហើយអ្នកគ្រប់គ្រងក៏មិនឃើញតាមកម្មវិធីដែរ។",
        en: "Professionals also write their own notes about sessions. You do not see these notes, and neither do admins through the app.",
      },
      {
        km: "បុគ្គលិកគ្លីនិក៖ សំណើកក់ និងការសន្ទនាជាមួយគ្លីនិកនោះ ប្រសិនបើអ្នកកក់តាមគ្លីនិក។",
        en: "Clinic desk staff: your booking requests and chats with that clinic, if you book through a clinic.",
      },
      {
        km: "ក្រុមគាំទ្រ៖ សមាជិកផ្សេងទៀត និងអ្នកណែនាំក្រុមអាចអានសារក្នុងក្រុម រួមទាំងសារមុនពេលពួកគេចូលរួម។ សូមកុំចែករំលែកអ្វីដែលអ្នកចង់រក្សាជាឯកជន។",
        en: "Support groups: other members and the group mentor can read messages in the group, including messages sent before they joined. Please do not share anything there you want to keep private.",
      },
      {
        km: "ក្រុមសុវត្ថិភាព AROM៖ អាចអានការសន្ទនាក្នុងក្រុម ដើម្បីរក្សាសុវត្ថិភាព។ រាល់ការបើកអានត្រូវបានកត់ត្រា។",
        en: "The AROM safety team: can read group chats to keep them safe. Every time they open one, it is recorded.",
      },
      {
        km: "អ្នកគ្រប់គ្រង AROM៖ ឈ្មោះ អ៊ីមែល ចំនួនសកម្មភាព និងព័ត៌មានកក់ដែលមានកំណត់ ដោយគ្មានកំណត់ចំណាំរបស់អ្នក។ ពួកគេមិនឃើញកំណត់ហេតុ អារម្មណ៍ ឬលទ្ធផលតេស្តរបស់អ្នកក្នុងកម្មវិធីទេ។",
        en: "AROM admins: your name, email, activity counts and limited booking details, without your notes. They do not see your journal, moods or screening results in the app.",
      },
    ],
  },
  {
    title: { km: "៤. សេវាកម្មខាងក្រៅដែលយើងប្រើ", en: "4. Outside services we use" },
    body: [
      {
        km: "សេវាកម្មទាំងនេះដំណើរការ AROM ហើយអាចដំណើរការទិន្នន័យនៅក្រៅប្រទេសកម្ពុជា។",
        en: "These services help run AROM, and they may handle data outside Cambodia.",
      },
    ],
    items: [
      {
        km: "Supabase៖ មូលដ្ឋានទិន្នន័យ ការចូលគណនី ការផ្ញើអ៊ីមែលគណនី និងការរក្សាទុកឯកសារ។",
        en: "Supabase: our database, logins, account emails and file storage.",
      },
      { km: "Vercel៖ ដំណើរការគេហទំព័រ AROM។", en: "Vercel: hosts the AROM website." },
      {
        km: "Google៖ សម្រាប់ការចូលជាមួយ Google ប្រសិនបើអ្នកជ្រើសរើសវា។ ប្រសិនបើអ្នកបើកសេចក្តីសង្ខេបកំណត់ហេតុ កំណត់ហេតុ ៧ ថ្ងៃចុងក្រោយរបស់អ្នកនឹងត្រូវផ្ញើទៅ Google Gemini។",
        en: "Google: for Google Sign In, if you choose it. If you turn on journal summaries, your entries from the last 7 days are sent to Google Gemini.",
      },
      {
        km: "កម្មវិធីរុករករបស់អ្នក៖ នៅពេលអ្នកនិយាយកំណត់ហេតុ កម្មវិធីរុករកបម្លែងសំឡេងទៅជាអក្សរ ហើយអាចផ្ញើសំឡេងទៅក្រុមហ៊ុនរបស់វា។",
        en: "Your browser: when you speak a journal entry, your browser turns it into text and may send the audio to its company.",
      },
      {
        km: "OpenStreetMap៖ ផែនទីគ្លីនិក។ ឧបករណ៍របស់អ្នកទាញយកផែនទីពីពួកគេដោយផ្ទាល់។",
        en: "OpenStreetMap: the clinic map. Your device loads map images directly from them.",
      },
      {
        km: "សេវាកម្មវីដេអូ៖ តំណវគ្គអនឡាញ ដូចជា Google Meet ត្រូវបានផ្តល់ដោយអ្នកជំនាញ ឬគ្លីនិក។ AROM មិនថត ឬមើលវគ្គរបស់អ្នកទេ។",
        en: "Video services: online session links, such as Google Meet, come from your professional or clinic. AROM does not record or watch your sessions.",
      },
    ],
  },
  {
    title: { km: "៥. ទីតាំង ខូគី និងឧបករណ៍របស់អ្នក", en: "5. Location, cookies and your device" },
    items: [
      {
        km: "ទីតាំង៖ មានតែនៅពេលអ្នកអនុញ្ញាត ដើម្បីបង្ហាញគ្លីនិកដែលនៅជិត។ វានៅលើឧបករណ៍របស់អ្នក ហើយមិនត្រូវបានផ្ញើ ឬរក្សាទុកដោយ AROM ទេ។",
        en: "Location: only if you allow it, to show nearby clinics. It stays on your device and AROM does not send or store it.",
      },
      {
        km: "ខូគី៖ យើងប្រើខូគីដើម្បីឱ្យអ្នកនៅតែចូលគណនី។ យើងមិនប្រើខូគីផ្សាយពាណិជ្ជកម្មទេ។",
        en: "Cookies: we use cookies to keep you logged in. We do not use advertising cookies.",
      },
      {
        km: "ការរក្សាទុកក្នុងកម្មវិធីរុករក៖ ជម្រើសតូចៗ ដូចជាភាសា និងវឌ្ឍនភាពពេលមិនទាន់ចូលគណនី។ សូមចាកចេញ ប្រសិនបើអ្នកប្រើឧបករណ៍រួមគ្នា។",
        en: "Browser storage: small choices such as language, and progress while logged out. Please log out if you share a device.",
      },
    ],
  },
  {
    title: { km: "៦. យើងរក្សាទុកវារយៈពេលប៉ុន្មាន", en: "6. How long we keep it" },
    items: [
      {
        km: "ទិន្នន័យរបស់អ្នកត្រូវបានរក្សាទុករហូតដល់អ្នកលុបវា ឬលុបគណនីរបស់អ្នក។",
        en: "Your data is kept until you delete it or delete your account.",
      },
      { km: "របាយការណ៍កំហុសត្រូវបានលុបបន្ទាប់ពី ៣០ ថ្ងៃ។", en: "Error reports are deleted after 30 days." },
      {
        km: "បច្ចុប្បន្ន យើងមិនមានការបម្រុងទុកដាច់ដោយឡែកទេ។ ដូច្នេះទិន្នន័យដែលបានលុប ឬបាត់បង់ មិនអាចយកមកវិញបានទេ។",
        en: "We do not currently keep separate backups. Data that is deleted or lost cannot be brought back.",
      },
    ],
  },
  {
    title: { km: "៧. ជម្រើសរបស់អ្នក", en: "7. Your choices" },
    items: [
      {
        km: "ទាញយកទិន្នន័យរបស់អ្នក៖ Profile, Your data។ សារជាសំឡេង រូបថត និង PDF ត្រូវបានរាយឈ្មោះ ប៉ុន្តែមិនមាននៅក្នុងឯកសារទេ។",
        en: "Download your data: Profile, Your data. Voice messages, photos and PDFs are listed by name but are not inside the file.",
      },
      {
        km: "លុបគណនីរបស់អ្នក៖ Profile, Your data។ វាលុបកំណត់ហេតុ ការកក់ និងសាររបស់អ្នក រួមទាំងកំណត់ត្រារបស់អ្នកជំនាញអំពីអ្នក។ វាមិនអាចត្រឡប់វិញបានទេ។ របាយការណ៍ដែលអ្នកបានផ្ញើនៅតែមាន ដោយគ្មានឈ្មោះរបស់អ្នក ហើយមានកំណត់ត្រាមួយថាគណនីត្រូវបានលុប។ Google អាចនៅរក្សាច្បាប់ចម្លងនៃអ្វីដែលបានផ្ញើទៅវា។",
        en: "Delete your account: Profile, Your data. This deletes your journal, bookings and messages, including professionals' notes about you. It cannot be undone. Reports you sent stay without your name, a record remains that an account was deleted, and Google may still hold copies of what was sent to it.",
      },
      {
        km: "ផ្លាស់ប្តូរព័ត៌មានរបស់អ្នក ពាក្យសម្ងាត់ ការលាក់អត្តសញ្ញាណ និងអ្វីដែលអ្នកចែករំលែកជាមួយអ្នកជំនាញ៖ នៅក្នុងកម្មវិធី។",
        en: "Change your details, password, identity hiding and what you share with professionals: in the app.",
      },
      {
        km: "អ្នកជំនាញ អ្នកណែនាំក្រុម និងអ្នកគ្រប់គ្រង ត្រូវទាក់ទងមកយើង ដើម្បីលុបគណនី ព្រោះវាប៉ះពាល់ដល់អ្នកដទៃ។",
        en: "Professionals, group mentors and admins must contact us to delete their account, because it affects other people.",
      },
    ],
  },
  {
    title: { km: "៨. សុវត្ថិភាព", en: "8. Security" },
    body: [
      {
        km: "យើងប្រើការតភ្ជាប់ដែលបានអ៊ិនគ្រីប ច្បាប់ដែលរារាំងគណនីមួយមិនឱ្យអានទិន្នន័យឯកជនរបស់គណនីមួយទៀត និងការបញ្ជាក់ពីរជំហានសម្រាប់អ្នកគ្រប់គ្រង។ ប៉ុន្តែគ្មានប្រព័ន្ធណាមួយមានសុវត្ថិភាពពេញលេញទេ។ ប្រសិនបើមានការលេចធ្លាយទិន្នន័យដែលប៉ះពាល់ដល់អ្នក យើងនឹងជូនដំណឹងដល់អ្នកឱ្យបានឆាប់តាមដែលអាចធ្វើទៅបាន។",
        en: "We use encrypted connections, rules that stop one account reading another's private data, and two step login for admins. No system is perfectly secure. If a data breach affects you, we will tell you as soon as we reasonably can.",
      },
    ],
  },
  {
    title: { km: "៩. យុវវ័យ", en: "9. Young people" },
    body: [
      {
        km: "AROM សម្រាប់អ្នកដែលមានអាយុចាប់ពី ១៣ ឆ្នាំឡើងទៅ។ ប្រសិនបើអ្នកមានអាយុក្រោម ១៨ ឆ្នាំ សូមនិយាយជាមួយមាតាបិតា អាណាព្យាបាល ឬមនុស្សពេញវ័យដែលអ្នកទុកចិត្តមុនពេលប្រើប្រាស់។",
        en: "AROM is for people aged 13 and over. If you are under 18, please talk with a parent, guardian or adult you trust before using it.",
      },
    ],
  },
  {
    title: { km: "១០. ការផ្លាស់ប្តូរ និងការទាក់ទង", en: "10. Changes and contact" },
    body: [
      {
        km: "ប្រសិនបើយើងផ្លាស់ប្តូរទំព័រនេះ យើងនឹងប្តូរកាលបរិច្ឆេទខាងលើ ហើយជូនដំណឹងអំពីការផ្លាស់ប្តូរសំខាន់ៗនៅក្នុងកម្មវិធី។ សម្រាប់សំណួរអំពីឯកជនភាព សូមសរសេរមក៖",
        en: "If we change this page, we will update the date above and announce important changes in the app. For privacy questions, write to:",
      },
    ],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: { km: "១. អ្វីដែល AROM ជា និងមិនមែនជា", en: "1. What AROM is and is not" },
    items: [
      {
        km: "AROM ជួយអ្នកថែរក្សាសុខុមាលភាពផ្លូវចិត្ត ជាមួយកំណត់ហេតុ មេរៀន ក្រុម និងការកក់ជាមួយអ្នកជំនាញ។",
        en: "AROM helps you care for your mental wellbeing with a journal, lessons, groups and bookings with professionals.",
      },
      {
        km: "AROM មិនជំនួសវេជ្ជបណ្ឌិត អ្នកព្យាបាល ឬការព្យាបាលទេ។ យើងមិនផ្តល់ការវិនិច្ឆ័យរោគទេ។",
        en: "AROM does not replace a doctor, a therapist or treatment. We do not give diagnoses.",
      },
      {
        km: "លទ្ធផលតេស្តគ្រាន់តែជាព័ត៌មានសម្រាប់អ្នកប៉ុណ្ណោះ។ សេចក្តីសង្ខេបដែលសរសេរដោយ AI អាចមានកំហុស។",
        en: "Screening results are information for you only. Summaries written by AI can be wrong.",
      },
      {
        km: "AROM កំពុងស្ថិតក្នុងដំណាក់កាលសាកល្បង ដូច្នេះមុខងារអាចផ្លាស់ប្តូរ។",
        en: "AROM is still in testing, so features can change.",
      },
    ],
  },
  {
    title: { km: "២. អ្នកណាអាចប្រើវា", en: "2. Who can use it" },
    items: [
      {
        km: "អ្នកត្រូវមានអាយុចាប់ពី ១៣ ឆ្នាំឡើងទៅ។ ប្រសិនបើអ្នកមានអាយុក្រោម ១៨ ឆ្នាំ សូមនិយាយជាមួយមាតាបិតា អាណាព្យាបាល ឬមនុស្សពេញវ័យដែលអ្នកទុកចិត្តមុនពេលប្រើប្រាស់។",
        en: "You must be 13 or older. If you are under 18, please talk with a parent, guardian or adult you trust before using it.",
      },
      {
        km: "សូមរក្សាពាក្យសម្ងាត់របស់អ្នកជាសម្ងាត់ កុំចែករំលែកគណនីរបស់អ្នក ហើយជូនដំណឹងមកយើង ប្រសិនបើអ្នកគិតថានរណាម្នាក់បានចូលគណនីរបស់អ្នក។",
        en: "Keep your password secret, do not share your account, and tell us if you think someone else has got into it.",
      },
    ],
  },
  {
    title: { km: "៣. អ្នកជំនាញ និងការកក់", en: "3. Professionals and bookings" },
    items: [
      {
        km: "យើងពិនិត្យព័ត៌មានអាជ្ញាបណ្ណដែលអ្នកជំនាញផ្តល់ឱ្យមុនពេលបង្ហាញពួកគេ។ អ្នកជំនាញទទួលខុសត្រូវចំពោះការថែទាំដែលពួកគេផ្តល់។ AROM មិនមែនជាអ្នកផ្តល់ការព្យាបាលទេ។",
        en: "We check the licence details professionals give us before listing them. Professionals are responsible for the care they give. AROM does not provide the treatment itself.",
      },
      {
        km: "បច្ចុប្បន្ន AROM មិនទទួលការទូទាត់ទេ។ តម្លៃណាមួយដែលបានបង្ហាញ គឺកំណត់ដោយអ្នកជំនាញ។",
        en: "AROM does not take payments at the moment. Any price shown is set by the professional.",
      },
      {
        km: "សូមលុបចោល ឬប្តូរពេលវេលាក្នុងកម្មវិធី ប្រសិនបើអ្នកមិនអាចមកបាន ដើម្បីឱ្យអ្នកជំនាញ និងអ្នកដទៃអាចប្រើពេលវេលានោះ។",
        en: "Please cancel or change the time in the app if you cannot come, so the professional and others can use that time.",
      },
    ],
  },
  {
    title: { km: "៤. ក្រុម និងការប្រព្រឹត្ត", en: "4. Groups and behaviour" },
    body: [{ km: "សូមគោរពអ្នកដទៃ។ អ្នកមិនត្រូវ៖", en: "Please respect other people. You must not:" }],
    items: [
      {
        km: "បៀតបៀន គំរាមកំហែង ឬធ្វើឱ្យនរណាម្នាក់អាម៉ាស់",
        en: "Harass, threaten or shame anyone",
      },
      {
        km: "ចែករំលែកអ្វីដែលនរណាម្នាក់បាននិយាយក្នុងក្រុម នៅខាងក្រៅក្រុម ឬព្យាយាមស្វែងរកថាអ្នកណាជាសមាជិកអនាមិក",
        en: "Share what someone said in a group outside it, or try to find out who an anonymous member is",
      },
      {
        km: "លើកទឹកចិត្តឱ្យធ្វើបាបខ្លួនឯង ឬផ្តល់ដំបូន្មានដែលអាចបង្កគ្រោះថ្នាក់",
        en: "Encourage self harm or give advice that could cause harm",
      },
      {
        km: "ក្លែងខ្លួនជាអ្នកជំនាញ ឬនរណាម្នាក់ផ្សេងទៀត",
        en: "Pretend to be a professional or anyone else",
      },
      {
        km: "ផ្ញើសារឥតបានការ ផ្សាយពាណិជ្ជកម្ម ឬឯកសារដែលបង្កគ្រោះថ្នាក់",
        en: "Send spam, advertising or harmful files",
      },
      {
        km: "ព្យាយាមចូលទៅក្នុងគណនី ឬទិន្នន័យរបស់អ្នកដទៃ ឬរំខានដល់សេវាកម្ម",
        en: "Try to get into other people's accounts or data, or disrupt the service",
      },
    ],
    after: [
      {
        km: "ក្រុមសុវត្ថិភាព AROM អាចអានការសន្ទនាក្នុងក្រុម លាក់សារ ឬដកអ្នកចេញពីក្រុម ដើម្បីរក្សាសុវត្ថិភាព។",
        en: "The AROM safety team can read group chats, hide messages or remove people from groups to keep them safe.",
      },
    ],
  },
  {
    title: { km: "៥. ខ្លឹមសាររបស់អ្នក", en: "5. Your content" },
    body: [
      {
        km: "អ្វីដែលអ្នកសរសេរនៅតែជារបស់អ្នក។ អ្នកអនុញ្ញាតឱ្យយើងរក្សាទុក និងបង្ហាញវាតាមដែលត្រូវការ ដើម្បីដំណើរការ AROM ដូចដែលបានពន្យល់នៅក្នុងគោលការណ៍ឯកជនភាព។",
        en: "What you write stays yours. You let us store and show it as needed to run AROM, as explained in the Privacy Policy.",
      },
    ],
  },
  {
    title: { km: "៦. ការផ្អាក និងការលុបគណនី", en: "6. Suspending and deleting accounts" },
    body: [
      {
        km: "យើងអាចផ្អាកគណនីដែលបំពានលក្ខខណ្ឌទាំងនេះ ឬធ្វើឱ្យអ្នកដទៃមានគ្រោះថ្នាក់។ អ្នកអាចលុបគណនីរបស់អ្នកបានគ្រប់ពេលនៅក្នុង Profile លុះត្រាតែអ្នកមានវគ្គនាពេលខាងមុខដែលត្រូវលុបចោលជាមុនសិន។",
        en: "We can suspend accounts that break these terms or put others at risk. You can delete your account at any time in Profile, once any upcoming sessions are cancelled.",
      },
    ],
  },
  {
    title: { km: "៧. សេវាកម្ម និងដែនកំណត់", en: "7. The service and its limits" },
    items: [
      {
        km: "យើងព្យាយាមរក្សា AROM ឱ្យដំណើរការ ប៉ុន្តែយើងមិនអាចសន្យាថាវានឹងដំណើរការជានិច្ច ឬគ្មានកំហុសទេ។",
        en: "We try to keep AROM working, but we cannot promise it will always be available or free of errors.",
      },
      {
        km: "បច្ចុប្បន្ន យើងមិនមានការបម្រុងទុកទិន្នន័យទេ។ សូមទាញយកទិន្នន័យរបស់អ្នកពីពេលមួយទៅពេលមួយ ប្រសិនបើវាសំខាន់សម្រាប់អ្នក។",
        en: "We do not currently keep backups of data. Please download your data from time to time if it matters to you.",
      },
      {
        km: "តាមដែលច្បាប់អនុញ្ញាត AROM មិនទទួលខុសត្រូវចំពោះការខូចខាតដែលកើតឡើងពីការប្រើប្រាស់ ឬការមិនអាចប្រើប្រាស់សេវាកម្មនេះទេ។ គ្មានអ្វីនៅទីនេះដកហូតសិទ្ធិដែលច្បាប់ផ្តល់ឱ្យអ្នកទេ។",
        en: "As far as the law allows, AROM is not responsible for harm that comes from using, or being unable to use, the service. Nothing here takes away rights the law gives you.",
      },
    ],
  },
  {
    title: { km: "៨. ច្បាប់ ការផ្លាស់ប្តូរ និងការទាក់ទង", en: "8. Law, changes and contact" },
    body: [
      {
        km: "លក្ខខណ្ឌទាំងនេះស្ថិតនៅក្រោមច្បាប់នៃព្រះរាជាណាចក្រកម្ពុជា។ ប្រសិនបើយើងផ្លាស់ប្តូរវា យើងនឹងប្តូរកាលបរិច្ឆេទខាងលើ ហើយជូនដំណឹងអំពីការផ្លាស់ប្តូរសំខាន់ៗនៅក្នុងកម្មវិធី។ សម្រាប់សំណួរ សូមសរសេរមក៖",
        en: "These terms are under the laws of the Kingdom of Cambodia. If we change them, we will update the date above and announce important changes in the app. For questions, write to:",
      },
    ],
  },
];
