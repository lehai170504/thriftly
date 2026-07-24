package com.ecommerce.thriftauction.features.product.dto;

import com.ecommerce.thriftauction.features.product.entity.ProductCondition;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductRequest {
    private String categoryId;
    private String title;
    private String description;
    private ProductCondition condition;
    private SellType sellType;
    @NotNull(message = "Giá sản phẩm không được để trống")
    @Min(value = 1000, message = "Giá sản phẩm phải lớn hơn 1000đ")
    private BigDecimal price;

    @Min(value = 1, message = "Số lượng phải lớn hơn hoặc bằng 1")
    private Integer quantity = 1;

    private String imageUrl;
    
    private java.util.List<String> images;

    private String videoUrl;

    private String location;

    private Integer auctionDurationDays;
}
