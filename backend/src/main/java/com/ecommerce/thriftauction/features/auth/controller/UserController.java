package com.ecommerce.thriftauction.features.auth.controller;

import com.ecommerce.thriftauction.features.auth.dto.ChangePasswordRequest;
import com.ecommerce.thriftauction.features.auth.dto.SetPasswordRequest;
import com.ecommerce.thriftauction.features.auth.dto.UserRequest;
import com.ecommerce.thriftauction.features.auth.dto.UserResponse;
import com.ecommerce.thriftauction.features.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Quản lý thông tin người dùng và phân quyền")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Lấy thông tin cá nhân", description = "Lấy thông tin của người dùng đang đăng nhập.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication.getName()));
    }

    @Operation(summary = "Lấy hồ sơ người dùng", description = "Xem public profile của một user.")
    @GetMapping("/profile/{username}")
    public ResponseEntity<UserResponse> getUserProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserProfile(username));
    }

    @Operation(summary = "Lấy danh sách người dùng", description = "Admin lấy danh sách người dùng.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(userService.getAllUsers(search, pageable));
    }

    @Operation(summary = "Cập nhật hồ sơ", description = "Cập nhật thông tin cá nhân của người dùng đang đăng nhập.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UserRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), request));
    }

    @Operation(summary = "Đổi mật khẩu", description = "Đổi mật khẩu khi người dùng đang đăng nhập.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok("Đổi mật khẩu thành công.");
    }

    @Operation(summary = "Thiết lập mật khẩu lần đầu", description = "Thiết lập mật khẩu trực tiếp cho tài khoản đăng nhập qua Google.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/me/set-password")
    public ResponseEntity<UserResponse> setPassword(
            @Valid @RequestBody SetPasswordRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(userService.setPassword(authentication.getName(), request));
    }

    @Operation(summary = "Khóa tài khoản (Ban)", description = "Admin khóa tài khoản người dùng.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{id}/ban")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<UserResponse> banUser(@PathVariable String id) {
        return ResponseEntity.ok(userService.banUser(id));
    }

    @Operation(summary = "Mở khóa tài khoản (Unban)", description = "Admin mở khóa tài khoản người dùng.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{id}/unban")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<UserResponse> unbanUser(@PathVariable String id) {
        return ResponseEntity.ok(userService.unbanUser(id));
    }

    @Operation(summary = "Thay đổi Hạng Thành Viên", description = "Admin thay đổi hạng thành viên của người dùng thủ công.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{id}/tier")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserTier(@PathVariable String id, @RequestParam String tier) {
        return ResponseEntity.ok(userService.updateUserTier(id, tier));
    }

    @Operation(summary = "Thay đổi Vai trò (Role)", description = "Admin cấp quyền hoặc hạ cấp người dùng (USER <-> STAFF).")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserRole(@PathVariable String id, @RequestParam String role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }
}
