package com.ecommerce.thriftauction.features.order.controller;

import com.ecommerce.thriftauction.features.order.service.OrderService;
import com.ecommerce.thriftauction.features.voucher.dto.VoucherValidationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Quản lý đơn hàng mua/bán, thanh toán Escrow, và khiếu nại")
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Tạo đơn Mua Ngay", description = "Người mua bấm mua ngay một sản phẩm.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/buy-now/{productId}")
    public ResponseEntity<?> createBuyNowOrder(@PathVariable String productId,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        String voucherCode = body != null ? body.get("voucherCode") : null;
        Integer quantity = 1;
        if (body != null && body.get("quantity") != null) {
            try {
                quantity = Integer.parseInt(String.valueOf(body.get("quantity")));
            } catch (NumberFormatException ignored) {
            }
        }
        return ResponseEntity
                .ok(orderService.createBuyNowOrder(productId, voucherCode, quantity, authentication.getName()));
    }

    @Operation(summary = "Kiểm tra thanh toán", description = "Tính toán số tiền cuối cùng, phí ship và kiểm tra voucher trước khi đặt hàng.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/checkout-preview")
    public ResponseEntity<?> validateCheckout(
            @RequestBody @Valid VoucherValidationRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.validateCheckout(request, authentication.getName()));
    }

    @Operation(summary = "Đơn mua của tôi", description = "Danh sách các đơn hàng mà user hiện tại đã mua.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/me")
    public ResponseEntity<?> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(orderService.getMyOrders(authentication.getName(), pageable));
    }

    @Operation(summary = "Ẩn/Xóa đơn hàng", description = "Người mua ẩn đơn hàng đã hoàn thành hoặc đã hủy khỏi danh sách.")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/me/{orderId}/hide")
    public ResponseEntity<?> hideOrder(@PathVariable String orderId, Authentication authentication) {
        orderService.hideOrderForBuyer(orderId, authentication.getName());
        return ResponseEntity.ok("Order hidden successfully");
    }

    @Operation(summary = "Đơn bán của tôi", description = "Danh sách các đơn hàng mà user hiện tại đang bán.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/sales")
    public ResponseEntity<?> getMySales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(orderService.getMySales(authentication.getName(), pageable));
    }

    @Operation(summary = "Thanh toán (Escrow Hold)", description = "Chuyển tiền từ Ví Người Mua vào quỹ Tạm Giữ.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{orderId}/pay")
    public ResponseEntity<?> payOrder(@PathVariable String orderId, Authentication authentication) {
        return ResponseEntity.ok(orderService.payOrder(authentication.getName(), orderId));
    }

    @Operation(summary = "Xác nhận đã nhận hàng (Escrow Release)", description = "Người mua xác nhận đã nhận hàng. Tiền Tạm Giữ sẽ được chuyển vào ví Người Bán.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{orderId}/confirm-receipt")
    public ResponseEntity<?> confirmReceipt(@PathVariable String orderId, Authentication authentication) {
        orderService.confirmReceiptAndReleaseEscrow(orderId, authentication.getName());
        return ResponseEntity.ok("Receipt confirmed and money released to seller.");
    }

    @Operation(summary = "Khiếu nại đơn hàng", description = "Người mua khiếu nại nếu hàng lỗi hoặc không đúng mô tả.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{orderId}/dispute")
    public ResponseEntity<?> disputeOrder(@PathVariable String orderId,
            @RequestBody(required = false) Map<String, String> body, Authentication authentication) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(orderService.disputeOrder(orderId, authentication.getName(), reason));
    }

    @Operation(summary = "Cập nhật mã vận đơn", description = "Người bán cập nhật mã vận đơn khi đã giao cho đơn vị vận chuyển.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{orderId}/ship")
    public ResponseEntity<?> shipOrder(@PathVariable String orderId, @RequestBody Map<String, String> body,
            Authentication authentication) {
        String trackingCode = body.get("trackingCode");
        return ResponseEntity.ok(orderService.shipOrder(orderId, authentication.getName(), trackingCode));
    }

    @Operation(summary = "Người mua cập nhật mã vận đơn trả hàng", description = "Khi đơn hàng ở trạng thái RETURNING (Người mua thắng khiếu nại).")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{orderId}/return-ship")
    public ResponseEntity<?> returnShipped(@PathVariable String orderId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String trackingCode = body.get("trackingCode");
        return ResponseEntity.ok(orderService.returnShipped(orderId, authentication.getName(), trackingCode));
    }

    @Operation(summary = "Người bán xác nhận đã nhận hàng hoàn", description = "Khi người bán nhận được hàng trả về, họ xác nhận để hệ thống hoàn tiền cho người mua.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{orderId}/confirm-return")
    public ResponseEntity<?> confirmReturnReceived(@PathVariable String orderId, Authentication authentication) {
        return ResponseEntity.ok(orderService.confirmReturnReceived(orderId, authentication.getName()));
    }

    @Operation(summary = "Thống kê cho người bán", description = "Lấy dữ liệu thống kê doanh thu và đơn hàng cho Seller Dashboard.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/seller/analytics")
    public ResponseEntity<?> getSellerAnalytics(
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.getSellerAnalytics(authentication.getName(), days));
    }
}
