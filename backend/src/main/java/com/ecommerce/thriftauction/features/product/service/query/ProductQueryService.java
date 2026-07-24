package com.ecommerce.thriftauction.features.product.service.query;

import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.product.entity.Product;
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
                return productRepository.findByStatus(ProductStatus.ACTIVE, pageable)
                                .map(productMapper::mapToResponse);
        }

        @Transactional // requires transactional because it writes to view history
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
                                                                                        java.time.LocalDateTime.now());
                                                                        productViewHistoryRepository.save(history);
                                                                        System.out.println(
                                                                                        "[Cookie Consent ACCEPTED] Da cap nhat lich su xem san pham: "
                                                                                                        + product.getTitle()
                                                                                                        + " cho user: "
                                                                                                        + username);
                                                                }, () -> {
                                                                        productViewHistoryRepository.save(
                                                                                        com.ecommerce.thriftauction.features.product.entity.ProductViewHistory
                                                                                                        .builder()
                                                                                                        .user(user)
                                                                                                        .product(product)
                                                                                                        .build());
                                                                        System.out.println(
                                                                                        "[Cookie Consent ACCEPTED] Da luu moi lich su xem san pham: "
                                                                                                        + product.getTitle()
                                                                                                        + " cho user: "
                                                                                                        + username);
                                                                });
                                        });
                } else if (username != null) {
                        System.out.println(
                                        "[Cookie Consent DECLINED/MISSING] Khong luu lich su xem san pham de bao ve quyen rieng tu cho user: "
                                                        + username);
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

                return productRepository.searchProducts(
                                query == null || query.trim().isEmpty() ? null : query.trim(),
                                expandedCategoryIds,
                                min, max, condition, sellType, location, pageable).map(productMapper::mapToResponse);
        }

        public List<ProductResponse> getRelatedProducts(String categoryId, String excludeId) {
                return productRepository.findRelatedProducts(categoryId, excludeId).stream()
                                .limit(4)
                                .map(productMapper::mapToResponse)
                                .collect(Collectors.toList());
        }

        public List<ProductResponse> getProductsBySeller(String username) {
                User seller = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return productRepository.findBySellerId(seller.getId()).stream()
                                .filter(p -> p.getStatus() != ProductStatus.DELETED)
                                .map(productMapper::mapToResponse)
                                .collect(Collectors.toList());
        }
}
