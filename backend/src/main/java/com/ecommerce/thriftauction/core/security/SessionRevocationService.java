package com.ecommerce.thriftauction.core.security;

public interface SessionRevocationService {
    void revokeAll(String principalName);
}
