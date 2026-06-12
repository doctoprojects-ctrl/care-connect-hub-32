import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export const BarcodeScanner = ({ open, onClose, onScan }: Props) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'barcode-scanner-region';

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const start = async () => {
      try {
        const el = document.getElementById(containerId);
        if (!el) return;
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decoded) => {
            if (cancelled) return;
            onScan(decoded);
            stop();
            onClose();
          },
          () => {}
        );
      } catch (e) {
        console.error('Scanner error', e);
      }
    };
    const stop = async () => {
      try {
        if (scannerRef.current) {
          await scannerRef.current.stop();
          await scannerRef.current.clear();
          scannerRef.current = null;
        }
      } catch {}
    };
    start();
    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
        </DialogHeader>
        <div id={containerId} className="w-full" />
        <p className="text-xs text-muted-foreground text-center">Allow camera access and point at a barcode/QR.</p>
      </DialogContent>
    </Dialog>
  );
};