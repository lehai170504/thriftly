package com.ecommerce.thriftauction.features.auth.service;

import com.ecommerce.thriftauction.core.security.SessionRevocationService;
import com.ecommerce.thriftauction.features.auth.dto.AuthRequest;
import com.ecommerce.thriftauction.features.auth.dto.AuthResponse;
import com.ecommerce.thriftauction.features.auth.entity.OtpPurpose;
import com.ecommerce.thriftauction.features.auth.entity.OtpToken;
import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.OtpTokenRepository;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.notification.service.EmailService;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTwoFactorTests {

    @Mock
    private UserRepository userRepository;
    @Mock
    private WalletRepository walletRepository;
    @Mock
    private OtpTokenRepository otpTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private EmailService emailService;
    @Mock
    private SessionRevocationService sessionRevocationService;

    @InjectMocks
    private AuthService authService;

    @Test
    void privilegedPasswordLoginCreatesPurposeBoundChallengeWithoutSessionResponse() {
        ReflectionTestUtils.setField(authService, "adminTwoFactorEnabled", true);
        User admin = User.builder()
                .id("admin-id")
                .username("admin")
                .email("admin@example.com")
                .password("encoded")
                .role(Role.ADMIN)
                .isActive(true)
                .build();
        AuthRequest request = new AuthRequest();
        request.setEmail("admin@example.com");
        request.setPassword("password");
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(otpTokenRepository.save(any(OtpToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.authenticate(request);

        assertThat(response.isRequires2FA()).isTrue();
        assertThat(response.getEmail()).isEqualTo("admin@example.com");
        ArgumentCaptor<OtpToken> token = ArgumentCaptor.forClass(OtpToken.class);
        verify(otpTokenRepository).invalidateUnused(admin, OtpPurpose.LOGIN_2FA);
        verify(otpTokenRepository).save(token.capture());
        assertThat(token.getValue().getPurpose()).isEqualTo(OtpPurpose.LOGIN_2FA);
        assertThat(token.getValue().getOtp()).matches("\\d{6}");
        verify(emailService).sendOtpEmail("admin@example.com", token.getValue().getOtp());
    }

    @Test
    void privilegedPasswordLoginSkipsEmailChallengeWhenDemoTwoFactorSettingIsDisabled() {
        ReflectionTestUtils.setField(authService, "adminTwoFactorEnabled", false);
        User admin = User.builder()
                .id("admin-id")
                .username("admin")
                .email("admin@example.com")
                .password("encoded")
                .role(Role.ADMIN)
                .isActive(true)
                .build();
        AuthRequest request = new AuthRequest();
        request.setEmail("admin@example.com");
        request.setPassword("password");
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));

        AuthResponse response = authService.authenticate(request);

        assertThat(response.isRequires2FA()).isFalse();
        assertThat(response.getEmail()).isEqualTo("admin@example.com");
        assertThat(response.getRole()).isEqualTo(Role.ADMIN.name());
        verify(emailService, org.mockito.Mockito.never()).sendOtpEmail(org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyString());
    }
}
