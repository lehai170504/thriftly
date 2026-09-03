package com.ecommerce.thriftauction.features.admin.controller;

import com.ecommerce.thriftauction.features.admin.dto.AuditLogResponse;
import com.ecommerce.thriftauction.features.admin.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Tag(name = "Admin Audit Logs", description = "Xem lịch sử hành động của Admin")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @Operation(summary = "Lấy toàn bộ audit log", description = "Admin xem danh sách nhật ký hành động toàn hệ thống có phân trang và bộ lọc.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping
    public ResponseEntity<Page<AuditLogResponse>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String actorRole) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(auditLogService.getLogs(search, action, actorRole, pageable));
    }
}
