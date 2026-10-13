package com.ecommerce.thriftauction.core.security;

import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class UserActivityFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            try {
                String username = authentication.getName();
                userRepository.findByEmail(username).or(() -> userRepository.findByUsername(username))
                        .filter(user -> user.getLastActiveAt() == null
                                || user.getLastActiveAt().isBefore(LocalDateTime.now().minusMinutes(1)))
                        .ifPresent(user -> userRepository.updateLastActiveAt(username, LocalDateTime.now()));
            } catch (RuntimeException ignored) {
                // Activity tracking must not make an authenticated request fail.
            }
        }
        filterChain.doFilter(request, response);
    }
}
