export interface WalletResponse {
  id: string;
  userId?: string;
  balance: number;
  heldBalance?: number;
  recentTransactions?: TransactionResponse[];
  updatedAt?: string;
}

export interface TransactionResponse {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAW' | 'PURCHASE' | 'SALE' | 'REFUND' | 'ESCROW_HOLD' | 'ESCROW_RELEASE' | 'BID_DEPOSIT' | 'BID_REFUND' | 'ADMIN_ADJUSTMENT';
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
