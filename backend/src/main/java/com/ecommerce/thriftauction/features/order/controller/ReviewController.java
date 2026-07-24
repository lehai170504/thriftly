package com.ecommerce.thriftauction.features.order.controller;

import com.ecommerce.thriftauction.features.order.dto.ReviewRequest;
import com.ecommerce.thriftauction.features.order.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Review")
public class ReviewController {

    private final ReviewService reviewService;

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
