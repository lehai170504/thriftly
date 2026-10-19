package com.ecommerce.thriftauction.features.product.dto;

import com.ecommerce.thriftauction.features.product.entity.ProductCondition;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductRequest {
    @NotBlank(message = "Danh mục không được để trống")
    private String categoryId;

    @NotBlank(message = "Tiêu đề sản phẩm không được để trống")
    @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
    private String title;

    private String description;

    @NotNull(message = "Tình trạng sản phẩm không được để trống")
    private ProductCondition condition;

    @NotNull(message = "Hình thức bán không được để trống")
    private SellType sellType;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @Min(value = 1000, message = "Giá sản phẩm phải lớn hơn 1000đ")
    private BigDecimal price;

    @Builder.Default
    @Min(value = 1, message = "Số lượng phải lớn hơn hoặc bằng 1")
    private Integer quantity = 1;

    private String imageUrl;

    private List<String> images;

    private String videoUrl;

    private String location;

    private Integer auctionDurationDays;
}
