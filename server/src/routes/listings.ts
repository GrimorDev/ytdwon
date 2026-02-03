import { Router, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authRequired, authOptional, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get listings (public, with filters)
router.get('/', authOptional, async (req: AuthRequest, res: Response, next) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      category,
      city,
      minPrice,
      maxPrice,
      condition,
      sort = 'newest',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ListingWhereInput = {
      status: 'ACTIVE',
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      // Support both slug and id
      const cat = await prisma.category.findFirst({
        where: { OR: [{ slug: category }, { id: category }] },
        include: { children: { select: { id: true } } },
      });
      if (cat) {
        const categoryIds = [cat.id, ...cat.children.map(c => c.id)];
        where.categoryId = { in: categoryIds };
      }
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (minPrice) {
      where.price = { ...((where.price as any) || {}), gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      where.price = { ...((where.price as any) || {}), lte: parseFloat(maxPrice) };
    }

    if (condition && ['NEW', 'USED', 'DAMAGED'].includes(condition)) {
      where.condition = condition as any;
    }

    let orderBy: Prisma.ListingOrderByWithRelationInput[] = [
      { promoted: 'desc' },
    ];

    switch (sort) {
      case 'cheapest':
        orderBy.push({ price: 'asc' });
        break;
      case 'expensive':
        orderBy.push({ price: 'desc' });
        break;
      case 'popular':
        orderBy.push({ views: 'desc' });
        break;
      default: // newest
        orderBy.push({ createdAt: 'desc' });
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          category: { select: { name: true, slug: true, namePl: true, nameEn: true } },
          user: { select: { id: true, name: true, city: true, avatarUrl: true } },
          _count: { select: { favorites: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    // Check if user has favorited these listings
    let userFavorites: Set<string> = new Set();
    if (req.userId) {
      const favs = await prisma.favorite.findMany({
        where: { userId: req.userId, listingId: { in: listings.map(l => l.id) } },
        select: { listingId: true },
      });
      userFavorites = new Set(favs.map(f => f.listingId));
    }

    res.json({
      listings: listings.map(l => ({
        ...l,
        isFavorited: userFavorites.has(l.id),
        favoritesCount: l._count.favorites,
        _count: undefined,
      })),
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

// Get my listings
router.get('/my', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { status } = req.query as Record<string, string>;

    const where: Prisma.ListingWhereInput = { userId: req.userId };
    if (status && ['ACTIVE', 'SOLD', 'ARCHIVED'].includes(status)) {
      where.status = status as any;
    }

    const listings = await prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        category: { select: { name: true, slug: true, namePl: true, nameEn: true } },
        _count: { select: { favorites: true, conversations: true } },
      },
    });

    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

// Get single listing
router.get('/:id', authOptional, async (req: AuthRequest, res: Response, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: true,
        user: {
          select: {
            id: true, name: true, city: true, avatarUrl: true,
            createdAt: true, phone: true,
            _count: { select: { listings: true, reviewsReceived: true } },
          },
        },
        _count: { select: { favorites: true } },
      },
    });

    if (!listing) {
      throw new AppError(404, 'Listing not found');
    }

    // Increment views (don't count own views)
    if (!req.userId || req.userId !== listing.userId) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { views: { increment: 1 } },
      });
    }

    // Check if favorited
    let isFavorited = false;
    if (req.userId) {
      const fav = await prisma.favorite.findUnique({
        where: { userId_listingId: { userId: req.userId, listingId: listing.id } },
      });
      isFavorited = !!fav;
    }

    // Get seller avg rating
    const avgRating = await prisma.review.aggregate({
      where: { reviewedId: listing.userId },
      _avg: { rating: true },
    });

    res.json({
      listing: {
        ...listing,
        isFavorited,
        favoritesCount: listing._count.favorites,
        user: {
          ...listing.user,
          avgRating: avgRating._avg.rating || 0,
        },
        _count: undefined,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Create listing
router.post('/', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { title, description, price, currency, condition, city, latitude, longitude, categoryId, images } = req.body;

    if (!title || !description || price === undefined || !city || !categoryId) {
      throw new AppError(400, 'Title, description, price, city and category are required');
    }

    if (title.length < 3 || title.length > 100) {
      throw new AppError(400, 'Title must be between 3 and 100 characters');
    }

    if (description.length < 10 || description.length > 5000) {
      throw new AppError(400, 'Description must be between 10 and 5000 characters');
    }

    if (price < 0 || price > 99999999) {
      throw new AppError(400, 'Invalid price');
    }

    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      throw new AppError(400, 'Invalid category');
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        currency: currency || 'PLN',
        condition: condition || 'USED',
        city,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        userId: req.userId!,
        categoryId,
        images: images && images.length > 0 ? {
          create: images.map((img: { url: string }, idx: number) => ({
            url: img.url,
            order: idx,
          })),
        } : undefined,
      },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: true,
      },
    });

    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
});

// Update listing
router.put('/:id', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, 'Listing not found');
    if (existing.userId !== req.userId) throw new AppError(403, 'Not authorized');

    const { title, description, price, currency, condition, city, latitude, longitude, categoryId, images } = req.body;

    // If images provided, delete old and create new
    if (images) {
      await prisma.image.deleteMany({ where: { listingId: existing.id } });
    }

    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(currency && { currency }),
        ...(condition && { condition }),
        ...(city && { city }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(categoryId && { categoryId }),
        ...(images && {
          images: {
            create: images.map((img: { url: string }, idx: number) => ({
              url: img.url,
              order: idx,
            })),
          },
        }),
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

// Delete listing (soft delete -> ARCHIVED)
router.delete('/:id', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, 'Listing not found');
    if (existing.userId !== req.userId) throw new AppError(403, 'Not authorized');

    await prisma.listing.update({
      where: { id: req.params.id },
      data: { status: 'ARCHIVED' },
    });

    res.json({ message: 'Listing archived' });
  } catch (err) {
    next(err);
  }
});

// Change listing status
router.patch('/:id/status', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { status } = req.body;
    if (!status || !['ACTIVE', 'SOLD', 'ARCHIVED'].includes(status)) {
      throw new AppError(400, 'Invalid status');
    }

    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, 'Listing not found');
    if (existing.userId !== req.userId) throw new AppError(403, 'Not authorized');

    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

export { router as listingsRouter };
