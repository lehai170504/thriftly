package com.ecommerce.thriftauction.core.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import org.springframework.context.annotation.Profile;

@Component
@Order(1) // Run early
@Profile("!prod")
public class DatabaseFixRunner implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    public DatabaseFixRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN deleted_by_buyer BOOLEAN DEFAULT FALSE;");
            System.out.println("========== COLUMN deleted_by_buyer ADDED SUCCESSFULLY ==========");
        } catch (Exception e) {
            System.out.println("========== COLUMN MIGHT ALREADY EXIST OR ERROR OCCURRED ==========");
        }
    }
}
