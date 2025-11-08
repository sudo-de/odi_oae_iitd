import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

interface RideLocation {
  id: string;
  fromLocation: string;
  toLocation: string;
  fare: number;
  createdAt: string;
}

interface RideLocationDashboardProps {
  token: string;
}

const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const API_BASE_URL = envApiBaseUrl ? envApiBaseUrl.replace(/\/$/, '') : '';
const buildApiUrl = (path: string) => `${API_BASE_URL}${path}`;

const RideLocationDashboard: React.FC<RideLocationDashboardProps> = ({ token }) => {
  // Available locations for select dropdowns
  const availableLocations = [
    'IIT Main Gate',
    'Adhchini Gate',
    'Jia Sarai Gate',
    'Mehrauli Gate',
    'JNU Gate',
    'IIT Hospital',
    'IIT Market',
    'Dogra Hall',
    'LHC',
    'Himadri Hostel',
    'Kailash Hostel',
    'Nilgiri Hostel',
    'Jwalamukhi Hostel',
    'Karakoram Hostel',
    'Aravali Hostel',
    'Kumaon Hostel',
    'Vindhyachal Hostel',
    'Shivalik Hostel',
    'Zanskar Hostel',
    'Satpura Hostel',
    'Other'
  ];

  const [locations, setLocations] = useState<RideLocation[]>([]);
  const [editingLocation, setEditingLocation] = useState<RideLocation | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    fare: 0
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get<RideLocation[]>(buildApiUrl('/ride-locations'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const normalized = response.data.map((location: any) => ({
        id: String(location.id ?? location._id ?? location.id),
        fromLocation: location.fromLocation,
        toLocation: location.toLocation,
        fare: location.fare,
        createdAt: location.createdAt
      }));

      setLocations(normalized);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load ride locations');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const resetFormState = () => {
    setEditingLocation(null);
    setFormData({ fromLocation: '', toLocation: '', fare: 0 });
  };

  const handleOpenAddForm = () => {
    resetFormState();
    setError('');
    setShowAddForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fare' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(formData.fromLocation && formData.toLocation && formData.fare > 0)) {
      setError('Please fill in all fields with valid values');
      return;
    }

    if (!API_BASE_URL) {
      setError('API base URL is not configured. Please set VITE_API_BASE_URL environment variable.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const payload = {
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        fare: Number(formData.fare)
      };

      const url = buildApiUrl('/ride-locations');
      console.log('POST request to:', url, 'Payload:', payload);

      const response = await axios.post(
        url,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Response:', response.data);
      await fetchLocations();
      resetFormState();
      setShowAddForm(false);
    } catch (err: any) {
      console.error('Error adding ride location:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      
      let errorMessage = 'Failed to add ride location';
      
      if (err.response) {
        // Handle validation errors from NestJS
        if (err.response.data?.message) {
          if (Array.isArray(err.response.data.message)) {
            errorMessage = err.response.data.message.join(', ');
          } else if (typeof err.response.data.message === 'string') {
            errorMessage = err.response.data.message;
          }
        } else if (err.response.data?.error) {
          errorMessage = Array.isArray(err.response.data.error) 
            ? err.response.data.error.join(', ')
            : err.response.data.error;
        } else if (err.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (err.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please check if the server is running.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditLocation = (location: RideLocation) => {
    setError('');
    setEditingLocation(location);
    setFormData({
      fromLocation: location.fromLocation,
      toLocation: location.toLocation,
      fare: location.fare
    });
    setShowAddForm(true);
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(editingLocation && formData.fromLocation && formData.toLocation && formData.fare > 0)) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await axios.patch(
        buildApiUrl(`/ride-locations/${editingLocation.id}`),
        {
          fromLocation: formData.fromLocation,
          toLocation: formData.toLocation,
          fare: formData.fare
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      await fetchLocations();
      resetFormState();
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update ride location');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      setDeletingId(id);
      setError('');
      await axios.delete(buildApiUrl(`/ride-locations/${id}`), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchLocations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete ride location');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelEdit = () => {
    resetFormState();
    setShowAddForm(false);
    setError('');
  };

  return (
    <div className="ride-location-dashboard">
      {/* Header */}
      <div className="location-header">
        <div className="header-content">
          <h2>Ride Location Management</h2>
          <p>Manage pickup and drop-off locations with fare settings</p>
        </div>
        <button 
          className="add-location-btn"
          onClick={handleOpenAddForm}
        >
          <span className="btn-icon">➕</span>
          Add New Location
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="location-form-overlay">
          <div className="location-form">
            <div className="form-header">
              <h3>{editingLocation ? 'Edit Location' : 'Add New Location'}</h3>
              <button className="close-btn" onClick={handleCancelEdit}>✕</button>
            </div>
            <form onSubmit={editingLocation ? handleUpdateLocation : handleAddLocation}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fromLocation">From Location</label>
                  <select
                    id="fromLocation"
                    name="fromLocation"
                    value={formData.fromLocation}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select from location</option>
                    {availableLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="toLocation">To Location</label>
                  <select
                    id="toLocation"
                    name="toLocation"
                    value={formData.toLocation}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select to location</option>
                    {availableLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="fare">Fare (₹)</label>
                <input
                  type="number"
                  id="fare"
                  name="fare"
                  value={formData.fare}
                  onChange={handleInputChange}
                  placeholder="Enter fare amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : editingLocation ? 'Update Location' : 'Add Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="location-stats">
        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-content">
            <h3>Total Locations</h3>
            <div className="stat-number">{locations.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>
              Total Fare
              {locations.length > 0 ? (
                <> (Min: ₹{Math.min(...locations.map(loc => loc.fare))} | Max: ₹{Math.max(...locations.map(loc => loc.fare))})</>
              ) : (
                <> (Min: ₹0 | Max: ₹0)</>
              )}
            </h3>
            <div className="stat-number">
              {locations.length > 0 ? (
                `₹${Math.min(...locations.map(loc => loc.fare)) + Math.max(...locations.map(loc => loc.fare))}`
              ) : (
                '₹0'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Locations List */}
      <div className="locations-section">
        <h3>All Locations</h3>
        {loading ? (
          <div className="loading-state">
            Loading ride locations...
          </div>
        ) : locations.length > 0 ? (
          <div className="locations-grid">
            {locations.map((location) => (
              <div key={location.id} className="location-card">
                <div className="location-header">
                  <div className="location-icon">🚗</div>
                  <div className="location-info">
                    <h4>{location.fromLocation} → {location.toLocation}</h4>
                  </div>
                </div>
                <div className="location-details">
                  <div className="fare-info">
                    <span className="fare-label">Fare:</span>
                    <span className="fare-amount">₹{location.fare}</span>
                  </div>
                  <div className="created-date">
                    Added: {new Date(location.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="location-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEditLocation(location)}
                    title="Edit Location"
                  >
                    <span className="btn-icon">✏️</span>
                    Edit
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteLocation(location.id)}
                    title="Delete Location"
                    disabled={deletingId === location.id}
                  >
                    <span className="btn-icon">🗑️</span>
                    {deletingId === location.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-locations">
            <div className="no-locations-icon">📍</div>
            <h4>No locations added yet</h4>
            <p>Add your first ride location to get started</p>
            <button 
              className="add-first-location-btn"
              onClick={handleOpenAddForm}
            >
              Add First Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideLocationDashboard;
