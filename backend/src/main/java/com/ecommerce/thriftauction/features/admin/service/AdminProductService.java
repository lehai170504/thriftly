package com.ecommerce.thriftauction.features.admin.service;

import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionDepositRepository;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.auction.entity.AuctionSession;
import com.ecommerce.thriftauction.features.auction.entity.AuctionStatus;
import com.ecommerce.thriftauction.features.auction.entity.AuctionDeposit;
import com.ecommerce.thriftauction.features.payment.entity.TransactionType;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final AuctionDepositRepository auctionDepositRepository;
    private final WalletRepository walletRepository;
    private final WalletService walletService;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(String search, Pageable pageable) {
        Page<Product> products;
        if (search != null && !search.trim().isEmpty()) {
            products = productRepository.findByTitleContainingIgnoreCase(search.trim(), pageable);
        } else {
            products = productRepository.findAll(pageable);
        }

        return products.map(p -> ProductResponse.builder()
                .id(p.getId())
                .sellerId(p.getSeller().getId())
                .sellerName(p.getSeller().getUsername())
                .sellerAvatar(p.getSeller().getAvatar())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .title(p.getTitle())
                .description(p.getDescription())
                .condition(p.getCondition())
                .sellType(p.getSellType())
                .price(p.getPrice())
                .status(p.getStatus())
                .imageUrl(p.getImageUrl())
                .createdAt(p.getCreatedAt())
                .isLive(p.getIsLive())
                .build());
    }

    @Transactional
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStatus(ProductStatus.HIDDEN);
        productRepository.save(product);
    }

    @Transactional
    public void forceCancelAuction(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getSellType() == SellType.AUCTION) {
            AuctionSession session = auctionSessionRepository.findByProductId(product.getId())
                    .orElse(null);

            if (session != null && session.getStatus() == AuctionStatus.ONGOING) {
                session.setStatus(AuctionStatus.CANCELED);
                auctionSessionRepository.save(session);

                // Refund all deposits
                List<AuctionDeposit> deposits = auctionDepositRepository
                        .findByAuctionSessionIdAndIsRefundedFalse(session.getId());
                for (AuctionDeposit d : deposits) {
                    walletRepository.findByUserId(d.getUser().getId()).ifPresent(w -> {
                        walletService.executeEscrowRefund(w, d.getAmount(), TransactionType.AUCTION_REFUND,
                                "Hủy đấu giá vi phạm & hoàn cọc: " + product.getTitle(), null, null);

                        d.setRefunded(true);
                        auctionDepositRepository.save(d);
                    });
                }
            }
        }

        product.setStatus(ProductStatus.BANNED);
        product.setIsLive(false);
        productRepository.save(product);
    }
}
