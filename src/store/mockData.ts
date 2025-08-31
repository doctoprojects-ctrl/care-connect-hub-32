import { Patient, Doctor, Appointment, User } from '../types';

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