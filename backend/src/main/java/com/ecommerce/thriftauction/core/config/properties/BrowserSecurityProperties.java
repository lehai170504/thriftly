package com.ecommerce.thriftauction.core.config.properties;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;
import java.util.List;

@Data
@Validated
@ConfigurationProperties(prefix = "app.security.browser")
public class BrowserSecurityProperties {

    @NotEmpty
    private List<@NotBlank String> allowedOrigins;

    @NotBlank
    private String sessionCookieName = "THRIFTLY_SESSION";

    private boolean secureCookie;

    @NotBlank
    private String sameSite = "Lax";

    private String cookieDomain;

    private List<String> trustedProxies = List.of();

    @NotNull
    private Duration absoluteTimeout = Duration.ofHours(12);
}
