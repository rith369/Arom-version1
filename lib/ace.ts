// ACE (Adverse Childhood Experiences) for the therapist intake
// (BACKEND-HANDOFF.md section 37). Never a self check: a professional turns it
// on, the client may answer before a session with them, and only that
// professional reads it.
//
// English: the original ACE study questionnaire (Felitti et al. 1998, CDC and
// Kaiser Permanente), free to use. Khmer: EMDR Association Cambodia, used with
// their permission, typed from their form and waiting for their proofreading.
// It is a translation, not a tested version.

export const ACE_LENGTH = 10;

// true yes, false no, null skipped ("I would rather not say").
export type AceAnswer = boolean | null;

type Text = { en: string; km: string };

export type AceQuestion = {
  // The question, then any "or" parts on their own lines.
  en: string[];
  km: string[];
};

export const ACE_TITLE: Text = {
  en: 'Childhood experiences (ACE)',
  km: 'បញ្ជីសំណួរពីការប៉ះទង្គិចផ្លូវចិត្ត (ACE)',
};

export const ACE_LEAD: Text = {
  en: 'While you were growing up, during your first 18 years of life:',
  km: 'ចាប់តាំងពីអាយុ ០ ឆ្នាំដល់ ១៨ឆ្នាំ៖',
};

export const ACE_QUESTIONS: AceQuestion[] = [
  {
    en: [
      'Did a parent or other adult in the household often swear at you, insult you, put you down, or humiliate you?',
      'Or act in a way that made you afraid that you might be physically hurt?',
    ],
    km: [
      'តើជាញឹកញាប់ ឪពុក ឬម្តាយ ឬមនុស្សធំណាម្នាក់ដែលជាសមាជិកក្នុងគ្រួសារ បានជេរប្រមាថ ដាក់បណ្តាសារ សើចចំអកអ្នកដែរឬទេ?',
      'ឬបង្ហាញឥរិយាបថធ្វើឱ្យអ្នកភ័យខ្លាចថាគាត់នឹងវាយធ្វើបាបអ្នក ដែរឬទេ?',
    ],
  },
  {
    en: [
      'Did a parent or other adult in the household often push, grab, slap, or throw something at you?',
      'Or ever hit you so hard that you had marks or were injured?',
    ],
    km: [
      'តើជាញឹកញាប់ ឪពុក ឬម្តាយ ឬមនុស្សធំណាម្នាក់ដែលជាសមាជិកក្នុងគ្រួសារ ធ្លាប់បានច្រាន ខ្ទាំ ទះកំផ្លៀង ឬគប់របស់អ្វីមួយដាក់អ្នកដែរឬទេ?',
      'ឬធ្លាប់វាយធ្វើបាបអ្នកធ្ងន់ធ្ងរ រហូតធ្វើឱ្យមានស្លាកស្នាម ឬរងរបួស ដែរឬទេ?',
    ],
  },
  {
    en: [
      'Did an adult or person at least 5 years older than you ever touch or fondle you, or have you touch their body in a sexual way?',
      'Or try to or actually have oral, anal, or vaginal sex with you?',
    ],
    km: [
      'តើអ្នកធ្លាប់ត្រូវបានមនុស្សពេញវ័យ ឬមនុស្សដែលមានអាយុលើសអ្នកយ៉ាងហោចណាស់ប្រាំឆ្នាំ ស្ទាបអង្អែល ឬឱ្យអ្នកស្ទាបអង្អែលផ្នែកណាមួយនៃរាងកាយរបស់គេ ក្នុងបំណងកេងប្រវ័ញ្ចផ្លូវភេទដែរឬទេ?',
      'ឬប៉ុនប៉ងប្រព្រឹត្តការរួមភេទ តាមមាត់ តាមរន្ធគូទ ឬតាមប្រដាប់ភេទរបស់អ្នក ដែរឬទេ?',
    ],
  },
  {
    en: [
      'Did you often feel that no one in your family loved you or thought you were important or special?',
      "Or that your family didn't look out for each other, feel close to each other, or support each other?",
    ],
    km: [
      'តើជាញឹកញាប់អ្នកមានអារម្មណ៍ថា គ្មាននរណាម្នាក់ក្នុងគ្រួសារ ស្រលាញ់អ្នក ឬមិនដែលចាត់ទុកអ្នកថាជាមនុស្សសំខាន់ដែរឬទេ?',
      'ឬអ្នកទទួលអារម្មណ៍ថា គ្រួសារមិនសូវកក់ក្តៅ គ្មានភាពស្និទ្ធស្នាល ឬមិនចេះជួយយកអាសារគ្នាដែរឬទេ?',
    ],
  },
  {
    en: [
      "Did you often feel that you didn't have enough to eat, had to wear dirty clothes, and had no one to protect you?",
      'Or that your parents were too drunk or high to take care of you or take you to the doctor if you needed it?',
    ],
    km: [
      'តើជាញឹកញាប់អ្នកមានអារម្មណ៍ថា អ្នកមិនមានអាហារញ៉ាំគ្រប់គ្រាន់ ឬស្លៀកពាក់កខ្វក់ និងគ្មានអ្នកមើលថែដិតដល់ ឬយកចិត្តទុកដាក់ជ្រុលហួសហេតុ ដែរឬទេ?',
      'ឬគ្មាននរណាយកអ្នកទៅមន្ទីរពេទ្យពេលឈឺថ្កាត់ ដោយសារគាត់ស្រវឹងខ្លាំង លែងគ្រប់គ្រងខ្លួនឯងបាន ដែរឬទេ?',
    ],
  },
  {
    en: ['Were your parents ever separated or divorced?'],
    km: ['តើឪពុកម្តាយរបស់អ្នកធ្លាប់រស់នៅបែកគ្នា ឬលែងលះគ្នា ដែរឬទេ?'],
  },
  {
    en: [
      'Was your mother or stepmother often pushed, grabbed, slapped, or had something thrown at her?',
      'Or sometimes or often kicked, bitten, hit with a fist, or hit with something hard?',
      'Or ever repeatedly hit over at least a few minutes, or threatened with a gun or knife?',
    ],
    km: [
      'តើជាញឹកញាប់ ម្តាយបង្កើត ឬម្តាយចុងរបស់អ្នកធ្លាប់ត្រូវគេ ច្រាន ខ្ទាំ ទះកំផ្លៀង ឬគប់របស់អ្វីដាក់គាត់ដែរឬទេ?',
      'ឬ ត្រូវគេ ទាត់ ដាល់ ឬវាយនឹងរបស់រឹងដែរឬទេ?',
      'ឬ ធ្លាប់ត្រូវគេវាយធ្វើបាបម្តងហើយម្តងទៀតយ៉ាងហោចណាស់ ពីរបីនាទី ឬ ធ្លាប់ត្រូវបានគេគំរាមកំហែងដោយអាវុធ កាំភ្លើង ឬកាំបិត ដែរឬទេ?',
    ],
  },
  {
    en: ['Did you live with anyone who was a problem drinker or alcoholic, or who used street drugs?'],
    km: ['តើអ្នកធ្លាប់រស់នៅជាមួយមនុស្សដែលមានបញ្ហាការផឹកស្រាជោគជាំ ប្រមឹក ឬអ្នកប្រើប្រាស់ថ្នាំញៀនដែរឬទេ?'],
  },
  {
    en: ['Was a household member depressed or mentally ill, or did a household member attempt suicide?'],
    km: ['តើក្នុងគ្រួសារអ្នក មានសមាជិកណាម្នាក់ ដែលធ្លាប់មានបញ្ហាធ្លាក់ទឹកចិត្ត ជំងឺផ្លូវចិត្ត ឬធ្លាប់ប៉ុនប៉ងធ្វើអត្តឃាតដែរឬទេ?'],
  },
  {
    en: ['Did a household member go to prison?'],
    km: ['តើធ្លាប់មានសមាជិកគ្រួសារណាម្នាក់ជាប់ពន្ធនាគារដែរឬទេ?'],
  },
];

export const ACE_CREDIT: Text = {
  en: 'Questions from the ACE study (CDC and Kaiser Permanente). Khmer by EMDR Association Cambodia.',
  km: 'សំណួរពីការសិក្សា ACE (CDC និង Kaiser Permanente)។ ភាសាខ្មែរដោយសមាគម EMDR កម្ពុជា។',
};

/** Number of "yes" answers (the ACE score) and how many were answered. */
export function aceScore(answers: AceAnswer[]) {
  return {
    score: answers.filter((answer) => answer === true).length,
    answered: answers.filter((answer) => answer !== null).length,
  };
}

export function isAceAnswers(value: unknown): value is AceAnswer[] {
  return (
    Array.isArray(value) &&
    value.length === ACE_LENGTH &&
    value.every((answer) => answer === true || answer === false || answer === null)
  );
}

// ---------- API shapes ----------

/** GET /api/ace: one row per professional with an upcoming session or saved answers. */
export type MyAceIntake = {
  professionalSlug: string;
  // The professional asks these questions.
  asks: boolean;
  // There is an upcoming booked session with them, so the answers can be saved or changed.
  canAnswer: boolean;
  answers: AceAnswer[] | null;
  updatedAt: string | null;
};

export type MyAceResponse = { intakes: MyAceIntake[] };

/** GET /api/pro/clients/:clientId/ace. Null when the client has not answered. */
export type ProClientAce = { answers: AceAnswer[]; updatedAt: string } | null;
