package com.ecommerce.thriftauction.core.security;

import com.ecommerce.thriftauction.core.config.properties.BrowserSecurityProperties;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.util.StringUtils;

import java.util.List;
import java.io.IOException;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final AuthenticationProvider authenticationProvider;
        private final IpWhitelistFilter ipWhitelistFilter;
        private final SessionLifetimeFilter sessionLifetimeFilter;
        private final UserActivityFilter userActivityFilter;
        private final LegacyTokenCookieCleanupFilter legacyTokenCookieCleanupFilter;
        private final BrowserSecurityProperties browserSecurityProperties;
        private final SecurityContextRepository securityContextRepository;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                CookieCsrfTokenRepository csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
                csrfRepository.setCookieName("XSRF-TOKEN");
                csrfRepository.setHeaderName("X-XSRF-TOKEN");
                csrfRepository.setCookiePath("/");
                csrfRepository.setCookieCustomizer(builder -> {
                        builder.secure(browserSecurityProperties.isSecureCookie())
                                        .sameSite(browserSecurityProperties.getSameSite());
                        if (StringUtils.hasText(browserSecurityProperties.getCookieDomain())) {
                                builder.domain(browserSecurityProperties.getCookieDomain());
                        }
                });

                http
                                .cors(Customizer.withDefaults())
                                .csrf(csrf -> csrf
                                                .csrfTokenRepository(csrfRepository)
                                                .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
                                                .ignoringRequestMatchers("/api/v1/payment/payos/webhook",
                                                                "/api/v1/webhooks/**"))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(HttpMethod.GET, "/api/v1/auth/csrf")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/v1/auth/register", "/api/v1/auth/login",
                                                                "/api/v1/auth/google-login",
                                                                "/api/v1/auth/facebook-login",
                                                                "/api/v1/auth/verify-2fa",
                                                                "/api/v1/auth/forgot-password",
                                                                "/api/v1/auth/reset-password")
                                                .permitAll()
                                                .requestMatchers("/api/v1/webhooks/**",
                                                                "/api/v1/payment/payos/webhook", "/ws/**",
                                                                "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
                                                                "/actuator/health", "/actuator/health/**",
                                                                "/actuator/info", "/actuator/prometheus")
                                                .permitAll()
                                                .requestMatchers("/api/v1/products/favorites",
                                                                "/api/v1/products/favorites/**",
                                                                "/api/v1/products/recommendations")
                                                .authenticated()
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/v1/categories", "/api/v1/categories/**",
                                                                "/api/v1/products", "/api/v1/products/**",
                                                                "/api/v1/auctions", "/api/v1/auctions/**",
                                                                "/api/v1/vouchers/available", "/api/v1/lives/active",
                                                                "/api/v1/lives/auction/**", "/api/v1/reviews/user/**")
                                                .permitAll()
                                                .requestMatchers("/api/v1/admin/**", "/api/v1/reports/admin/**")
                                                .hasAnyRole("ADMIN", "STAFF")
                                                .anyRequest().authenticated())
                                .securityContext(
                                                context -> context.securityContextRepository(securityContextRepository))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                                                .sessionFixation(fixation -> fixation.changeSessionId()))
                                .exceptionHandling(exceptions -> exceptions
                                                .authenticationEntryPoint((request, response, exception) -> writeError(
                                                                response, 401,
                                                                "Authentication required"))
                                                .accessDeniedHandler((request, response, exception) -> writeError(
                                                                response, 403,
                                                                "Access denied")))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(sessionLifetimeFilter, SecurityContextHolderFilter.class)
                                .addFilterAfter(userActivityFilter, SecurityContextHolderFilter.class)
                                .addFilterAfter(legacyTokenCookieCleanupFilter, UserActivityFilter.class)
                                .addFilterAfter(ipWhitelistFilter, LegacyTokenCookieCleanupFilter.class);

                return http.build();
        }

        @Bean
        CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(browserSecurityProperties.getAllowedOrigins());
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("Content-Type", "Accept", "X-Cookie-Consent", "X-XSRF-TOKEN"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        private static void writeError(HttpServletResponse response, int status, String message)
                        throws IOException {
                response.setStatus(status);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write("{\"status\":" + status + ",\"message\":\"" + message + "\"}");
        }
}
