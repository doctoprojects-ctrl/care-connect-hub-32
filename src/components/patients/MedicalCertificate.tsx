import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Patient, MedicalCertificate as Cert } from '@/types';
import { mockCertificates } from '@/store/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Printer, Plus } from 'lucide-react';
import { clinicConfig } from '@/lib/clinicConfig';
import { toast } from '@/hooks/use-toast';

export function MedicalCertificateTab({ patient }: { patient: Patient }) {
  const { user } = useAuth();
  const [certs, setCerts] = useState<Cert[]>(
    mockCertificates.filter((c) => c.patientId === patient.id)
  );
  const [adding, setAdding] = useState(false);
  const [print, setPrint] = useState<Cert | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ fromDate: today, toDate: today, reason: '', recommendation: 'Bed rest and medication as prescribed.' });
  const canIssue = user?.role === 'doctor' || user?.role === 'admin';

  const save = () => {
    if (!form.reason) return;
    const c: Cert = {
      id: 'mc' + Date.now(),
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      doctorName: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Doctor',
      issuedDate: today,
      fromDate: form.fromDate,
      toDate: form.toDate,
      reason: form.reason,
      recommendation: form.recommendation,
    };
    mockCertificates.unshift(c);
    setCerts((p) => [c, ...p]);
    setForm({ fromDate: today, toDate: today, reason: '', recommendation: 'Bed rest and medication as prescribed.' });
    setAdding(false);
    toast({ title: 'Sick note issued' });
  };

  return (
    <div className="space-y-4">
      {canIssue && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Sick Note / Medical Certificate</CardTitle>
              <CardDescription>Issue an off-duty / fit-to-return certificate</CardDescription>
            </div>
            {!adding && <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4 mr-2" />New Certificate</Button>}
          </CardHeader>
          {adding && (
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>From</Label><Input type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} /></div>
                <div><Label>To</Label><Input type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} /></div>
              </div>
              <div><Label>Reason / diagnosis</Label><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
              <div><Label>Recommendation</Label><Textarea value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })} /></div>
              <div className="flex gap-2"><Button onClick={save}>Issue</Button><Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button></div>
            </CardContent>
          )}
        </Card>
      )}

      {certs.length === 0 && <p className="text-muted-foreground text-center py-8">No certificates issued.</p>}
      {certs.map((c) => (
        <Card key={c.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">{c.reason}</CardTitle>
                <CardDescription>{c.fromDate} → {c.toDate} · issued {c.issuedDate} by {c.doctorName}</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setPrint(c)}><Printer className="w-4 h-4 mr-1" />Print</Button>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{c.recommendation}</CardContent>
        </Card>
      ))}

      <Dialog open={!!print} onOpenChange={(o) => !o && setPrint(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Medical Certificate</DialogTitle></DialogHeader>
          {print && (
            <div className="p-6 space-y-4 bg-white text-black print:p-10">
              <div className="text-center border-b pb-3">
                <h1 className="text-2xl font-bold">{clinicConfig.name}</h1>
                <p className="text-xs">{clinicConfig.address} · {clinicConfig.phone} · {clinicConfig.email}</p>
              </div>
              <h2 className="text-center text-xl font-semibold underline">MEDICAL CERTIFICATE</h2>
              <p>Date issued: <strong>{print.issuedDate}</strong></p>
              <p>
                This is to certify that <strong>{print.patientName}</strong> was examined
                at {clinicConfig.name} and was found to be suffering from
                <strong> {print.reason}</strong>.
              </p>
              <p>
                The patient is advised to be off duty from <strong>{print.fromDate}</strong> to
                <strong> {print.toDate}</strong> inclusive.
              </p>
              <p><em>{print.recommendation}</em></p>
              <div className="pt-12 flex justify-between text-sm">
                <div>
                  <div className="border-t pt-1">Doctor's signature</div>
                  <div className="mt-1">{print.doctorName}</div>
                </div>
                <div>
                  <div className="border-t pt-1">Clinic stamp</div>
                </div>
              </div>
              <div className="pt-4 print:hidden">
                <Button onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />Print</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}