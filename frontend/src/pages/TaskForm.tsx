import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { http } from '../api/http';
import { useAuth } from '../hooks/useAuth';
import styles from './TaskForm.module.css';

const taskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  dueDate: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
  assignedToId: z.string().uuid(),
});

type TaskFormData = {
  title: string;
  description: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  assignedToId: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

export function TaskForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const form = useForm<TaskFormData>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await http.get<{ users: User[] }>('/auth/users');
        setUsers(data.users);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const onSubmit = async (values: TaskFormData) => {
    setError('');
    const parsed = taskSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);
      const dueDateTime = new Date(values.dueDate).toISOString();
      await http.post('/tasks', {
        ...values,
        dueDate: dueDateTime,
        creatorId: user!.id,
      });
      form.reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Create New Task</h2>
      <form className={styles.formContent} onSubmit={form.handleSubmit(onSubmit)}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Title (max 100 chars)</label>
          <input
            className={styles.input}
            placeholder="Task title"
            maxLength={100}
            {...form.register('title')}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            placeholder="Task description"
            {...form.register('description')}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Due Date</label>
          <input
            type="datetime-local"
            className={styles.input}
            {...form.register('dueDate')}
          />
        </div>

        <div className={styles.gridTwoCols}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Priority</label>
            <select className={styles.select} {...form.register('priority')}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Status</label>
            <select className={styles.select} {...form.register('status')}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Assign To</label>
          {loadingUsers ? (
            <select className={`${styles.select} ${styles.loadingSelect}`} disabled>
              <option>Loading users...</option>
            </select>
          ) : (
            <select
              className={styles.select}
              {...form.register('assignedToId')}
            >
              <option value="">Select a user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          )}
          <p className={styles.helperText}>
            Select a registered user to assign this task to.
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttonContainer}>
          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
