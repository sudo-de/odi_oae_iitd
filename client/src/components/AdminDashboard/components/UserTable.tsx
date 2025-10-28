import React from 'react';
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

const UserTable: React.FC<UserTableProps> = ({
  users,
  sortBy,
  sortOrder,
  onSort,
  onToggleMenu,
  onViewUser,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
  activeMenuId,
  menuPosition
}) => {
  return (
    <div className="table-container">
      <table className="users-table">
        <thead>
          <tr>
            <th onClick={() => onSort('name')} className="sortable">
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => onSort('email')} className="sortable">
              Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => onSort('role')} className="sortable">
              Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => onSort('isActive')} className="sortable">
              Status {sortBy === 'isActive' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => onSort('createdAt')} className="sortable">
              Created {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`role-badge role-${user.role}`}>
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
              <td>{formatDate(user.createdAt)}</td>
              <td>
                <div className="action-menu-container">
                  <button 
                    className="action-menu-trigger"
                    onClick={(e) => onToggleMenu(user._id, e)}
                  >
                    ⋯
                  </button>
                  {activeMenuId === user._id && (
                    <div className={`action-menu ${menuPosition === 'top' ? 'action-menu-top' : 'action-menu-bottom'}`}>
                      <button 
                        className="menu-item view"
                        onClick={() => {
                          onViewUser(user);
                        }}
                      >
                        👁️ View
                      </button>
                      <button 
                        className="menu-item edit"
                        onClick={() => {
                          onEditUser(user);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="menu-item toggle-status"
                        onClick={() => {
                          onToggleStatus(user._id, user.isActive);
                        }}
                      >
                        {user.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                      </button>
                      <button 
                        className="menu-item delete"
                        onClick={() => {
                          onDeleteUser(user._id);
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
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
