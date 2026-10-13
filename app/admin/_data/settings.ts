import {
  CRISIS_HELPLINES,
  SUPPORT_CONTACT,
  type CrisisHelpline,
  type SupportContact,
} from '../../_components/support-contacts';

// Support contact shown to users in Profile and Settings. The platform name
// and admin language settings were removed: the name is fixed as AROM and
// the admin area is English only.
export type AdminSettings = SupportContact;

export const initialSettings: AdminSettings = { ...SUPPORT_CONTACT };

export const initialCrisisHelplines: CrisisHelpline[] = CRISIS_HELPLINES.map(
  (item) => ({ ...item }),
);
