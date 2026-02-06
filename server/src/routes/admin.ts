import { Router, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { adminRequired, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// ==================== DASHBOARD ====================

router.get('/stats', adminRequired, async (_req: AuthRequest, res: Response, next) => {
  try {
    const [totalUsers, totalListings, totalActiveListings, pendingReports, totalReports, totalBanners, totalSubscribers] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.count(),
      prisma.banner.count(),
      prisma.newsletterSubscriber.count(),
    ]);

    res.json({ totalUsers, totalListings, totalActiveListings, pendingReports, totalReports, totalBanners, totalSubscribers });
  } catch (err) {
    next(err);
  }
});

// ==================== LISTINGS ====================

router.get('/listings', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page = '1', limit = '20', search, status } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ListingWhereInput = {};

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (status && ['ACTIVE', 'SOLD', 'RESERVED', 'ARCHIVED'].includes(status)) {
      where.status = status as any;
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          user: { select: { id: true, name: true, email: true } },
          category: { select: { name: true, slug: true, namePl: true, nameEn: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      listings,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/listings/:id', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id as string },
      include: {
        images: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, email: true, city: true, avatarUrl: true } },
        category: { include: { parent: true } },
        _count: { select: { favorites: true, conversations: true, reports: true } },
      },
    });

    if (!listing) throw new AppError(404, 'Listing not found');
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

router.put('/listings/:id', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { title, description, price, status, condition } = req.body;

    const existing = await prisma.listing.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw new AppError(404, 'Listing not found');

    const listing = await prisma.listing.update({
      where: { id: req.params.id as string },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(status && { status }),
        ...(condition && { condition }),
      },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: true,
      },
    });

    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

router.delete('/listings/:id', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw new AppError(404, 'Listing not found');

    await prisma.listing.update({
      where: { id: req.params.id as string },
      data: { status: 'ARCHIVED' },
    });

    res.json({ message: 'Listing archived' });
  } catch (err) {
    next(err);
  }
});

// ==================== USERS ====================

router.get('/users', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page = '1', limit = '20', search, blocked, role } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (blocked === 'true') where.blocked = true;
    if (blocked === 'false') where.blocked = false;

    if (role && ['USER', 'ADMIN'].includes(role)) {
      where.role = role as any;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true, email: true, name: true, phone: true, city: true,
          avatarUrl: true, role: true, plan: true, blocked: true, blockedReason: true,
          createdAt: true,
          _count: { select: { listings: true, reports: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/users/:id', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      select: {
        id: true, email: true, name: true, phone: true, city: true,
        avatarUrl: true, bio: true, role: true, plan: true,
        blocked: true, blockedReason: true, createdAt: true,
        _count: { select: { listings: true, reviewsReceived: true, reports: true } },
        listings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { images: { take: 1, orderBy: { order: 'asc' } } },
        },
      },
    });

    if (!user) throw new AppError(404, 'User not found');
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/block', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { blocked, blockedReason } = req.body;

    if (typeof blocked !== 'boolean') {
      throw new AppError(400, 'blocked must be a boolean');
    }

    const existing = await prisma.user.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw new AppError(404, 'User not found');

    // Prevent blocking yourself
    if (req.params.id as string === req.userId) {
      throw new AppError(400, 'Cannot block yourself');
    }

    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: {
        blocked,
        blockedReason: blocked ? (blockedReason || null) : null,
      },
      select: { id: true, name: true, email: true, blocked: true, blockedReason: true },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/role', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { role } = req.body;

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      throw new AppError(400, 'Invalid role');
    }

    const existing = await prisma.user.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw new AppError(404, 'User not found');

    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// ==================== REPORTS ====================

router.get('/reports', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page = '1', limit = '20', status = 'PENDING' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ReportWhereInput = {};

    if (status && ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED', 'ALL'].includes(status)) {
      if (status !== 'ALL') {
        where.status = status as any;
      }
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          reporter: { select: { id: true, name: true, email: true } },
          listing: {
            select: {
              id: true, title: true, price: true, status: true,
              images: { take: 1, orderBy: { order: 'asc' } },
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      reports,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/reports/:id', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { status, adminNote } = req.body;

    if (status && !['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'].includes(status)) {
      throw new AppError(400, 'Invalid report status');
    }

    const existing = await prisma.report.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw new AppError(404, 'Report not found');

    const report = await prisma.report.update({
      where: { id: req.params.id as string },
      data: {
        ...(status && { status }),
        ...(adminNote !== undefined && { adminNote }),
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, title: true } },
      },
    });

    res.json({ report });
  } catch (err) {
    next(err);
  }
});

// ==================== CONVERSATIONS (read-only) ====================

router.get('/conversations', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page = '1', limit = '20', userId } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ConversationWhereInput = {};
    if (userId) {
      where.OR = [{ participant1Id: userId }, { participant2Id: userId }];
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          participant1: { select: { id: true, name: true, avatarUrl: true } },
          participant2: { select: { id: true, name: true, avatarUrl: true } },
          listing: { select: { id: true, title: true } },
          messages: { take: 1, orderBy: { createdAt: 'desc' } },
          _count: { select: { messages: true } },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    res.json({
      conversations,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/conversations/:id/messages', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id as string },
      include: {
        participant1: { select: { id: true, name: true, avatarUrl: true } },
        participant2: { select: { id: true, name: true, avatarUrl: true } },
        listing: { select: { id: true, title: true } },
      },
    });

    if (!conversation) throw new AppError(404, 'Conversation not found');

    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id as string },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    res.json({ conversation, messages });
  } catch (err) {
    next(err);
  }
});

// ==================== BANNERS ====================

// List all banners
router.get('/banners', adminRequired, async (_req: AuthRequest, res: Response, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ banners });
  } catch (err) {
    next(err);
  }
});

// Create banner
router.post('/banners', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { title, subtitle, imageUrl, linkUrl, buttonText, displayOrder, enabled } = req.body;

    if (!imageUrl) throw new AppError(400, 'Image URL is required');

    const banner = await prisma.banner.create({
      data: {
        title: title || null,
        subtitle: subtitle || null,
        imageUrl,
        linkUrl: linkUrl || null,
        buttonText: buttonText || null,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : 0,
        enabled: enabled !== undefined ? Boolean(enabled) : true,
      },
    });

    res.status(201).json({ banner });
  } catch (err) {
    next(err);
  }
});

// Update banner
router.put('/banners/:id', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const existing = await prisma.banner.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw new AppError(404, 'Banner not found');

    const { title, subtitle, imageUrl, linkUrl, buttonText, displayOrder, enabled } = req.body;

    const banner = await prisma.banner.update({
      where: { id: req.params.id as string },
      data: {
        ...(title !== undefined && { title: title || null }),
        ...(subtitle !== undefined && { subtitle: subtitle || null }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(linkUrl !== undefined && { linkUrl: linkUrl || null }),
        ...(buttonText !== undefined && { buttonText: buttonText || null }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) }),
        ...(enabled !== undefined && { enabled: Boolean(enabled) }),
      },
    });

    res.json({ banner });
  } catch (err) {
    next(err);
  }
});

// Delete banner
router.delete('/banners/:id', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const existing = await prisma.banner.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw new AppError(404, 'Banner not found');

    await prisma.banner.delete({ where: { id: req.params.id as string } });

    res.json({ message: 'Banner deleted' });
  } catch (err) {
    next(err);
  }
});

// Reorder banners
router.patch('/banners/reorder', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { banners } = req.body;
    if (!Array.isArray(banners)) throw new AppError(400, 'Invalid banners data');

    await Promise.all(
      banners.map((b: { id: string; order: number }) =>
        prisma.banner.update({
          where: { id: b.id },
          data: { displayOrder: b.order },
        })
      )
    );

    res.json({ message: 'Order updated' });
  } catch (err) {
    next(err);
  }
});

// ==================== NEWSLETTER ====================

// List newsletter subscribers
router.get('/newsletter', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.newsletterSubscriber.count(),
    ]);

    res.json({
      subscribers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Delete newsletter subscriber
router.delete('/newsletter/:id', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw new AppError(404, 'Subscriber not found');

    await prisma.newsletterSubscriber.delete({ where: { id: req.params.id as string } });

    res.json({ message: 'Subscriber removed' });
  } catch (err) {
    next(err);
  }
});

export { router as adminRouter };
