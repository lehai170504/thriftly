package com.ecommerce.thriftauction.core.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Validated
@ConfigurationProperties(prefix = "application.security.jwt")
public class JwtProperties {
    @NotBlank
    private String secretKey;
    private long expiration;
}
