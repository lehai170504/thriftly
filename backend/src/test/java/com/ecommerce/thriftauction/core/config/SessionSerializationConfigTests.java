package com.ecommerce.thriftauction.core.config;

import com.ecommerce.thriftauction.core.security.UserDetailsImpl;
import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.auth.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextImpl;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class SessionSerializationConfigTests {

    @Test
    void securityContextRoundTripsWithoutPersistingPasswordHash() {
        UserDetailsImpl principal = new UserDetailsImpl(User.builder()
                .id("user-1")
                .email("member@example.com")
                .password("sensitive-password-hash")
                .role(Role.USER)
                .isActive(true)
                .build());
        SecurityContextImpl context = new SecurityContextImpl(
                UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities()));
        RedisSerializer<Object> serializer = new SessionSerializationConfig().springSessionDefaultRedisSerializer();

        byte[] bytes = serializer.serialize(context);
        Object restored = serializer.deserialize(bytes);

        assertThat(new String(bytes, StandardCharsets.UTF_8))
                .doesNotContain("sensitive-password-hash");
        assertThat(restored).isInstanceOf(SecurityContextImpl.class);
        assertThat(((SecurityContextImpl) restored).getAuthentication().getName())
                .isEqualTo("member@example.com");
    }
}
