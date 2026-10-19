package com.ecommerce.thriftauction.core.security;

import com.ecommerce.thriftauction.core.config.SessionSecurityConfig;
import com.ecommerce.thriftauction.core.config.properties.BrowserSecurityProperties;
import com.ecommerce.thriftauction.features.auth.controller.AuthController;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.auth.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import jakarta.servlet.http.Cookie;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({ SecurityConfig.class, SessionSecurityConfig.class, SessionLifetimeFilter.class,
                UserActivityFilter.class, LegacyTokenCookieCleanupFilter.class, ClientIpResolver.class,
                SessionCsrfSecurityTests.PropertiesConfig.class })
@TestPropertySource(properties = {
                "app.security.browser.allowed-origins=http://localhost:3000",
                "app.security.browser.session-cookie-name=THRIFTLY_SESSION",
                "app.security.browser.secure-cookie=false",
                "app.security.browser.same-site=Lax",
                "app.security.browser.cookie-domain=.example.test",
                "app.security.browser.absolute-timeout=12h"
})
class SessionCsrfSecurityTests {

        @TestConfiguration
        @EnableConfigurationProperties(BrowserSecurityProperties.class)
        static class PropertiesConfig {
        }

        @Autowired
        MockMvc mockMvc;
        @MockBean
        AuthService authService;
        @MockBean
        SessionAuthenticationService sessionAuthenticationService;
        @MockBean
        SessionRevocationService sessionRevocationService;
        @MockBean
        UserRepository userRepository;
        @MockBean
        AuthenticationProvider authenticationProvider;

        @Test
        void csrfBootstrapIssuesReadableCookieAndUnsafeRequestRequiresMatchingToken() throws Exception {
                MvcResult bootstrap = mockMvc.perform(get("/api/v1/auth/csrf"))
                                .andExpect(status().isOk())
                                .andExpect(cookie().exists("XSRF-TOKEN"))
                                .andReturn();
                Cookie csrfCookie = bootstrap.getResponse().getCookie("XSRF-TOKEN");
                String setCookie = bootstrap.getResponse().getHeader(HttpHeaders.SET_COOKIE);
                assertThat(setCookie).contains("Domain=.example.test");

                mockMvc.perform(post("/api/v1/auth/forgot-password")
                                .contentType("application/json")
                                .content("{\"email\":\"member@example.com\"}"))
                                .andExpect(status().isForbidden());

                mockMvc.perform(post("/api/v1/auth/forgot-password")
                                .cookie(csrfCookie)
                                .header("X-XSRF-TOKEN", csrfCookie.getValue())
                                .contentType("application/json")
                                .content("{\"email\":\"member@example.com\"}"))
                                .andExpect(status().isOk());
        }

        @Test
        void corsAllowsConfiguredFrontendAndRejectsUnknownOrigin() throws Exception {
                mockMvc.perform(options("/api/v1/auth/login")
                                .header(HttpHeaders.ORIGIN, "http://localhost:3000")
                                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.POST.name()))
                                .andExpect(status().isOk())
                                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
                                                "http://localhost:3000"))
                                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));

                mockMvc.perform(options("/api/v1/auth/login")
                                .header(HttpHeaders.ORIGIN, "https://evil.example")
                                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.POST.name()))
                                .andExpect(status().isForbidden());
        }
}
