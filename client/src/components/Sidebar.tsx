import React, { useState } from 'react';
import './Sidebar.css';

interface SidebarProps {
  user: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange, isCollapsed, onToggleCollapse }) => {
  const [isDriverMenuOpen, setIsDriverMenuOpen] = useState(false);

  const handleToggleClick = () => {
    onToggleCollapse();
  };

  const handleDriverMenuToggle = () => {
    if (isCollapsed) {
      // If collapsed, just navigate to driver dashboard
      onTabChange('driver');
    } else {
      // If expanded, toggle the submenu
      setIsDriverMenuOpen(!isDriverMenuOpen);
    }
  };

  // Auto-open submenu when a driver tab is active and sidebar is expanded
  React.useEffect(() => {
    if (!isCollapsed && activeTab.startsWith('driver') && !isDriverMenuOpen) {
      setIsDriverMenuOpen(true);
    }
  }, [activeTab, isCollapsed, isDriverMenuOpen]);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          )}
        </div>
        <button 
          className="sidebar-toggle-btn"
          onClick={handleToggleClick}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => onTabChange('overview')}
          title={isCollapsed ? 'Overview' : ''}
        >
          <span className="nav-icon">📊</span>
          {!isCollapsed && <span className="nav-text">Overview</span>}
        </button>
        <button 
          className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => onTabChange('users')}
          title={isCollapsed ? 'User Management' : ''}
        >
          <span className="nav-icon">👥</span>
          {!isCollapsed && <span className="nav-text">User Management</span>}
        </button>
        <div className="nav-group">
          <button 
            className={`nav-item nav-parent ${activeTab.startsWith('driver') ? 'active' : ''}`}
            onClick={handleDriverMenuToggle}
            title={isCollapsed ? 'Driver Dashboard' : ''}
          >
            <span className="nav-icon">🚗</span>
            {!isCollapsed && <span className="nav-text">Driver</span>}
            {!isCollapsed && <span className={`nav-arrow ${isDriverMenuOpen ? 'rotated' : ''}`}>▼</span>}
          </button>
          <div className={`nav-submenu ${isCollapsed ? 'collapsed' : (isDriverMenuOpen ? 'expanded' : 'hidden')}`}>
            <button 
              className={`nav-subitem ${activeTab === 'driver' ? 'active' : ''}`}
              onClick={() => onTabChange('driver')}
              title={isCollapsed ? 'Driver Dashboard' : ''}
            >
              <span className="nav-subicon">📊</span>
              {!isCollapsed && <span className="nav-subtext">Dashboard</span>}
            </button>
            <button 
              className={`nav-subitem ${activeTab === 'driver-ride-location' ? 'active' : ''}`}
              onClick={() => onTabChange('driver-ride-location')}
              title={isCollapsed ? 'Ride Location' : ''}
            >
              <span className="nav-subicon">📍</span>
              {!isCollapsed && <span className="nav-subtext">Ride Location</span>}
            </button>
          </div>
        </div>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
          title={isCollapsed ? 'Settings' : ''}
        >
          <span className="nav-icon">⚙️</span>
          {!isCollapsed && <span className="nav-text">Settings</span>}
        </button>
      </nav>

      <div className="sidebar-footer">
        <button 
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          title={isCollapsed ? 'Logout' : ''}
        >
          <span className="logout-icon">🚪</span>
          {!isCollapsed && <span className="logout-text">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
