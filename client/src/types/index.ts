export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  plan: 'FREE' | 'PREMIUM';
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
  status: 'ACTIVE' | 'SOLD' | 'ARCHIVED';
  promoted: boolean;
  promotedUntil?: string;
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
