import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { liveApi } from '../api/liveApi';
import { toast } from 'sonner';

export const useStartLiveSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => liveApi.startLiveSession(productId),
    onSuccess: (data, productId) => {
      queryClient.setQueryData(['liveSession', data.productId || productId], data);
      queryClient.invalidateQueries({ queryKey: ['activeLiveAuctions'] });
      toast.success('Đã bắt đầu phiên Livestream');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể bắt đầu phiên Livestream');
    },
  });
};

export const useEndLiveSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, auctionSessionId, endAuction }: { productId?: string; auctionSessionId?: string; endAuction?: boolean }) => {
      const targetId = productId || auctionSessionId || '';
      return liveApi.endLiveSession(targetId, endAuction);
    },
    onSuccess: (data, variables) => {
      const targetId = data.productId || variables.productId || variables.auctionSessionId;
      queryClient.setQueryData(['liveSession', targetId], data);
      queryClient.invalidateQueries({ queryKey: ['activeLiveAuctions'] });
      toast.success('Phiên Livestream đã kết thúc');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể kết thúc phiên Livestream');
    },
  });
};

export const useLiveSession = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['liveSession', productId],
    queryFn: () => liveApi.getLiveSession(productId),
    enabled: !!productId && enabled,
    retry: false,
  });
};

export const useActiveLiveAuctions = () => {
  return useQuery({
    queryKey: ['activeLiveAuctions'],
    queryFn: () => liveApi.getActiveLiveAuctions(),
    staleTime: 30 * 1000,
  });
};

export const useAuctionDepositStatus = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['auctionDeposit', productId],
    queryFn: () => liveApi.getDepositStatus(productId),
    enabled: !!productId && enabled,
  });
};

export const usePlaceAuctionDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => liveApi.placeDeposit(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['auctionDeposit', productId] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Đặt cọc thành công! Bạn đã có thể tham gia trả giá.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể đặt cọc. Vui lòng kiểm tra số dư ví.');
    },
  });
};
