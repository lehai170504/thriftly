export interface ReviewRequest {
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: string;
  orderId: string;
  reviewerId: string;
  reviewerUsername: string;
  reviewerName?: string;
  reviewerAvatar?: string;
  revieweeId: string;
  revieweeUsername: string;
  productTitle?: string;
  rating: number;
  comment: string;
  reviewerTier?: string;
  sellerReply?: string;
  likesCount?: number;
  isLikedByCurrentUser?: boolean;
  createdAt: string;
}
