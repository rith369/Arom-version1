import { z } from 'zod';

// Mirrors professional_applications. phone and telegram are new columns the
// backend still needs to add (see BACKEND-HANDOFF.md section 8).
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type ProfessionalApplication = {
  id: string;
  fullName: string;
  title: string;
  licenseNumber: string;
  issuingBody: string;
  documentName: string;
  specialties: string[];
  languages: string[];
  yearsExperience: number;
  phone: string;
  telegram: string;
  motivation: string;
  status: ApplicationStatus;
  reviewNote: string;
  createdAt: string;
};

export const SPECIALTY_OPTIONS = [
  { value: 'Anxiety', km: 'ការថប់បារម្ភ' },
  { value: 'Depression', km: 'ជំងឺធ្លាក់ទឹកចិត្ត' },
  { value: 'Stress and burnout', km: 'ភាពតានតឹង និងអស់កម្លាំង' },
  { value: 'Trauma', km: 'របួសផ្លូវចិត្ត' },
  { value: 'Relationships', km: 'ទំនាក់ទំនង' },
  { value: 'Family', km: 'គ្រួសារ' },
  { value: 'Grief', km: 'ការបាត់បង់' },
  { value: 'Sleep', km: 'ការគេង' },
  { value: 'Students', km: 'សិស្ស និស្សិត' },
] as const;

// Free text specialties typed under "Other", separated by commas.
export const MAX_OTHER_SPECIALTIES = 5;
const MAX_SPECIALTY_LENGTH = 40;

export function splitOtherSpecialties(text: string) {
  return text
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export const LANGUAGE_OPTIONS = [
  { value: 'Khmer', km: 'ខ្មែរ' },
  { value: 'English', km: 'អង់គ្លេស' },
] as const;

export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
const DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

// Cambodian numbers: 0 or +855, then 8 or 9 digits. Spaces are allowed.
const CAMBODIA_PHONE = /^(?:\+?855|0)[1-9]\d{7,8}$/;
const TELEGRAM_USERNAME = /^@?[A-Za-z0-9_]{5,32}$/;

export function createApplicationSchema(km: boolean) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  return z
    .object({
      fullName: z
        .string()
        .trim()
        .min(2, t('សូមបញ្ចូលឈ្មោះពេញ', 'Enter your full name'))
        .max(120),
      title: z
        .string()
        .trim()
        .min(2, t('សូមបញ្ចូលមុខតំណែង', 'Enter your professional title'))
        .max(120),
      licenseNumber: z
        .string()
        .trim()
        .min(3, t('សូមបញ្ចូលលេខអាជ្ញាប័ណ្ណ', 'Enter your license number'))
        .max(60),
      issuingBody: z
        .string()
        .trim()
        .min(2, t('សូមបញ្ចូលស្ថាប័នចេញអាជ្ញាប័ណ្ណ', 'Enter who issued your license'))
        .max(120),
      document: z
        .custom<FileList>(
          (value) =>
            typeof FileList !== 'undefined' &&
            value instanceof FileList &&
            value.length > 0,
          t('សូមភ្ជាប់រូបថត ឬឯកសារអាជ្ញាប័ណ្ណ', 'Attach a photo or PDF of your license'),
        )
        .refine(
          (files) => DOCUMENT_TYPES.includes(files[0]?.type ?? ''),
          t('ទទួលយកតែ PDF, JPG ឬ PNG', 'Use a PDF, JPG or PNG file'),
        )
        .refine(
          (files) => (files[0]?.size ?? 0) <= MAX_DOCUMENT_BYTES,
          t('ឯកសារត្រូវតូចជាង 5 MB', 'The file must be 5 MB or smaller'),
        ),
      specialties: z.array(z.string()),
      hasOtherSpecialty: z.boolean(),
      otherSpecialties: z.string().trim(),
      languages: z
        .array(z.string())
        .min(1, t('សូមជ្រើសរើសយ៉ាងហោចណាស់មួយ', 'Choose at least one language')),
      yearsExperience: z
        .number(t('សូមបញ្ចូលចំនួនឆ្នាំ', 'Enter your years of experience'))
        .int()
        .min(0, t('សូមបញ្ចូលចំនួនឆ្នាំ', 'Enter your years of experience'))
        .max(60, t('សូមពិនិត្យចំនួនឆ្នាំម្តងទៀត', 'Check the number of years')),
      phone: z
        .string()
        .transform((value) => value.replace(/[\s.()]/g, ''))
        .refine(
          (value) => CAMBODIA_PHONE.test(value),
          t('សូមបញ្ចូលលេខទូរស័ព្ទកម្ពុជា ឧ. 012 345 678', 'Enter a Cambodian phone number, for example 012 345 678'),
        ),
      sameTelegram: z.boolean(),
      telegram: z.string().trim(),
      motivation: z.string().trim().max(2000),
      confirm: z.boolean().refine((value) => value, {
        message: t('សូមបញ្ជាក់ថាព័ត៌មានត្រឹមត្រូវ', 'Please confirm your details are true'),
      }),
    })
    .superRefine((values, context) => {
      const others = values.hasOtherSpecialty
        ? splitOtherSpecialties(values.otherSpecialties)
        : [];

      if (values.hasOtherSpecialty && others.length === 0) {
        context.addIssue({
          code: 'custom',
          path: ['otherSpecialties'],
          message: t('សូមសរសេរជំនាញរបស់អ្នក', 'Type your specialty'),
        });
      } else if (others.length > MAX_OTHER_SPECIALTIES) {
        context.addIssue({
          code: 'custom',
          path: ['otherSpecialties'],
          message: t(
            `បញ្ចូលបានច្រើនបំផុត ${MAX_OTHER_SPECIALTIES}`,
            `Add up to ${MAX_OTHER_SPECIALTIES} specialties`,
          ),
        });
      } else if (others.some((item) => item.length > MAX_SPECIALTY_LENGTH)) {
        context.addIssue({
          code: 'custom',
          path: ['otherSpecialties'],
          message: t(
            `ជំនាញនីមួយៗមិនលើស ${MAX_SPECIALTY_LENGTH} តួអក្សរ`,
            `Keep each specialty under ${MAX_SPECIALTY_LENGTH} characters`,
          ),
        });
      }

      if (values.specialties.length === 0 && !values.hasOtherSpecialty) {
        context.addIssue({
          code: 'custom',
          path: ['specialties'],
          message: t('សូមជ្រើសរើសយ៉ាងហោចណាស់មួយ', 'Choose at least one specialty'),
        });
      }

      if (
        !values.sameTelegram &&
        values.telegram &&
        !TELEGRAM_USERNAME.test(values.telegram)
      ) {
        context.addIssue({
          code: 'custom',
          path: ['telegram'],
          message: t('ឈ្មោះ Telegram មិនត្រឹមត្រូវ ឧ. @sopheap', 'Enter a Telegram username, for example @sopheap'),
        });
      }
    })
    // Output one list: chosen chips plus anything typed under "Other", without duplicates.
    .transform((values) => ({
      ...values,
      specialties: [
        ...new Set([
          ...values.specialties,
          ...(values.hasOtherSpecialty
            ? splitOtherSpecialties(values.otherSpecialties)
            : []),
        ]),
      ],
    }));
}

export type ApplicationFormInput = z.input<ReturnType<typeof createApplicationSchema>>;
export type ApplicationFormValues = z.output<ReturnType<typeof createApplicationSchema>>;

// Demo only: the latest application of the signed in user, or null if they never applied.
export const initialApplication: ProfessionalApplication | null = null;

export const demoRejectedNote =
  'The license photo is too blurry to read the number. Please upload a clearer photo.';
