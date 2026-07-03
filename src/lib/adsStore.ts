// lib/adsStore.ts
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

// Cache configuration
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const CACHE_KEY = 'ads_cache';
const CACHE_TIMESTAMP_KEY = 'ads_cache_timestamp';

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

// Cache management functions
function getCachedAds(): AdItem[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) return null;
    
    const age = Date.now() - parseInt(timestamp);
    if (age > CACHE_DURATION) {
      // Cache is expired
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return null;
    }
    
    return JSON.parse(cached);
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

function setCachedAds(ads: AdItem[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(ads));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error caching ads:', error);
  }
}

function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
}

// ============= ORIGINAL FUNCTIONS (PRESERVED) =============

export async function addAd(item: Omit<AdItem, 'id' | 'uploadedAt'>): Promise<AdItem | null> {
  const { data, error } = await supabase.from('ads').insert({
    title: item.title,
    media_type: item.type,
    media_url: item.dataUrl,
    uploaded_by: item.uploadedByName,
    uploaded_by_id: item.uploadedById,
    is_active: item.active,
  }).select().single();
  
  if (error || !data) { 
    console.error('addAd', error); 
    return null; 
  }
  
  const newAd = rowToAd(data);
  
  // Update cache with the new ad
  const cached = getCachedAds();
  if (cached) {
    const updatedCache = [newAd, ...cached];
    setCachedAds(updatedCache);
  }
  
  return newAd;
}

export async function toggleAd(id: string) {
  const { data } = await supabase.from('ads').select('is_active').eq('id', id).single();
  if (!data) return;
  
  await supabase.from('ads').update({ is_active: !data.is_active }).eq('id', id);
  
  // Update cache
  const cached = getCachedAds();
  if (cached) {
    const updatedCache = cached.map(ad => 
      ad.id === id ? { ...ad, active: !data.is_active } : ad
    );
    setCachedAds(updatedCache);
  }
}

export async function deleteAd(id: string) {
  await supabase.from('ads').delete().eq('id', id);
  
  // Update cache
  const cached = getCachedAds();
  if (cached) {
    const updatedCache = cached.filter(ad => ad.id !== id);
    setCachedAds(updatedCache);
  }
}

// ============= ENHANCED useAds HOOK WITH CACHING =============

export function useAds(): { 
  ads: AdItem[]; 
  isLoading: boolean; 
  error: string | null;
  lastFetched: Date | null;
  refreshAds: () => Promise<void>;
  clearCache: () => void;
} {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const loadAds = async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = getCachedAds();
        if (cached && cached.length > 0) {
          console.log(`📦 Using cached ads (${cached.length} items)`);
          setAds(cached);
          const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
          if (timestamp) {
            setLastFetched(new Date(parseInt(timestamp)));
          }
          setIsLoading(false);
          return;
        }
      }

      // Fetch from Supabase
      console.log('🌐 Fetching fresh ads from Supabase...');
      const { data, error: fetchError } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const adItems = (data ?? []).map(rowToAd);
      
      // Cache the results
      setCachedAds(adItems);
      setAds(adItems);
      setLastFetched(new Date());
      
      console.log(`✅ Loaded ${adItems.length} ads from Supabase`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load ads';
      console.error('Error loading ads:', errorMessage);
      setError(errorMessage);
      
      // If fetch fails but we have cached data, use it as fallback
      const cached = getCachedAds();
      if (cached && cached.length > 0) {
        console.log('⚠️ Using cached ads as fallback due to error');
        setAds(cached);
        const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (timestamp) {
          setLastFetched(new Date(parseInt(timestamp)));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    let mounted = true;
    let subscription: any;

    const init = async () => {
      await loadAds(false);
      
      if (!mounted) return;

      // Set up real-time subscription for updates
      subscription = supabase
        .channel('ads_rt')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'ads' }, 
          () => {
            // When any change happens, refresh in background
            console.log('🔄 Real-time update detected, refreshing...');
            loadAds(true);
          }
        )
        .subscribe();
    };

    init();

    return () => {
      mounted = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  // Auto-refresh every hour if the page is open (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if the cache is older than 1 hour
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age > 60 * 60 * 1000) { // 1 hour
          console.log('🔄 Auto-refreshing ads...');
          loadAds(true);
        }
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, []);

  return {
    ads,
    isLoading,
    error,
    lastFetched,
    refreshAds: () => loadAds(true),
    clearCache: () => {
      clearCache();
      setAds([]);
      setLastFetched(null);
      console.log('🗑️ Cache cleared');
    }
  };
}

// ============= ORIGINAL HELPER FUNCTIONS (PRESERVED) =============

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============= APPOINTMENT FUNCTIONS (ADDED BACK) =============

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name?: string;
  doctor_id?: string;
  doctor_name?: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  type: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export async function getAppointments(patientId?: string): Promise<Appointment[]> {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients:patient_id (first_name, last_name),
      doctors:doctor_id (first_name, last_name)
    `)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (patientId) {
    query = query.eq('patient_id', patientId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }

  return data.map((appointment: any) => ({
    ...appointment,
    patient_name: appointment.patients 
      ? `${appointment.patients.first_name} ${appointment.patients.last_name}`
      : 'Unknown Patient',
    doctor_name: appointment.doctors
      ? `${appointment.doctors.first_name} ${appointment.doctors.last_name}`
      : 'Unknown Doctor',
  }));
}

export async function createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      duration: appointment.duration,
      type: appointment.type,
      status: appointment.status || 'scheduled',
      notes: appointment.notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    return null;
  }

  return data;
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating appointment:', error);
    return null;
  }

  return data;
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting appointment:', error);
    return false;
  }

  return true;
}

// ============= PATIENT FUNCTIONS (ADDED BACK) =============

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  medical_history?: any;
  emergency_contact?: any;
  created_at: string;
  updated_at: string;
}

export async function getPatients(search?: string): Promise<Patient[]> {
  let query = supabase
    .from('patients')
    .select('*')
    .order('first_name', { ascending: true });

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching patients:', error);
    return [];
  }

  return data;
}

export async function getPatient(id: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching patient:', error);
    return null;
  }

  return data;
}

export async function createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('patients')
    .insert(patient)
    .select()
    .single();

  if (error) {
    console.error('Error creating patient:', error);
    return null;
  }

  return data;
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating patient:', error);
    return null;
  }

  return data;
}

// ============= DOCTOR FUNCTIONS (ADDED BACK) =============

export interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  specialization?: string;
  is_active: boolean;
  working_hours?: any;
  created_at: string;
  updated_at: string;
}

export async function getDoctors(activeOnly: boolean = true): Promise<Doctor[]> {
  let query = supabase
    .from('doctors')
    .select('*')
    .order('first_name', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }

  return data;
}
