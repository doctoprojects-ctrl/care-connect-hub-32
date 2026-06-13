import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { mockInvoices } from '@/store/mockData';

export default function PatientCredits() {
  // Aggregate outstanding amounts per patient from invoices
  const map = new Map<string, { patientId: string; patientName: string; balance: number; invoices: number }>();
  mockInvoices.forEach((i) => {
    const due = i.total - i.amountPaid;
    if (due <= 0) return;
    const cur = map.get(i.patientId) || { patientId: i.patientId, patientName: i.patientName, balance: 0, invoices: 0 };
    cur.balance += due;
    cur.invoices += 1;
    map.set(i.patientId, cur);
  });
  const rows = Array.from(map.values()).sort((a, b) => b.balance - a.balance);
  const totalOutstanding = rows.reduce((s, r) => s + r.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patient Credit Report</h2>
          <p className="text-muted-foreground">Outstanding balances owed by patients</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />Print</Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Outstanding</CardDescription>
          <CardTitle className="text-3xl text-destructive">${totalOutstanding.toFixed(2)}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Open Invoices</TableHead><TableHead className="text-right">Balance Due</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No outstanding balances</TableCell></TableRow>}
              {rows.map((r) => (
                <TableRow key={r.patientId}>
                  <TableCell>{r.patientName}</TableCell>
                  <TableCell>{r.invoices}</TableCell>
                  <TableCell className="text-right font-semibold">${r.balance.toFixed(2)}</TableCell>
                  <TableCell><Badge variant="destructive">Owing</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}