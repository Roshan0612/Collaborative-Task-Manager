import { TaskRepository } from '../repositories/task.repository';
import { z } from 'zod';
import { io } from '../index';

const tasks = new TaskRepository();

// Type aliases for Prisma enums
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
  async create(payload: z.infer<typeof CreateTaskDto>) {
    const data = { ...payload, dueDate: new Date(payload.dueDate) };
    const task = await tasks.create(data);
    io.emit('task:created', task);
    return task;
  }

  async update(id: string, payload: z.infer<typeof UpdateTaskDto>) {
    const data = { ...payload, dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined };
    const before = await tasks.findById(id);
    const task = await tasks.update(id, data);
    io.emit('task:updated', task);
    if (payload.assignedToId && before?.assignedToId !== payload.assignedToId) {
      io.emit('task:assigned', { taskId: id, assignedToId: payload.assignedToId });
    }
    return task;
  }

  async delete(id: string) {
    const task = await tasks.delete(id);
    io.emit('task:deleted', { id });
    return task;
  }

  async get(id: string) {
    return tasks.findById(id);
  }

  async list(filter: { status?: string; priority?: string; sort?: 'asc'|'desc' }) {
    return tasks.list({ status: filter.status as Status | undefined, priority: filter.priority as Priority | undefined, sortByDueDate: filter.sort });
  }

  async dashboard(userId: string) {
    const mine = await tasks.findByCreatorOrAssignee(userId);
    const overdue = await tasks.findOverdue(new Date(), userId);
    return { mine, overdue };
  }
}
