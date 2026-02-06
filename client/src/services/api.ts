import axios from 'axios';
import type { AuthResponse, Listing, Category, Conversation, Message, Review, PaginatedResponse, UserStats, AutocompleteSuggestion, Report, AdminStats, AdminUser, AdminConversation, ReportCategory, Banner, NewsletterSubscriber, SiteStats } from '../types';

const api = axios.create({
  baseURL: '/api',
});

// Attach token
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
          window.location.href = '/logowanie';
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
  getStats: () => api.get<UserStats>('/auth/stats'),
};

// Listings
export const listingsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    sort?: string;
    userId?: string;
    attributes?: Record<string, string>;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      const { attributes, ...rest } = params;
      Object.entries(rest).forEach(([key, val]) => {
        if (val !== undefined && val !== '') searchParams.set(key, String(val));
      });
      // Serialize attributes as attr_* params
      if (attributes) {
        Object.entries(attributes).forEach(([key, val]) => {
          if (val !== undefined && val !== '') searchParams.set(`attr_${key}`, val);
        });
      }
    }
    return api.get<PaginatedResponse<Listing>>(`/listings?${searchParams.toString()}`);
  },
  autocomplete: (q: string, limit = 6) =>
    api.get<{ suggestions: AutocompleteSuggestion[] }>(`/listings/autocomplete?q=${encodeURIComponent(q)}&limit=${limit}`),
  getMy: (status?: string) =>
    api.get<{ listings: Listing[] }>(`/listings/my${status ? `?status=${status}` : ''}`),
  getById: (id: string) => api.get<{ listing: Listing }>(`/listings/${id}`),
  create: (data: any) => api.post<{ listing: Listing }>('/listings', data),
  update: (id: string, data: any) => api.put<{ listing: Listing }>(`/listings/${id}`, data),
  delete: (id: string) => api.delete(`/listings/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/listings/${id}/status`, { status }),
};

// Categories
export const categoriesApi = {
  getAll: () => api.get<{ categories: Category[] }>('/categories'),
  getBySlug: (slug: string) => api.get<{ category: Category }>(`/categories/${slug}`),
};

// Favorites
export const favoritesApi = {
  getAll: () => api.get<{ favorites: { id: string; listing: Listing; createdAt: string }[] }>('/favorites'),
  toggle: (listingId: string) => api.post<{ favorited: boolean }>(`/favorites/${listingId}`),
};

// Chat
export const chatApi = {
  getConversations: () => api.get<{ conversations: Conversation[] }>('/conversations'),
  getMessages: (conversationId: string, page?: number) =>
    api.get<{ messages: Message[] }>(`/conversations/${conversationId}/messages?page=${page || 1}`),
  startConversation: (listingId: string, message: string) =>
    api.post<{ conversation: { id: string }; message: Message }>('/conversations', { listingId, message }),
  sendMessage: (conversationId: string, content: string) =>
    api.post<{ message: Message }>(`/conversations/${conversationId}/messages`, { content }),
  getUnreadCount: () => api.get<{ count: number }>('/conversations/unread-count'),
  markAsRead: (conversationId: string) => api.patch(`/conversations/${conversationId}/read`),
};

// Reviews
export const reviewsApi = {
  getForUser: (userId: string) =>
    api.get<{ reviews: Review[]; stats: { avgRating: number; count: number } }>(`/reviews/${userId}`),
  getRating: (userId: string) =>
    api.get<{ average: number; count: number }>(`/reviews/${userId}/rating`),
  create: (userId: string, data: { rating: number; comment?: string }) =>
    api.post<{ review: Review }>(`/reviews/${userId}`, data),
};

// Users
export const usersApi = {
  getProfile: (id: string) => api.get<{ user: any }>(`/users/${id}`),
  updateProfile: (data: any) => api.put<{ user: any }>('/users/profile', data),
};

// Upload
export const uploadApi = {
  images: (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    return api.post<{ urls: string[] }>('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  avatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post<{ url: string }>('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Stripe
export const stripeApi = {
  promote: (listingId: string, plan: string) =>
    api.post<{ url: string }>('/stripe/promote', { listingId, plan }),
  getPortal: () => api.get<{ url: string }>('/stripe/portal'),
};

// Reports
export const reportsApi = {
  create: (data: { listingId: string; category: ReportCategory; subcategory: string; explanation: string }) =>
    api.post<{ report: Report }>('/reports', data),
  getMine: () => api.get<{ reports: Report[] }>('/reports/mine'),
};

// Admin
export const adminApi = {
  getStats: () => api.get<AdminStats>('/admin/stats'),

  // Listings
  getListings: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const sp = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') sp.set(k, String(v));
      });
    }
    return api.get<{ listings: Listing[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/admin/listings?${sp.toString()}`);
  },
  getListing: (id: string) => api.get<{ listing: Listing }>(`/admin/listings/${id}`),
  updateListing: (id: string, data: any) => api.put<{ listing: Listing }>(`/admin/listings/${id}`, data),
  deleteListing: (id: string) => api.delete(`/admin/listings/${id}`),

  // Users
  getUsers: (params?: { page?: number; limit?: number; search?: string; blocked?: string; role?: string }) => {
    const sp = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') sp.set(k, String(v));
      });
    }
    return api.get<{ users: AdminUser[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/admin/users?${sp.toString()}`);
  },
  getUser: (id: string) => api.get<{ user: AdminUser }>(`/admin/users/${id}`),
  blockUser: (id: string, data: { blocked: boolean; blockedReason?: string }) =>
    api.patch<{ user: AdminUser }>(`/admin/users/${id}/block`, data),
  changeRole: (id: string, role: string) =>
    api.patch<{ user: AdminUser }>(`/admin/users/${id}/role`, { role }),

  // Reports
  getReports: (params?: { page?: number; limit?: number; status?: string }) => {
    const sp = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') sp.set(k, String(v));
      });
    }
    return api.get<{ reports: Report[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/admin/reports?${sp.toString()}`);
  },
  updateReport: (id: string, data: { status?: string; adminNote?: string }) =>
    api.patch<{ report: Report }>(`/admin/reports/${id}`, data),

  // Conversations
  getConversations: (params?: { page?: number; limit?: number; userId?: string }) => {
    const sp = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') sp.set(k, String(v));
      });
    }
    return api.get<{ conversations: AdminConversation[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/admin/conversations?${sp.toString()}`);
  },
  getConversationMessages: (id: string) =>
    api.get<{ conversation: AdminConversation; messages: Message[] }>(`/admin/conversations/${id}/messages`),

  // Banners
  getBanners: () => api.get<{ banners: Banner[] }>('/admin/banners'),
  createBanner: (data: Partial<Banner>) =>
    api.post<{ banner: Banner }>('/admin/banners', data),
  updateBanner: (id: string, data: Partial<Banner>) =>
    api.put<{ banner: Banner }>(`/admin/banners/${id}`, data),
  deleteBanner: (id: string) => api.delete(`/admin/banners/${id}`),
  reorderBanners: (banners: Array<{ id: string; order: number }>) =>
    api.patch('/admin/banners/reorder', { banners }),

  // Newsletter
  getNewsletter: (params?: { page?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) sp.set(k, String(v));
      });
    }
    return api.get<{ subscribers: NewsletterSubscriber[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/admin/newsletter?${sp.toString()}`);
  },
  deleteSubscriber: (id: string) => api.delete(`/admin/newsletter/${id}`),
};

// Public: Banners
export const bannersApi = {
  getActive: () => api.get<{ banners: Banner[] }>('/banners'),
};

// Public: Site stats
export const siteStatsApi = {
  get: () => api.get<SiteStats>('/banners/stats'),
};

// Newsletter (public)
export const newsletterApi = {
  subscribe: (email: string) => api.post<{ message: string }>('/banners/newsletter', { email }),
};

export default api;
