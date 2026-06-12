import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockAppointments, mockPatients, mockDoctors } from '@/store/mockData';
import { cn } from '@/lib/utils';

export default function CalendarView() {
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(new Date().toISOString().split('T')[0]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const apptByDate = useMemo(() => {
    const map: Record<string, typeof mockAppointments> = {};
    mockAppointments.forEach((a) => {
      (map[a.appointmentDate] ||= []).push(a);
    });
    return map;
  }, []);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedAppts = selected ? apptByDate[selected] || [] : [];
  const patientName = (id: string) => {
    const p = mockPatients.find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  };
  const doctorName = (id: string) => {
    const d = mockDoctors.find((x) => x.id === id);
    return d ? `${d.firstName} ${d.lastName}` : 'Unknown';
  };

  const monthLabel = cursor.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Appointment Calendar</h2>
        <p className="text-muted-foreground">Red = appointments scheduled · Green = no appointments</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{monthLabel}</CardTitle>
          <div className="flex gap-2">
            <Button size="icon" variant="outline" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="w-4 h-4" /></Button>
            <Button size="sm" variant="outline" onClick={() => setCursor(new Date())}>Today</Button>
            <Button size="icon" variant="outline" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-medium text-muted-foreground">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const count = (apptByDate[dateStr] || []).length;
              const hasAppts = count > 0;
              const isSelected = selected === dateStr;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(dateStr)}
                  className={cn(
                    'aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-1 transition-all text-white font-semibold',
                    hasAppts ? 'bg-red-500 border-red-600 hover:bg-red-600' : 'bg-green-500 border-green-600 hover:bg-green-600',
                    isSelected && 'ring-2 ring-offset-2 ring-primary'
                  )}
                >
                  <span className="text-sm">{d}</span>
                  {hasAppts && <span className="text-xs font-bold mt-0.5">{count} appt{count > 1 ? 's' : ''}</span>}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>{new Date(selected).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</CardTitle>
            <CardDescription>{selectedAppts.length} appointment{selectedAppts.length !== 1 ? 's' : ''} to attend</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedAppts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments — free day.</p>
            ) : (
              <div className="space-y-2">
                {selectedAppts.sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime)).map((a) => (
                  <div key={a.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <div className="font-medium">{a.appointmentTime} · {patientName(a.patientId)}</div>
                      <div className="text-sm text-muted-foreground">{doctorName(a.doctorId)} · {a.type}</div>
                    </div>
                    <Badge variant={a.status === 'confirmed' ? 'default' : 'secondary'}>{a.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}