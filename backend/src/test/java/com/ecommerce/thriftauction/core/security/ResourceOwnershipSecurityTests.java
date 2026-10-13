package com.ecommerce.thriftauction.core.security;

import com.ecommerce.thriftauction.features.admin.service.AuditLogService;
import com.ecommerce.thriftauction.features.admin.service.SystemConfigService;
import com.ecommerce.thriftauction.features.auction.repository.AuctionBidRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionDepositRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.auth.service.LoyaltyService;
import com.ecommerce.thriftauction.features.notification.entity.Notification;
import com.ecommerce.thriftauction.features.notification.repository.NotificationRepository;
import com.ecommerce.thriftauction.features.notification.service.NotificationService;
import com.ecommerce.thriftauction.features.order.dto.ReviewRequest;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import com.ecommerce.thriftauction.features.order.entity.Review;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.order.repository.ReviewRepository;
import com.ecommerce.thriftauction.features.order.service.GhnLogisticsService;
import com.ecommerce.thriftauction.features.order.service.OrderService;
import com.ecommerce.thriftauction.features.order.service.ReviewService;
import com.ecommerce.thriftauction.features.payment.entity.LinkedBankAccount;
import com.ecommerce.thriftauction.features.payment.repository.BankAccountRepository;
import com.ecommerce.thriftauction.features.payment.repository.PaymentIntentRepository;
import com.ecommerce.thriftauction.features.payment.repository.TransactionRepository;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import com.ecommerce.thriftauction.features.product.dto.ProductRequest;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.mapper.ProductMapper;
import com.ecommerce.thriftauction.features.product.repository.CategoryRepository;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import com.ecommerce.thriftauction.features.product.service.command.ProductCommandService;
import com.ecommerce.thriftauction.features.product.service.domain.ProductAuctionService;
import com.ecommerce.thriftauction.features.product.service.domain.ProductBoostService;
import com.ecommerce.thriftauction.features.social.repository.FollowRepository;
import com.ecommerce.thriftauction.features.voucher.entity.Voucher;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherRepository;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherUsageRepository;
import com.ecommerce.thriftauction.features.voucher.service.VoucherService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ResourceOwnershipSecurityTests {

        @Mock
        private OrderRepository orderRepository;
        @Mock
        private ProductRepository productRepository;
        @Mock
        private WalletRepository walletRepository;
        @Mock
        private LoyaltyService loyaltyService;
        @Mock
        private UserRepository userRepository;
        @Mock
        private AuctionBidRepository auctionBidRepository;
        @Mock
        private AuctionSessionRepository auctionSessionRepository;
        @Mock
        private AuctionDepositRepository auctionDepositRepository;
        @Mock
        private NotificationService notificationService;
        @Mock
        private ReviewRepository reviewRepository;
        @Mock
        private VoucherRepository voucherRepository;
        @Mock
        private VoucherUsageRepository voucherUsageRepository;
        @Mock
        private GhnLogisticsService ghnLogisticsService;
        @Mock
        private AuditLogService auditLogService;
        @Mock
        private SystemConfigService systemConfigService;
        @Mock
        private WalletService walletService;
        @Mock
        private CategoryRepository categoryRepository;
        @Mock
        private TransactionRepository transactionRepository;
        @Mock
        private BankAccountRepository bankAccountRepository;
        @Mock
        private PaymentIntentRepository paymentIntentRepository;
        @Mock
        private NotificationRepository notificationRepository;
        @Mock
        private SimpMessagingTemplate messagingTemplate;
        @Mock
        private FollowRepository followRepository;
        @Mock
        private ProductMapper productMapper;

        private OrderService orderService;
        private ProductCommandService productCommandService;
        private ProductBoostService productBoostService;
        private ProductAuctionService productAuctionService;
        private VoucherService voucherService;
        private ReviewService reviewService;
        private NotificationService actualNotificationService;
        private WalletService actualWalletService;

        private User userA;
        private User userB;

        @BeforeEach
        void setUp() {
                orderService = new OrderService(
                                orderRepository, productRepository, walletRepository, loyaltyService,
                                userRepository, auctionBidRepository, auctionSessionRepository,
                                auctionDepositRepository, notificationService, reviewRepository,
                                voucherRepository, voucherUsageRepository, ghnLogisticsService,
                                auditLogService, systemConfigService, walletService);

                productCommandService = new ProductCommandService(
                                productRepository, categoryRepository, userRepository,
                                auctionSessionRepository, followRepository, notificationService, productMapper);

                productBoostService = new ProductBoostService(
                                productRepository, userRepository, walletRepository,
                                productMapper, walletService);

                productAuctionService = new ProductAuctionService(
                                productRepository, userRepository, auctionSessionRepository, productMapper);

                voucherService = new VoucherService(
                                voucherRepository, userRepository, voucherUsageRepository);

                reviewService = new ReviewService(
                                reviewRepository, orderRepository, userRepository);

                actualNotificationService = new NotificationService(
                                notificationRepository, userRepository, messagingTemplate);

                actualWalletService = new WalletService(
                                walletRepository, transactionRepository, userRepository,
                                systemConfigService, bankAccountRepository, paymentIntentRepository);

                userA = User.builder().id("user-a-id").email("userA@test.com").username("userA").role(Role.USER)
                                .build();
                userB = User.builder().id("user-b-id").email("userB@test.com").username("userB").role(Role.USER)
                                .build();
        }

        @Test
        void userACannotPayOrderOfUserB() {
                Order order = Order.builder().id("order-1").buyer(userB).seller(userA)
                                .status(OrderStatus.PENDING_PAYMENT).build();
                when(userRepository.findByEmail("userA@test.com")).thenReturn(Optional.of(userA));
                when(orderRepository.findByIdForUpdate("order-1")).thenReturn(Optional.of(order));

                assertThatThrownBy(() -> orderService.payOrder("userA@test.com", "order-1"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("Not your order");
        }

        @Test
        void userACannotConfirmReceiptForOrderOfUserB() {
                Order order = Order.builder().id("order-1").buyer(userB).seller(userA).status(OrderStatus.SHIPPED)
                                .build();
                when(orderRepository.findByIdForUpdate("order-1")).thenReturn(Optional.of(order));

                assertThatThrownBy(() -> orderService.confirmReceiptAndReleaseEscrow("order-1", "userA@test.com"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("Only buyer can confirm receipt");
        }

        @Test
        void userACannotDisputeOrderOfUserB() {
                Order order = Order.builder().id("order-1").buyer(userB).seller(userA).status(OrderStatus.PAID).build();
                when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));

                assertThatThrownBy(() -> orderService.disputeOrder("order-1", "userA@test.com", "Faulty item"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("Chỉ người mua mới có quyền khiếu nại");
        }

        @Test
        void userACannotHideOrderOfUserB() {
                Order order = Order.builder().id("order-1").buyer(userB).seller(userA).status(OrderStatus.COMPLETED)
                                .build();
                when(userRepository.findByEmail("userA@test.com")).thenReturn(Optional.of(userA));
                when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));

                assertThatThrownBy(() -> orderService.hideOrderForBuyer("order-1", "userA@test.com"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("Only buyer can hide their order");
        }

        @Test
        void buyerCannotShipOrder() {
                Order order = Order.builder().id("order-1").buyer(userA).seller(userB).status(OrderStatus.PAID).build();
                when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));

                assertThatThrownBy(() -> orderService.shipOrder("order-1", "userA@test.com", "TRK123"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("Chỉ người bán mới có quyền cập nhật vận đơn");
        }

        @Test
        void sellerCannotSubmitReturnTrackingCode() {
                Order order = Order.builder().id("order-1").buyer(userA).seller(userB).status(OrderStatus.RETURNING)
                                .build();
                when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));

                assertThatThrownBy(() -> orderService.returnShipped("order-1", "userB@test.com", "RET123"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("Chỉ người mua mới được cập nhật mã vận đơn trả hàng");
        }

        @Test
        void buyerCannotConfirmReturnReceived() {
                Order order = Order.builder().id("order-1").buyer(userA).seller(userB).status(OrderStatus.RETURNING)
                                .build();
                when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));

                assertThatThrownBy(() -> orderService.confirmReturnReceived("order-1", "userA@test.com"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("Chỉ người bán mới được xác nhận nhận hàng hoàn");
        }

        @Test
        void userACannotUpdateProductOfUserB() {
                Product product = Product.builder().id("prod-1").seller(userB).build();
                when(productRepository.findById("prod-1")).thenReturn(Optional.of(product));
                when(userRepository.findByEmail("userA@test.com")).thenReturn(Optional.of(userA));

                assertThatThrownBy(() -> productCommandService.updateProduct("prod-1", new ProductRequest(),
                                "userA@test.com"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("You are not authorized to update this product");
        }

        @Test
        void userACannotDeleteProductOfUserB() {
                Product product = Product.builder().id("prod-1").seller(userB).build();
                when(productRepository.findById("prod-1")).thenReturn(Optional.of(product));
                when(userRepository.findByEmail("userA@test.com")).thenReturn(Optional.of(userA));

                assertThatThrownBy(() -> productCommandService.deleteProduct("prod-1", "userA@test.com"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("You are not authorized to delete this product");
        }

        @Test
        void userACannotBoostProductOfUserB() {
                Product product = Product.builder().id("prod-1").seller(userB).build();
                when(productRepository.findByIdForUpdate("prod-1")).thenReturn(Optional.of(product));
                when(userRepository.findByEmail("userA@test.com")).thenReturn(Optional.of(userA));

                assertThatThrownBy(() -> productBoostService.boostProduct("prod-1", "userA@test.com"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("You are not authorized to boost this product");
        }

        @Test
        void userACannotRelistAuctionProductOfUserB() {
                Product product = Product.builder().id("prod-1").seller(userB).build();
                when(productRepository.findById("prod-1")).thenReturn(Optional.of(product));
                when(userRepository.findByEmail("userA@test.com")).thenReturn(Optional.of(userA));

                assertThatThrownBy(() -> productAuctionService.restartAuction("prod-1", "userA@test.com"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("You are not authorized to modify this product");
        }

        @Test
        void userACannotDeleteBankAccountOfUserB() {
                LinkedBankAccount bankAccount = LinkedBankAccount.builder().id("bank-1").user(userB).build();
                when(userRepository.findByEmail("userA@test.com")).thenReturn(Optional.of(userA));
                when(bankAccountRepository.findById("bank-1")).thenReturn(Optional.of(bankAccount));

                assertThatThrownBy(() -> actualWalletService.deleteLinkedBankAccount("userA@test.com", "bank-1"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("Not your bank account");
        }

        @Test
        void userACannotToggleVoucherOfUserB() {
                Voucher voucher = Voucher.builder().id("vouch-1").seller(userB).build();
                when(voucherRepository.findById("vouch-1")).thenReturn(Optional.of(voucher));
                when(userRepository.findByEmail("userA@test.com")).thenReturn(Optional.of(userA));

                assertThatThrownBy(() -> voucherService.toggleVoucherStatus("vouch-1", "userA@test.com"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("You do not have permission to modify this voucher");
        }

        @Test
        void userACannotViewVoucherUsagesOfUserB() {
                Voucher voucher = Voucher.builder().id("vouch-1").seller(userB).build();
                when(voucherRepository.findById("vouch-1")).thenReturn(Optional.of(voucher));
                when(userRepository.findByEmail("userA@test.com")).thenReturn(Optional.of(userA));

                assertThatThrownBy(() -> voucherService.getVoucherUsages("vouch-1", "userA@test.com"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("You do not have permission to view this voucher's history");
        }

        @Test
        void nonBuyerCannotCreateReview() {
                Order order = Order.builder().id("order-1").buyer(userB).seller(userA).status(OrderStatus.COMPLETED)
                                .build();
                when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));

                ReviewRequest request = new ReviewRequest();
                request.setRating(5);
                request.setComment("Great product");

                assertThatThrownBy(() -> reviewService.createReview("order-1", "userA@test.com", request))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("Chỉ người mua mới có quyền đánh giá");
        }

        @Test
        void nonSellerCannotReplyReview() {
                Review review = Review.builder().id("rev-1").reviewer(userA).reviewee(userB).build();
                when(reviewRepository.findById("rev-1")).thenReturn(Optional.of(review));
                when(userRepository.findByEmail("userA@test.com")).thenReturn(Optional.of(userA));

                assertThatThrownBy(() -> reviewService.replyReview("rev-1", "userA@test.com", "Thank you"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("Chỉ người bán mới có quyền phản hồi");
        }

        @Test
        void userACannotMarkAsReadNotificationOfUserB() {
                Notification notification = Notification.builder().id("notif-1").user(userB).build();
                when(notificationRepository.findById("notif-1")).thenReturn(Optional.of(notification));
                when(userRepository.findByEmail("userA@test.com")).thenReturn(Optional.of(userA));

                assertThatThrownBy(() -> actualNotificationService.markAsRead("notif-1", "userA@test.com"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("Not your notification");
        }

        @Test
        void userACannotDeleteNotificationOfUserB() {
                Notification notification = Notification.builder().id("notif-1").user(userB).build();
                when(notificationRepository.findById("notif-1")).thenReturn(Optional.of(notification));
                when(userRepository.findByEmail("userA@test.com")).thenReturn(Optional.of(userA));

                assertThatThrownBy(() -> actualNotificationService.deleteNotification("notif-1", "userA@test.com"))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("Not your notification");
        }
}
