package com.ecommerce.thriftauction.features.live.service;

import com.ecommerce.thriftauction.features.order.service.OrderService;

import com.ecommerce.thriftauction.features.live.dto.LiveSessionDto;
import com.ecommerce.thriftauction.features.auction.entity.AuctionSession;
import com.ecommerce.thriftauction.features.live.entity.LiveSession;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.live.repository.LiveSessionRepository;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LiveSessionService {
    private final LiveSessionRepository liveSessionRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;

    @Transactional
    public LiveSessionDto startLiveSession(String productId, String username) {
        User host = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        AuctionSession auctionSession = auctionSessionRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Auction session not found"));

        if (!auctionSession.getProduct().getSeller().getId().equals(host.getId())) {
            throw new RuntimeException("Only the seller can start a live stream for this auction");
        }

        // Check if there's already an active session
        var existingSession = liveSessionRepository.findByAuctionSessionId(auctionSession.getId());
        if (existingSession.isPresent()) {
            LiveSession session = existingSession.get();
            if (session.getStatus() == LiveSession.LiveStatus.LIVE) {
                return mapToDto(session);
            }
            // If ended, we could either allow restarting or throw error. Let's create a new
            // one or update.
            // For simplicity, let's just update the existing one to LIVE again or throw
            // error.
            // Usually, 1 live per auction. We will just update it.
            session.setStatus(LiveSession.LiveStatus.LIVE);
            session.setStartedAt(LocalDateTime.now());
            session.setEndedAt(null);
            session.setViewerCount(0); // Reset viewer count when restarting

            auctionSession.getProduct().setIsLive(true);

            return mapToDto(liveSessionRepository.save(session));
        }

        String channelName = "auction_live_" + auctionSession.getId();

        LiveSession liveSession = LiveSession.builder()
                .auctionSession(auctionSession)
                .host(host)
                .agoraChannelName(channelName)
                .status(LiveSession.LiveStatus.LIVE)
                .viewerCount(0)
                .startedAt(LocalDateTime.now())
                .build();

        auctionSession.getProduct().setIsLive(true);

        return mapToDto(liveSessionRepository.save(liveSession));
    }

    @Transactional
    public LiveSessionDto endLiveSession(String productId, String username, boolean endAuction) {
        AuctionSession auctionSession = auctionSessionRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Auction session not found"));

        LiveSession session = liveSessionRepository.findByAuctionSessionId(auctionSession.getId())
                .orElseThrow(() -> new RuntimeException("Live session not found"));

        User host = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!session.getHost().getId().equals(host.getId())) {
            throw new RuntimeException("Only the host can end the live stream");
        }

        session.setStatus(LiveSession.LiveStatus.ENDED);
        session.setEndedAt(LocalDateTime.now());

        auctionSession.getProduct().setIsLive(false);

        if (endAuction) {
            orderService.endAuctionAndCreateOrder(productId);
        }

        return mapToDto(liveSessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public LiveSessionDto getLiveSessionByAuction(String productId) {
        AuctionSession auctionSession = auctionSessionRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Auction session not found"));

        return liveSessionRepository.findByAuctionSessionId(auctionSession.getId())
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Live session not found"));
    }

    @Transactional(readOnly = true)
    public List<LiveSessionDto> getActiveLiveAuctions() {
        return liveSessionRepository.findByStatus(LiveSession.LiveStatus.LIVE)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public LiveSessionDto mapToDto(LiveSession session) {
        String thumbnail = session.getAuctionSession().getProduct().getImageUrl();
        BigDecimal currentPrice = session.getAuctionSession().getCurrentHighestPrice() != null
                ? session.getAuctionSession().getCurrentHighestPrice()
                : session.getAuctionSession().getStartingPrice();

        return LiveSessionDto.builder()
                .id(session.getId())
                .auctionSessionId(session.getAuctionSession().getId())
                .productId(session.getAuctionSession().getProduct().getId())
                .productName(session.getAuctionSession().getProduct().getTitle())
                .productThumbnail(thumbnail)
                .hostId(session.getHost().getId())
                .hostUsername(session.getHost().getUsername())
                .agoraChannelName(session.getAgoraChannelName())
                .status(session.getStatus().name())
                .viewerCount(session.getViewerCount())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .currentPrice(currentPrice)
                .build();
    }
}
