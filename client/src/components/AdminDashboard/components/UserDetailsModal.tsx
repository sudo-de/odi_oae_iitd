import React from 'react';
import type { User } from '../types';
import { formatDate } from '../utils';

interface UserDetailsModalProps {
  show: boolean;
  viewingUser: User | null;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  show,
  viewingUser,
  onClose
}) => {
  if (!show || !viewingUser) return null;

  return (
    <div className="modal-overlay">
      <div className="modal user-details-modal">
        <div className="modal-header">
          <h3>User Details: {viewingUser.name}</h3>
          <button 
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="user-details-content">
          {/* Basic Information */}
          <div className="details-section">
            <h4>Basic Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Name:</label>
                <span>{viewingUser.name}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{viewingUser.email}</span>
              </div>
              <div className="detail-item">
                <label>Created:</label>
                <span>{formatDate(viewingUser.createdAt)}</span>
              </div>
              <div className="detail-item">
                <label>Last Updated:</label>
                <span>{formatDate(viewingUser.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {viewingUser.phone && (
            <div className="details-section">
              <h4>Contact Information</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{viewingUser.phone.countryCode} {viewingUser.phone.number}</span>
                </div>
              </div>
            </div>
          )}

          {/* Student-specific Information */}
          {viewingUser.role === 'student' && (
            <>
              <div className="details-section">
                <h4>Academic Information</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Entry Number:</label>
                    <span>{viewingUser.entryNumber || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Programme:</label>
                    <span>{viewingUser.programme || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Department:</label>
                    <span>{viewingUser.department || 'Not provided'}</span>
                  </div>
                  {viewingUser.expiryDate && (
                    <div className="detail-item">
                      <label>Expiry Date:</label>
                      <div className="expiry-container">
                        <span>{new Date(viewingUser.expiryDate).toLocaleDateString()}</span>
                        {viewingUser.isExpired ? (
                          <span className="status-badge expired">(Auto-expired)</span>
                        ) : (
                          <span className="status-badge active">(Valid)</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {viewingUser.hostel && (
                <div className="details-section">
                  <h4>Hostel Information</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <label>Hostel Name:</label>
                      <span>{viewingUser.hostel.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Room Number:</label>
                      <span>{viewingUser.hostel.roomNo}</span>
                    </div>
                  </div>
                </div>
              )}

              {viewingUser.emergencyDetails && (
                <div className="details-section">
                  <h4>Emergency Contact Details</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <label>Emergency Contact Name:</label>
                      <span>{viewingUser.emergencyDetails.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Emergency Contact Address:</label>
                      <span>{viewingUser.emergencyDetails.address}</span>
                    </div>
                    <div className="detail-item">
                      <label>Emergency Contact Phone:</label>
                      <span>{viewingUser.emergencyDetails.phone}</span>
                    </div>
                    {viewingUser.emergencyDetails.additionalPhone && (
                      <div className="detail-item">
                        <label>Additional Phone:</label>
                        <span>{viewingUser.emergencyDetails.additionalPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(viewingUser.disabilityType || viewingUser.udidNumber || viewingUser.disabilityPercentage) && (
                <div className="details-section">
                  <h4>Disability Information</h4>
                  <div className="details-grid">
                    {viewingUser.disabilityType && (
                      <div className="detail-item">
                        <label>Disability Type:</label>
                        <span>{viewingUser.disabilityType}</span>
                      </div>
                    )}
                    {viewingUser.udidNumber && (
                      <div className="detail-item">
                        <label>UDID Number:</label>
                        <span>{viewingUser.udidNumber}</span>
                      </div>
                    )}
                    {viewingUser.disabilityPercentage && (
                      <div className="detail-item">
                        <label>Disability Percentage:</label>
                        <span>{viewingUser.disabilityPercentage}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* File Information */}
              {(viewingUser.profilePhoto || viewingUser.disabilityDocument) && (
                <div className="details-section">
                  <h4>Files</h4>
                  <div className="file-info-grid">
                    {viewingUser.profilePhoto && (
                      <div className="file-info-item">
                        <div className="file-icon">📷</div>
                        <div className="file-details">
                          <div className="file-name">{viewingUser.profilePhoto.filename}</div>
                          <div className="file-meta">
                            {viewingUser.profilePhoto.mimetype} • {(viewingUser.profilePhoto.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                    )}
                    {viewingUser.disabilityDocument && (
                      <div className="file-info-item">
                        <div className="file-icon">📄</div>
                        <div className="file-details">
                          <div className="file-name">{viewingUser.disabilityDocument.filename}</div>
                          <div className="file-meta">
                            {viewingUser.disabilityDocument.mimetype} • {(viewingUser.disabilityDocument.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Driver-specific Information */}
          {viewingUser.role === 'driver' && viewingUser.qrCode && (
            <div className="details-section">
              <h4>Driver Information</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <label>QR Code:</label>
                  <span>{viewingUser.qrCode}</span>
                </div>
              </div>
            </div>
          )}
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

export default UserDetailsModal;
