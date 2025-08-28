import { useState } from 'react';
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';
import { AppointmentForm } from '@/components/forms/AppointmentForm';
import { Appointment } from '@/types';
import { mockAppointments } from '@/store/mockData';

export default function Appointments() {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();

  const handleAddAppointment = () => {
    setEditingAppointment(undefined);
    setShowAppointmentForm(true);
  };

  const handleAppointmentSelect = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleAppointmentSubmit = (appointment: Appointment) => {
    if (editingAppointment) {
      const index = mockAppointments.findIndex(a => a.id === appointment.id);
      if (index !== -1) {
        mockAppointments[index] = appointment;
      }
    } else {
      // Add new appointment to mock data
      mockAppointments.push(appointment);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
        <p className="text-muted-foreground">
          Schedule and manage patient appointments
        </p>
      </div>

      <AppointmentCalendar
        onAddAppointment={handleAddAppointment}
        onAppointmentSelect={handleAppointmentSelect}
      />

      <AppointmentForm
        open={showAppointmentForm}
        onOpenChange={setShowAppointmentForm}
        onSubmit={handleAppointmentSubmit}
        appointment={editingAppointment}
      />
    </div>
  );
}