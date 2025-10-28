import React, { useState } from 'react';

interface RideLocation {
  id: string;
  fromLocation: string;
  toLocation: string;
  fare: number;
  createdAt: string;
}

interface RideLocationDashboardProps {
  // Add any props you need
}

const RideLocationDashboard: React.FC<RideLocationDashboardProps> = () => {
  // Available locations for select dropdowns
  const availableLocations = [
    'Main Campus',
    'Metro Station', 
    'Airport',
    'Railway Station',
    'Bus Terminal',
    'Shopping Mall',
    'Hospital',
    'Library'
  ];

  // Mock data for demonstration - replace with actual data fetching
  const [locations, setLocations] = useState<RideLocation[]>([
    {
      id: '1',
      fromLocation: 'Main Campus',
      toLocation: 'Metro Station',
      fare: 50,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      fromLocation: 'Main Campus',
      toLocation: 'Airport',
      fare: 200,
      createdAt: '2024-01-16'
    },
    {
      id: '3',
      fromLocation: 'Metro Station',
      toLocation: 'Airport',
      fare: 150,
      createdAt: '2024-01-17'
    }
  ]);

  const [editingLocation, setEditingLocation] = useState<RideLocation | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    fare: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fare' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fromLocation && formData.toLocation && formData.fare > 0) {
      const newLocation: RideLocation = {
        id: Date.now().toString(),
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        fare: formData.fare,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setLocations(prev => [...prev, newLocation]);
      setFormData({ fromLocation: '', toLocation: '', fare: 0 });
      setShowAddForm(false);
    }
  };

  const handleEditLocation = (location: RideLocation) => {
    setEditingLocation(location);
    setFormData({
      fromLocation: location.fromLocation,
      toLocation: location.toLocation,
      fare: location.fare
    });
    setShowAddForm(true);
  };

  const handleUpdateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation && formData.fromLocation && formData.toLocation && formData.fare > 0) {
      setLocations(prev => prev.map(loc => 
        loc.id === editingLocation.id 
          ? { 
              ...loc, 
              fromLocation: formData.fromLocation, 
              toLocation: formData.toLocation,
              fare: formData.fare 
            }
          : loc
      ));
      setEditingLocation(null);
      setFormData({ fromLocation: '', toLocation: '', fare: 0 });
      setShowAddForm(false);
    }
  };

  const handleDeleteLocation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      setLocations(prev => prev.filter(loc => loc.id !== id));
    }
  };

  const handleCancelEdit = () => {
    setEditingLocation(null);
    setFormData({ fromLocation: '', toLocation: '', fare: 0 });
    setShowAddForm(false);
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
          onClick={() => setShowAddForm(true)}
        >
          <span className="btn-icon">➕</span>
          Add New Location
        </button>
      </div>

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
                <button type="submit" className="submit-btn">
                  {editingLocation ? 'Update Location' : 'Add Location'}
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
            <h3>Average Fare</h3>
            <div className="stat-number">
              ₹{locations.length > 0 ? Math.round(locations.reduce((sum, loc) => sum + loc.fare, 0) / locations.length) : 0}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Highest Fare</h3>
            <div className="stat-number">
              ₹{locations.length > 0 ? Math.max(...locations.map(loc => loc.fare)) : 0}
            </div>
          </div>
        </div>
      </div>

      {/* Locations List */}
      <div className="locations-section">
        <h3>All Locations</h3>
        {locations.length > 0 ? (
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
                  >
                    <span className="btn-icon">🗑️</span>
                    Delete
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
              onClick={() => setShowAddForm(true)}
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
