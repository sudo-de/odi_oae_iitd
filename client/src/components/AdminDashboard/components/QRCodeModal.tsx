import React, { useState } from 'react';

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

  if (!show || !qrCode) return null;

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `QRCode_${driverName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyQRCodeToClipboard = async () => {
    try {
      // Convert data URL to blob
      const response = await fetch(qrCode);
      const blob = await response.blob();
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy QR code:', err);
      // Fallback: try to copy the data URL as text
      try {
        await navigator.clipboard.writeText(qrCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err2) {
        console.error('Failed to copy QR code URL:', err2);
      }
    }
  };

  const shareQRCode = async () => {
    try {
      // Convert data URL to blob
      const response = await fetch(qrCode);
      const blob = await response.blob();
      const file = new File([blob], `QRCode_${driverName.replace(/\s+/g, '_')}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `QR Code for ${driverName}`,
          text: `QR Code for driver: ${driverName} (${driverEmail})`,
          files: [file]
        });
      } else {
        // Fallback: download
        downloadQRCode();
      }
    } catch (err) {
      console.error('Failed to share QR code:', err);
      // Fallback: download
      downloadQRCode();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal qr-code-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>QR Code: {driverName}</h3>
          <button 
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="qr-code-modal-content">
          <div className="qr-code-display-large">
            <img 
              src={qrCode} 
              alt={`QR Code for ${driverName}`}
              className="qr-code-image-modal"
            />
          </div>
          <div className="qr-code-info">
            <p><strong>Driver:</strong> {driverName}</p>
            <p><strong>Email:</strong> {driverEmail}</p>
          </div>
          <div className="qr-code-actions">
            <button 
              className="qr-action-btn view"
              onClick={() => window.open(qrCode, '_blank')}
              title="View full size"
            >
              <span className="btn-icon">👁️</span>
              <span className="btn-text">View</span>
            </button>
            <button 
              className="qr-action-btn download"
              onClick={downloadQRCode}
              title="Download QR code"
            >
              <span className="btn-icon">⬇️</span>
              <span className="btn-text">Download</span>
            </button>
            <button 
              className="qr-action-btn copy"
              onClick={copyQRCodeToClipboard}
              title="Copy to clipboard"
            >
              <span className="btn-icon">{copied ? '✓' : '📋'}</span>
              <span className="btn-text">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button 
              className="qr-action-btn share"
              onClick={shareQRCode}
              title="Share QR code"
            >
              <span className="btn-icon">🔗</span>
              <span className="btn-text">Share</span>
            </button>
          </div>
        </div>
        <div className="modal-actions">
          <button 
            className="btn-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;

