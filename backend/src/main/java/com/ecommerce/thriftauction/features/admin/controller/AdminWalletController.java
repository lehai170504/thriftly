package com.ecommerce.thriftauction.features.admin.controller;

import com.ecommerce.thriftauction.features.payment.dto.TransactionResponse;
import com.ecommerce.thriftauction.features.admin.service.AdminWalletService;
import com.ecommerce.thriftauction.features.admin.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.Map;
import java.util.HashMap;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/admin/withdrawals")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Tag(name = "Admin Wallet", description = "Quản lý hệ thống tài chính: Xét duyệt rút tiền và Thống kê quỹ (Yêu cầu quyền ADMIN)")
public class AdminWalletController {

    private final AdminWalletService adminWalletService;
    private final AuditLogService auditLogService;

    @Operation(summary = "Lấy yêu cầu rút tiền", description = "Lấy danh sách các lệnh rút tiền đang chờ duyệt.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getPendingWithdrawals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminWalletService.getPendingWithdrawals(search, pageable));
    }

    @Operation(summary = "Tổng ký quỹ", description = "Tính tổng số tiền Escrow đang được giữ trong hệ thống.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/total-escrow")
    public ResponseEntity<Map<String, BigDecimal>> getTotalEscrow() {
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("totalEscrow", adminWalletService.getTotalEscrow());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Duyệt lệnh rút tiền", description = "Admin xác nhận đã chuyển khoản và duyệt lệnh rút tiền.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{id}/approve")
    public ResponseEntity<TransactionResponse> approveWithdrawal(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        TransactionResponse result = adminWalletService.approveWithdrawal(id);
        auditLogService.logAdmin(
                userDetails.getUsername(), "APPROVE_WITHDRAWAL",
                "TRANSACTION", id,
                "Withdrawal #" + id.substring(0, 8) + " by " + result.getUsername(),
                "Duyệt rút tiền " + result.getAmount() + " VND cho user: " + result.getUsername(),
                request.getRemoteAddr());
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Từ chối rút tiền", description = "Admin từ chối lệnh rút và hoàn lại tiền vào số dư người dùng.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{id}/reject")
    public ResponseEntity<TransactionResponse> rejectWithdrawal(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        TransactionResponse result = adminWalletService.rejectWithdrawal(id);
        auditLogService.logAdmin(
                userDetails.getUsername(), "REJECT_WITHDRAWAL",
                "TRANSACTION", id,
                "Withdrawal #" + id.substring(0, 8) + " by " + result.getUsername(),
                "Từ chối rút tiền " + result.getAmount() + " VND, hoàn lại cho user: " + result.getUsername(),
                request.getRemoteAddr());
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Điều chỉnh số dư", description = "Admin nạp/trừ tiền thủ công cho người dùng.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/users/{userId}/adjust-balance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransactionResponse> adjustUserBalance(
            @PathVariable String userId,
            @RequestParam BigDecimal amount,
            @RequestParam String reason,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        TransactionResponse result = adminWalletService.manualAdjustBalance(userId, amount, reason);
        auditLogService.logAdmin(
                userDetails.getUsername(), "ADJUST_BALANCE",
                "USER", userId, result.getUsername(),
                "Điều chỉnh " + amount + " VND. Lý do: " + reason,
                request.getRemoteAddr());
        return ResponseEntity.ok(result);
    }
}
