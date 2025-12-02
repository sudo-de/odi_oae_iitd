import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan }) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Clean up when closed
      stopScanner();
      return;
    }

    // When opened, start scanner after a delay
    const timer = setTimeout(() => {
      const qrReaderElement = document.getElementById('qr-reader');
      if (qrReaderElement && !html5QrCodeRef.current) {
        startScanner();
      }
    }, 300);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (!isOpen) {
        stopScanner();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScanner = async () => {
    // Wait a bit for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const qrReaderElement = document.getElementById('qr-reader');
    if (!qrReaderElement) {
      console.error('QR reader element not found');
      setError('Scanner element not found. Please try again.');
      return;
    }

    // Clear any existing content
    qrReaderElement.innerHTML = '';

    try {
      // Clear any existing instance first
      if (html5QrCodeRef.current) {
        try {
          const state = html5QrCodeRef.current.getState();
          if (state === 2) { // STATE_SCANNING
            await html5QrCodeRef.current.stop();
          }
          await html5QrCodeRef.current.clear();
        } catch (e) {
          console.warn('Error cleaning up previous scanner:', e);
        }
        html5QrCodeRef.current = null;
      }

      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      setIsScanning(true);
      setError('');

      await html5QrCode.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Success callback
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Error callback - ignore scanning errors (these are normal during scanning)
          // Only log if it's not a normal scanning error
          if (!errorMessage.includes('NotFoundException') && 
              !errorMessage.includes('No MultiFormat Readers')) {
            // These are normal during scanning
          }
        }
      );
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      const errorMsg = err.message || err.toString() || 'Failed to start camera. Please check permissions.';
      setError(errorMsg);
      setIsScanning(false);
      html5QrCodeRef.current = null;
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        const isScanning = html5QrCodeRef.current.getState() === 2; // STATE_SCANNING
        if (isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      } finally {
        html5QrCodeRef.current = null;
      }
    }
    
    // Clear the qr-reader element completely
    const qrReaderElement = document.getElementById('qr-reader');
    if (qrReaderElement) {
      qrReaderElement.innerHTML = '';
    }
    
    setIsScanning(false);
    setError('');
  };

  const handleScanSuccess = (decodedText: string) => {
    stopScanner();
    onScan(decodedText);
    onClose();
  };

  const handleClose = async () => {
    await stopScanner();
    // Small delay to ensure cleanup completes
    setTimeout(() => {
      onClose();
    }, 100);
  };

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setIsScanning(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    // Ensure cleanup when not open
    if (html5QrCodeRef.current) {
      stopScanner();
    }
    return null;
  }

  return (
    <div className="qr-scanner-overlay" onClick={handleClose}>
      <div className="qr-scanner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qr-scanner-header">
          <h3>Scan QR Code</h3>
          <button 
            className="qr-scanner-close" 
            onClick={handleClose} 
            aria-label="Close scanner"
            type="button"
          >
            ✕
          </button>
        </div>
        <div className="qr-scanner-content">
          {error ? (
            <div className="qr-scanner-error">
              <p>{error}</p>
              <button onClick={startScanner} type="button">Try Again</button>
            </div>
          ) : (
            <>
              <div 
                id="qr-reader" 
                ref={scannerRef} 
                key={`qr-reader-${isOpen}`}
                style={{ width: '100%', minHeight: '300px' }}
              ></div>
              {isScanning && (
                <div className="qr-scanner-instructions">
                  <p>Point your camera at the QR code</p>
                </div>
              )}
              {!isScanning && !error && (
                <div className="qr-scanner-instructions">
                  <p>Initializing camera...</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;

