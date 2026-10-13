package com.ecommerce.thriftauction.core.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

    public static final String CACHE_CATEGORIES = "categories";
    public static final String CACHE_SYSTEM_CONFIG = "systemConfig";

    @Bean
    public CacheManager cacheManager(
            @Autowired(required = false) RedisConnectionFactory redisConnectionFactory,
            @Value("${app.cache.redis-enabled:true}") boolean redisEnabled,
            @Value("${app.cache.prefix:thriftly:cache:}") String cachePrefix) {
        if (redisEnabled && redisConnectionFactory != null) {
            try (var connection = redisConnectionFactory.getConnection()) {
                String ping = connection.ping();
                if ("PONG".equalsIgnoreCase(ping)) {
                    GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer();

                    RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                            .prefixCacheNameWith(cachePrefix)
                            .entryTtl(Duration.ofMinutes(10))
                            .disableCachingNullValues()
                            .serializeKeysWith(RedisSerializationContext.SerializationPair
                                    .fromSerializer(new StringRedisSerializer()))
                            .serializeValuesWith(
                                    RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer));

                    Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
                    cacheConfigs.put(CACHE_CATEGORIES, defaultConfig.entryTtl(Duration.ofMinutes(30)));
                    cacheConfigs.put(CACHE_SYSTEM_CONFIG, defaultConfig.entryTtl(Duration.ofMinutes(15)));

                    return RedisCacheManager.builder(redisConnectionFactory)
                            .cacheDefaults(defaultConfig)
                            .withInitialCacheConfigurations(cacheConfigs)
                            .build();
                }
            } catch (Exception ex) {
                log.warn("Redis is unavailable ({}), falling back to in-memory CacheManager", ex.getMessage());
                return new ConcurrentMapCacheManager(CACHE_CATEGORIES, CACHE_SYSTEM_CONFIG);
            }
        }
        return new ConcurrentMapCacheManager(CACHE_CATEGORIES, CACHE_SYSTEM_CONFIG);
    }

    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache get failed for cache={}, key={}, falling back to database invocation: {}",
                        cache != null ? cache.getName() : "unknown", key, exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Cache put failed for cache={}, key={}: {}",
                        cache != null ? cache.getName() : "unknown", key, exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache evict failed for cache={}, key={}: {}",
                        cache != null ? cache.getName() : "unknown", key, exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Cache clear failed for cache={}: {}",
                        cache != null ? cache.getName() : "unknown", exception.getMessage());
            }
        };
    }
}
