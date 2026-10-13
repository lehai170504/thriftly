package com.ecommerce.thriftauction.features.product.service.query;

import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductViewHistory;
import com.ecommerce.thriftauction.features.product.entity.ProductCondition;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import com.ecommerce.thriftauction.features.product.repository.ProductViewHistoryRepository;
import com.ecommerce.thriftauction.features.product.entity.Category;
import com.ecommerce.thriftauction.features.product.repository.CategoryRepository;
import com.ecommerce.thriftauction.features.product.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductQueryService {

        private final ProductRepository productRepository;
        private final UserRepository userRepository;
        private final ProductViewHistoryRepository productViewHistoryRepository;
        private final ProductMapper productMapper;
        private final CategoryRepository categoryRepository;

        public Page<ProductResponse> getAllActiveProducts(Pageable pageable) {
                return productMapper.mapToResponsePage(productRepository.findByStatus(ProductStatus.ACTIVE, pageable));
        }

        @Transactional
        public ProductResponse getProductById(String id, String username, boolean consentGranted) {
                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Product not found"));

                if (username != null && consentGranted) {
                        userRepository.findByEmail(username).or(() -> userRepository.findByUsername(username))
                                        .ifPresent(user -> {
                                                productViewHistoryRepository
                                                                .findByUserIdAndProductId(user.getId(), product.getId())
                                                                .ifPresentOrElse(history -> {
                                                                        history.setViewedAt(
                                                                                        LocalDateTime.now());
                                                                        productViewHistoryRepository.save(history);
                                                                }, () -> {
                                                                        productViewHistoryRepository.save(
                                                                                        ProductViewHistory
                                                                                                        .builder()
                                                                                                        .user(user)
                                                                                                        .product(product)
                                                                                                        .build());
                                                                });
                                        });
                }

                return productMapper.mapToResponse(product);
        }

        public Page<ProductResponse> searchProducts(String query, List<String> categoryIds, Double minPrice,
                        Double maxPrice, ProductCondition condition, SellType sellType, String location,
                        Pageable pageable) {
                BigDecimal min = minPrice != null ? BigDecimal.valueOf(minPrice) : null;
                BigDecimal max = maxPrice != null ? BigDecimal.valueOf(maxPrice) : null;

                List<String> expandedCategoryIds = null;
                if (categoryIds != null && !categoryIds.isEmpty()) {
                        Set<String> expandedIds = new HashSet<>(categoryIds);
                        List<Category> categories = categoryRepository.findAllById(categoryIds);
                        for (Category cat : categories) {
                                if (cat.getSubCategories() != null) {
                                        for (Category sub : cat.getSubCategories()) {
                                                expandedIds.add(sub.getId());
                                        }
                                }
                        }
                        expandedCategoryIds = new ArrayList<>(expandedIds);
                }

                return productMapper.mapToResponsePage(productRepository.searchProducts(
                                query == null || query.trim().isEmpty() ? null : query.trim(),
                                expandedCategoryIds,
                                min, max, condition, sellType, location, pageable));
        }

        public List<ProductResponse> getRelatedProducts(String categoryId, String excludeId) {
                List<Product> related = productRepository.findRelatedProducts(categoryId, excludeId).stream()
                                .limit(4)
                                .collect(Collectors.toList());
                return productMapper.mapToResponses(related);
        }

        public List<ProductResponse> getProductsBySeller(String username) {
                User seller = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                List<Product> sellerProducts = productRepository.findBySellerId(seller.getId()).stream()
                                .filter(p -> p.getStatus() != ProductStatus.DELETED)
                                .collect(Collectors.toList());
                return productMapper.mapToResponses(sellerProducts);
        }
}
