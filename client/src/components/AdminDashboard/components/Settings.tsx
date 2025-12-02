import React, { useState, useCallback, memo } from 'react';
import type { User } from '../types';

interface SettingsProps {
  users: User[];
  onToggleSidebar?: () => void;
  showNotification?: (type: 'success' | 'error', message: string) => void;
}

// Toggle Switch Component
const ToggleSwitch = memo(({ checked, onChange, label }: { 
  checked: boolean; 
  onChange: () => void; 
  label: string 
}) => (
  <label className="st-toggle" aria-label={label}>
    <input type="checkbox" checked={checked} onChange={onChange} />
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
  lastBackup: string | null;
  nextBackup: string | null;
}

const Settings: React.FC<SettingsProps> = ({ users, onToggleSidebar, showNotification }) => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    system: true
  });
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    enabled: true,
    interval: 24,
    maxBackups: 30,
    lastBackup: null,
    nextBackup: null,
  });
  const [backupHistory, setBackupHistory] = useState<any[]>([]);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  const handleNotificationToggle = useCallback((key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

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
                { label: 'Encryption', value: 'bcrypt' },
                { label: '2FA', value: twoFactorAuth ? 'Enabled' : 'Disabled', status: twoFactorAuth ? 'online' : 'offline' }
              ]}
            />
            <InfoCard 
              icon="🚀" 
              title="Application"
              items={[
                { label: 'Environment', value: 'Development' },
                { label: 'Version', value: '1.0.0' },
                { label: 'Build', value: '2024.01' }
              ]}
            />
            <InfoCard 
              icon="🔌" 
              title="API"
              items={[
                { label: 'Status', value: 'Connected', status: 'online' },
                { label: 'Endpoint', value: 'REST API' }
              ]}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="st-section">
          <div className="section-title">
            <span className="title-icon">🔔</span>
            <h3>Notifications</h3>
          </div>
          <div className="st-card">
            <SettingItem icon="📧" label="Email Notifications" description="Receive updates via email">
              <ToggleSwitch 
                  checked={notifications.email}
                  onChange={() => handleNotificationToggle('email')}
                label="Email notifications"
              />
            </SettingItem>
            <SettingItem icon="🔔" label="Push Notifications" description="Browser push alerts">
              <ToggleSwitch 
                  checked={notifications.push}
                  onChange={() => handleNotificationToggle('push')}
                label="Push notifications"
              />
            </SettingItem>
            <SettingItem icon="📱" label="SMS Notifications" description="Receive SMS alerts">
              <ToggleSwitch 
                  checked={notifications.sms}
                  onChange={() => handleNotificationToggle('sms')}
                label="SMS notifications"
              />
            </SettingItem>
            <SettingItem icon="💬" label="System Messages" description="In-app notifications">
              <ToggleSwitch 
                  checked={notifications.system}
                  onChange={() => handleNotificationToggle('system')}
                label="System notifications"
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
            <SettingItem icon="🔐" label="Two-Factor Authentication" description="Extra layer of security">
              <ToggleSwitch 
                  checked={twoFactorAuth}
                  onChange={() => setTwoFactorAuth(!twoFactorAuth)}
                label="Two-factor auth"
              />
            </SettingItem>
            <SettingItem icon="💾" label="Auto Backup" description="Daily automatic backups">
              <ToggleSwitch 
                  checked={autoBackup}
                  onChange={() => setAutoBackup(!autoBackup)}
                label="Auto backup"
                />
            </SettingItem>
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
                <span className="btn-icon">📥</span>
                <div className="btn-text">
                  <span className="btn-title">Export Data</span>
                  <span className="btn-desc">Download all data</span>
                </div>
              </button>
              <button className="data-btn danger" onClick={handleClearCache}>
                <span className="btn-icon">🗑️</span>
                <div className="btn-text">
                  <span className="btn-title">Clear Cache</span>
                  <span className="btn-desc">Remove temporary data</span>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default memo(Settings);
