import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';
import { Appointment } from '@/types';

export default function Appointments() {
  const handleAddAppointment = () => {
    console.log('Add new appointment');
    // TODO: Open add appointment form/modal
  };

  const handleAppointmentSelect = (appointment: Appointment) => {
    console.log('Appointment selected:', appointment);
    // TODO: Navigate to appointment detail page or open modal
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
    </div>
  );
}