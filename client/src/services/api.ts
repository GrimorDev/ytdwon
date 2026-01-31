import axios from 'axios';
import type { AuthResponse, VideoInfo, Download, PaginatedResponse, DownloadJob, PlaylistItem, PlaylistJob } from '../types';

const api = axios.create({
  baseURL: '/api',
});

// Attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  me: () => api.get<{ user: AuthResponse['user'] }>('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<{ message: string }>('/auth/change-password', data),
  getStats: () => api.get<{
    user: { name: string; email: string; plan: string; createdAt: string; hasStripe: boolean };
    stats: {
      totalDownloads: number;
      recentDownloads: number;
      byPlatform: { platform: string; count: number }[];
      byFormat: { format: string; count: number }[];
      topPlatform: string | null;
    };
  }>('/auth/stats'),
};

// Download
export const downloadApi = {
  getInfo: (url: string) => api.post<VideoInfo>('/download/info', { url }),
  start: (data: { url: string; quality: string; isAudio: boolean; outputFormat?: string }) =>
    api.post<{ jobId: string }>('/download/start', data),
  getFileUrl: (filename: string) => `/api/download/file/${filename}`,
  subscribeProgress: (jobId: string, onData: (job: DownloadJob) => void, onError?: () => void) => {
    const es = new EventSource(`/api/download/progress/${jobId}`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onData(data);
        if (data.status === 'done' || data.status === 'error') {
          es.close();
        }
      } catch {}
    };
    es.onerror = () => {
      onError?.();
      es.close();
    };
    return () => es.close();
  },
  getPlaylistItems: (url: string) =>
    api.post<{ title: string; items: PlaylistItem[] }>('/download/playlist-items', { url }),
  startPlaylist: (data: {
    items: { id: string; title: string; url: string }[];
    quality: string;
    isAudio: boolean;
    outputFormat?: string;
  }) => api.post<{ jobId: string }>('/download/playlist/start', data),
  subscribePlaylistProgress: (jobId: string, onData: (job: PlaylistJob) => void, onError?: () => void) => {
    const es = new EventSource(`/api/download/playlist/progress/${jobId}`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onData(data);
        if (data.status === 'done' || data.status === 'error') {
          es.close();
        }
      } catch {}
    };
    es.onerror = () => {
      onError?.();
      es.close();
    };
    return () => es.close();
  },
};

// History
export const historyApi = {
  getAll: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<Download>>(`/history?page=${page}&limit=${limit}`),
  delete: (id: string) => api.delete(`/history/${id}`),
};

// Stripe
export const stripeApi = {
  createCheckout: () => api.post<{ url: string }>('/stripe/create-checkout'),
  getPortal: () => api.get<{ url: string }>('/stripe/portal'),
};

export default api;
