import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get reviews for a user
router.get('/:userId', async (req: Request, res: Response, next) => {
  try {
    const userId = req.params.userId as string;
    const reviews = await prisma.review.findMany({
      where: { reviewedId: userId },
      include: {
        reviewer: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avg = await prisma.review.aggregate({
      where: { reviewedId: userId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    res.json({
      reviews,
      stats: {
        avgRating: avg._avg?.rating || 0,
        count: avg._count?.rating || 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get average rating for a user
router.get('/:userId/rating', async (req: Request, res: Response, next) => {
  try {
    const userId = req.params.userId as string;
    const avg = await prisma.review.aggregate({
      where: { reviewedId: userId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    res.json({
      average: avg._avg?.rating || 0,
      count: avg._count?.rating || 0,
    });
  } catch (err) {
    next(err);
  }
});

// Add review
router.post('/:userId', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { rating, comment } = req.body;
    const reviewedId = req.params.userId as string;

    if (reviewedId === req.userId) {
      throw new AppError(400, 'Cannot review yourself');
    }

    if (!rating || rating < 1 || rating > 5) {
      throw new AppError(400, 'Rating must be between 1 and 5');
    }

    const existing = await prisma.review.findUnique({
      where: { reviewerId_reviewedId: { reviewerId: req.userId!, reviewedId } },
    });

    if (existing) {
      throw new AppError(400, 'You already reviewed this user');
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment || null,
        reviewerId: req.userId!,
        reviewedId,
      },
      include: {
        reviewer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
});

export { router as reviewsRouter };
