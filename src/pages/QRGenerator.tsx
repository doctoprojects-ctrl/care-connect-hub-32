import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QrCode, Download, Copy, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function QRGenerator() {
  const [qrSize, setQrSize] = useState(300);
  const [practiceInfo, setPracticeInfo] = useState({
    name: 'Medical Practice',
    phone: '+1-555-0123',
    address: '123 Healthcare Ave, Medical City, MC 12345'
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
        <h2 className="text-2xl font-bold text-foreground">QR Code Generator</h2>
        <p className="text-muted-foreground">
          Generate QR codes for appointment booking that patients can scan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Preview
            </CardTitle>
            <CardDescription>
              Scan this QR code to access the appointment booking page
            </CardDescription>
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
                Booking URL: <span className="font-mono text-xs">{getBookingUrl()}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={downloadQRCode} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={copyBookingLink} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customization Options */}
        <Card>
          <CardHeader>
            <CardTitle>Customization</CardTitle>
            <CardDescription>
              Customize your QR code and practice information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="qrSize">QR Code Size (pixels)</Label>
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
              <Label htmlFor="practiceName">Practice Name</Label>
              <Input
                id="practiceName"
                value={practiceInfo.name}
                onChange={(e) => setPracticeInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter practice name"
              />
            </div>

            <div>
              <Label htmlFor="practicePhone">Practice Phone</Label>
              <Input
                id="practicePhone"
                value={practiceInfo.phone}
                onChange={(e) => setPracticeInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter practice phone"
              />
            </div>

            <div>
              <Label htmlFor="practiceAddress">Practice Address</Label>
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
              Regenerate QR Code
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">1</div>
              <p>Download or print the QR code and place it in your practice waiting area, reception desk, or marketing materials.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">2</div>
              <p>Patients can scan the QR code with their smartphone camera to access the appointment booking page directly.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">3</div>
              <p>The booking page allows patients to enter their information and schedule appointments without needing to call or visit in person.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">4</div>
              <p>Share the booking link directly via email, text message, or social media for easy access.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}