package com.ecommerce.thriftauction.features.product.mapper;

import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionBidRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class ProductMapper {
    private final AuctionSessionRepository auctionSessionRepository;
    private final AuctionBidRepository auctionBidRepository;

    public ProductResponse mapToResponse(Product product) {
        java.time.LocalDateTime auctionEndTime = null;
        BigDecimal currentHighestBid = null;
        Integer bidCount = 0;

        if (product.getSellType() == SellType.AUCTION) {
            var sessionOpt = auctionSessionRepository.findByProductId(product.getId());
            if (sessionOpt.isPresent()) {
                auctionEndTime = sessionOpt.get().getEndTime();
                currentHighestBid = sessionOpt.get().getCurrentHighestPrice();
                bidCount = auctionBidRepository.countByAuctionSessionId(sessionOpt.get().getId());
            }
        }

        return ProductResponse.builder()
                .id(product.getId())
                .sellerId(product.getSeller().getId())
                .sellerName(product.getSeller().getUsername())
                .sellerAvatar(product.getSeller().getAvatar())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .title(product.getTitle())
                .description(product.getDescription())
                .condition(product.getCondition())
                .sellType(product.getSellType())
                .price(product.getPrice())
                .quantity(product.getQuantity() != null ? product.getQuantity() : 1)
                .imageUrl(product.getImageUrl())
                .images(product.getImages())
                .videoUrl(product.getVideoUrl())
                .location(product.getLocation())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .auctionEndTime(auctionEndTime)
                .boostedUntil(product.getBoostedUntil())
                .currentHighestBid(currentHighestBid)
                .bidCount(bidCount)
                .isLive(product.getIsLive())
                .averageRating(product.getAverageRating())
                .soldCount(product.getSoldCount())
                .build();
    }
}
