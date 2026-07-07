import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings as SettingsIcon, Upload, Trash2, Save } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import { useClinicConfig, saveClinicConfig, type ClinicConfig } from '@/lib/clinicConfig';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const t = useT();
  const stored = useClinicConfig();
  const [form, setForm] = useState<ClinicConfig>(stored);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, logoDataUrl: String(reader.result || '') }));
    reader.readAsDataURL(f);
  };

  const submit = () => {
    saveClinicConfig(form);
    toast({ title: t('settings_saved'), description: t('settings_saved_desc') });
  };

  const set = <K extends keyof ClinicConfig>(k: K, v: ClinicConfig[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-7 h-7" />
          {t('settings_title')}
        </h2>
        <p className="text-muted-foreground">{t('settings_desc')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('settings_clinic_details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('settings_clinic_name')}</Label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <Label>{t('settings_tagline')}</Label>
              <Input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
            </div>
            <div>
              <Label>{t('settings_address')}</Label>
              <Textarea rows={2} value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>{t('settings_phone')}</Label>
                <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </div>
              <div>
                <Label>{t('settings_email')}</Label>
                <Input value={form.email} onChange={(e) => set('email', e.target.value)} />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <Label>{t('settings_taxid')}</Label>
                <Input value={form.taxId} onChange={(e) => set('taxId', e.target.value)} />
              </div>
              <div>
                <Label>{t('settings_currency')}</Label>
                <Input value={form.currency} onChange={(e) => set('currency', e.target.value)} />
              </div>
              <div>
                <Label>{t('settings_currency_symbol')}</Label>
                <Input value={form.currencySymbol} onChange={(e) => set('currencySymbol', e.target.value)} />
              </div>
            </div>
            <Button onClick={submit}>
              <Save className="w-4 h-4 mr-2" />
              {t('settings_save')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings_logo')}</CardTitle>
            <CardDescription>PNG / JPG · appears on all printouts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border rounded-md p-4 flex items-center justify-center min-h-[140px] bg-muted/30">
              {form.logoDataUrl ? (
                <img src={form.logoDataUrl} alt="logo" className="max-h-28 object-contain" />
              ) : (
                <span className="text-sm text-muted-foreground">No logo</span>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] || null)}
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                {t('settings_upload_logo')}
              </Button>
              {form.logoDataUrl && (
                <Button variant="ghost" onClick={() => set('logoDataUrl', '')}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground mb-2">{t('settings_preview')}</div>
              <div className="border rounded-md p-3 bg-white text-black text-xs">
                <div className="flex items-center gap-2 border-b pb-2 mb-2">
                  {form.logoDataUrl && <img src={form.logoDataUrl} alt="" className="h-8" />}
                  <div>
                    <div className="font-bold text-sm">{form.name}</div>
                    <div>{form.tagline}</div>
                  </div>
                </div>
                <div>{form.address}</div>
                <div>{form.phone} · {form.email}</div>
                <div>{form.taxId}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}