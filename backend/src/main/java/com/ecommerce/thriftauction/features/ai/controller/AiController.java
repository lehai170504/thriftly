package com.ecommerce.thriftauction.features.ai.controller;

import com.ecommerce.thriftauction.features.ai.dto.request.AiRequest;
import com.ecommerce.thriftauction.features.ai.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Assistant", description = "Trợ lý trí tuệ nhân tạo: tự động tạo mô tả sản phẩm và định giá khởi điểm")
public class AiController {

    private final AiService aiService;

    @Operation(summary = "Tự động tạo mô tả sản phẩm", description = "Sử dụng mô hình AI để tự động tạo nội dung mô tả sản phẩm thu hút dựa trên tên và tình trạng sản phẩm.")
    @PostMapping("/generate-description")
    public ResponseEntity<Map<String, String>> generateDescription(@RequestBody AiRequest request) {
        String description = aiService.generateProductDescription(request.getProductName(), request.getCondition());
        return ResponseEntity.ok(Map.of("data", description));
    }

    @Operation(summary = "Gợi ý mức giá khởi điểm", description = "Sử dụng AI phân tích và đề xuất mức giá khởi điểm hợp lý cho sản phẩm đấu giá dựa trên tên và độ mới.")
    @PostMapping("/suggest-price")
    public ResponseEntity<Map<String, String>> suggestPrice(@RequestBody AiRequest request) {
        String priceSuggestion = aiService.suggestStartingPrice(request.getProductName(), request.getCondition());
        return ResponseEntity.ok(Map.of("data", priceSuggestion));
    }
}
