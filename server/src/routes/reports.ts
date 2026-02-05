import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

const VALID_CATEGORIES = ['FRAUD', 'ABUSE', 'ITEM_PROBLEM', 'INCORRECT_SELLER_DATA', 'MISLEADING_LISTING'];

// Create a report
router.post('/', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { listingId, category, subcategory, explanation } = req.body;

    if (!listingId || !category || !subcategory || !explanation) {
      throw new AppError(400, 'All fields are required');
    }

    if (!VALID_CATEGORIES.includes(category)) {
      throw new AppError(400, 'Invalid report category');
    }

    if (typeof subcategory !== 'string' || subcategory.length > 100) {
      throw new AppError(400, 'Invalid subcategory');
    }

    if (typeof explanation !== 'string' || explanation.length < 10 || explanation.length > 1000) {
      throw new AppError(400, 'Explanation must be between 10 and 1000 characters');
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true },
    });

    if (!listing) {
      throw new AppError(404, 'Listing not found');
    }

    // Prevent self-reporting
    if (listing.userId === req.userId) {
      throw new AppError(400, 'Cannot report your own listing');
    }

    const report = await prisma.report.create({
      data: {
        category: category as any,
        subcategory,
        explanation,
        reporterId: req.userId!,
        listingId: listing.id,
        reportedUserId: listing.userId,
      },
    });

    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
});

// Get my reports
router.get('/mine', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const reports = await prisma.report.findMany({
      where: { reporterId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: { take: 1, orderBy: { order: 'asc' } },
          },
        },
      },
    });

    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

export { router as reportsRouter };
