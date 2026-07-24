package com.ecommerce.thriftauction.features.chat.controller;

import com.ecommerce.thriftauction.features.chat.dto.ChatMessageDto;
import com.ecommerce.thriftauction.features.chat.entity.ChatMessage;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.chat.repository.ChatMessageRepository;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Chat")
public class ChatController {

        private final SimpMessagingTemplate messagingTemplate;
        private final ChatMessageRepository chatMessageRepository;
        private final UserRepository userRepository;
        private final com.ecommerce.thriftauction.features.social.repository.BlockedUserRepository blockedUserRepository;

        @MessageMapping("/chat.sendMessage")
        public void sendMessage(@Payload ChatMessageDto chatMessageDto, SimpMessageHeaderAccessor headerAccessor) {
                if (headerAccessor.getUser() == null)
                        return;

                String senderEmail = headerAccessor.getUser().getName();
                User sender = userRepository.findByEmail(senderEmail)
                                .orElseThrow(() -> new RuntimeException("Sender not found"));
                User receiver = userRepository.findByUsername(chatMessageDto.getReceiverUsername())
                                .orElseThrow(() -> new RuntimeException("Receiver not found"));

                // Check block status
                if (blockedUserRepository.existsByBlockerIdAndBlockedId(sender.getId(), receiver.getId()) ||
                                blockedUserRepository.existsByBlockerIdAndBlockedId(receiver.getId(), sender.getId())) {
                        throw new RuntimeException("Cannot send message. One of the users is blocked.");
                }

                ChatMessage message = ChatMessage.builder()
                                .sender(sender)
                                .receiver(receiver)
                                .content(chatMessageDto.getContent() != null ? chatMessageDto.getContent() : "")
                                .imageUrl(chatMessageDto.getImageUrl())
                                .build();

                chatMessageRepository.save(message);

                chatMessageDto.setSenderUsername(sender.getUsername());
                chatMessageDto.setTimestamp(message.getTimestamp());

                // Send to receiver
                messagingTemplate.convertAndSendToUser(
                                receiver.getEmail(),
                                "/queue/messages",
                                chatMessageDto);
                // Optional: Send back to sender's other tabs/devices
                messagingTemplate.convertAndSendToUser(
                                senderEmail,
                                "/queue/messages",
                                chatMessageDto);
        }

        @MessageMapping("/chat.typing")
        public void typing(@Payload ChatMessageDto chatMessageDto, SimpMessageHeaderAccessor headerAccessor) {
                if (headerAccessor.getUser() == null)
                        return;
                String senderEmail = headerAccessor.getUser().getName();
                User sender = userRepository.findByEmail(senderEmail).orElseThrow();
                User receiver = userRepository.findByUsername(chatMessageDto.getReceiverUsername()).orElseThrow();

                chatMessageDto.setSenderUsername(sender.getUsername());
                chatMessageDto.setType("TYPING");

                messagingTemplate.convertAndSendToUser(
                                receiver.getEmail(),
                                "/queue/messages",
                                chatMessageDto);
        }
}
