import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { Platform } from '@prisma/client';
import archiver from 'archiver';

const execAsync = promisify(exec);

const DOWNLOADS_DIR = path.join(__dirname, '../../downloads');

// yt-dlp and ffmpeg paths (winget installs them outside default PATH)
const YTDLP_DIR = path.join(
  process.env.LOCALAPPDATA || '',
  'Microsoft/WinGet/Packages/yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe',
);
const FFMPEG_DIR = path.join(
  process.env.LOCALAPPDATA || '',
  'Microsoft/WinGet/Packages/yt-dlp.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe',
);

function findFfmpegBin(): string {
  try {
    const entries = fs.readdirSync(FFMPEG_DIR);
    const ffmpegFolder = entries.find((e) => e.startsWith('ffmpeg-'));
    if (ffmpegFolder) return path.join(FFMPEG_DIR, ffmpegFolder, 'bin');
  } catch {}
  return '';
}

const FFMPEG_BIN = findFfmpegBin();
const EXTRA_PATH = [YTDLP_DIR, FFMPEG_BIN].filter(Boolean).join(path.delimiter);
const EXEC_ENV = {
  ...process.env,
  PATH: EXTRA_PATH + path.delimiter + (process.env.PATH || ''),
};

function runCmd(command: string, options: any = {}) {
  return execAsync(command, { ...options, env: EXEC_ENV });
}

function findYtdlp(): string {
  const ytdlpPath = path.join(YTDLP_DIR, 'yt-dlp.exe');
  if (fs.existsSync(ytdlpPath)) return ytdlpPath;
  return 'yt-dlp'; // fallback to PATH
}

const YTDLP_BIN = findYtdlp();

// Cookies file for YouTube bot detection bypass
const COOKIES_PATH = path.join(__dirname, '../../cookies.txt');

// PO Token provider (bgutil-ytdlp-pot-provider)
const BGUTIL_PROVIDER_URL = process.env.BGUTIL_PROVIDER_URL || '';

function hasCookies(): boolean {
  try {
    if (!fs.existsSync(COOKIES_PATH)) return false;
    const content = fs.readFileSync(COOKIES_PATH, 'utf-8');
    return content.split('\n').some(line => line.trim() && !line.startsWith('#'));
  } catch {
    return false;
  }
}

// Extra yt-dlp flags for Docker environment
function getYtdlpFlags(): string[] {
  const flags: string[] = ['--js-runtimes', 'nodejs'];
  if (BGUTIL_PROVIDER_URL) {
    flags.push('--extractor-args', `youtubepot-bgutilhttp:base_url=${BGUTIL_PROVIDER_URL}`);
  }
  if (hasCookies()) {
    flags.push('--cookies', COOKIES_PATH);
  }
  return flags;
}

function getYtdlpFlagsStr(): string {
  // For exec() shell commands — only quote args with spaces
  return getYtdlpFlags().map(f => f.includes(' ') ? `'${f}'` : f).join(' ');
}

// Log status on startup
console.log(`[yt-dlp] PO Token provider: ${BGUTIL_PROVIDER_URL || 'NOT CONFIGURED'}`);
console.log(`[yt-dlp] Cookies file: ${hasCookies() ? 'FOUND' : 'not found'}`);
console.log(`[yt-dlp] JS runtime: nodejs`);

if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

// ==================== Progress tracking ====================
export const downloadEmitter = new EventEmitter();
downloadEmitter.setMaxListeners(100);

interface DownloadJob {
  id: string;
  url: string;
  quality: string;
  isAudio: boolean;
  format: string; // output format: mp3, mp4, wav, flac, webm, avi
  status: 'queued' | 'fetching_info' | 'downloading' | 'converting' | 'done' | 'error';
  progress: number;
  speed?: string;
  eta?: string;
  title: string;
  thumbnail: string;
  platform: Platform;
  filename?: string;
  error?: string;
}

const activeJobs = new Map<string, DownloadJob>();

export function getJob(jobId: string): DownloadJob | undefined {
  return activeJobs.get(jobId);
}

// ==================== Types ====================
export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
  formats: FormatInfo[];
  platform: Platform;
  isPlaylist: boolean;
  playlistCount?: number;
}

export interface FormatInfo {
  formatId: string;
  ext: string;
  quality: string;
  resolution?: string;
  filesize?: number;
  isAudioOnly: boolean;
}

// ==================== Helpers ====================
function detectPlatform(url: string): Platform {
  const hostname = new URL(url).hostname.toLowerCase();
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'YOUTUBE';
  if (hostname.includes('facebook.com') || hostname.includes('fb.watch')) return 'FACEBOOK';
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'TWITTER';
  if (hostname.includes('tiktok.com')) return 'TIKTOK';
  if (hostname.includes('instagram.com')) return 'INSTAGRAM';
  throw new Error('Unsupported platform');
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

interface ProgressInfo {
  percent: number;
  speed?: string;
  eta?: string;
}

function parseProgress(line: string): ProgressInfo | null {
  // yt-dlp outputs lines like: [download]  45.2% of ~5.30MiB at  2.50MiB/s ETA 00:02
  const match = line.match(/\[download\]\s+([\d.]+)%/);
  if (!match) return null;

  const result: ProgressInfo = { percent: parseFloat(match[1]) };

  const speedMatch = line.match(/at\s+([\d.]+\S+\/s)/);
  if (speedMatch) result.speed = speedMatch[1];

  const etaMatch = line.match(/ETA\s+(\S+)/);
  if (etaMatch) result.eta = etaMatch[1];

  return result;
}

// ==================== Audio format mapping ====================
const AUDIO_FORMATS: Record<string, string> = {
  mp3: 'mp3',
  wav: 'wav',
  flac: 'flac',
};

const VIDEO_FORMATS: Record<string, string> = {
  mp4: 'mp4',
  webm: 'webm',
  avi: 'avi',
};

// ==================== Get video info ====================
export async function getVideoInfo(url: string): Promise<VideoInfo> {
  if (!isValidUrl(url)) throw new Error('Invalid URL');

  const platform = detectPlatform(url);

  // Check if playlist
  const isPlaylist = url.includes('list=') && url.includes('youtube.com');

  if (isPlaylist) {
    const { stdout } = await runCmd(
      `yt-dlp ${getYtdlpFlagsStr()} --flat-playlist --dump-json "${url}"`,
      { maxBuffer: 50 * 1024 * 1024 },
    );
    const lines = stdout.toString().trim().split('\n');
    const firstItem = JSON.parse(lines[0]);

    return {
      title: firstItem.playlist_title || firstItem.title || 'Playlist',
      thumbnail: firstItem.thumbnails?.[0]?.url || '',
      duration: 0,
      formats: [
        { formatId: 'bestaudio', ext: 'mp3', quality: 'MP3 Audio', isAudioOnly: true },
        { formatId: 'best[height<=480]', ext: 'mp4', quality: '480p', isAudioOnly: false },
        { formatId: 'best[height<=720]', ext: 'mp4', quality: '720p', isAudioOnly: false },
        { formatId: 'best[height<=1080]', ext: 'mp4', quality: '1080p', isAudioOnly: false },
      ],
      platform,
      isPlaylist: true,
      playlistCount: lines.length,
    };
  }

  const { stdout } = await runCmd(
    `yt-dlp ${getYtdlpFlagsStr()} --dump-json --no-download "${url}"`,
    { maxBuffer: 10 * 1024 * 1024 },
  );

  const data = JSON.parse(stdout.toString());
  const formats: FormatInfo[] = [];
  const seenQualities = new Set<string>();

  // Audio formats
  formats.push({ formatId: 'bestaudio', ext: 'mp3', quality: 'MP3 Audio', isAudioOnly: true });
  formats.push({ formatId: 'bestaudio', ext: 'wav', quality: 'WAV Audio', isAudioOnly: true });
  formats.push({ formatId: 'bestaudio', ext: 'flac', quality: 'FLAC Audio', isAudioOnly: true });

  // Video formats
  if (data.formats) {
    const videoFormats = data.formats
      .filter((f: any) => f.vcodec !== 'none' && f.height)
      .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

    for (const f of videoFormats) {
      const quality = `${f.height}p`;
      if (!seenQualities.has(quality)) {
        seenQualities.add(quality);
        formats.push({
          formatId: f.format_id,
          ext: f.ext || 'mp4',
          quality,
          resolution: `${f.width}x${f.height}`,
          filesize: f.filesize || f.filesize_approx,
          isAudioOnly: false,
        });
      }
    }
  }

  if (seenQualities.size === 0) {
    formats.push(
      { formatId: 'best[height<=480]', ext: 'mp4', quality: '480p', isAudioOnly: false },
      { formatId: 'best[height<=720]', ext: 'mp4', quality: '720p', isAudioOnly: false },
      { formatId: 'best[height<=1080]', ext: 'mp4', quality: '1080p', isAudioOnly: false },
    );
  }

  return {
    title: data.title || 'Unknown',
    thumbnail: data.thumbnail || '',
    duration: data.duration || 0,
    formats,
    platform,
    isPlaylist: false,
  };
}

// ==================== Download with progress ====================
export interface DownloadResult {
  filename: string;
  filepath: string;
  title: string;
  thumbnail: string;
  platform: Platform;
}

export async function downloadWithProgress(
  jobId: string,
  url: string,
  quality: string,
  isAudio: boolean,
  outputFormat: string,
  maxQuality: number,
  trimStart?: string,
  trimEnd?: string,
): Promise<DownloadResult> {
  if (!isValidUrl(url)) throw new Error('Invalid URL');

  const platform = detectPlatform(url);
  const fileId = uuidv4();

  const job: DownloadJob = {
    id: jobId,
    url,
    quality,
    isAudio,
    format: outputFormat,
    status: 'fetching_info',
    progress: 0,
    title: 'Unknown',
    thumbnail: '',
    platform,
  };
  activeJobs.set(jobId, job);
  downloadEmitter.emit('progress', jobId, { ...job });

  // Fetch metadata first
  try {
    const { stdout } = await runCmd(
      `yt-dlp ${getYtdlpFlagsStr()} --dump-json --no-download "${url}"`,
      { maxBuffer: 10 * 1024 * 1024 },
    );
    const meta = JSON.parse(stdout.toString());
    job.title = meta.title || 'Unknown';
    job.thumbnail = meta.thumbnail || '';
    downloadEmitter.emit('progress', jobId, { ...job });
  } catch {}

  // Build command args
  const args: string[] = [...getYtdlpFlags()];
  let outputExt: string;

  if (isAudio) {
    outputExt = AUDIO_FORMATS[outputFormat] || 'mp3';
    args.push('-x', '--audio-format', outputExt);
  } else {
    outputExt = VIDEO_FORMATS[outputFormat] || 'mp4';
    const requestedHeight = parseInt(quality) || 1080;
    const effectiveHeight = Math.min(requestedHeight, maxQuality);

    if (outputExt === 'mp4') {
      args.push('-f', `bestvideo[height<=${effectiveHeight}]+bestaudio/best[height<=${effectiveHeight}]`);
      args.push('--merge-output-format', 'mp4');
    } else if (outputExt === 'webm') {
      args.push('-f', `bestvideo[height<=${effectiveHeight}]+bestaudio/best[height<=${effectiveHeight}]`);
      args.push('--merge-output-format', 'webm');
    } else {
      // avi etc - download as mp4 then let ffmpeg handle
      args.push('-f', `bestvideo[height<=${effectiveHeight}]+bestaudio/best[height<=${effectiveHeight}]`);
      args.push('--merge-output-format', 'mp4');
      args.push('--recode-video', outputExt);
    }
  }

  const outputPath = path.join(DOWNLOADS_DIR, `${fileId}.${outputExt}`);
  args.push('--newline'); // Each progress line on its own line
  args.push('-o', outputPath);
  args.push(url);

  job.status = 'downloading';
  job.progress = 0;
  downloadEmitter.emit('progress', jobId, { ...job });

  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP_BIN, args, {
      env: EXEC_ENV,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let lastProgress = 0;

    const handleOutput = (data: Buffer) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        const info = parseProgress(line);
        if (info !== null && info.percent > lastProgress) {
          lastProgress = info.percent;
          job.progress = Math.round(info.percent);
          if (info.speed) job.speed = info.speed;
          if (info.eta) job.eta = info.eta;
          downloadEmitter.emit('progress', jobId, { ...job });
        }
        // Detect merging/conversion phase
        if (line.includes('[Merger]') || line.includes('[ExtractAudio]') || line.includes('[VideoConvertor]')) {
          job.status = 'converting';
          job.speed = undefined;
          job.eta = undefined;
          downloadEmitter.emit('progress', jobId, { ...job });
        }
      }
    };

    proc.stdout.on('data', handleOutput);
    proc.stderr.on('data', handleOutput);

    proc.on('close', async (code) => {
      if (code === 0) {
        let finalPath = outputPath;
        let finalFilename = `${fileId}.${outputExt}`;

        // Apply trim if requested
        if (trimStart || trimEnd) {
          try {
            job.status = 'converting';
            job.speed = undefined;
            job.eta = undefined;
            downloadEmitter.emit('progress', jobId, { ...job });

            const trimmedId = `${fileId}_trimmed`;
            const trimmedPath = path.join(DOWNLOADS_DIR, `${trimmedId}.${outputExt}`);
            const ffmpegArgs = ['ffmpeg', '-i', outputPath];
            if (trimStart) ffmpegArgs.push('-ss', trimStart);
            if (trimEnd) ffmpegArgs.push('-to', trimEnd);
            ffmpegArgs.push('-c', 'copy', trimmedPath);

            await runCmd(ffmpegArgs.join(' '));

            // Replace original with trimmed
            fs.unlinkSync(outputPath);
            finalPath = trimmedPath;
            finalFilename = `${trimmedId}.${outputExt}`;
          } catch (trimErr) {
            // If trim fails, keep original
            console.error('Trim failed:', trimErr);
          }
        }

        job.status = 'done';
        job.progress = 100;
        job.filename = finalFilename;
        downloadEmitter.emit('progress', jobId, { ...job });

        // Clean up job after 5 min
        setTimeout(() => activeJobs.delete(jobId), 5 * 60 * 1000);

        resolve({
          filename: finalFilename,
          filepath: finalPath,
          title: job.title,
          thumbnail: job.thumbnail,
          platform,
        });
      } else {
        job.status = 'error';
        job.error = 'Download failed';
        downloadEmitter.emit('progress', jobId, { ...job });
        setTimeout(() => activeJobs.delete(jobId), 60 * 1000);
        reject(new Error('Download failed'));
      }
    });

    proc.on('error', (err) => {
      job.status = 'error';
      job.error = err.message;
      downloadEmitter.emit('progress', jobId, { ...job });
      setTimeout(() => activeJobs.delete(jobId), 60 * 1000);
      reject(err);
    });
  });
}

// Legacy wrapper (used by playlist)
export async function downloadVideo(
  url: string,
  quality: string,
  isAudio: boolean,
  maxQuality: number,
): Promise<DownloadResult> {
  const jobId = uuidv4();
  return downloadWithProgress(jobId, url, quality, isAudio, isAudio ? 'mp3' : 'mp4', maxQuality);
}

export function getFilePath(filename: string): string | null {
  const sanitized = path.basename(filename);
  const filepath = path.join(DOWNLOADS_DIR, sanitized);
  if (fs.existsSync(filepath)) return filepath;
  return null;
}

// ==================== Playlist ====================
export interface PlaylistItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  url: string;
  index: number;
}

export async function getPlaylistItems(url: string): Promise<{ title: string; items: PlaylistItem[] }> {
  if (!isValidUrl(url)) throw new Error('Invalid URL');

  const { stdout } = await runCmd(
    `yt-dlp ${getYtdlpFlagsStr()} --flat-playlist --dump-json "${url}"`,
    { maxBuffer: 50 * 1024 * 1024 },
  );
  const lines = stdout.toString().trim().split('\n');
  const parsed = lines.map((l: string) => JSON.parse(l));

  const playlistTitle = parsed[0]?.playlist_title || 'Playlist';

  const items: PlaylistItem[] = parsed.map((item: any, idx: number) => ({
    id: item.id || `item-${idx}`,
    title: item.title || `Video ${idx + 1}`,
    thumbnail: item.thumbnails?.[item.thumbnails.length - 1]?.url || item.thumbnail || '',
    duration: item.duration || 0,
    url: item.url?.startsWith('http') ? item.url : `https://www.youtube.com/watch?v=${item.id}`,
    index: idx,
  }));

  return { title: playlistTitle, items };
}

// Playlist download job tracking
export interface PlaylistJob {
  id: string;
  status: 'downloading' | 'zipping' | 'done' | 'error';
  totalItems: number;
  completedItems: number;
  failedItems: number;
  currentItemTitle: string;
  currentItemProgress: number;
  zipFilename?: string;
  error?: string;
}

const activePlaylistJobs = new Map<string, PlaylistJob>();

export function getPlaylistJob(jobId: string): PlaylistJob | undefined {
  return activePlaylistJobs.get(jobId);
}

export async function downloadPlaylistItems(
  jobId: string,
  items: { id: string; title: string; url: string }[],
  quality: string,
  isAudio: boolean,
  outputFormat: string,
  maxQuality: number,
): Promise<{ zipFilename: string; results: DownloadResult[]; failed: number }> {
  const pJob: PlaylistJob = {
    id: jobId,
    status: 'downloading',
    totalItems: items.length,
    completedItems: 0,
    failedItems: 0,
    currentItemTitle: '',
    currentItemProgress: 0,
  };
  activePlaylistJobs.set(jobId, pJob);
  downloadEmitter.emit('playlist-progress', jobId, { ...pJob });

  const results: DownloadResult[] = [];
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    pJob.currentItemTitle = item.title;
    pJob.currentItemProgress = 0;
    downloadEmitter.emit('playlist-progress', jobId, { ...pJob });

    const itemJobId = `${jobId}-item-${i}`;

    // Listen for individual item progress to relay to playlist progress
    const onItemProgress = (id: string, data: any) => {
      if (id === itemJobId && data.progress !== undefined) {
        pJob.currentItemProgress = data.progress;
        downloadEmitter.emit('playlist-progress', jobId, { ...pJob });
      }
    };
    downloadEmitter.on('progress', onItemProgress);

    try {
      const result = await downloadWithProgress(
        itemJobId, item.url, quality, isAudio, outputFormat, maxQuality,
      );
      results.push(result);
      pJob.completedItems++;
    } catch {
      failed++;
      pJob.failedItems++;
    }

    downloadEmitter.off('progress', onItemProgress);
    pJob.currentItemProgress = 100;
    downloadEmitter.emit('playlist-progress', jobId, { ...pJob });
  }

  // Create ZIP
  pJob.status = 'zipping';
  pJob.currentItemTitle = 'Tworzenie archiwum ZIP...';
  downloadEmitter.emit('playlist-progress', jobId, { ...pJob });

  const zipId = uuidv4();
  const zipFilename = `${zipId}.zip`;
  const zipPath = path.join(DOWNLOADS_DIR, zipFilename);

  await new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 5 } });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    for (const result of results) {
      const ext = path.extname(result.filename);
      // Sanitize title for filename
      const safeName = result.title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
      archive.file(result.filepath, { name: `${safeName}${ext}` });
    }

    archive.finalize();
  });

  pJob.status = 'done';
  pJob.zipFilename = zipFilename;
  downloadEmitter.emit('playlist-progress', jobId, { ...pJob });

  // Clean up individual files after 5 min (keep zip)
  setTimeout(() => {
    for (const result of results) {
      try { fs.unlinkSync(result.filepath); } catch {}
    }
    activePlaylistJobs.delete(jobId);
  }, 10 * 60 * 1000);

  return { zipFilename, results, failed };
}

// ==================== Cleanup ====================
export function cleanupOldFiles() {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000;
  try {
    const files = fs.readdirSync(DOWNLOADS_DIR);
    for (const file of files) {
      const filepath = path.join(DOWNLOADS_DIR, file);
      const stat = fs.statSync(filepath);
      if (now - stat.mtimeMs > maxAge) fs.unlinkSync(filepath);
    }
  } catch {}
}

setInterval(cleanupOldFiles, 30 * 60 * 1000);
