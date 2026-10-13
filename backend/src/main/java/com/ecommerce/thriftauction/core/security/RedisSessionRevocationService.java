package com.ecommerce.thriftauction.core.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.env.Environment;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class RedisSessionRevocationService implements SessionRevocationService {

    private final ObjectProvider<FindByIndexNameSessionRepository<? extends Session>> repositoryProvider;
    private final Environment environment;

    @Override
    public void revokeAll(String principalName) {
        FindByIndexNameSessionRepository<? extends Session> sessions = repositoryProvider.getIfAvailable();
        if (sessions == null) {
            if (Arrays.asList(environment.getActiveProfiles()).contains("test")) {
                return;
            }
            throw new IllegalStateException("Redis-backed session repository is unavailable");
        }
        sessions.findByPrincipalName(principalName).keySet().forEach(sessions::deleteById);
    }
}
