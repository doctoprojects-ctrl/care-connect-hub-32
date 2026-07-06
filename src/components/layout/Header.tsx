import { Button } from '@/components/ui/button';
import { Bell, LogOut } from 'lucide-react';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  currentUser: User;
}

export function Header({ currentUser }: HeaderProps) {
  const { logout } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">
            {t('app_title')}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-md border border-border overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setLang('en')}
              aria-label="English"
              className={`px-2 py-1 font-medium transition-colors ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('fr')}
              aria-label="Français"
              className={`px-2 py-1 font-medium transition-colors ${lang === 'fr' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent'}`}
            >
              FR
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t('welcome')}</span>
            <span className="font-medium text-foreground">
              {currentUser.firstName} {currentUser.lastName}
            </span>
            <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
              {t(`role_${currentUser.role}` as any)}
            </span>
          </div>
          
          <Button variant="ghost" size="icon" aria-label={t('notifications')}>
            <Bell className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t('logout')}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}