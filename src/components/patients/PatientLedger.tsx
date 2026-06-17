import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockInvoices } from '@/store/mockData';
import { Patient } from '@/types';
import { money } from '@/lib/clinicConfig';
import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';

export function PatientLedger({ patient }: { patient: Patient }) {
  const rows = useMemo(() => {
    const list = mockInvoices
      .filter((i) => i.patientId === patient.id)
      .sort((a, b) => a.issuedDate.localeCompare(b.issuedDate));
    let running = 0;
    return list.flatMap((inv) => {
      const entries: Array<{ date: string; ref: string; description: string; charge: number; payment: number; balance: number; status: string }> = [];
      running += inv.total;
      entries.push({
        date: inv.issuedDate,
        ref: inv.invoiceNumber,
        description: inv.lines.map((l) => l.description).join(', '),
        charge: inv.total,
        payment: 0,
        balance: running,
        status: inv.status,
      });
      if (inv.amountPaid > 0) {
        running -= inv.amountPaid;
        entries.push({
          date: inv.issuedDate,
          ref: inv.invoiceNumber + '-PMT',
          description: 'Payment received',
          charge: 0,
          payment: inv.amountPaid,
          balance: running,
          status: 'paid',
        });
      }
      return entries;
    });
  }, [patient.id]);

  const outstanding = rows.length ? rows[rows.length - 1].balance : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5" />Account Ledger</CardTitle>
          <CardDescription>All invoices and payments for this patient</CardDescription>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Outstanding</div>
          <div className={`text-2xl font-bold ${outstanding > 0 ? 'text-destructive' : ''}`}>{money(outstanding)}</div>
          <Button asChild size="sm" variant="outline" className="mt-2">
            <Link to={`/statements?patient=${patient.id}`}>View Statement</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No financial activity yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Charge</TableHead>
                <TableHead className="text-right">Payment</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell className="font-mono text-xs">{r.ref}</TableCell>
                  <TableCell>{r.description}</TableCell>
                  <TableCell className="text-right">{r.charge ? money(r.charge) : '—'}</TableCell>
                  <TableCell className="text-right">{r.payment ? money(r.payment) : '—'}</TableCell>
                  <TableCell className="text-right font-medium">{money(r.balance)}</TableCell>
                  <TableCell><Badge variant={r.status === 'paid' ? 'default' : 'destructive'} className="capitalize">{r.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}