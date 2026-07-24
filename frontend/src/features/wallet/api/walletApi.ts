import api from '@/lib/axios';
import { WalletResponse, TransactionResponse, WithdrawRequest, BankAccountResponse, BankAccountRequest } from '../types/wallet';
export type { WalletResponse, TransactionResponse, WithdrawRequest, BankAccountResponse, BankAccountRequest };

export const walletApi = {
  getMyWallet: async (): Promise<WalletResponse> => {
    const { data } = await api.get('/wallets/me');
    return data;
  },

  deposit: async (amount: number): Promise<WalletResponse> => {
    const { data } = await api.post('/wallets/deposit', { amount });
    return data;
  },

  withdraw: async (data: WithdrawRequest): Promise<WalletResponse> => {
    const response = await api.post('/wallets/withdraw', data);
    return response.data;
  },

  getBankAccounts: async (): Promise<BankAccountResponse[]> => {
    const response = await api.get('/wallets/bank-accounts');
    return response.data;
  },

  addBankAccount: async (data: BankAccountRequest): Promise<BankAccountResponse> => {
    const response = await api.post('/wallets/bank-accounts', data);
    return response.data;
  },

  deleteBankAccount: async (id: string): Promise<void> => {
    await api.delete(`/wallets/bank-accounts/${id}`);
  },

  createPayOSPayment: async (amount: number): Promise<{ paymentUrl: string }> => {
    const { data } = await api.post('/payment/payos/create-payment', { amount });
    return data;
  },

  verifyPayOSPayment: async (query: string): Promise<{ success: boolean, message: string }> => {
    const { data } = await api.get(`/payment/payos/verify?${query}`);
    return data;
  },
};
