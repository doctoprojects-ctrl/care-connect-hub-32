import { Calendar, Users, UserCircle, Settings, QrCode, BarChart3, Shield, Pill, Wrench, CalendarDays, Receipt, DollarSign, FileText, ClipboardList, Tag, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { User, UserRole } from '@/types';
import { useT } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/lib/translations';

interface SidebarProps {
  currentUser: User;
}

type NavItem = { href: string; icon: typeof Calendar; labelKey: TranslationKey };

const navigationItems: Record<string, NavItem[]> = {
  admin: [
    { href: '/dashboard', icon: BarChart3, labelKey: 'nav_dashboard' },
    { href: '/patients', icon: Users, labelKey: 'nav_patients' },
    { href: '/appointments', icon: Calendar, labelKey: 'nav_appointments' },
    { href: '/calendar', icon: CalendarDays, labelKey: 'nav_calendar' },
    { href: '/pharmacy', icon: Pill, labelKey: 'nav_pharmacy' },
    { href: '/equipment', icon: Wrench, labelKey: 'nav_equipment' },
    { href: '/invoices', icon: Receipt, labelKey: 'nav_invoices' },
    { href: '/credits', icon: DollarSign, labelKey: 'nav_credits' },
    { href: '/statements', icon: FileText, labelKey: 'nav_statements' },
    { href: '/services', icon: Tag, labelKey: 'nav_services' },
    { href: '/cashup', icon: ClipboardList, labelKey: 'nav_cashup' },
    { href: '/reports', icon: FileText, labelKey: 'nav_reports' },
    { href: '/users', icon: Shield, labelKey: 'nav_users' },
    { href: '/doctors', icon: UserCircle, labelKey: 'nav_doctors' },
    { href: '/qr-generator', icon: QrCode, labelKey: 'nav_qr' },
    { href: '/manual', icon: BookOpen, labelKey: 'nav_manual' },
    { href: '/settings', icon: Settings, labelKey: 'nav_settings' },
  ],
  doctor: [
    { href: '/dashboard', icon: BarChart3, labelKey: 'nav_dashboard' },
    { href: '/appointments', icon: Calendar, labelKey: 'nav_my_appointments' },
    { href: '/calendar', icon: CalendarDays, labelKey: 'nav_calendar' },
    { href: '/patients', icon: Users, labelKey: 'nav_my_patients' },
    { href: '/equipment', icon: Wrench, labelKey: 'nav_equipment' },
    { href: '/services', icon: Tag, labelKey: 'nav_services' },
    { href: '/manual', icon: BookOpen, labelKey: 'nav_manual' },
  ],
  reception: [
    { href: '/patients', icon: Users, labelKey: 'nav_patients' },
    { href: '/appointments', icon: Calendar, labelKey: 'nav_appointments' },
    { href: '/calendar', icon: CalendarDays, labelKey: 'nav_calendar' },
    { href: '/invoices', icon: Receipt, labelKey: 'nav_invoices' },
    { href: '/credits', icon: DollarSign, labelKey: 'nav_credits' },
    { href: '/statements', icon: FileText, labelKey: 'nav_statements' },
    { href: '/services', icon: Tag, labelKey: 'nav_services' },
    { href: '/qr-generator', icon: QrCode, labelKey: 'nav_qr' },
    { href: '/manual', icon: BookOpen, labelKey: 'nav_manual' },
  ],
  cashier: [
    { href: '/pharmacy', icon: Pill, labelKey: 'nav_pharmacy' },
    { href: '/invoices', icon: Receipt, labelKey: 'nav_invoices' },
    { href: '/cashup', icon: ClipboardList, labelKey: 'nav_cashup' },
    { href: '/services', icon: Tag, labelKey: 'nav_services' },
    { href: '/manual', icon: BookOpen, labelKey: 'nav_manual' },
  ],
  supervisor: [
    { href: '/pharmacy', icon: Pill, labelKey: 'nav_pharmacy' },
    { href: '/credits', icon: DollarSign, labelKey: 'nav_credits' },
    { href: '/statements', icon: FileText, labelKey: 'nav_statements' },
    { href: '/services', icon: Tag, labelKey: 'nav_services' },
    { href: '/reports', icon: FileText, labelKey: 'nav_reports' },
    { href: '/manual', icon: BookOpen, labelKey: 'nav_manual' },
  ],
  patient: [
    { href: '/my-appointments', icon: Calendar, labelKey: 'nav_my_appointments' },
    { href: '/profile', icon: UserCircle, labelKey: 'nav_profile' },
    { href: '/manual', icon: BookOpen, labelKey: 'nav_manual' },
  ],
};

export function Sidebar({ currentUser }: SidebarProps) {
  const location = useLocation();
  const t = useT();
  const items = navigationItems[currentUser.role as UserRole] || [];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-sidebar-foreground">{t('app_short')}</h2>
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
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>
    </div>
  );
}