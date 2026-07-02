import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

function rowToAd(r: any): AdItem {
  return {
    id: r.id,
    title: r.title,
    type: (r.media_type as AdMediaType) ?? 'image',
    dataUrl: r.media_url,
    uploadedById: r.uploaded_by_id ?? '',
    uploadedByName: r.uploaded_by ?? 'Unknown',
    uploadedAt: r.created_at,
    active: !!r.is_active,
  };
}

export async function addAd(item: Omit<AdItem, 'id' | 'uploadedAt'>): Promise<AdItem | null> {
  const { data, error } = await supabase.from('ads').insert({
    title: item.title,
    media_type: item.type,
    media_url: item.dataUrl,
    uploaded_by: item.uploadedByName,
    uploaded_by_id: item.uploadedById,
    is_active: item.active,
  }).select().single();
  if (error || !data) { console.error('addAd', error); return null; }
  return rowToAd(data);
}

export async function toggleAd(id: string) {
  const { data } = await supabase.from('ads').select('is_active').eq('id', id).single();
  if (!data) return;
  await supabase.from('ads').update({ is_active: !data.is_active }).eq('id', id);
}

export async function deleteAd(id: string) {
  await supabase.from('ads').delete().eq('id', id);
}

export function useAds(): AdItem[] {
  const [ads, setAds] = useState<AdItem[]>([]);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
      if (mounted) setAds((data ?? []).map(rowToAd));
    };
    load();
    const channel = supabase.channel('ads_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, () => load())
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
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