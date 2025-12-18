import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';

const router = Router();
const service = new NotificationService();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const list = await service.listForUser(req.userId!);
  res.json(list);
});

router.put('/:id/read', authMiddleware, async (req, res) => {
  const n = await service.markRead(req.params.id);
  res.json(n);
});

export default router;
