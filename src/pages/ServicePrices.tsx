import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockServicePrices } from '@/store/mockData';
import { ServicePrice } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ServicePrices() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'supervisor';
  const [services, setServices] = useState<ServicePrice[]>(mockServicePrices);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState<Partial<ServicePrice>>({ category: 'Consultation', price: 0 });

  const add = () => {
    if (!form.name || !form.code) return;
    const sv: ServicePrice = { id: 'sv' + (services.length + 1), code: form.code, name: form.name, category: form.category || 'General', price: Number(form.price) || 0, description: form.description };
    setServices((p) => [...p, sv]);
    setForm({ category: 'Consultation', price: 0 });
    setDialog(false);
    toast({ title: 'Service added' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clinic Service Prices</h2>
          <p className="text-muted-foreground">Standard rates for consultations, procedures and tests</p>
        </div>
        {canEdit && (
          <Dialog open={dialog} onOpenChange={setDialog}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Service</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Service</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Code</Label><Input value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
                <div><Label>Name</Label><Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Category</Label><Input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div><Label>Price</Label><Input type="number" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
                <div><Label>Description</Label><Input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <Button className="w-full" onClick={add}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Service</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono">{s.code}</TableCell>
                  <TableCell>{s.name}{s.description && <div className="text-xs text-muted-foreground">{s.description}</div>}</TableCell>
                  <TableCell>{s.category}</TableCell>
                  <TableCell className="text-right font-semibold">${s.price.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}