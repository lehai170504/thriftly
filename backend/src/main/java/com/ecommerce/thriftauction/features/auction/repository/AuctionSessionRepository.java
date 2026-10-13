package com.ecommerce.thriftauction.features.auction.repository;

import com.ecommerce.thriftauction.features.auction.entity.AuctionSession;
import com.ecommerce.thriftauction.features.auction.entity.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface AuctionSessionRepository extends JpaRepository<AuctionSession, String> {
    List<AuctionSession> findByStatus(AuctionStatus status);

    Optional<AuctionSession> findByProductId(String productId);

    List<AuctionSession> findByProductIdIn(Collection<String> productIds);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM AuctionSession s WHERE s.product.id = :productId")
    Optional<AuctionSession> findByProductIdForUpdate(@Param("productId") String productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM AuctionSession s WHERE s.id = :id")
    Optional<AuctionSession> findByIdForUpdate(@Param("id") String id);
}
