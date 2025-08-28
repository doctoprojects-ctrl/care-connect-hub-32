import { useState } from 'react';
import { PatientList } from '@/components/patients/PatientList';
import { PatientForm } from '@/components/forms/PatientForm';
import { Patient } from '@/types';
import { useNavigate } from 'react-router-dom';
import { mockPatients } from '@/store/mockData';

export default function Patients() {
  const navigate = useNavigate();
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();
  
  const handlePatientSelect = (patient: Patient) => {
    navigate(`/patients/${patient.id}`);
  };

  const handleAddPatient = () => {
    setEditingPatient(undefined);
    setShowPatientForm(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowPatientForm(true);
  };

  const handlePatientSubmit = (patient: Patient) => {
    if (editingPatient) {
      const index = mockPatients.findIndex(p => p.id === patient.id);
      if (index !== -1) {
        mockPatients[index] = patient;
      }
    } else {
      // Add new patient to mock data
      mockPatients.push(patient);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
        <p className="text-muted-foreground">
          Manage patient records and information
        </p>
      </div>

      <PatientList
        onPatientSelect={handlePatientSelect}
        onAddPatient={handleAddPatient}
        onEditPatient={handleEditPatient}
      />

      <PatientForm
        open={showPatientForm}
        onOpenChange={setShowPatientForm}
        onSubmit={handlePatientSubmit}
        patient={editingPatient}
      />
    </div>
  );
}