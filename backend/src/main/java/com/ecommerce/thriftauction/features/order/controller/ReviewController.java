package com.ecommerce.thriftauction.features.order.controller;

import com.ecommerce.thriftauction.features.order.dto.ReviewRequest;
import com.ecommerce.thriftauction.features.order.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Quản lý đánh giá và nhận xét chất lượng đơn hàng/người bán")
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "Đánh giá đơn hàng", description = "Người mua gửi nhận xét và chấm điểm sao cho đơn hàng sau khi hoàn tất giao dịch.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/order/{orderId}")
    public ResponseEntity<?> createReview(
            @PathVariable String orderId,
            @RequestBody ReviewRequest request,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(reviewService.createReview(orderId, authentication.getName(), request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Lấy danh sách đánh giá của người dùng", description = "Xem tất cả các đánh giá mà một người dùng/người bán đã nhận được.")
    @GetMapping("/user/{username}")
    public ResponseEntity<?> getReviewsByUser(@PathVariable String username, Authentication authentication) {
        try {
            String currentUsername = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : null;
            return ResponseEntity.ok(reviewService.getReviewsByUsername(username, currentUsername));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeReview(@PathVariable String id, Authentication authentication) {
        try {
            return ResponseEntity.ok(reviewService.likeReview(id, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<?> replyReview(
            @PathVariable String id, 
            @RequestBody com.ecommerce.thriftauction.features.order.dto.ReviewReplyRequest request, 
            Authentication authentication) {
        try {
            return ResponseEntity.ok(reviewService.replyReview(id, authentication.getName(), request.getReply()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
