import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { mockConsultations } from '@/store/mockData';
import { ConsultationNote } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Stethoscope } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function ConsultationHistory({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<ConsultationNote[]>(mockConsultations.filter((c) => c.patientId === patientId));
  const [form, setForm] = useState({ chiefComplaint: '', diagnosis: '', treatment: '', prescription: '', notes: '' });
  const [adding, setAdding] = useState(false);
  const canAdd = user?.role === 'doctor' || user?.role === 'admin';

  const save = () => {
    if (!form.chiefComplaint) return;
    const n: ConsultationNote = {
      id: 'cn' + Date.now(),
      patientId,
      doctorId: user?.id || '',
      doctorName: `${user?.firstName} ${user?.lastName}`,
      date: new Date().toISOString().split('T')[0],
      ...form,
    };
    setNotes((p) => [n, ...p]);
    setForm({ chiefComplaint: '', diagnosis: '', treatment: '', prescription: '', notes: '' });
    setAdding(false);
    toast({ title: 'Consultation saved' });
  };

  return (
    <div className="space-y-4">
      {canAdd && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Stethoscope className="w-5 h-5" />New Consultation</CardTitle>
              <CardDescription>Record today's consultation</CardDescription>
            </div>
            {!adding && <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4 mr-2" />Add Note</Button>}
          </CardHeader>
          {adding && (
            <CardContent className="space-y-3">
              <div><Label>Chief Complaint</Label><Input value={form.chiefComplaint} onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })} /></div>
              <div><Label>Diagnosis</Label><Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
              <div><Label>Treatment</Label><Input value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} /></div>
              <div><Label>Prescription</Label><Textarea value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })} /></div>
              <div><Label>Additional Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="flex gap-2"><Button onClick={save}>Save</Button><Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button></div>
            </CardContent>
          )}
        </Card>
      )}

      {notes.length === 0 && <p className="text-muted-foreground text-center py-8">No consultation history yet.</p>}
      {notes.map((n) => (
        <Card key={n.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">{n.chiefComplaint}</CardTitle>
                <CardDescription>{n.date} · {n.doctorName}</CardDescription>
              </div>
              <Badge variant="secondary">{n.diagnosis}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Treatment:</strong> {n.treatment}</p>
            {n.prescription && <p><strong>Prescription:</strong> {n.prescription}</p>}
            {n.notes && <p className="text-muted-foreground">{n.notes}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}