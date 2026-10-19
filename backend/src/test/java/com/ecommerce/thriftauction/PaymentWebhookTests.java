package com.ecommerce.thriftauction;

import com.ecommerce.thriftauction.core.config.properties.BrowserSecurityProperties;
import com.ecommerce.thriftauction.core.security.ClientIpResolver;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.payment.controller.PaymentController;
import com.ecommerce.thriftauction.features.payment.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
public class PaymentWebhookTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentService paymentService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private ClientIpResolver clientIpResolver;

    @MockBean
    private BrowserSecurityProperties browserSecurityProperties;

    @MockBean
    private AuthenticationProvider authenticationProvider;

    @Test
    public void testValidWebhook() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode payload = mapper.createObjectNode();
        payload.put("test", "data");

        doNothing().when(paymentService).processWebhook(any());

        mockMvc.perform(post("/api/v1/payment/payos/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(paymentService, times(1)).processWebhook(any());
    }

    @Test
    public void testInvalidWebhookSignature() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode payload = mapper.createObjectNode();
        payload.put("test", "data");

        doThrow(new RuntimeException("Invalid signature")).when(paymentService).processWebhook(any());

        mockMvc.perform(post("/api/v1/payment/payos/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        verify(paymentService, times(1)).processWebhook(any());
    }
}
