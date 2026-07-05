import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ConsultationNote } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Stethoscope, Printer, Trash2, Pill } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createPrescription, PrescriptionItem } from '@/lib/prescriptionsStore';
import { mockPatients } from '@/store/mockData';

interface RxLine { name: string; quantity: number; unitPrice: number; instructions: string }

export function ConsultationHistory({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<ConsultationNote[]>([]);
  const [form, setForm] = useState({ chiefComplaint: '', diagnosis: '', treatment: '', prescription: '', notes: '' });
  const [rxLines, setRxLines] = useState<RxLine[]>([]);
  const [adding, setAdding] = useState(false);
  const canAdd = user?.role === 'doctor' || user?.role === 'admin';
  const patient = mockPatients.find((p) => p.id === patientId);
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient';

  useEffect(() => {
    const load = async () => {
      const { data, error } = await (supabase as any)
        .from('consultations')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });
      if (!error && data) {
        setNotes(data.map((r: any) => ({
          id: r.id,
          patientId: r.patient_id,
          doctorId: r.doctor_id ?? '',
          doctorName: r.doctor_name ?? '',
          date: r.date,
          chiefComplaint: r.chief_complaint ?? '',
          diagnosis: r.diagnosis ?? '',
          treatment: r.treatment ?? '',
          prescription: r.prescription ?? '',
          notes: r.notes ?? '',
        })));
      }
    };
    load();
    const channel = (supabase as any)
      .channel('consultations-' + patientId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations', filter: `patient_id=eq.${patientId}` }, () => load())
      .subscribe();
    return () => { (supabase as any).removeChannel(channel); };
  }, [patientId]);

  const addRxLine = () => setRxLines((l) => [...l, { name: '', quantity: 1, unitPrice: 0, instructions: '' }]);
  const updateRx = (i: number, patch: Partial<RxLine>) =>
    setRxLines((l) => l.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const removeRx = (i: number) => setRxLines((l) => l.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!form.chiefComplaint) return;
    const doctorName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Doctor';
    const prescriptionText = rxLines.length
      ? rxLines.map((r) => `${r.name} × ${r.quantity}${r.instructions ? ' — ' + r.instructions : ''}`).join('\n')
      : form.prescription;
    const { data, error } = await (supabase as any)
      .from('consultations')
      .insert({
        patient_id: patientId,
        doctor_id: null,
        doctor_name: doctorName,
        date: new Date().toISOString().split('T')[0],
        chief_complaint: form.chiefComplaint,
        diagnosis: form.diagnosis,
        treatment: form.treatment,
        prescription: prescriptionText,
        notes: form.notes,
      })
      .select()
      .single();
    if (error || !data) {
      toast({ title: 'Save failed', description: error?.message, variant: 'destructive' });
      return;
    }
    if (rxLines.filter((r) => r.name.trim()).length > 0) {
      const items: PrescriptionItem[] = rxLines
        .filter((r) => r.name.trim())
        .map((r) => ({ name: r.name, quantity: Number(r.quantity) || 1, unitPrice: Number(r.unitPrice) || 0, instructions: r.instructions }));
      await createPrescription({
        consultationId: data.id,
        patientId,
        patientName,
        doctorName,
        items,
        notes: form.notes,
      });
      toast({ title: 'Prescription sent to pharmacy' });
    }
    setForm({ chiefComplaint: '', diagnosis: '', treatment: '', prescription: '', notes: '' });
    setRxLines([]);
    setAdding(false);
    toast({ title: 'Consultation saved' });
  };

  const printNote = (n: ConsultationNote) => {
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Consultation ${n.date}</title>
      <style>body{font-family:system-ui,Arial;padding:32px;color:#111}h1{margin:0 0 4px}h2{margin-top:24px;border-bottom:1px solid #ccc;padding-bottom:4px;font-size:16px}
      .meta{color:#555;font-size:12px;margin-bottom:16px}pre{white-space:pre-wrap;font-family:inherit;background:#f6f6f6;padding:8px;border-radius:4px}
      .sig{margin-top:60px;border-top:1px solid #333;padding-top:6px;width:260px;font-size:12px;color:#555}</style></head><body>
      <h1>Consultation Report</h1>
      <div class="meta">Patient: <b>${patientName}</b> · Date: ${n.date} · Doctor: ${n.doctorName}</div>
      <h2>Chief Complaint</h2><div>${escapeHtml(n.chiefComplaint)}</div>
      <h2>Diagnosis</h2><div>${escapeHtml(n.diagnosis)}</div>
      <h2>Treatment</h2><div>${escapeHtml(n.treatment)}</div>
      ${n.prescription ? `<h2>Prescription</h2><pre>${escapeHtml(n.prescription)}</pre>` : ''}
      ${n.notes ? `<h2>Notes</h2><div>${escapeHtml(n.notes)}</div>` : ''}
      <div class="sig">Signed: ${n.doctorName}</div>
      </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="space-y-4">
      {canAdd && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Stethoscope className="w-5 h-5" />New Consultation</CardTitle>
              <CardDescription>Record today's consultation and prescription</CardDescription>
            </div>
            {!adding && <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4 mr-2" />Add Note</Button>}
          </CardHeader>
          {adding && (
            <CardContent className="space-y-3">
              <div><Label>Chief Complaint</Label><Input value={form.chiefComplaint} onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })} /></div>
              <div><Label>Diagnosis</Label><Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
              <div><Label>Treatment</Label><Input value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} /></div>
              <div className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><Pill className="w-4 h-4" />Prescription (sent to pharmacy)</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addRxLine}><Plus className="w-3 h-3 mr-1" />Item</Button>
                </div>
                {rxLines.length === 0 && (
                  <Textarea placeholder="Free-text prescription (or add items above)" value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })} />
                )}
                {rxLines.map((r, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <Input className="col-span-5" placeholder="Medication" value={r.name} onChange={(e) => updateRx(i, { name: e.target.value })} />
                    <Input className="col-span-2" type="number" placeholder="Qty" value={r.quantity} onChange={(e) => updateRx(i, { quantity: Number(e.target.value) })} />
                    <Input className="col-span-2" type="number" placeholder="Price" value={r.unitPrice} onChange={(e) => updateRx(i, { unitPrice: Number(e.target.value) })} />
                    <Input className="col-span-2" placeholder="Instructions" value={r.instructions} onChange={(e) => updateRx(i, { instructions: e.target.value })} />
                    <Button size="icon" variant="ghost" className="col-span-1" onClick={() => removeRx(i)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
              <div><Label>Additional Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="flex gap-2"><Button onClick={save}>Save & Send</Button><Button variant="outline" onClick={() => { setAdding(false); setRxLines([]); }}>Cancel</Button></div>
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
              <div className="flex items-center gap-2">
                {n.diagnosis && <Badge variant="secondary">{n.diagnosis}</Badge>}
                <Button size="sm" variant="outline" onClick={() => printNote(n)}><Printer className="w-4 h-4 mr-1" />Print</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Treatment:</strong> {n.treatment}</p>
            {n.prescription && <p className="whitespace-pre-wrap"><strong>Prescription:</strong> {n.prescription}</p>}
            {n.notes && <p className="text-muted-foreground">{n.notes}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function escapeHtml(s: string) {
  return (s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[c]);
}