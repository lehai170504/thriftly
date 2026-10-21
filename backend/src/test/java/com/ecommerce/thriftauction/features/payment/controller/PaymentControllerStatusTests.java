package com.ecommerce.thriftauction.features.payment.controller;

import com.ecommerce.thriftauction.features.payment.dto.PaymentIntentStatusResponse;
import com.ecommerce.thriftauction.features.payment.entity.PaymentIntentStatus;
import com.ecommerce.thriftauction.features.payment.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentControllerStatusTests {

    @Mock
    private PaymentService paymentService;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private PaymentController controller;

    @Test
    void returnsOnlyIntentOwnedByAuthenticatedIdentity() {
        PaymentIntentStatusResponse expected = new PaymentIntentStatusResponse(
                123L, PaymentIntentStatus.SUCCESS, new BigDecimal("100000"), "VND", LocalDateTime.now());
        when(authentication.getName()).thenReturn("buyer@example.com");
        when(paymentService.getPaymentIntentStatus(123L, "buyer@example.com")).thenReturn(expected);

        PaymentIntentStatusResponse response = controller.getPaymentIntentStatus(123L, authentication);

        assertThat(response).isEqualTo(expected);
        verify(paymentService).getPaymentIntentStatus(123L, "buyer@example.com");
    }

    @Test
    void hidesAnotherUsersIntentAsNotFound() {
        when(authentication.getName()).thenReturn("other@example.com");
        when(paymentService.getPaymentIntentStatus(123L, "other@example.com"))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment intent not found"));

        assertThatThrownBy(() -> controller.getPaymentIntentStatus(123L, authentication))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }
}
