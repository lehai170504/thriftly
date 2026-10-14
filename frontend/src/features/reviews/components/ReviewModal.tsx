'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateReview } from '@/features/reviews/hooks/useReviews';
import { extractError } from '@/lib/utils';

interface ReviewModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewModal({ orderId, isOpen, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const createReviewMutation = useCreateReview();

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá!');
      return;
    }
    createReviewMutation.mutate(
      { orderId, data: { rating, comment } },
      {
        onSuccess: () => {
          toast.success('Đánh giá thành công! Cảm ơn bạn đã phản hồi.');
          onClose();
        },
        onError: (error: any) => {
          toast.error('Gửi đánh giá thất bại: ' + extractError(error));
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6 bg-card rounded-2xl shadow-xl border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold text-center text-foreground">Đánh giá Người bán</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm">
            Chia sẻ trải nghiệm mua hàng của bạn về đơn hàng này
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Bạn cảm thấy sản phẩm thế nào?</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  variant="ghost"
                  size="icon"
                  shape="pill"
                  aria-label={`Đánh giá ${star} sao`}
                  className="h-9 w-9 p-0"
                >
                  <Star
                    className={`w-7 h-7 ${star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-muted text-muted-foreground/30'
                      } transition-colors`}
                  />
                </Button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-500 min-h-[18px]">
              {rating === 5 && 'Tuyệt vời!'}
              {rating === 4 && 'Rất tốt'}
              {rating === 3 && 'Bình thường'}
              {rating === 2 && 'Chưa hài lòng'}
              {rating === 1 && 'Rất tệ!'}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Nhận xét chi tiết (Tùy chọn)</label>
            <Textarea
              placeholder="Hãy chia sẻ thêm về chất lượng sản phẩm, thái độ phục vụ của người bán..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none h-24 bg-background border-border focus-visible:ring-primary rounded-xl text-foreground text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-4 h-9 text-xs font-medium border-border text-foreground hover:bg-accent">
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createReviewMutation.isPending}
            className="rounded-xl px-4 h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
          >
            {createReviewMutation.isPending ? 'Đang gửi...' : 'Gửi Đánh giá'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
