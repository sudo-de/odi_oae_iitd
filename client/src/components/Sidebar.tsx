import React, { useCallback, useMemo, memo, useState, useRef, useEffect } from 'react';
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
  { id: 'driver', icon: '🚗', label: 'Driver & Ride Location' },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    setMenuOpen(false);
  }, [onTabChange]);

  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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

      {/* Footer - User Profile with Popup Menu */}
      <div className="sidebar-footer" ref={menuRef}>
        <button 
          className={`user-menu-trigger ${menuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <div className="user-avatar" title={user.name}>
            <span className="avatar-initial">{userInitial}</span>
            <span className="avatar-status" aria-label="Online"></span>
          </div>
          {!isCollapsed && (
            <>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
              <span className="menu-arrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </>
          )}
        </button>

        {/* Popup Menu */}
        {menuOpen && (
          <div className="user-popup-menu">
            <div className="popup-header">
              <div className="popup-avatar">
                <span>{userInitial}</span>
              </div>
              <div className="popup-user-info">
                <div className="popup-name">{user.name}</div>
                <div className="popup-role">@{user.role}</div>
              </div>
            </div>
            <div className="popup-divider"></div>
        <button 
              className={`popup-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              <span>Settings</span>
            </button>
            <div className="popup-divider"></div>
            <button 
              className="popup-item logout"
              onClick={handleLogout}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Sidebar);
