import { PatientList } from '@/components/patients/PatientList';
import { Patient } from '@/types';

export default function Patients() {
  const handlePatientSelect = (patient: Patient) => {
    console.log('Patient selected:', patient);
    // TODO: Navigate to patient detail page or open modal
  };

  const handleAddPatient = () => {
    console.log('Add new patient');
    // TODO: Open add patient form/modal
  };

  const handleEditPatient = (patient: Patient) => {
    console.log('Edit patient:', patient);
    // TODO: Open edit patient form/modal
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
    </div>
  );
}