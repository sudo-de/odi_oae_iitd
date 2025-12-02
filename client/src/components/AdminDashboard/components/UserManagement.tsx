import React, { useState, useMemo } from 'react';
import type { User } from '../types';
import { filterAndSortUsers } from '../utils';
import UserTable from './UserTable';

interface UserManagementProps {
  users: User[];
  error: string;
  sidebarCollapsed: boolean;
  onToggleMenu: (userId: string, event: React.MouseEvent) => void;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onDeleteUser: (userId: string) => void;
  onShowCreateUser: () => void;
  onToggleSidebar?: () => void;
  activeMenuId: string | null;
  menuPosition: 'top' | 'bottom';
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  error,
  onToggleMenu,
  onViewUser,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
  onShowCreateUser,
  onToggleSidebar,
  activeMenuId,
  menuPosition
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof User>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleSort = (field: keyof User) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Auto-detect QR code JSON
    if (value.trim().startsWith('{') && value.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(value.trim());
        if (parsed.driverId || parsed.email || parsed.name) {
          return;
        }
      } catch {
        // Not valid JSON yet
      }
    }
  };

  const handleSearchPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text').trim();
    try {
      const parsed = JSON.parse(pastedText);
      if (parsed && typeof parsed === 'object' && (parsed.driverId || parsed.email || parsed.name)) {
        e.preventDefault();
        setSearchTerm(pastedText);
      }
    } catch {
      // Not QR code JSON, allow normal paste
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  // Calculate counts
  const counts = useMemo(() => ({
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    student: users.filter(u => u.role === 'student').length,
    driver: users.filter(u => u.role === 'driver').length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
  }), [users]);

  // Filter users
  const filteredUsers = useMemo(() => {
    let result = filterAndSortUsers(users, searchTerm, sortBy, sortOrder);
    
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }
    
    return result;
  }, [users, searchTerm, sortBy, sortOrder, roleFilter, statusFilter]);

  const hasActiveFilters = searchTerm || roleFilter !== 'all' || statusFilter !== 'all';

  const roleFilters = [
    { key: 'all', label: 'All', icon: '👥', count: counts.all },
    { key: 'admin', label: 'Admins', icon: '🛡️', count: counts.admin },
    { key: 'staff', label: 'Staff', icon: '👔', count: counts.staff },
    { key: 'student', label: 'Students', icon: '🎓', count: counts.student },
    { key: 'driver', label: 'Drivers', icon: '🚗', count: counts.driver },
  ];

  return (
    <div className="users-tab">
      {/* User Management Banner */}
      <div className="user-management-banner">
        {onToggleSidebar && (
          <button 
            className="mobile-menu-btn banner-menu-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        )}
        <div className="banner-content">
          <div className="banner-title">
            <span className="banner-icon">👥</span>
            <div>
              <h2>User Management</h2>
              <p>Manage all users, roles, and permissions</p>
            </div>
          </div>
          <div className="banner-stats">
            <div className="banner-stat">
              <span className="banner-stat-value">{counts.all}</span>
              <span className="banner-stat-label">Total</span>
            </div>
            <div className="banner-stat active">
              <span className="banner-stat-value">{counts.active}</span>
              <span className="banner-stat-label">Active</span>
            </div>
            <div className="banner-stat inactive">
              <span className="banner-stat-value">{counts.inactive}</span>
              <span className="banner-stat-label">Inactive</span>
            </div>
          </div>
        </div>
        <button 
          className="create-user-btn-banner"
          onClick={onShowCreateUser}
          type="button"
        >
          <span className="create-icon">+</span>
          <span className="create-text">Add User</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="users-header">
        <div className="users-header-left">
          <div className="search-box-wrapper">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, email, ID, entry number, UDID, phone..."
                value={searchTerm}
                onChange={handleSearchChange}
                onPaste={handleSearchPaste}
              />
            </div>
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
                title="Clear search"
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        <div className="users-header-right">
          <div className="role-filters">
            {roleFilters.map(filter => (
              <button 
                key={filter.key}
                className={`role-filter-btn ${roleFilter === filter.key ? 'active' : ''}`}
                onClick={() => setRoleFilter(filter.key)}
                type="button"
              >
                <span className="filter-icon">{filter.icon}</span>
                <span className="filter-text">{filter.label}</span>
                <span className="filter-count">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Filter Bar */}
      <div className="status-filter-bar">
        <div className="status-filters">
          <button
            className={`status-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
            type="button"
          >
            All Status
          </button>
          <button
            className={`status-filter-btn active-status ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
            type="button"
          >
            Active ({counts.active})
          </button>
          <button
            className={`status-filter-btn inactive-status ${statusFilter === 'inactive' ? 'active' : ''}`}
            onClick={() => setStatusFilter('inactive')}
            type="button"
          >
            Inactive ({counts.inactive})
          </button>
        </div>
        
        <div className="results-info">
          {hasActiveFilters && (
            <button 
              className="clear-filters-btn"
              onClick={clearFilters}
              type="button"
            >
              Clear filters
            </button>
          )}
          <span className="results-count">
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <UserTable
        users={filteredUsers}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onToggleMenu={onToggleMenu}
        onViewUser={onViewUser}
        onEditUser={onEditUser}
        onToggleStatus={onToggleStatus}
        onDeleteUser={onDeleteUser}
        activeMenuId={activeMenuId}
        menuPosition={menuPosition}
      />

      {filteredUsers.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No users found</h3>
          <p>
            {hasActiveFilters 
              ? "Try adjusting your search or filters to find what you're looking for."
              : "No users have been created yet. Click the + button to add your first user."}
          </p>
          {hasActiveFilters && (
            <button 
              className="clear-filters-btn-large"
              onClick={clearFilters}
              type="button"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
