// Single source of truth for clinic branding on printed docs.
// Edit this file to change clinic name, address, currency, etc.
export const clinicConfig = {
  name: 'MediCare Clinic',
  tagline: 'Caring for you, every step',
  address: '12 Health Avenue, Harare, Zimbabwe',
  phone: '+263 24 270 0000',
  email: 'info@medicare.clinic',
  taxId: 'TIN 1000-2030-40',
  currency: 'USD',
  currencySymbol: '$',
};

export const money = (n: number) =>
  `${clinicConfig.currencySymbol}${(Number(n) || 0).toFixed(2)}`;