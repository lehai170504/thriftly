package com.ecommerce.thriftauction.features.order.service;

import com.ecommerce.thriftauction.features.admin.service.AuditLogService;
import com.ecommerce.thriftauction.features.admin.service.SystemConfigService;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.auth.service.LoyaltyService;
import com.ecommerce.thriftauction.features.notification.service.NotificationService;
import com.ecommerce.thriftauction.features.order.dto.OrderResponse;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import com.ecommerce.thriftauction.features.order.mapper.OrderResponseMapper;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherRepository;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherUsageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderFulfillmentServiceTests {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private SystemConfigService systemConfigService;

    @Mock
    private LoyaltyService loyaltyService;

    @Mock
    private WalletService walletService;

    @Mock
    private VoucherRepository voucherRepository;

    @Mock
    private VoucherUsageRepository voucherUsageRepository;

    @Mock
    private OrderResponseMapper orderResponseMapper;

    @InjectMocks
    private OrderFulfillmentService orderFulfillmentService;

    private User buyer;
    private User seller;
    private Product product;
    private Order order;

    @BeforeEach
    void setUp() {
        buyer = User.builder().id("buyer-1").username("buyer1").email("buyer@test.com").build();
        seller = User.builder().id("seller-1").username("seller1").email("seller@test.com").build();
        product = Product.builder().id("prod-1").title("Denim Jeans").seller(seller).quantity(5).build();

        order = Order.builder()
                .id("order-12345678")
                .buyer(buyer)
                .seller(seller)
                .product(product)
                .quantity(1)
                .totalAmount(new BigDecimal("250000"))
                .status(OrderStatus.PAID)
                .build();
    }

    @Test
    void shipOrder_successful() {
        when(orderRepository.findById("order-12345678")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderResponseMapper.toResponse(order))
                .thenReturn(OrderResponse.builder().id(order.getId()).status(OrderStatus.SHIPPED).build());

        OrderResponse response = orderFulfillmentService.shipOrder("order-12345678", "seller@test.com", "GHN123456");

        assertNotNull(response);
        assertEquals(OrderStatus.SHIPPED, order.getStatus());
        assertEquals("GHN123456", order.getTrackingCode());
        verify(notificationService, times(1)).createAndSendNotification(eq(buyer), any(), any(), any(),
                eq(order.getId()));
    }

    @Test
    void shipOrder_failsWhenNotSeller() {
        when(orderRepository.findById("order-12345678")).thenReturn(Optional.of(order));

        assertThrows(AccessDeniedException.class,
                () -> orderFulfillmentService.shipOrder("order-12345678", "buyer@test.com", "GHN123456"));
    }

    @Test
    void disputeOrder_successful() {
        when(orderRepository.findById("order-12345678")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderResponseMapper.toResponse(order))
                .thenReturn(OrderResponse.builder().id(order.getId()).status(OrderStatus.DISPUTED).build());

        OrderResponse response = orderFulfillmentService.disputeOrder("order-12345678", "buyer@test.com", "Hang loi");

        assertNotNull(response);
        assertEquals(OrderStatus.DISPUTED, order.getStatus());
        assertEquals("Hang loi", order.getDisputeReason());
        verify(notificationService, times(1)).createAndSendNotification(eq(seller), any(), any(), any(),
                eq(order.getId()));
    }

    @Test
    void disputeOrder_failsWhenNotBuyer() {
        when(orderRepository.findById("order-12345678")).thenReturn(Optional.of(order));

        assertThrows(AccessDeniedException.class,
                () -> orderFulfillmentService.disputeOrder("order-12345678", "seller@test.com", "Hang loi"));
    }

    @Test
    void resolveDispute_buyerWins() {
        order.setStatus(OrderStatus.DISPUTED);
        when(orderRepository.findById("order-12345678")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderResponseMapper.toResponse(order))
                .thenReturn(OrderResponse.builder().id(order.getId()).status(OrderStatus.RETURNING).build());

        OrderResponse response = orderFulfillmentService.resolveDispute("order-12345678", "BUYER");

        assertNotNull(response);
        assertEquals(OrderStatus.RETURNING, order.getStatus());
        verify(notificationService, times(1)).createAndSendNotification(eq(buyer), any(), any(), any(),
                eq(order.getId()));
        verify(notificationService, times(1)).createAndSendNotification(eq(seller), any(), any(), any(),
                eq(order.getId()));
    }

    @Test
    void returnShipped_successful() {
        order.setStatus(OrderStatus.RETURNING);
        when(orderRepository.findById("order-12345678")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderResponseMapper.toResponse(order))
                .thenReturn(OrderResponse.builder().id(order.getId()).status(OrderStatus.RETURNING).build());

        OrderResponse response = orderFulfillmentService.returnShipped("order-12345678", "buyer@test.com", "RET987654");

        assertNotNull(response);
        assertEquals("RET987654", order.getReturnTrackingCode());
        verify(notificationService, times(1)).createAndSendNotification(eq(seller), any(), any(), any(),
                eq(order.getId()));
    }
}
