import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { authOptional, attachUserPlan, AuthRequest } from '../middleware/auth';
import {
  getVideoInfo,
  downloadWithProgress,
  downloadEmitter,
  getJob,
  getFilePath,
  getPlaylistItems,
  downloadPlaylistItems,
  getPlaylistJob,
} from '../services/downloadService';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get video info
router.post('/info', async (req: AuthRequest, res: Response, next) => {
  try {
    const { url } = req.body;
    if (!url) throw new AppError(400, 'URL is required');

    const info = await getVideoInfo(url);
    res.json(info);
  } catch (err: any) {
    if (err.message === 'Unsupported platform') {
      return res.status(400).json({ error: 'Nieobslugiwana platforma. Obslugiwane: YouTube, Facebook, Twitter/X, TikTok, Instagram' });
    }
    if (err.message === 'Invalid URL') {
      return res.status(400).json({ error: 'Nieprawidlowy URL' });
    }
    next(err);
  }
});

// Start download - returns jobId for SSE tracking
router.post('/start', authOptional, attachUserPlan, async (req: AuthRequest, res: Response, next) => {
  try {
    const { url, quality, isAudio, outputFormat } = req.body;
    if (!url) throw new AppError(400, 'URL is required');

    const maxQuality = req.userPlan === 'PREMIUM' ? 8640 : 1080;

    // Enforce audio format for free users
    if (req.userPlan !== 'PREMIUM' && isAudio && outputFormat && outputFormat !== 'mp3') {
      throw new AppError(403, 'Formaty WAV i FLAC dostepne tylko w planie Premium. Plan Free obsluguje MP3.');
    }

    const jobId = uuidv4();
    const format = outputFormat || (isAudio ? 'mp3' : 'mp4');

    // Start download in background
    const downloadPromise = downloadWithProgress(jobId, url, quality || '1080', isAudio || false, format, maxQuality);

    // Save to history when done
    downloadPromise.then(async (result) => {
      if (req.userId) {
        await prisma.download.create({
          data: {
            userId: req.userId,
            url,
            platform: result.platform,
            title: result.title,
            thumbnailUrl: result.thumbnail,
            format: isAudio ? 'AUDIO' : 'VIDEO',
            quality: isAudio ? format.toUpperCase() : (quality || '1080p'),
            filename: result.filename,
          },
        });
      }
    }).catch(() => {});

    // Return jobId immediately
    res.json({ jobId });
  } catch (err: any) {
    if (err.message === 'Unsupported platform' || err.message === 'Invalid URL') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// SSE endpoint for download progress
router.get('/progress/:jobId', (req, res) => {
  const { jobId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send current state immediately
  const currentJob = getJob(jobId);
  if (currentJob) {
    res.write(`data: ${JSON.stringify(currentJob)}\n\n`);
  }

  const onProgress = (id: string, data: any) => {
    if (id === jobId) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      if (data.status === 'done' || data.status === 'error') {
        setTimeout(() => res.end(), 500);
      }
    }
  };

  downloadEmitter.on('progress', onProgress);

  req.on('close', () => {
    downloadEmitter.off('progress', onProgress);
  });
});

// Download file
router.get('/file/:filename', (req, res, next) => {
  try {
    const { filename } = req.params;
    const filepath = getFilePath(filename);
    if (!filepath) throw new AppError(404, 'Plik nie znaleziony lub wygasl');
    res.download(filepath);
  } catch (err) {
    next(err);
  }
});

// Get playlist items list (titles + thumbnails)
router.post('/playlist-items', async (req: AuthRequest, res: Response, next) => {
  try {
    const { url } = req.body;
    if (!url) throw new AppError(400, 'URL is required');

    const result = await getPlaylistItems(url);
    res.json(result);
  } catch (err: any) {
    next(err);
  }
});

// Start playlist download (selected items) - returns jobId for SSE tracking
router.post('/playlist/start', authOptional, attachUserPlan, async (req: AuthRequest, res: Response, next) => {
  try {
    const { items, quality, isAudio, outputFormat } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError(400, 'No items selected');
    }

    const maxQuality = req.userPlan === 'PREMIUM' ? 8640 : 1080;
    const maxPlaylistItems = req.userPlan === 'PREMIUM' ? 9999 : 15;

    if (items.length > maxPlaylistItems) {
      throw new AppError(403, `Plan Free pozwala na max ${maxPlaylistItems} utworow z playlisty. Wykup Premium dla nieograniczonych playlist.`);
    }

    // Enforce audio format for free users
    if (req.userPlan !== 'PREMIUM' && isAudio && outputFormat && outputFormat !== 'mp3') {
      throw new AppError(403, 'Formaty WAV i FLAC dostepne tylko w planie Premium. Plan Free obsluguje MP3.');
    }

    const jobId = uuidv4();
    const format = outputFormat || (isAudio ? 'mp3' : 'mp4');

    // Start in background
    const downloadPromise = downloadPlaylistItems(jobId, items, quality || '1080', isAudio || false, format, maxQuality);

    // Save to history when done
    downloadPromise.then(async (result) => {
      if (req.userId) {
        for (const item of result.results) {
          await prisma.download.create({
            data: {
              userId: req.userId,
              url: item.filepath,
              platform: item.platform,
              title: item.title,
              thumbnailUrl: item.thumbnail,
              format: isAudio ? 'AUDIO' : 'VIDEO',
              quality: isAudio ? format.toUpperCase() : (quality || '1080p'),
              filename: item.filename,
            },
          });
        }
      }
    }).catch(() => {});

    res.json({ jobId });
  } catch (err: any) {
    next(err);
  }
});

// SSE for playlist download progress
router.get('/playlist/progress/:jobId', (req, res) => {
  const { jobId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send current state
  const current = getPlaylistJob(jobId);
  if (current) {
    res.write(`data: ${JSON.stringify(current)}\n\n`);
  }

  const onProgress = (id: string, data: any) => {
    if (id === jobId) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      if (data.status === 'done' || data.status === 'error') {
        setTimeout(() => res.end(), 500);
      }
    }
  };

  downloadEmitter.on('playlist-progress', onProgress);

  req.on('close', () => {
    downloadEmitter.off('playlist-progress', onProgress);
  });
});

export { router as downloadRouter };
