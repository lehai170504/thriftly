package com.ecommerce.thriftauction.features.product.dto;

import com.ecommerce.thriftauction.features.product.entity.ProductCondition;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {
    private String id;
    private String sellerId;
    private String sellerName;
    private String sellerAvatar;
    private String categoryId;
    private String categoryName;
    private String title;
    private String description;
    private ProductCondition condition;
    private SellType sellType;
    private BigDecimal price;
    private Integer quantity;
    private ProductStatus status;
    private String imageUrl;
    private java.util.List<String> images;
    private String videoUrl;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime auctionEndTime;
    private LocalDateTime boostedUntil;
    private BigDecimal currentHighestBid;
    private Integer bidCount;
    private Boolean isLive;
    private Double averageRating;
    private Integer soldCount;
}
