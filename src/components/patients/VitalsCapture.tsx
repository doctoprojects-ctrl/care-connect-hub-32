import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { mockVitals } from '@/store/mockData';
import { Vitals } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function VitalsCapture({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const [records, setRecords] = useState<Vitals[]>(
    mockVitals.filter((v) => v.patientId === patientId)
  );
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Partial<Vitals>>({});

  // Nurse station: reception, doctor, admin may all capture vitals.
  const canAdd = ['admin', 'doctor', 'reception'].includes(user?.role || '');

  const bmi = useMemo(() => {
    if (form.weight && form.height) {
      const m = Number(form.height) / 100;
      return +(Number(form.weight) / (m * m)).toFixed(1);
    }
    return undefined;
  }, [form.weight, form.height]);

  const save = () => {
    const v: Vitals = {
      id: 'v' + Date.now(),
      patientId,
      recordedBy: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Staff',
      recordedAt: new Date().toISOString(),
      bloodPressure: form.bloodPressure,
      heartRate: form.heartRate ? Number(form.heartRate) : undefined,
      temperature: form.temperature ? Number(form.temperature) : undefined,
      respiratoryRate: form.respiratoryRate ? Number(form.respiratoryRate) : undefined,
      oxygenSaturation: form.oxygenSaturation ? Number(form.oxygenSaturation) : undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      height: form.height ? Number(form.height) : undefined,
      bmi,
      notes: form.notes,
    };
    setRecords((p) => [v, ...p]);
    mockVitals.unshift(v);
    setForm({});
    setAdding(false);
    toast({ title: 'Vitals recorded' });
  };

  return (
    <div className="space-y-4">
      {canAdd && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" /> Triage / Vitals
              </CardTitle>
              <CardDescription>Capture before doctor sees the patient</CardDescription>
            </div>
            {!adding && (
              <Button onClick={() => setAdding(true)}>
                <Plus className="w-4 h-4 mr-2" />Record Vitals
              </Button>
            )}
          </CardHeader>
          {adding && (
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div><Label>BP (mmHg)</Label><Input placeholder="120/80" value={form.bloodPressure || ''} onChange={(e) => setForm({ ...form, bloodPressure: e.target.value })} /></div>
              <div><Label>Heart rate (bpm)</Label><Input type="number" value={form.heartRate ?? ''} onChange={(e) => setForm({ ...form, heartRate: Number(e.target.value) })} /></div>
              <div><Label>Temperature (°C)</Label><Input type="number" step="0.1" value={form.temperature ?? ''} onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })} /></div>
              <div><Label>Resp. rate</Label><Input type="number" value={form.respiratoryRate ?? ''} onChange={(e) => setForm({ ...form, respiratoryRate: Number(e.target.value) })} /></div>
              <div><Label>SpO₂ (%)</Label><Input type="number" value={form.oxygenSaturation ?? ''} onChange={(e) => setForm({ ...form, oxygenSaturation: Number(e.target.value) })} /></div>
              <div><Label>Weight (kg)</Label><Input type="number" step="0.1" value={form.weight ?? ''} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} /></div>
              <div><Label>Height (cm)</Label><Input type="number" value={form.height ?? ''} onChange={(e) => setForm({ ...form, height: Number(e.target.value) })} /></div>
              <div><Label>BMI</Label><Input value={bmi ?? ''} readOnly /></div>
              <div className="sm:col-span-2 lg:col-span-3"><Label>Notes</Label><Input value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
                <Button onClick={save}>Save Vitals</Button>
                <Button variant="outline" onClick={() => { setAdding(false); setForm({}); }}>Cancel</Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {records.length === 0 && (
        <p className="text-muted-foreground text-center py-8">No vitals recorded yet.</p>
      )}
      {records.map((v) => (
        <Card key={v.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardDescription>{new Date(v.recordedAt).toLocaleString()} · {v.recordedBy}</CardDescription>
              {v.bmi && <Badge variant="secondary">BMI {v.bmi}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {v.bloodPressure && <div><span className="text-muted-foreground">BP </span><strong>{v.bloodPressure}</strong></div>}
            {v.heartRate && <div><span className="text-muted-foreground">HR </span><strong>{v.heartRate} bpm</strong></div>}
            {v.temperature && <div><span className="text-muted-foreground">Temp </span><strong>{v.temperature} °C</strong></div>}
            {v.respiratoryRate && <div><span className="text-muted-foreground">RR </span><strong>{v.respiratoryRate}</strong></div>}
            {v.oxygenSaturation && <div><span className="text-muted-foreground">SpO₂ </span><strong>{v.oxygenSaturation}%</strong></div>}
            {v.weight && <div><span className="text-muted-foreground">Wt </span><strong>{v.weight} kg</strong></div>}
            {v.height && <div><span className="text-muted-foreground">Ht </span><strong>{v.height} cm</strong></div>}
            {v.notes && <div className="col-span-full text-muted-foreground">{v.notes}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}