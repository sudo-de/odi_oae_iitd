import React, { useMemo, useState, useEffect, useCallback, memo } from 'react';
import axios from 'axios';
import type { User } from '../types';

interface RideLocation {
  id: string;
  fromLocation: string;
  toLocation: string;
  fare: number;
  createdAt: string;
}

interface DriverDashboardProps {
  users: User[];
  token: string;
  onToggleSidebar?: () => void;
}

// Static data
const AVAILABLE_LOCATIONS = [
  'IIT Main Gate', 'Adhchini Gate', 'Jia Sarai Gate', 'Mehrauli Gate', 'JNU Gate',
  'IIT Hospital', 'IIT Market', 'Dogra Hall', 'LHC', 'Himadri Hostel',
  'Kailash Hostel', 'Nilgiri Hostel', 'Jwalamukhi Hostel', 'Karakoram Hostel',
  'Aravali Hostel', 'Kumaon Hostel', 'Vindhyachal Hostel', 'Shivalik Hostel',
  'Zanskar Hostel', 'Satpura Hostel', 'Other'
] as const;

const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const API_BASE_URL = envApiBaseUrl ? envApiBaseUrl.replace(/\/$/, '') : '';
const buildApiUrl = (path: string) => `${API_BASE_URL}${path}`;

// Memoized stat card component
const StatCard = memo<{
  icon: string;
  label: string;
  value: number;
  total: number;
  color: string;
  gradient: string;
}>(({ icon, label, value, total, color, gradient }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
    return (
    <div 
      className="driver-stat-card"
      style={{ '--stat-color': color, '--stat-gradient': gradient } as React.CSSProperties}
    >
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-content">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-label">{label}</span>
        </div>
      {total > 0 && (
        <div className="stat-card-percentage">{percentage}%</div>
      )}
      </div>
    );
});
StatCard.displayName = 'StatCard';


const DriverDashboard: React.FC<DriverDashboardProps> = ({ users, token, onToggleSidebar }) => {
  // Tab state
  const [activeSection, setActiveSection] = useState<'drivers' | 'locations'>('drivers');
  
  // Ride Location state
  const [locations, setLocations] = useState<RideLocation[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<RideLocation | null>(null);
  const [formData, setFormData] = useState({ fromLocation: '', toLocation: '', fare: 0 });
  const [locationLoading, setLocationLoading] = useState(true); // Start with loading true
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [locationError, setLocationError] = useState('');

  // Memoized calculations
  const drivers = useMemo(() => users.filter(user => user.role === 'driver'), [users]);
  
  const stats = useMemo(() => {
    const active = drivers.filter(d => d.isActive).length;
    const withQR = drivers.filter(d => d.qrCode).length;
    return {
      total: drivers.length,
      active,
      inactive: drivers.length - active,
      withQR,
      withoutQR: drivers.length - withQR,
    };
  }, [drivers]);

  const locationStats = useMemo(() => {
    const total = locations.length;
    const fares = locations.map(l => l.fare);
    const totalFare = fares.reduce((sum, f) => sum + f, 0);
    const minFare = total > 0 ? Math.min(...fares) : 0;
    const maxFare = total > 0 ? Math.max(...fares) : 0;
    return { total, totalFare, minFare, maxFare };
  }, [locations]);

  // Fetch locations
  const fetchLocations = useCallback(async () => {
    try {
      setLocationLoading(true);
      setLocationError('');
      const response = await axios.get<RideLocation[]>(buildApiUrl('/ride-locations'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const normalized = response.data.map((location: any) => ({
        id: String(location.id ?? location._id),
        fromLocation: location.fromLocation,
        toLocation: location.toLocation,
        fare: location.fare,
        createdAt: location.createdAt
      }));
      setLocations(normalized);
    } catch (err: any) {
      setLocationError(err.response?.data?.message || 'Failed to load ride locations');
    } finally {
      setLocationLoading(false);
    }
  }, [token]);

  // Fetch locations data on component mount for accurate tab counts
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Also fetch when switching to locations tab (for refresh)
  useEffect(() => {
    if (activeSection === 'locations') {
      fetchLocations();
    }
  }, [activeSection, fetchLocations]);

  // Location handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fare' ? parseFloat(value) || 0 : value
    }));
  }, []);

  const handleAddLocation = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(formData.fromLocation && formData.toLocation && formData.fare > 0)) {
      setLocationError('Please fill in all fields');
      return;
    }
    try {
      setSubmitting(true);
      await axios.post(buildApiUrl('/ride-locations'), formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchLocations();
      setFormData({ fromLocation: '', toLocation: '', fare: 0 });
      setShowAddForm(false);
    } catch (err: any) {
      setLocationError(err.response?.data?.message || 'Failed to add location');
    } finally {
      setSubmitting(false);
    }
  }, [formData, token, fetchLocations]);

  const handleEditLocation = useCallback((location: RideLocation) => {
    setEditingLocation(location);
    setFormData({ fromLocation: location.fromLocation, toLocation: location.toLocation, fare: location.fare });
    setShowAddForm(true);
  }, []);

  const handleUpdateLocation = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    try {
      setSubmitting(true);
      await axios.patch(buildApiUrl(`/ride-locations/${editingLocation.id}`), formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchLocations();
      setFormData({ fromLocation: '', toLocation: '', fare: 0 });
      setEditingLocation(null);
      setShowAddForm(false);
    } catch (err: any) {
      setLocationError(err.response?.data?.message || 'Failed to update location');
    } finally {
      setSubmitting(false);
    }
  }, [editingLocation, formData, token, fetchLocations]);

  const handleDeleteLocation = useCallback(async (id: string) => {
    if (!window.confirm('Delete this route?')) return;
    try {
      setDeletingId(id);
      await axios.delete(buildApiUrl(`/ride-locations/${id}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchLocations();
    } catch (err: any) {
      setLocationError(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  }, [token, fetchLocations]);

  const handleCancelForm = useCallback(() => {
    setShowAddForm(false);
    setEditingLocation(null);
    setFormData({ fromLocation: '', toLocation: '', fare: 0 });
    setLocationError('');
  }, []);

  const activePercentage = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
  const qrPercentage = stats.total > 0 ? Math.round((stats.withQR / stats.total) * 100) : 0;

  return (
    <div className="driver-dashboard">
      {/* Banner Header */}
      <div className="driver-banner">
        {onToggleSidebar && (
          <button className="mobile-menu-btn banner-menu-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            ☰
          </button>
        )}
        <div className="banner-content">
          <div className="banner-left">
            <div className="banner-icon-wrap">
              <span className="banner-icon">{activeSection === 'drivers' ? '🚗' : '📍'}</span>
            </div>
            <div className="banner-text">
              <h2>Driver & Ride Location</h2>
              <p>Manage drivers and configure ride routes</p>
            </div>
              </div>
          <div className="banner-right">
            {activeSection === 'drivers' ? (
              <div className="banner-quick-stats">
                <div className="quick-stat total">
                  <span className="quick-stat-value">{stats.total}</span>
                  <span className="quick-stat-label">Drivers</span>
                  </div>
                <div className="quick-stat active">
                  <span className="quick-stat-value">{stats.active}</span>
                  <span className="quick-stat-label">Active</span>
                  </div>
                <div className="quick-stat qr">
                  <span className="quick-stat-value">{stats.withQR}</span>
                  <span className="quick-stat-label">QR Ready</span>
                </div>
                  </div>
            ) : (
              <div className="banner-quick-stats">
                <div className="quick-stat total">
                  <span className="quick-stat-value">{locationStats.total}</span>
                  <span className="quick-stat-label">Routes</span>
                  </div>
                <div className="quick-stat active">
                  <span className="quick-stat-value">₹{locationStats.totalFare}</span>
                  <span className="quick-stat-label">Total Fare</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Section Tabs */}
        <div className="section-tabs">
          <button
            className={`section-tab ${activeSection === 'drivers' ? 'active' : ''}`}
            onClick={() => setActiveSection('drivers')}
          >
            🚗 Drivers ({stats.total})
          </button>
          <button
            className={`section-tab ${activeSection === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveSection('locations')}
          >
            📍 Ride Locations ({locationLoading ? '...' : locationStats.total})
          </button>
        </div>
      </div>

      {/* Content based on active section */}
      {activeSection === 'drivers' ? (
        /* Driver Analytics Section */
        <div className="driver-analytics">
          {drivers.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-icon">🚗</div>
              <h3>No Drivers Found</h3>
              <p>Create a new driver from User Management to get started.</p>
            </div>
          ) : (
            <div className="analytics-grid">
              {/* Status Distribution */}
              <div className="analytics-card">
                <div className="analytics-header">
                  <h3><span className="header-icon">📊</span> Status Distribution</h3>
                </div>
                <div className="status-bars">
                  <div className="status-bar-item">
                    <div className="bar-label">
                      <span className="bar-dot active"></span>
                      <span>Active Drivers</span>
                      <span className="bar-value">{stats.active}</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill active" style={{ width: `${activePercentage}%` }}>
                        <span className="bar-percent">{activePercentage}%</span>
              </div>
                    </div>
                  </div>
                  <div className="status-bar-item">
                    <div className="bar-label">
                      <span className="bar-dot inactive"></span>
                      <span>Inactive Drivers</span>
                      <span className="bar-value">{stats.inactive}</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill inactive" style={{ width: `${100 - activePercentage}%` }}>
                        <span className="bar-percent">{100 - activePercentage}%</span>
                </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* QR Code Status */}
              <div className="analytics-card">
                <div className="analytics-header">
                  <h3><span className="header-icon">📱</span> QR Code Status</h3>
            </div>
                <div className="qr-stats">
                  <div className="qr-stat-item generated">
                    <div className="qr-stat-icon">✅</div>
                    <div className="qr-stat-info">
                      <span className="qr-stat-value">{stats.withQR}</span>
                      <span className="qr-stat-label">Generated</span>
              </div>
                    <div className="qr-stat-percent">{qrPercentage}%</div>
                  </div>
                  <div className="qr-stat-item pending">
                    <div className="qr-stat-icon">⏳</div>
                    <div className="qr-stat-info">
                      <span className="qr-stat-value">{stats.withoutQR}</span>
                      <span className="qr-stat-label">Pending</span>
                    </div>
                    <div className="qr-stat-percent">{100 - qrPercentage}%</div>
                  </div>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="analytics-card metrics-card">
                <div className="analytics-header">
                  <h3><span className="header-icon">📈</span> Key Metrics</h3>
                </div>
                <div className="quick-metrics">
                  <div className="quick-metric">
                    <div className="metric-circle" style={{ '--progress': activePercentage } as React.CSSProperties}>
                      <span className="metric-value">{activePercentage}%</span>
                    </div>
                    <span className="metric-label">Active Rate</span>
                  </div>
                  <div className="quick-metric">
                    <div className="metric-circle" style={{ '--progress': qrPercentage } as React.CSSProperties}>
                      <span className="metric-value">{qrPercentage}%</span>
                    </div>
                    <span className="metric-label">QR Complete</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Ride Locations Section */
        <div className="ride-locations-section">
          {/* Add Location Button */}
          <div className="section-actions">
            <button className="add-btn" onClick={() => { setShowAddForm(true); setEditingLocation(null); }}>
              + Add Route
            </button>
          </div>

          {/* Error */}
          {locationError && (
            <div className="error-banner">
              <span>⚠️ {locationError}</span>
              <button onClick={() => setLocationError('')}>×</button>
        </div>
          )}

          {/* Locations Grid */}
          {locationLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <span>Loading routes...</span>
      </div>
          ) : locations.length > 0 ? (
            <div className="locations-grid">
              {locations.map((location, index) => (
                <div 
                  key={location.id} 
                  className="location-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Card Header with Fare */}
                  <div className="loc-card-header">
                    <div className="loc-fare-tag">
                      <span className="fare-symbol">₹</span>
                      <span className="fare-value">{location.fare.toFixed(0)}</span>
                    </div>
                    <div className="loc-card-actions">
                      <button className="loc-action-btn edit" onClick={() => handleEditLocation(location)} title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button 
                        className="loc-action-btn delete" 
                        onClick={() => handleDeleteLocation(location.id)}
                        disabled={deletingId === location.id}
                        title="Delete"
                      >
                        {deletingId === location.id ? (
                          <span className="delete-spinner"></span>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        )}
                      </button>
        </div>
      </div>

                  {/* Route Visualization */}
                  <div className="loc-route-visual">
                    <div className="route-timeline">
                      <div className="timeline-dot from"></div>
                      <div className="timeline-line"></div>
                      <div className="timeline-dot to"></div>
                    </div>
                    <div className="route-locations">
                      <div className="route-point from">
                        <span className="point-label">FROM</span>
                        <span className="point-name">{location.fromLocation}</span>
                      </div>
                      <div className="route-point to">
                        <span className="point-label">TO</span>
                        <span className="point-name">{location.toLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="loc-card-footer">
                    <span className="loc-date">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {new Date(location.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="empty-icon">📍</div>
              <h3>No Routes Added</h3>
              <p>Add your first pickup & drop-off route</p>
              <button className="add-btn" onClick={() => setShowAddForm(true)}>Add First Route</button>
                    </div>
                  )}

          {/* Add/Edit Modal */}
          {showAddForm && (
            <div className="route-modal-overlay" onClick={handleCancelForm}>
              <div className="route-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="route-modal-header">
                  <div className="route-modal-header-content">
                    <span className="route-modal-icon">{editingLocation ? '✏️' : '🛣️'}</span>
                    <div className="route-modal-header-text">
                      <h3>{editingLocation ? 'Edit Route' : 'Add New Route'}</h3>
                      <p>Configure pickup, drop-off and fare</p>
                    </div>
                  </div>
                  <button className="route-modal-close" onClick={handleCancelForm}>×</button>
                </div>

                <form onSubmit={editingLocation ? handleUpdateLocation : handleAddLocation}>
                  {/* Route Preview */}
                  <div className="route-preview">
                    <div className="route-preview-content">
                      <div className="preview-point from">
                        <span className="point-dot"></span>
                        <div className="point-info">
                          <span className="point-label">From</span>
                          <span className="point-value">{formData.fromLocation || 'Select pickup'}</span>
                        </div>
                      </div>
                      <div className="preview-line">
                        <div className="line-dashed"></div>
                        <span className="line-icon">🚗</span>
                      </div>
                      <div className="preview-point to">
                        <span className="point-dot"></span>
                        <div className="point-info">
                          <span className="point-label">To</span>
                          <span className="point-value">{formData.toLocation || 'Select drop-off'}</span>
                        </div>
                      </div>
                    </div>
                    {formData.fare > 0 && (
                      <div className="preview-fare-badge">₹{formData.fare.toFixed(2)}</div>
                  )}
                </div>

                  {/* Form Body */}
                  <div className="route-modal-body">
                    {/* Location Selectors */}
                    <div className="route-form-group">
                      <div className="route-input-wrapper from">
                        <div className="input-header">
                          <span className="input-dot from"></span>
                          <label>Pickup Location</label>
                        </div>
                        <select name="fromLocation" value={formData.fromLocation} onChange={handleInputChange} required>
                          <option value="">Choose pickup point...</option>
                          {AVAILABLE_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                      </div>

                      <div className="route-swap-divider">
                        <span className="swap-icon">⇅</span>
                      </div>

                      <div className="route-input-wrapper to">
                        <div className="input-header">
                          <span className="input-dot to"></span>
                          <label>Drop-off Location</label>
                        </div>
                        <select name="toLocation" value={formData.toLocation} onChange={handleInputChange} required>
                          <option value="">Choose drop-off point...</option>
                          {AVAILABLE_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Fare Input */}
                    <div className="route-fare-section">
                      <div className="fare-header">
                        <span className="fare-icon">💰</span>
                        <label>Fare Amount</label>
                      </div>
                      <div className="fare-input-wrapper">
                        <span className="currency-symbol">₹</span>
                        <input 
                          type="number" 
                          name="fare" 
                          value={formData.fare || ''} 
                          onChange={handleInputChange}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <span className="fare-hint">Enter the one-way fare for this route</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="route-modal-footer">
                    <button type="button" className="route-btn-cancel" onClick={handleCancelForm}>
                      Cancel
                    </button>
                    <button type="submit" className="route-btn-submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <span className="btn-spinner"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          {editingLocation ? '✓ Update Route' : '+ Add Route'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(DriverDashboard);
