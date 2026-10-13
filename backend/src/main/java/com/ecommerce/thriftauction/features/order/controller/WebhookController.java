package com.ecommerce.thriftauction.features.order.controller;

import com.ecommerce.thriftauction.features.admin.service.AuditLogService;
import com.ecommerce.thriftauction.features.notification.service.NotificationService;
import com.ecommerce.thriftauction.features.order.mapper.OrderResponseMapper;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.order.service.OrderFulfillmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/webhooks")
@Tag(name = "Webhooks", description = "Tiếp nhận webhook từ các dịch vụ bên ngoài (Giao Hàng Nhanh, PayOS...)")
public class WebhookController {

    private final OrderFulfillmentService orderFulfillmentService;
    private final AuditLogService auditLogService;

    @Autowired
    public WebhookController(OrderFulfillmentService orderFulfillmentService, AuditLogService auditLogService) {
        this.orderFulfillmentService = orderFulfillmentService;
        this.auditLogService = auditLogService;
    }

    public WebhookController(
            OrderRepository orderRepository,
            NotificationService notificationService,
            AuditLogService auditLogService) {
        this.orderFulfillmentService = new OrderFulfillmentService(
                orderRepository, null, null, null, notificationService, auditLogService, null, null, null, null, null,
                new OrderResponseMapper());
        this.auditLogService = auditLogService;
    }

    @Value("${ghn.webhook-secret}")
    private String ghnWebhookSecret;

    @Operation(summary = "Webhook cập nhật trạng thái GHN", description = "Tiếp nhận callback từ đơn vị vận chuyển Giao Hàng Nhanh (GHN) để cập nhật trạng thái đơn hàng và gửi thông báo tới người mua.")
    @PostMapping("/ghn")
    public ResponseEntity<String> handleGhnWebhook(
            @RequestHeader(value = "X-Webhook-Token", required = false) String tokenHeader,
            @RequestHeader(value = "X-Webhook-Secret", required = false) String secretHeader,
            @RequestParam(value = "token", required = false) String tokenParam,
            @RequestBody Map<String, Object> payload) {

        String incomingToken = tokenHeader != null ? tokenHeader : (secretHeader != null ? secretHeader : tokenParam);
        if (!isValidWebhookSecret(incomingToken)) {
            auditLogService.log("GHN_WEBHOOK", "SYSTEM", "SECURITY_ACCESS_DENIED", "WEBHOOK", "GHN", "INVALID_TOKEN",
                    "Invalid webhook token provided", null);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid webhook token");
        }

        String orderCode = (String) payload.get("OrderCode");
        String status = (String) payload.get("Status");

        if (orderCode == null || status == null) {
            return ResponseEntity.badRequest().body("Missing OrderCode or Status");
        }

        OrderFulfillmentService.GhnWebhookProcessResult result = orderFulfillmentService
                .updateOrderStatusFromGhn(orderCode, status);
        if (result == OrderFulfillmentService.GhnWebhookProcessResult.ORDER_NOT_FOUND) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found with tracking code: " + orderCode);
        } else if (result == OrderFulfillmentService.GhnWebhookProcessResult.STATUS_CONFLICT) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Không thể cập nhật đơn hàng ở trạng thái hiện tại");
        }

        return ResponseEntity.ok("Success");
    }

    private boolean isValidWebhookSecret(String incomingToken) {
        if (incomingToken == null || ghnWebhookSecret == null || ghnWebhookSecret.isBlank()) {
            return false;
        }
        return MessageDigest.isEqual(
                ghnWebhookSecret.getBytes(StandardCharsets.UTF_8),
                incomingToken.getBytes(StandardCharsets.UTF_8));
    }
}
