import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { authRequired, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create checkout session
router.post('/create-checkout', authRequired, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) throw new AppError(404, 'User not found');

    if (user.plan === 'PREMIUM') {
      throw new AppError(400, 'Already subscribed to Premium');
    }

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

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/pricing?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?canceled=true`,
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
      throw new AppError(400, 'No subscription found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/pricing`,
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
      if (session.customer) {
        await prisma.user.updateMany({
          where: { stripeCustomerId: session.customer as string },
          data: { plan: 'PREMIUM' },
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.customer) {
        await prisma.user.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: { plan: 'FREE' },
        });
      }
      break;
    }
  }

  res.json({ received: true });
});

export { router as stripeRouter };
