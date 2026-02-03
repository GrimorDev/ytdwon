import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthSocket extends Socket {
  userId?: string;
}

export function setupWebSocket(io: Server) {
  // Auth middleware
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    const userId = socket.userId!;

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Send message
    socket.on('send_message', async (data: { conversationId: string; content: string }) => {
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: data.conversationId },
        });

        if (!conversation) return;
        if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) return;

        const message = await prisma.message.create({
          data: {
            content: data.content.trim(),
            senderId: userId,
            conversationId: data.conversationId,
          },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } },
          },
        });

        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: { updatedAt: new Date() },
        });

        // Send to conversation room
        io.to(`conversation:${data.conversationId}`).emit('new_message', message);

        // Notify other participant
        const otherUserId = conversation.participant1Id === userId
          ? conversation.participant2Id
          : conversation.participant1Id;

        io.to(`user:${otherUserId}`).emit('message_notification', {
          conversationId: data.conversationId,
          message,
        });
      } catch (err) {
        console.error('WebSocket send_message error:', err);
      }
    });

    // Typing indicator
    socket.on('typing', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
        userId,
        conversationId: data.conversationId,
      });
    });

    // Mark as read
    socket.on('mark_read', async (conversationId: string) => {
      try {
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: userId },
            read: false,
          },
          data: { read: true },
        });

        socket.to(`conversation:${conversationId}`).emit('messages_read', {
          conversationId,
          readBy: userId,
        });
      } catch (err) {
        console.error('WebSocket mark_read error:', err);
      }
    });

    socket.on('disconnect', () => {
      // Cleanup if needed
    });
  });
}
