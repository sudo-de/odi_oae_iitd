import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  user: any;
  activeTab: string;
  sidebarCollapsed: boolean;
  onTabChange: (tab: string) => void;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, sidebarCollapsed, onTabChange, onToggleCollapse }) => {
  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="sidebar-header">
        {!sidebarCollapsed && <h2>Admin Panel</h2>}
        <div className="user-info">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          {!sidebarCollapsed && (
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          )}
        </div>
        <button 
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => onTabChange('overview')}
          title={sidebarCollapsed ? 'Overview' : ''}
        >
          <span className="nav-icon">📊</span>
          {!sidebarCollapsed && <span className="nav-text">Overview</span>}
        </button>
        <button 
          className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => onTabChange('users')}
          title={sidebarCollapsed ? 'User Management' : ''}
        >
          <span className="nav-icon">👥</span>
          {!sidebarCollapsed && <span className="nav-text">User Management</span>}
        </button>
        <button 
          className={`nav-item ${activeTab === 'driver' ? 'active' : ''}`}
          onClick={() => onTabChange('driver')}
          title={sidebarCollapsed ? 'Driver Dashboard' : ''}
        >
          <span className="nav-icon">🚗</span>
          {!sidebarCollapsed && <span className="nav-text">Driver</span>}
        </button>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
          title={sidebarCollapsed ? 'Settings' : ''}
        >
          <span className="nav-icon">⚙️</span>
          {!sidebarCollapsed && <span className="nav-text">Settings</span>}
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <div className="status-indicator online"></div>
          {!sidebarCollapsed && <span>System Online</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
