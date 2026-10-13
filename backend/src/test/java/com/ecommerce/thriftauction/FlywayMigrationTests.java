package com.ecommerce.thriftauction;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:tc:postgresql:15.3:///test_db",
        "spring.datasource.driver-class-name=org.testcontainers.jdbc.ContainerDatabaseDriver",
        "spring.flyway.enabled=true",
        "spring.flyway.baseline-on-migrate=true",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.dotenv.ignore=true" // Ignore .env to avoid DB_URL overrides
})
public class FlywayMigrationTests {

    @Test
    void contextLoadsAndMigratesSuccessfully() {
        // If the context loads, it means Flyway successfully applied the migrations
        // on an empty Testcontainer, and Hibernate successfully validated the schema.
    }
}
