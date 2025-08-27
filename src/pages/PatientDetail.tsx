import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MedicationHistory } from '@/components/patients/MedicationHistory';
import { AllergyManagement } from '@/components/patients/AllergyManagement';
import { DocumentManagement } from '@/components/patients/DocumentManagement';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Edit } from 'lucide-react';
import { Patient } from '@/types';
import { mockPatients } from '@/store/mockData';
import { useNavigate } from 'react-router-dom';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (id) {
      const foundPatient = mockPatients.find(p => p.id === id);
      setPatient(foundPatient || null);
    }
  }, [id]);

  if (!patient) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/patients')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Patient not found</p>
        </div>
      </div>
    );
  }

  const getAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/patients')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
        </div>
        <Button>
          <Edit className="w-4 h-4 mr-2" />
          Edit Patient
        </Button>
      </div>

      {/* Patient Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {patient.firstName} {patient.lastName}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{getAge(patient.dateOfBirth)} years old</span>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {patient.gender}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{patient.email}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>{patient.address}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Emergency Contact</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {patient.emergencyContact.name}</p>
                <p><strong>Phone:</strong> {patient.emergencyContact.phone}</p>
                <p><strong>Relationship:</strong> {patient.emergencyContact.relationship}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Medical Summary</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Allergies:</strong> {patient.medicalHistory.allergies.length || 'None recorded'}</p>
                <p><strong>Current Medications:</strong> {patient.medicalHistory.currentMedications.length || 'None recorded'}</p>
                <p><strong>Chronic Conditions:</strong> {patient.medicalHistory.chronicConditions.length || 'None recorded'}</p>
                <p><strong>Past Surgeries:</strong> {patient.medicalHistory.pastSurgeries.length || 'None recorded'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Information Tabs */}
      <Tabs defaultValue="medications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="medications" className="space-y-4">
          <MedicationHistory
            patientId={patient.id}
            medications={[
              // Mock medication data - convert current medications to full objects
              ...patient.medicalHistory.currentMedications.map((med, index) => ({
                id: `med-${index}`,
                name: med,
                dosage: '10mg',
                frequency: 'once-daily',
                startDate: '2024-01-01',
                prescribedBy: 'Dr. Sarah Johnson',
                status: 'active' as const,
                notes: ''
              }))
            ]}
          />
        </TabsContent>

        <TabsContent value="allergies" className="space-y-4">
          <AllergyManagement
            patientId={patient.id}
            allergies={
              // Mock allergy data - convert current allergies to full objects
              patient.medicalHistory.allergies.map((allergy, index) => ({
                id: `allergy-${index}`,
                allergen: allergy,
                reaction: 'Rash',
                severity: 'moderate' as const,
                notes: '',
                dateIdentified: '2024-01-01',
                verifiedBy: 'Dr. Sarah Johnson'
              }))
            }
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentManagement
            patientId={patient.id}
            documents={[
              // Mock documents
              {
                id: 'doc-1',
                name: 'Initial Consultation Report',
                type: 'medical-record' as const,
                fileType: 'application/pdf',
                fileSize: 245760,
                uploadDate: '2024-01-15T10:00:00Z',
                uploadedBy: 'Dr. Sarah Johnson',
                notes: 'Initial patient assessment and treatment plan'
              },
              {
                id: 'doc-2',
                name: 'Blood Test Results',
                type: 'lab-result' as const,
                fileType: 'application/pdf',
                fileSize: 128490,
                uploadDate: '2024-02-01T14:30:00Z',
                uploadedBy: 'Lab Technician',
                notes: 'Complete blood count and lipid panel'
              }
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}