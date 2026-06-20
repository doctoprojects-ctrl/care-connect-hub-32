import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/contexts/LanguageContext';
import { BookOpen } from 'lucide-react';

export default function Manual() {
  const t = useT();

  const sections = [
    { h: t('manual_admin_h'), b: t('manual_admin_b') },
    { h: t('manual_doctor_h'), b: t('manual_doctor_b') },
    { h: t('manual_reception_h'), b: t('manual_reception_b') },
    { h: t('manual_cashier_h'), b: t('manual_cashier_b') },
    { h: t('manual_supervisor_h'), b: t('manual_supervisor_b') },
    { h: t('manual_lang_h'), b: t('manual_lang_b') },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <BookOpen className="w-7 h-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">{t('manual_title')}</h1>
      </div>
      <p className="text-muted-foreground">{t('manual_intro')}</p>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.h}>
            <CardHeader>
              <CardTitle className="text-lg">{s.h}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              {s.b}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}