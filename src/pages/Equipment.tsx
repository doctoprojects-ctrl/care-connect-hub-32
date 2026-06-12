import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { mockEquipment, mockMaintenanceSchedules, mockFaultyReports } from '@/store/mockData';
import { Equipment, MaintenanceSchedule, FaultyReport } from '@/types';
import { BarcodeDisplay } from '@/components/common/BarcodeDisplay';
import { BarcodeScanner } from '@/components/common/BarcodeScanner';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Printer, ScanLine, AlertTriangle } from 'lucide-react';

const genEqBarcode = () => 'EQ-' + Math.floor(1000000 + Math.random() * 8999999);

export default function EquipmentPage() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>(mockMaintenanceSchedules);
  const [faulty, setFaulty] = useState<FaultyReport[]>(mockFaultyReports);

  const [eqDialog, setEqDialog] = useState(false);
  const [eqForm, setEqForm] = useState<Partial<Equipment>>({ status: 'operational' });
  const [printEq, setPrintEq] = useState<Equipment | null>(null);

  const [schedDialog, setSchedDialog] = useState(false);
  const [schedForm, setSchedForm] = useState<Partial<MaintenanceSchedule>>({ intervalDays: 90, status: 'scheduled' });

  const [faultDialog, setFaultDialog] = useState(false);
  const [faultForm, setFaultForm] = useState<Partial<FaultyReport>>({ severity: 'medium', status: 'open' });

  const [scanOpen, setScanOpen] = useState(false);

  const addEquipment = () => {
    if (!eqForm.name) return;
    const eq: Equipment = {
      id: 'e' + (equipment.length + 1),
      barcode: eqForm.barcode || genEqBarcode(),
      name: eqForm.name!,
      serialNumber: eqForm.serialNumber || '',
      location: eqForm.location || '',
      purchaseDate: eqForm.purchaseDate || new Date().toISOString().split('T')[0],
      status: (eqForm.status as Equipment['status']) || 'operational',
    };
    setEquipment((p) => [...p, eq]);
    setEqForm({ status: 'operational' });
    setEqDialog(false);
    toast({ title: 'Equipment added', description: `${eq.name} - ${eq.barcode}` });
  };

  const addSchedule = () => {
    if (!schedForm.equipmentId || !schedForm.scheduledDate) return;
    const s: MaintenanceSchedule = {
      id: 'm' + (schedules.length + 1),
      equipmentId: schedForm.equipmentId!,
      scheduledDate: schedForm.scheduledDate!,
      intervalDays: Number(schedForm.intervalDays) || 90,
      technician: schedForm.technician || 'Internal',
      notes: schedForm.notes,
      status: (schedForm.status as any) || 'scheduled',
    };
    setSchedules((p) => [...p, s]);
    setSchedForm({ intervalDays: 90, status: 'scheduled' });
    setSchedDialog(false);
    toast({ title: 'Maintenance scheduled' });
  };

  const reportFaulty = () => {
    if (!faultForm.equipmentId || !faultForm.description) return;
    const f: FaultyReport = {
      id: 'f' + (faulty.length + 1),
      equipmentId: faultForm.equipmentId!,
      reportedBy: `${user?.firstName} ${user?.lastName}`,
      reportedDate: new Date().toISOString().split('T')[0],
      description: faultForm.description!,
      severity: (faultForm.severity as any) || 'medium',
      status: 'open',
    };
    setFaulty((p) => [f, ...p]);
    setEquipment((prev) => prev.map((e) => (e.id === f.equipmentId ? { ...e, status: 'faulty' } : e)));
    setFaultForm({ severity: 'medium', status: 'open' });
    setFaultDialog(false);
    toast({ title: 'Faulty report submitted', variant: 'destructive' });
  };

  const handleScan = (code: string) => {
    const eq = equipment.find((e) => e.barcode === code);
    if (eq) setPrintEq(eq);
    else toast({ title: 'Not found', description: code, variant: 'destructive' });
  };

  const eqName = (id: string) => equipment.find((e) => e.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Equipment</h2>
          <p className="text-muted-foreground">Inventory, maintenance and fault reporting</p>
        </div>
        <Button variant="outline" onClick={() => setScanOpen(true)}><ScanLine className="w-4 h-4 mr-2" />Scan Equipment</Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Equipment</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="faulty">Faulty Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={eqDialog} onOpenChange={setEqDialog}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Equipment</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Equipment</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input value={eqForm.name || ''} onChange={(e) => setEqForm({ ...eqForm, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Serial #</Label><Input value={eqForm.serialNumber || ''} onChange={(e) => setEqForm({ ...eqForm, serialNumber: e.target.value })} /></div>
                    <div><Label>Location</Label><Input value={eqForm.location || ''} onChange={(e) => setEqForm({ ...eqForm, location: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Purchase Date</Label><Input type="date" value={eqForm.purchaseDate || ''} onChange={(e) => setEqForm({ ...eqForm, purchaseDate: e.target.value })} /></div>
                    <div><Label>Status</Label>
                      <Select value={eqForm.status as string} onValueChange={(v) => setEqForm({ ...eqForm, status: v as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operational">Operational</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="faulty">Faulty</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Barcode (optional)</Label><Input value={eqForm.barcode || ''} onChange={(e) => setEqForm({ ...eqForm, barcode: e.target.value })} /></div>
                  <Button className="w-full" onClick={addEquipment}>Add Equipment</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Name</TableHead><TableHead>Barcode</TableHead><TableHead>Serial</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {equipment.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell className="font-mono text-xs">{e.barcode}</TableCell>
                      <TableCell>{e.serialNumber}</TableCell>
                      <TableCell>{e.location}</TableCell>
                      <TableCell>
                        <Badge variant={e.status === 'operational' ? 'default' : e.status === 'faulty' ? 'destructive' : 'secondary'}>{e.status}</Badge>
                      </TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={() => setPrintEq(e)}><Printer className="w-4 h-4 mr-1" />Barcode</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={!!printEq} onOpenChange={(o) => !o && setPrintEq(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>{printEq?.name}</DialogTitle></DialogHeader>
              <div className="flex justify-center py-4">{printEq && <BarcodeDisplay value={printEq.barcode} />}</div>
              <Button onClick={() => window.print()}>Print</Button>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={schedDialog} onOpenChange={setSchedDialog}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Schedule</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Schedule Maintenance</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Equipment</Label>
                    <Select value={schedForm.equipmentId} onValueChange={(v) => setSchedForm({ ...schedForm, equipmentId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{equipment.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Date</Label><Input type="date" value={schedForm.scheduledDate || ''} onChange={(e) => setSchedForm({ ...schedForm, scheduledDate: e.target.value })} /></div>
                    <div><Label>Interval (days)</Label><Input type="number" value={schedForm.intervalDays ?? 90} onChange={(e) => setSchedForm({ ...schedForm, intervalDays: Number(e.target.value) })} /></div>
                  </div>
                  <div><Label>Technician</Label><Input value={schedForm.technician || ''} onChange={(e) => setSchedForm({ ...schedForm, technician: e.target.value })} /></div>
                  <div><Label>Notes</Label><Textarea value={schedForm.notes || ''} onChange={(e) => setSchedForm({ ...schedForm, notes: e.target.value })} /></div>
                  <Button className="w-full" onClick={addSchedule}>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow><TableHead>Equipment</TableHead><TableHead>Date</TableHead><TableHead>Interval</TableHead><TableHead>Technician</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {schedules.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{eqName(s.equipmentId)}</TableCell>
                      <TableCell>{s.scheduledDate}</TableCell>
                      <TableCell>{s.intervalDays}d</TableCell>
                      <TableCell>{s.technician}</TableCell>
                      <TableCell><Badge variant={s.status === 'done' ? 'default' : s.status === 'in-progress' ? 'secondary' : 'outline'}>{s.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faulty" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={faultDialog} onOpenChange={setFaultDialog}>
              <DialogTrigger asChild><Button variant="destructive"><AlertTriangle className="w-4 h-4 mr-2" />Report Faulty</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Report Faulty Equipment</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Equipment</Label>
                    <Select value={faultForm.equipmentId} onValueChange={(v) => setFaultForm({ ...faultForm, equipmentId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{equipment.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Severity</Label>
                    <Select value={faultForm.severity as string} onValueChange={(v) => setFaultForm({ ...faultForm, severity: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Description</Label><Textarea value={faultForm.description || ''} onChange={(e) => setFaultForm({ ...faultForm, description: e.target.value })} /></div>
                  <Button className="w-full" variant="destructive" onClick={reportFaulty}>Submit Report</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow><TableHead>Equipment</TableHead><TableHead>Reported By</TableHead><TableHead>Date</TableHead><TableHead>Severity</TableHead><TableHead>Description</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {faulty.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>{eqName(f.equipmentId)}</TableCell>
                      <TableCell>{f.reportedBy}</TableCell>
                      <TableCell>{f.reportedDate}</TableCell>
                      <TableCell><Badge variant={f.severity === 'high' ? 'destructive' : f.severity === 'medium' ? 'secondary' : 'outline'}>{f.severity}</Badge></TableCell>
                      <TableCell className="max-w-xs truncate">{f.description}</TableCell>
                      <TableCell><Badge variant={f.status === 'resolved' ? 'default' : 'secondary'}>{f.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BarcodeScanner open={scanOpen} onClose={() => setScanOpen(false)} onScan={handleScan} />
    </div>
  );
}