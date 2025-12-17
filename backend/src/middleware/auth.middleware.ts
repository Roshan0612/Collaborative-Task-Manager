import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenFromCookie = req.cookies?.token as string | undefined;
    const authHeader = req.headers.authorization;

    const token = tokenFromCookie
      ? tokenFromCookie
      : authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
