import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationsContext';
import { http } from '../api/http';
import styles from './Navbar.module.css';

type NavbarProps = {
  onCreateTaskClick?: () => void;
  onProfileClick?: () => void;
};

export function Navbar({ onCreateTaskClick, onProfileClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { notifications, removeNotification } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (notifId: string) => {
    try {
      await http.put(`/notifications/${notifId}/read`);
      removeNotification(notifId);
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          {/* Logo/Brand */}
          <div className={styles.brand}>AbleSpace</div>

          {/* Center section - Create Task (desktop only) */}
          <div className={styles.centerSection}>
            <button
              onClick={onCreateTaskClick}
              className={styles.createTaskButton}
            >
              + Create Task
            </button>
          </div>

          {/* Right section - Notifications, Profile, Logout */}
          <div className={styles.rightSection}>
            {/* Notifications Dropdown */}
            <div className={styles.notificationContainer} ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={styles.notificationButton}
                title="Notifications"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {notifications.length > 0 && (
                  <span className={styles.notificationBadge}>
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Popup */}
              {showNotifications && (
                <div className={styles.notificationPopup}>
                  <div className={styles.notificationHeader}>Notifications</div>
                  {notifications.length === 0 ? (
                    <div className={styles.emptyNotifications}>
                      No notifications
                    </div>
                  ) : (
                    <div className={styles.notificationList}>
                      {notifications.map((n) => (
                        <div key={n.id} className={styles.notificationItem}>
                          <div className={styles.notificationMessage}>{n.message}</div>
                          <div className={styles.notificationMeta}>
                            <span className={styles.notificationTime}>
                              {n.createdAt.toLocaleTimeString()}
                            </span>
                            <button
                              onClick={() => handleMarkRead(n.id)}
                              className={styles.dismissButton}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User greeting (desktop) */}
            <div className={styles.userGreeting}>
              {user && `Hi, ${user.name}`}
            </div>

            {/* Profile button */}
            <button
              onClick={onProfileClick}
              className={styles.navButton}
              title="Profile"
            >
              Profile
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              className={styles.navButton}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Create Task Button - shown below navbar on mobile */}
        <button
          onClick={onCreateTaskClick}
          className={styles.mobileCreateTaskButton}
        >
          + Create Task
        </button>
      </nav>
    </>
  );
}
