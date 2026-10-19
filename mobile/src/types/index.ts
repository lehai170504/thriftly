export interface User {
  id: string;
  username?: string;
  email: string;
  name?: string;
  fullName?: string;
  avatarUrl?: string;
  avatar?: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  phone?: string;
  address?: string;
  rating?: number;
  balance?: number;
  createdAt?: string;
  hasPassword?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export type SellType = 'FIXED_PRICE' | 'AUCTION';
export type ProductCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
export type ProductStatus = 'ACTIVE' | 'PENDING' | 'SOLD' | 'ENDED' | 'INACTIVE';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  sellType: SellType;
  condition: ProductCondition;
  status: ProductStatus;
  images: string[];
  imageUrl?: string;
  category: Category;
  seller: {
    id: string;
    name: string;
    username?: string;
    avatarUrl?: string;
    rating?: number;
  };
  location?: string;
  favoriteCount: number;
  viewCount: number;
  isFavorited?: boolean;
  createdAt: string;
  auctionDetails?: {
    startPrice: number;
    currentBid: number;
    bidStep: number;
    startTime: string;
    endTime: string;
    bidCount: number;
    status: 'SCHEDULED' | 'HAPPENING' | 'ENDED';
  };
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ProductSearchParams {
  query?: string;
  categoryIds?: string[];
  condition?: string;
  sellType?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID_ESCROW'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'RETURNING'
  | 'RETURNED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  product?: Product;
  productId?: string;
  productTitle?: string;
  productImageUrl?: string;
  price: number;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  buyer?: User;
  seller?: User;
  buyerName?: string;
  sellerName?: string;
  trackingCode?: string;
  disputeReason?: string;
  createdAt: string;
}

export interface WalletInfo {
  id?: string;
  balance: number;
  pendingWithdrawal?: number;
}

export interface BidItem {
  id: string;
  auctionSessionId?: string;
  bidderUsername?: string;
  bidderFullName?: string;
  bidderAvatar?: string;
  bidAmount: number;
  bidTime: string;
}
