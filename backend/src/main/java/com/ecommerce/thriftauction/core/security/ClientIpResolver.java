package com.ecommerce.thriftauction.core.security;

import com.ecommerce.thriftauction.core.config.properties.BrowserSecurityProperties;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ClientIpResolver {

    private final BrowserSecurityProperties browserSecurityProperties;

    public String resolve(HttpServletRequest request) {
        String remoteAddress = request.getRemoteAddr();
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (!StringUtils.hasText(forwardedFor)
                || !matchesAny(remoteAddress, browserSecurityProperties.getTrustedProxies())) {
            return remoteAddress;
        }
        return forwardedFor.split(",")[0].trim();
    }

    public boolean matchesAny(String address, List<String> patterns) {
        return StringUtils.hasText(address) && patterns.stream()
                .map(String::trim)
                .filter(StringUtils::hasText)
                .anyMatch(pattern -> new IpAddressMatcher(pattern).matches(address));
    }
}
