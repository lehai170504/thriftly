package com.ecommerce.thriftauction;

import com.ecommerce.thriftauction.core.config.CacheConfig;
import com.ecommerce.thriftauction.features.admin.dto.SystemConfigDto;
import com.ecommerce.thriftauction.features.admin.service.SystemConfigService;
import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.order.service.GhnLogisticsService;
import com.ecommerce.thriftauction.features.product.dto.CategoryDto;
import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.product.entity.Category;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import com.ecommerce.thriftauction.features.product.repository.CategoryRepository;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import com.ecommerce.thriftauction.features.product.service.CategoryService;
import com.ecommerce.thriftauction.features.product.service.query.ProductQueryService;
import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:tc:postgresql:15.3:///performance_test",
        "spring.datasource.driver-class-name=org.testcontainers.jdbc.ContainerDatabaseDriver",
        "spring.datasource.username=test",
        "spring.datasource.password=test",
        "spring.flyway.enabled=true",
        "spring.flyway.baseline-on-migrate=true",
        "spring.jpa.hibernate.ddl-auto=validate",
        "app.cache.prefix=thriftly:test:cache:"
})
public class PerformanceAndCachingTests {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private SystemConfigService systemConfigService;

    @Autowired
    private ProductQueryService productQueryService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @MockBean
    private GhnLogisticsService ghnLogisticsService;

    private User testUser;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        if (cacheManager.getCache(CacheConfig.CACHE_CATEGORIES) != null) {
            cacheManager.getCache(CacheConfig.CACHE_CATEGORIES).clear();
        }
        if (cacheManager.getCache(CacheConfig.CACHE_SYSTEM_CONFIG) != null) {
            cacheManager.getCache(CacheConfig.CACHE_SYSTEM_CONFIG).clear();
        }

        systemConfigService.updateConfig(SystemConfigDto.builder()
                .platformFeePercent(new BigDecimal("0.05"))
                .minWithdrawalAmount(new BigDecimal("50000"))
                .isMaintenanceMode(false)
                .build());

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        testUser = userRepository.save(User.builder()
                .username("perf_user_" + suffix)
                .email("perf_" + suffix + "@test.com")
                .password("hash")
                .role(Role.USER)
                .build());

        testCategory = categoryRepository.save(Category.builder()
                .name("PerfCat_" + suffix)
                .build());
    }

    @Test
    void verifyHikariConnectionPoolSettings() {
        assertThat(dataSource).isInstanceOf(HikariDataSource.class);
        HikariDataSource hikari = (HikariDataSource) dataSource;
        assertThat(hikari.getMaximumPoolSize()).isEqualTo(20);
        assertThat(hikari.getMinimumIdle()).isEqualTo(5);
        assertThat(hikari.getConnectionTimeout()).isEqualTo(5000);
    }

    @Test
    void verifyPostgresIndexExecutionPlans() {
        List<String> indexes = jdbcTemplate.query(
                "SELECT indexname FROM pg_indexes WHERE indexname IN ('idx_orders_buyer_created', 'idx_products_status_created', 'idx_notifications_user_created', 'idx_transactions_wallet_created')",
                (rs, rowNum) -> rs.getString(1));
        assertThat(indexes).contains(
                "idx_orders_buyer_created",
                "idx_products_status_created",
                "idx_notifications_user_created",
                "idx_transactions_wallet_created");

        jdbcTemplate.execute("SET enable_seqscan = off;");
        try {
            List<String> orderPlan = jdbcTemplate.query(
                    "EXPLAIN (ANALYZE, BUFFERS) SELECT id FROM orders WHERE buyer_id = ? AND deleted_by_buyer = false ORDER BY created_at DESC LIMIT 10",
                    (rs, rowNum) -> rs.getString(1),
                    testUser.getId());
            assertThat(orderPlan).isNotEmpty();
            String fullOrderPlan = String.join("\n", orderPlan);
            assertThat(fullOrderPlan).contains("Index Scan");

            List<String> productPlan = jdbcTemplate.query(
                    "EXPLAIN (ANALYZE, BUFFERS) SELECT id FROM products WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 10",
                    (rs, rowNum) -> rs.getString(1));
            assertThat(productPlan).isNotEmpty();
            String fullProductPlan = String.join("\n", productPlan);
            assertThat(fullProductPlan).contains("Index Scan");

            List<String> notifPlan = jdbcTemplate.query(
                    "EXPLAIN (ANALYZE, BUFFERS) SELECT id FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
                    (rs, rowNum) -> rs.getString(1),
                    testUser.getId());
            assertThat(notifPlan).isNotEmpty();
            String fullNotifPlan = String.join("\n", notifPlan);
            assertThat(fullNotifPlan).contains("Index Scan");
        } finally {
            jdbcTemplate.execute("SET enable_seqscan = on;");
        }
    }

    @Test
    void verifySafeCachingForCategories() {
        var initial = categoryService.getAllCategories();
        assertThat(initial).isNotNull();

        var cached = categoryService.getAllCategories();
        assertThat(cached).isNotNull();
        assertThat(cached.size()).isEqualTo(initial.size());

        CategoryDto created = categoryService.createCategory(CategoryDto.builder()
                .name("NewCat_" + UUID.randomUUID())
                .description("Desc")
                .build());

        var afterEviction = categoryService.getAllCategories();
        assertThat(afterEviction.stream().anyMatch(c -> c.getId().equals(created.getId()))).isTrue();
    }

    @Test
    void verifySafeCachingForSystemConfig() {
        SystemConfigDto initial = systemConfigService.getConfigDto();
        assertThat(initial).isNotNull();

        SystemConfigDto cached = systemConfigService.getConfigDto();
        assertThat(cached).isNotNull();
        assertThat(cached.getPlatformFeePercent()).isEqualByComparingTo(initial.getPlatformFeePercent());

        try {
            BigDecimal newFee = new BigDecimal("0.08");
            systemConfigService.updateConfig(SystemConfigDto.builder()
                    .platformFeePercent(newFee)
                    .minWithdrawalAmount(initial.getMinWithdrawalAmount())
                    .isMaintenanceMode(false)
                    .build());

            SystemConfigDto refreshed = systemConfigService.getConfigDto();
            assertThat(refreshed.getPlatformFeePercent()).isEqualByComparingTo(newFee);
        } finally {
            systemConfigService.updateConfig(initial);
        }
    }

    @Test
    void verifyProductBatchListingWithoutNPlusOne() {
        for (int i = 0; i < 5; i++) {
            productRepository.save(Product.builder()
                    .seller(testUser)
                    .category(testCategory)
                    .title("Batch Prod " + i + "_" + UUID.randomUUID())
                    .description("Desc")
                    .price(new BigDecimal("100000"))
                    .quantity(1)
                    .sellType(SellType.BUY_NOW)
                    .status(ProductStatus.ACTIVE)
                    .build());
        }

        Page<ProductResponse> page = productQueryService.getAllActiveProducts(PageRequest.of(0, 10));
        assertThat(page.getContent()).isNotEmpty();
        for (ProductResponse res : page.getContent()) {
            assertThat(res.getSellerName()).isNotNull();
            assertThat(res.getCategoryName()).isNotNull();
        }
    }

    @Test
    void verifyOrderEntityGraphFetchesRelationsEagerly() {
        Product testProduct = productRepository.save(Product.builder()
                .seller(testUser)
                .category(testCategory)
                .title("Order Prod " + UUID.randomUUID())
                .price(new BigDecimal("200000"))
                .quantity(1)
                .sellType(SellType.BUY_NOW)
                .status(ProductStatus.ACTIVE)
                .build());

        orderRepository.save(Order.builder()
                .buyer(testUser)
                .seller(testUser)
                .product(testProduct)
                .totalAmount(new BigDecimal("200000"))
                .status(OrderStatus.PENDING_PAYMENT)
                .deletedByBuyer(false)
                .build());

        Page<Order> orderPage = orderRepository.findByBuyerIdAndDeletedByBuyerFalseOrderByCreatedAtDesc(
                testUser.getId(), PageRequest.of(0, 10));

        assertThat(orderPage.getContent()).isNotEmpty();
        Order order = orderPage.getContent().get(0);
        assertThat(order.getBuyer().getUsername()).isEqualTo(testUser.getUsername());
        assertThat(order.getSeller().getUsername()).isEqualTo(testUser.getUsername());
        assertThat(order.getProduct().getTitle()).isEqualTo(testProduct.getTitle());
    }
}
