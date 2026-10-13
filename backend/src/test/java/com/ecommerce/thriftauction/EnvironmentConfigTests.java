package com.ecommerce.thriftauction;

import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

public class EnvironmentConfigTests {

    @Test
    public void testProfileContextLoads() {
        ConfigurableApplicationContext context = new SpringApplicationBuilder(ThriftAuctionApplication.class)
                .run(
                        "--spring.profiles.active=test",
                        "--spring.datasource.url=jdbc:tc:postgresql:15.3:///environment_config_test",
                        "--spring.datasource.driver-class-name=org.testcontainers.jdbc.ContainerDatabaseDriver",
                        "--spring.datasource.username=test",
                        "--spring.datasource.password=test",
                        "--spring.flyway.enabled=true",
                        "--spring.jpa.hibernate.ddl-auto=validate");
        assertThat(context.isActive()).isTrue();
        context.close();
    }

}
