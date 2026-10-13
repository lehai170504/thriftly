package com.ecommerce.thriftauction.core.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.ecommerce.thriftauction.core.config.properties.BrowserSecurityProperties;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SwaggerConfig {

        private final BrowserSecurityProperties browserSecurityProperties;

        @Bean
        public OpenAPI openAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("Thriftly API Documentation")
                                                .description("RESTful API Documentation for Thriftly Platform. Includes User, Product, Auction, Escrow, and Admin operations.")
                                                .version("v1.0")
                                                .contact(new Contact()
                                                                .name("Thriftly Team")
                                                                .url("https://thriftly.com"))
                                                .license(new License().name("MIT License")
                                                                .url("https://opensource.org/licenses/MIT")))
                                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                                .components(new Components()
                                                .addSecuritySchemes("Bearer Authentication", createAPIKeyScheme()));
        }

        private SecurityScheme createAPIKeyScheme() {
                return new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .name(browserSecurityProperties.getSessionCookieName())
                                .description("Opaque HttpOnly browser session cookie");
        }
}
