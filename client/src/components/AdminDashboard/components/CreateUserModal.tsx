import React from 'react';
import type { CreateUserData, SelectedFiles } from '../types';

interface CreateUserModalProps {
  show: boolean;
  createUserData: CreateUserData;
  selectedFiles: SelectedFiles;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileType: 'profilePhoto' | 'disabilityDocument') => void;
  onPhoneChange: (field: 'countryCode' | 'number', value: string) => void;
  onHostelChange: (field: 'name' | 'roomNo', value: string) => void;
  onEmergencyChange: (field: 'name' | 'address' | 'phone' | 'additionalPhone', value: string) => void;
  onRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  resetFormForRole: (role: string) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  show,
  createUserData,
  selectedFiles,
  onClose,
  onSubmit,
  onInputChange,
  onFileChange,
  onPhoneChange,
  onHostelChange,
  onEmergencyChange,
  onRoleChange,
  resetFormForRole
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create New {createUserData.role === 'admin' ? 'Admin' : createUserData.role === 'staff' ? 'Staff' : createUserData.role === 'student' ? 'Student' : 'Driver'}</h3>
          <button 
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className="modal-form user-form">
          {/* Role Selection */}
          <div className="form-section">
            <h4>User Type</h4>
            <div className="form-group">
              <label htmlFor="role">Role:</label>
              <select
                id="role"
                name="role"
                value={createUserData.role}
                onChange={(e) => {
                  onRoleChange(e);
                  resetFormForRole(e.target.value);
                }}
                required
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="student">Student</option>
                <option value="driver">Driver</option>
              </select>
            </div>
          </div>

          {/* Basic Information - Common for all */}
          <div className="form-section">
            <h4>Basic Information</h4>
            <div className="form-group">
              <label htmlFor="name">Full Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={createUserData.name}
                onChange={onInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={createUserData.email}
                onChange={onInputChange}
                required
              />
            </div>
            {(createUserData.role === 'admin' || createUserData.role === 'staff') && (
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={createUserData.password}
                  onChange={onInputChange}
                  required
                />
              </div>
            )}
          </div>

          {/* Contact Information - Common for all */}
          <div className="form-section">
            <h4>Contact Information</h4>
            <div className="form-group">
              <label htmlFor="phone-country-code">Country Code:</label>
              <select
                id="phone-country-code"
                value={createUserData.phone.countryCode}
                onChange={(e) => onPhoneChange('countryCode', e.target.value)}
                required
              >
                <option value="+91">+91 (India)</option>
                <option value="+1">+1 (USA)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+86">+86 (China)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="phone-number">Phone Number:</label>
              <input
                type="tel"
                id="phone-number"
                value={createUserData.phone.number}
                onChange={(e) => onPhoneChange('number', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Student-specific fields */}
          {createUserData.role === 'student' && (
            <>
              <div className="form-section">
                <h4>Student Information</h4>
                <div className="form-group">
                  <label htmlFor="entryNumber">Entry Number:</label>
                  <input
                    type="text"
                    id="entryNumber"
                    name="entryNumber"
                    value={createUserData.entryNumber}
                    onChange={onInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="programme">Programme:</label>
                  <select
                    id="programme"
                    name="programme"
                    value={createUserData.programme}
                    onChange={onInputChange}
                    required
                  >
                    <option value="">Select Programme</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="PhD">PhD</option>
                    <option value="MBA">MBA</option>
                    <option value="M.Sc">M.Sc</option>
                    <option value="B.Sc">B.Sc</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department:</label>
                  <select
                    id="department"
                    name="department"
                    value={createUserData.department}
                    onChange={onInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Chemical Engineering">Chemical Engineering</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Management Studies">Management Studies</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date:</label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={createUserData.expiryDate}
                    onChange={onInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Hostel Information</h4>
                <div className="form-group">
                  <label htmlFor="hostel-name">Select Hostel:</label>
                  <select
                    id="hostel-name"
                    value={createUserData.hostel.name}
                    onChange={(e) => onHostelChange('name', e.target.value)}
                    required
                  >
                    <option value="">Select Hostel</option>
                    <option value="Aravali Hostel">Aravali Hostel</option>
                    <option value="Himalaya Hostel">Himalaya Hostel</option>
                    <option value="Nilgiri Hostel">Nilgiri Hostel</option>
                    <option value="Satpura Hostel">Satpura Hostel</option>
                    <option value="Udaigiri Hostel">Udaigiri Hostel</option>
                    <option value="Vindhyachal Hostel">Vindhyachal Hostel</option>
                    <option value="Zanskar Hostel">Zanskar Hostel</option>
                    <option value="Karakoram Hostel">Karakoram Hostel</option>
                    <option value="Shivalik Hostel">Shivalik Hostel</option>
                    <option value="Girnar Hostel">Girnar Hostel</option>
                    <option value="Kumaon Hostel">Kumaon Hostel</option>
                    <option value="Pir Panjal Hostel">Pir Panjal Hostel</option>
                    <option value="Siwalik Hostel">Siwalik Hostel</option>
                    <option value="Garhwal Hostel">Garhwal Hostel</option>
                    <option value="Ladakh Hostel">Ladakh Hostel</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="hostel-room">Room Number:</label>
                  <input
                    type="text"
                    id="hostel-room"
                    value={createUserData.hostel.roomNo}
                    onChange={(e) => onHostelChange('roomNo', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Emergency Contact Details</h4>
                <div className="form-group">
                  <label htmlFor="emergency-name">Emergency Contact Name:</label>
                  <input
                    type="text"
                    id="emergency-name"
                    value={createUserData.emergencyDetails.name}
                    onChange={(e) => onEmergencyChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emergency-address">Emergency Contact Address:</label>
                  <textarea
                    id="emergency-address"
                    value={createUserData.emergencyDetails.address}
                    onChange={(e) => onEmergencyChange('address', e.target.value)}
                    required
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emergency-phone">Emergency Contact Phone:</label>
                  <input
                    type="tel"
                    id="emergency-phone"
                    value={createUserData.emergencyDetails.phone}
                    onChange={(e) => onEmergencyChange('phone', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emergency-additional-phone">Additional Phone (Optional):</label>
                  <input
                    type="tel"
                    id="emergency-additional-phone"
                    value={createUserData.emergencyDetails.additionalPhone}
                    onChange={(e) => onEmergencyChange('additionalPhone', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Disability Information</h4>
                <div className="form-group">
                  <label htmlFor="disabilityType">Disability Type:</label>
                  <select
                    id="disabilityType"
                    name="disabilityType"
                    value={createUserData.disabilityType}
                    onChange={onInputChange}
                    required
                  >
                    <option value="">Select Disability Type</option>
                    <option value="visual">Visual Impairment</option>
                    <option value="hearing">Hearing Impairment</option>
                    <option value="mobility">Mobility Impairment</option>
                    <option value="cognitive">Cognitive Impairment</option>
                    <option value="speech">Speech Impairment</option>
                    <option value="multiple">Multiple Disabilities</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="udidNumber">UDID Number:</label>
                  <input
                    type="text"
                    id="udidNumber"
                    name="udidNumber"
                    value={createUserData.udidNumber}
                    onChange={onInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="disabilityPercentage">Disability Percentage:</label>
                  <input
                    type="number"
                    id="disabilityPercentage"
                    name="disabilityPercentage"
                    value={createUserData.disabilityPercentage}
                    onChange={onInputChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Driver-specific fields */}
          {createUserData.role === 'driver' && (
            <div className="form-section">
              <h4>Driver Information</h4>
              <div className="form-group">
                <label htmlFor="qrCode">QR Code:</label>
                <input
                  type="text"
                  id="qrCode"
                  name="qrCode"
                  value={createUserData.qrCode}
                  onChange={onInputChange}
                  placeholder="QR Code will be generated automatically"
                  disabled
                />
                <small className="form-help">QR code will be generated after user creation</small>
              </div>
            </div>
          )}

          {/* File Uploads - For Student and Driver */}
          {(createUserData.role === 'student' || createUserData.role === 'driver') && (
            <div className="form-section">
              <h4>Document Uploads</h4>
              <div className="form-group">
                <label htmlFor="profilePhoto">Profile Photo:</label>
                <input
                  type="file"
                  id="profilePhoto"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => onFileChange(e, 'profilePhoto')}
                  required
                />
                {selectedFiles.profilePhoto && (
                  <div className="file-info">
                    Selected: {selectedFiles.profilePhoto.name}
                  </div>
                )}
              </div>
              {createUserData.role === 'student' && (
                <div className="form-group">
                  <label htmlFor="disabilityDocument">Disability Document:</label>
                  <input
                    type="file"
                    id="disabilityDocument"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => onFileChange(e, 'disabilityDocument')}
                    required
                  />
                  {selectedFiles.disabilityDocument && (
                    <div className="file-info">
                      Selected: {selectedFiles.disabilityDocument.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">
              Create {createUserData.role === 'admin' ? 'Admin' : createUserData.role === 'staff' ? 'Staff' : createUserData.role === 'student' ? 'Student' : 'Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
