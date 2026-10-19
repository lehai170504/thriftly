package com.ecommerce.thriftauction.features.payment.service;

import com.ecommerce.thriftauction.core.config.properties.PayosProperties;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.payment.dto.DepositRequest;
import com.ecommerce.thriftauction.features.payment.dto.PaymentIntentStatusResponse;
import com.ecommerce.thriftauction.features.payment.entity.PaymentIntent;
import com.ecommerce.thriftauction.features.payment.entity.PaymentIntentStatus;
import com.ecommerce.thriftauction.features.payment.repository.PaymentIntentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import vn.payos.PayOS;
import vn.payos.model.webhooks.WebhookData;
import vn.payos.service.blocking.webhooks.WebhooksService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTests {

    @Mock
    private PayOS payOS;

    @Mock
    private PayosProperties payosProperties;

    @Mock
    private WalletService walletService;

    @Mock
    private PaymentIntentRepository paymentIntentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    void processWebhookSuccessfullyProcessesValidData() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode payload = mapper.createObjectNode();
        payload.put("test", "data");

        WebhooksService webhooksService = mock(WebhooksService.class);
        when(payOS.webhooks()).thenReturn(webhooksService);

        WebhookData data = new WebhookData();
        data.setOrderCode(88888L);
        data.setAmount(50000L);
        when(webhooksService.verify(any())).thenReturn(data);

        paymentService.processWebhook(payload);

        verify(walletService, times(1)).processPaymentIntentWebhook(data);
    }

    @Test
    void getPaymentIntentStatusReturnsOwnedIntent() {
        PaymentIntent intent = PaymentIntent.builder()
                .id("intent-1")
                .orderCode(123456L)
                .amount(new BigDecimal("100000"))
                .currency("VND")
                .status(PaymentIntentStatus.PENDING)
                .build();
        intent.setUpdatedAt(LocalDateTime.now());

        when(paymentIntentRepository.findOwnedByOrderCode(123456L, "testuser"))
                .thenReturn(Optional.of(intent));

        PaymentIntentStatusResponse response = paymentService.getPaymentIntentStatus(123456L, "testuser");

        assertThat(response.orderCode()).isEqualTo(123456L);
        assertThat(response.status()).isEqualTo(PaymentIntentStatus.PENDING);
        assertThat(response.amount()).isEqualByComparingTo("100000");
    }

    @Test
    void getPaymentIntentStatusThrowsWhenNotFound() {
        when(paymentIntentRepository.findOwnedByOrderCode(999L, "testuser"))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            paymentService.getPaymentIntentStatus(999L, "testuser");
        });
    }

    @Test
    void createPaymentLinkThrowsWhenUserNotFound() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        DepositRequest request = DepositRequest.builder()
                .amount(new BigDecimal("50000"))
                .build();

        assertThrows(ResponseStatusException.class, () -> {
            paymentService.createPaymentLink("unknown@test.com", request);
        });
    }
}
