package com.ecommerce.thriftauction.features.order.service;

import com.ecommerce.thriftauction.features.admin.service.AuditLogService;
import com.ecommerce.thriftauction.features.admin.service.SystemConfigService;
import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.auth.service.LoyaltyService;
import com.ecommerce.thriftauction.features.notification.entity.NotificationType;
import com.ecommerce.thriftauction.features.notification.service.NotificationService;
import com.ecommerce.thriftauction.features.order.dto.OrderResponse;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import com.ecommerce.thriftauction.features.order.mapper.OrderResponseMapper;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.payment.entity.TransactionType;
import com.ecommerce.thriftauction.features.payment.entity.Wallet;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import com.ecommerce.thriftauction.features.voucher.entity.Voucher;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherRepository;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class OrderFulfillmentService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final SystemConfigService systemConfigService;
    private final LoyaltyService loyaltyService;
    private final WalletService walletService;
    private final VoucherRepository voucherRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final OrderResponseMapper orderResponseMapper;

    @Transactional
    public OrderResponse shipOrder(String orderId, String username, String trackingCode) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getSeller().getEmail().equals(username)
                && !order.getSeller().getUsername().equals(username)) {
            throw new AccessDeniedException("Chỉ người bán mới có quyền cập nhật vận đơn.");
        }

        if (order.getStatus() != OrderStatus.PAID) {
            throw new RuntimeException("Đơn hàng chưa được thanh toán hoặc đã giao.");
        }

        order.setStatus(OrderStatus.SHIPPED);
        order.setTrackingCode(trackingCode);
        Order savedOrder = orderRepository.save(order);

        notificationService.createAndSendNotification(
                order.getBuyer(),
                "Đơn hàng đã được giao!",
                "Người bán đã giao hàng cho đơn " + order.getProduct().getTitle() + ". Mã vận đơn: " + trackingCode,
                NotificationType.ORDER_SHIPPED,
                order.getId());

        return orderResponseMapper.toResponse(savedOrder);
    }

    @Transactional
    public OrderResponse disputeOrder(String orderId, String username, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyer().getEmail().equals(username) && !order.getBuyer().getUsername().equals(username)) {
            throw new AccessDeniedException("Chỉ người mua mới có quyền khiếu nại.");
        }

        if (order.getStatus() != OrderStatus.PAID && order.getStatus() != OrderStatus.SHIPPED
                && order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Chỉ có thể khiếu nại khi đơn hàng đã thanh toán, đang giao hoặc đã giao hàng.");
        }

        order.setStatus(OrderStatus.DISPUTED);
        order.setDisputeReason(reason);
        Order savedOrder = orderRepository.save(order);

        auditLogService.logUser(
                username, "CREATE_DISPUTE",
                "ORDER", orderId,
                order.getProduct().getTitle(),
                "Khiếu nại: " + reason);

        notificationService.createAndSendNotification(
                order.getSeller(),
                "Đơn hàng bị khiếu nại!",
                "Người mua " + username + " đã khiếu nại đơn hàng " + order.getProduct().getTitle()
                        + ". Vui lòng kiểm tra lại.",
                NotificationType.ORDER_DISPUTED,
                order.getId());

        return orderResponseMapper.toResponse(savedOrder);
    }

    @Transactional
    public OrderResponse resolveDispute(String orderId, String winner) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.DISPUTED) {
            throw new RuntimeException("Order is not in DISPUTED status");
        }

        if ("BUYER".equalsIgnoreCase(winner)) {
            order.setStatus(OrderStatus.RETURNING);

            notificationService.createAndSendNotification(
                    order.getBuyer(),
                    "Khiếu nại được chấp nhận!",
                    "Admin đã xử thắng khiếu nại cho bạn. Vui lòng cập nhật mã vận đơn trả hàng để được hoàn tiền.",
                    NotificationType.ORDER_DISPUTED,
                    order.getId());

            notificationService.createAndSendNotification(
                    order.getSeller(),
                    "Khiếu nại bị từ chối",
                    "Admin đã xử thắng cho người mua. Vui lòng chờ nhận lại hàng hoàn.",
                    NotificationType.ORDER_DISPUTED,
                    order.getId());

        } else if ("SELLER".equalsIgnoreCase(winner)) {
            Wallet sellerWallet = walletRepository.findByUserId(order.getSeller().getId())
                    .orElseThrow(() -> new RuntimeException("Seller wallet not found"));

            BigDecimal baseFeePercentage = systemConfigService.getConfig().getPlatformFeePercent();
            BigDecimal discountedFeePercentage = loyaltyService
                    .calculateDiscountedPlatformFee(baseFeePercentage, order.getSeller().getTier());

            BigDecimal totalOrderAmount = order.getTotalAmount();
            BigDecimal platformFee = totalOrderAmount.multiply(discountedFeePercentage);

            order.setPlatformFee(platformFee);

            Wallet buyerWallet = walletRepository.findByUserId(order.getBuyer().getId())
                    .orElseThrow(() -> new RuntimeException("Buyer wallet not found"));

            var adminUsers = userRepository.findByRole(Role.ADMIN);
            Wallet adminWallet = null;
            if (!adminUsers.isEmpty()) {
                adminWallet = walletRepository.findByUserId(adminUsers.get(0).getId()).orElse(null);
            }

            String description = "Thanh toán đơn hàng (Thắng khiếu nại) #"
                    + order.getId().substring(0, 8).toUpperCase() + " - "
                    + order.getProduct().getTitle() + " (Đã trừ phí sàn "
                    + discountedFeePercentage.multiply(new BigDecimal("100")).intValue()
                    + "%: " + platformFee + "đ)";

            walletService.executeEscrowRelease(buyerWallet, sellerWallet, order.getTotalAmount(),
                    platformFee, adminWallet, description, null, order);

            order.setStatus(OrderStatus.COMPLETED);

            loyaltyService.awardPoints(order.getBuyer(), order.getTotalAmount());
            loyaltyService.awardPoints(order.getSeller(), order.getTotalAmount());

            notificationService.createAndSendNotification(
                    order.getSeller(),
                    "Khiếu nại thành công!",
                    "Admin đã xử thắng khiếu nại cho bạn. Tiền " + order.getTotalAmount() + "đ đã được chuyển vào ví.",
                    NotificationType.ESCROW_RELEASED,
                    order.getId());

            notificationService.createAndSendNotification(
                    order.getBuyer(),
                    "Khiếu nại thất bại",
                    "Admin đã xử thắng cho người bán. Tiền đơn hàng "
                            + order.getProduct().getTitle()
                            + " đã được chuyển cho người bán.",
                    NotificationType.ORDER_DISPUTED,
                    order.getId());

        } else {
            throw new RuntimeException("Winner must be BUYER or SELLER");
        }

        Order savedOrder = orderRepository.save(order);
        return orderResponseMapper.toResponse(savedOrder);
    }

    @Transactional
    public OrderResponse returnShipped(String orderId, String username, String returnTrackingCode) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getBuyer().getUsername().equals(username) && !order.getBuyer().getEmail().equals(username)) {
            throw new AccessDeniedException("Chỉ người mua mới được cập nhật mã vận đơn trả hàng");
        }
        if (order.getStatus() != OrderStatus.RETURNING) {
            throw new RuntimeException("Đơn hàng không ở trạng thái chờ hoàn trả");
        }

        order.setReturnTrackingCode(returnTrackingCode);
        Order savedOrder = orderRepository.save(order);

        notificationService.createAndSendNotification(
                order.getSeller(),
                "Người mua đã gửi trả hàng",
                "Mã vận đơn hoàn trả: " + returnTrackingCode
                        + ". Vui lòng xác nhận khi nhận được hàng.",
                NotificationType.ORDER_DISPUTED,
                order.getId());

        return orderResponseMapper.toResponse(savedOrder);
    }

    @Transactional
    public OrderResponse confirmReturnReceived(String orderId, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getSeller().getUsername().equals(username)
                && !order.getSeller().getEmail().equals(username)) {
            throw new AccessDeniedException("Chỉ người bán mới được xác nhận nhận hàng hoàn");
        }
        if (order.getStatus() != OrderStatus.RETURNING) {
            throw new RuntimeException("Đơn hàng không ở trạng thái hoàn trả");
        }
        if (order.getReturnTrackingCode() == null) {
            throw new RuntimeException("Người mua chưa cập nhật mã vận đơn hoàn trả");
        }

        Wallet buyerWallet = walletRepository.findByUserId(order.getBuyer().getId())
                .orElseThrow(() -> new RuntimeException("Buyer wallet not found"));

        walletService.executeEscrowRefund(buyerWallet, order.getTotalAmount(), TransactionType.REFUND,
                "Hoàn trả ký quỹ cho đơn hàng #"
                        + order.getId().substring(0, 8).toUpperCase() + " - "
                        + order.getProduct().getTitle(),
                null, order);

        order.setStatus(OrderStatus.RETURNED);

        Product product = order.getProduct();
        int currentQty = product.getQuantity() != null ? product.getQuantity() : 0;
        product.setQuantity(currentQty + order.getQuantity());
        product.setStatus(ProductStatus.ACTIVE);
        productRepository.save(product);

        if (order.getAppliedVoucher() != null) {
            Voucher appliedVoucher = order.getAppliedVoucher();
            appliedVoucher.setQuantity(appliedVoucher.getQuantity() + 1);
            voucherRepository.save(appliedVoucher);
            voucherUsageRepository.deleteByOrderId(order.getId());
        }

        notificationService.createAndSendNotification(
                order.getBuyer(),
                "Đã hoàn tiền thành công!",
                "Người bán đã nhận được hàng hoàn. Tiền " + order.getTotalAmount()
                        + "đ đã được hoàn vào ví của bạn.",
                NotificationType.ORDER_DISPUTED,
                order.getId());

        Order saved = orderRepository.save(order);
        return orderResponseMapper.toResponse(saved);
    }

    public enum GhnWebhookProcessResult {
        SUCCESS,
        ORDER_NOT_FOUND,
        STATUS_CONFLICT,
        IGNORED
    }

    @Transactional
    public GhnWebhookProcessResult updateOrderStatusFromGhn(String orderCode, String status) {
        Order order = orderRepository.findByTrackingCode(orderCode).orElse(null);
        if (order == null) {
            return GhnWebhookProcessResult.ORDER_NOT_FOUND;
        }

        OrderStatus currentStatus = order.getStatus();
        if (currentStatus == OrderStatus.COMPLETED || currentStatus == OrderStatus.DISPUTED
                || currentStatus == OrderStatus.RETURNED || currentStatus == OrderStatus.RETURNING) {
            return GhnWebhookProcessResult.STATUS_CONFLICT;
        }

        OrderStatus targetStatus = null;
        switch (status) {
            case "ready_to_pick":
            case "picking":
            case "picked":
            case "delivering":
                targetStatus = OrderStatus.SHIPPED;
                break;
            case "delivered":
                targetStatus = OrderStatus.DELIVERED;
                break;
            case "cancel":
                targetStatus = OrderStatus.CANCELED;
                break;
            default:
                break;
        }

        if (targetStatus != null && targetStatus != currentStatus) {
            order.setStatus(targetStatus);
            orderRepository.save(order);

            String message = "Đơn hàng của bạn đang được giao.";
            if (targetStatus == OrderStatus.DELIVERED) {
                message = "Đơn hàng của bạn đã được giao thành công!";
            } else if (targetStatus == OrderStatus.CANCELED) {
                message = "Đơn hàng của bạn đã bị hủy bởi đơn vị vận chuyển.";
            }

            notificationService.createAndSendNotification(
                    order.getBuyer(),
                    "Cập nhật trạng thái vận chuyển",
                    message + " Mã vận đơn: " + orderCode,
                    NotificationType.SYSTEM,
                    order.getId());
            return GhnWebhookProcessResult.SUCCESS;
        }
        return GhnWebhookProcessResult.IGNORED;
    }
}
