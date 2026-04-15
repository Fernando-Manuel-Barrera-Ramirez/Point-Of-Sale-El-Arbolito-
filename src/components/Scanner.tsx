import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Zap, ZapOff, Camera } from 'lucide-react';

interface ScannerProps {
  onScan: (decodedText: string) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const lastScanTime = useRef<number>(0);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        'reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          const now = Date.now();
          // 1.5s debounce
          if (now - lastScanTime.current > 1500) {
            lastScanTime.current = now;
            onScan(decodedText);
          }
        },
        (error) => {
          // Ignore errors
        }
      );

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isScanning, onScan]);

  const toggleScanner = () => {
    setIsScanning(!isScanning);
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div 
        id="reader" 
        className={`w-full max-w-md overflow-hidden rounded-xl border-2 border-primary/20 bg-muted/50 transition-all ${
          isScanning ? 'h-48' : 'h-0 opacity-0'
        }`}
      />
      
      {!isScanning && (
        <div className="w-full max-w-md h-10 flex items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-xl bg-muted/20">
          <p className="text-muted-foreground text-[10px]">Cámara pausada</p>
        </div>
      )}

      <div className="flex gap-2 w-full max-w-md">
        <Button 
          onClick={toggleScanner} 
          className="flex-1 h-9 text-xs font-medium"
          variant={isScanning ? "outline" : "default"}
        >
          {isScanning ? 'Pausar Cámara' : 'Reanudar Cámara'}
        </Button>
        
        {isScanning && (
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => setTorchOn(!torchOn)}
          >
            {torchOn ? <Zap className="text-yellow-500 w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );
};
