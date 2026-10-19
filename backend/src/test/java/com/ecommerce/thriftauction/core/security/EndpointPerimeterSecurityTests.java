package com.ecommerce.thriftauction.core.security;

import com.ecommerce.thriftauction.core.config.SessionSecurityConfig;
import com.ecommerce.thriftauction.core.config.properties.BrowserSecurityProperties;
import com.ecommerce.thriftauction.features.admin.controller.AdminDashboardController;
import com.ecommerce.thriftauction.features.admin.service.AdminDashboardService;
import com.ecommerce.thriftauction.features.admin.service.AuditLogService;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminDashboardController.class)
@Import({
                SecurityConfig.class,
                SessionSecurityConfig.class,
                SessionLifetimeFilter.class,
                UserActivityFilter.class,
                LegacyTokenCookieCleanupFilter.class,
                ClientIpResolver.class,
                EndpointPerimeterSecurityTests.PropertiesConfig.class
})
@TestPropertySource(properties = {
                "app.security.browser.allowed-origins=http://localhost:3000",
                "app.security.browser.session-cookie-name=THRIFTLY_SESSION",
                "app.security.browser.secure-cookie=false",
                "app.security.browser.same-site=Lax",
                "app.security.browser.absolute-timeout=12h"
})
class EndpointPerimeterSecurityTests {

        @TestConfiguration
        @EnableConfigurationProperties(BrowserSecurityProperties.class)
        static class PropertiesConfig {
        }

        @Autowired
        private MockMvc mockMvc;

        @MockBean
        private AdminDashboardService adminDashboardService;

        @MockBean
        private AuditLogService auditLogService;

        @MockBean
        private UserRepository userRepository;

        @MockBean
        private AuthenticationProvider authenticationProvider;

        @MockBean
        private SessionAuthenticationService sessionAuthenticationService;

        @MockBean
        private SessionRevocationService sessionRevocationService;

        @Test
        void unauthenticatedAdminAccessIsDenied() throws Exception {
                mockMvc.perform(get("/api/v1/admin/dashboard/chart"))
                                .andExpect(status().is4xxClientError());
        }

        @Test
        @WithMockUser(username = "buyer@test.com", roles = { "USER" })
        void userRoleAccessToAdminEndpointIsForbidden() throws Exception {
                mockMvc.perform(get("/api/v1/admin/dashboard/chart"))
                                .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(username = "admin@test.com", roles = { "ADMIN" })
        void adminRoleAccessToAdminEndpointIsAllowed() throws Exception {
                when(adminDashboardService.get6MonthChartData()).thenReturn(Collections.emptyList());

                mockMvc.perform(get("/api/v1/admin/dashboard/chart"))
                                .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(username = "staff@test.com", roles = { "STAFF" })
        void staffRoleAccessToAdminEndpointIsAllowed() throws Exception {
                when(adminDashboardService.get6MonthChartData()).thenReturn(Collections.emptyList());

                mockMvc.perform(get("/api/v1/admin/dashboard/chart"))
                                .andExpect(status().isOk());
        }
}
