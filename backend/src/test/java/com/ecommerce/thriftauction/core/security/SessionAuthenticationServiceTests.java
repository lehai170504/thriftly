package com.ecommerce.thriftauction.core.security;

import com.ecommerce.thriftauction.core.config.properties.BrowserSecurityProperties;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class SessionAuthenticationServiceTests {

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void loginRotatesSessionIdAndStoresAuthenticatedContext() {
        UserDetailsService users = username -> User.withUsername(username)
                .password("unused")
                .roles("USER")
                .build();
        BrowserSecurityProperties properties = new BrowserSecurityProperties();
        properties.setAbsoluteTimeout(Duration.ofHours(12));
        SessionAuthenticationService service = new SessionAuthenticationService(
                users,
                new ChangeSessionIdAuthenticationStrategy(),
                new HttpSessionSecurityContextRepository(),
                properties);
        MockHttpServletRequest request = new MockHttpServletRequest();
        String originalId = request.getSession(true).getId();

        service.establish("member@example.com", request, new MockHttpServletResponse());

        assertThat(request.getSession(false)).isNotNull();
        assertThat(request.getSession(false).getId()).isNotEqualTo(originalId);
        assertThat(request.getSession(false).getAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY)).isNotNull();
        assertThat(request.getSession(false).getAttribute(
                SessionAuthenticationService.ABSOLUTE_EXPIRY_ATTRIBUTE)).isInstanceOf(Long.class);
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName())
                .isEqualTo("member@example.com");
    }
}
