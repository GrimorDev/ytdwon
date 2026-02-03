import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { authRequired, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PROMOTION_PRICES: Record<string, { days: number; amount: number }> = {
  '7days': { days: 7, amount: 999 },     // 9.99 PLN
  '14days': { days: 14, amount: 1799 },   // 17.99 PLN
  '30days': { days: 30, amount: 2999 },   // 29.99 PLN
};

// Create checkout for promoting a listing
router.post('/promote', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const { listingId, plan } = req.body;

    if (!listingId || !plan || !PROMOTION_PRICES[plan]) {
      throw new AppError(400, 'Valid listing ID and promotion plan are required');
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new AppError(404, 'Listing not found');
    if (listing.userId !== req.userId) throw new AppError(403, 'Not authorized');

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) throw new AppError(404, 'User not found');

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceInfo = PROMOTION_PRICES[plan];

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: `Promowanie ogloszenia: ${listing.title}`,
              description: `${priceInfo.days} dni promowania`,
            },
            unit_amount: priceInfo.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        listingId,
        promotionDays: priceInfo.days.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/moje-ogloszenia?promoted=true`,
      cancel_url: `${process.env.CLIENT_URL}/promuj/${listingId}?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

// Customer portal
router.get('/portal', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user?.stripeCustomerId) {
      throw new AppError(400, 'No payment history found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/konto`,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

// Webhook
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const listingId = session.metadata?.listingId;
      const promotionDays = parseInt(session.metadata?.promotionDays || '0');

      if (listingId && promotionDays > 0) {
        const promotedUntil = new Date();
        promotedUntil.setDate(promotedUntil.getDate() + promotionDays);

        await prisma.listing.update({
          where: { id: listingId },
          data: {
            promoted: true,
            promotedUntil,
          },
        });
        console.log(`Listing ${listingId} promoted until ${promotedUntil.toISOString()}`);
      }
      break;
    }
  }

  res.json({ received: true });
});

export { router as stripeRouter };
