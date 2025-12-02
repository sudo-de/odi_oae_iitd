import { useState, type FormEvent } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

interface ForgotPasswordProps {
  onBack: () => void;
}

type Step = 'email' | 'otp' | 'reset' | 'success';

const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string>('');

  const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const API_BASE_URL = envApiBaseUrl ? envApiBaseUrl.replace(/\/$/, '') : 'http://localhost:3000';
  const buildApiUrl = (path: string) => `${API_BASE_URL}${path}`;

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post(buildApiUrl('/auth/forgot-password'), {
        email: email.trim(),
      });
      // Store the reset token (in production, this would be sent via email)
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
      setStep('otp');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      const errorData = err.response?.data;
      let errorMessage = errorData?.message;
      
      // Handle array of messages
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage[0];
      }
      
      if (errorMessage === 'Email not found' || errorMessage?.includes('Email not found')) {
        setError('No account found with this email address. Please check and try again.');
      } else if (errorMessage) {
        setError(typeof errorMessage === 'string' ? errorMessage : 'An error occurred. Please try again.');
      } else if (err.message === 'Network Error') {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
  };

  const handleOtpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(buildApiUrl('/auth/verify-otp'), {
        email: email.trim(),
        otp: otpCode,
      });
      
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
      setStep('reset');
    } catch (err: any) {
      console.error('OTP verification error:', err);
      const errorData = err.response?.data;
      let errorMessage = errorData?.message;
      
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage[0];
      }
      
      if (errorMessage === 'Invalid or expired OTP') {
        setError('Invalid or expired code. Please try again or request a new code.');
      } else if (errorMessage) {
        setError(typeof errorMessage === 'string' ? errorMessage : 'Verification failed. Please try again.');
      } else if (err.message === 'Network Error') {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(buildApiUrl('/auth/reset-password'), {
        token: resetToken,
        newPassword: newPassword,
      });
      setStep('success');
    } catch (err: any) {
      console.error('Reset password error:', err);
      const errorData = err.response?.data;
      let errorMessage = errorData?.message;
      
      // Handle array of messages
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage[0];
      }
      
      if (errorMessage === 'Invalid or expired reset token') {
        setError('Your reset link has expired. Please request a new one.');
      } else if (errorMessage) {
        setError(typeof errorMessage === 'string' ? errorMessage : 'An error occurred. Please try again.');
      } else if (err.message === 'Network Error') {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post(buildApiUrl('/auth/forgot-password'), {
        email: email.trim(),
      });
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success Step
  if (step === 'success') {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <div className="success-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1>Password reset successful</h1>
            <p>Your password has been changed. You can now log in with your new password.</p>
          </div>
          <div className="forgot-password-form">
            <button
              type="button"
              className="forgot-password-button primary-button"
              onClick={onBack}
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reset Password Step
  if (step === 'reset') {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <h1>Create new password</h1>
            <p>Your new password must be at least 6 characters</p>
          </div>

          <form onSubmit={handleResetSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="input-wrapper">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="error-message" role="alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="button-group">
              <button
                type="submit"
                className="forgot-password-button primary-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Reset password</span>
                )}
              </button>
              <button
                type="button"
                className="forgot-password-button secondary-button"
                onClick={() => setStep('otp')}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // OTP Step
  if (step === 'otp') {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <h1>Enter verification code</h1>
            <p>We've sent a 6-digit code to <strong>{email}</strong></p>
          </div>

          <form onSubmit={handleOtpSubmit} className="forgot-password-form">
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className="otp-input"
                  disabled={isLoading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="resend-code">
              Didn't receive the code?{' '}
              <button
                type="button"
                className="resend-button"
                onClick={handleResendOtp}
                disabled={isLoading}
              >
                Resend
              </button>
            </div>

            {error && (
              <div className="error-message" role="alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="button-group">
              <button
                type="submit"
                className="forgot-password-button primary-button"
                disabled={isLoading || otp.join('').length !== 6}
              >
                {isLoading ? (
                  <>
                    <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify</span>
                )}
              </button>
              <button
                type="button"
                className="forgot-password-button secondary-button"
                onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); }}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Email Step (default)
  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>Forgot password?</h1>
          <p>Enter your email and we'll send you a verification code</p>
        </div>

        <form onSubmit={handleEmailSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@example.com"
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="button-group">
            <button
              type="submit"
              className="forgot-password-button primary-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send code</span>
              )}
            </button>
            <button
              type="button"
              className="forgot-password-button secondary-button"
              onClick={onBack}
            >
              Back to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
