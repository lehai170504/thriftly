package com.ecommerce.thriftauction.features.payment.dto;

import com.ecommerce.thriftauction.features.payment.entity.PaymentIntentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentIntentStatusResponse(
        Long orderCode,
        PaymentIntentStatus status,
        BigDecimal amount,
        String currency,
        LocalDateTime updatedAt) {
}
