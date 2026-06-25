import { useEffect, useState } from 'react';

export type AdMediaType = 'image' | 'video';

export interface AdItem {
  id: string;
  title: string;
  type: AdMediaType;
  dataUrl: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
  active: boolean;
}

const KEY = 'mpms.ads.v1';
const EVT = 'mpms:ads-updated';

function read(): AdItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AdItem[];
  } catch {
    return [];
  }
}

function write(items: AdItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function getAds(): AdItem[] {
  return read();
}

export function addAd(item: Omit<AdItem, 'id' | 'uploadedAt'>): AdItem {
  const ad: AdItem = {
    ...item,
    id: `ad-${Date.now()}`,
    uploadedAt: new Date().toISOString(),
  };
  write([ad, ...read()]);
  return ad;
}

export function toggleAd(id: string) {
  write(read().map(a => (a.id === id ? { ...a, active: !a.active } : a)));
}

export function deleteAd(id: string) {
  write(read().filter(a => a.id !== id));
}

export function useAds(): AdItem[] {
  const [ads, setAds] = useState<AdItem[]>(() => read());
  useEffect(() => {
    const refresh = () => setAds(read());
    window.addEventListener(EVT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return ads;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}