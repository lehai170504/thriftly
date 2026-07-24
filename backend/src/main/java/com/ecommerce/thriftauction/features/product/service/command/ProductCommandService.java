package com.ecommerce.thriftauction.features.product.service.command;

import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.notification.service.NotificationService;
import com.ecommerce.thriftauction.features.product.dto.ProductRequest;
import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.product.entity.Category;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import com.ecommerce.thriftauction.features.product.repository.CategoryRepository;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import com.ecommerce.thriftauction.features.social.repository.FollowRepository;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.product.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductCommandService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final FollowRepository followRepository;
    private final NotificationService notificationService;
    private final ProductMapper productMapper;

    public ProductResponse createProduct(ProductRequest request, String username) {
        User seller = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = Product.builder()
                .seller(seller)
                .category(category)
                .title(request.getTitle())
                .description(request.getDescription())
                .condition(request.getCondition())
                .sellType(request.getSellType())
                .price(request.getPrice())
                .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                .imageUrl(request.getImages() != null && !request.getImages().isEmpty() ? request.getImages().get(0)
                        : request.getImageUrl())
                .images(request.getImages())
                .videoUrl(request.getVideoUrl())
                .location(request.getLocation())
                .status(ProductStatus.ACTIVE)
                .build();

        product = productRepository.save(product);

        if (request.getSellType() == SellType.AUCTION) {
            int durationDays = request.getAuctionDurationDays() != null ? request.getAuctionDurationDays() : 3;
            com.ecommerce.thriftauction.features.auction.entity.AuctionSession session = com.ecommerce.thriftauction.features.auction.entity.AuctionSession
                    .builder()
                    .product(product)
                    .startTime(java.time.LocalDateTime.now())
                    .endTime(java.time.LocalDateTime.now().plusDays(durationDays))
                    .startingPrice(request.getPrice())
                    .stepPrice(new java.math.BigDecimal("50000")) // Default step 50k
                    .currentHighestPrice(request.getPrice())
                    .status(com.ecommerce.thriftauction.features.auction.entity.AuctionStatus.ONGOING)
                    .build();
            auctionSessionRepository.save(session);
        }

        // Notify followers
        final Product savedProduct = product;
        java.util.List<com.ecommerce.thriftauction.features.social.entity.Follow> followers = followRepository
                .findAll()
                .stream()
                .filter(f -> f.getFollowing().getId().equals(seller.getId()))
                .toList();

        for (com.ecommerce.thriftauction.features.social.entity.Follow f : followers) {
            notificationService.createAndSendNotification(
                    f.getFollower(),
                    "Gian hàng bạn theo dõi",
                    seller.getFullName() + " vừa đăng bán sản phẩm: " + savedProduct.getTitle(),
                    com.ecommerce.thriftauction.features.notification.entity.NotificationType.SYSTEM,
                    savedProduct.getId());
        }

        return productMapper.mapToResponse(product);
    }

    public ProductResponse updateProduct(String id, ProductRequest request, String username) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User currentUser = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!product.getSeller().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to update this product");
        }

        if (product.getSellType() == SellType.AUCTION) {
            com.ecommerce.thriftauction.features.auction.entity.AuctionSession session = auctionSessionRepository
                    .findByProductId(product.getId())
                    .orElse(null);

            if (session != null
                    && session.getCurrentHighestPrice().compareTo(session.getStartingPrice()) > 0) {
                throw new RuntimeException("Cannot update auction because it already has bids");
            }
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setCondition(request.getCondition());
        product.setCategory(category);
        product.setLocation(request.getLocation());

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            product.setImages(request.getImages());
            product.setImageUrl(request.getImages().get(0));
        } else if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            product.setImageUrl(request.getImageUrl());
        }
        if (request.getVideoUrl() != null && !request.getVideoUrl().isEmpty()) {
            product.setVideoUrl(request.getVideoUrl());
        }

        // Only allow updating price if it's BUY_NOW or if AUCTION hasn't started with
        // bids (handled above)
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());

        product = productRepository.save(product);

        // If it's an auction and we updated the price, we also need to update the
        // starting price of the session
        if (product.getSellType() == SellType.AUCTION) {
            com.ecommerce.thriftauction.features.auction.entity.AuctionSession session = auctionSessionRepository
                    .findByProductId(product.getId())
                    .orElse(null);
            if (session != null) {
                session.setStartingPrice(request.getPrice());
                session.setCurrentHighestPrice(request.getPrice());
                auctionSessionRepository.save(session);
            }
        }

        return productMapper.mapToResponse(product);
    }

    public void deleteProduct(String id, String username) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User currentUser = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!product.getSeller().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to delete this product");
        }

        if (product.getSellType() == SellType.AUCTION) {
            com.ecommerce.thriftauction.features.auction.entity.AuctionSession session = auctionSessionRepository
                    .findByProductId(product.getId())
                    .orElse(null);

            if (session != null
                    && session.getCurrentHighestPrice().compareTo(session.getStartingPrice()) > 0) {
                throw new RuntimeException("Cannot delete auction because it already has bids");
            }

            if (session != null) {
                session.setStatus(
                        com.ecommerce.thriftauction.features.auction.entity.AuctionStatus.CANCELED);
                auctionSessionRepository.save(session);
            }
        }

        product.setStatus(ProductStatus.HIDDEN);
        productRepository.save(product);
    }
}
