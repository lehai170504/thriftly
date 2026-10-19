package com.ecommerce.thriftauction.features.auction.scheduler;

import com.ecommerce.thriftauction.features.auction.entity.AuctionSession;
import com.ecommerce.thriftauction.features.auction.entity.AuctionStatus;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionScheduler {

    private final AuctionSessionRepository auctionSessionRepository;
    private final OrderService orderService;

    @Scheduled(fixedRate = 60000)
    public void checkAndEndExpiredAuctions() {
        log.info("Running Scheduled Job: checkAndEndExpiredAuctions");
        List<AuctionSession> activeSessions = auctionSessionRepository.findByStatus(AuctionStatus.ONGOING);
        LocalDateTime now = LocalDateTime.now();

        for (AuctionSession session : activeSessions) {
            if (session.getEndTime() != null && session.getEndTime().isBefore(now)) {
                log.info("Ending auction for product: {}", session.getProduct().getId());
                try {
                    orderService.endAuctionAndCreateOrder(session.getProduct().getId());
                } catch (Exception e) {
                    log.error("Failed to end auction for product {}: {}", session.getProduct().getId(), e.getMessage());
                }
            }
        }
    }
}
