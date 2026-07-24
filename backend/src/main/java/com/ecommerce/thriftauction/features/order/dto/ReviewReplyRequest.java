package com.ecommerce.thriftauction.features.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewReplyRequest {
    @NotBlank(message = "Nội dung phản hồi không được để trống")
    private String reply;
}
