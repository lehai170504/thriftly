package com.ecommerce.thriftauction.features.product.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;

    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;

    private String description;
    private String icon;
    private String parentId;
    private List<CategoryDto> subCategories;
}
