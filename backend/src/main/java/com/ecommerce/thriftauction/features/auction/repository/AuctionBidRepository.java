package com.ecommerce.thriftauction.features.auction.repository;

import com.ecommerce.thriftauction.features.auction.entity.AuctionBid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface AuctionBidRepository extends JpaRepository<AuctionBid, String> {
    List<AuctionBid> findByAuctionSessionIdOrderByBidAmountDesc(String auctionSessionId);

    Integer countByAuctionSessionId(String auctionSessionId);

    @Query("SELECT b.auctionSession.id, count(b) FROM AuctionBid b WHERE b.auctionSession.id IN :sessionIds GROUP BY b.auctionSession.id")
    List<Object[]> countByAuctionSessionIdIn(
            @Param("sessionIds") Collection<String> sessionIds);
}
