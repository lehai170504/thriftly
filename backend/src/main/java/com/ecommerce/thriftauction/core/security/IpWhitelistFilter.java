package com.ecommerce.thriftauction.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class IpWhitelistFilter extends OncePerRequestFilter {

    private final ClientIpResolver clientIpResolver;

    @Value("${app.admin.allowed-ips}")
    private String allowedIpsString;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Chỉ kiểm tra các route dành cho admin/staff
        if (path.startsWith("/api/v1/admin") || path.startsWith("/api/v1/staff")) {
            String clientIp = clientIpResolver.resolve(request);
            List<String> allowedIps = splitPatterns(allowedIpsString);

            if (!clientIpResolver.matchesAny(clientIp, allowedIps)) {
                log.warn("Blocked access to admin route {} from unauthorized IP: {}", path, clientIp);
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\": \"Access Denied: IP address not whitelisted\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private List<String> splitPatterns(String value) {
        if (!StringUtils.hasText(value)) {
            return List.of();
        }
        return List.of(value.split(",")).stream()
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();
    }

}
