package com.ecommerce.thriftauction.features.order.service;

import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.order.domain.OrderPricingCalculator;
import com.ecommerce.thriftauction.features.order.dto.OrderResponse;
import com.ecommerce.thriftauction.features.order.dto.SellerAnalyticsResponse;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import com.ecommerce.thriftauction.features.order.entity.Review;
import com.ecommerce.thriftauction.features.order.mapper.OrderResponseMapper;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.order.repository.ReviewRepository;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import com.ecommerce.thriftauction.features.voucher.dto.VoucherValidationRequest;
import com.ecommerce.thriftauction.features.voucher.dto.VoucherValidationResponse;
import com.ecommerce.thriftauction.features.voucher.entity.Voucher;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherRepository;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderQueryService {

        private final OrderRepository orderRepository;
        private final ProductRepository productRepository;
        private final UserRepository userRepository;
        private final ReviewRepository reviewRepository;
        private final VoucherRepository voucherRepository;
        private final VoucherUsageRepository voucherUsageRepository;
        private final GhnLogisticsService ghnLogisticsService;
        private final OrderResponseMapper orderResponseMapper;

        private Map<String, Review> fetchReviewsForOrders(List<Order> orders) {
                if (orders == null || orders.isEmpty()) {
                        return Collections.emptyMap();
                }
                List<String> orderIds = orders.stream().map(Order::getId).collect(Collectors.toList());
                List<Review> reviews = reviewRepository.findByOrderIdIn(orderIds);
                return reviews.stream()
                                .filter(r -> r.getOrder() != null && r.getOrder().getId() != null)
                                .collect(Collectors.toMap(r -> r.getOrder().getId(), Function.identity(),
                                                (existing, replacing) -> existing));
        }

        @Transactional(readOnly = true)
        public VoucherValidationResponse validateCheckout(VoucherValidationRequest request, String buyerUsername) {
                User buyer = userRepository.findByEmail(buyerUsername)
                                .or(() -> userRepository.findByUsername(buyerUsername))
                                .orElseThrow(() -> new RuntimeException("Buyer not found"));
                Product product = productRepository.findById(request.getProductId())
                                .orElseThrow(() -> new RuntimeException("Product not found"));

                int requestedQuantity = request.getQuantity() != null ? request.getQuantity() : 1;
                BigDecimal totalProductPrice = product.getPrice().multiply(new BigDecimal(requestedQuantity));
                BigDecimal shippingFee = ghnLogisticsService.calculateShippingFee(product, buyer);

                Voucher appliedVoucher = null;
                if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
                        appliedVoucher = voucherRepository.findByCodeAndIsActiveTrue(request.getVoucherCode().trim())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Voucher không tồn tại hoặc đã bị khóa"));

                        long usageCount = voucherUsageRepository.countByVoucherIdAndUserId(appliedVoucher.getId(),
                                        buyer.getId());
                        String sellerId = product.getSeller() != null ? product.getSeller().getId() : null;
                        OrderPricingCalculator.validateVoucher(appliedVoucher, totalProductPrice, sellerId, usageCount,
                                        LocalDateTime.now());
                }

                OrderPricingCalculator.PricingBreakdown breakdown = OrderPricingCalculator.calculate(
                                totalProductPrice, shippingFee, appliedVoucher);

                return VoucherValidationResponse.builder()
                                .totalProductPrice(breakdown.totalProductPrice())
                                .shippingFee(breakdown.shippingFee())
                                .productDiscount(breakdown.productDiscount())
                                .shippingDiscount(breakdown.shippingDiscount())
                                .finalPrice(breakdown.finalPrice())
                                .message("Áp dụng mã giảm giá thành công")
                                .build();
        }

        @Transactional(readOnly = true)
        public Page<OrderResponse> getMyOrders(String username, Pageable pageable) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));
                Page<Order> orderPage = orderRepository
                                .findByBuyerIdAndDeletedByBuyerFalseOrderByCreatedAtDesc(user.getId(), pageable);
                Map<String, Review> reviews = fetchReviewsForOrders(orderPage.getContent());
                return orderResponseMapper.toResponsePage(orderPage, reviews);
        }

        @Transactional(readOnly = true)
        public Page<OrderResponse> getMySales(String username, Pageable pageable) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));
                Page<Order> orderPage = orderRepository.findBySellerIdOrderByCreatedAtDesc(user.getId(), pageable);
                Map<String, Review> reviews = fetchReviewsForOrders(orderPage.getContent());
                return orderResponseMapper.toResponsePage(orderPage, reviews);
        }

        @Transactional(readOnly = true)
        public Page<OrderResponse> getAllOrders(String search, Pageable pageable) {
                Page<Order> orderPage;
                if (search != null && !search.trim().isEmpty()) {
                        orderPage = orderRepository.searchAllOrders(search.trim(), pageable);
                } else {
                        orderPage = orderRepository.findAll(pageable);
                }
                Map<String, Review> reviews = fetchReviewsForOrders(orderPage.getContent());
                return orderResponseMapper.toResponsePage(orderPage, reviews);
        }

        @Transactional(readOnly = true)
        public Page<OrderResponse> getAllDisputedOrders(String search, Pageable pageable) {
                Page<Order> orderPage;
                if (search != null && !search.trim().isEmpty()) {
                        orderPage = orderRepository.findByStatusAndSearch(OrderStatus.DISPUTED, search.trim(),
                                        pageable);
                } else {
                        orderPage = orderRepository.findByStatusOrderByCreatedAtDesc(OrderStatus.DISPUTED, pageable);
                }
                Map<String, Review> reviews = fetchReviewsForOrders(orderPage.getContent());
                return orderResponseMapper.toResponsePage(orderPage, reviews);
        }

        @Transactional(readOnly = true)
        public SellerAnalyticsResponse getSellerAnalytics(String username, int days) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                LocalDateTime cutoffDate = days > 0 ? LocalDateTime.now().minusDays(days) : null;
                List<Order> allOrders = orderRepository.findBySellerId(user.getId());

                List<Order> sellerOrders = cutoffDate != null
                                ? allOrders.stream().filter(
                                                o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(cutoffDate))
                                                .collect(Collectors.toList())
                                : allOrders;

                long totalOrders = sellerOrders.size();
                long pendingOrders = sellerOrders.stream()
                                .filter(o -> o.getStatus() == OrderStatus.PENDING_PAYMENT
                                                || o.getStatus() == OrderStatus.PAID)
                                .count();
                long completedOrders = sellerOrders.stream()
                                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                                .count();
                long canceledOrders = sellerOrders.stream()
                                .filter(o -> o.getStatus() == OrderStatus.CANCELED)
                                .count();

                BigDecimal totalRevenue = sellerOrders.stream()
                                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                                .map(o -> {
                                        BigDecimal amount = o.getTotalAmount() != null ? o.getTotalAmount()
                                                        : BigDecimal.ZERO;
                                        BigDecimal fee = o.getPlatformFee() != null ? o.getPlatformFee()
                                                        : BigDecimal.ZERO;
                                        return amount.subtract(fee);
                                })
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                Map<String, BigDecimal> dailyRevMap = sellerOrders.stream()
                                .filter(o -> o.getStatus() == OrderStatus.COMPLETED && o.getCreatedAt() != null)
                                .collect(Collectors.groupingBy(
                                                o -> o.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                                                Collectors.reducing(
                                                                BigDecimal.ZERO,
                                                                o -> {
                                                                        BigDecimal amount = o.getTotalAmount() != null
                                                                                        ? o.getTotalAmount()
                                                                                        : BigDecimal.ZERO;
                                                                        BigDecimal fee = o.getPlatformFee() != null
                                                                                        ? o.getPlatformFee()
                                                                                        : BigDecimal.ZERO;
                                                                        return amount.subtract(fee);
                                                                },
                                                                BigDecimal::add)));

                List<SellerAnalyticsResponse.DailyRevenue> chart = new ArrayList<>();
                int chartDays = days > 0 ? days : 30;
                for (int i = chartDays - 1; i >= 0; i--) {
                        String date = LocalDateTime.now().minusDays(i)
                                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                        chart.add(SellerAnalyticsResponse.DailyRevenue.builder()
                                        .date(date)
                                        .revenue(dailyRevMap.getOrDefault(date, BigDecimal.ZERO))
                                        .build());
                }

                long waitingForShipmentOrders = sellerOrders.stream()
                                .filter(o -> o.getStatus() == OrderStatus.PAID)
                                .count();
                long returnRequests = sellerOrders.stream()
                                .filter(o -> o.getStatus() == OrderStatus.RETURNING
                                                || o.getStatus() == OrderStatus.DISPUTED)
                                .count();

                List<Product> sellerProducts = productRepository.findBySellerId(user.getId());
                long activeProducts = sellerProducts.stream()
                                .filter(p -> p.getStatus() == ProductStatus.ACTIVE
                                                && (p.getQuantity() == null || p.getQuantity() > 0))
                                .count();
                long outOfStockProducts = sellerProducts.stream()
                                .filter(p -> p.getStatus() != ProductStatus.DELETED && p.getQuantity() != null
                                                && p.getQuantity() <= 0)
                                .count();
                long activeAuctions = sellerProducts.stream()
                                .filter(p -> p.getSellType() == SellType.AUCTION
                                                && p.getStatus() == ProductStatus.ACTIVE)
                                .count();

                List<Review> sellerReviews = reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(user.getId());
                double averageRating = sellerReviews.isEmpty() ? 0.0
                                : sellerReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

                return SellerAnalyticsResponse.builder()
                                .totalRevenue(totalRevenue)
                                .totalOrders(totalOrders)
                                .pendingOrders(pendingOrders)
                                .completedOrders(completedOrders)
                                .canceledOrders(canceledOrders)
                                .waitingForShipmentOrders(waitingForShipmentOrders)
                                .returnRequests(returnRequests)
                                .activeProducts(activeProducts)
                                .outOfStockProducts(outOfStockProducts)
                                .activeAuctions(activeAuctions)
                                .averageRating(averageRating)
                                .revenueChart(chart)
                                .build();
        }
}
