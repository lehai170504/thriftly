package com.ecommerce.thriftauction;

import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

public class EnvironmentConfigTests {

    @Test
    public void testProfileContextLoads() {
        ConfigurableApplicationContext context = new SpringApplicationBuilder(ThriftAuctionApplication.class)
                .profiles("test")
                .run();
        assertThat(context.isActive()).isTrue();
        context.close();
    }

}
