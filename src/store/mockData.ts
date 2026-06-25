import {
  Patient,
  Doctor,
  Appointment,
  User,
  PharmacyItem,
  GoodsReceivedVoucher,
  Sale,
  StockTake,
  Equipment,
  MaintenanceSchedule,
  FaultyReport,
  ServicePrice,
  Invoice,
  PatientCredit,
  CashUp,
  ConsultationNote,
  Vitals,
  MedicalCertificate,
} from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Elton',
    lastName: 'Admin',
    email: 'elton@clinic.com',
    role: 'admin',
    pin: 'E301277',
    isActive: true,
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@clinic.com',
    role: 'doctor',
    pin: '1234',
    isActive: true,
  },
  {
    id: '3',
    firstName: 'Mary',
    lastName: 'Smith',
    email: 'mary.smith@clinic.com',
    role: 'reception',
    pin: '5678',
    isActive: true,
  },
];

// Add cashier
mockUsers.push({
  id: '5',
  firstName: 'Cathy',
  lastName: 'Cashier',
  email: 'cathy@clinic.com',
  role: 'cashier',
  pin: '9999',
  isActive: true,
});

// Add pharmacy supervisor
mockUsers.push({
  id: '6',
  firstName: 'Sam',
  lastName: 'Supervisor',
  email: 'sam@clinic.com',
  role: 'supervisor',
  pin: '7777',
  isActive: true,
});

// Add marketing user
mockUsers.push({
  id: '7',
  firstName: 'Mona',
  lastName: 'Marketing',
  email: 'mona@clinic.com',
  role: 'marketing',
  pin: '4321',
  isActive: true,
});

// ==================== Pharmacy mock ====================
export const mockPharmacyItems: PharmacyItem[] = [
  { id: 'p1', barcode: '6001234500017', name: 'Paracetamol 500mg (20 tabs)', category: 'Analgesic', unitPrice: 25, stock: 120, reorderLevel: 30, supplier: 'MediSupply', expiryDate: '2027-06-30' },
  { id: 'p2', barcode: '6001234500024', name: 'Amoxicillin 250mg (15 caps)', category: 'Antibiotic', unitPrice: 65, stock: 40, reorderLevel: 20, supplier: 'PharmaCo', expiryDate: '2026-12-15' },
  { id: 'p3', barcode: '6001234500031', name: 'Ibuprofen 400mg (10 tabs)', category: 'Analgesic', unitPrice: 35, stock: 15, reorderLevel: 25, supplier: 'MediSupply', expiryDate: '2026-09-01' },
  { id: 'p4', barcode: '6001234500048', name: 'Cough Syrup 100ml', category: 'Cold & Flu', unitPrice: 55, stock: 60, reorderLevel: 15, supplier: 'PharmaCo', expiryDate: '2026-11-20' },
];

export const mockGRVs: GoodsReceivedVoucher[] = [
  {
    id: 'g1',
    grvNumber: 'GRV-0001',
    type: 'pharmacy',
    supplier: 'MediSupply',
    receivedBy: 'Cathy Cashier',
    receivedDate: '2026-06-10',
    status: 'complete',
    lines: [
      { itemId: 'p1', quantity: 50, unitCost: 18 },
      { itemId: 'p3', quantity: 20, unitCost: 25 },
    ],
    notes: 'Monthly restock',
  },
];

export const mockSales: Sale[] = [
  {
    id: 's1',
    receiptNumber: 'RCP-0001',
    cashierId: '5',
    customerName: 'Walk-in',
    lines: [{ itemId: 'p1', name: 'Paracetamol 500mg (20 tabs)', quantity: 2, unitPrice: 25 }],
    total: 50,
    paymentMethod: 'cash',
    createdAt: '2026-06-11T09:30:00Z',
  },
];

export const mockStockTakes: StockTake[] = [];

// ==================== Equipment mock ====================
export const mockEquipment: Equipment[] = [
  { id: 'e1', barcode: 'EQ-1000001', name: 'ECG Machine', serialNumber: 'SN-ECG-001', location: 'Consult Room 1', purchaseDate: '2024-03-15', status: 'operational' },
  { id: 'e2', barcode: 'EQ-1000002', name: 'Defibrillator', serialNumber: 'SN-DEF-002', location: 'Emergency', purchaseDate: '2023-08-01', status: 'maintenance' },
  { id: 'e3', barcode: 'EQ-1000003', name: 'Blood Pressure Monitor', serialNumber: 'SN-BPM-003', location: 'Reception', purchaseDate: '2025-01-10', status: 'operational' },
  { id: 'e4', barcode: 'EQ-1000004', name: 'Nebulizer', serialNumber: 'SN-NEB-004', location: 'Consult Room 2', purchaseDate: '2024-09-22', status: 'faulty' },
];

export const mockMaintenanceSchedules: MaintenanceSchedule[] = [
  { id: 'm1', equipmentId: 'e1', scheduledDate: '2026-07-01', intervalDays: 90, technician: 'TechServ Ltd', status: 'scheduled' },
  { id: 'm2', equipmentId: 'e2', scheduledDate: '2026-06-15', intervalDays: 30, technician: 'TechServ Ltd', status: 'in-progress' },
];

export const mockFaultyReports: FaultyReport[] = [
  { id: 'f1', equipmentId: 'e4', reportedBy: 'Sarah Johnson', reportedDate: '2026-06-08', description: 'Not powering on', severity: 'high', status: 'open' },
];

// ==================== Services / Invoices / Credits / CashUps / Consultations ====================
export const mockServicePrices: ServicePrice[] = [
  { id: 'sv1', code: 'CONS-GEN', name: 'General Consultation', category: 'Consultation', price: 350, description: 'Standard 30-min consult' },
  { id: 'sv2', code: 'CONS-FUP', name: 'Follow-up Visit', category: 'Consultation', price: 200 },
  { id: 'sv3', code: 'PROC-ECG', name: 'ECG', category: 'Procedure', price: 450 },
  { id: 'sv4', code: 'PROC-NEB', name: 'Nebulization', category: 'Procedure', price: 180 },
  { id: 'sv5', code: 'LAB-BLD', name: 'Blood Test (CBC)', category: 'Laboratory', price: 280 },
  { id: 'sv6', code: 'INJ-VAC', name: 'Vaccination', category: 'Procedure', price: 320 },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1', invoiceNumber: 'INV-0001', patientId: '1', patientName: 'John Doe',
    issuedDate: '2026-06-05', dueDate: '2026-06-20',
    lines: [
      { description: 'General Consultation', quantity: 1, unitPrice: 350 },
      { description: 'ECG', quantity: 1, unitPrice: 450 },
    ],
    total: 800, amountPaid: 800, status: 'paid',
  },
  {
    id: 'inv2', invoiceNumber: 'INV-0002', patientId: '2', patientName: 'Alice Wilson',
    issuedDate: '2026-06-09', dueDate: '2026-06-24',
    lines: [{ description: 'Follow-up Visit', quantity: 1, unitPrice: 200 }],
    total: 200, amountPaid: 0, status: 'unpaid',
  },
];

export const mockPatientCredits: PatientCredit[] = [
  { patientId: '2', patientName: 'Alice Wilson', balance: 200, lastUpdated: '2026-06-09' },
];

export const mockCashUps: CashUp[] = [
  {
    id: 'cu1', shiftNumber: 'SH-0001', cashierId: '5', cashierName: 'Cathy Cashier',
    openedAt: '2026-06-11T08:00:00Z', closedAt: '2026-06-11T17:00:00Z',
    openingFloat: 500, expectedCash: 1250, expectedCard: 800, expectedMobile: 320,
    countedCash: 1250, countedCard: 800, countedMobile: 320, variance: 0,
    notes: 'Balanced',
  },
];

export const mockConsultations: ConsultationNote[] = [
  {
    id: 'cn1', patientId: '1', doctorId: '2', doctorName: 'Dr. Sarah Johnson',
    date: '2026-05-15', chiefComplaint: 'Persistent headache',
    diagnosis: 'Tension headache', treatment: 'Rest, hydration, Paracetamol',
    prescription: 'Paracetamol 500mg every 6h for 3 days',
    notes: 'BP 130/85. Follow-up in 2 weeks.',
  },
  {
    id: 'cn2', patientId: '1', doctorId: '2', doctorName: 'Dr. Sarah Johnson',
    date: '2026-06-05', chiefComplaint: 'Chest discomfort',
    diagnosis: 'Mild anxiety, no cardiac findings', treatment: 'ECG normal',
    notes: 'ECG performed. Reassured patient.',
  },
];

export const mockVitals: Vitals[] = [
  {
    id: 'v1', patientId: '1', recordedBy: 'Nurse Jane', recordedAt: '2026-06-05T08:45:00Z',
    bloodPressure: '130/85', heartRate: 78, temperature: 36.7, respiratoryRate: 16,
    oxygenSaturation: 98, weight: 82, height: 178, bmi: 25.9, notes: 'Pre-consult',
  },
];

export const mockCertificates: MedicalCertificate[] = [];

// Mock Doctors
export const mockDoctors: Doctor[] = [
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    specialization: 'General Medicine',
    email: 'sarah.johnson@clinic.com',
    phone: '+1-555-0123',
    workingHours: {
      start: '09:00',
      end: '17:00',
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    },
    isActive: true,
  },
  {
    id: '4',
    firstName: 'Dr. Michael',
    lastName: 'Brown',
    specialization: 'Cardiology',
    email: 'michael.brown@clinic.com',
    phone: '+1-555-0124',
    workingHours: {
      start: '10:00',
      end: '18:00',
      workingDays: [1, 2, 3, 4, 5],
    },
    isActive: true,
  },
];

// Mock Patients
export const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1985-06-15',
    gender: 'male',
    phone: '+1-555-0101',
    email: 'john.doe@email.com',
    address: '123 Main St, City, State 12345',
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+1-555-0102',
      relationship: 'Spouse',
    },
    medicalHistory: {
      allergies: ['Penicillin'],
      currentMedications: ['Lisinopril 10mg'],
      chronicConditions: ['Hypertension'],
      pastSurgeries: [],
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    firstName: 'Alice',
    lastName: 'Wilson',
    dateOfBirth: '1992-03-22',
    gender: 'female',
    phone: '+1-555-0103',
    email: 'alice.wilson@email.com',
    address: '456 Oak Ave, City, State 12345',
    emergencyContact: {
      name: 'Bob Wilson',
      phone: '+1-555-0104',
      relationship: 'Brother',
    },
    medicalHistory: {
      allergies: [],
      currentMedications: [],
      chronicConditions: [],
      pastSurgeries: ['Appendectomy 2018'],
    },
    createdAt: '2024-02-01T14:30:00Z',
    updatedAt: '2024-02-01T14:30:00Z',
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '2',
    appointmentDate: '2024-08-27',
    appointmentTime: '10:00',
    duration: 30,
    type: 'consultation',
    status: 'scheduled',
    notes: 'Follow-up for blood pressure',
    createdAt: '2024-08-26T09:00:00Z',
    updatedAt: '2024-08-26T09:00:00Z',
  },
  {
    id: '2',
    patientId: '2',
    doctorId: '4',
    appointmentDate: '2024-08-28',
    appointmentTime: '14:00',
    duration: 45,
    type: 'new-patient',
    status: 'confirmed',
    notes: 'First consultation',
    createdAt: '2024-08-25T11:00:00Z',
    updatedAt: '2024-08-26T08:00:00Z',
  },
];

// Current user mock (for role simulation)
export const mockCurrentUser: User = mockUsers[2]; // Reception user by default

// Unified export for backward compatibility
export const mockData = {
  patients: mockPatients,
  doctors: mockDoctors,
  appointments: mockAppointments,
  users: mockUsers,
  currentUser: mockCurrentUser,
};