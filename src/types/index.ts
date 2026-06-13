export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: {
    allergies: string[];
    currentMedications: string[];
    chronicConditions: string[];
    pastSurgeries: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  email: string;
  phone: string;
  workingHours: {
    start: string;
    end: string;
    workingDays: number[]; // 0-6 (Sunday-Saturday)
  };
  isActive: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number; // in minutes
  type: 'consultation' | 'follow-up' | 'procedure' | 'new-patient';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'doctor' | 'reception' | 'patient' | 'cashier' | 'supervisor';
  pin: string;
  isActive: boolean;
}

export type UserRole = 'admin' | 'doctor' | 'reception' | 'patient' | 'cashier' | 'supervisor';

// ==================== Pharmacy ====================
export interface PharmacyItem {
  id: string;
  barcode: string;
  name: string;
  category: string;
  unitPrice: number;
  stock: number;
  reorderLevel: number;
  supplier?: string;
  expiryDate?: string;
}

export interface GRVLine {
  itemId: string;
  quantity: number;
  unitCost: number;
}

export interface GoodsReceivedVoucher {
  id: string;
  grvNumber: string;
  type: 'pharmacy' | 'equipment';
  supplier: string;
  receivedBy: string;
  receivedDate: string;
  status: 'pending' | 'complete';
  lines: GRVLine[];
  notes?: string;
}

export interface SaleLine {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  cashierId: string;
  customerName?: string;
  lines: SaleLine[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  createdAt: string;
}

export interface StockTakeLine {
  itemId: string;
  systemQty: number;
  countedQty: number;
}

export interface StockTake {
  id: string;
  takeNumber: string;
  performedBy: string;
  date: string;
  lines: StockTakeLine[];
  status: 'draft' | 'finalized';
}

// ==================== Equipment ====================
export interface Equipment {
  id: string;
  barcode: string;
  name: string;
  serialNumber: string;
  location: string;
  purchaseDate: string;
  status: 'operational' | 'maintenance' | 'faulty' | 'retired';
  notes?: string;
}

export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  scheduledDate: string;
  intervalDays: number;
  technician: string;
  notes?: string;
  status: 'scheduled' | 'in-progress' | 'done';
}

export interface FaultyReport {
  id: string;
  equipmentId: string;
  reportedBy: string;
  reportedDate: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'in-repair' | 'resolved';
}

// ==================== Clinic services / billing ====================
export interface ServicePrice {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  description?: string;
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  issuedDate: string;
  dueDate: string;
  lines: InvoiceLine[];
  total: number;
  amountPaid: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  notes?: string;
}

export interface PatientCredit {
  patientId: string;
  patientName: string;
  balance: number; // positive = owed by patient
  lastUpdated: string;
}

export interface CashUp {
  id: string;
  shiftNumber: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt: string;
  openingFloat: number;
  expectedCash: number;
  expectedCard: number;
  expectedMobile: number;
  countedCash: number;
  countedCard: number;
  countedMobile: number;
  variance: number;
  notes?: string;
}

export interface ConsultationNote {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  notes?: string;
}