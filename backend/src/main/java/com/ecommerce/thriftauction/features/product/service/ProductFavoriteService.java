package com.ecommerce.thriftauction.features.product.service;

import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductFavorite;
import com.ecommerce.thriftauction.features.product.repository.ProductFavoriteRepository;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.product.mapper.ProductMapper;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductFavoriteService {

        private final ProductFavoriteRepository favoriteRepository;
        private final ProductRepository productRepository;
        private final UserRepository userRepository;
        private final ProductMapper productMapper;

        @Transactional
        public boolean toggleFavorite(String productId, String username) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Product product = productRepository.findById(productId)
                                .orElseThrow(() -> new RuntimeException("Product not found"));

                Optional<ProductFavorite> existingFavorite = favoriteRepository.findByUserAndProduct(user, product);

                if (existingFavorite.isPresent()) {
                        favoriteRepository.deleteByUserAndProduct(user, product);
                        return false; // Removed from favorites
                } else {
                        ProductFavorite favorite = ProductFavorite.builder()
                                        .user(user)
                                        .product(product)
                                        .build();
                        favoriteRepository.save(favorite);
                        return true; // Added to favorites
                }
        }

        public List<String> getUserFavoriteProductIds(String username) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return favoriteRepository.findByUserId(user.getId())
                                .stream()
                                .map(favorite -> favorite.getProduct().getId())
                                .collect(Collectors.toList());
        }

        public Page<ProductResponse> getUserFavoriteProducts(String username, Pageable pageable) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Page<ProductFavorite> favPage = favoriteRepository.findByUserId(user.getId(), pageable);
                List<Product> products = favPage.getContent().stream()
                                .map(ProductFavorite::getProduct)
                                .collect(Collectors.toList());
                List<ProductResponse> responses = productMapper.mapToResponses(products);
                return new PageImpl<>(responses, pageable, favPage.getTotalElements());
        }
}
