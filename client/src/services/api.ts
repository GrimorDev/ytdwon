import axios from 'axios';
import type { AuthResponse, Listing, Category, Conversation, Message, Review, PaginatedResponse, UserStats } from '../types';

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
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') searchParams.set(key, String(val));
      });
    }
    return api.get<PaginatedResponse<Listing>>(`/listings?${searchParams.toString()}`);
  },
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

export default api;
