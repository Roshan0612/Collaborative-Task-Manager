import { Router } from 'express';
import { register, login, me, updateProfile, logout } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.put('/profile', authMiddleware, updateProfile);
router.post('/logout', authMiddleware, logout);

export default router;
