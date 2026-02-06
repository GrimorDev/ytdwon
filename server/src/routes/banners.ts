import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Public: Get active banners
router.get('/', async (_req: Request, res: Response, next) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { enabled: true },
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ banners });
  } catch (err) {
    next(err);
  }
});

// Public: Get site stats
router.get('/stats', async (_req: Request, res: Response, next) => {
  try {
    const [users, listings, transactions, citiesResult] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { status: 'SOLD' } }),
      prisma.listing.groupBy({ by: ['city'], where: { status: { in: ['ACTIVE', 'SOLD', 'RESERVED'] } } }),
    ]);
    res.json({
      users,
      listings,
      transactions,
      cities: citiesResult.length,
    });
  } catch (err) {
    next(err);
  }
});

// Public: Newsletter subscribe
router.post('/newsletter', async (req: Request, res: Response, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(409).json({ error: 'Already subscribed' });
    }

    await prisma.newsletterSubscriber.create({
      data: { email: email.toLowerCase().trim() },
    });

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    next(err);
  }
});

export { router as bannersRouter };
