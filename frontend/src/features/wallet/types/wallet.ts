export interface WalletResponse {
  id: string;
  userId?: string;
  balance: number;
  heldBalance?: number;
  recentTransactions?: TransactionResponse[];
  updatedAt?: string;
}

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAW'
  | 'PAYMENT'
  | 'ESCROW_HOLD'
  | 'ESCROW_RELEASE'
  | 'REFUND'
  | 'BOOST_FEE'
  | 'WITHDRAWAL_FEE'
  | 'AUCTION_DEPOSIT'
  | 'AUCTION_REFUND'
  | 'COMMISSION'
  | 'PURCHASE'
  | 'SALE'
  | 'BID_DEPOSIT'
  | 'BID_REFUND'
  | 'ADMIN_ADJUSTMENT';

export interface TransactionResponse {
  id: string;
  amount: number;
  type: TransactionType;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  createdAt: string;
}

export interface WithdrawRequest {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankAccountId?: string;
}

export interface BankAccountResponse {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  createdAt: string;
}

export interface BankAccountRequest {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export type PaymentIntentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface PaymentIntentStatusResponse {
  orderCode: number;
  status: PaymentIntentStatus;
  amount: number;
  currency: string;
  updatedAt: string;
}
