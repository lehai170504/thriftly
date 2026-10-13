package com.ecommerce.thriftauction.features.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SystemConfigDto implements Serializable {
    private static final long serialVersionUID = 1L;
    @NotNull(message = "Platform fee percent is required")
    @DecimalMin(value = "0.0", message = "Fee cannot be negative")
    @DecimalMax(value = "1.0", message = "Fee cannot exceed 100% (1.0)")
    private BigDecimal platformFeePercent;

    @NotNull(message = "Minimum withdrawal amount is required")
    @DecimalMin(value = "0.0", message = "Amount cannot be negative")
    private BigDecimal minWithdrawalAmount;

    @NotNull(message = "Maintenance mode flag is required")
    private Boolean isMaintenanceMode;
}
