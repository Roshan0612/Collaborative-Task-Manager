import { useState } from 'react';
import { http } from '../api/http';
import { useAuth } from '../hooks/useAuth';
import styles from './TaskItem.module.css';

type TaskItemProps = {
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    assignedToId: string;
    creatorId: string;
    dueDate?: string;
  };
  onStatusChange?: () => void;
  showFullDetails?: boolean;
};

export function TaskItem({ task, onStatusChange, showFullDetails = false }: TaskItemProps) {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  
  const isAssignedUser = user?.id === task.assignedToId;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === task.status) return;
    
    try {
      setIsUpdating(true);
      setError('');
      await http.put(`/tasks/${task.id}`, { status: newStatus });
      onStatusChange?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.taskItem}>
      <div className={styles.container}>
        <div className={styles.contentSection}>
          <div className={styles.title}>{task.title}</div>
          {showFullDetails && task.description && (
            <div className={styles.description}>{task.description}</div>
          )}
          {showFullDetails && task.dueDate && (
            <div className={styles.dueDate}>
              Due: {new Date(task.dueDate).toLocaleString()}
            </div>
          )}
        </div>
        
        <div className={styles.actionsSection}>
          {isAssignedUser && (
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
              className={`${styles.statusSelect} ${styles[`status${task.status.split('_').map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('')}`]}`}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          )}
          
          {!isAssignedUser && (
            <span className={`${styles.statusBadge} ${styles[`status${task.status.split('_').map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('')}`]}`}>
              {task.status}
            </span>
          )}
          
          <span className={`${styles.priorityBadge} ${styles[`priority${task.priority}`]}`}>
            {task.priority}
          </span>
        </div>
      </div>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      {isAssignedUser && (
        <div className={styles.assignedMessage}>You are assigned to this task</div>
      )}
    </div>
  );
}
