import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';

export const useBlockStatus = (username?: string) => {
  return useQuery({
    queryKey: ['blockStatus', username],
    queryFn: async () => {
      if (!username) return { status: 'NONE' };
      const res = await api.get<{ status: string }>(`/users/block/status/${username}`);
      return res.data;
    },
    enabled: !!username,
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      await api.post(`/users/block/${username}`);
    },
    onSuccess: (_, username) => {
      queryClient.invalidateQueries({ queryKey: ['blockStatus', username] });
      toast.success('Đã chặn người dùng này.');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi chặn người dùng.');
    }
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      await api.delete(`/users/block/${username}`);
    },
    onSuccess: (_, username) => {
      queryClient.invalidateQueries({ queryKey: ['blockStatus', username] });
      toast.success('Đã bỏ chặn người dùng này.');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi bỏ chặn người dùng.');
    }
  });
};
