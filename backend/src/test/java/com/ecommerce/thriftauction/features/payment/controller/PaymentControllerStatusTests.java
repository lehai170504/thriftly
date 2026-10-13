package com.ecommerce.thriftauction.features.payment.controller;

import com.ecommerce.thriftauction.core.config.properties.PayosProperties;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.payment.dto.PaymentIntentStatusResponse;
import com.ecommerce.thriftauction.features.payment.entity.PaymentIntent;
import com.ecommerce.thriftauction.features.payment.entity.PaymentIntentStatus;
import com.ecommerce.thriftauction.features.payment.repository.PaymentIntentRepository;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import vn.payos.PayOS;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentControllerStatusTests {

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
    @Mock
    private Authentication authentication;

    @InjectMocks
    private PaymentController controller;

    @Test
    void returnsOnlyIntentOwnedByAuthenticatedIdentity() {
        PaymentIntent intent = PaymentIntent.builder()
                .user(User.builder().id("user-id").build())
                .orderCode(123L)
                .amount(new BigDecimal("100000"))
                .currency("VND")
                .status(PaymentIntentStatus.SUCCESS)
                .build();
        when(authentication.getName()).thenReturn("buyer@example.com");
        when(paymentIntentRepository.findOwnedByOrderCode(123L, "buyer@example.com"))
                .thenReturn(Optional.of(intent));

        PaymentIntentStatusResponse response = controller.getPaymentIntentStatus(123L, authentication);

        assertThat(response.orderCode()).isEqualTo(123L);
        assertThat(response.status()).isEqualTo(PaymentIntentStatus.SUCCESS);
    }

    @Test
    void hidesAnotherUsersIntentAsNotFound() {
        when(authentication.getName()).thenReturn("other@example.com");
        when(paymentIntentRepository.findOwnedByOrderCode(123L, "other@example.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> controller.getPaymentIntentStatus(123L, authentication))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }
}
