package com.ecommerce.thriftauction;

import com.ecommerce.thriftauction.features.admin.repository.SystemConfigRepository;
import com.ecommerce.thriftauction.features.auction.entity.AuctionBid;
import com.ecommerce.thriftauction.features.auction.entity.AuctionDeposit;
import com.ecommerce.thriftauction.features.auction.entity.AuctionSession;
import com.ecommerce.thriftauction.features.auction.entity.AuctionStatus;
import com.ecommerce.thriftauction.features.auction.repository.AuctionBidRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionDepositRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.auction.service.AuctionService;
import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.common.dto.BidRequest;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.order.service.GhnLogisticsService;
import com.ecommerce.thriftauction.features.order.service.OrderService;
import com.ecommerce.thriftauction.features.payment.entity.PaymentIntent;
import com.ecommerce.thriftauction.features.payment.entity.PaymentIntentStatus;
import com.ecommerce.thriftauction.features.payment.entity.Wallet;
import com.ecommerce.thriftauction.features.payment.repository.PaymentIntentRepository;
import com.ecommerce.thriftauction.features.payment.repository.TransactionRepository;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import com.ecommerce.thriftauction.features.product.entity.Category;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import com.ecommerce.thriftauction.features.product.repository.CategoryRepository;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
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
import vn.payos.model.webhooks.WebhookData;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:tc:postgresql:15.3:///concurrency_test",
        "spring.datasource.driver-class-name=org.testcontainers.jdbc.ContainerDatabaseDriver",
        "spring.datasource.username=test",
        "spring.datasource.password=test",
        "spring.flyway.enabled=true",
        "spring.flyway.baseline-on-migrate=true",
        "spring.jpa.hibernate.ddl-auto=validate"
})
public class ConcurrencyAndIdempotencyTests {

    @Autowired
    private OrderService orderService;

    @Autowired
    private AuctionService auctionService;

    @Autowired
    private WalletService walletService;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AuctionSessionRepository auctionSessionRepository;

    @Autowired
    private AuctionBidRepository auctionBidRepository;

    @Autowired
    private AuctionDepositRepository auctionDepositRepository;

    @Autowired
    private PaymentIntentRepository paymentIntentRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    @MockBean
    private GhnLogisticsService ghnLogisticsService;

    private User buyerA;
    private User buyerB;
    private User seller;
    private User admin;
    private Category testCategory;

    @BeforeEach
    public void setup() {
        systemConfigRepository.findFirstByOrderByIdAsc().ifPresent(cfg -> {
            cfg.setPlatformFeePercent(new BigDecimal("0.05"));
            systemConfigRepository.save(cfg);
        });

        when(ghnLogisticsService.calculateShippingFee(any(), any())).thenReturn(new BigDecimal("30000"));
        when(ghnLogisticsService.createShippingOrder(any()))
                .thenReturn(Map.of("trackingCode", "GHN-TEST-123", "shippingFee", new BigDecimal("30000")));

        List<User> users = userRepository.findByRole(Role.USER);
        if (users.size() < 3) {
            buyerA = createUser("buyer_a_" + UUID.randomUUID().toString().substring(0, 8), Role.USER);
            buyerB = createUser("buyer_b_" + UUID.randomUUID().toString().substring(0, 8), Role.USER);
            seller = createUser("seller_" + UUID.randomUUID().toString().substring(0, 8), Role.USER);
        } else {
            buyerA = users.get(0);
            buyerB = users.get(1);
            seller = users.get(2);
        }

        List<User> admins = userRepository.findByRole(Role.ADMIN);
        if (admins.isEmpty()) {
            admin = createUser("admin_" + UUID.randomUUID().toString().substring(0, 8), Role.ADMIN);
        } else {
            admin = admins.get(0);
        }

        List<Category> categories = categoryRepository.findAll();
        if (categories.isEmpty()) {
            Category c = new Category();
            c.setName("Concurrency Category " + UUID.randomUUID().toString().substring(0, 6));
            testCategory = categoryRepository.save(c);
        } else {
            testCategory = categories.get(0);
        }
    }

    private User createUser(String username, Role role) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(username + "@test.com");
        u.setPassword("password123");
        u.setRole(role);
        u.setActive(true);
        u = userRepository.save(u);

        Wallet w = Wallet.builder()
                .user(u)
                .balance(new BigDecimal("10000000"))
                .heldBalance(BigDecimal.ZERO)
                .build();
        walletRepository.save(w);
        return u;
    }

    private Wallet getOrCreateWallet(User u, BigDecimal balance) {
        Wallet w = walletRepository.findByUserId(u.getId()).orElseGet(() -> {
            Wallet newW = Wallet.builder().user(u).balance(balance).heldBalance(BigDecimal.ZERO).build();
            return walletRepository.save(newW);
        });
        w.setBalance(balance);
        w.setHeldBalance(BigDecimal.ZERO);
        return walletRepository.save(w);
    }

    @Test
    public void testConcurrentBids_onlyHighestValidPriceWinsAndStrictOrder() throws Exception {
        getOrCreateWallet(buyerA, new BigDecimal("2000000"));
        getOrCreateWallet(buyerB, new BigDecimal("2000000"));

        Product product = new Product();
        product.setSeller(seller);
        product.setTitle("Auction Product " + UUID.randomUUID());
        product.setPrice(new BigDecimal("100000"));
        product.setSellType(SellType.AUCTION);
        product.setStatus(ProductStatus.ACTIVE);
        product.setCategory(testCategory);
        product = productRepository.save(product);

        AuctionSession session = AuctionSession.builder()
                .product(product)
                .startingPrice(new BigDecimal("100000"))
                .currentHighestPrice(new BigDecimal("100000"))
                .stepPrice(new BigDecimal("10000"))
                .startTime(LocalDateTime.now().minusHours(1))
                .endTime(LocalDateTime.now().plusHours(2))
                .status(AuctionStatus.ONGOING)
                .build();
        session = auctionSessionRepository.save(session);

        auctionDepositRepository.save(AuctionDeposit.builder()
                .auctionSession(session)
                .user(buyerA)
                .amount(new BigDecimal("50000"))
                .isRefunded(false)
                .depositedAt(LocalDateTime.now())
                .build());

        auctionDepositRepository.save(AuctionDeposit.builder()
                .auctionSession(session)
                .user(buyerB)
                .amount(new BigDecimal("50000"))
                .isRefunded(false)
                .depositedAt(LocalDateTime.now())
                .build());

        int threads = 6;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CyclicBarrier barrier = new CyclicBarrier(threads);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        List<BigDecimal> bidAmounts = List.of(
                new BigDecimal("110000"),
                new BigDecimal("110000"),
                new BigDecimal("120000"),
                new BigDecimal("120000"),
                new BigDecimal("130000"),
                new BigDecimal("140000"));

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            final int index = i;
            final String productId = product.getId();
            final User bidder = (i % 2 == 0) ? buyerA : buyerB;
            futures.add(executor.submit(() -> {
                try {
                    barrier.await();
                    BidRequest req = new BidRequest();
                    req.setAuctionSessionId(productId);
                    req.setBidAmount(bidAmounts.get(index));
                    auctionService.placeBid(req, bidder.getUsername());
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                }
            }));
        }

        for (Future<?> f : futures) {
            f.get();
        }
        executor.shutdown();

        AuctionSession updatedSession = auctionSessionRepository.findById(session.getId()).get();
        List<AuctionBid> placedBids = auctionBidRepository.findByAuctionSessionIdOrderByBidAmountDesc(session.getId());

        assertThat(successCount.get()).isGreaterThanOrEqualTo(1);
        assertThat(placedBids).isNotEmpty();
        assertThat(updatedSession.getCurrentHighestPrice()).isEqualByComparingTo(placedBids.get(0).getBidAmount());

        for (int i = 0; i < placedBids.size() - 1; i++) {
            assertThat(placedBids.get(i).getBidAmount())
                    .isGreaterThan(placedBids.get(i + 1).getBidAmount());
        }
    }

    @Test
    public void testConcurrentBuyNow_preventOverSelling() throws Exception {
        Product product = new Product();
        product.setSeller(seller);
        product.setTitle("Limited Stock Item " + UUID.randomUUID());
        product.setPrice(new BigDecimal("100000"));
        product.setQuantity(1);
        product.setSellType(SellType.BUY_NOW);
        product.setStatus(ProductStatus.ACTIVE);
        product.setCategory(testCategory);
        product = productRepository.save(product);

        int candidateCount = 5;
        List<User> candidates = new ArrayList<>();
        for (int i = 0; i < candidateCount; i++) {
            User c = createUser("buyer_candidate_" + i + "_" + UUID.randomUUID().toString().substring(0, 6), Role.USER);
            getOrCreateWallet(c, new BigDecimal("500000"));
            candidates.add(c);
        }

        ExecutorService executor = Executors.newFixedThreadPool(candidateCount);
        CyclicBarrier barrier = new CyclicBarrier(candidateCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < candidateCount; i++) {
            final User candidate = candidates.get(i);
            final String productId = product.getId();
            futures.add(executor.submit(() -> {
                try {
                    barrier.await();
                    orderService.createBuyNowOrder(productId, null, 1, candidate.getUsername());
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                }
            }));
        }

        for (Future<?> f : futures) {
            f.get();
        }
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(4);

        Product updatedProduct = productRepository.findById(product.getId()).get();
        assertThat(updatedProduct.getQuantity()).isEqualTo(0);
        assertThat(updatedProduct.getStatus()).isEqualTo(ProductStatus.SOLD);
    }

    @Test
    public void testConcurrentPaymentWebhook_idempotentSingleCredit() throws Exception {
        User targetUser = createUser("webhook_user_" + UUID.randomUUID().toString().substring(0, 6), Role.USER);
        Wallet wallet = getOrCreateWallet(targetUser, BigDecimal.ZERO);

        long orderCode = ThreadLocalRandom.current().nextLong(100000000L, 999999999L);
        BigDecimal amount = new BigDecimal("250000");

        PaymentIntent intent = PaymentIntent.builder()
                .user(targetUser)
                .orderCode(orderCode)
                .amount(amount)
                .currency("VND")
                .status(PaymentIntentStatus.PENDING)
                .build();
        paymentIntentRepository.save(intent);

        WebhookData data = new WebhookData();
        data.setOrderCode(orderCode);
        data.setAmount(250000L);
        data.setReference("PAYOS-" + orderCode);

        int threads = 8;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CyclicBarrier barrier = new CyclicBarrier(threads);
        AtomicInteger completedCalls = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            futures.add(executor.submit(() -> {
                try {
                    barrier.await();
                    walletService.processPaymentIntentWebhook(data);
                    completedCalls.incrementAndGet();
                } catch (Exception ignored) {
                }
            }));
        }

        for (Future<?> f : futures) {
            f.get();
        }
        executor.shutdown();

        Wallet updatedWallet = walletRepository.findByUserId(targetUser.getId()).get();
        PaymentIntent updatedIntent = paymentIntentRepository.findByOrderCode(orderCode).get();

        assertThat(updatedWallet.getBalance()).isEqualByComparingTo(new BigDecimal("250000"));
        assertThat(updatedIntent.getStatus()).isEqualTo(PaymentIntentStatus.SUCCESS);

        boolean txExists = transactionRepository.existsByReferenceId(String.valueOf(orderCode));
        assertThat(txExists).isTrue();
    }

    @Test
    public void testConcurrentVoucherUsage_exhaustsCapacityWithoutGoingNegative() throws Exception {
        Voucher voucher = Voucher.builder()
                .code("DISCOUNT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .type(VoucherType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("20000"))
                .quantity(1)
                .usageLimitPerUser(1)
                .expiryDate(LocalDateTime.now().plusDays(10))
                .isActive(true)
                .build();
        voucher = voucherRepository.save(voucher);

        int buyers = 4;
        List<User> testBuyers = new ArrayList<>();
        List<Product> testProducts = new ArrayList<>();

        for (int i = 0; i < buyers; i++) {
            User u = createUser("voucher_buyer_" + i + "_" + UUID.randomUUID().toString().substring(0, 6), Role.USER);
            getOrCreateWallet(u, new BigDecimal("500000"));
            testBuyers.add(u);

            Product p = new Product();
            p.setSeller(seller);
            p.setTitle("Voucher Product " + i + "_" + UUID.randomUUID());
            p.setPrice(new BigDecimal("100000"));
            p.setQuantity(5);
            p.setSellType(SellType.BUY_NOW);
            p.setStatus(ProductStatus.ACTIVE);
            p.setCategory(testCategory);
            testProducts.add(productRepository.save(p));
        }

        ExecutorService executor = Executors.newFixedThreadPool(buyers);
        CyclicBarrier barrier = new CyclicBarrier(buyers);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < buyers; i++) {
            final User buyer = testBuyers.get(i);
            final Product product = testProducts.get(i);
            final String code = voucher.getCode();
            futures.add(executor.submit(() -> {
                try {
                    barrier.await();
                    orderService.createBuyNowOrder(product.getId(), code, 1, buyer.getUsername());
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                }
            }));
        }

        for (Future<?> f : futures) {
            f.get();
        }
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(3);

        Voucher updatedVoucher = voucherRepository.findById(voucher.getId()).get();
        assertThat(updatedVoucher.getQuantity()).isEqualTo(0);
    }

    @Test
    public void testConcurrentEscrowReleaseAndScheduler_noDoublePayout() throws Exception {
        User testBuyer = createUser("escrow_buyer_" + UUID.randomUUID().toString().substring(0, 6), Role.USER);
        User testSeller = createUser("escrow_seller_" + UUID.randomUUID().toString().substring(0, 6), Role.USER);

        Wallet bWallet = getOrCreateWallet(testBuyer, BigDecimal.ZERO);
        bWallet.setHeldBalance(new BigDecimal("100000"));
        walletRepository.save(bWallet);

        Wallet sWallet = getOrCreateWallet(testSeller, BigDecimal.ZERO);
        walletRepository.save(sWallet);

        Wallet aWallet = getOrCreateWallet(admin, BigDecimal.ZERO);
        walletRepository.save(aWallet);

        Product product = new Product();
        product.setSeller(testSeller);
        product.setTitle("Escrow Product " + UUID.randomUUID());
        product.setPrice(new BigDecimal("100000"));
        product.setSellType(SellType.BUY_NOW);
        product.setStatus(ProductStatus.ACTIVE);
        product.setCategory(testCategory);
        product = productRepository.save(product);

        Order order = new Order();
        order.setBuyer(testBuyer);
        order.setSeller(testSeller);
        order.setProduct(product);
        order.setTotalAmount(new BigDecimal("100000"));
        order.setStatus(OrderStatus.DELIVERED);
        order = orderRepository.save(order);

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CyclicBarrier barrier = new CyclicBarrier(threads);
        final String orderId = order.getId();
        final String buyerUsername = testBuyer.getUsername();

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            futures.add(executor.submit(() -> {
                try {
                    barrier.await();
                    orderService.confirmReceiptAndReleaseEscrow(orderId, buyerUsername);
                } catch (Exception ignored) {
                }
            }));
        }

        for (Future<?> f : futures) {
            f.get();
        }
        executor.shutdown();

        Order finalOrder = orderRepository.findById(orderId).get();
        Wallet finalBuyerWallet = walletRepository.findByUserId(testBuyer.getId()).get();
        Wallet finalSellerWallet = walletRepository.findByUserId(testSeller.getId()).get();
        Wallet finalAdminWallet = walletRepository.findByUserId(admin.getId()).get();

        assertThat(finalOrder.getStatus()).isEqualTo(OrderStatus.COMPLETED);
        assertThat(finalBuyerWallet.getHeldBalance()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(finalSellerWallet.getBalance()).isEqualByComparingTo(new BigDecimal("95000"));
        assertThat(finalAdminWallet.getBalance()).isEqualByComparingTo(new BigDecimal("5000"));
    }

    @Test
    public void testConcurrentDeposit_singleDepositPerSession() throws Exception {
        User depositUser = createUser("deposit_user_" + UUID.randomUUID().toString().substring(0, 6), Role.USER);
        getOrCreateWallet(depositUser, new BigDecimal("500000"));

        Product product = new Product();
        product.setSeller(seller);
        product.setTitle("Deposit Auction Product " + UUID.randomUUID());
        product.setPrice(new BigDecimal("100000"));
        product.setSellType(SellType.AUCTION);
        product.setStatus(ProductStatus.ACTIVE);
        product.setCategory(testCategory);
        product = productRepository.save(product);

        AuctionSession session = AuctionSession.builder()
                .product(product)
                .startingPrice(new BigDecimal("100000"))
                .currentHighestPrice(new BigDecimal("100000"))
                .stepPrice(new BigDecimal("10000"))
                .startTime(LocalDateTime.now().minusHours(1))
                .endTime(LocalDateTime.now().plusHours(2))
                .status(AuctionStatus.ONGOING)
                .build();
        session = auctionSessionRepository.save(session);

        int threads = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CyclicBarrier barrier = new CyclicBarrier(threads);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        final String productId = product.getId();
        final String username = depositUser.getUsername();

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            futures.add(executor.submit(() -> {
                try {
                    barrier.await();
                    auctionService.placeDeposit(productId, username);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                }
            }));
        }

        for (Future<?> f : futures) {
            f.get();
        }
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(4);

        Wallet updatedWallet = walletRepository.findByUserId(depositUser.getId()).get();
        assertThat(updatedWallet.getHeldBalance()).isEqualByComparingTo(new BigDecimal("50000"));
        assertThat(updatedWallet.getBalance()).isEqualByComparingTo(new BigDecimal("450000"));
    }
}
