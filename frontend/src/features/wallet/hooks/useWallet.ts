import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../api/walletApi';
import { toast } from 'sonner';
import { extractError } from '@/lib/utils';

export const useWallet = () => {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getMyWallet,
  });
};

export const useDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: walletApi.deposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Nạp tiền thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi nạp tiền');
    },
  });
};

export const useWithdraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Rút tiền thành công!');
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Không thể gửi yêu cầu rút tiền'));
    },
  });
};

export const useBankAccounts = () => {
  return useQuery({
    queryKey: ['bank-accounts'],
    queryFn: walletApi.getBankAccounts,
  });
};

export const useAddBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.addBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast.success('Thêm tài khoản ngân hàng thành công!');
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Không thể thêm tài khoản ngân hàng'));
    },
  });
};

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.deleteBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast.success('Xóa tài khoản ngân hàng thành công!');
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Không thể xóa tài khoản ngân hàng'));
    },
  });
};

export const usePayOSPayment = () => {
  return useMutation({
    mutationFn: walletApi.createPayOSPayment,
    onSuccess: (data) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể tạo link thanh toán');
    },
  });
};

export const useVerifyPayOSPayment = (query: string) => {
  return useQuery({
    queryKey: ['verify-payos', query],
    queryFn: () => walletApi.verifyPayOSPayment(query),
    enabled: !!query,
    retry: 0,
  });
};
