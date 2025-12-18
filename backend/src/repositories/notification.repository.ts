import prisma from '../config/database';

export class NotificationRepository {
  create(data: { userId: string; message: string }) {
    return (prisma as any).notification.create({ data });
  }

  listByUser(userId: string) {
    return (prisma as any).notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  markRead(id: string) {
    return (prisma as any).notification.update({ where: { id }, data: { read: true } });
  }

  delete(id: string) {
    return (prisma as any).notification.delete({ where: { id } });
  }
}
