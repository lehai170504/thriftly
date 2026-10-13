package com.ecommerce.thriftauction.features.order.repository;

import com.ecommerce.thriftauction.features.order.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByRevieweeIdOrderByCreatedAtDesc(String revieweeId);

    Optional<Review> findByOrderId(String orderId);

    List<Review> findByOrderIdIn(Collection<String> orderIds);
}
