package com.ecommerce.thriftauction.features.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponse {
    private String id;
    private String reviewerName;
    private String reviewerAvatar;
    private String revieweeName;
    private String orderId;
    private String productTitle;
    private int rating;
    private String comment;
    private String reviewerTier;
    private String sellerReply;
    private int likesCount;
    private boolean isLikedByCurrentUser;
    private LocalDateTime createdAt;
}
