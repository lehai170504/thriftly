package com.ecommerce.thriftauction.features.order.repository;

import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
        @EntityGraph(attributePaths = { "buyer", "seller", "product" })
        Page<Order> findByBuyerIdAndDeletedByBuyerFalseOrderByCreatedAtDesc(String buyerId, Pageable pageable);

        @EntityGraph(attributePaths = { "buyer", "seller", "product" })
        Page<Order> findBySellerIdOrderByCreatedAtDesc(String sellerId, Pageable pageable);

        List<Order> findBySellerId(String sellerId);

        Optional<Order> findByProductId(String productId);

        Optional<Order> findByTrackingCode(String trackingCode);

        @EntityGraph(attributePaths = { "buyer", "seller", "product" })
        Page<Order> findByStatusOrderByCreatedAtDesc(
                        OrderStatus status,
                        Pageable pageable);

        @EntityGraph(attributePaths = { "buyer", "seller", "product" })
        @Query("SELECT o FROM Order o WHERE (:search IS NULL OR :search = '' OR o.id = :search OR LOWER(o.product.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.buyer.username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.seller.username) LIKE LOWER(CONCAT('%', :search, '%')))")
        Page<Order> searchAllOrders(@Param("search") String search,
                        Pageable pageable);

        @EntityGraph(attributePaths = { "buyer", "seller", "product" })
        @Query("SELECT o FROM Order o WHERE o.status = :status AND (:search IS NULL OR :search = '' OR o.id = :search OR LOWER(o.product.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.buyer.username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.seller.username) LIKE LOWER(CONCAT('%', :search, '%')))")
        Page<Order> findByStatusAndSearch(
                        @Param("status") OrderStatus status,
                        @Param("search") String search, Pageable pageable);

        @Query("SELECT o FROM Order o WHERE o.id = :query OR LOWER(o.product.title) LIKE LOWER(CONCAT('%', :query, '%'))")
        List<Order> searchOrdersByQuery(@Param("query") String query,
                        Pageable pageable);

        List<Order> findByStatusAndCreatedAtGreaterThanEqual(OrderStatus status, LocalDateTime createdAt);

        List<Order> findByStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime date);

        List<Order> findByStatusAndUpdatedAtBefore(OrderStatus status, LocalDateTime date);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT o FROM Order o WHERE o.id = :id")
        Optional<Order> findByIdForUpdate(@Param("id") String id);
}
