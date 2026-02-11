import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { notifyPromotionExpired, notifyPromotionExpiring } from '../utils/notifications';

const prisma = new PrismaClient();

export function startCronJobs() {
  // Every hour: expire promotions and notify owners
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Warn about promotions expiring within 24h
      const expiringSoon = await prisma.listing.findMany({
        where: {
          promoted: true,
          promotedUntil: { gt: now, lte: in24h },
        },
        select: { id: true, title: true, userId: true, promotedUntil: true },
      });

      for (const listing of expiringSoon) {
        const hoursLeft = Math.ceil((listing.promotedUntil!.getTime() - now.getTime()) / (1000 * 60 * 60));
        const daysLeft = hoursLeft <= 24 ? 1 : Math.ceil(hoursLeft / 24);
        // Only notify once per day (check if we already notified recently)
        const recentNotif = await prisma.notification.findFirst({
          where: {
            userId: listing.userId,
            type: 'PROMOTION_EXPIRING',
            link: `/promuj/${listing.id}`,
            createdAt: { gt: new Date(now.getTime() - 20 * 60 * 60 * 1000) },
          },
        });
        if (!recentNotif) {
          notifyPromotionExpiring(listing.userId, listing.id, listing.title, daysLeft).catch(() => {});
        }
      }

      // Now expire promotions that have passed
      const expiredListings = await prisma.listing.findMany({
        where: {
          promoted: true,
          promotedUntil: { lte: now },
        },
        select: { id: true, title: true, userId: true },
      });

      if (expiredListings.length > 0) {
        await prisma.listing.updateMany({
          where: {
            promoted: true,
            promotedUntil: { lte: now },
          },
          data: {
            promoted: false,
            promotedUntil: null,
          },
        });

        console.log(`Expired ${expiredListings.length} promotions`);

        // Notify each owner
        for (const listing of expiredListings) {
          notifyPromotionExpired(listing.userId, listing.id, listing.title).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Cron promotion expiry error:', err);
    }
  });

  console.log('Cron jobs started');
}
