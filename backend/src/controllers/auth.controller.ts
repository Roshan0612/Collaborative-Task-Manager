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
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
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
    if (error?.message === 'USER_EXISTS') {
      return res.status(409).json({ message: 'User already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await authService.login(validatedData.email, validatedData.password);
    const token = generateToken(user.id);
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
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
    if (error?.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get current authenticated user profile.
 * @requires authMiddleware - userId must be injected by auth middleware
 */
export const me = async (req: Request, res: Response) => {
  try {
    const { UserRepository } = await import('../repositories/user.repository');
    const repo = new UserRepository();
    const userId: string | undefined = (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await repo.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update authenticated user's profile information.
 * @requires authMiddleware - userId must be injected by auth middleware
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { z } = await import('zod');
    const schema = z.object({ name: z.string().min(2).max(100) });
    const parsed = schema.parse(req.body);
    const { UserRepository } = await import('../repositories/user.repository');
    const repo = new UserRepository();
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
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd });
  res.json({ message: 'Logged out' });
};

/**
 * Get all registered users (for assigning tasks).
 */
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const { UserRepository } = await import('../repositories/user.repository');
    const repo = new UserRepository();
    const users = await repo.findAll();
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
