import { Button } from '@/components/ui/button';
import { Bell, LogOut } from 'lucide-react';
import { User } from '@/types';

interface HeaderProps {
  currentUser: User;
  onRoleSwitch: (role: User['role']) => void;
}

export function Header({ currentUser, onRoleSwitch }: HeaderProps) {
  const roles: Array<{ value: User['role']; label: string }> = [
    { value: 'admin', label: 'Admin' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'reception', label: 'Reception' },
    { value: 'patient', label: 'Patient' },
  ];

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">
            Medical Practice Management System
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Role Switcher for Demo */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Switch Role:</span>
            <select 
              value={currentUser.role} 
              onChange={(e) => onRoleSwitch(e.target.value as User['role'])}
              className="px-2 py-1 text-sm border border-input rounded bg-background"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          
          <Button variant="ghost" size="icon">
            <Bell className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}