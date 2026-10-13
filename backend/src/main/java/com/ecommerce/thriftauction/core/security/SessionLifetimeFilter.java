package com.ecommerce.thriftauction.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

@Component
public class SessionLifetimeFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session != null) {
            Object expiryValue = session.getAttribute(SessionAuthenticationService.ABSOLUTE_EXPIRY_ATTRIBUTE);
            if (expiryValue instanceof Long expiry && Instant.now().toEpochMilli() >= expiry) {
                session.invalidate();
            }
        }
        filterChain.doFilter(request, response);
    }
}
