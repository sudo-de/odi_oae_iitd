import React, { useState } from 'react';
import type { User } from '../types';
import { filterAndSortUsers } from '../utils';
import UserTable from './UserTable';

interface UserManagementProps {
  users: User[];
  error: string;
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

  const handleSort = (field: keyof User) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredUsers = filterAndSortUsers(users, searchTerm, sortBy, sortOrder);

  return (
    <div className="users-tab">
      <div className="users-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="create-user-btn"
          onClick={onShowCreateUser}
        >
          Create User
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
