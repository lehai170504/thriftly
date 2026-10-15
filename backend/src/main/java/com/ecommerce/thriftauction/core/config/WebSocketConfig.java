package com.ecommerce.thriftauction.core.config;

import com.ecommerce.thriftauction.core.config.properties.BrowserSecurityProperties;
import com.ecommerce.thriftauction.core.security.StompSecurityChannelInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final BrowserSecurityProperties browserSecurityProperties;
    private final StompSecurityChannelInterceptor stompSecurityChannelInterceptor;

    public WebSocketConfig(BrowserSecurityProperties browserSecurityProperties,
            StompSecurityChannelInterceptor stompSecurityChannelInterceptor) {
        this.browserSecurityProperties = browserSecurityProperties;
        this.stompSecurityChannelInterceptor = stompSecurityChannelInterceptor;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = browserSecurityProperties != null && browserSecurityProperties.getAllowedOrigins() != null
                ? browserSecurityProperties.getAllowedOrigins().toArray(String[]::new)
                : new String[] { "http://localhost:3000" };
        registry.addEndpoint("/ws/auction")
                .setAllowedOrigins(origins);
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompSecurityChannelInterceptor);
    }
}
