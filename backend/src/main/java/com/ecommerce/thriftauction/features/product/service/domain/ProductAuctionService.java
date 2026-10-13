package com.ecommerce.thriftauction.features.product.service.domain;

import com.ecommerce.thriftauction.features.auction.entity.AuctionSession;
import com.ecommerce.thriftauction.features.auction.entity.AuctionStatus;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import com.ecommerce.thriftauction.features.product.mapper.ProductMapper;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProductAuctionService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final ProductMapper productMapper;

    @Transactional
    public ProductResponse restartAuction(String id, String username) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User currentUser = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!product.getSeller().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to modify this product");
        }

        if (product.getSellType() != SellType.AUCTION) {
            throw new RuntimeException("Only auction products can be restarted");
        }

        if (product.getStatus() != ProductStatus.HIDDEN) {
            throw new RuntimeException("Product is not in a restartable state");
        }

        AuctionSession session = auctionSessionRepository
                .findByProductId(product.getId())
                .orElseThrow(() -> new RuntimeException("Auction session not found"));

        session.setStatus(AuctionStatus.ONGOING);
        session.setStartTime(LocalDateTime.now());
        session.setEndTime(LocalDateTime.now().plusDays(7));
        session.setCurrentHighestPrice(session.getStartingPrice());
        auctionSessionRepository.save(session);

        product.setStatus(ProductStatus.ACTIVE);
        Product saved = productRepository.save(product);

        return productMapper.mapToResponse(saved);
    }
}
