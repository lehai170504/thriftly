'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useUserProfile } from '@/features/users/hooks/useUserProfile';
import { useFollow } from '@/features/users/hooks/useFollow';
import { useLikeReview, useReplyReview } from '@/features/reviews/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Star, Package, CalendarDays, ShieldCheck, Users, UserPlus, UserCheck, Award, MessageSquare, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Link from 'next/link';
import { toast } from 'sonner';

import { ProfileSkeleton, ProductGridSkeleton } from '@/components/ui/loading-skeletons';

export default function SellerProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { user } = useAuth();
  const { profile, isProfileLoading, products, isProductsLoading, reviews, isReviewsLoading } = useUserProfile(username);
  const { isFollowing, followerCount, followersList, toggleFollow, isToggling } = useFollow(username);

  if (isProfileLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        <h2 className="text-2xl font-bold text-foreground mb-2">Không tìm thấy người dùng</h2>
        <p>Người dùng này không tồn tại hoặc đã bị khóa.</p>
      </div>
    );
  }

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
    : 0;

  const isTrustedSeller = averageRating >= 4.5 && reviews && reviews.length >= 2;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Seller Header Info */}
      <div className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-8 shadow-sm">
        <Avatar className="w-20 h-20 md:w-24 md:h-24 border-2 border-background shadow-md">
          <AvatarImage src={profile.avatar} alt={profile.fullName || profile.username} className="object-cover" />
          <AvatarFallback className="bg-muted text-muted-foreground text-xl font-bold">
            {(profile.fullName || profile.username || 'U').substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              {profile.fullName || profile.username}
            </h1>
            {isTrustedSeller && (
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Gian hàng Uy tín
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-xs md:text-sm mb-4">@{profile.username}</p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs md:text-sm text-foreground/80 mb-5">
            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-xl border border-border/30">
              <Star className="text-amber-400 w-4 h-4 fill-current" />
              <span className="font-bold">{averageRating ? averageRating.toFixed(1) : 'Chưa có'}</span>
              <span className="text-muted-foreground text-xs">({reviews?.length || 0} đánh giá)</span>
            </div>

            <Dialog>
              <DialogTrigger
                render={
                  <button className="flex items-center gap-1.5 bg-muted/50 hover:bg-muted px-3 py-1.5 rounded-xl border border-border/30 cursor-pointer transition-colors" />
                }
              >
                <Users className="text-muted-foreground w-4 h-4" />
                <span className="font-bold">{followerCount}</span>
                <span className="text-muted-foreground text-xs">người theo dõi</span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-bold text-lg">Người theo dõi ({followerCount})</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-2 mt-4 space-y-2">
                  {followersList && followersList.length > 0 ? (
                    followersList.map((follower: any) => (
                      <div key={follower.id} className="flex items-center justify-between gap-3 p-2.5 hover:bg-muted/80 rounded-xl transition-colors">
                        <Link href={`/users/${follower.username}`} className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 border border-border">
                            <AvatarImage src={follower.avatar} alt={follower.fullName || follower.username} className="object-cover" />
                            <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-xs">
                              {(follower.fullName || follower.username || 'U').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-foreground">{follower.fullName || follower.username}</p>
                            <p className="text-xs text-muted-foreground">@{follower.username}</p>
                          </div>
                        </Link>
                        <Link href={`/users/${follower.username}`}>
                          <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg font-medium">
                            Xem
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="text-sm">Chưa có ai theo dõi.</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-xl border border-border/30">
              <Package className="text-muted-foreground w-4 h-4" />
              <span className="font-bold">{products?.length || 0}</span>
              <span className="text-muted-foreground text-xs">sản phẩm</span>
            </div>

            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-xl border border-border/30">
              <CalendarDays className="text-muted-foreground w-4 h-4" />
              <span className="text-muted-foreground text-xs">Tham gia: <span className="font-semibold text-foreground">{format(new Date(profile.createdAt), 'MM/yyyy', { locale: vi })}</span></span>
            </div>
          </div>

          {user?.username !== username && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 w-full md:w-auto mt-1">
              <Button
                size="sm"
                onClick={() => toggleFollow()}
                disabled={isToggling}
                variant={isFollowing ? "outline" : "default"}
                className="rounded-xl font-semibold shadow-xs md:w-36"
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" /> Đang theo dõi
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" /> Theo dõi
                  </>
                )}
              </Button>

              <Link href={`/chat?user=${profile.username}`}>
                <Button size="sm" variant="outline" className="rounded-xl font-semibold border-border hover:bg-accent">
                  <MessageSquare className="w-4 h-4 mr-2 text-primary" /> Nhắn tin
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="w-full">
        <div className="mb-6 flex justify-start">
          <TabsList className="p-1 bg-muted/60 border border-border/50 rounded-2xl inline-flex gap-1">
            <TabsTrigger
              value="products"
              className="rounded-xl px-5 py-2 text-sm font-semibold transition-all"
            >
              Sản phẩm ({products?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-xl px-5 py-2 text-sm font-semibold transition-all"
            >
              Đánh giá ({reviews?.length || 0})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="products" className="min-h-[300px]">
          {isProductsLoading ? (
            <ProductGridSkeleton />
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-xl border border-dashed border-border bg-muted/30">
              <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">Chưa có sản phẩm nào</h3>
              <p className="text-sm text-muted-foreground">Người bán này hiện chưa đăng bán sản phẩm nào.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="min-h-[300px]">
          {isReviewsLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-0">
              {reviews.map((review) => (
                <UserReviewItem key={review.id} review={review} sellerName={profile.username} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-xl border border-dashed border-border bg-muted/30">
              <Star className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">Chưa có đánh giá nào</h3>
              <p className="text-sm text-muted-foreground">Người bán này chưa nhận được đánh giá nào từ người mua.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserReviewItem({ review, sellerName }: { review: any, sellerName: string }) {
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
    <div className="py-6 border-b border-border last:border-0 flex gap-4">
      <Avatar className="w-10 h-10 border border-border mt-1 shrink-0">
        <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName || review.reviewerUsername || 'User'} className="object-cover" />
        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
          {(review.reviewerName || review.reviewerUsername || 'US').substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h4 className="font-semibold text-foreground text-sm">{review.reviewerName || review.reviewerUsername || 'Người dùng'}</h4>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-amber-400 fill-current' : 'text-muted-foreground/30'}`}
                />
              ))}
            </div>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {format(new Date(review.createdAt), 'dd/MM/yyyy HH:mm')}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mb-3">
          Sản phẩm: <span className="font-medium text-foreground">{review.productTitle}</span>
        </div>
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{review.comment}</p>

        {/* Seller Reply */}
        {review.sellerReply && (
          <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border text-sm">
            <div className="font-semibold text-foreground mb-1">Phản hồi của Người bán:</div>
            <p className="text-muted-foreground whitespace-pre-wrap">{review.sellerReply}</p>
          </div>
        )}

        {/* Actions */}
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
      </div>
    </div>
  );
}
