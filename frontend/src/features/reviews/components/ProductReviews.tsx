'use client';

import { useState } from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserReviews, useLikeReview, useReplyReview } from '@/features/reviews/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ProductReviewsProps {
  sellerName: string;
  sellerAvatar?: string;
}

export function ProductReviews({ sellerName, sellerAvatar }: ProductReviewsProps) {
  const { data: reviews, isLoading } = useUserReviews(sellerName);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  if (isLoading || !reviews || reviews.length === 0) return null;

  const averageRating = reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length;

  // Lọc đánh giá
  const filteredReviews = filterRating
    ? reviews.filter((r: any) => r.rating === filterRating)
    : reviews;

  const displayedReviews = showAll ? filteredReviews : filteredReviews.slice(0, 5);

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length
  }));

  return (
    <div className="mt-12 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Header & Tổng quan đánh giá */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground mb-6">Đánh Giá Sản Phẩm</h2>

        <div className="bg-muted/30 p-6 rounded-lg border border-border flex flex-col md:flex-row items-center gap-8">
          {/* Cột trái: Điểm trung bình */}
          <div className="flex flex-col items-center justify-center min-w-[150px]">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-amber-500">{averageRating.toFixed(1)}</span>
              <span className="text-lg text-amber-500/80">/ 5</span>
            </div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-5 h-5 ${s <= Math.round(averageRating) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30 fill-muted-foreground/10'}`} />
              ))}
            </div>
          </div>

          {/* Cột phải: Bộ lọc (Tabs) */}
          <div className="flex flex-wrap gap-3 flex-1">
            <Button
              variant={filterRating === null ? "default" : "outline"}
              onClick={() => { setFilterRating(null); setShowAll(false); }}
              className={`rounded-sm px-6 h-10 ${filterRating === null ? 'bg-primary text-primary-foreground shadow-none' : 'bg-background hover:bg-muted'}`}
            >
              Tất Cả ({reviews.length})
            </Button>
            {ratingCounts.map(({ star, count }) => (
              <Button
                key={star}
                variant={filterRating === star ? "default" : "outline"}
                onClick={() => { setFilterRating(star); setShowAll(false); }}
                className={`rounded-sm px-6 h-10 ${filterRating === star ? 'bg-primary text-primary-foreground shadow-none' : 'bg-background hover:bg-muted'} ${count === 0 ? 'opacity-50' : ''}`}
                disabled={count === 0}
              >
                {star} Sao ({count})
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Danh sách đánh giá */}
      <div className="flex flex-col">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            Không có đánh giá nào phù hợp.
          </div>
        ) : (
          displayedReviews.map((review: any, index: number) => (
            <div key={review.id} className={`p-6 ${index !== displayedReviews.length - 1 ? 'border-b border-border/50' : ''}`}>
              <div className="flex gap-4">
                {/* Avatar */}
                <Avatar className="w-10 h-10 border border-border shrink-0">
                  <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {(review.reviewerName || 'U').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Nội dung */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm">{review.reviewerName}</div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mt-1 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30 fill-muted-foreground/10'}`} />
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                    <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi })}</span>
                    <span>|</span>
                    <span>Phân loại: {review.productTitle}</span>
                  </div>

                  {/* Comment */}
                  {review.comment ? (
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Người dùng không để lại nhận xét.</p>
                  )}

                  {/* Seller Reply */}
                  {review.sellerReply && (
                    <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border text-sm">
                      <div className="font-semibold text-foreground mb-1">Phản hồi của Người bán:</div>
                      <p className="text-muted-foreground whitespace-pre-wrap">{review.sellerReply}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <ReviewActions review={review} sellerName={sellerName} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Nút Xem thêm */}
      {!showAll && filteredReviews.length > 5 && (
        <div className="p-4 border-t border-border flex justify-center bg-muted/10">
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
            className="bg-background"
          >
            Xem tất cả đánh giá
          </Button>
        </div>
      )}
    </div>
  );
}

function ReviewActions({ review, sellerName }: { review: any, sellerName: string }) {
  const { user } = useAuth();
  const likeMutation = useLikeReview();
  const replyMutation = useReplyReview();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleLike = () => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để thực hiện tính năng này');
      return;
    }
    likeMutation.mutate(review.id);
  };

  const handleReply = () => {
    if (!replyText.trim()) return;
    replyMutation.mutate(
      { reviewId: review.id, reply: replyText },
      {
        onSuccess: () => {
          setIsReplying(false);
          setReplyText('');
          toast.success('Phản hồi thành công');
        },
        onError: () => toast.error('Có lỗi xảy ra khi phản hồi')
      }
    );
  };

  const isSeller = user?.username === sellerName;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-6">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs transition-colors ${review.isLikedByCurrentUser ? 'text-blue-600 font-bold' : 'text-muted-foreground hover:text-blue-600'}`}
          disabled={likeMutation.isPending}
        >
          <ThumbsUp className={`w-4 h-4 ${review.isLikedByCurrentUser ? 'fill-current' : ''}`} />
          <span>Hữu ích? ({review.likesCount || 0})</span>
        </button>

        {isSeller && !review.sellerReply && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Phản hồi</span>
          </button>
        )}
      </div>

      {isReplying && (
        <div className="mt-3 flex gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Viết phản hồi của bạn..."
            className="flex-1 min-h-[60px] text-sm rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Button
            onClick={handleReply}
            disabled={replyMutation.isPending || !replyText.trim()}
            className="self-end"
          >
            Gửi
          </Button>
        </div>
      )}
    </div>
  );
}
