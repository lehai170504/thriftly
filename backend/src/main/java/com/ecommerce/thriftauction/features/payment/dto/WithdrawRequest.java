package com.ecommerce.thriftauction.features.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WithdrawRequest {
    @NotNull(message = "Số tiền rút không được để trống")
    @DecimalMin(value = "50000", message = "Số tiền rút tối thiểu là 50,000 VNĐ")
    private BigDecimal amount;
    private String bankName;
    private String accountNumber;
    private String accountName;
    private String bankAccountId;
}
