package com.ecommerce.thriftauction.core.config;

import com.ecommerce.thriftauction.core.config.properties.BrowserSecurityProperties;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.session.web.http.CookieSerializer;

import static org.assertj.core.api.Assertions.assertThat;

class SessionCookieConfigurationTests {

    @Test
    void productionCookieIsHttpOnlySecureAndHostOnlyByDefault() {
        BrowserSecurityProperties properties = new BrowserSecurityProperties();
        properties.setSessionCookieName("THRIFTLY_SESSION");
        properties.setSecureCookie(true);
        properties.setSameSite("Lax");
        MockHttpServletResponse response = new MockHttpServletResponse();
        CookieSerializer serializer = new SessionSecurityConfig().cookieSerializer(properties);

        serializer.writeCookieValue(new CookieSerializer.CookieValue(
                new MockHttpServletRequest(), response, "opaque-session-id"));

        String header = response.getHeader("Set-Cookie");
        assertThat(header).contains("THRIFTLY_SESSION=", "Path=/", "HttpOnly", "Secure",
                "SameSite=Lax");
        assertThat(header).doesNotContain("Domain=");
    }

    @Test
    void developmentCookieCanRunWithoutTls() {
        BrowserSecurityProperties properties = new BrowserSecurityProperties();
        properties.setSessionCookieName("THRIFTLY_SESSION");
        properties.setSecureCookie(false);
        properties.setSameSite("Lax");
        MockHttpServletResponse response = new MockHttpServletResponse();

        new SessionSecurityConfig().cookieSerializer(properties).writeCookieValue(
                new CookieSerializer.CookieValue(new MockHttpServletRequest(), response, "dev-session-id"));

        assertThat(response.getHeader("Set-Cookie")).contains("HttpOnly", "SameSite=Lax").doesNotContain("Secure");
    }
}
