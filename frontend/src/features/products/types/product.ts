export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  parentId?: string;
  subCategories?: Category[];
}

export type ProductCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
export type SellType = 'BUY_NOW' | 'AUCTION';
export type ProductStatus = 'ACTIVE' | 'SOLD' | 'CANCELLED' | 'HIDDEN' | 'DELETED';

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description: string;
  condition: ProductCondition;
  sellType: SellType;
  price: number;
  quantity: number;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  status: ProductStatus;
  location?: string;
  createdAt: string;
  auctionEndTime?: string;
  boostedUntil?: string;
  currentHighestBid?: number;
  bidCount?: number;
  isLive?: boolean;
  averageRating?: number;
  soldCount?: number;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  condition: ProductCondition;
  sellType: SellType;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  location?: string;
  auctionDurationDays?: number;
}

export interface ProductSearchParams {
  page?: number;
  size?: number;
  query?: string;
  categoryId?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition | string;
  sellType?: SellType | string;
  location?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  direction?: 'asc' | 'desc';
}
