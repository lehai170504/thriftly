package com.ecommerce.thriftauction.core.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

import com.ecommerce.thriftauction.core.config.properties.CloudinaryProperties;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class CloudinaryConfig {

    private final CloudinaryProperties cloudinaryProperties;

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudinaryProperties.getCloudName());
        config.put("api_key", cloudinaryProperties.getApiKey());
        config.put("api_secret", cloudinaryProperties.getApiSecret());
        config.put("secure", "true");
        return new Cloudinary(config);
    }
}
