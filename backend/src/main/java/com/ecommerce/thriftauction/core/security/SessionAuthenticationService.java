package com.ecommerce.thriftauction.core.security;

import com.ecommerce.thriftauction.core.config.properties.BrowserSecurityProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class SessionAuthenticationService {

    public static final String ABSOLUTE_EXPIRY_ATTRIBUTE =
            SessionAuthenticationService.class.getName() + ".ABSOLUTE_EXPIRY";

    private final UserDetailsService userDetailsService;
    private final SessionAuthenticationStrategy sessionAuthenticationStrategy;
    private final SecurityContextRepository securityContextRepository;
    private final BrowserSecurityProperties properties;

    public void establish(String username, HttpServletRequest request, HttpServletResponse response) {
        UserDetails principal = userDetailsService.loadUserByUsername(username);
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                principal, null, principal.getAuthorities());

        sessionAuthenticationStrategy.onAuthentication(authentication, request, response);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        HttpSession session = request.getSession(false);
        if (session == null) {
            throw new IllegalStateException("Authenticated session was not created");
        }
        session.setAttribute(ABSOLUTE_EXPIRY_ATTRIBUTE,
                Instant.now().plus(properties.getAbsoluteTimeout()).toEpochMilli());
    }
}
