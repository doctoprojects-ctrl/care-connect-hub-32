import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { loadClinicConfigFromRemote } from '@/lib/clinicConfig';
import {
  mockPatients,
  mockDoctors,
  mockAppointments,
  mockPharmacyItems,
  mockEquipment,
  mockServicePrices,
  mockInvoices,
  mockPatientCredits,
  mockCashUps,
} from '@/store/mockData';
import type { Patient, Doctor, Appointment, Invoice } from '@/types';

// ==== row mappers ====
const rowToPatient = (r: any): Patient => ({
  id: r.id,
  firstName: r.first_name,
  lastName: r.last_name,
  dateOfBirth: r.date_of_birth ?? '',
  gender: (r.gender as Patient['gender']) ?? 'other',
  phone: r.phone ?? '',
  email: r.email ?? '',
  address: r.address ?? '',
  emergencyContact: r.emergency_contact ?? { name: '', phone: '', relationship: '' },
  medicalHistory: r.medical_history ?? { allergies: [], currentMedications: [], chronicConditions: [], pastSurgeries: [] },
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const rowToDoctor = (r: any): Doctor => ({
  id: r.id,
  firstName: r.first_name,
  lastName: r.last_name,
  specialization: r.specialization ?? '',
  email: r.email ?? '',
  phone: r.phone ?? '',
  workingHours: r.working_hours ?? { start: '09:00', end: '17:00', workingDays: [1, 2, 3, 4, 5] },
  isActive: r.is_active,
});

const rowToAppt = (r: any): Appointment => ({
  id: r.id,
  patientId: r.patient_id ?? '',
  doctorId: r.doctor_id ?? '',
  appointmentDate: r.appointment_date,
  appointmentTime: r.appointment_time,
  duration: r.duration ?? 30,
  type: r.type,
  status: r.status,
  notes: r.notes ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

function replaceArray<T>(arr: T[], next: T[]) {
  arr.splice(0, arr.length, ...next);
}

export async function hydratePatients() {
  const { data } = await supabase.from('patients').select('*').order('created_at');
  if (data) replaceArray(mockPatients, data.map(rowToPatient));
}

export async function hydrateDoctors() {
  const { data } = await supabase.from('doctors').select('*').order('created_at');
  if (data) replaceArray(mockDoctors, data.map(rowToDoctor));
}

export async function hydrateAppointments() {
  const { data } = await supabase.from('appointments').select('*').order('appointment_date');
  if (data) replaceArray(mockAppointments, data.map(rowToAppt));
}

export async function hydrateServices() {
  const { data } = await supabase.from('service_prices').select('*').order('code');
  if (data) replaceArray(mockServicePrices, data.map((r: any) => ({
    id: r.id, code: r.code, name: r.name, category: r.category ?? '', price: Number(r.price), description: r.description ?? undefined,
  })));
}

export async function hydratePharmacy() {
  const { data } = await supabase.from('pharmacy_items').select('*').order('name');
  if (data) replaceArray(mockPharmacyItems, data.map((r: any) => ({
    id: r.id, barcode: r.barcode ?? '', name: r.name, category: r.category ?? '',
    unitPrice: Number(r.unit_price), stock: r.stock, reorderLevel: r.reorder_level,
    supplier: r.supplier ?? undefined, expiryDate: r.expiry_date ?? undefined,
  })));
}

export async function hydrateEquipment() {
  const { data } = await supabase.from('equipment').select('*').order('name');
  if (data) replaceArray(mockEquipment, data.map((r: any) => ({
    id: r.id, barcode: r.barcode ?? '', name: r.name, serialNumber: r.serial_number ?? '',
    location: r.location ?? '', purchaseDate: r.purchase_date ?? '', status: r.status, notes: r.notes ?? undefined,
  })));
}

export async function hydrateInvoices() {
  const { data } = await supabase.from('invoices').select('*').order('issued_date', { ascending: false });
  if (data) replaceArray(mockInvoices, data.map((r: any): Invoice => ({
    id: r.id, invoiceNumber: r.invoice_number,
    patientId: r.patient_id ?? '', patientName: r.patient_name ?? '',
    issuedDate: r.issued_date, dueDate: r.due_date ?? r.issued_date,
    lines: (r.lines as any) ?? [], total: Number(r.total), amountPaid: Number(r.amount_paid),
    status: r.status, notes: r.notes ?? undefined,
  })));
}

export async function hydrateCredits() {
  const { data } = await supabase.from('patient_credits').select('*');
  if (data) replaceArray(mockPatientCredits, data.map((r: any) => ({
    patientId: r.patient_id, patientName: r.patient_name ?? '', balance: Number(r.balance), lastUpdated: r.last_updated,
  })));
}

export async function hydrateCashUps() {
  const { data } = await supabase.from('cash_ups').select('*').order('opened_at', { ascending: false });
  if (data) replaceArray(mockCashUps, data.map((r: any) => ({
    id: r.id, shiftNumber: r.shift_number, cashierId: r.cashier_id ?? '', cashierName: r.cashier_name ?? '',
    openedAt: r.opened_at, closedAt: r.closed_at ?? '',
    openingFloat: Number(r.opening_float),
    expectedCash: Number(r.expected_cash), expectedCard: Number(r.expected_card), expectedMobile: Number(r.expected_mobile),
    countedCash: Number(r.counted_cash), countedCard: Number(r.counted_card), countedMobile: Number(r.counted_mobile),
    variance: Number(r.variance), notes: r.notes ?? undefined,
  })));
}

const VERSION_EVT = 'mpms:data-version';
let _version = 0;
function bumpVersion() {
  _version++;
  window.dispatchEvent(new CustomEvent(VERSION_EVT));
}
export function useDataVersion(): number {
  const [v, setV] = useState(_version);
  useEffect(() => {
    const h = () => setV(_version);
    window.addEventListener(VERSION_EVT, h);
    return () => window.removeEventListener(VERSION_EVT, h);
  }, []);
  return v;
}

export async function hydrateAll() {
  await Promise.all([
    hydratePatients(), hydrateDoctors(), hydrateAppointments(),
    hydrateServices(), hydratePharmacy(), hydrateEquipment(),
    hydrateInvoices(), hydrateCredits(), hydrateCashUps(),
  ]);
  bumpVersion();
}

// ==== Write helpers (mirror mock mutations into Supabase) ====
export async function upsertPatientDb(p: Patient) {
  await supabase.from('patients').upsert({
    id: p.id,
    first_name: p.firstName, last_name: p.lastName,
    date_of_birth: p.dateOfBirth || null, gender: p.gender,
    phone: p.phone, email: p.email, address: p.address,
    emergency_contact: p.emergencyContact,
    medical_history: p.medicalHistory,
  });
}

export async function upsertAppointmentDb(a: Appointment) {
  await supabase.from('appointments').upsert({
    id: a.id,
    patient_id: a.patientId || null,
    doctor_id: a.doctorId || null,
    appointment_date: a.appointmentDate,
    appointment_time: a.appointmentTime,
    duration: a.duration,
    type: a.type, status: a.status, notes: a.notes ?? null,
  });
}

export async function upsertInvoiceDb(inv: Invoice) {
  await supabase.from('invoices').upsert({
    id: inv.id,
    invoice_number: inv.invoiceNumber,
    patient_id: inv.patientId || null, patient_name: inv.patientName,
    issued_date: inv.issuedDate, due_date: inv.dueDate,
    lines: inv.lines as any, total: inv.total, amount_paid: inv.amountPaid,
    status: inv.status, notes: inv.notes ?? null,
  });
}

// ==== Bootstrap hook mounted at App root ====
export function useSupabaseBootstrap() {
  useEffect(() => {
    hydrateAll();
    loadClinicConfigFromRemote();
    const ch = supabase
      .channel('appointments_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        hydrateAppointments().then(bumpVersion);
      })
      .subscribe();
    const ch2 = supabase
      .channel('patients_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        hydratePatients().then(bumpVersion);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(ch2); };
  }, []);
}