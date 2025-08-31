import { Calendar, Users, UserCircle, Settings, QrCode, BarChart3, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { User, UserRole } from '@/types';

interface SidebarProps {
  currentUser: User;
}

const navigationItems = {
  admin: [
    { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { href: '/patients', icon: Users, label: 'Patients' },
    { href: '/appointments', icon: Calendar, label: 'Appointments' },
    { href: '/users', icon: Shield, label: 'User Management' },
    { href: '/doctors', icon: UserCircle, label: 'Doctors' },
    { href: '/qr-generator', icon: QrCode, label: 'QR Generator' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ],
  doctor: [
    { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { href: '/appointments', icon: Calendar, label: 'My Appointments' },
    { href: '/patients', icon: Users, label: 'My Patients' },
  ],
  reception: [
    { href: '/appointments', icon: Calendar, label: 'Appointments' },
    { href: '/qr-generator', icon: QrCode, label: 'QR Generator' },
  ],
  patient: [
    { href: '/my-appointments', icon: Calendar, label: 'My Appointments' },
    { href: '/profile', icon: UserCircle, label: 'My Profile' },
  ],
};

export function Sidebar({ currentUser }: SidebarProps) {
  const location = useLocation();
  const items = navigationItems[currentUser.role as UserRole] || [];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-sidebar-foreground">MediCare PMS</h2>
        <p className="text-sm text-sidebar-foreground/70 mt-1">
          {currentUser.firstName} {currentUser.lastName}
        </p>
        <p className="text-xs text-sidebar-foreground/50 capitalize">{currentUser.role}</p>
      </div>
      
      <nav className="px-4 space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              location.pathname === item.href
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}