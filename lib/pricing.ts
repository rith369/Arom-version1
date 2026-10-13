// Session prices are shown to users so they know what to expect, but AROM
// takes no payments yet. Each professional chooses free, one price, or a
// range. While testing, a note tells users nothing is paid.

export type SessionPrice =
  | { kind: 'free' }
  | { kind: 'fixed'; amount: number }
  | { kind: 'range'; min: number; max: number };

// On while AROM is in testing: users see a "no payment during testing" note
// under every price. Admins have a switch for it in Settings.
export const FREE_DURING_TESTING = true;

export const MAX_PRICE_USD = 500;

const usd = (value: number) => `$${Number.isInteger(value) ? value : value.toFixed(2)}`;

export function formatPrice(price: SessionPrice, km: boolean) {
  if (price.kind === 'free') return km ? 'ឥតគិតថ្លៃ' : 'Free';
  if (price.kind === 'fixed') return km ? `${usd(price.amount)} ក្នុងមួយវគ្គ` : `${usd(price.amount)} a session`;
  return km
    ? `${usd(price.min)} ដល់ ${usd(price.max)} ក្នុងមួយវគ្គ`
    : `${usd(price.min)} to ${usd(price.max)} a session`;
}

export function noPaymentNote(km: boolean) {
  return km ? 'មិនទាន់គិតប្រាក់ក្នុងអំឡុងពេលសាកល្បង' : 'No payment during testing';
}

const validAmount = (value: number) =>
  Number.isFinite(value) && value > 0 && value <= MAX_PRICE_USD;

export function isValidPrice(price: SessionPrice) {
  if (price.kind === 'free') return true;
  if (price.kind === 'fixed') return validAmount(price.amount);
  return validAmount(price.min) && validAmount(price.max) && price.min < price.max;
}
