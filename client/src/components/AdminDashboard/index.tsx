import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import type { AdminDashboardProps, User, CreateUserData, SelectedFiles } from './types';
import { useUserManagement } from './hooks/useUserManagement';
import { useFormManagement } from './hooks/useFormManagement';
import { useModalManagement } from './hooks/useModalManagement';
import { useMenuManagement } from './hooks/useMenuManagement';
import { calculateStats } from './utils';
import DashboardOverview from './components/DashboardOverview';
import UserManagement from './components/UserManagement';
import DriverDashboard from './components/DriverDashboard';
import RideBillsDashboard from './components/RideBillsDashboard';
import Settings from './components/Settings';
import CreateUserModal from './components/CreateUserModal';
import EditUserModal from './components/EditUserModal';
import UserDetailsModal from './components/UserDetailsModal';
import NotificationContainer from './components/NotificationContainer';
import './styles/index.css';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ token, user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Custom hooks
  const {
    users,
    loading,
    error,
    notifications,
    setError,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    showNotification
  } = useUserManagement(token);

  const {
    createUserData,
    setCreateUserData,
    selectedFiles,
    handleInputChange,
    handleFileChange,
    handlePhoneChange,
    handleHostelChange,
    handleEmergencyChange,
    resetFormForRole,
    resetForm
  } = useFormManagement();

  const {
    showCreateUser,
    setShowCreateUser,
    showEditUser,
    setShowEditUser,
    showUserDetails,
    setShowUserDetails,
    editingUser,
    setEditingUser,
    viewingUser,
    setViewingUser,
    handleViewUser
  } = useModalManagement();

  const {
    activeMenuId,
    menuPosition,
    toggleMenu
  } = useMenuManagement();

  // Event handlers
  const handleCreateUser = async (e: React.FormEvent, data?: CreateUserData, files?: SelectedFiles) => {
    e.preventDefault();
    
    // Use passed data if available (avoids stale closure), otherwise fall back to state
    const userData = data || createUserData;
    const userFiles = files || selectedFiles;
    
    // Debug: Log what we're about to send
    console.log('handleCreateUser called with:', {
      name: userData.name,
      email: userData.email,
      password: userData.password ? '***EXISTS***' : '***EMPTY***',
      role: userData.role
    });
    
    // Final safeguard: ensure password exists
    if (!userData.password || !userData.password.trim()) {
      console.error('Password is empty in handleCreateUser!');
      setError('Password is required');
      return;
    }
    
    const success = await createUser(userData, userFiles);
    if (success) {
      resetForm();
      setShowCreateUser(false);
      setError('');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    const updateData: any = {
      name: createUserData.name,
      email: createUserData.email,
      role: createUserData.role,
      isActive: createUserData.isActive,
      phone: createUserData.phone,
      entryNumber: createUserData.entryNumber,
      programme: createUserData.programme,
      department: createUserData.department,
      hostel: createUserData.hostel,
      emergencyDetails: createUserData.emergencyDetails,
      disabilityType: createUserData.disabilityType,
      udidNumber: createUserData.udidNumber,
      disabilityPercentage: createUserData.disabilityPercentage,
      expiryDate: createUserData.expiryDate,
      qrCode: createUserData.qrCode
    };
    
    // Only include password if it's not empty
    if (createUserData.password.trim()) {
      updateData.password = createUserData.password;
    }
    
    const success = await updateUser(editingUser._id, updateData);
    if (success) {
      setShowEditUser(false);
      setEditingUser(null);
      resetForm();
      setError('');
    }
  };

  const handleEditUserClick = (user: User) => {
    setEditingUser(user);
    setCreateUserData({
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password
      role: user.role,
      isActive: user.isActive,
      entryNumber: user.entryNumber || '',
      programme: user.programme || '',
      department: user.department || '',
      phone: user.phone || {
        countryCode: '+91',
        number: ''
      },
      hostel: user.hostel || {
        name: '',
        roomNo: ''
      },
      emergencyDetails: user.emergencyDetails || {
        name: '',
        address: '',
        phone: '',
        additionalPhone: ''
      },
      disabilityType: user.disabilityType || '',
      udidNumber: user.udidNumber || '',
      disabilityPercentage: user.disabilityPercentage || 0,
      expiryDate: user.expiryDate ? new Date(user.expiryDate).toISOString().split('T')[0] : '',
      qrCode: user.qrCode || ''
    });
    setShowEditUser(true);
  };

  const handleDeleteUserClick = async (userId: string) => {
    await deleteUser(userId);
  };

  const handleToggleStatusClick = async (userId: string, currentStatus: boolean) => {
    await toggleUserStatus(userId, currentStatus);
  };

  const handleViewUserClick = (user: User) => {
    handleViewUser(user);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange(e);
  };

  const stats = calculateStats(users);

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 768) {
      // On mobile, toggle overlay
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      // On desktop, toggle collapse
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Close mobile sidebar when clicking overlay
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileSidebarOpen && window.innerWidth <= 768) {
        const target = e.target as HTMLElement;
        if (target.classList.contains('admin-dashboard') || target.closest('.main-content')) {
          setMobileSidebarOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileSidebarOpen]);

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className={`admin-dashboard ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar 
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (window.innerWidth <= 768) {
            setMobileSidebarOpen(false);
          }
        }}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        mobileOpen={mobileSidebarOpen}
      />

      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        {activeTab !== 'overview' && activeTab !== 'users' && activeTab !== 'driver' && activeTab !== 'ride-bills' && activeTab !== 'settings' && (
        <div className="content-header">
          <button 
            className="mobile-menu-btn"
            onClick={handleToggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
            <h1>{activeTab === 'driver-ride-location' ? 'Ride Location Management' :
                activeTab === 'ride-bills' ? 'Ride Bills' :
                activeTab === 'settings' ? 'System Settings' :
                'Dashboard'}</h1>
          <div className="header-actions">
            <div className="quick-stats">
              <span className="stat-item">
                <strong>{stats.totalUsers}</strong> Total Users
              </span>
            </div>
          </div>
        </div>
        )}

        <div className="admin-content">
          {activeTab === 'overview' && (
            <DashboardOverview users={users} onToggleSidebar={handleToggleSidebar} />
          )}

          {activeTab === 'users' && (
            <UserManagement
              users={users}
              error={error}
              sidebarCollapsed={sidebarCollapsed}
              onToggleMenu={toggleMenu}
              onViewUser={handleViewUserClick}
              onEditUser={handleEditUserClick}
              onToggleStatus={handleToggleStatusClick}
              onDeleteUser={handleDeleteUserClick}
              onShowCreateUser={() => setShowCreateUser(true)}
              onToggleSidebar={handleToggleSidebar}
              activeMenuId={activeMenuId}
              menuPosition={menuPosition}
            />
          )}

          {activeTab === 'driver' && (
            <DriverDashboard 
              users={users} 
              token={token}
              onToggleSidebar={handleToggleSidebar}
            />
          )}

          {activeTab === 'ride-bills' && (
            <RideBillsDashboard token={token} onToggleSidebar={handleToggleSidebar} />
          )}

          {activeTab === 'settings' && (
            <Settings users={users} onToggleSidebar={handleToggleSidebar} showNotification={showNotification} />
          )}

        </div>
      </div>

      {/* Modals */}
      <CreateUserModal
        show={showCreateUser}
        createUserData={createUserData}
        selectedFiles={selectedFiles}
        onClose={() => setShowCreateUser(false)}
        onSubmit={handleCreateUser}
        onInputChange={handleInputChange}
        onFileChange={handleFileChange}
        onPhoneChange={handlePhoneChange}
        onHostelChange={handleHostelChange}
        onEmergencyChange={handleEmergencyChange}
        onRoleChange={handleRoleChange}
        resetFormForRole={resetFormForRole}
      />

      <EditUserModal
        show={showEditUser}
        editingUser={editingUser}
        createUserData={createUserData}
        onClose={() => setShowEditUser(false)}
        onSubmit={handleUpdateUser}
        onInputChange={handleInputChange}
        onPhoneChange={handlePhoneChange}
        onHostelChange={handleHostelChange}
        onEmergencyChange={handleEmergencyChange}
        onRoleChange={handleRoleChange}
        resetFormForRole={resetFormForRole}
      />

      <UserDetailsModal
        show={showUserDetails}
        viewingUser={viewingUser}
        onClose={() => {
          setShowUserDetails(false);
          setViewingUser(null);
        }}
      />

      {/* Notification Container */}
      <NotificationContainer
        notifications={notifications}
        onRemoveNotification={() => {}}
      />
    </div>
  );
};

export default AdminDashboard;
