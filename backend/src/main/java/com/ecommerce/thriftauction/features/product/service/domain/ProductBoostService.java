package com.ecommerce.thriftauction.features.product.service.domain;

import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.payment.entity.TransactionType;
import com.ecommerce.thriftauction.features.payment.entity.Wallet;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.mapper.ProductMapper;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProductBoostService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final ProductMapper productMapper;
    private final WalletService walletService;

    @Transactional
    public ProductResponse boostProduct(String id, String username) {
        Product product = productRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User currentUser = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!product.getSeller().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to boost this product");
        }

        Wallet wallet = walletRepository.findByUserIdForUpdate(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        BigDecimal boostFee = new BigDecimal("20000");
        if (wallet.getBalance().compareTo(boostFee) < 0) {
            throw new RuntimeException("Insufficient balance to boost product. Fee is 20,000 VND.");
        }

        walletService.executeDebit(wallet, boostFee, TransactionType.BOOST_FEE,
                "Phí đẩy sản phẩm: " + product.getTitle(), null, null);

        if (product.getBoostedUntil() == null
                || product.getBoostedUntil().isBefore(LocalDateTime.now())) {
            product.setBoostedUntil(LocalDateTime.now().plusDays(1));
        } else {
            product.setBoostedUntil(product.getBoostedUntil().plusDays(1));
        }

        Product saved = productRepository.save(product);
        return productMapper.mapToResponse(saved);
    }
}
