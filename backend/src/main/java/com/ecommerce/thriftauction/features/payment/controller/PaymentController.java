package com.ecommerce.thriftauction.features.payment.controller;

import com.ecommerce.thriftauction.core.config.properties.PayosProperties;
import com.ecommerce.thriftauction.features.payment.dto.DepositRequest;
import com.ecommerce.thriftauction.features.payment.dto.PaymentIntentStatusResponse;
import com.ecommerce.thriftauction.features.payment.entity.PaymentIntent;
import com.ecommerce.thriftauction.features.payment.entity.PaymentIntentStatus;
import com.ecommerce.thriftauction.features.payment.repository.PaymentIntentRepository;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.webhooks.WebhookData;

import java.util.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/payment/payos")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment (PayOS)", description = "Tích hợp cổng thanh toán PayOS để nạp tiền vào ví điện tử")
public class PaymentController {

    private final PayOS payOS;
    private final PayosProperties payosProperties;
    private final WalletService walletService;
    private final PaymentIntentRepository paymentIntentRepository;
    private final UserRepository userRepository;

    @Operation(summary = "Tạo URL Thanh toán PayOS", description = "Tạo đường link PayOS để người dùng tiến hành nạp tiền.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/create-payment")
    public ResponseEntity<Map<String, String>> createPayment(@RequestBody DepositRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByEmail(username)
                    .or(() -> userRepository.findByUsername(username))
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate orderCode
            long orderCode = Long
                    .parseLong(String.valueOf(System.currentTimeMillis() / 1000) + (int) (Math.random() * 100));

            // Create PaymentIntent
            PaymentIntent intent = PaymentIntent.builder()
                    .user(user)
                    .orderCode(orderCode)
                    .amount(request.getAmount())
                    .currency("VND")
                    .status(PaymentIntentStatus.PENDING)
                    .build();
            paymentIntentRepository.save(intent);

            String itemName = "Nạp tiền Thriftly: " + username;
            PaymentLinkItem item = PaymentLinkItem.builder().name(itemName).quantity(1)
                    .price(request.getAmount().longValue()).build();
            List<PaymentLinkItem> itemList = new ArrayList<>();
            itemList.add(item);

            String payosDescription = "THRIFTLY";

            CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount(request.getAmount().longValue())
                    .description(payosDescription)
                    .returnUrl(payosProperties.getReturnUrl() + "?orderCode=" + orderCode)
                    .cancelUrl(payosProperties.getCancelUrl())
                    .items(itemList)
                    .build();

            CreatePaymentLinkResponse data = payOS.paymentRequests().create(paymentData);

            Map<String, String> result = new HashMap<>();
            result.put("paymentUrl", data.getCheckoutUrl());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to create PayOS payment link", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Xác minh URL trả về", description = "URL để PayOS trả kết quả về sau thanh toán. Không cộng tiền ở đây.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPaymentReturn(@RequestParam Map<String, String> params,
            Authentication authentication) {
        Map<String, Object> result = new HashMap<>();
        try {
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
        } catch (Exception e) {
            log.warn("PayOS return verification failed", e);
            result.put("success", false);
            result.put("message", "Lỗi xác minh thanh toán");
            return ResponseEntity.badRequest().body(result);
        }
    }

    @Operation(summary = "Kiểm tra trạng thái giao dịch", description = "Chỉ trả về payment intent thuộc người dùng hiện tại.")
    @GetMapping("/intents/{orderCode}")
    public PaymentIntentStatusResponse getPaymentIntentStatus(
            @PathVariable Long orderCode,
            Authentication authentication) {
        PaymentIntent intent = paymentIntentRepository.findOwnedByOrderCode(orderCode, authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment intent not found"));
        return new PaymentIntentStatusResponse(
                intent.getOrderCode(),
                intent.getStatus(),
                intent.getAmount(),
                intent.getCurrency(),
                intent.getUpdatedAt());
    }

    @Operation(summary = "Xử lý Webhook PayOS", description = "Endpoint an toàn để nhận Webhook từ PayOS.")
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> handleWebhook(@RequestBody ObjectNode body) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Verify signature using SDK
            WebhookData data = payOS.webhooks().verify(body);
            if (data != null) {
                walletService.processPaymentIntentWebhook(data);
            }

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
