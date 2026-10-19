package com.ecommerce.thriftauction.core.config;

import com.ecommerce.thriftauction.core.security.LegacyTokenCookieCleanupFilter;
import com.ecommerce.thriftauction.core.security.SessionLifetimeFilter;
import com.ecommerce.thriftauction.core.security.UserActivityFilter;
import jakarta.servlet.Filter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SecurityFilterRegistrationConfig {

    @Bean
    FilterRegistrationBean<SessionLifetimeFilter> sessionLifetimeRegistration(SessionLifetimeFilter filter) {
        return disabled(filter);
    }

    @Bean
    FilterRegistrationBean<UserActivityFilter> userActivityRegistration(UserActivityFilter filter) {
        return disabled(filter);
    }

    @Bean
    FilterRegistrationBean<LegacyTokenCookieCleanupFilter> legacyCookieRegistration(
            LegacyTokenCookieCleanupFilter filter) {
        return disabled(filter);
    }

    private static <T extends Filter> FilterRegistrationBean<T> disabled(T filter) {
        FilterRegistrationBean<T> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }
}
