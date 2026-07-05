import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PrescriptionItem {
  name: string;
  quantity: number;
  unitPrice?: number;
  itemId?: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  consultationId?: string | null;
  patientId: string;
  patientName: string;
  doctorName?: string;
  items: PrescriptionItem[];
  notes?: string;
  status: 'pending' | 'dispensed' | 'cancelled';
  paid: boolean;
  paidAt?: string | null;
  paidBy?: string | null;
  dispensedAt?: string | null;
  dispensedBy?: string | null;
  total: number;
  createdAt: string;
}

function rowToPrescription(r: any): Prescription {
  return {
    id: r.id,
    consultationId: r.consultation_id,
    patientId: r.patient_id,
    patientName: r.patient_name,
    doctorName: r.doctor_name ?? undefined,
    items: Array.isArray(r.items) ? r.items : [],
    notes: r.notes ?? undefined,
    status: (r.status as Prescription['status']) ?? 'pending',
    paid: !!r.paid,
    paidAt: r.paid_at,
    paidBy: r.paid_by,
    dispensedAt: r.dispensed_at,
    dispensedBy: r.dispensed_by,
    total: Number(r.total ?? 0),
    createdAt: r.created_at,
  };
}

export function usePrescriptions(patientId?: string) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      let q: any = (supabase as any).from('prescriptions').select('*').order('created_at', { ascending: false });
      if (patientId) q = q.eq('patient_id', patientId);
      const { data, error } = await q;
      if (!mounted) return;
      if (!error && data) setPrescriptions(data.map(rowToPrescription));
      setLoading(false);
    };
    load();
    const channel = (supabase as any)
      .channel('prescriptions-' + (patientId ?? 'all'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions' }, () => load())
      .subscribe();
    return () => {
      mounted = false;
      (supabase as any).removeChannel(channel);
    };
  }, [patientId]);

  return { prescriptions, loading };
}

export async function createPrescription(input: {
  consultationId?: string | null;
  patientId: string;
  patientName: string;
  doctorName?: string;
  items: PrescriptionItem[];
  notes?: string;
}): Promise<Prescription | null> {
  const total = input.items.reduce((s, i) => s + (i.unitPrice ?? 0) * (i.quantity || 0), 0);
  const { data, error } = await (supabase as any)
    .from('prescriptions')
    .insert({
      consultation_id: input.consultationId ?? null,
      patient_id: input.patientId,
      patient_name: input.patientName,
      doctor_name: input.doctorName ?? null,
      items: input.items,
      notes: input.notes ?? null,
      total,
    })
    .select()
    .single();
  if (error || !data) return null;
  return rowToPrescription(data);
}

export async function markPrescriptionPaid(id: string, byName: string) {
  await (supabase as any)
    .from('prescriptions')
    .update({ paid: true, paid_at: new Date().toISOString(), paid_by: byName })
    .eq('id', id);
}

export async function dispensePrescription(id: string, byName: string) {
  await (supabase as any)
    .from('prescriptions')
    .update({ status: 'dispensed', dispensed_at: new Date().toISOString(), dispensed_by: byName })
    .eq('id', id);
}

export async function cancelPrescription(id: string) {
  await (supabase as any).from('prescriptions').update({ status: 'cancelled' }).eq('id', id);
}