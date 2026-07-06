import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockInvoices, mockPatients, mockServicePrices } from '@/store/mockData';
import { Invoice, InvoiceLine } from '@/types';
import { Plus, Printer, Trash2, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { clinicConfig, money } from '@/lib/clinicConfig';
import { useT } from '@/contexts/LanguageContext';

export default function Invoices() {
  const { user } = useAuth();
  const t = useT();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [dialog, setDialog] = useState(false);
  const [printInv, setPrintInv] = useState<Invoice | null>(null);
  const [payInv, setPayInv] = useState<Invoice | null>(null);
  const [payMethod, setPayMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [patientId, setPatientId] = useState('');
  const [lines, setLines] = useState<InvoiceLine[]>([]);

  const addLine = (serviceId: string) => {
    const sv = mockServicePrices.find((s) => s.id === serviceId);
    if (sv) setLines((p) => [...p, { description: sv.name, quantity: 1, unitPrice: sv.price }]);
  };

  const total = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  const create = () => {
    const p = mockPatients.find((x) => x.id === patientId);
    if (!p || lines.length === 0) return;
    const inv: Invoice = {
      id: 'inv' + (invoices.length + 1),
      invoiceNumber: 'INV-' + String(invoices.length + 1).padStart(4, '0'),
      patientId: p.id, patientName: `${p.firstName} ${p.lastName}`,
      issuedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      lines, total, amountPaid: 0, status: 'unpaid',
    };
    setInvoices((p) => [inv, ...p]);
    setLines([]); setPatientId(''); setDialog(false);
    toast({ title: 'Invoice created', description: inv.invoiceNumber });
  };

  const recordPayment = () => {
    if (!payInv) return;
    const stationLabel =
      user?.role === 'cashier' ? 'Pharmacy Cashier' : 'Reception';
    const updated: Invoice = {
      ...payInv,
      amountPaid: payInv.total,
      status: 'paid',
      notes: `${payInv.notes ? payInv.notes + ' | ' : ''}Paid via ${payMethod} at ${stationLabel} by ${user?.firstName ?? ''}`,
    };
    setInvoices((p) => p.map((i) => (i.id === updated.id ? updated : i)));
    const idx = mockInvoices.findIndex((i) => i.id === updated.id);
    if (idx !== -1) mockInvoices[idx] = updated;
    toast({ title: 'Payment recorded', description: `${updated.invoiceNumber} — $${updated.total} (${payMethod}) at ${stationLabel}` });
    setPayInv(null);
    setPayMethod('cash');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('invoices_title')}</h2>
          <p className="text-muted-foreground">{t('invoices_desc')}</p>
        </div>
        <Dialog open={dialog} onOpenChange={setDialog}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />{t('new_invoice')}</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{t('new_invoice')}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>{t('patient')}</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger><SelectValue placeholder={t('select_patient')} /></SelectTrigger>
                  <SelectContent>{mockPatients.map((p) => <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('add_service')}</Label>
                <Select value="" onValueChange={addLine}>
                  <SelectTrigger><SelectValue placeholder={t('choose_service')} /></SelectTrigger>
                  <SelectContent>{mockServicePrices.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} - ${s.price}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {lines.map((l, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex-1 text-sm">{l.description}</span>
                    <Input className="w-20" type="number" value={l.quantity} onChange={(e) => setLines((p) => p.map((x, idx) => idx === i ? { ...x, quantity: Number(e.target.value) } : x))} />
                    <span className="text-sm w-20 text-right">${(l.quantity * l.unitPrice).toFixed(2)}</span>
                    <Button size="icon" variant="ghost" onClick={() => setLines((p) => p.filter((_, idx) => idx !== i))}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold pt-2 border-t"><span>{t('total')}</span><span>${total.toFixed(2)}</span></div>
              <Button className="w-full" onClick={create} disabled={!patientId || lines.length === 0}>{t('create_invoice')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>{t('invoice_no')}</TableHead><TableHead>{t('patient')}</TableHead><TableHead>{t('date')}</TableHead><TableHead>{t('total')}</TableHead><TableHead>{t('status')}</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {invoices.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono">{i.invoiceNumber}</TableCell>
                  <TableCell>{i.patientName}</TableCell>
                  <TableCell>{i.issuedDate}</TableCell>
                  <TableCell>${i.total.toFixed(2)}</TableCell>
                  <TableCell><Badge variant={i.status === 'paid' ? 'default' : 'destructive'} className="capitalize">{i.status}</Badge></TableCell>
                  <TableCell className="space-x-2">
                    {i.status !== 'paid' && (
                      <Button size="sm" onClick={() => setPayInv(i)}>
                        <DollarSign className="w-4 h-4 mr-1" />{t('pay')}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setPrintInv(i)}>
                      <Printer className="w-4 h-4 mr-1" />{t('print')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!payInv} onOpenChange={(o) => !o && setPayInv(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('receive_payment')}</DialogTitle>
          </DialogHeader>
          {payInv && (
            <div className="space-y-3">
              <div className="text-sm">
                <div><strong>{t('invoice_no')}:</strong> {payInv.invoiceNumber}</div>
                <div><strong>{t('patient')}:</strong> {payInv.patientName}</div>
                <div className="text-lg pt-2"><strong>{t('amount_due')}:</strong> ${payInv.total.toFixed(2)}</div>
              </div>
              <div>
                <Label>{t('payment_method')}</Label>
                <Select value={payMethod} onValueChange={(v: 'cash' | 'card' | 'mobile') => setPayMethod(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t('cash')}</SelectItem>
                    <SelectItem value="card">{t('card')}</SelectItem>
                    <SelectItem value="mobile">{t('mobile_money')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('receiving_at')}: {user?.role === 'cashier' ? t('pharmacy_cashier') : t('reception')}
              </p>
              <Button className="w-full" onClick={recordPayment}>{t('confirm_payment')}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!printInv} onOpenChange={(o) => !o && setPrintInv(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{printInv?.invoiceNumber}</DialogTitle></DialogHeader>
          {printInv && (
            <div className="space-y-4 p-2 bg-white text-black print:p-10">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h2 className="text-2xl font-bold">{clinicConfig.name}</h2>
                  <p className="text-xs text-muted-foreground">{clinicConfig.tagline}</p>
                  <p className="text-xs">{clinicConfig.address}</p>
                  <p className="text-xs">{clinicConfig.phone} · {clinicConfig.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold uppercase tracking-wide">{t('tax_invoice')}</div>
                  <div className="text-sm text-muted-foreground">{clinicConfig.taxId}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>{t('billed_to')}:</strong> {printInv.patientName}</div>
                <div className="text-right"><strong>{t('invoice_no')}:</strong> {printInv.invoiceNumber}</div>
                <div><strong>{t('issued')}:</strong> {printInv.issuedDate}</div>
                <div className="text-right"><strong>{t('due')}:</strong> {printInv.dueDate}</div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>{t('description')}</TableHead><TableHead className="text-right">{t('qty')}</TableHead><TableHead className="text-right">{t('price')}</TableHead><TableHead className="text-right">{t('total')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {printInv.lines.map((l, i) => (
                    <TableRow key={i}>
                      <TableCell>{l.description}</TableCell>
                      <TableCell className="text-right">{l.quantity}</TableCell>
                      <TableCell className="text-right">{money(l.unitPrice)}</TableCell>
                      <TableCell className="text-right">{money(l.quantity * l.unitPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="space-y-1 pt-2 border-t text-sm">
                <div className="flex justify-between"><span>{t('subtotal')}</span><span>{money(printInv.total)}</span></div>
                <div className="flex justify-between"><span>{t('amount_paid')}</span><span>{money(printInv.amountPaid)}</span></div>
                <div className="flex justify-between font-bold text-lg pt-1 border-t"><span>{t('balance_due')}</span><span>{money(printInv.total - printInv.amountPaid)}</span></div>
              </div>
              {printInv.notes && <p className="text-xs text-muted-foreground border-t pt-2"><strong>{t('notes')}:</strong> {printInv.notes}</p>}
              <p className="text-xs text-muted-foreground text-center pt-4">{t('thank_you_clinic', { clinic: clinicConfig.name })}</p>
              <Button className="w-full print:hidden" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />{t('print_invoice')}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}