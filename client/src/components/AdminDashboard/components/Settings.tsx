import React, { useState, useCallback, memo, useEffect } from 'react';
import type { User } from '../types';

interface SettingsProps {
  users: User[];
  onToggleSidebar?: () => void;
  showNotification?: (type: 'success' | 'error', message: string) => void;
}

// Toggle Switch Component
const ToggleSwitch = memo(({ checked, onChange, label, disabled }: {
  checked: boolean;
  onChange: (checked: boolean) => void | Promise<void>;
  label: string;
  disabled?: boolean;
}) => (
  <label className="st-toggle" aria-label={label}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
    <span className="toggle-track">
      <span className="toggle-thumb"></span>
    </span>
  </label>
));

// Info Card Component
const InfoCard = memo(({ icon, title, items }: { 
  icon: string; 
  title: string; 
  items: { label: string; value: string | number; status?: 'online' | 'offline' }[] 
}) => (
  <div className="st-info-card">
    <div className="info-card-header">
      <span className="card-icon">{icon}</span>
      <h4>{title}</h4>
    </div>
    <div className="info-card-body">
      {items.map((item, i) => (
        <div key={i} className="info-row">
          <span className="info-label">{item.label}</span>
          {item.status ? (
            <span className={`status-badge ${item.status}`}>{item.value}</span>
          ) : (
            <span className="info-value">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  </div>
));

// Setting Item Component
const SettingItem = memo(({ icon, label, description, children }: {
  icon?: string;
  label: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="st-setting-item">
    <div className="setting-content">
      {icon && <span className="setting-icon">{icon}</span>}
      <div className="setting-text">
        <span className="setting-label">{label}</span>
        <span className="setting-desc">{description}</span>
      </div>
    </div>
    <div className="setting-action">
      {children}
    </div>
  </div>
));

interface BackupSettings {
  enabled: boolean;
  interval: number;
  maxBackups: number;
  emailNotifications: boolean;
  lastBackup: string | null;
  nextBackup: string | null;
  totalBackups?: number;
}

// Helper functions
const getDeviceType = (userAgent?: string): string => {
  if (!userAgent) return 'Unknown';

  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS Device';
  if (ua.includes('android')) return 'Android Device';
  if (ua.includes('windows')) return 'Windows PC';
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'Mac Computer';
  if (ua.includes('linux')) return 'Linux Device';

  // Try to extract browser info as fallback
  if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome Browser';
  if (ua.includes('firefox')) return 'Firefox Browser';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari Browser';
  if (ua.includes('edge') || ua.includes('edg')) return 'Edge Browser';

  return 'Web Browser';
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return `${Math.floor(diffInSeconds / 604800)}w ago`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const Settings: React.FC<SettingsProps> = ({ users, onToggleSidebar, showNotification }) => {
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    enabled: true,
    interval: 24,
    maxBackups: 30,
    emailNotifications: true,
    lastBackup: null,
    nextBackup: null,
  });
  const [backupHistory, setBackupHistory] = useState<any[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [deletingBackup, setDeletingBackup] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [importingData, setImportingData] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [devices, setDevices] = useState<any[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [appInfo, setAppInfo] = useState<{
    environment: string;
    version: string;
    build: string;
  }>({
    environment: 'LOADING...',
    version: 'LOADING...',
    build: 'LOADING...'
  });

  const handleEmailNotificationToggle = useCallback(() => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    showNotification?.('success', `Email notifications ${newValue ? 'enabled' : 'disabled'} locally`);
  }, [emailNotifications, showNotification]);


  // Fetch backup settings and history on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsResponse, historyResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/data-management/backup/settings`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/data-management/backup/history`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);

        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          setBackupSettings(settings);
        }

        if (historyResponse.ok) {
          const history = await historyResponse.json();
          setBackupHistory(history.backups || []);
        }
      } catch (error) {
        console.error('Failed to fetch backup data:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch app info and email notification preferences
  useEffect(() => {
    const fetchAppInfo = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/app/info`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const info = await response.json();
          setAppInfo({
            environment: info.environment || 'development',
            version: info.version || '1.0.0',
            build: info.build || '2024.01'
          });
        } else {
          // Fallback to default values if API fails
          setAppInfo({
            environment: 'development',
            version: '1.0.0',
            build: '2024.01'
          });
        }
      } catch (error) {
        // Fallback to default values if fetch fails
        setAppInfo({
          environment: 'development',
          version: '1.0.0',
          build: '2024.01'
        });
      }
    };

    const fetchDevices = async () => {
      setDevicesLoading(true);
      try {
        console.log('Fetching devices...');
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/devices`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Device API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Device data received:', data);
          setDevices(data.devices || []);
        } else {
          console.error('Device API failed:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response:', errorText);
          // Set empty array on error
          setDevices([]);
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        setDevices([]);
      } finally {
        setDevicesLoading(false);
      }
    };

    fetchAppInfo();
    fetchDevices();
    // Email notifications are now just UI toggle, no server persistence
  }, []);

  const handleBackupToggle = useCallback(async (enabled: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data-management/backup/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled,
          interval: backupSettings.interval,
          maxBackups: backupSettings.maxBackups,
          emailNotifications: backupSettings.emailNotifications,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setBackupSettings(result.settings);
        showNotification?.('success', `Auto backup ${enabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        showNotification?.('error', 'Failed to update backup settings');
      }
    } catch (error) {
      showNotification?.('error', 'Failed to update backup settings');
    }
  }, [backupSettings.interval, backupSettings.maxBackups, backupSettings.emailNotifications, showNotification]);

  const handleBackupEmailToggle = useCallback(async (emailNotifications: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data-management/backup/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: backupSettings.enabled,
          interval: backupSettings.interval,
          maxBackups: backupSettings.maxBackups,
          emailNotifications,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setBackupSettings(result.settings);
        showNotification?.('success', `Backup email notifications ${emailNotifications ? 'enabled' : 'disabled'} successfully`);
      } else {
        showNotification?.('error', 'Failed to update backup email settings');
      }
    } catch (error) {
      showNotification?.('error', 'Failed to update backup email settings');
    }
  }, [backupSettings.enabled, backupSettings.interval, backupSettings.maxBackups, showNotification]);

  const refreshBackupData = useCallback(async () => {
    try {
      const [settingsResponse, historyResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/data-management/backup/settings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/data-management/backup/history`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        setBackupSettings(settings);
      }

      if (historyResponse.ok) {
        const history = await historyResponse.json();
        setBackupHistory(history.backups || []);
      }
    } catch (error) {
      console.error('Failed to refresh backup data:', error);
    }
  }, []);

  const handleManualBackup = useCallback(async () => {
    setBackupLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data-management/backup/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        showNotification?.('success', `Manual backup completed! ${result.backup.stats.total} records backed up`);

        // Refresh backup data
        await refreshBackupData();
      } else {
        showNotification?.('error', 'Manual backup failed');
      }
    } catch (error) {
      showNotification?.('error', 'Manual backup failed');
    } finally {
      setBackupLoading(false);
    }
  }, [showNotification, refreshBackupData]);

  const handleDeleteBackup = useCallback(async (filename: string) => {
    const confirmed = window.confirm(
      `🗑️ Delete Backup\n\n` +
      `Are you sure you want to delete "${filename}"?\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingBackup(filename);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data-management/backup/history/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        showNotification?.('success', `Backup "${filename}" deleted successfully`);

        // Refresh backup data
        await refreshBackupData();
      } else {
        const error = await response.json().catch(() => ({}));
        showNotification?.('error', `Failed to delete backup: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      showNotification?.('error', 'Failed to delete backup');
    } finally {
      setDeletingBackup(null);
    }
  }, [showNotification, refreshBackupData]);

  const handleClearAllBackups = useCallback(async () => {
    const confirmed = window.confirm(
      `🗑️ Clear All Backups\n\n` +
      `Are you sure you want to delete ALL ${backupHistory.length} backup files?\n\n` +
      `This action cannot be undone and will permanently remove all backup history.`
    );

    if (!confirmed) return;

    setClearingAll(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data-management/backup/history`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        showNotification?.('success', `All backups cleared! ${result.deletedCount} files removed`);

        // Refresh backup data
        await refreshBackupData();
      } else {
        const error = await response.json().catch(() => ({}));
        showNotification?.('error', `Failed to clear backups: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      showNotification?.('error', 'Failed to clear backups');
    } finally {
      setClearingAll(false);
    }
  }, [backupHistory.length, showNotification, refreshBackupData]);



  const handleImportData = useCallback(async (file: File) => {
    if (!file) {
      showNotification?.('error', 'Please select a file to import');
      return;
    }

    // Validate file type
    if (!file.name.endsWith('.json')) {
      showNotification?.('error', 'Only JSON files are allowed for import');
      return;
    }

    // Confirm import
    const confirmed = window.confirm(
      `📥 Import Data\n\n` +
      `File: ${file.name}\n` +
      `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\n` +
      `This will import users, ride locations, and bills from the selected backup file.\n` +
      `Existing records with matching identifiers will be skipped.\n\n` +
      `Are you sure you want to continue?`
    );

    if (!confirmed) return;

    setImportingData(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data-management/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        showNotification?.('success', result.message);

        // Refresh data to show imported records
        // Note: This might require refreshing user data, but for now we'll just show success
      } else {
        showNotification?.('error', `Import failed: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      showNotification?.('error', 'Import failed: Network connection error');
    } finally {
      setImportingData(false);
    }
  }, [showNotification]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImportData(file);
      // Clear the input
      event.target.value = '';
    }
  }, [handleImportData]);

  const handleExportData = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data-management/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Get the JSON data as text first
        const responseText = await response.text();
        const data = JSON.parse(responseText);

        // Create blob from the JSON string for download
        const blob = new Blob([responseText], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const fileSize = (blob.size / 1024 / 1024).toFixed(2); // Size in MB

        const a = document.createElement('a');
        a.href = url;
        a.download = `iitd-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showNotification?.('success', `Data exported successfully! ${data.stats.users} users, ${data.stats.rideLocations} routes, ${data.stats.rideBills} bills (${fileSize} MB)`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showNotification?.('error', `Export failed: ${errorData.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      showNotification?.('error', 'Export failed: Network connection error');
    }
  }, [showNotification]);

  const handleBackupNow = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data-management/backup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        const totalRecords = result.stats.users + result.stats.rideLocations + result.stats.rideBills;
        showNotification?.('success', `Backup created! ${totalRecords} records backed up (${result.filename})`);
      } else {
        showNotification?.('error', `Backup failed: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      showNotification?.('error', 'Backup failed: Network connection error');
    }
  }, [showNotification]);

  const handleClearCache = useCallback(async () => {
    const confirmed = window.confirm(
      '🗑️ Clear System Cache\n\n' +
      'This will remove:\n' +
      '• Temporary files\n' +
      '• Cached data\n' +
      '• Session files\n\n' +
      'This action cannot be undone.\n\n' +
      'Are you sure you want to continue?'
    );

    if (confirmed) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data-management/cache`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const result = await response.json();

        if (response.ok) {
          const cleanedCount = result.details ? result.details.length : 0;
          showNotification?.('success', `Cache cleared successfully! ${cleanedCount} cache items removed.`);
        } else {
          showNotification?.('error', `Cache clearing failed: ${result.error || 'Unknown error occurred'}`);
        }
      } catch (error) {
        showNotification?.('error', 'Cache clearing failed: Network connection error');
      }
    }
  }, [showNotification]);

  return (
    <div className="settings-page">
      {/* Banner */}
      <div className="st-banner">
        <div className="banner-header">
          {onToggleSidebar && (
            <button className="mobile-menu-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
              ☰
            </button>
          )}
          <div className="header-icon">⚙️</div>
          <div className="header-text">
            <h2>System Settings</h2>
            <p>Configure your system preferences and security</p>
          </div>
        </div>
      </div>

      <div className="st-content">
        {/* System Info Cards */}
        <div className="st-section">
          <div className="section-title">
            <span className="title-icon">📊</span>
            <h3>System Information</h3>
          </div>
          <div className="st-info-grid">
            <InfoCard 
              icon="🗄️" 
              title="Database"
              items={[
                { label: 'Status', value: 'Online', status: 'online' },
                { label: 'Type', value: 'MongoDB' },
                { label: 'Records', value: users.length }
              ]}
            />
            <InfoCard
              icon="🔒"
              title="Security"
              items={[
                { label: 'JWT Expiry', value: '1 day' },
                { label: 'Encryption', value: 'bcrypt' }
              ]}
            />
            <InfoCard
              icon="🚀"
              title="Application"
              items={[
                { label: 'Environment', value: appInfo.environment },
                { label: 'Version', value: appInfo.version },
                { label: 'Build', value: '2024.01' }
              ]}
            />
            <InfoCard
              icon="📱"
              title="Devices"
              items={[
                { label: 'Active Devices', value: devicesLoading ? 'Loading...' : (devices?.length?.toString() || '0') },
                { label: 'Current Device', value: devicesLoading ? 'Loading...' : (getDeviceType(devices?.find(d => d.current)?.userAgent) || 'Unknown') },
                { label: 'Status', value: devicesLoading ? 'Loading...' : (devices?.length > 0 ? 'Active' : 'No devices') }
              ]}
            />
          </div>
        </div>

        {/* Email Notifications */}
        <div className="st-section">
          <div className="section-title">
            <span className="title-icon">📧</span>
            <h3>Email Notifications</h3>
          </div>
          <div className="st-card">
            <SettingItem icon="📧" label="Email Notifications" description="Receive updates via email">
              <ToggleSwitch
                  checked={emailNotifications}
                  onChange={handleEmailNotificationToggle}
                label="Email notifications"
              />
            </SettingItem>
          </div>
        </div>

        {/* Security */}
        <div className="st-section">
          <div className="section-title">
            <span className="title-icon">🛡️</span>
            <h3>Security & Backup</h3>
          </div>
          <div className="st-card">
            <SettingItem icon="💾" label="Auto Backup" description={`Automatic backups every ${backupSettings.interval} hours`}>
              <ToggleSwitch
                  checked={backupSettings.enabled}
                  onChange={async (checked: boolean) => {
                    await handleBackupToggle(checked);
                  }}
                label="Auto backup"
                />
            </SettingItem>
            <SettingItem icon="📧" label="Backup Email Notifications" description="Send email notifications when backups complete">
              <ToggleSwitch
                  checked={backupSettings.emailNotifications}
                  onChange={async (checked: boolean) => {
                    await handleBackupEmailToggle(checked);
                  }}
                label="Backup email notifications"
                />
            </SettingItem>

            {/* Backup Status */}
            <div className="backup-status">
              <div className="backup-info-row">
                <span className="backup-label">Status:</span>
                <span className={`backup-value status-${backupSettings.enabled ? 'enabled' : 'disabled'}`}>
                  {backupSettings.enabled ? '🟢 Enabled' : '🔴 Disabled'}
                </span>
              </div>
              <div className="backup-info-row">
                <span className="backup-label">Last Backup:</span>
                <span className="backup-value">
                  {backupSettings.lastBackup ? (
                    <span>
                      {new Date(backupSettings.lastBackup).toLocaleDateString()} at{' '}
                      {new Date(backupSettings.lastBackup).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  ) : (
                    <span className="no-backup">Never</span>
                  )}
                </span>
              </div>
              <div className="backup-info-row">
                <span className="backup-label">Next Scheduled:</span>
                <span className="backup-value">
                  {backupSettings.enabled && backupSettings.nextBackup ? (
                    <span>
                      {new Date(backupSettings.nextBackup).toLocaleDateString()} at{' '}
                      {new Date(backupSettings.nextBackup).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  ) : (
                    <span className="no-backup">Not scheduled</span>
                  )}
                </span>
              </div>
              <div className="backup-info-row">
                <span className="backup-label">Total Backups:</span>
                <span className="backup-value">{backupSettings.totalBackups || backupHistory.length}</span>
              </div>
              <div className="backup-info-row">
                <span className="backup-label">Frequency:</span>
                <span className="backup-value">Every {backupSettings.interval} hours</span>
              </div>
            </div>

            {/* Manual Backup Section */}
            <div className="manual-backup-section">
              <div className="backup-actions">
                <button
                  className={`manual-backup-btn ${backupLoading ? 'loading' : ''}`}
                  onClick={handleManualBackup}
                  disabled={backupLoading}
                >
                  {backupLoading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Creating Backup...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">💾</span>
                      <span className="btn-text">Run Manual Backup</span>
                    </>
                  )}
                </button>
                <button
                  className="refresh-backup-btn"
                  onClick={refreshBackupData}
                  title="Refresh backup status"
                >
                  <span className="btn-icon">🔄</span>
                  <span className="btn-text">Refresh</span>
                </button>
              </div>
            </div>

            {/* Backup History */}
            <div className="recent-backups">
              <div className="backup-history-header">
                <h4>Backup History</h4>
                <div className="backup-header-actions">
                  <span className="backup-count">
                    {backupHistory.length > 0 ? `${backupHistory.length} backup${backupHistory.length !== 1 ? 's' : ''}` : 'No backups yet'}
                  </span>
                  {backupHistory.length > 0 && (
                    <button
                      className={`clear-all-btn ${clearingAll ? 'loading' : ''}`}
                      onClick={handleClearAllBackups}
                      disabled={clearingAll}
                      title="Clear all backups"
                    >
                      {clearingAll ? (
                        <>
                          <span className="btn-spinner-small"></span>
                          Clearing...
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">🗑️</span>
                          Clear All
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {backupHistory.length > 0 ? (
                <div className="backup-list">
                  {backupHistory.slice(0, 5).map((backup, index) => {
                    const backupDate = new Date(backup.createdAt);
                    const timeAgo = getTimeAgo(backupDate);
                    const fileSize = backup.size ? formatFileSize(backup.size) : 'Unknown';

                    return (
                      <div key={index} className="backup-item">
                        <div className="backup-item-main">
                          <div className="backup-icon">💾</div>
                          <div className="backup-info">
                            <div className="backup-filename">{backup.filename}</div>
                            <div className="backup-meta">
                              <span className="backup-date">{backupDate.toLocaleDateString()}</span>
                              <span className="backup-time">{backupDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                              <span className="backup-ago">({timeAgo})</span>
                            </div>
                          </div>
                        </div>
                        <div className="backup-details">
                          <div className="backup-stats">
                            <div className="stat-item">
                              <span className="stat-label">👥 Users:</span>
                              <span className="stat-value">{backup.collections.users}</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">📍 Routes:</span>
                              <span className="stat-value">{backup.collections.rideLocations}</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">🧾 Bills:</span>
                              <span className="stat-value">{backup.collections.rideBills}</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">📊 Size:</span>
                              <span className="stat-value">{fileSize}</span>
                            </div>
                          </div>
                          <div className="backup-actions">
                            <button
                              className={`delete-backup-btn ${deletingBackup === backup.filename ? 'loading' : ''}`}
                              onClick={() => handleDeleteBackup(backup.filename)}
                              disabled={deletingBackup === backup.filename}
                              title={`Delete backup ${backup.filename}`}
                            >
                              {deletingBackup === backup.filename ? (
                                <span className="btn-spinner-small"></span>
                              ) : (
                                <span className="btn-icon">🗑️</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-backups">
                  <div className="no-backups-icon">📭</div>
                  <p>No backup history available</p>
                  <span>Run your first backup to get started</span>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Data Actions */}
        <div className="st-section">
          <div className="section-title">
            <span className="title-icon">💾</span>
            <h3>Data Management</h3>
          </div>
          <div className="st-card">
            <div className="data-actions">
              <button className="data-btn backup" onClick={handleBackupNow}>
                <span className="btn-icon">💾</span>
                <div className="btn-text">
                  <span className="btn-title">Backup Now</span>
                  <span className="btn-desc">Create manual backup</span>
                </div>
              </button>
              <button className="data-btn export" onClick={handleExportData}>
                <span className="btn-icon">📤</span>
                <div className="btn-text">
                  <span className="btn-title">Export Data</span>
                  <span className="btn-desc">Download all data</span>
                </div>
              </button>
              <label className="data-btn import">
                <span className="btn-icon">📥</span>
                <div className="btn-text">
                  <span className="btn-title">Import Data</span>
                  <span className="btn-desc">Upload backup file</span>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  disabled={importingData}
                />
              </label>
              <button className="data-btn danger" onClick={handleClearCache}>
                <span className="btn-icon">🗑️</span>
                <div className="btn-text">
                  <span className="btn-title">Clear Cache</span>
                  <span className="btn-desc">Remove temporary data</span>
                </div>
              </button>
            </div>

            {/* Import Progress */}
            {importingData && (
              <div className="import-progress">
                <div className="progress-indicator">
                  <span className="progress-spinner"></span>
                  <span className="progress-text">Importing data... Please wait.</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default memo(Settings);

