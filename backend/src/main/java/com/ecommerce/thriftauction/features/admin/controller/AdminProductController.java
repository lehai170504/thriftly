package com.ecommerce.thriftauction.features.admin.controller;

import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.admin.service.AdminProductService;
import com.ecommerce.thriftauction.features.admin.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Tag(name = "Admin Products", description = "Quản lý toàn bộ sản phẩm")
public class AdminProductController {

    private final AdminProductService adminProductService;
    private final AuditLogService auditLogService;

    @Operation(summary = "Lấy toàn bộ sản phẩm", description = "Admin lấy danh sách toàn bộ sản phẩm trên hệ thống có phân trang và tìm kiếm theo từ khóa.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminProductService.getAllProducts(search, PageRequest.of(page, size)));
    }

    @Operation(summary = "Xóa sản phẩm vi phạm", description = "Admin xóa bỏ sản phẩm vi phạm chính sách hoặc có báo cáo sai phạm.")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        adminProductService.deleteProduct(id);
        auditLogService.logAdmin(
                userDetails.getUsername(), "DELETE_PRODUCT",
                "PRODUCT", id, "Product #" + id.substring(0, 8),
                "Xóa sản phẩm vi phạm khỏi hệ thống",
                request.getRemoteAddr());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Buộc hủy phiên đấu giá (Force Cancel)")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{id}/force-cancel")
    public ResponseEntity<Void> forceCancelAuction(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        adminProductService.forceCancelAuction(id);
        auditLogService.logAdmin(
                userDetails.getUsername(), "FORCE_CANCEL_AUCTION",
                "PRODUCT/AUCTION", id, "Auction for Product #" + id.substring(0, 8),
                "Hủy phiên đấu giá khẩn cấp và hoàn cọc",
                request.getRemoteAddr());
        return ResponseEntity.ok().build();
    }
}
