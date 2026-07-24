package com.ecommerce.thriftauction.features.payment.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class BankAccountResponse {
    private String id;
    private String bankName;
    private String accountNumber;
    private String accountName;
    private Boolean isDefault;
    private LocalDateTime createdAt;
}
