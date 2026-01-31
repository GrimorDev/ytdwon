import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRequired, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

// Register
router.post('/register', async (req: Request, res: Response, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw new AppError(400, 'Email, password and name are required');
    }

    if (password.length < 6) {
      throw new AppError(400, 'Password must be at least 6 characters');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const tokens = generateTokens(user.id);

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const tokens = generateTokens(user.id);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
});

// Get current user
router.get('/me', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, plan: true, createdAt: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(400, 'Refresh token required');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    const tokens = generateTokens(decoded.userId);

    res.json(tokens);
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Change password
router.post('/change-password', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError(400, 'Aktualne i nowe haslo sa wymagane');
    }

    if (newPassword.length < 6) {
      throw new AppError(400, 'Nowe haslo musi miec minimum 6 znakow');
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) throw new AppError(404, 'User not found');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      throw new AppError(401, 'Aktualne haslo jest nieprawidlowe');
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashed },
    });

    res.json({ message: 'Haslo zostalo zmienione' });
  } catch (err) {
    next(err);
  }
});

// Account stats
router.get('/stats', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, plan: true, createdAt: true, stripeCustomerId: true },
    });
    if (!user) throw new AppError(404, 'User not found');

    // Total downloads
    const totalDownloads = await prisma.download.count({
      where: { userId: req.userId },
    });

    // Downloads by platform
    const byPlatform = await prisma.download.groupBy({
      by: ['platform'],
      where: { userId: req.userId },
      _count: { platform: true },
    });

    // Downloads by format
    const byFormat = await prisma.download.groupBy({
      by: ['format'],
      where: { userId: req.userId },
      _count: { format: true },
    });

    // Last 7 days activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentDownloads = await prisma.download.count({
      where: { userId: req.userId, createdAt: { gte: sevenDaysAgo } },
    });

    // Most downloaded platform
    const topPlatform = byPlatform.length > 0
      ? byPlatform.reduce((a, b) => a._count.platform > b._count.platform ? a : b)
      : null;

    res.json({
      user: {
        name: user.name,
        email: user.email,
        plan: user.plan,
        createdAt: user.createdAt,
        hasStripe: !!user.stripeCustomerId,
      },
      stats: {
        totalDownloads,
        recentDownloads,
        byPlatform: byPlatform.map((p) => ({ platform: p.platform, count: p._count.platform })),
        byFormat: byFormat.map((f) => ({ format: f.format, count: f._count.format })),
        topPlatform: topPlatform?.platform || null,
      },
    });
  } catch (err) {
    next(err);
  }
});

export { router as authRouter };
