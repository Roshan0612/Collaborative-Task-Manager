import { NotificationRepository } from '../repositories/notification.repository';

const repo = new NotificationRepository();

export class NotificationService {
  async createForUser(userId: string, message: string) {
    const n = await repo.create({ userId, message });
    // Emit to sockets so client can show persistent notification
    try {
      const { io } = await import('../index');
      io.emit('notification:created', { userId, notification: n });
    } catch (e) {
      console.error('Socket emit failed', e);
    }
    return n;
  }

  async listForUser(userId: string) {
    return repo.listByUser(userId);
  }

  async markRead(id: string) {
    return repo.markRead(id);
  }
}
