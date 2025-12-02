import React, { useState, useCallback, memo } from 'react';

interface QRCodeModalProps {
  show: boolean;
  qrCode: string;
  driverName: string;
  driverEmail: string;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  show,
  qrCode,
  driverName,
  driverEmail,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const downloadQRCode = useCallback(async () => {
    setDownloading(true);
    try {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `QRCode_${driverName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  }, [qrCode, driverName]);

  const copyQRCodeToClipboard = useCallback(async () => {
    try {
      const response = await fetch(qrCode);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(qrCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  }, [qrCode]);

  const shareQRCode = useCallback(async () => {
    setSharing(true);
    try {
      const response = await fetch(qrCode);
      const blob = await response.blob();
      const file = new File([blob], `QRCode_${driverName.replace(/\s+/g, '_')}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `QR Code - ${driverName}`,
          text: `Driver QR Code: ${driverName}`,
          files: [file]
        });
      } else {
        downloadQRCode();
      }
    } catch {
      downloadQRCode();
    } finally {
      setSharing(false);
    }
  }, [qrCode, driverName, downloadQRCode]);

  if (!show || !qrCode) return null;

  return (
    <div className="modal-overlay qr-modal-overlay" onClick={handleOverlayClick}>
      <div className="modal qr-code-modal">
        {/* Header */}
        <div className="qr-modal-header">
          <div className="qr-modal-title">
            <span className="qr-title-icon">📱</span>
            <div>
              <h3>Driver QR Code</h3>
              <p>{driverName}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="qr-modal-body">
          {/* QR Code Display */}
          <div className="qr-display-container">
            <div className="qr-display-frame">
            <img 
              src={qrCode} 
              alt={`QR Code for ${driverName}`}
                className="qr-display-image"
              />
              <div className="qr-corner tl"></div>
              <div className="qr-corner tr"></div>
              <div className="qr-corner bl"></div>
              <div className="qr-corner br"></div>
            </div>
            <p className="qr-scan-hint">Scan to verify driver identity</p>
          </div>

          {/* Driver Info */}
          <div className="qr-driver-info">
            <div className="driver-info-item">
              <span className="info-icon">👤</span>
              <div className="info-content">
                <span className="info-label">Driver Name</span>
                <span className="info-value">{driverName}</span>
              </div>
            </div>
            <div className="driver-info-item">
              <span className="info-icon">📧</span>
              <div className="info-content">
                <span className="info-label">Email</span>
                <span className="info-value">{driverEmail}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="qr-actions-grid">
            <button 
              className={`qr-action-card download ${downloading ? 'active' : ''}`}
              onClick={downloadQRCode}
              disabled={downloading}
            >
              <span className="action-icon">{downloading ? '✓' : '⬇️'}</span>
              <span className="action-text">{downloading ? 'Saved!' : 'Download'}</span>
            </button>
            
            <button 
              className={`qr-action-card copy ${copied ? 'active' : ''}`}
              onClick={copyQRCodeToClipboard}
            >
              <span className="action-icon">{copied ? '✓' : '📋'}</span>
              <span className="action-text">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            
            <button 
              className={`qr-action-card share ${sharing ? 'active' : ''}`}
              onClick={shareQRCode}
              disabled={sharing}
            >
              <span className="action-icon">{sharing ? '...' : '🔗'}</span>
              <span className="action-text">{sharing ? 'Sharing...' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="qr-modal-footer">
          <button className="qr-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(QRCodeModal);
