package com.ecommerce.thriftauction.core.security;

import com.ecommerce.thriftauction.core.config.properties.BrowserSecurityProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;

@Component
public class LegacyTokenCookieCleanupFilter extends OncePerRequestFilter {

    private final BrowserSecurityProperties properties;

    public LegacyTokenCookieCleanupFilter(BrowserSecurityProperties properties) {
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        Cookie[] cookies = request.getCookies();
        if (cookies != null && Arrays.stream(cookies).anyMatch(cookie -> "token".equals(cookie.getName()))) {
            ResponseCookie expired = ResponseCookie.from("token", "")
                    .httpOnly(true)
                    .secure(properties.isSecureCookie())
                    .sameSite(properties.getSameSite())
                    .path("/")
                    .maxAge(Duration.ZERO)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, expired.toString());
        }
        filterChain.doFilter(request, response);
    }
}
