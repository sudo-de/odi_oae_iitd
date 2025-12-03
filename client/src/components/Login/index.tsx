import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ForgotPassword from './ForgotPassword';
import './Login.css';

interface LoginProps {
  onLogin: (token: string, userData: any) => void;
}

type ErrorType = 'none' | 'email_not_found' | 'wrong_password' | 'network' | 'other';

const Login = ({ onLogin }: LoginProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>('none');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const API_BASE_URL = envApiBaseUrl ? envApiBaseUrl.replace(/\/$/, '') : 'http://localhost:3000';
  const buildApiUrl = (path: string) => `${API_BASE_URL}${path}`;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setErrorType('none');
    setIsLoading(true);

    try {
      const response = await axios.post(buildApiUrl('/auth/login'), {
        email: email.trim(),
        password: password,
      });

      if (response.data.access_token && response.data.user) {
        onLogin(response.data.access_token, response.data.user);
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message;
      
      if (errorMessage === 'Email not found') {
        setError('No account found with this email');
        setErrorType('email_not_found');
      } else if (errorMessage === 'Wrong password') {
        setError('Incorrect password');
        setErrorType('wrong_password');
      } else if (errorMessage === 'Account not set up. Please reset your password.') {
        setError('Account not set up');
        setErrorType('wrong_password');
      } else if (errorMessage === 'Invalid credentials' || err.response?.status === 401) {
        setError('Invalid email or password');
        setErrorType('wrong_password');
      } else if (err.message === 'Network Error') {
        setError('Unable to connect to server. Please check your connection.');
        setErrorType('network');
      } else {
        setError(errorMessage || 'An error occurred. Please try again.');
        setErrorType('other');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="OAE at IIT Delhi" className="login-logo" />
          <h1>Log in with your email</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); }}>
              Forgot password?
            </a>
          </div>

          {error && (
            <div className="error-container">
              <div className="error-message" role="alert">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
              
              {errorType === 'email_not_found' && (
                <div className="error-help-card">
                  <div className="help-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="help-content">
                    <p className="help-title">Account not found</p>
                    <p className="help-text">This email is not registered. Please check your email or:</p>
                    <div className="help-actions">
                      <button type="button" className="help-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72" />
                        </svg>
                        Contact Office
                      </button>
                      <button type="button" className="help-link primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <line x1="20" y1="8" x2="20" y2="14" />
                          <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        Register Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {errorType === 'wrong_password' && (
                <div className="error-help-card">
                  <div className="help-icon warning">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div className="help-content">
                    <p className="help-title">Password incorrect</p>
                    <p className="help-text">The password you entered doesn't match our records.</p>
                    <div className="help-actions">
                      <button 
                        type="button" 
                        className="help-link primary"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                        Reset Password
                      </button>
                    </div>
                    <p className="help-hint">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      Recently changed password? Try your previous one.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="button-group">
            <button
              type="submit"
              className="login-button primary-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="spinner"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Next</span>
              )}
            </button>
            <button
              type="button"
              className="login-button secondary-button"
              onClick={() => window.location.href = 'http://localhost:5173/'} // OAE website URL
            >
              Go back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

