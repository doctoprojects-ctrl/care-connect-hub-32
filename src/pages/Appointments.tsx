import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCcw, ExternalLink, Search } from 'lucide-react';
import { SHEET_CSV_URL, useSheetAppointments } from '@/lib/sheetsAppointments';

export default function Appointments() {
  const { data, loading, error, refresh } = useSheetAppointments();
  const [q, setQ] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.filter(a => {
      if (dateFilter && a.date !== dateFilter) return false;
      if (!s) return true;
      return (
        a.id.toLowerCase().includes(s) ||
        a.firstName.toLowerCase().includes(s) ||
        a.lastName.toLowerCase().includes(s) ||
        a.type.toLowerCase().includes(s)
      );
    });
  }, [data, q, dateFilter]);

  const sheetEditUrl = SHEET_CSV_URL.split('/pub?')[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">
            Bookings sync live from the Google Sheet. Each row's <strong>ID</strong> is the patient's appointment number
            — they present it at reception to confirm arrival.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button asChild variant="outline">
            <a href={sheetEditUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> Open Sheet
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>Booked Appointments {loading ? '…' : `(${data.length})`}</span>
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
                  placeholder="Search ID or name"
                  className="pl-8 w-56"
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              Failed to load sheet: {error}
            </div>
          )}
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Appt #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {loading ? 'Loading…' : 'No appointments found.'}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell><Badge variant="default">{a.id}</Badge></TableCell>
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