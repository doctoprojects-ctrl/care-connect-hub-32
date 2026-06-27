import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Building2 } from 'lucide-react';

export const PINLogin = () => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, pin);
      
      if (success) {
        toast({
          title: t('login_success_title'),
          description: t('login_success_desc'),
        });
      } else {
        toast({
          title: t('login_failed_title'),
          description: t('login_failed_desc'),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t('login_error_title'),
        description: t('login_error_desc'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-end px-4 pt-4">
          <div className="flex items-center rounded-md border border-border overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 py-1 font-medium ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('fr')}
              className={`px-2 py-1 font-medium ${lang === 'fr' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent'}`}
            >
              FR
            </button>
          </div>
        </div>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('login_title')}</CardTitle>
          <CardDescription>{t('login_subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('username')}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('username_placeholder')}
                required
                className="text-center"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pin">{t('pin')}</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={t('pin_placeholder')}
                maxLength={15}
                required
                className="text-center text-2xl tracking-widest"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !username || !pin}
            >
              {isLoading ? t('logging_in') : t('login')}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <div className="space-y-1">
              <p><strong>{t('demo_users')}</strong></p>
              <p>Admin: Elton (PIN: 301277)</p>
              <p>Doctor: Sarah (PIN: 1234)</p>
              <p>Reception: Mary (PIN: 5678)</p>
              <p>Cashier: Cathy (PIN: 9999)</p>
              <p>Supervisor: Sam (PIN: 7777)</p>
              <p>Marketing: Mona (PIN: 4321)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
