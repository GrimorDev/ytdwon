import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Toggle follow user
router.post('/:userId', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const followingId = req.params.userId as string;

    if (followingId === req.userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: req.userId!, followingId } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      res.json({ following: false });
    } else {
      await prisma.follow.create({
        data: { followerId: req.userId!, followingId },
      });
      res.json({ following: true });
    }
  } catch (err) {
    next(err);
  }
});

// Check if following a user
router.get('/check/:userId', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const followingId = req.params.userId as string;
    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: req.userId!, followingId } },
    });
    res.json({ following: !!existing });
  } catch (err) {
    next(err);
  }
});

// Get followers count for a user
router.get('/count/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId as string;
    const followersCount = await prisma.follow.count({ where: { followingId: userId } });
    const followingCount = await prisma.follow.count({ where: { followerId: userId } });
    res.json({ followersCount, followingCount });
  } catch (err) {
    next(err);
  }
});

// Get my followed sellers
router.get('/my', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const follows = await prisma.follow.findMany({
      where: { followerId: req.userId! },
      include: {
        following: {
          select: {
            id: true, name: true, avatarUrl: true, city: true, isVerified: true,
            _count: { select: { listings: { where: { status: 'ACTIVE' } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      follows: follows.map((f: any) => ({
        id: f.id,
        createdAt: f.createdAt,
        user: {
          ...f.following,
          activeListings: f.following._count.listings,
        },
      })),
    });
  } catch (err) {
    next(err);
  }
});

export { router as followsRouter };
