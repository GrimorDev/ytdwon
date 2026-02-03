import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get public profile
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bio: true,
        city: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            reviewsReceived: true,
          },
        },
      },
    });

    if (!user) throw new AppError(404, 'User not found');

    const avgRating = await prisma.review.aggregate({
      where: { reviewedId: id },
      _avg: { rating: true },
    });

    res.json({
      user: {
        ...user,
        avgRating: avgRating._avg?.rating || 0,
        listingsCount: user._count.listings,
        reviewsCount: user._count.reviewsReceived,
        _count: undefined,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Update profile
router.put('/profile', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, phone, bio, city, latitude, longitude } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(bio !== undefined && { bio: bio || null }),
        ...(city !== undefined && { city: city || null }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
      },
      select: {
        id: true, email: true, name: true, phone: true,
        avatarUrl: true, bio: true, city: true, plan: true,
      },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export { router as usersRouter };
