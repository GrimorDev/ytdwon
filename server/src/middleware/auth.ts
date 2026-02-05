import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  userId?: string;
  userPlan?: string;
  userRole?: string;
}

export async function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;

    // Check if user is blocked
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { blocked: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.blocked) {
      return res.status(403).json({ error: 'Account blocked' });
    }

    req.userRole = user.role;
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

export async function adminRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, blocked: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (user.blocked) {
      return res.status(403).json({ error: 'Account blocked' });
    }

    req.userRole = user.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
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
