package com.ecommerce.thriftauction.core.security;

import com.ecommerce.thriftauction.features.admin.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class StompSecurityChannelInterceptor implements ChannelInterceptor {

    private final AuditLogService auditLogService;

    private static final Set<String> ALLOWED_SEND_DESTINATIONS = Set.of(
            "/app/auction/bid",
            "/app/chat.sendMessage",
            "/app/chat.typing");

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();
        if (command == null) {
            return message;
        }

        Principal principal = accessor.getUser();
        boolean isAuthenticated = principal != null && !"anonymousUser".equals(principal.getName());

        if (StompCommand.CONNECT.equals(command)) {
            if (!isAuthenticated) {
                auditLogService.log("anonymous", "ANONYMOUS", "SECURITY_ACCESS_DENIED", "WEBSOCKET", "CONNECT",
                        "UNAUTHENTICATED", "STOMP connection attempted without authentication", null);
                throw new AccessDeniedException("WebSocket connection requires an authenticated session");
            }
        } else if (StompCommand.SUBSCRIBE.equals(command)) {
            String destination = accessor.getDestination();
            if (destination == null || !isAllowedSubscription(destination, principal)) {
                String actor = isAuthenticated ? principal.getName() : "anonymous";
                auditLogService.log(actor, "USER", "SECURITY_ACCESS_DENIED", "WEBSOCKET", "SUBSCRIBE",
                        destination != null ? destination : "NULL", "Unauthorized STOMP subscription destination",
                        null);
                throw new AccessDeniedException("Unauthorized subscription destination: " + destination);
            }
        } else if (StompCommand.SEND.equals(command)) {
            String destination = accessor.getDestination();
            if (!isAuthenticated) {
                auditLogService.log("anonymous", "ANONYMOUS", "SECURITY_ACCESS_DENIED", "WEBSOCKET", "SEND",
                        destination != null ? destination : "NULL", "Unauthenticated STOMP send attempt", null);
                throw new AccessDeniedException("STOMP send requires an authenticated session");
            }

            if (destination == null || !isAllowedSend(destination)) {
                auditLogService.log(principal.getName(), "USER", "SECURITY_ACCESS_DENIED", "WEBSOCKET", "SEND",
                        destination != null ? destination : "NULL", "Unauthorized STOMP send destination", null);
                throw new AccessDeniedException("Unauthorized send destination: " + destination);
            }
        }

        return message;
    }

    private boolean isAllowedSubscription(String destination, Principal principal) {
        if (destination.startsWith("/topic/auction/") || destination.startsWith("/topic/live/")) {
            return true;
        }
        if (destination.startsWith("/user/queue/")) {
            return true;
        }
        if (destination.startsWith("/user/")) {
            return true;
        }
        return false;
    }

    private boolean isAllowedSend(String destination) {
        if (ALLOWED_SEND_DESTINATIONS.contains(destination)) {
            return true;
        }
        if (destination.startsWith("/app/live.chat/")) {
            return true;
        }
        return false;
    }
}
