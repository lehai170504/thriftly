package com.ecommerce.thriftauction.features.payment.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WithdrawRequest {
    private BigDecimal amount;
    private String bankName;
    private String accountNumber;
    private String accountName;
    private String bankAccountId;
}
