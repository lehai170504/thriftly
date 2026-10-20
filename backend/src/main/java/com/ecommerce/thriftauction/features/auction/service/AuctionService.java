package com.ecommerce.thriftauction.features.auction.service;

import com.ecommerce.thriftauction.features.notification.service.NotificationService;
import com.ecommerce.thriftauction.features.admin.service.AuditLogService;

import com.ecommerce.thriftauction.features.common.dto.BidRequest;
import com.ecommerce.thriftauction.features.common.dto.BidResponse;
import com.ecommerce.thriftauction.features.auction.entity.AuctionBid;
import com.ecommerce.thriftauction.features.auction.entity.AuctionDeposit;
import com.ecommerce.thriftauction.features.auction.entity.AuctionSession;
import com.ecommerce.thriftauction.features.auction.entity.AuctionStatus;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auction.repository.AuctionBidRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionDepositRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.payment.entity.TransactionType;
import com.ecommerce.thriftauction.features.payment.entity.Wallet;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import com.ecommerce.thriftauction.features.notification.entity.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuctionService {

        private final AuctionSessionRepository auctionSessionRepository;
        private final AuctionBidRepository auctionBidRepository;
        private final UserRepository userRepository;
        private final NotificationService notificationService;
        private final WalletRepository walletRepository;
        private final AuctionDepositRepository auctionDepositRepository;
        private final AuditLogService auditLogService;
        private final WalletService walletService;

        @Transactional
        public BidResponse placeBid(BidRequest request, String username) {
                User bidder = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                AuctionSession session = auctionSessionRepository
                                .findByProductIdForUpdate(request.getAuctionSessionId())
                                .or(() -> auctionSessionRepository.findByIdForUpdate(request.getAuctionSessionId()))
                                .orElseThrow(() -> new RuntimeException(
                                                "Auction session not found for product: "
                                                                + request.getAuctionSessionId()));

                if (session.getStatus() != AuctionStatus.ONGOING) {
                        throw new RuntimeException("Auction is not active");
                }

                if (session.getProduct().getSeller().getId().equals(bidder.getId())) {
                        throw new RuntimeException("Seller cannot bid on their own auction");
                }

                walletRepository.findByUserId(bidder.getId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Bạn chưa mở ví điện tử. Vui lòng vào trang cá nhân để mở ví."));

                if (!auctionDepositRepository.existsByUserIdAndAuctionSessionId(bidder.getId(), session.getId())) {
                        throw new RuntimeException(
                                        "Bạn chưa đặt cọc 50.000đ để tham gia đấu giá này. Vui lòng đặt cọc trước khi trả giá.");
                }

                if (session.getEndTime().isBefore(LocalDateTime.now())) {
                        session.setStatus(AuctionStatus.ENDED);
                        auctionSessionRepository.save(session);
                        throw new RuntimeException("Auction has already ended");
                }

                if (session.getEndTime().minusMinutes(2).isBefore(LocalDateTime.now())) {
                        session.setEndTime(session.getEndTime().plusMinutes(2));
                }

                BigDecimal currentHighest = session.getCurrentHighestPrice() != null
                                ? session.getCurrentHighestPrice()
                                : session.getStartingPrice();

                if (request.getBidAmount().compareTo(currentHighest.add(session.getStepPrice())) < 0) {
                        throw new RuntimeException(
                                        "Bid amount must be at least " + currentHighest.add(session.getStepPrice()));
                }

                List<AuctionBid> previousBids = auctionBidRepository
                                .findByAuctionSessionIdOrderByBidAmountDesc(session.getId());
                User previousHighestBidder = null;
                if (!previousBids.isEmpty()) {
                        previousHighestBidder = previousBids.get(0).getBidder();
                }

                AuctionBid bid = AuctionBid.builder()
                                .auctionSession(session)
                                .bidder(bidder)
                                .bidAmount(request.getBidAmount())
                                .build();

                auctionBidRepository.save(bid);

                session.setCurrentHighestPrice(request.getBidAmount());
                auctionSessionRepository.save(session);

                auditLogService.logUser(
                                bidder.getUsername(), "PLACE_BID",
                                "AUCTION", session.getId(),
                                session.getProduct().getTitle(),
                                "Đặt giá " + String.format(Locale.forLanguageTag("vi-VN"), "%,.0f VNĐ",
                                                request.getBidAmount()));

                if (previousHighestBidder != null && !previousHighestBidder.getId().equals(bidder.getId())) {
                        notificationService.createAndSendNotification(
                                        previousHighestBidder,
                                        "Bạn đã bị trả giá cao hơn!",
                                        "Người dùng " + bidder.getUsername() + " vừa trả " + request.getBidAmount()
                                                        + "đ cho sản phẩm "
                                                        + session.getProduct().getTitle(),
                                        NotificationType.AUCTION_OUTBID,
                                        session.getProduct().getId());
                }

                return BidResponse.builder()
                                .bidId(bid.getId())
                                .auctionSessionId(session.getId())
                                .bidderName(bidder.getUsername())
                                .bidAmount(bid.getBidAmount())
                                .bidTime(bid.getBidTime())
                                .message("Bid placed successfully!")
                                .build();
        }

        @Transactional(readOnly = true)
        public List<BidResponse> getAuctionHistory(String productId) {
                AuctionSession session = auctionSessionRepository.findByProductId(productId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Auction session not found for product: " + productId));

                List<AuctionBid> bids = auctionBidRepository
                                .findByAuctionSessionIdOrderByBidAmountDesc(session.getId());

                return bids.stream().map(bid -> BidResponse.builder()
                                .bidId(bid.getId())
                                .auctionSessionId(session.getId())
                                .bidderName(bid.getBidder().getUsername())
                                .bidAmount(bid.getBidAmount())
                                .bidTime(bid.getBidTime())
                                .build()).collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public boolean hasDeposited(String productId, String username) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));
                AuctionSession session = auctionSessionRepository.findByProductId(productId)
                                .orElseThrow(() -> new RuntimeException("Auction session not found"));
                return auctionDepositRepository.existsByUserIdAndAuctionSessionId(user.getId(), session.getId());
        }

        @Transactional
        public void placeDeposit(String productId, String username) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                AuctionSession session = auctionSessionRepository.findByProductId(productId)
                                .or(() -> auctionSessionRepository.findById(productId))
                                .orElseThrow(() -> new RuntimeException("Auction session not found"));

                if (session.getStatus() != AuctionStatus.ONGOING) {
                        throw new RuntimeException("Chỉ có thể đặt cọc khi phiên đấu giá đang diễn ra.");
                }

                if (session.getProduct().getSeller().getId().equals(user.getId())) {
                        throw new RuntimeException("Người bán không thể đặt cọc sản phẩm của mình.");
                }

                if (auctionDepositRepository.existsByUserIdAndAuctionSessionId(user.getId(), session.getId())) {
                        throw new RuntimeException("Bạn đã đặt cọc cho phiên đấu giá này rồi.");
                }

                Wallet wallet = walletRepository.findByUserIdForUpdate(user.getId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Bạn chưa mở ví điện tử. Vui lòng vào trang cá nhân để mở ví."));

                BigDecimal depositAmount = new BigDecimal("50000");

                if (wallet.getBalance() == null || wallet.getBalance().compareTo(depositAmount) < 0) {
                        throw new RuntimeException(
                                        "Số dư ví không đủ. Cần tối thiểu 50.000đ để đặt cọc tham gia đấu giá. Vui lòng nạp thêm tiền.");
                }

                walletService.executeEscrowHold(wallet, depositAmount,
                                TransactionType.AUCTION_DEPOSIT,
                                "Cọc tham gia đấu giá: " + session.getProduct().getTitle(), null, null);

                AuctionDeposit deposit = AuctionDeposit
                                .builder()
                                .user(user)
                                .auctionSession(session)
                                .amount(depositAmount)
                                .isRefunded(false)
                                .build();
                auctionDepositRepository.save(deposit);

                auditLogService.logUser(
                                user.getUsername(), "AUCTION_DEPOSIT",
                                "AUCTION", session.getId(),
                                session.getProduct().getTitle(),
                                "Đặt cọc 50.000 VNĐ để tham gia đấu giá");
        }
}
