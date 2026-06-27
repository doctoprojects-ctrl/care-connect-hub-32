import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Edit, Trash2 } from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'reception' as User['role'],
    pin: '',
  });

  const mapRow = (r: any): User => ({
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email ?? '',
    role: r.role,
    pin: r.pin,
    isActive: r.is_active,
  });

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      toast({ title: 'Error loading users', description: error.message, variant: 'destructive' });
      return;
    }
    setUsers((data ?? []).map(mapRow));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      role: formData.role,
      pin: formData.pin,
    };

    if (editingUser) {
      const { error } = await supabase.from('app_users').update(payload).eq('id', editingUser.id);
      if (error) {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'User Updated', description: `${formData.firstName} ${formData.lastName} has been updated.` });
    } else {
      const { error } = await supabase.from('app_users').insert(payload);
      if (error) {
        toast({ title: 'Create failed', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'User Created', description: `${formData.firstName} ${formData.lastName} has been added.` });
    }

    await loadUsers();
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'reception',
      pin: '',
    });
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      pin: user.pin,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    const { error } = await supabase.from('app_users').delete().eq('id', userId);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    await loadUsers();
    toast({ title: 'User Deleted', description: 'User has been removed from the system.', variant: 'destructive' });
  };

  const toggleUserStatus = async (userId: string) => {
    const u = users.find(x => x.id === userId);
    if (!u) return;
    const { error } = await supabase.from('app_users').update({ is_active: !u.isActive }).eq('id', userId);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }
    await loadUsers();
  };

  const getRoleBadgeVariant = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'doctor': return 'default';
      case 'reception': return 'secondary';
      case 'patient': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage system users and their access permissions</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Update user information and access permissions'
                  : 'Create a new user account for the medical practice system'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: User['role']) => 
                    setFormData(prev => ({ ...prev, role: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="reception">Reception</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                     <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    value={formData.pin}
                    onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value }))}
                    placeholder="Enter PIN (any format)"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            All users registered in the medical practice system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => toggleUserStatus(user.id)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        disabled={user.role === 'admin'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
