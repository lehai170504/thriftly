package com.ecommerce.thriftauction.features.live.controller;

import com.ecommerce.thriftauction.features.live.dto.LiveChatMessage;
import com.ecommerce.thriftauction.features.live.repository.LiveSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class LiveSessionChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final LiveSessionRepository liveSessionRepository;

    @MessageMapping("/live.chat/{sessionId}")
    public void processMessage(@Payload LiveChatMessage message,
            @DestinationVariable String sessionId,
            Principal principal) {

        String username = principal != null ? principal.getName() : "Anonymous";

        if (message.getType() == LiveChatMessage.MessageType.CHAT
                || message.getType() == LiveChatMessage.MessageType.REACTION) {
            if (username.equals("Anonymous")) {
                return; // Only authenticated users can chat or react
            }
        }

        message.setSenderUsername(username);
        message.setTimestamp(LocalDateTime.now());
        message.setLiveSessionId(sessionId);

        if (message.getType() == LiveChatMessage.MessageType.JOIN) {
            handleJoinLeave(sessionId, true, message);
        } else if (message.getType() == LiveChatMessage.MessageType.LEAVE) {
            handleJoinLeave(sessionId, false, message);
        } else {
            // Normal chat message
            messagingTemplate.convertAndSend("/topic/live/" + sessionId, message);
        }
    }

    @Transactional
    protected void handleJoinLeave(String sessionId, boolean isJoin, LiveChatMessage message) {
        liveSessionRepository.findById(sessionId).ifPresent(session -> {
            if (message.getSenderUsername() != null
                    && message.getSenderUsername().equals(session.getHost().getUsername())) {
                message.setViewerCount(session.getViewerCount() != null ? session.getViewerCount() : 0);
                messagingTemplate.convertAndSend("/topic/live/" + sessionId, message);
                return;
            }

            int currentCount = session.getViewerCount() != null ? session.getViewerCount() : 0;
            if (isJoin) {
                session.setViewerCount(currentCount + 1);
            } else {
                session.setViewerCount(Math.max(0, currentCount - 1));
            }
            liveSessionRepository.save(session);

            message.setViewerCount(session.getViewerCount());
            messagingTemplate.convertAndSend("/topic/live/" + sessionId, message);
        });
    }
}
