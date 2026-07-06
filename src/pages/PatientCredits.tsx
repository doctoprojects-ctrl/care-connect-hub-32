import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { mockInvoices } from '@/store/mockData';
import { useT } from '@/contexts/LanguageContext';

export default function PatientCredits() {
  const t = useT();
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
          <h2 className="text-3xl font-bold tracking-tight">{t('credits_title')}</h2>
          <p className="text-muted-foreground">{t('credits_desc')}</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />{t('print')}</Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>{t('total_outstanding')}</CardDescription>
          <CardTitle className="text-3xl text-destructive">${totalOutstanding.toFixed(2)}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>{t('patient')}</TableHead><TableHead>{t('open_invoices')}</TableHead><TableHead className="text-right">{t('balance_due')}</TableHead><TableHead>{t('status')}</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">{t('no_outstanding')}</TableCell></TableRow>}
              {rows.map((r) => (
                <TableRow key={r.patientId}>
                  <TableCell>{r.patientName}</TableCell>
                  <TableCell>{r.invoices}</TableCell>
                  <TableCell className="text-right font-semibold">${r.balance.toFixed(2)}</TableCell>
                  <TableCell><Badge variant="destructive">{t('owing')}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}