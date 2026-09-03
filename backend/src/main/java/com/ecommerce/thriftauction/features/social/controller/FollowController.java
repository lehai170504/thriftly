package com.ecommerce.thriftauction.features.social.controller;

import com.ecommerce.thriftauction.features.auth.dto.UserResponse;
import com.ecommerce.thriftauction.features.social.service.FollowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/follows")
@RequiredArgsConstructor
@Tag(name = "Social Follow", description = "Quản lý theo dõi người bán (Seller Follow)")
public class FollowController {

    private final FollowService followService;

    @Operation(summary = "Theo dõi / Hủy theo dõi người bán", description = "Thay đổi trạng thái theo dõi đối với người bán qua username.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{username}")
    public ResponseEntity<Map<String, Object>> toggleFollow(
            @PathVariable String username,
            Authentication authentication) {
        String followerUsername = authentication.getName();
        return ResponseEntity.ok(followService.toggleFollow(followerUsername, username));
    }

    @Operation(summary = "Kiểm tra trạng thái theo dõi", description = "Kiểm tra xem người dùng hiện tại có đang theo dõi người bán này không.")
    @GetMapping("/{username}/status")
    public ResponseEntity<Map<String, Boolean>> getFollowStatus(
            @PathVariable String username,
            Authentication authentication) {
        boolean isFollowing = false;
        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getPrincipal().equals("anonymousUser")) {
            isFollowing = followService.checkFollowStatus(authentication.getName(), username);
        }
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }

    @Operation(summary = "Lấy số lượng người theo dõi", description = "Lấy tổng số lượng follower của một người bán theo username.")
    @GetMapping("/{username}/count")
    public ResponseEntity<Map<String, Long>> getFollowerCount(@PathVariable String username) {
        long count = followService.getFollowerCount(username);
        return ResponseEntity.ok(Map.of("followerCount", count));
    }

    @Operation(summary = "Lấy danh sách người theo dõi", description = "Lấy danh sách thông tin người dùng đang theo dõi một người bán.")
    @GetMapping("/{username}/followers")
    public ResponseEntity<List<UserResponse>> getFollowers(
            @PathVariable String username) {
        return ResponseEntity.ok(followService.getFollowers(username));
    }
}
