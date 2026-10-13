package com.ecommerce.thriftauction;

import com.ecommerce.thriftauction.core.config.properties.PayosProperties;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.payment.controller.PaymentController;
import com.ecommerce.thriftauction.features.payment.repository.PaymentIntentRepository;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import com.ecommerce.thriftauction.core.security.IpWhitelistFilter;
import com.ecommerce.thriftauction.core.security.ClientIpResolver;
import com.ecommerce.thriftauction.core.config.properties.BrowserSecurityProperties;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import vn.payos.PayOS;
import vn.payos.model.webhooks.WebhookData;
import vn.payos.service.blocking.webhooks.WebhooksService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for unit testing the controller
public class PaymentWebhookTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PayOS payOS;

    @MockBean
    private PayosProperties payosProperties;

    @MockBean
    private WalletService walletService;

    @MockBean
    private PaymentIntentRepository paymentIntentRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private IpWhitelistFilter ipWhitelistFilter;

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

        // Mock WebhooksService
        WebhooksService webhooksService = mock(WebhooksService.class);
        when(payOS.webhooks()).thenReturn(webhooksService);

        WebhookData fakeData = new WebhookData();
        fakeData.setOrderCode(12345L);
        fakeData.setAmount(10000L);
        when(webhooksService.verify(any())).thenReturn(fakeData);

        mockMvc.perform(post("/api/v1/payment/payos/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(walletService, times(1)).processPaymentIntentWebhook(any());
    }

    @Test
    public void testInvalidWebhookSignature() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode payload = mapper.createObjectNode();
        payload.put("test", "data");

        WebhooksService webhooksService = mock(WebhooksService.class);
        when(payOS.webhooks()).thenReturn(webhooksService);
        when(webhooksService.verify(any())).thenThrow(new RuntimeException("Invalid signature"));

        mockMvc.perform(post("/api/v1/payment/payos/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        verify(walletService, never()).processPaymentIntentWebhook(any());
    }
}
