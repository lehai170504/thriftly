package com.ecommerce.thriftauction.features.live.controller;

import com.ecommerce.thriftauction.features.live.dto.LiveSessionDto;
import com.ecommerce.thriftauction.features.live.service.LiveSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lives")
@RequiredArgsConstructor
@Tag(name = "Live Streaming", description = "Quản lý phiên livestream bán hàng và đấu giá trực tiếp")
public class LiveSessionController {
    private final LiveSessionService liveSessionService;

    @Operation(summary = "Bắt đầu phiên livestream", description = "Người bán bắt đầu phát sóng trực tiếp cho một sản phẩm đấu giá.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/start/{productId}")
    public ResponseEntity<LiveSessionDto> startLiveSession(
            @PathVariable String productId,
            Authentication authentication) {
        return ResponseEntity.ok(liveSessionService.startLiveSession(productId, authentication.getName()));
    }

    @Operation(summary = "Kết thúc phiên livestream", description = "Người bán kết thúc phiên phát sóng trực tiếp, có tùy chọn đóng luôn phiên đấu giá liên quan.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/end/{productId}")
    public ResponseEntity<LiveSessionDto> endLiveSession(
            @PathVariable String productId,
            @RequestParam(defaultValue = "false") boolean endAuction,
            Authentication authentication) {
        return ResponseEntity.ok(liveSessionService.endLiveSession(productId, authentication.getName(), endAuction));
    }

    @Operation(summary = "Lấy phiên livestream theo sản phẩm", description = "Lấy thông tin chi tiết phiên livestream gắn liền với sản phẩm đấu giá.")
    @GetMapping("/auction/{productId}")
    public ResponseEntity<LiveSessionDto> getLiveSession(@PathVariable String productId) {
        return ResponseEntity.ok(liveSessionService.getLiveSessionByAuction(productId));
    }

    @Operation(summary = "Danh sách phiên live đang diễn ra", description = "Lấy tất cả các phiên livestream đấu giá đang hoạt động trên hệ thống.")
    @GetMapping("/active")
    public ResponseEntity<List<LiveSessionDto>> getActiveLiveAuctions() {
        return ResponseEntity.ok(liveSessionService.getActiveLiveAuctions());
    }
}
