import { TaskRepository } from '../repositories/task.repository';
import { z } from 'zod';
// import io dynamically inside methods to avoid circular import at module load
import { NotificationService } from './notification.service';

const tasks = new TaskRepository();
const notifications = new NotificationService();

type Status = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

const PriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
const StatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']);

export const CreateTaskDto = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  dueDate: z.string().datetime(),
  priority: PriorityEnum,
  status: StatusEnum,
  creatorId: z.string().uuid(),
  assignedToId: z.string().uuid(),
});

export const UpdateTaskDto = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  dueDate: z.string().datetime().optional(),
  priority: PriorityEnum.optional(),
  status: StatusEnum.optional(),
  assignedToId: z.string().uuid().optional(),
});

export class TaskService {
  /**
   * Create a new task and broadcast to all connected clients.
   * @param payload - Validated task creation data
   * @returns Created task with all properties
   * @emits task:created - Notifies all clients of the new task
   */
  async create(payload: z.infer<typeof CreateTaskDto>) {
    const data = { ...payload, dueDate: new Date(payload.dueDate) };
    const task = await tasks.create(data);
    try {
      const { io } = await import('../index');
      io.emit('task:created', task);
    } catch (e) {
      console.error('Socket emit failed', e);
    }
    // if created with an assignee, persist a notification for them
    if (task.assignedToId) {
      try {
        await notifications.createForUser(task.assignedToId, `You were assigned task ${task.title}`);
      } catch (e) {
        console.error('Failed to create notification for assignee', e);
      }
    }
    return task;
  }

  /**
   * Update an existing task and broadcast changes.
   * @param id - Task UUID to update
   * @param payload - Partial update data
   * @returns Updated task
   * @emits task:updated - Notifies all clients of the update
   * @emits task:assigned - Emitted when assignedToId changes
   */
  async update(id: string, payload: z.infer<typeof UpdateTaskDto>) {
    const data = { ...payload, dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined };
    const before = await tasks.findById(id);
    const task = await tasks.update(id, data);
    try {
      const { io } = await import('../index');
      io.emit('task:updated', task);
    } catch (e) {
      console.error('Socket emit failed', e);
    }
    if (payload.assignedToId && before?.assignedToId !== payload.assignedToId) {
      try {
        const { io } = await import('../index');
        io.emit('task:assigned', { taskId: id, assignedToId: payload.assignedToId });
      } catch (e) {
        console.error('Socket emit failed', e);
      }
      // persist a notification for the assignee
      try {
        await notifications.createForUser(payload.assignedToId, `You were assigned task ${task.title}`);
      } catch (e) {
        console.error('Failed to create notification', e);
      }
    }
    return task;
  }

  /**
   * Delete a task and notify all clients.
   * @param id - Task UUID to delete
   * @returns Deleted task
   * @emits task:deleted - Notifies all clients of the deletion
   */
  async delete(id: string) {
    const task = await tasks.delete(id);
    try {
      const { io } = await import('../index');
      io.emit('task:deleted', { id });
    } catch (e) {
      console.error('Socket emit failed', e);
    }
    return task;
  }

  async get(id: string) {
    return tasks.findById(id);
  }

  /**
   * List tasks with optional filters and sorting.
   * @param filter - Status, priority, and sort options
   * @returns Filtered and sorted task list
   */
  async list(filter: { status?: string; priority?: string; sort?: 'asc'|'desc' }) {
    return tasks.list({ status: filter.status as Status | undefined, priority: filter.priority as Priority | undefined, sortByDueDate: filter.sort });
  }

  /**
   * Get personalized dashboard data for a user.
   * @param userId - User UUID
   * @returns Object with 'mine' (created/assigned tasks) and 'overdue' tasks
   */
  async dashboard(userId: string) {
    const mine = await tasks.findByCreatorOrAssignee(userId);
    const overdue = await tasks.findOverdue(new Date(), userId);
    return { mine, overdue };
  }
}
