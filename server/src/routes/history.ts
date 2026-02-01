import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get download history
router.get('/', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    const [downloads, total] = await Promise.all([
      prisma.download.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.download.count({ where: { userId: req.userId } }),
    ]);

    res.json({
      downloads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Delete history entry
router.delete('/:id', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId as string;

    const download = await prisma.download.findFirst({
      where: { id, userId },
    });

    if (!download) {
      throw new AppError(404, 'Download not found');
    }

    await prisma.download.delete({ where: { id } });

    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export { router as historyRouter };
