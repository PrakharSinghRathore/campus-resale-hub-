import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
}

export function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let detector: any = null;
    let frameId: number | undefined;

    const start = async () => {
      if (!open) return;
      try {
        // Prefer environment camera
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Try native BarcodeDetector
        // @ts-ignore
        const Supported = (window as any).BarcodeDetector;
        if (Supported) {
          // @ts-ignore
          detector = new (window as any).BarcodeDetector({ formats: ['ean_13','ean_8','upc_a','upc_e','code_128','code_39','qr_code'] });

          const detectLoop = async () => {
            try {
              if (videoRef.current && detector) {
                const track = (videoRef.current.srcObject as MediaStream).getVideoTracks()[0];
                const ImageCaptureCtor = (window as any).ImageCapture;
                let imageCapture: any = null;
                if (ImageCaptureCtor) {
                  try {
                    imageCapture = new ImageCaptureCtor(track);
                  } catch {}
                }
                let bitmap: ImageBitmap | HTMLVideoElement = videoRef.current;
                if (imageCapture && imageCapture.grabFrame) {
                  try {
                    bitmap = await imageCapture.grabFrame();
                  } catch {}
                }
                const barcodes = await detector.detect(bitmap as any);
                if (barcodes && barcodes.length > 0) {
                  onDetected(barcodes[0].rawValue || barcodes[0].rawValue || '');
                  return;
                }
              }
            } catch {}
            frameId = requestAnimationFrame(detectLoop);
          };
          frameId = requestAnimationFrame(detectLoop);
        } else {
          setError('BarcodeDetector not supported. Use manual entry below.');
        }
      } catch (e: any) {
        setError('Camera access denied or unavailable. Use manual entry below.');
      }
    };

    start();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [open, onDetected]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Scan Barcode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!error && (
              <div className="rounded overflow-hidden bg-black">
                <video ref={videoRef} className="w-full h-64 object-cover" muted playsInline />
              </div>
            )}
            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex items-center gap-2">
              <input
                className="flex-1 border rounded px-3 py-2 text-sm"
                placeholder="Enter code manually"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
              />
              <Button onClick={() => manual.trim() && onDetected(manual.trim())} disabled={!manual.trim()}>Verify</Button>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
