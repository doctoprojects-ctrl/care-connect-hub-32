import { useEffect, useState } from 'react';

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

const KEY = 'mpms.queue.tickets.v1';
const EVT = 'mpms:queue-updated';

const DEPT_PREFIX: Record<QueueDept, string> = {
  doctor: 'DR',
  pharmacy: 'PH',
  triage: 'TR',
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function read(): QueueTicket[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueueTicket[];
  } catch {
    return [];
  }
}

function write(tickets: QueueTicket[]) {
  localStorage.setItem(KEY, JSON.stringify(tickets));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function getTodaysTickets(): QueueTicket[] {
  const today = todayKey();
  return read().filter(t => t.createdAt.slice(0, 10) === today);
}

export function getAllTickets(): QueueTicket[] {
  return read();
}

export function issueTicket(input: {
  dept: QueueDept;
  patientName: string;
  patientId?: string;
  appointmentId?: string;
}): QueueTicket {
  const tickets = read();
  const today = todayKey();
  const sameDept = tickets.filter(
    t => t.dept === input.dept && t.createdAt.slice(0, 10) === today
  );
  const number = sameDept.length + 1;
  const code = `${DEPT_PREFIX[input.dept]}-${String(number).padStart(2, '0')}`;
  const ticket: QueueTicket = {
    id: `tk-${Date.now()}`,
    dept: input.dept,
    number,
    code,
    patientId: input.patientId,
    patientName: input.patientName,
    appointmentId: input.appointmentId,
    status: 'waiting',
    createdAt: new Date().toISOString(),
  };
  write([...tickets, ticket]);
  return ticket;
}

export function updateTicket(id: string, patch: Partial<QueueTicket>) {
  const tickets = read().map(t => (t.id === id ? { ...t, ...patch } : t));
  write(tickets);
}

export function callNext(dept: QueueDept, room: string, calledBy?: string): QueueTicket | null {
  const tickets = read();
  const today = todayKey();
  const next = tickets.find(
    t => t.dept === dept && t.status === 'waiting' && t.createdAt.slice(0, 10) === today
  );
  if (!next) return null;
  const now = new Date().toISOString();
  const updated: QueueTicket = { ...next, status: 'called', room, calledAt: now, calledBy };
  write(tickets.map(t => (t.id === next.id ? updated : t)));
  return updated;
}

export function markServing(id: string) {
  updateTicket(id, { status: 'serving', servedAt: new Date().toISOString() });
}

export function markDone(id: string) {
  updateTicket(id, { status: 'done', doneAt: new Date().toISOString() });
}

export function skipTicket(id: string) {
  updateTicket(id, { status: 'skipped' });
}

export function useQueueTickets(): QueueTicket[] {
  const [tickets, setTickets] = useState<QueueTicket[]>(() => getTodaysTickets());
  useEffect(() => {
    const refresh = () => setTickets(getTodaysTickets());
    window.addEventListener(EVT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return tickets;
}