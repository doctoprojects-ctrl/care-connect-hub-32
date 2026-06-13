import { useState, useMemo, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { mockCashUps, mockSales } from '@/store/mockData';
import { CashUp as CashUpType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function CashUp() {
  const { user } = useAuth();
  const [cashups, setCashups] = useState<CashUpType[]>(mockCashUps);
  const [openingFloat, setOpeningFloat] = useState(500);
  const [countedCash, setCountedCash] = useState(0);
  const [countedCard, setCountedCard] = useState(0);
  const [countedMobile, setCountedMobile] = useState(0);
  const [notes, setNotes] = useState('');

  const todaysSales = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return mockSales.filter((s) => s.createdAt.startsWith(today) && s.cashierId === user?.id);
  }, [user]);

  const expected = useMemo(() => {
    const e = { cash: 0, card: 0, mobile: 0 };
    todaysSales.forEach((s) => { (e as any)[s.paymentMethod] += s.total; });
    return e;
  }, [todaysSales]);

  const variance = (countedCash + countedCard + countedMobile) - (expected.cash + expected.card + expected.mobile);

  const closeShift = () => {
    const now = new Date().toISOString();
    const cu: CashUpType = {
      id: 'cu' + (cashups.length + 1),
      shiftNumber: 'SH-' + String(cashups.length + 1).padStart(4, '0'),
      cashierId: user?.id || '',
      cashierName: `${user?.firstName} ${user?.lastName}`,
      openedAt: now, closedAt: now,
      openingFloat,
      expectedCash: expected.cash, expectedCard: expected.card, expectedMobile: expected.mobile,
      countedCash, countedCard, countedMobile, variance, notes,
    };
    setCashups((p) => [cu, ...p]);
    setCountedCash(0); setCountedCard(0); setCountedMobile(0); setNotes('');
    toast({ title: 'Shift closed', description: `${cu.shiftNumber} · variance ${variance.toFixed(2)}` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cash Up</h2>
        <p className="text-muted-foreground">Close cashier shift and reconcile takings</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>End of Shift</CardTitle>
            <CardDescription>Enter counted amounts vs expected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Opening Float</Label>
              <Input type="number" value={openingFloat} onChange={(e) => setOpeningFloat(Number(e.target.value))} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="font-medium">Method</div>
              <div className="font-medium">Expected</div>
              <div className="font-medium">Counted</div>
              {(['cash', 'card', 'mobile'] as const).map((m) => (
                <Fragment key={m}>
                  <div className="capitalize self-center">{m}</div>
                  <div className="self-center">${(expected as any)[m].toFixed(2)}</div>
                  <Input type="number" value={m === 'cash' ? countedCash : m === 'card' ? countedCard : countedMobile}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (m === 'cash') setCountedCash(v);
                      else if (m === 'card') setCountedCard(v);
                      else setCountedMobile(v);
                    }} />
                </Fragment>
              ))}
            </div>
            <div className={`p-3 rounded text-center font-semibold ${variance === 0 ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-destructive/10 text-destructive'}`}>
              Variance: ${variance.toFixed(2)}
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button className="w-full" onClick={closeShift}>Close Shift & Submit Cash Up</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Sales ({todaysSales.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Receipt</TableHead><TableHead>Method</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
              <TableBody>
                {todaysSales.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No sales today</TableCell></TableRow>}
                {todaysSales.map((s) => (
                  <TableRow key={s.id}><TableCell className="font-mono">{s.receiptNumber}</TableCell><TableCell className="capitalize">{s.paymentMethod}</TableCell><TableCell>${s.total.toFixed(2)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Cash Up History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Shift</TableHead><TableHead>Cashier</TableHead><TableHead>Closed</TableHead><TableHead>Expected</TableHead><TableHead>Counted</TableHead><TableHead>Variance</TableHead></TableRow></TableHeader>
            <TableBody>
              {cashups.map((c) => {
                const exp = c.expectedCash + c.expectedCard + c.expectedMobile;
                const cnt = c.countedCash + c.countedCard + c.countedMobile;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono">{c.shiftNumber}</TableCell>
                    <TableCell>{c.cashierName}</TableCell>
                    <TableCell>{new Date(c.closedAt).toLocaleString()}</TableCell>
                    <TableCell>${exp.toFixed(2)}</TableCell>
                    <TableCell>${cnt.toFixed(2)}</TableCell>
                    <TableCell><Badge variant={c.variance === 0 ? 'default' : 'destructive'}>${c.variance.toFixed(2)}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}