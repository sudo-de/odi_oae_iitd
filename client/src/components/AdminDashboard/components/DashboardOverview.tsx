import React from 'react';
import type { User } from '../types';
import { formatDate, calculateStats } from '../utils';

interface DashboardOverviewProps {
  users: User[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ users }) => {
  const stats = calculateStats(users);

  return (
    <div className="overview-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-number">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <h3>Students</h3>
          <div className="stat-number">{stats.studentUsers}</div>
        </div>
        <div className="stat-card">
          <h3>Drivers</h3>
          <div className="stat-number">{stats.driverUsers}</div>
        </div>
        <div className="stat-card">
          <h3>Staff</h3>
          <div className="stat-number">{stats.staffUsers}</div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Users</h3>
        <div className="activity-list">
          {users.slice(0, 5).map((user) => (
            <div key={user._id} className="activity-item">
              <div className="activity-info">
                <strong>{user.name}</strong>
                <span className="activity-email">{user.email}</span>
              </div>
              <div className="activity-meta">
                <span className={`role-badge role-${user.role}`}>
                  {user.role}
                </span>
                <span className="activity-date">
                  {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
