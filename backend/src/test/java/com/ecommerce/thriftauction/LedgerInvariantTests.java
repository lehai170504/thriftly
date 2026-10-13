package com.ecommerce.thriftauction;

import com.ecommerce.thriftauction.features.order.service.OrderService;
import com.ecommerce.thriftauction.features.payment.entity.Wallet;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.product.entity.Category;
import com.ecommerce.thriftauction.features.product.repository.CategoryRepository;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:tc:postgresql:15.3:///ledger_test",
        "spring.datasource.driver-class-name=org.testcontainers.jdbc.ContainerDatabaseDriver",
        "spring.datasource.username=test",
        "spring.datasource.password=test",
        "spring.flyway.enabled=true",
        "spring.jpa.hibernate.ddl-auto=validate"
})
public class LedgerInvariantTests {

    @Autowired
    private OrderService orderService;

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

    @Test
    @Transactional
    public void testBuyNowEscrowBug() {
        String fixtureId = UUID.randomUUID().toString();
        User buyer = createUser("buyer-" + fixtureId, Role.USER);
        User seller = createUser("seller-" + fixtureId, Role.USER);
        User admin = createUser("admin-" + fixtureId, Role.ADMIN);

        Wallet buyerWallet = createWallet(buyer, new BigDecimal("1000000"));
        createWallet(seller, BigDecimal.ZERO);
        createWallet(admin, BigDecimal.ZERO);

        Category category = categoryRepository.save(Category.builder()
                .name("Ledger test " + fixtureId)
                .build());

        Product product = new Product();
        product.setSeller(seller);
        product.setTitle("Test product");
        product.setPrice(new BigDecimal("100000"));
        product.setCategory(category);
        productRepository.save(product);

        Order order = new Order();
        order.setBuyer(buyer);
        order.setSeller(seller);
        order.setProduct(product);
        order.setTotalAmount(new BigDecimal("100000"));
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        orderRepository.save(order);

        // 1. Escrow hold (Buy Now equivalent) - order is paid
        // OrderService.processBuyNowOrder logic does:
        // wallet.setBalance(wallet.getBalance().subtract(order.getTotalAmount()));
        // wallet.setHeldBalance(wallet.getHeldBalance().add(order.getTotalAmount()));
        buyerWallet.setBalance(buyerWallet.getBalance().subtract(order.getTotalAmount()));
        buyerWallet.setHeldBalance(buyerWallet.getHeldBalance().add(order.getTotalAmount()));
        walletRepository.save(buyerWallet);
        order.setStatus(OrderStatus.DELIVERED); // Skip to DELIVERED to test capture
        orderRepository.save(order);

        assertThat(buyerWallet.getBalance()).isEqualByComparingTo(new BigDecimal("900000"));
        assertThat(buyerWallet.getHeldBalance()).isEqualByComparingTo(new BigDecimal("100000"));

        // 2. Capture (Deliver order)
        // Emulate calling confirmReceiptAndReleaseEscrow without double capture check
        orderService.confirmReceiptAndReleaseEscrow(order.getId(), buyer.getEmail());

        // Fetch updated wallets
        Wallet updatedBuyerWallet = walletRepository.findByUserId(buyer.getId()).get();

        // The bug is now fixed! heldBalance should be 0 because it was correctly
        // subtracted.
        assertThat(updatedBuyerWallet.getHeldBalance()).isEqualByComparingTo(new BigDecimal("0"));
    }

    private User createUser(String identity, Role role) {
        return userRepository.save(User.builder()
                .username(identity)
                .email(identity + "@example.test")
                .password("not-used-by-this-test")
                .fullName(identity)
                .role(role)
                .build());
    }

    private Wallet createWallet(User user, BigDecimal balance) {
        return walletRepository.save(Wallet.builder()
                .user(user)
                .balance(balance)
                .heldBalance(BigDecimal.ZERO)
                .build());
    }
}
