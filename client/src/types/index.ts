export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'PREMIUM';
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

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

export type Platform = 'YOUTUBE' | 'FACEBOOK' | 'TWITTER' | 'TIKTOK' | 'INSTAGRAM';

export interface DownloadJob {
  id: string;
  status: 'queued' | 'fetching_info' | 'downloading' | 'converting' | 'done' | 'error';
  progress: number;
  speed?: string;
  eta?: string;
  title: string;
  thumbnail: string;
  platform: Platform;
  filename?: string;
  error?: string;
  format: string;
  isAudio: boolean;
  quality: string;
  url: string;
}

export interface QueueItem {
  id: string;
  url: string;
  quality: string;
  isAudio: boolean;
  outputFormat: string;
  title?: string;
  thumbnail?: string;
}

export interface Download {
  id: string;
  url: string;
  platform: Platform;
  title: string;
  thumbnailUrl: string | null;
  format: 'VIDEO' | 'AUDIO';
  quality: string;
  filename: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  downloads: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PlaylistItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  url: string;
  index: number;
}

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
