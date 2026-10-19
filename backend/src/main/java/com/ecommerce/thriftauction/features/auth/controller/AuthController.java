package com.ecommerce.thriftauction.features.auth.controller;

import com.ecommerce.thriftauction.core.security.SessionAuthenticationService;
import com.ecommerce.thriftauction.core.security.SessionRevocationService;
import com.ecommerce.thriftauction.features.auth.dto.*;
import com.ecommerce.thriftauction.features.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SessionAuthenticationService sessionAuthenticationService;
    private final SessionRevocationService sessionRevocationService;

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("headerName", token.getHeaderName(), "parameterName", token.getParameterName(),
                "token", token.getToken());
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest body,
            HttpServletRequest request, HttpServletResponse response) {
        AuthResponse result = authService.register(body);
        if (!result.isRequires2FA()) {
            establish(result, request, response);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@Valid @RequestBody AuthRequest body,
            HttpServletRequest request, HttpServletResponse response) {
        AuthResponse result;
        try {
            result = authService.authenticate(body);
        } catch (DisabledException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Account is disabled");
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
        if (!result.isRequires2FA()) {
            establish(result, request, response);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequest body,
            HttpServletRequest request, HttpServletResponse response) {
        AuthResponse result;
        try {
            result = authService.googleLogin(body.getCredential());
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google login failed");
        }
        if (!result.isRequires2FA()) {
            establish(result, request, response);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/facebook-login")
    public ResponseEntity<?> facebookLogin(@Valid @RequestBody FacebookLoginRequest body,
            HttpServletRequest request, HttpServletResponse response) {
        AuthResponse result;
        try {
            result = authService.facebookLogin(body.getAccessToken());
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Facebook login failed");
        }
        if (!result.isRequires2FA()) {
            establish(result, request, response);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2Fa(@Valid @RequestBody Verify2FaRequest body,
            HttpServletRequest request, HttpServletResponse response) {
        AuthResponse result;
        try {
            result = authService.verify2Fa(body.getEmail(), body.getOtp());
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired verification code");
        }
        establish(result, request, response);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout-all")
    public ResponseEntity<Void> logoutAll(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) {
        if (authentication != null) {
            sessionRevocationService.revokeAll(authentication.getName());
        }
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest body) {
        try {
            authService.forgotPassword(body.getEmail());
            return ResponseEntity.ok("OTP sent to email");
        } catch (Exception exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest body) {
        authService.resetPassword(body);
        return ResponseEntity.ok("Password has been reset successfully");
    }

    private void establish(AuthResponse result, HttpServletRequest request, HttpServletResponse response) {
        sessionAuthenticationService.establish(result.getEmail(), request, response);
    }
}
