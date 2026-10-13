package com.ecommerce.thriftauction.features.product.repository;

import com.ecommerce.thriftauction.features.product.entity.ProductFavorite;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductFavoriteRepository extends JpaRepository<ProductFavorite, String> {
    Optional<ProductFavorite> findByUserAndProduct(User user, Product product);

    List<ProductFavorite> findByUserId(String userId);

    @EntityGraph(attributePaths = { "product", "product.seller",
            "product.category" })
    Page<ProductFavorite> findByUserId(String userId, Pageable pageable);

    void deleteByUserAndProduct(User user, Product product);
}
