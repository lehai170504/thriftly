import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../api/reviewApi';
import { ReviewRequest } from '../types/review';

export const useUserReviews = (username: string) => {
  return useQuery({
    queryKey: ['reviews', username],
    queryFn: () => reviewApi.getReviewsByUser(username),
    enabled: !!username,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: ReviewRequest }) =>
      reviewApi.createReview(orderId, data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries if needed, e.g., the user's reviews
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
};

export const useLikeReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => reviewApi.likeReview(reviewId),
    onSuccess: (updatedReview) => {
      // Update specific review in cache if possible, or invalidate all reviews
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['sellerReviews'] });
    },
  });
};

export const useReplyReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: string; reply: string }) => reviewApi.replyReview(reviewId, reply),
    onSuccess: (updatedReview) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['sellerReviews'] });
    },
  });
};
