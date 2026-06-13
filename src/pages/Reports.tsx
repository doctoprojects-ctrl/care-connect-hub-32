import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { mockSales, mockInvoices, mockPatients, mockAppointments, mockCashUps, mockConsultations } from '@/store/mockData';

export default function Reports() {
  const totalSales = mockSales.reduce((s, r) => s + r.total, 0);
  const totalInvoiced = mockInvoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = mockInvoices.reduce((s, i) => s + i.amountPaid, 0);
  const outstanding = totalInvoiced - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Consolidated financial and patient reports</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />Print</Button>
      </div>

      <Tabs defaultValue="financial">
        <TabsList>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Card><CardHeader className="pb-2"><CardDescription>Pharmacy Sales</CardDescription><CardTitle className="text-2xl">${totalSales.toFixed(2)}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Invoiced</CardDescription><CardTitle className="text-2xl">${totalInvoiced.toFixed(2)}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Collected</CardDescription><CardTitle className="text-2xl text-green-600">${totalPaid.toFixed(2)}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Outstanding</CardDescription><CardTitle className="text-2xl text-destructive">${outstanding.toFixed(2)}</CardTitle></CardHeader></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Cash Up Summary</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Shift</TableHead><TableHead>Cashier</TableHead><TableHead>Expected</TableHead><TableHead>Counted</TableHead><TableHead>Variance</TableHead></TableRow></TableHeader>
                <TableBody>
                  {mockCashUps.map((c) => {
                    const exp = c.expectedCash + c.expectedCard + c.expectedMobile;
                    const cnt = c.countedCash + c.countedCard + c.countedMobile;
                    return <TableRow key={c.id}><TableCell>{c.shiftNumber}</TableCell><TableCell>{c.cashierName}</TableCell><TableCell>${exp.toFixed(2)}</TableCell><TableCell>${cnt.toFixed(2)}</TableCell><TableCell>${c.variance.toFixed(2)}</TableCell></TableRow>;
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card><CardHeader className="pb-2"><CardDescription>Total Patients</CardDescription><CardTitle className="text-2xl">{mockPatients.length}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Appointments</CardDescription><CardTitle className="text-2xl">{mockAppointments.length}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Consultations Logged</CardDescription><CardTitle className="text-2xl">{mockConsultations.length}</CardTitle></CardHeader></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Patient Roster</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Gender</TableHead><TableHead>Phone</TableHead><TableHead>Allergies</TableHead><TableHead>Conditions</TableHead></TableRow></TableHeader>
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