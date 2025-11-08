import React, { useState } from 'react';
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
  activeMenuId: string | null;
  menuPosition: 'top' | 'bottom';
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  error,
  sidebarCollapsed,
  onToggleMenu,
  onViewUser,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
  onShowCreateUser,
  activeMenuId,
  menuPosition
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof User>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const handleSort = (field: keyof User) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredUsers = filterAndSortUsers(users, searchTerm, sortBy, sortOrder).filter(user => {
    if (roleFilter === 'all') return true;
    return user.role === roleFilter;
  });

  return (
    <div className="users-tab">
      <div className="users-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users, email, ID, entry number, UDID, phone, or scan QR/barcode..."
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              
              // Auto-detect and handle QR code JSON when typing
              if (value.trim().startsWith('{') && value.trim().endsWith('}')) {
                try {
                  const parsed = JSON.parse(value.trim());
                  if (parsed.driverId || parsed.email || parsed.name) {
                    // Valid QR code JSON, keep it as is
                    return;
                  }
                } catch {
                  // Not valid JSON yet, continue typing
                }
              }
            }}
            onPaste={(e) => {
              // Handle pasted QR code data
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
            }}
          />
          <span className="search-icon" title="Supports QR code/barcode scanning">📷</span>
        </div>
        <div className="role-filters">
          <button 
            className={`role-filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
            onClick={() => setRoleFilter('all')}
          >
            All
          </button>
          <button 
            className={`role-filter-btn ${roleFilter === 'admin' ? 'active' : ''}`}
            onClick={() => setRoleFilter('admin')}
          >
            Admins
          </button>
          <button 
            className={`role-filter-btn ${roleFilter === 'staff' ? 'active' : ''}`}
            onClick={() => setRoleFilter('staff')}
          >
            Staffs
          </button>
          <button 
            className={`role-filter-btn ${roleFilter === 'student' ? 'active' : ''}`}
            onClick={() => setRoleFilter('student')}
          >
            Students
          </button>
          <button 
            className={`role-filter-btn ${roleFilter === 'driver' ? 'active' : ''}`}
            onClick={() => setRoleFilter('driver')}
          >
            Drivers
          </button>
        </div>
        <button 
          className={`create-user-btn ${sidebarCollapsed ? 'compact' : ''}`}
          onClick={onShowCreateUser}
          title={sidebarCollapsed ? 'Create User' : ''}
        >
          {sidebarCollapsed ? '+' : '+'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

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
          No users found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default UserManagement;
