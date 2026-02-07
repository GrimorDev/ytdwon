import { Router, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { adminRequired, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// ==================== DASHBOARD ====================

router.get('/stats', adminRequired, async (_req: AuthRequest, res: Response, next) => {
  try {
    const [totalUsers, totalListings, totalActiveListings, pendingReports, totalReports, totalBanners, totalSubscribers, totalCategories] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.count(),
      prisma.banner.count(),
      prisma.newsletterSubscriber.count(),
      prisma.category.count(),
    ]);

    res.json({ totalUsers, totalListings, totalActiveListings, pendingReports, totalReports, totalBanners, totalSubscribers, totalCategories });
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

// ==================== CATEGORIES ====================

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const categoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  },
});

// Polish → English translation map for common category names
const plToEnMap: Record<string, string> = {
  'elektronika': 'Electronics', 'telefony': 'Phones', 'komputery': 'Computers',
  'laptopy': 'Laptops', 'tablety': 'Tablets', 'smartfony': 'Smartphones',
  'telewizory': 'TVs', 'audio': 'Audio', 'foto': 'Photography',
  'gry': 'Games', 'konsole': 'Consoles', 'motoryzacja': 'Automotive',
  'samochody': 'Cars', 'motocykle': 'Motorcycles', 'czesci': 'Parts',
  'opony': 'Tires', 'nieruchomosci': 'Real Estate', 'mieszkania': 'Apartments',
  'domy': 'Houses', 'dzialki': 'Land', 'pokoje': 'Rooms',
  'dom i ogrod': 'Home & Garden', 'meble': 'Furniture', 'agd': 'Appliances',
  'narzedzia': 'Tools', 'ogrod': 'Garden', 'dekoracje': 'Decorations',
  'moda': 'Fashion', 'obuwie': 'Shoes', 'ubrania': 'Clothing',
  'torebki': 'Bags', 'zegarki': 'Watches', 'bizuteria': 'Jewelry',
  'sport': 'Sports', 'rowery': 'Bicycles', 'fitness': 'Fitness',
  'sporty zimowe': 'Winter Sports', 'sporty wodne': 'Water Sports',
  'dla dzieci': 'For Kids', 'zabawki': 'Toys', 'odziez dziecieca': 'Kids Clothing',
  'wozki': 'Strollers', 'zwierzeta': 'Animals', 'psy': 'Dogs', 'koty': 'Cats',
  'praca': 'Jobs', 'uslugi': 'Services', 'edukacja': 'Education',
  'muzyka': 'Music', 'ksiazki': 'Books', 'filmy': 'Movies',
  'zdrowie': 'Health', 'uroda': 'Beauty', 'antyki': 'Antiques',
  'kolekcje': 'Collections', 'inne': 'Other', 'akcesoria': 'Accessories',
  'sprzet sportowy': 'Sports Equipment', 'camping': 'Camping',
  'fotografia': 'Photography', 'drukarki': 'Printers', 'monitory': 'Monitors',
  'sluchawki': 'Headphones', 'glosniki': 'Speakers',
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
    .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
    .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function translateToEn(namePl: string): string {
  const lower = namePl.toLowerCase().trim();
  if (plToEnMap[lower]) return plToEnMap[lower];
  // Try partial match
  for (const [pl, en] of Object.entries(plToEnMap)) {
    if (lower.includes(pl) || pl.includes(lower)) return en;
  }
  // Fallback: capitalize first letter of each word
  return namePl.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// List all categories (tree) for admin
router.get('/categories', adminRequired, async (_req: AuthRequest, res: Response, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            _count: { select: { listings: true } },
          },
          orderBy: { name: 'asc' },
        },
        _count: { select: { listings: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

// Create category
router.post('/categories', adminRequired, categoryUpload.single('image'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { namePl, nameEn, icon, parentId } = req.body;

    if (!namePl || !namePl.trim()) throw new AppError(400, 'Polish name is required');

    const finalNameEn = (nameEn && nameEn.trim()) ? nameEn.trim() : translateToEn(namePl.trim());
    const slug = generateSlug(namePl.trim());

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) throw new AppError(409, 'Category with this name already exists');

    // Check name uniqueness
    const existingName = await prisma.category.findUnique({ where: { name: namePl.trim() } });
    if (existingName) throw new AppError(409, 'Category with this name already exists');

    // Process image if uploaded
    let imageUrl: string | null = null;
    if (req.file) {
      const filename = `cat-${uuidv4()}.webp`;
      const filepath = path.join(uploadsDir, filename);
      await sharp(req.file.buffer)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filepath);
      imageUrl = `/uploads/${filename}`;
    }

    const category = await prisma.category.create({
      data: {
        name: namePl.trim(),
        namePl: namePl.trim(),
        nameEn: finalNameEn,
        icon: (icon && icon.trim()) ? icon.trim() : 'Package',
        slug,
        imageUrl,
        parentId: parentId || null,
      },
      include: {
        children: true,
        parent: true,
        _count: { select: { listings: true } },
      },
    });

    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
});

// Update category
router.put('/categories/:id', adminRequired, categoryUpload.single('image'), async (req: AuthRequest, res: Response, next) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw new AppError(404, 'Category not found');

    const { namePl, nameEn, icon, parentId } = req.body;

    const data: any = {};

    if (namePl && namePl.trim()) {
      data.name = namePl.trim();
      data.namePl = namePl.trim();
      data.slug = generateSlug(namePl.trim());

      // Check slug uniqueness (excluding current)
      const slugExists = await prisma.category.findFirst({
        where: { slug: data.slug, id: { not: req.params.id as string } },
      });
      if (slugExists) throw new AppError(409, 'Category with this slug already exists');

      // Check name uniqueness (excluding current)
      const nameExists = await prisma.category.findFirst({
        where: { name: data.name, id: { not: req.params.id as string } },
      });
      if (nameExists) throw new AppError(409, 'Category with this name already exists');
    }

    if (nameEn !== undefined) {
      data.nameEn = nameEn.trim() || (namePl ? translateToEn(namePl.trim()) : existing.nameEn);
    } else if (namePl && namePl.trim() !== existing.namePl) {
      data.nameEn = translateToEn(namePl.trim());
    }

    if (icon !== undefined) data.icon = icon.trim() || existing.icon;
    if (parentId !== undefined) data.parentId = parentId || null;

    // Process image if uploaded
    if (req.file) {
      const filename = `cat-${uuidv4()}.webp`;
      const filepath = path.join(uploadsDir, filename);
      await sharp(req.file.buffer)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filepath);
      data.imageUrl = `/uploads/${filename}`;

      // Remove old image
      if (existing.imageUrl) {
        const oldPath = path.join(uploadsDir, '..', existing.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    // Prevent circular parent reference
    if (data.parentId === req.params.id) {
      throw new AppError(400, 'Category cannot be its own parent');
    }

    const category = await prisma.category.update({
      where: { id: req.params.id as string },
      data,
      include: {
        children: { include: { _count: { select: { listings: true } } } },
        parent: true,
        _count: { select: { listings: true } },
      },
    });

    res.json({ category });
  } catch (err) {
    next(err);
  }
});

// Delete category
router.delete('/categories/:id', adminRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const existing = await prisma.category.findUnique({
      where: { id: req.params.id as string },
      include: {
        _count: { select: { listings: true, children: true } },
      },
    });
    if (!existing) throw new AppError(404, 'Category not found');

    if (existing._count.listings > 0) {
      throw new AppError(400, `Cannot delete category with ${existing._count.listings} listing(s). Move or delete listings first.`);
    }

    if (existing._count.children > 0) {
      throw new AppError(400, `Cannot delete category with ${existing._count.children} subcategory(ies). Delete subcategories first.`);
    }

    // Remove image
    if (existing.imageUrl) {
      const imgPath = path.join(uploadsDir, '..', existing.imageUrl);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await prisma.category.delete({ where: { id: req.params.id as string } });

    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
});

// Upload category image separately (for existing categories)
router.post('/categories/:id/image', adminRequired, categoryUpload.single('image'), async (req: AuthRequest, res: Response, next) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw new AppError(404, 'Category not found');

    if (!req.file) throw new AppError(400, 'No image provided');

    const filename = `cat-${uuidv4()}.webp`;
    const filepath = path.join(uploadsDir, filename);
    await sharp(req.file.buffer)
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);

    // Remove old image
    if (existing.imageUrl) {
      const oldPath = path.join(uploadsDir, '..', existing.imageUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const category = await prisma.category.update({
      where: { id: req.params.id as string },
      data: { imageUrl: `/uploads/${filename}` },
    });

    res.json({ imageUrl: category.imageUrl });
  } catch (err) {
    next(err);
  }
});

export { router as adminRouter };
