import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get my conversations
router.get('/', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: req.userId },
          { participant2Id: req.userId },
        ],
      },
      include: {
        listing: {
          select: { id: true, title: true, price: true, images: { take: 1, orderBy: { order: 'asc' } } },
        },
        participant1: { select: { id: true, name: true, avatarUrl: true } },
        participant2: { select: { id: true, name: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Count unread for each conversation
    const withUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: req.userId },
            read: false,
          },
        });

        const otherUser = conv.participant1Id === req.userId ? conv.participant2 : conv.participant1;

        return {
          id: conv.id,
          listing: conv.listing,
          otherUser,
          lastMessage: conv.messages[0] || null,
          unreadCount,
          updatedAt: conv.updatedAt,
        };
      })
    );

    res.json({ conversations: withUnread });
  } catch (err) {
    next(err);
  }
});

// Get unread count
router.get('/unread-count', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const count = await prisma.message.count({
      where: {
        senderId: { not: req.userId },
        read: false,
        conversation: {
          OR: [
            { participant1Id: req.userId },
            { participant2Id: req.userId },
          ],
        },
      },
    });

    res.json({ count });
  } catch (err) {
    next(err);
  }
});

// Get messages in conversation
router.get('/:id/messages', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
    });

    if (!conversation) throw new AppError(404, 'Conversation not found');
    if (conversation.participant1Id !== req.userId && conversation.participant2Id !== req.userId) {
      throw new AppError(403, 'Not authorized');
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = 50;

    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Mark as read
    await prisma.message.updateMany({
      where: {
        conversationId: req.params.id,
        senderId: { not: req.userId },
        read: false,
      },
      data: { read: true },
    });

    res.json({ messages: messages.reverse() });
  } catch (err) {
    next(err);
  }
});

// Start conversation (or get existing)
router.post('/', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { listingId, message } = req.body;

    if (!listingId || !message) {
      throw new AppError(400, 'Listing ID and message are required');
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new AppError(404, 'Listing not found');
    if (listing.userId === req.userId) throw new AppError(400, 'Cannot message yourself');

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        listingId,
        OR: [
          { participant1Id: req.userId, participant2Id: listing.userId },
          { participant1Id: listing.userId, participant2Id: req.userId },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          listingId,
          participant1Id: req.userId!,
          participant2Id: listing.userId,
        },
      });
    }

    // Create message
    const msg = await prisma.message.create({
      data: {
        content: message,
        senderId: req.userId!,
        conversationId: conversation.id,
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ conversation: { id: conversation.id }, message: msg });
  } catch (err) {
    next(err);
  }
});

// Send message in existing conversation
router.post('/:id/messages', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
    });

    if (!conversation) throw new AppError(404, 'Conversation not found');
    if (conversation.participant1Id !== req.userId && conversation.participant2Id !== req.userId) {
      throw new AppError(403, 'Not authorized');
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      throw new AppError(400, 'Message content is required');
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: req.userId!,
        conversationId: conversation.id,
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
});

// Mark conversation as read
router.patch('/:id/read', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.message.updateMany({
      where: {
        conversationId: req.params.id,
        senderId: { not: req.userId },
        read: false,
      },
      data: { read: true },
    });

    res.json({ message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
});

export { router as chatRouter };
