package com.ecommerce.thriftauction.features.notification.controller;

import com.ecommerce.thriftauction.features.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Quản lý thông báo người dùng theo thời gian thực")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Lấy danh sách thông báo", description = "Lấy toàn bộ thông báo gửi đến người dùng hiện tại.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping
    public ResponseEntity<?> getMyNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getMyNotifications(authentication.getName()));
    }

    @Operation(summary = "Đếm số thông báo chưa đọc", description = "Lấy tổng số thông báo chưa đọc của người dùng hiện tại.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUnreadCount(authentication.getName()));
    }

    @Operation(summary = "Đánh dấu đã đọc", description = "Cập nhật trạng thái đã đọc cho một thông báo cụ thể theo ID.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id, Authentication authentication) {
        try {
            notificationService.markAsRead(id, authentication.getName());
            return ResponseEntity.ok("Marked as read");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Đánh dấu tất cả đã đọc", description = "Cập nhật toàn bộ thông báo của người dùng hiện tại sang trạng thái đã đọc.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        try {
            notificationService.markAllAsRead(authentication.getName());
            return ResponseEntity.ok("All marked as read");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id, Authentication authentication) {
        try {
            notificationService.deleteNotification(id, authentication.getName());
            return ResponseEntity.ok("Deleted notification");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAllNotifications(Authentication authentication) {
        try {
            notificationService.deleteAllNotifications(authentication.getName());
            return ResponseEntity.ok("Deleted all notifications");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
