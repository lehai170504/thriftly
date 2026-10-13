package com.ecommerce.thriftauction.core.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Profile;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Validated
@Profile("!prod")
@ConfigurationProperties(prefix = "app.admin")
public class AdminProperties {
    @NotBlank
    private String email;
    @NotBlank
    private String password;
    private String allowedIps;
}
