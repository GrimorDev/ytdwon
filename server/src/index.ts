import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { authRouter } from './routes/auth';
import { listingsRouter } from './routes/listings';
import { categoriesRouter } from './routes/categories';
import { favoritesRouter } from './routes/favorites';
import { chatRouter } from './routes/chat';
import { reviewsRouter } from './routes/reviews';
import { usersRouter } from './routes/users';
import { uploadRouter } from './routes/upload';
import { stripeRouter } from './routes/stripe';
import { reportsRouter } from './routes/reports';
import { adminRouter } from './routes/admin';
import { bannersRouter } from './routes/banners';
import { errorHandler } from './middleware/errorHandler';
import { setupWebSocket } from './websocket';
import { startCronJobs } from './services/cronService';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

setupWebSocket(io);

// Stripe webhook needs raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/conversations', chatRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/banners', bannersRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

// Start cron jobs
startCronJobs();

httpServer.listen(PORT, () => {
  console.log(`Vipile server running on port ${PORT}`);
});

export { io };
