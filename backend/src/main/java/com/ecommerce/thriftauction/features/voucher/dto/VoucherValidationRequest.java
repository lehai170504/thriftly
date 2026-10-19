package com.ecommerce.thriftauction.features.voucher.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherValidationRequest {
    private String voucherCode;

    @NotBlank(message = "Mã sản phẩm không được để trống")
    private String productId;

    @Min(value = 1, message = "Số lượng tối thiểu là 1")
    private Integer quantity;
}
