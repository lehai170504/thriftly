package com.ecommerce.thriftauction.core.security;

import com.ecommerce.thriftauction.core.config.properties.BrowserSecurityProperties;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class IpWhitelistFilterTests {

    @Test
    void ignoresSpoofedForwardedHeaderFromUntrustedClient() throws Exception {
        IpWhitelistFilter filter = filter("10.0.0.10", "192.168.0.0/16");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/admin/dashboard");
        request.setRemoteAddr("203.0.113.8");
        request.addHeader("X-Forwarded-For", "10.0.0.10");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(403);
        verify(chain, never()).doFilter(request, response);
    }

    @Test
    void acceptsForwardedAddressOnlyThroughConfiguredTrustedProxy() throws Exception {
        IpWhitelistFilter filter = filter("203.0.113.0/24", "10.0.0.0/8");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/admin/dashboard");
        request.setRemoteAddr("10.20.30.40");
        request.addHeader("X-Forwarded-For", "203.0.113.25");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    private IpWhitelistFilter filter(String allowed, String trustedProxies) {
        BrowserSecurityProperties properties = new BrowserSecurityProperties();
        properties.setTrustedProxies(List.of(trustedProxies));
        IpWhitelistFilter filter = new IpWhitelistFilter(new ClientIpResolver(properties));
        ReflectionTestUtils.setField(filter, "allowedIpsString", allowed);
        return filter;
    }
}
