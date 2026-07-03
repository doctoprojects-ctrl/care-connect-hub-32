import { useEffect, useState } from 'react';

export const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSn6WsNGWn6gB-zApSZ_8vIHP2QdD6XQ4DekBvFhRn9pEcBe0ezfqkYLkglBxZmtdONhgjDgWnWTmLz/pub?gid=0&single=true&output=csv';

export interface SheetAppointment {
  id: string;
  firstName: string;
  lastName: string;
  date: string;
  time: string;
  type: string;
  notes: string;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { cur.push(field); field = ''; }
      else if (c === '\n') { cur.push(field); rows.push(cur); cur = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  return rows.filter(r => r.some(v => v.trim().length));
}

export async function fetchSheetAppointments(): Promise<SheetAppointment[]> {
  const res = await fetch(`${SHEET_CSV_URL}&_=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const text = await res.text();
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase());
  const idx = (name: string) => headers.findIndex(h => h === name.toLowerCase());
  const iId = idx('ID');
  const iFirst = headers.findIndex(h => h.startsWith('patient name'));
  const iLast = headers.findIndex(h => h.startsWith('patient surname'));
  const iDate = idx('Date');
  const iTime = idx('Time');
  const iType = headers.findIndex(h => h.startsWith('appointment type'));
  const iNotes = idx('Notes');
  return rows.slice(1).map((r, n) => ({
    id: (r[iId] || '').trim() || String(n + 1),
    firstName: (r[iFirst] || '').trim(),
    lastName: (r[iLast] || '').trim(),
    date: (r[iDate] || '').trim(),
    time: (r[iTime] || '').trim(),
    type: (r[iType] || '').trim(),
    notes: (r[iNotes] || '').trim(),
  }));
}

export function useSheetAppointments(pollMs = 30000) {
  const [data, setData] = useState<SheetAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setError(null);
      const rows = await fetchSheetAppointments();
      setData(rows);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load sheet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, pollMs);
    return () => clearInterval(t);
  }, [pollMs]);

  return { data, loading, error, refresh };
}