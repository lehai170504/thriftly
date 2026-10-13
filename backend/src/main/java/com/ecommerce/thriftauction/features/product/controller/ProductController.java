package com.ecommerce.thriftauction.features.product.controller;

import com.ecommerce.thriftauction.features.product.dto.ProductRequest;
import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.product.entity.ProductCondition;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import com.ecommerce.thriftauction.features.product.service.command.ProductCommandService;
import com.ecommerce.thriftauction.features.product.service.query.ProductQueryService;
import com.ecommerce.thriftauction.features.product.service.domain.ProductBoostService;
import com.ecommerce.thriftauction.features.product.service.domain.ProductRecommendationService;
import com.ecommerce.thriftauction.features.product.service.domain.ProductAuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.Collections;
import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product", description = "Quản lý sản phẩm, tìm kiếm và lọc sản phẩm")
public class ProductController {

    private final ProductCommandService productCommandService;
    private final ProductQueryService productQueryService;
    private final ProductBoostService productBoostService;
    private final ProductRecommendationService productRecommendationService;
    private final ProductAuctionService productAuctionService;

    @Operation(summary = "Tạo sản phẩm mới", description = "Seller tạo sản phẩm (mua ngay hoặc đấu giá). Yêu cầu đăng nhập.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @RequestBody ProductRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(productCommandService.createProduct(request, authentication.getName()));
    }

    @Operation(summary = "Lấy danh sách sản phẩm", description = "Lấy tất cả sản phẩm đang active có phân trang.")
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(productQueryService.getAllActiveProducts(PageRequest.of(page, size, sort)));
    }

    @Operation(summary = "Lấy chi tiết sản phẩm", description = "Lấy thông tin chi tiết một sản phẩm qua ID.")
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable String id,
            @RequestHeader(value = "X-Cookie-Consent", required = false) String cookieConsent,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        boolean consentGranted = "accepted".equalsIgnoreCase(cookieConsent);
        return ResponseEntity.ok(productQueryService.getProductById(id, username, consentGranted));
    }

    @Operation(summary = "Tìm kiếm và lọc", description = "Tìm kiếm sản phẩm theo tên, danh mục, giá, tình trạng, loại bán và khu vực.")
    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) List<String> categoryIds,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) ProductCondition condition,
            @RequestParam(required = false) SellType sellType,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(Sort.Direction.DESC, "boostedUntil").and(Sort.by(sortDirection, sortBy));

        return ResponseEntity
                .ok(productQueryService.searchProducts(query, categoryIds, minPrice, maxPrice, condition, sellType,
                        location,
                        PageRequest.of(page, size, sort)));
    }

    @Operation(summary = "Sản phẩm liên quan", description = "Lấy danh sách sản phẩm cùng danh mục.")
    @GetMapping("/{id}/related")
    public ResponseEntity<List<ProductResponse>> getRelatedProducts(
            @PathVariable String id,
            @RequestParam String categoryId) {
        return ResponseEntity.ok(productQueryService.getRelatedProducts(categoryId, id));
    }

    @Operation(summary = "Gợi ý AI cá nhân hóa", description = "Lấy danh sách sản phẩm gợi ý dựa trên lịch sử xem của user. Yêu cầu đăng nhập.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/recommendations")
    public ResponseEntity<List<ProductResponse>> getRecommendations(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(productRecommendationService.getRecommendations(authentication.getName()));
    }

    @Operation(summary = "Sản phẩm của người bán", description = "Lấy danh sách sản phẩm theo username của seller.")
    @GetMapping("/seller/{username}")
    public ResponseEntity<List<ProductResponse>> getProductsBySeller(@PathVariable String username) {
        return ResponseEntity.ok(productQueryService.getProductsBySeller(username));
    }

    @Operation(summary = "Xóa sản phẩm", description = "Xóa sản phẩm của chính người đăng. Yêu cầu đăng nhập.")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable String id,
            Authentication authentication) {
        productCommandService.deleteProduct(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Cập nhật sản phẩm", description = "Cập nhật thông tin sản phẩm của chính người đăng. Không thể sửa đấu giá nếu đã có bids.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable String id,
            @RequestBody ProductRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(productCommandService.updateProduct(id, request, authentication.getName()));
    }

    @Operation(summary = "Đẩy tin sản phẩm", description = "Đẩy tin lên đầu trang kết quả tìm kiếm với phí 20.000 VNĐ/ngày.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{id}/boost")
    public ResponseEntity<ProductResponse> boostProduct(
            @PathVariable String id,
            Authentication authentication) {
        return ResponseEntity.ok(productBoostService.boostProduct(id, authentication.getName()));
    }

    @Operation(summary = "Đấu giá lại", description = "Đăng lại phiên đấu giá đối với sản phẩm đã kết thúc nhưng không có người mua.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{id}/restart-auction")
    public ResponseEntity<ProductResponse> restartAuction(
            @PathVariable String id,
            Authentication authentication) {
        return ResponseEntity.ok(productAuctionService.restartAuction(id, authentication.getName()));
    }
}
