export type AdminSettings = {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  supportHours: string;
  kmSupportHours: string;
  defaultAdminLanguage: 'en' | 'km';
};

export const initialSettings: AdminSettings = {
  platformName: 'ARom',
  supportEmail: '',
  supportPhone: '',
  supportHours: '',
  kmSupportHours: '',
  defaultAdminLanguage: 'en',
};
