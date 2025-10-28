import { useState, useEffect } from 'react';
import axios from 'axios';
import type { User, CreateUserData, SelectedFiles, Notification } from '../types';

export const useUserManagement = (token: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:3000/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (createUserData: CreateUserData, selectedFiles: SelectedFiles) => {
    try {
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(createUserData).forEach(([key, value]) => {
        if (key === 'phone') {
          formData.append('phone', JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      });
      
      // Add files
      if (selectedFiles.profilePhoto) {
        formData.append('files', selectedFiles.profilePhoto);
      }
      if (selectedFiles.disabilityDocument) {
        formData.append('files', selectedFiles.disabilityDocument);
      }
      
      await axios.post('http://localhost:3000/users', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      await fetchUsers();
      showNotification('success', 'User created successfully!');
      return true;
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to create user');
      return false;
    }
  };

  const updateUser = async (userId: string, updateData: any) => {
    try {
      await axios.patch(`http://localhost:3000/users/${userId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      await fetchUsers();
      showNotification('success', 'User updated successfully!');
      return true;
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to update user');
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:3000/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        await fetchUsers();
        setError('');
        showNotification('success', 'User deleted successfully!');
        return true;
      } catch (err: any) {
        showNotification('error', err.response?.data?.message || 'Failed to delete user');
        return false;
      }
    }
    return false;
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.patch(`http://localhost:3000/users/${userId}/status`, 
        { isActive: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchUsers();
      setError('');
      showNotification('success', `User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      return true;
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to update user status');
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    notifications,
    setError,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    showNotification
  };
};
