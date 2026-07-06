import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Eye } from 'lucide-react';
import { Patient } from '@/types';
import { mockPatients } from '@/store/mockData';
import { useDataVersion } from '@/lib/supabaseSync';
import { useT } from '@/contexts/LanguageContext';

interface PatientListProps {
  onPatientSelect?: (patient: Patient) => void;
  onAddPatient?: () => void;
  onEditPatient?: (patient: Patient) => void;
}

export function PatientList({ onPatientSelect, onAddPatient, onEditPatient }: PatientListProps) {
  useDataVersion();
  const t = useT();
  const patients = mockPatients;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAgeFromDOB = (dob: string) => {
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('patients_title')}</CardTitle>
          <Button onClick={onAddPatient}>
            <Plus className="w-4 h-4 mr-2" />
            {t('add_patient')}
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('search_patients')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('age')}</TableHead>
              <TableHead>{t('gender')}</TableHead>
              <TableHead>{t('phone')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('last_visit')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">
                  {patient.firstName} {patient.lastName}
                </TableCell>
                <TableCell>{getAgeFromDOB(patient.dateOfBirth)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {patient.gender}
                  </Badge>
                </TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{formatDate(patient.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onPatientSelect?.(patient)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEditPatient?.(patient)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}