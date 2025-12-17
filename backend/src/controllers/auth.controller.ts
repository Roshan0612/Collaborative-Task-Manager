import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    const user = await authService.register(validatedData.name, validatedData.email, validatedData.password);

    const token = generateToken(user.id);

    // Set HttpOnly cookie for JWT
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await authService.login(validatedData.email, validatedData.password);
    const token = generateToken(user.id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    // userId will be injected by authMiddleware
    // we avoid direct DB import here, use repository
    const { UserRepository } = await import('../repositories/user.repository');
    const repo = new UserRepository();
    // @ts-ignore - added by middleware
    const userId: string | undefined = (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await repo.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { z } = await import('zod');
    const schema = z.object({ name: z.string().min(2).max(100) });
    const parsed = schema.parse(req.body);
    const { UserRepository } = await import('../repositories/user.repository');
    const repo = new UserRepository();
    // @ts-ignore
    const userId: string | undefined = (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await repo.updateProfile(userId, { name: parsed.name });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out' });
};
