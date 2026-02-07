export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  plan: 'FREE' | 'PREMIUM';
  role?: 'USER' | 'ADMIN';
  blocked?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Category {
  id: string;
  name: string;
  namePl: string;
  nameEn: string;
  icon: string;
  slug: string;
  imageUrl?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  _count?: { listings: number };
}

export interface ListingImage {
  id: string;
  url: string;
  order: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  lowestPrice30d?: number;
  isOnSale?: boolean;
  currency: string;
  condition: 'NEW' | 'USED' | 'DAMAGED';
  status: 'ACTIVE' | 'SOLD' | 'RESERVED' | 'ARCHIVED';
  promoted: boolean;
  promotedUntil?: string;
  negotiable?: boolean;
  videoUrl?: string;
  views: number;
  city: string;
  latitude?: number;
  longitude?: number;
  userId: string;
  categoryId: string;
  attributes?: Record<string, any>;
  images: ListingImage[];
  category?: Category;
  user?: ListingUser;
  isFavorited?: boolean;
  favoritesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutocompleteSuggestion {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  thumbnailUrl?: string;
  categorySlug?: string;
}

export interface ListingUser {
  id: string;
  name: string;
  city?: string;
  avatarUrl?: string;
  createdAt?: string;
  phone?: string;
  avgRating?: number;
  isVerified?: boolean;
  _count?: { listings: number; reviewsReceived: number };
  listingsCount?: number;
  reviewsCount?: number;
}

export interface Conversation {
  id: string;
  listing: {
    id: string;
    title: string;
    price: number;
    images: ListingImage[];
  };
  otherUser: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId?: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  reviewerId: string;
  reviewer: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface PaginatedResponse<T> {
  listings: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserStats {
  user: User & { hasStripe: boolean };
  stats: {
    totalListings: number;
    activeListings: number;
    soldListings: number;
    totalViews: number;
    favoritesCount: number;
    avgRating: number;
    reviewsCount: number;
  };
}

export type ReportCategory = 'FRAUD' | 'ABUSE' | 'ITEM_PROBLEM' | 'INCORRECT_SELLER_DATA' | 'MISLEADING_LISTING';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: string;
  category: ReportCategory;
  subcategory: string;
  explanation: string;
  status: ReportStatus;
  adminNote?: string;
  reporterId: string;
  listingId?: string;
  reportedUserId?: string;
  reporter?: { id: string; name: string; email: string };
  listing?: {
    id: string;
    title: string;
    price: number;
    status: string;
    images?: ListingImage[];
    user?: { id: string; name: string; email: string };
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  totalActiveListings: number;
  pendingReports: number;
  totalReports: number;
  totalBanners: number;
  totalSubscribers: number;
  totalCategories: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  city?: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'PREMIUM';
  blocked: boolean;
  blockedReason?: string;
  createdAt: string;
  _count?: { listings: number; reports: number };
}

export interface AdminConversation {
  id: string;
  participant1: { id: string; name: string; avatarUrl?: string };
  participant2: { id: string; name: string; avatarUrl?: string };
  listing?: { id: string; title: string };
  messages: Message[];
  _count?: { messages: number };
  updatedAt: string;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  displayOrder: number;
  enabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export interface SiteStats {
  users: number;
  listings: number;
  transactions: number;
  cities: number;
}
