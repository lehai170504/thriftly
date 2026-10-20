package com.ecommerce.thriftauction.features.auction.service;

import com.ecommerce.thriftauction.features.admin.service.AuditLogService;
import com.ecommerce.thriftauction.features.auction.entity.AuctionBid;
import com.ecommerce.thriftauction.features.auction.entity.AuctionDeposit;
import com.ecommerce.thriftauction.features.auction.entity.AuctionSession;
import com.ecommerce.thriftauction.features.auction.entity.AuctionStatus;
import com.ecommerce.thriftauction.features.auction.repository.AuctionBidRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionDepositRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.common.dto.BidRequest;
import com.ecommerce.thriftauction.features.common.dto.BidResponse;
import com.ecommerce.thriftauction.features.notification.service.NotificationService;
import com.ecommerce.thriftauction.features.payment.entity.Wallet;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import com.ecommerce.thriftauction.features.product.entity.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuctionServiceTests {

        @Mock
        private AuctionSessionRepository auctionSessionRepository;

        @Mock
        private AuctionBidRepository auctionBidRepository;

        @Mock
        private UserRepository userRepository;

        @Mock
        private NotificationService notificationService;

        @Mock
        private WalletRepository walletRepository;

        @Mock
        private AuctionDepositRepository auctionDepositRepository;

        @Mock
        private AuditLogService auditLogService;

        @Mock
        private WalletService walletService;

        @InjectMocks
        private AuctionService auctionService;

        private User bidder;
        private User seller;
        private Product product;
        private AuctionSession session;

        @BeforeEach
        void setUp() {
                bidder = User.builder().id("user-1").username("bidder1").email("bidder@test.com").build();
                seller = User.builder().id("seller-1").username("seller1").email("seller@test.com").build();
                product = Product.builder().id("prod-1").title("Vintage Jacket").seller(seller).build();
                session = AuctionSession.builder()
                                .id("session-1")
                                .product(product)
                                .startingPrice(new BigDecimal("100000"))
                                .stepPrice(new BigDecimal("10000"))
                                .currentHighestPrice(new BigDecimal("100000"))
                                .status(AuctionStatus.ONGOING)
                                .endTime(LocalDateTime.now().plusHours(1))
                                .build();
        }

        @Test
        void placeBid_successful() {
                BidRequest request = BidRequest.builder()
                                .auctionSessionId("prod-1")
                                .bidAmount(new BigDecimal("120000"))
                                .build();

                Wallet wallet = Wallet.builder().id("wallet-1").user(bidder).balance(new BigDecimal("200000")).build();

                when(userRepository.findByEmail("bidder@test.com")).thenReturn(Optional.of(bidder));
                when(auctionSessionRepository.findByProductIdForUpdate("prod-1")).thenReturn(Optional.of(session));
                when(walletRepository.findByUserId("user-1")).thenReturn(Optional.of(wallet));
                when(auctionDepositRepository.existsByUserIdAndAuctionSessionId("user-1", "session-1"))
                                .thenReturn(true);
                when(auctionBidRepository.findByAuctionSessionIdOrderByBidAmountDesc("session-1"))
                                .thenReturn(List.of());

                BidResponse response = auctionService.placeBid(request, "bidder@test.com");

                assertNotNull(response);
                assertEquals(new BigDecimal("120000"), response.getBidAmount());
                assertEquals("bidder1", response.getBidderName());
                assertEquals(new BigDecimal("120000"), session.getCurrentHighestPrice());
                verify(auctionBidRepository, times(1)).save(any(AuctionBid.class));
        }

        @Test
        void placeBid_failsWhenSellerBidsOnOwnProduct() {
                BidRequest request = BidRequest.builder()
                                .auctionSessionId("prod-1")
                                .bidAmount(new BigDecimal("120000"))
                                .build();

                when(userRepository.findByEmail("seller@test.com")).thenReturn(Optional.of(seller));
                when(auctionSessionRepository.findByProductIdForUpdate("prod-1")).thenReturn(Optional.of(session));

                RuntimeException exception = assertThrows(RuntimeException.class,
                                () -> auctionService.placeBid(request, "seller@test.com"));

                assertTrue(exception.getMessage().contains("Seller cannot bid"));
        }

        @Test
        void placeBid_failsWhenNoDeposit() {
                BidRequest request = BidRequest.builder()
                                .auctionSessionId("prod-1")
                                .bidAmount(new BigDecimal("120000"))
                                .build();

                Wallet wallet = Wallet.builder().id("wallet-1").user(bidder).balance(new BigDecimal("200000")).build();

                when(userRepository.findByEmail("bidder@test.com")).thenReturn(Optional.of(bidder));
                when(auctionSessionRepository.findByProductIdForUpdate("prod-1")).thenReturn(Optional.of(session));
                when(walletRepository.findByUserId("user-1")).thenReturn(Optional.of(wallet));
                when(auctionDepositRepository.existsByUserIdAndAuctionSessionId("user-1", "session-1"))
                                .thenReturn(false);

                RuntimeException exception = assertThrows(RuntimeException.class,
                                () -> auctionService.placeBid(request, "bidder@test.com"));

                assertTrue(exception.getMessage().contains("chưa đặt cọc"));
        }

        @Test
        void placeBid_failsWhenAmountBelowStepPrice() {
                BidRequest request = BidRequest.builder()
                                .auctionSessionId("prod-1")
                                .bidAmount(new BigDecimal("105000"))
                                .build();

                Wallet wallet = Wallet.builder().id("wallet-1").user(bidder).balance(new BigDecimal("200000")).build();

                when(userRepository.findByEmail("bidder@test.com")).thenReturn(Optional.of(bidder));
                when(auctionSessionRepository.findByProductIdForUpdate("prod-1")).thenReturn(Optional.of(session));
                when(walletRepository.findByUserId("user-1")).thenReturn(Optional.of(wallet));
                when(auctionDepositRepository.existsByUserIdAndAuctionSessionId("user-1", "session-1"))
                                .thenReturn(true);

                RuntimeException exception = assertThrows(RuntimeException.class,
                                () -> auctionService.placeBid(request, "bidder@test.com"));

                assertTrue(exception.getMessage().contains("must be at least"));
        }

        @Test
        void placeDeposit_successful() {
                Wallet wallet = Wallet.builder().id("wallet-1").user(bidder).balance(new BigDecimal("100000")).build();

                when(userRepository.findByEmail("bidder@test.com")).thenReturn(Optional.of(bidder));
                when(auctionSessionRepository.findByProductId("prod-1")).thenReturn(Optional.of(session));
                when(auctionDepositRepository.existsByUserIdAndAuctionSessionId("user-1", "session-1"))
                                .thenReturn(false);
                when(walletRepository.findByUserIdForUpdate("user-1")).thenReturn(Optional.of(wallet));

                auctionService.placeDeposit("prod-1", "bidder@test.com");

                verify(walletService, times(1)).executeEscrowHold(eq(wallet), eq(new BigDecimal("50000")), any(), any(),
                                any(), any());
                verify(auctionDepositRepository, times(1)).save(any(AuctionDeposit.class));
        }

        @Test
        void placeDeposit_failsWhenInsufficientBalance() {
                Wallet wallet = Wallet.builder().id("wallet-1").user(bidder).balance(new BigDecimal("20000")).build();

                when(userRepository.findByEmail("bidder@test.com")).thenReturn(Optional.of(bidder));
                when(auctionSessionRepository.findByProductId("prod-1")).thenReturn(Optional.of(session));
                when(auctionDepositRepository.existsByUserIdAndAuctionSessionId("user-1", "session-1"))
                                .thenReturn(false);
                when(walletRepository.findByUserIdForUpdate("user-1")).thenReturn(Optional.of(wallet));

                RuntimeException exception = assertThrows(RuntimeException.class,
                                () -> auctionService.placeDeposit("prod-1", "bidder@test.com"));

                assertTrue(exception.getMessage().contains("Số dư ví không đủ"));
        }
}
