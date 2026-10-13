package com.ecommerce.thriftauction.features.product.mapper;

import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import com.ecommerce.thriftauction.features.auction.entity.AuctionSession;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionBidRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductMapper {
    private final AuctionSessionRepository auctionSessionRepository;
    private final AuctionBidRepository auctionBidRepository;

    public ProductResponse mapToResponse(Product product) {
        if (product == null) {
            return null;
        }
        LocalDateTime auctionEndTime = null;
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

        return toDto(product, auctionEndTime, currentHighestBid, bidCount);
    }

    public List<ProductResponse> mapToResponses(List<Product> products) {
        if (products == null || products.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> auctionProductIds = products.stream()
                .filter(p -> p.getSellType() == SellType.AUCTION)
                .map(Product::getId)
                .collect(Collectors.toList());

        Map<String, AuctionSession> sessionMap = new HashMap<>();
        Map<String, Integer> bidCountMap = new HashMap<>();

        if (!auctionProductIds.isEmpty()) {
            List<AuctionSession> sessions = auctionSessionRepository.findByProductIdIn(auctionProductIds);
            for (AuctionSession session : sessions) {
                if (session.getProduct() != null) {
                    sessionMap.put(session.getProduct().getId(), session);
                }
            }

            List<String> sessionIds = sessions.stream()
                    .map(AuctionSession::getId)
                    .collect(Collectors.toList());

            if (!sessionIds.isEmpty()) {
                List<Object[]> bidCounts = auctionBidRepository.countByAuctionSessionIdIn(sessionIds);
                for (Object[] row : bidCounts) {
                    if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                        String sId = (String) row[0];
                        Long count = ((Number) row[1]).longValue();
                        bidCountMap.put(sId, count.intValue());
                    }
                }
            }
        }

        List<ProductResponse> responses = new ArrayList<>(products.size());
        for (Product product : products) {
            LocalDateTime auctionEndTime = null;
            BigDecimal currentHighestBid = null;
            Integer bidCount = 0;

            if (product.getSellType() == SellType.AUCTION) {
                AuctionSession session = sessionMap.get(product.getId());
                if (session != null) {
                    auctionEndTime = session.getEndTime();
                    currentHighestBid = session.getCurrentHighestPrice();
                    bidCount = bidCountMap.getOrDefault(session.getId(), 0);
                }
            }
            responses.add(toDto(product, auctionEndTime, currentHighestBid, bidCount));
        }
        return responses;
    }

    public Page<ProductResponse> mapToResponsePage(Page<Product> page) {
        if (page == null) {
            return Page.empty();
        }
        List<ProductResponse> content = mapToResponses(page.getContent());
        return new PageImpl<>(content, page.getPageable(), page.getTotalElements());
    }

    private ProductResponse toDto(Product product, LocalDateTime auctionEndTime, BigDecimal currentHighestBid,
            Integer bidCount) {
        List<String> images = Collections.emptyList();
        if (product.getImages() != null) {
            try {
                images = new ArrayList<>(product.getImages());
            } catch (Exception e) {
                images = Collections.emptyList();
            }
        }

        return ProductResponse.builder()
                .id(product.getId())
                .sellerId(product.getSeller() != null ? product.getSeller().getId() : null)
                .sellerName(product.getSeller() != null ? product.getSeller().getUsername() : null)
                .sellerAvatar(product.getSeller() != null ? product.getSeller().getAvatar() : null)
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .title(product.getTitle())
                .description(product.getDescription())
                .condition(product.getCondition())
                .sellType(product.getSellType())
                .price(product.getPrice())
                .quantity(product.getQuantity() != null ? product.getQuantity() : 1)
                .imageUrl(product.getImageUrl())
                .images(images)
                .videoUrl(product.getVideoUrl())
                .location(product.getLocation())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .auctionEndTime(auctionEndTime)
                .boostedUntil(product.getBoostedUntil())
                .currentHighestBid(currentHighestBid)
                .bidCount(bidCount != null ? bidCount : 0)
                .isLive(product.getIsLive())
                .averageRating(product.getAverageRating())
                .soldCount(product.getSoldCount())
                .build();
    }
}
