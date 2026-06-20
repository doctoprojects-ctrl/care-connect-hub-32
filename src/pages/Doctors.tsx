import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockUsers } from '@/store/mockData';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { UserCircle, Plus, Search } from 'lucide-react';

export default function Doctors() {
  const { user } = useAuth();
  const t = useT();
  const canEdit = user?.role === 'admin';

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', pin: '' });

  const doctors = useMemo(
    () =>
      users
        .filter((u) => u.role === 'doctor')
        .filter((u) => {
          const q = query.trim().toLowerCase();
          if (!q) return true;
          return (
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
          );
        }),
    [users, query]
  );

  const addDoctor = () => {
    if (!form.firstName || !form.lastName || !form.pin) {
      toast({ title: 'Missing fields', description: 'First name, last name and PIN are required.', variant: 'destructive' });
      return;
    }
    const newDoc: User = {
      id: `doc-${Date.now()}`,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || `${form.firstName.toLowerCase()}@clinic.com`,
      role: 'doctor',
      pin: form.pin,
      isActive: true,
    };
    mockUsers.push(newDoc);
    setUsers([...mockUsers]);
    setForm({ firstName: '', lastName: '', email: '', pin: '' });
    setOpen(false);
    toast({ title: 'Doctor added', description: `Dr. ${newDoc.firstName} ${newDoc.lastName}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCircle className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{t('nav_doctors')}</h1>
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('add')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('add')} — {t('nav_doctors')}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div>
                  <Label>First name</Label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div>
                  <Label>Last name</Label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label>{t('pin')}</Label>
                  <Input maxLength={15} value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>{t('cancel')}</Button>
                  <Button onClick={addDoctor}>{t('save')}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{doctors.length} {t('nav_doctors')}</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder={t('search')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    —
                  </TableCell>
                </TableRow>
              ) : (
                doctors.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">Dr. {d.firstName} {d.lastName}</TableCell>
                    <TableCell>{d.email}</TableCell>
                    <TableCell>
                      <Badge variant={d.isActive ? 'default' : 'secondary'}>
                        {d.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}