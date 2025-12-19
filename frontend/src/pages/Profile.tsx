import { useAuth } from '../hooks/useAuth';
import { http } from '../api/http';
import { useState } from 'react';
import styles from './Profile.module.css';

interface ProfileProps {
  onBack?: () => void;
}

export function Profile({ onBack }: ProfileProps) {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) return <div className="p-8">Please login.</div>;

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty' });
      return;
    }
    
    try {
      setIsSaving(true);
      setMessage(null);
      await http.put('/auth/profile', { name });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setIsEditing(false);
    setMessage(null);
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Profile</h1>
          <div className={styles.headerButtons}>
            {onBack && (
              <button 
                className={styles.backBtn}
                onClick={onBack}
              >
                ← Back
              </button>
            )}
            <button 
              className={styles.logoutBtn}
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className={styles.profileContent}>
          <div className={styles.infoSection}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className={styles.inputDisabled}
            />
          </div>

          <div className={styles.infoSection}>
            <label className={styles.label}>Name</label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="Enter your name"
              />
            ) : (
              <div className={styles.displayValue}>{name}</div>
            )}
          </div>

          <div className={styles.infoSection}>
            <label className={styles.label}>User ID</label>
            <div className={styles.displayValue}>{user.id}</div>
          </div>

          <div className={styles.buttonGroup}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={styles.saveBtn}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className={styles.editBtn}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
