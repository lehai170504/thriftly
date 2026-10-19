package com.ecommerce.thriftauction.features.common.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BidRequest {
    @NotBlank(message = "Mã phiên đấu giá không được để trống")
    private String auctionSessionId;

    @NotNull(message = "Giá đặt không được để trống")
    @DecimalMin(value = "1000", message = "Giá đặt phải từ 1.000 VNĐ trở lên")
    private BigDecimal bidAmount;
}
