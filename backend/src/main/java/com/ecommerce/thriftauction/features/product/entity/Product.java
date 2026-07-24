package com.ecommerce.thriftauction.features.product.entity;

import com.ecommerce.thriftauction.features.auth.entity.User;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private Integer quantity = 1;

    @Enumerated(EnumType.STRING)
    private ProductCondition condition;

    @Enumerated(EnumType.STRING)
    private SellType sellType;

    @Column(nullable = false)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    private String imageUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private java.util.List<String> images;

    private String videoUrl;

    private String location;

    @Column(columnDefinition = "boolean default false")
    private Boolean isHidden = false;

    @Column(columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isLive = false;

    private LocalDateTime boostedUntil;

    @Column(columnDefinition = "numeric(3,1) default 5.0")
    @Builder.Default
    private Double averageRating = 5.0;

    @Column(columnDefinition = "integer default 0")
    @Builder.Default
    private Integer soldCount = 0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
