import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all categories (tree, 3 levels deep)
router.get('/', async (_req: Request, res: Response, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                _count: { select: { listings: true } },
              },
              orderBy: { displayOrder: 'asc' },
            },
            _count: { select: { listings: true } },
          },
          orderBy: { displayOrder: 'asc' },
        },
        _count: { select: { listings: true } },
      },
      orderBy: { displayOrder: 'asc' },
    });

    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

// Get category by slug
router.get('/:slug', async (req: Request, res: Response, next) => {
  try {
    const slug = req.params.slug as string;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          include: {
            children: {
              include: {
                _count: { select: { listings: true } },
              },
              orderBy: { displayOrder: 'asc' },
            },
            _count: { select: { listings: true } },
          },
          orderBy: { displayOrder: 'asc' },
        },
        parent: {
          include: {
            parent: true,
          },
        },
        _count: { select: { listings: true } },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (err) {
    next(err);
  }
});

export { router as categoriesRouter };
