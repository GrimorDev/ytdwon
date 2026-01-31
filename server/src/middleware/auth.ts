import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  userId?: string;
  userPlan?: string;
}

export function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function authOptional(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      req.userId = decoded.userId;
    } catch {
      // Token invalid, continue as guest
    }
  }

  next();
}

export async function attachUserPlan(req: AuthRequest, _res: Response, next: NextFunction) {
  if (req.userId) {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { plan: true },
    });
    req.userPlan = user?.plan || 'FREE';
  } else {
    req.userPlan = 'FREE';
  }
  next();
}
