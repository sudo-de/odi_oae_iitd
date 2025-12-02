import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './DriverVerification.css';

interface DriverData {
  _id: string;
  name: string;
  email: string;
  phone?: {
    countryCode: string;
    number: string;
  };
  profilePhoto?: {
    data: string;
    mimetype: string;
  };
  isActive: boolean;
  createdAt: string;
}

const DriverVerification = () => {
  const { id } = useParams<{ id: string }>();
  const [_searchParams] = useSearchParams();
  const [driver, setDriver] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const API_BASE_URL = envApiBaseUrl ? envApiBaseUrl.replace(/\/$/, '') : 'http://localhost:3000';

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/public/drivers/${id}`);
        
        if (response.data.role !== 'driver') {
          setError('Invalid QR code - not a driver');
          return;
        }

        setDriver(response.data);
      } catch (err: any) {
        console.error('Error fetching driver:', err);
        setError('Driver not found or QR code is invalid');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDriver();
    } else {
      setError('Invalid QR code');
      setLoading(false);
    }
  }, [id, API_BASE_URL]);

  if (loading) {
    return (
      <div className="driver-verification-container">
        <div className="verification-card loading">
          <div className="loader"></div>
          <p>Verifying driver...</p>
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="driver-verification-container">
        <div className="verification-card error">
          <div className="error-icon">❌</div>
          <h2>Verification Failed</h2>
          <p>{error || 'Driver not found'}</p>
          <button onClick={() => window.location.href = 'http://localhost:5173/'}>
            Go to OAE Website
          </button>
        </div>
      </div>
    );
  }

  const profileImageSrc = driver.profilePhoto?.data
    ? driver.profilePhoto.data.startsWith('data:')
      ? driver.profilePhoto.data
      : `data:${driver.profilePhoto.mimetype};base64,${driver.profilePhoto.data}`
    : null;

  return (
    <div className="driver-verification-container">
      <div className="verification-card success">
        <div className="verification-header">
          <div className="success-icon">✅</div>
          <h1>Verified Driver</h1>
          <p className="verification-subtitle">OAE at IIT Delhi</p>
        </div>

        <div className="driver-info">
          {profileImageSrc ? (
            <div className="driver-photo">
              <img src={profileImageSrc} alt={driver.name} />
            </div>
          ) : (
            <div className="driver-avatar">
              <span>{driver.name.charAt(0).toUpperCase()}</span>
            </div>
          )}

          <div className="driver-details">
            <h2>{driver.name}</h2>
            <div className="driver-meta">
              <div className="meta-item">
                <span className="meta-icon">📧</span>
                <span className="meta-text">{driver.email}</span>
              </div>
              {driver.phone && (
                <div className="meta-item">
                  <span className="meta-icon">📱</span>
                  <span className="meta-text">
                    {driver.phone.countryCode} {driver.phone.number}
                  </span>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span className="meta-text">
                  Member since {new Date(driver.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="status-badge">
          <span className={`status-indicator ${driver.isActive ? 'active' : 'inactive'}`}>
            {driver.isActive ? '✓ Active Driver' : '⚠️ Inactive'}
          </span>
        </div>

        <div className="verification-footer">
          <p className="footer-text">This driver is authorized by OAE at IIT Delhi</p>
          <button className="home-btn" onClick={() => window.location.href = 'http://localhost:5173//'}>
            Visit OAE Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverVerification;

