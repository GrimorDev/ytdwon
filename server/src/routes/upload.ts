import { Router, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authRequired, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

// Upload images (max 8)
router.post('/images', authRequired, upload.array('images', 8), async (req: AuthRequest, res: Response, next) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError(400, 'No images provided');
    }

    const urls: string[] = [];

    for (const file of files) {
      const filename = `${uuidv4()}.webp`;
      const filepath = path.join(uploadsDir, filename);

      await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filepath);

      urls.push(`/uploads/${filename}`);
    }

    res.json({ urls });
  } catch (err) {
    next(err);
  }
});

// Upload avatar
router.post('/avatar', authRequired, upload.single('avatar'), async (req: AuthRequest, res: Response, next) => {
  try {
    const file = req.file;
    if (!file) throw new AppError(400, 'No image provided');

    const filename = `avatar-${req.userId}.webp`;
    const filepath = path.join(uploadsDir, filename);

    await sharp(file.buffer)
      .resize(300, 300, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(filepath);

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.user.update({
      where: { id: req.userId },
      data: { avatarUrl: `/uploads/${filename}` },
    });

    res.json({ url: `/uploads/${filename}` });
  } catch (err) {
    next(err);
  }
});

export { router as uploadRouter };
