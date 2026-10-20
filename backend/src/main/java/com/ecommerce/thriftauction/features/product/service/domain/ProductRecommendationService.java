package com.ecommerce.thriftauction.features.product.service.domain;

import com.ecommerce.thriftauction.features.ai.service.AiService;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.entity.ProductViewHistory;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import com.ecommerce.thriftauction.features.product.repository.ProductViewHistoryRepository;
import com.ecommerce.thriftauction.features.product.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductRecommendationService {

        private final ProductRepository productRepository;
        private final UserRepository userRepository;
        private final ProductViewHistoryRepository productViewHistoryRepository;
        private final AiService aiService;
        private final ProductMapper productMapper;

        public List<ProductResponse> getRecommendations(String username) {
                User user = userRepository.findByEmail(username).or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<ProductViewHistory> history = productViewHistoryRepository
                                .findByUserIdOrderByViewedAtDesc(user.getId())
                                .stream().limit(10).collect(Collectors.toList());

                if (history.isEmpty()) {
                        List<Product> defaultProducts = productRepository
                                        .findByStatus(ProductStatus.ACTIVE,
                                                        PageRequest.of(0, 8))
                                        .getContent();
                        return productMapper.mapToResponses(defaultProducts);
                }

                List<String> viewedProductIds = history.stream().map(h -> h.getProduct().getId())
                                .collect(Collectors.toList());

                List<String> historyTitles = history.stream()
                                .map(h -> h.getProduct().getTitle() + " (" + h.getProduct().getCategory().getName()
                                                + ")")
                                .collect(Collectors.toList());

                List<Product> availableProducts = productRepository
                                .findByStatus(ProductStatus.ACTIVE,
                                                PageRequest.of(0, 40))
                                .stream()
                                .filter(p -> !viewedProductIds.contains(p.getId()))
                                .limit(30)
                                .collect(Collectors.toList());

                if (availableProducts.isEmpty()) {
                        return Collections.emptyList();
                }

                StringBuilder availableProductsList = new StringBuilder();
                for (Product p : availableProducts) {
                        availableProductsList.append(p.getId()).append(" | ")
                                        .append(p.getTitle()).append(" | ")
                                        .append(p.getCategory().getName()).append("\n");
                }

                try {
                        String recommendedIdsStr = aiService.recommendProductsFromList(historyTitles,
                                        availableProductsList.toString());
                        if (recommendedIdsStr != null && !recommendedIdsStr.isEmpty()) {
                                String[] recommendedIds = recommendedIdsStr.split(",");
                                List<Product> recommendedProducts = availableProducts.stream()
                                                .filter(p -> Arrays.asList(recommendedIds)
                                                                .contains(p.getId()))
                                                .collect(Collectors.toList());

                                if (!recommendedProducts.isEmpty()) {
                                        return productMapper.mapToResponses(recommendedProducts);
                                }
                        }
                } catch (Exception e) {
                        log.error("Lỗi gọi AI Recommend: {}", e.getMessage());
                }

                List<Product> fallbackProducts = availableProducts.stream().limit(8).collect(Collectors.toList());
                return productMapper.mapToResponses(fallbackProducts);
        }
}
