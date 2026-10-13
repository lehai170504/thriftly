package com.ecommerce.thriftauction.features.live.repository;

import com.ecommerce.thriftauction.features.live.entity.LiveSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LiveSessionRepository extends JpaRepository<LiveSession, String> {
    Optional<LiveSession> findByAuctionSessionId(String auctionSessionId);

    Optional<LiveSession> findByAgoraChannelName(String channelName);

    List<LiveSession> findByStatus(LiveSession.LiveStatus status);
}
