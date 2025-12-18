import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { http } from '../api/http';
import { useAuth } from '../hooks/useAuth';

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

export function TaskForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const form = useForm<TaskFormData>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="border rounded p-6 bg-white">
      <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm font-medium mb-1">Title (max 100 chars)</label>
          <input
            className="w-full border p-2 rounded"
            placeholder="Task title"
            maxLength={100}
            {...form.register('title')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Task description"
            rows={3}
            {...form.register('description')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="datetime-local"
            className="w-full border p-2 rounded"
            {...form.register('dueDate')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select className="w-full border p-2 rounded" {...form.register('priority')}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select className="w-full border p-2 rounded" {...form.register('status')}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Assign To</label>
          <input
            className="w-full border p-2 rounded"
            placeholder="User ID (UUID)"
            {...form.register('assignedToId')}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the user ID to assign this task. You can find user IDs in Prisma Studio.
          </p>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}
