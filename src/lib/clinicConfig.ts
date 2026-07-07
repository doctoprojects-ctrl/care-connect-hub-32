// Single source of truth for clinic branding on printed docs.
// Editable at runtime via the Settings page; persisted to localStorage.
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'app.clinicConfig';

export type ClinicConfig = {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  currency: string;
  currencySymbol: string;
  logoDataUrl: string;
};

const defaults: ClinicConfig = {
  name: 'MediCare Clinic',
  tagline: 'Caring for you, every step',
  address: '12 Health Avenue, Harare, Zimbabwe',
  phone: '+263 24 270 0000',
  email: 'info@medicare.clinic',
  taxId: 'TIN 1000-2030-40',
  currency: 'USD',
  currencySymbol: '$',
  logoDataUrl: '',
};

const read = (): ClinicConfig => {
  if (typeof window === 'undefined') return defaults;
  try {
    const s = window.localStorage.getItem(STORAGE_KEY);
    return s ? { ...defaults, ...JSON.parse(s) } : defaults;
  } catch {
    return defaults;
  }
};

export const getClinicConfig = (): ClinicConfig => read();

export const saveClinicConfig = (c: Partial<ClinicConfig>) => {
  const merged = { ...read(), ...c };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent('clinic-config-changed'));
};

// Live proxy so existing `clinicConfig.name` call sites keep working
// and always reflect the current stored value at read time.
export const clinicConfig = new Proxy({} as ClinicConfig, {
  get: (_t, key: string) => (read() as any)[key],
}) as ClinicConfig;

export const money = (n: number) =>
  `${read().currencySymbol}${(Number(n) || 0).toFixed(2)}`;

export const useClinicConfig = (): ClinicConfig => {
  const [c, setC] = useState<ClinicConfig>(read);
  useEffect(() => {
    const h = () => setC(read());
    window.addEventListener('clinic-config-changed', h);
    window.addEventListener('storage', h);
    return () => {
      window.removeEventListener('clinic-config-changed', h);
      window.removeEventListener('storage', h);
    };
  }, []);
  return c;
};