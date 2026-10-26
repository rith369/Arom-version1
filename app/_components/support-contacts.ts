// Crisis helplines and AROM support contact shown to users in Profile and
// Settings. Admins manage both in Admin, Settings. Helplines come from the
// crisis_resources table and the support contact from the support_contact
// table, both returned by GET /api/crisis-resources.

export type CrisisHelpline = {
  id: string;
  name: string;
  kmName: string;
  description: string;
  kmDescription: string;
  phone: string;
  sms: string;
  website: string;
  hours: string;
  kmHours: string;
  isActive: boolean;
  sortOrder: number;
};

export type SupportContact = {
  email: string;
  phone: string;
  hours: string;
  kmHours: string;
};

// Empty until GET /api/crisis-resources answers.
export const SUPPORT_CONTACT: SupportContact = {
  email: '',
  phone: '',
  hours: '',
  kmHours: '',
};

// Helplines can be short codes (for example 3 or 4 digits) or full numbers.
export function isValidPhone(value: string) {
  const digits = value.replace(/[\s().-]/g, '');
  return /^\+?\d{3,15}$/.test(digits);
}

export function isValidWebsite(value: string) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function smsHref(phone: string) {
  return `sms:${phone.replace(/[^\d+]/g, '')}`;
}

export function activeHelplines(list: CrisisHelpline[]) {
  return list
    .filter((item) => item.isActive && (item.phone || item.website))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Active helplines as one chat message, in the reader's language. A
 * professional sends it from the chat with a client (quick replies panel).
 */
export function helplineMessage(list: CrisisHelpline[], language: 'en' | 'km') {
  const km = language === 'km';
  const lines = activeHelplines(list).map((item) => {
    const name = (km && item.kmName) || item.name;
    const hours = (km && item.kmHours) || item.hours;
    const ways = [
      item.phone && `${km ? 'ហៅ' : 'Call'} ${item.phone}`,
      item.sms && `${km ? 'ផ្ញើសារ' : 'Text'} ${item.sms}`,
      !item.phone && item.website,
    ].filter(Boolean);
    return `• ${name}: ${ways.join(', ')}${hours ? ` (${hours})` : ''}`;
  });
  if (lines.length === 0) return '';
  const intro = km
    ? 'ប្រសិនបើអ្នកមានអារម្មណ៍មិនមានសុវត្ថិភាព ឬកំពុងគិតចង់ធ្វើបាបខ្លួនឯង សូមទាក់ទងខ្សែជំនួយទាំងនេះឥឡូវនេះ៖'
    : 'If you feel unsafe or are thinking about hurting yourself, please contact one of these helplines now:';
  return [intro, ...lines].join('\n');
}
