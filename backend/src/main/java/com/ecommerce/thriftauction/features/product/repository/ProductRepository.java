package com.ecommerce.thriftauction.features.product.repository;

import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.entity.ProductCondition;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
       @Lock(LockModeType.PESSIMISTIC_WRITE)
       @Query("SELECT p FROM Product p WHERE p.id = :id")
       Optional<Product> findByIdForUpdate(@Param("id") String id);

       Page<Product> findByStatus(ProductStatus status, Pageable pageable);

       Page<Product> findByTitleContainingIgnoreCase(String title, Pageable pageable);

       List<Product> findBySellerId(String sellerId);

       @Query("SELECT p FROM Product p " +
                     "LEFT JOIN AuctionSession a ON a.product.id = p.id " +
                     "WHERE p.status = com.ecommerce.thriftauction.features.product.entity.ProductStatus.ACTIVE " +
                     "AND (p.sellType = com.ecommerce.thriftauction.features.product.entity.SellType.BUY_NOW " +
                     "     OR (p.sellType = com.ecommerce.thriftauction.features.product.entity.SellType.AUCTION AND a.endTime > CURRENT_TIMESTAMP)) "
                     +
                     "AND (:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:query AS text), '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', CAST(:query AS text), '%'))) "
                     +
                     "AND (:#{#categoryIds == null || #categoryIds.isEmpty()} = true OR p.category.id IN :categoryIds) "
                     +
                     "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
                     "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
                     "AND (:condition IS NULL OR p.condition = :condition) " +
                     "AND (:sellType IS NULL OR p.sellType = :sellType) " +
                     "AND (:location IS NULL OR p.location LIKE CONCAT('%', CAST(:location AS text), '%'))")
       Page<Product> searchProducts(
                     @Param("query") String query,
                     @Param("categoryIds") List<String> categoryIds,
                     @Param("minPrice") BigDecimal minPrice,
                     @Param("maxPrice") BigDecimal maxPrice,
                     @Param("condition") ProductCondition condition,
                     @Param("sellType") SellType sellType,
                     @Param("location") String location,
                     Pageable pageable);

       @Query("SELECT p FROM Product p WHERE p.status = com.ecommerce.thriftauction.features.product.entity.ProductStatus.ACTIVE "
                     +
                     "AND p.category.id = :categoryId " +
                     "AND p.id != :excludeId")
       List<Product> findRelatedProducts(@Param("categoryId") String categoryId, @Param("excludeId") String excludeId);

       List<Product> findByStatusAndUpdatedAtBefore(
                     com.ecommerce.thriftauction.features.product.entity.ProductStatus status,
                     java.time.LocalDateTime date);
}
