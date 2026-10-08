package com.ecommerce.thriftauction.core.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Validated
@ConfigurationProperties(prefix = "cloudinary")
public class CloudinaryProperties {
    @NotBlank
    private String cloudName;
    @NotBlank
    private String apiKey;
    @NotBlank
    private String apiSecret;
}
