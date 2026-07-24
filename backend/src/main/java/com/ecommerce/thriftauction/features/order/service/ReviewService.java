package com.ecommerce.thriftauction.features.order.service;

import com.ecommerce.thriftauction.features.order.dto.ReviewRequest;
import com.ecommerce.thriftauction.features.order.dto.ReviewResponse;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import com.ecommerce.thriftauction.features.order.entity.Review;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.order.repository.ReviewRepository;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponse createReview(String orderId, String username, ReviewRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyer().getEmail().equals(username) && !order.getBuyer().getUsername().equals(username)) {
            throw new RuntimeException("Chỉ người mua mới có quyền đánh giá.");
        }

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new RuntimeException("Chỉ có thể đánh giá sau khi đơn hàng đã hoàn thành.");
        }

        if (reviewRepository.findByOrderId(orderId).isPresent()) {
            throw new RuntimeException("Bạn đã đánh giá đơn hàng này rồi.");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Điểm đánh giá phải từ 1 đến 5.");
        }

        Review review = Review.builder()
                .reviewer(order.getBuyer())
                .reviewee(order.getSeller())
                .order(order)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);
        return mapToResponse(savedReview, username);
    }

    @Transactional
    public ReviewResponse likeReview(String reviewId, String username) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean alreadyLiked = review.getLikedByUsers().stream()
                .anyMatch(u -> u.getId().equals(user.getId()));

        if (alreadyLiked) {
            review.getLikedByUsers().removeIf(u -> u.getId().equals(user.getId()));
        } else {
            review.getLikedByUsers().add(user);
        }

        return mapToResponse(reviewRepository.save(review), username);
    }

    @Transactional
    public ReviewResponse replyReview(String reviewId, String username, String reply) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!review.getReviewee().getId().equals(user.getId())) {
            throw new RuntimeException("Chỉ người bán mới có quyền phản hồi đánh giá này.");
        }

        review.setSellerReply(reply);
        return mapToResponse(reviewRepository.save(review), username);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByUsername(String username, String currentUsername) {
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(user.getId())
                .stream().map(r -> mapToResponse(r, currentUsername)).collect(Collectors.toList());
    }

    private ReviewResponse mapToResponse(Review review, String currentUsername) {
        boolean isLiked = false;
        if (currentUsername != null) {
            isLiked = review.getLikedByUsers().stream()
                    .anyMatch(u -> u.getEmail().equals(currentUsername) || u.getUsername().equals(currentUsername));
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .reviewerName(review.getReviewer().getUsername())
                .reviewerAvatar(review.getReviewer().getAvatar())
                .revieweeName(review.getReviewee().getUsername())
                .orderId(review.getOrder().getId())
                .productTitle(review.getOrder().getProduct().getTitle())
                .rating(review.getRating())
                .comment(review.getComment())
                .sellerReply(review.getSellerReply())
                .likesCount(review.getLikedByUsers() != null ? review.getLikedByUsers().size() : 0)
                .isLikedByCurrentUser(isLiked)
                .reviewerTier(review.getReviewer().getTier() != null ? review.getReviewer().getTier().name() : "BRONZE")
                .createdAt(review.getCreatedAt())
                .build();
    }
}
