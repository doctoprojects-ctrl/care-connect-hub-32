import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type QueueDept = 'doctor' | 'pharmacy' | 'triage';
export type TicketStatus = 'waiting' | 'called' | 'serving' | 'done' | 'skipped';

export interface QueueTicket {
  id: string;
  dept: QueueDept;
  number: number;
  code: string; // e.g. DR-01
  patientId?: string;
  patientName: string;
  appointmentId?: string;
  status: TicketStatus;
  room?: string;
  createdAt: string;
  calledAt?: string;
  servedAt?: string;
  doneAt?: string;
  calledBy?: string;
}

function rowToTicket(r: any): QueueTicket {
  return {
    id: r.id,
    dept: r.dept,
    number: r.number,
    code: r.code,
    patientId: r.patient_id ?? undefined,
    patientName: r.patient_name,
    appointmentId: r.appointment_id ?? undefined,
    status: r.status,
    room: r.room ?? undefined,
    createdAt: r.created_at,
    calledAt: r.called_at ?? undefined,
    servedAt: r.served_at ?? undefined,
    doneAt: r.done_at ?? undefined,
    calledBy: r.called_by ?? undefined,
  };
}

function todayStartISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function issueTicket(input: {
  dept: QueueDept;
  patientName: string;
  patientId?: string;
  appointmentId?: string;
}): Promise<QueueTicket | null> {
  const { data, error } = await supabase.rpc('issue_queue_ticket', {
    p_dept: input.dept,
    p_patient_name: input.patientName,
    p_patient_id: input.patientId ?? null,
    p_appointment_id: input.appointmentId ?? null,
  });
  if (error || !data) {
    console.error('issueTicket', error);
    return null;
  }
  return rowToTicket(Array.isArray(data) ? data[0] : data);
}

export async function callNext(dept: QueueDept, room: string, calledBy?: string): Promise<QueueTicket | null> {
  const { data: waiting } = await supabase
    .from('queue_tickets')
    .select('*')
    .eq('dept', dept)
    .eq('status', 'waiting')
    .gte('created_at', todayStartISO())
    .order('created_at', { ascending: true })
    .limit(1);
  const next = waiting?.[0];
  if (!next) return null;
  const { data: updated } = await supabase
    .from('queue_tickets')
    .update({ status: 'called', room, called_by: calledBy, called_at: new Date().toISOString() })
    .eq('id', next.id)
    .select()
    .single();
  return updated ? rowToTicket(updated) : null;
}

export async function markServing(id: string) {
  await supabase.from('queue_tickets').update({ status: 'serving', served_at: new Date().toISOString() }).eq('id', id);
}
export async function markDone(id: string) {
  await supabase.from('queue_tickets').update({ status: 'done', done_at: new Date().toISOString() }).eq('id', id);
}
export async function skipTicket(id: string) {
  await supabase.from('queue_tickets').update({ status: 'skipped' }).eq('id', id);
}

export function useQueueTickets(): QueueTicket[] {
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from('queue_tickets')
        .select('*')
        .gte('created_at', todayStartISO())
        .order('created_at', { ascending: true });
      if (mounted) setTickets((data ?? []).map(rowToTicket));
    };
    load();
    const channel = supabase
      .channel('queue_tickets_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_tickets' }, () => load())
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);
  return tickets;
}