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
      
      // Fields that need JSON serialization (nested objects)
      const jsonFields = ['phone', 'hostel', 'emergencyDetails'];
      
      // Add all form fields
      Object.entries(createUserData).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          return; // Skip null/undefined values
        }
        
        if (jsonFields.includes(key)) {
          // Serialize nested objects as JSON
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'object') {
          // Handle any other objects
          formData.append(key, JSON.stringify(value));
        } else {
          // Primitives (string, number, boolean)
          formData.append(key, String(value));
        }
      });
      
      // Debug: Log what's being sent
      console.log('=== FRONTEND CREATE USER DEBUG ===');
      console.log('createUserData.password:', createUserData.password ? `"${createUserData.password.substring(0, 3)}..." (length: ${createUserData.password.length})` : 'EMPTY/UNDEFINED');
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        if (key === 'password') {
          console.log(`  ${key}: ${value ? `"${String(value).substring(0, 3)}..." (length: ${String(value).length})` : 'EMPTY'}`);
        } else if (key !== 'files') {
          console.log(`  ${key}: ${String(value).substring(0, 50)}...`);
        }
      }
      console.log('==================================');
      
      // Add files
      if (selectedFiles.profilePhoto) {
        formData.append('files', selectedFiles.profilePhoto);
      }
      if (selectedFiles.disabilityDocument) {
        formData.append('files', selectedFiles.disabilityDocument);
      }
      
      // Don't manually set Content-Type for multipart/form-data - axios will set it with boundary
      await axios.post('http://localhost:3000/users', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
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

  const generateQRCodeForDriver = async (driverId: string) => {
    try {
      await axios.post(`http://localhost:3000/users/${driverId}/generate-qr`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchUsers();
      showNotification('success', 'QR code generated successfully!');
      return true;
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to generate QR code');
      return false;
    }
  };

  const generateQRCodesForAllDrivers = async () => {
    try {
      const response = await axios.post('http://localhost:3000/users/drivers/generate-qr-codes', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchUsers();
      const { success, failed } = response.data;
      if (success > 0) {
        showNotification('success', `Successfully generated ${success} QR code(s)!`);
      }
      if (failed > 0) {
        showNotification('error', `Failed to generate ${failed} QR code(s)`);
      }
      return true;
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to generate QR codes');
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
    showNotification,
    generateQRCodeForDriver,
    generateQRCodesForAllDrivers
  };
};
