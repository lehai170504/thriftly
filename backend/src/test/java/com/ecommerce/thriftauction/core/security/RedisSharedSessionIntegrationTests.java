package com.ecommerce.thriftauction.core.security;

import com.ecommerce.thriftauction.core.config.SessionSerializationConfig;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.session.Session;
import org.springframework.session.SessionRepository;
import org.springframework.session.data.redis.RedisIndexedSessionRepository;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers(disabledWithoutDocker = true)
class RedisSharedSessionIntegrationTests {

    @Container
    static final GenericContainer<?> REDIS = new GenericContainer<>("redis:7.4-alpine").withExposedPorts(6379);

    @Test
    void sessionWrittenByOneApplicationInstanceIsReadableByAnother() {
        LettuceConnectionFactory firstConnection = connectionFactory();
        LettuceConnectionFactory secondConnection = connectionFactory();
        RedisIndexedSessionRepository first = repository(firstConnection);
        RedisIndexedSessionRepository second = repository(secondConnection);
        SessionRepository<Session> firstSessions = asSessionRepository(first);
        SessionRepository<Session> secondSessions = asSessionRepository(second);
        try {
            Session created = firstSessions.createSession();
            created.setAttribute("proof", "shared");
            firstSessions.save(created);

            Session loaded = secondSessions.findById(created.getId());

            assertThat(loaded).isNotNull();
            assertThat((String) loaded.getAttribute("proof")).isEqualTo("shared");
            secondSessions.deleteById(created.getId());
            assertThat(firstSessions.findById(created.getId())).isNull();
        } finally {
            first.destroy();
            second.destroy();
            firstConnection.destroy();
            secondConnection.destroy();
        }
    }

    @SuppressWarnings({ "unchecked", "rawtypes" })
    private static SessionRepository<Session> asSessionRepository(RedisIndexedSessionRepository repository) {
        return (SessionRepository) repository;
    }

    private static LettuceConnectionFactory connectionFactory() {
        LettuceConnectionFactory factory = new LettuceConnectionFactory(REDIS.getHost(), REDIS.getMappedPort(6379));
        factory.afterPropertiesSet();
        return factory;
    }

    private static RedisIndexedSessionRepository repository(LettuceConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        RedisSerializer<Object> serializer = new SessionSerializationConfig().springSessionDefaultRedisSerializer();
        template.setDefaultSerializer(serializer);
        template.afterPropertiesSet();
        RedisIndexedSessionRepository repository = new RedisIndexedSessionRepository(template);
        repository.setRedisKeyNamespace("thriftly:test:session");
        repository.setDefaultSerializer(serializer);
        repository.afterPropertiesSet();
        return repository;
    }
}
