import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { mockSales, mockInvoices, mockPatients, mockAppointments, mockCashUps, mockConsultations } from '@/store/mockData';
import { useT } from '@/contexts/LanguageContext';
import { money } from '@/lib/clinicConfig';

export default function Reports() {
  const t = useT();
  const totalSales = mockSales.reduce((s, r) => s + r.total, 0);
  const totalInvoiced = mockInvoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = mockInvoices.reduce((s, i) => s + i.amountPaid, 0);
  const outstanding = totalInvoiced - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('reports_title')}</h2>
          <p className="text-muted-foreground">{t('reports_desc')}</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />{t('print')}</Button>
      </div>

      <Tabs defaultValue="financial">
        <TabsList>
          <TabsTrigger value="financial">{t('tab_financial')}</TabsTrigger>
          <TabsTrigger value="patients">{t('tab_patients')}</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Card><CardHeader className="pb-2"><CardDescription>{t('pharmacy_sales')}</CardDescription><CardTitle className="text-2xl">{money(totalSales)}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>{t('invoiced')}</CardDescription><CardTitle className="text-2xl">{money(totalInvoiced)}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>{t('collected')}</CardDescription><CardTitle className="text-2xl text-green-600">{money(totalPaid)}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>{t('outstanding')}</CardDescription><CardTitle className="text-2xl text-destructive">{money(outstanding)}</CardTitle></CardHeader></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>{t('cashup_summary')}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>{t('shift')}</TableHead><TableHead>{t('cashier')}</TableHead><TableHead>{t('expected')}</TableHead><TableHead>{t('counted')}</TableHead><TableHead>{t('variance')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {mockCashUps.map((c) => {
                    const exp = c.expectedCash + c.expectedCard + c.expectedMobile;
                    const cnt = c.countedCash + c.countedCard + c.countedMobile;
                    return <TableRow key={c.id}><TableCell>{c.shiftNumber}</TableCell><TableCell>{c.cashierName}</TableCell><TableCell>{money(exp)}</TableCell><TableCell>{money(cnt)}</TableCell><TableCell>{money(c.variance)}</TableCell></TableRow>;
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card><CardHeader className="pb-2"><CardDescription>{t('total_patients')}</CardDescription><CardTitle className="text-2xl">{mockPatients.length}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>{t('appointments')}</CardDescription><CardTitle className="text-2xl">{mockAppointments.length}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>{t('consultations_logged')}</CardDescription><CardTitle className="text-2xl">{mockConsultations.length}</CardTitle></CardHeader></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>{t('patient_roster')}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>{t('name')}</TableHead><TableHead>{t('gender')}</TableHead><TableHead>{t('phone')}</TableHead><TableHead>{t('allergies')}</TableHead><TableHead>{t('conditions')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {mockPatients.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.firstName} {p.lastName}</TableCell>
                      <TableCell className="capitalize">{p.gender}</TableCell>
                      <TableCell>{p.phone}</TableCell>
                      <TableCell>{p.medicalHistory.allergies.join(', ') || '—'}</TableCell>
                      <TableCell>{p.medicalHistory.chronicConditions.join(', ') || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}