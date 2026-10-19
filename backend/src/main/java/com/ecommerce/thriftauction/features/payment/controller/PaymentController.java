package com.ecommerce.thriftauction.features.payment.controller;

import com.ecommerce.thriftauction.features.payment.dto.DepositRequest;
import com.ecommerce.thriftauction.features.payment.dto.PaymentIntentStatusResponse;
import com.ecommerce.thriftauction.features.payment.service.PaymentService;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment/payos")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment (PayOS)", description = "Tích hợp cổng thanh toán PayOS để nạp tiền vào ví điện tử")
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Tạo URL Thanh toán PayOS", description = "Tạo đường link PayOS để người dùng tiến hành nạp tiền.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/create-payment")
    public ResponseEntity<Map<String, String>> createPayment(
            @Valid @RequestBody DepositRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(paymentService.createPaymentLink(authentication.getName(), request));
    }

    @Operation(summary = "Xác minh URL trả về", description = "URL để PayOS trả kết quả về sau thanh toán. Không cộng tiền ở đây.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPaymentReturn(@RequestParam Map<String, String> params) {
        Map<String, Object> result = new HashMap<>();
        String code = params.get("code");
        String cancel = params.get("cancel");
        String status = params.get("status");

        if ("true".equals(cancel)) {
            result.put("success", false);
            result.put("message", "Đã hủy thanh toán");
            return ResponseEntity.badRequest().body(result);
        }

        if ("00".equals(code) || "PAID".equals(status)) {
            result.put("success", true);
            result.put("message", "Đang xử lý thanh toán");
            return ResponseEntity.ok(result);
        }

        result.put("success", false);
        result.put("message", "Thanh toán chưa hoàn tất");
        return ResponseEntity.badRequest().body(result);
    }

    @Operation(summary = "Kiểm tra trạng thái giao dịch", description = "Chỉ trả về payment intent thuộc người dùng hiện tại.")
    @GetMapping("/intents/{orderCode}")
    public PaymentIntentStatusResponse getPaymentIntentStatus(
            @PathVariable Long orderCode,
            Authentication authentication) {
        return paymentService.getPaymentIntentStatus(orderCode, authentication.getName());
    }

    @Operation(summary = "Xử lý Webhook PayOS", description = "Endpoint an toàn để nhận Webhook từ PayOS.")
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> handleWebhook(@RequestBody ObjectNode body) {
        Map<String, Object> response = new HashMap<>();
        try {
            paymentService.processWebhook(body);
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.warn("PayOS webhook verification or processing failed", e);
            response.put("success", false);
            response.put("message", "Webhook verification failed or error processing.");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
