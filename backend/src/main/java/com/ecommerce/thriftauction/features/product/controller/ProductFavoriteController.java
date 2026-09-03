package com.ecommerce.thriftauction.features.product.controller;

import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.product.service.ProductFavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product Favorites", description = "Quản lý danh sách sản phẩm yêu thích (Wishlist) của người dùng")
public class ProductFavoriteController {

    private final ProductFavoriteService favoriteService;

    @Operation(summary = "Yêu thích / Bỏ yêu thích sản phẩm", description = "Thêm hoặc xóa một sản phẩm khỏi danh sách yêu thích của người dùng đang đăng nhập.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{id}/favorite")
    public ResponseEntity<Map<String, Boolean>> toggleFavorite(@PathVariable String id, Authentication authentication) {
        boolean isFavorited = favoriteService.toggleFavorite(id, authentication.getName());
        return ResponseEntity.ok(Map.of("isFavorited", isFavorited));
    }

    @Operation(summary = "Lấy danh sách ID sản phẩm yêu thích", description = "Lấy toàn bộ ID các sản phẩm mà người dùng hiện tại đã bấm yêu thích.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/favorites/ids")
    public ResponseEntity<List<String>> getUserFavoriteIds(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        List<String> favoriteIds = favoriteService.getUserFavoriteProductIds(authentication.getName());
        return ResponseEntity.ok(favoriteIds);
    }

    @Operation(summary = "Lấy danh sách sản phẩm yêu thích", description = "Lấy danh sách chi tiết các sản phẩm yêu thích của người dùng có phân trang.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/favorites")
    public ResponseEntity<Page<ProductResponse>> getUserFavorites(Authentication authentication, Pageable pageable) {
        if (authentication == null) {
            return ResponseEntity.ok(Page.empty());
        }
        return ResponseEntity.ok(favoriteService.getUserFavoriteProducts(authentication.getName(), pageable));
    }
}
