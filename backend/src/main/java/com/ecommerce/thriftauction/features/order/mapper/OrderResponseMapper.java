package com.ecommerce.thriftauction.features.order.mapper;

import com.ecommerce.thriftauction.features.order.dto.OrderResponse;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class OrderResponseMapper {

    public OrderResponse toResponse(Order order, Review review) {
        if (order == null) {
            return null;
        }

        boolean isReviewed = review != null;
        Integer rating = review != null ? review.getRating() : null;
        String comment = review != null ? review.getComment() : null;

        String buyerName = order.getBuyer() != null ? order.getBuyer().getUsername() : null;
        String sellerName = order.getSeller() != null ? order.getSeller().getUsername() : null;
        String productId = order.getProduct() != null ? order.getProduct().getId() : null;
        String productTitle = order.getProduct() != null ? order.getProduct().getTitle() : null;
        String productImageUrl = order.getProduct() != null ? order.getProduct().getImageUrl() : null;

        return OrderResponse.builder()
                .id(order.getId())
                .productId(productId)
                .productTitle(productTitle)
                .productImageUrl(productImageUrl)
                .buyerName(buyerName)
                .sellerName(sellerName)
                .totalAmount(order.getTotalAmount())
                .platformFee(order.getPlatformFee())
                .quantity(order.getQuantity() != null ? order.getQuantity() : 1)
                .status(order.getStatus())
                .trackingCode(order.getTrackingCode())
                .returnTrackingCode(order.getReturnTrackingCode())
                .disputeReason(order.getDisputeReason())
                .isReviewed(isReviewed)
                .reviewRating(rating)
                .reviewComment(comment)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    public OrderResponse toResponse(Order order) {
        return toResponse(order, null);
    }

    public List<OrderResponse> toResponseList(List<Order> orders, Map<String, Review> reviewsByOrderId) {
        if (orders == null || orders.isEmpty()) {
            return Collections.emptyList();
        }
        return orders.stream()
                .map(order -> toResponse(order, reviewsByOrderId != null ? reviewsByOrderId.get(order.getId()) : null))
                .collect(Collectors.toList());
    }

    public Page<OrderResponse> toResponsePage(Page<Order> orderPage, Map<String, Review> reviewsByOrderId) {
        List<OrderResponse> dtoList = toResponseList(orderPage.getContent(), reviewsByOrderId);
        return new PageImpl<>(dtoList, orderPage.getPageable(), orderPage.getTotalElements());
    }
}
