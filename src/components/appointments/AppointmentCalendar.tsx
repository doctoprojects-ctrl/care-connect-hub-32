import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, User } from 'lucide-react';
import { Appointment } from '@/types';
import { mockAppointments, mockPatients, mockDoctors } from '@/store/mockData';

interface AppointmentCalendarProps {
  onAddAppointment?: () => void;
  onAppointmentSelect?: (appointment: Appointment) => void;
}

export function AppointmentCalendar({ onAddAppointment, onAppointmentSelect }: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments] = useState<Appointment[]>(mockAppointments);

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.appointmentDate === dateString);
  };

  const getPatientName = (patientId: string) => {
    const patient = mockPatients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = mockDoctors.find(d => d.id === doctorId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor';
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'secondary';
      case 'confirmed': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'no-show': return 'destructive';
      default: return 'secondary';
    }
  };

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasAppointments: (date) => getAppointmentsForDate(date).length > 0
            }}
            modifiersStyles={{
              hasAppointments: { 
                backgroundColor: 'hsl(var(--primary))', 
                color: 'hsl(var(--primary-foreground))',
                fontWeight: 'bold'
              }
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Appointments for {selectedDate?.toLocaleDateString()}
            </CardTitle>
            <Button onClick={onAddAppointment}>
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedDateAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No appointments for this date
              </p>
            ) : (
              selectedDateAppointments
                .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => onAppointmentSelect?.(appointment)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{appointment.appointmentTime}</span>
                        <Badge variant={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {appointment.duration} min
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{getPatientName(appointment.patientId)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Dr. {getDoctorName(appointment.doctorId)}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        Type: {appointment.type.replace('-', ' ')}
                      </div>
                      {appointment.notes && (
                        <div className="text-sm text-muted-foreground">
                          Notes: {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}