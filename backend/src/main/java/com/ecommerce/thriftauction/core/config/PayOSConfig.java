package com.ecommerce.thriftauction.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.payos.PayOS;

import com.ecommerce.thriftauction.core.config.properties.PayosProperties;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class PayOSConfig {

    private final PayosProperties payosProperties;

    @Bean
    public PayOS payOS() {
        return new PayOS(payosProperties.getClientId(), payosProperties.getApiKey(), payosProperties.getChecksumKey());
    }
}
