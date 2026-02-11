import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all notifications for current user (paginated)
router.get('/', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    res.json({
      notifications,
      unreadCount,
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

// Get unread count
router.get('/unread-count', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId!;
    const count = await prisma.notification.count({
      where: { userId, read: false },
    });
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

// Mark single notification as read
router.patch('/:id/read', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({ notification: updated });
  } catch (err) {
    next(err);
  }
});

// Mark all notifications as read
router.patch('/read-all', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId!;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Delete a notification
router.delete('/:id', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export { router as notificationsRouter };
