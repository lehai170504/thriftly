package com.ecommerce.thriftauction.features.order.service;

import com.ecommerce.thriftauction.features.auction.entity.AuctionBid;
import com.ecommerce.thriftauction.features.auction.entity.AuctionDeposit;
import com.ecommerce.thriftauction.features.auction.entity.AuctionSession;
import com.ecommerce.thriftauction.features.auction.entity.AuctionStatus;
import com.ecommerce.thriftauction.features.auction.repository.AuctionBidRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionDepositRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.notification.entity.NotificationType;
import com.ecommerce.thriftauction.features.notification.service.NotificationService;
import com.ecommerce.thriftauction.features.order.dto.OrderResponse;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import com.ecommerce.thriftauction.features.order.mapper.OrderResponseMapper;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.payment.entity.TransactionType;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuctionOrderSettlementService {

        private final OrderRepository orderRepository;
        private final ProductRepository productRepository;
        private final AuctionSessionRepository auctionSessionRepository;
        private final AuctionBidRepository auctionBidRepository;
        private final AuctionDepositRepository auctionDepositRepository;
        private final WalletRepository walletRepository;
        private final WalletService walletService;
        private final NotificationService notificationService;
        private final OrderResponseMapper orderResponseMapper;

        public void refundDeposits(AuctionSession session, Product product) {
                List<AuctionDeposit> deposits = auctionDepositRepository
                                .findByAuctionSessionIdAndIsRefundedFalse(session.getId());
                for (AuctionDeposit d : deposits) {
                        walletRepository.findByUserIdForUpdate(d.getUser().getId()).ifPresent(w -> {
                                BigDecimal held = w.getHeldBalance() != null ? w.getHeldBalance() : BigDecimal.ZERO;
                                if (held.compareTo(d.getAmount()) >= 0) {
                                        walletService.executeEscrowRefund(w, d.getAmount(),
                                                        TransactionType.AUCTION_REFUND,
                                                        "Hoàn cọc đấu giá: " + product.getTitle(), null, null);
                                } else {
                                        if (held.compareTo(BigDecimal.ZERO) > 0) {
                                                w.setHeldBalance(BigDecimal.ZERO);
                                        }
                                        w.setBalance((w.getBalance() != null ? w.getBalance() : BigDecimal.ZERO)
                                                        .add(d.getAmount()));
                                        walletRepository.save(w);
                                }
                                d.setRefunded(true);
                                auctionDepositRepository.save(d);
                        });
                }
        }

        @Transactional
        public OrderResponse endAuctionAndCreateOrder(String productId) {
                Product product = productRepository.findByIdForUpdate(productId)
                                .orElseThrow(() -> new RuntimeException("Product not found"));

                var existingOrder = orderRepository.findByProductId(productId);
                if (existingOrder.isPresent()) {
                        return orderResponseMapper.toResponse(existingOrder.get());
                }

                var session = auctionSessionRepository.findByProductIdForUpdate(productId)
                                .or(() -> auctionSessionRepository.findByIdForUpdate(productId))
                                .orElseThrow(() -> new RuntimeException("Auction session not found"));

                if (session.getStatus() == AuctionStatus.ENDED) {
                        return existingOrder.map(orderResponseMapper::toResponse)
                                        .orElseThrow(() -> new RuntimeException("Auction already ended"));
                }

                List<AuctionBid> bids = auctionBidRepository
                                .findByAuctionSessionIdOrderByBidAmountDesc(session.getId());
                if (bids.isEmpty()) {
                        product.setStatus(ProductStatus.HIDDEN);
                        productRepository.save(product);
                        session.setStatus(AuctionStatus.ENDED);
                        auctionSessionRepository.save(session);
                        refundDeposits(session, product);
                        return null;
                }

                AuctionBid highestBid = bids.get(0);
                User buyer = highestBid.getBidder();
                User seller = product.getSeller();

                Order order = Order.builder()
                                .product(product)
                                .buyer(buyer)
                                .seller(seller)
                                .totalAmount(highestBid.getBidAmount())
                                .status(OrderStatus.PENDING_PAYMENT)
                                .build();

                Order savedOrder = orderRepository.save(order);

                product.setStatus(ProductStatus.SOLD);
                productRepository.save(product);

                session.setStatus(AuctionStatus.ENDED);
                auctionSessionRepository.save(session);

                refundDeposits(session, product);

                notificationService.createAndSendNotification(
                                buyer,
                                "Chúc mừng! Bạn đã thắng đấu giá",
                                "Bạn đã thắng đấu giá sản phẩm " + product.getTitle() + " với giá "
                                                + String.format(new Locale("vi", "VN"), "%,.0fđ",
                                                                highestBid.getBidAmount())
                                                + ". Vui lòng thanh toán đơn hàng.",
                                NotificationType.AUCTION_WON,
                                savedOrder.getId());

                notificationService.createAndSendNotification(
                                seller,
                                "Sản phẩm đấu giá đã kết thúc!",
                                "Người dùng " + buyer.getUsername() + " đã thắng đấu giá " + product.getTitle()
                                                + " với giá "
                                                + String.format(new Locale("vi", "VN"), "%,.0fđ",
                                                                highestBid.getBidAmount())
                                                + ".",
                                NotificationType.ORDER_CREATED,
                                savedOrder.getId());

                return orderResponseMapper.toResponse(savedOrder);
        }
}
