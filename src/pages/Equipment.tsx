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
import { useT } from '@/contexts/LanguageContext';
import { getClinicConfig } from '@/lib/clinicConfig';

const genEqBarcode = () => 'EQ-' + Math.floor(1000000 + Math.random() * 8999999);

export default function EquipmentPage() {
  const { user } = useAuth();
  const t = useT();
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
          <h2 className="text-3xl font-bold tracking-tight">{t('eq_title')}</h2>
          <p className="text-muted-foreground">{t('eq_desc')}</p>
        </div>
        <Button variant="outline" onClick={() => setScanOpen(true)}><ScanLine className="w-4 h-4 mr-2" />{t('eq_scan')}</Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">{t('eq_tab_list')}</TabsTrigger>
          <TabsTrigger value="maintenance">{t('eq_tab_maintenance')}</TabsTrigger>
          <TabsTrigger value="faulty">{t('eq_tab_faulty')}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={eqDialog} onOpenChange={setEqDialog}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />{t('eq_add')}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t('eq_new')}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>{t('eq_name')}</Label><Input value={eqForm.name || ''} onChange={(e) => setEqForm({ ...eqForm, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>{t('eq_serial')}</Label><Input value={eqForm.serialNumber || ''} onChange={(e) => setEqForm({ ...eqForm, serialNumber: e.target.value })} /></div>
                    <div><Label>{t('eq_location')}</Label><Input value={eqForm.location || ''} onChange={(e) => setEqForm({ ...eqForm, location: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>{t('eq_purchase')}</Label><Input type="date" value={eqForm.purchaseDate || ''} onChange={(e) => setEqForm({ ...eqForm, purchaseDate: e.target.value })} /></div>
                    <div><Label>{t('eq_status')}</Label>
                      <Select value={eqForm.status as string} onValueChange={(v) => setEqForm({ ...eqForm, status: v as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operational">{t('eq_status_operational')}</SelectItem>
                          <SelectItem value="maintenance">{t('eq_status_maintenance')}</SelectItem>
                          <SelectItem value="faulty">{t('eq_status_faulty')}</SelectItem>
                          <SelectItem value="retired">{t('eq_status_retired')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>{t('pharm_barcode_optional')}</Label><Input value={eqForm.barcode || ''} onChange={(e) => setEqForm({ ...eqForm, barcode: e.target.value })} /></div>
                  <Button className="w-full" onClick={addEquipment}>{t('eq_add')}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{t('eq_name')}</TableHead><TableHead>{t('eq_barcode')}</TableHead><TableHead>{t('eq_serial')}</TableHead><TableHead>{t('eq_location')}</TableHead><TableHead>{t('eq_status')}</TableHead><TableHead>{t('eq_actions')}</TableHead>
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
                      <TableCell><Button size="sm" variant="outline" onClick={() => setPrintEq(e)}><Printer className="w-4 h-4 mr-1" />{t('eq_print_barcode')}</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={!!printEq} onOpenChange={(o) => !o && setPrintEq(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>{printEq?.name}</DialogTitle></DialogHeader>
              {getClinicConfig().logoDataUrl && (
                <div className="flex items-center gap-2 justify-center border-b pb-2">
                  <img src={getClinicConfig().logoDataUrl} alt="logo" className="max-h-10" />
                  <span className="font-semibold">{getClinicConfig().name}</span>
                </div>
              )}
              <div className="flex justify-center py-4">{printEq && <BarcodeDisplay value={printEq.barcode} />}</div>
              <Button onClick={() => window.print()}>{t('pharm_print')}</Button>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={schedDialog} onOpenChange={setSchedDialog}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />{t('eq_schedule')}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t('eq_schedule_maintenance')}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>{t('eq_tab_list')}</Label>
                    <Select value={schedForm.equipmentId} onValueChange={(v) => setSchedForm({ ...schedForm, equipmentId: v })}>
                      <SelectTrigger><SelectValue placeholder={t('eq_select')} /></SelectTrigger>
                      <SelectContent>{equipment.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>{t('eq_date')}</Label><Input type="date" value={schedForm.scheduledDate || ''} onChange={(e) => setSchedForm({ ...schedForm, scheduledDate: e.target.value })} /></div>
                    <div><Label>{t('eq_interval')}</Label><Input type="number" value={schedForm.intervalDays ?? 90} onChange={(e) => setSchedForm({ ...schedForm, intervalDays: Number(e.target.value) })} /></div>
                  </div>
                  <div><Label>{t('eq_technician')}</Label><Input value={schedForm.technician || ''} onChange={(e) => setSchedForm({ ...schedForm, technician: e.target.value })} /></div>
                  <div><Label>{t('eq_notes')}</Label><Textarea value={schedForm.notes || ''} onChange={(e) => setSchedForm({ ...schedForm, notes: e.target.value })} /></div>
                  <Button className="w-full" onClick={addSchedule}>{t('save')}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow><TableHead>{t('eq_tab_list')}</TableHead><TableHead>{t('eq_date')}</TableHead><TableHead>{t('eq_interval')}</TableHead><TableHead>{t('eq_technician')}</TableHead><TableHead>{t('eq_status')}</TableHead></TableRow></TableHeader>
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
              <DialogTrigger asChild><Button variant="destructive"><AlertTriangle className="w-4 h-4 mr-2" />{t('eq_report_faulty')}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t('eq_report_faulty_title')}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>{t('eq_tab_list')}</Label>
                    <Select value={faultForm.equipmentId} onValueChange={(v) => setFaultForm({ ...faultForm, equipmentId: v })}>
                      <SelectTrigger><SelectValue placeholder={t('eq_select')} /></SelectTrigger>
                      <SelectContent>{equipment.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>{t('eq_severity')}</Label>
                    <Select value={faultForm.severity as string} onValueChange={(v) => setFaultForm({ ...faultForm, severity: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('eq_severity_low')}</SelectItem>
                        <SelectItem value="medium">{t('eq_severity_medium')}</SelectItem>
                        <SelectItem value="high">{t('eq_severity_high')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>{t('eq_description')}</Label><Textarea value={faultForm.description || ''} onChange={(e) => setFaultForm({ ...faultForm, description: e.target.value })} /></div>
                  <Button className="w-full" variant="destructive" onClick={reportFaulty}>{t('eq_submit_report')}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow><TableHead>{t('eq_tab_list')}</TableHead><TableHead>{t('eq_reported_by')}</TableHead><TableHead>{t('eq_date')}</TableHead><TableHead>{t('eq_severity')}</TableHead><TableHead>{t('eq_description')}</TableHead><TableHead>{t('eq_status')}</TableHead></TableRow></TableHeader>
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