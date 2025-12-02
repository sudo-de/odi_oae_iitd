import React, { useState } from 'react';
import type { User } from '../types';
import { formatDate } from '../utils';

interface UserTableProps {
  users: User[];
  sortBy: keyof User;
  sortOrder: 'asc' | 'desc';
  onSort: (field: keyof User) => void;
  onToggleMenu: (userId: string, event: React.MouseEvent) => void;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onDeleteUser: (userId: string) => void;
  activeMenuId: string | null;
  menuPosition: 'top' | 'bottom';
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin': return '🛡️';
    case 'staff': return '👔';
    case 'student': return '🎓';
    case 'driver': return '🚗';
    default: return '👤';
  }
};

const UserTable: React.FC<UserTableProps> = ({
  users,
  sortBy,
  sortOrder,
  onSort,
  onToggleMenu: _onToggleMenu,
  onViewUser,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
  activeMenuId: _activeMenuId,
  menuPosition: _menuPosition
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (userId: string) => {
    if (confirmDeleteId === userId) {
      onDeleteUser(userId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(userId);
    }
  };

  const getSortIcon = (field: keyof User) => {
    if (sortBy !== field) return <span className="sort-icon inactive">↕</span>;
    return <span className="sort-icon active">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="table-container">
      <table className="users-table">
        <thead>
          <tr>
            <th onClick={() => onSort('name')} className="sortable">
              <span className="th-content">Name {getSortIcon('name')}</span>
            </th>
            <th onClick={() => onSort('email')} className="sortable">
              <span className="th-content">Email {getSortIcon('email')}</span>
            </th>
            <th onClick={() => onSort('role')} className="sortable">
              <span className="th-content">Role {getSortIcon('role')}</span>
            </th>
            <th onClick={() => onSort('isActive')} className="sortable">
              <span className="th-content">Status {getSortIcon('isActive')}</span>
            </th>
            <th onClick={() => onSort('createdAt')} className="sortable">
              <span className="th-content">Created {getSortIcon('createdAt')}</span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                <div className="user-name-cell">
                  <div className="user-avatar-small" data-role={user.role}>
                    {(user.role === 'student' || user.role === 'driver') && user.profilePhoto?.data ? (
                      <img
                        src={`data:${user.profilePhoto.mimetype};base64,${user.profilePhoto.data}`}
                        alt={`${user.name}'s profile`}
                        className="avatar-image-small"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const textSpan = e.currentTarget.nextElementSibling as HTMLElement;
                          e.currentTarget.style.display = 'none';
                          if (textSpan) textSpan.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span
                      className="avatar-text-small"
                      style={{
                        display: ((user.role === 'student' || user.role === 'driver') && user.profilePhoto?.data) ? 'none' : 'flex'
                      }}
                    >
                    {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="user-name-text">{user.name}</span>
                </div>
              </td>
              <td>
                <span className="email-text">{user.email}</span>
              </td>
              <td>
                <span className={`role-badge role-${user.role}`}>
                  <span className="role-icon">{getRoleIcon(user.role)}</span>
                  {user.role}
                </span>
              </td>
              <td>
                <div className="status-container">
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {user.role === 'student' && user.isExpired && (
                    <span className="status-badge expired">
                      Auto-expired
                    </span>
                  )}
                </div>
              </td>
              <td>
                <span className="date-text">{formatDate(user.createdAt)}</span>
              </td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="action-btn view"
                    onClick={() => onViewUser(user)}
                    title="View Details"
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button 
                    className="action-btn edit"
                    onClick={() => onEditUser(user)}
                    title="Edit User"
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button 
                    className={`action-btn toggle ${user.isActive ? 'deactivate' : 'activate'}`}
                    onClick={() => onToggleStatus(user._id, user.isActive)}
                    title={user.isActive ? 'Deactivate User' : 'Activate User'}
                    type="button"
                  >
                    {user.isActive ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    )}
                  </button>
                  <button 
                    className={`action-btn delete ${confirmDeleteId === user._id ? 'confirm' : ''}`}
                    onClick={() => handleDeleteClick(user._id)}
                    onBlur={() => setConfirmDeleteId(null)}
                    title={confirmDeleteId === user._id ? 'Click again to confirm' : 'Delete User'}
                    type="button"
                  >
                    {confirmDeleteId === user._id ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
