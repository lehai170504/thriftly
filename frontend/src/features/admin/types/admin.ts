import { TransactionType } from '@/features/wallet/types/wallet';

export type { TransactionType };

export interface AdminTransactionResponse {
  id: string;
  userId: string;
  userEmail: string;
  username: string;
  amount: number;
  type: TransactionType;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  createdAt: string;
}

export interface GlobalSearchResult {
  users?: { id: string; username: string; email: string; avatar: string | null }[];
  orders?: { id: string; productTitle: string; buyerName: string; status: string }[];
  products?: { id: string; title: string; categoryName: string; status: string; imageUrl: string | null }[];
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string | null;
  phone?: string;
  address?: string;
  role: string;
  enabled?: boolean;
  isActive?: boolean;
  walletBalance?: number;
  tier?: string;
  totalPoints?: number;
  reputationScore?: number;
  createdAt: string;
}

export interface ChartDataResponse {
  date: string;
  revenue: number;
  ordersCount: number;
}

export interface Voucher {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  quantity: number;
  usageLimitPerUser: number;
  expiryDate: string;
  sellerId: string | null;
  active: boolean;
  createdAt: string;
}

export interface CreateVoucherRequest {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  quantity: number;
  usageLimitPerUser?: number;
  expiryDate: string;
}
