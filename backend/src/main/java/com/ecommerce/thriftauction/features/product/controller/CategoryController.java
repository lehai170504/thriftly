package com.ecommerce.thriftauction.features.product.controller;

import com.ecommerce.thriftauction.features.product.dto.CategoryDto;
import com.ecommerce.thriftauction.features.product.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Category", description = "Quản lý danh mục sản phẩm")
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "Tạo danh mục mới", description = "Admin tạo danh mục sản phẩm mới trên hệ thống.")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryDto request) {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }

    @Operation(summary = "Lấy tất cả danh mục", description = "Lấy danh sách tất cả các danh mục sản phẩm công khai.")
    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @Operation(summary = "Cập nhật danh mục", description = "Admin cập nhật thông tin danh mục theo ID.")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable String id, @RequestBody CategoryDto request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @Operation(summary = "Xóa danh mục", description = "Admin xóa danh mục sản phẩm khỏi hệ thống theo ID.")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
