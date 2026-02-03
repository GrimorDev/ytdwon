import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function startCronJobs() {
  // Every hour: expire promotions
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await prisma.listing.updateMany({
        where: {
          promoted: true,
          promotedUntil: { lte: new Date() },
        },
        data: {
          promoted: false,
          promotedUntil: null,
        },
      });

      if (result.count > 0) {
        console.log(`Expired ${result.count} promotions`);
      }
    } catch (err) {
      console.error('Cron promotion expiry error:', err);
    }
  });

  console.log('Cron jobs started');
}
