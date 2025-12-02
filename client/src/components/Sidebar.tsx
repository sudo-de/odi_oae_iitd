import React, { useCallback, useMemo, memo } from 'react';
import './Sidebar.css';

interface SidebarProps {
  user: { name: string; role: string };
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
}

// Navigation items configuration (Settings moved to footer)
const NAV_ITEMS = [
  { id: 'overview', icon: '📊', label: 'Overview' },
  { id: 'users', icon: '👥', label: 'User Management' },
  { id: 'driver', icon: '🚗', label: 'Driver Dashboard' },
  { id: 'driver-ride-location', icon: '📍', label: 'Ride Location' },
  { id: 'ride-bills', icon: '🧾', label: 'Ride Bills' },
] as const;

// Nav Item Component
const NavItem = memo(({ 
  item, 
  isActive, 
  isCollapsed, 
  onClick 
}: { 
  item: typeof NAV_ITEMS[number]; 
  isActive: boolean; 
  isCollapsed: boolean; 
  onClick: () => void;
}) => (
  <button 
    className={`nav-item ${isActive ? 'active' : ''}`}
    onClick={onClick}
    title={isCollapsed ? item.label : ''}
    aria-label={item.label}
    aria-current={isActive ? 'page' : undefined}
  >
    <span className="nav-icon" aria-hidden="true">{item.icon}</span>
    {!isCollapsed && <span className="nav-text">{item.label}</span>}
  </button>
));

const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  activeTab, 
  onTabChange, 
  isCollapsed, 
  onToggleCollapse, 
  mobileOpen = false 
}) => {
  const handleToggleClick = useCallback(() => {
    onToggleCollapse();
  }, [onToggleCollapse]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    onTabChange(tab);
  }, [onTabChange]);

  const sidebarClasses = useMemo(() => 
    ['sidebar', isCollapsed ? 'collapsed' : 'expanded', mobileOpen ? 'mobile-open' : '']
      .filter(Boolean)
      .join(' ')
  , [isCollapsed, mobileOpen]);

  const userInitial = useMemo(() => 
    user.name.charAt(0).toUpperCase()
  , [user.name]);

  return (
    <div className={sidebarClasses}>
      {/* Header - Logo */}
      <div className="sidebar-header">
        <div className="brand-logo">
          <img src="/logo.png" alt="OAE" className="logo-img" />
          {!isCollapsed && <span className="brand-text">OAE</span>}
        </div>
        <button 
          className="sidebar-toggle-btn"
          onClick={handleToggleClick}
          title={isCollapsed ? 'Expand' : 'Collapse'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <svg 
            className="toggle-icon" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {isCollapsed ? (
              <polyline points="9 18 15 12 9 6" />
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
        {NAV_ITEMS.map(item => (
          <NavItem 
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            isCollapsed={isCollapsed}
            onClick={() => handleTabChange(item.id)}
          />
        ))}
      </nav>

      {/* Footer - User Profile */}
      <div className="sidebar-footer">
        {/* User Info */}
        <div className="user-profile">
          <div className="user-avatar" title={user.name}>
            <span className="avatar-initial">{userInitial}</span>
            <span className="avatar-status" aria-label="Online"></span>
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="footer-actions">
          <button 
            className={`footer-action-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('settings')}
            title={isCollapsed ? 'Settings' : ''}
            aria-label="Settings"
          >
            <span className="action-icon">⚙️</span>
            {!isCollapsed && <span className="action-text">Settings</span>}
          </button>
          <button 
            className="footer-action-btn logout"
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : ''}
            aria-label="Logout"
          >
            <span className="action-icon">🚪</span>
            {!isCollapsed && <span className="action-text">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(Sidebar);
