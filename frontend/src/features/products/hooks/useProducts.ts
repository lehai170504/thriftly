import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct, getCategories, getProductById, getProducts, searchProducts, getRelatedProducts, deleteProduct, updateProduct, getProductsBySeller, boostProduct, toggleFavorite, getFavoriteIds, getFavoriteProducts, restartAuction, getRecommendations } from '../api/productsApi';
import { CreateProductRequest, ProductSearchParams } from '@/features/products/types/product';
import { toast } from 'sonner';
import { extractError } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProducts = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ['products', { page, size }],
    queryFn: () => getProducts(page, size),
  });
};

export const useRecommendedProducts = (isAuthenticated: boolean) => {
  return useQuery({
    queryKey: ['recommended-products'],
    queryFn: getRecommendations,
    enabled: isAuthenticated,
  });
};

export const useSearchProducts = (params: ProductSearchParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['products', 'search', params],
    queryFn: () => searchProducts(params),
    enabled: options?.enabled ?? true,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
};

export const useRelatedProducts = (id: string, categoryId: string) => {
  return useQuery({
    queryKey: ['products', 'related', id, categoryId],
    queryFn: () => getRelatedProducts(id, categoryId),
    enabled: !!id && !!categoryId,
  });
};

export const useSellerProducts = (username: string) => {
  return useQuery({
    queryKey: ['seller-products', username],
    queryFn: () => getProductsBySeller(username),
    enabled: !!username,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => createProduct(data),
    onSuccess: () => {
      toast.success('Đăng sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast.error(`Đăng bán thất bại: ${extractError(error, 'Lỗi không xác định khi tạo sản phẩm')}`);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: CreateProductRequest }) => updateProduct(id, data),
    onSuccess: (data, variables) => {
      toast.success('Cập nhật sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    },
    onError: (error: any) => {
      toast.error(`Cập nhật thất bại: ${extractError(error, 'Lỗi không xác định khi cập nhật sản phẩm')}`);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      toast.success('Xóa sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast.error(`Lỗi: ${extractError(error, 'Không thể xóa sản phẩm lúc này')}`);
    },
  });
};

export const useBoostProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => boostProduct(id),
    onSuccess: () => {
      toast.success('Đẩy tin thành công!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Có lỗi xảy ra khi đẩy tin.'));
    }
  });
};

export const useFavorites = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['favorites'],
    queryFn: getFavoriteIds,
    enabled: isAuthenticated,
  });
};

export const useFavoriteProducts = (page = 0, size = 20) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['favorite-products', { page, size }],
    queryFn: () => getFavoriteProducts(page, size),
    enabled: isAuthenticated,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFavorite,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previousFavorites = queryClient.getQueryData<string[]>(['favorites']);

      if (previousFavorites) {
        const isFavorited = previousFavorites.includes(productId);
        const newFavorites = isFavorited
          ? previousFavorites.filter(id => id !== productId)
          : [...previousFavorites, productId];
        queryClient.setQueryData(['favorites'], newFavorites);
      }

      return { previousFavorites };
    },
    onError: (_err, _productId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
      toast.error('Lỗi khi thêm vào yêu thích. Vui lòng thử lại.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};

export const useRestartAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restartAuction(id),
    onSuccess: () => {
      toast.success('Đấu giá lại thành công!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    },
    onError: (error: any) => {
      toast.error(`Không thể đấu giá lại: ${extractError(error, 'Lỗi không xác định')}`);
    },
  });
};
