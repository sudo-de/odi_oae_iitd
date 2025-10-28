import React from 'react';
import type { User } from '../types';
import { formatDate } from '../utils';

interface DriverDashboardProps {
  users: User[];
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ users }) => {
  // Filter driver users
  const drivers = users.filter(user => user.role === 'driver');
  const activeDrivers = drivers.filter(driver => driver.isActive);
  const inactiveDrivers = drivers.filter(driver => !driver.isActive);

  // Calculate driver statistics
  const driverStats = {
    totalDrivers: drivers.length,
    activeDrivers: activeDrivers.length,
    inactiveDrivers: inactiveDrivers.length,
    driversWithQR: drivers.filter(driver => driver.qrCode).length,
    driversWithoutQR: drivers.filter(driver => !driver.qrCode).length,
  };

  // Recent driver activity (last 5 drivers)
  const recentDrivers = drivers
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="driver-dashboard">
      {/* Driver Statistics */}
      <div className="driver-stats-grid">
        <div className="stat-card driver-stat">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>Total Drivers</h3>
            <div className="stat-number">{driverStats.totalDrivers}</div>
          </div>
        </div>
        <div className="stat-card driver-stat">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Active Drivers</h3>
            <div className="stat-number">{driverStats.activeDrivers}</div>
          </div>
        </div>
        <div className="stat-card driver-stat">
          <div className="stat-icon">⏸️</div>
          <div className="stat-content">
            <h3>Inactive Drivers</h3>
            <div className="stat-number">{driverStats.inactiveDrivers}</div>
          </div>
        </div>
        <div className="stat-card driver-stat">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <h3>QR Code Generated</h3>
            <div className="stat-number">{driverStats.driversWithQR}</div>
          </div>
        </div>
      </div>

      {/* Driver Analysis */}
      <div className="driver-analysis">
        <div className="analysis-section">
          <h3>Driver Analysis</h3>
          <div className="analysis-grid">
            <div className="analysis-card">
              <h4>Driver Status Distribution</h4>
              <div className="status-chart">
                <div className="chart-item">
                  <div className="chart-bar active" style={{ width: `${driverStats.totalDrivers > 0 ? (driverStats.activeDrivers / driverStats.totalDrivers) * 100 : 0}%` }}></div>
                  <span>Active ({driverStats.activeDrivers})</span>
                </div>
                <div className="chart-item">
                  <div className="chart-bar inactive" style={{ width: `${driverStats.totalDrivers > 0 ? (driverStats.inactiveDrivers / driverStats.totalDrivers) * 100 : 0}%` }}></div>
                  <span>Inactive ({driverStats.inactiveDrivers})</span>
                </div>
              </div>
            </div>
            
            <div className="analysis-card">
              <h4>QR Code Status</h4>
              <div className="qr-status">
                <div className="qr-item">
                  <div className="qr-indicator generated"></div>
                  <span>Generated: {driverStats.driversWithQR}</span>
                </div>
                <div className="qr-item">
                  <div className="qr-indicator pending"></div>
                  <span>Pending: {driverStats.driversWithoutQR}</span>
                </div>
              </div>
            </div>

            <div className="analysis-card">
              <h4>Driver Performance</h4>
              <div className="performance-metrics">
                <div className="metric">
                  <span className="metric-label">Active Rate</span>
                  <span className="metric-value">
                    {driverStats.totalDrivers > 0 ? Math.round((driverStats.activeDrivers / driverStats.totalDrivers) * 100) : 0}%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">QR Completion</span>
                  <span className="metric-value">
                    {driverStats.totalDrivers > 0 ? Math.round((driverStats.driversWithQR / driverStats.totalDrivers) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Drivers */}
      <div className="recent-drivers">
        <h3>Recent Driver Registrations</h3>
        <div className="drivers-list">
          {recentDrivers.length > 0 ? (
            recentDrivers.map((driver) => (
              <div key={driver._id} className="driver-item">
                <div className="driver-info">
                  <div className="driver-avatar">
                    {driver.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="driver-details">
                    <div className="driver-name">{driver.name}</div>
                    <div className="driver-email">{driver.email}</div>
                  </div>
                </div>
                <div className="driver-meta">
                  <span className={`status-badge ${driver.isActive ? 'active' : 'inactive'}`}>
                    {driver.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="driver-date">
                    {formatDate(driver.createdAt)}
                  </span>
                  {driver.qrCode && (
                    <span className="qr-badge">QR Generated</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-drivers">
              <div className="no-drivers-icon">🚗</div>
              <p>No drivers registered yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="driver-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn primary">
            <span className="btn-icon">➕</span>
            <span className="btn-text">Add New Driver</span>
          </button>
          <button className="action-btn secondary">
            <span className="btn-icon">📱</span>
            <span className="btn-text">Generate QR Codes</span>
          </button>
          <button className="action-btn secondary">
            <span className="btn-icon">📊</span>
            <span className="btn-text">Export Driver Report</span>
          </button>
          <button className="action-btn secondary">
            <span className="btn-icon">🔄</span>
            <span className="btn-text">Refresh Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
