import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voucherApi } from '../api/voucherApi';
import { Voucher, CreateVoucherDTO, VoucherUsage } from '../types/voucher';
import { toast } from 'sonner';
import { extractError } from '@/lib/utils';
export type { Voucher, CreateVoucherDTO, VoucherUsage };

export const useAvailableVouchers = (sellerId?: string) => {
  return useQuery({
    queryKey: ['vouchers', sellerId],
    queryFn: async () => {
      return await voucherApi.getAvailableVouchers(sellerId);
    },
    enabled: !!sellerId
  });
};

export const useMyVouchers = () => {
  return useQuery({
    queryKey: ['my-vouchers'],
    queryFn: async () => {
      return await voucherApi.getMyVouchers();
    }
  });
};

export const useCreateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateVoucherDTO) => {
      return await voucherApi.createVoucher(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vouchers'] });
      toast.success('Tạo mã giảm giá thành công!');
    },
    onError: (error) => {
      toast.error(extractError(error, 'Có lỗi xảy ra khi tạo mã giảm giá'));
    }
  });
};

export const useToggleVoucherStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await voucherApi.toggleVoucherStatus(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vouchers'] });
      toast.success('Cập nhật trạng thái thành công!');
    },
    onError: (error) => {
      toast.error(extractError(error, 'Có lỗi xảy ra khi cập nhật'));
    }
  });
};

export const useVoucherUsages = (voucherId: string, isOpen: boolean) => {
  return useQuery({
    queryKey: ['voucher-usages', voucherId],
    queryFn: async () => {
      return await voucherApi.getVoucherUsages(voucherId);
    },
    enabled: isOpen && !!voucherId
  });
};
