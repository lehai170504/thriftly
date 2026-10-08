package com.ecommerce.thriftauction.core.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Validated
@ConfigurationProperties(prefix = "payos")
public class PayosProperties {
    @NotBlank
    private String clientId;
    @NotBlank
    private String apiKey;
    @NotBlank
    private String checksumKey;
    private String returnUrl;
    private String cancelUrl;
}
