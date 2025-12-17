import prisma from '../config/database';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type Status = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

export class TaskRepository {
  create(data: {
    title: string;
    description: string;
    dueDate: Date;
    priority: Priority;
    status: Status;
    creatorId: string;
    assignedToId: string;
  }) {
    return prisma.task.create({ data });
  }

  update(id: string, data: Partial<{
    title: string;
    description: string;
    dueDate: Date;
    priority: Priority;
    status: Status;
    assignedToId: string;
  }>) {
    return prisma.task.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.task.delete({ where: { id } });
  }

  findById(id: string) {
    return prisma.task.findUnique({ where: { id } });
  }

  list(params: { status?: Status; priority?: Priority; sortByDueDate?: 'asc'|'desc' }) {
    const { status, priority, sortByDueDate } = params;
    return prisma.task.findMany({
      where: {
        status,
        priority,
      },
      orderBy: sortByDueDate ? { dueDate: sortByDueDate } : undefined,
    });
  }

  findByCreatorOrAssignee(userId: string) {
    return prisma.task.findMany({
      where: {
        OR: [{ creatorId: userId }, { assignedToId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOverdue(now: Date, userId?: string) {
    return prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { not: 'COMPLETED' },
        ...(userId ? { OR: [{ creatorId: userId }, { assignedToId: userId }] } : {}),
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
