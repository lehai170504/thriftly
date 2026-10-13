package com.ecommerce.thriftauction.core.security;

import org.junit.jupiter.api.Test;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import jakarta.servlet.FilterChain;

import static org.assertj.core.api.Assertions.assertThat;

class SessionLifecycleFilterTests {

    @Test
    void absoluteExpiryInvalidatesSession() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.getSession().setAttribute(SessionAuthenticationService.ABSOLUTE_EXPIRY_ATTRIBUTE,
                System.currentTimeMillis() - 1);

        new SessionLifetimeFilter().doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        assertThat(request.getSession(false)).isNull();
    }

    @Test
    void redisOutageReturnsServiceUnavailableWithoutFallback() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain failingChain = (request, result) -> {
            throw new RedisConnectionFailureException("redis unavailable");
        };

        new SessionStoreAvailabilityFilter().doFilterInternal(new MockHttpServletRequest(), response, failingChain);

        assertThat(response.getStatus()).isEqualTo(503);
        assertThat(response.getContentAsString()).contains("Session service is temporarily unavailable");
    }
}
