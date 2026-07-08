// Single source of truth for clinic branding on printed docs.
// Editable at runtime via the Settings page; persisted to Supabase (shared)
// with a localStorage cache for instant offline reads.
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'app.clinicConfig';
const REMOTE_KEY = 'clinic';

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

let remoteLoaded = false;
const writeLocal = (c: ClinicConfig) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  window.dispatchEvent(new CustomEvent('clinic-config-changed'));
};

export const loadClinicConfigFromRemote = async () => {
  if (remoteLoaded) return;
  remoteLoaded = true;
  try {
    const { data } = await (supabase as any)
      .from('app_settings').select('value').eq('key', REMOTE_KEY).maybeSingle();
    if (data?.value) writeLocal({ ...defaults, ...(data.value as any) });
  } catch {}
};

export const getClinicConfig = (): ClinicConfig => read();

export const saveClinicConfig = (c: Partial<ClinicConfig>) => {
  const merged = { ...read(), ...c };
  writeLocal(merged);
  // Best-effort remote sync so every device/user sees the same values.
  (supabase as any)
    .from('app_settings')
    .upsert({ key: REMOTE_KEY, value: merged, updated_at: new Date().toISOString() })
    .then(() => {}, () => {});
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