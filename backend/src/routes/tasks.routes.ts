import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { TaskService, CreateTaskDto, UpdateTaskDto } from '../services/task.service';
import { z } from 'zod';

const router = Router();
const service = new TaskService();

router.get('/', authMiddleware, async (req, res) => {
  const querySchema = z.object({
    status: z.string().optional(),
    priority: z.string().optional(),
    sort: z.enum(['asc','desc']).optional(),
  });
  const q = querySchema.safeParse(req.query);
  if (!q.success) return res.status(400).json({ message: 'Invalid query', errors: q.error.flatten() });
  const result = await service.list({
    status: q.data.status as any,
    priority: q.data.priority as any,
    sort: q.data.sort,
  });
  res.json(result);
});

router.get('/dashboard', authMiddleware, async (req: AuthRequest, res) => {
  const data = await service.dashboard(req.userId!);
  res.json(data);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const task = await service.get(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const parsed = CreateTaskDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
  const task = await service.create(parsed.data);
  res.status(201).json(task);
});

router.put('/:id', authMiddleware, async (req, res) => {
  const parsed = UpdateTaskDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
  const task = await service.update(req.params.id, parsed.data);
  res.json(task);
});

router.delete('/:id', authMiddleware, async (req, res) => {
  await service.delete(req.params.id);
  res.status(204).send();
});

export default router;
