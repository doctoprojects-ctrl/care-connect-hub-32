import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCcw, ExternalLink, Search } from 'lucide-react';
import { SHEET_CSV_URL, useSheetAppointments } from '@/lib/sheetsAppointments';
import { useT } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedAppt {
  id: string;
  source: 'qr' | 'sheet';
  firstName: string;
  lastName: string;
  date: string;
  time: string;
  type: string;
  notes: string;
  status?: string;
}

export default function Appointments() {
  const t = useT();
  const { data, loading, error, refresh } = useSheetAppointments();
  const [dbAppts, setDbAppts] = useState<UnifiedAppt[]>([]);
  const [q, setQ] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const loadDb = async () => {
    const { data: rows } = await supabase
      .from('appointments')
      .select('id, appointment_date, appointment_time, type, notes, status, patients(first_name, last_name)')
      .order('appointment_date', { ascending: false })
      .limit(500);
    setDbAppts(
      (rows ?? []).map((r: any) => ({
        id: `APP-${String(r.id).slice(0, 6).toUpperCase()}`,
        source: 'qr' as const,
        firstName: r.patients?.first_name ?? '',
        lastName: r.patients?.last_name ?? '',
        date: r.appointment_date,
        time: (r.appointment_time || '').slice(0, 5),
        type: r.type ?? '',
        notes: r.notes ?? '',
        status: r.status,
      })),
    );
  };

  useEffect(() => {
    loadDb();
    const ch = supabase
      .channel('appointments-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, loadDb)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const merged: UnifiedAppt[] = useMemo(() => {
    const sheet: UnifiedAppt[] = data.map((a) => ({ ...a, source: 'sheet' as const }));
    return [...dbAppts, ...sheet];
  }, [data, dbAppts]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return merged.filter(a => {
      if (dateFilter && a.date !== dateFilter) return false;
      if (!s) return true;
      return (
        a.id.toLowerCase().includes(s) ||
        a.firstName.toLowerCase().includes(s) ||
        a.lastName.toLowerCase().includes(s) ||
        a.type.toLowerCase().includes(s)
      );
    });
  }, [merged, q, dateFilter]);

  const sheetEditUrl = SHEET_CSV_URL.split('/pub?')[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('appointments_title')}</h2>
          <p className="text-muted-foreground">{t('appointments_desc')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { refresh(); loadDb(); }}>
            <RefreshCcw className="w-4 h-4 mr-2" /> {t('refresh')}
          </Button>
          <Button asChild variant="outline">
            <a href={sheetEditUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> {t('open_sheet')}
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>{t('booked_appointments')} {loading ? '…' : `(${merged.length})`}</span>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-40"
              />
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t('search_id_or_name')}
                  className="pl-8 w-56"
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              {t('load_sheet_failed')}: {error}
            </div>
          )}
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('appt_number')}</TableHead>
                  <TableHead>{t('patient')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('time')}</TableHead>
                  <TableHead>{t('type')}</TableHead>
                  <TableHead>{t('notes')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {loading ? t('loading') : t('no_appointments')}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((a) => (
                  <TableRow key={`${a.source}-${a.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant={a.source === 'qr' ? 'default' : 'secondary'}>{a.id}</Badge>
                        {a.source === 'qr' && <Badge variant="outline" className="text-xs">QR</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{a.firstName} {a.lastName}</TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>{a.time}</TableCell>
                    <TableCell>{a.type}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{a.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}