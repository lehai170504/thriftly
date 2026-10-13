package com.ecommerce.thriftauction;

import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.order.dto.OrderResponse;
import com.ecommerce.thriftauction.features.order.dto.SellerAnalyticsResponse;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.order.service.GhnLogisticsService;
import com.ecommerce.thriftauction.features.order.service.OrderService;
import com.ecommerce.thriftauction.features.payment.entity.Wallet;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.product.entity.Category;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import com.ecommerce.thriftauction.features.product.repository.CategoryRepository;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import com.ecommerce.thriftauction.features.voucher.dto.VoucherValidationRequest;
import com.ecommerce.thriftauction.features.voucher.dto.VoucherValidationResponse;
import com.ecommerce.thriftauction.features.voucher.entity.Voucher;
import com.ecommerce.thriftauction.features.voucher.entity.VoucherType;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:tc:postgresql:15.3:///order_slice_test",
        "spring.datasource.driver-class-name=org.testcontainers.jdbc.ContainerDatabaseDriver",
        "spring.datasource.username=test",
        "spring.datasource.password=test",
        "spring.flyway.enabled=true",
        "spring.flyway.baseline-on-migrate=true",
        "spring.jpa.hibernate.ddl-auto=validate"
})
public class OrderSliceCharacterizationTests {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WalletRepository walletRepository;

    @MockBean
    private GhnLogisticsService ghnLogisticsService;

    private User buyer;
    private User seller;
    private Category category;

    @BeforeEach
    public void setup() {
        when(ghnLogisticsService.calculateShippingFee(any(), any())).thenReturn(new BigDecimal("30000"));

        List<User> users = userRepository.findByRole(Role.USER);
        if (users.size() < 2) {
            buyer = createUser("char_buyer_" + UUID.randomUUID().toString().substring(0, 6));
            seller = createUser("char_seller_" + UUID.randomUUID().toString().substring(0, 6));
        } else {
            buyer = users.get(0);
            seller = users.get(1);
        }

        List<Category> categories = categoryRepository.findAll();
        if (categories.isEmpty()) {
            Category c = new Category();
            c.setName("Char Category " + UUID.randomUUID().toString().substring(0, 6));
            category = categoryRepository.save(c);
        } else {
            category = categories.get(0);
        }
    }

    private User createUser(String username) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(username + "@test.com");
        u.setPassword("password123");
        u.setRole(Role.USER);
        u.setActive(true);
        u = userRepository.save(u);

        Wallet w = Wallet.builder().user(u).balance(new BigDecimal("1000000")).heldBalance(BigDecimal.ZERO).build();
        walletRepository.save(w);
        return u;
    }

    private Product createProduct(BigDecimal price, int quantity) {
        Product p = new Product();
        p.setSeller(seller);
        p.setTitle("Char Product " + UUID.randomUUID());
        p.setPrice(price);
        p.setQuantity(quantity);
        p.setSellType(SellType.BUY_NOW);
        p.setStatus(ProductStatus.ACTIVE);
        p.setCategory(category);
        return productRepository.save(p);
    }

    @Test
    @Transactional
    public void testValidateCheckout_fixedDiscount() {
        Product product = createProduct(new BigDecimal("200000"), 5);

        Voucher voucher = Voucher.builder()
                .code("FIXED-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .type(VoucherType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("50000"))
                .quantity(10)
                .usageLimitPerUser(1)
                .expiryDate(LocalDateTime.now().plusDays(5))
                .isActive(true)
                .build();
        voucher = voucherRepository.save(voucher);

        VoucherValidationRequest req = new VoucherValidationRequest();
        req.setProductId(product.getId());
        req.setQuantity(1);
        req.setVoucherCode(voucher.getCode());

        VoucherValidationResponse res = orderService.validateCheckout(req, buyer.getUsername());

        assertThat(res.getTotalProductPrice()).isEqualByComparingTo(new BigDecimal("200000"));
        assertThat(res.getShippingFee()).isEqualByComparingTo(new BigDecimal("30000"));
        assertThat(res.getProductDiscount()).isEqualByComparingTo(new BigDecimal("50000"));
        assertThat(res.getShippingDiscount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(res.getFinalPrice()).isEqualByComparingTo(new BigDecimal("180000"));
    }

    @Test
    @Transactional
    public void testValidateCheckout_percentageDiscountCapped() {
        Product product = createProduct(new BigDecimal("200000"), 5);

        Voucher voucher = Voucher.builder()
                .code("PCT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .type(VoucherType.PERCENTAGE)
                .discountValue(new BigDecimal("50"))
                .maxDiscount(new BigDecimal("40000"))
                .quantity(10)
                .usageLimitPerUser(1)
                .expiryDate(LocalDateTime.now().plusDays(5))
                .isActive(true)
                .build();
        voucher = voucherRepository.save(voucher);

        VoucherValidationRequest req = new VoucherValidationRequest();
        req.setProductId(product.getId());
        req.setQuantity(1);
        req.setVoucherCode(voucher.getCode());

        VoucherValidationResponse res = orderService.validateCheckout(req, buyer.getUsername());

        assertThat(res.getTotalProductPrice()).isEqualByComparingTo(new BigDecimal("200000"));
        assertThat(res.getProductDiscount()).isEqualByComparingTo(new BigDecimal("40000"));
        assertThat(res.getFinalPrice()).isEqualByComparingTo(new BigDecimal("190000"));
    }

    @Test
    @Transactional
    public void testValidateCheckout_freeShippingDiscount() {
        Product product = createProduct(new BigDecimal("150000"), 5);

        Voucher voucher = Voucher.builder()
                .code("FREESHIP-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .type(VoucherType.FREE_SHIPPING)
                .discountValue(BigDecimal.ZERO)
                .quantity(10)
                .usageLimitPerUser(1)
                .expiryDate(LocalDateTime.now().plusDays(5))
                .isActive(true)
                .build();
        voucher = voucherRepository.save(voucher);

        VoucherValidationRequest req = new VoucherValidationRequest();
        req.setProductId(product.getId());
        req.setQuantity(1);
        req.setVoucherCode(voucher.getCode());

        VoucherValidationResponse res = orderService.validateCheckout(req, buyer.getUsername());

        assertThat(res.getShippingDiscount()).isEqualByComparingTo(new BigDecimal("30000"));
        assertThat(res.getFinalPrice()).isEqualByComparingTo(new BigDecimal("150000"));
    }

    @Test
    @Transactional
    public void testShipOrderAndDisputeOrder() {
        Product product = createProduct(new BigDecimal("100000"), 2);
        Order order = Order.builder()
                .buyer(buyer)
                .seller(seller)
                .product(product)
                .totalAmount(new BigDecimal("100000"))
                .status(OrderStatus.PAID)
                .build();
        order = orderRepository.save(order);

        OrderResponse shipped = orderService.shipOrder(order.getId(), seller.getUsername(), "TRACK-999");
        assertThat(shipped.getStatus()).isEqualTo(OrderStatus.SHIPPED);
        assertThat(shipped.getTrackingCode()).isEqualTo("TRACK-999");

        OrderResponse disputed = orderService.disputeOrder(order.getId(), buyer.getUsername(), "Defective item");
        assertThat(disputed.getStatus()).isEqualTo(OrderStatus.DISPUTED);
        assertThat(disputed.getDisputeReason()).isEqualTo("Defective item");
    }

    @Test
    @Transactional
    public void testSellerAnalyticsCharacterization() {
        Product product = createProduct(new BigDecimal("100000"), 5);

        Order completedOrder = Order.builder()
                .buyer(buyer)
                .seller(seller)
                .product(product)
                .totalAmount(new BigDecimal("100000"))
                .platformFee(new BigDecimal("5000"))
                .status(OrderStatus.COMPLETED)
                .build();
        orderRepository.save(completedOrder);

        SellerAnalyticsResponse analytics = orderService.getSellerAnalytics(seller.getUsername(), 7);

        assertThat(analytics.getTotalOrders()).isGreaterThanOrEqualTo(1);
        assertThat(analytics.getCompletedOrders()).isGreaterThanOrEqualTo(1);
        assertThat(analytics.getTotalRevenue()).isGreaterThanOrEqualTo(new BigDecimal("95000"));
        assertThat(analytics.getRevenueChart()).isNotEmpty();
    }
}
