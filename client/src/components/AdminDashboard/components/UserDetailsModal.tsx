import React, { useState, useCallback, useMemo, memo } from 'react';
import type { User } from '../types';
import { formatDate } from '../utils';
import QRCodeModal from './QRCodeModal';

interface UserDetailsModalProps {
  show: boolean;
  viewingUser: User | null;
  onClose: () => void;
}

// Role configuration
const ROLE_CONFIG: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
  student: { icon: '🎓', label: 'Student', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  driver: { icon: '🚗', label: 'Driver', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.15)' },
  staff: { icon: '👔', label: 'Staff', color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.15)' },
  admin: { icon: '👑', label: 'Admin', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
};

// Detail Item Component
const DetailItem = memo(({ icon, label, value, fullWidth = false }: { 
  icon?: string; 
  label: string; 
  value: React.ReactNode; 
  fullWidth?: boolean 
}) => (
  <div className={`detail-card ${fullWidth ? 'full-width' : ''}`}>
    {icon && <span className="detail-icon">{icon}</span>}
    <div className="detail-content">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || 'Not provided'}</span>
    </div>
  </div>
));

// Section Component
const Section = memo(({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
  <div className="details-section">
    <div className="section-header">
      <span className="section-icon">{icon}</span>
      <h4>{title}</h4>
    </div>
    <div className="section-content">
      {children}
    </div>
  </div>
));

// File Preview Component
const FilePreview = memo(({ file, title, icon }: { 
  file: { data: string; mimetype: string; filename: string; size: number }; 
  title: string; 
  icon: string 
}) => {
  const dataUrl = useMemo(() => {
    if (!file.data) return '';
    if (file.data.startsWith('data:')) return file.data;
    return `data:${file.mimetype};base64,${file.data}`;
  }, [file.data, file.mimetype]);

  if (!file.data) return null;

  return (
    <div className="file-card">
      <div className="file-card-header">
        <span className="file-icon">{icon}</span>
        <div className="file-info">
          <span className="file-name">{file.filename}</span>
          <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
        </div>
      </div>
      <div className="file-card-preview">
        {file.mimetype === 'application/pdf' ? (
          <iframe src={dataUrl} className="pdf-preview" title={title} />
        ) : (
          <img src={dataUrl} alt={title} className="image-preview" />
        )}
      </div>
    </div>
  );
});

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  show,
  viewingUser,
  onClose
}) => {
  const [showQRModal, setShowQRModal] = useState(false);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const handleOpenQR = useCallback(() => setShowQRModal(true), []);
  const handleCloseQR = useCallback(() => setShowQRModal(false), []);

  const roleConfig = useMemo(() => 
    viewingUser ? ROLE_CONFIG[viewingUser.role] || ROLE_CONFIG.student : ROLE_CONFIG.student
  , [viewingUser]);

  if (!show || !viewingUser) return null;

  return (
    <div className="modal-overlay user-details-overlay" onClick={handleOverlayClick}>
      <div className="modal user-details-modal">
        {/* Header */}
        <div className="user-modal-header" style={{ '--accent-color': roleConfig.color } as React.CSSProperties}>
          <div className="header-content">
            <div className="user-avatar-large" style={{ background: roleConfig.bgColor, borderColor: roleConfig.color }}>
              <span>{viewingUser.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="user-header-info">
              <h2>{viewingUser.name}</h2>
              <div className="user-header-meta">
                <span className="role-badge" style={{ background: roleConfig.bgColor, color: roleConfig.color }}>
                  {roleConfig.icon} {roleConfig.label}
                </span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Body */}
        <div className="user-modal-body">
          {/* Basic Information */}
          <Section icon="📋" title="Basic Information">
            <div className="details-grid">
              <DetailItem icon="👤" label="Full Name" value={viewingUser.name} />
              <DetailItem icon="📧" label="Email Address" value={viewingUser.email} />
              <DetailItem icon="📅" label="Created" value={formatDate(viewingUser.createdAt)} />
              <DetailItem icon="🔄" label="Last Updated" value={formatDate(viewingUser.updatedAt)} />
            </div>
          </Section>

          {/* Contact Information */}
          {viewingUser.phone && (
            <Section icon="📞" title="Contact Information">
              <div className="details-grid">
                <DetailItem 
                  icon="📱" 
                  label="Phone Number" 
                  value={`${viewingUser.phone.countryCode} ${viewingUser.phone.number}`} 
                />
              </div>
            </Section>
          )}

          {/* Student-specific Information */}
          {viewingUser.role === 'student' && (
            <>
              <Section icon="🎓" title="Academic Information">
                <div className="details-grid">
                  <DetailItem icon="🆔" label="Entry Number" value={viewingUser.entryNumber} />
                  <DetailItem icon="📚" label="Programme" value={viewingUser.programme} />
                  <DetailItem icon="🏛️" label="Department" value={viewingUser.department} />
                  {viewingUser.expiryDate && (
                    <DetailItem 
                      icon="⏳" 
                      label="Expiry Date" 
                      value={
                        <div className="expiry-info">
                        <span>{new Date(viewingUser.expiryDate).toLocaleDateString()}</span>
                          <span className={`expiry-badge ${viewingUser.isExpired ? 'expired' : 'valid'}`}>
                            {viewingUser.isExpired ? '⚠️ Expired' : '✅ Valid'}
                          </span>
                      </div>
                      } 
                    />
                  )}
                </div>
              </Section>

              {viewingUser.hostel && (
                <Section icon="🏠" title="Hostel Information">
                  <div className="details-grid">
                    <DetailItem icon="🏨" label="Hostel Name" value={viewingUser.hostel.name} />
                    <DetailItem icon="🚪" label="Room Number" value={viewingUser.hostel.roomNo} />
                  </div>
                </Section>
              )}

              {viewingUser.emergencyDetails && (
                <Section icon="🚨" title="Emergency Contact">
                  <div className="details-grid">
                    <DetailItem icon="👤" label="Contact Name" value={viewingUser.emergencyDetails.name} />
                    <DetailItem icon="📍" label="Address" value={viewingUser.emergencyDetails.address} fullWidth />
                    <DetailItem icon="📞" label="Phone" value={viewingUser.emergencyDetails.phone} />
                    {viewingUser.emergencyDetails.additionalPhone && (
                      <DetailItem icon="📱" label="Additional Phone" value={viewingUser.emergencyDetails.additionalPhone} />
                    )}
                  </div>
                </Section>
              )}

              {(viewingUser.disabilityType || viewingUser.udidNumber || viewingUser.disabilityPercentage) && (
                <Section icon="♿" title="Disability Information">
                  <div className="details-grid">
                    {viewingUser.disabilityType && (
                      <DetailItem icon="📋" label="Disability Type" value={viewingUser.disabilityType} />
                    )}
                    {viewingUser.udidNumber && (
                      <DetailItem icon="🆔" label="UDID Number" value={viewingUser.udidNumber} />
                    )}
                    {viewingUser.disabilityPercentage && (
                      <DetailItem icon="📊" label="Percentage" value={`${viewingUser.disabilityPercentage}%`} />
                    )}
                  </div>
                </Section>
              )}

              {/* Files */}
              {(viewingUser.profilePhoto?.data || viewingUser.disabilityDocument?.data) && (
                <Section icon="📁" title="Documents">
                  <div className="files-grid">
                    {viewingUser.profilePhoto?.data && (
                      <FilePreview file={viewingUser.profilePhoto} title="Profile Photo" icon="📷" />
                    )}
                    {viewingUser.disabilityDocument?.data && (
                      <FilePreview file={viewingUser.disabilityDocument} title="Disability Document" icon="📄" />
                    )}
                  </div>
                </Section>
              )}
            </>
          )}

          {/* Driver-specific Information */}
          {viewingUser.role === 'driver' && (
            <>



              {/* Documents */}
              <Section icon="📁" title="Documents">
                <div className="files-grid">
                  {/* Profile Photo */}
                  {viewingUser.profilePhoto?.data && (
                    <FilePreview file={viewingUser.profilePhoto} title="Profile Photo" icon="📷" />
                  )}

                </div>
              </Section>

              {/* QR Code Section */}
              <Section icon="📱" title="Digital Verification">
                {viewingUser.qrCode ? (
                  <div className="qr-section">
                    <div className="qr-preview-card" onClick={handleOpenQR}>
                      <img src={viewingUser.qrCode} alt="Driver QR Code" className="qr-preview-image" />
                      <div className="qr-preview-overlay">
                        <span className="view-text">Click to View</span>
                      </div>
                    </div>
                    <div className="qr-info">
                      <div className="qr-details">
                        <span className="qr-label">Driver ID:</span>
                        <span className="qr-value">{viewingUser._id || 'DRV-001'}</span>
                      </div>
                      <div className="qr-details">
                        <span className="qr-label">Verification:</span>
                        <span className="qr-value">✅ Active</span>
                      </div>
                    </div>
                    <button className="qr-action-btn-large" onClick={handleOpenQR}>
                      <span>📱</span> View QR Code
                    </button>
                  </div>
                ) : (
                  <div className="no-qr-message">
                    <span className="no-qr-icon">📵</span>
                    <p>No QR code generated yet</p>
                    <p className="qr-hint">QR code will be auto-generated when driver becomes active</p>
                  </div>
                )}
              </Section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="user-modal-footer">
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>

      {/* QR Code Modal */}
      {viewingUser.qrCode && (
        <QRCodeModal
          show={showQRModal}
          qrCode={viewingUser.qrCode}
          driverName={viewingUser.name}
          driverEmail={viewingUser.email}
          onClose={handleCloseQR}
        />
      )}
    </div>
  );
};

export default memo(UserDetailsModal);
