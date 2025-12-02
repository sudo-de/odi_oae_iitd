import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import type { CreateUserData, SelectedFiles } from '../types';

interface CreateUserModalProps {
  show: boolean;
  createUserData: CreateUserData;
  selectedFiles: SelectedFiles;
  onClose: () => void;
  onSubmit: (e: React.FormEvent, data: CreateUserData, files: SelectedFiles) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileType: 'profilePhoto' | 'disabilityDocument') => void;
  onPhoneChange: (field: 'countryCode' | 'number', value: string) => void;
  onHostelChange: (field: 'name' | 'roomNo', value: string) => void;
  onEmergencyChange: (field: 'name' | 'address' | 'phone' | 'additionalPhone', value: string) => void;
  onRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  resetFormForRole: (role: string) => void;
}

// Static data moved outside component
const ROLE_CONFIG = {
  admin: { icon: '🛡️', label: 'Admin', color: 'rgba(236, 72, 153, 0.15)', borderColor: 'rgba(236, 72, 153, 0.4)' },
  staff: { icon: '👔', label: 'Staff', color: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.4)' },
  student: { icon: '🎓', label: 'Student', color: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.4)' },
  driver: { icon: '🚗', label: 'Driver', color: 'rgba(251, 146, 60, 0.15)', borderColor: 'rgba(251, 146, 60, 0.4)' },
} as const;

const ROLE_ENTRIES = Object.entries(ROLE_CONFIG) as [keyof typeof ROLE_CONFIG, typeof ROLE_CONFIG[keyof typeof ROLE_CONFIG]][];
const PROGRAMMES = ['B.Tech', 'M.Tech', 'PhD', 'MBA', 'M.Sc', 'B.Sc'] as const;
const DEPARTMENTS = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Mathematics', 'Physics', 'Chemistry', 'Management Studies'] as const;
const HOSTELS = ['Aravali Hostel', 'Himalaya Hostel', 'Nilgiri Hostel', 'Satpura Hostel', 'Udaigiri Hostel', 'Vindhyachal Hostel', 'Zanskar Hostel', 'Karakoram Hostel', 'Shivalik Hostel', 'Girnar Hostel', 'Kumaon Hostel', 'Pir Panjal Hostel'] as const;
const DISABILITY_TYPES = [
  { value: 'visual', label: '👁️ Visual Impairment' },
  { value: 'hearing', label: '👂 Hearing Impairment' },
  { value: 'mobility', label: '🦽 Mobility Impairment' },
  { value: 'cognitive', label: '🧠 Cognitive Impairment' },
  { value: 'speech', label: '🗣️ Speech Impairment' },
  { value: 'multiple', label: '➕ Multiple Disabilities' },
  { value: 'other', label: '📋 Other' },
] as const;
const COUNTRY_CODES = [
  { value: '+91', label: '🇮🇳 +91' },
  { value: '+1', label: '🇺🇸 +1' },
  { value: '+44', label: '🇬🇧 +44' },
  { value: '+86', label: '🇨🇳 +86' },
  { value: '+971', label: '🇦🇪 +971' },
] as const;

// Memoized sub-components
const RoleSelector = memo<{ currentRole: string; onSelect: (role: string) => void }>(({ currentRole, onSelect }) => (
  <div className="role-selector">
    {ROLE_ENTRIES.map(([role, config]) => (
      <button
        key={role}
        type="button"
        className={`role-option ${currentRole === role ? 'active' : ''}`}
        onClick={() => onSelect(role)}
        style={{ '--role-color': config.color, '--role-border': config.borderColor } as React.CSSProperties}
      >
        <span className="role-icon">{config.icon}</span>
        <span className="role-label">{config.label}</span>
      </button>
    ))}
  </div>
));
RoleSelector.displayName = 'RoleSelector';

const FileUploadCard = memo<{
  id: string; accept: string; title: string; hint: string; icon: string;
  selectedFile: File | null; required: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}>(({ id, accept, title, hint, icon, selectedFile, required, onChange }) => (
  <div className="file-upload-card">
    <input type="file" id={id} accept={accept} onChange={onChange} required={required} className="file-input" />
    <label htmlFor={id} className="file-upload-label">
      <div className="upload-icon">{icon}</div>
      <div className="upload-text">
        <span className="upload-title">{title}</span>
        <span className="upload-hint">{hint}</span>
      </div>
      {selectedFile && <div className="file-selected"><span className="check-icon">✓</span>{selectedFile.name}</div>}
    </label>
  </div>
));
FileUploadCard.displayName = 'FileUploadCard';

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  show, createUserData, selectedFiles, onClose, onSubmit, onInputChange, onFileChange,
  onPhoneChange, onHostelChange, onEmergencyChange, resetFormForRole
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // Reset steps when modal opens
  useEffect(() => {
    if (show) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
      setSubmitAttempted(false);
    }
  }, [show]);
  
  const currentRole = createUserData.role as keyof typeof ROLE_CONFIG;
  const roleInfo = useMemo(() => ROLE_CONFIG[currentRole], [currentRole]);
  
  // Define sections based on role
  const sections = useMemo(() => {
    const base = [
      { key: 'role', label: 'User Type', icon: '👤' },
      { key: 'basic', label: 'Basic Info', icon: '📝' },
      { key: 'contact', label: 'Contact', icon: '📱' },
    ];
    if (currentRole === 'student') {
      return [...base,
        { key: 'academic', label: 'Academic', icon: '🎓' },
        { key: 'hostel', label: 'Hostel', icon: '🏠' },
        { key: 'emergency', label: 'Emergency', icon: '🚨' },
        { key: 'disability', label: 'Disability', icon: '♿' },
        { key: 'documents', label: 'Documents', icon: '📎' },
      ];
    }
    if (currentRole === 'driver') {
      return [...base, { key: 'documents', label: 'Documents', icon: '📎' }];
    }
    return base;
  }, [currentRole]);

  const totalSteps = sections.length;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  // Validate a single step
  const validateStep = useCallback((step: number): boolean => {
    switch (sections[step]?.key) {
      case 'role': return !!createUserData.role;
      case 'basic': return !!(createUserData.name?.trim() && createUserData.email?.trim() && createUserData.password?.trim());
      case 'contact': return !!(createUserData.phone.countryCode && createUserData.phone.number?.trim());
      case 'academic': return !!(createUserData.entryNumber?.trim() && createUserData.programme && createUserData.department && createUserData.expiryDate);
      case 'hostel': return !!(createUserData.hostel.name && createUserData.hostel.roomNo?.trim());
      case 'emergency': return !!(createUserData.emergencyDetails.name?.trim() && createUserData.emergencyDetails.phone?.trim() && createUserData.emergencyDetails.address?.trim());
      case 'disability': return !!(createUserData.disabilityType && createUserData.udidNumber?.trim());
      case 'documents': return currentRole === 'student' ? !!(selectedFiles.profilePhoto && selectedFiles.disabilityDocument) : !!selectedFiles.profilePhoto;
      default: return true;
    }
  }, [createUserData, selectedFiles, sections, currentRole]);

  // Validate all steps for final submission
  const validateAllSteps = useCallback((): boolean => {
    for (let i = 0; i < sections.length; i++) {
      if (!validateStep(i)) {
        return false;
      }
    }
    return true;
  }, [sections, validateStep]);

  const isCurrentStepValid = validateStep(currentStep);
  const areAllStepsValid = validateAllSteps();

  // Find which steps are incomplete (for submit button tooltip)
  const getIncompleteSteps = useCallback((): string[] => {
    const incomplete: string[] = [];
    for (let i = 0; i < sections.length; i++) {
      if (!validateStep(i)) {
        incomplete.push(sections[i].label);
      }
    }
    return incomplete;
  }, [sections, validateStep]);

  const incompleteSteps = isLastStep ? getIncompleteSteps() : [];

  // Callbacks
  const handleRoleSelect = useCallback((role: string) => {
    // Only reset if role actually changes
    if (role !== createUserData.role) {
      resetFormForRole(role);
      setCurrentStep(0);
      setCompletedSteps(new Set());
      setSubmitAttempted(false);
    }
  }, [resetFormForRole, createUserData.role]);

  const handleNext = useCallback(() => {
    if (isCurrentStepValid && currentStep < totalSteps - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
      setSubmitAttempted(false); // Reset for next step
    } else if (!isCurrentStepValid) {
      setSubmitAttempted(true); // Show errors on current step
    }
  }, [isCurrentStepValid, currentStep, totalSteps]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleStepClick = useCallback((index: number) => {
    // Can only go to completed steps or current step
    if (index < currentStep || completedSteps.has(index)) {
      setCurrentStep(index);
    }
  }, [currentStep, completedSteps]);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    // Double-check validation at submit time
    const allValid = sections.every((_, idx) => validateStep(idx));
    
    if (!allValid) {
      // Find first invalid step and go there
      const firstInvalidStep = sections.findIndex((_, idx) => !validateStep(idx));
      if (firstInvalidStep >= 0) {
        setCurrentStep(firstInvalidStep);
      }
      return;
    }
    
    if (isLastStep && allValid) {
      // Final check: ensure password exists for all roles
      if (!createUserData.password?.trim()) {
        console.error('Password is empty at form submit!', createUserData);
        setCurrentStep(1); // Go to basic info step where password is
        return;
      }
      // Pass current data and files directly to avoid stale closure issues
      onSubmit(e, createUserData, selectedFiles);
    }
  }, [isLastStep, sections, validateStep, createUserData, selectedFiles, onSubmit]);

  // Phone/Hostel/Emergency handlers
  const handlePhoneCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => onPhoneChange('countryCode', e.target.value), [onPhoneChange]);
  const handlePhoneNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onPhoneChange('number', e.target.value), [onPhoneChange]);
  const handleHostelNameChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => onHostelChange('name', e.target.value), [onHostelChange]);
  const handleHostelRoomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onHostelChange('roomNo', e.target.value), [onHostelChange]);
  const handleEmergencyNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onEmergencyChange('name', e.target.value), [onEmergencyChange]);
  const handleEmergencyPhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onEmergencyChange('phone', e.target.value), [onEmergencyChange]);
  const handleEmergencyAdditionalPhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onEmergencyChange('additionalPhone', e.target.value), [onEmergencyChange]);
  const handleEmergencyAddressChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => onEmergencyChange('address', e.target.value), [onEmergencyChange]);
  const handleProfilePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFileChange(e, 'profilePhoto'), [onFileChange]);
  const handleDisabilityDocChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFileChange(e, 'disabilityDocument'), [onFileChange]);

  if (!show) return null;

  const isStudent = currentRole === 'student';
  const currentSection = sections[currentStep]?.key;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal create-user-modal">
        {/* Header */}
        <div className="modal-header" style={{ background: roleInfo.color }}>
          <div className="modal-header-content">
            <span className="modal-header-icon">{roleInfo.icon}</span>
            <div className="modal-header-text">
              <h3>Create New {roleInfo.label}</h3>
              <p>Step {currentStep + 1} of {totalSteps}: {sections[currentStep]?.label}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Progress Indicator */}
        <div className="form-progress">
          {sections.map((section, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            const isClickable = index < currentStep || isCompleted;
            const isStepValid = validateStep(index);
            const showError = submitAttempted && !isStepValid;
            
            return (
              <div 
                key={section.key}
                className={`progress-step ${isCurrent ? 'active' : ''} ${isCompleted && isStepValid ? 'completed' : ''} ${isClickable ? 'clickable' : 'disabled'} ${showError ? 'error' : ''}`}
                onClick={() => isClickable && handleStepClick(index)}
                title={showError ? `${section.label}: Missing required fields` : isClickable ? `Go to ${section.label}` : 'Complete previous steps first'}
              >
                <div className="step-indicator">
                  {showError ? '!' : isCompleted && isStepValid ? '✓' : index + 1}
                </div>
                <span className="step-label">{section.label}</span>
            </div>
            );
          })}
          </div>

        <form onSubmit={handleFormSubmit} className="modal-form user-form">
          {/* Step: Role Selection */}
          {currentSection === 'role' && (
            <div className="form-section step-content">
              <h4><span className="section-icon">👤</span>Select User Type</h4>
              <p className="section-description">Choose the type of user account you want to create</p>
              <RoleSelector currentRole={currentRole} onSelect={handleRoleSelect} />
            </div>
          )}

          {/* Step: Basic Information */}
          {currentSection === 'basic' && (
            <div className="form-section step-content">
              <h4><span className="section-icon">📝</span>Basic Information</h4>
              <p className="section-description">Enter the user's personal details</p>
              <div className="form-grid">
                <div className={`form-group required ${submitAttempted && !createUserData.name?.trim() ? 'invalid' : ''}`}>
                  <label htmlFor="name"><span className="label-icon">👤</span>Full Name</label>
                  <input type="text" id="name" name="name" value={createUserData.name} onChange={onInputChange} placeholder="Enter full name" required />
                  {submitAttempted && !createUserData.name?.trim() && <span className="field-error">Name is required</span>}
                </div>
                <div className={`form-group required ${submitAttempted && !createUserData.email?.trim() ? 'invalid' : ''}`}>
                  <label htmlFor="email"><span className="label-icon">📧</span>Email Address</label>
                  <input type="email" id="email" name="email" value={createUserData.email} onChange={onInputChange} placeholder="Enter email address" required />
                  {submitAttempted && !createUserData.email?.trim() && <span className="field-error">Email is required</span>}
                </div>
                <div className={`form-group required ${submitAttempted && !createUserData.password?.trim() ? 'invalid' : ''}`}>
                  <label htmlFor="password"><span className="label-icon">🔒</span>Password</label>
                  <input type="password" id="password" name="password" value={createUserData.password} onChange={onInputChange} placeholder="Enter password (min 6 characters)" minLength={6} required />
                  {submitAttempted && !createUserData.password?.trim() && <span className="field-error">Password is required</span>}
                </div>
            </div>
            </div>
          )}

          {/* Step: Contact Information */}
          {currentSection === 'contact' && (
            <div className="form-section step-content">
              <h4><span className="section-icon">📱</span>Contact Information</h4>
              <p className="section-description">Enter phone number for communication</p>
              <div className="form-grid phone-grid">
                <div className="form-group country-code required">
                  <label htmlFor="phone-country-code">Country</label>
                  <select id="phone-country-code" value={createUserData.phone.countryCode} onChange={handlePhoneCountryChange} required>
                    {COUNTRY_CODES.map(cc => <option key={cc.value} value={cc.value}>{cc.label}</option>)}
              </select>
            </div>
                <div className={`form-group phone-number required ${submitAttempted && !createUserData.phone.number?.trim() ? 'invalid' : ''}`}>
                  <label htmlFor="phone-number">Phone Number</label>
                  <input type="tel" id="phone-number" value={createUserData.phone.number} onChange={handlePhoneNumberChange} placeholder="Enter 10-digit number" pattern="[0-9]{10}" required />
                  {submitAttempted && !createUserData.phone.number?.trim() && <span className="field-error">Phone number is required</span>}
                </div>
              </div>
            </div>
          )}

          {/* Step: Academic (Student only) */}
          {currentSection === 'academic' && isStudent && (
            <div className="form-section step-content">
              <h4><span className="section-icon">🎓</span>Academic Information</h4>
              <p className="section-description">Enter student's academic details</p>
              <div className="form-grid">
                <div className="form-group required">
                  <label htmlFor="entryNumber">Entry Number</label>
                  <input type="text" id="entryNumber" name="entryNumber" value={createUserData.entryNumber} onChange={onInputChange} placeholder="e.g., 2021CS10001" required />
                </div>
                <div className="form-group required">
                  <label htmlFor="programme">Programme</label>
                  <select id="programme" name="programme" value={createUserData.programme} onChange={onInputChange} required>
                    <option value="">Select Programme</option>
                    {PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group required">
                  <label htmlFor="department">Department</label>
                  <select id="department" name="department" value={createUserData.department} onChange={onInputChange} required>
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group required">
                  <label htmlFor="expiryDate">Valid Until</label>
                  <input type="date" id="expiryDate" name="expiryDate" value={createUserData.expiryDate} onChange={onInputChange} required />
                </div>
              </div>
            </div>
          )}

          {/* Step: Hostel (Student only) */}
          {currentSection === 'hostel' && isStudent && (
            <div className="form-section step-content">
              <h4><span className="section-icon">🏠</span>Hostel Information</h4>
              <p className="section-description">Enter student's accommodation details</p>
              <div className="form-grid">
                <div className="form-group required">
                  <label htmlFor="hostel-name">Hostel Name</label>
                  <select id="hostel-name" value={createUserData.hostel.name} onChange={handleHostelNameChange} required>
                    <option value="">Select Hostel</option>
                    {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div className="form-group required">
                  <label htmlFor="hostel-room">Room Number</label>
                  <input type="text" id="hostel-room" value={createUserData.hostel.roomNo} onChange={handleHostelRoomChange} placeholder="e.g., A-101" required />
                </div>
              </div>
            </div>
          )}

          {/* Step: Emergency (Student only) */}
          {currentSection === 'emergency' && isStudent && (
            <div className="form-section step-content">
              <h4><span className="section-icon">🚨</span>Emergency Contact</h4>
              <p className="section-description">Enter emergency contact details</p>
              <div className="form-grid">
                <div className="form-group required">
                  <label htmlFor="emergency-name">Contact Name</label>
                  <input type="text" id="emergency-name" value={createUserData.emergencyDetails.name} onChange={handleEmergencyNameChange} placeholder="Parent/Guardian name" required />
                </div>
                <div className="form-group required">
                  <label htmlFor="emergency-phone">Contact Phone</label>
                  <input type="tel" id="emergency-phone" value={createUserData.emergencyDetails.phone} onChange={handleEmergencyPhoneChange} placeholder="Emergency phone" required />
                </div>
                <div className="form-group optional">
                  <label htmlFor="emergency-additional-phone">Additional Phone</label>
                  <input type="tel" id="emergency-additional-phone" value={createUserData.emergencyDetails.additionalPhone} onChange={handleEmergencyAdditionalPhoneChange} placeholder="Optional" />
                </div>
                <div className="form-group full-width required">
                  <label htmlFor="emergency-address">Address</label>
                  <textarea id="emergency-address" value={createUserData.emergencyDetails.address} onChange={handleEmergencyAddressChange} placeholder="Full address" required rows={2} />
                </div>
              </div>
            </div>
          )}

          {/* Step: Disability (Student only) */}
          {currentSection === 'disability' && isStudent && (
            <div className="form-section step-content">
              <h4><span className="section-icon">♿</span>Disability Information</h4>
              <p className="section-description">Enter disability details for support services</p>
              <div className="form-grid">
                <div className="form-group required">
                  <label htmlFor="disabilityType">Disability Type</label>
                  <select id="disabilityType" name="disabilityType" value={createUserData.disabilityType} onChange={onInputChange} required>
                    <option value="">Select Type</option>
                    {DISABILITY_TYPES.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
                  </select>
                </div>
                <div className="form-group required">
                  <label htmlFor="udidNumber">UDID Number</label>
                  <input type="text" id="udidNumber" name="udidNumber" value={createUserData.udidNumber} onChange={onInputChange} placeholder="Unique Disability ID" required />
                </div>
                <div className="form-group required">
                  <label htmlFor="disabilityPercentage">Disability %</label>
                  <input type="number" id="disabilityPercentage" name="disabilityPercentage" value={createUserData.disabilityPercentage} onChange={onInputChange} min="0" max="100" placeholder="0-100" required />
                </div>
              </div>
            </div>
          )}

          {/* Step: Documents */}
          {currentSection === 'documents' && (
            <div className="form-section step-content">
              <h4><span className="section-icon">📎</span>Document Uploads</h4>
              <p className="section-description">Upload required documents</p>
              <div className="file-upload-grid">
                <FileUploadCard id="profilePhoto" accept=".jpg,.jpeg,.png" title="Profile Photo" hint="JPG, JPEG, PNG" icon="📷" selectedFile={selectedFiles.profilePhoto} required onChange={handleProfilePhotoChange} />
                {isStudent && (
                  <FileUploadCard id="disabilityDocument" accept=".jpg,.jpeg,.png,.pdf" title="Disability Document" hint="JPG, PNG, PDF" icon="📄" selectedFile={selectedFiles.disabilityDocument} required onChange={handleDisabilityDocChange} />
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="modal-actions step-navigation">
            <button type="button" onClick={isFirstStep ? onClose : handlePrevious} className="btn-cancel">
              {isFirstStep ? '✕ Cancel' : '← Previous'}
            </button>
            
            <div className="step-info">
              <span className="step-counter">{currentStep + 1} / {totalSteps}</span>
            </div>

            {isLastStep ? (
              <button 
                type="submit" 
                className="btn-submit" 
                disabled={!areAllStepsValid}
                title={incompleteSteps.length > 0 ? `Complete: ${incompleteSteps.join(', ')}` : `Create new ${roleInfo.label.toLowerCase()}`}
              >
                <span>{roleInfo.icon}</span>
                Create {roleInfo.label}
              </button>
            ) : (
              <button type="button" onClick={handleNext} className="btn-next" disabled={!isCurrentStepValid}>
                Next →
            </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default memo(CreateUserModal);
