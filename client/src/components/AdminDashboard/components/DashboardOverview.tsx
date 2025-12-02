import React, { useMemo, useCallback } from 'react';
import type { User } from '../types';
import { formatDate, calculateStats } from '../utils';

interface DashboardOverviewProps {
  users: User[];
  onToggleSidebar?: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = React.memo(({ users, onToggleSidebar }) => {
  const stats = useMemo(() => calculateStats(users), [users]);
  const totalUsers = stats.totalUsers;
  
  // Calculate percentages
  const studentPercentage = totalUsers > 0 ? Math.round((stats.studentUsers / totalUsers) * 100) : 0;
  const driverPercentage = totalUsers > 0 ? Math.round((stats.driverUsers / totalUsers) * 100) : 0;
  const staffPercentage = totalUsers > 0 ? Math.round((stats.staffUsers / totalUsers) * 100) : 0;
  const adminPercentage = totalUsers > 0 ? Math.round((stats.adminUsers / totalUsers) * 100) : 0;
  const activePercentage = totalUsers > 0 ? Math.round((stats.activeUsers / totalUsers) * 100) : 0;
  const inactiveUsers = totalUsers - stats.activeUsers;

  // Sort users by creation date (newest first) for recent activity
  const recentUsers = useMemo(() => 
    [...users]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [users]
  );

  const statCards = useMemo(() => [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'rgba(120, 119, 198, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(120, 119, 198, 0.4), rgba(255, 119, 198, 0.4))',
      percentage: null,
      subtitle: 'All registered users',
    },
    {
      title: 'Students',
      value: stats.studentUsers,
      icon: '🎓',
      color: 'rgba(56, 189, 248, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.4), rgba(34, 211, 238, 0.4))',
      percentage: studentPercentage,
      subtitle: 'Registered students',
    },
    {
      title: 'Drivers',
      value: stats.driverUsers,
      icon: '🚗',
      color: 'rgba(251, 146, 60, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.4), rgba(245, 158, 11, 0.4))',
      percentage: driverPercentage,
      subtitle: 'Active drivers',
    },
    {
      title: 'Staff',
      value: stats.staffUsers,
      icon: '👔',
      color: 'rgba(168, 85, 247, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(139, 92, 246, 0.4))',
      percentage: staffPercentage,
      subtitle: 'Staff members',
    },
    {
      title: 'Admins',
      value: stats.adminUsers,
      icon: '🛡️',
      color: 'rgba(236, 72, 153, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.4), rgba(244, 114, 182, 0.4))',
      percentage: adminPercentage,
      subtitle: 'System administrators',
    },
    {
      title: 'Active',
      value: stats.activeUsers,
      icon: '✅',
      color: 'rgba(34, 197, 94, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(74, 222, 128, 0.4))',
      percentage: activePercentage,
      subtitle: 'Currently active',
    },
    {
      title: 'Inactive',
      value: inactiveUsers,
      icon: '⏸️',
      color: 'rgba(239, 68, 68, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(248, 113, 113, 0.4))',
      percentage: totalUsers > 0 ? Math.round((inactiveUsers / totalUsers) * 100) : 0,
      subtitle: 'Deactivated accounts',
    },
  ], [stats, studentPercentage, driverPercentage, staffPercentage, adminPercentage, activePercentage, inactiveUsers, totalUsers]);

  const getRoleIcon = useCallback((role: string) => {
    switch (role) {
      case 'admin': return '🛡️';
      case 'staff': return '👔';
      case 'student': return '🎓';
      case 'driver': return '🚗';
      default: return '👤';
    }
  }, []);

  const getStatusBadge = useCallback((isActive: boolean) => {
    return isActive ? (
      <span className="status-badge active">
        Active
      </span>
    ) : (
      <span className="status-badge inactive">
        Inactive
      </span>
    );
  }, []);

  return (
    <div className="overview-tab">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        {onToggleSidebar && (
          <button 
            className="mobile-menu-btn overview-menu-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        )}
        <div className="welcome-content">
          <h2>Welcome to Dashboard</h2>
          <p>Here's an overview of your transport management system</p>
        </div>
        <div className="welcome-stats">
          <div className="welcome-stat">
            <span className="welcome-stat-value">{stats.totalUsers}</span>
            <span className="welcome-stat-label">Users</span>
          </div>
          <div className="welcome-stat">
            <span className="welcome-stat-value">{activePercentage}%</span>
            <span className="welcome-stat-label">Active Rate</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div 
            key={card.title} 
            className="stat-card"
            style={{ '--card-gradient': card.gradient, '--card-color': card.color } as React.CSSProperties}
            data-card-index={index}
          >
            <div className="stat-card-header">
              <div className="stat-icon">{card.icon}</div>
              <h3>{card.title}</h3>
            </div>
            <div className="stat-card-content">
              <div className="stat-number-wrapper">
                <div className="stat-number">{card.value}</div>
                {card.percentage !== null && (
                  <div className="stat-percentage-badge">
                    {card.percentage}%
                  </div>
                )}
              </div>
              {card.percentage !== null && card.percentage > 0 && (
                <div className="stat-percentage">
                  <div className="percentage-bar">
                    <div 
                      className="percentage-fill" 
                      style={{ width: `${card.percentage}%` }}
                    ></div>
                  </div>
        </div>
              )}
              {card.percentage !== null && card.percentage === 0 && (
                <div className="stat-percentage-zero">
                  <span>No {card.title.toLowerCase()} yet</span>
        </div>
              )}
        </div>
            <div className="stat-card-glow"></div>
        </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <div className="activity-header">
          <div className="activity-header-left">
          <h3>
            <span className="header-icon">📋</span>
            Recent Users
          </h3>
            <span className="activity-subtitle">Latest 5 registered users</span>
          </div>
          <span className="activity-count">
            <span className="count-value">{users.length}</span>
            <span className="count-label">Total</span>
          </span>
        </div>
        <div className="activity-list">
          {recentUsers.map((user, index) => (
            <div 
              key={user._id} 
              className="activity-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="activity-left">
                <div className="activity-avatar" data-role={user.role}>
                  {(user.role === 'student' || user.role === 'driver') && user.profilePhoto?.data ? (
                    <img
                      src={`data:${user.profilePhoto.mimetype};base64,${user.profilePhoto.data}`}
                      alt={`${user.name}'s profile`}
                      className="avatar-image"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const textSpan = e.currentTarget.nextElementSibling as HTMLElement;
                        e.currentTarget.style.display = 'none';
                        if (textSpan) textSpan.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span
                    className="avatar-text"
                    style={{
                      display: ((user.role === 'student' || user.role === 'driver') && user.profilePhoto?.data) ? 'none' : 'flex'
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </span>
              </div>
              <div className="activity-info">
                  <div className="activity-name-row">
                    <strong className="activity-name">{user.name}</strong>
                    {getStatusBadge(user.isActive)}
                  </div>
                <span className="activity-email">{user.email}</span>
                </div>
              </div>
              <div className="activity-meta">
                <span className={`role-badge role-${user.role}`}>
                  <span className="role-icon">{getRoleIcon(user.role)}</span>
                  <span className="role-text">{user.role}</span>
                </span>
                <span className="activity-date">
                  <span className="date-icon">📅</span>
                  {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="activity-empty">
              <span className="empty-icon">📭</span>
              <p className="empty-title">No users found</p>
              <span className="empty-hint">Create your first user to get started</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

DashboardOverview.displayName = 'DashboardOverview';

export default DashboardOverview;
