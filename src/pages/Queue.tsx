import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { mockPatients, mockAppointments } from '@/store/mockData';
import { useSheetAppointments } from '@/lib/sheetsAppointments';
import {
  callNext,
  issueTicket,
  markDone,
  markServing,
  QueueDept,
  skipTicket,
  useQueueTickets,
} from '@/lib/queueStore';
import { ExternalLink, PhoneCall, SkipForward, CheckCircle2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarcodeScanner } from '@/components/common/BarcodeScanner';
import { QrCode, ScanLine, Search } from 'lucide-react';

const DEPT_LABELS: Record<QueueDept, string> = {
  doctor: 'Doctor',
  pharmacy: 'Pharmacy',
  triage: 'Triage',
};

export default function Queue() {
  const { user } = useAuth();
  const tickets = useQueueTickets();
  const { data: sheetAppointments } = useSheetAppointments();

  // Check-in form
  const [patientId, setPatientId] = useState<string>('');
  const [walkInName, setWalkInName] = useState('');
  const [dept, setDept] = useState<QueueDept>('triage');
  const [room, setRoom] = useState<Record<QueueDept, string>>({
    doctor: 'Room 1',
    pharmacy: 'Pharmacy',
    triage: 'Triage 1',
  });

  // QR / number-based check-in
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState<
    | { ok: true; patientId: string; patientName: string; appointmentId?: string; appointmentTime?: string }
    | { ok: false; message: string }
    | null
  >(null);

  const todaysAppointments = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return mockAppointments.filter(a => a.appointmentDate === today);
  }, []);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patientId ? mockPatients.find(p => p.id === patientId) : null;
    const name = patient ? `${patient.firstName} ${patient.lastName}` : walkInName.trim();
    if (!name) {
      toast({ title: 'Patient required', description: 'Select a patient or enter a walk-in name.', variant: 'destructive' });
      return;
    }
    const appt = patient
      ? todaysAppointments.find(a => a.patientId === patient.id)
      : undefined;
    const ticket = await issueTicket({
      dept,
      patientId: patient?.id,
      patientName: name,
      appointmentId: appt?.id,
    });
    if (!ticket) {
      toast({ title: 'Could not issue ticket', variant: 'destructive' });
      return;
    }
    if (appt) {
      appt.status = 'confirmed';
      appt.updatedAt = new Date().toISOString();
    }
    toast({ title: `Ticket ${ticket.code}`, description: `${name} added to ${DEPT_LABELS[dept]} queue.` });
    setPatientId('');
    setWalkInName('');
  };

  const callerName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';

  const extractPatientId = (raw: string) => {
    const s = raw.trim();
    if (!s) return '';
    const prefixMatch = s.match(/MPMS-P[:\-]([\w-]+)/i);
    if (prefixMatch) return prefixMatch[1];
    try {
      const url = new URL(s);
      const pid = url.searchParams.get('pid') || url.searchParams.get('patientId');
      if (pid) return pid;
    } catch { /* not a url */ }
    return s;
  };

  const performLookup = (raw: string) => {
    const trimmed = raw.trim();
    // If a booking URL was scanned, redirect straight to self-booking.
    if (/\/book(\?|$|\/)/i.test(trimmed) || /^https?:\/\//i.test(trimmed) && trimmed.includes('/book')) {
      try {
        const url = new URL(trimmed);
        // Same-origin? Route internally, else open new tab
        if (url.origin === window.location.origin) {
          window.location.href = url.pathname + url.search;
        } else {
          window.open(trimmed, '_blank', 'noopener');
        }
        return;
      } catch { /* fall through */ }
    }
    // Google Sheet appointment number match (exact ID)
    const sheetMatch = sheetAppointments.find(
      (a) => a.id.toLowerCase() === trimmed.toLowerCase(),
    );
    if (sheetMatch) {
      setLookupResult({
        ok: true,
        patientId: `SHEET-${sheetMatch.id}`,
        patientName: `${sheetMatch.firstName} ${sheetMatch.lastName}`.trim(),
        appointmentId: undefined,
        appointmentTime: `${sheetMatch.date} ${sheetMatch.time}`.trim(),
      });
      toast({
        title: `Appointment #${sheetMatch.id}`,
        description: `${sheetMatch.firstName} ${sheetMatch.lastName} · ${sheetMatch.type || 'Appointment'}`,
      });
      return;
    }
    const pid = extractPatientId(raw);
    const patient = mockPatients.find(p => p.id === pid);
    if (!patient) {
      setLookupResult({ ok: false, message: `No patient found for "${raw}"` });
      toast({ title: 'Patient not found', description: raw, variant: 'destructive' });
      return;
    }
    const appt = todaysAppointments.find(a => a.patientId === patient.id);
    setLookupResult({
      ok: true,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      appointmentId: appt?.id,
      appointmentTime: appt?.appointmentTime,
    });
    toast({
      title: appt ? 'Appointment matched' : 'Patient found (no appointment today)',
      description: `${patient.firstName} ${patient.lastName}${appt ? ` · ${appt.appointmentTime}` : ''}`,
    });
  };

  const confirmCheckIn = async (targetDept: QueueDept) => {
    if (!lookupResult || !lookupResult.ok) return;
    const appt = lookupResult.appointmentId
      ? mockAppointments.find(a => a.id === lookupResult.appointmentId)
      : undefined;
    if (appt) {
      appt.status = 'confirmed';
      appt.updatedAt = new Date().toISOString();
    }
    const ticket = await issueTicket({
      dept: targetDept,
      patientId: lookupResult.patientId,
      patientName: lookupResult.patientName,
      appointmentId: lookupResult.appointmentId,
    });
    if (!ticket) {
      toast({ title: 'Could not issue ticket', variant: 'destructive' });
      return;
    }
    toast({
      title: `Checked in · ${ticket.code}`,
      description: appt
        ? `${lookupResult.patientName} — appointment ${appt.appointmentTime} confirmed.`
        : `${lookupResult.patientName} added to ${DEPT_LABELS[targetDept]} (walk-in).`,
    });
    setLookupCode('');
    setLookupResult(null);
  };

  const handleCallNext = async (d: QueueDept) => {
    const r = room[d].trim() || DEPT_LABELS[d];
    const next = await callNext(d, r, callerName);
    if (!next) {
      toast({ title: 'Queue empty', description: `No waiting patients for ${DEPT_LABELS[d]}.` });
      return;
    }
    toast({ title: `Calling ${next.code}`, description: `${next.patientName} → ${r}` });
  };

  const byDept = (d: QueueDept) => tickets.filter(t => t.dept === d);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <p className="text-muted-foreground">Check patients in and call the next number to a room.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/queue/display" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" /> Open Display Screen
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="checkin" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checkin">Check-in</TabsTrigger>
          <TabsTrigger value="qr">QR / Number Check-in</TabsTrigger>
          <TabsTrigger value="call">Call Next</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5" /> Register Arrival</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIssue} className="space-y-3">
                  <div className="space-y-1">
                    <Label>Patient (with appointment)</Label>
                    <Select value={patientId} onValueChange={setPatientId}>
                      <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                      <SelectContent>
                        {mockPatients.map(p => {
                          const appt = todaysAppointments.find(a => a.patientId === p.id);
                          return (
                            <SelectItem key={p.id} value={p.id}>
                              {p.firstName} {p.lastName}{appt ? ` · ${appt.appointmentTime}` : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Or walk-in name</Label>
                    <Input value={walkInName} onChange={e => setWalkInName(e.target.value)} placeholder="Walk-in patient name" disabled={!!patientId} />
                  </div>
                  <div className="space-y-1">
                    <Label>Send to</Label>
                    <Select value={dept} onValueChange={(v) => setDept(v as QueueDept)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="triage">Triage (TR)</SelectItem>
                        <SelectItem value="doctor">Doctor (DR)</SelectItem>
                        <SelectItem value="pharmacy">Pharmacy (PH)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Issue Ticket</Button>
                </form>
              </CardContent>
            </Card>

            <div className="md:col-span-2 grid sm:grid-cols-3 gap-4">
              {(['triage', 'doctor', 'pharmacy'] as QueueDept[]).map(d => {
                const items = byDept(d);
                const waiting = items.filter(t => t.status === 'waiting');
                return (
                  <Card key={d}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        {DEPT_LABELS[d]}
                        <Badge variant="secondary">{waiting.length} waiting</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-72 overflow-auto">
                      {items.length === 0 && <p className="text-sm text-muted-foreground">No tickets today.</p>}
                      {items.map(t => (
                        <div key={t.id} className="flex items-center justify-between border rounded-md px-2 py-1.5 text-sm">
                          <div>
                            <div className="font-semibold">{t.code}</div>
                            <div className="text-xs text-muted-foreground">{t.patientName}</div>
                          </div>
                          <Badge variant={
                            t.status === 'waiting' ? 'secondary' :
                            t.status === 'called' ? 'default' :
                            t.status === 'serving' ? 'default' :
                            t.status === 'done' ? 'outline' : 'destructive'
                          }>{t.status}{t.room ? ` · ${t.room}` : ''}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="qr">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" /> Scan Patient QR or Enter Number
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button type="button" className="w-full" onClick={() => setScannerOpen(true)}>
                  <ScanLine className="w-4 h-4 mr-2" /> Open Camera Scanner
                </Button>

                <form
                  className="flex gap-2"
                  onSubmit={(e) => { e.preventDefault(); performLookup(lookupCode); }}
                >
                  <Input
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    placeholder="Patient number or QR text (e.g. p-001 / MPMS-P:p-001)"
                    autoFocus
                  />
                  <Button type="submit" variant="outline">
                    <Search className="w-4 h-4 mr-2" /> Lookup
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground">
                  Tip: Enter the <strong>appointment number</strong> (ID from the Google Sheet), a patient number,
                  or scan a QR (<code>MPMS-P:&lt;patientId&gt;</code> or booking URL).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Match & Confirm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!lookupResult && (
                  <p className="text-sm text-muted-foreground">
                    Scan a patient QR or enter a patient number to load their appointment.
                  </p>
                )}
                {lookupResult?.ok === false && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
                    {lookupResult.message}
                  </div>
                )}
                {lookupResult?.ok === true && (
                  <div className="space-y-3">
                    <div className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{lookupResult.patientName}</div>
                          <div className="text-xs text-muted-foreground">ID: {lookupResult.patientId}</div>
                        </div>
                        {lookupResult.appointmentId ? (
                          <Badge>Appt {lookupResult.appointmentTime}</Badge>
                        ) : (
                          <Badge variant="secondary">Walk-in</Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Send to</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" onClick={() => confirmCheckIn('triage')}>
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Triage
                        </Button>
                        <Button variant="outline" onClick={() => confirmCheckIn('doctor')}>
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Doctor
                        </Button>
                        <Button variant="outline" onClick={() => confirmCheckIn('pharmacy')}>
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Pharmacy
                        </Button>
                      </div>
                    </div>
                    <Button variant="ghost" className="w-full" onClick={() => { setLookupResult(null); setLookupCode(''); }}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <BarcodeScanner
            open={scannerOpen}
            onClose={() => setScannerOpen(false)}
            onScan={(code) => { setLookupCode(code); performLookup(code); }}
          />
        </TabsContent>

        <TabsContent value="call">
          <div className="grid md:grid-cols-3 gap-4">
            {(['doctor', 'triage', 'pharmacy'] as QueueDept[]).map(d => {
              const items = byDept(d);
              const waiting = items.filter(t => t.status === 'waiting');
              const called = items.filter(t => t.status === 'called' || t.status === 'serving');
              return (
                <Card key={d}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {DEPT_LABELS[d]}
                      <Badge variant="secondary">{waiting.length} waiting</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Room / Counter</Label>
                      <Input
                        value={room[d]}
                        onChange={(e) => setRoom({ ...room, [d]: e.target.value })}
                        placeholder="e.g. Room 2"
                      />
                    </div>
                    <Button className="w-full" onClick={() => handleCallNext(d)} disabled={waiting.length === 0}>
                      <PhoneCall className="w-4 h-4 mr-2" /> Call Next
                    </Button>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase">Now serving</p>
                      {called.length === 0 && <p className="text-sm text-muted-foreground">Nothing called yet.</p>}
                      {called.map(t => (
                        <div key={t.id} className="border rounded-md p-2 text-sm space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{t.code} → {t.room}</span>
                            <Badge>{t.status}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">{t.patientName}</div>
                          <div className="flex gap-1 pt-1">
                            {t.status === 'called' && (
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => markServing(t.id)}>
                                Start
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => markDone(t.id)}>
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Done
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => skipTicket(t.id)}>
                              <SkipForward className="w-3 h-3 mr-1" /> Skip
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}