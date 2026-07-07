import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockPharmacyItems, mockGRVs, mockSales, mockStockTakes } from '@/store/mockData';
import { PharmacyItem, GoodsReceivedVoucher, Sale, SaleLine, StockTake } from '@/types';
import { BarcodeDisplay } from '@/components/common/BarcodeDisplay';
import { BarcodeScanner } from '@/components/common/BarcodeScanner';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Plus, ScanLine, Trash2, Printer, Pill, CheckCircle2, DollarSign } from 'lucide-react';
import { usePrescriptions, markPrescriptionPaid, dispensePrescription, cancelPrescription } from '@/lib/prescriptionsStore';
import { useT } from '@/contexts/LanguageContext';
import { getClinicConfig } from '@/lib/clinicConfig';

const genBarcode = () => '6' + Math.floor(100000000000 + Math.random() * 899999999999).toString();

export default function Pharmacy() {
  const { user } = useAuth();
  const t = useT();
  const [items, setItems] = useState<PharmacyItem[]>(mockPharmacyItems);
  const [grvs, setGRVs] = useState<GoodsReceivedVoucher[]>(mockGRVs);
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [stockTakes, setStockTakes] = useState<StockTake[]>(mockStockTakes);

  // Items dialog
  const [itemDialog, setItemDialog] = useState(false);
  const [itemForm, setItemForm] = useState<Partial<PharmacyItem>>({ category: 'Analgesic', stock: 0, reorderLevel: 10, unitPrice: 0 });
  const [printItem, setPrintItem] = useState<PharmacyItem | null>(null);

  // GRV
  const [grvDialog, setGRVDialog] = useState(false);
  const [grvForm, setGRVForm] = useState<{ supplier: string; notes: string; lines: { itemId: string; quantity: number; unitCost: number }[] }>({ supplier: '', notes: '', lines: [] });

  // Sales (POS)
  const [cart, setCart] = useState<SaleLine[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [customer, setCustomer] = useState('Walk-in');

  // Stock take
  const [takeCounts, setTakeCounts] = useState<Record<string, number>>({});

  const { prescriptions } = usePrescriptions();
  const pendingRx = prescriptions.filter((p) => p.status === 'pending');

  const cartTotal = useMemo(() => cart.reduce((s, l) => s + l.quantity * l.unitPrice, 0), [cart]);

  const role = user?.role;
  const isAdmin = role === 'admin';
  const isSupervisor = role === 'supervisor';
  const isCashier = role === 'cashier';
  const canSell = isAdmin || isCashier;
  const canManage = isAdmin || isSupervisor; // items, GRV, stock take
  const defaultTab = canSell ? 'sales' : 'items';

  const handleAddItem = () => {
    if (!itemForm.name) return;
    const newItem: PharmacyItem = {
      id: 'p' + (items.length + 1),
      barcode: itemForm.barcode || genBarcode(),
      name: itemForm.name!,
      category: itemForm.category || 'General',
      unitPrice: Number(itemForm.unitPrice) || 0,
      stock: Number(itemForm.stock) || 0,
      reorderLevel: Number(itemForm.reorderLevel) || 10,
      supplier: itemForm.supplier,
      expiryDate: itemForm.expiryDate,
    };
    setItems((p) => [...p, newItem]);
    setItemForm({ category: 'Analgesic', stock: 0, reorderLevel: 10, unitPrice: 0 });
    setItemDialog(false);
    toast({ title: 'Item added', description: `${newItem.name} added with barcode ${newItem.barcode}` });
  };

  const addItemToCart = (item: PharmacyItem) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.itemId === item.id);
      if (existing) return prev.map((l) => (l.itemId === item.id ? { ...l, quantity: l.quantity + 1 } : l));
      return [...prev, { itemId: item.id, name: item.name, quantity: 1, unitPrice: item.unitPrice }];
    });
  };

  const handleScannedForSale = (code: string) => {
    const item = items.find((i) => i.barcode === code);
    if (item) {
      addItemToCart(item);
      toast({ title: 'Scanned', description: item.name });
    } else {
      toast({ title: 'Not found', description: `No item with barcode ${code}`, variant: 'destructive' });
    }
  };

  const completeSale = () => {
    if (cart.length === 0) return;
    const sale: Sale = {
      id: 's' + (sales.length + 1),
      receiptNumber: 'RCP-' + String(sales.length + 1).padStart(4, '0'),
      cashierId: user?.id || '',
      customerName: customer,
      lines: cart,
      total: cartTotal,
      paymentMethod: payMethod,
      createdAt: new Date().toISOString(),
    };
    setSales((p) => [sale, ...p]);
    // decrement stock
    setItems((prev) => prev.map((it) => {
      const line = cart.find((c) => c.itemId === it.id);
      return line ? { ...it, stock: Math.max(0, it.stock - line.quantity) } : it;
    }));
    setCart([]);
    toast({ title: 'Sale complete', description: `${sale.receiptNumber} - $${sale.total.toFixed(2)}` });
  };

  // GRV
  const addGRVLine = () => setGRVForm((f) => ({ ...f, lines: [...f.lines, { itemId: items[0]?.id || '', quantity: 1, unitCost: 0 }] }));
  const completeGRV = () => {
    if (!grvForm.supplier || grvForm.lines.length === 0) return;
    const grv: GoodsReceivedVoucher = {
      id: 'g' + (grvs.length + 1),
      grvNumber: 'GRV-' + String(grvs.length + 1).padStart(4, '0'),
      type: 'pharmacy',
      supplier: grvForm.supplier,
      receivedBy: `${user?.firstName} ${user?.lastName}`,
      receivedDate: new Date().toISOString().split('T')[0],
      status: 'complete',
      lines: grvForm.lines,
      notes: grvForm.notes,
    };
    setGRVs((p) => [grv, ...p]);
    // increment stock
    setItems((prev) => prev.map((it) => {
      const line = grv.lines.find((l) => l.itemId === it.id);
      return line ? { ...it, stock: it.stock + line.quantity } : it;
    }));
    setGRVForm({ supplier: '', notes: '', lines: [] });
    setGRVDialog(false);
    toast({ title: 'GRV completed', description: `${grv.grvNumber} received` });
  };

  const finalizeStockTake = () => {
    const lines = Object.entries(takeCounts).map(([itemId, counted]) => {
      const it = items.find((i) => i.id === itemId)!;
      return { itemId, systemQty: it.stock, countedQty: Number(counted) };
    });
    if (lines.length === 0) return;
    const take: StockTake = {
      id: 'st' + (stockTakes.length + 1),
      takeNumber: 'ST-' + String(stockTakes.length + 1).padStart(4, '0'),
      performedBy: `${user?.firstName} ${user?.lastName}`,
      date: new Date().toISOString().split('T')[0],
      lines,
      status: 'finalized',
    };
    setStockTakes((p) => [take, ...p]);
    // adjust to counted
    setItems((prev) => prev.map((it) => {
      const line = lines.find((l) => l.itemId === it.id);
      return line ? { ...it, stock: line.countedQty } : it;
    }));
    setTakeCounts({});
    toast({ title: 'Stock take finalized', description: take.takeNumber });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('pharm_title')}</h2>
        <p className="text-muted-foreground">{t('pharm_desc')}</p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {canSell && <TabsTrigger value="sales">{t('pharm_tab_sales')}</TabsTrigger>}
          <TabsTrigger value="prescriptions">
            {t('pharm_tab_prescriptions')}{pendingRx.length > 0 && <Badge variant="destructive" className="ml-2">{pendingRx.length}</Badge>}
          </TabsTrigger>
          {canManage && <TabsTrigger value="items">{t('pharm_tab_items')}</TabsTrigger>}
          {canManage && <TabsTrigger value="grv">{t('pharm_tab_grv')}</TabsTrigger>}
          {canManage && <TabsTrigger value="stocktake">{t('pharm_tab_stocktake')}</TabsTrigger>}
          <TabsTrigger value="history">{t('pharm_tab_history')}</TabsTrigger>
        </TabsList>

        {/* POS */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('pharm_add_items')}</CardTitle>
                  <CardDescription>{t('pharm_add_items_desc')}</CardDescription>
                </div>
                <Button onClick={() => setScannerOpen(true)}><ScanLine className="w-4 h-4 mr-2" />{t('pharm_scan')}</Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {items.map((it) => (
                    <Button key={it.id} variant="outline" className="h-auto py-3 flex-col items-start" onClick={() => addItemToCart(it)}>
                      <span className="font-medium text-sm">{it.name}</span>
                      <span className="text-xs text-muted-foreground">${it.unitPrice.toFixed(2)} · stock {it.stock}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('pharm_cart')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>{t('pharm_customer')}</Label>
                  <Input value={customer} onChange={(e) => setCustomer(e.target.value)} />
                </div>
                <div className="space-y-2 max-h-72 overflow-auto">
                  {cart.length === 0 && <p className="text-sm text-muted-foreground">{t('pharm_no_items')}</p>}
                  {cart.map((l) => (
                    <div key={l.itemId} className="flex items-center justify-between border-b pb-2">
                      <div className="text-sm">
                        <div>{l.name}</div>
                        <div className="text-xs text-muted-foreground">{l.quantity} × ${l.unitPrice.toFixed(2)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">${(l.quantity * l.unitPrice).toFixed(2)}</span>
                        <Button size="icon" variant="ghost" onClick={() => setCart((p) => p.filter((c) => c.itemId !== l.itemId))}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>{t('pharm_total')}</span><span>${cartTotal.toFixed(2)}</span>
                </div>
                <Select value={payMethod} onValueChange={(v: any) => setPayMethod(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t('pharm_pay_cash')}</SelectItem>
                    <SelectItem value="card">{t('pharm_pay_card')}</SelectItem>
                    <SelectItem value="mobile">{t('pharm_pay_mobile')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full" onClick={completeSale} disabled={cart.length === 0}>{t('pharm_complete_sale')}</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Prescriptions from doctors */}
        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Pill className="w-5 h-5" />{t('pharm_doctor_rx')}</CardTitle>
              <CardDescription>{t('pharm_rx_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {prescriptions.length === 0 && <p className="text-muted-foreground text-sm">{t('pharm_no_rx')}</p>}
              <div className="space-y-3">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="border rounded-md p-3 space-y-2">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div className="font-medium">{rx.patientName}</div>
                        <div className="text-xs text-muted-foreground">{new Date(rx.createdAt).toLocaleString()} · {rx.doctorName || 'Doctor'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={rx.status === 'dispensed' ? 'default' : rx.status === 'cancelled' ? 'secondary' : 'outline'}>{rx.status}</Badge>
                        <Badge variant={rx.paid ? 'default' : 'destructive'}>{rx.paid ? t('pharm_paid') : t('pharm_unpaid')}</Badge>
                        <span className="text-sm font-semibold">${rx.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Table>
                      <TableHeader><TableRow><TableHead>{t('pharm_medication')}</TableHead><TableHead>{t('pharm_qty')}</TableHead><TableHead>{t('pharm_price')}</TableHead><TableHead>{t('pharm_instructions')}</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {rx.items.map((it, i) => (
                          <TableRow key={i}>
                            <TableCell>{it.name}</TableCell>
                            <TableCell>{it.quantity}</TableCell>
                            <TableCell>{it.unitPrice ? `$${Number(it.unitPrice).toFixed(2)}` : '—'}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{it.instructions || ''}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {rx.notes && <p className="text-xs text-muted-foreground">{t('pharm_note')}: {rx.notes}</p>}
                    {rx.status === 'pending' && (
                      <div className="flex flex-wrap gap-2">
                        {isAdmin && !rx.paid && (
                          <Button size="sm" onClick={async () => { await markPrescriptionPaid(rx.id, `${user?.firstName} ${user?.lastName}`); toast({ title: 'Marked paid' }); }}>
                            <DollarSign className="w-4 h-4 mr-1" />{t('pharm_mark_paid')}
                          </Button>
                        )}
                        <Button size="sm" variant="default" disabled={!rx.paid || !canSell} onClick={async () => {
                          // decrement stock for any matching pharmacy items (by name)
                          setItems((prev) => prev.map((it) => {
                            const match = rx.items.find((r) => r.name.trim().toLowerCase() === it.name.trim().toLowerCase());
                            return match ? { ...it, stock: Math.max(0, it.stock - (match.quantity || 0)) } : it;
                          }));
                          await dispensePrescription(rx.id, `${user?.firstName} ${user?.lastName}`);
                          toast({ title: 'Dispensed', description: rx.patientName });
                        }}>
                          <CheckCircle2 className="w-4 h-4 mr-1" />{t('pharm_dispense')}
                        </Button>
                        {isAdmin && (
                          <Button size="sm" variant="ghost" onClick={async () => { await cancelPrescription(rx.id); }}>{t('pharm_cancel')}</Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => {
                          const cfg = getClinicConfig();
                          const w = window.open('', '_blank', 'width=700,height=800'); if (!w) return;
                          w.document.write(`<!doctype html><html><head><title>Rx</title><style>body{font-family:system-ui;padding:24px}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #ddd;padding:6px;text-align:left}.hdr{display:flex;gap:12px;align-items:center;border-bottom:2px solid #333;padding-bottom:12px;margin-bottom:12px}.hdr img{max-height:64px;max-width:120px}.hdr h1{margin:0;font-size:20px}.hdr p{margin:0;font-size:12px;color:#555}</style></head><body>
                          <div class="hdr">${cfg.logoDataUrl ? `<img src="${cfg.logoDataUrl}" alt="logo"/>` : ''}<div><h1>${cfg.name}</h1><p>${cfg.address}</p><p>${cfg.phone} · ${cfg.email}</p></div></div>
                          <h2>Prescription</h2><p><b>${rx.patientName}</b> · ${new Date(rx.createdAt).toLocaleDateString()} · ${rx.doctorName || ''}</p>
                          <table><thead><tr><th>Medication</th><th>Qty</th><th>Instructions</th></tr></thead><tbody>
                          ${rx.items.map((i) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.instructions || ''}</td></tr>`).join('')}
                          </tbody></table>${rx.notes ? `<p>Note: ${rx.notes}</p>` : ''}</body></html>`);
                          w.document.close(); setTimeout(() => w.print(), 300);
                        }}><Printer className="w-4 h-4 mr-1" />{t('pharm_print')}</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={itemDialog} onOpenChange={setItemDialog}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Item</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Pharmacy Item</DialogTitle><DialogDescription>Barcode auto-generated if blank</DialogDescription></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input value={itemForm.name || ''} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Category</Label><Input value={itemForm.category || ''} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} /></div>
                    <div><Label>Supplier</Label><Input value={itemForm.supplier || ''} onChange={(e) => setItemForm({ ...itemForm, supplier: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label>Price</Label><Input type="number" value={itemForm.unitPrice ?? 0} onChange={(e) => setItemForm({ ...itemForm, unitPrice: Number(e.target.value) })} /></div>
                    <div><Label>Stock</Label><Input type="number" value={itemForm.stock ?? 0} onChange={(e) => setItemForm({ ...itemForm, stock: Number(e.target.value) })} /></div>
                    <div><Label>Reorder</Label><Input type="number" value={itemForm.reorderLevel ?? 0} onChange={(e) => setItemForm({ ...itemForm, reorderLevel: Number(e.target.value) })} /></div>
                  </div>
                  <div><Label>Barcode (optional)</Label><Input value={itemForm.barcode || ''} onChange={(e) => setItemForm({ ...itemForm, barcode: e.target.value })} /></div>
                  <Button className="w-full" onClick={handleAddItem}>Add Item</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Name</TableHead><TableHead>Barcode</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell className="font-medium">{it.name}</TableCell>
                      <TableCell className="font-mono text-xs">{it.barcode}</TableCell>
                      <TableCell>{it.category}</TableCell>
                      <TableCell>${it.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        {it.stock} {it.stock <= it.reorderLevel && <Badge variant="destructive" className="ml-1">Low</Badge>}
                      </TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={() => setPrintItem(it)}><Printer className="w-4 h-4 mr-1" />Barcode</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Dialog open={!!printItem} onOpenChange={(o) => !o && setPrintItem(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>{printItem?.name}</DialogTitle></DialogHeader>
              <div className="flex justify-center py-4">{printItem && <BarcodeDisplay value={printItem.barcode} />}</div>
              <Button onClick={() => window.print()}>Print</Button>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* GRV */}
        <TabsContent value="grv" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={grvDialog} onOpenChange={setGRVDialog}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New GRV</Button></DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Goods Received Voucher</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Supplier</Label><Input value={grvForm.supplier} onChange={(e) => setGRVForm({ ...grvForm, supplier: e.target.value })} /></div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Lines</Label>
                      <Button size="sm" variant="outline" onClick={addGRVLine}><Plus className="w-3 h-3 mr-1" />Line</Button>
                    </div>
                    {grvForm.lines.map((l, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2">
                        <Select value={l.itemId} onValueChange={(v) => setGRVForm((f) => ({ ...f, lines: f.lines.map((x, i) => i === idx ? { ...x, itemId: v } : x) }))}>
                          <SelectTrigger className="col-span-6"><SelectValue /></SelectTrigger>
                          <SelectContent>{items.map((it) => <SelectItem key={it.id} value={it.id}>{it.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Input className="col-span-3" type="number" placeholder="Qty" value={l.quantity} onChange={(e) => setGRVForm((f) => ({ ...f, lines: f.lines.map((x, i) => i === idx ? { ...x, quantity: Number(e.target.value) } : x) }))} />
                        <Input className="col-span-3" type="number" placeholder="Cost" value={l.unitCost} onChange={(e) => setGRVForm((f) => ({ ...f, lines: f.lines.map((x, i) => i === idx ? { ...x, unitCost: Number(e.target.value) } : x) }))} />
                      </div>
                    ))}
                  </div>
                  <div><Label>Notes</Label><Input value={grvForm.notes} onChange={(e) => setGRVForm({ ...grvForm, notes: e.target.value })} /></div>
                  <Button className="w-full" onClick={completeGRV}>Complete & Receive Stock</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow><TableHead>GRV#</TableHead><TableHead>Supplier</TableHead><TableHead>Date</TableHead><TableHead>Lines</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {grvs.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-mono">{g.grvNumber}</TableCell>
                      <TableCell>{g.supplier}</TableCell>
                      <TableCell>{g.receivedDate}</TableCell>
                      <TableCell>{g.lines.length}</TableCell>
                      <TableCell><Badge variant={g.status === 'complete' ? 'default' : 'secondary'}>{g.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Take */}
        <TabsContent value="stocktake" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>New Stock Take</CardTitle><CardDescription>Enter counted quantities</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>System Qty</TableHead><TableHead>Counted</TableHead><TableHead>Variance</TableHead></TableRow></TableHeader>
                <TableBody>
                  {items.map((it) => {
                    const counted = takeCounts[it.id] ?? '';
                    const variance = counted === '' ? 0 : Number(counted) - it.stock;
                    return (
                      <TableRow key={it.id}>
                        <TableCell>{it.name}</TableCell>
                        <TableCell>{it.stock}</TableCell>
                        <TableCell><Input className="w-24" type="number" value={counted} onChange={(e) => setTakeCounts({ ...takeCounts, [it.id]: Number(e.target.value) })} /></TableCell>
                        <TableCell className={variance < 0 ? 'text-destructive' : variance > 0 ? 'text-primary' : ''}>{variance > 0 ? '+' : ''}{variance}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Button className="mt-4" onClick={finalizeStockTake}>Finalize Stock Take</Button>
            </CardContent>
          </Card>
          {stockTakes.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Previous Stock Takes</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Date</TableHead><TableHead>By</TableHead><TableHead>Lines</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {stockTakes.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.takeNumber}</TableCell>
                        <TableCell>{s.date}</TableCell>
                        <TableCell>{s.performedBy}</TableCell>
                        <TableCell>{s.lines.length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow><TableHead>Receipt</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Payment</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {sales.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono">{s.receiptNumber}</TableCell>
                      <TableCell>{s.customerName}</TableCell>
                      <TableCell>{s.lines.length}</TableCell>
                      <TableCell>${s.total.toFixed(2)}</TableCell>
                      <TableCell><Badge variant="outline">{s.paymentMethod}</Badge></TableCell>
                      <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleScannedForSale} />
    </div>
  );
}