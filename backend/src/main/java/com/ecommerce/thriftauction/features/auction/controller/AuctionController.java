package com.ecommerce.thriftauction.features.auction.controller;

import com.ecommerce.thriftauction.features.common.dto.BidRequest;
import com.ecommerce.thriftauction.features.common.dto.BidResponse;
import com.ecommerce.thriftauction.features.auction.service.AuctionService;
import com.ecommerce.thriftauction.features.order.service.OrderService;
import com.ecommerce.thriftauction.core.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Auction", description = "Quản lý đấu giá: Đặt giá thầu, lịch sử đấu giá, đặt cọc và kết thúc phiên")
public class AuctionController {

    private final AuctionService auctionService;
    private final OrderService orderService;
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtService jwtService;

    @MessageMapping("/auction/bid")
    public void placeBid(@Payload BidRequest request,
            @Header(value = "Authorization", defaultValue = "") String authHeader,
            SimpMessageHeaderAccessor headerAccessor) {
        System.out.println(
                "Received bid request for: " + request.getAuctionSessionId() + " amount: " + request.getBidAmount());
        try {
            if (authHeader == null || authHeader.isEmpty() || !authHeader.startsWith("Bearer ")) {
                authHeader = headerAccessor.getFirstNativeHeader("Authorization");
            }
            if (authHeader == null || authHeader.isEmpty() || !authHeader.startsWith("Bearer ")) {
                System.out.println("Unauthorized STOMP request. Auth header: " + authHeader);
                return;
            }
            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);
            if (username == null) {
                System.out.println("Username could not be extracted from token");
                return;
            }

            BidResponse response = auctionService.placeBid(request, username);

            System.out.println("Bid placed successfully. Broadcasting...");
            messagingTemplate.convertAndSend("/topic/auction/" + request.getAuctionSessionId(), response);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Bid Error: " + e.getMessage());

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String username = jwtService.extractUsername(authHeader.substring(7));
                    if (username != null) {
                        messagingTemplate.convertAndSendToUser(username, "/queue/errors", e.getMessage());
                    }
                } catch (Exception ex) {
                    System.err.println("Could not send error back: " + ex.getMessage());
                }
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
            return ResponseEntity.ok(orderService.endAuctionAndCreateOrder(productId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Kiểm tra trạng thái đặt cọc", description = "Kiểm tra xem người dùng hiện tại đã đặt cọc để tham gia đấu giá sản phẩm này hay chưa.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/api/v1/auctions/{productId}/deposit-status")
    public ResponseEntity<Boolean> getDepositStatus(@PathVariable String productId,
            @RequestHeader(value = "Authorization", defaultValue = "") String authHeader) {
        try {
            if (authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtService.extractUsername(token);
                boolean hasDeposited = auctionService.hasDeposited(productId, username);
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
    public ResponseEntity<?> placeDeposit(@PathVariable String productId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);
            auctionService.placeDeposit(productId, username);
            return ResponseEntity.ok(Map.of("message", "Đặt cọc thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
