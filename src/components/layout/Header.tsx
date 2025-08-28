import { Button } from '@/components/ui/button';
import { Bell, LogOut } from 'lucide-react';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  currentUser: User;
}

export function Header({ currentUser }: HeaderProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">
            Medical Practice Management System
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Welcome,</span>
            <span className="font-medium text-foreground">
              {currentUser.firstName} {currentUser.lastName}
            </span>
            <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
              {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
            </span>
          </div>
          
          <Button variant="ghost" size="icon">
            <Bell className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}