import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Clock, User, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

export default function QRBooking() {
  const [doctors, setDoctors] = useState<Array<{ id: string; firstName: string; lastName: string; specialization: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [confirmation, setConfirmation] = useState<{ code: string; date: string; time: string } | null>(null);

  useEffect(() => {
    supabase.from('doctors').select('*').eq('is_active', true).then(({ data }) => {
      setDoctors((data ?? []).map((d: any) => ({
        id: d.id, firstName: d.first_name, lastName: d.last_name, specialization: d.specialization ?? '',
      })));
    });
  }, []);
  
  const [patientInfo, setPatientInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    notes: ''
  });

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'General Consultation' },
    { value: 'follow-up', label: 'Follow-up Visit' },
    { value: 'new-patient', label: 'New Patient Visit' },
    { value: 'procedure', label: 'Medical Procedure' }
  ];

  const handleBooking = async () => {
    if (!selectedDate) return;
    setSubmitting(true);
    try {
      const { data: patient, error: pErr } = await supabase.from('patients').insert({
        first_name: patientInfo.firstName,
        last_name: patientInfo.lastName,
        phone: patientInfo.phone,
        email: patientInfo.email,
        date_of_birth: patientInfo.dateOfBirth || null,
      }).select().single();
      if (pErr || !patient) throw pErr ?? new Error('Patient create failed');

      const { data: appt, error: aErr } = await supabase.from('appointments').insert({
        patient_id: patient.id,
        doctor_id: selectedDoctor,
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedTime,
        duration: 30,
        type: appointmentType,
        status: 'scheduled',
        notes: patientInfo.notes || null,
      }).select().single();
      if (aErr) throw aErr;

      const code = `APP-${String(appt!.id).slice(0, 6).toUpperCase()}`;
      setConfirmation({ code, date: selectedDate.toISOString().split('T')[0], time: selectedTime });
      toast({ title: 'Appointment booked', description: `Your number: ${code}` });
      setPatientInfo({ firstName: '', lastName: '', phone: '', email: '', dateOfBirth: '', notes: '' });
      setSelectedDate(undefined); setSelectedTime(''); setSelectedDoctor(''); setAppointmentType('');
    } catch (e: any) {
      toast({ title: 'Booking failed', description: e?.message ?? 'Please try again', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = 
    patientInfo.firstName &&
    patientInfo.lastName &&
    patientInfo.phone &&
    patientInfo.email &&
    selectedDate &&
    selectedTime &&
    selectedDoctor &&
    appointmentType;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Book Your Appointment</h1>
          <p className="text-muted-foreground">
            Please fill in your details to schedule an appointment with our medical professionals
          </p>
        </div>

        {confirmation && (
          <Card className="mb-6 border-primary bg-primary/5">
            <CardContent className="py-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Your appointment number</p>
              <p className="text-4xl font-bold tracking-widest text-primary">{confirmation.code}</p>
              <p className="text-sm">
                {confirmation.date} at {confirmation.time}
              </p>
              <div className="flex justify-center py-3">
                <div className="bg-white p-3 rounded-md inline-block">
                  <QRCodeSVG value={confirmation.code} size={168} level="M" includeMargin={false} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Save or screenshot this QR code and your number. Present either at reception on arrival to check in.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  Print / Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmation(null)}>
                  Book another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={patientInfo.firstName}
                    onChange={(e) => setPatientInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={patientInfo.lastName}
                    onChange={(e) => setPatientInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={patientInfo.phone}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1-555-0123"
                />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={patientInfo.email}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={patientInfo.dateOfBirth}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={patientInfo.notes}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any specific concerns or requests..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Select Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Available Times *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Doctor *</Label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Appointment Type *</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleBooking}
                  disabled={!isFormValid || submitting}
                >
                  {submitting ? 'Booking…' : 'Book Appointment'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}