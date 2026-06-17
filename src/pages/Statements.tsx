import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockInvoices, mockPatients } from '@/store/mockData';
import { Printer, FileText } from 'lucide-react';
import { clinicConfig, money } from '@/lib/clinicConfig';

const monthOf = (iso: string) => iso.slice(0, 7);

export default function Statements() {
  const [params] = useSearchParams();
  const [patientId, setPatientId] = useState<string>(params.get('patient') || '');
  const todayMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState<string>(todayMonth);

  useEffect(() => {
    const p = params.get('patient');
    if (p) setPatientId(p);
  }, [params]);

  const patient = mockPatients.find((p) => p.id === patientId);

  const data = useMemo(() => {
    if (!patient) return null;
    const all = mockInvoices
      .filter((i) => i.patientId === patient.id)
      .sort((a, b) => a.issuedDate.localeCompare(b.issuedDate));

    let openingBalance = 0;
    const period: typeof all = [];
    for (const inv of all) {
      if (monthOf(inv.issuedDate) < month) {
        openingBalance += inv.total - inv.amountPaid;
      } else if (monthOf(inv.issuedDate) === month) {
        period.push(inv);
      }
    }

    let running = openingBalance;
    const rows: Array<{ date: string; ref: string; description: string; charge: number; payment: number; balance: number }> = [];
    for (const inv of period) {
      running += inv.total;
      rows.push({ date: inv.issuedDate, ref: inv.invoiceNumber, description: inv.lines.map((l) => l.description).join(', '), charge: inv.total, payment: 0, balance: running });
      if (inv.amountPaid > 0) {
        running -= inv.amountPaid;
        rows.push({ date: inv.issuedDate, ref: inv.invoiceNumber + '-PMT', description: 'Payment received', charge: 0, payment: inv.amountPaid, balance: running });
      }
    }

    // Aging buckets on currently outstanding invoices
    const buckets = { current: 0, d30: 0, d60: 0, d90: 0 };
    const today = new Date();
    for (const inv of all) {
      const outstanding = inv.total - inv.amountPaid;
      if (outstanding <= 0) continue;
      const days = Math.floor((today.getTime() - new Date(inv.issuedDate).getTime()) / 86400000);
      if (days <= 30) buckets.current += outstanding;
      else if (days <= 60) buckets.d30 += outstanding;
      else if (days <= 90) buckets.d60 += outstanding;
      else buckets.d90 += outstanding;
    }

    return { openingBalance, closingBalance: running, rows, buckets };
  }, [patient, month]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2"><FileText className="w-7 h-7" />Client Statements</h2>
        <p className="text-muted-foreground">Monthly account statement with aging breakdown</p>
      </div>

      <Card className="print:hidden">
        <CardContent className="pt-6 grid sm:grid-cols-3 gap-3">
          <div>
            <Label>Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>
                {mockPatients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Statement month</Label>
            <input type="month" className="w-full h-10 px-3 rounded-md border bg-background" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={() => window.print()} disabled={!patient}><Printer className="w-4 h-4 mr-2" />Print Statement</Button>
          </div>
        </CardContent>
      </Card>

      {patient && data && (
        <Card className="bg-white text-black print:shadow-none print:border-0">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{clinicConfig.name}</h1>
                <p className="text-xs text-muted-foreground">{clinicConfig.address}</p>
                <p className="text-xs text-muted-foreground">{clinicConfig.phone} · {clinicConfig.email}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold">STATEMENT OF ACCOUNT</div>
                <div className="text-sm text-muted-foreground">Period: {month}</div>
              </div>
            </div>
            <div className="border-t mt-3 pt-3 grid sm:grid-cols-2 gap-1 text-sm">
              <div><strong>Billed to:</strong> {patient.firstName} {patient.lastName}</div>
              <div><strong>Patient ID:</strong> {patient.id}</div>
              <div>{patient.address}</div>
              <div>{patient.phone} · {patient.email}</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Opening balance ({month})</span>
              <strong>{money(data.openingBalance)}</strong>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Charge</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No transactions for this month.</TableCell></TableRow>
                ) : data.rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell className="font-mono text-xs">{r.ref}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell className="text-right">{r.charge ? money(r.charge) : '—'}</TableCell>
                    <TableCell className="text-right">{r.payment ? money(r.payment) : '—'}</TableCell>
                    <TableCell className="text-right font-medium">{money(r.balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between text-base border-t pt-3">
              <span className="font-semibold">Closing balance</span>
              <span className="text-xl font-bold">{money(data.closingBalance)}</span>
            </div>

            <div>
              <CardTitle className="text-base mb-2">Aging</CardTitle>
              <div className="grid grid-cols-4 gap-3 text-sm">
                <div className="border rounded-md p-3"><div className="text-muted-foreground text-xs">Current (0-30)</div><div className="font-semibold">{money(data.buckets.current)}</div></div>
                <div className="border rounded-md p-3"><div className="text-muted-foreground text-xs">31-60</div><div className="font-semibold">{money(data.buckets.d30)}</div></div>
                <div className="border rounded-md p-3"><div className="text-muted-foreground text-xs">61-90</div><div className="font-semibold">{money(data.buckets.d60)}</div></div>
                <div className="border rounded-md p-3"><div className="text-muted-foreground text-xs">90+</div><div className="font-semibold text-destructive">{money(data.buckets.d90)}</div></div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-4 border-t">
              Please remit any outstanding balance by the due date. For queries contact {clinicConfig.email}. {clinicConfig.taxId}.
            </p>
          </CardContent>
        </Card>
      )}

      {!patient && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <CardDescription>Select a patient above to generate their statement.</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}