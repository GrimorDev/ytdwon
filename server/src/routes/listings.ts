import { Router, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authRequired, authOptional, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { getAttributesForCategory, AttributeDefinition } from '../config/categoryAttributes';
import { notifyListingCreated } from '../utils/notifications';

const router = Router();
const prisma = new PrismaClient();

// Helper: Validate and sanitize attributes for a category
function validateAttributes(categorySlug: string, rawAttributes: Record<string, any> | undefined): Record<string, any> | undefined {
  if (!rawAttributes || typeof rawAttributes !== 'object') return undefined;

  const definitions = getAttributesForCategory(categorySlug);
  if (definitions.length === 0) return undefined;

  const sanitized: Record<string, any> = {};

  for (const def of definitions) {
    const value = rawAttributes[def.key];
    if (value === undefined || value === null || value === '') continue;

    if (def.type === 'text') {
      sanitized[def.key] = String(value).slice(0, 200);
    } else if (def.type === 'number') {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        if (def.min !== undefined && num < def.min) continue;
        if (def.max !== undefined && num > def.max) continue;
        sanitized[def.key] = num;
      }
    } else if (def.type === 'select' && def.options) {
      const strVal = String(value);
      if (def.options.some(o => o.value === strVal)) {
        sanitized[def.key] = strVal;
      }
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

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
      userId,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ListingWhereInput = {
      status: { in: ['ACTIVE', 'SOLD', 'RESERVED'] },
    };

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let categorySlug: string | undefined;
    if (category) {
      // Support both slug and id
      const cat = await prisma.category.findFirst({
        where: { OR: [{ slug: category }, { id: category }] },
        include: { children: { select: { id: true } } },
      });
      if (cat) {
        categorySlug = cat.slug;
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

    // Attribute filtering (attr_* params)
    const attrFilters: { key: string; value: string; isMin?: boolean; isMax?: boolean }[] = [];
    for (const [key, value] of Object.entries(req.query)) {
      if (key.startsWith('attr_') && value && typeof value === 'string') {
        const attrKey = key.replace('attr_', '').replace(/Min$/, '').replace(/Max$/, '');
        const isMin = key.endsWith('Min');
        const isMax = key.endsWith('Max');
        attrFilters.push({ key: attrKey, value, isMin, isMax });
      }
    }

    // Apply attribute filters using Prisma JSON filtering
    if (attrFilters.length > 0 && categorySlug) {
      const definitions = getAttributesForCategory(categorySlug);

      for (const filter of attrFilters) {
        const def = definitions.find(d => d.key === filter.key);
        if (!def) continue;

        if (def.type === 'select') {
          // Exact match for select fields
          where.AND = where.AND || [];
          (where.AND as any[]).push({
            attributes: { path: [filter.key], equals: filter.value },
          });
        } else if (def.type === 'number') {
          // For numeric range, use raw query or JSON path comparison
          // Prisma's JSON filtering for gte/lte is limited, so we use string comparison approach
          // A cleaner solution would be $queryRaw but this works for basic cases
          where.AND = where.AND || [];
          if (filter.isMin) {
            (where.AND as any[]).push({
              attributes: { path: [filter.key], gte: parseFloat(filter.value) },
            });
          } else if (filter.isMax) {
            (where.AND as any[]).push({
              attributes: { path: [filter.key], lte: parseFloat(filter.value) },
            });
          } else {
            // Exact match
            (where.AND as any[]).push({
              attributes: { path: [filter.key], equals: parseFloat(filter.value) },
            });
          }
        }
      }
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

    const includeFields = {
      images: { orderBy: { order: 'asc' } as const, take: 1 },
      category: { select: { name: true, slug: true, namePl: true, nameEn: true } },
      user: { select: { id: true, name: true, city: true, avatarUrl: true } },
      _count: { select: { favorites: true } },
    };

    // Fetch promoted listings separately (max 4 per page, matching same filters)
    const promotedWhere = { ...where, promoted: true, status: 'ACTIVE' as const };
    const regularWhere = { ...where };

    const [promotedListings, listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: promotedWhere,
        orderBy: [{ createdAt: 'desc' }],
        skip: (pageNum - 1) * 4,
        take: 4,
        include: includeFields,
      }),
      prisma.listing.findMany({
        where: regularWhere,
        orderBy,
        skip,
        take: limitNum,
        include: includeFields,
      }),
      prisma.listing.count({ where }),
    ]);

    // Check if user has favorited these listings
    const allListings = [...promotedListings, ...listings];
    let userFavorites: Set<string> = new Set();
    if (req.userId) {
      const favs = await prisma.favorite.findMany({
        where: { userId: req.userId, listingId: { in: allListings.map(l => l.id) } },
        select: { listingId: true },
      });
      userFavorites = new Set(favs.map(f => f.listingId));
    }

    const mapListing = (l: any) => ({
      ...l,
      isFavorited: userFavorites.has(l.id),
      favoritesCount: l._count.favorites,
      _count: undefined,
    });

    res.json({
      promotedListings: promotedListings.map(mapListing),
      listings: listings.map(mapListing),
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

// Get promoted listings (for homepage)
router.get('/promoted', authOptional, async (req: AuthRequest, res: Response, next) => {
  try {
    const { limit = '8' } = req.query as Record<string, string>;
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));

    const listings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        promoted: true,
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
      take: limitNum,
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        category: { select: { name: true, slug: true, namePl: true, nameEn: true } },
        user: { select: { id: true, name: true, city: true, avatarUrl: true } },
        _count: { select: { favorites: true } },
      },
    });

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
    });
  } catch (err) {
    next(err);
  }
});

// Autocomplete search (must be before /:id)
router.get('/autocomplete', async (req, res, next) => {
  try {
    const { q, limit = '6' } = req.query as Record<string, string>;

    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const limitNum = Math.min(10, Math.max(1, parseInt(limit)));

    const listings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        title: { contains: q, mode: 'insensitive' },
      },
      orderBy: [
        { promoted: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limitNum,
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        city: true,
        images: { take: 1, select: { url: true } },
        category: { select: { slug: true } },
      },
    });

    res.json({
      suggestions: listings.map(l => ({
        id: l.id,
        title: l.title,
        price: l.price,
        currency: l.currency,
        city: l.city,
        thumbnailUrl: l.images[0]?.url || null,
        categorySlug: l.category?.slug || null,
      })),
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
    if (status && ['ACTIVE', 'SOLD', 'RESERVED', 'ARCHIVED'].includes(status)) {
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
    const id = req.params.id as string;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: {
          include: { parent: true },
        },
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

    const userWithCounts = {
      id: listing.user.id,
      name: listing.user.name,
      city: listing.user.city,
      avatarUrl: listing.user.avatarUrl,
      createdAt: listing.user.createdAt,
      phone: listing.user.phone,
      avgRating: avgRating._avg?.rating || 0,
      listingsCount: (listing.user as any)._count?.listings || 0,
      reviewsCount: (listing.user as any)._count?.reviewsReceived || 0,
    };

    res.json({
      listing: {
        ...listing,
        isFavorited,
        favoritesCount: listing._count.favorites,
        user: userWithCounts,
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
    const { title, description, price, currency, condition, city, latitude, longitude, categoryId, images, attributes, videoUrl, negotiable } = req.body;

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

    // Validate videoUrl (YouTube/Vimeo)
    let sanitizedVideoUrl: string | null = null;
    if (videoUrl && typeof videoUrl === 'string' && videoUrl.trim()) {
      const vUrl = videoUrl.trim();
      if (vUrl.match(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//)) {
        sanitizedVideoUrl = vUrl;
      }
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new AppError(400, 'Invalid category');
    }

    // Validate attributes based on category
    const validatedAttributes = validateAttributes(category.slug, attributes);

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        currency: currency || 'PLN',
        condition: condition || 'USED',
        negotiable: negotiable === true,
        videoUrl: sanitizedVideoUrl,
        city,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        userId: req.userId!,
        categoryId,
        attributes: validatedAttributes,
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

    // Notify user about listing creation (fire & forget)
    notifyListingCreated(req.userId!, listing.id, listing.title).catch(() => {});

    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
});

// Update listing
router.put('/:id', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.listing.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!existing) throw new AppError(404, 'Listing not found');
    if (existing.userId !== req.userId) throw new AppError(403, 'Not authorized');

    const { title, description, price, currency, condition, city, latitude, longitude, categoryId, images, status, isOnSale, attributes, videoUrl, negotiable } = req.body;

    // Validate videoUrl (YouTube/Vimeo)
    let sanitizedVideoUrl: string | null | undefined = undefined;
    if (videoUrl !== undefined) {
      if (videoUrl && typeof videoUrl === 'string' && videoUrl.trim()) {
        const vUrl = videoUrl.trim();
        if (vUrl.match(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//)) {
          sanitizedVideoUrl = vUrl;
        } else {
          sanitizedVideoUrl = null;
        }
      } else {
        sanitizedVideoUrl = null;
      }
    }

    // If images provided, delete old and create new
    if (images) {
      await prisma.image.deleteMany({ where: { listingId: existing.id } });
    }

    // Omnibus price tracking
    let priceData: any = {};
    if (price !== undefined) {
      const newPrice = parseFloat(price);

      // Save current price to history
      await prisma.priceHistory.create({
        data: { price: existing.price, listingId: id },
      });

      // Calculate lowest price in last 30 days (Omnibus directive)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const priceHistory = await prisma.priceHistory.findMany({
        where: { listingId: id, createdAt: { gte: thirtyDaysAgo } },
        select: { price: true },
      });
      const allPrices = [existing.price, ...priceHistory.map(p => p.price)];
      const lowestPrice30d = Math.min(...allPrices);

      priceData.price = newPrice;
      priceData.lowestPrice30d = lowestPrice30d;

      // If price is lowered, mark as sale with original price
      if (newPrice < existing.price) {
        priceData.originalPrice = existing.originalPrice || existing.price;
        priceData.isOnSale = true;
      }
    }

    // Allow manually toggling sale off
    if (isOnSale === false) {
      priceData.isOnSale = false;
      priceData.originalPrice = null;
    }

    // Get category for attribute validation
    const targetCategoryId = categoryId || existing.categoryId;
    const targetCategory = categoryId
      ? await prisma.category.findUnique({ where: { id: categoryId } })
      : existing.category;

    // Validate attributes if provided
    let attributesData: any = undefined;
    if (attributes !== undefined) {
      attributesData = validateAttributes(targetCategory?.slug || '', attributes);
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...priceData,
        ...(currency && { currency }),
        ...(condition && { condition }),
        ...(city && { city }),
        ...(status && { status }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(categoryId && { categoryId }),
        ...(attributesData !== undefined && { attributes: attributesData }),
        ...(sanitizedVideoUrl !== undefined && { videoUrl: sanitizedVideoUrl }),
        ...(negotiable !== undefined && { negotiable: negotiable === true }),
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
    const id = req.params.id as string;
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Listing not found');
    if (existing.userId !== req.userId) throw new AppError(403, 'Not authorized');

    await prisma.listing.update({
      where: { id },
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
    const id = req.params.id as string;
    const { status } = req.body;
    if (!status || !['ACTIVE', 'SOLD', 'RESERVED', 'ARCHIVED'].includes(status)) {
      throw new AppError(400, 'Invalid status');
    }

    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Listing not found');
    if (existing.userId !== req.userId) throw new AppError(403, 'Not authorized');

    const listing = await prisma.listing.update({
      where: { id },
      data: { status },
    });

    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

export { router as listingsRouter };
