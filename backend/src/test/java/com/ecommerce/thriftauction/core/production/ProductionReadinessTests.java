package com.ecommerce.thriftauction.core.production;

import com.ecommerce.thriftauction.core.logging.CorrelationIdFilter;
import com.ecommerce.thriftauction.core.logging.MaskingMessageConverter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.actuate.observability.AutoConfigureObservability;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@AutoConfigureObservability
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:tc:postgresql:15.3:///production_readiness_test",
        "spring.datasource.driver-class-name=org.testcontainers.jdbc.ContainerDatabaseDriver",
        "spring.datasource.username=test",
        "spring.datasource.password=test",
        "spring.flyway.enabled=true",
        "spring.flyway.baseline-on-migrate=true",
        "spring.jpa.hibernate.ddl-auto=validate",
        "management.endpoints.web.exposure.include=health,info,metrics,prometheus",
        "management.endpoint.health.probes.enabled=true"
})
public class ProductionReadinessTests {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testActuatorHealthLivenessAndReadinessProbes() {
        ResponseEntity<String> livenessResponse = restTemplate.getForEntity(
                "http://localhost:" + port + "/actuator/health/liveness", String.class);
        assertThat(livenessResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(livenessResponse.getBody()).contains("\"status\":\"UP\"");

        ResponseEntity<String> readinessResponse = restTemplate.getForEntity(
                "http://localhost:" + port + "/actuator/health/readiness", String.class);
        assertThat(readinessResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(readinessResponse.getBody()).contains("\"status\":\"UP\"");
    }

    @Test
    void testPrometheusMetricsEndpoint() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/actuator/prometheus", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("jvm_memory_used_bytes");
    }

    @Test
    void testCorrelationIdHeaderPropagation() throws Exception {
        String testCorrelationId = "test-corr-id-987654";
        mockMvc.perform(get("/api/v1/auth/csrf")
                .header(CorrelationIdFilter.CORRELATION_ID_HEADER, testCorrelationId))
                .andExpect(status().isOk())
                .andExpect(header().string(CorrelationIdFilter.CORRELATION_ID_HEADER, testCorrelationId));
    }

    @Test
    void testCorrelationIdAutoGenerationWhenMissing() throws Exception {
        mockMvc.perform(get("/api/v1/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(header().exists(CorrelationIdFilter.CORRELATION_ID_HEADER));
    }

    @Test
    void testLogMaskingRedactionConverter() {
        MaskingMessageConverter converter = new MaskingMessageConverter();

        String rawLog = "User login with password=SuperSecretPass123! and token=AbcDefXyz456";
        String masked = converter.mask(rawLog);
        assertThat(masked).contains("password=***");
        assertThat(masked).contains("token=***");
        assertThat(masked).doesNotContain("SuperSecretPass123!");
        assertThat(masked).doesNotContain("AbcDefXyz456");

        String rawAuthLog = "Received header Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThis";
        String maskedJwt = converter.mask(rawAuthLog);
        assertThat(maskedJwt).contains("Bearer ***");
        assertThat(maskedJwt).doesNotContain("doNotLeakThis");
    }
}
