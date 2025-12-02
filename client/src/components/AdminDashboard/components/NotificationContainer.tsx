import React, { useCallback, memo, useEffect, useState } from 'react';
import type { Notification } from '../types';

interface NotificationContainerProps {
  notifications: Notification[];
  onRemoveNotification: (id: string) => void;
}

// Icon configuration
const NOTIFICATION_CONFIG = {
  success: { icon: '✓', label: 'Success' },
  error: { icon: '✕', label: 'Error' },
  warning: { icon: '⚠', label: 'Warning' },
  info: { icon: 'ℹ', label: 'Info' },
} as const;

// Single Notification Component
const NotificationItem = memo(({ 
  notification, 
  onRemove 
}: { 
  notification: Notification; 
  onRemove: () => void;
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.info;

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress(100 - (elapsed / duration) * 100);
      
      if (elapsed >= duration) {
        clearInterval(timer);
        handleClose();
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onRemove, 300);
  }, [onRemove]);

  return (
    <div className={`nc-notification ${notification.type} ${isExiting ? 'exiting' : ''}`}>
      <div className="notification-icon-wrapper">
        <span className="notification-icon">{config.icon}</span>
      </div>
      <div className="notification-body">
        <span className="notification-title">{config.label}</span>
        <span className="notification-message">{notification.message}</span>
      </div>
      <button 
        className="notification-close"
        onClick={handleClose}
        aria-label="Dismiss notification"
      >
        ×
      </button>
      <div className="notification-progress">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
});

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onRemoveNotification
}) => {
  const handleRemove = useCallback((id: string) => {
    onRemoveNotification(id);
  }, [onRemoveNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="nc-container" role="alert" aria-live="polite">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id} 
          notification={notification}
          onRemove={() => handleRemove(notification.id)}
        />
      ))}
    </div>
  );
};

export default memo(NotificationContainer);
