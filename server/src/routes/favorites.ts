import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get my favorites
router.get('/', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.userId },
      include: {
        listing: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
            category: { select: { name: true, slug: true, namePl: true, nameEn: true } },
            user: { select: { id: true, name: true, city: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      favorites: favorites
        .filter(f => f.listing.status === 'ACTIVE')
        .map(f => ({
          id: f.id,
          createdAt: f.createdAt,
          listing: { ...f.listing, isFavorited: true },
        })),
    });
  } catch (err) {
    next(err);
  }
});

// Toggle favorite
router.post('/:listingId', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { listingId } = req.params;

    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: req.userId!, listingId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.json({ favorited: false });
    } else {
      await prisma.favorite.create({
        data: { userId: req.userId!, listingId },
      });
      res.json({ favorited: true });
    }
  } catch (err) {
    next(err);
  }
});

// Remove favorite
router.delete('/:listingId', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.favorite.deleteMany({
      where: { userId: req.userId!, listingId: req.params.listingId },
    });
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    next(err);
  }
});

export { router as favoritesRouter };
