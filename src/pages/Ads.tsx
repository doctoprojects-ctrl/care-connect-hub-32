import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { addAd, deleteAd, fileToDataUrl, toggleAd, useAds } from '@/lib/adsStore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Trash2, Upload, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Ads() {
  const { user } = useAuth();
  const ads = useAds();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      toast({ title: 'Missing fields', description: 'Title and media file are required.', variant: 'destructive' });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please keep ads under 20 MB.', variant: 'destructive' });
      return;
    }
    const type: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
    setBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const created = await addAd({
        title: title.trim(),
        type,
        dataUrl,
        uploadedById: user?.id ?? 'unknown',
        uploadedByName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        active: true,
      });
      if (!created) throw new Error('Upload failed');
      toast({ title: 'Ad uploaded', description: `${title} is now on the display.` });
      setTitle('');
      setFile(null);
      (document.getElementById('ad-file') as HTMLInputElement | null)?.value && ((document.getElementById('ad-file') as HTMLInputElement).value = '');
    } catch (err) {
      toast({ title: 'Upload failed', description: String(err), variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Advertisements</h1>
          <p className="text-muted-foreground">Images and videos shown on the queue display screen.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/queue/display" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" /> Open Display
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> Upload new ad</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid md:grid-cols-3 gap-3 items-end">
            <div className="space-y-1 md:col-span-1">
              <Label htmlFor="ad-title">Title</Label>
              <Input id="ad-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Health awareness week" />
            </div>
            <div className="space-y-1 md:col-span-1">
              <Label htmlFor="ad-file">Image or video</Label>
              <Input id="ad-file" type="file" accept="image/*,video/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <Button type="submit" disabled={busy}>{busy ? 'Uploading…' : 'Upload'}</Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Stored locally on this device. Max 20 MB. Uploader name is recorded for audit.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Library ({ads.length})</CardTitle></CardHeader>
        <CardContent>
          {ads.length === 0 && <p className="text-muted-foreground">No ads uploaded yet.</p>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map(ad => (
              <div key={ad.id} className="border rounded-lg overflow-hidden bg-card">
                <div className="aspect-video bg-black flex items-center justify-center">
                  {ad.type === 'image'
                    ? <img src={ad.dataUrl} alt={ad.title} className="w-full h-full object-cover" />
                    : <video src={ad.dataUrl} controls muted className="w-full h-full object-cover" />}
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium leading-tight">{ad.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ad.type.toUpperCase()} · by {ad.uploadedByName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ad.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={ad.active ? 'default' : 'secondary'}>
                      {ad.active ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => toggleAd(ad.id)}>
                      {ad.active ? <><EyeOff className="w-3 h-3 mr-1" /> Hide</> : <><Eye className="w-3 h-3 mr-1" /> Show</>}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteAd(ad.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}