package com.ecommerce.thriftauction.features.order.controller;

import com.ecommerce.thriftauction.features.notification.entity.NotificationType;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
@Tag(name = "Webhooks", description = "Tiếp nhận webhook từ các dịch vụ bên ngoài (Giao Hàng Nhanh, PayOS...)")
public class WebhookController {

    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    @Operation(summary = "Webhook cập nhật trạng thái GHN", description = "Tiếp nhận callback từ đơn vị vận chuyển Giao Hàng Nhanh (GHN) để cập nhật trạng thái đơn hàng và gửi thông báo tới người mua.")
    @PostMapping("/ghn")
    public ResponseEntity<String> handleGhnWebhook(@RequestBody Map<String, Object> payload) {
        try {
            System.out.println("Received GHN Webhook: " + payload);

            String orderCode = (String) payload.get("OrderCode");
            String status = (String) payload.get("Status");

            if (orderCode == null || status == null) {
                return ResponseEntity.badRequest().body("Missing OrderCode or Status");
            }

            orderRepository.findByTrackingCode(orderCode).ifPresent(order -> {
                OrderStatus oldStatus = order.getStatus();

                switch (status) {
                    case "ready_to_pick":
                    case "picking":
                    case "picked":
                    case "delivering":
                        order.setStatus(OrderStatus.SHIPPED);
                        break;
                    case "delivered":
                        order.setStatus(OrderStatus.DELIVERED);
                        break;
                    case "cancel":
                        order.setStatus(OrderStatus.CANCELED);
                        break;
                }

                if (oldStatus != order.getStatus()) {
                    orderRepository.save(order);

                    String message = "Đơn hàng của bạn đang được giao.";
                    if (order.getStatus() == OrderStatus.DELIVERED) {
                        message = "Đơn hàng của bạn đã được giao thành công!";
                    } else if (order.getStatus() == OrderStatus.CANCELED) {
                        message = "Đơn hàng của bạn đã bị hủy bởi đơn vị vận chuyển.";
                    }

                    notificationService.createAndSendNotification(
                            order.getBuyer(),
                            "Cập nhật trạng thái vận chuyển",
                            message + " Mã vận đơn: " + orderCode,
                            NotificationType.SYSTEM,
                            order.getId());
                }
            });

            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error processing webhook");
        }
    }
}
