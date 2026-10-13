package com.ecommerce.thriftauction.features.auth.controller;

import com.ecommerce.thriftauction.core.security.SessionAuthenticationService;
import com.ecommerce.thriftauction.core.security.SessionRevocationService;
import com.ecommerce.thriftauction.features.auth.dto.AuthResponse;
import com.ecommerce.thriftauction.features.auth.dto.FacebookLoginRequest;
import com.ecommerce.thriftauction.features.auth.dto.GoogleLoginRequest;
import com.ecommerce.thriftauction.features.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerSessionTests {

    @Mock
    private AuthService authService;
    @Mock
    private SessionAuthenticationService sessionAuthenticationService;
    @Mock
    private SessionRevocationService sessionRevocationService;
    @Mock
    private HttpServletRequest request;
    @Mock
    private HttpServletResponse response;

    private AuthController controller;

    @BeforeEach
    void setUp() {
        controller = new AuthController(authService, sessionAuthenticationService, sessionRevocationService);
    }

    @Test
    void googleLoginDoesNotCreateSessionWhilePrivilegedSecondFactorIsPending() {
        GoogleLoginRequest login = new GoogleLoginRequest();
        login.setCredential("google-credential");
        when(authService.googleLogin("google-credential")).thenReturn(pendingSecondFactor());

        controller.googleLogin(login, request, response);

        verify(sessionAuthenticationService, never()).establish("admin@example.com", request, response);
    }

    @Test
    void facebookLoginDoesNotCreateSessionWhilePrivilegedSecondFactorIsPending() {
        FacebookLoginRequest login = new FacebookLoginRequest();
        login.setAccessToken("facebook-token");
        when(authService.facebookLogin("facebook-token")).thenReturn(pendingSecondFactor());

        controller.facebookLogin(login, request, response);

        verify(sessionAuthenticationService, never()).establish("admin@example.com", request, response);
    }

    private AuthResponse pendingSecondFactor() {
        return AuthResponse.builder()
                .email("admin@example.com")
                .requires2FA(true)
                .build();
    }
}
