package com.ecommerce.thriftauction.features.order.service;

import com.ecommerce.thriftauction.features.admin.service.AuditLogService;
import com.ecommerce.thriftauction.features.admin.service.SystemConfigService;
import com.ecommerce.thriftauction.features.auction.repository.AuctionDepositRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionBidRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.auth.service.LoyaltyService;
import com.ecommerce.thriftauction.features.notification.entity.NotificationType;
import com.ecommerce.thriftauction.features.notification.service.NotificationService;
import com.ecommerce.thriftauction.features.order.domain.OrderPricingCalculator;
import com.ecommerce.thriftauction.features.order.dto.OrderResponse;
import com.ecommerce.thriftauction.features.order.dto.SellerAnalyticsResponse;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import com.ecommerce.thriftauction.features.order.mapper.OrderResponseMapper;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.order.repository.ReviewRepository;
import com.ecommerce.thriftauction.features.payment.entity.TransactionType;
import com.ecommerce.thriftauction.features.payment.entity.Wallet;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import com.ecommerce.thriftauction.features.voucher.dto.VoucherValidationRequest;
import com.ecommerce.thriftauction.features.voucher.dto.VoucherValidationResponse;
import com.ecommerce.thriftauction.features.voucher.entity.Voucher;
import com.ecommerce.thriftauction.features.voucher.entity.VoucherUsage;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherRepository;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherUsageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class OrderService {

        private final OrderRepository orderRepository;
        private final ProductRepository productRepository;
        private final WalletRepository walletRepository;
        private final LoyaltyService loyaltyService;
        private final UserRepository userRepository;
        private final AuctionSessionRepository auctionSessionRepository;
        private final AuctionDepositRepository auctionDepositRepository;
        private final NotificationService notificationService;
        private final VoucherRepository voucherRepository;
        private final VoucherUsageRepository voucherUsageRepository;
        private final GhnLogisticsService ghnLogisticsService;
        private final AuditLogService auditLogService;
        private final SystemConfigService systemConfigService;
        private final WalletService walletService;
        private final OrderResponseMapper orderResponseMapper;
        private final OrderQueryService orderQueryService;
        private final OrderFulfillmentService orderFulfillmentService;
        private final AuctionOrderSettlementService auctionOrderSettlementService;

        @Autowired
        public OrderService(
                        OrderRepository orderRepository,
                        ProductRepository productRepository,
                        WalletRepository walletRepository,
                        LoyaltyService loyaltyService,
                        UserRepository userRepository,
                        AuctionSessionRepository auctionSessionRepository,
                        AuctionDepositRepository auctionDepositRepository,
                        NotificationService notificationService,
                        VoucherRepository voucherRepository,
                        VoucherUsageRepository voucherUsageRepository,
                        GhnLogisticsService ghnLogisticsService,
                        AuditLogService auditLogService,
                        SystemConfigService systemConfigService,
                        WalletService walletService,
                        OrderResponseMapper orderResponseMapper,
                        OrderQueryService orderQueryService,
                        OrderFulfillmentService orderFulfillmentService,
                        AuctionOrderSettlementService auctionOrderSettlementService) {
                this.orderRepository = orderRepository;
                this.productRepository = productRepository;
                this.walletRepository = walletRepository;
                this.loyaltyService = loyaltyService;
                this.userRepository = userRepository;
                this.auctionSessionRepository = auctionSessionRepository;
                this.auctionDepositRepository = auctionDepositRepository;
                this.notificationService = notificationService;
                this.voucherRepository = voucherRepository;
                this.voucherUsageRepository = voucherUsageRepository;
                this.ghnLogisticsService = ghnLogisticsService;
                this.auditLogService = auditLogService;
                this.systemConfigService = systemConfigService;
                this.walletService = walletService;
                this.orderResponseMapper = orderResponseMapper;
                this.orderQueryService = orderQueryService;
                this.orderFulfillmentService = orderFulfillmentService;
                this.auctionOrderSettlementService = auctionOrderSettlementService;
        }

        public OrderService(
                        OrderRepository orderRepository,
                        ProductRepository productRepository,
                        WalletRepository walletRepository,
                        LoyaltyService loyaltyService,
                        UserRepository userRepository,
                        AuctionBidRepository auctionBidRepository,
                        AuctionSessionRepository auctionSessionRepository,
                        AuctionDepositRepository auctionDepositRepository,
                        NotificationService notificationService,
                        ReviewRepository reviewRepository,
                        VoucherRepository voucherRepository,
                        VoucherUsageRepository voucherUsageRepository,
                        GhnLogisticsService ghnLogisticsService,
                        AuditLogService auditLogService,
                        SystemConfigService systemConfigService,
                        WalletService walletService) {
                this.orderRepository = orderRepository;
                this.productRepository = productRepository;
                this.walletRepository = walletRepository;
                this.loyaltyService = loyaltyService;
                this.userRepository = userRepository;
                this.auctionSessionRepository = auctionSessionRepository;
                this.auctionDepositRepository = auctionDepositRepository;
                this.notificationService = notificationService;
                this.voucherRepository = voucherRepository;
                this.voucherUsageRepository = voucherUsageRepository;
                this.ghnLogisticsService = ghnLogisticsService;
                this.auditLogService = auditLogService;
                this.systemConfigService = systemConfigService;
                this.walletService = walletService;
                this.orderResponseMapper = new OrderResponseMapper();
                this.orderQueryService = new OrderQueryService(
                                orderRepository, productRepository, userRepository, reviewRepository,
                                voucherRepository, voucherUsageRepository, ghnLogisticsService,
                                this.orderResponseMapper);
                this.orderFulfillmentService = new OrderFulfillmentService(
                                orderRepository, productRepository, walletRepository, userRepository,
                                notificationService, auditLogService, systemConfigService, loyaltyService,
                                walletService, voucherRepository, voucherUsageRepository, this.orderResponseMapper);
                this.auctionOrderSettlementService = new AuctionOrderSettlementService(
                                orderRepository, productRepository, auctionSessionRepository, auctionBidRepository,
                                auctionDepositRepository, walletRepository, walletService, notificationService,
                                this.orderResponseMapper);
        }

        @Transactional
        public OrderResponse createBuyNowOrder(String productId, String voucherCode, Integer requestedQuantity,
                        String buyerUsername) {
                User buyer = userRepository.findByEmail(buyerUsername)
                                .or(() -> userRepository.findByUsername(buyerUsername))
                                .orElseThrow(() -> new RuntimeException("Buyer not found"));
                Product product = productRepository.findByIdForUpdate(productId)
                                .orElseThrow(() -> new RuntimeException("Product not found"));

                if (product.getSellType() != SellType.BUY_NOW || product.getStatus() != ProductStatus.ACTIVE) {
                        throw new RuntimeException("Product is not available for Buy Now");
                }

                int productQuantity = product.getQuantity() != null ? product.getQuantity() : 1;
                if (productQuantity < requestedQuantity) {
                        throw new RuntimeException("Product quantity is not enough");
                }

                BigDecimal totalProductPrice = product.getPrice().multiply(new BigDecimal(requestedQuantity));
                BigDecimal shippingFee = ghnLogisticsService.calculateShippingFee(product, buyer);

                Voucher appliedVoucher = null;
                if (voucherCode != null && !voucherCode.trim().isEmpty()) {
                        appliedVoucher = voucherRepository.findByCodeAndIsActiveTrueForUpdate(voucherCode.trim())
                                        .orElseThrow(() -> new RuntimeException("Voucher not found or inactive"));

                        long usageCount = voucherUsageRepository.countByVoucherIdAndUserId(appliedVoucher.getId(),
                                        buyer.getId());
                        String sellerId = product.getSeller() != null ? product.getSeller().getId() : null;
                        OrderPricingCalculator.validateVoucher(appliedVoucher, totalProductPrice, sellerId, usageCount,
                                        LocalDateTime.now());
                }

                OrderPricingCalculator.PricingBreakdown breakdown = OrderPricingCalculator.calculate(
                                totalProductPrice, shippingFee, appliedVoucher);

                BigDecimal finalPrice = breakdown.finalPrice();

                Wallet buyerWallet = walletRepository.findByUserIdForUpdate(buyer.getId())
                                .orElseThrow(() -> new RuntimeException("Buyer wallet not found"));

                if (buyerWallet.getBalance().compareTo(finalPrice) < 0) {
                        throw new RuntimeException("Insufficient balance in wallet. Please top up.");
                }

                Order order = Order.builder()
                                .buyer(buyer)
                                .seller(product.getSeller())
                                .product(product)
                                .quantity(requestedQuantity)
                                .totalAmount(finalPrice)
                                .appliedVoucher(appliedVoucher)
                                .discountAmount(breakdown.totalDiscount())
                                .status(OrderStatus.PAID)
                                .logisticsProvider("GHN")
                                .build();
                orderRepository.save(order);

                walletService.executeEscrowHold(buyerWallet, finalPrice, TransactionType.ESCROW_HOLD,
                                "Tạm giữ (Ký quỹ) cho đơn hàng #" + order.getId().substring(0, 8).toUpperCase() + " - "
                                                + product.getTitle(),
                                null, order);

                Map<String, Object> ghnResult = ghnLogisticsService.createShippingOrder(order);
                if (ghnResult != null) {
                        order.setTrackingCode((String) ghnResult.get("trackingCode"));
                        order.setShippingFee((BigDecimal) ghnResult.get("shippingFee"));
                        orderRepository.save(order);
                } else {
                        order.setShippingFee(shippingFee);
                        orderRepository.save(order);
                }

                if (appliedVoucher != null) {
                        appliedVoucher.setQuantity(appliedVoucher.getQuantity() - 1);
                        voucherRepository.save(appliedVoucher);

                        VoucherUsage usage = VoucherUsage.builder()
                                        .voucher(appliedVoucher)
                                        .user(buyer)
                                        .order(order)
                                        .build();
                        voucherUsageRepository.save(usage);
                }

                int newQuantity = productQuantity - requestedQuantity;
                product.setQuantity(newQuantity);
                if (newQuantity <= 0) {
                        product.setStatus(ProductStatus.SOLD);
                }
                productRepository.save(product);

                notificationService.createAndSendNotification(
                                product.getSeller(),
                                "Có người vừa mua sản phẩm của bạn!",
                                "Người dùng " + buyer.getUsername() + " đã mua " + product.getTitle() + " với giá "
                                                + String.format(Locale.forLanguageTag("vi-VN"), "%,.0fđ",
                                                                product.getPrice())
                                                + ".",
                                NotificationType.ORDER_CREATED,
                                order.getId());

                auditLogService.logUser(
                                buyer.getUsername(), "BUY_NOW",
                                "ORDER", order.getId(),
                                product.getTitle(),
                                "Mua sản phẩm giá " + String.format(Locale.forLanguageTag("vi-VN"), "%,.0f VNĐ",
                                                finalPrice));

                return orderResponseMapper.toResponse(order);
        }

        @Transactional(readOnly = true)
        public VoucherValidationResponse validateCheckout(VoucherValidationRequest request, String buyerUsername) {
                return orderQueryService.validateCheckout(request, buyerUsername);
        }

        @Transactional(readOnly = true)
        public Page<OrderResponse> getMyOrders(String username, Pageable pageable) {
                return orderQueryService.getMyOrders(username, pageable);
        }

        @Transactional
        public void hideOrderForBuyer(String orderId, String username) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                if (!order.getBuyer().getId().equals(user.getId())) {
                        throw new AccessDeniedException("Only buyer can hide their order");
                }

                if (order.getStatus() != OrderStatus.COMPLETED && order.getStatus() != OrderStatus.CANCELED
                                && order.getStatus() != OrderStatus.RETURNED) {
                        throw new RuntimeException("Chỉ có thể xóa đơn hàng khi đã hoàn thành hoặc đã hủy.");
                }

                order.setDeletedByBuyer(true);
                orderRepository.save(order);
        }

        @Transactional(readOnly = true)
        public Page<OrderResponse> getMySales(String username, Pageable pageable) {
                return orderQueryService.getMySales(username, pageable);
        }

        @Transactional
        public void confirmReceiptAndReleaseEscrow(String orderId, String buyerUsername) {
                Order order = orderRepository.findByIdForUpdate(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                if (!order.getBuyer().getEmail().equals(buyerUsername)
                                && !order.getBuyer().getUsername().equals(buyerUsername)) {
                        throw new AccessDeniedException("Only buyer can confirm receipt");
                }

                if (order.getStatus() == OrderStatus.COMPLETED) {
                        return;
                }

                if (order.getStatus() != OrderStatus.PAID && order.getStatus() != OrderStatus.SHIPPED
                                && order.getStatus() != OrderStatus.DELIVERED) {
                        throw new RuntimeException("Invalid order status to confirm receipt");
                }

                order.setStatus(OrderStatus.COMPLETED);

                loyaltyService.awardPoints(order.getBuyer(), order.getTotalAmount());
                loyaltyService.awardPoints(order.getSeller(), order.getTotalAmount());

                BigDecimal baseFeePercentage = systemConfigService.getConfig().getPlatformFeePercent();
                BigDecimal discountedFeePercentage = loyaltyService.calculateDiscountedPlatformFee(baseFeePercentage,
                                order.getSeller().getTier());

                BigDecimal platformFee = order.getTotalAmount().multiply(discountedFeePercentage);

                order.setPlatformFee(platformFee);
                orderRepository.save(order);

                String buyerUserId = order.getBuyer().getId();
                String sellerUserId = order.getSeller().getId();
                String firstUserId = buyerUserId.compareTo(sellerUserId) <= 0 ? buyerUserId : sellerUserId;
                String secondUserId = buyerUserId.compareTo(sellerUserId) <= 0 ? sellerUserId : buyerUserId;

                Wallet firstWallet = walletRepository.findByUserIdForUpdate(firstUserId)
                                .orElseThrow(() -> new RuntimeException("Wallet not found"));
                Wallet secondWallet = walletRepository.findByUserIdForUpdate(secondUserId)
                                .orElseThrow(() -> new RuntimeException("Wallet not found"));

                Wallet buyerWallet = buyerUserId.equals(firstUserId) ? firstWallet : secondWallet;
                Wallet sellerWallet = sellerUserId.equals(firstUserId) ? firstWallet : secondWallet;

                var adminUsers = userRepository.findByRole(Role.ADMIN);
                Wallet adminWallet = null;
                if (!adminUsers.isEmpty()) {
                        adminWallet = walletRepository.findByUserIdForUpdate(adminUsers.get(0).getId()).orElse(null);
                }

                String description = "Thanh toán đơn hàng #" + order.getId().substring(0, 8).toUpperCase()
                                + " - " + order.getProduct().getTitle() + " (Đã trừ phí sàn "
                                + discountedFeePercentage.multiply(new BigDecimal("100")).intValue()
                                + "%: " + platformFee + "đ)";

                walletService.executeEscrowRelease(buyerWallet, sellerWallet, order.getTotalAmount(), platformFee,
                                adminWallet, description, "escrow-release-" + order.getId(), order);

                notificationService.createAndSendNotification(
                                order.getSeller(),
                                "Tiền đã được chuyển vào ví!",
                                "Người mua đã xác nhận nhận hàng cho đơn " + order.getProduct().getTitle()
                                                + ". Tiền Escrow đã được chuyển vào ví của bạn.",
                                NotificationType.ESCROW_RELEASED,
                                order.getId());
        }

        @Transactional
        public OrderResponse endAuctionAndCreateOrder(String productId) {
                return auctionOrderSettlementService.endAuctionAndCreateOrder(productId);
        }

        @Transactional
        public OrderResponse payOrder(String username, String orderId) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Order order = orderRepository.findByIdForUpdate(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                if (!order.getBuyer().getId().equals(user.getId())) {
                        throw new AccessDeniedException("Not your order");
                }

                if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
                        throw new RuntimeException("Order is not pending payment");
                }

                Wallet wallet = walletRepository.findByUserIdForUpdate(user.getId())
                                .orElseThrow(() -> new RuntimeException("Wallet not found"));

                if (wallet.getBalance().compareTo(order.getTotalAmount()) < 0) {
                        throw new RuntimeException("Số dư không đủ để thanh toán");
                }

                walletService.executeEscrowHold(wallet, order.getTotalAmount(), TransactionType.ESCROW_HOLD,
                                "Tạm giữ (Ký quỹ) cho đơn hàng #"
                                                + order.getId().substring(0, 8).toUpperCase() + " - "
                                                + order.getProduct().getTitle(),
                                null, order);

                order.setStatus(OrderStatus.PAID);
                order.setLogisticsProvider("GHN");
                Order savedOrder = orderRepository.save(order);

                Map<String, Object> ghnResult = ghnLogisticsService.createShippingOrder(savedOrder);
                if (ghnResult != null) {
                        savedOrder.setTrackingCode((String) ghnResult.get("trackingCode"));
                        savedOrder.setShippingFee((BigDecimal) ghnResult.get("shippingFee"));
                        orderRepository.save(savedOrder);
                }

                notificationService.createAndSendNotification(
                                order.getSeller(),
                                "Đơn hàng đã được thanh toán Escrow!",
                                "Người mua đã thanh toán cho đơn hàng " + order.getProduct().getTitle()
                                                + ". Tiền đang được hệ thống tạm giữ. Vui lòng giao hàng.",
                                NotificationType.ORDER_PAID,
                                order.getId());

                return orderResponseMapper.toResponse(savedOrder);
        }

        @Transactional
        public OrderResponse disputeOrder(String orderId, String username, String reason) {
                return orderFulfillmentService.disputeOrder(orderId, username, reason);
        }

        @Transactional
        public OrderResponse shipOrder(String orderId, String username, String trackingCode) {
                return orderFulfillmentService.shipOrder(orderId, username, trackingCode);
        }

        @Transactional(readOnly = true)
        public Page<OrderResponse> getAllOrders(String search, Pageable pageable) {
                return orderQueryService.getAllOrders(search, pageable);
        }

        @Transactional(readOnly = true)
        public Page<OrderResponse> getAllDisputedOrders(String search, Pageable pageable) {
                return orderQueryService.getAllDisputedOrders(search, pageable);
        }

        @Transactional
        public OrderResponse resolveDispute(String orderId, String winner) {
                return orderFulfillmentService.resolveDispute(orderId, winner);
        }

        @Transactional
        public OrderResponse returnShipped(String orderId, String username, String returnTrackingCode) {
                return orderFulfillmentService.returnShipped(orderId, username, returnTrackingCode);
        }

        @Transactional
        public OrderResponse confirmReturnReceived(String orderId, String username) {
                return orderFulfillmentService.confirmReturnReceived(orderId, username);
        }

        @Transactional(readOnly = true)
        public SellerAnalyticsResponse getSellerAnalytics(String username, int days) {
                return orderQueryService.getSellerAnalytics(username, days);
        }

        @Transactional
        public void autoCancelPendingOrders() {
                LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
                List<Order> pendingOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING_PAYMENT,
                                twentyFourHoursAgo);

                for (Order o : pendingOrders) {
                        Order order = orderRepository.findByIdForUpdate(o.getId()).orElse(null);
                        if (order == null || order.getStatus() != OrderStatus.PENDING_PAYMENT) {
                                continue;
                        }

                        order.setStatus(OrderStatus.CANCELED);
                        orderRepository.save(order);

                        Product product = productRepository.findByIdForUpdate(order.getProduct().getId())
                                        .orElse(order.getProduct());
                        product.setStatus(ProductStatus.ACTIVE);
                        productRepository.save(product);

                        if (product.getSellType() == SellType.AUCTION) {
                                auctionSessionRepository.findByProductIdForUpdate(product.getId())
                                                .ifPresent(session -> {
                                                        auctionDepositRepository.findByUserIdAndAuctionSessionId(
                                                                        order.getBuyer().getId(), session.getId())
                                                                        .ifPresent(deposit -> {
                                                                                if (!deposit.isRefunded()) {
                                                                                        String buyerUserId = order
                                                                                                        .getBuyer()
                                                                                                        .getId();
                                                                                        String sellerUserId = order
                                                                                                        .getSeller()
                                                                                                        .getId();
                                                                                        String firstUserId = buyerUserId
                                                                                                        .compareTo(sellerUserId) <= 0
                                                                                                                        ? buyerUserId
                                                                                                                        : sellerUserId;
                                                                                        String secondUserId = buyerUserId
                                                                                                        .compareTo(sellerUserId) <= 0
                                                                                                                        ? sellerUserId
                                                                                                                        : buyerUserId;

                                                                                        Wallet firstWallet = walletRepository
                                                                                                        .findByUserIdForUpdate(
                                                                                                                        firstUserId)
                                                                                                        .orElse(null);
                                                                                        Wallet secondWallet = walletRepository
                                                                                                        .findByUserIdForUpdate(
                                                                                                                        secondUserId)
                                                                                                        .orElse(null);

                                                                                        Wallet buyerWallet = buyerUserId
                                                                                                        .equals(firstUserId)
                                                                                                                        ? firstWallet
                                                                                                                        : secondWallet;
                                                                                        Wallet sellerWallet = sellerUserId
                                                                                                        .equals(firstUserId)
                                                                                                                        ? firstWallet
                                                                                                                        : secondWallet;

                                                                                        if (buyerWallet != null
                                                                                                        && sellerWallet != null) {
                                                                                                walletService.executeEscrowRelease(
                                                                                                                buyerWallet,
                                                                                                                sellerWallet,
                                                                                                                deposit.getAmount(),
                                                                                                                BigDecimal.ZERO,
                                                                                                                null,
                                                                                                                "Phạt tiền cọc do không thanh toán đơn hàng: "
                                                                                                                                + product.getTitle(),
                                                                                                                "deposit-penalty-"
                                                                                                                                + order.getId(),
                                                                                                                order);
                                                                                        }

                                                                                        deposit.setRefunded(true);
                                                                                        auctionDepositRepository
                                                                                                        .save(deposit);
                                                                                }
                                                                        });
                                                });
                        }

                        notificationService.createAndSendNotification(
                                        order.getBuyer(),
                                        "Đơn hàng đã bị hủy tự động",
                                        "Đơn hàng " + product.getTitle() + " đã bị hủy do quá hạn thanh toán 24h.",
                                        NotificationType.ORDER_CANCELED,
                                        order.getId());

                        notificationService.createAndSendNotification(
                                        order.getSeller(),
                                        "Đơn hàng đã bị hủy",
                                        "Người mua không thanh toán đơn hàng " + product.getTitle()
                                                        + " trong 24h. Sản phẩm đã được tự động đăng bán lại.",
                                        NotificationType.ORDER_CANCELED,
                                        order.getId());
                }
        }

        @Transactional
        public void autoCompleteShippedOrders() {
                LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);
                List<Order> shippedOrders = orderRepository.findByStatusAndUpdatedAtBefore(OrderStatus.SHIPPED,
                                threeDaysAgo);

                for (Order order : shippedOrders) {
                        try {
                                confirmReceiptAndReleaseEscrow(order.getId(), order.getBuyer().getUsername());

                                notificationService.createAndSendNotification(
                                                order.getBuyer(),
                                                "Đơn hàng đã tự động hoàn thành",
                                                "Hệ thống đã tự động xác nhận đơn hàng " + order.getProduct().getTitle()
                                                                + " sau 3 ngày kể từ khi giao hàng.",
                                                NotificationType.ESCROW_RELEASED,
                                                order.getId());
                        } catch (Exception e) {
                        }
                }
        }
}
