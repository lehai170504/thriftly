package com.ecommerce.thriftauction.features.auction.controller;

import com.ecommerce.thriftauction.features.common.dto.BidRequest;
import com.ecommerce.thriftauction.features.common.dto.BidResponse;
import com.ecommerce.thriftauction.features.auction.service.AuctionService;
import com.ecommerce.thriftauction.features.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;
import java.security.Principal;
import org.springframework.security.core.Authentication;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Auction", description = "Quản lý đấu giá: Đặt giá thầu, lịch sử đấu giá, đặt cọc và kết thúc phiên")
public class AuctionController {

    private final AuctionService auctionService;
    private final OrderService orderService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/auction/bid")
    public void placeBid(@Payload @Valid BidRequest request, Principal principal) {
        log.info("Received bid request for session: {} amount: {}", request.getAuctionSessionId(),
                request.getBidAmount());
        try {
            if (principal == null) {
                log.warn("Unauthorized STOMP bid request received");
                return;
            }
            String username = principal.getName();

            BidResponse response = auctionService.placeBid(request, username);

            log.info("Bid placed successfully for session: {}. Broadcasting...", request.getAuctionSessionId());
            messagingTemplate.convertAndSend("/topic/auction/" + request.getAuctionSessionId(), response);
        } catch (Exception e) {
            log.error("Bid error for session {}: {}", request.getAuctionSessionId(), e.getMessage());

            if (principal != null) {
                messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/errors", e.getMessage());
            }
        }
    }

    @Operation(summary = "Lấy lịch sử đấu giá", description = "Xem danh sách các lượt đặt giá (bids) của một sản phẩm đấu giá theo ID.")
    @GetMapping("/api/v1/auctions/{productId}/bids")
    public ResponseEntity<List<BidResponse>> getAuctionHistory(@PathVariable String productId) {
        try {
            List<BidResponse> bids = auctionService.getAuctionHistory(productId);
            return ResponseEntity.ok(bids);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Kết thúc phiên đấu giá", description = "Chốt phiên đấu giá sản phẩm, xác định người thắng cuộc và tự động tạo đơn hàng tương ứng.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/api/v1/auctions/{productId}/end")
    public ResponseEntity<?> endAuction(@PathVariable String productId) {
        try {
            var response = orderService.endAuctionAndCreateOrder(productId);
            if (response == null) {
                return ResponseEntity.ok(java.util.Map.of("message", "Phiên đấu giá đã kết thúc thành công."));
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Kiểm tra trạng thái đặt cọc", description = "Kiểm tra xem người dùng hiện tại đã đặt cọc để tham gia đấu giá sản phẩm này hay chưa.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/api/v1/auctions/{productId}/deposit-status")
    public ResponseEntity<Boolean> getDepositStatus(@PathVariable String productId, Authentication authentication) {
        try {
            if (authentication != null) {
                boolean hasDeposited = auctionService.hasDeposited(productId, authentication.getName());
                return ResponseEntity.ok(hasDeposited);
            }
            return ResponseEntity.ok(false);
        } catch (Exception e) {
            return ResponseEntity.ok(false);
        }
    }

    @Operation(summary = "Đặt cọc tham gia đấu giá", description = "Trừ tiền cọc từ ví của người dùng để đủ điều kiện tham gia đấu giá sản phẩm.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/api/v1/auctions/{productId}/deposit")
    public ResponseEntity<?> placeDeposit(@PathVariable String productId, Authentication authentication) {
        try {
            auctionService.placeDeposit(productId, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Đặt cọc thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
