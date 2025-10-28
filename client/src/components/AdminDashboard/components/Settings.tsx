import React from 'react';
import type { User } from '../types';

interface SettingsProps {
  users: User[];
}

const Settings: React.FC<SettingsProps> = ({ users }) => {
  return (
    <div className="settings-tab">
      <h3>System Settings</h3>
      <div className="settings-grid">
        <div className="setting-card">
          <h4>Database</h4>
          <p>MongoDB Connection Status: <span className="status-online">Online</span></p>
          <p>Total Records: {users.length}</p>
        </div>
        <div className="setting-card">
          <h4>Security</h4>
          <p>JWT Token Expiry: 1 day</p>
          <p>Password Hashing: bcrypt</p>
        </div>
        <div className="setting-card">
          <h4>Application</h4>
          <p>Environment: Development</p>
          <p>Version: 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
