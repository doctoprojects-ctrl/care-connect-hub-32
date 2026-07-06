import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QrCode, Download, Copy, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useT } from '@/contexts/LanguageContext';

export default function QRGenerator() {
  const t = useT();
  const [qrSize, setQrSize] = useState(300);
  const [practiceInfo, setPracticeInfo] = useState({
    name: 'Medical Practice',
    phone: '+27 65 913 2527',
    address: '123 Healthcare Bashewa, pretoria, 0524'
  });

  // Get the current domain for the booking URL
  const getBookingUrl = () => {
    return `${window.location.origin}/book`;
  };

  const generateQRCodeUrl = () => {
    const bookingUrl = getBookingUrl();
    // Using QR Server API for generating QR codes
    return `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(bookingUrl)}&format=png&margin=10`;
  };

  const downloadQRCode = async () => {
    try {
      const qrUrl = generateQRCodeUrl();
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `appointment-booking-qr-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "QR Code Downloaded",
        description: "The QR code has been saved to your downloads folder.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyBookingLink = () => {
    const bookingUrl = getBookingUrl();
    navigator.clipboard.writeText(bookingUrl).then(() => {
      toast({
        title: "Link Copied",
        description: "Booking link has been copied to clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t('qr_title')}</h2>
        <p className="text-muted-foreground">{t('qr_desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              {t('qr_preview')}
            </CardTitle>
            <CardDescription>{t('qr_preview_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              <img
                src={generateQRCodeUrl()}
                alt="Appointment Booking QR Code"
                className="max-w-full h-auto"
                style={{ width: qrSize, height: qrSize }}
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('booking_url')}: <span className="font-mono text-xs">{getBookingUrl()}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={downloadQRCode} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                {t('download')}
              </Button>
              <Button onClick={copyBookingLink} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                {t('copy_link')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customization Options */}
        <Card>
          <CardHeader>
            <CardTitle>{t('customization')}</CardTitle>
            <CardDescription>{t('customization_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="qrSize">{t('qr_size')}</Label>
              <Input
                id="qrSize"
                type="number"
                min="100"
                max="800"
                step="50"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="practiceName">{t('practice_name')}</Label>
              <Input
                id="practiceName"
                value={practiceInfo.name}
                onChange={(e) => setPracticeInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter practice name"
              />
            </div>

            <div>
              <Label htmlFor="practicePhone">{t('practice_phone')}</Label>
              <Input
                id="practicePhone"
                value={practiceInfo.phone}
                onChange={(e) => setPracticeInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter practice phone"
              />
            </div>

            <div>
              <Label htmlFor="practiceAddress">{t('practice_address')}</Label>
              <Textarea
                id="practiceAddress"
                value={practiceInfo.address}
                onChange={(e) => setPracticeInfo(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter practice address"
                rows={3}
              />
            </div>

            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('regenerate_qr')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('how_to_use')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">1</div>
              <p>{t('qr_step_1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">2</div>
              <p>{t('qr_step_2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">3</div>
              <p>{t('qr_step_3')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">4</div>
              <p>{t('qr_step_4')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
